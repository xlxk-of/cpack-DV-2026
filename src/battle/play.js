// THE BATTLE SCREEN: the arena (view.js) and the hands around it, and the fingers on them. A card is dragged out of
// the hand onto the field, or tapped and then the field tapped. Every finger is followed on its own, so in a Duo Duel
// two players can throw cards at the same moment.
//
// The screen is laid out for the shape it is in, and laid out again the moment that changes (the Duo opened or
// closed mid-battle):
//   tall   a usual phone: the far side's name on top, the arena, the hand along the bottom
//   stub   the Duo's cover screen, or the open Duo held upright: the arena on the left, the hand in a column right
//   wide   the open Duo held sideways: the rival's corner on the left, the arena in the middle, the hand on the right
//   duo-land / duo-port   two players on one open Duo lying flat: the river on the crease, a hand at each end,
//          each facing its own player
import { BATTLE, battleStats } from './cards.js';
import { Battle, H, MANA_MAX, W } from './sim.js';
import { Brain } from './ai.js';
import { ArenaView } from './view.js';
import { TEAM } from './art.js';

const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, cls, parent, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  if (parent) parent.appendChild(node);
  return node;
};

const CROWN = '<svg viewBox="0 0 9 7" class="crown-svg" aria-hidden="true"><path d="M0 1h1v1h1v1h1V0h1v1h1V0h1v3h1V2h1V1h1v6H0z"/></svg>';
// what a wizard can say across the river, each with a card's face
export const EMOTES = [
  { card: 'ember_sprite', text: 'HEE HEE!' },
  { card: 'bone_knight', text: 'WELL PLAYED' },
  { card: 'snowman_decoy', text: 'OOPS…' },
  { card: 'inferno_golem', text: 'GRRR!' },
];
const WHY = { mana: 'NOT ENOUGH MANA', zone: 'NOT THERE', friend: 'NEEDS ONE OF YOURS NEAR', troop: 'NEEDS A SUMMON OF YOURS NEAR', foe: 'NOTHING TO COPY', time: 'TIME HAS STOPPED' };

function clock(s) {
  const t = Math.ceil(s);
  return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
}

export class BattleScreen {
  /**
   * `root`: an empty element filling the screen. `opts`: {cards, sfx, mode ('ladder' | 'practice' | 'duo'), seed,
   * players: two of {name, deck, levels, human, skill, art(id), look(id), deckName, tier}, onEnd(result), form()}.
   */
  constructor(root, opts) {
    this.root = root;
    this.o = opts;
    this.sfx = opts.sfx;
    this.byId = {};
    for (const c of opts.cards) this.byId[c.id] = c;
    this.duo = opts.mode === 'duo';
    this.b = new Battle(opts.cards, opts.players, { seed: opts.seed || (Date.now() & 0xffff) });
    this.brains = opts.players.map((p, team) => (p.human ? null : new Brain(this.b, team, p.skill, (opts.seed || 1) + team * 31)));
    this.humans = opts.players.map((p, team) => (p.human ? team : -1)).filter((t) => t >= 0);
    this.drags = new Map();
    this.sel = [-1, -1];
    this.paused = false;
    this.ended = false;
    this.last = 0;
    this.endT = 0;
    this.lastLeft = Infinity;
    this._build();
    this.view = new ArenaView(this.canvas, this.b, opts.cards, { viewer: this.duo ? -1 : 0, duo: this.duo });
    this._bind();
    this.layout();
    this.raf = requestAnimationFrame((t) => this._frame(t));
    this._banner(this.duo ? 'DUO DUEL' : 'BATTLE!', 1.4);
    this.sfx.synth('horn');
    if (opts.hint) {
      // the very first battle: say how a card is played, twice, in case the first went by unread
      setTimeout(() => this._note(0, 'DRAG A CARD ONTO YOUR SIDE'), 1800);
      setTimeout(() => { if (!this.b.players[0].played) this._note(0, 'OR TAP A CARD, THEN THE FIELD'); }, 6500);
    }
  }

