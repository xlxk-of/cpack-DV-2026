// The twenty cards of NACRE, and what each rarity looks like.
//
// A card is a minion (it stays on the board and fights) or a spell (it happens once). The words on them:
//   Guard        enemies must attack this before anything else
//   Swift        can attack on the turn it is played
//   Nacre        the first damage it takes is ignored (a coat of mother-of-pearl)
//   Surface:     happens when the card is played from the hand
//   Last Breath: happens when the minion dies
//   Ebb:         happens at the end of each of its owner's turns
// Effects are small async functions that are handed the rules engine's toolkit (see engine.js `fx`).

export const RARITIES = {
  common:    { name: 'Common',    order: 0, deckMax: 2, gold: 15,   color: '#9fb3c8', layers: false, foil: [] },
  rare:      { name: 'Rare',      order: 1, deckMax: 2, gold: 50,   color: '#5fc8ff', layers: false, foil: ['shine'] },
  epic:      { name: 'Epic',      order: 2, deckMax: 2, gold: 150,  color: '#c58bff', layers: true,  foil: ['shine', 'holo'] },
  legendary: { name: 'Legendary', order: 3, deckMax: 1, gold: 500,  color: '#ffc95a', layers: true,  foil: ['shine', 'holo', 'glitter', 'oil'] },
  mythic:    { name: 'Mythic',    order: 4, deckMax: 1, gold: 1500, color: '#ff8ae0', layers: true,  foil: ['shine', 'holo', 'glitter', 'oil', 'prism'] },
};
export const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary', 'mythic'];

export const DECK_SIZE = 20;

