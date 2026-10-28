// THE ARENA ON THE SCREEN. It reads the battle (sim.js) and draws it, every frame, and turns what happened since the
// last frame (the battle's events) into light: sparks, smoke, lightning, rings, shards of ice, and floating numbers.
// Nothing here changes the battle.
//
// Everything is drawn in the arena's own tiles, through one transform. Upright (the usual way) the near side, team 0,
// is at the bottom. For a Duo Duel on a phone lying flat it can be turned a quarter (team 0 on the left) and the far
// side's pieces are turned to face their own player.
import { ART, TEAM, cardImage, drawCandle, eggSprite, paintBridge, paintFloor, paintRiver, token, towerBody, towerRubble } from './art.js';
import { BRIDGES, BRIDGE_HALF, H, RIVER, W } from './sim.js';

const TOP = 2.2;          // rows of wall drawn beyond the far edge, where the far towers stand up into
const BOTTOM = 0.6;

const FX_COLORS = {
  fire: ['#fff3b0', '#ffc24a', '#ff7a1a', '#c4321a'],
  frost: ['#ffffff', '#cdeeff', '#73ccff', '#3b7fd6'],
  snow: ['#ffffff', '#e6f4ff', '#b8d8f0'],
  storm: ['#ffffff', '#f3ecff', '#d9ccff', '#8f7aff'],
  wind: ['#ffffff', '#d9e4f0', '#9fb3c8'],
  shadow: ['#e6c8ff', '#b07ae6', '#7a3fc0', '#3a1a66'],
  poison: ['#d8ff9a', '#9ae65a', '#5aa83a', '#7a3fc0'],
  arcane: ['#ffffff', '#e0c8ff', '#bf80ff', '#7a4fd6'],
  holy: ['#ffffff', '#fff6c8', '#ffeb8c', '#e8c46a'],
  blood: ['#ffd0d0', '#ff5a5a', '#b81a2a', '#5a0a14'],
  meteor: ['#fff3b0', '#ffae3c', '#ff5a1a', '#6a3a2a'],
  barrel: ['#fff3b0', '#ffae3c', '#ff7a1a', '#5a3a1a'],
};

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