  // ---------------------------------------------------------------- the page
  _build() {
    const r = this.root;
    r.innerHTML = '';
    r.className = 'battle' + (this.duo ? ' is-duo' : '');
    this.canvas = el('canvas', 'b-canvas', r);
    this.panels = [];
    for (const team of this.humans) this.panels[team] = this._panel(team);
    if (!this.duo) {
      this.foe = el('div', 'b-foe', r);
      const p = this.o.players[1];
      this.foe.innerHTML = '<div class="b-foe-name"></div><div class="b-foe-deck"></div><div class="b-foe-crowns crowns"></div>'
        + '<div class="b-foe-clock"></div><div class="b-foe-last"><div class="b-foe-lastcap">PLAYED</div><div class="b-foe-card"></div></div>';
      $('.b-foe-name', this.foe).textContent = p.name;
      $('.b-foe-deck', this.foe).textContent = p.deckName || '';
    }
    this.bannerEl = el('div', 'b-banner', r);
    this.countEl = el('div', 'b-count', r);
    this.pauseBtn = el('button', 'b-pause', r);
    this.pauseBtn.innerHTML = '<span></span><span></span>';
    this.pauseBtn.setAttribute('aria-label', 'pause');
    this.menu = el('div', 'b-menu', r);
    this.menu.hidden = true;
    this.menu.innerHTML = '<div class="b-menu-box"><div class="b-menu-title">PAUSED</div><button class="big" data-act="resume">RESUME</button>'
      + '<button class="big ghost" data-act="quit">' + (this.o.mode === 'ladder' ? 'SURRENDER' : 'LEAVE') + '</button></div>';
    this.overEl = el('div', 'b-over', r);
    this.overEl.hidden = true;
    this.ghostEls = new Map();
  }

  _panel(team) {
    const p = el('div', 'bp', this.root);
    p.dataset.team = team;
    p.style.setProperty('--team', TEAM[team].ring);
    const top = el('div', 'bp-top', p);
    el('div', 'bp-name', top, this.o.players[team].name);
    const crowns = el('div', 'bp-crowns crowns', top);
    const clockEl = el('div', 'bp-clock', top);
    const say = el('button', 'bp-say', top);
    say.setAttribute('aria-label', 'emote');
    say.innerHTML = '<span></span>';
    const pick = el('div', 'bp-emotes', p);
    pick.hidden = true;
    EMOTES.forEach((em, i) => {
      const b = el('button', 'bp-emote', pick);
      b.style.backgroundImage = 'url(art/' + em.card + '.png)';
      el('span', '', b, em.text);
      b.addEventListener('click', () => {
        pick.hidden = true;
        this._emote(team, i);
      });
    });
    say.addEventListener('click', () => { pick.hidden = !pick.hidden; });
    const note = el('div', 'bp-note', p);
    const hand = el('div', 'bp-hand', p);
    const next = el('div', 'bp-next', hand);
    el('div', 'bp-nextcap', next, 'NEXT');
    const nextCard = el('div', 'hc hc-mini', next);
    const cards = [0, 1, 2, 3].map((slot) => {
      const c = el('button', 'hc', hand);
      c.dataset.slot = slot;
      c.dataset.team = team;
      c.innerHTML = '<div class="hc-art"></div><div class="hc-fill"></div><div class="hc-cost"></div><div class="hc-name"></div>';
      return { el: c, id: null, cost: -1, ok: null, hidden: null };
    });
    const mana = el('div', 'mana', p);
    mana.innerHTML = '<div class="mana-fill"></div><div class="mana-ticks"></div><div class="mana-n"></div>';
    return { el: p, team, crowns, clock: clockEl, note, hand, next: nextCard, nextId: null, cards, mana, manaFill: $('.mana-fill', mana), manaN: $('.mana-n', mana), shownMana: -1 };
  }

