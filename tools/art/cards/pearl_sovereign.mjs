// MARISOL, PEARL SOVEREIGN (legendary) — the mer-queen on her open-shell throne, haloed, pearls in orbit about her.
import { el, g, spline, sample, poly, ribbon, glint } from '../lib.mjs';

// ------------------------------------------------------------------------------------------------ local helpers

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixc = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
/** Colour along a list of [t, hex] stops. */
function ramp(stops, t) {
  for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) return mixc(stops[i - 1][1], stops[i][1], (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0] || 1));
  return stops[stops.length - 1][1];
}

/** Sampled centreline with unit normals, arc length and t (0..1 by length). */
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

/** Tinted turbulence: fills its source shape with blotches of `color`. */
function mottle(s, color, freq, contrast, seed) {
  const id = s.uid('mt'), off = -(contrast - 1) * 0.6, c = hex(color).map((v) => (v / 255).toFixed(3));
  s.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 ${c[0]}  0 0 0 0 ${c[1]}  0 0 0 0 ${c[2]}  ${contrast} 0 0 0 ${off}"/><feComposite in2="SourceGraphic" operator="in"/></filter>`);
  return `url(#${id})`;
}
function mist(s, { color, opacity = 0.3, freq = 0.006, seed = 1, x = 0, y = 0, w = 1024, h = 1024, contrast = 2.2 }) {
  const m = s.mask(el('rect', { x, y, width: w, height: h, fill: s.rad([[0, '#fff', 1], [0.7, '#fff', 0.7], [1, '#fff', 0]], 0.5, 0.5, 0.6) }));
  return g({ mask: m, opacity }, el('rect', { x, y, width: w, height: h, fill: color, filter: mottle(s, color, freq, contrast, seed) }));
}

/** A scallop fan: ribs radiating from a hinge at (cx, cy) between angles a0..a1 (radians), scalloped rim. */
function shellFan(s, cx, cy, R, a0, a1, n, o) {
  const P = (a, rr) => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  const f = (v) => (Math.round(v * 100) / 100);
  const prof = o.profile || (() => 1);
  let edge = '';
  const ribs = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * (i / n), p = P(a, R * prof(i / n));
    if (i === 0) edge += `M${f(p[0])} ${f(p[1])}`;
    else {
      const am = a0 + (a1 - a0) * ((i - 0.5) / n), c = P(am, R * prof((i - 0.5) / n) * (1 + (o.bump ?? 0.07)));
      edge += `Q${f(c[0])} ${f(c[1])} ${f(p[0])} ${f(p[1])}`;
    }
    ribs.push(p);
  }
  const d = edge + `L${f(cx)} ${f(cy)}Z`;
  const inner = [];
  // flutes: a shadow line on each rib boundary, a soft light down each rib's crown
  for (let i = 0; i <= n; i++) inner.push(el('path', { d: `M${f(cx)} ${f(cy)}L${f(ribs[i][0])} ${f(ribs[i][1])}`, stroke: o.line, 'stroke-width': o.lineW || 3, opacity: o.lineOp ?? 0.5 }));
  const lights = [];
  for (let i = 0; i < n; i++) {
    const am = a0 + (a1 - a0) * ((i + 0.5) / n), p = P(am, R * 1.05), q = P(am, R * 0.12);
    lights.push(el('path', { d: `M${f(q[0])} ${f(q[1])}L${f(p[0])} ${f(p[1])}`, stroke: o.light, 'stroke-width': (o.lightW || R * 0.035), opacity: o.lightOp ?? 0.4, 'stroke-linecap': 'round' }));
  }
  inner.push(g({ filter: s.blur(o.lightBlur || R * 0.012) }, lights));
  // growth rings
  for (const k of (o.rings || [0.42, 0.58, 0.72, 0.84, 0.93])) {
    inner.push(el('path', { d: edge, fill: 'none', stroke: o.ring || o.light, 'stroke-width': 2 / k, opacity: o.ringOp ?? 0.3, transform: `translate(${f(cx)} ${f(cy)}) scale(${k}) translate(${f(-cx)} ${f(-cy)})` }));
  }
  if (o.extra) inner.push(o.extra);
  const out = [];
  if (o.glow) out.push(el('path', { d, fill: o.glow, opacity: o.glowOp ?? 0.35, filter: 'url(#glow32)' }));
  out.push(el('path', { d, fill: o.fill }));
  out.push(g({ 'clip-path': s.clip(el('path', { d })) }, inner));
  out.push(el('path', { d: edge, fill: 'none', stroke: o.rim, 'stroke-width': o.rimW || 4, opacity: o.rimOp ?? 0.9, 'stroke-linejoin': 'round' }));
  return g({}, out);
}

/** Branching coral as a flat silhouette. */
function coral(r, x, y, len, ang, depth, w, out, fill) {
  const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
  const mx = (x + x2) / 2 + r.range(-len, len) * 0.12, my = (y + y2) / 2 + r.range(-len, len) * 0.12;
  out.push(el('path', { d: ribbon([[x, y], [mx, my], [x2, y2]], w, w * 0.62, null, 6), fill }));
  out.push(el('circle', { cx: x2, cy: y2, r: w * 0.36, fill }));
  if (depth <= 0) return;
  const n = r() < 0.35 ? 3 : 2;
  for (let i = 0; i < n; i++) coral(r, x2, y2, len * r.range(0.62, 0.82), ang + (i - (n - 1) / 2) * r.range(0.5, 0.8) + r.range(-0.15, 0.15), depth - 1, w * 0.66, out, fill);
}

// ------------------------------------------------------------------------------------------------ the scene

