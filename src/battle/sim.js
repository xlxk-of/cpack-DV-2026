// THE ARENA, as numbers. Two wizards, three candle towers each, a river between them with a bridge in each lane, and
// mana that fills on its own. Nothing here touches the page: the screen (view.js) only reads what is here and the
// hands (play.js, ai.js) only ever call canPlay() and play(), so a whole battle can be fought with no screen at all.
//
// Team 0 holds the bottom half (y 16..30) and walks up the field; team 1 holds the top (y 0..14) and walks down.
// Distances are in tiles, times in seconds. The battle steps at a fixed 60 a second.
import { BATTLE, TOWER_SPELL, levelScale } from './cards.js';

export const W = 18;
export const H = 30;
export const MID = 15;
export const CENTER = W / 2;
export const RIVER = [14, 16];
export const BRIDGES = [3.5, 14.5];
export const BRIDGE_HALF = 1.2;

// a tower's range is measured from its own edge, as a troop's is
export const KING = { hp: 2400, dmg: 70, hit: 1.0, range: 5.6, r: 1.9, proj: 10 };
export const PRINCESS = { hp: 1400, dmg: 50, hit: 0.8, range: 6.1, r: 1.45, proj: 15 };
export const TOWER_SPOTS = [
  { king: [9, 27.3], princess: [[3.5, 24.3], [14.5, 24.3]] },
  { king: [9, 2.7], princess: [[3.5, 5.7], [14.5, 5.7]] },
];

export const MATCH = 180;
export const DOUBLE_AT = 120;
export const OVERTIME = 60;
export const MANA_MAX = 10;
export const MANA_EVERY = 2.8;
export const MANA_START = 5;
export const STEP = 1 / 60;

const DEPLOY_T = 1.0;
const SIGHT = 5.5;
const RETARGET = 0.25;
const SLOW = 0.65;

// spells that are aimed at your own side to help it: a lightning rod or a mirror never takes these
const FRIENDLY = new Set(['ice_ward', 'oath', 'holy_light', 'vital_tincture', 'magic_injection', 'phoenix_feather', 'corpse_explosion', 'blink', 'barrel']);

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const distXY = (a, x, y) => Math.hypot(a.x - x, a.y - y);

/** A small seeded random, so a battle can be played again the same way. */
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Which way is forward for a team: team 0 walks toward y = 0. */
export function fwd(team) {
  return team === 0 ? -1 : 1;
}

export class Battle {
  /**
   * `cards`: the cards of cards.json. `players`: two of {name, deck: [8 ids], levels: {id: level}}.
   * `opts`: {seed, duration, overtime}.
   */
  constructor(cards, players, opts = {}) {
    this.cards = {};
    for (const c of cards) this.cards[c.id] = c;
    this.rand = rng(opts.seed || 1);
    this.duration = opts.duration || MATCH;
    this.overtime = opts.overtime === undefined ? OVERTIME : opts.overtime;
    this.t = 0;
    this.phase = 'regular';
    this.over = false;
    this.result = null;
    this.nextId = 1;
    this.entities = [];
    this.projectiles = [];
    this.zones = [];
    this.events = [];
    this.acc = 0;
    this.players = players.map((p, team) => this._player(p, team));
    this.towers = [[], []];
    for (const team of [0, 1]) {
      const spot = TOWER_SPOTS[team];
      this.towers[team].push(this._tower(team, 'king', spot.king, -1));
      spot.princess.forEach((at, lane) => this.towers[team].push(this._tower(team, 'princess', at, lane)));
    }
  }

  // ---------------------------------------------------------------- set-up
  _player(p, team) {
    const deck = p.deck.slice(0, 8);
    const order = deck.slice();
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(this.rand() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const card = (id) => ({ id, lv: (p.levels && p.levels[id]) || 1 });
    return {
      team,
      name: p.name || (team ? 'RIVAL' : 'YOU'),
      mana: MANA_START,
      hand: order.slice(0, 4).map(card),
      queue: order.slice(4).map(card),
      crowns: 0,
      lastCast: null,
      fontT: 0, tailwindT: 0, cinderT: 0, mirrorT: 0, nightT: 0, warpT: 0,
      played: 0,
      spent: 0,
    };
  }

  _tower(team, kind, at, lane) {
    const def = kind === 'king' ? KING : PRINCESS;
    const e = this._entity({
      team, type: 'tower', tower: kind, lane, x: at[0], y: at[1], r: def.r,
      hp: def.hp, maxHp: def.hp, dmg: def.dmg, hit: def.hit, load: 0, range: def.range, targets: 'both', proj: def.proj,
      active: kind !== 'king',
    });
    return e;
  }

  _entity(o) {
    const e = {
      id: this.nextId++, alive: true, shield: 0, air: false, level: 1, card: null, deployT: 0,
      cd: 0, target: null, retargetT: 0, attacking: false,
      slowT: 0, freezeT: 0, rootT: 0, blindT: 0, curseT: 0, cursedBy: -1,
      burnDps: 0, burnT: 0, burnTeam: -1, poisonDps: 0, poisonT: 0, poisonTeam: -1,
      bonusDmg: 0, feather: false, reborn: false, mirror: false, flash: 0, mass: 1,
      hitAt: -9, ...o,
    };
    this.entities.push(e);
    return e;
  }

  emit(ev) {
    ev.at = this.t;
    this.events.push(ev);
  }

  /** The events since the last call, for the screen and the sounds. */
  drain() {
    const out = this.events;
    this.events = [];
    return out;
  }

  // ---------------------------------------------------------------- the hand
  /** What the card in a slot costs right now: a candle makes fire cheaper, a Mirror Wand costs what it copies, plus one. */
  costOf(team, slot) {
    const p = this.players[team];
    const c = p.hand[slot];
    if (!c) return 99;
    return this._cost(team, c.id);
  }

  _cost(team, id) {
    const p = this.players[team];
    let cost;
    if (id === 'mirror_wand' && p.lastCast) cost = Math.min(MANA_MAX, this.cards[p.lastCast.id].cost + 1);
    else cost = this.cards[id].cost;
    if (this.cards[id].school === 'fire' && this.entities.some((e) => e.alive && e.team === team && e.card === 'candlewick')) {
      cost = Math.max(1, cost - 1);
    }
    return cost;
  }

  /** The card a Mirror Wand would copy (or itself), for its rules of where it may go. */
  _rulesOf(team, id) {
    const p = this.players[team];
    if (id === 'mirror_wand') {
      if (p.lastCast) return { id: p.lastCast.id, def: BATTLE[p.lastCast.id] };
      return { id, def: { ...BATTLE.mirror_wand, place: 'global' } };
    }
    return { id, def: BATTLE[id] };
  }

  /** Whether a card may go here now: {ok, why, cost}. `why` is one of mana, zone, friend, troop, foe, time, over. */
  canPlay(team, slot, x, y) {
    const p = this.players[team];
    const c = p.hand[slot];
    if (this.over) return { ok: false, why: 'over' };
    if (!c) return { ok: false, why: 'zone' };
    const cost = this._cost(team, c.id);
    if (p.warpT > 0) return { ok: false, why: 'time', cost };
    const rules = this._rulesOf(team, c.id);
    const def = rules.def;
    if (!this._placeOk(team, def, x, y)) return { ok: false, why: 'zone', cost };
    const need = this._needOk(team, def, x, y);
    if (need) return { ok: false, why: need, cost };
    if (p.mana < cost) return { ok: false, why: 'mana', cost };
    return { ok: true, cost };
  }

  _placeOk(team, def, x, y) {
    if (def.place === 'global') return true;
    if (x < 0.2 || x > W - 0.2 || y < 0.2 || y > H - 0.2) return false;
    if (def.place === 'any') return true;
    return this.inZone(team, x, y, def.kind !== 'spell');
  }

  _needOk(team, def, x, y) {
    if (def.needs === 'friend' && !this._nearestOwn(team, x, y, def.reach, true)) return 'friend';
    if (def.needs === 'troop' && !this._nearestOwn(team, x, y, def.reach, false)) return 'troop';
    if (def.needs === 'foe' && !this._nearestFoe(team, x, y, Infinity)) return 'foe';
    return '';
  }

  /** The cells a team may put a summon in: its own half, and the pocket behind an enemy tower it has broken. */
  inZone(team, x, y, solid = true) {
    if (x < 0.4 || x > W - 0.4) return false;
    let ok = team === 0 ? (y >= RIVER[1] + 0.4 && y <= H - 0.3) : (y <= RIVER[0] - 0.4 && y >= 0.3);
    if (!ok) {
      for (const lane of [0, 1]) {
        if (this.towers[1 - team][lane + 1].alive) continue;
        const inLane = lane === 0 ? x < CENTER : x > CENTER;
        const inPocket = team === 0 ? (y >= 9.6 && y <= RIVER[0] - 0.4) : (y <= H - 9.6 && y >= RIVER[1] + 0.4);
        if (inLane && inPocket) ok = true;
      }
    }
    if (!ok) return false;
    if (solid) {
      for (const t of this.towers[0].concat(this.towers[1])) {
        if (t.alive && distXY(t, x, y) < t.r + 0.25) return false;
      }
    }
    return true;
  }

  /** Plays the card in a slot at (x, y). True when it went down. */
  play(team, slot, x, y) {
    const can = this.canPlay(team, slot, x, y);
    if (!can.ok) return false;
    const p = this.players[team];
    const c = p.hand[slot];
    p.mana -= can.cost;
    p.spent += can.cost;
    p.played++;
    // the hand turns over: the card goes to the back (a stolen card is gone once played), the next one comes in
    if (!c.temp) p.queue.push({ id: c.id, lv: c.lv });
    p.hand[slot] = p.queue.shift() || null;
    this.emit({ t: 'cast', team, card: c.id, x, y, slot });
    let id = c.id, lv = c.lv;
    if (id === 'mirror_wand') {
      if (p.lastCast) {
        id = p.lastCast.id;
        lv = p.lastCast.lv;
        this.emit({ t: 'reflect', team, x, y, card: id });
      } else {
        p.mirrorT = BATTLE.mirror_wand.t;
        this.emit({ t: 'spell', team, card: 'mirror_wand', x, y, r: 2, fx: 'arcane' });
        return true;
      }
    } else {
      p.lastCast = { id, lv };
    }
    const stolen = this._cast(team, id, lv, x, y);
    if (stolen) {
      // Spell Steal hit: the copy takes the slot, and the card that had just come in goes back on top of the queue
      if (p.hand[slot]) p.queue.unshift(p.hand[slot]);
      p.hand[slot] = stolen;
    }
    return true;
  }

  // ---------------------------------------------------------------- casting
  _cast(team, id, lv, x, y) {
    const def = BATTLE[id];
    if (!def) return null;
    if (def.kind === 'troop') {
      if (id === 'mirror') this._mirror(team, lv, x, y);
      else this._summon(team, id, lv, x, y);
      return null;
    }
    if (def.kind === 'building') {
      this._build(team, id, lv, x, y);
      return null;
    }
    if (def.kind === 'trap') {
      const e = this._entity({ team, type: 'trap', card: id, level: lv, x, y, r: 0.6, hp: 1, maxHp: 1, life: def.life, lifeMax: def.life });
      this.emit({ t: 'deploy', id: e.id, team, card: id, x, y });
      return null;
    }
    // a spell aimed at the enemy's half may be flung back by their mirror, or drawn to their lightning rod
    const foe = this.players[1 - team];
    if (def.kind === 'spell' && !FRIENDLY.has(id)) {
      const theirs = team === 0 ? y < MID : y > MID;
      if (foe.mirrorT > 0 && theirs) {
        foe.mirrorT = 0;
        this.emit({ t: 'reflect', team: 1 - team, x, y, card: id });
        this._cast(1 - team, id, lv, x, H - y);
        return null;
      }
      const rod = this.entities.find((e) => e.alive && e.team !== team && e.card === 'lightning_rod' && distXY(e, x, y) <= BATTLE.lightning_rod.rod);
      if (rod) {
        this.emit({ t: 'redirect', team: 1 - team, x: rod.x, y: rod.y, from: [x, y] });
        x = rod.x;
        y = rod.y;
      }
    }
    return SPELLS[id] ? SPELLS[id](this, team, lv, x, y, def) || null : null;
  }

  _summon(team, id, lv, x, y, opts = {}) {
    const def = BATTLE[id];
    const k = levelScale(lv);
    const n = opts.one ? 1 : (def.count || 1);
    const made = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.6;
      const off = n > 1 ? 0.45 : 0;
      const hp = (opts.hp || def.hp * k);
      const e = this._entity({
        team, type: 'troop', card: id, level: lv,
        x: clamp(x + Math.cos(a) * off, 0.4, W - 0.4), y: clamp(y + Math.sin(a) * off, 0.4, H - 0.4),
        r: def.size || 0.5, hp, maxHp: opts.maxHp || def.hp * k, dmg: (def.dmg || 0) * k, hit: def.hit || 1,
        load: def.load || 0, range: def.range || 0.6, speed: def.speed || 0, targets: def.targets || 'ground',
        air: !!def.air, splash: def.splash || 0, proj: def.proj || 0, mass: def.mass || (def.size < 0.4 ? 0.5 : 1),
        deployT: opts.instant ? 0 : DEPLOY_T, reborn: !!opts.reborn, mirror: !!opts.mirror,
      });
      made.push(e);
      this.emit({ t: 'deploy', id: e.id, team, card: id, x: e.x, y: e.y, mirror: e.mirror });
    }
    return made;
  }

