// THE CARDS IN THE ARENA. The duel in the game is fought in the first person, wizard against wizard; here it is fought
// across a river, with towers, the way a lane battler is. Every card keeps what it is and what it does -- a Phoenix
// still leaves an egg, a Nightmare still turns the enemy's hand face down, a Mirror Wand still copies the last card for
// one more mana -- but its numbers are the arena's: health and damage in the arena's own scale, distances in tiles
// (the arena is 18 x 30 of them), times in seconds.
//
// kind:   troop (walks and fights), building (stays where it lands and runs out), trap (waits, unseen by targeting),
//         spell (lands where it is aimed), ritual (no aim: it works on the whole field or on the wizard's hand)
// place:  own (the caster's half, and an opened pocket), any (anywhere), global (anywhere: where does not matter)
// needs:  friend (a summon of yours near the aim), troop (a troop of yours near the aim), foe (any enemy summon on the
//         field), so that a card with nothing to work on cannot be thrown away
// role:   what the computer wizard thinks a card is for (see ai.js)
//
// Health, damage, healing and shields grow with the card's level (LEVEL_STEP each level above 1); times and distances
// do not.

export const LEVEL_STEP = 0.06;
export const TOWER_SPELL = 0.35;      // spells hit a tower for this much of their damage

export function levelScale(lv) {
  return 1 + LEVEL_STEP * (Math.max(1, lv || 1) - 1);
}

// speeds, as the card sheet names them
export const SPEED = { slow: 0.65, medium: 0.95, fast: 1.35, veryfast: 1.7 };

