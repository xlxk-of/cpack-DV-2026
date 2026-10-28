// THE COLLECTIONS, kept in the phone's own storage (localStorage): nothing is sent anywhere and there is no account.
// One phone can be shared: every wizard who plays on it has a profile of their own, with their own cards, decks,
// trophies and packs, and the phone remembers which of them is playing. A Duo Duel pits two of them against each other.
//
// A collection from the pack opener before there was an arena (wick.collection.v1) becomes the first profile, every
// card in it kept.
const OLD_KEY = 'wick.collection.v1';
const INDEX_KEY = 'wick.profiles.v2';
const PROFILE = (id) => 'wick.profile.' + id;

const EMPTY = {
  name: 'WIZARD',
  owned: {},                       // card id -> copies
  looks: {},                       // card id -> the level tint it wears (when not its own)
  artPicks: {},                    // card id -> 'classic' | 'alt' | 'anim'
  unlocked: { scenes: [], anims: [] },   // what Mythic Packs have given
  opened: {},                      // pack key -> packs opened
  best: { avg: null },             // the straightest rip so far
  gold: 150,
  embers: 5,
  trophies: 0,
  bestTrophies: 0,
  decks: [[], [], []],
  deckAt: 0,
  slots: [null, null, null, null], // {key, lit: when the candle was lit (ms) or 0} or null
  crowns: 0,                       // toward the Crown Pack
  freeAt: 0,                       // when the next free pack is ready (ms)
  pending: null,                   // a pack being opened: kept until its cards are in, so a closed app loses nothing
  stats: { battles: 0, wins: 0, losses: 0, draws: 0, three: 0, duels: 0 },
  rivals: {},                      // another profile's id -> {w, l, d} in Duo Duels
  intro: false,                    // the welcome has been seen
};

function fresh() {
  return structuredClone(EMPTY);
}

/** A profile as stored, with anything a later version added filled in. */
function complete(got) {
  const s = { ...fresh(), ...got };
  s.unlocked = { scenes: [], anims: [], ...(got.unlocked || {}) };
  s.best = { avg: null, ...(got.best || {}) };
  s.stats = { ...EMPTY.stats, ...(got.stats || {}) };
  s.decks = [0, 1, 2].map((i) => (Array.isArray(got.decks) && Array.isArray(got.decks[i]) ? got.decks[i].slice(0, 8) : []));
  s.slots = [0, 1, 2, 3].map((i) => (Array.isArray(got.slots) && got.slots[i] ? got.slots[i] : null));
  return s;
}

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { /* a full or private-mode store: the collection simply does not carry over */ }
}

/** The list of wizards on this phone: {active, list: [{id, name}]}. Made on first use. */
export function index() {
  let idx = read(INDEX_KEY);
  if (idx && Array.isArray(idx.list) && idx.list.length) return idx;
  const old = read(OLD_KEY);
  const first = old && old.owned ? { ...complete(old), intro: false, migrated: true } : fresh();
  idx = { active: 'p1', list: [{ id: 'p1', name: first.name }] };
  write(PROFILE('p1'), first);
  write(INDEX_KEY, idx);
  return idx;
}

export function saveIndex(idx) {
  write(INDEX_KEY, idx);
}

export function load(id) {
  const got = read(PROFILE(id));
  return got ? complete(got) : fresh();
}

export function save(id, state) {
  write(PROFILE(id), state);
  const idx = index();
  const row = idx.list.find((p) => p.id === id);
  if (row && row.name !== state.name) {
    row.name = state.name;
    saveIndex(idx);
  }
}

export function create(name) {
  const idx = index();
  let n = idx.list.length + 1;
  while (idx.list.some((p) => p.id === 'p' + n)) n++;
  const id = 'p' + n;
  const state = { ...fresh(), name };
  write(PROFILE(id), state);
  idx.list.push({ id, name });
  saveIndex(idx);
  return id;
}

export function remove(id) {
  const idx = index();
  if (idx.list.length <= 1) return;
  idx.list = idx.list.filter((p) => p.id !== id);
  if (idx.active === id) idx.active = idx.list[0].id;
  try { localStorage.removeItem(PROFILE(id)); } catch (e) { /* nothing to do */ }
  saveIndex(idx);
}

/** Throws one wizard's collection away and starts them again. */
export function wipe(id) {
  const name = load(id).name;
  write(PROFILE(id), { ...fresh(), name });
}

export function toText(state) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

export function fromText(text) {
  const got = JSON.parse(decodeURIComponent(escape(atob(text.trim()))));
  if (typeof got !== 'object' || !got.owned) throw new Error('not a WICK collection');
  return complete(got);
}

export function totalCards(state) {
  return Object.values(state.owned).reduce((a, b) => a + b, 0);
}
