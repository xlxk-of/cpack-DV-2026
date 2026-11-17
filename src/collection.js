// THE COLLECTION and the deck. Every card in the game is on the wall: the ones you hold in colour with a count, the
// rest as shadows. Tap one to hold it up to the light. The deck (twenty cards; two of each at most, one of a
// Legendary or Mythic) is the strip above the wall.
import { CARDS, CARD, RARITIES, RARITY_ORDER, DECK_SIZE } from './cards.js';
import { cardEl, foilOn } from './card.js';
import { S, save, owned, inDeck, deckMax, sortDeck, autoFill, uniqueOwned } from './save.js';
import { $, h, btn, chip, inspect, toast } from './ui.js';
import { sfx } from './sfx.js';

let root, filter = 'all';

export function mount(el) { root = el; }

export function show() {
  root.replaceChildren(
    h('div.col-head', {},
      h('div.filters', {}, ['all', ...RARITY_ORDER].map((r) => h('button.filter' + (filter === r ? '.on' : ''), {
        onclick: () => { filter = r; sfx.play('tap'); show(); }, style: r === 'all' ? {} : { '--c': RARITIES[r].color } }, r === 'all' ? 'All' : RARITIES[r].name))),
      h('p.note', {}, `${uniqueOwned()} of ${CARDS.length} cards found`)),
    deckPanel(),
    grid());
}

function deckPanel() {
  sortDeck();
  const counts = {};
  for (const id of S.deck) counts[id] = (counts[id] || 0) + 1;
  const curve = Array(8).fill(0);
  for (const id of S.deck) curve[Math.min(7, CARD[id].cost)]++;
  const top = Math.max(1, ...curve);
  const full = S.deck.length === DECK_SIZE;
  return h('section.deck', {},
    h('div.deck-top', {},
      h('h3', {}, 'Your deck ', h('b' + (full ? '.ok' : '.short'), {}, `${S.deck.length}/${DECK_SIZE}`)),
      h('div.curve', { title: 'mana curve' }, curve.map((n, i) => h('i', { style: { '--h': (n / top * 100) + '%' }, 'data-c': i === 7 ? '7+' : String(i) }))),
      h('div.row', {},
        btn('Auto-fill', () => { autoFill(); save(); show(); }, 'mini'),
        btn('Clear', () => { S.deck = []; save(); show(); }, 'mini ghost'))),
    h('div.deck-list', {}, Object.keys(counts).length
      ? Object.keys(counts).map((id) => chip(id, counts[id], () => { takeOut(id); show(); }))
      : h('p.note', {}, 'Empty. Tap a card below and add it, or press Auto-fill.')),
    full ? null : h('p.note.warn', {}, `A deck needs ${DECK_SIZE} cards to duel. Tap a chip to take a card out; tap a card below to add it.`));
}

function grid() {
  const list = CARDS.filter((c) => filter === 'all' || c.rarity === filter);
  return h('div.grid', {}, list.map((c) => {
    const n = owned(c.id);
    const el = cardEl(c.id, { count: n, flat: true });
    if (!n) el.classList.add('missing');
    else foilOn(el);
    const cell = h('div.cell', { onclick: () => open(c.id) }, el,
      n ? h('div.pips', {}, Array.from({ length: Math.min(n, RARITIES[c.rarity].deckMax) }, (_, i) => h('i' + (i < inDeck(c.id) ? '.in' : '')))) : null,
      S.fresh[c.id] ? h('div.newtag', {}, 'NEW') : null);
    return cell;
  }));
}

function open(id) {
  inspect(id, (close, rerender) => {
    const n = owned(id), d = inDeck(id);
    return [
      n && d < deckMax(id) && S.deck.length < DECK_SIZE ? btn('Add to deck', () => { S.deck.push(id); save(); rerender(); show(); }) : null,
      d ? btn('Take out of deck', () => { takeOut(id); rerender(); show(); }, 'ghost') : null,
      n && d >= deckMax(id) ? h('p.note', {}, 'The deck already holds every copy it may.') : null,
      n && d < deckMax(id) && S.deck.length >= DECK_SIZE ? h('p.note', {}, 'The deck is full: take something out first.') : null,
    ];
  });
  save();
  if (root.querySelector('.cell .newtag')) show();      // looking at a card takes its NEW tag off
}

function takeOut(id) {
  const i = S.deck.lastIndexOf(id);
  if (i >= 0) S.deck.splice(i, 1);
  save();
}
