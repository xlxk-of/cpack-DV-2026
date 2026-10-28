// The collection, kept in the phone's own storage (localStorage): nothing is sent anywhere and there is no account.
// It is also what EXPORT and IMPORT hand over, so a collection can be carried to another phone as a line of text.
const KEY = 'wick.collection.v1';

const EMPTY = {
  owned: {},                       // card id -> copies
  looks: {},                       // card id -> the level tint it wears (when not its own)
  artPicks: {},                    // card id -> 'classic' | 'alt' | 'anim'
  unlocked: { scenes: [], anims: [] },   // what Mythic Packs have given
  opened: {},                      // pack key -> packs opened
  best: { avg: null },             // the straightest rip so far
};

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(EMPTY);
    const got = JSON.parse(raw);
    return {
      ...structuredClone(EMPTY), ...got,
      unlocked: { scenes: [], anims: [], ...(got.unlocked || {}) },
      best: { avg: null, ...(got.best || {}) },
    };
  } catch (e) {
    return structuredClone(EMPTY);
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) { /* a full or private-mode store: the collection simply does not carry over */ }
}

export function wipe() {
  localStorage.removeItem(KEY);
}

export function toText(state) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

export function fromText(text) {
  const got = JSON.parse(decodeURIComponent(escape(atob(text.trim()))));
  if (typeof got !== 'object' || !got.owned) throw new Error('not a WICK collection');
  return { ...structuredClone(EMPTY), ...got, unlocked: { scenes: [], anims: [], ...(got.unlocked || {}) } };
}

export function totalCards(state) {
  return Object.values(state.owned).reduce((a, b) => a + b, 0);
}
