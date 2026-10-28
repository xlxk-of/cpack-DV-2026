// THE COMPUTER WIZARD. It plays by the same rules as a person, through canPlay() and play() only, and sees only what
// is on the field. Every half second or so it looks at its hand and asks each card what it would be worth to play it
// now and where: on an enemy push coming over the river, on a clump worth a spell, behind a tank, on a tower it can
// finish. The best offer above what the card costs is played. `skill` (0 to 1) sets how quickly it notices a push,
// how much mana it lets go to waste, how good a spell has to be before it spends one, and how carefully it aims.
import { BATTLE, levelScale } from './cards.js';
import { BRIDGES, CENTER, H, MANA_MAX, RIVER, W, fwd, rng } from './sim.js';

const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const distXY = (a, x, y) => Math.hypot(a.x - x, a.y - y);

export class Brain {
  constructor(battle, team, skill = 0.5, seed = 7) {
    this.b = battle;
    this.team = team;
    this.skill = clamp(skill, 0, 1);
    this.rand = rng(seed);
    const s = this.skill;
    this.thinkEvery = lerp(0.75, 0.3, s);
    this.react = lerp(1.7, 0.35, s);
    this.pushAt = lerp(9.6, 7.2, s);
    this.spellBar = lerp(1.45, 0.95, s);
    this.noise = lerp(1.6, 0.25, s);
    this.blunder = lerp(0.18, 0.01, s);
    this.wait = 1.2 + this.rand() * 1.5;        // a breath at the start before the first card
    this.seen = new Map();                      // enemy id -> when it was first noticed
    this.cards = battle.cards;
  }

  // ---------------------------------------------------------------- geometry, from this wizard's side
  /** y at a depth into the field: 0 is this wizard's back edge, 30 the enemy's. */
  Y(depth) {
    return this.team === 1 ? depth : H - depth;
  }

  depth(y) {
    return this.team === 1 ? y : H - y;
  }

  // ---------------------------------------------------------------- the loop
  update(dt) {
    const b = this.b;
    if (b.over) return;
    this.wait -= dt;
    if (this.wait > 0) return;
    this.wait = this.thinkEvery * (0.8 + this.rand() * 0.4);
    const me = b.players[this.team];
    if (me.warpT > 0) return;
    const ctx = this._look();
    if (me.nightT > 0) return this._blind(ctx);
    if (this.rand() < this.blunder && me.mana >= 6) return this._blind(ctx);
    let best = null;
    me.hand.forEach((c, slot) => {
      if (!c) return;
      const cost = b.costOf(this.team, slot);
      const offer = this._offer(c, cost, ctx);
      if (!offer) return;
      offer.slot = slot;
      offer.cost = cost;
      offer.net = offer.score - cost * offer.bar;
      if (!best || offer.net > best.net) best = offer;
    });
    // nothing worth it: still, never sit on a full bar of mana
    if ((!best || best.net < 0) && me.mana >= MANA_MAX - 0.4) best = this._dump(ctx);
    if (!best || (best.net !== undefined && best.net < 0)) return;
    if (me.mana < best.cost) return;           // worth it, but not yet affordable: wait for it
    this._place(best);
  }

  _place(o) {
    const b = this.b;
    const n = o.exact ? 0 : this.noise;
    for (let tries = 0; tries < 8; tries++) {
      const jx = tries === 0 ? (this.rand() - 0.5) * n : (this.rand() - 0.5) * (1 + tries);
      const jy = tries === 0 ? (this.rand() - 0.5) * n * 0.6 : (this.rand() - 0.5) * (1 + tries);
      const x = clamp(o.x + jx, 0.6, W - 0.6), y = clamp(o.y + jy, 0.6, H - 0.6);
      if (b.canPlay(this.team, o.slot, x, y).ok) {
        b.play(this.team, o.slot, x, y);
        return true;
      }
    }
    return false;
  }

  /** The hand is face down (a Nightmare), or the wizard fumbles: any card it can pay for, anywhere it may go. */
  _blind() {
    const b = this.b;
    const me = b.players[this.team];
    const slots = [0, 1, 2, 3].filter((s) => me.hand[s] && b.costOf(this.team, s) <= me.mana);
    if (!slots.length || me.mana < 4) return;
    const slot = slots[Math.floor(this.rand() * slots.length)];
    for (let i = 0; i < 6; i++) {
      const x = 1 + this.rand() * (W - 2), y = this.Y(1 + this.rand() * 12);
      if (b.canPlay(this.team, slot, x, y).ok) {
        b.play(this.team, slot, x, y);
        return;
      }
    }
  }