export const CARDS = [
  // ------------------------------------------------------------------------------------------------ common
  { id: 'lantern_fry', name: 'Lantern Fry', rarity: 'common', type: 'minion', cost: 1, atk: 2, hp: 1,
    text: '', flavor: 'It thinks the light is its idea.' },
  { id: 'reef_sentinel', name: 'Reef Sentinel', rarity: 'common', type: 'minion', cost: 2, atk: 1, hp: 4, kw: ['guard'],
    text: '<b>Guard</b>', flavor: 'The reef does not move. Neither does he.' },
  { id: 'brine_bolt', name: 'Brine Bolt', rarity: 'common', type: 'spell', cost: 2, target: 'any',
    text: 'Deal 3 damage.', flavor: 'A cupful of ocean, thrown very hard.',
    ai: { kind: 'damage', n: 3 },
    async cast(fx, me, target) { await fx.damage(target, 3); } },
  { id: 'tidepool_mender', name: 'Tidepool Mender', rarity: 'common', type: 'minion', cost: 2, atk: 2, hp: 2,
    text: '<b>Surface:</b> Restore 3 health to your hero.', flavor: 'Salt in the wound, but the helpful kind.',
    async surface(fx, me) { await fx.heal(fx.hero(me), 3); } },
  { id: 'kelp_stalker', name: 'Kelp Stalker', rarity: 'common', type: 'minion', cost: 3, atk: 3, hp: 2, kw: ['swift'],
    text: '<b>Swift</b>', flavor: 'You see the kelp move. Then you don\'t see anything.' },
  { id: 'pearl_diver', name: 'Pearl Diver', rarity: 'common', type: 'minion', cost: 3, atk: 2, hp: 3,
    text: '<b>Surface:</b> Draw a card.', flavor: 'Forty fathoms down, and still window-shopping.',
    async surface(fx, me) { await fx.draw(me, 1); } },
  { id: 'driftwood_golem', name: 'Driftwood Golem', rarity: 'common', type: 'minion', cost: 4, atk: 4, hp: 5,
    text: '', flavor: 'Whatever the tide brings in, it keeps.' },

  // ------------------------------------------------------------------------------------------------ rare
  { id: 'glass_jelly', name: 'Glass Jelly', rarity: 'rare', type: 'minion', cost: 3, atk: 3, hp: 2, kw: ['nacre'],
    text: '<b>Nacre</b>', flavor: 'Strike it once and you only ring it.' },
  { id: 'siren_chorus', name: "Siren's Chorus", rarity: 'rare', type: 'spell', cost: 2, target: 'friendly_minion',
    text: 'Give a friendly minion +2/+2.', flavor: 'Three voices. You will only remember one.',
    ai: { kind: 'buff' },
    async cast(fx, me, target) { await fx.buff(target, 2, 2); } },
  { id: 'riptide', name: 'Riptide', rarity: 'rare', type: 'spell', cost: 4, target: null,
    text: 'Deal 2 damage to all enemy minions.', flavor: 'The sea takes back its loans all at once.',
    ai: { kind: 'aoe', n: 2 },
    async cast(fx, me) { await fx.damageAll(fx.minions(1 - me), 2); } },
  { id: 'stormcaller_ray', name: 'Stormcaller Ray', rarity: 'rare', type: 'minion', cost: 4, atk: 3, hp: 4,
    text: '<b>Surface:</b> Deal 2 damage to a random enemy minion.', flavor: 'It carries the weather on its back.',
    async surface(fx, me) {
      const foes = fx.minions(1 - me);
      if (foes.length) await fx.damage(fx.pick(foes), 2, { bolt: true });
    } },
  { id: 'abyssal_angler', name: 'Abyssal Angler', rarity: 'rare', type: 'minion', cost: 5, atk: 5, hp: 4,
    text: '<b>Last Breath:</b> Draw a card.', flavor: 'The light at the end of the tunnel has teeth.',
    async lastBreath(fx, me) { await fx.draw(me, 1); } },

  // ------------------------------------------------------------------------------------------------ epic
  { id: 'ghostship_revenant', name: 'Ghostship Revenant', rarity: 'epic', type: 'minion', cost: 5, atk: 4, hp: 3,
    text: '<b>Last Breath:</b> Return this to your hand.', flavor: 'Sunk nine times. Still on schedule.',
    async lastBreath(fx, me) { await fx.addToHand(me, 'ghostship_revenant'); } },
  { id: 'tidewitch', name: 'Tidewitch Nerai', rarity: 'epic', type: 'minion', cost: 4, atk: 3, hp: 5,
    text: '<b>Ebb:</b> Restore 2 health to your hero and deal 1 damage to the enemy hero.', flavor: 'She gives with one tide and takes with the next.',
    async ebb(fx, me) { await fx.heal(fx.hero(me), 2); await fx.damage(fx.hero(1 - me), 1, { bolt: true }); } },
  { id: 'coral_colossus', name: 'Coral Colossus', rarity: 'epic', type: 'minion', cost: 6, atk: 5, hp: 8, kw: ['guard'],
    text: '<b>Guard</b>', flavor: 'A thousand years of reef, and it finally stood up.' },
  { id: 'maelstrom', name: 'Maelstrom', rarity: 'epic', type: 'spell', cost: 7, target: null,
    text: 'Destroy all minions.', flavor: 'Everything goes down the same drain.',
    ai: { kind: 'wipe' },
    async cast(fx, me) { await fx.destroyAll(fx.minions(0).concat(fx.minions(1))); } },

  // ------------------------------------------------------------------------------------------------ legendary
  { id: 'kraken', name: 'Old Thousand-Arms', rarity: 'legendary', type: 'minion', cost: 7, atk: 6, hp: 7,
    text: '<b>Surface:</b> Deal 2 damage to all enemy minions.', flavor: 'Nobody has ever counted. Nobody has had the time.',
    async surface(fx, me) { await fx.damageAll(fx.minions(1 - me), 2); } },
  { id: 'pearl_sovereign', name: 'Marisol, Pearl Sovereign', rarity: 'legendary', type: 'minion', cost: 6, atk: 4, hp: 6,
    text: '<b>Surface:</b> Give your other minions +1/+1 and <b>Nacre</b>.', flavor: 'Her court is whoever is standing nearest.',
    async surface(fx, me, self) {
      for (const m of fx.minions(me)) if (m !== self) await fx.buff(m, 1, 1, { nacre: true });
    } },
  { id: 'sky_leviathan', name: 'Leviathan of the Sunken Sky', rarity: 'legendary', type: 'minion', cost: 8, atk: 8, hp: 8, kw: ['guard', 'nacre'],
    text: '<b>Guard</b>, <b>Nacre</b>', flavor: 'It swallowed a constellation and has been humming ever since.' },

  // ------------------------------------------------------------------------------------------------ mythic
  { id: 'drowned_star', name: 'Astra, the Drowned Star', rarity: 'mythic', type: 'minion', cost: 9, atk: 7, hp: 7, kw: ['nacre'],
    text: '<b>Nacre.</b> <b>Surface:</b> Deal 4 damage to all enemies.', flavor: 'She fell for a thousand years. She is not finished landing.',
    async surface(fx, me) { await fx.damageAll(fx.minions(1 - me).concat([fx.hero(1 - me)]), 4); } },
];

