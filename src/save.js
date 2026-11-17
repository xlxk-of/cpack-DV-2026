// What the player owns, kept in the browser's own storage. Nothing leaves the device.
import { CARD, CARDS, RARITIES, STARTER_DECK, DECK_SIZE } from './cards.js';

const KEY = 'nacre.save.v1';

function fresh() {
  const cards = {};
  for (const id of STARTER_DECK) cards[id] = (cards[id] || 0) + 1;
  return {
    v: 1, gold: 150, packs: { tide: 3, abyss: 1 }, cards, deck: STARTER_DECK.slice(), wins: {}, fresh: {},
    stats: { played: 0, won: 0, opened: 0 }, pity: 0, lastFree: 0,
    market: { seed: Math.floor(Math.random() * 1e9), taken: [] },
    offers: [], redeemed: [], me: Math.random().toString(36).slice(2, 8),
  };
}

export let S = fresh();

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) S = Object.assign(fresh(), JSON.parse(raw));
  } catch (e) { /* a save that will not read is a new game */ }
  for (const id of Object.keys(S.cards)) if (!CARD[id]) delete S.cards[id];
  S.deck = S.deck.filter((id) => CARD[id]);
  return S;
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode: play on without saving */ }
}

export function wipe() { S = fresh(); save(); }

export const owned = (id) => S.cards[id] || 0;
export const inDeck = (id) => S.deck.reduce((n, x) => n + (x === id ? 1 : 0), 0);
export const deckMax = (id) => Math.min(owned(id), RARITIES[CARD[id].rarity].deckMax);
export const deckReady = () => S.deck.length === DECK_SIZE;
export const uniqueOwned = () => CARDS.filter((c) => owned(c.id) > 0).length;

export function addCard(id, n = 1) {
  if (!owned(id)) S.fresh[id] = 1;
  S.cards[id] = owned(id) + n;
}

/** Take copies away (a trade), and out of the deck too if it now holds more than are owned. */
export function removeCard(id, n = 1) {
  S.cards[id] = Math.max(0, owned(id) - n);
  if (!S.cards[id]) delete S.cards[id];
  while (inDeck(id) > owned(id)) S.deck.splice(S.deck.lastIndexOf(id), 1);
}

export function sortDeck() {
  S.deck.sort((a, b) => CARD[a].cost - CARD[b].cost || CARD[a].name.localeCompare(CARD[b].name));
}

/** Top the deck up to twenty with the best of what is owned. */
export function autoFill() {
  const pool = CARDS.slice().sort((a, b) => RARITIES[b.rarity].order - RARITIES[a.rarity].order || a.cost - b.cost);
  for (let pass = 0; pass < 2 && S.deck.length < DECK_SIZE; pass++) {
    for (const c of pool) {
      while (S.deck.length < DECK_SIZE && inDeck(c.id) < deckMax(c.id) && (pass === 1 || curveRoom(c))) S.deck.push(c.id);
    }
  }
  sortDeck();
}
// first pass keeps the deck from filling up with expensive cards
function curveRoom(c) {
  if (c.cost < 6) return true;
  return S.deck.filter((id) => CARD[id].cost >= 6).length < 5;
}