export const BATTLE = {
  // ------------------------------------------------------------------ fire
  fireball: {
    kind: 'spell', place: 'any', role: 'spell-s', r: 1.6, dmg: 115, travel: 14, fx: 'fire',
    text: 'A quick blast. Small, cheap, and always on time.',
  },
  ember_sprite: {
    kind: 'troop', place: 'own', role: 'swarm', air: true, count: 3, hp: 60, dmg: 30, hit: 1.0, load: 0.3, range: 0.6,
    speed: SPEED.fast, targets: 'both', size: 0.32, burn: { dps: 10, t: 3, max: 3 },
    text: 'Three giggling cinders, floating. Every hit adds a burn stack (up to 3); each stack burns for 10 a second.',
  },
  pyroclasm: {
    kind: 'spell', place: 'any', role: 'spell-m', r: 3.0, dmg: 340, lob: 0.9, burn: { dps: 30, t: 6 }, fx: 'fire',
    text: 'A wide blast that leaves everything in it burning for 30 a second for 6 seconds.',
  },
  inferno_golem: {
    kind: 'troop', place: 'own', role: 'tank', hp: 3000, dmg: 180, hit: 1.8, load: 0.6, range: 0.9,
    speed: SPEED.slow, targets: 'buildings', size: 0.95, mass: 6, deathBlast: { dmg: 200, r: 2.5, burn: { dps: 25, t: 3 } },
    text: 'Walks for the towers and nothing else. When it falls apart it bursts, setting everything nearby burning.',
  },
  meteor: {
    kind: 'spell', place: 'any', role: 'spell-l', r: 3.5, dmg: 800, lob: 1.6, crush: 2.0, fx: 'meteor',
    text: 'A lobbed rock with a long flight. Destroys every enemy summon where it lands and smashes the rest. Lead your target.',
  },
  wildfire: {
    kind: 'spell', place: 'any', role: 'spell-m', r: 1.4, dmg: 330, travel: 11, hops: 4, hopRange: 5, fx: 'fire',
    text: 'A fireball. Each time it kills a summon it leaps to the nearest enemy within 5 tiles, up to 4 times.',
  },
  barrel: {
    kind: 'spell', place: 'own', role: 'spell-s', dmg: 220, roll: 11, rollSpeed: 7, r: 1.2, burst: 1.8, fx: 'barrel',
    text: 'Rolls a powder keg up the field from where it lands, hitting everything in its way. Bursts on towers and walls.',
  },
  cinder_trail: {
    kind: 'ritual', place: 'global', role: 'support', t: 6, dps: 25, burnT: 3, fx: 'fire',
    text: 'For 6 seconds your summons leave burning ground. Enemies that cross it burn for 25 a second.',
  },
  phoenix_feather: {
    kind: 'spell', place: 'any', role: 'boost', needs: 'troop', reach: 2.5, fx: 'fire',
    text: 'Tuck a feather into your summon nearest the aim: the first time it dies it rises again with half its health.',
  },
  candlewick: {
    kind: 'building', place: 'own', role: 'economy', hp: 1, life: 20, size: 0.4, school: 'fire', noScale: true,
    text: 'A candle that burns for 20 seconds. While it is lit your fire cards cost 1 less. One hit snuffs it out.',
  },
  fire_totem: {
    kind: 'building', place: 'own', role: 'defense', hp: 520, life: 22, dmg: 70, hit: 0.9, load: 0.4, range: 6,
    targets: 'both', proj: 9, size: 0.8,
    text: 'A carved totem that spits fireballs at anything that comes within 6 tiles, ground or air.',
  },
  phoenix: {
    kind: 'troop', place: 'own', role: 'air', air: true, hp: 640, dmg: 125, hit: 1.1, load: 0.3, range: 1.4,
    speed: SPEED.fast, targets: 'both', splash: 1.0, size: 0.65, egg: { hp: 180, t: 3 }, deathBlast: { dmg: 120, r: 2 },
    text: 'A blazing bird. When it dies it bursts and leaves an egg; if the egg lasts 3 seconds, the Phoenix is reborn.',
  },

  // ------------------------------------------------------------------ frost
  frost_shard: {
    kind: 'spell', place: 'any', role: 'spell-s', r: 1.5, dmg: 85, travel: 14, slow: 3, fx: 'frost',
    text: 'A shard of ice that hits and slows everything it lands on for 3 seconds.',
  },
  ice_ward: {
    kind: 'spell', place: 'any', role: 'support', r: 2.5, shield: 230, fx: 'frost',
    text: 'Every summon and tower of yours where it lands gains a 230 shield. Shield is lost before health.',
  },
  glacier_wall: {
    kind: 'ritual', place: 'global', role: 'support', shield: 420, fx: 'frost',
    text: 'Too big for the doorway: every tower of yours gains a 420 shield.',
  },
  sentinel: {
    kind: 'troop', place: 'own', role: 'tank', hp: 1900, dmg: 95, hit: 1.5, load: 0.5, range: 0.9,
    speed: SPEED.slow, targets: 'buildings', size: 0.75, mass: 4, slowOnHit: 2,
    text: 'Slow, patient and very hard to melt. Walks for the towers; each strike slows what it hits for 2 seconds.',
  },
  abs_zero: {
    kind: 'spell', place: 'any', role: 'spell-l', r: 3.5, dmg: 500, delay: 0.5, freeze: 4, slowTowers: 4, fx: 'frost',
    text: 'A freezing blast. Freezes every enemy summon in it solid for 4 seconds and slows enemy towers.',
  },
  icicle_volley: {
    kind: 'spell', place: 'any', role: 'spell-s', shards: 5, dmg: 90, r: 0.9, travel: 16, fx: 'frost',
    text: 'Five shards of ice. Close to your own king they land together; the further away, the wider they spread.',
  },
  snowblind: {
    kind: 'spell', place: 'any', role: 'disrupt', r: 3.5, t: 5, sight: 2, towerRange: 3.5, fx: 'snow',
    text: 'A blizzard for 5 seconds. Enemies in it cannot see further than 2 tiles; enemy towers in it barely see at all.',
  },
  snowman_decoy: {
    kind: 'building', place: 'own', role: 'defense', hp: 550, life: 20, size: 0.6, taunt: 6,
    text: 'A snowman in your hat. Enemy summons and totems within 6 tiles attack it before anything else.',
  },

  // ------------------------------------------------------------------ storm
  spark: {
    kind: 'spell', place: 'any', role: 'spell-s', reach: 2.5, dmg: 100, refund: 1, fx: 'storm',
    text: 'Instant lightning on the enemy nearest the aim. Refunds 1 mana if it connects.',
  },
  chain: {
    kind: 'spell', place: 'any', role: 'spell-m', reach: 2.5, dmg: 200, arc: 120, arcs: 4, arcRange: 4, fx: 'storm',
    text: 'Instant lightning that arcs on to 4 more enemy summons nearby.',
  },
  thunder_roc: {
    kind: 'troop', place: 'own', role: 'air', air: true, hp: 400, dmg: 150, hit: 1.3, load: 0.3, range: 1.4,
    speed: SPEED.fast, targets: 'both', size: 0.55, arcOnHit: { dmg: 45, r: 2.5 },
    text: 'Glass cannon with feathers. Its dives crackle: every hit arcs to one more enemy nearby.',
  },
  tempest: {
    kind: 'spell', place: 'any', role: 'spell-l', r: 3.0, dmg: 430, delay: 0.3, steal: 2, fx: 'storm',
    text: 'A lightning strike that blasts everything around the impact and steals 2 mana from the enemy.',
  },
  lightning_rod: {
    kind: 'building', place: 'own', role: 'disrupt', hp: 600, life: 25, size: 0.45, rod: 5,
    text: 'Enemy spells aimed within 5 tiles of the rod strike the rod instead.',
  },
  tailwind: {
    kind: 'ritual', place: 'global', role: 'support', t: 5, speedUp: 0.4, fx: 'storm',
    text: 'Your summons move 40% faster for 5 seconds.',
  },
  skybreaker: {
    kind: 'spell', place: 'any', role: 'spell-l', r: 2.5, dmg: 720, delay: 1.5, fx: 'storm',
    text: 'Marks the spot. After 1.5 seconds a colossal bolt lands there.',
  },
  cyclone: {
    kind: 'spell', place: 'any', role: 'spell-m', r: 1.5, dmg: 45, t: 5, drift: 1.6, push: 0.7, tick: 0.5, fx: 'wind',
    text: 'A tornado that drifts up the field for 5 seconds, hurling enemies back and hitting them twice a second.',
  },

  // ------------------------------------------------------------------ shadow
  shadow_bolt: {
    kind: 'spell', place: 'any', role: 'spell-s', r: 1.2, dmg: 190, travel: 15, heal: 80, fx: 'shadow',
    text: 'A bolt of mostly regret. Heals your weakest tower for 80.',
  },
  bone_knight: {
    kind: 'troop', place: 'own', role: 'mini', hp: 820, dmg: 95, hit: 1.2, load: 0.4, range: 0.8,
    speed: SPEED.medium + 0.15, targets: 'ground', size: 0.55, mass: 2,
    text: 'Formerly a paladin. Currently a lot lighter, and quicker on his feet for it.',
  },
  soul_drain: {
    kind: 'spell', place: 'any', role: 'spell-m', r: 2.2, dmg: 330, delay: 0.3, drain: 0.5, fx: 'shadow',
    text: 'Drains everything where it lands, and heals your weakest tower for half of what it took.',
  },
  curse_rot: {
    kind: 'spell', place: 'any', role: 'spell-m', r: 3.0, dps: 70, t: 4, tick: 0.5, fx: 'poison',
    text: 'A cloud of rot for 4 seconds: 70 damage a second to every enemy in it.',
  },
  rune_trap: {
    kind: 'trap', place: 'own', role: 'trap', dmg: 380, r: 1.5, poison: { dps: 30, t: 4 }, life: 30, trigger: 1.0,
    text: 'A rune under the floor. The first enemy to step on it is blasted and poisoned. Lasts 30 seconds.',
  },
  blood_pact: {
    kind: 'ritual', place: 'global', role: 'economy', pay: 220, mana: 4, fx: 'blood',
    text: 'Your king pays 220 health for 4 mana on the spot. It cannot break your own king.',
  },
  cursed_blast: {
    kind: 'spell', place: 'any', role: 'spell-m', r: 2.5, dmg: 80, travel: 12, curse: 8, fx: 'shadow',
    text: 'Curses every enemy summon in the blast for 8 seconds. A cursed summon that dies rises as your Ember Sprite.',
  },
  grave_hand: {
    kind: 'trap', place: 'own', role: 'trap', dmg: 60, root: 2.5, life: 30, trigger: 1.0,
    text: 'A skeletal hand under the floor grabs the first enemy to pass and holds it for 2.5 seconds.',
  },
  soul_jar: {
    kind: 'building', place: 'own', role: 'economy', hp: 320, life: 15, size: 0.5, jar: 0.25, jarMax: 700,
    text: 'Keeps a quarter of all the damage you deal. When it breaks or burns out it heals your weakest tower with it.',
  },
  nightmare: {
    kind: 'ritual', place: 'global', role: 'disrupt', t: 6, fx: 'shadow',
    text: 'The enemy\'s hand turns face down for 6 seconds. They throw blind.',
  },
  corpse_explosion: {
    kind: 'spell', place: 'any', role: 'boost', needs: 'troop', reach: 2.5, r: 3.0, dmg: 520, fx: 'shadow',
    text: 'Sacrifice your summon nearest the aim: it bursts for twice its remaining health, up to 520.',
  },
  dread_lantern: {
    kind: 'building', place: 'own', role: 'defense', hp: 600, life: 25, size: 0.5, dread: 5, dreadCut: 0.25,
    text: 'Enemies within 5 tiles of its light deal 25% less damage.',
  },

  // ------------------------------------------------------------------ arcane
  missiles: {
    kind: 'spell', place: 'any', role: 'spell-s', darts: 3, dmg: 85, reach: 3, travel: 13, fx: 'arcane',
    text: 'Three violet darts, each after a different enemy near the aim.',
  },
  mana_font: {
    kind: 'ritual', place: 'global', role: 'economy', t: 5, fx: 'arcane',
    text: 'Your mana fills twice as fast for 5 seconds.',
  },
  mirror: {
    kind: 'troop', place: 'own', role: 'copy', needs: 'foe', fx: 'arcane',
    text: 'Copies the enemy summon nearest where it lands: a holofoil image with its strength and health fights for you.',
  },
  time_warp: {
    kind: 'ritual', place: 'global', role: 'disrupt', t: 2.5, fx: 'arcane',
    text: 'Stops time for 2.5 seconds for everyone but you: the enemy\'s summons, towers, spells and mana stand still.',
  },
  gravity_well: {
    kind: 'spell', place: 'any', role: 'spell-m', r: 3.2, dps: 45, t: 4, pull: 1.4, tick: 0.5, fx: 'arcane',
    text: 'Opens a well for 4 seconds that drags enemy ground summons into it, 45 damage a second inside.',
  },
  bulwark: {
    kind: 'building', place: 'own', role: 'defense', hp: 1000, life: 12, wall: [3, 0.8], size: 0.8,
    text: 'A stone wall facing the enemy. Blocks their ground summons and their bolts until its health is gone.',
  },
  mirror_wand: {
    kind: 'ritual', place: 'mirror', role: 'disrupt', t: 6, fx: 'arcane',
    text: 'Copies the last card you played, for 1 more mana. Before you have played one it is a plain mirror: the next enemy spell on your side in 6 seconds is flung back.',
  },
  blink: {
    kind: 'spell', place: 'any', role: 'support', needs: 'troop', reach: 2.5, jump: 6, fx: 'arcane',
    text: 'Your summons near the aim teleport 6 tiles forward. Over the river, if that is where they land.',
  },
  magic_injection: {
    kind: 'spell', place: 'any', role: 'boost', needs: 'friend', reach: 2.5, bonus: 55, fx: 'arcane',
    text: 'Inject your summon or totem nearest the aim: +55 damage on every attack it makes.',
  },
  mana_pump: {
    kind: 'building', place: 'own', role: 'economy', hp: 80, life: 12, size: 0.6, pump: 3,
    text: 'Gives you 1 mana every 3 seconds for 12 seconds, and 1 more when it breaks or runs out.',
  },
  spell_steal: {
    kind: 'spell', place: 'any', role: 'disrupt', reach: 2.5, dmg: 60, fx: 'arcane',
    text: 'A bolt at the enemy nearest the aim. If it hits, a copy of their next card drops into your hand.',
  },
  card_trick: {
    kind: 'ritual', place: 'global', role: 'cycle', fx: 'arcane',
    text: 'Throw away your hand and draw 4 fresh cards at once.',
  },

  // ------------------------------------------------------------------ holy
  holy_light: {
    kind: 'spell', place: 'any', role: 'support', r: 3.5, heal: 320, fx: 'holy',
    text: 'Heals every summon and tower of yours where it lands for 320. Brought to you by a very smug cleric.',
  },
  oath: {
    kind: 'spell', place: 'any', role: 'support', r: 3.0, shield: 300, heal: 100, fx: 'holy',
    text: 'Your summons and towers where it lands gain a 300 shield and heal 100.',
  },
  seraph: {
    kind: 'troop', place: 'own', role: 'air', air: true, hp: 760, dmg: 115, hit: 1.2, load: 0.4, range: 4.5,
    speed: SPEED.medium, targets: 'both', proj: 9, size: 0.6, lifesteal: 0.6,
    text: 'Lifesteal: whenever it strikes, your weakest tower heals for most of the damage dealt.',
  },
  verdict: {
    kind: 'spell', place: 'any', role: 'spell-l', r: 3.5, dmg: 760, delay: 0.6, heal: 380, fx: 'holy',
    text: 'A holy blast, and your weakest tower heals for 380. Case closed.',
  },
  vital_tincture: {
    kind: 'spell', place: 'any', role: 'boost', reach: 2.5, heal: 260, fx: 'holy',
    text: 'Gives 260 health to your summon nearest the aim. With none there, it heals your weakest tower instead.',
  },
  purify: {
    kind: 'ritual', place: 'global', role: 'cycle', fx: 'holy',
    text: 'Washes burn, poison, slow, curse, freeze and roots off everything of yours. 1 mana for each kind removed.',
  },
};

