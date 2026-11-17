// DRIFTWOOD GOLEM (common) — a hulk of logs, rope, net and barnacle wading the shallows at dusk, a blue star-core
// burning in its chest, the sun going down between its arm and its ribs.
import { el, g, spline, ribbon, poly, blob, noise1, orb, glint } from '../lib.mjs';

const HZ = 604;   // horizon
const WL = 768;   // waterline at the golem's shins
const SUN = [880, 592];
const CORE = [514, 446];

export function build(s) {
  const r = s.r;

  // ---- 0: dusk sky, sea, the sun on the horizon
  s.backdrop(s.lin([[0, '#15123c'], [0.2, '#3a1f66'], [0.38, '#7a2f78'], [0.5, '#c2496e'], [0.57, '#f0844c'], [0.59, '#ffc46a'], [0.592, '#d86a52'], [0.66, '#8a3c68'], [0.8, '#3a2058'], [1, '#120c2c']]));
  s.motes({ n: 60, y1: 300, rmin: 0.5, rmax: 1.8, color: '#fff2ff', opacity: 0.7, glow: false, layer: 0 });
  s.fog({ color: '#ff7aa0', opacity: 0.4, freq: 0.006, y: 60, h: 520, contrast: 2.6 });
  s.fog({ color: '#6a3ab0', opacity: 0.45, freq: 0.004, y: -120, h: 520, contrast: 2.4 });
  const sky = [];
  // the sun and its bloom (clipped at the horizon)
  const skyClip = s.clip(el('rect', { x: 0, y: 0, width: 1024, height: HZ }));
  sky.push(el('circle', { cx: SUN[0], cy: SUN[1], r: 420, fill: s.rad([[0, '#fff0b0', 0.85], [0.18, '#ffb45a', 0.55], [0.5, '#ff6a5a', 0.2], [1, '#ff6a5a', 0]]) }));
  // cloud streaks, lit from below
  for (let i = 0; i < 16; i++) {
    const y = 330 + Math.pow(r(), 0.7) * 250, x = r.range(-60, 1080), w = r.range(140, 420) * (0.5 + (y - 300) / 500), h = r.range(7, 20) * (1.4 - (y - 300) / 400);
    sky.push(el('ellipse', { cx: x, cy: y, rx: w, ry: h, fill: s.lin([[0, '#5a2a78', 0.75], [0.55, '#b0406e', 0.7], [1, '#ffb66a', 0.9]]), opacity: r.range(0.45, 0.85) }));
  }
  s.add(0, g({ 'clip-path': skyClip, filter: s.rough(12, 0.012, 4) }, sky));
  s.add(0, g({ 'clip-path': skyClip }, [
    el('circle', { cx: SUN[0], cy: SUN[1], r: 96, fill: '#ffe9a0', opacity: 0.55, filter: 'url(#glow32)' }),
    el('circle', { cx: SUN[0], cy: SUN[1], r: 60, fill: s.rad([[0, '#ffffff'], [0.6, '#fff6c8'], [1, '#ffd070']]) }),
  ]));
  // horizon haze
  s.add(0, el('rect', { x: 0, y: HZ - 34, width: 1024, height: 70, fill: s.lin([[0, '#ffc48a', 0], [0.5, '#ffd4a0', 0.5], [1, '#ffb080', 0]]) }));
  // the sea: swell lines in perspective and the sun's road across it
  const sea = [];
  for (let i = 0; i < 230; i++) {
    const t = Math.pow(r(), 1.7), y = HZ + 4 + t * 430, k = 0.18 + t * 1.5, x = r.range(-40, 1064), w = r.range(22, 90) * k;
    const lit = r() < 0.5;
    sea.push(el('ellipse', { cx: x, cy: y, rx: w, ry: 1.2 + k * 2.6, fill: lit ? '#ff9c78' : '#1a0e36', opacity: (lit ? 0.3 : 0.45) * r.range(0.4, 1) }));
  }
  for (let i = 0; i < 150; i++) {
    const t = Math.pow(r(), 1.5), y = HZ + 3 + t * 400, k = 0.2 + t * 1.5, x = SUN[0] + r.range(-1, 1) * (26 + t * 190) - t * 60, w = r.range(8, 34) * k;
    sea.push(el('ellipse', { cx: x, cy: y, rx: w, ry: 1 + k * 2, fill: r() < 0.6 ? '#ffe7a8' : '#ffb070', opacity: r.range(0.35, 0.95) * (1 - t * 0.5) }));
  }
  s.add(0, g({}, sea));
  s.add(0, el('ellipse', { cx: SUN[0] - 20, cy: HZ + 90, rx: 150, ry: 130, fill: '#ffc27a', opacity: 0.25, filter: 'url(#glow32)' }));
  s.vignette({ strength: 0.66, color: '#0a0420', cy: 0.5 });
  s.grain({ opacity: 0.2 });

  // ---- 1: sea stacks on the horizon, a wreck's ribs, gulls
  const stack = (x, w, h, o, sd) => {
    const d = `M${x - w} ${HZ + 4}C${x - w * 0.85} ${HZ - h * 0.5} ${x - w * 0.55} ${HZ - h * 0.95} ${x - w * 0.15} ${HZ - h}C${x + w * 0.2} ${HZ - h * 1.02} ${x + w * 0.3} ${HZ - h * 0.74} ${x + w * 0.45} ${HZ - h * 0.7}C${x + w * 0.8} ${HZ - h * 0.6} ${x + w * 0.9} ${HZ - h * 0.25} ${x + w} ${HZ + 4}Z`;
    s.add(1, el('path', { d, fill: s.lin([[0, '#8a4a80'], [0.6, '#5a2c66'], [1, '#3a1c50']]), opacity: o, filter: s.rough(9, 0.03, sd) }));
    s.add(1, el('path', { d, fill: '#2a1244', opacity: o * 0.35, transform: `translate(0 ${2 * HZ + 6}) scale(1 -0.6)`, filter: 'url(#glow4)' }));
  };
  stack(110, 84, 210, 0.9, 3); stack(226, 40, 96, 0.8, 5); stack(990, 64, 140, 0.85, 7); stack(40, 30, 58, 0.7, 9);
  // wreck ribs far left of centre
  const wreck = [];
  for (let i = 0; i < 7; i++) { const x = 330 + i * 17; wreck.push(el('path', { d: `M${x} ${HZ + 2}Q${x - 14 + i * 2} ${HZ - 40} ${x + 10 - i} ${HZ - 62 + Math.abs(i - 3) * 7}`, fill: 'none', stroke: '#4a2460', 'stroke-width': 4, 'stroke-linecap': 'round' })); }
  wreck.push(el('path', { d: `M312 ${HZ}L462 ${HZ - 8}L470 ${HZ + 3}L310 ${HZ + 4}Z`, fill: '#4a2460' }), el('path', { d: `M400 ${HZ}L418 ${HZ - 118}`, stroke: '#4a2460', 'stroke-width': 5 }), el('path', { d: `M396 ${HZ - 86}L440 ${HZ - 96}`, stroke: '#4a2460', 'stroke-width': 3 }));
  s.add(1, g({ opacity: 0.75 }, wreck));
  for (let i = 0; i < 7; i++) {
    const x = r.range(120, 440), y = r.range(170, 400), k = r.range(7, 16);
    s.add(1, el('path', { d: `M${x - k} ${y - k * 0.3}Q${x - k * 0.5} ${y - k * 0.7} ${x} ${y}Q${x + k * 0.5} ${y - k * 0.7} ${x + k} ${y - k * 0.3}`, fill: 'none', stroke: '#2a1444', 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: 0.8 }));
  }

  // ---- 2: the golem, its reflection, the rings it makes in the water
  const body = golem(s);
  const above = s.clip(el('rect', { x: 0, y: 0, width: 1024, height: WL }));
  s.def(`<filter id="dgWob" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.003 0.055" numOctaves="2" seed="8" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="1.6"/></filter>`);
  const fade = s.mask(el('rect', { x: 0, y: WL - 10, width: 1024, height: 320, fill: s.lin([[0, '#fff', 0.9], [0.5, '#fff', 0.45], [1, '#fff', 0]]) }));
  s.add(2, g({ mask: fade }, g({ filter: 'url(#dgWob)' }, g({ transform: `translate(0 ${2 * WL}) scale(1 -1)` }, g({ 'clip-path': above }, [body.flat, el('circle', { cx: CORE[0], cy: CORE[1], r: 60, fill: '#8fe6ff', filter: 'url(#glow16)' })])))));
  // blue light the core lays on the water
  s.add(2, el('ellipse', { cx: CORE[0], cy: WL + 70, rx: 150, ry: 46, fill: '#6fd8ff', opacity: 0.3, filter: 'url(#glow16)' }));
  s.add(2, g({ 'clip-path': above }, body.lit));
  // ripple rings around the legs and under the dripping fists
  const rings = [];
  for (const [x, w] of [[430, 1], [598, 1], [236, 0.6], [796, 0.6]]) {
    for (let k = 0; k < 4; k++) {
      const rx = (58 + k * 34) * w, ry = (7 + k * 4.5) * w, y = WL + (w < 1 ? 26 : 0) + k * 3;
      rings.push(el('ellipse', { cx: x + k * 4, cy: y, rx, ry, fill: 'none', stroke: k % 2 ? '#ffd9a0' : '#fff2d0', 'stroke-width': 3.2 - k * 0.6, opacity: 0.8 - k * 0.17, 'stroke-dasharray': `${r.int(40, 110)} ${r.int(12, 40)}` }));
      rings.push(el('ellipse', { cx: x + k * 4, cy: y + 3 + k, rx, ry, fill: 'none', stroke: '#1a0c30', 'stroke-width': 3, opacity: 0.4 - k * 0.07 }));
    }
  }
  for (const x of [430, 598]) rings.push(el('ellipse', { cx: x, cy: WL, rx: 56, ry: 8, fill: '#fff4dc', opacity: 0.55, filter: 'url(#glow4)' }));
  s.add(2, g({}, rings));

  // ---- 3: shore in front, spray, sparks off the core
  const fg = [];
  fg.push(el('path', { d: blob(70, 1010, 280, 120, r, 12, 0.2), fill: '#0c0620' }));
  fg.push(el('path', { d: blob(980, 1024, 260, 110, r, 12, 0.2), fill: '#0c0620' }));
  // a beached log and a tangle of branch in the near left corner
  fg.push(el('path', { d: ribbon([[-30, 930], [150, 900], [330, 925]], 60, 44), fill: '#120924' }));
  fg.push(el('path', { d: ribbon([[150, 905], [210, 820], [250, 760]], 16, 5), fill: '#120924' }), el('path', { d: ribbon([[200, 838], [246, 826], [282, 792]], 9, 3), fill: '#120924' }));
  fg.push(el('path', { d: 'M-30 902Q150 874 330 906', fill: 'none', stroke: '#ff9a6a', 'stroke-width': 2.5, opacity: 0.55 }));
  for (let i = 0; i < 22; i++) {                 // dune grass, right
    const x = 850 + r.range(0, 180), h = r.range(90, 230), lean = r.range(-50, 30);
    fg.push(el('path', { d: ribbon([[x, 1010], [x + lean * 0.3, 1010 - h * 0.6], [x + lean, 1010 - h]], 7, 1), fill: '#0e0722' }));
  }
  s.add(3, g({ filter: s.rough(6, 0.03, 12) }, fg));
  s.motes({ n: 26, x0: 330, x1: 700, y0: 230, y1: 640, rmin: 1.2, rmax: 4, colors: ['#9fe9ff', '#d6f6ff', '#6fd0ff'], opacity: 0.9 });
  s.motes({ n: 36, y0: 560, rmin: 1, rmax: 3.4, colors: ['#ffe3b0', '#ffc48a', '#ffffff'], opacity: 0.7 });
  s.add(3, glint(SUN[0] + 4, SUN[1] - 26, 24, '#fff6d0', 0.8), glint(CORE[0], CORE[1], 30, '#eaffff', 0.9), glint(868, 664, 13, '#ffe9b8', 0.8), glint(838, 716, 10, '#ffe9b8', 0.7), glint(780, 850, 12, '#ffe9b8', 0.6));
}