  // ---------------------------------------------------------------- what is on the field
  _look() {
    const b = this.b;
    const me = b.players[this.team];
    const foes = [], mine = [], threats = [];
    let threat = 0;
    for (const e of b.entities) {
      if (!e.alive || e.type === 'tower' || e.type === 'trap') continue;
      if (e.team === this.team) { mine.push(e); continue; }
      foes.push(e);
      if (e.type === 'troop' && e.card !== 'phoenix_egg' && this.depth(e.y) < 19.5) {
        if (!this.seen.has(e.id)) this.seen.set(e.id, b.t);
        if (b.t - this.seen.get(e.id) >= this.react) {
          const v = this.value(e) * (this.depth(e.y) < 12 ? 1.4 : 1);
          threats.push({ e, v });
          threat += v;
        }
      }
      if (e.type === 'building' && this.depth(e.y) < 15) {
        threats.push({ e, v: this.value(e) * 0.7 });
        threat += this.value(e) * 0.7;
      }
    }
    threats.sort((a, c) => this.depth(a.e.y) - this.depth(c.e.y));
    const pushing = mine.filter((e) => e.type === 'troop' && e.card !== 'phoenix_egg' && this.depth(e.y) > 13);
    const myTowers = b.towers[this.team].filter((t) => t.alive);
    const theirTowers = b.towers[1 - this.team].filter((t) => t.alive);
    return { me, foes, mine, threats, threat, pushing, myTowers, theirTowers };
  }

  /** Roughly what a thing on the field is worth, in mana. */
  value(e) {
    const c = this.cards[e.card];
    if (!c) return e.card === 'phoenix_egg' ? 3 : 1;
    const def = BATTLE[e.card] || {};
    const per = c.cost / (def.count || 1);
    return per * (0.35 + 0.65 * (e.hp / Math.max(1, e.maxHp)));
  }

  /** What a damaging spell landing at (x, y) would be worth. */
  spellWorth(def, lv, x, y, ctx, opts = {}) {
    const k = levelScale(lv);
    const dmg = (def.dps ? def.dps * def.t : def.dmg * (def.shards || 1)) * k;
    const r = opts.r || def.r || def.reach || 1.5;
    let v = 0, n = 0;
    for (const e of this.b.entities) {
      if (!e.alive || e.team === this.team || e.type === 'trap') continue;
      if (distXY(e, x, y) > r + e.r * 0.6) continue;
      if (e.type === 'tower') {
        // tower damage is worth more the nearer the end, and a tower it would finish is worth a great deal
        const hit = dmg * 0.35;
        const late = this.b.phase === 'overtime' || this.b.timeLeft() < 30 ? 2.2 : 1;
        v += hit >= e.hp + e.shield ? 9 : (hit / 150) * late;
        continue;
      }
      if (e.air && opts.ground) continue;
      const left = e.hp + e.shield;
      v += this.value(e) * Math.min(1, dmg / Math.max(1, left)) + (dmg >= left ? this.value(e) * 0.4 : 0);
      if (def.freeze || def.slow) v += this.value(e) * (def.freeze ? 0.45 : 0.15);
      n++;
    }
    return { v, n };
  }

