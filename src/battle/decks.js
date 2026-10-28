// THE OTHER WIZARDS. Each rival plays a deck with a theme, and between them every card in the box turns up on the
// other side of the river sooner or later. Which rivals you meet, how well they play and how far their cards are
// levelled is set by your league: `from` is the first league a deck is met in, and the decks that fare best against
// the others (tools/simtest.mjs) are kept for the higher leagues.

export const RIVAL_DECKS = [
  { key: 'ember', name: 'EMBER CULT', school: 'fire', from: 0,
    cards: ['ember_sprite', 'inferno_golem', 'fire_totem', 'phoenix', 'fireball', 'pyroclasm', 'candlewick', 'wildfire'] },
  { key: 'frost', name: 'FROST CHOIR', school: 'frost', from: 0,
    cards: ['sentinel', 'bone_knight', 'thunder_roc', 'frost_shard', 'icicle_volley', 'snowman_decoy', 'glacier_wall', 'abs_zero'] },
  { key: 'storm', name: 'STORM RIDERS', school: 'storm', from: 3,
    cards: ['thunder_roc', 'ember_sprite', 'bone_knight', 'spark', 'chain', 'tempest', 'cyclone', 'tailwind'] },
  { key: 'grave', name: 'GRAVECALLERS', school: 'shadow', from: 0,
    cards: ['bone_knight', 'inferno_golem', 'ember_sprite', 'cursed_blast', 'curse_rot', 'grave_hand', 'corpse_explosion', 'dread_lantern'] },
  { key: 'arcane', name: 'THE ARCANISTS', school: 'arcane', from: 3,
    cards: ['seraph', 'thunder_roc', 'mirror', 'missiles', 'mana_pump', 'gravity_well', 'bulwark', 'magic_injection'] },
  { key: 'paladin', name: 'PALADINS', school: 'holy', from: 1,
    cards: ['seraph', 'sentinel', 'bone_knight', 'holy_light', 'oath', 'verdict', 'vital_tincture', 'ice_ward'] },
  { key: 'trick', name: 'TRICKSTERS', school: 'arcane', from: 0,
    cards: ['ember_sprite', 'thunder_roc', 'phoenix', 'nightmare', 'time_warp', 'card_trick', 'spell_steal', 'blink'] },
  { key: 'siege', name: 'SIEGEWRIGHTS', school: 'storm', from: 4,
    cards: ['inferno_golem', 'phoenix', 'ember_sprite', 'tailwind', 'phoenix_feather', 'skybreaker', 'frost_shard', 'mirror_wand'] },
  { key: 'doom', name: 'DOOMSAYERS', school: 'fire', from: 2,
    cards: ['inferno_golem', 'sentinel', 'meteor', 'blood_pact', 'mana_font', 'cinder_trail', 'barrel', 'ember_sprite'] },
  { key: 'hollow', name: 'HOLLOW COURT', school: 'shadow', from: 1,
    cards: ['bone_knight', 'seraph', 'sentinel', 'shadow_bolt', 'soul_drain', 'soul_jar', 'rune_trap', 'snowblind'] },
  { key: 'lamp', name: 'LAMPLIGHTERS', school: 'holy', from: 2,
    cards: ['sentinel', 'phoenix', 'ember_sprite', 'fire_totem', 'purify', 'card_trick', 'shadow_bolt', 'lightning_rod'] },
];

// the decks a guest may borrow for a Duo Duel: the rivals' own, with friendlier names
export const PRESET_DECKS = RIVAL_DECKS;

const FIRST = ['Kezzar', 'Mother Tallow', 'Wexley', 'Grimwick', 'Old Ashcroft', 'Velvet', 'Brother Taper', 'Sister Sconce',
  'Lantern Jack', 'Hollow Bram', 'Morwen', 'Pip Cinder', 'Agatha Snuff', 'Corvin', 'Ysolde', 'Barnaby Gutter', 'Nell Drip',
  'The Chandler', 'Quill', 'Saffron', 'Ignatius', 'Rook', 'Thessaly', 'Ebb', 'Marrow'];
const LAST = ['the Kindled', 'of the Wick', 'Soot-Hand', 'the Unlit', 'Twice-Burnt', 'the Smug', 'Waxheart', 'of Low Flame',
  'the Dripping', 'Ninefingers', 'the Patient', 'Cold-Candle', 'the Lantern', 'Ashborn', ''];

/** How a rival of a league plays: skill 0..1 for ai.js, and the level of its cards. */
export function rivalFor(tier, rand = Math.random) {
  const pool = RIVAL_DECKS.filter((d) => d.from <= tier);
  const deck = pool[Math.floor(rand() * pool.length)];
  const first = FIRST[Math.floor(rand() * FIRST.length)];
  const last = LAST[Math.floor(rand() * LAST.length)];
  const level = [1, 1, 2, 2, 3, 3, 4, 4][tier] || 1;
  const levels = {};
  for (const id of deck.cards) levels[id] = Math.max(1, level + (rand() < 0.3 ? 1 : 0) - (rand() < 0.3 ? 1 : 0));
  return {
    name: (first + ' ' + last).trim(),
    deck: deck.cards.slice(),
    deckName: deck.name,
    school: deck.school,
    levels,
    skill: Math.min(1, 0.18 + tier * 0.11 + rand() * 0.06),
  };
}