// ---------------------------------------------------------------------------------------------------- the golem

const PAL = [
  ['#ffc880', '#c8743c', '#6a3e3c', '#3a2234', '#1e1226'],
  ['#ffd098', '#b87a50', '#6e4a56', '#402a46', '#22152e'],
  ['#ffb060', '#a85a30', '#522e34', '#2c1a2c', '#170d1e'],
];

/** One driftwood log from (x0,y0) to (x1,y1), `w` thick (`w1` at the far end). The side to the left of travel is
 *  the lit one, so draw logs top-down / left-to-right to light their right / upper edge. */
function log(s, x0, y0, x1, y1, w, o = {}) {
  const r = s.r, L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI;
  const w1 = o.w1 ?? w, pal = PAL[o.pal ?? r.int(0, 2)], p = [];
  const hw = (t) => (w + (w1 - w) * t) / 2;
  const n = Math.max(4, Math.round(L / 40)), top = [], bot = [];
  for (let i = 0; i <= n; i++) { const t = i / n; top.push([L * t, -hw(t) + r.range(-1, 1) * w * 0.04]); bot.push([L * t, hw(t) + r.range(-1, 1) * w * 0.04]); }
  const jag = (x, h, dir) => { const q = []; for (let i = 1; i < 5; i++) q.push([x + dir * r.range(0, 0.22) * w, -h + 2 * h * i / 5]); return q; };
  const pts = [...top, ...(o.cap === 1 || o.cap === 2 ? [] : jag(L, hw(1), 1)), ...bot.reverse(), ...(o.cap === 0 || o.cap === 2 ? [] : jag(0, hw(0), -1).reverse())];
  const fill = s.lin([[0, pal[0]], [0.05, pal[1]], [0.22, pal[2]], [0.65, pal[3]], [1, pal[4]]]);
  p.push(el('path', { d: poly(pts, true), fill, stroke: '#140a1a', 'stroke-width': 2, 'stroke-linejoin': 'round' }));
  // grain
  const m = Math.round(w / 8);
  for (let k = 1; k < m; k++) {
    const y = -hw(0.5) + (2 * hw(0.5)) * k / m + r.range(-2, 2), xa = r.range(2, L * 0.3), xb = r.range(L * 0.6, L - 2);
    p.push(el('path', { d: `M${xa.toFixed(1)} ${y.toFixed(1)}Q${((xa + xb) / 2).toFixed(1)} ${(y + r.range(-5, 5)).toFixed(1)} ${xb.toFixed(1)} ${(y + r.range(-2, 2)).toFixed(1)}`, fill: 'none', stroke: k < m * 0.35 ? '#ffd29a' : '#120814', 'stroke-width': r.range(1, 2.4), opacity: k < m * 0.35 ? 0.22 : 0.4, 'stroke-linecap': 'round' }));
  }
  if (L > 90) for (let k = 0; k < (o.knots ?? 1); k++) {
    const kx = r.range(L * 0.2, L * 0.8), ky = r.range(-0.2, 0.25) * w, kr = w * r.range(0.08, 0.13);
    p.push(el('ellipse', { cx: kx, cy: ky, rx: kr * 1.9, ry: kr, fill: '#170b18', opacity: 0.5 }), el('ellipse', { cx: kx, cy: ky, rx: kr * 2.9, ry: kr * 1.7, fill: 'none', stroke: '#170b18', 'stroke-width': 1.4, opacity: 0.3 }));
  }
  // sawn end, rings showing
  const cap = (x, hh, litc) => {
    p.push(el('ellipse', { cx: x, cy: 0, rx: hh * 0.42, ry: hh, fill: litc ? s.rad([[0, '#ffe2b0'], [0.6, '#d99a62'], [1, '#8a5440']]) : s.rad([[0, '#8a6a74'], [0.6, '#5c4058'], [1, '#33203c']]), stroke: '#140a1a', 'stroke-width': 2 }));
    for (const k of [0.7, 0.45, 0.2]) p.push(el('ellipse', { cx: x, cy: 0, rx: hh * 0.42 * k, ry: hh * k, fill: 'none', stroke: litc ? '#7a4630' : '#241430', 'stroke-width': 1.6, opacity: 0.7 }));
  };
  if (o.cap === 1 || o.cap === 2) cap(L, hw(1), true);
  if (o.cap === 0 || o.cap === 2) cap(0, hw(0), false);
  return g({ transform: `translate(${x0} ${y0}) rotate(${a.toFixed(2)})` }, p);
}