export function build(s) {
  const r = s.r;
  const HX = 512, HY = 292, HC = 281;   // head centre as drawn, and where it lands once the head is enlarged
  const ZT = 'translate(512 600) scale(1.12) translate(-512 -600)';   // the throne and its queen, brought closer
  const HEADT = `translate(${HX} ${HY + 50}) scale(1.22) translate(${-HX} ${-(HY + 50)})`;

  // one pearl gradient for every pearl in the picture
  const pearlFill = s.rad([[0, '#ffffff'], [0.3, '#fff3f1'], [0.62, '#f3cfdc'], [0.86, '#c9a2cf'], [1, '#8f7bb8']], 0.36, 0.32, 0.72);
  const goldPearl = s.rad([[0, '#fffbe6'], [0.35, '#ffe9a8'], [0.7, '#f2b85a'], [1, '#a8682a']], 0.36, 0.32, 0.72);
  const pearl = (x, y, rr, glow = 0, fill = pearlFill) => {
    const p = [];
    if (glow) p.push(el('circle', { cx: x, cy: y, r: rr * 2.4, fill: '#fff2e0', opacity: glow, filter: rr > 9 ? 'url(#glow16)' : 'url(#glow8)' }));
    p.push(el('circle', { cx: x, cy: y, r: rr, fill }));
    if (rr > 3) p.push(el('ellipse', { cx: x - rr * 0.34, cy: y - rr * 0.4, rx: rr * 0.26, ry: rr * 0.15, fill: '#fff', opacity: 0.95, transform: `rotate(-35 ${x - rr * 0.34} ${y - rr * 0.4})` }));
    if (rr > 7) p.push(el('path', { d: `M${x - rr * 0.7} ${y + rr * 0.35}A${rr * 0.8} ${rr * 0.8} 0 0 0 ${x + rr * 0.35} ${y + rr * 0.72}`, fill: 'none', stroke: '#bff6ff', 'stroke-width': rr * 0.1, opacity: 0.7, 'stroke-linecap': 'round' }));
    return p.join('');
  };
  const gold = s.lin([[0, '#fff6c8'], [0.3, '#ffd873'], [0.65, '#e6a23a'], [1, '#8f5a1e']]);
  const goldH = s.lin([[0, '#9a6220'], [0.25, '#ffd873'], [0.5, '#fff8d0'], [0.75, '#f0b048'], [1, '#8f5a1e']], 0, 0, 1, 0);
  const skin = s.lin([[0, '#fff4ea'], [0.55, '#ffdcd0'], [1, '#f2a9b4']]);

  // ---- 0: the drowned hall
  s.backdrop(s.lin([[0, '#11808a'], [0.28, '#0a5468'], [0.62, '#062e44'], [1, '#03131f']]));
  s.add(0, el('ellipse', { cx: 512, cy: 300, rx: 560, ry: 460, fill: s.rad([[0, '#9ffbe6', 0.6], [0.35, '#38bdb8', 0.3], [1, '#38bdb8', 0]]) }));
  s.add(0, mist(s, { color: '#48d8cc', opacity: 0.32, freq: 0.005, seed: 4 }));
  s.add(0, mist(s, { color: '#5a6ad8', opacity: 0.3, freq: 0.008, seed: 17, y: 420, h: 700 }));
  // far colonnade and arches, lost in the haze
  const hall = [];
  const cols = [[-10, 70, 60], [150, 56, 120], [280, 40, 190], [704, 40, 190], [818, 56, 120], [964, 70, 60]];
  for (const [x, w, top] of cols) {
    hall.push(el('rect', { x, y: top, width: w, height: 1100, fill: '#07384c' }));
    hall.push(el('rect', { x: x - w * 0.22, y: top - 16, width: w * 1.44, height: 22, fill: '#07384c' }));
    for (let k = 1; k < 4; k++) hall.push(el('rect', { x: x + (w * k) / 4 - 1.5, y: top + 12, width: 3, height: 1100, fill: '#0f5a6c', opacity: 0.7 }));
  }
  const arch = (x0, x1, y, rise) => el('path', { d: `M${x0} ${y}Q${x0} ${y - rise} ${(x0 + x1) / 2} ${y - rise * 1.25}Q${x1} ${y - rise} ${x1} ${y}`, fill: 'none', stroke: '#07384c', 'stroke-width': 26 });
  hall.push(arch(40, 178, 80, 90), arch(190, 300, 130, 90), arch(724, 834, 130, 90), arch(846, 984, 80, 90), arch(300, 724, 196, 150));
  s.add(0, g({ opacity: 0.55, filter: s.blur(4) }, hall));
  s.rays({ x: 512, y: -180, angle: 90, spread: 70, n: 11, color: '#d8fff2', opacity: 0.17, width: 80, len: 1150 });
  s.motes({ n: 120, rmin: 0.6, rmax: 2.2, colors: ['#bff9ee', '#ffe9c0', '#ffffff'], opacity: 0.5, glow: false, layer: 0 });
  s.vignette({ strength: 0.75, cy: 0.42 });
  s.grain({ opacity: 0.18 });

  // ---- 1: the throne's great upper valve, the dais, the halo and the far side of the orbits
  const TX = 512, TY = 716, TR = 486;
  const fanFill = s.rad([[0, '#fff0dc'], [0.22, '#ffc4cc'], [0.46, '#d98cc0'], [0.7, '#8a66c0'], [0.9, '#3f5aa8'], [1, '#2a7a9c']], TX, TY, TR * 1.04, true);
  const back = [], dais = [];
  // dais steps under the throne
  for (let i = 0; i < 3; i++) {
    const y = 812 + i * 58, hw = 350 + i * 120;
    dais.push(el('path', { d: `M${512 - hw} ${y}L${512 + hw} ${y}L${512 + hw + 60} ${y + 300}L${512 - hw - 60} ${y + 300}Z`, fill: s.lin([[0, '#2a8088'], [0.1, '#0f4a5c'], [1, '#051b2a']]) }));
    dais.push(el('path', { d: `M${512 - hw} ${y}L${512 + hw} ${y}`, stroke: '#b8fff0', 'stroke-width': 3, opacity: 0.6 }));
    dais.push(el('path', { d: `M${512 - hw - 2} ${y + 9}L${512 + hw + 2} ${y + 9}`, stroke: '#f2c060', 'stroke-width': 2, opacity: 0.5 }));
    for (let k = 0; k < 2 * hw / 44; k++) {
      const x = 512 - hw + 22 + k * 44;
      dais.push(el('path', { d: `M${x - 16} ${y + 48}A16 22 0 0 1 ${x + 16} ${y + 48}`, fill: 'none', stroke: '#48a8a8', 'stroke-width': 2, opacity: 0.3 }));
    }
  }
  dais.push(el('ellipse', { cx: 512, cy: 830, rx: 380, ry: 46, fill: '#d8fff0', opacity: 0.3, filter: 'url(#glow16)' }));
  s.add(1, g({}, dais));
  back.push(shellFan(s, TX, TY, TR, Math.PI * 1.07, Math.PI * 1.93, 17, {
    fill: fanFill, line: '#5a2a78', lineOp: 0.42, lineW: 3.5, light: '#fff4ea', lightOp: 0.34, rim: '#fff0c8', rimW: 5, ring: '#ffffff', ringOp: 0.22,
    glow: '#ffd0e0', glowOp: 0.35, profile: (t) => 0.9 + 0.1 * Math.sin(Math.PI * t), bump: 0.06,
    extra: [
      el('circle', { cx: TX, cy: TY - 40, r: 300, fill: s.rad([[0, '#fff6e0', 0.75], [0.6, '#ffd0c8', 0.25], [1, '#ffd0c8', 0]]) }),
      el('rect', { x: 0, y: 150, width: 1024, height: 620, fill: '#ffffff', opacity: 0.2, filter: mottle(s, '#bffcf0', 0.012, 3, 9) }),
      el('rect', { x: 0, y: 150, width: 1024, height: 620, fill: '#ffffff', opacity: 0.18, filter: mottle(s, '#ffe9a0', 0.016, 3, 31) }),
    ].join(''),
  }));
  s.add(1, g({ transform: ZT }, back));
  // the halo
  const halo = [];
  halo.push(el('circle', { cx: HX, cy: HC, r: 300, fill: s.rad([[0, '#fffdf0', 0.95], [0.3, '#ffeeb8', 0.62], [0.62, '#ffd6a0', 0.22], [1, '#ffd6a0', 0]]) }));
  const rayParts = [];
  for (let i = 0; i < 56; i++) {
    const a = (i / 56) * Math.PI * 2 - Math.PI / 2, r0 = 164, r1 = i % 4 === 0 ? 290 : i % 2 === 0 ? 236 : 200, w = i % 4 === 0 ? 0.02 : 0.011;
    rayParts.push(el('path', { d: poly([[HX + Math.cos(a - w) * r0, HC + Math.sin(a - w) * r0], [HX + Math.cos(a) * r1, HC + Math.sin(a) * r1], [HX + Math.cos(a + w) * r0, HC + Math.sin(a + w) * r0]], true), fill: '#fff6d0', opacity: i % 4 === 0 ? 0.95 : 0.6 }));
  }
  halo.push(g({ filter: 'url(#bloomS)' }, rayParts));
  halo.push(el('circle', { cx: HX, cy: HC, r: 146, fill: 'none', stroke: '#fff3c0', 'stroke-width': 5.5, opacity: 0.95, filter: 'url(#bloomS)' }));
  halo.push(el('circle', { cx: HX, cy: HC, r: 158, fill: 'none', stroke: '#ffd873', 'stroke-width': 2, opacity: 0.9 }));
  halo.push(el('circle', { cx: HX, cy: HC, r: 131, fill: 'none', stroke: '#fff', 'stroke-width': 1.6, opacity: 0.75, 'stroke-dasharray': '2 9' }));
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2 + 0.11;
    halo.push(el('circle', { cx: HX + Math.cos(a) * 304, cy: HC + Math.sin(a) * 304, r: i % 2 ? 2.2 : 3.8, fill: '#fff6d0', opacity: 0.85 }));
  }
  s.add(1, g({ transform: ZT }, halo));
  // orbits: two tilted rings of pearls; the far half sits here, the near half in layer 3
  const orbits = [{ rx: 330, ry: 96, rot: -15, n: 13, ph: 0.3 }, { rx: 300, ry: 116, rot: 17, n: 11, ph: 1.1 }];
  const OC = [HX, HC + 30];
  const orbitPt = (o, a) => {
    const c = Math.cos(o.rot * Math.PI / 180), sn = Math.sin(o.rot * Math.PI / 180), x = Math.cos(a) * o.rx, y = Math.sin(a) * o.ry;
    return [OC[0] + x * c - y * sn, OC[1] + x * sn + y * c];
  };
  const farO = [], nearO = [];
  for (const o of orbits) {
    const arc = (a0, a1) => { const pts = []; for (let i = 0; i <= 40; i++) pts.push(orbitPt(o, a0 + (a1 - a0) * i / 40)); return poly(pts); };
    farO.push(el('path', { d: arc(Math.PI, Math.PI * 2), fill: 'none', stroke: '#fff2c0', 'stroke-width': 1.6, opacity: 0.55 }));
    nearO.push(el('path', { d: arc(0, Math.PI), fill: 'none', stroke: '#fff6d8', 'stroke-width': 2, opacity: 0.75, filter: 'url(#bloomS)' }));
    for (let i = 0; i < o.n; i++) {
      const a = o.ph + (i / o.n) * Math.PI * 2, p = orbitPt(o, a), depth = (Math.sin(a) + 1) / 2;
      const rr = (5 + 11 * depth) * (i % 3 === 0 ? 1.3 : 0.85);
      if (Math.sin(a) < 0) farO.push(pearl(p[0], p[1], rr * 0.9, 0.3));
      else if (Math.abs(p[0] - HX) > 130) nearO.push(pearl(p[0], p[1], rr, 0.45, i % 4 === 1 ? goldPearl : pearlFill));
    }
  }
  s.add(1, g({ transform: ZT }, farO));
  // sea-fans rising at the sides of the dais
  const fans = [];
  coral(r, 60, 930, 110, -1.5, 4, 18, fans, '#0e4a5e'); coral(r, 968, 930, 115, -1.65, 4, 18, fans, '#0e4a5e');
  s.add(1, g({ opacity: 0.8, filter: s.blur(1.2) }, fans));

  // ---- 2: the queen
  const Q = [];
  // hair behind her: long locks drifting out on the water
  const hairStops = [[0, '#fffaf0'], [0.3, '#ffeccc'], [0.58, '#ffd0b0'], [0.82, '#f49ab4'], [1, '#c078d0']];
  const lock = (pts, w0, w1, op = 1) => {
    const f = frame(pts, 10), out = [];
    const W = (t) => (w1 + (w0 - w1) * Math.pow(1 - t, 0.9)) * (0.55 + 0.75 * Math.sin(Math.PI * Math.min(1, t * 1.4 + 0.12)));
    for (let i = 0; i < f.length - 1; i++) {
      const a = f[i], b = f[i + 1], wa = W(a.t) / 2, wb = W(b.t) / 2, c = ramp(hairStops, (a.t + b.t) / 2);
      out.push(el('path', { d: poly([[a.x - a.nx * wa, a.y - a.ny * wa], [a.x + a.nx * wa, a.y + a.ny * wa], [b.x + b.nx * wb, b.y + b.ny * wb], [b.x - b.nx * wb, b.y - b.ny * wb]], true), fill: c, stroke: c, 'stroke-width': 0.8 }));
    }
    // strands
    for (const k of [-0.3, 0.05, 0.32]) out.push(el('path', { d: poly(f.map((p) => [p.x + p.nx * W(p.t) * k, p.y + p.ny * W(p.t) * k])), fill: 'none', stroke: k > 0 ? '#ffffff' : '#d08a70', 'stroke-width': k > 0 ? 1.6 : 1.3, opacity: k > 0 ? 0.7 : 0.4 }));
    return g({ opacity: op }, out);
  };
  const hairBack = [];
  hairBack.push(el('path', { d: spline([[HX, HC - 40], [HX + 96, HC + 40], [HX + 112, HC + 200], [HX + 84, HC + 300], [HX - 84, HC + 300], [HX - 112, HC + 200], [HX - 96, HC + 40]], true), fill: s.lin([[0, '#fff6e6'], [0.6, '#ffd8b8'], [1, '#f4a8b8']]) }));
  for (const side of [-1, 1]) {
    for (let i = 5; i >= 0; i--) {
      const j = r.range(-10, 10);
      hairBack.push(lock([
        [HX + side * (6 + i * 5), HC - 52],
        [HX + side * (64 + i * 12), HC - 30 + i * 8],
        [HX + side * (98 + i * 20 + j), HC + 60 + i * 14],
        [HX + side * (84 + i * 30), HC + 150 + i * 18],
        [HX + side * (122 + i * 34 + j), HC + 228 + i * 14],
        [HX + side * (112 + i * 42), HC + 296 + i * 4],
        [HX + side * (150 + i * 44), HC + 326 - i * 10],
        [HX + side * (176 + i * 44), HC + 300 - i * 14],
      ], 62 - i * 3, 3, 0.97));
    }
    // stray strands strung with seed pearls
    for (let i = 0; i < 4; i++) {
      const pts = [[HX + side * (40 + i * 8), HC - 30], [HX + side * (120 + i * 30), HC + 30 + i * 30], [HX + side * (170 + i * 44), HC + 150 + i * 24], [HX + side * (236 + i * 40), HC + 190 + i * 30]];
      hairBack.push(el('path', { d: spline(pts), fill: 'none', stroke: '#fff3d8', 'stroke-width': 1.6, opacity: 0.8 }));
      sample(pts, 5).forEach((p, k) => { if (k % 3 === 2) hairBack.push(pearl(p[0], p[1], 3)); });
    }
  }
  Q.push(g({ filter: 'url(#shadow)' }, hairBack));

  // the lower valve: her seat
  const seat = [];
  const seatD = 'M236 612C250 760 410 806 512 806C614 806 774 760 788 612C700 640 324 640 236 612Z';
  seat.push(el('path', { d: seatD, fill: s.lin([[0, '#ffe6ea'], [0.3, '#f0a8c6'], [0.65, '#8f62b8'], [1, '#33336e']]) }));
  const seatIn = [];
  for (let i = 0; i <= 18; i++) {
    const t = i / 18, x = 236 + 552 * t;
    seatIn.push(el('path', { d: `M512 900Q${(512 + x) / 2 + (x - 512) * 0.22} 760 ${x} 600`, fill: 'none', stroke: '#4a2a78', 'stroke-width': 3, opacity: 0.4 }));
    seatIn.push(el('path', { d: `M512 900Q${(512 + x) / 2 + (x - 512) * 0.22 + 14} 760 ${x + 15} 600`, fill: 'none', stroke: '#fff', 'stroke-width': 7, opacity: 0.2 }));
  }
  seatIn.push(el('ellipse', { cx: 512, cy: 820, rx: 330, ry: 70, fill: '#141a4a', opacity: 0.7, filter: 'url(#glow32)' }));
  seat.push(g({ 'clip-path': s.clip(el('path', { d: seatD })) }, seatIn));
  // the inside of the bowl, glowing, and the scalloped lip
  seat.push(el('ellipse', { cx: 512, cy: 613, rx: 276, ry: 34, fill: s.rad([[0, '#fffdf2'], [0.6, '#ffe2c8'], [1, '#f0a0b8']]) }));
  let lip = 'M236 612';
  for (let i = 0; i < 18; i++) {
    const t0 = i / 18, t1 = (i + 1) / 18, xa = 236 + 552 * t0, xb = 236 + 552 * t1, yb = 612 + 30 * Math.sin(Math.PI * t1), ym = 612 + 30 * Math.sin(Math.PI * (t0 + t1) / 2);
    lip += `Q${(xa + xb) / 2} ${ym + 13} ${xb} ${yb}`;
  }
  seat.push(el('path', { d: lip, fill: 'none', stroke: '#fff6e0', 'stroke-width': 5, opacity: 0.95, 'stroke-linecap': 'round', filter: 'url(#bloomS)' }));
  Q.push(g({}, seat));
  // pearls heaped in the bowl beside her
  const heap = [];
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1, x = HX + side * r.range(118, 250), y = 612 + r.range(-16, 12) - Math.abs(x - HX) * 0.02;
    heap.push(pearl(x, y, r.range(7, 17), 0.25, r() < 0.2 ? goldPearl : pearlFill));
  }
  Q.push(g({}, heap));

  // sceptre: a long gold staff, a crescent at its head cradling a great pearl
  const SB = [352, 800], ST = [384, 168];
  const stf = [];
  stf.push(el('path', { d: `M${SB[0]} ${SB[1]}L${ST[0]} ${ST[1]}`, stroke: '#7a4a18', 'stroke-width': 11, 'stroke-linecap': 'round' }));
  stf.push(el('path', { d: `M${SB[0]} ${SB[1]}L${ST[0]} ${ST[1]}`, stroke: '#f2b84a', 'stroke-width': 7, 'stroke-linecap': 'round' }));
  stf.push(el('path', { d: `M${SB[0] - 1.5} ${SB[1]}L${ST[0] - 1.5} ${ST[1]}`, stroke: '#fff6c8', 'stroke-width': 2.2, 'stroke-linecap': 'round', opacity: 0.9 }));
  for (const t of [0.12, 0.3, 0.74, 0.9]) {
    const x = SB[0] + (ST[0] - SB[0]) * t, y = SB[1] + (ST[1] - SB[1]) * t;
    stf.push(el('ellipse', { cx: x, cy: y, rx: 10, ry: 5, fill: gold, stroke: '#7a4a18', 'stroke-width': 1, transform: `rotate(-3 ${x} ${y})` }));
  }
  const SC = [388, 124];
  stf.push(el('path', { d: `M${SC[0] - 44} ${SC[1] - 34}C${SC[0] - 50} ${SC[1] + 40} ${SC[0] + 50} ${SC[1] + 40} ${SC[0] + 44} ${SC[1] - 34}C${SC[0] + 34} ${SC[1] + 16} ${SC[0] - 34} ${SC[1] + 16} ${SC[0] - 44} ${SC[1] - 34}Z`, fill: goldH, stroke: '#7a4a18', 'stroke-width': 1.2 }));
  stf.push(el('path', { d: `M${SC[0] - 14} ${SC[1] + 26}L${SC[0]} ${SC[1] + 52}L${SC[0] + 14} ${SC[1] + 26}Z`, fill: gold }));
  stf.push(el('circle', { cx: SC[0], cy: SC[1] - 8, r: 60, fill: '#fff3d0', opacity: 0.5, filter: 'url(#glow16)' }));
  stf.push(pearl(SC[0], SC[1] - 8, 25, 0.5));
  stf.push(pearl(SC[0] - 44, SC[1] - 38, 6), pearl(SC[0] + 44, SC[1] - 38, 6));
  Q.push(g({}, stf));

  // fin-veils trailing from her elbows
  const veil = (pts, w, seed) => g({ opacity: 0.8 }, [
    el('path', { d: ribbon(pts, w * 0.4, 2, (t) => 0.5 + 2.2 * Math.sin(Math.PI * Math.min(1, t * 1.25)) + 0.3 * Math.sin(t * 20), 12), fill: s.lin([[0, '#fff0e0', 0.9], [0.5, '#ffb0c4', 0.6], [1, '#c890ff', 0.1]]), filter: s.rough(8, 0.03, seed) }),
    el('path', { d: spline(pts), fill: 'none', stroke: '#fff', 'stroke-width': 1.4, opacity: 0.6 }),
  ]);
  Q.push(veil([[396, 470], [356, 540], [322, 620], [286, 690], [300, 750]], 70, 3));
  Q.push(veil([[634, 470], [680, 540], [708, 610], [742, 660], [730, 720]], 70, 8));

  // the tail: over the lip of the shell, sweeping round to a broad fluke
  const tailPts = [[HX, 536], [HX - 4, 600], [HX - 46, 672], [HX - 34, 748], [HX + 60, 790], [HX + 170, 776], [HX + 250, 716], [HX + 276, 650]];
  const tf = frame(tailPts, 14);
  const TW = (t) => 26 + 136 * Math.pow(1 - t, 1.15) * (0.82 + 0.18 * Math.cos(t * 3));
  const tailStops = [[0, '#fffaf2'], [0.2, '#ffe6e0'], [0.45, '#ffb0c8'], [0.7, '#e07ac0'], [0.9, '#9a68d8'], [1, '#6a8ae8']];
  const toff = (p, k) => [p.x + p.nx * TW(p.t) * k, p.y + p.ny * TW(p.t) * k];
  const tA = tf.map((p) => toff(p, 0.5)), tB = tf.map((p) => toff(p, -0.5));
  const tailD = poly(tA.concat(tB.slice().reverse()), true);
  const tail = [];
  // fluke first (it sits behind the tail's end)
  const end = tf[tf.length - 1], ea = Math.atan2(end.ty, end.tx);
  const lobe = (side, len, spread) => {
    const P = (d, a) => [end.x + Math.cos(ea + a) * d, end.y + Math.sin(ea + a) * d];
    const pts = [P(-10, 0), P(len * 0.3, side * 0.5), P(len * 0.7, side * (spread + 0.16)), P(len, side * spread), P(len * 0.78, side * (spread - 0.26)), P(len * 0.5, side * 0.1), P(len * 0.2, -side * 0.1)];
    const d = spline(pts, true);
    const veins = [];
    for (let i = 0; i < 9; i++) {
      const a = side * (0.06 + (spread + 0.1) * (i / 8)), q = P(len * (0.62 + 0.36 * Math.sin(Math.PI * i / 8 * 0.9 + 0.3)), a), m = P(len * 0.4, a * 0.7);
      veins.push(el('path', { d: `M${end.x} ${end.y}Q${m[0]} ${m[1]} ${q[0]} ${q[1]}`, fill: 'none', stroke: '#fff', 'stroke-width': 1.5, opacity: 0.5 }));
    }
    return g({}, [
      el('path', { d, fill: '#ffb8d8', opacity: 0.35, filter: 'url(#glow16)' }),
      el('path', { d, fill: s.rad([[0, '#8a68d8', 0.95], [0.35, '#e486c8', 0.85], [0.7, '#ffc9a8', 0.75], [1, '#fff3c8', 0.65]], end.x, end.y, len, true) }),
      g({ 'clip-path': s.clip(el('path', { d })) }, veins),
      el('path', { d, fill: 'none', stroke: '#fff6dc', 'stroke-width': 2.2, opacity: 0.85 }),
    ]);
  };
  tail.push(lobe(-1, 190, 0.78), lobe(1, 170, 0.86));
  // body of the tail, coloured along its length
  tail.push(el('path', { d: tailD, fill: '#ff9fbf', opacity: 0.35, filter: 'url(#glow16)' }));
  const segs = [];
  for (let i = 0; i < tf.length - 1; i++) {
    const c = ramp(tailStops, (tf[i].t + tf[i + 1].t) / 2);
    segs.push(el('path', { d: poly([tA[i], tA[i + 1], tB[i + 1], tB[i]], true), fill: c, stroke: c, 'stroke-width': 1 }));
  }
  tail.push(g({}, segs));
  const tin = [];
  // scales
  const sc = [];
  let row = 0, nextLen = 6;
  for (const p of tf) {
    if (p.len < nextLen) continue;
    const w = TW(p.t), size = Math.max(7, w * 0.12);
    nextLen = p.len + size * 0.9; row++;
    const n = Math.max(2, Math.round(w / (size * 1.5)));
    const ang = Math.atan2(p.ty, p.tx) * 180 / Math.PI + 90;
    for (let k = 0; k <= n; k++) {
      const u = (k + (row % 2 ? 0.5 : 0)) / n - 0.5;
      if (Math.abs(u) > 0.56) continue;
      const c = toff(p, u), tint = (row * 7 + k * 3) % 9;
      sc.push(el('path', { d: `M${-size * 0.75} 0A${size * 0.75} ${size * 0.95} 0 0 0 ${size * 0.75} 0`, transform: `translate(${c[0].toFixed(1)} ${c[1].toFixed(1)}) rotate(${ang.toFixed(1)})`, fill: tint === 0 ? '#ffe9a0' : tint === 4 ? '#b8fff0' : '#ffffff', 'fill-opacity': tint === 0 || tint === 4 ? 0.3 : 0.1, stroke: '#fff', 'stroke-width': 1.1, 'stroke-opacity': 0.55 }));
    }
  }
  tin.push(g({}, sc));
  // volume: shadow down one edge, a pearly light down the other
  tin.push(el('path', { d: poly(tA), fill: 'none', stroke: '#5a2a88', 'stroke-width': 54, opacity: 0.55, filter: 'url(#glow16)' }));
  tin.push(el('path', { d: poly(tf.map((p) => toff(p, -0.2))), fill: 'none', stroke: '#ffffff', 'stroke-width': 20, opacity: 0.55, filter: 'url(#glow8)', 'stroke-linecap': 'round' }));
  tail.push(g({ 'clip-path': s.clip(el('path', { d: tailD })) }, tin));
  tail.push(el('path', { d: poly(tB), fill: 'none', stroke: '#fff', 'stroke-width': 2.4, opacity: 0.85 }));
  tail.push(el('path', { d: poly(tA), fill: 'none', stroke: '#7a3a98', 'stroke-width': 1.6, opacity: 0.5 }));
  // hip fins
  Q.push(veil([[HX - 64, 560], [HX - 110, 610], [HX - 150, 668], [HX - 196, 700]], 54, 11));
  Q.push(veil([[HX + 64, 560], [HX + 112, 604], [HX + 160, 640], [HX + 214, 650]], 54, 14));
  Q.push(g({}, tail));

  // torso: a bodice of pearl scale
  const torso = `M${HX - 74} 384C${HX - 70} 430 ${HX - 44} 462 ${HX - 42} 492C${HX - 44} 520 ${HX - 72} 540 ${HX - 80} 566L${HX + 80} 566C${HX + 72} 540 ${HX + 44} 520 ${HX + 42} 492C${HX + 44} 462 ${HX + 70} 430 ${HX + 74} 384Z`;
  const body = [];
  body.push(el('path', { d: torso, fill: s.lin([[0, '#fffdf8'], [0.5, '#fff0ea'], [1, '#ffc8d4']]) }));
  const bin = [];
  for (let ry = 0; ry < 13; ry++) for (let k = -6; k <= 6; k++) {
    const x = HX + (k + (ry % 2 ? 0.5 : 0)) * 15, y = 400 + ry * 13;
    bin.push(el('path', { d: `M${x - 7.5} ${y}A7.5 9 0 0 0 ${x + 7.5} ${y}`, fill: (ry + k) % 5 === 0 ? '#ffe9a0' : '#fff', 'fill-opacity': (ry + k) % 5 === 0 ? 0.5 : 0.12, stroke: '#e0a890', 'stroke-width': 1, 'stroke-opacity': 0.75 }));
  }
  bin.push(el('path', { d: `M${HX - 90} 380L${HX - 90} 580`, stroke: '#c0709f', 'stroke-width': 50, opacity: 0.4, filter: 'url(#glow8)' }));
  bin.push(el('path', { d: `M${HX + 90} 380L${HX + 90} 580`, stroke: '#c0709f', 'stroke-width': 50, opacity: 0.4, filter: 'url(#glow8)' }));
  bin.push(el('ellipse', { cx: HX, cy: 450, rx: 16, ry: 70, fill: '#fff', opacity: 0.55, filter: 'url(#glow8)' }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: torso })) }, bin));
  body.push(el('path', { d: `M${HX} 430L${HX} 548`, stroke: goldH, 'stroke-width': 4 }));
  // belt with a great pearl, strands swagged from it
  body.push(el('path', { d: `M${HX - 84} 552Q${HX} 578 ${HX + 84} 552L${HX + 86} 570Q${HX} 598 ${HX - 86} 570Z`, fill: goldH, stroke: '#7a4a18', 'stroke-width': 1 }));
  for (const side of [-1, 1]) for (let i = 0; i < 9; i++) {
    const t = (i + 0.5) / 9, x = HX + side * (14 + 62 * t), y = 584 + 30 * Math.sin(Math.PI * t) - 6 * t;
    body.push(pearl(x, y, 3.6));
  }
  body.push(pearl(HX, 574, 15, 0.4));

  // arms
  const arm = (pts, w0, w1) => el('path', { d: ribbon(pts, w0, w1, null, 10), fill: skin, stroke: '#d98aa0', 'stroke-width': 1, 'stroke-opacity': 0.6 });
  const band = (x, y, w, rot) => el('ellipse', { cx: x, cy: y, rx: w, ry: 5, fill: goldH, stroke: '#7a4a18', 'stroke-width': 0.8, transform: `rotate(${rot} ${x} ${y})` });
  const arms = [];
  // her right arm (our left) holds the sceptre
  arms.push(arm([[HX - 86, 398], [HX - 106, 440], [HX - 118, 482]], 31, 25));
  arms.push(arm([[HX - 118, 482], [HX - 134, 458], [HX - 146, 430]], 25, 16));
  arms.push(el('circle', { cx: HX - 118, cy: 482, r: 12.5, fill: '#fbd0c8' }));
  arms.push(band(HX - 100, 428, 16, 22), band(HX - 141, 441, 10, -62));
  arms.push(el('ellipse', { cx: 366, cy: 424, rx: 13, ry: 11, fill: skin, stroke: '#d98aa0', 'stroke-width': 1, 'stroke-opacity': 0.7 }));
  for (let i = 0; i < 3; i++) arms.push(el('path', { d: `M${357} ${419 + i * 5.5}q9 -2.5 18 0`, fill: 'none', stroke: '#d98aa0', 'stroke-width': 1.1, opacity: 0.8 }));
  // her left arm (our right) is raised, a pearl floating above the open palm
  arms.push(arm([[HX + 86, 398], [HX + 108, 440], [HX + 122, 480]], 31, 25));
  arms.push(arm([[HX + 122, 480], [HX + 144, 446], [HX + 158, 408]], 25, 15));
  arms.push(el('circle', { cx: HX + 122, cy: 480, r: 12.5, fill: '#fbd0c8' }));
  arms.push(band(HX + 102, 428, 16, -22), band(HX + 153, 420, 9.5, 20));
  const HXR = HX + 162, HYR = 398;
  arms.push(el('path', { d: `M${HXR - 12} ${HYR + 6}C${HXR - 16} ${HYR - 10} ${HXR + 10} ${HYR - 12} ${HXR + 22} ${HYR - 8}L${HXR + 36} ${HYR - 14}L${HXR + 34} ${HYR - 8}L${HXR + 20} ${HYR + 4}Q${HXR + 4} ${HYR + 12} ${HXR - 12} ${HYR + 6}Z`, fill: skin, stroke: '#d98aa0', 'stroke-width': 1, 'stroke-opacity': 0.7 }));
  arms.push(el('path', { d: `M${HXR - 8} ${HYR - 6}Q${HXR - 14} ${HYR - 18} ${HXR - 6} ${HYR - 22}`, fill: 'none', stroke: '#ffdcd0', 'stroke-width': 5, 'stroke-linecap': 'round' }));
  arms.push(el('circle', { cx: HXR + 12, cy: HYR - 52, r: 60, fill: '#fff3d0', opacity: 0.55, filter: 'url(#glow16)' }));
  arms.push(pearl(HXR + 12, HYR - 52, 21, 0.6));

  Q.push(g({}, body), g({}, arms));

  // shoulders: scallop pauldrons, and a broad gold collar hung with pearls
  const pauld = (x, side) => shellFan(s, x, 408, 44, Math.PI * (side < 0 ? 1.0 : 1.22), Math.PI * (side < 0 ? 1.78 : 2.0), 6, {
    fill: s.lin([[0, '#fff6d0'], [0.5, '#ffd070'], [1, '#c8823a']]), line: '#8a5220', lineOp: 0.6, lineW: 1.6, light: '#fff', lightOp: 0.5, lightW: 3, lightBlur: 1, rim: '#fff8dc', rimW: 2, rings: [0.6, 0.82], ringOp: 0.35, bump: 0.1,
  });
  // neck
  Q.push(el('path', { d: `M${HX - 16} ${HY + 38}L${HX - 20} ${HY + 96}L${HX + 20} ${HY + 96}L${HX + 16} ${HY + 38}Z`, fill: s.lin([[0, '#e8a0ac'], [0.5, '#ffdcd0'], [1, '#fff0e6']]) }));
  // bare shoulders and breast above a sweetheart neckline, trimmed in gold
  const chest = `M${HX - 74} 392Q${HX} 372 ${HX + 74} 392L${HX + 66} 430Q${HX + 34} 414 ${HX} 446Q${HX - 34} 414 ${HX - 66} 430Z`;
  Q.push(el('path', { d: chest, fill: s.lin([[0, '#f6bfc0'], [0.3, '#ffe9de'], [1, '#ffd6cc']]) }));
  Q.push(el('path', { d: `M${HX - 66} 430Q${HX - 34} 414 ${HX} 446Q${HX + 34} 414 ${HX + 66} 430`, fill: 'none', stroke: '#7a4a18', 'stroke-width': 6, 'stroke-linecap': 'round' }));
  Q.push(el('path', { d: `M${HX - 66} 430Q${HX - 34} 414 ${HX} 446Q${HX + 34} 414 ${HX + 66} 430`, fill: 'none', stroke: '#ffd873', 'stroke-width': 3.6, 'stroke-linecap': 'round' }));
  // necklaces: a gold torc, two swags of pearls and a pendant
  Q.push(el('path', { d: `M${HX - 26} 384Q${HX} 398 ${HX + 26} 384`, fill: 'none', stroke: '#7a4a18', 'stroke-width': 7, 'stroke-linecap': 'round' }));
  Q.push(el('path', { d: `M${HX - 26} 384Q${HX} 398 ${HX + 26} 384`, fill: 'none', stroke: '#ffd873', 'stroke-width': 4.6, 'stroke-linecap': 'round' }));
  for (let i = 0; i < 11; i++) { const t = i / 10, x = HX - 44 + 88 * t; Q.push(pearl(x, 388 + 22 * Math.sin(Math.PI * t), 3.6)); }
  for (let i = 0; i < 15; i++) { const t = i / 14, x = HX - 60 + 120 * t; Q.push(pearl(x, 392 + 34 * Math.sin(Math.PI * t), i === 7 ? 0 : 3)); }
  Q.push(pearl(HX, 430, 8.5, 0.4));

  // head
  const face = `M${HX - 41} ${HY - 8}C${HX - 41} ${HY - 62} ${HX + 41} ${HY - 62} ${HX + 41} ${HY - 8}C${HX + 41} ${HY + 26} ${HX + 18} ${HY + 54} ${HX} ${HY + 57}C${HX - 18} ${HY + 54} ${HX - 41} ${HY + 26} ${HX - 41} ${HY - 8}Z`;
  const head = [];
  head.push(el('path', { d: face, fill: s.rad([[0, '#fffaf4'], [0.55, '#ffe6da'], [0.85, '#f9c2c0'], [1, '#e89ab0']], 0.5, 0.42, 0.62) }));
  head.push(el('circle', { cx: HX - 23, cy: HY + 17, r: 11, fill: '#ff86a6', opacity: 0.32, filter: 'url(#glow4)' }), el('circle', { cx: HX + 23, cy: HY + 17, r: 11, fill: '#ff86a6', opacity: 0.32, filter: 'url(#glow4)' }));
  for (const side of [-1, 1]) {
    const x = HX + side * 18, y = HY + 2;
    // gilded lid, closed eye, lashes, brow
    head.push(el('path', { d: `M${x - 12} ${y}Q${x} ${y - 11} ${x + 12} ${y}Q${x} ${y + 7} ${x - 12} ${y}Z`, fill: '#ffd070', opacity: 0.55 }));
    head.push(el('path', { d: `M${x - 12} ${y}Q${x} ${y + 8} ${x + 12} ${y}`, fill: 'none', stroke: '#6a2c50', 'stroke-width': 2.8, 'stroke-linecap': 'round' }));
    for (let i = 0; i < 3; i++) head.push(el('path', { d: `M${x + side * (5 + i * 3.4)} ${y + 4.6 - i * 1.6}l${side * 4.5} ${3.5 - i * 0.8}`, stroke: '#6a2c50', 'stroke-width': 1.4, 'stroke-linecap': 'round' }));
    head.push(el('path', { d: `M${x - side * 13} ${y - 14}Q${x} ${y - 23} ${x + side * 15} ${y - 15}`, fill: 'none', stroke: '#b8648a', 'stroke-width': 2.2, 'stroke-linecap': 'round' }));
  }
  head.push(el('path', { d: `M${HX + 1} ${HY + 6}q-5 10 1 13`, fill: 'none', stroke: '#e090a0', 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  head.push(el('path', { d: `M${HX - 10} ${HY + 31}Q${HX - 4} ${HY + 27} ${HX} ${HY + 29.5}Q${HX + 4} ${HY + 27} ${HX + 10} ${HY + 31}Q${HX} ${HY + 34} ${HX - 10} ${HY + 31}Z`, fill: '#cf4f7c' }));
  head.push(el('path', { d: `M${HX - 9} ${HY + 32}Q${HX} ${HY + 41} ${HX + 9} ${HY + 32}Q${HX} ${HY + 34.5} ${HX - 9} ${HY + 32}Z`, fill: '#ec7c9c' }));
  head.push(el('ellipse', { cx: HX, cy: HY + 36, rx: 3, ry: 1.2, fill: '#fff', opacity: 0.6 }));
  // hair over the brow: a centre parting sweeping to both sides
  for (const side of [-1, 1]) {
    const d = `M${HX} ${HY - 60}C${HX + side * 30} ${HY - 66} ${HX + side * 52} ${HY - 40} ${HX + side * 50} ${HY + 4}C${HX + side * 50} ${HY + 30} ${HX + side * 44} ${HY + 44} ${HX + side * 40} ${HY + 56}C${HX + side * 34} ${HY + 20} ${HX + side * 36} ${HY - 22} ${HX} ${HY - 36}Z`;
    head.push(el('path', { d, fill: s.lin([[0, '#fffbf2'], [0.55, '#ffedc8'], [1, '#ffcfae']]) }));
    head.push(el('path', { d: `M${HX + side * 4} ${HY - 54}C${HX + side * 30} ${HY - 52} ${HX + side * 44} ${HY - 28} ${HX + side * 44} ${HY + 10}`, fill: 'none', stroke: '#fff', 'stroke-width': 1.6, opacity: 0.8 }));
    head.push(el('path', { d: `M${HX + side * 2} ${HY - 44}C${HX + side * 26} ${HY - 40} ${HX + side * 39} ${HY - 18} ${HX + side * 40} ${HY + 30}`, fill: 'none', stroke: '#d89a70', 'stroke-width': 1.2, opacity: 0.6 }));
  }
  // crown: a gold band, five spires, a pearl on every point
  const crown = [];
  const spires = [[-1, 40], [-0.5, 60], [0, 92], [0.5, 60], [1, 40]];
  for (const [t, h] of spires) {
    const bx = HX + t * 38, by = HY - 40 + Math.abs(t) * 10, a = t * 0.42, tx = bx + Math.sin(a) * h, ty = by - Math.cos(a) * h;
    crown.push(el('path', { d: `M${bx - 8} ${by}Q${(bx + tx) / 2 - 2} ${(by + ty) / 2} ${tx} ${ty}Q${(bx + tx) / 2 + 2} ${(by + ty) / 2} ${bx + 8} ${by}Z`, fill: goldH, stroke: '#7a4a18', 'stroke-width': 0.9 }));
    crown.push(pearl(tx, ty - 3, t === 0 ? 11 : Math.abs(t) < 0.6 ? 8 : 6.5, 0.45));
  }
  for (const t of [-0.75, -0.25, 0.25, 0.75]) crown.push(pearl(HX + t * 38, HY - 50 + Math.abs(t) * 10, 4.2));
  crown.push(el('path', { d: `M${HX - 46} ${HY - 28}Q${HX} ${HY - 52} ${HX + 46} ${HY - 28}L${HX + 45} ${HY - 17}Q${HX} ${HY - 40} ${HX - 45} ${HY - 17}Z`, fill: goldH, stroke: '#7a4a18', 'stroke-width': 1 }));
  crown.push(el('path', { d: `M${HX - 42} ${HY - 27}Q${HX} ${HY - 49} ${HX + 42} ${HY - 27}`, fill: 'none', stroke: '#fffbe0', 'stroke-width': 1.6, opacity: 0.9 }));
  crown.push(pearl(HX, HY - 20, 5.5, 0.4));
  crown.push(el('path', { d: `M${HX} ${HY - 40}l5 7l-5 7l-5 -7Z`, fill: '#ff7aa8', stroke: '#fff', 'stroke-width': 0.8 }));
  head.push(g({}, crown));
  Q.push(pauld(HX - 76, -1), pauld(HX + 76, 1));
  Q.push(g({ transform: HEADT }, head));
  s.add(2, g({ transform: ZT }, Q));

  // ---- 3: the near side of the orbits, drifting light, the garden at the foot of the dais
  s.add(3, g({ transform: ZT }, nearO));
  s.rays({ x: 512, y: -220, angle: 90, spread: 44, n: 6, color: '#fff6dc', opacity: 0.08, width: 60, len: 1000, layer: 3, blur: 18 });
  const garden = [];
  coral(r, -20, 1050, 120, -1.2, 3, 30, garden, '#062a3a'); coral(r, 1044, 1050, 120, -1.95, 3, 30, garden, '#062a3a');
  coral(r, 130, 1070, 80, -1.45, 3, 20, garden, '#062a3a'); coral(r, 900, 1070, 80, -1.7, 3, 20, garden, '#062a3a');
  s.add(3, g({ filter: s.blur(1.6), opacity: 0.95 }, garden));
  s.kelp({ x: 24, y: 1060, h: 520, n: 2, color: '#073044', layer: 3, width: 20, lean: 0.04 });
  s.kelp({ x: 1000, y: 1060, h: 560, n: 2, color: '#073044', layer: 3, width: 20, lean: -0.05 });
  s.motes({ n: 60, rmin: 1.2, rmax: 4.6, colors: ['#fff6d8', '#ffd9e6', '#c8fff2', '#ffffff'], opacity: 0.85 });
  s.bubbles({ n: 16, x0: 40, x1: 980, y0: 120, y1: 900, rmin: 3, rmax: 15, color: '#e6fffa', opacity: 0.55 });
  s.add(3, g({ transform: ZT }, [glint(SC[0] - 10, SC[1] - 18, 28, '#fff'), glint(HXR + 4, HYR - 60, 22, '#fff')]), glint(214, 262, 14, '#fff6d8', 0.8), glint(826, 214, 16, '#fff6d8', 0.8), glint(716, 650, 12, '#ffe6f0', 0.8));
}