  /** Lays everything out for the screen as it is now. */
  layout() {
    const r = this.root;
    const vw = r.clientWidth, vh = r.clientHeight;
    const safe = safeInsets();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(vw * dpr);
    this.canvas.height = Math.round(vh * dpr);
    this.canvas.style.width = vw + 'px';
    this.canvas.style.height = vh + 'px';
    let shape;
    if (this.duo) shape = vw >= vh ? 'duo-land' : 'duo-port';
    else {
      const ratio = vh / vw;
      shape = ratio >= 1.62 ? 'tall' : (ratio >= 0.95 ? 'stub' : 'wide');
    }
    this.shape = shape;
    r.dataset.shape = shape;
    const L = safe.l, R = safe.r, T = safe.t, B = safe.b;
    const place = (node, x, y, w, h, rot = 0) => {
      node.style.left = x + 'px';
      node.style.top = y + 'px';
      node.style.width = w + 'px';
      node.style.height = h + 'px';
      node.style.transform = rot ? 'rotate(' + rot + 'deg)' : '';
    };
    const strip = (panel, len, cap) => {
      // a panel lying along an edge: the card width from its length, its thickness from the card. A long one keeps
      // the name, crowns and clock beside the cards rather than above them, so it is thinner and the arena bigger.
      const side = len >= 560;
      const cw = Math.floor(Math.min(cap, (len - 28 - 5 * 6 - (side ? 110 : 0)) / 4.62));
      panel.el.dataset.shape = side ? 'side' : 'strip';
      panel.el.style.setProperty('--cw', cw + 'px');
      return Math.round(cw * 1.28 + (side ? 12 : 22) + 30 + 16);
    };
    const column = (panel, colW, colH) => {
      const cw = Math.floor(Math.min(140, (colW - 24 - 8) / 2, (colH - 150) / 2.6));
      panel.el.dataset.shape = 'column';
      panel.el.style.setProperty('--cw', cw + 'px');
    };
    let arena;
    if (shape === 'tall') {
      const p = this.panels[0];
      const th = strip(p, vw - L - R, 96);
      place(p.el, L, vh - B - th, vw - L - R, th);
      place(this.foe, L, T, vw - L - R, 44);
      this.foe.dataset.shape = 'strip';
      arena = { x: L, y: T + 44, w: vw - L - R, h: vh - B - th - T - 44 };
    } else if (shape === 'stub') {
      const p = this.panels[0];
      const avH = vh - T - B - 8;
      const S = Math.min(avH / (H + 2.8), (vw - L - R - 164) / W);
      const aw = Math.floor(S * W);
      const colX = L + aw + 8, colW = vw - R - colX - 4;
      place(this.foe, colX, T + 4, colW, 112);
      this.foe.dataset.shape = 'column';
      column(p, colW, avH - 112);
      place(p.el, colX, T + 120, colW, vh - B - T - 124);
      arena = { x: L + 4, y: T + 4, w: aw, h: avH };
    } else if (shape === 'wide') {
      const p = this.panels[0];
      const avH = vh - T - B - 8;
      const S = avH / (H + 2.8);
      const aw = Math.floor(S * W);
      const side = Math.floor((vw - L - R - aw - 16) / 2);
      place(this.foe, L + 4, T + 4, side, avH);
      this.foe.dataset.shape = 'tall';
      column(p, side, avH);
      place(p.el, vw - R - side - 4, T + 4, side, avH);
      arena = { x: L + side + 8, y: T + 4, w: aw, h: avH };
    } else if (shape === 'duo-land') {
      const len = vh - T - B;
      const th = strip(this.panels[0], len, 74);
      strip(this.panels[1], len, 74);
      // each panel is laid out as a strip `len` long and `th` thick, then turned to lie along its own edge
      place(this.panels[0].el, L + th / 2 - len / 2, T + len / 2 - th / 2, len, th, 90);
      place(this.panels[1].el, vw - R - th / 2 - len / 2, T + len / 2 - th / 2, len, th, -90);
      arena = { x: L + th + 4, y: T, w: vw - L - R - th * 2 - 8, h: len };
    } else {
      const len = vw - L - R;
      const th = strip(this.panels[0], len, 80);
      strip(this.panels[1], len, 80);
      place(this.panels[0].el, L, vh - B - th, len, th);
      place(this.panels[1].el, L, T, len, th, 180);
      arena = { x: L, y: T + th + 4, w: len, h: vh - T - B - th * 2 - 8 };
    }
    this.arena = arena;
    this.view.layout(arena, shape === 'duo-land' ? 1 : 0, dpr);
    this.dirty = true;           // a resized canvas is blank: paint it again even while paused
    // the pause button: on the crease between the players, or in a corner
    const pb = this.pauseBtn;
    if (this.duo) {
      const c = this.view.toScreen(W / 2, H / 2);
      pb.style.left = c.x - 20 + 'px';
      pb.style.top = c.y - 20 + 'px';
    } else if (shape === 'tall') {
      pb.style.left = vw - R - 46 + 'px';
      pb.style.top = T + 48 + 'px';
    } else {
      pb.style.left = arena.x + 6 + 'px';
      pb.style.top = arena.y + 6 + 'px';
    }
    const c = this.view.toScreen(W / 2, H / 2);
    this.bannerEl.style.left = arena.x + 'px';
    this.bannerEl.style.width = arena.w + 'px';
    this.bannerEl.style.top = c.y - 40 + 'px';
    this.countEl.style.left = arena.x + 'px';
    this.countEl.style.width = arena.w + 'px';
    this.countEl.style.top = c.y - 70 + 'px';
    this.bannerEl.style.transform = this.countEl.style.transform = shape === 'duo-land' ? 'rotate(90deg)' : '';
    for (const p of this.panels) if (p) { p.shownMana = -1; for (const c2 of p.cards) c2.id = null; p.nextId = null; }
  }

