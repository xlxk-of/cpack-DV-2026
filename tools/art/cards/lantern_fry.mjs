// LANTERN FRY (common) — a small round deep-sea fish, cute but fierce, lighting its own way through the dark kelp.
import { el, g, spline, ribbon, sample, poly, orb, glint } from '../lib.mjs';

// the fish is drawn in its own coordinates and placed with this transform
const ROT = -6, SC = 1.03, CA = Math.cos(ROT * Math.PI / 180), SA = Math.sin(ROT * Math.PI / 180);
const TF = `translate(516 474) rotate(${ROT}) scale(${SC}) translate(-558 -490)`;
const tx = (x, y) => 516 + ((x - 558) * CA - (y - 490) * SA) * SC, ty = (x, y) => 474 + ((x - 558) * SA + (y - 490) * CA) * SC;
const LX = 292, LY = 318; // the lantern, in fish coordinates

export function build(s) {
  const r = s.r;
  const lx = tx(LX, LY), ly = ty(LX, LY);

  // ---- 0: black-teal water
  s.backdrop(s.lin([[0, '#0b4447'], [0.3, '#07302f'], [0.65, '#041c20'], [1, '#010a0e']]));
  s.add(0, el('ellipse', { cx: 600, cy: 300, rx: 620, ry: 460, fill: s.rad([[0, '#1c8a84', 0.42], [0.5, '#0f5a5c', 0.2], [1, '#0f5a5c', 0]]) }));
  tfog(s, { color: '#1f9a8c', opacity: 0.34, freq: 0.005, seed: 12 });
  tfog(s, { color: '#01090c', opacity: 0.5, freq: 0.007, seed: 31 });
  s.add(0, el('rect', { x: 0, y: 600, width: 1024, height: 424, fill: s.lin([[0, '#010a0e', 0], [1, '#010a0e', 0.75]]) }));
  s.rays({ x: 700, y: -140, angle: 100, spread: 40, n: 6, color: '#9ff5e2', opacity: 0.09, width: 80 });
  // the lantern's warmth, soaked into the water behind it
  s.add(0, el('circle', { cx: lx, cy: ly, r: 380, fill: s.rad([[0, '#ffb24a', 0.5], [0.3, '#d9772a', 0.24], [0.65, '#a04a10', 0.08], [1, '#a04a10', 0]]) }));
  s.motes({ n: 80, rmin: 0.6, rmax: 2, color: '#8fe6d6', opacity: 0.4, glow: false, layer: 0 });
  s.vignette({ strength: 0.78, cy: 0.47 });
  s.grain({ opacity: 0.2 });

  // ---- 1: the kelp forest, far then nearer, the nearest blades catching the lantern
  const farFill = s.lin([[0, '#0d4a4a'], [1, '#052226']]);
  const far = [];
  for (const x of [60, 210, 395, 640, 800, 965]) far.push(...kelpPlant(r, { x, h: r.range(620, 900), sway: 30, w: 9, fill: farFill, bladeLen: 90, bw: 22, every: 4 }));
  s.add(1, g({ opacity: 0.5, filter: 'url(#glow4)' }, far));
  const midFill = s.rad([[0, '#a8652a'], [0.25, '#4d4a2c'], [0.55, '#0c3534'], [1, '#04191d']], lx, ly, 560, true);
  const mid = [];
  for (const [x, h, lean] of [[130, 880, 0.06], [330, 560, -0.05], [720, 760, 0.04], [895, 940, -0.07]]) {
    mid.push(...kelpPlant(r, { x, h, lean, sway: 38, w: 14, fill: midFill, bladeLen: 130, bw: 34, every: 4 }));
  }
  s.add(1, g({ filter: 'url(#glow2)' }, mid));
  s.ridge({ y: 930, amp: 80, detail: 0.8, fill: s.lin([[0, '#0b3a3c'], [1, '#03181b']], 0, 0.75, 0, 1), layer: 1, opacity: 0.7, filter: 'url(#glow2)' });
  const tufts = [];
  for (let i = 0; i < 46; i++) {
    const x = r.range(-10, 1034), y = 1010 - r.range(0, 30), h = r.range(40, 130), b = r.range(-30, 30);
    tufts.push(el('path', { d: ribbon([[x, y + 30], [x + b * 0.3, y - h * 0.5], [x + b, y - h]], r.range(8, 16), 1.5), fill: '#031a1d' }));
  }
  s.add(1, g({}, tufts));
  s.ridge({ y: 1000, amp: 46, detail: 1, fill: s.lin([[0, '#052326'], [1, '#010a0c']], 0, 0.85, 0, 1), layer: 1 });

  // ---- 2: the fry
  s.def('<filter id="shadowS" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="7"/><feOffset dx="5" dy="7"/><feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>');
  const fish = [];
  // glow behind everything
  fish.push(el('circle', { cx: LX, cy: LY, r: 170, fill: '#ff9d2e', opacity: 0.38, filter: 'url(#glow64)' }));

  const top = sample([[356, 476], [364, 408], [420, 334], [510, 292], [612, 296], [692, 338], [740, 410], [754, 478], [750, 528], [718, 600], [652, 655], [566, 690], [476, 692], [400, 666], [348, 620], [328, 566]], 12);
  const jawTop = sample([[328, 566], [352, 556], [404, 566], [452, 562], [484, 546]], 8);
  const lipTop = sample([[484, 546], [446, 520], [398, 497], [356, 476]], 8);
  const outline = poly([...top, ...jawTop.slice(1), ...lipTop.slice(1)], true);
  const bodyClip = s.clip(el('path', { d: outline }));

  // tail and back fins go behind the body
  fish.push(fanFin(s, { x: 736, y: 503, a0: -46, a1: 46, len: 124, n: 9, cols: ['#0a3440', '#17757a', '#6fe0c8'], prof: (t) => 0.76 + 0.32 * Math.abs(t - 0.5) * 2 }));
  fish.push(spineFin({ a: [506, 296], b: [716, 372], n: 9, len: (t) => 96 * Math.sin(Math.PI * (0.16 + t * 0.82)) + 10, sweep: 0.6, fill: s.lin([[0, '#7fe6cf', 0.6], [0.5, '#1f7f80', 0.85], [1, '#0a3440', 1]]), ray: '#c8fff2' }));
  fish.push(fanFin(s, { x: 648, y: 652, a0: 36, a1: 100, len: 80, n: 6, cols: ['#0a3440', '#17757a', '#6fe0c8'] }));
  fish.push(fanFin(s, { x: 492, y: 686, a0: 58, a1: 124, len: 64, n: 5, cols: ['#3a2a20', '#a8622a', '#ffc978'], ray: '#ffe9c0' }));

  // inside of the mouth, seen through the gape
  fish.push(el('path', { d: spline([[352, 482], [420, 500], [486, 548], [420, 580], [340, 572]], true), fill: s.lin([[0, '#5a1020'], [1, '#1d0510']]) }));

  // teeth (behind the lips)
  const teeth = [];
  for (let i = 1; i < lipTop.length - 3; i += 3) {
    const p = lipTop[lipTop.length - 1 - i], L = 15 + (i % 2) * 7;
    teeth.push(el('path', { d: poly([[p[0] - 6, p[1] - 3], [p[0] + 7, p[1] + 4], [p[0] - 4, p[1] + L + 6]], true) }));
  }
  for (let i = 2; i < jawTop.length - 4; i += 3) {
    const p = jawTop[i], L = i < 8 ? 34 : 18 + (i % 2) * 6;
    teeth.push(el('path', { d: poly([[p[0] - 7, p[1] + 6], [p[0] + 7, p[1] + 6], [p[0] - 3, p[1] - L]], true) }));
  }
  fish.push(g({ fill: s.lin([[0, '#fff7dc'], [1, '#e9a95a']]), stroke: '#7a3a14', 'stroke-width': 1.2, 'stroke-linejoin': 'round' }, teeth));

  // the body
  const bodyParts = [];
  bodyParts.push(el('path', { d: outline, fill: s.lin([[0, '#06202a'], [0.35, '#0d4250'], [0.7, '#12565c'], [1, '#1b4a5a']], 0, 290, 0, 700, true) }));
  const inner = [];
  // pale belly
  inner.push(el('ellipse', { cx: 520, cy: 690, rx: 210, ry: 90, fill: '#7ad0b8', opacity: 0.28, filter: 'url(#glow32)' }));
  // scales
  const sc = [];
  for (let j = 0; j < 17; j++) {
    for (let i = 0; i < 12; i++) {
      const x = 500 + i * 23 + (j % 2) * 11.5, y = 304 + j * 23;
      sc.push(`M${x} ${y - 11}Q${x + 13} ${y} ${x} ${y + 11}`);
    }
  }
  inner.push(el('path', { d: sc.join(''), fill: 'none', stroke: '#06222b', 'stroke-width': 2.2, opacity: 0.4 }));
  inner.push(el('path', { d: sc.join(''), fill: 'none', stroke: '#8ff0dc', 'stroke-width': 1, opacity: 0.22, transform: 'translate(-2.5 0)' }));
  // lantern light on the face
  inner.push(el('circle', { cx: LX, cy: LY, r: 430, fill: s.rad([[0, '#fff0b8', 1], [0.22, '#ffc254', 0.96], [0.42, '#f58a26', 0.8], [0.62, '#c9501a', 0.42], [0.85, '#8a2c14', 0.1], [1, '#8a2c14', 0]], LX, LY, 430, true) }));
  // shadow rolling round the back and under the chin
  inner.push(el('ellipse', { cx: 760, cy: 560, rx: 150, ry: 220, fill: '#031218', opacity: 0.6, filter: 'url(#glow32)' }));
  inner.push(el('ellipse', { cx: 470, cy: 720, rx: 180, ry: 50, fill: '#031218', opacity: 0.5, filter: 'url(#glow16)' }));
  // freckles of light along the flank
  for (let i = 0; i < 7; i++) {
    const t = i / 6, x = 560 + t * 160, y = 520 + Math.sin(t * 3) * 26 - t * 30;
    inner.push(el('circle', { cx: x, cy: y, r: 9 - t * 3, fill: '#7ff5e0', opacity: 0.35, filter: 'url(#glow4)' }));
    inner.push(el('circle', { cx: x, cy: y, r: 4.4 - t * 1.6, fill: '#d8fff6', opacity: 0.9 }));
  }
  // gill
  inner.push(el('path', { d: spline([[536, 392], [560, 470], [548, 548], [520, 600]]), fill: 'none', stroke: '#06202a', 'stroke-width': 7, opacity: 0.55, 'stroke-linecap': 'round' }));
  inner.push(el('path', { d: spline([[530, 394], [553, 470], [541, 548], [514, 598]]), fill: 'none', stroke: '#ffcf8a', 'stroke-width': 2.4, opacity: 0.55, 'stroke-linecap': 'round' }));
  // cheek blush and lip shading
  inner.push(el('ellipse', { cx: 440, cy: 500, rx: 44, ry: 22, fill: '#ff6a3a', opacity: 0.35, filter: 'url(#glow8)' }));
  inner.push(el('path', { d: poly([...lipTop].reverse()), fill: 'none', stroke: '#6a2412', 'stroke-width': 10, opacity: 0.6, 'stroke-linecap': 'round' }));
  inner.push(el('path', { d: poly(jawTop), fill: 'none', stroke: '#6a2412', 'stroke-width': 10, opacity: 0.6, 'stroke-linecap': 'round' }));
  bodyParts.push(g({ 'clip-path': bodyClip }, inner));
  fish.push(g({ filter: s.emboss({ color: '#ffcf8a', az: 212, elev: 48, depth: 14, k: 0.5, exp: 26, blur: 12 }) }, bodyParts));

  // rim light: warm where the lantern reaches, cool along the back
  fish.push(el('path', { d: outline, fill: 'none', stroke: s.rad([[0, '#fff3c4', 1], [0.45, '#ffb04a', 0.9], [0.8, '#ff8a2a', 0.15], [1, '#ff8a2a', 0]], LX, LY, 400, true), 'stroke-width': 4, 'stroke-linejoin': 'round' }));
  fish.push(el('path', { d: poly(top.slice(40, 110)), fill: 'none', stroke: '#7fe6d6', 'stroke-width': 2.5, opacity: 0.55 }));

  // pectoral fin, over the flank
  fish.push(g({ filter: 'url(#shadowS)' }, fanFin(s, { x: 592, y: 562, a0: 6, a1: 82, len: 122, n: 7, cols: ['#c97a30', '#2f8f88', '#8ff0da'], ray: '#fff1c8', prof: (t) => 0.7 + 0.3 * Math.sin(Math.PI * t) })));

  // the eye
  const ex = 452, ey = 418, er = 47;
  const eyeClip = s.clip(el('circle', { cx: ex, cy: ey, r: er }));
  fish.push(el('circle', { cx: ex, cy: ey, r: er + 9, fill: '#082530', opacity: 0.85 }));
  fish.push(el('circle', { cx: ex, cy: ey, r: er, fill: s.rad([[0, '#fffbe0'], [0.55, '#ffd870'], [0.85, '#f09a2e'], [1, '#8a4212']], 0.4, 0.42, 0.62) }));
  fish.push(g({ 'clip-path': eyeClip }, [
    el('circle', { cx: ex - 9, cy: ey + 2, r: 27, fill: '#1a0b08' }),
    el('circle', { cx: ex - 9, cy: ey + 2, r: 27, fill: 'none', stroke: '#c8641c', 'stroke-width': 3, opacity: 0.8 }),
    el('ellipse', { cx: ex - 2, cy: ey + 16, rx: 14, ry: 7, fill: '#ff9a3a', opacity: 0.45, filter: 'url(#glow2)' }),
    // the scowling lid
    el('path', { d: poly([[ex - 70, ey - 22], [ex + 70, ey - 52], [ex + 70, ey - 80], [ex - 70, ey - 80]], true), fill: '#0f3d48' }),
    el('path', { d: poly([[ex - 70, ey - 20], [ex + 70, ey - 50]]), stroke: '#04161c', 'stroke-width': 6, opacity: 0.7 }),
  ]));
  fish.push(el('circle', { cx: ex - 22, cy: ey - 9, r: 10, fill: '#fff' }));
  fish.push(el('circle', { cx: ex + 3, cy: ey + 13, r: 4.5, fill: '#fff', opacity: 0.85 }));
  fish.push(el('circle', { cx: ex, cy: ey, r: er, fill: 'none', stroke: '#ffe2a0', 'stroke-width': 2, opacity: 0.6 }));
  // brow ridge
  fish.push(el('path', { d: spline([[ex - 62, ey - 18], [ex - 20, ey - 36], [ex + 30, ey - 52], [ex + 66, ey - 54]]), fill: 'none', stroke: '#0a2c36', 'stroke-width': 13, 'stroke-linecap': 'round' }));
  fish.push(el('path', { d: spline([[ex - 62, ey - 22], [ex - 20, ey - 41], [ex + 30, ey - 57]]), fill: 'none', stroke: '#ffc86e', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.8 }));
  // nostril
  fish.push(el('ellipse', { cx: 380, cy: 440, rx: 5, ry: 3.4, fill: '#3a1608', opacity: 0.7, transform: 'rotate(-50 380 440)' }));

  // the lure: a stalk off the brow, and the lantern
  const stalk = [[486, 302], [474, 222], [416, 164], [338, 176], [300, 236], [LX, LY - 34]];
  fish.push(el('path', { d: ribbon(stalk, 17, 6), fill: s.lin([[0, '#f0a851'], [0.5, '#8a5a36'], [1, '#124450']], 290, 0, 490, 0, true) }));
  fish.push(el('path', { d: spline(stalk), fill: 'none', stroke: '#ffe0a0', 'stroke-width': 1.6, opacity: 0.6, transform: 'translate(-3 2)' }));
  for (const p of sample(stalk, 4).filter((_, i) => i % 3 === 1)) fish.push(el('circle', { cx: p[0], cy: p[1], r: 3, fill: '#ffd98a', opacity: 0.7 }));
  // little cage of filaments round the bulb
  for (let i = 0; i < 5; i++) {
    const a = (-150 + i * 30) * Math.PI / 180;
    fish.push(el('path', { d: `M${LX} ${LY - 34}Q${LX + Math.cos(a) * 62} ${LY - 6} ${LX + Math.cos(a) * 38} ${LY + 44}`, fill: 'none', stroke: '#ffd486', 'stroke-width': 1.6, opacity: 0.7 }));
  }
  fish.push(el('circle', { cx: LX, cy: LY, r: 96, fill: '#ffa53a', opacity: 0.5, filter: 'url(#glow32)' }));
  fish.push(el('circle', { cx: LX, cy: LY, r: 50, fill: '#ffd27a', opacity: 0.9, filter: 'url(#glow16)' }));
  const bulb = `M${LX} ${LY - 38}C${LX + 36} ${LY - 28} ${LX + 38} ${LY + 34} ${LX} ${LY + 38}C${LX - 38} ${LY + 34} ${LX - 36} ${LY - 28} ${LX} ${LY - 38}Z`;
  fish.push(el('path', { d: bulb, fill: '#ffe9a8', filter: 'url(#glow4)' }));
  fish.push(el('path', { d: bulb, fill: s.rad([[0, '#ffffff'], [0.45, '#fff6c8'], [0.8, '#ffc65a'], [1, '#f59a2a']]) }));
  fish.push(el('ellipse', { cx: LX - 10, cy: LY - 12, rx: 9, ry: 6, fill: '#fff', transform: `rotate(-30 ${LX - 10} ${LY - 12})` }));
  s.add(2, g({ transform: TF }, fish));

  // ---- 3: near kelp framing the edges, sparks off the lantern, bubbles from the gape
  const nearFill = s.rad([[0, '#6a4a22'], [0.3, '#12302c'], [1, '#020c0f']], lx, ly, 640, true);
  const near = [];
  near.push(...kelpPlant(r, { x: -10, y: 1080, h: 1150, lean: 0.07, sway: 46, w: 24, fill: nearFill, bladeLen: 200, bw: 60, every: 4 }));
  near.push(...kelpPlant(r, { x: 1010, y: 1080, h: 1050, lean: -0.05, sway: 50, w: 26, fill: nearFill, bladeLen: 210, bw: 64, every: 4 }));
  s.add(3, g({ filter: 'url(#glow4)' }, near));
  s.motes({ n: 26, x0: lx - 190, y0: ly - 170, x1: lx + 220, y1: ly + 210, rmin: 1.2, rmax: 4.5, colors: ['#ffd98a', '#ffb64a', '#fff3cf'], opacity: 0.9 });
  s.motes({ n: 30, rmin: 1, rmax: 3.6, colors: ['#9ff0e0', '#d8fff6'], opacity: 0.5 });
  const bub = [];
  for (const [x, y, rr] of [[250, 520, 9], [226, 470, 6], [262, 440, 4], [214, 398, 11], [240, 340, 5], [690, 220, 7], [716, 170, 4]]) {
    bub.push(el('circle', { cx: x, cy: y, r: rr, fill: '#ffe2ae', 'fill-opacity': 0.08, stroke: '#ffe8c0', 'stroke-width': Math.max(1, rr * 0.14), 'stroke-opacity': 0.7 }));
    bub.push(el('circle', { cx: x - rr * 0.35, cy: y - rr * 0.4, r: rr * 0.22, fill: '#fff', opacity: 0.9 }));
  }
  s.add(3, g({}, bub));
  s.add(3, glint(lx - 8, ly - 6, 30, '#fff6d8', 0.9), glint(lx + 70, ly - 72, 11, '#ffe2a8', 0.8), glint(lx - 66, ly + 58, 9, '#ffe2a8', 0.7));
}

