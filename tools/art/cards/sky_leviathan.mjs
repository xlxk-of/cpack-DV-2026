// LEVIATHAN OF THE SUNKEN SKY (legendary) — a whale the size of a night, the old constellations still burning on its hide.
import { el, g, spline, sample, poly, ribbon, glint } from '../lib.mjs';

// ------------------------------------------------------------------------------------------------ local helpers

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));

/** Sampled centreline with unit tangents/normals, arc length and t (0..1 by length). */
function frame(pts, per = 12) {
  const sm = sample(pts, per);
  let acc = 0;
  return sm.map((p, i) => {
    const a = sm[Math.max(0, i - 1)], b = sm[Math.min(sm.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    if (i > 0) acc += Math.hypot(p[0] - sm[i - 1][0], p[1] - sm[i - 1][1]);
    return { x: p[0], y: p[1], tx: dx / l, ty: dy / l, nx: -dy / l, ny: dx / l, t: 0, len: acc };
  }).map((p, i, all) => { p.t = p.len / (all[all.length - 1].len || 1); return p; });
}

/** Smooth interpolation through a table of [t, value]. */
function interp(table, t) {
  if (t <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    if (t <= table[i][0]) {
      const u = (t - table[i - 1][0]) / (table[i][0] - table[i - 1][0]), k = u * u * (3 - 2 * u);
      return table[i - 1][1] + (table[i][1] - table[i - 1][1]) * k;
    }
  }
  return table[table.length - 1][1];
}

/** Tinted turbulence: fills its source shape with blotches of `color`. */
function mottle(s, color, freq, contrast, seed, fy = freq) {
  const id = s.uid('mt'), off = -(contrast - 1) * 0.6, c = hex(color).map((v) => (v / 255).toFixed(3));
  s.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${freq} ${fy}" numOctaves="4" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 ${c[0]}  0 0 0 0 ${c[1]}  0 0 0 0 ${c[2]}  ${contrast} 0 0 0 ${off}"/><feComposite in2="SourceGraphic" operator="in"/></filter>`);
  return `url(#${id})`;
}
function mist(s, { color, opacity = 0.3, freq = 0.006, seed = 1, x = 0, y = 0, w = 1024, h = 1024, contrast = 2.2 }) {
  const m = s.mask(el('rect', { x, y, width: w, height: h, fill: s.rad([[0, '#fff', 1], [0.7, '#fff', 0.7], [1, '#fff', 0]], 0.5, 0.5, 0.6) }));
  return g({ mask: m, opacity }, el('rect', { x, y, width: w, height: h, fill: color, filter: mottle(s, color, freq, contrast, seed) }));
}

/** A star: soft halo, hot core, and for the big ones a four-point flare. */
function star(x, y, rr, color = '#ffe9a8', flare = false, op = 1) {
  const p = [el('circle', { cx: x, cy: y, r: rr * 3.2, fill: color, opacity: 0.2 * op }), el('circle', { cx: x, cy: y, r: rr, fill: '#fffdf0', opacity: op })];
  if (flare) {
    const L = rr * 5.2, k = rr * 0.3;
    p.push(el('path', { d: `M${x} ${y - L}Q${x + k} ${y - k} ${x + L} ${y}Q${x + k} ${y + k} ${x} ${y + L}Q${x - k} ${y + k} ${x - L} ${y}Q${x - k} ${y - k} ${x} ${y - L}Z`, fill: '#fff6d0', opacity: 0.9 * op }));
  }
  return p.join('');
}

// ------------------------------------------------------------------------------------------------ the whale

function whale(s) {
  const spine = [[112, 416], [250, 394], [400, 398], [560, 428], [700, 452], [800, 438], [862, 402], [904, 352]];
  const F = frame(spine, 26), total = F[F.length - 1].len;
  const topT = [[0, 12], [0.04, 46], [0.12, 76], [0.25, 98], [0.42, 106], [0.6, 88], [0.78, 50], [0.92, 21], [1, 13]];
  const botT = [[0, 14], [0.04, 56], [0.12, 108], [0.25, 132], [0.42, 124], [0.6, 90], [0.78, 46], [0.92, 19], [1, 13]];
  const at = (t) => {
    const L = total * Math.max(0, Math.min(1, t));
    let i = 1;
    while (i < F.length - 1 && F[i].len < L) i++;
    const a = F[i - 1], b = F[i], u = (L - a.len) / ((b.len - a.len) || 1);
    return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, nx: a.nx + (b.nx - a.nx) * u, ny: a.ny + (b.ny - a.ny) * u, tx: a.tx + (b.tx - a.tx) * u, ty: a.ty + (b.ty - a.ty) * u };
  };
  /** A point on the body: t along it (0 snout .. 1 tail), v across it (-1 back .. +1 belly). */
  const B = (t, v) => { const p = at(t), w = (v < 0 ? interp(topT, t) : interp(botT, t)) * v; return [p.x + p.nx * w, p.y + p.ny * w]; };
  const N = 90, top = [], bot = [];
  for (let i = 0; i <= N; i++) { top.push(B(i / N, -1)); bot.push(B(i / N, 1)); }
  const nose = [F[0].x - F[0].tx * 16, F[0].y - F[0].ty * 16 + 2];
  const body = poly([nose].concat(top, bot.slice().reverse()), true);

  // flukes
  const e = at(1), ea = Math.atan2(e.ty, e.tx);
  const fl = (u, w) => [e.x + Math.cos(ea) * u - Math.sin(ea) * w, e.y + Math.sin(ea) * u + Math.cos(ea) * w];
  const flukeFar = spline([fl(-20, -12), fl(26, -52), fl(58, -104), fl(72, -150), fl(96, -96), fl(92, -40), fl(74, 2), fl(30, 6)], true);
  const flukeNear = spline([fl(-20, 12), fl(26, 56), fl(56, 116), fl(66, 172), fl(96, 108), fl(94, 44), fl(74, -2), fl(30, -6)], true);

  // pectoral fins: long, knobbed on the leading edge
  const fin = (t, v, dx, dy, len, w) => {
    const b = B(t, v), pts = [b, [b[0] + dx * 0.22 - dy * 0.1, b[1] + dy * 0.3], [b[0] + dx * 0.6 - dy * 0.06, b[1] + dy * 0.72], [b[0] + dx, b[1] + dy]];
    return { d: ribbon(pts, w, w * 0.16, (u) => (0.72 + 0.5 * Math.sin(Math.PI * Math.min(1, u * 1.2))) * (1 + 0.07 * Math.sin(u * 42)), 14), pts };
  };
  const finNear = fin(0.275, 0.78, 250, 236, 300, 78), finFar = fin(0.235, 0.9, 120, 250, 250, 60);
  const dorsal = poly([B(0.655, -0.96), [B(0.705, -1)[0] + 20, B(0.705, -1)[1] - 34], B(0.74, -0.96)], true);
  return { F, at, B, top, bot, body, flukeNear, flukeFar, finNear, finFar, dorsal, e, ea };
}

// ------------------------------------------------------------------------------------------------ the scene

export function build(s) {
  const r = s.r;
  const W = whale(s);
  const { B } = W;
  const K = 1.22, ZX = 540, ZY = 440, ZT = `translate(${ZX} ${ZY}) scale(${K}) translate(${-ZX} ${-ZY})`;   // the whale, brought closer
  const Z = (p) => [ZX + (p[0] - ZX) * K, ZY + (p[1] - ZY) * K];

  // ---- 0: the drowned sky
  s.backdrop(s.lin([[0, '#2c74d6'], [0.14, '#1a4fb0'], [0.4, '#0c2672'], [0.72, '#060f3e'], [1, '#02051c']]));
  s.add(0, el('ellipse', { cx: 560, cy: -30, rx: 560, ry: 300, fill: s.rad([[0, '#d6f2ff', 0.95], [0.3, '#7cc0ff', 0.55], [1, '#4a8cf0', 0]]) }));
  s.add(0, el('ellipse', { cx: 520, cy: 470, rx: 560, ry: 330, fill: s.rad([[0, '#3a5cd8', 0.42], [0.6, '#2a3cb0', 0.16], [1, '#2a3cb0', 0]]) }));
  s.add(0, mist(s, { color: '#6a5ce8', opacity: 0.4, freq: 0.004, seed: 8 }));
  s.add(0, mist(s, { color: '#2ab8d8', opacity: 0.3, freq: 0.007, seed: 21, y: 100, h: 760 }));
  s.add(0, mist(s, { color: '#f0b85a', opacity: 0.16, freq: 0.006, seed: 40, y: 380, h: 700 }));
  s.rays({ x: 560, y: -160, angle: 92, spread: 78, n: 13, color: '#cfe8ff', opacity: 0.2, width: 90, len: 1250, blur: 16 });
  // the stars that fell: a whole sky of them hanging in the water
  const sky = [];
  for (let i = 0; i < 240; i++) {
    const x = r.range(0, 1024), y = r.range(0, 1024), rr = 0.5 + 1.8 * Math.pow(r(), 3.2), depth = 0.35 + 0.65 * (y / 1024);
    sky.push(star(x, y, rr, r() < 0.6 ? '#ffe9a8' : '#bfe0ff', rr > 1.7 && r() < 0.3, depth * r.range(0.4, 0.9)));
  }
  // old constellations, faint in the distance
  for (let c = 0; c < 5; c++) {
    let x = r.range(80, 940), y = r.range(c < 2 ? 80 : 600, c < 2 ? 260 : 880);
    const pts = [[x, y]];
    for (let k = 0; k < r.int(3, 5); k++) { x += r.range(30, 80) * r.sign(); y += r.range(-50, 50); pts.push([x, y]); }
    sky.push(el('path', { d: poly(pts), fill: 'none', stroke: '#ffe2a0', 'stroke-width': 1.2, opacity: 0.3 }));
    for (const p of pts) sky.push(star(p[0], p[1], 2, '#ffe9a8', true, 0.6));
  }
  s.add(0, g({}, sky));
  s.vignette({ strength: 0.72, cy: 0.4, r: 0.82 });
  s.grain({ opacity: 0.18 });

  // ---- 1: the far water — a boat on the surface, its diving bell, more of the pod, the seabed strewn with stars
  const far = [];
  // boat seen from beneath, haloed by the day
  far.push(el('ellipse', { cx: 706, cy: 22, rx: 150, ry: 46, fill: '#eaf8ff', opacity: 0.6, filter: 'url(#glow16)' }));
  far.push(el('path', { d: 'M650 14Q706 54 762 14Q706 24 650 14Z', fill: '#06143c' }));
  far.push(el('path', { d: 'M650 14Q706 24 762 14', fill: 'none', stroke: '#06143c', 'stroke-width': 5, 'stroke-linecap': 'round' }));
  // the chain and the bell
  const bell = [716, 150];
  far.push(el('path', { d: `M706 30Q716 110 ${bell[0]} ${bell[1] - 24}`, fill: 'none', stroke: '#0a1c4c', 'stroke-width': 1.6, 'stroke-dasharray': '4 2.4' }));
  far.push(el('circle', { cx: bell[0], cy: bell[1] + 4, r: 46, fill: '#ffcf6a', opacity: 0.45, filter: 'url(#glow16)' }));
  far.push(el('path', { d: `M${bell[0] - 13} ${bell[1] + 16}C${bell[0] - 14} ${bell[1] - 30} ${bell[0] + 14} ${bell[1] - 30} ${bell[0] + 13} ${bell[1] + 16}Z`, fill: '#0a1a48', stroke: '#6f8fd8', 'stroke-width': 1 }));
  far.push(el('circle', { cx: bell[0], cy: bell[1] - 2, r: 5, fill: '#ffe9a0' }), el('circle', { cx: bell[0], cy: bell[1] - 2, r: 5, fill: 'none', stroke: '#06143c', 'stroke-width': 1.2 }));
  far.push(el('path', { d: `M${bell[0] - 15} ${bell[1] + 16}L${bell[0] + 15} ${bell[1] + 16}`, stroke: '#6f8fd8', 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  for (let i = 0; i < 7; i++) far.push(el('circle', { cx: bell[0] + r.range(-10, 12), cy: bell[1] - 34 - i * 17, r: r.range(1.2, 3), fill: 'none', stroke: '#cfe8ff', 'stroke-width': 0.8, opacity: 0.7 }));
  s.add(1, g({}, far));
  // two more of the pod, far off
  const ghost = (tx, ty, k, op, flip) => g({ transform: `translate(${tx} ${ty}) scale(${flip ? -k : k} ${k})`, opacity: op, filter: s.blur(2.2 / k * 0.4) }, [
    el('path', { d: W.flukeFar, fill: '#1c3c94' }), el('path', { d: W.flukeNear, fill: '#1c3c94' }), el('path', { d: W.finNear.d, fill: '#1c3c94' }),
    el('path', { d: W.body, fill: s.lin([[0, '#3a66c8'], [0.5, '#1c3c94'], [1, '#2a52b0']]) }),
  ]);
  s.add(1, ghost(60, 70, 0.2, 0.5, false), ghost(1030, 590, 0.15, 0.4, true));
  // stars still sinking, trailing light
  const sink = [];
  for (const [x, y, len] of [[150, 300, 190], [310, 180, 120], [880, 250, 170], [450, 690, 150], [940, 640, 110], [60, 610, 130], [600, 250, 90]]) {
    sink.push(el('path', { d: `M${x} ${y - len}L${x} ${y}`, stroke: s.lin([[0, '#ffe9a8', 0], [1, '#ffe9a8', 0.8]], x, y - len, x, y, true), 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
    sink.push(el('circle', { cx: x, cy: y, r: 16, fill: '#ffd97a', opacity: 0.35, filter: 'url(#glow8)' }), star(x, y, 3.2, '#ffe9a8', true));
  }
  s.add(1, g({}, sink));
  // seabed, with the stars that have come to rest on it
  s.ridge({ y: 880, amp: 90, detail: 0.7, fill: s.lin([[0, '#1a3a94'], [0.3, '#0e1f60'], [1, '#050a2c']], 0, 800, 0, 1024, true), layer: 1, opacity: 0.9 });
  const bed = [];
  for (let i = 0; i < 16; i++) {
    const x = r.range(20, 1004), y = r.range(880, 990), rr = r.range(2, 5);
    bed.push(el('ellipse', { cx: x, cy: y + 4, rx: rr * 9, ry: rr * 3, fill: '#ffd070', opacity: 0.28, filter: 'url(#glow8)' }), star(x, y, rr, '#ffe9a8', rr > 3));
  }
  s.add(1, g({}, bed));
  s.ridge({ y: 960, amp: 60, detail: 0.9, fill: s.lin([[0, '#0c1c5a'], [1, '#03061e']], 0, 900, 0, 1024, true), layer: 1 });

  // ---- 2: the leviathan
  const L = [];
  const flukeFill = s.lin([[0, '#16307e'], [1, '#2a50a8']]);
  L.push(el('path', { d: W.finFar.d, fill: s.lin([[0, '#0a1648'], [1, '#14307a']]) }));
  L.push(el('path', { d: W.flukeFar, fill: '#2a52ac' }), el('path', { d: W.flukeFar, fill: 'none', stroke: '#9fc8ff', 'stroke-width': 1.4, opacity: 0.45 }));
  L.push(el('path', { d: W.flukeNear, fill: flukeFill }));
  L.push(el('path', { d: W.flukeNear, fill: 'none', stroke: '#b8dcff', 'stroke-width': 1.6, opacity: 0.6 }));
  // aura
  L.push(el('path', { d: W.body, fill: '#5a8cff', opacity: 0.4, filter: 'url(#glow32)' }));
  L.push(el('path', { d: W.body, fill: s.lin([[0, '#2a56b8'], [0.2, '#10246c'], [0.55, '#0a1448'], [0.8, '#152c78'], [1, '#3260b4']]) }));
  const clip = s.clip(el('path', { d: W.body }));
  const inn = [];
  // the night on its hide: a river of nebula along the flank
  const band = poly(Array.from({ length: 41 }, (_, i) => B(i / 40, -0.62)).concat(Array.from({ length: 41 }, (_, i) => B(1 - i / 40, 0.3))), true);
  inn.push(g({ filter: 'url(#glow16)' }, [
    el('path', { d: band, fill: '#6a48e8', opacity: 0.55, filter: mottle(s, '#7a54f0', 0.007, 3.0, 12, 0.014) }),
    el('path', { d: band, fill: '#2ac0e0', opacity: 0.45, filter: mottle(s, '#30c8e8', 0.009, 3.2, 33, 0.018) }),
    el('path', { d: band, fill: '#ffc870', opacity: 0.35, filter: mottle(s, '#ffc870', 0.012, 3.6, 51, 0.02) }),
  ]));
  // pale belly and throat pleats
  const belly = poly(Array.from({ length: 31 }, (_, i) => B(i / 30 * 0.66, 0.42)).concat(Array.from({ length: 31 }, (_, i) => B((1 - i / 30) * 0.66, 1.1))), true);
  inn.push(el('path', { d: belly, fill: '#86b4f0', opacity: 0.42, filter: 'url(#glow16)' }));
  for (let k = 0; k < 9; k++) {
    const v = 0.4 + k * 0.073, tEnd = 0.46 + k * 0.022;
    const pts = Array.from({ length: 30 }, (_, i) => B(0.012 + (tEnd - 0.012) * (i / 29), v * (0.55 + 0.45 * Math.min(1, i / 6))));
    inn.push(el('path', { d: poly(pts), fill: 'none', stroke: '#061040', 'stroke-width': 2.2, opacity: 0.6 }));
    inn.push(el('path', { d: poly(pts.map((p) => [p[0], p[1] + 2.6])), fill: 'none', stroke: '#bcd8ff', 'stroke-width': 1.2, opacity: 0.3 }));
  }
  // daylight dappling the back
  const backBand = poly(Array.from({ length: 41 }, (_, i) => B(i / 40, -1.1)).concat(Array.from({ length: 41 }, (_, i) => B(1 - i / 40, -0.45))), true);
  inn.push(el('path', { d: backBand, fill: '#bfe2ff', opacity: 0.5, filter: mottle(s, '#cfeaff', 0.02, 4.2, 5, 0.05) }));
  inn.push(el('path', { d: poly(W.top), fill: 'none', stroke: '#a8d4ff', 'stroke-width': 30, opacity: 0.5, filter: 'url(#glow8)' }));
  // weight underneath
  inn.push(el('path', { d: poly(W.bot.slice(40)), fill: 'none', stroke: '#040a2c', 'stroke-width': 40, opacity: 0.6, filter: 'url(#glow16)' }));
  // the scatter of small stars
  const st = [];
  for (let i = 0; i < 260; i++) {
    const t = r.range(0.02, 0.97), v = r.range(-0.92, 0.92), p = B(t, v), rr = 0.45 + 1.5 * Math.pow(r(), 3);
    if (t < 0.5 && v > 0.45 && r() < 0.8) continue;
    st.push(star(p[0], p[1], rr * (1 - t * 0.35), r() < 0.7 ? '#ffe9a8' : '#cfe8ff', rr > 1.6 && r() < 0.3, r.range(0.5, 0.95)));
  }
  inn.push(g({}, st));
  // the constellations, in (t, v) on the body: nodes, then pairs of node indices to join
  const cons = [
    { n: [[0.10, -0.42], [0.125, -0.74], [0.155, -0.44], [0.185, -0.8], [0.215, -0.44], [0.245, -0.74], [0.27, -0.42]], e: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [0, 6]] },   // the Crown
    { n: [[0.32, -0.04], [0.355, 0.2], [0.44, 0.2], [0.475, -0.04], [0.40, 0.2], [0.40, -0.62], [0.455, -0.14], [0.40, -0.14]], e: [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7]] },   // the Ship
    { n: [[0.565, -0.7], [0.565, 0.3], [0.525, 0.04], [0.605, 0.04], [0.54, -0.5], [0.59, -0.5], [0.565, -0.86]], e: [[0, 1], [2, 1], [1, 3], [4, 5], [0, 6]] },   // the Anchor
    { n: [[0.65, -0.3], [0.69, -0.56], [0.73, -0.22], [0.77, -0.5], [0.81, -0.16], [0.85, -0.44], [0.89, -0.1]], e: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]] },   // the Serpent
    { n: [[0.62, 0.5], [0.66, 0.26], [0.71, 0.5], [0.66, 0.74], [0.745, 0.3], [0.745, 0.7]], e: [[0, 1], [1, 2], [2, 3], [3, 0], [2, 4], [4, 5], [5, 2]] },   // the Fish
    { n: [[0.045, -0.3], [0.075, 0.1], [0.11, -0.12], [0.15, 0.12], [0.185, -0.1]], e: [[0, 1], [1, 2], [2, 3], [3, 4]] },   // the Wave, on the brow
  ];
  const lines = [], nodes = [];
  for (const c of cons) {
    const P = c.n.map(([t, v]) => B(t, v));
    for (const [a, b] of c.e) lines.push(el('path', { d: `M${P[a][0]} ${P[a][1]}L${P[b][0]} ${P[b][1]}`, stroke: '#ffe6a8', 'stroke-width': 1.7, 'stroke-linecap': 'round' }));
    P.forEach((p, i) => nodes.push(star(p[0], p[1], i % 3 === 0 ? 3.3 : 2.4, '#ffd97a', true)));
  }
  inn.push(g({ opacity: 0.7, filter: 'url(#glow4)' }, lines.map((l) => l.replace('stroke-width="1.7"', 'stroke-width="7"'))));
  inn.push(g({}, lines.map((l) => l.replace('stroke-width="1.7"', 'stroke-width="2.1"'))));
  inn.push(g({ filter: 'url(#bloomS)' }, nodes));
  // distance takes the tail
  inn.push(el('rect', { x: 560, y: 200, width: 480, height: 420, fill: s.lin([[0, '#2a56b8', 0], [1, '#2a56b8', 0.6]], 0, 0, 1, 0) }));
  // the mouth, the tubercles of the rostrum
  const mouth = [B(0, 0.5), B(0.05, 0.34), B(0.11, 0.3), B(0.165, 0.4), B(0.2, 0.58), B(0.218, 0.84)];
  inn.push(el('path', { d: spline(mouth), fill: 'none', stroke: '#030828', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.85 }));
  inn.push(el('path', { d: spline(mouth.map((p) => [p[0] + 1, p[1] - 4])), fill: 'none', stroke: '#9fc8ff', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.5 }));
  for (let i = 0; i < 11; i++) {
    const p = B(0.014 + i * 0.012 + r.range(-0.004, 0.004), r.range(-0.86, -0.3)), rr = r.range(2.2, 4);
    inn.push(el('circle', { cx: p[0], cy: p[1], r: rr, fill: '#2a4ca8', stroke: '#030828', 'stroke-width': 0.7, 'stroke-opacity': 0.4 }), el('circle', { cx: p[0] - rr * 0.3, cy: p[1] - rr * 0.35, r: rr * 0.4, fill: '#cfe6ff', opacity: 0.7 }));
  }
  L.push(g({ 'clip-path': clip }, inn));
  // rim of daylight along the back
  L.push(el('path', { d: poly(W.top.slice(0, 80)), fill: 'none', stroke: '#e6f6ff', 'stroke-width': 3, opacity: 0.9, 'stroke-linecap': 'round', filter: 'url(#bloomS)' }));
  L.push(el('path', { d: poly(W.bot), fill: 'none', stroke: '#6f9cf0', 'stroke-width': 1.5, opacity: 0.5 }));
  // dorsal fin
  L.push(el('path', { d: W.dorsal, fill: '#16307e', stroke: '#cfe8ff', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }));
  // the eye: small, old, gold
  const eye = B(0.228, 0.36);
  L.push(el('circle', { cx: eye[0], cy: eye[1], r: 30, fill: '#ffd070', opacity: 0.35, filter: 'url(#glow8)' }));
  L.push(el('ellipse', { cx: eye[0], cy: eye[1], rx: 15, ry: 11.5, fill: '#030828' }));
  L.push(el('circle', { cx: eye[0], cy: eye[1], r: 8.6, fill: s.rad([[0, '#fff3c0'], [0.5, '#ffc040'], [1, '#a85c10']]) }));
  L.push(el('circle', { cx: eye[0], cy: eye[1], r: 4.2, fill: '#040414' }));
  L.push(el('circle', { cx: eye[0] - 3, cy: eye[1] - 3.4, r: 2.3, fill: '#fff' }));
  L.push(el('path', { d: `M${eye[0] - 19} ${eye[1] - 3}Q${eye[0]} ${eye[1] - 19} ${eye[0] + 19} ${eye[1] - 1}`, fill: 'none', stroke: '#030828', 'stroke-width': 3.4, 'stroke-linecap': 'round', opacity: 0.85 }));
  L.push(el('path', { d: `M${eye[0] - 22} ${eye[1] - 10}Q${eye[0]} ${eye[1] - 27} ${eye[0] + 23} ${eye[1] - 8}`, fill: 'none', stroke: '#7fa8f0', 'stroke-width': 1.4, 'stroke-linecap': 'round', opacity: 0.6 }));
  L.push(el('path', { d: `M${eye[0] - 16} ${eye[1] + 10}Q${eye[0]} ${eye[1] + 19} ${eye[0] + 18} ${eye[1] + 9}`, fill: 'none', stroke: '#030828', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.6 }));
  // near pectoral fin, its own stars on it
  const fclip = s.clip(el('path', { d: W.finNear.d }));
  const fs = sample(W.finNear.pts, 10), fst = [];
  for (let i = 0; i < 26; i++) { const p = r.pick(fs); fst.push(star(p[0] + r.range(-22, 22), p[1] + r.range(-22, 22), r.range(0.6, 2), '#ffe9a8', r() < 0.2)); }
  L.push(el('path', { d: W.finNear.d, fill: '#04092c', opacity: 0.5, filter: 'url(#glow8)', transform: 'translate(6 10)' }));
  L.push(el('path', { d: W.finNear.d, fill: s.lin([[0, '#14307e'], [0.5, '#0c1c58'], [1, '#274c9f']], 0, 0, 1, 1) }));
  L.push(g({ 'clip-path': fclip }, [
    el('path', { d: spline(W.finNear.pts), fill: 'none', stroke: '#86b4f0', 'stroke-width': 16, opacity: 0.35, filter: 'url(#glow8)', transform: 'translate(-14 12)' }),
    g({}, fst),
  ]));
  L.push(el('path', { d: W.finNear.d, fill: 'none', stroke: '#b8dcff', 'stroke-width': 1.6, opacity: 0.6 }));
  s.add(2, g({ transform: ZT }, L));

  // ---- 3: near water — its breath of bubbles, a shoal, the brightest stars adrift, the near rocks
  const fish = [];
  for (let i = 0; i < 26; i++) {
    const x = 90 + r.range(0, 240) + i * 2, y = 700 + r.range(-46, 46) - (x - 90) * 0.16, k = r.range(0.6, 1.2);
    fish.push(el('path', { d: `M0 0Q7 -4.4 15 0Q7 4.4 0 0ZM15 0L21 -4L20 0L21 4Z`, fill: '#061040', transform: `translate(${x} ${y}) scale(${-k} ${k}) rotate(${r.range(-14, 6)})` }));
  }
  s.add(3, g({ opacity: 0.85 }, fish));
  s.bubbles({ n: 22, x0: 40, x1: 280, y0: 40, y1: 340, rmin: 2.4, rmax: 13, color: '#e6f6ff', opacity: 0.6 });
  s.rays({ x: 520, y: -220, angle: 94, spread: 50, n: 6, color: '#dff0ff', opacity: 0.1, width: 70, len: 1100, layer: 3, blur: 18 });
  s.bubbles({ n: 10, x0: 300, x1: 980, y0: 480, y1: 900, rmin: 3, rmax: 16, color: '#e6f6ff', opacity: 0.45 });
  const near = [];
  for (let i = 0; i < 15; i++) {
    const x = r.range(0, 1024), y = r.range(0, 1024), rr = r.range(2, 5.5);
    near.push(el('circle', { cx: x, cy: y, r: rr * 4, fill: '#ffd97a', opacity: 0.16, filter: 'url(#glow8)' }), star(x, y, rr * 0.7, '#ffe9a8', r() < 0.5, 0.9));
  }
  s.add(3, g({}, near));
  s.add(3, glint(...Z(B(0.185, -0.8)), 26, '#fff6d0'), glint(...Z(B(0.40, -0.62)), 22, '#fff6d0'), glint(...Z(B(0.565, -0.86)), 18, '#fff6d0'), glint(840, 560, 16, '#ffe9a8', 0.8), glint(130, 180, 18, '#ffe9a8', 0.8));
  s.ridge({ y: 1010, amp: 60, detail: 1, fill: '#02041a', layer: 3 });
  s.kelp({ x: 40, y: 1050, h: 380, n: 3, color: '#030726', layer: 3, width: 18 });
  s.kelp({ x: 990, y: 1050, h: 330, n: 2, color: '#030726', layer: 3, width: 18, lean: -0.06 });
}