  // ---------------------------------------------------------------- fingers
  _bind() {
    this._onDown = (e) => this._down(e);
    this._onMove = (e) => this._move(e);
    this._onUp = (e) => this._up(e);
    this.root.addEventListener('pointerdown', this._onDown);
    window.addEventListener('pointermove', this._onMove, { passive: false });
    window.addEventListener('pointerup', this._onUp);
    window.addEventListener('pointercancel', this._onUp);
    this._onVis = () => { if (document.hidden && !this.ended) this.pause(true); };
    document.addEventListener('visibilitychange', this._onVis);
    this.pauseBtn.addEventListener('click', () => this.pause(!this.paused));
    this.menu.addEventListener('click', (e) => {
      const act = e.target.dataset && e.target.dataset.act;
      if (act === 'resume') this.pause(false);
      if (act === 'quit') this._quit();
    });
  }

  _down(e) {
    if (this.paused || this.ended) return;
    const card = e.target.closest && e.target.closest('.hc[data-slot]');
    if (card) {
      e.preventDefault();
      const team = +card.dataset.team, slot = +card.dataset.slot;
      if (!this.b.players[team].hand[slot]) return;
      this.drags.set(e.pointerId, { team, slot, x0: e.clientX, y0: e.clientY, moved: false, el: card });
      card.dataset.held = '1';
      this.sfx.play('card_select', 1.15, 0.35);
      return;
    }
    if (e.target === this.canvas) {
      const w = this._world(e);
      const teams = this.humans.filter((t) => this.sel[t] >= 0);
      if (!teams.length) return;
      let team = teams[0];
      if (teams.length > 1) team = w.y > H / 2 ? 0 : 1;
      e.preventDefault();
      this._try(team, this.sel[team], w.x, w.y);
    }
  }

  _move(e) {
    const d = this.drags.get(e.pointerId);
    if (!d) return;
    e.preventDefault();
    if (!d.moved && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 10) {
      d.moved = true;
      d.el.dataset.lifted = '1';
      this.sel[d.team] = -1;
    }
    if (!d.moved) return;
    const w = this._world(e);
    const inside = w.x >= 0 && w.x <= W && w.y >= 0 && w.y <= H;
    this._ghost(e.pointerId, d, inside ? null : e);
    if (inside) this._aim(e.pointerId, d.team, d.slot, w.x, w.y);
    else this._unaim(e.pointerId);
  }

  _up(e) {
    const d = this.drags.get(e.pointerId);
    if (!d) return;
    this.drags.delete(e.pointerId);
    d.el.dataset.held = '0';
    d.el.dataset.lifted = '0';
    this._ghost(e.pointerId, d, null);
    this._unaim(e.pointerId);
    if (!d.moved) {
      // a tap: choose the card (or let go of it), then tap the field
      this.sel[d.team] = this.sel[d.team] === d.slot ? -1 : d.slot;
      this._paintSel(d.team);
      return;
    }
    const w = this._world(e);
    if (w.x >= 0 && w.x <= W && w.y >= 0 && w.y <= H) this._try(d.team, d.slot, w.x, w.y);
  }

  _world(e) {
    const box = this.canvas.getBoundingClientRect();
    return this.view.toWorld(e.clientX - box.left, e.clientY - box.top);
  }

  /** Whether the card goes on whole tiles (anything that stands on the floor) or where it is aimed. */
  _snap(id, x, y) {
    const def = this._rules(id);
    if (def && (def.kind === 'troop' || def.kind === 'building' || def.kind === 'trap')) {
      return [Math.max(0.5, Math.min(W - 0.5, Math.round(x * 2) / 2)), Math.max(0.5, Math.min(H - 0.5, Math.round(y * 2) / 2))];
    }
    return [x, y];
  }

