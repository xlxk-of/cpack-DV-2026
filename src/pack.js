// THE RIP. The pack is pixel art (96 x 136, drawn large and hard) and it is torn the way the game tears it
// (scripts/ui/PackOpening.gd): a finger drags across the top of it and the pack is cut COLUMN BY COLUMN along
// wherever the finger goes, so the tear is the player's own. Keep to the printed dashes and the rip is graded
// PERFECT or GOOD. When the tear is nearly across, the strip comes off, tumbles away, and light pours out.
//
// It draws on a canvas: for every art column, the body is drawn from its cut row down and the strip from the top down
// to it, the strip on its own tumbling transform.
import { packInfo } from './rules.js';

const W = 96, H = 136;
const LINE_ROW = 19, ROW_MIN = 15, ROW_MAX = 46;
const OPEN_AT = 0.97;
const MAX_SLOPE = 1.6;
const PERFECT_AVG = 1.5, PERFECT_WORST = 3.5, GOOD_AVG = 3.2, GOOD_WORST = 7.5;

export class PackRip {
  /** `canvas`: where it is drawn. `onOpen(grade)`: the strip has come off. */
  constructor(canvas, sfx, onOpen) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.sfx = sfx;
    this.onOpen = onOpen;
    this.img = null;
    this.glow = null;
    this.jitter = [];
    this.reset('starter');
    this.time = 0;
    this._bind();
    requestAnimationFrame(this._frame.bind(this));
  }

  async load() {
    this.glow = await loadImage('ui/pack_glow.png');
    const tear = await (await fetch('ui/pack_tear.json')).json();
    this.jitter = tear.jitter || new Array(W).fill(0);
  }

  reset(key) {
    this.key = key;
    this.rows = new Float32Array(W).fill(LINE_ROW);
    this.cut = new Int32Array(W).fill(-1);
    this.n = 0;              // columns torn
    this.dir = 0;            // +1 tearing left to right, -1 the other way
    this.state = 'sealed';
    this.strip = null;
    this.grade = '';
    this.gradeT = 0;
    this.lean = { x: 0, y: 0 };
    this.shake = 0;
    this.glowA = 0;
    this.drop = 0;
    this.dragging = false;
    this.scraps = [];
    this.sparks = [];
    this.opened = false;
    const info = packInfo(key);
    loadImage('ui/' + info.art).then((im) => { this.img = im; });
  }

  _bind() {
    const down = (e) => {
      if (this.state !== 'sealed' && this.state !== 'opening') return;
      e.preventDefault();
      this.dragging = true;
      this._at(e);
    };
    const move = (e) => {
      if (!this.dragging) return;
      e.preventDefault();
      this._at(e);
    };
    const up = () => { this.dragging = false; };
    this.cv.addEventListener('pointerdown', down);
    this.cv.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  /** How large the pack is drawn and where: whole pixels only, since pixel art is never half a pixel large. Worked
   *  out on demand rather than left behind by the last frame, so a touch lands correctly even before one has run. */
  _layout() {
    const cw = this.cv.width, ch = this.cv.height;
    this.s = Math.max(1, Math.floor(Math.min(cw / (W + 24), ch / (H + 40))));
    this.ox = (cw / this.s - W) / 2;
    this.oy = (ch / this.s - H) / 2;
  }

  /** Where the finger is, in the pack's own pixels. */
  _at(e) {
    this._layout();
    const box = this.cv.getBoundingClientRect();
    if (!box.width) return;
    const scale = box.width / this.cv.width;
    const px = (e.clientX - box.left) / scale;    // where the finger is, in the canvas's own pixels ...
    const py = (e.clientY - box.top) / scale;
    this._tearTo(px / this.s - this.ox, py / this.s - this.oy);   // ... and in the pack's
  }

  _tearTo(x, y) {
    if (this.state === 'sealed') {
      if (y < ROW_MIN - 12 || y > ROW_MAX + 14) return;
      this.dir = x < W * 0.5 ? 1 : -1;
      this.state = 'opening';
      this.sfx.play('rip_' + ['tiny', 'short', 'medium', 'long'][Math.floor(Math.random() * 4)], 0.9 + Math.random() * 0.2);
    }
    if (this.state !== 'opening') return;
    const want = this.dir > 0 ? Math.ceil(x) : W - Math.floor(x);
    const row = Math.max(ROW_MIN, Math.min(ROW_MAX, y));
    for (let k = this.n; k < Math.min(W, want); k++) {
      const col = this.dir > 0 ? k : W - 1 - k;
      const before = k > 0 ? this.rows[this.dir > 0 ? col - 1 : col + 1] : row;
      const step = Math.max(-MAX_SLOPE, Math.min(MAX_SLOPE, row - before));
      this.rows[col] = before + step;
      this.cut[col] = Math.round(this.rows[col] + (this.jitter[col] || 0));
      if (k % 7 === 0) this._scrap(col);
      this.shake = Math.min(3.5, this.shake + 0.5);
    }
    this.n = Math.max(this.n, Math.min(W, want));
    if (this.n / W >= OPEN_AT && !this.opened) this._open();
  }

  _scrap(col) {
    const y = this.cut[col];
    this.scraps.push({ x: col, y, vx: this.dir * (10 + Math.random() * 30), vy: -20 - Math.random() * 40, t: 0, life: 0.5 + Math.random() * 0.4 });
  }

  _open() {
    this.opened = true;
    this.state = 'open';
    let sum = 0, worst = 0;
    for (let x = 0; x < W; x++) {
      const off = Math.abs(this.rows[x] - LINE_ROW);
      sum += off;
      worst = Math.max(worst, off);
    }
    const avg = sum / W;
    this.grade = (avg <= PERFECT_AVG && worst <= PERFECT_WORST) ? 'PERFECT!!' : ((avg <= GOOD_AVG && worst <= GOOD_WORST) ? 'GOOD' : '');
    this.gradeT = 0;
    this.stat = { avg, worst };
    this.strip = { x: 0, y: 0, vx: -this.dir * 46, vy: -170, rot: 0, spin: -1.6 * this.dir, t: 0 };
    this.shake = 7;
    for (let i = 0; i < 26; i++) {
      this.sparks.push({ x: 20 + Math.random() * 56, y: 20, vx: (Math.random() - 0.5) * 70, vy: -40 - Math.random() * 90, t: 0, life: 0.6 + Math.random() * 0.5 });
    }
    if (this.grade) this.sfx.play(this.grade === 'GOOD' ? 'pack_good' : 'pack_perfect');
    this.onOpen(this.grade, this.stat);
  }

  _frame(now) {
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0;
    this.last = now;
    this.time += dt;
    if (this.cv.isConnected && this.cv.offsetParent !== null) this._draw(dt);
    requestAnimationFrame(this._frame.bind(this));
  }

  _draw(dt) {
    const ctx = this.ctx;
    const cw = this.cv.width, ch = this.cv.height;
    ctx.clearRect(0, 0, cw, ch);
    this._layout();
    const s = this.s;
    if (!this.img) return;
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.scale(s, s);
    this.shake = Math.max(0, this.shake - dt * 22);
    const sx = (Math.random() - 0.5) * this.shake * 0.5;
    const sy = (Math.random() - 0.5) * this.shake * 0.5;
    ctx.translate(this.ox + sx, this.oy + sy);
    if (this.state === 'open') {
      this.drop = Math.min(1, this.drop + dt * 1.6);
      this.glowA = Math.min(1, this.glowA + dt * 3);
    }
    // the light pouring out of the opening
    if (this.glowA > 0 && this.glow) {
      ctx.save();
      ctx.globalAlpha = this.glowA * (0.75 + 0.25 * Math.sin(this.time * 5));
      ctx.globalCompositeOperation = 'lighter';
      const gw = W * 1.4, gh = 54;
      ctx.drawImage(this.glow, (W - gw) / 2, LINE_ROW - gh + 8, gw, gh);
      ctx.restore();
    }
    // the body: every column from its cut down
    const bodyY = this.drop * 18;
    for (let x = 0; x < W; x++) {
      const cut = this.cut[x] < 0 ? 0 : this.cut[x];
      ctx.drawImage(this.img, x, cut, 1, H - cut, x, cut + bodyY, 1, H - cut);
    }
    // the strip: the part above the cut, still on the pack or tumbling away
    ctx.save();
    if (this.strip) {
      this.strip.t += dt;
      this.strip.x += this.strip.vx * dt;
      this.strip.y += this.strip.vy * dt;
      this.strip.vy += 420 * dt;
      this.strip.rot += this.strip.spin * dt;
      ctx.translate(W / 2 + this.strip.x, 14 + this.strip.y);
      ctx.rotate(this.strip.rot);
      ctx.translate(-W / 2, -14);
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, this.strip.t - 0.6) * 1.4);
    }
    for (let x = 0; x < W; x++) {
      const cut = this.cut[x] < 0 ? H : this.cut[x];
      if (cut > 0) ctx.drawImage(this.img, x, 0, 1, cut, x, 0, 1, cut);
    }
    ctx.restore();
    // the glowing line along the tear, and the torn fibres
    if (this.n > 0 && this.n < W) {
      ctx.fillStyle = 'rgba(236,230,244,0.95)';
      for (let k = Math.max(0, this.n - 10); k < this.n; k++) {
        const col = this.dir > 0 ? k : W - 1 - k;
        ctx.globalAlpha = 0.25 + 0.75 * (k - (this.n - 10)) / 10;
        ctx.fillRect(col, this.cut[col] - 1, 1, 1);
      }
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = '#ece6f4';
    this.scraps = this.scraps.filter((p) => {
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt;
      ctx.globalAlpha = Math.max(0, 1 - p.t / p.life);
      ctx.fillRect(p.x, p.y, 1, 1);
      return p.t < p.life;
    });
    ctx.fillStyle = '#ffeaa0';
    this.sparks = this.sparks.filter((p) => {
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 160 * dt;
      ctx.globalAlpha = Math.max(0, 1 - p.t / p.life);
      ctx.fillRect(p.x, p.y, 1, 1);
      return p.t < p.life;
    });
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

export function loadImage(src) {
  return new Promise((ok, no) => {
    const im = new Image();
    im.onload = () => ok(im);
    im.onerror = no;
    im.src = src;
  });
}
