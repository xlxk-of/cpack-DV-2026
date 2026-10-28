// The rules of opening and collecting, taken from the game (scripts/autoload/GameState.gd) and kept the same, except
// that here EVERY pack is free and unlimited: this is the pack opener, not the duel.
export const PACK_SIZE = 5;
export const LEVEL_NEED = [1, 10, 50, 100, 250, 500];   // copies for levels 1..6
export const LEVEL7_NEED = 1000;
export const RANKED_COPIES = [2, 3, 5, 6, 7, 8, 9, 10];
export const RANKED_TIER_NAMES = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'TOP 100'];
export const LEGENDARY_COPIES = 10;
export const MYTHIC_COPIES = 10;
export const MYTHIC_ANIM_CHANCE = 0.12;
export const MYTHIC_SKIN_CHANCE = 0.0;   // no wizards here: a Mythic pack gives pictures for cards
export const LOOK_NAMES = ['', 'PLAIN', 'STONE GLOW', 'GOLD', 'PLATINUM', 'HOLOFOIL', 'PRISMATIC', 'LIVING PRISM'];

// Every kind of pack the opener offers, in the order they are shown.
export const PACKS = [
  { key: 'starter', name: 'STARTER PACK', art: 'pack_full.png', blurb: '5 cards, one copy of each.' },
  ...RANKED_COPIES.map((n, t) => ({
    key: 'ranked:' + t,
    name: 'RANKED PACK · ' + RANKED_TIER_NAMES[t],
    art: 'pack_ranked_' + t + '.png',
    blurb: '5 cards, 1 to ' + n + ' copies of each.',
  })),
  { key: 'legendary', name: 'LEGENDARY BOOSTER', art: 'pack_legendary.png', blurb: '5 cards, ' + LEGENDARY_COPIES + ' copies of each: 50 cards.' },
  { key: 'mythic', name: 'MYTHIC PACK', art: 'pack_mythic.png', blurb: '5 cards, 1 to ' + MYTHIC_COPIES + ' copies of each, and always one cosmetic.' },
];

export function packInfo(key) {
  return PACKS.find((p) => p.key === key) || PACKS[0];
}

export function packTier(key) {
  return key.startsWith('ranked:') ? Math.min(RANKED_COPIES.length - 1, Math.max(0, parseInt(key.slice(7), 10))) : -1;
}

/** Most copies one card of this pack can come in (the least is 1, or the same for a Legendary). */
export function copiesMax(key) {
  if (key === 'legendary') return LEGENDARY_COPIES;
  if (key === 'mythic') return MYTHIC_COPIES;
  const t = packTier(key);
  return t >= 0 ? RANKED_COPIES[t] : 1;
}

/** A card's level from the copies owned: 1/10/50/100/250/500, and 1000 for the few that have a seventh. */
export function levelFor(copies, card) {
  if (copies <= 0) return 0;
  if (card && card.anim && copies >= LEVEL7_NEED) return 7;
  let lv = 0;
  for (let i = 0; i < LEVEL_NEED.length; i++) if (copies >= LEVEL_NEED[i]) lv = i + 1;
  return lv;
}

export function maxLevel(card) {
  return card && card.anim ? 7 : 6;
}

export function levelNeed(lv, card) {
  if (lv >= 7) return LEVEL7_NEED;
  return LEVEL_NEED[Math.max(0, Math.min(LEVEL_NEED.length - 1, lv - 1))];
}

/** Copies still to go for the next level, and which level that is ({} when the card is at its top). */
export function nextLevel(copies, card) {
  const lv = levelFor(copies, card);
  const top = maxLevel(card);
  if (lv >= top) return null;
  const need = levelNeed(lv + 1, card);
  return { level: lv + 1, need, left: need - copies };
}

function pick(list, rng) {
  return list[Math.floor(rng() * list.length)];
}

/**
 * Opens one pack. `owned` is {id: copies} and is NOT changed here; the rows say what to add.
 * Returns {rows, cosmetic}: a row per card shown ({id, copies, before, after, level, levelBefore, isNew}), and for a
 * Mythic pack the one cosmetic it always holds ({kind: 'scene'|'anim', id, name}) or null.
 */
export function openPack(key, cards, owned, unlocked, rng = Math.random) {
  const pool = cards.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const most = copiesMax(key);
  const rows = pool.slice(0, PACK_SIZE).map((card) => {
    const before = owned[card.id] || 0;
    const copies = key === 'legendary' ? most : 1 + Math.floor(rng() * most);
    return {
      id: card.id,
      copies,
      before,
      after: before + copies,
      levelBefore: levelFor(before, card),
      level: levelFor(before + copies, card),
      isNew: before === 0,
    };
  });
  let cosmetic = null;
  if (key === 'mythic') cosmetic = rollCosmetic(cards, owned, unlocked, rng);
  return { rows, cosmetic };
}

/**
 * The one cosmetic of a Mythic Pack. The rare one is the ANIMATION of a card that has one; else a card's level 6
 * SCENE. Cards you own come first. A cosmetic changes a card's PICTURE only: never its level, its stars or its tint.
 */
export function rollCosmetic(cards, owned, unlocked, rng = Math.random, want = null) {
  const mineFirst = (list) => {
    const mine = list.filter((c) => (owned[c.id] || 0) > 0);
    return mine.length ? mine : list;
  };
  const pools = {
    anim: mineFirst(cards.filter((c) => c.anim && !hasAnim(c, owned, unlocked))),
    scene: mineFirst(cards.filter((c) => c.alt && !hasScene(c, owned, unlocked))),
  };
  const kind = want || (rng() < MYTHIC_ANIM_CHANCE ? 'anim' : 'scene');
  for (const k of [kind, 'scene', 'anim']) {
    if (pools[k] && pools[k].length) {
      const card = pick(pools[k], rng);
      return { kind: k, id: card.id, name: card.name };
    }
  }
  return null;   // everything is unlocked already
}

/** The card may show its level 6 scene: it reached level 6, or a Mythic Pack gave the scene (or the animation). */
export function hasScene(card, owned, unlocked) {
  if (!card || !card.alt) return false;
  if (levelFor(owned[card.id] || 0, card) >= 6) return true;
  return unlocked.scenes.includes(card.id) || unlocked.anims.includes(card.id);
}

/** The card's scene may MOVE: it is one of the cards that have an animation, by level 7 or out of a Mythic Pack. */
export function hasAnim(card, owned, unlocked) {
  if (!card || !card.anim) return false;
  return levelFor(owned[card.id] || 0, card) >= 7 || unlocked.anims.includes(card.id);
}

/** Which picture a card shows: 'classic', 'alt' (its scene) or 'anim' (the scene, moving). */
export function cardArt(card, owned, unlocked, picks) {
  const pick = picks[card.id] || '';
  if (pick === 'classic' || !hasScene(card, owned, unlocked)) return 'classic';
  if (hasAnim(card, owned, unlocked) && pick !== 'alt') return 'anim';
  return 'alt';
}

export const SCHOOL_COLORS = {
  fire: '#ff8c26', frost: '#73ccff', storm: '#d9ccff',
  shadow: '#9e59d9', arcane: '#bf80ff', holy: '#ffeb8c',
};