  _rules(id) {
    return id === 'mirror_wand' ? null : BATTLE[id];
  }

  _aim(pid, team, slot, x, y) {
    const c = this.b.players[team].hand[slot];
    if (!c) return;
    const rules = this.b._rulesOf(team, c.id);
    const def = rules.def;
    [x, y] = this._snap(rules.id, x, y);
    const can = this.b.canPlay(team, slot, x, y);
    const pv = { pid, team, card: rules.id, x, y, ok: can.ok || can.why === 'mana', place: def.place };
    if (def.kind === 'troop' && rules.id !== 'mirror') Object.assign(pv, { token: true, size: def.size, count: def.count || 1 });
    else if (def.kind === 'building') Object.assign(pv, { token: true, building: true, size: def.size });
    else if (def.kind === 'trap') pv.r = 0.75;
    else if (def.place !== 'global') pv.r = def.r || def.reach || 0.9;
    else pv.r = 0;
    this.view.previews = this.view.previews.filter((p) => p.pid !== pid).concat(pv);
  }

  _unaim(pid) {
    this.view.previews = this.view.previews.filter((p) => p.pid !== pid);
  }

  /** A small copy of the card under the finger while it is outside the arena. */
  _ghost(pid, d, e) {
    let g = this.ghostEls.get(pid);
    if (!e) {
      if (g) { g.remove(); this.ghostEls.delete(pid); }
      return;
    }
    if (!g) {
      g = d.el.cloneNode(true);
      g.classList.add('hc-ghost');
      g.removeAttribute('data-slot');
      this.root.appendChild(g);
      this.ghostEls.set(pid, g);
    }
    const box = this.root.getBoundingClientRect();
    g.style.left = e.clientX - box.left + 'px';
    g.style.top = e.clientY - box.top + 'px';
    const panel = this.panels[d.team];
    g.style.transform = 'translate(-50%,-60%) ' + (panel.el.style.transform || '') + ' scale(1.08)';
  }

  _try(team, slot, x, y) {
    const c = this.b.players[team].hand[slot];
    if (!c) return;
    const rules = this.b._rulesOf(team, c.id);
    [x, y] = this._snap(rules.id, x, y);
    const can = this.b.canPlay(team, slot, x, y);
    if (!can.ok) {
      this._note(team, WHY[can.why] || 'NOT NOW');
      this.sfx.play('tick', 0.7, 0.5);
      const cardEl = this.panels[team].cards[slot].el;
      cardEl.classList.remove('shake');
      void cardEl.offsetWidth;
      cardEl.classList.add('shake');
      return;
    }
    this.b.play(team, slot, x, y);
    this.sel[team] = -1;
    this._paintSel(team);
    this.sfx.play('card_select', 0.9, 0.55);
  }

  _paintSel(team) {
    const p = this.panels[team];
    if (!p) return;
    p.cards.forEach((c, i) => { c.el.dataset.sel = this.sel[team] === i ? '1' : '0'; });
  }

  _note(team, text) {
    const p = this.panels[team];
    if (!p) return;
    p.note.textContent = text;
    p.note.classList.remove('show');
    void p.note.offsetWidth;
    p.note.classList.add('show');
  }

  _banner(text, seconds = 1.6, kind = '') {
    const b = this.bannerEl;
    b.textContent = text;
    b.dataset.kind = kind;
    b.classList.remove('show');
    void b.offsetWidth;
    b.classList.add('show');
    clearTimeout(this._bannerT);
    this._bannerT = setTimeout(() => b.classList.remove('show'), seconds * 1000);
    if (this.duo) for (const t of this.humans) this._note(t, text);
  }

  pause(on) {
    if (this.ended) return;
    this.paused = on;
    this.menu.hidden = !on;
    this.menu.style.transform = this.shape === 'duo-land' ? 'rotate(90deg)' : '';
    if (!on) this.last = 0;
  }

  _quit() {
    this.paused = false;
    this.menu.hidden = true;
    if (this.o.mode === 'ladder' && !this.b.over) {
      this.b.players[1].crowns = 3;
      this.b._end(1, 'surrender');
    } else if (!this.b.over) {
      this.b._end(-1, 'left');
    }
  }