  /** Where to aim a spell: on an enemy (a little ahead of it, if the spell takes its time) or between two of them. */
  _bestAim(def, lv, ctx, opts = {}) {
    const spots = [];
    const flight = (x, y) => {
      if (def.lob) return def.lob;
      if (def.delay) return def.delay;
      if (def.travel) return distXY(this.b.king(this.team), x, y) / def.travel;
      return 0;
    };
    const lead = (e) => {
      if (!e.moving || e.attacking || !e.speed) return [e.x, e.y];
      const t = flight(e.x, e.y);
      return [e.x + Math.cos(e.face || 0) * e.speed * t * 0.8, e.y + Math.sin(e.face || 0) * e.speed * t * 0.8];
    };
    const near = ctx.foes.filter((e) => e.type !== 'trap');
    for (const e of near) spots.push(lead(e));
    for (let i = 0; i < near.length && i < 10; i++) {
      for (let j = i + 1; j < near.length && j < 10; j++) {
        const a = lead(near[i]), c = lead(near[j]);
        if (Math.hypot(a[0] - c[0], a[1] - c[1]) < (def.r || 2) * 2) spots.push([(a[0] + c[0]) / 2, (a[1] + c[1]) / 2]);
      }
    }
    if (!opts.noTowers) for (const t of ctx.theirTowers) spots.push([t.x, t.y]);
    let best = null;
    for (const [x, y] of spots) {
      const w = this.spellWorth(def, lv, x, y, ctx, opts);
      if (!best || w.v > best.v) best = { x, y, v: w.v, n: w.n };
    }
    return best;
  }

  // ---------------------------------------------------------------- what each card would be worth now
  _offer(c, cost, ctx) {
    const def = BATTLE[c.id];
    if (!def) return null;
    const special = SPECIAL[c.id];
    if (special) return special.call(this, c, cost, ctx, def);
    switch (def.kind) {
      case 'troop': return this._troopOffer(c, cost, ctx, def);
      case 'building': return this._buildingOffer(c, cost, ctx, def);
      case 'trap': return this._trapOffer(c, cost, ctx, def);
      case 'spell': return this._spellOffer(c, cost, ctx, def);
      default: return null;
    }
  }

  _spellOffer(c, cost, ctx, def) {
    if (!def.dmg && !def.dps) return null;
    const aim = this._bestAim(def, c.lv, ctx);
    if (!aim || aim.v <= 0) return null;
    return { x: aim.x, y: aim.y, score: aim.v, bar: this.spellBar, exact: true };
  }

  /** The biggest push coming at this side, and the tower it is going for. */
  _danger(ctx) {
    if (!ctx.threats.length) return null;
    const t = ctx.threats[0].e;
    let tower = ctx.myTowers[0];
    for (const m of ctx.myTowers) if (dist(m, t) < dist(tower, t)) tower = m;
    return { e: t, tower, v: ctx.threat };
  }

  _canHit(def, e) {
    if (def.targets === 'buildings') return e.type === 'building' || e.type === 'tower';
    if (e.air) return def.targets === 'both';
    return true;
  }

  _troopOffer(c, cost, ctx, def) {
    const d = this._danger(ctx);
    if (d) {
      // defend: something that can hit what is coming, put between it and the tower
      if (!this._canHit(def, d.e)) return null;
      if (def.targets === 'buildings') return null;
      const isSwarm = (BATTLE[d.e.card] || {}).count > 1;
      let fit = 1;
      if (def.role === 'tank') fit = 0.7;
      if (isSwarm && !def.splash && def.count === undefined) fit *= 0.6;
      if (d.e.hp > 1200 && (def.role === 'mini' || def.role === 'air')) fit *= 1.3;
      if (d.e.air && def.air) fit *= 1.2;
      const score = Math.min(d.v, cost * 1.4) * fit + 0.5;
      const ranged = def.range >= 2;
      const gap = ranged ? -1.5 : 2.2;
      const toward = Math.sign(d.e.y - d.tower.y) || -fwd(this.team);
      let x = clamp(d.e.x * 0.6 + d.tower.x * 0.4, 1, W - 1);
      let y = d.tower.y + toward * (d.tower.r + gap);
      if (this.depth(d.e.y) > 14) {
        // still over the river: meet it at the bridge
        x = BRIDGES[d.e.x < CENTER ? 0 : 1];
        y = this.Y(12);
      }
      return { x, y, score, bar: 1 };
    }
    // attack: a tank from the back when the bar is full; a fighter at the bridge; or support behind a push
    const lane = this._lane(ctx);
    const lx = BRIDGES[lane];
    if (ctx.pushing.length) {
      const lead = ctx.pushing.reduce((a, e) => (this.depth(e.y) > this.depth(a.y) ? e : a));
      if (def.role === 'tank') return null;
      const behind = this.depth(lead.y) - (def.range >= 2 ? 3 : 1.5);
      const y = this.Y(Math.min(13, behind));
      return { x: lead.x, y, score: cost * 1.1, bar: 1 };
    }
    if (ctx.me.mana < this.pushAt - (def.role === 'tank' ? 0 : 1.5)) return null;
    if (def.role === 'tank') return { x: lx, y: this.Y(1.2), score: cost * 1.25, bar: 1 };
    if (def.role === 'copy') return null;
    return { x: lx, y: this.Y(13), score: cost * 1.05, bar: 1 };
  }