/** A lashing of rope across something, from a to b. */
function rope(a, b, w = 12, bend = 0) {
  const mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bend, my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend;
  const d = `M${a[0]} ${a[1]}Q${mx.toFixed(1)} ${my.toFixed(1)} ${b[0]} ${b[1]}`;
  return [
    el('path', { d, fill: 'none', stroke: '#1c0f18', 'stroke-width': w + 3, 'stroke-linecap': 'round' }),
    el('path', { d, fill: 'none', stroke: '#5e4640', 'stroke-width': w, 'stroke-linecap': 'round' }),
    el('path', { d, fill: 'none', stroke: '#c49a6c', 'stroke-width': w * 0.62, 'stroke-dasharray': `${(w * 0.3).toFixed(1)} ${(w * 0.42).toFixed(1)}`, opacity: 0.7 }),
  ].join('');
}
const lash = (a, b, n, w = 11, bend = 0.12, gap = 13) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, out = [];
  for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * gap; out.push(rope([a[0] + nx * o, a[1] + ny * o], [b[0] + nx * o, b[1] + ny * o], w, bend)); }
  return out.join('');
};

function barnacles(s, x, y, w, h, n) {
  const r = s.r, p = [];
  for (let i = 0; i < n; i++) {
    const bx = x + r.range(-w, w) * Math.sqrt(r()), by = y + r.range(-h, h) * Math.sqrt(r()), k = r.range(2.5, 6.5);
    p.push(el('circle', { cx: bx, cy: by, r: k, fill: '#6e5c70', stroke: '#1c0f1c', 'stroke-width': 1.2 }), el('circle', { cx: bx + k * 0.25, cy: by - k * 0.25, r: k * 0.55, fill: '#b49a94' }), el('ellipse', { cx: bx, cy: by, rx: k * 0.36, ry: k * 0.22, fill: '#1c0f1c' }));
  }
  return p.join('');
}