  // ---------------------------------------------------------------- every frame
  _frame(now) {
    if (this.dead) return;
    const dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 0;
    this.last = now;
    if (!this.paused) {
      if (!this.b.over) {
        for (const brain of this.brains) if (brain) brain.update(dt);
        this.b.update(dt);
      }
      const events = this.b.drain();
      this.view.absorb(events);
      this._sounds(events);
      this.view.draw(dt);
      this._hud();
      if (this.b.over && !this.ended) {
        this.endT += dt;
        if (this.endT > 1.6) this._finish();
      }
      this._animCards(dt);
      this.dirty = false;
    } else if (this.dirty) {
      this.view.draw(0);
      this._hud();
      this.dirty = false;
    }
    this.raf = requestAnimationFrame((t) => this._frame(t));
  }

  _sounds(events) {
    const s = this.sfx;
    for (const ev of events) {
      switch (ev.t) {
        case 'deploy': s.synth('deploy', 0.7); break;
        case 'attack': s.synth(ev.ranged ? 'arrow' : 'hit', ev.tower ? 0.35 : 0.6); break;
        case 'spell': s.synth(ev.fx === 'frost' || ev.fx === 'snow' ? 'freeze' : ev.fx === 'holy' ? 'chime' : ev.fx === 'storm' ? 'zap'
          : ev.fx === 'arcane' || ev.fx === 'shadow' ? 'whoosh' : (ev.card === 'meteor' || ev.card === 'verdict' ? 'bigboom' : 'boom'), 0.8); break;
        case 'zap': s.synth('zap', ev.small ? 0.4 : 0.8); break;
        case 'heal': if (!ev.small) s.synth('chime', 0.7); break;
        case 'shield': s.synth('freeze', 0.5); break;
        case 'mana': s.synth('sparkle', 0.6); break;
        case 'die': if (ev.type !== 'tower') s.synth('poof', 0.5); break;
        case 'tower':
          s.play('card_shatter', 0.85, 0.9);
          s.synth('bigboom', 1);
          break;
        case 'crown':
          s.play('pack_good', 1, 0.8);
          // the computer has something to say about it, now and then
          if (this.brains[1] && !this.b.over && Math.random() < 0.5) setTimeout(() => this._emote(1, ev.team === 1 ? 0 : 2), 700);
          if (!this.b.over) this._banner(this._who(ev.team) + ' TAKES A CROWN', 1.6, ev.team === 0 || this.duo ? 'good' : 'bad');
          break;
        case 'trap': s.synth('boom', 0.6); break;
        case 'phase':
          s.synth('horn', 1);
          this._banner(ev.phase === 'double' ? 'LAST MINUTE · DOUBLE MANA' : 'OVERTIME · NEXT CROWN WINS', 2.2, 'phase');
          break;
        case 'cast':
          if (!this.duo && ev.team === 1) this._foeCast(ev.card);
          break;
        case 'nightmare': s.synth('whoosh', 1); this._note(ev.team, 'NIGHTMARE · YOUR HAND IS DARK'); break;
        case 'warp': s.synth('whoosh', 1); this._note(ev.team, 'TIME HAS STOPPED'); break;
        case 'steal': this._note(ev.team, 'STOLE ' + this.byId[ev.card].name.toUpperCase()); break;
        case 'drain': this._note(ev.team, 'LOST ' + ev.n + ' MANA'); break;
        case 'reflect': s.synth('sparkle', 1); break;
        case 'wake': s.synth('horn', 0.4); break;
        default: break;
      }
    }
  }

  /** A wizard says something. One at a time, and not too often. */
  _emote(team, i) {
    const now = performance.now();
    this.emoteAt = this.emoteAt || [0, 0];
    if (now - this.emoteAt[team] < 2500) return;
    this.emoteAt[team] = now;
    const em = EMOTES[i];
    this.view.emote(team, em.card, em.text);
    this.sfx.synth('sparkle', 0.7);
  }

  _who(team) {
    if (this.duo) return this.o.players[team].name.toUpperCase();
    return team === 0 ? 'YOU' : this.o.players[1].name.toUpperCase();
  }

  _foeCast(id) {
    const holder = $('.b-foe-card', this.foe);
    holder.innerHTML = '';
    const card = this._cardFace(id, 1, this.o.players[1]);
    holder.appendChild(card);
    holder.classList.remove('pop');
    void holder.offsetWidth;
    holder.classList.add('pop');
  }