  /** The lane to push: the one whose tower is weaker, or whose pocket is open. */
  _lane(ctx) {
    const t = this.b.towers[1 - this.team];
    const a = t[1].alive ? t[1].hp : -1, c = t[2].alive ? t[2].hp : -1;
    if (a === c) return this.b.t % 40 < 20 ? 0 : 1;
    return a < c ? 0 : 1;
  }

  _buildingOffer(c, cost, ctx, def) {
    const d = this._danger(ctx);
    if (def.role === 'economy') return null;            // handled one by one
    if (!d) return null;
    if (def.targets === 'both' || def.taunt || def.wall || def.dread) {
      if (d.e.air && !def.dmg && !def.dread) return null;
      const score = Math.min(d.v, cost * 1.35) + 0.3;
      // in the middle of the near half, where it pulls a push off its lane
      const x = def.wall ? d.e.x : clamp((d.e.x + CENTER) / 2, 3, W - 3);
      const y = def.wall ? this.Y(clamp(this.depth(d.e.y) - 2, 6, 12)) : this.Y(def.taunt ? 9 : 7.5);
      return { x, y, score, bar: 1 };
    }
    return null;
  }

  _trapOffer(c, cost, ctx, def) {
    const d = this._danger(ctx);
    if (d && !d.e.air) {
      const ahead = this.depth(d.e.y) > 14 ? this.Y(12.6) : this.Y(Math.max(4, this.depth(d.e.y) - 2.2));
      const x = this.depth(d.e.y) > 14 ? BRIDGES[d.e.x < CENTER ? 0 : 1] : d.e.x;
      const worth = def.dmg ? Math.min(this.value(d.e), cost * 1.3) + 0.4 : (d.e.hp > 1000 ? cost * 1.2 : cost * 0.7);
      return { x, y: ahead, score: worth, bar: 1 };
    }
    // a quiet moment: lay it at a bridge mouth
    if (ctx.me.mana >= 8.5) return { x: BRIDGES[Math.floor(this.rand() * 2)], y: this.Y(12.4), score: cost * 1.02, bar: 1 };
    return null;
  }

  /** Mana about to spill over: play the cheapest troop at the back, or anything at all. */
  _dump(ctx) {
    const b = this.b;
    let best = null;
    ctx.me.hand.forEach((c, slot) => {
      if (!c) return;
      const def = BATTLE[c.id];
      const cost = b.costOf(this.team, slot);
      if (cost > ctx.me.mana) return;
      let x = CENTER + (this.rand() - 0.5) * 6, y = this.Y(2.5);
      let score = 0.1;
      if (def.kind === 'troop' && c.id !== 'mirror') score = 1 + cost * 0.1;
      if (def.role === 'economy') score = 0.8;
      if (def.kind === 'spell' || def.kind === 'ritual') {
        const t = ctx.theirTowers[0];
        if (!t) return;
        x = t.x;
        y = t.y;
        score = def.dmg ? 0.6 : 0.2;
      }
      if (!best || score > best.score) best = { x, y, score, slot, cost, bar: 0, net: score };
    });
    return best;
  }
}

