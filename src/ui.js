// Small things every screen uses: building DOM, toasts, the shared bar, and the card inspector.
import { CARD, RARITIES, KEYWORDS, keywordsOf } from './cards.js';
import { cardEl, foilOn, askTilt } from './card.js';
import { S, owned, inDeck } from './save.js';
import { sfx } from './sfx.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));

/** `h('div.box#id', {onclick}, child, 'text')` */
export function h(spec, attrs = {}, ...kids) {
  const [tagAndId, ...classes] = spec.split('.');
  const [tag, id] = tagAndId.split('#');
  const el = document.createElement(tag || 'div');
  if (id) el.id = id;
  if (classes.length) el.className = classes.join(' ');
  for (const k in attrs) {
    const v = attrs[k];
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') for (const p in v) el.style.setProperty(p, v[p]);
    else if (k in el && k !== 'list') el[k] = v;
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) el.append(kid);
  return el;
}

export function toast(msg, kind = '') {
  const t = h('div.toast' + (kind ? '.' + kind : ''), {}, msg);
  $('#toasts').append(t);
  setTimeout(() => t.classList.add('gone'), 2200);
  setTimeout(() => t.remove(), 2700);
}

export function refreshBar() {
  $('#bar-gold').textContent = S.gold;
  $('#bar-packs').textContent = (S.packs.tide || 0) + (S.packs.abyss || 0);
}

/** A button that makes the tap sound. */
export function btn(label, onclick, cls = '') {
  return h('button.btn' + (cls ? '.' + cls.split(' ').join('.') : ''), { onclick: (e) => { sfx.play('tap'); onclick(e); }, html: label });
}

/** A small card picture with its name: used in lists (deck, trades). */
export function chip(id, n = null, onclick = null) {
  const def = CARD[id];
  return h('button.chip.r-' + def.rarity, { onclick: onclick || (() => inspect(id)), title: def.name },
    h('span.chip-cost', {}, String(def.cost)),
    h('img', { src: `art/${id}_s.webp`, alt: '', loading: 'lazy' }),
    h('span.chip-name', {}, def.name),
    n !== null ? h('span.chip-n', {}, '×' + n) : null);
}

// ---------------------------------------------------------------------------------------------------- the inspector

/** Show one card large, with its foil alive. `actions(close)` may return buttons to put under it. */
export function inspect(id, actions = null) {
  const def = CARD[id], rar = RARITIES[def.rarity], box = $('#inspect');
  askTilt();
  const close = () => { box.hidden = true; box.replaceChildren(); };
  const card = cardEl(id);
  const render = () => {
    const kws = keywordsOf(def);
    const side = h('div.insp-side', {},
      h('div.insp-rar', { style: { color: rar.color } }, rar.name + (rar.foil.length ? ' · ' + foilWords(rar) : '')),
      h('h2', {}, def.name),
      h('p.insp-own', {}, owned(id) ? `You own ${owned(id)} · ${inDeck(id)} in your deck` : 'You do not own this card yet'),
      kws.map((k) => h('p.insp-kw', { html: `<b>${KEYWORDS[k].name}</b> — ${KEYWORDS[k].text}` })),
      def.text ? h('p.insp-flavor', {}, def.flavor) : null,
      h('div.insp-actions', {}, actions ? actions(close, render) : null, btn('Close', close, 'ghost')));
    box.replaceChildren(h('div.insp-stage', { onclick: (e) => { if (e.target === e.currentTarget) close(); } }, card), side);
  };
  box.hidden = false;
  box.onclick = (e) => { if (e.target === box) close(); };
  render();
  foilOn(card, { sway: true });
  sfx.play('card_select');
  delete S.fresh[id];
}

function foilWords(rar) {
  const names = { shine: 'shine', holo: 'holo', glitter: 'glitter', oil: 'oil-slick', prism: 'prism' };
  const w = rar.foil.map((f) => names[f]);
  if (rar.layers) w.unshift('parallax');
  return w.join(' + ') + ' foil';
}

/** "Are you sure?" */
export function confirmBox(text, yes = 'Yes', no = 'No') {
  return new Promise((ok) => {
    const box = h('div.modal', {}, h('div.modal-box', {}, h('p', {}, text),
      h('div.row', {}, btn(yes, () => { box.remove(); ok(true); }), btn(no, () => { box.remove(); ok(false); }, 'ghost'))));
    document.body.append(box);
  });
}