/** A fin fanning out from a point: sharp at each ray, scalloped between. `cols` = root, middle, edge. */
function fanFin(s, { x, y, a0, a1, len, n = 7, cols, ray = '#c8fff2', prof = () => 1, notch = 0.84 }) {
  const pts = [[x, y]], rays = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), a = (a0 + (a1 - a0) * t) * Math.PI / 180, L = len * prof(t);
    pts.push([x + Math.cos(a) * L, y + Math.sin(a) * L]);
    rays.push(`M${x} ${y}L${x + Math.cos(a) * L} ${y + Math.sin(a) * L}`);
    if (i < n - 1) {
      const tm = t + 0.5 / (n - 1), am = (a0 + (a1 - a0) * tm) * Math.PI / 180, Lm = len * prof(tm) * notch;
      pts.push([x + Math.cos(am) * Lm, y + Math.sin(am) * Lm]);
    }
  }
  const fill = s.rad([[0, cols[0], 1], [0.35, cols[0], 0.96], [0.72, cols[1], 0.82], [1, cols[2], 0.6]], x, y, len * 1.05, true);
  return g({}, [
    el('path', { d: poly(pts, true), fill, 'stroke-linejoin': 'round' }),
    el('path', { d: rays.join(''), fill: 'none', stroke: ray, 'stroke-width': 2, opacity: 0.45, 'stroke-linecap': 'round' }),
    el('path', { d: poly(pts.slice(1)), fill: 'none', stroke: ray, 'stroke-width': 1.6, opacity: 0.6 }),
  ]);
}

