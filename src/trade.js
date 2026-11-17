// THE HARBOR MARKET: trading.
//
// Merchants — three traders with two offers each: swaps, trade-ups (several of a lesser card for one better),
// trade-downs, and cards bought or sold for gold. Their stock is rolled from a seed and changes after every duel
// (or for a fee).
//
// Friends — there is no server, so a trade between two players travels as text. You make an offer ("my X for your
// Y"): X leaves your collection and you get a code to send. Your friend pastes it; if they hold Y the swap happens on
// their side and they get a receipt code to send back, which gives you Y. An offer nobody took can be cancelled and
// X comes home. Codes carry a checksum, so a mistyped one is refused rather than misread.
import { CARD, CARDS, RARITIES, RARITY_ORDER, byRarity } from './cards.js';
import { S, save, owned, addCard, removeCard, deckReady } from './save.js';
import { $, h, btn, chip, toast, refreshBar, inspect } from './ui.js';
import { sfx } from './sfx.js';

const MERCHANTS = [
  { name: 'Pell the Pearl-Fence', line: '“Fell off the back of a whale. Honest.”' },
  { name: 'Sister Brine', line: '“The tide provides. I merely redistribute.”' },
  { name: 'Captain Oddfin', line: '“Everything aboard is for sale. Including aboard.”' },
];
const REROLL = 30;

let root, tab = 'merchants', draft = { give: null, want: null }, read = null;

export function mount(el) { root = el; }

export function show() {
  root.replaceChildren(
    h('div.tabs', {}, [['merchants', 'Merchants'], ['friends', 'Trade with a friend']].map(([k, label]) =>
      h('button.tab' + (tab === k ? '.on' : ''), { onclick: () => { tab = k; sfx.play('tap'); show(); } }, label))),
    tab === 'merchants' ? merchants() : friends());
  refreshBar();
}

// ---------------------------------------------------------------------------------------------------- merchants

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Today's six offers: rolled once per seed and kept, so they do not shift as the collection changes. */
function stock() {
  if (S.market.offers) return S.market.offers;
  const r = rng(S.market.seed), pick = (arr) => arr[Math.floor(r() * arr.length)];
  const spare = (c) => owned(c.id) - RARITIES[c.rarity].deckMax;
  // something the player can actually hand over, if there is one; otherwise anything of that rarity
  const giveOf = (rar, n) => {
    const pool = byRarity(rar), can = pool.filter((c) => owned(c.id) >= n), extra = can.filter((c) => spare(c) >= n);
    return pick(extra.length ? extra : (can.length ? can : pool));
  };
  // something the player is short of
  const getOf = (rar, not) => {
    const pool = byRarity(rar).filter((c) => c.id !== not);
    if (!pool.length) return null;
    const least = Math.min(...pool.map((c) => owned(c.id)));
    const want = pool.filter((c) => owned(c.id) === least);
    return pick(r() < 0.7 ? want : pool);
  };
  const tier = (bias) => RARITY_ORDER[Math.min(4, Math.floor(Math.pow(r(), bias) * 5))];
  const makers = {
    swap() {
      const rar = tier(1.9);
      const g = giveOf(rar, 1), w = getOf(rar, g.id);
      return w ? { give: { id: g.id, n: 1 }, get: { id: w.id, n: 1 } } : null;
    },
    up() {
      const lo = Math.min(3, Math.floor(Math.pow(r(), 1.5) * 4)), rarLo = RARITY_ORDER[lo], rarHi = RARITY_ORDER[lo + 1];
      const n = lo === 3 ? 2 : 3;
      const g = giveOf(rarLo, n), w = getOf(rarHi, null);
      return { give: { id: g.id, n }, get: { id: w.id, n: 1 } };
    },
    down() {
      const hi = 1 + Math.floor(r() * 3), g = giveOf(RARITY_ORDER[hi], 1), w = getOf(RARITY_ORDER[hi - 1], null);
      return { give: { id: g.id, n: 1 }, get: { id: w.id, n: 2 } };
    },
    sell() {
      const rar = tier(1.6), g = giveOf(rar, 1);
      return { give: { id: g.id, n: 1 }, get: { gold: Math.round(RARITIES[rar].gold * (0.8 + r() * 0.6) / 5) * 5 } };
    },
    buy() {
      const rar = RARITY_ORDER[1 + Math.min(3, Math.floor(Math.pow(r(), 2.4) * 4))], w = getOf(rar, null);
      return { give: { gold: Math.round(RARITIES[rar].gold * (2 + r()) / 10) * 10 }, get: { id: w.id, n: 1 } };
    },
  };
  const plan = ['swap', 'up', 'sell', 'up', 'buy', r() < 0.5 ? 'down' : 'swap'];
  const offers = [], seen = new Set();
  for (const kind of plan) {
    let o = null;
    for (let tries = 0; tries < 8 && !o; tries++) {
      const c = makers[kind]() || makers.sell();
      const key = JSON.stringify([c.give, c.get]);
      if (!seen.has(key)) { seen.add(key); o = c; }
    }
    offers.push({ ...(o || makers.sell()), kind, done: false });
  }
  S.market.offers = offers;
  save();
  return offers;
}