export const CARD = Object.fromEntries(CARDS.map((c) => [c.id, c]));
export const byRarity = (r) => CARDS.filter((c) => c.rarity === r);

export const KEYWORDS = {
  guard: { name: 'Guard', text: 'Enemies must attack this minion first.' },
  swift: { name: 'Swift', text: 'Can attack on the turn it is played.' },
  nacre: { name: 'Nacre', text: 'The first damage it takes is ignored.' },
  surface: { name: 'Surface', text: 'Happens when you play the card.' },
  lastBreath: { name: 'Last Breath', text: 'Happens when the minion dies.' },
  ebb: { name: 'Ebb', text: 'Happens at the end of each of your turns.' },
};

/** Which keyword notes a card needs explaining. */
export function keywordsOf(card) {
  const out = [...(card.kw || [])];
  if (card.surface) out.push('surface');
  if (card.lastBreath) out.push('lastBreath');
  if (card.ebb) out.push('ebb');
  if (/Nacre/.test(card.text) && !out.includes('nacre')) out.push('nacre');
  return out;
}

// ---------------------------------------------------------------------------------------------------- the duellists

export const HERO_POWER = { name: 'Starspark', cost: 2, text: 'Deal 1 damage.' };

export const PLAYER_HERO = { id: 'hero_player', name: 'The Tidecaller' };

export const OPPONENTS = [
  { id: 'hero_brackwater', name: 'Old Brackwater', title: 'Ghost of the Shallows', level: 0, gold: 40, firstWin: { tide: 1 },
    blurb: 'A gentle first duel. He plays what he draws and forgets his spark.',
    deck: ['lantern_fry', 'lantern_fry', 'reef_sentinel', 'reef_sentinel', 'brine_bolt', 'brine_bolt', 'tidepool_mender', 'tidepool_mender',
      'kelp_stalker', 'kelp_stalker', 'pearl_diver', 'pearl_diver', 'driftwood_golem', 'driftwood_golem', 'glass_jelly', 'stormcaller_ray',
      'abyssal_angler', 'siren_chorus', 'riptide', 'coral_colossus'] },
  { id: 'hero_murk', name: 'Madame Murk', title: 'Reader of Tides', level: 1, gold: 70, firstWin: { tide: 2 },
    blurb: 'She has seen how this ends. Trades cleverly and wastes nothing.',
    deck: ['lantern_fry', 'lantern_fry', 'reef_sentinel', 'brine_bolt', 'brine_bolt', 'kelp_stalker', 'kelp_stalker', 'pearl_diver', 'pearl_diver',
      'glass_jelly', 'glass_jelly', 'siren_chorus', 'riptide', 'stormcaller_ray', 'stormcaller_ray', 'abyssal_angler', 'tidewitch', 'tidewitch',
      'ghostship_revenant', 'coral_colossus'] },
  { id: 'hero_king', name: 'The Drowned King', title: 'Lord of the Trench', level: 2, gold: 120, firstWin: { abyss: 1 },
    blurb: 'Every legend in the deep answers to him. Bring your best deck.',
    deck: ['lantern_fry', 'reef_sentinel', 'reef_sentinel', 'brine_bolt', 'brine_bolt', 'kelp_stalker', 'pearl_diver', 'glass_jelly', 'glass_jelly',
      'riptide', 'stormcaller_ray', 'abyssal_angler', 'tidewitch', 'ghostship_revenant', 'coral_colossus', 'maelstrom', 'kraken',
      'pearl_sovereign', 'sky_leviathan', 'drowned_star'] },
];

/** What a new player owns, and the deck they start with. */
export const STARTER_DECK = ['lantern_fry', 'lantern_fry', 'reef_sentinel', 'reef_sentinel', 'brine_bolt', 'brine_bolt',
  'tidepool_mender', 'tidepool_mender', 'kelp_stalker', 'kelp_stalker', 'pearl_diver', 'pearl_diver', 'driftwood_golem', 'driftwood_golem',
  'glass_jelly', 'glass_jelly', 'siren_chorus', 'siren_chorus', 'stormcaller_ray', 'stormcaller_ray'];
