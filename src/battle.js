// THE DUEL, on screen. The rules live in engine.js; this file draws the state, turns the engine's events into
// animation, and turns the player's hands into moves.
//
// How you play: drag a card from your hand onto the board (or onto a target, for an aimed spell); drag one of your
// minions onto an enemy to attack; drag the spark onto anything to burn it. Or tap instead of dragging: tap the card,
// minion or spark to pick it up (it shows large), then tap where it should go. Tap anything else to look at it.
import { CARD, HERO_POWER, PLAYER_HERO } from './cards.js';
import * as E from './engine.js';
import { aiTurn } from './ai.js';
import { cardEl, foilOn } from './card.js';
import { S, save } from './save.js';
import { $, h, sleep, toast, btn, confirmBox, refreshBar } from './ui.js';
import { sfx } from './sfx.js';

let root, g = null, opp = null, busy = false, exit = () => {};
let sel = null;         // what a tap has picked up: { kind: 'card' | 'tok' | 'power', uid, targets }
let press = null;       // the pointer that is down
let drag = null;        // { src, mode: 'carry' | 'aim', targets }
const els = {};
const tokEls = new Map(), handEls = new Map();
let attackEl = null;

/** For tests and the console: the duel in progress. */
export const debug = { get game() { return g; } };

export function mount(el, opts) {
  root = el;
  exit = opts.exit;
  root.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: false });
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onCancel);
  root.addEventListener('pointerover', onHover);
  root.addEventListener('pointerout', (e) => { if (e.pointerType === 'mouse' && !sel && !drag) hidePreview(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') clearSel(); });
  window.addEventListener('resize', () => { if (g && !root.hidden) layoutHand(); });
}

export async function start(opponent) {
  opp = opponent;
  busy = true; sel = null; drag = null; press = null;
  tokEls.clear(); handEls.clear();
  build();
  g = E.newGame({ decks: [S.deck, opp.deck], heroes: [PLAYER_HERO, opp], emit: onEvent });
  render();
  await sleep(350);
  await E.startGame(g);
  busy = false;
  render();
  if (g.turn === 1) runAi();
}

function build() {
  const heroEl = (i, who) => h('div.hero.' + (i ? 'opp' : 'me'), { 'data-uid': 'h' + i },
    h('div.hero-pic', {}, h('img', { src: `ui/${who.id}_s.webp`, alt: '', draggable: false })),
    h('div.hero-hp', {}, '30'), h('div.hero-name', {}, who.name));
  root.replaceChildren(
    h('div.bt-bg'),
    h('div.bt-opp', {},
      btn('Concede', concede, 'mini ghost bt-quit'),
      els.oppHand = h('div.opp-hand'),
      els.oppMeta = h('div.bt-meta')),
    els.heroOpp = heroEl(1, opp),
    els.rowOpp = h('div.bt-row.opp'),
    h('div.bt-mid', {}, h('div.bt-line'), els.end = btn('End Turn', endMyTurn, 'end-turn')),
    els.rowMe = h('div.bt-row.me'),
    h('div.bt-me', {},
      els.mana = h('div.mana'),
      els.heroMe = heroEl(0, PLAYER_HERO),
      els.power = h('div.power', { title: `${HERO_POWER.name}: ${HERO_POWER.text}` }, h('i.spark'), h('span.power-cost', {}, String(HERO_POWER.cost))),
      els.deck = h('div.deckpile', { title: 'cards left in your deck' })),
    els.hand = h('div.hand'),
    els.arrow = h('div.bt-arrow', { html: '<svg><defs><marker id="arrowhead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z"/></marker></defs><path class="shaft" marker-end="url(#arrowhead)"/></svg>' }),
    els.fx = h('div.bt-fx'),
    els.preview = h('div.bt-preview'),
    els.banner = h('div.turn-banner'),
    els.over = h('div.bt-over', { hidden: true }));
}

// ---------------------------------------------------------------------------------------------------- drawing the state

function render() {
  if (!g) return;
  const me = g.p[0], foe = g.p[1], mine = g.turn === 0 && !busy && !g.over;
  syncRow(els.rowMe, me.board, mine);
  syncRow(els.rowOpp, foe.board, false);
  syncHand(mine);
  setHero(els.heroMe, me.hero);
  setHero(els.heroOpp, foe.hero);
  const pearls = [];
  for (let i = 0; i < me.maxMana; i++) pearls.push(h('i.pearl' + (i < me.mana ? '.full' : '')));
  els.mana.replaceChildren(h('div.pearls', {}, pearls), h('b', {}, `${me.mana}/${me.maxMana}`));
  els.oppMeta.replaceChildren(h('span', {}, `Mana ${foe.mana}/${foe.maxMana}`), h('span', {}, `Deck ${foe.deck.length}`));
  while (els.oppHand.children.length > foe.hand.length) els.oppHand.lastChild.remove();
  while (els.oppHand.children.length < foe.hand.length) els.oppHand.append(h('i.back'));
  els.deck.textContent = me.deck.length;
  els.power.classList.toggle('usable', mine && E.canPower(g, 0));
  els.power.classList.toggle('spent', me.powerUsed);
  els.end.disabled = !mine;
  const idle = mine && !me.hand.some((c) => E.canPlay(g, 0, c)) && !me.board.some((m) => E.canAttack(g, m));
  els.end.classList.toggle('glow', idle);
  els.end.innerHTML = g.turn === 0 ? 'End Turn' : 'Enemy Turn';
  root.classList.toggle('my-turn', g.turn === 0);
}

function tokEl(m) {
  const def = CARD[m.id];
  return h('div.tok.r-' + def.rarity, { 'data-uid': m.uid },
    h('div.tok-art', {}, h('img', { src: `art/${m.id}_s.webp`, alt: '', draggable: false })),
    h('div.tok-nacre'), h('div.tok-atk'), h('div.tok-hp'), h('div.tok-zz', {}, 'z z'));
}

function syncRow(row, list, mine) {
  const want = new Set(list.map((m) => m.uid));
  row.style.setProperty('--n', list.length);
  for (const el of [...row.children]) if (!want.has(el.dataset.uid)) { tokEls.delete(el.dataset.uid); el.remove(); }
  list.forEach((m, i) => {
    let el = tokEls.get(m.uid);
    if (!el) {
      el = tokEl(m);
      tokEls.set(m.uid, el);
      el.classList.add('arrive');
      el.addEventListener('animationend', () => el.classList.remove('arrive'), { once: true });
    }
    if (row.children[i] !== el) row.insertBefore(el, row.children[i] || null);
    const def = CARD[m.id];
    el.querySelector('.tok-atk').textContent = m.atk;
    const hp = el.querySelector('.tok-hp');
    hp.textContent = Math.max(0, m.hp);
    hp.classList.toggle('hurt', m.hp < m.maxHp);
    hp.classList.toggle('up', m.hp > def.hp && m.hp >= m.maxHp);
    el.querySelector('.tok-atk').classList.toggle('up', m.atk > def.atk);
    el.classList.toggle('guard', m.guard);
    el.classList.toggle('nacre', m.nacre);
    el.classList.toggle('sleep', m.sleeping && m.owner === g.turn);
    el.classList.toggle('ready', mine && E.canAttack(g, m));
  });
}

function syncHand(mine) {
  const hand = g.p[0].hand, want = new Set(hand.map((c) => c.uid));
  for (const [uid, el] of handEls) if (!want.has(uid)) { el.remove(); handEls.delete(uid); }
  hand.forEach((c, i) => {
    let el = handEls.get(c.uid);
    if (!el) {
      el = cardEl(c.id, { flat: true, thumb: true });
      el.dataset.uid = c.uid;
      el.classList.add('draw-in');
      el.addEventListener('animationend', () => el.classList.remove('draw-in'), { once: true });
      handEls.set(c.uid, el);
    }
    if (els.hand.children[i] !== el) els.hand.insertBefore(el, els.hand.children[i] || null);
    el.classList.toggle('playable', mine && E.canPlay(g, 0, c));
  });
  layoutHand();
}

function layoutHand() {
  const cards = [...els.hand.children], n = cards.length;
  if (!n) return;
  const W = els.hand.clientWidth, cw = cards[0].offsetWidth || 100;
  const gap = n > 1 ? Math.min(cw * 0.86, (W - cw) / (n - 1)) : 0;
  cards.forEach((el, i) => {
    const k = i - (n - 1) / 2;
    el.style.setProperty('--hx', (k * gap).toFixed(1) + 'px');
    el.style.setProperty('--hr', (k * Math.min(3.2, 16 / n)).toFixed(2) + 'deg');
    el.style.setProperty('--hy', (k * k * Math.min(2.4, 22 / n)).toFixed(1) + 'px');
    el.style.zIndex = String(i + 1);
  });
}

function setHero(el, hero) {
  const hp = el.querySelector('.hero-hp');
  hp.textContent = Math.max(0, hero.hp);
  hp.classList.toggle('hurt', hero.hp < hero.maxHp);
}

const elFor = (t) => (t.isHero ? (t.owner === 0 ? els.heroMe : els.heroOpp) : tokEls.get(t.uid));
const centre = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

// ---------------------------------------------------------------------------------------------------- the engine's events

async function onEvent(type, d) {
  switch (type) {
    case 'turn':
      render();
      if (g.round > 1 || d.p === 0) await banner(d.p === 0 ? 'Your Turn' : 'Enemy Turn', d.p === 0);
      break;
    case 'draw':
      render();
      if (!d.quiet) sfx.play('draw');
      await sleep(d.quiet ? 90 : 260);
      break;
    case 'burn': toast(d.p === 0 ? `Your hand is full: ${CARD[d.id].name} is lost` : 'Their hand is full: a card is lost'); break;
    case 'fatigue': toast(d.p === 0 ? `Your deck is empty: the deep takes ${d.n}` : `Their deck is empty: the deep takes ${d.n}`); break;
    case 'play':
      if (d.p === 1) { showPreview(d.card.id, 'theirs'); await sleep(650); hidePreview(); }
      render();
      sfx.play('place');
      await sleep(330);
      break;
    case 'spell': {
      render();
      showPreview(d.card.id, d.p === 1 ? 'theirs cast' : 'cast');
      sfx.play('shimmer');
      await sleep(d.p === 1 ? 950 : 520);
      hidePreview();
      if (d.target) await bolt(d.p === 0 ? els.heroMe : els.heroOpp, elFor(d.target));
      break;
    }
    case 'trigger': {
      const el = tokEls.get(d.minion.uid);
      if (el) { el.classList.add('trigger'); setTimeout(() => el.classList.remove('trigger'), 500); await sleep(220); }
      break;
    }
    case 'power':
      render();
      break;
    case 'bolt': {
      const from = d.from ? elFor(d.from) : null;
      await bolt(from, elFor(d.target));
      break;
    }
    case 'wave': {
      sfx.play('wave');
      const w = h('div.wave' + (d.wipe ? '.wipe' : ''));
      els.fx.append(w);
      setTimeout(() => w.remove(), 900);
      await sleep(d.wipe ? 620 : 380);
      break;
    }
    case 'attack': {
      const a = tokEls.get(d.attacker.uid), t = elFor(d.target);
      if (!a || !t) break;
      attackEl = a;
      const [ax, ay] = centre(a), [tx, ty] = centre(t), dx = tx - ax, dy = ty - ay;
      a.classList.add('striking');
      a.style.transition = 'transform .13s ease-out';
      a.style.transform = `translate(${-dx * 0.07}px, ${-dy * 0.07}px) scale(1.14)`;
      await sleep(130);
      a.style.transition = 'transform .15s cubic-bezier(.6,0,.9,.5)';
      a.style.transform = `translate(${dx * 0.8}px, ${dy * 0.8}px) scale(1.14)`;
      await sleep(150);
      sfx.play('hit');
      break;
    }
    case 'attacked': {
      render();
      const a = attackEl;
      if (a) {
        a.style.transition = 'transform .26s ease-out';
        a.style.transform = '';
        await sleep(240);
        a.style.transition = '';
        a.classList.remove('striking');
      }
      attackEl = null;
      break;
    }
    case 'damage': {
      const el = elFor(d.target);
      if (!el) break;
      if (d.absorbed) { pop(el, 'Nacre!', 'nacre'); sfx.play('ting'); el.classList.add('crack'); setTimeout(() => el.classList.remove('crack'), 500); }
      else { pop(el, '−' + d.n, 'dmg'); el.classList.add('hit'); setTimeout(() => el.classList.remove('hit'), 380); if (!attackEl) sfx.play('hit', 1.2, 0.6); }
      if (d.target.isHero) setHero(el, d.target); else if (!attackEl) render();
      if (d.target.isHero && d.target.owner === 0 && d.n > 0) { root.classList.add('ouch'); setTimeout(() => root.classList.remove('ouch'), 400); }
      await sleep(attackEl ? 40 : 230);
      break;
    }
    case 'heal': {
      const el = elFor(d.target);
      if (el && d.n > 0) { pop(el, '+' + d.n, 'heal'); sfx.play('heal'); }
      render();
      await sleep(260);
      break;
    }
    case 'buff': {
      render();
      const el = tokEls.get(d.minion.uid);
      if (el) { el.classList.add('buffed'); setTimeout(() => el.classList.remove('buffed'), 600); }
      sfx.play('buff');
      await sleep(240);
      break;
    }
    case 'death': {
      for (const m of d.minions) tokEls.get(m.uid)?.classList.add('dying');
      sfx.play('death');
      await sleep(430);
      break;
    }
    case 'sync': render(); break;
    case 'over': await finish(d.winner); break;
  }
}

function pop(el, text, cls) {
  const [x, y] = centre(el);
  const p = h('div.pop.' + cls, { style: { left: x + 'px', top: y + 'px' } }, text);
  els.fx.append(p);
  setTimeout(() => p.remove(), 1000);
}

async function bolt(fromEl, toEl) {
  if (!toEl) return;
  const [tx, ty] = centre(toEl);
  const [fx, fy] = fromEl ? centre(fromEl) : [innerWidth / 2, innerHeight / 2];
  const b = h('div.bolt', { style: { left: fx + 'px', top: fy + 'px' } });
  els.fx.append(b);
  sfx.play('zap');
  await b.animate([{ transform: 'translate(-50%,-50%) scale(.6)' }, { transform: `translate(calc(-50% + ${tx - fx}px), calc(-50% + ${ty - fy}px)) scale(1.3)` }],
    { duration: 240, easing: 'cubic-bezier(.5,0,.8,.5)' }).finished.catch(() => {});
  b.remove();
  const s = h('div.burst', { style: { left: tx + 'px', top: ty + 'px' } });
  els.fx.append(s);
  setTimeout(() => s.remove(), 500);
}

async function banner(text, mine) {
  els.banner.textContent = text;
  els.banner.className = 'turn-banner show' + (mine ? ' mine' : '');
  if (mine) sfx.play('turn');
  await sleep(mine ? 900 : 650);
  els.banner.className = 'turn-banner';
}

function showPreview(id, cls = '') {
  const c = cardEl(id);
  els.preview.className = 'bt-preview ' + cls;
  els.preview.replaceChildren(c);
  foilOn(c, { sway: true });
}
function hidePreview() { els.preview.replaceChildren(); }

// ---------------------------------------------------------------------------------------------------- the player's hands

function srcOf(target) {
  const card = target.closest('.hand .card');
  if (card) return { kind: 'card', uid: card.dataset.uid, el: card };
  const power = target.closest('.power');
  if (power) return { kind: 'power', uid: 'power', el: power };
  const tok = target.closest('.tok');
  if (tok) return { kind: 'tok', uid: tok.dataset.uid, el: tok };
  const hero = target.closest('.hero');
  if (hero) return { kind: 'hero', uid: hero.dataset.uid, el: hero };
  if (target.closest('.btn, .bt-over')) return null;
  return { kind: 'field', uid: null, el: null };
}

/** What picking this up would let you do: null if nothing. */
function plan(src) {
  if (!g || g.over || busy || g.turn !== 0) return null;
  if (src.kind === 'card') {
    const card = g.p[0].hand.find((c) => c.uid === src.uid);
    if (!card || !E.canPlay(g, 0, card)) return null;
    const def = CARD[card.id];
    if (def.type === 'spell' && def.target) return { mode: 'aim', targets: E.spellTargets(g, 0, def).map((t) => t.uid), card };
    return { mode: 'carry', targets: [], card };
  }
  if (src.kind === 'tok') {
    const m = E.find(g, src.uid);
    if (!m || m.owner !== 0 || !E.canAttack(g, m)) return null;
    return { mode: 'aim', targets: E.attackTargets(g, m).map((t) => t.uid) };
  }
  if (src.kind === 'power') {
    if (!E.canPower(g, 0)) return null;
    return { mode: 'aim', targets: E.powerTargets(g, 0).map((t) => t.uid) };
  }
  return null;
}

function onDown(e) {
  if (!g || root.hidden || e.button > 0) return;
  const src = srcOf(e.target);
  if (!src) return;
  press = { x: e.clientX, y: e.clientY, src, moved: false, id: e.pointerId };
}

function onMove(e) {
  if (!press || e.pointerId !== press.id) return;
  if (!press.moved && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 9) {
    press.moved = true;
    const p = plan(press.src);
    if (p) {
      clearSel();
      drag = { src: press.src, ...p };
      mark(p.targets);
      if (p.mode === 'carry') { press.src.el.classList.add('dragging'); els.rowMe.classList.add('drop'); hidePreview(); }
      else { press.src.el.classList.add('aiming'); els.arrow.classList.add('on'); }
    }
  }
  if (!drag) return;
  e.preventDefault();
  if (drag.mode === 'carry') {
    drag.src.el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -62%) scale(1.12)`;
  } else {
    const [x0, y0] = centre(drag.src.el);
    aim(x0, y0, e.clientX, e.clientY, drag.targets.includes(uidAt(e.clientX, e.clientY)));
  }
}

function onUp(e) {
  if (!press || e.pointerId !== press.id) return;
  const p = press;
  press = null;
  if (drag) { const d = drag; endDrag(); drop(d, e.clientX, e.clientY); return; }
  if (!p.moved) tap(p.src);
}

function onCancel() { press = null; if (drag) endDrag(); }

function endDrag() {
  const el = drag.src.el;
  el.classList.remove('dragging', 'aiming');
  el.style.transform = '';
  els.rowMe.classList.remove('drop');
  els.arrow.classList.remove('on');
  mark([]);
  drag = null;
}

function uidAt(x, y) {
  const el = document.elementFromPoint(x, y);
  return el?.closest('.tok, .hero')?.dataset.uid || null;
}

function drop(d, x, y) {
  if (d.src.kind === 'card') {
    if (d.mode === 'carry') {
      if (y < els.hand.getBoundingClientRect().top + 10) playFromHand(d.card, null, slotAt(x));
    } else {
      const uid = uidAt(x, y);
      if (d.targets.includes(uid)) playFromHand(d.card, uid);
    }
  } else {
    const uid = uidAt(x, y);
    if (!d.targets.includes(uid)) return;
    if (d.src.kind === 'tok') act(() => E.attack(g, d.src.uid, uid));
    else act(() => E.heroPower(g, 0, uid));
  }
}

/** Where along my row a minion dropped at screen x would land. */
function slotAt(x) {
  const toks = [...els.rowMe.children];
  let i = 0;
  for (const t of toks) { if (x > centre(t)[0]) i++; }
  return i;
}

function tap(src) {
  sfx.play('tap');
  if (sel) {
    const s = sel;
    if (s.kind === 'card' && s.mode === 'carry' && src.kind !== 'card' && src.kind !== 'power') { clearSel(); playFromHand(s.card, null, null); return; }
    if (src.uid && s.targets.includes(src.uid)) {
      clearSel();
      if (s.kind === 'card') playFromHand(s.card, src.uid);
      else if (s.kind === 'tok') act(() => E.attack(g, s.uid, src.uid));
      else act(() => E.heroPower(g, 0, src.uid));
      return;
    }
    clearSel();
    if (s.uid === src.uid) return;
  }
  if (src.kind === 'field') { hidePreview(); return; }
  if (src.kind === 'hero') return;
  const p = plan(src);
  if (src.kind === 'card') {
    const card = g.p[0].hand.find((c) => c.uid === src.uid);
    if (!card) return;
    showPreview(card.id, 'mine');
    if (!p) { if (g.turn === 0 && !busy) whyNot(card); src.el.classList.add('sel'); sel = { kind: 'peek', uid: src.uid, targets: [], el: src.el }; return; }
    sel = { kind: 'card', uid: src.uid, el: src.el, ...p };
    if (p.mode === 'carry') els.rowMe.classList.add('drop');
  } else if (src.kind === 'tok') {
    const m = E.find(g, src.uid);
    if (!m) return;
    showPreview(m.id, m.owner === 0 ? 'mine' : 'theirs');
    if (!p) { sel = { kind: 'peek', uid: src.uid, targets: [], el: src.el }; return; }
    sel = { kind: 'tok', uid: src.uid, el: src.el, ...p };
  } else if (src.kind === 'power') {
    if (!p) { toast(g.p[0].powerUsed ? `${HERO_POWER.name} is spent this turn` : `${HERO_POWER.name} costs ${HERO_POWER.cost} mana: ${HERO_POWER.text}`); return; }
    sel = { kind: 'power', uid: 'power', el: src.el, ...p };
  }
  if (sel) { sel.el.classList.add('sel'); mark(sel.targets); }
}

function whyNot(card) {
  const def = CARD[card.id], p = g.p[0];
  if (def.cost > p.mana) toast('Not enough mana');
  else if (def.type === 'minion' && p.board.length >= E.MAX_BOARD) toast('Your board is full');
  else if (def.target) toast('Nothing to aim it at');
}

function clearSel() {
  if (sel) sel.el?.classList.remove('sel');
  sel = null;
  mark([]);
  els.rowMe?.classList.remove('drop');
  hidePreview();
}

function mark(uids) {
  for (const el of root.querySelectorAll('.can-target')) el.classList.remove('can-target');
  for (const uid of uids) {
    const el = uid.startsWith('h') ? (uid === 'h0' ? els.heroMe : els.heroOpp) : tokEls.get(uid);
    el?.classList.add('can-target');
  }
}

function aim(x0, y0, x1, y1, valid) {
  const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - Math.min(120, Math.hypot(x1 - x0, y1 - y0) * 0.3);
  const path = els.arrow.querySelector('.shaft');
  path.setAttribute('d', `M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}`);
  els.arrow.classList.toggle('valid', valid);
}

function onHover(e) {
  if (e.pointerType !== 'mouse' || sel || drag || !g) return;
  const card = e.target.closest('.hand .card');
  if (card) { const c = g.p[0].hand.find((x) => x.uid === card.dataset.uid); if (c) showPreview(c.id, 'mine'); return; }
  const tok = e.target.closest('.tok');
  if (tok) { const m = E.find(g, tok.dataset.uid); if (m) showPreview(m.id, m.owner === 0 ? 'mine' : 'theirs'); }
}

// ---------------------------------------------------------------------------------------------------- moves

async function act(fn) {
  if (busy || !g || g.over) return;
  busy = true;
  clearSel();
  render();
  try { await fn(); } catch (err) { console.error(err); }
  busy = false;
  render();
  if (!g.over && g.turn === 1) runAi();
}

function playFromHand(card, targetUid, pos = null) {
  const target = targetUid ? E.find(g, targetUid) : null;
  // the card leaves the hand at once, so it does not hang there while its effect plays out
  act(() => E.playCard(g, 0, card.uid, target, pos));
}

function endMyTurn() {
  if (busy || !g || g.over || g.turn !== 0) return;
  act(() => E.endTurn(g));
}

async function runAi() {
  if (busy || g.over) return;
  busy = true;
  render();
  await sleep(500);
  try { await aiTurn(g, 1, opp.level, () => sleep(520)); } catch (err) { console.error(err); }
  busy = false;
  render();
}

async function concede() {
  if (!g || g.over) return;
  if (!(await confirmBox('Concede this duel?', 'Concede', 'Keep fighting'))) return;
  g.over = true;
  g.winner = 1;
  finish(1);
}

async function finish(winner) {
  const won = winner === 0, first = won && !S.wins[opp.id];
  const gold = won ? opp.gold : (winner === -1 ? 25 : 10);
  S.stats.played++;
  if (won) { S.stats.won++; S.wins[opp.id] = (S.wins[opp.id] || 0) + 1; }
  S.gold += gold;
  const bonus = [];
  if (first) for (const k in opp.firstWin) { S.packs[k] = (S.packs[k] || 0) + opp.firstWin[k]; bonus.push(`${opp.firstWin[k]} ${k === 'abyss' ? 'Abyssal' : 'Tide'} pack${opp.firstWin[k] > 1 ? 's' : ''}`); }
  S.market = { seed: Math.floor(Math.random() * 1e9), offers: null };      // the merchants bring new stock after every duel
  save();
  refreshBar();
  clearSel();
  await sleep(700);
  sfx.play(won ? 'win' : 'lose');
  els.over.hidden = false;
  els.over.className = 'bt-over ' + (won ? 'won' : 'lost');
  els.over.replaceChildren(h('div.over-box', {},
    h('h2', {}, won ? 'Victory' : (winner === -1 ? 'Both Drowned' : 'Defeat')),
    h('p', {}, won ? `${opp.name} sinks beneath the tide.` : (winner === -1 ? 'Nobody is left to claim the win.' : `${opp.name} drags you under.`)),
    h('p.over-loot', { html: `<i class="coin"></i> +${gold} gold` + (bonus.length ? `<br>First win: ${bonus.join(' and ')}` : '') }),
    h('div.row', {}, btn('Duel again', () => start(opp)), btn('Leave', () => exit(), 'ghost'))));
}