// ==================================================================== cards that need a word of their own
const SPECIAL = {
  mirror(c, cost, ctx) {
    const best = ctx.foes.filter((e) => e.type === 'troop' && e.card !== 'phoenix_egg').sort((a, b) => this.value(b) - this.value(a))[0];
    if (!best || this.value(best) < 3) return null;
    const d = this._danger(ctx);
    const x = d ? d.e.x : BRIDGES[this._lane(ctx)];
    const y = d ? this.Y(clamp(this.depth(d.e.y) - 3, 4, 12)) : this.Y(12);
    return { x, y, score: this.value(best) * 1.1, bar: 1 };
  },

  mirror_wand(c, cost, ctx) {
    const last = ctx.me.lastCast;
    if (!last) return null;
    const def = BATTLE[last.id];
    const offer = this._offer({ id: last.id, lv: last.lv }, cost - 1, ctx);
    if (!offer) return null;
    void def;
    return { ...offer, score: offer.score * 0.95 };
  },

  candlewick(c, cost, ctx) {
    const fire = ctx.me.hand.filter((h) => h && this.cards[h.id].school === 'fire').length;
    if (ctx.threats.length || fire < 2) return null;
    return { x: CENTER + (this.rand() - 0.5) * 2, y: this.Y(0.9), score: 1.5 + fire * 0.5, bar: 1 };
  },

  mana_pump(c, cost, ctx) {
    if (ctx.threats.length || ctx.me.mana < 6) return null;
    return { x: this.rand() < 0.5 ? 1.2 : W - 1.2, y: this.Y(1.2), score: cost * 1.15, bar: 1 };
  },

  mana_font(c, cost, ctx) {
    if (ctx.threats.length || ctx.me.mana > 6) return null;
    return { x: CENTER, y: this.Y(3), score: 2.3, bar: 1 };
  },

  blood_pact(c, cost, ctx) {
    const k = this.b.king(this.team);
    if (ctx.threats.length && ctx.threat < 3) return null;
    if (k.hp / k.maxHp < 0.6 || ctx.me.mana > 6) return null;
    return { x: CENTER, y: this.Y(3), score: 3.4, bar: 1 };
  },

  soul_jar(c, cost, ctx) {
    if (!ctx.pushing.length && ctx.threat < 4) return null;
    return { x: CENTER + (this.rand() - 0.5) * 3, y: this.Y(2), score: cost * 1.1, bar: 1 };
  },

  nightmare(c, cost, ctx) {
    const foe = this.b.players[1 - this.team];
    if (foe.mana < 6 || (!ctx.pushing.length && ctx.threat > 2)) return null;
    return { x: CENTER, y: this.Y(5), score: cost * 1.1, bar: 1 };
  },

  time_warp(c, cost, ctx) {
    const atTower = ctx.pushing.filter((e) => e.attacking && e.target && e.target.type === 'tower').length;
    if (atTower >= 1 || ctx.threat >= 9) return { x: CENTER, y: this.Y(5), score: cost * 1.2, bar: 1 };
    return null;
  },

  card_trick(c, cost, ctx) {
    const dear = ctx.me.hand.filter((h) => h && this.cards[h.id].cost >= 5).length;
    if (ctx.threats.length || dear < 3) return null;
    return { x: CENTER, y: this.Y(5), score: 1.6, bar: 1 };
  },

  purify(c, cost, ctx) {
    let kinds = 0;
    const mine = this.b.entities.filter((e) => e.alive && e.team === this.team);
    for (const k of ['burnT', 'poisonT', 'slowT', 'curseT', 'freezeT', 'rootT']) if (mine.some((e) => e[k] > 0.5)) kinds++;
    if (kinds < 1) return null;
    return { x: CENTER, y: this.Y(5), score: kinds * 1.1 + 0.4, bar: 1 };
  },

  tailwind(c, cost, ctx) {
    if (ctx.pushing.length + ctx.mine.filter((e) => e.type === 'troop').length < 3) return null;
    return { x: CENTER, y: this.Y(5), score: 1.6, bar: 1 };
  },

  cinder_trail(c, cost, ctx) {
    const walkers = ctx.mine.filter((e) => e.type === 'troop' && !e.air && e.moving).length;
    if (walkers < 2) return null;
    return { x: CENTER, y: this.Y(5), score: 1.2 + walkers * 0.5, bar: 1 };
  },

  glacier_wall(c, cost, ctx) {
    const hurt = ctx.myTowers.filter((t) => t.hp / t.maxHp < 0.7).length;
    if (!ctx.threats.length || ctx.threat < 5) return null;
    return { x: CENTER, y: this.Y(5), score: 2.5 + hurt * 1.2, bar: 1 };
  },

  ice_ward(c, cost, ctx, def) { return this._wardOffer(c, cost, ctx, def); },
  oath(c, cost, ctx, def) { return this._wardOffer(c, cost, ctx, def); },
  holy_light(c, cost, ctx, def) { return this._wardOffer(c, cost, ctx, def); },

  vital_tincture(c, cost, ctx, def) {
    const u = this._bestFriend(ctx, 4);
    if (u) return { x: u.x, y: u.y, score: 2.6, bar: 1, exact: true };
    const t = this.b._weakest(this.team);
    if (t && t.maxHp - t.hp > 300) return { x: CENTER, y: this.Y(5), score: 2.4, bar: 1 };
    return null;
  },

  magic_injection(c, cost, ctx) {
    const u = this._bestFriend(ctx, 5, true);
    if (!u) return null;
    return { x: u.x, y: u.y, score: 3.4, bar: 1, exact: true };
  },

  phoenix_feather(c, cost, ctx) {
    const u = this._bestFriend(ctx, 5);
    if (!u || u.feather) return null;
    return { x: u.x, y: u.y, score: Math.min(6, this.value(u) * 0.9), bar: 1, exact: true };
  },

  corpse_explosion(c, cost, ctx, def) {
    let best = null;
    for (const u of ctx.mine) {
      if (u.type !== 'troop' || u.card === 'phoenix_egg') continue;
      if (u.hp / u.maxHp > 0.45) continue;
      const w = this.spellWorth({ ...def, dmg: Math.min(2 * u.hp, def.dmg * levelScale(c.lv)) }, 1, u.x, u.y, ctx);
      if (!best || w.v > best.v) best = { x: u.x, y: u.y, v: w.v };
    }
    if (!best) return null;
    return { x: best.x, y: best.y, score: best.v, bar: this.spellBar, exact: true };
  },

  blink(c, cost, ctx) {
    // a push waiting at the bridge, hopped over the river
    const group = ctx.mine.filter((e) => e.type === 'troop' && !e.attacking && this.depth(e.y) > 9 && this.depth(e.y) < 14.5);
    if (group.length < 1) return null;
    const lead = group[0];
    return { x: lead.x, y: lead.y, score: 1.6 + group.length * 0.6, bar: 1, exact: true };
  },

  spell_steal(c, cost, ctx, def) {
    const t = ctx.foes.find((e) => e.type !== 'trap') || ctx.theirTowers[0];
    if (!t || ctx.me.mana < 7) return null;
    return { x: t.x, y: t.y, score: cost * 1.05, bar: 1, exact: true };
  },

  snowblind(c, cost, ctx) {
    // blind the tower a push is walking into
    const at = ctx.pushing.find((e) => this.depth(e.y) > 18);
    if (!at) return null;
    let tower = ctx.theirTowers[0];
    for (const t of ctx.theirTowers) if (dist(t, at) < dist(tower, at)) tower = t;
    return { x: tower.x, y: tower.y, score: 1 + ctx.pushing.length * 1.1, bar: 1, exact: true };
  },

  lightning_rod(c, cost, ctx) {
    if (ctx.threats.length || ctx.me.mana < 8) return null;
    return { x: CENTER + (this.rand() - 0.5) * 4, y: this.Y(6), score: 2.1, bar: 1 };
  },

  cyclone(c, cost, ctx, def) {
    const d = this._danger(ctx);
    if (!d || this.depth(d.e.y) > 12) return this._spellOffer(c, cost, ctx, def);
    const n = ctx.threats.filter((t) => dist(t.e, d.e) < 2.5).length;
    return { x: d.e.x, y: d.e.y + fwd(1 - this.team) * -0.5, score: 1.5 + n * 1.1, bar: 1, exact: true };
  },

  gravity_well(c, cost, ctx, def) {
    return this._spellOffer(c, cost, ctx, { ...def, dmg: def.dps * def.t });
  },

  curse_rot(c, cost, ctx, def) {
    return this._spellOffer(c, cost, ctx, { ...def, dmg: def.dps * def.t });
  },

  cursed_blast(c, cost, ctx, def) {
    const aim = this._bestAim({ ...def, dmg: def.dmg * 2.5 }, c.lv, ctx, { noTowers: true });
    if (!aim || aim.n < 2) return null;
    return { x: aim.x, y: aim.y, score: aim.v, bar: this.spellBar, exact: true };
  },

  barrel(c, cost, ctx, def) {
    const d = this._danger(ctx);
    if (!d || d.e.air) return null;
    const lane = d.e.x < CENTER ? 0 : 1;
    const aim = this.spellWorth({ ...def, r: def.r * 2 }, c.lv, d.e.x, d.e.y, ctx, { ground: true });
    if (aim.v < 0.8) return null;
    // roll it from in front of the push, toward the river
    const y = this.Y(clamp(this.depth(d.e.y) - 1.5, 2, 13));
    return { x: d.e.x || BRIDGES[lane], y, score: aim.v * 1.2, bar: this.spellBar, exact: true };
  },

  icicle_volley(c, cost, ctx, def) {
    const aim = this._bestAim({ ...def, r: 1.2, dmg: def.dmg * 2.5 }, c.lv, ctx);
    if (!aim) return null;
    return { x: aim.x, y: aim.y, score: aim.v, bar: this.spellBar, exact: true };
  },

  missiles(c, cost, ctx, def) {
    const aim = this._bestAim({ ...def, r: def.reach, dmg: def.dmg * 1.6 }, c.lv, ctx);
    if (!aim) return null;
    return { x: aim.x, y: aim.y, score: aim.v, bar: this.spellBar, exact: true };
  },

  spark(c, cost, ctx, def) {
    const aim = this._bestAim({ ...def, r: 0.6 }, c.lv, ctx);
    if (!aim) return null;
    return { x: aim.x, y: aim.y, score: aim.v + 0.7, bar: this.spellBar, exact: true };
  },

  chain(c, cost, ctx, def) {
    const aim = this._bestAim({ ...def, r: def.arcRange * 0.8, dmg: def.arc * 1.2 }, c.lv, ctx);
    if (!aim) return null;
    return { x: aim.x, y: aim.y, score: aim.v, bar: this.spellBar, exact: true };
  },

  tempest(c, cost, ctx, def) {
    const aim = this._bestAim(def, c.lv, ctx);
    if (!aim) return null;
    const foe = this.b.players[1 - this.team];
    return { x: aim.x, y: aim.y, score: aim.v + Math.min(2, foe.mana) * 0.8, bar: this.spellBar, exact: true };
  },

  phoenix(c, cost, ctx, def) {
    return this._troopOffer(c, cost, ctx, def);
  },
};