/** A spiny fin standing on a base line a -> b, swept back. */
function spineFin({ a, b, n = 7, len, sweep = 0.4, fill, ray = '#fff' }) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = uy, ny = -ux;
  const pts = [a], rays = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), h = len(t), bx = a[0] + dx * t, by = a[1] + dy * t;
    const tip = [bx + nx * h + ux * h * sweep, by + ny * h + uy * h * sweep];
    pts.push(tip);
    rays.push(`M${bx} ${by}L${tip[0]} ${tip[1]}`);
    if (i < n - 1) {
      const tm = t + 0.5 / (n - 1), hm = len(tm) * 0.72, mx = a[0] + dx * tm, my = a[1] + dy * tm;
      pts.push([mx + nx * hm + ux * hm * sweep, my + ny * hm + uy * hm * sweep]);
    }
  }
  pts.push([b[0] + ux * 16, b[1] + uy * 16]);
  return g({}, [
    el('path', { d: poly(pts, true), fill }),
    el('path', { d: rays.join(''), fill: 'none', stroke: ray, 'stroke-width': 2.4, opacity: 0.6, 'stroke-linecap': 'round' }),
    el('path', { d: poly(pts.slice(1, -1)), fill: 'none', stroke: ray, 'stroke-width': 1.4, opacity: 0.5 }),
  ]);
}