  _build(team, id, lv, x, y, opts = {}) {
    const def = BATTLE[id];
    const k = def.noScale ? 1 : levelScale(lv);
    const e = this._entity({
      team, type: 'building', card: id, level: lv, x, y, r: def.size || 0.6,
      hp: def.hp * k, maxHp: def.hp * k, dmg: (def.dmg || 0) * k, hit: def.hit || 1, load: def.load || 0,
      range: def.range || 0, targets: def.targets || 'both', proj: def.proj || 0,
      life: def.life, lifeMax: def.life, deployT: DEPLOY_T, mirror: !!opts.mirror,
      store: 0, pumpT: 0, wall: def.wall ? { hw: def.wall[0] / 2, hh: def.wall[1] / 2 } : null, mass: 99,
    });
    this.emit({ t: 'deploy', id: e.id, team, card: id, x, y, mirror: e.mirror });
    return e;
  }

  /** Mirror Image: the enemy summon nearest the aim, copied on your side. */
  _mirror(team, lv, x, y) {
    const src = this._nearestFoe(team, x, y, Infinity);
    if (!src) return;
    this.emit({ t: 'reflect', team, x: src.x, y: src.y, card: src.card, to: [x, y] });
    if (src.type === 'building') {
      this._build(team, src.card, src.level, x, y, { mirror: true });
    } else if (src.card === 'phoenix_egg') {
      this._summon(team, 'phoenix', src.level, x, y, { one: true, mirror: true });
    } else {
      this._summon(team, src.card, src.level, x, y, { one: true, mirror: true });
    }
  }

  // ---------------------------------------------------------------- finding things
  _foes(team) {
    return this.entities.filter((e) => e.alive && e.team !== team && e.type !== 'trap');
  }