function weed(s, x, y, len, n, color = '#1c2a2c') {
  const r = s.r, p = [];
  for (let i = 0; i < n; i++) {
    const x0 = x + r.range(-16, 16), l = len * r.range(0.5, 1.1), sw = r.range(-16, 16);
    p.push(el('path', { d: ribbon([[x0, y], [x0 + sw, y + l * 0.5], [x0 - sw * 0.6, y + l]], r.range(6, 11), 2, (t) => 0.8 + 0.3 * Math.sin(t * 14 + i)), fill: color, stroke: '#0a0612', 'stroke-width': 1 }));
  }
  return p.join('');
}

function fist(s, x, y, k, flip) {
  const r = s.r, p = [];
  for (let i = 0; i < 4; i++) {
    const a = (62 + i * 22 + r.range(-6, 6)) * Math.PI / 180, l = (54 + r.range(-8, 14)) * k;
    const ex = x + Math.cos(a) * l * flip, ey = y + Math.sin(a) * l;
    p.push(el('path', { d: ribbon([[x + Math.cos(a) * 14 * flip, y + 8], [x + Math.cos(a) * l * 0.6 * flip + r.range(-5, 5), y + Math.sin(a) * l * 0.62], [ex, ey + 6]], 26 * k, 9 * k), fill: s.lin([[0, '#5a3840'], [1, '#2a1828']]), stroke: '#140a1a', 'stroke-width': 2 }));
  }
  p.push(el('path', { d: blob(x, y, 50 * k, 44 * k, r, 9, 0.16), fill: s.rad([[0, '#8a5a50'], [0.6, '#4a2c38'], [1, '#26152a']], 0.68, 0.3, 0.8), stroke: '#140a1a', 'stroke-width': 2 }));
  for (let i = 0; i < 5; i++) p.push(el('path', { d: `M${x - 30 * k + i * 15 * k} ${y - 30 * k}q${r.range(-8, 8)} ${30 * k} ${r.range(-6, 6)} ${58 * k}`, fill: 'none', stroke: '#120814', 'stroke-width': 1.8, opacity: 0.5 }));
  return p.join('');
}