// Plain words for the card sheet.
const KIND_NAMES = { troop: 'Summon', building: 'Building', trap: 'Trap', spell: 'Spell', ritual: 'Ritual' };
const TARGET_NAMES = { ground: 'Ground', both: 'Air & ground', buildings: 'Buildings', air: 'Air' };

function speedName(v) {
  if (v >= SPEED.veryfast - 0.05) return 'Very fast';
  if (v >= SPEED.fast - 0.05) return 'Fast';
  if (v >= SPEED.medium - 0.05) return 'Medium';
  return 'Slow';
}

/** The battle rows of the card sheet, at a level: [label, value] pairs. */
export function battleStats(id, lv) {
  const b = BATTLE[id];
  if (!b) return [];
  const k = b.noScale ? 1 : levelScale(lv);
  const n = (v) => String(Math.round(v * k));
  const rows = [['Type', KIND_NAMES[b.kind] + (b.air ? ' · flying' : '')]];
  if (b.hp) rows.push(['Health', b.count ? n(b.hp) + ' x' + b.count : n(b.hp)]);
  if (b.kind === 'troop' || b.kind === 'building') {
    if (b.dmg) rows.push(['Damage', n(b.dmg) + (b.splash ? ' (area)' : '')]);
    if (b.hit) rows.push(['Hit speed', b.hit.toFixed(1) + 's']);
    if (b.range) rows.push(['Range', b.range < 2 ? 'Melee' : b.range.toFixed(1)]);
    if (b.speed) rows.push(['Speed', speedName(b.speed)]);
    if (b.targets) rows.push(['Targets', TARGET_NAMES[b.targets]]);
    if (b.life) rows.push(['Lifetime', b.life + 's']);
  } else {
    if (b.dmg) rows.push(['Damage', n(b.dmg) + (b.shards ? ' x' + b.shards : '') + (b.darts ? ' x' + b.darts : '')]);
    if (b.dps) rows.push(['Damage', n(b.dps) + '/s']);
    if (b.heal) rows.push(['Heal', n(b.heal)]);
    if (b.shield) rows.push(['Shield', n(b.shield)]);
    if (b.r) rows.push(['Radius', b.r.toFixed(1)]);
    if (b.t) rows.push(['Duration', b.t + 's']);
    if (b.life) rows.push(['Lasts', b.life + 's']);
  }
  return rows;
}