Object.assign(Brain.prototype, {
  /** A shield or a heal: on a tower under attack, or on a push that is fighting. */
  _wardOffer(c, cost, ctx, def) {
    const k = levelScale(c.lv);
    const amount = ((def.shield || 0) + (def.heal || 0)) * k;
    let best = null;
    const spots = ctx.myTowers.map((t) => [t.x, t.y]).concat(ctx.mine.filter((e) => e.type === 'troop').map((e) => [e.x, e.y]));
    for (const [x, y] of spots) {
      let v = 0;
      for (const e of this.b.entities) {
        if (!e.alive || e.team !== this.team || e.type === 'trap') continue;
        if (distXY(e, x, y) > (def.r || 2.5) + e.r * 0.5) continue;
        const missing = e.maxHp - e.hp;
        const pressed = this.b.entities.some((o) => o.alive && o.team !== this.team && o.target === e);
        if (!pressed && missing < amount * 0.5) continue;
        const per = e.type === 'tower' ? 1 / 180 : this.value(e) / Math.max(1, e.maxHp);
        v += Math.min(amount, def.shield ? amount : missing) * per;
      }
      if (!best || v > best.v) best = { x, y, v };
    }
    if (!best || best.v <= 0) return null;
    return { x: best.x, y: best.y, score: best.v, bar: 1, exact: true };
  },

  /** A troop of this side worth boosting: the strongest one fighting, or the furthest forward. */
  _bestFriend(ctx, minCost, totemsToo) {
    let best = null, bv = 0;
    for (const e of ctx.mine) {
      if (e.card === 'phoenix_egg') continue;
      if (e.type !== 'troop' && !(totemsToo && e.type === 'building' && e.dmg > 0)) continue;
      const c = this.cards[e.card];
      if (!c || c.cost < minCost) continue;
      const v = this.value(e) + (e.attacking ? 2 : 0) + this.depth(e.y) * 0.1;
      if (v > bv) { bv = v; best = e; }
    }
    return best;
  },
});
