// PACKS: the shop shelf, the rip, and the reveal.
//
// The rip is the one from the WICK pack opener, at HD: drag a finger across the top of the foil along the printed
// dashes and the pack is cut column by column wherever the finger actually goes, so every tear is your own. Keep to
// the line and it is graded GOOD or PERFECT (worth a few coins). Then five cards, face down: turn them over.
import { CARD, RARITIES, byRarity } from './cards.js';
import { flipCardEl, foilOn, askTilt } from './card.js';
import { S, save, owned, addCard } from './save.js';
import { $, h, btn, toast, refreshBar, inspect, sleep } from './ui.js';
import { sfx } from './sfx.js';

export const PACKS = {
  tide: { name: 'Tide Pack', price: 100, art: 'ui/pack_tide.webp', blurb: 'Five cards. At least one Rare or better.',
    odds: { common: 0.66, rare: 0.24, epic: 0.075, legendary: 0.02, mythic: 0.005 }, last: { rare: 0.74, epic: 0.2, legendary: 0.05, mythic: 0.01 } },
  abyss: { name: 'Abyssal Pack', price: 280, art: 'ui/pack_abyss.webp', blurb: 'Five cards. At least one Epic or better, and richer all through.',
    odds: { common: 0.40, rare: 0.38, epic: 0.16, legendary: 0.05, mythic: 0.01 }, last: { epic: 0.72, legendary: 0.23, mythic: 0.05 } },
};
const PITY = 8;                       // packs without a Legendary before one is promised
const FREE_EVERY = 6 * 3600 * 1000;   // a free Tide Pack washes up this often

function pick(table) {
  let r = Math.random();
  for (const k in table) { r -= table[k]; if (r <= 0) return k; }
  return Object.keys(table)[0];
}

/** Five card ids, the best one last. */
export function rollPack(kind) {
  const p = PACKS[kind], out = [];
  for (let i = 0; i < 4; i++) out.push(pick(p.odds));
  let last = pick(p.last);
  const lucky = [...out, last].some((r) => RARITIES[r].order >= 3);
  if (!lucky && S.pity + 1 >= PITY) last = 'legendary';
  S.pity = [...out, last].some((r) => RARITIES[r].order >= 3) ? 0 : S.pity + 1;
  out.push(last);
  out.sort((a, b) => RARITIES[a].order - RARITIES[b].order);
  return out.map((r) => { const pool = byRarity(r); return pool[Math.floor(Math.random() * pool.length)].id; });
}

let root, rip = null;

export function mount(el) { root = el; }

export function show() {
  const freeIn = S.lastFree + FREE_EVERY - Date.now();
  root.replaceChildren(
    h('div.shelf', {}, Object.keys(PACKS).map((k) => {
      const p = PACKS[k], n = S.packs[k] || 0;
      return h('div.shelf-pack.' + k, {},
        h('div.pack-pic', { onclick: () => (n ? open(k) : null) }, h('img', { src: p.art, alt: p.name, draggable: false }), n ? h('span.badge', {}, '×' + n) : null),
        h('h3', {}, p.name), h('p.note', {}, p.blurb),
        h('div.row', {},
          btn(n ? `Open (${n})` : 'None left', () => open(k), n ? '' : 'off'),
          btn(`<i class="coin"></i> ${p.price}`, () => buy(k), S.gold >= p.price ? 'ghost' : 'ghost off')));
    })),
    h('div.free', {}, freeIn <= 0
      ? btn('A pack has washed ashore — claim it', () => { S.lastFree = Date.now(); S.packs.tide++; save(); sfx.play('coin'); refreshBar(); show(); }, 'gold')
      : h('p.note', {}, `The tide brings a free pack in ${fmt(freeIn)}. Win duels for gold; first wins pay in packs.`)),
    h('p.note.odds', { html: 'Per card — Tide: Rare 24%, Epic 7.5%, Legendary 2%, Mythic 0.5%. Abyssal: Rare 38%, Epic 16%, Legendary 5%, Mythic 1%.<br>A Legendary or better is promised within every ' + PITY + ' packs.' }));
  refreshBar();
}