const has = (side) => (side.gold ? S.gold >= side.gold : owned(side.id) >= side.n);

function sideEl(side) {
  if (side.gold) return h('div.side.gold', {}, h('i.coin'), h('b', {}, String(side.gold)), ' gold');
  return h('div.side', {}, chip(side.id, side.n), h('small', {}, `you hold ${owned(side.id)}`));
}

function merchants() {
  const offers = stock();
  return h('div.market', {},
    MERCHANTS.map((m, mi) => h('section.merchant', {},
      h('h3', {}, m.name), h('p.note', {}, m.line),
      offers.slice(mi * 2, mi * 2 + 2).map((o) => h('div.offer' + (o.done ? '.done' : ''), {},
        h('div.offer-sides', {}, h('span.lbl', {}, 'You give'), sideEl(o.give), h('span.arrow', {}, '→'), h('span.lbl', {}, 'You get'), sideEl(o.get)),
        o.done ? h('span.note', {}, 'Done') : btn('Trade', () => accept(o), has(o.give) ? '' : 'off'))))),
    h('div.row.center', {}, btn(`New stock  <i class="coin"></i> ${REROLL}`, reroll, S.gold >= REROLL ? 'ghost' : 'ghost off')),
    h('p.note.center', {}, 'The merchants bring new stock after every duel.'));
}

function accept(o) {
  if (o.done) return;
  if (!has(o.give)) { sfx.play('error'); toast(o.give.gold ? 'Not enough gold' : `You need ${o.give.n} × ${CARD[o.give.id].name}`); return; }
  const ready = deckReady();
  if (o.give.gold) S.gold -= o.give.gold; else removeCard(o.give.id, o.give.n);
  if (o.get.gold) S.gold += o.get.gold; else addCard(o.get.id, o.get.n);
  o.done = true;
  save();
  sfx.play(o.get.gold ? 'coin' : 'shimmer');
  toast(o.get.gold ? `Sold for ${o.get.gold} gold` : `${o.get.n > 1 ? o.get.n + ' × ' : ''}${CARD[o.get.id].name} joins your collection`, 'good');
  if (ready && !deckReady()) toast('That card was in your deck: the deck is now short');
  show();
}

function reroll() {
  if (S.gold < REROLL) { sfx.play('error'); toast('Not enough gold'); return; }
  S.gold -= REROLL;
  S.market = { seed: Math.floor(Math.random() * 1e9), offers: null };
  save();
  sfx.play('coin');
  show();
}

// ---------------------------------------------------------------------------------------------------- friends

const SALT = 'nacre-harbor-1';
function checksum(str) {
  let x = 2166136261;
  for (let i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); }
  return (x >>> 0).toString(36);
}
export function encode(obj) {
  const body = JSON.stringify(obj);
  return 'NACRE-' + btoa(body).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') + '.' + checksum(body + SALT);
}
export function decode(code) {
  const m = /NACRE-([A-Za-z0-9_-]+)\.([a-z0-9]+)/.exec(code || '');
  if (!m) return null;
  try {
    const body = atob(m[1].replace(/-/g, '+').replace(/_/g, '/'));
    if (checksum(body + SALT) !== m[2]) return null;
    const o = JSON.parse(body);
    return CARD[o.g] && CARD[o.w] && o.n ? o : null;
  } catch (e) { return null; }
}

function makeOffer() {
  const { give, want } = draft;
  if (!give || !want) { toast('Choose the card you give and the card you want'); return; }
  if (give === want) { toast('That would be trading a card for itself'); return; }
  if (!owned(give)) { toast('You no longer hold that card'); return; }
  const ready = deckReady();
  const n = Math.random().toString(36).slice(2, 10);
  removeCard(give, 1);                                  // held by the harbour-master until the trade is done or cancelled
  S.offers.push({ n, g: give, w: want, code: encode({ k: 'offer', n, from: S.me, g: give, w: want }) });
  draft = { give: null, want: null };
  save();
  sfx.play('shimmer');
  toast('Offer made: send the code to your friend', 'good');
  if (ready && !deckReady()) toast('That card was in your deck: the deck is now short');
  show();
}

function cancelOffer(o) {
  S.offers = S.offers.filter((x) => x !== o);
  addCard(o.g, 1);
  delete S.fresh[o.g];
  save();
  toast(`${CARD[o.g].name} is back in your collection`);
  show();
}