export class ArenaView {
  /**
   * `canvas`: where to draw. `opts`: {viewer: the team whose traps are shown (or -1 for both), duo: pieces face
   * their own player}.
   */
  constructor(canvas, battle, cards, opts = {}) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.b = battle;
    this.cards = cards;
    this.viewer = opts.viewer === undefined ? 0 : opts.viewer;
    this.duo = !!opts.duo;
    this.turn = 0;                 // 0 upright, 1 a quarter turn clockwise (team 0 on the left)
    this.floor = paintFloor(TOP, BOTTOM);
    this.river = paintRiver();
    this.bridge = paintBridge();
    this.parts = [];
    this.rings = [];
    this.zaps = [];
    this.texts = [];
    this.ghosts = [];
    this.flights = [];
    this.shake = 0;
    this.time = 0;
    this.previews = [];            // {team, card, x, y, ok, r, place, token...}: a card being aimed, one a player
    this.zoneShow = [0, 0];        // how strongly each side's deploy zone is shown
    this.dpr = 1;
    this.box = { x: 0, y: 0, w: 1, h: 1 };
    this.S = 1;
    for (const c of cards) cardImage(c.id);
  }

  // ---------------------------------------------------------------- where things are
  /**
   * Fits the arena into a box of the canvas (CSS pixels): `box` {x, y, w, h}, `turn` 0 or 1. With a turn the arena
   * lies on its side and fills the box edge to edge; upright it keeps a strip of wall above the far towers.
   */
  layout(box, turn, dpr) {
    this.box = box;
    this.turn = turn;
    this.dpr = dpr;
    // the strip of wall is only wanted where the far towers stand upright; in a Duo Duel they face their own player,
    // and the river must sit exactly on the crease
    const top = this.duo ? 0 : TOP, bottom = this.duo ? 0 : BOTTOM;
    const spanX = turn ? H : W;
    const spanY = turn ? W : H + top + bottom;
    this.S = Math.min(box.w / spanX, box.h / spanY);
    const usedW = spanX * this.S, usedH = spanY * this.S;
    this.ox = box.x + (box.w - usedW) / 2;
    this.oy = box.y + (box.h - usedH) / 2 + (turn ? 0 : top * this.S);
  }

  /** The world transform, in device pixels. */
  _world(ctx, shakeX = 0, shakeY = 0) {
    const S = this.S * this.dpr, d = this.dpr;
    if (this.turn) ctx.setTransform(0, S, -S, 0, (this.ox + H * this.S + shakeX) * d, (this.oy + shakeY) * d);
    else ctx.setTransform(S, 0, 0, S, (this.ox + shakeX) * d, (this.oy + shakeY) * d);
  }

  /** A point on the screen (CSS pixels) back to the arena's tiles. */
  toWorld(px, py) {
    if (this.turn) return { x: (py - this.oy) / this.S, y: H - (px - this.ox) / this.S };
    return { x: (px - this.ox) / this.S, y: (py - this.oy) / this.S };
  }

  toScreen(x, y) {
    if (this.turn) return { x: this.ox + (H - y) * this.S, y: this.oy + x * this.S };
    return { x: this.ox + x * this.S, y: this.oy + y * this.S };
  }

  /** Whether a side's pieces are turned half round to face their own player (the far side, in a Duo Duel). */
  _flip(team) {
    return this.duo && team === 1;
  }

  // ---------------------------------------------------------------- what happened
  absorb(events) {
    for (const ev of events) {
      const h = ON[ev.t];
      if (h) h.call(this, ev);
    }
  }

  burst(x, y, n, colors, o = {}) {
    for (let i = 0; i < n && this.parts.length < 700; i++) {
      const a = o.up ? rnd(-Math.PI * 0.9, -Math.PI * 0.1) : rnd(0, Math.PI * 2);
      const sp = rnd(o.min || 1, o.speed || 4);
      this.parts.push({
        x: x + rnd(-1, 1) * (o.spread || 0), y: y + rnd(-1, 1) * (o.spread || 0),
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: 0, life: rnd(o.life || 0.5, (o.life || 0.5) * 1.8),
        color: pick(colors), size: rnd(o.size || 0.12, (o.size || 0.12) * 1.8), grav: o.grav === undefined ? 4 : o.grav,
        drag: o.drag || 2.5, kind: o.kind || 'sq', rise: o.rise || 0,
      });
    }
  }

  ring(x, y, r, color, T = 0.45, o = {}) {
    this.rings.push({ x, y, r, color, t: 0, T, width: o.width || 0.18, fill: o.fill || null, grow: o.grow === undefined ? 1 : o.grow });
  }

  float(x, y, text, color, o = {}) {
    this.texts.push({ x, y, text, color, t: 0, T: o.T || 1.1, size: o.size || 0.7, team: o.team === undefined ? 0 : o.team });
  }

  zap(pts, color, width = 0.12, T = 0.28) {
    this.zaps.push({ pts, color, width, t: 0, T });
  }

  // ---------------------------------------------------------------- one frame
  draw(dt) {
    this.time += dt;
    const ctx = this.ctx;
    const b = this.b;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.cv.width, this.cv.height);
    ctx.imageSmoothingEnabled = false;
    this.shake = Math.max(0, this.shake - dt * 3);
    const sx = (Math.random() - 0.5) * this.shake * this.S * 0.5, sy = (Math.random() - 0.5) * this.shake * this.S * 0.5;
    this._world(ctx, sx, sy);
    // the floor, the river running, the bridges
    if (this.turn) ctx.drawImage(this.floor, 0, 0, this.floor.width, this.floor.height, 0, -TOP, W, H + TOP + BOTTOM);
    else ctx.drawImage(this.floor, 0, 0, this.floor.width, this.floor.height, 0, -TOP, W, H + TOP + BOTTOM);
    this._river(ctx);
    // the halves a card may be put down on, while one is being aimed
    this._zones(ctx, dt);
    this._fields(ctx);
    this._traps(ctx);
    const list = b.entities.filter((e) => e.alive && e.type !== 'trap');
    const dead = b.towers[0].concat(b.towers[1]).filter((t) => !t.alive);
    for (const t of dead) this._rubble(ctx, t);
    for (const e of list) this._shadow(ctx, e);
    const ground = list.filter((e) => !e.air).sort((a, c) => this._depth(a) - this._depth(c));
    for (const e of ground) this._piece(ctx, e);
    for (const g of this.ghosts) this._ghost(ctx, g, dt);
    this.ghosts = this.ghosts.filter((g) => g.t < g.T);
    const air = list.filter((e) => e.air).sort((a, c) => this._depth(a) - this._depth(c));
    for (const e of air) this._piece(ctx, e);
    this._projectiles(ctx);
    this._effects(ctx, dt);
    for (const e of list) this._bars(ctx, e);
    this._previewDraw(ctx);
    this._texts(ctx, dt);
  }

  /** Back to front: what is nearer the bottom of the screen is drawn later. */
  _depth(e) {
    return this.turn ? -e.y : e.y;
  }

  _river(ctx) {
    const rh = RIVER[1] - RIVER[0];
    const tile = this.river.width / ART;
    const off = (this.time * 0.9) % tile;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, RIVER[0], W, rh);
    ctx.clip();
    for (let x = -off; x < W; x += tile) ctx.drawImage(this.river, x, RIVER[0], tile, rh);
    // a shimmer that drifts across
    ctx.globalAlpha = 0.18 + 0.08 * Math.sin(this.time * 2);
    ctx.fillStyle = '#9ad8ff';
    for (let i = 0; i < 5; i++) {
      const x = (this.time * 1.7 + i * 4.1) % (W + 2) - 1;
      ctx.fillRect(x, RIVER[0] + 0.5 + (i % 3) * 0.4, 0.8, 0.07);
    }
    ctx.restore();
    const bh = this.bridge.height / ART;
    for (const x of BRIDGES) ctx.drawImage(this.bridge, x - BRIDGE_HALF, RIVER[0] - (bh - rh) / 2, BRIDGE_HALF * 2, bh);
  }

  _zones(ctx, dt) {
    for (const team of [0, 1]) {
      const want = this.previews.some((p) => p.team === team && p.place === 'own') ? 1 : 0;
      this.zoneShow[team] += (want - this.zoneShow[team]) * Math.min(1, dt * 10);
      const k = this.zoneShow[team];
      if (k < 0.02) continue;
      const col = TEAM[team];
      ctx.save();
      ctx.globalAlpha = 0.16 * k;
      ctx.fillStyle = col.ring;
      if (team === 0) ctx.fillRect(0.3, RIVER[1] + 0.4, W - 0.6, H - RIVER[1] - 0.7);
      else ctx.fillRect(0.3, 0.3, W - 0.6, RIVER[0] - 0.7);
      // an open pocket behind a broken tower
      for (const lane of [0, 1]) {
        if (this.b.towers[1 - team][lane + 1].alive) continue;
        const x0 = lane === 0 ? 0.4 : W / 2, x1 = lane === 0 ? W / 2 : W - 0.4;
        if (team === 0) ctx.fillRect(x0, 9.6, x1 - x0, RIVER[0] - 0.4 - 9.6);
        else ctx.fillRect(x0, RIVER[1] + 0.4, x1 - x0, H - 9.6 - RIVER[1] - 0.4);
      }
      ctx.globalAlpha = 0.5 * k;
      ctx.strokeStyle = col.light;
      ctx.lineWidth = 0.06;
      ctx.setLineDash([0.3, 0.25]);
      if (team === 0) ctx.strokeRect(0.3, RIVER[1] + 0.4, W - 0.6, H - RIVER[1] - 0.7);
      else ctx.strokeRect(0.3, 0.3, W - 0.6, RIVER[0] - 0.7);
      ctx.restore();
    }
  }

  /** The lasting clouds, wells, storms and marks on the floor. */
  _fields(ctx) {
    for (const z of this.b.zones) {
      const k = z.T ? z.t / z.T : 0;
      ctx.save();
      if (z.kind === 'rot') {
        const g = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
        g.addColorStop(0, 'rgba(120,200,70,0.32)');
        g.addColorStop(0.7, 'rgba(110,60,170,0.22)');
        g.addColorStop(1, 'rgba(110,60,170,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
        ctx.fill();
        if (Math.random() < 0.5) this.burst(z.x + rnd(-z.r, z.r) * 0.7, z.y + rnd(-z.r, z.r) * 0.7, 1, FX_COLORS.poison, { speed: 0.4, min: 0.1, grav: -1, life: 0.8, size: 0.14, kind: 'bubble' });
      } else if (z.kind === 'snow') {
        ctx.fillStyle = 'rgba(220,240,255,0.18)';
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 2; i++) this.burst(z.x + rnd(-z.r, z.r), z.y - z.r * 0.8 + rnd(0, z.r), 1, FX_COLORS.snow, { speed: 1.4, min: 0.6, grav: 1.5, life: 0.7, size: 0.1 });
      } else if (z.kind === 'gravity') {
        const spin = this.time * 4;
        for (let i = 0; i < 4; i++) {
          ctx.strokeStyle = 'rgba(191,128,255,' + (0.55 - i * 0.11) + ')';
          ctx.lineWidth = 0.12;
          ctx.beginPath();
          ctx.arc(z.x, z.y, z.r * (1 - ((this.time * 0.6 + i * 0.25) % 1)), spin + i, spin + i + 4.2);
          ctx.stroke();
        }
        ctx.fillStyle = '#16081f';
        ctx.beginPath();
        ctx.arc(z.x, z.y, 0.45 + 0.08 * Math.sin(this.time * 9), 0, Math.PI * 2);
        ctx.fill();
      } else if (z.kind === 'cyclone') {
        for (let i = 0; i < 7; i++) {
          const a = this.time * 9 + i * 0.9, rr = z.r * (0.3 + i * 0.1);
          ctx.strokeStyle = 'rgba(220,235,255,' + (0.6 - i * 0.06) + ')';
          ctx.lineWidth = 0.1;
          ctx.beginPath();
          ctx.ellipse(z.x, z.y - i * 0.18, rr, rr * 0.45, 0, a, a + 3.6);
          ctx.stroke();
        }
        if (Math.random() < 0.6) this.burst(z.x, z.y, 1, FX_COLORS.wind, { speed: 3, min: 1.5, grav: 0, life: 0.4, size: 0.08 });
      } else if (z.kind === 'cinder') {
        ctx.globalAlpha = Math.min(1, (z.T - z.t) * 2) * 0.55;
        ctx.fillStyle = '#ff6a1a';
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        if (Math.random() < 0.15) this.burst(z.x, z.y, 1, FX_COLORS.fire, { speed: 0.6, grav: -2, life: 0.5, size: 0.1 });
      } else if (z.kind === 'aim') {
        // where a slow spell is about to land: a shadow, a ring tightening, the side's colour
        const col = TEAM[z.team];
        ctx.globalAlpha = 0.25 + 0.5 * k;
        ctx.fillStyle = z.card === 'abs_zero' ? 'rgba(160,220,255,0.35)' : 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.r * (0.4 + 0.6 * k), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = z.card === 'skybreaker' ? '#fff3a0' : col.light;
        ctx.lineWidth = 0.1;
        ctx.setLineDash([0.4, 0.3]);
        ctx.lineDashOffset = -this.time * 2;
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
        ctx.stroke();
        if (z.card === 'verdict') {
          ctx.globalAlpha = 0.5 * k;
          ctx.fillStyle = '#fff6c8';
          ctx.fillRect(z.x - 0.4 * k, z.y - 30, 0.8 * k, 30);
        }
      }
      ctx.restore();
    }
  }

  _traps(ctx) {
    for (const e of this.b.entities) {
      if (!e.alive || e.type !== 'trap') continue;
      if (this.viewer >= 0 && e.team !== this.viewer) continue;
      const col = TEAM[e.team];
      ctx.save();
      ctx.globalAlpha = 0.35 + 0.15 * Math.sin(this.time * 3 + e.id);
      ctx.strokeStyle = e.card === 'grave_hand' ? '#d8cdb8' : col.light;
      ctx.lineWidth = 0.08;
      ctx.beginPath();
      ctx.arc(e.x, e.y, 0.75, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = this.time * 0.5 + (i * Math.PI * 4) / 5;
        ctx[i ? 'lineTo' : 'moveTo'](e.x + Math.cos(a) * 0.6, e.y + Math.sin(a) * 0.6);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  _shadow(ctx, e) {
    if (e.type === 'tower') return;
    const r = this._size(e) * 0.5;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(e.x, e.y + (e.air ? 0.25 : 0.12), r * (e.air ? 0.7 : 0.85), r * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /** How big a piece is drawn, in tiles: bigger than its footprint, so the picture can be made out. */
  _size(e) {
    if (e.card === 'phoenix_egg') return 0.9;
    if (e.wall) return e.wall.hw * 2;
    return Math.max(0.86, Math.min(2.3, e.r * 2.5));
  }

  _piece(ctx, e) {
    if (e.type === 'tower') return this._tower(ctx, e);
    const b = this.b;
    const flip = this._flip(e.team);
    let dx = 0, dy = 0;
    // a step's bob while walking, a lunge on a blow
    if (e.moving && !e.attacking && e.deployT <= 0 && !e.air) dy -= Math.abs(Math.sin(this.time * 9 + e.id)) * 0.07;
    const since = b.t - e.hitAt;
    if (since < 0.14 && e.face !== undefined && !e.proj) {
      const k = Math.sin((since / 0.14) * Math.PI) * 0.22;
      dx += Math.cos(e.face) * k;
      dy += Math.sin(e.face) * k;
    }
    const lift = e.air ? 0.85 + Math.sin(this.time * 3 + e.id) * 0.08 : 0;
    ctx.save();
    ctx.translate(e.x + dx, e.y + dy);
    if (flip) ctx.rotate(Math.PI);
    ctx.translate(0, -lift);
    // dropping in while it deploys
    if (e.deployT > 0) {
      const k = Math.max(0, Math.min(1, e.deployT));
      ctx.globalAlpha = 1 - k * 0.55;
      ctx.translate(0, -k * 0.6);
      ctx.scale(1 + k * 0.25, 1 + k * 0.25);
    }
    const size = this._size(e);
    if (e.card === 'phoenix_egg') {
      const egg = eggSprite(e.team);
      const wob = Math.sin(this.time * (8 + (3 - (e.eggT || 0)) * 6)) * 0.12;
      ctx.rotate(wob);
      ctx.drawImage(egg, -size / 2, -size * 0.75, size, size * 18 / 14);
    } else if (e.wall) {
      this._wall(ctx, e);
    } else {
      const d = Math.round(size * ART);
      const tk = token(e.card, e.team, d, { building: e.type === 'building', mirror: e.mirror });
      if (tk) {
        const s = tk.width / ART;
        ctx.drawImage(tk, -s / 2, -s / 2, s, s);
      } else {
        ctx.fillStyle = TEAM[e.team].ring;
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (e.mirror) {
        // a holofoil shimmer over a mirror image
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.25 + 0.15 * Math.sin(this.time * 4 + e.id);
        ctx.fillStyle = 'hsl(' + ((this.time * 120 + e.id * 40) % 360) + ',90%,65%)';
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }
    }
    // being hit: a white flash
    if (e.flash > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(0.75, e.flash * 6);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.48, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
    this._status(ctx, e, size);
    ctx.restore();
    if (e.deployT > 0 && e.card !== 'phoenix_egg') {
      // the summoning circle under it
      const col = TEAM[e.team];
      ctx.save();
      ctx.strokeStyle = col.light;
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 0.08;
      ctx.beginPath();
      ctx.arc(e.x, e.y, size * 0.7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - Math.min(1, e.deployT)));
      ctx.stroke();
      ctx.restore();
    }
  }

  _wall(ctx, e) {
    const hw = e.wall.hw, hh = e.wall.hh;
    const col = TEAM[e.team];
    ctx.fillStyle = '#0c0912';
    ctx.fillRect(-hw - 0.05, -hh - 0.55, hw * 2 + 0.1, hh * 2 + 0.6);
    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < 6; i++) {
        const x = -hw + (i + (row % 2) * 0.5) * (hw / 3);
        if (x + hw / 3 > hw + 0.01) continue;
        ctx.fillStyle = row === 0 ? '#9b8fd0' : (row === 1 ? '#7b6cc0' : '#5e4f9e');
        ctx.fillRect(x + 0.03, -hh - 0.5 + row * (hh * 2 + 0.5) / 3, hw / 3 - 0.06, (hh * 2 + 0.5) / 3 - 0.06);
      }
    }
    ctx.fillStyle = col.ring;
    ctx.fillRect(-hw, hh - 0.08, hw * 2, 0.08);
    ctx.fillStyle = 'rgba(200,170,255,' + (0.3 + 0.2 * Math.sin(this.time * 3)) + ')';
    ctx.fillRect(-hw * 0.2, -hh - 0.3, hw * 0.4, 0.12);
  }

  /** What is on a piece: ice, fire, poison, a curse, a root, a shield. */
  _status(ctx, e, size) {
    const r = size * 0.5;
    if (e.shield > 0) {
      ctx.strokeStyle = 'rgba(140,220,255,' + (0.55 + 0.2 * Math.sin(this.time * 6)) + ')';
      ctx.lineWidth = 0.1;
      ctx.beginPath();
      for (let i = 0; i <= 6; i++) {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * (r + 0.18), Math.sin(a) * (r + 0.18));
      }
      ctx.stroke();
    }
    if (e.freezeT > 0) {
      ctx.fillStyle = 'rgba(190,235,255,0.55)';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) {
        const a = i * 1.7 + e.id;
        ctx.fillRect(Math.cos(a) * r * 0.6 - 0.04, Math.sin(a) * r * 0.6 - 0.15, 0.08, 0.3);
      }
    } else if (e.slowT > 0) {
      ctx.strokeStyle = 'rgba(115,204,255,0.7)';
      ctx.lineWidth = 0.07;
      ctx.beginPath();
      ctx.arc(0, 0, r + 0.08, this.time * 2, this.time * 2 + 2);
      ctx.stroke();
    }
    if (e.burnT > 0 && Math.random() < 0.35) this.burst(e.x + rnd(-r, r) * 0.6, e.y - (e.air ? 0.85 : 0) + rnd(-r, r) * 0.4, 1, FX_COLORS.fire, { speed: 0.6, grav: -3, life: 0.35, size: 0.1 });
    if (e.poisonT > 0 && Math.random() < 0.2) this.burst(e.x + rnd(-r, r) * 0.6, e.y - (e.air ? 0.85 : 0), 1, FX_COLORS.poison, { speed: 0.4, grav: -1.5, life: 0.6, size: 0.1, kind: 'bubble' });
    if (e.curseT > 0) {
      ctx.fillStyle = 'rgba(158,89,217,' + (0.6 + 0.3 * Math.sin(this.time * 5)) + ')';
      ctx.fillRect(-0.12, -r - 0.42, 0.24, 0.2);
      ctx.fillRect(-0.08, -r - 0.24, 0.16, 0.08);
    }
    if (e.rootT > 0) {
      ctx.strokeStyle = '#d8cdb8';
      ctx.lineWidth = 0.08;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 0.15, r * 0.9);
        ctx.lineTo(i * 0.18, r * 0.35);
        ctx.stroke();
      }
    }
    if (e.blindT > 0 && Math.random() < 0.2) this.burst(e.x, e.y - r, 1, FX_COLORS.snow, { speed: 0.5, grav: 1, life: 0.4, size: 0.07 });
    if (e.feather) {
      ctx.fillStyle = '#ffae3c';
      ctx.fillRect(r * 0.5, -r - 0.1, 0.1, 0.35);
      ctx.fillStyle = '#ffe27a';
      ctx.fillRect(r * 0.5 + 0.1, -r - 0.05, 0.08, 0.22);
    }
    if (e.bonusDmg > 0 && Math.random() < 0.08) this.burst(e.x, e.y, 1, FX_COLORS.arcane, { speed: 1, grav: -1, life: 0.4, size: 0.08 });
  }

  _tower(ctx, t) {
    const body = towerBody(t.team, t.tower);
    const flip = this._flip(t.team);
    const k = 1 / ART;
    ctx.save();
    ctx.translate(t.x, t.y);
    if (flip) ctx.rotate(Math.PI);
    ctx.scale(k, k);
    ctx.translate(-body.w / 2, -body.footY - (t.tower === 'king' ? 2 : 1));
    if (t.flash > 0) ctx.filter = 'brightness(1.6)';
    ctx.drawImage(body.canvas, 0, 0);
    ctx.filter = 'none';
    const frozenFlame = this.b.players[t.team].warpT > 0;
    drawCandle(ctx, t.team, body, t.hp / t.maxHp, frozenFlame ? 0 : this.time, true);
    if (t.tower === 'king' && !t.active) {
      // a sleeping king: its banner hangs dim until it is woken
      ctx.fillStyle = 'rgba(10,6,16,0.35)';
      ctx.fillRect(body.w / 2 - 8, body.rimY + 8, 16, 24);
    }
    if (t.shield > 0) {
      ctx.strokeStyle = 'rgba(140,220,255,0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, body.rimY - 4, body.w - 4, body.h - body.rimY);
    }
    if (t.slowT > 0) {
      ctx.fillStyle = 'rgba(115,204,255,0.25)';
      ctx.fillRect(0, body.rimY, body.w, body.h - body.rimY - 6);
    }
    ctx.restore();
  }

  _rubble(ctx, t) {
    const r = towerRubble(t.tower);
    const flip = this._flip(t.team);
    ctx.save();
    ctx.translate(t.x, t.y);
    if (flip) ctx.rotate(Math.PI);
    ctx.scale(1 / ART, 1 / ART);
    ctx.drawImage(r.canvas, -r.w / 2, -r.h + 10);
    ctx.restore();
    if (Math.random() < 0.06) this.burst(t.x + rnd(-0.3, 0.3), t.y - 0.5, 1, ['#5a5560', '#3e3a46'], { speed: 0.3, grav: -0.8, life: 1.6, size: 0.22, drag: 0.5, kind: 'smoke' });
  }

  _ghost(ctx, g, dt) {
    g.t += dt;
    const k = g.t / g.T;
    const tk = token(g.card, g.team, g.d, { building: g.building });
    if (!tk) return;
    const s = tk.width / ART;
    ctx.save();
    ctx.translate(g.x, g.y - (g.air ? 0.85 : 0) - k * 0.4);
    if (this._flip(g.team)) ctx.rotate(Math.PI);
    ctx.globalAlpha = 1 - k;
    ctx.scale(1 - k * 0.5, 1 - k * 0.5);
    ctx.rotate(k * 0.8);
    ctx.drawImage(tk, -s / 2, -s / 2, s, s);
    ctx.restore();
  }

  _projectiles(ctx) {
    for (const p of this.b.projectiles) {
      ctx.save();
      if (p.kind === 'barrel') {
        const tk = token('barrel', p.team, 20, {});
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rolled * 2.4 * (p.dir || 1));
        if (tk) ctx.drawImage(tk, -0.7, -0.7, 1.4, 1.4);
        ctx.restore();
        if (Math.random() < 0.4) this.burst(p.x, p.y + 0.4 * -p.dir, 1, ['#5a4a3a', '#7a6a5a'], { speed: 0.5, grav: 0, life: 0.4, size: 0.12, kind: 'smoke' });
        continue;
      }
      const h = p.h || 0;
      if (p.kind === 'unit') {
        this._shot(ctx, p);
        ctx.restore();
        continue;
      }
      const fx = p.fx || 'arcane';
      const col = FX_COLORS[fx] || FX_COLORS.arcane;
      const big = p.card === 'meteor' ? 0.75 : (p.card === 'pyroclasm' ? 0.5 : 0.28);
      if (h > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, big, big * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      const y = p.y - h;
      if (p.card === 'meteor') {
        ctx.fillStyle = '#4a3226';
        ctx.beginPath();
        ctx.arc(p.x, y, big, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#7a5a46';
        ctx.fillRect(p.x - big * 0.5, y - big * 0.5, big * 0.5, big * 0.4);
      } else if (p.card === 'frost_shard' || p.card === 'icicle_volley') {
        const a = Math.atan2(p.ty - p.y, p.tx - p.x);
        ctx.translate(p.x, y);
        ctx.rotate(a);
        ctx.fillStyle = '#e6f6ff';
        ctx.beginPath();
        ctx.moveTo(0.35, 0);
        ctx.lineTo(-0.25, -0.12);
        ctx.lineTo(-0.25, 0.12);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#73ccff';
        ctx.fillRect(-0.25, -0.05, 0.3, 0.1);
      } else {
        ctx.fillStyle = col[2];
        ctx.beginPath();
        ctx.arc(p.x, y, big, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = col[0];
        ctx.beginPath();
        ctx.arc(p.x - big * 0.25, y - big * 0.25, big * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      if (Math.random() < 0.9) this.burst(p.x, y, 1, col, { speed: 0.6, grav: 0, life: 0.3, size: big * 0.5 });
    }
  }

  /** A unit's or a tower's shot. */
  _shot(ctx, p) {
    const a = Math.atan2(p.ty - p.y, p.tx - p.x);
    const col = TEAM[p.team];
    ctx.translate(p.x, p.y);
    ctx.rotate(a);
    if (p.tower === 'princess') {
      ctx.fillStyle = '#e8d8b8';
      ctx.fillRect(-0.35, -0.03, 0.6, 0.06);
      ctx.fillStyle = col.light;
      ctx.fillRect(0.2, -0.07, 0.15, 0.14);
    } else if (p.tower === 'king') {
      ctx.fillStyle = col.flame[2];
      ctx.beginPath();
      ctx.arc(0, 0, 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col.flame[0];
      ctx.beginPath();
      ctx.arc(0.05, -0.05, 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.card === 'seraph') {
      ctx.fillStyle = '#fff6c8';
      ctx.fillRect(-0.3, -0.05, 0.55, 0.1);
      ctx.fillStyle = '#ffeb8c';
      ctx.fillRect(-0.5, -0.03, 0.25, 0.06);
    } else {
      ctx.fillStyle = '#ffae3c';
      ctx.beginPath();
      ctx.arc(0, 0, 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff3b0';
      ctx.fillRect(-0.05, -0.05, 0.1, 0.1);
    }
  }

  _effects(ctx, dt) {
    // rings
    this.rings = this.rings.filter((r) => {
      r.t += dt;
      const k = r.t / r.T;
      const rr = r.r * (r.grow ? 0.35 + 0.65 * Math.min(1, k * 1.6) : 1);
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - k);
      if (r.fill) {
        ctx.fillStyle = r.fill;
        ctx.beginPath();
        ctx.arc(r.x, r.y, rr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = r.color;
      ctx.lineWidth = r.width * (1 - k * 0.5);
      ctx.beginPath();
      ctx.arc(r.x, r.y, rr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return r.t < r.T;
    });
    // particles
    ctx.save();
    this.parts = this.parts.filter((p) => {
      p.t += dt;
      p.vx -= p.vx * p.drag * dt;
      p.vy -= p.vy * p.drag * dt;
      p.vy += p.grav * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const k = p.t / p.life;
      ctx.globalAlpha = Math.max(0, 1 - k);
      ctx.fillStyle = p.color;
      const s = p.kind === 'smoke' ? p.size * (1 + k * 2) : p.size * (1 - k * 0.4);
      if (p.kind === 'bubble' || p.kind === 'smoke') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, s * 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      return p.t < p.life;
    });
    ctx.restore();
    // lightning
    this.zaps = this.zaps.filter((z) => {
      z.t += dt;
      const k = z.t / z.T;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - k);
      for (const [w, color] of [[z.width * 3, 'rgba(180,160,255,0.35)'], [z.width, z.color]]) {
        ctx.strokeStyle = color;
        ctx.lineWidth = w;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for (let i = 0; i < z.pts.length - 1; i++) {
          const [x0, y0] = z.pts[i], [x1, y1] = z.pts[i + 1];
          if (i === 0) ctx.moveTo(x0, y0);
          const n = 4;
          for (let s = 1; s <= n; s++) {
            const f = s / n;
            const j = s === n ? 0 : 0.35;
            ctx.lineTo(x0 + (x1 - x0) * f + rnd(-j, j), y0 + (y1 - y0) * f + rnd(-j, j));
          }
        }
        ctx.stroke();
      }
      ctx.restore();
      return z.t < z.T;
    });
  }

  /** Health bars: a tower's always, with its number; a summon's once it is hurt; a building's time running out. */
  _bars(ctx, e) {
    if (e.card === 'phoenix_egg') return;
    const col = TEAM[e.team];
    const flip = this._flip(e.team);
    const frac = Math.max(0, e.hp / e.maxHp);
    if (e.type === 'tower') {
      // a tower's bar sits in front of its base, clear of the candle and of whatever is drawn above the field
      const w = e.tower === 'king' ? 3.2 : 2.4, hgt = 0.34;
      const off = -(e.r * 0.72 + 0.3);
      ctx.save();
      ctx.translate(e.x, e.y);
      if (flip) ctx.rotate(Math.PI);
      ctx.translate(0, -off);
      ctx.fillStyle = 'rgba(8,5,13,0.85)';
      ctx.fillRect(-w / 2 - 0.06, -0.06, w + 0.12, hgt + 0.12);
      ctx.fillStyle = col.bar;
      ctx.fillRect(-w / 2, 0, w * frac, hgt);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(-w / 2, 0, w * frac, 0.08);
      if (e.shield > 0) {
        ctx.fillStyle = '#9fe0ff';
        ctx.fillRect(-w / 2, hgt - 0.1, Math.min(w, (w * e.shield) / e.maxHp), 0.1);
      }
      ctx.restore();
      this._label(e.x, e.y, -off + hgt / 2, String(Math.ceil(e.hp)), 0.42, '#ffffff', flip);
      return;
    }
    const size = this._size(e);
    const lift = e.air ? 0.85 : 0;
    if (e.type === 'building' && e.lifeMax) {
      ctx.save();
      ctx.translate(e.x, e.y - lift);
      ctx.strokeStyle = 'rgba(8,5,13,0.7)';
      ctx.lineWidth = 0.14;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.62, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = col.light;
      ctx.lineWidth = 0.08;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.62, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, e.life / e.lifeMax));
      ctx.stroke();
      ctx.restore();
    }
    if (frac >= 0.999 && e.shield <= 0) return;
    const w = Math.max(0.8, size * 0.9), hgt = 0.14;
    ctx.save();
    ctx.translate(e.x, e.y);
    if (flip) ctx.rotate(Math.PI);
    ctx.translate(0, -lift - size * 0.62 - 0.22);
    ctx.fillStyle = 'rgba(8,5,13,0.85)';
    ctx.fillRect(-w / 2 - 0.04, -0.04, w + 0.08, hgt + 0.08);
    ctx.fillStyle = col.bar;
    ctx.fillRect(-w / 2, 0, w * frac, hgt);
    if (e.shield > 0) {
      ctx.fillStyle = '#9fe0ff';
      ctx.fillRect(-w / 2, -0.08, Math.min(w, (w * e.shield) / e.maxHp), 0.06);
    }
    ctx.restore();
  }

  /** Words on the field, drawn upright in screen pixels (a tiny font under a big transform draws badly). */
  _label(x, y, dy, text, size, color, flip) {
    const ctx = this.ctx;
    const p = this.toScreen(x, y + (flip ? -dy : dy));
    const d = this.dpr;
    ctx.save();
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.translate(p.x, p.y);
    // upright for whoever is reading it: in a Duo Duel each side's words face their own player
    if (this.duo) ctx.rotate(this.turn ? (flip ? -Math.PI / 2 : Math.PI / 2) : (flip ? Math.PI : 0));
    ctx.font = 'bold ' + Math.max(8, Math.round(size * this.S)) + 'px ui-monospace, "SF Mono", Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(2, this.S * 0.12);
    ctx.strokeStyle = 'rgba(8,5,13,0.9)';
    ctx.strokeText(text, 0, 0);
    ctx.fillStyle = color;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  _texts(ctx, dt) {
    this.texts = this.texts.filter((t) => {
      t.t += dt;
      const k = t.t / t.T;
      const flip = this._flip(t.team);
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - k * k);
      this._label(t.x, t.y, -k * 1.2, t.text, t.size * (k < 0.15 ? 1 + (0.15 - k) * 3 : 1), t.color, flip);
      ctx.restore();
      return t.t < t.T;
    });
  }

  _previewDraw(ctx) {
    for (const p of this.previews) this._previewOne(ctx, p);
  }

  _previewOne(ctx, p) {
    const col = TEAM[p.team];
    ctx.save();
    const bad = !p.ok;
    ctx.globalAlpha = 0.85;
    if (p.r) {
      ctx.fillStyle = bad ? 'rgba(255,80,80,0.18)' : 'rgba(255,255,255,0.14)';
      ctx.strokeStyle = bad ? '#ff6a6a' : col.light;
      ctx.lineWidth = 0.08;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    if (p.token) {
      const d = Math.round(Math.max(0.86, Math.min(2.3, (p.size || 0.5) * 2.5)) * ART);
      const tk = token(p.card, p.team, d, { building: p.building });
      const n = p.count || 1;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + 0.6;
        const off = n > 1 ? 0.45 : 0;
        if (tk) {
          const s = tk.width / ART;
          ctx.save();
          ctx.translate(p.x + Math.cos(a) * off, p.y + Math.sin(a) * off);
          if (this._flip(p.team)) ctx.rotate(Math.PI);
          ctx.globalAlpha = bad ? 0.35 : 0.7;
          ctx.drawImage(tk, -s / 2, -s / 2, s, s);
          ctx.restore();
        }
      }
    }
    // a cross at the very point
    ctx.strokeStyle = bad ? '#ff6a6a' : '#ffffff';
    ctx.lineWidth = 0.07;
    ctx.beginPath();
    ctx.moveTo(p.x - 0.3, p.y);
    ctx.lineTo(p.x + 0.3, p.y);
    ctx.moveTo(p.x, p.y - 0.3);
    ctx.lineTo(p.x, p.y + 0.3);
    ctx.stroke();
    ctx.restore();
  }
}

// ==================================================================== what each event looks like
const ON = {
  deploy(ev) {
    const col = TEAM[ev.team];
    this.ring(ev.x, ev.y, 1.1, col.light, 0.5, { width: 0.1 });
    this.burst(ev.x, ev.y + 0.2, 8, ['#8a8098', '#5d5670'], { speed: 1.6, grav: 0, life: 0.4, size: 0.14, kind: 'smoke' });
    if (ev.mirror) this.ring(ev.x, ev.y, 1.4, '#e6d4ff', 0.6, { width: 0.14 });
  },

  attack(ev) {
    if (ev.ranged) return;
    const col = ev.card === 'ember_sprite' || ev.card === 'phoenix' || ev.card === 'inferno_golem' ? FX_COLORS.fire
      : ev.card === 'thunder_roc' ? FX_COLORS.storm : ev.card === 'sentinel' ? FX_COLORS.frost : ['#ffffff', '#e8e3d8', '#b0a8c0'];
    this.burst(ev.tx, ev.ty, 4, col, { speed: 2.4, life: 0.22, size: 0.1 });
  },

  die(ev) {
    if (ev.type === 'tower') return;
    if (ev.type === 'troop' || ev.type === 'building') {
      if (ev.card && ev.card !== 'phoenix_egg') {
        const def = this.b.entities.find((e) => e.id === ev.id);
        const d = Math.round(Math.max(0.86, Math.min(2.3, (def ? def.r : 0.5) * 2.5)) * ART);
        this.ghosts.push({ x: ev.x, y: ev.y, card: ev.card, team: ev.team, d, t: 0, T: 0.45, air: ev.air, building: ev.type === 'building' });
      }
      this.burst(ev.x, ev.y - (ev.air ? 0.85 : 0), 10, ['#9a90a8', '#6a6278', '#e8e3d8'], { speed: 2.2, grav: -0.5, life: 0.5, size: 0.18, kind: 'smoke' });
    }
  },

  tower(ev) {
    const col = TEAM[ev.team];
    this.shake = ev.tower === 'king' ? 1.4 : 1;
    this.burst(ev.x, ev.y - 1, 40, ['#8f8a9c', '#5d586f', '#b2adc2', '#46415a'], { speed: 7, grav: 9, life: 0.9, size: 0.3 });
    this.burst(ev.x, ev.y - 1.5, 24, ['#fbf3dc', '#efe2c0'], { speed: 5, grav: 7, life: 0.8, size: 0.2 });
    this.burst(ev.x, ev.y - 1, 26, ['#5a5560', '#3e3a46', '#2a2630'], { speed: 2.5, grav: -1.2, life: 1.6, size: 0.45, kind: 'smoke', drag: 1.2 });
    this.burst(ev.x, ev.y - 3, 18, col.flame, { speed: 4, grav: -2, life: 0.6, size: 0.18 });
    this.ring(ev.x, ev.y, 4, col.light, 0.7, { width: 0.25 });
  },

  spell(ev) {
    const colors = FX_COLORS[ev.fx] || FX_COLORS.arcane;
    const r = ev.r || 1.5;
    const n = Math.round(10 + r * 10);
    this.ring(ev.x, ev.y, r, colors[1], 0.45, { width: 0.22, fill: colors[2] + '33' });
    this.burst(ev.x, ev.y, n, colors, { speed: 2 + r * 2.4, life: 0.45, size: 0.16 + r * 0.03, spread: r * 0.3 });
    if (ev.fx === 'fire' || ev.fx === 'meteor' || ev.fx === 'barrel') {
      this.burst(ev.x, ev.y, Math.round(n * 0.6), ['#5a4a40', '#3e3430'], { speed: 1.5, grav: -1, life: 1, size: 0.35, kind: 'smoke', spread: r * 0.4 });
    }
    if (ev.fx === 'frost') this.burst(ev.x, ev.y, n, ['#ffffff', '#cdeeff'], { speed: r * 2, grav: 6, life: 0.6, size: 0.12, up: true });
    if (ev.fx === 'holy') {
      for (let i = 0; i < 6; i++) this.zap([[ev.x + rnd(-r, r) * 0.6, ev.y - 9], [ev.x + rnd(-r, r) * 0.5, ev.y]], '#fff6c8', 0.18, 0.4);
    }
    if (ev.card === 'meteor' || ev.card === 'verdict' || ev.card === 'skybreaker' || ev.card === 'abs_zero') this.shake = Math.max(this.shake, 0.9);
  },

  zap(ev) {
    this.zap(ev.pts, ev.arcane ? '#e0c8ff' : '#ffffff', ev.big ? 0.22 : (ev.small ? 0.07 : 0.13), ev.big ? 0.4 : 0.25);
    const [x, y] = ev.pts[ev.pts.length - 1];
    this.burst(x, y, ev.small ? 3 : 10, FX_COLORS.storm, { speed: 3, life: 0.3, size: 0.12 });
    if (ev.big) this.shake = Math.max(this.shake, 0.8);
  },

  heal(ev) {
    const n = ev.small ? 3 : Math.round(10 + ev.r * 5);
    this.burst(ev.x, ev.y, n, FX_COLORS.holy, { speed: 0.8, grav: -2.5, life: 0.8, size: 0.12, spread: (ev.r || 1) * 0.7 });
    if (!ev.small) this.ring(ev.x, ev.y, ev.r, '#ffeb8c', 0.6, { width: 0.14, fill: 'rgba(255,235,140,0.12)' });
  },

  shield(ev) {
    this.ring(ev.x, ev.y, ev.r, ev.holy ? '#ffeb8c' : '#9fe0ff', 0.6, { width: 0.2, fill: 'rgba(160,220,255,0.12)', grow: 0 });
    this.burst(ev.x, ev.y, 12, ['#ffffff', '#cdeeff', '#9fe0ff'], { speed: 2, grav: 0, life: 0.5, size: 0.12, spread: ev.r * 0.5 });
  },

  mana(ev) {
    if (ev.x === undefined) return;
    this.float(ev.x, ev.y - 1, '+' + ev.n, '#ff8ad8', { team: ev.team, size: 0.75 });
  },

  trap(ev) {
    const colors = ev.card === 'grave_hand' ? ['#ffffff', '#d8cdb8', '#8a7f6a'] : FX_COLORS.shadow;
    this.ring(ev.x, ev.y, ev.r, colors[1], 0.5, { width: 0.2 });
    this.burst(ev.x, ev.y, 18, colors, { speed: 3.5, life: 0.5, size: 0.14, up: true });
  },

  reflect(ev) {
    this.ring(ev.x, ev.y, 1.6, '#e6d4ff', 0.6, { width: 0.18 });
    if (ev.to) this.zap([[ev.x, ev.y], ev.to], '#e6d4ff', 0.08, 0.35);
  },

  redirect(ev) {
    this.zap([ev.from, [ev.x, ev.y - 1]], '#ffffff', 0.12, 0.35);
    this.ring(ev.x, ev.y, 1.2, '#d9ccff', 0.4);
  },

  block(ev) {
    this.burst(ev.x, ev.y, 6, ['#c8b8ff', '#ffffff'], { speed: 2.5, life: 0.25, size: 0.1 });
  },

  blink(ev) {
    this.burst(ev.from[0], ev.from[1], 10, FX_COLORS.arcane, { speed: 2, life: 0.4, size: 0.12 });
    this.burst(ev.to[0], ev.to[1], 14, FX_COLORS.arcane, { speed: 2.5, life: 0.5, size: 0.12 });
    this.ring(ev.to[0], ev.to[1], 1, '#bf80ff', 0.4);
  },

  egg(ev) { this.burst(ev.x, ev.y, 16, FX_COLORS.fire, { speed: 3, life: 0.5, size: 0.14 }); },
  hatch(ev) {
    this.burst(ev.x, ev.y, 24, FX_COLORS.fire, { speed: 4, life: 0.6, size: 0.16, up: true });
    this.ring(ev.x, ev.y, 1.5, '#ffc24a', 0.5);
  },
  reborn(ev) { this.burst(ev.x, ev.y, 20, FX_COLORS.fire, { speed: 3.5, life: 0.6, size: 0.14, up: true }); },
  rise(ev) { this.burst(ev.x, ev.y, 14, FX_COLORS.shadow, { speed: 2.5, grav: -2, life: 0.6, size: 0.14 }); },
  snuff(ev) { this.burst(ev.x, ev.y - 0.4, 8, ['#8a8098', '#5d5670'], { speed: 0.6, grav: -1.5, life: 1, size: 0.16, kind: 'smoke' }); },
  boost(ev) {
    const colors = ev.card === 'phoenix_feather' ? FX_COLORS.fire : (ev.card === 'vital_tincture' ? FX_COLORS.holy : FX_COLORS.arcane);
    this.burst(ev.x, ev.y, 14, colors, { speed: 1.5, grav: -2, life: 0.6, size: 0.12 });
    this.ring(ev.x, ev.y, 0.9, colors[1], 0.4);
  },
  wake(ev) {
    this.burst(ev.x, ev.y - 3.2, 14, TEAM[ev.team].flame, { speed: 2.5, grav: -3, life: 0.5, size: 0.14 });
  },
  expire(ev) { this.burst(ev.x, ev.y, 8, ['#9a90a8', '#6a6278'], { speed: 1.2, grav: -0.5, life: 0.5, size: 0.16, kind: 'smoke' }); },
};