  _nearestFoe(team, x, y, reach, withTowers = false) {
    let best = null, bd = reach;
    for (const e of this.entities) {
      if (!e.alive || e.team === team || e.type === 'trap') continue;
      if (e.type === 'tower' && !withTowers) continue;
      const d = distXY(e, x, y) - e.r;
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  _nearestOwn(team, x, y, reach, buildingsToo) {
    let best = null, bd = reach;
    for (const e of this.entities) {
      if (!e.alive || e.team !== team) continue;
      if (e.type !== 'troop' && !(buildingsToo && e.type === 'building')) continue;
      if (e.card === 'phoenix_egg') continue;
      const d = distXY(e, x, y) - e.r * 0.5;
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  king(team) {
    return this.towers[team][0];
  }

  /** The tower of a team with the least health for its size, to be healed. */
  _weakest(team) {
    let best = null, bf = 2;
    for (const t of this.towers[team]) {
      if (!t.alive) continue;
      const f = t.hp / t.maxHp;
      if (f < bf) { bf = f; best = t; }
    }
    return best;
  }

  _healWeakest(team, amount) {
    const t = this._weakest(team);
    if (!t || amount <= 0) return;
    const before = t.hp;
    t.hp = Math.min(t.maxHp, t.hp + amount);
    if (t.hp - before >= 1) this.emit({ t: 'heal', team, x: t.x, y: t.y, r: t.r, small: true });
  }

  _heal(e, amount) {
    e.hp = Math.min(e.maxHp, e.hp + amount);
  }

  /** A target this unit is allowed to hit. */
  _canHit(u, e) {
    if (!e || !e.alive || e.team === u.team || e.type === 'trap') return false;
    if (u.targets === 'buildings') return e.type === 'tower' || e.type === 'building';
    if (e.air) return u.targets === 'both' || u.targets === 'air';
    return u.targets !== 'air';
  }

  _dread(team, x, y) {
    for (const e of this.entities) {
      if (e.alive && e.team !== team && e.card === 'dread_lantern' && e.deployT <= 0 && distXY(e, x, y) <= BATTLE.dread_lantern.dread) return true;
    }
    return false;
  }

  // ---------------------------------------------------------------- damage
  /**
   * `src`: {team, x, y, spell (a spell's damage: a tower takes only part of it), unit (the entity, if one struck)}.
   * Returns what was actually taken off, shield and health together.
   */
  damage(e, amount, src) {
    if (!e.alive || amount <= 0) return 0;
    if (e.type === 'tower' && src.spell) amount *= TOWER_SPELL;
    if (src.x !== undefined && this._dread(src.team, src.x, src.y)) amount *= 1 - BATTLE.dread_lantern.dreadCut;
    let dealt = 0;
    if (e.shield > 0) {
      const s = Math.min(e.shield, amount);
      e.shield -= s;
      amount -= s;
      dealt += s;
    }
    if (amount > 0) {
      dealt += Math.min(e.hp, amount);
      e.hp -= amount;
    }
    e.flash = 0.12;
    if (e.type === 'tower' && e.tower === 'king' && !e.active) {
      e.active = true;
      this.emit({ t: 'wake', team: e.team, x: e.x, y: e.y });
    }
    if (this.onDamage) this.onDamage(e, dealt, src);
    if (dealt > 0 && src.team >= 0) {
      for (const jar of this.entities) {
        if (jar.alive && jar.team === src.team && jar.card === 'soul_jar' && jar.deployT <= 0) {
          const def = BATTLE.soul_jar;
          jar.store = Math.min(def.jarMax * levelScale(jar.level), jar.store + dealt * def.jar);
        }
      }
    }
    if (e.hp <= 0) this._kill(e, src);
    return dealt;
  }

  /** Everything of the enemy's in a circle. `opts`: {spell, air, ground, towers, then(e, dealt)}. */
  area(team, x, y, r, dmg, opts = {}) {
    const spell = opts.spell !== false;
    let total = 0, kills = 0;
    for (const e of this._foes(team)) {
      if (e.air && opts.air === false) continue;
      if (!e.air && opts.ground === false) continue;
      if (e.type === 'tower' && opts.towers === false) continue;
      if (distXY(e, x, y) > r + e.r * 0.6) continue;
      const dealt = this.damage(e, dmg, { team, x, y, spell });
      total += dealt;
      if (!e.alive && e.type !== 'tower') kills++;
      if (opts.then && e.alive) opts.then(e, dealt);
    }
    return { total, kills };
  }

  _burn(e, dps, t, team, spell, stack) {
    if (e.type === 'tower' && spell) dps *= TOWER_SPELL;
    if (stack && e.burnT > 0) e.burnDps = Math.min(stack, e.burnDps + dps);
    else e.burnDps = Math.max(e.burnT > 0 ? e.burnDps : 0, dps);
    e.burnT = Math.max(e.burnT, t);
    e.burnTeam = team;
  }

  _poison(e, dps, t, team) {
    if (e.type === 'tower') dps *= TOWER_SPELL;
    e.poisonDps = Math.max(e.poisonT > 0 ? e.poisonDps : 0, dps);
    e.poisonT = Math.max(e.poisonT, t);
    e.poisonTeam = team;
  }

  _kill(e, src) {
    if (!e.alive) return;
    e.alive = false;
    e.hp = 0;
    this.emit({ t: 'die', id: e.id, team: e.team, type: e.type, card: e.card, x: e.x, y: e.y, air: e.air, tower: e.tower });
    if (e.type === 'tower') return this._towerDown(e);
    if (e.type === 'building') return this._buildingEnds(e);
    if (e.type !== 'troop') return;
    const def = BATTLE[e.card] || {};
    if (e.feather) {
      // Phoenix Feather: up again with half its health, no feather this time
      const [u] = this._summon(e.team, e.card, e.level, e.x, e.y, { one: true, hp: e.maxHp * 0.5, maxHp: e.maxHp, instant: true, mirror: e.mirror, reborn: e.reborn });
      u.deployT = 0.4;
      this.emit({ t: 'reborn', team: e.team, x: e.x, y: e.y, card: e.card });
    } else if (def.egg && !e.reborn) {
      const k = levelScale(e.level);
      this._entity({
        team: e.team, type: 'troop', card: 'phoenix_egg', level: e.level, x: e.x, y: clamp(e.y, 0.5, H - 0.5), r: 0.4,
        hp: def.egg.hp * k, maxHp: def.egg.hp * k, speed: 0, targets: 'none', eggT: def.egg.t, deployT: 0, mass: 99, mirror: e.mirror,
      });
      this.emit({ t: 'egg', team: e.team, x: e.x, y: e.y });
    }
    if (def.deathBlast) {
      const k = levelScale(e.level);
      const b = def.deathBlast;
      this.area(e.team, e.x, e.y, b.r, b.dmg * k, {
        spell: false,
        then: b.burn ? (t) => this._burn(t, b.burn.dps * k, b.burn.t, e.team, false) : null,
      });
      this.emit({ t: 'spell', team: e.team, card: e.card, x: e.x, y: e.y, r: b.r, fx: 'fire' });
    }
    if (e.curseT > 0 && e.cursedBy >= 0 && e.cursedBy !== e.team) {
      // Cursed Blast: what dies cursed rises again on the other side, as an Ember Sprite
      this._summon(e.cursedBy, 'ember_sprite', e.level, e.x, e.y, { one: true });
      this.emit({ t: 'rise', team: e.cursedBy, x: e.x, y: e.y });
    }
  }

  _towerDown(t) {
    if (this.over) return;
    const scorer = 1 - t.team;
    const p = this.players[scorer];
    if (t.tower === 'king') {
      p.crowns = 3;
      for (const o of this.towers[t.team]) {
        if (o.alive) {
          o.alive = false;
          o.hp = 0;
          this.emit({ t: 'die', id: o.id, team: o.team, type: 'tower', tower: o.tower, x: o.x, y: o.y });
          this.emit({ t: 'tower', team: o.team, tower: o.tower, x: o.x, y: o.y });
        }
      }
      this.emit({ t: 'tower', team: t.team, tower: 'king', x: t.x, y: t.y });
      this.emit({ t: 'crown', team: scorer, crowns: p.crowns });
      this._end(scorer, 'king');
      return;
    }
    p.crowns = Math.min(3, p.crowns + 1);
    this.emit({ t: 'tower', team: t.team, tower: 'princess', lane: t.lane, x: t.x, y: t.y });
    this.emit({ t: 'crown', team: scorer, crowns: p.crowns });
    const king = this.king(t.team);
    if (!king.active) {
      king.active = true;
      this.emit({ t: 'wake', team: t.team, x: king.x, y: king.y });
    }
    if (this.phase === 'overtime') this._end(scorer, 'sudden');
  }

  _buildingEnds(e) {
    if (e.card === 'soul_jar' && e.store > 0) {
      this._healWeakest(e.team, e.store);
      this.emit({ t: 'heal', team: e.team, x: e.x, y: e.y, r: 1.2 });
    }
    if (e.card === 'mana_pump') this._gainMana(e.team, 1, e.x, e.y);
    if (e.card === 'candlewick') this.emit({ t: 'snuff', team: e.team, x: e.x, y: e.y });
  }

  _gainMana(team, n, x, y) {
    const p = this.players[team];
    p.mana = Math.min(MANA_MAX, p.mana + n);
    this.emit({ t: 'mana', team, n, x, y });
  }

  // ---------------------------------------------------------------- time
  /** Runs the battle on by `dt` real seconds, in fixed steps. */
  update(dt) {
    this.acc += Math.min(0.25, dt);
    let n = 0;
    while (this.acc >= STEP && n < 8) {
      this.step(STEP);
      this.acc -= STEP;
      n++;
    }
  }

  step(dt) {
    if (this.over) return;
    this.t += dt;
    this._clock();
    if (this.over) return;
    for (const p of this.players) this._playerTick(p, dt);
    for (const e of this.entities.slice()) {
      if (!e.alive) continue;
      if (this.players[e.team].warpT > 0) { e.flash = Math.max(0, e.flash - dt); continue; }
      this._statusTick(e, dt);
      if (!e.alive) continue;
      if (e.type === 'troop') this._troop(e, dt);
      else if (e.type === 'tower') this._fighter(e, dt);
      else if (e.type === 'building') this._building(e, dt);
      else if (e.type === 'trap') this._trap(e, dt);
    }
    this._projectiles(dt);
    this._zones(dt);
    this._separate();
    if (this.entities.length > 40 && this.entities.some((e) => !e.alive && e.type !== 'tower')) {
      this.entities = this.entities.filter((e) => e.alive || e.type === 'tower');
    }
  }

  _clock() {
    if (this.phase === 'regular') {
      if (!this.doubled && this.t >= this.duration - (MATCH - DOUBLE_AT)) {
        this.doubled = true;
        this.emit({ t: 'phase', phase: 'double' });
      }
      if (this.t >= this.duration) {
        const [a, b] = this.players.map((p) => p.crowns);
        if (a !== b) return this._end(a > b ? 0 : 1, 'time');
        if (this.overtime <= 0) return this._tiebreak();
        this.phase = 'overtime';
        this.emit({ t: 'phase', phase: 'overtime' });
      }
    } else if (this.phase === 'overtime' && this.t >= this.duration + this.overtime) {
      this._tiebreak();
    }
  }

  /** Time is up and the crowns are level: the side whose weakest tower stands higher wins. */
  _tiebreak() {
    const low = [0, 1].map((team) => Math.min(...this.towers[team].filter((t) => t.alive).map((t) => t.hp / t.maxHp)));
    if (Math.abs(low[0] - low[1]) < 0.0005) return this._end(-1, 'draw');
    this._end(low[0] > low[1] ? 0 : 1, 'tiebreak');
  }

  _end(winner, reason) {
    if (this.over) return;
    this.over = true;
    this.result = { winner, reason, crowns: this.players.map((p) => p.crowns), t: this.t };
    this.emit({ t: 'end', ...this.result });
  }

  /** Seconds left on the clock (overtime counts on from the end of the match). */
  timeLeft() {
    if (this.phase === 'overtime') return Math.max(0, this.duration + this.overtime - this.t);
    return Math.max(0, this.duration - this.t);
  }

  manaRate(team) {
    const p = this.players[team];
    let r = 1 / MANA_EVERY;
    if (this.doubled || this.phase === 'overtime') r *= 2;
    if (p.fontT > 0) r *= 2;
    return r;
  }

  _playerTick(p, dt) {
    for (const k of ['fontT', 'tailwindT', 'cinderT', 'mirrorT', 'nightT', 'warpT']) if (p[k] > 0) p[k] = Math.max(0, p[k] - dt);
    if (p.warpT > 0) return;
    p.mana = Math.min(MANA_MAX, p.mana + this.manaRate(p.team) * dt);
  }

  _statusTick(e, dt) {
    e.flash = Math.max(0, e.flash - dt);
    for (const k of ['slowT', 'freezeT', 'rootT', 'blindT', 'curseT']) if (e[k] > 0) e[k] = Math.max(0, e[k] - dt);
    if (e.burnT > 0) {
      e.burnT -= dt;
      this.damage(e, e.burnDps * dt, { team: e.burnTeam, spell: false });
      if (e.burnT <= 0) e.burnDps = 0;
    }
    if (e.alive && e.poisonT > 0) {
      e.poisonT -= dt;
      this.damage(e, e.poisonDps * dt, { team: e.poisonTeam, spell: false });
      if (e.poisonT <= 0) e.poisonDps = 0;
    }
  }

  // ---------------------------------------------------------------- troops
  _troop(u, dt) {
    if (u.deployT > 0) {
      u.deployT -= dt;
      return;
    }
    if (u.card === 'phoenix_egg') {
      u.eggT -= dt;
      if (u.eggT <= 0) {
        u.alive = false;
        this._summon(u.team, 'phoenix', u.level, u.x, u.y, { one: true, reborn: true, instant: true, mirror: u.mirror });
        this.emit({ t: 'hatch', team: u.team, x: u.x, y: u.y });
      }
      return;
    }
    // Cinder Trail: burning ground behind every summon that is walking
    const p = this.players[u.team];
    if (p.cinderT > 0 && !u.air) {
      u.cinderAcc = (u.cinderAcc || 0) + dt;
      if (u.cinderAcc >= 0.35) {
        u.cinderAcc = 0;
        this.zones.push({ kind: 'cinder', team: u.team, x: u.x, y: u.y, r: 0.75, t: 0, T: 3, tick: 0.25, acc: 0, lv: 1 });
      }
    }
    this._fighter(u, dt);
  }

  /** The default goal of a troop with nothing in sight: the tower at the end of its lane, or the king. */
  _laneGoal(u) {
    const foe = 1 - u.team;
    const lane = u.x < CENTER ? 0 : 1;
    const p = this.towers[foe][lane + 1];
    return p.alive ? p : this.king(foe);
  }

  _acquire(u) {
    const blind = u.blindT > 0;
    const sight = blind ? BATTLE.snowblind.sight : (u.type === 'tower' ? u.range : (u.targets === 'buildings' ? 7.5 : SIGHT));
    // a snowman draws every summon and totem that can hit it
    if (u.type !== 'tower') {
      for (const e of this.entities) {
        if (e.alive && e.card === 'snowman_decoy' && e.team !== u.team && e.deployT <= 0 && this._canHit(u, e)
          && dist(u, e) <= BATTLE.snowman_decoy.taunt) return e;
      }
    }
    let best = null, bd = Infinity;
    for (const e of this.entities) {
      if (!this._canHit(u, e)) continue;
      if (u.type === 'tower' && e.type === 'tower') continue;
      const d = dist(u, e) - e.r - u.r;
      if (d > sight) continue;
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  _rangeOf(u) {
    let r = u.range;
    if (u.blindT > 0) r = Math.min(r, u.type === 'tower' ? BATTLE.snowblind.towerRange : BATTLE.snowblind.sight);
    return r;
  }

  /** Troops, attacking buildings and towers: pick a target, walk to it, hit it. */
  _fighter(u, dt) {
    if (u.type === 'tower' && !u.active) return;
    if (u.freezeT > 0) return;
    if (u.targets === 'none') return;
    const rate = u.slowT > 0 ? SLOW : 1;
    u.cd = Math.max(0, u.cd - dt * rate);
    const range = this._rangeOf(u);
    if (u.target && !this._canHit(u, u.target)) u.target = null;
    if (u.target) {
      const d = dist(u, u.target) - u.target.r - u.r;
      // a tower, or a troop already striking, keeps to its target while it stays in reach
      if (u.attacking && d > range + 0.6) { u.target = null; u.attacking = false; }
      if (u.type === 'tower' && d > range) { u.target = null; u.attacking = false; }
    }
    u.retargetT -= dt;
    if (!u.attacking && u.retargetT <= 0) {
      u.retargetT = RETARGET;
      const t = this._acquire(u);
      if (t !== u.target) {
        u.target = t;
        if (t) u.cd = Math.max(u.cd, u.load);
      }
    }
    const t = u.target;
    if (t) {
      const d = dist(u, t) - t.r - u.r;
      if (d <= range) {
        if (!u.attacking) u.cd = Math.max(u.cd, u.load);
        u.attacking = true;
        u.face = Math.atan2(t.y - u.y, t.x - u.x);
        if (u.cd <= 0) {
          this._strike(u, t);
          u.cd = u.hit;
        }
        return;
      }
      u.attacking = false;
      if (u.type === 'troop') this._walk(u, t.x, t.y, dt, t.r + u.r + range * 0.9);
      return;
    }
    u.attacking = false;
    if (u.type === 'troop') {
      const g = this._laneGoal(u);
      this._walk(u, g.x, g.y, dt, g.r + u.r + 0.2);
    }
  }

  _strike(u, t) {
    u.hitAt = this.t;
    const dmg = u.dmg + u.bonusDmg;
    this.emit({ t: 'attack', id: u.id, team: u.team, card: u.card, tower: u.tower, x: u.x, y: u.y, tx: t.x, ty: t.y, ranged: !!u.proj });
    if (u.proj) {
      this.projectiles.push({
        kind: 'unit', team: u.team, x: u.x, y: u.y - (u.type === 'tower' ? 1.2 : 0), sx: u.x, sy: u.y, tx: t.x, ty: t.y, target: t,
        speed: u.proj, dmg, splash: u.splash, src: u.id, card: u.card, tower: u.tower, t: 0, blockable: true,
      });
      return;
    }
    this._land(u, t, dmg);
  }

  /** A blow (or a unit's shot) arriving. */
  _land(u, t, dmg) {
    const src = { team: u.team, x: u.x, y: u.y, unit: u };
    let dealt = 0;
    if (u.splash) {
      for (const e of this._foes(u.team)) {
        if (!this._canHit(u, e) || distXY(e, t.x, t.y) > u.splash + e.r) continue;
        dealt += this.damage(e, dmg, src);
      }
    } else {
      dealt = this.damage(t, dmg, src);
    }
    const def = BATTLE[u.card];
    if (!def) return;
    const k = levelScale(u.level);
    if (def.burn && t.alive) this._burn(t, def.burn.dps * k, def.burn.t, u.team, false, def.burn.dps * k * def.burn.max);
    if (def.slowOnHit && t.alive) t.slowT = Math.max(t.slowT, def.slowOnHit);
    if (def.arcOnHit) {
      const other = this._foes(u.team).find((e) => e !== t && e.type !== 'tower' && this._canHit(u, e) && dist(e, t) <= def.arcOnHit.r);
      if (other) {
        this.damage(other, def.arcOnHit.dmg * k, src);
        this.emit({ t: 'zap', team: u.team, pts: [[t.x, t.y], [other.x, other.y]], small: true });
      }
    }
    if (def.lifesteal && dealt > 0) this._healWeakest(u.team, dealt * def.lifesteal);
  }

  /** Walks a ground troop toward a point, by the bridges; a flying one goes straight. */
  _walk(u, gx, gy, dt, stop) {
    if (u.rootT > 0) return;
    let speed = u.speed;
    if (u.slowT > 0) speed *= SLOW;
    if (this.players[u.team].tailwindT > 0) speed *= 1 + BATTLE.tailwind.speedUp;
    const [wx, wy, final] = this._waypoint(u, gx, gy);
    const dx = wx - u.x, dy = wy - u.y;
    const d = Math.hypot(dx, dy);
    if (d < 1e-4) return;
    const go = final ? Math.min(speed * dt, Math.max(0, d - stop)) : Math.min(speed * dt, d);
    let [mx, my] = this._steer(u, dx / d, dy / d, d, gx, gy);
    u.x += mx * go;
    u.y += my * go;
    u.face = Math.atan2(my, mx);
    u.moving = go > 0;
  }

  /** Turns a ground troop aside from a tower or building standing in its way, toward the side with more room. */
  _steer(u, dx, dy, d, gx, gy) {
    if (u.air) return [dx, dy];
    let best = null, ahead = Infinity;
    for (const o of this.entities) {
      if (!o.alive || (o.type !== 'tower' && o.type !== 'building') || o === u.target) continue;
      if (Math.abs(o.x - gx) < 0.01 && Math.abs(o.y - gy) < 0.01) continue;
      const ox = o.x - u.x, oy = o.y - u.y;
      const along = ox * dx + oy * dy;
      if (along <= 0 || along > Math.min(d + o.r, 2.2 + o.r)) continue;
      const side = -ox * dy + oy * dx;           // the obstacle's offset to the left of the way
      const clear = o.r + u.r + 0.1;
      if (Math.abs(side) >= clear) continue;
      if (along < ahead) { ahead = along; best = { side, clear }; }
    }
    if (!best) return [dx, dy];
    const away = best.side > 0.02 ? -1 : (best.side < -0.02 ? 1 : (u.x < CENTER ? 1 : -1));
    const w = 1.4 * (1 - Math.abs(best.side) / best.clear) + 0.3;
    const nx = dx + away * -dy * w, ny = dy + away * dx * w;
    const n = Math.hypot(nx, ny) || 1;
    return [nx / n, ny / n];
  }

  /** Where a ground troop heads next to reach (gx, gy): the mouth of a bridge, across it, or the goal itself. */
  _waypoint(u, gx, gy) {
    if (u.air) return [gx, gy, true];
    const goalBottom = gy > MID;
    const inRiver = u.y > RIVER[0] + 0.05 && u.y < RIVER[1] - 0.05;
    if (inRiver) {
      const b = BRIDGES[Math.abs(u.x - BRIDGES[0]) < Math.abs(u.x - BRIDGES[1]) ? 0 : 1];
      return [b, goalBottom ? RIVER[1] + 0.6 : RIVER[0] - 0.6, false];
    }
    const meBottom = u.y > MID;
    if (meBottom === goalBottom) return [gx, gy, true];
    let b = BRIDGES[0], best = Infinity;
    for (const x of BRIDGES) {
      const c = Math.abs(u.x - x) + Math.abs(gx - x);
      if (c < best) { best = c; b = x; }
    }
    const edge = meBottom ? RIVER[1] + 0.35 : RIVER[0] - 0.35;
    if (Math.abs(u.x - b) < BRIDGE_HALF - u.r * 0.4 && Math.abs(u.y - edge) < 1.2) {
      return [b, meBottom ? RIVER[0] - 0.6 : RIVER[1] + 0.6, false];
    }
    return [b, edge, false];
  }

  // ---------------------------------------------------------------- buildings, traps
  _building(e, dt) {
    if (e.deployT > 0) {
      e.deployT -= dt;
      return;
    }
    e.life -= dt;
    if (e.life <= 0) {
      e.alive = false;
      this.emit({ t: 'expire', id: e.id, team: e.team, card: e.card, x: e.x, y: e.y });
      this._buildingEnds(e);
      return;
    }
    if (e.card === 'mana_pump') {
      e.pumpT += dt;
      if (e.pumpT >= BATTLE.mana_pump.pump) {
        e.pumpT -= BATTLE.mana_pump.pump;
        this._gainMana(e.team, 1, e.x, e.y);
      }
    }
    if (e.dmg > 0) this._fighter(e, dt);
  }

  _trap(e, dt) {
    e.life -= dt;
    if (e.life <= 0) {
      e.alive = false;
      this.emit({ t: 'expire', id: e.id, team: e.team, card: e.card, x: e.x, y: e.y });
      return;
    }
    const def = BATTLE[e.card];
    const prey = this.entities.find((o) => o.alive && o.team !== e.team && o.type === 'troop' && !o.air && o.deployT <= 0 && dist(o, e) <= def.trigger + o.r);
    if (!prey) return;
    e.alive = false;
    const k = levelScale(e.level);
    this.emit({ t: 'trap', team: e.team, card: e.card, x: e.x, y: e.y, r: def.r || 1 });
    if (e.card === 'rune_trap') {
      this.area(e.team, e.x, e.y, def.r, def.dmg * k, { spell: false, air: false, then: (o) => this._poison(o, def.poison.dps * k, def.poison.t, e.team) });
    } else if (e.card === 'grave_hand') {
      this.damage(prey, def.dmg * k, { team: e.team, spell: false });
      prey.rootT = Math.max(prey.rootT, def.root);
    }
  }

  // ---------------------------------------------------------------- what flies
  _projectiles(dt) {
    const keep = [];
    for (const p of this.projectiles) {
      if (this.players[p.team].warpT > 0) { keep.push(p); continue; }
      p.t += dt;
      if (p.kind === 'barrel') {
        if (this._roll(p, dt)) keep.push(p);
        continue;
      }
      if (p.lob) {
        // lobbed: a fixed flight time, landing where it was aimed
        const k = Math.min(1, p.t / p.lob);
        p.x = p.sx + (p.tx - p.sx) * k;
        p.y = p.sy + (p.ty - p.sy) * k;
        p.h = Math.sin(k * Math.PI) * p.arc;
        if (k >= 1) this._arrive(p);
        else keep.push(p);
        continue;
      }
      if (p.target && p.target.alive) {
        p.tx = p.target.x;
        p.ty = p.target.y;
      }
      const dx = p.tx - p.x, dy = p.ty - p.y;
      const d = Math.hypot(dx, dy);
      const go = p.speed * dt;
      if (d <= go + 0.05) {
        p.x = p.tx;
        p.y = p.ty;
        this._arrive(p);
        continue;
      }
      const nx = p.x + (dx / d) * go, ny = p.y + (dy / d) * go;
      const wall = p.blockable ? this._wallAt(p.team, nx, ny) : null;
      if (wall) {
        this.emit({ t: 'block', team: wall.team, x: nx, y: ny });
        if (p.kind === 'spell') {
          // a spell bursts on the wall: it lands there, on whatever is there, the wall first of all
          p.x = p.tx = nx;
          p.y = p.ty = ny;
          p.target = null;
          p.blocked = true;
          this._arrive(p);
        } else {
          this.damage(wall, p.dmg, { team: p.team });
        }
        continue;
      }
      p.x = nx;
      p.y = ny;
      keep.push(p);
    }
    this.projectiles = keep;
  }

  _arrive(p) {
    if (p.kind === 'unit') {
      if (!p.target || !p.target.alive) return;
      const u = this.entities.find((e) => e.id === p.src) || { team: p.team, x: p.sx, y: p.sy, card: p.card, level: 1, splash: p.splash, targets: 'both' };
      this._land({ ...u, team: p.team, splash: p.splash, card: p.card }, p.target, p.dmg);
      return;
    }
    if (p.land) p.land(p);
  }

  _wallAt(team, x, y) {
    for (const e of this.entities) {
      if (!e.alive || !e.wall || e.team === team || e.deployT > 0) continue;
      if (Math.abs(x - e.x) <= e.wall.hw && Math.abs(y - e.y) <= e.wall.hh) return e;
    }
    return null;
  }

  /** A powder keg rolling up the field. False when it has burst or rolled out. */
  _roll(p, dt) {
    const step = p.speed * dt;
    p.y += p.dir * step;
    p.rolled += step;
    for (const e of this._foes(p.team)) {
      if (e.air) continue;
      const touching = e.wall
        ? Math.abs(e.x - p.x) <= e.wall.hw + p.r * 0.5 && Math.abs(e.y - p.y) <= e.wall.hh + p.r * 0.5
        : distXY(e, p.x, p.y) <= p.r + e.r;
      if (!touching) continue;
      if (e.type === 'tower' || e.wall) {
        this.area(p.team, p.x, p.y, BATTLE.barrel.burst, p.dmg, { air: false });
        this.emit({ t: 'spell', team: p.team, card: 'barrel', x: p.x, y: p.y, r: BATTLE.barrel.burst, fx: 'fire' });
        return false;
      }
      if (p.hit.has(e.id)) continue;
      p.hit.add(e.id);
      this.damage(e, p.dmg, { team: p.team, x: p.x, y: p.y, spell: true });
      if (e.type === 'troop' && e.alive) this._shove(e, 0, p.dir * 1.0);
    }
    return p.rolled < p.dist && p.y > 0 && p.y < H;
  }

  /** Pushes a troop, keeping a walking one out of the river. */
  _shove(e, dx, dy) {
    if (e.type !== 'troop' || e.mass >= 6) {
      dx *= 0.35;
      dy *= 0.35;
    }
    e.x = clamp(e.x + dx, 0.3, W - 0.3);
    e.y = clamp(e.y + dy, 0.3, H - 0.3);
    if (!e.air) this._riverBank(e);
  }

  /** A ground troop in the water: on the bank if it is at the edge, else back onto the bridge it fell off. */
  _riverBank(e) {
    if (e.y <= RIVER[0] || e.y >= RIVER[1]) return;
    const span = BRIDGE_HALF - e.r * 0.3;
    let near = BRIDGES[0];
    for (const b of BRIDGES) {
      if (Math.abs(e.x - b) <= span) return;
      if (Math.abs(e.x - b) < Math.abs(e.x - near)) near = b;
    }
    const bank = e.y < MID ? RIVER[0] : RIVER[1];
    if (Math.abs(e.y - bank) < 0.5 || Math.abs(e.x - near) > span + 0.6) e.y = bank + (e.y < MID ? -0.02 : 0.02);
    else e.x = near + Math.sign(e.x - near) * span;
  }

  // ---------------------------------------------------------------- zones: clouds, wells, storms, marks
  _zones(dt) {
    const keep = [];
    for (const z of this.zones) {
      if (this.players[z.team].warpT > 0) { keep.push(z); continue; }
      z.t += dt;
      if (z.vx || z.vy) {
        z.x = clamp(z.x + (z.vx || 0) * dt, 0.5, W - 0.5);
        z.y = clamp(z.y + (z.vy || 0) * dt, 0.5, H - 0.5);
      }
      const k = levelScale(z.lv);
      if (z.kind === 'snow') {
        for (const e of this._foes(z.team)) if (distXY(e, z.x, z.y) <= z.r + e.r * 0.5) e.blindT = Math.max(e.blindT, 0.15);
      }
      if (z.kind === 'gravity') {
        for (const e of this._foes(z.team)) {
          if (e.type !== 'troop' || e.air) continue;
          const d = distXY(e, z.x, z.y);
          if (d > z.r || d < 0.2) continue;
          const pull = Math.min(d - 0.2, BATTLE.gravity_well.pull * dt);
          this._shove(e, ((z.x - e.x) / d) * pull, ((z.y - e.y) / d) * pull);
        }
      }
      if (z.tick) {
        z.acc += dt;
        while (z.acc >= z.tick) {
          z.acc -= z.tick;
          this._zoneTick(z, k);
        }
      }
      if (z.t >= z.T) {
        if (z.done) z.done(z);
      } else {
        keep.push(z);
      }
    }
    this.zones = keep;
  }

  _zoneTick(z, k) {
    if (z.kind === 'rot') {
      this.area(z.team, z.x, z.y, z.r, BATTLE.curse_rot.dps * z.tick * k);
    } else if (z.kind === 'gravity') {
      this.area(z.team, z.x, z.y, z.r, BATTLE.gravity_well.dps * z.tick * k, { air: false });
    } else if (z.kind === 'cyclone') {
      const def = BATTLE.cyclone;
      for (const e of this._foes(z.team)) {
        if (distXY(e, z.x, z.y) > z.r + e.r * 0.5) continue;
        this.damage(e, def.dmg * k, { team: z.team, x: z.x, y: z.y, spell: true });
        if (e.alive && e.type === 'troop') this._shove(e, (e.x - z.x) * 0.15, fwd(z.team) * def.push);
      }
    } else if (z.kind === 'cinder') {
      const def = BATTLE.cinder_trail;
      for (const e of this._foes(z.team)) {
        if (e.air || e.type === 'tower') continue;
        if (distXY(e, z.x, z.y) <= z.r + e.r * 0.5) this._burn(e, def.dps, def.burnT, z.team, false);
      }
    }
  }

  zone(team, kind, x, y, r, T, lv, more = {}) {
    const z = { kind, team, x, y, r, t: 0, T, lv, acc: 0, ...more };
    this.zones.push(z);
    return z;
  }

  /** A spell that flies from the caster's king tower to (x, y), then does `land`. */
  launch(team, x, y, def, land, more = {}) {
    const k = this.king(team);
    const p = {
      kind: 'spell', team, card: more.card, sx: k.x, sy: k.y, x: k.x, y: k.y, tx: x, ty: y, t: 0,
      speed: def.travel || 12, lob: def.lob || 0, arc: def.lob ? 6 : 0, h: 0, land, blockable: !def.lob, fx: def.fx,
      ...more,
    };
    if (more.from) {
      p.sx = p.x = more.from[0];
      p.sy = p.y = more.from[1];
    }
    this.projectiles.push(p);
    return p;
  }

  // ---------------------------------------------------------------- simple separation
  _separate() {
    const list = this.entities.filter((e) => e.alive && (e.type === 'troop' || e.type === 'building' || e.type === 'tower'));
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j];
        if (a.air !== b.air) continue;
        if (a.type !== 'troop' && b.type !== 'troop') continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const min = a.r + b.r;
        const d2 = dx * dx + dy * dy;
        if (d2 >= min * min) continue;
        const d = Math.sqrt(d2) || 0.01;
        const push = (min - d);
        const ma = a.type === 'troop' ? a.mass : 1e6, mb = b.type === 'troop' ? b.mass : 1e6;
        const fa = mb / (ma + mb), fb = ma / (ma + mb);
        const ux = d2 > 1e-6 ? dx / d : (this.rand() - 0.5), uy = d2 > 1e-6 ? dy / d : (this.rand() - 0.5);
        if (a.type === 'troop') { a.x -= ux * push * fa; a.y -= uy * push * fa; }
        if (b.type === 'troop') { b.x += ux * push * fb; b.y += uy * push * fb; }
      }
    }
    for (const u of list) {
      if (u.type !== 'troop') continue;
      if (!u.air) {
        // walls stop the enemy's ground troops
        for (const w of this.entities) {
          if (!w.alive || !w.wall || w.team === u.team || w.deployT > 0) continue;
          const cx = clamp(u.x, w.x - w.wall.hw, w.x + w.wall.hw);
          const cy = clamp(u.y, w.y - w.wall.hh, w.y + w.wall.hh);
          const dx = u.x - cx, dy = u.y - cy;
          const d = Math.hypot(dx, dy);
          if (d >= u.r) continue;
          if (d < 1e-4) { u.y += (u.y < w.y ? -1 : 1) * (u.r + w.wall.hh); continue; }
          u.x = cx + (dx / d) * u.r;
          u.y = cy + (dy / d) * u.r;
          if (!u.attacking && this._canHit(u, w)) u.target = w;
        }
        this._riverBank(u);
      }
      u.x = clamp(u.x, 0.3, W - 0.3);
      u.y = clamp(u.y, 0.3, H - 0.3);
    }
  }
}

// ==================================================================== THE SPELLS
// One function a card: (battle, team, level, x, y, def). A spell steal returns the card it stole.
const fx = (b, team, card, x, y, r, kind) => b.emit({ t: 'spell', team, card, x, y, r, fx: kind || BATTLE[card].fx });

const SPELLS = {
  fireball(b, team, lv, x, y, d) {
    b.launch(team, x, y, d, (p) => {
      b.area(team, p.tx, p.ty, d.r, d.dmg * levelScale(lv));
      fx(b, team, 'fireball', p.tx, p.ty, d.r);
    }, { card: 'fireball' });
  },

  frost_shard(b, team, lv, x, y, d) {
    b.launch(team, x, y, d, (p) => {
      b.area(team, p.tx, p.ty, d.r, d.dmg * levelScale(lv), { then: (e) => { e.slowT = Math.max(e.slowT, d.slow); } });
      fx(b, team, 'frost_shard', p.tx, p.ty, d.r);
    }, { card: 'frost_shard' });
  },

  pyroclasm(b, team, lv, x, y, d) {
    const k = levelScale(lv);
    b.launch(team, x, y, d, (p) => {
      b.area(team, p.tx, p.ty, d.r, d.dmg * k, { then: (e) => b._burn(e, d.burn.dps * k, d.burn.t, team, true) });
      fx(b, team, 'pyroclasm', p.tx, p.ty, d.r);
    }, { card: 'pyroclasm' });
  },

  meteor(b, team, lv, x, y, d) {
    b.zone(team, 'aim', x, y, d.r, d.lob, lv, { card: 'meteor' });
    b.launch(team, x, y, d, () => {
      for (const e of b._foes(team)) {
        if (e.type === 'troop' && distXY(e, x, y) <= d.crush + e.r) b.damage(e, e.hp + e.shield + 1, { team, spell: true });
      }
      b.area(team, x, y, d.r, d.dmg * levelScale(lv));
      fx(b, team, 'meteor', x, y, d.r);
    }, { card: 'meteor', arc: 9 });
  },

  wildfire(b, team, lv, x, y, d) {
    const k = levelScale(lv);
    const leap = (fromX, fromY, toX, toY, hops) => {
      b.launch(team, toX, toY, d, (p) => {
        const hit = b.area(team, p.tx, p.ty, d.r, d.dmg * k);
        fx(b, team, 'wildfire', p.tx, p.ty, d.r);
        if (hit.kills > 0 && hops > 0) {
          const next = b._nearestFoe(team, p.tx, p.ty, d.hopRange);
          if (next) leap(p.tx, p.ty, next.x, next.y, hops - 1);
        }
      }, { card: 'wildfire', from: [fromX, fromY] });
    };
    const k0 = b.king(team);
    leap(k0.x, k0.y, x, y, d.hops);
  },

  barrel(b, team, lv, x, y, d) {
    b.projectiles.push({
      kind: 'barrel', card: 'barrel', team, x, y, sx: x, sy: y, dir: fwd(team), speed: d.rollSpeed, dist: d.roll, rolled: 0,
      r: d.r, dmg: d.dmg * levelScale(lv), lv, hit: new Set(), t: 0,
    });
  },

  cinder_trail(b, team, lv, x, y, d) {
    b.players[team].cinderT = d.t;
    b.emit({ t: 'buff', team, card: 'cinder_trail' });
  },

  phoenix_feather(b, team, lv, x, y, d) {
    const u = b._nearestOwn(team, x, y, d.reach, false);
    if (!u) return;
    u.feather = true;
    b.emit({ t: 'boost', team, card: 'phoenix_feather', x: u.x, y: u.y, id: u.id });
  },

  ice_ward(b, team, lv, x, y, d) {
    shieldAround(b, team, x, y, d.r, d.shield * levelScale(lv));
    fx(b, team, 'ice_ward', x, y, d.r);
  },

  glacier_wall(b, team, lv, x, y, d) {
    for (const t of b.towers[team]) {
      if (!t.alive) continue;
      t.shield += d.shield * levelScale(lv);
      b.emit({ t: 'shield', team, x: t.x, y: t.y, r: t.r + 0.5 });
    }
  },

  abs_zero(b, team, lv, x, y, d) {
    b.zone(team, 'aim', x, y, d.r, d.delay, lv, {
      card: 'abs_zero',
      done: () => {
        b.area(team, x, y, d.r, d.dmg * levelScale(lv), {
          then: (e) => {
            if (e.type === 'tower') e.slowT = Math.max(e.slowT, d.slowTowers);
            else e.freezeT = Math.max(e.freezeT, d.freeze);
          },
        });
        fx(b, team, 'abs_zero', x, y, d.r);
      },
    });
  },

  icicle_volley(b, team, lv, x, y, d) {
    const k = b.king(team);
    const spread = clamp(0.4 + 0.12 * distXY(k, x, y), 0.4, 3.0);
    const spots = [[x, y]];
    for (let i = 0; i < d.shards - 1; i++) {
      const a = (i / (d.shards - 1)) * Math.PI * 2 + 0.4;
      spots.push([clamp(x + Math.cos(a) * spread, 0.3, W - 0.3), clamp(y + Math.sin(a) * spread, 0.3, H - 0.3)]);
    }
    for (const [sx, sy] of spots) {
      b.launch(team, sx, sy, d, (p) => {
        b.area(team, p.tx, p.ty, d.r, d.dmg * levelScale(lv));
        fx(b, team, 'icicle_volley', p.tx, p.ty, d.r);
      }, { card: 'icicle_volley' });
    }
  },

  snowblind(b, team, lv, x, y, d) {
    b.zone(team, 'snow', x, y, d.r, d.t, lv, { card: 'snowblind' });
    fx(b, team, 'snowblind', x, y, d.r);
  },

  spark(b, team, lv, x, y, d) {
    const e = b._nearestFoe(team, x, y, d.reach, true);
    if (!e) {
      b.emit({ t: 'zap', team, pts: [[x, y - 6], [x, y]] });
      return;
    }
    b.damage(e, d.dmg * levelScale(lv), { team, x, y, spell: true });
    b.emit({ t: 'zap', team, pts: [[e.x + 0.4, e.y - 7], [e.x, e.y]] });
    b._gainMana(team, d.refund, e.x, e.y);
  },

  chain(b, team, lv, x, y, d) {
    const k = levelScale(lv);
    const first = b._nearestFoe(team, x, y, d.reach, true);
    if (!first) {
      b.emit({ t: 'zap', team, pts: [[x, y - 6], [x, y]] });
      return;
    }
    b.damage(first, d.dmg * k, { team, x, y, spell: true });
    const pts = [[first.x + 0.5, first.y - 7], [first.x, first.y]];
    const others = b._foes(team)
      .filter((e) => e !== first && e.type !== 'tower' && dist(e, first) <= d.arcRange)
      .sort((a, c) => dist(a, first) - dist(c, first))
      .slice(0, d.arcs);
    for (const e of others) {
      b.damage(e, d.arc * k, { team, x, y, spell: true });
      pts.push([e.x, e.y]);
    }
    b.emit({ t: 'zap', team, pts });
  },

  tempest(b, team, lv, x, y, d) {
    b.zone(team, 'aim', x, y, d.r, d.delay, lv, {
      card: 'tempest',
      done: () => {
        b.area(team, x, y, d.r, d.dmg * levelScale(lv));
        b.emit({ t: 'zap', team, pts: [[x - 0.5, y - 8], [x + 0.3, y - 4], [x, y]], big: true });
        fx(b, team, 'tempest', x, y, d.r);
        const foe = b.players[1 - team];
        const took = Math.min(d.steal, Math.floor(foe.mana));
        if (took > 0) {
          foe.mana -= took;
          b._gainMana(team, took, x, y);
          b.emit({ t: 'drain', team: 1 - team, n: took });
        }
      },
    });
  },

  skybreaker(b, team, lv, x, y, d) {
    b.zone(team, 'aim', x, y, d.r, d.delay, lv, {
      card: 'skybreaker', mark: true,
      done: () => {
        b.area(team, x, y, d.r, d.dmg * levelScale(lv));
        b.emit({ t: 'zap', team, pts: [[x, y - 12], [x - 0.6, y - 7], [x + 0.4, y - 3], [x, y]], big: true });
        fx(b, team, 'skybreaker', x, y, d.r);
      },
    });
  },

  cyclone(b, team, lv, x, y, d) {
    b.zone(team, 'cyclone', x, y, d.r, d.t, lv, { tick: d.tick, vy: fwd(team) * d.drift, card: 'cyclone' });
  },

  tailwind(b, team, lv, x, y, d) {
    b.players[team].tailwindT = d.t;
    b.emit({ t: 'buff', team, card: 'tailwind' });
  },

  shadow_bolt(b, team, lv, x, y, d) {
    const k = levelScale(lv);
    b.launch(team, x, y, d, (p) => {
      b.area(team, p.tx, p.ty, d.r, d.dmg * k);
      b._healWeakest(team, d.heal * k);
      fx(b, team, 'shadow_bolt', p.tx, p.ty, d.r);
    }, { card: 'shadow_bolt' });
  },

  soul_drain(b, team, lv, x, y, d) {
    const k = levelScale(lv);
    b.zone(team, 'aim', x, y, d.r, d.delay, lv, {
      card: 'soul_drain',
      done: () => {
        const hit = b.area(team, x, y, d.r, d.dmg * k);
        b._healWeakest(team, Math.min(d.dmg * k, hit.total * d.drain));
        fx(b, team, 'soul_drain', x, y, d.r);
      },
    });
  },

  curse_rot(b, team, lv, x, y, d) {
    b.zone(team, 'rot', x, y, d.r, d.t, lv, { tick: d.tick, card: 'curse_rot' });
    fx(b, team, 'curse_rot', x, y, d.r);
  },

  blood_pact(b, team, lv, x, y, d) {
    const k = b.king(team);
    k.hp = Math.max(1, k.hp - d.pay);
    k.flash = 0.2;
    if (!k.active) {
      k.active = true;
      b.emit({ t: 'wake', team, x: k.x, y: k.y });
    }
    b.emit({ t: 'spell', team, card: 'blood_pact', x: k.x, y: k.y, r: 2, fx: 'blood' });
    b._gainMana(team, d.mana, k.x, k.y);
  },

  cursed_blast(b, team, lv, x, y, d) {
    b.launch(team, x, y, d, (p) => {
      b.area(team, p.tx, p.ty, d.r, d.dmg * levelScale(lv), {
        then: (e) => {
          if (e.type !== 'troop') return;
          e.curseT = Math.max(e.curseT, d.curse);
          e.cursedBy = team;
        },
      });
      fx(b, team, 'cursed_blast', p.tx, p.ty, d.r);
    }, { card: 'cursed_blast' });
  },

  corpse_explosion(b, team, lv, x, y, d) {
    const u = b._nearestOwn(team, x, y, d.reach, false);
    if (!u) return;
    const amount = Math.min(2 * u.hp, d.dmg * levelScale(lv));
    u.alive = false;
    b.emit({ t: 'die', id: u.id, team, type: 'troop', card: u.card, x: u.x, y: u.y, air: u.air, sacrificed: true });
    b.area(team, u.x, u.y, d.r, amount);
    fx(b, team, 'corpse_explosion', u.x, u.y, d.r);
  },

  nightmare(b, team, lv, x, y, d) {
    b.players[1 - team].nightT = d.t;
    b.emit({ t: 'nightmare', team: 1 - team });
  },

  missiles(b, team, lv, x, y, d) {
    const k = levelScale(lv);
    const near = b._foes(team)
      .filter((e) => distXY(e, x, y) <= d.reach + e.r)
      .sort((a, c) => (a.type === 'tower') - (c.type === 'tower') || distXY(a, x, y) - distXY(c, x, y));
    for (let i = 0; i < d.darts; i++) {
      const e = near.length ? near[i % near.length] : null;
      const tx = e ? e.x : x + (i - 1) * 0.6, ty = e ? e.y : y;
      b.zone(team, 'wait', x, y, 0, 0.12 * i, lv, {
        done: () => {
          const p = b.launch(team, tx, ty, d, () => {
            if (!p.blocked && e && e.alive) b.damage(e, d.dmg * k, { team, x: p.tx, y: p.ty, spell: true });
            else b.area(team, p.tx, p.ty, 0.6, d.dmg * k);
            fx(b, team, 'missiles', p.tx, p.ty, 0.6);
          }, { card: 'missiles' });
          p.target = e;
        },
      });
    }
  },

  mana_font(b, team, lv, x, y, d) {
    b.players[team].fontT = d.t;
    b.emit({ t: 'buff', team, card: 'mana_font' });
  },

  time_warp(b, team, lv, x, y, d) {
    b.players[1 - team].warpT = d.t;
    b.emit({ t: 'warp', team: 1 - team, T: d.t });
  },

  gravity_well(b, team, lv, x, y, d) {
    b.zone(team, 'gravity', x, y, d.r, d.t, lv, { tick: d.tick, card: 'gravity_well' });
    fx(b, team, 'gravity_well', x, y, d.r);
  },

  blink(b, team, lv, x, y, d) {
    const movers = b.entities.filter((e) => e.alive && e.team === team && e.type === 'troop' && e.card !== 'phoenix_egg' && distXY(e, x, y) <= d.reach + e.r);
    for (const e of movers) {
      const from = [e.x, e.y];
      e.y = clamp(e.y + fwd(team) * d.jump, 0.4, H - 0.4);
      if (!e.air && e.y > RIVER[0] && e.y < RIVER[1]) {
        let onBridge = false;
        for (const bx of BRIDGES) if (Math.abs(e.x - bx) <= BRIDGE_HALF) onBridge = true;
        if (!onBridge) e.y = team === 0 ? RIVER[0] - 0.1 : RIVER[1] + 0.1;
      }
      e.target = null;
      e.attacking = false;
      b.emit({ t: 'blink', team, id: e.id, from, to: [e.x, e.y] });
    }
  },

  magic_injection(b, team, lv, x, y, d) {
    const u = b._nearestOwn(team, x, y, d.reach, true);
    if (!u) return;
    u.bonusDmg += d.bonus * levelScale(lv);
    b.emit({ t: 'boost', team, card: 'magic_injection', x: u.x, y: u.y, id: u.id });
  },

  spell_steal(b, team, lv, x, y, d) {
    const e = b._nearestFoe(team, x, y, d.reach, true);
    b.emit({ t: 'zap', team, pts: [[b.king(team).x, b.king(team).y], [e ? e.x : x, e ? e.y : y]], arcane: true });
    if (!e) return null;
    b.damage(e, d.dmg * levelScale(lv), { team, x, y, spell: true });
    const next = b.players[1 - team].queue[0];
    if (!next) return null;
    b.emit({ t: 'steal', team, card: next.id });
    return { id: next.id, lv: next.lv, temp: true };
  },

  card_trick(b, team) {
    const p = b.players[team];
    const old = p.hand.filter(Boolean);
    for (const c of old) if (!c.temp) p.queue.push(c);
    p.hand = [0, 1, 2, 3].map(() => p.queue.shift() || null);
    b.emit({ t: 'shuffle', team });
  },

  holy_light(b, team, lv, x, y, d) {
    const k = levelScale(lv);
    for (const e of b.entities) {
      if (!e.alive || e.team !== team || e.type === 'trap') continue;
      if (distXY(e, x, y) <= d.r + e.r * 0.5) b._heal(e, d.heal * k);
    }
    b.emit({ t: 'heal', team, x, y, r: d.r });
  },

  oath(b, team, lv, x, y, d) {
    const k = levelScale(lv);
    for (const e of b.entities) {
      if (!e.alive || e.team !== team || e.type === 'trap') continue;
      if (distXY(e, x, y) > d.r + e.r * 0.5) continue;
      e.shield += d.shield * k;
      b._heal(e, d.heal * k);
    }
    b.emit({ t: 'shield', team, x, y, r: d.r, holy: true });
  },

  verdict(b, team, lv, x, y, d) {
    const k = levelScale(lv);
    b.zone(team, 'aim', x, y, d.r, d.delay, lv, {
      card: 'verdict',
      done: () => {
        b.area(team, x, y, d.r, d.dmg * k);
        b._healWeakest(team, d.heal * k);
        fx(b, team, 'verdict', x, y, d.r);
      },
    });
  },

  vital_tincture(b, team, lv, x, y, d) {
    const k = levelScale(lv);
    const u = b._nearestOwn(team, x, y, d.reach, true);
    if (u) {
      u.maxHp += d.heal * k;
      u.hp += d.heal * k;
      b.emit({ t: 'boost', team, card: 'vital_tincture', x: u.x, y: u.y, id: u.id });
    } else {
      b._healWeakest(team, d.heal * k);
    }
  },

  purify(b, team) {
    const kinds = new Set();
    for (const e of b.entities) {
      if (!e.alive || e.team !== team) continue;
      if (e.burnT > 0) { kinds.add('burn'); e.burnT = 0; e.burnDps = 0; }
      if (e.poisonT > 0) { kinds.add('poison'); e.poisonT = 0; e.poisonDps = 0; }
      if (e.slowT > 0) { kinds.add('slow'); e.slowT = 0; }
      if (e.curseT > 0) { kinds.add('curse'); e.curseT = 0; e.cursedBy = -1; }
      if (e.freezeT > 0) { kinds.add('freeze'); e.freezeT = 0; }
      if (e.rootT > 0) { kinds.add('root'); e.rootT = 0; }
    }
    const k = b.king(team);
    b.emit({ t: 'heal', team, x: k.x, y: k.y - 4, r: 6, purify: true });
    if (kinds.size) b._gainMana(team, kinds.size, k.x, k.y);
  },
};

function shieldAround(b, team, x, y, r, amount) {
  for (const e of b.entities) {
    if (!e.alive || e.team !== team || e.type === 'trap') continue;
    if (distXY(e, x, y) <= r + e.r * 0.5) e.shield += amount;
  }
  b.emit({ t: 'shield', team, x, y, r });
}