  /** A card as the hand shows it: its picture (or the scene or the animation it wears), its cost, its level's tint. */
  _cardFace(id, team, player) {
    const c = el('div', 'hc hc-static');
    c.innerHTML = '<div class="hc-art"></div><div class="hc-cost"></div>';
    this._dress(c, id, player);
    $('.hc-cost', c).textContent = this.byId[id].cost;
    return c;
  }

  _dress(node, id, player) {
    const art = $('.hc-art', node);
    art.innerHTML = '';
    art.style.backgroundImage = '';
    const card = this.byId[id];
    const which = player && player.art ? player.art(id) : 'classic';
    node.dataset.look = player && player.look ? player.look(id) : 1;
    node.dataset.school = card.school;
    if (which === 'anim' && card.anim) {
      art.dataset.anim = '1';
      for (let n = 0; n < 4; n++) {
        const layer = el('div', 'hc-layer', art);
        layer.style.backgroundImage = 'url(art/' + id + '_anim_l' + n + '.png)';
        layer.style.backgroundSize = (card.anim.cols * 100) + '% ' + (Math.ceil(card.anim.frames / card.anim.cols) * 100) + '%';
      }
    } else {
      art.dataset.anim = '0';
      art.dataset.full = which === 'alt' ? '1' : '0';
      art.style.backgroundImage = 'url(art/' + id + (which === 'alt' ? '_alt' : '') + '.png)';
    }
  }

  _animCards(dt) {
    this.animT = (this.animT || 0) + dt;
    const frame = Math.floor(this.animT * 12);
    if (frame === this.animFrame) return;
    this.animFrame = frame;
    for (const art of this.root.querySelectorAll('.hc-art[data-anim="1"]')) {
      const id = art.closest('.hc').dataset.card;
      const card = this.byId[id];
      if (!card || !card.anim) continue;
      const n = frame % card.anim.frames, cols = card.anim.cols, rows = Math.ceil(card.anim.frames / cols);
      const pos = ((n % cols) / (cols - 1)) * 100 + '% ' + (Math.floor(n / cols) / (rows - 1)) * 100 + '%';
      for (const layer of art.children) layer.style.backgroundPosition = pos;
    }
  }

  _hud() {
    const b = this.b;
    const left = b.timeLeft();
    const label = b.phase === 'overtime' ? 'OT ' + clock(left) : clock(left);
    if (left <= 10 && Math.ceil(left) !== Math.ceil(this.lastLeft) && left > 0 && !b.over) {
      this.sfx.play('tick', 1.3, 0.5);
      this.countEl.textContent = String(Math.ceil(left));
      this.countEl.classList.remove('show');
      void this.countEl.offsetWidth;
      this.countEl.classList.add('show');
    }
    this.lastLeft = left;
    for (const p of this.panels) {
      if (!p) continue;
      const pl = b.players[p.team];
      p.clock.textContent = label;
      p.clock.dataset.low = left <= 10 || b.phase === 'overtime' ? '1' : '0';
      p.crowns.innerHTML = crowns(pl.crowns);
      const m = Math.round(pl.mana * 20) / 20;
      if (m !== p.shownMana) {
        p.shownMana = m;
        p.manaFill.style.width = (pl.mana / MANA_MAX) * 100 + '%';
        p.manaN.textContent = Math.floor(pl.mana);
      }
      p.mana.dataset.double = b.doubled || b.phase === 'overtime' ? '1' : '0';
      p.el.dataset.warp = pl.warpT > 0 ? '1' : '0';
      const dark = pl.nightT > 0;
      pl.hand.forEach((c, slot) => {
        const h = p.cards[slot];
        const id = c ? c.id : null;
        if (id !== h.id || dark !== h.hidden) {
          h.id = id;
          h.hidden = dark;
          h.el.dataset.card = id || '';
          h.el.dataset.hidden = dark ? '1' : '0';
          h.el.dataset.temp = c && c.temp ? '1' : '0';
          if (id) {
            this._dress(h.el, id, this.o.players[p.team]);
            $('.hc-name', h.el).textContent = this.byId[id].name;
            h.el.classList.remove('fresh');
            void h.el.offsetWidth;
            h.el.classList.add('fresh');
          }
        }
        if (!id) return;
        const cost = b.costOf(p.team, slot);
        if (cost !== h.cost) {
          h.cost = cost;
          $('.hc-cost', h.el).textContent = cost;
          h.el.dataset.cheaper = cost < this.byId[id].cost ? '1' : (cost > this.byId[id].cost ? '2' : '0');
        }
        const ok = pl.mana >= cost;
        if (ok !== h.ok) {
          h.ok = ok;
          h.el.dataset.ok = ok ? '1' : '0';
        }
        $('.hc-fill', h.el).style.height = ok ? '0%' : (100 - (pl.mana / cost) * 100) + '%';
      });
      const nx = pl.queue[0] ? pl.queue[0].id : null;
      if (nx !== p.nextId) {
        p.nextId = nx;
        p.next.dataset.card = nx || '';
        p.next.innerHTML = '<div class="hc-art"></div>';
        if (nx) this._dress(p.next, nx, this.o.players[p.team]);
      }
      p.next.dataset.hidden = dark ? '1' : '0';
    }
    if (this.foe) {
      $('.b-foe-crowns', this.foe).innerHTML = crowns(b.players[1].crowns);
      const fc = $('.b-foe-clock', this.foe);
      fc.textContent = label;
      fc.dataset.low = left <= 10 || b.phase === 'overtime' ? '1' : '0';
    }
  }