/** A kelp plant: a swaying stem with long ruffled blades and a float at the foot of each. Returns markup parts. */
function kelpPlant(r, { x, y = 1060, h = 700, lean = 0, sway = 34, w = 14, fill, bladeLen = 160, bw = 40, every = 3 }) {
  const parts = [], ph = r.range(0, 6), pts = [];
  for (let i = 0; i <= 9; i++) {
    const t = i / 9;
    pts.push([x + Math.sin(t * 4.4 + ph) * sway * (0.35 + t) + lean * t * h, y - h * t]);
  }
  parts.push(el('path', { d: ribbon(pts, w, w * 0.25), fill }));
  const sm = sample(pts, 5);
  let k = 0;
  for (let i = 5; i < sm.length - 1; i += every) {
    const side = (k++ % 2 ? 1 : -1), p = sm[i], t = i / sm.length;
    const L = bladeLen * r.range(0.7, 1.15) * (1 - t * 0.45), W = bw * r.range(0.7, 1.1) * (1 - t * 0.4), bp = r.range(0, 6);
    const curl = r.range(-0.12, 0.2), up = r.range(0.6, 1.0);
    const bl = [p, [p[0] + side * L * 0.34, p[1] - L * 0.2 * up], [p[0] + side * L * 0.6, p[1] - L * 0.62 * up], [p[0] + side * L * (0.72 + curl), p[1] - L * 1.05 * up], [p[0] + side * L * (0.78 + curl * 2), p[1] - L * 1.3 * up]];
    parts.push(el('path', { d: ribbon(bl, 1, 1, (u) => W * Math.sin(Math.PI * Math.pow(u, 0.55)) * (1 + 0.14 * Math.sin(u * 13 + bp)) + 1.2, 12), fill }));
    parts.push(el('ellipse', { cx: p[0] + side * w * 0.5, cy: p[1] - w * 0.3, rx: w * 0.62, ry: w * 0.8, fill }));
  }
  return parts;
}

/** Tinted cloud (the kit's fog comes out white whatever colour it is given). */
function tfog(s, { color, opacity = 0.3, freq = 0.006, seed = 1, contrast = 2.2, layer = 0 }) {
  const id = s.uid('tf'), c = [1, 3, 5].map((i) => (parseInt(color.slice(i, i + 2), 16) / 255).toFixed(3));
  s.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 ${c[0]}  0 0 0 0 ${c[1]}  0 0 0 0 ${c[2]}  ${contrast} 0 0 0 ${-(contrast - 1) * 0.62}"/></filter>`);
  s.add(layer, el('rect', { x: 0, y: 0, width: s.w, height: s.h, filter: `url(#${id})`, opacity }));
}