function golem(s) {
  const r = s.r, P = [];
  const [cx, cy] = CORE;

  // --- legs (behind the hips)
  P.push(log(s, 446, 560, 426, 800, 92, { w1: 100, pal: 2, knots: 2 }));
  P.push(log(s, 584, 560, 604, 800, 96, { w1: 104, pal: 0, knots: 2 }));
  P.push(lash([386, 668], [476, 676], 3, 10, 0.1), lash([554, 664], [652, 656], 3, 10, 0.1));
  P.push(barnacles(s, 430, 730, 40, 26, 14), barnacles(s, 606, 734, 44, 24, 16));

  // --- far arm pieces sit behind the torso: upper arms
  P.push(log(s, 352, 350, 278, 500, 70, { pal: 2 }));
  P.push(log(s, 676, 344, 752, 490, 72, { pal: 0 }));

  // --- chest cavity: dark hollow, the core, light rays leaking
  P.push(el('path', { d: 'M440 338L590 334L584 590L446 592Z', fill: '#0c0718' }));
  P.push(el('circle', { cx, cy, r: 120, fill: s.rad([[0, '#c8f6ff', 0.9], [0.3, '#3fa8f0', 0.6], [0.7, '#2a4ac0', 0.25], [1, '#2a3ab0', 0]]) }));
  const star = [];
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.2, l = i % 2 ? 44 : 104; star.push(el('path', { d: `M${cx} ${cy}L${cx + Math.cos(a - 0.04) * l} ${cy + Math.sin(a - 0.04) * l}L${cx + Math.cos(a + 0.04) * l} ${cy + Math.sin(a + 0.04) * l}Z`, fill: '#bfeeff', opacity: 0.4 })); }
  P.push(g({ filter: 'url(#glow4)' }, star));
  // the core: a splinter of fallen star
  const shard = poly([[cx, cy - 46], [cx + 15, cy - 13], [cx + 40, cy - 2], [cx + 14, cy + 14], [cx + 5, cy + 50], [cx - 13, cy + 15], [cx - 38, cy + 3], [cx - 14, cy - 12]], true);
  P.push(el('path', { d: shard, fill: '#7fe0ff', filter: 'url(#glow16)' }), el('path', { d: shard, fill: s.rad([[0, '#ffffff'], [0.5, '#d9fbff'], [1, '#7fdcff']]), filter: 'url(#bloomS)' }));

  // --- torso: a fan of upright logs either side of the hollow, ribs of branch across it
  P.push(log(s, 396, 346, 436, 584, 66, { pal: 1, knots: 2 }));
  P.push(log(s, 636, 340, 594, 584, 68, { pal: 0, knots: 2 }));
  P.push(log(s, 452, 344, 466, 586, 44, { pal: 2 }));
  P.push(log(s, 580, 340, 562, 586, 46, { pal: 1 }));
  for (const [ya, yb, w] of [[392, 384, 13], [500, 512, 12], [548, 540, 14]]) {
    P.push(el('path', { d: ribbon([[462, ya], [cx, (ya + yb) / 2 + (ya < cy ? -16 : 16)], [570, yb]], w, w * 0.8), fill: s.lin([[0, '#6a4048'], [1, '#22121e']]), stroke: '#0e0612', 'stroke-width': 1.6 }));
  }
  P.push(rope([452, 420], [582, 480], 8, 0.05), rope([578, 414], [456, 484], 8, -0.05));
  // blue light catching the inner faces of the chest
  const coreWash = el('ellipse', { cx, cy, rx: 170, ry: 190, fill: s.rad([[0, '#7fe0ff', 0.42], [0.45, '#4fb0ff', 0.2], [1, '#4fb0ff', 0]]) });

  // --- hips: one fat log slung across
  P.push(log(s, 398, 590, 632, 580, 74, { pal: 1, cap: 1, knots: 2 }));
  P.push(lash([430, 550], [436, 628], 3, 9, 0.1), lash([560, 548], [566, 626], 2, 9, 0.1));
  P.push(weed(s, 500, 612, 90, 5), barnacles(s, 420, 596, 22, 22, 7));

  // --- net slung from the right shoulder down across the flank, with glass floats
  const netShape = 'M598 330C640 350 668 420 660 500C654 560 628 600 600 620C590 560 596 470 580 400C576 370 584 340 598 330Z';
  const nc = s.clip(el('path', { d: netShape }));
  const mesh = [];
  for (let i = -8; i < 14; i++) { mesh.push(el('path', { d: `M${520 + i * 17} 320l150 320`, stroke: '#e8c9a0', 'stroke-width': 1.6 }), el('path', { d: `M${700 + i * 17} 320l-170 320`, stroke: '#e8c9a0', 'stroke-width': 1.6 })); }
  P.push(g({ 'clip-path': nc, opacity: 0.6 }, mesh), el('path', { d: netShape, fill: 'none', stroke: '#c9a070', 'stroke-width': 3, opacity: 0.8 }));
  for (const [fx, fy, fr] of [[660, 452, 19], [640, 546, 15], [606, 622, 17]]) {
    P.push(el('circle', { cx: fx, cy: fy, r: fr * 1.8, fill: '#5fe0d0', opacity: 0.25, filter: 'url(#glow8)' }));
    P.push(el('circle', { cx: fx, cy: fy, r: fr, fill: s.rad([[0, '#eafff6', 0.95], [0.4, '#58d8c4', 0.8], [1, '#156a78', 0.9]], 0.66, 0.3, 0.8), stroke: '#0c2a34', 'stroke-width': 1.6 }));
    P.push(el('ellipse', { cx: fx + fr * 0.35, cy: fy - fr * 0.4, rx: fr * 0.3, ry: fr * 0.16, fill: '#fff', opacity: 0.9, transform: `rotate(35 ${fx + fr * 0.35} ${fy - fr * 0.4})` }));
  }

  // --- shoulders: the yoke, a great beam with a sawn end to the sun
  P.push(log(s, 314, 346, 712, 326, 88, { pal: 0, cap: 1, knots: 3 }));
  P.push(lash([372, 300], [378, 392], 3, 11, 0.1), lash([648, 286], [654, 378], 3, 11, 0.1));
  P.push(barnacles(s, 336, 350, 20, 28, 9), weed(s, 330, 386, 120, 4), weed(s, 690, 366, 80, 3));

  // --- forearms and fists
  P.push(log(s, 280, 482, 246, 662, 78, { w1: 96, pal: 1, knots: 2 }));
  P.push(log(s, 750, 474, 790, 656, 82, { w1: 100, pal: 0, knots: 2 }));
  P.push(lash([238, 492], [318, 510], 4, 11, 0.1, 12), lash([712, 500], [796, 480], 4, 11, 0.1, 12));
  P.push(barnacles(s, 250, 620, 32, 30, 12), barnacles(s, 794, 624, 30, 26, 9), weed(s, 268, 560, 110, 3), weed(s, 772, 540, 90, 3));
  P.push(fist(s, 236, 700, 1, -1), fist(s, 798, 696, 1.04, 1));
  P.push(lash([196, 664], [286, 672], 2, 10, 0.1), lash([750, 664], [848, 654], 2, 10, 0.1));

  // --- head: a splintered stump with knot-hole eyes, a forked branch for a horn (and a gull on it)
  const Hd = [];
  Hd.push(el('path', { d: ribbon([[468, 236], [428, 196], [404, 138]], 20, 6), fill: '#3a2230', stroke: '#140a1a', 'stroke-width': 2 }));
  Hd.push(el('path', { d: ribbon([[424, 190], [392, 186], [366, 160]], 10, 4), fill: '#3a2230', stroke: '#140a1a', 'stroke-width': 2 }));
  const head = 'M452 306L446 230Q448 196 470 198L482 166L500 200L520 190L534 150L552 178L566 204Q584 220 580 246L574 304Q512 322 452 306Z';
  Hd.push(el('path', { d: head, fill: s.lin([[0, '#2a1830'], [0.5, '#4e3046'], [0.86, '#8a5648'], [0.96, '#e09858'], [1, '#ffd08a']], 0, 0, 1, 0), stroke: '#140a1a', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
  const hc = s.clip(el('path', { d: head }));
  const hg = [];
  for (let i = 0; i < 11; i++) { const x = 454 + i * 12 + r.range(-3, 3); hg.push(el('path', { d: `M${x} 160q${r.range(-7, 7)} 70 ${r.range(-5, 5)} 150`, fill: 'none', stroke: '#120814', 'stroke-width': r.range(1.2, 2.6), opacity: 0.45 })); }
  hg.push(el('ellipse', { cx: 514, cy: 322, rx: 70, ry: 26, fill: '#6fd8ff', opacity: 0.4, filter: 'url(#glow8)' }));
  Hd.push(g({ 'clip-path': hc }, hg));
  // eye sockets and eyes
  for (const [ex, ey] of [[486, 252], [544, 250]]) {
    Hd.push(el('ellipse', { cx: ex, cy: ey, rx: 17, ry: 13, fill: '#0a0512' }));
    Hd.push(el('ellipse', { cx: ex, cy: ey, rx: 26, ry: 20, fill: '#6fd8ff', opacity: 0.45, filter: 'url(#glow8)' }));
    Hd.push(el('ellipse', { cx: ex, cy: ey + 1, rx: 10, ry: 8, fill: s.rad([[0, '#ffffff'], [0.5, '#bff4ff'], [1, '#3fb4ff']]) }));
    Hd.push(el('circle', { cx: ex + 3, cy: ey - 2, r: 2.6, fill: '#fff' }));
  }
  // brow: two sticks lashed on, set in a frown; a split for a mouth
  Hd.push(el('path', { d: ribbon([[450, 222], [482, 228], [512, 240]], 16, 10), fill: s.lin([[0, '#7a4c44'], [1, '#2a1828']]), stroke: '#140a1a', 'stroke-width': 2 }));
  Hd.push(el('path', { d: ribbon([[584, 214], [548, 226], [516, 240]], 17, 10), fill: s.lin([[0, '#d99458'], [1, '#3a2030']]), stroke: '#140a1a', 'stroke-width': 2 }));
  Hd.push(rope([508, 226], [520, 252], 7, 0.1));
  Hd.push(el('path', { d: 'M474 286L490 281L502 289L518 282L532 290L548 283L558 288', fill: 'none', stroke: '#0a0512', 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: 0.8 }));
  Hd.push(barnacles(s, 462, 280, 10, 16, 5), weed(s, 566, 300, 60, 3));

  Hd.push(gull(398, 128));
  P.push(g({ transform: 'rotate(-5 512 306) translate(512 336) scale(1.25) translate(-512 -310)' }, Hd));

  const flat = g({}, P);
  // backlit: the side away from the sun falls into violet shadow, then the core's blue washes back over the chest
  s.def('<filter id="dgWhite"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>');
  const sil = s.mask(g({ filter: 'url(#dgWhite)' }, flat));
  const shade = el('rect', { x: 0, y: 0, width: 1024, height: 1024, mask: sil, fill: s.lin([[0, '#1a0c34', 0.05], [0.5, '#180a32', 0.4], [1, '#12082a', 0.72]], 820, 300, 200, 560, true) });
  const lit = g({ filter: s.emboss({ color: '#8f8cff', az: 205, elev: 40, depth: 6, k: 0.35, exp: 14, blur: 5 }) },
    g({ filter: s.emboss({ color: '#ffc27a', az: 335, elev: 30, depth: 9, k: 1.15, exp: 12, blur: 6 }) }, [flat, shade, g({ mask: sil }, coreWash)]));
  return { flat, lit };
}

/** A gull, perched, lit by the last of the sun. */
function gull(x, y) {
  return g({ transform: `translate(${x} ${y})` }, [
    el('path', { d: 'M-16 -4C-12 -16 6 -18 14 -10C18 -6 16 2 8 4C0 6 -10 4 -16 -4Z', fill: '#e9d6dc', stroke: '#1a0e22', 'stroke-width': 1.5 }),
    el('path', { d: 'M-24 -2C-14 -12 2 -12 8 -4C0 2 -12 2 -24 -2Z', fill: '#5a4868', stroke: '#1a0e22', 'stroke-width': 1.5 }),
    el('circle', { cx: 13, cy: -15, r: 7, fill: '#f6e6e6', stroke: '#1a0e22', 'stroke-width': 1.5 }),
    el('path', { d: 'M19 -16L29 -13L19 -11Z', fill: '#ffb040', stroke: '#1a0e22', 'stroke-width': 1 }),
    el('circle', { cx: 15, cy: -16, r: 1.4, fill: '#1a0e22' }),
    el('path', { d: 'M0 4L-1 12M5 4L5 12', stroke: '#ffb040', 'stroke-width': 1.8 }),
  ]);
}