  // ---------------------------------------------------------------- the end
  _finish() {
    this.ended = true;
    const r = this.b.result;
    const box = this.overEl;
    box.hidden = false;
    box.innerHTML = '';
    box.dataset.shape = this.shape;
    const sides = this.duo ? [0, 1] : [0];
    for (const team of sides) {
      const side = el('div', 'b-over-side', box);
      side.dataset.team = team;
      const won = r.winner === team, draw = r.winner === -1;
      const title = el('div', 'b-over-title', side, draw ? 'DRAW' : (won ? 'VICTORY' : 'DEFEAT'));
      title.dataset.kind = draw ? 'draw' : (won ? 'win' : 'lose');
      el('div', 'b-over-who', side, this.duo ? this.o.players[team].name : (won ? 'The candles are yours.' : (draw ? 'Neither flame went out.' : 'Your king\'s candle went out.')));
      if (this.duo) {
        // each half speaks to its own player: their crowns, and a word on the other side's
        const cr = el('div', 'crowns crowns-lg', side);
        cr.innerHTML = crowns(r.crowns[team]);
        const theirs = r.crowns[1 - team];
        el('div', 'b-over-name', side, this.o.players[1 - team].name + ' took ' + theirs + (theirs === 1 ? ' crown' : ' crowns'));
      } else {
        const row = el('div', 'b-over-crowns', side);
        for (const t of [team, 1 - team]) {
          const cell = el('div', 'b-over-cell', row);
          cell.dataset.team = t;
          el('div', 'b-over-name', cell, t === 1 ? this.o.players[t].name : 'YOU');
          const cr = el('div', 'crowns crowns-lg', cell);
          cr.innerHTML = crowns(r.crowns[t]);
        }
      }
      const go = el('button', 'big', side, 'CONTINUE');
      go.addEventListener('click', () => this._done());
    }
    if (r.winner === -1) this.sfx.synth('chime', 1);
    else if (this.duo || r.winner === 0) {
      this.sfx.play('pack_perfect', 1, 0.9);
      this.sfx.synth('fanfare', 1);
    } else {
      this.sfx.synth('defeat', 1);
    }
  }

  _done() {
    if (this.closing) return;
    this.closing = true;
    this.sfx.play('card_select', 1, 0.6);
    const r = this.b.result;
    const stats = this.b.players.map((p) => ({ played: p.played, spent: p.spent }));
    this.destroy();
    this.o.onEnd({ ...r, stats, rival: this.o.players[1] });
  }

  destroy() {
    this.dead = true;
    cancelAnimationFrame(this.raf);
    this.root.removeEventListener('pointerdown', this._onDown);
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerup', this._onUp);
    window.removeEventListener('pointercancel', this._onUp);
    document.removeEventListener('visibilitychange', this._onVis);
    this.root.innerHTML = '';
  }
}

export function crowns(n) {
  let s = '';
  for (let i = 0; i < 3; i++) s += '<span class="crown" data-on="' + (i < n ? 1 : 0) + '">' + CROWN + '</span>';
  return s;
}

/** The notch and the home bar, as the page knows them. */
function safeInsets() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;visibility:hidden;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  const out = { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 };
  probe.remove();
  return out;
}

export { battleStats };