function readCode(text) {
  const o = decode(text);
  read = null;
  if (!o) { sfx.play('error'); toast('That is not a trade code (or it was copied incompletely)'); return; }
  if (o.k === 'receipt') {
    const mine = S.offers.find((x) => x.n === o.n);
    if (!mine) { sfx.play('error'); toast('No open offer of yours matches that receipt'); return; }
    S.offers = S.offers.filter((x) => x !== mine);
    addCard(mine.w, 1);
    save();
    sfx.play('shimmer');
    toast(`Trade complete: ${CARD[mine.w].name} is yours`, 'good');
    show();
    setTimeout(() => inspect(mine.w), 300);
    return;
  }
  if (o.from === S.me) { toast('That is your own offer: send it to a friend'); return; }
  if (S.redeemed.includes(o.n)) { toast('You have already taken that offer'); return; }
  read = o;
  show();
}

function takeOffer() {
  const o = read;
  if (!o) return;
  if (!owned(o.w)) { sfx.play('error'); toast(`You do not hold ${CARD[o.w].name}`); return; }
  const ready = deckReady();
  removeCard(o.w, 1);
  addCard(o.g, 1);
  S.redeemed.push(o.n);
  S.receipts = S.receipts || [];
  S.receipts.unshift({ n: o.n, g: o.g, w: o.w, code: encode({ k: 'receipt', n: o.n, by: S.me, g: o.g, w: o.w }) });
  S.receipts = S.receipts.slice(0, 6);
  read = null;
  save();
  sfx.play('shimmer');
  toast(`${CARD[o.g].name} is yours. Send the receipt back so they get their card`, 'good');
  if (ready && !deckReady()) toast('That card was in your deck: the deck is now short');
  show();
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast('Copied'); }
  catch (e) { toast('Select the code and copy it by hand'); }
}

function codeBox(code) {
  return h('div.codebox', {}, h('textarea', { readOnly: true, rows: 2, value: code, onclick: (e) => e.target.select() }), btn('Copy', () => copy(code), 'mini'));
}

function picker(title, ids, done) {
  const box = h('div.modal', { onclick: (e) => { if (e.target === box) box.remove(); } },
    h('div.modal-box.wide', {}, h('h3', {}, title),
      h('div.pick-list', {}, ids.length ? ids.map((id) => chip(id, owned(id), () => { box.remove(); done(id); })) : h('p.note', {}, 'Nothing to choose from.')),
      btn('Cancel', () => box.remove(), 'ghost')));
  document.body.append(box);
}

function friends() {
  const slot = (label, id, onpick) => h('div.slot', {}, h('span.lbl', {}, label),
    id ? chip(id, null, onpick) : btn('Choose…', onpick, 'ghost'));
  const input = h('textarea.paste', { rows: 2, placeholder: 'Paste a friend’s offer code or receipt here' });
  return h('div.friends', {},
    h('section.merchant', {},
      h('h3', {}, 'Make an offer'),
      h('p.note', {}, 'Pick a card to give and the card you want for it. You get a code to send to a friend; your card waits at the harbour until they answer.'),
      h('div.offer-sides', {},
        slot('You give', draft.give, () => picker('Which card will you give?', CARDS.filter((c) => owned(c.id)).map((c) => c.id), (id) => { draft.give = id; show(); })),
        h('span.arrow', {}, '⇄'),
        slot('You want', draft.want, () => picker('Which card do you want?', CARDS.map((c) => c.id), (id) => { draft.want = id; show(); }))),
      btn('Create trade code', makeOffer, draft.give && draft.want ? '' : 'off')),

    S.offers.length ? h('section.merchant', {},
      h('h3', {}, 'Your open offers'),
      S.offers.map((o) => h('div.offer.col', {},
        h('div.offer-sides', {}, chip(o.g, 1), h('span.arrow', {}, '→'), chip(o.w, 1), btn('Cancel', () => cancelOffer(o), 'mini ghost')),
        codeBox(o.code)))) : null,

    h('section.merchant', {},
      h('h3', {}, 'Got a code?'),
      input,
      btn('Read it', () => readCode(input.value)),
      read ? h('div.offer.col.read', {},
        h('p', {}, 'Your friend offers:'),
        h('div.offer-sides', {}, h('span.lbl', {}, 'You get'), sideEl({ id: read.g, n: 1 }), h('span.arrow', {}, '←'), h('span.lbl', {}, 'You give'), sideEl({ id: read.w, n: 1 })),
        h('div.row', {}, btn('Accept the trade', takeOffer, owned(read.w) ? '' : 'off'), btn('No thanks', () => { read = null; show(); }, 'ghost'))) : null),

    (S.receipts || []).length ? h('section.merchant', {},
      h('h3', {}, 'Receipts to send back'),
      h('p.note', {}, 'Your friend needs the receipt to collect their side of the trade.'),
      S.receipts.map((x) => h('div.offer.col', {}, h('div.offer-sides', {}, h('span.lbl', {}, 'Got'), chip(x.g, null), h('span.lbl', {}, 'for'), chip(x.w, null)), codeBox(x.code)))) : null);
}