function fmt(ms) {
  const m = Math.ceil(ms / 60000);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

function buy(k) {
  const p = PACKS[k];
  if (S.gold < p.price) { sfx.play('error'); toast(`You need ${p.price - S.gold} more gold`); return; }
  S.gold -= p.price;
  S.packs[k] = (S.packs[k] || 0) + 1;
  save();
  sfx.play('coin');
  show();
}

// ---------------------------------------------------------------------------------------------------- opening one

function open(kind) {
  if (!(S.packs[kind] > 0)) { sfx.play('error'); toast('None of those left: buy one, or win a duel'); return; }
  askTilt();
  const canvas = h('canvas.rip-canvas', { width: 900, height: 1240 });
  const hint = h('div.rip-hint', {}, 'Drag across the dashed line to tear it open');
  const grade = h('div.rip-grade');
  const stage = h('div.rip-stage', {}, canvas, hint, grade);
  const reveal = h('div.reveal', { hidden: true });
  root.replaceChildren(h('div.opening', {}, h('div.rip-top', {}, btn('‹ Shelf', () => { rip?.stop(); show(); }, 'mini ghost'), h('span', {}, PACKS[kind].name)), stage, reveal));
  rip?.stop();
  rip = new PackRip(canvas, PACKS[kind].art, async (g) => {
    hint.remove();
    // the pack is spent the moment it tears: closing the tab now must not give it back
    S.packs[kind]--;
    S.stats.opened++;
    const ids = rollPack(kind);
    const fresh = ids.map((id) => { const isNew = !owned(id); addCard(id); return isNew; });
    const tip = g === 'PERFECT!!' ? 10 : (g === 'GOOD' ? 4 : 0);
    S.gold += tip;
    save();
    refreshBar();
    if (g) { grade.textContent = g + (tip ? `  +${tip} gold` : ''); grade.dataset.kind = g === 'GOOD' ? 'good' : 'perfect'; }
    await sleep(g ? 1100 : 650);
    stage.classList.add('gone');
    await sleep(350);
    stage.hidden = true;
    rip.stop();
    showReveal(reveal, kind, ids, fresh);
  });
}

function showReveal(box, kind, ids, fresh) {
  box.hidden = false;
  let left = ids.length, best = 0;
  const foot = h('div.reveal-foot', { hidden: true });
  const flips = ids.map((id, i) => {
    const rar = CARD[id].rarity, order = RARITIES[rar].order;
    best = Math.max(best, order);
    const f = flipCardEl(id);
    f.classList.add('deal', 'r-' + rar);
    f.style.setProperty('--i', i);
    f.style.setProperty('--glow', RARITIES[rar].color);
    const turn = () => {
      if (f.classList.contains('up')) { inspect(id); return; }
      f.classList.add('up');
      sfx.play('card_reveal', 0.9 + order * 0.08);
      if (order >= 3) { sfx.play('legend'); box.classList.add('flash'); setTimeout(() => box.classList.remove('flash'), 900); }
      else if (order >= 1) sfx.play('shimmer', 1 + order * 0.15, 0.8);
      setTimeout(() => foilOn(f.card, { sway: true }), 500);
      if (fresh[i]) f.append(h('div.newtag', {}, 'NEW'));
      if (--left === 0) { foot.hidden = false; }
    };
    f.addEventListener('click', turn);
    f.turn = turn;
    return f;
  });
  const sum = h('p.note');
  const again = S.packs[kind] > 0;
  foot.append(sum, h('div.row', {},
    again ? btn(`Open another (${S.packs[kind]})`, () => open(kind)) : btn('Back to the shelf', show),
    again ? btn('Shelf', show, 'ghost') : null));
  box.replaceChildren(h('div.reveal-cards', {}, flips),
    h('div.reveal-tools', {}, btn('Turn them all', async () => { for (const f of flips) if (!f.classList.contains('up')) { f.turn(); await sleep(260); } }, 'mini ghost')),
    foot);
  const news = fresh.filter(Boolean).length;
  sum.textContent = news ? `${news} new card${news > 1 ? 's' : ''} for the collection. Tap a card to hold it up to the light.` : 'Nothing new this time — spare copies trade well at the Harbor Market.';
}

// ---------------------------------------------------------------------------------------------------- the rip

const CELL = 4;                        // the pack picture is cut in strips this many of its pixels wide
const PW = 720, PH = 1040, W = PW / CELL, H = PH / CELL;
const LINE_ROW = 150 / CELL, ROW_MIN = 80 / CELL, ROW_MAX = 300 / CELL;
const OPEN_AT = 0.96, MAX_SLOPE = 1.5;
const PERFECT_AVG = 2.6, PERFECT_WORST = 7, GOOD_AVG = 6, GOOD_WORST = 15;

class PackRip {
  constructor(canvas, art, onOpen) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.onOpen = onOpen;
    this.img = null;
    this.rows = new Float32Array(W).fill(LINE_ROW);
    this.cut = new Int32Array(W).fill(-1);
    this.n = 0; this.dir = 0; this.state = 'sealed'; this.strip = null; this.shake = 0; this.glow = 0; this.drop = 0;
    this.scraps = []; this.sparks = []; this.time = 0; this.alive = true; this.dragging = false;
    const im = new Image();
    im.onload = () => { this.img = im; };
    im.src = art;
    this.down = (e) => { if (this.state === 'open') return; e.preventDefault(); this.dragging = true; this.at(e); };
    this.move = (e) => { if (!this.dragging) return; e.preventDefault(); this.at(e); };
    this.up = () => { this.dragging = false; };
    canvas.addEventListener('pointerdown', this.down);
    canvas.addEventListener('pointermove', this.move);
    window.addEventListener('pointerup', this.up);
    window.addEventListener('pointercancel', this.up);
    this.frame = this.frame.bind(this);
    requestAnimationFrame(this.frame);
  }

  stop() {
    this.alive = false;
    window.removeEventListener('pointerup', this.up);
    window.removeEventListener('pointercancel', this.up);
  }

  /** Where the finger is, in pack cells. */
  at(e) {
    const box = this.cv.getBoundingClientRect();
    if (!box.width) return;
    const px = (e.clientX - box.left) * (this.cv.width / box.width) - (this.cv.width - PW) / 2;
    const py = (e.clientY - box.top) * (this.cv.height / box.height) - (this.cv.height - PH) / 2;
    this.tearTo(px / CELL, py / CELL);
  }

  tearTo(x, y) {
    if (this.state === 'sealed') {
      if (y < ROW_MIN - 14 || y > ROW_MAX + 14) return;
      this.dir = x < W * 0.5 ? 1 : -1;
      this.state = 'opening';
      sfx.play('rip_' + ['tiny', 'short', 'medium', 'long'][Math.floor(Math.random() * 4)], 0.9 + Math.random() * 0.2);
    }
    if (this.state !== 'opening') return;
    const want = this.dir > 0 ? Math.ceil(x) : W - Math.floor(x);
    const row = Math.max(ROW_MIN, Math.min(ROW_MAX, y));
    const before = this.n;
    for (let k = this.n; k < Math.min(W, want); k++) {
      const col = this.dir > 0 ? k : W - 1 - k;
      const prev = k > 0 ? this.rows[this.dir > 0 ? col - 1 : col + 1] : row;
      this.rows[col] = prev + Math.max(-MAX_SLOPE, Math.min(MAX_SLOPE, row - prev));
      this.cut[col] = Math.round(this.rows[col] + Math.sin(col * 1.7) * 0.5 + Math.sin(col * 0.37) * 0.8);
      if (k % 6 === 0) this.scraps.push({ x: col, y: this.cut[col], vx: this.dir * (20 + Math.random() * 60), vy: -40 - Math.random() * 80, t: 0, life: 0.5 + Math.random() * 0.4 });
      this.shake = Math.min(4, this.shake + 0.35);
    }
    this.n = Math.max(this.n, Math.min(W, want));
    if (Math.floor(this.n / 40) > Math.floor(before / 40)) sfx.play('rip_tiny', 0.8 + Math.random() * 0.5, 0.7);
    if (this.n / W >= OPEN_AT && this.state === 'opening') this.open();
  }

  open() {
    this.state = 'open';
    for (let k = this.n; k < W; k++) { const col = this.dir > 0 ? k : W - 1 - k; this.cut[col] = Math.round(this.rows[this.dir > 0 ? col - 1 : col + 1] || LINE_ROW); this.rows[col] = this.cut[col]; }
    let sum = 0, worst = 0;
    for (let x = 0; x < W; x++) { const off = Math.abs(this.rows[x] - LINE_ROW); sum += off; worst = Math.max(worst, off); }
    const avg = sum / W;
    const grade = (avg <= PERFECT_AVG && worst <= PERFECT_WORST) ? 'PERFECT!!' : ((avg <= GOOD_AVG && worst <= GOOD_WORST) ? 'GOOD' : '');
    this.strip = { x: 0, y: 0, vx: -this.dir * 110, vy: -420, rot: 0, spin: -1.5 * this.dir, t: 0 };
    this.shake = 9;
    for (let i = 0; i < 40; i++) this.sparks.push({ x: 20 + Math.random() * (W - 40), y: LINE_ROW, vx: (Math.random() - 0.5) * 170, vy: -90 - Math.random() * 230, t: 0, life: 0.6 + Math.random() * 0.6, c: ['#fff3b8', '#b8f4ff', '#ffc6f0'][i % 3] });
    if (grade) sfx.play(grade === 'GOOD' ? 'pack_good' : 'pack_perfect');
    this.onOpen(grade);
  }

  frame(now) {
    if (!this.alive) return;
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0;
    this.last = now;
    this.time += dt;
    if (this.cv.isConnected && this.cv.offsetParent !== null) this.draw(dt);
    requestAnimationFrame(this.frame);
  }

  draw(dt) {
    const ctx = this.ctx, cw = this.cv.width, ch = this.cv.height;
    ctx.clearRect(0, 0, cw, ch);
    if (!this.img) return;
    ctx.save();
    this.shake = Math.max(0, this.shake - dt * 24);
    ctx.translate((cw - PW) / 2 + (Math.random() - 0.5) * this.shake * 2, (ch - PH) / 2 + (Math.random() - 0.5) * this.shake * 2);
    // sealed: the pack breathes a little, so it looks like something to touch
    if (this.state === 'sealed') { const b = 1 + Math.sin(this.time * 2.2) * 0.008; ctx.translate(PW / 2, PH / 2); ctx.scale(b, b); ctx.translate(-PW / 2, -PH / 2); }
    if (this.state === 'open') { this.drop = Math.min(1, this.drop + dt * 1.5); this.glow = Math.min(1, this.glow + dt * 3); }
    if (this.glow > 0) {
      const gy = LINE_ROW * CELL + 20;
      const grad = ctx.createRadialGradient(PW / 2, gy, 10, PW / 2, gy, PW * 0.75);
      grad.addColorStop(0, `rgba(255,250,220,${0.95 * this.glow})`);
      grad.addColorStop(0.3, `rgba(190,240,255,${0.5 * this.glow})`);
      grad.addColorStop(1, 'rgba(120,160,255,0)');
      ctx.fillStyle = grad;
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillRect(-90, -100, PW + 180, PH * 0.7);
      ctx.globalCompositeOperation = 'source-over';
    }
    const bodyY = this.drop * 70;
    for (let x = 0; x < W; x++) {
      const cut = (this.cut[x] < 0 ? 0 : this.cut[x]) * CELL;
      ctx.drawImage(this.img, x * CELL, cut, CELL, PH - cut, x * CELL, cut + bodyY, CELL, PH - cut);
    }
    ctx.save();
    if (this.strip) {
      const s = this.strip;
      s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 1500 * dt; s.rot += s.spin * dt;
      ctx.translate(PW / 2 + s.x, 60 + s.y); ctx.rotate(s.rot); ctx.translate(-PW / 2, -60);
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, s.t - 0.5) * 1.6);
    }
    // the strip above the cut: curling up off the pack while it tears, tumbling away once it is through
    for (let x = 0; x < W; x++) {
      if (this.cut[x] <= 0) continue;
      const cut = this.cut[x] * CELL;
      // how long ago this column was torn, in columns: the further back, the more it has lifted
      const k = this.dir > 0 ? x : W - 1 - x, age = Math.min(1, (this.n - k) / 30);
      const lift = this.strip ? 0 : age * 9;
      if (!this.strip) { ctx.fillStyle = 'rgba(8,14,40,.82)'; ctx.fillRect(x * CELL, cut - lift, CELL, lift + 2); }
      ctx.drawImage(this.img, x * CELL, 0, CELL, cut, x * CELL, -lift, CELL, cut);
    }
    ctx.restore();
    // the bright lip of the tear
    if (this.n > 0 && this.state === 'opening') {
      ctx.fillStyle = '#fff';
      for (let k = Math.max(0, this.n - 14); k < this.n; k++) {
        const col = this.dir > 0 ? k : W - 1 - k;
        ctx.globalAlpha = 0.2 + 0.8 * (k - (this.n - 14)) / 14;
        ctx.fillRect(col * CELL, this.cut[col] * CELL - 3, CELL, 4);
      }
      ctx.globalAlpha = 1;
    }
    const bits = (list, grav, size) => list.filter((p) => {
      p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += grav * dt;
      ctx.globalAlpha = Math.max(0, 1 - p.t / p.life);
      ctx.fillStyle = p.c || '#eef4ff';
      ctx.fillRect(p.x * CELL, p.y * CELL, size, size);
      return p.t < p.life;
    });
    this.scraps = bits(this.scraps, 300, 5);
    this.sparks = bits(this.sparks, 160, 7);
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
