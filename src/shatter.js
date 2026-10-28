// GLASS BREAKING, as it breaks in the game (scripts/ui/CardShatter.gd): a pane is cut along a fracture (cracks run
// from the point of impact out to the edges, rings cross them, and every cell between two cracks and two rings is a
// shard), the cracks spread while the pane still holds, and then it gives way: the shards fly, spin, fall and fade,
// showing whatever lies under it. A card's old look breaks this way when it levels up, and a black locked card breaks
// this way when a Mythic Pack gives up its cosmetic -- in RAINBOW glass when what is under it is the rare one.
const RINGS = [0, 0.24, 0.52, 1];
const GRAVITY = 2300;
const LIFE = 1.0;
const FADE_FROM = 0.4;

export class Shatter {
  /**
   * `canvas` covers the pane. `opts`: {w, h, img (the pane's picture, else plain glass), rainbow, impact:[x,y]}.
   * Call crack(seconds), then burst(); `onDone` comes when the last shard has gone.
   */
  constructor(canvas, opts, onDone) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.w = opts.w;
    this.h = opts.h;
    this.img = opts.img || null;
    this.rainbow = !!opts.rainbow;
    this.onDone = onDone || (() => {});
    this.impact = opts.impact || [this.w * 0.5, this.h * 0.52];
    this.flash = 0;
    this.flashFall = 6;
    this.crackFor = 0;
    this.crackT = -1;
    this.burstT = -1;
    this.rays = [];
    this.shards = [];
    this._cut();
    this.last = 0;
    requestAnimationFrame(this._frame.bind(this));
  }

  _reach(dir) {
    let best = Infinity;
    if (dir[0] > 0.0001) best = Math.min(best, (this.w - this.impact[0]) / dir[0]);
    else if (dir[0] < -0.0001) best = Math.min(best, -this.impact[0] / dir[0]);
    if (dir[1] > 0.0001) best = Math.min(best, (this.h - this.impact[1]) / dir[1]);
    else if (dir[1] < -0.0001) best = Math.min(best, -this.impact[1] / dir[1]);
    return best;
  }

  _point(i, ring) {
    const r = this.rays[i];
    const x = this.impact[0] + r.dir[0] * r.reach * r.at[ring];
    const y = this.impact[1] + r.dir[1] * r.reach * r.at[ring];
    return [Math.max(0, Math.min(this.w, x)), Math.max(0, Math.min(this.h, y))];
  }

  _cut() {
    const angles = [];
    for (const c of [[0, 0], [this.w, 0], [this.w, this.h], [0, this.h]]) {
      angles.push(Math.atan2(c[1] - this.impact[1], c[0] - this.impact[0]));
    }
    for (let tries = 0; tries < 60 && angles.length < 15; tries++) {
      const a = (Math.random() * 2 - 1) * Math.PI;
      if (angles.every((b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))) >= 0.26)) angles.push(a);
    }
    angles.sort((a, b) => a - b);
    for (const a of angles) {
      const dir = [Math.cos(a), Math.sin(a)];
      const at = RINGS.map((f, i) => (i === 0 || i === RINGS.length - 1 ? f : Math.max(0.05, Math.min(0.95, f + (Math.random() - 0.5) * 0.12))));
      this.rays.push({ dir, reach: this._reach(dir), at });
    }
    for (let i = 0; i < this.rays.length; i++) {
      const j = (i + 1) % this.rays.length;
      for (let r = 0; r < RINGS.length - 1; r++) {
        const cell = r === 0
          ? [this.impact, this._point(i, 1), this._point(j, 1)]
          : [this._point(i, r), this._point(i, r + 1), this._point(j, r + 1), this._point(j, r)];
        this._shard(cell);
      }
    }
  }

  _shard(cell) {
    let mx = 0, my = 0;
    for (const p of cell) { mx += p[0]; my += p[1]; }
    mx /= cell.length;
    my /= cell.length;
    const hue = ((Math.atan2(my - this.impact[1], mx - this.impact[0]) / (Math.PI * 2)) + 1 + (Math.random() - 0.5) * 0.08) % 1;
    this.shards.push({
      pts: cell, mid: [mx, my], pos: [0, 0], rot: 0,
      vel: [0, 0], spin: 0,
      glint: Math.random() < 0.3 ? 0.12 + Math.random() * 0.18 : 0,
      stain: this.rainbow ? 'hsla(' + Math.round(hue * 360) + ',70%,62%,0.5)' : null,
      alpha: 1,
    });
  }

  crack(seconds) {
    this.crackFor = Math.max(0.01, seconds);
    this.crackT = 0;
    this.flash = 0.95;
    this.flashFall = 1 / this.crackFor;
  }

  burst() {
    this.burstT = 0;
    this.flash = 0.7;
    this.flashFall = 7;
    const half = Math.hypot(this.w, this.h) * 0.5;
    for (const s of this.shards) {
      const out = [s.mid[0] - this.impact[0], s.mid[1] - this.impact[1]];
      const len = Math.hypot(out[0], out[1]) || 1;
      const far = Math.min(1, len / half);
      const speed = (520 + Math.random() * 630) * (1.15 - 0.45 * far);
      s.vel = [out[0] / len * speed + (Math.random() - 0.5) * 180, out[1] / len * speed - 180 - Math.random() * 440];
      s.spin = (3 + Math.random() * 7) * (Math.random() < 0.5 ? 1 : -1);
    }
  }

  _frame(now) {
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0;
    this.last = now;
    if (!this.cv.isConnected) return;
    this._draw(dt);
    if (this.burstT >= 0 && this.burstT >= LIFE) {
      this.onDone();
      return;
    }
    requestAnimationFrame(this._frame.bind(this));
  }

  _draw(dt) {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.cv.width, this.cv.height);
    const k = this.cv.width / this.w;
    ctx.scale(k, k);
    ctx.imageSmoothingEnabled = false;
    if (this.flash > 0) this.flash = Math.max(0, this.flash - this.flashFall * dt * Math.max(this.flash, 0.25));
    if (this.burstT < 0) {
      // the pane still holds: the picture, and the cracks spreading over it
      if (this.img) ctx.drawImage(this.img, 0, 0, this.w, this.h);
      if (this.crackT >= 0) {
        this.crackT += dt;
        this._cracks(ctx);
      }
    } else {
      this.burstT += dt;
      for (const s of this.shards) {
        s.vel[1] += GRAVITY * dt;
        s.pos[0] += s.vel[0] * dt;
        s.pos[1] += s.vel[1] * dt;
        s.rot += s.spin * dt;
        s.alpha = Math.max(0, Math.min(1, (LIFE - this.burstT) / (LIFE - FADE_FROM)));
        this._shardDraw(ctx, s, Math.max(0.55, 1 - 0.4 * this.burstT));
      }
    }
    if (this.flash > 0) {
      ctx.fillStyle = 'rgba(255,255,255,' + Math.min(1, this.flash) + ')';
      ctx.fillRect(0, 0, this.w, this.h);
    }
  }

  _shardDraw(ctx, s, scale) {
    ctx.save();
    ctx.globalAlpha = s.alpha;
    ctx.translate(s.mid[0] + s.pos[0], s.mid[1] + s.pos[1]);
    ctx.rotate(s.rot);
    ctx.scale(scale, scale);
    ctx.translate(-s.mid[0], -s.mid[1]);
    ctx.beginPath();
    ctx.moveTo(s.pts[0][0], s.pts[0][1]);
    for (const p of s.pts.slice(1)) ctx.lineTo(p[0], p[1]);
    ctx.closePath();
    ctx.save();
    ctx.clip();
    if (this.img) ctx.drawImage(this.img, 0, 0, this.w, this.h);
    else {
      ctx.fillStyle = 'rgba(214,232,255,0.34)';
      ctx.fillRect(0, 0, this.w, this.h);
    }
    if (s.stain) {
      ctx.fillStyle = s.stain;
      ctx.fillRect(0, 0, this.w, this.h);
    }
    if (s.glint) {
      ctx.fillStyle = 'rgba(255,255,255,' + s.glint + ')';
      ctx.fillRect(0, 0, this.w, this.h);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  _cracks(ctx) {
    let k = Math.max(0, Math.min(1, this.crackT / this.crackFor));
    k = 1 - (1 - k) * (1 - k);          // fast at first, like a real crack
    for (let pass = 0; pass < 2; pass++) {
      ctx.lineWidth = pass === 0 ? 5 : 1.6;
      for (let i = 0; i < this.rays.length; i++) {
        const r = this.rays[i];
        ctx.strokeStyle = pass === 0 ? 'rgba(255,255,255,0.22)'
          : (this.rainbow ? 'hsla(' + Math.round(((Math.atan2(r.dir[1], r.dir[0]) / (Math.PI * 2)) + 1) % 1 * 360) + ',60%,72%,0.95)' : 'rgba(255,255,255,0.95)');
        const tip = [this.impact[0] + r.dir[0] * r.reach * k, this.impact[1] + r.dir[1] * r.reach * k];
        ctx.beginPath();
        ctx.moveTo(this.impact[0], this.impact[1]);
        ctx.lineTo(Math.max(0, Math.min(this.w, tip[0])), Math.max(0, Math.min(this.h, tip[1])));
        ctx.stroke();
        const j = (i + 1) % this.rays.length;
        for (let ring = 1; ring < RINGS.length - 1; ring++) {
          if (k >= r.at[ring] && k >= this.rays[j].at[ring]) {
            const a = this._point(i, ring), b = this._point(j, ring);
            ctx.beginPath();
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
            ctx.stroke();
          }
        }
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,' + (0.35 * (1 - k) + 0.15) + ')';
    ctx.beginPath();
    ctx.arc(this.impact[0], this.impact[1], 7 + 10 * k, 0, Math.PI * 2);
    ctx.fill();
  }
}
