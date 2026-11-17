// KELP STALKER (common, Swift) — a long lean hunter going through the kelp forest like a thrown knife.
import { el, g, spline, ribbon, sample, poly, glint } from '../lib.mjs';

// the head is drawn pointing along -x in its own frame and set on the end of the spine
const HO = [404, 492], HK = 1.2, HA = -18 * Math.PI / 180, HC = Math.cos(HA), HS = Math.sin(HA);
const HTF = `translate(${HO[0]} ${HO[1]}) rotate(-18) scale(${HK})`;

export function build(s) {
  const r = s.r;
  const blurH = (sx, sy) => { const id = s.uid('mb'); s.def(`<filter id="${id}" x="-20%" y="-10%" width="140%" height="120%"><feGaussianBlur stdDeviation="${sx} ${sy}"/></filter>`); return `url(#${id})`; };

  // ---- 0: green gloom under the canopy
  s.backdrop(s.lin([[0, '#3f9a5c'], [0.2, '#1d6a48'], [0.5, '#0c4034'], [0.8, '#052422'], [1, '#021212']]));
  s.add(0, el('ellipse', { cx: 700, cy: 60, rx: 620, ry: 420, fill: s.rad([[0, '#d9f7a0', 0.7], [0.4, '#6fc878', 0.3], [1, '#6fc878', 0]]) }));
  tfog(s, { color: '#49b070', opacity: 0.4, freq: 0.005, seed: 3 });
  tfog(s, { color: '#021a18', opacity: 0.55, freq: 0.007, seed: 17 });
  s.rays({ x: 760, y: -200, angle: 106, spread: 50, n: 9, color: '#e9ffb8', opacity: 0.22, width: 80, len: 1400 });
  s.motes({ n: 80, rmin: 0.6, rmax: 2, color: '#c8f7a8', opacity: 0.4, glow: false, layer: 0 });
  s.vignette({ strength: 0.78, color: '#010a0a' });
  s.grain({ opacity: 0.2 });

  // ---- 1: the forest, smeared sideways by speed
  const farFill = s.lin([[0, '#2a7a52'], [1, '#0a3a30']]);
  const far = [];
  for (let i = 0; i < 9; i++) far.push(...kelp(r, { x: 30 + i * 122 + r.range(-30, 30), h: r.range(900, 1150), sway: 26, w: 10, fill: farFill, bladeLen: 120, bw: 20, every: 4 }));
  s.add(1, g({ opacity: 0.55, filter: blurH(14, 2) }, far));
  const midFill = s.lin([[0, '#1c5c40'], [0.6, '#0a3028'], [1, '#041a18']]);
  const mid = [];
  for (const x of [110, 300, 470, 690, 900]) mid.push(...kelp(r, { x: x + r.range(-20, 20), h: r.range(1000, 1200), sway: 34, w: 17, fill: midFill, bladeLen: 190, bw: 32, every: 4 }));
  s.add(1, g({ opacity: 0.9, filter: blurH(6, 1) }, mid));
  // long streaks of disturbed water behind the hunter
  const wake = [];
  for (let i = 0; i < 26; i++) {
    const x = r.range(260, 1000), y = r.range(180, 700), len = r.range(160, 520);
    wake.push(streak(x, y - (x - 500) * 0.2, len, r.range(2, 7)));
  }
  s.add(1, g({ fill: '#b8f0a0', opacity: 0.16, filter: 'url(#glow2)' }, wake));

  // ---- 2: the stalker
  const spine = [[404, 492], [486, 466], [578, 450], [664, 462], [736, 496], [800, 500], [846, 456], [862, 384], [850, 318]];
  const W = (t) => 26 + 143 * Math.pow(1 - t, 0.95);
  const sm = sample(spine, 10), N = sm.length;
  const fr = sm.map((p, i) => {
    const a = sm[Math.max(0, i - 1)], b = sm[Math.min(N - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    return { p, t: i / (N - 1), dx, dy, nx: -dy, ny: dx };
  });
  const at = (i, k) => { const f = fr[i], w = W(f.t); return [f.p[0] + f.nx * w * k, f.p[1] + f.ny * w * k]; };
  const band = (k, wk, i0 = 0, i1 = N - 1) => { const pts = []; for (let i = i0; i <= i1; i += 2) pts.push(at(i, k)); return ribbon(pts, 1, 1, (u) => W((i0 + (i1 - i0) * u) / (N - 1)) * wk, 4); };
  const fish = [];
  // a breath of lit water behind it, so the dark back reads
  fish.push(el('ellipse', { cx: 520, cy: 440, rx: 360, ry: 150, fill: '#a8e88a', opacity: 0.26, filter: 'url(#glow64)', transform: 'rotate(-10 520 440)' }));
  // fins behind the body: long dorsal, ventral, forked tail
  const finGrad = s.lin([[0, '#e4f77a', 0.8], [0.3, '#5fae5a', 0.85], [1, '#14523a', 0.95]]);
  fish.push(spikeFin(fr, at, W, 20, 52, -1, 0.62, finGrad));
  fish.push(spikeFin(fr, at, W, 46, 62, 1, 0.42, s.lin([[0, '#14523a', 0.95], [0.7, '#5fae5a', 0.85], [1, '#e4f77a', 0.8]])));
  const e = fr[N - 1], tb = [e.p[0], e.p[1]];
  for (const sd of [-1, 1]) {
    const tip = [tb[0] + e.dx * 96 + e.nx * sd * 70, tb[1] + e.dy * 96 + e.ny * sd * 70];
    fish.push(el('path', { d: ribbon([[tb[0] - e.dx * 20, tb[1] - e.dy * 20], [tb[0] + e.dx * 40 + e.nx * sd * 22, tb[1] + e.dy * 40 + e.ny * sd * 22], tip], 1, 1, (u) => 34 * Math.sin(Math.PI * Math.pow(u, 0.55)) + 3), fill: s.lin([[0, '#f0f77a', 0.8], [1, '#1c5a40', 0.95]], 0, 0, 0.3, 1) }));
  }

  // body
  const bodyD = ribbon(spine, 1, 1, W, 10);
  const body = [el('path', { d: bodyD, fill: '#58a455' })];
  const bin = [];
  bin.push(el('path', { d: band(-0.42, 0.26), fill: '#1c5e3e', opacity: 0.7, filter: 'url(#glow8)' }));
  bin.push(el('path', { d: band(0.3, 0.4), fill: '#f0f9a8', opacity: 0.9, filter: 'url(#glow8)' }));
  bin.push(el('path', { d: band(0.47, 0.14), fill: '#0b2c26', opacity: 0.6, filter: 'url(#glow4)' }));
  // tiger bars over the back
  const bars = [];
  for (let i = 7; i < N - 3; i += 4) {
    const f = fr[i], w = W(f.t), lean = 0.3 * w;
    const a = at(i, -0.52), b = [f.p[0] + f.nx * w * 0.05 + f.dx * lean, f.p[1] + f.ny * w * 0.05 + f.dy * lean], c = [f.p[0] - f.nx * w * 0.2 + f.dx * lean * 1.9, f.p[1] - f.ny * w * 0.2 + f.dy * lean * 1.9];
    bars.push(el('path', { d: ribbon([a, b, c], w * 0.17, 1.5), fill: '#04201a', opacity: 0.8 }));
  }
  bin.push(g({ filter: 'url(#glow2)' }, bars));
  // sheen along the flank
  bin.push(el('path', { d: band(-0.22, 0.05), fill: '#e4ffd0', opacity: 0.4, filter: 'url(#glow4)' }));
  // lights along the lateral line
  for (let i = 9; i < N - 6; i += 5) {
    const p = at(i, 0.04), rr = 1.6 + W(fr[i].t) * 0.036;
    bin.push(el('circle', { cx: p[0], cy: p[1], r: rr * 2.6, fill: '#fff06a', opacity: 0.4, filter: 'url(#glow4)' }));
    bin.push(el('circle', { cx: p[0], cy: p[1], r: rr, fill: '#fff9b0' }));
  }
  body.push(g({ 'clip-path': s.clip(el('path', { d: bodyD })) }, bin));

  // head (in its own frame)
  const upper = [[36, -68], [-40, -60], [-84, -46], [-140, -24], [-180, -6]];
  const mouthU = [[-180, -6], [-172, 4], [-120, 8], [-60, 14], [-18, 24]];
  const mouthL = [[-18, 24], [-70, 36], [-130, 38], [-186, 30]];
  const chin = [[-186, 30], [-180, 44], [-130, 58], [-70, 68], [-10, 73], [36, 70]];
  const uS = sample(upper, 8), muS = sample(mouthU, 8), mlS = sample(mouthL, 8), chS = sample(chin, 8);
  const gillS = sample([[36, 70], [70, 50], [90, 8], [84, -34], [62, -62], [36, -68]], 8); // the gill plate, lapping back over the body
  const headD = poly([...uS, ...muS.slice(1), ...mlS.slice(1), ...chS.slice(1), ...gillS.slice(1, -1)], true);
  const head = [];
  head.push(el('path', { d: poly(gillS), fill: 'none', stroke: '#04201a', 'stroke-width': 16, opacity: 0.55, filter: 'url(#glow4)', transform: 'translate(8 2)' }));
  // gullet
  head.push(el('path', { d: poly([...muS, ...mlS.slice(1)], true), fill: s.lin([[0, '#14080a'], [1, '#5a1a1e']], 1, 0, 0, 0) }));
  // teeth
  const teeth = [];
  for (let i = 3; i < muS.length - 5; i += 3) {
    const p = muS[i], L = i < 8 ? 26 : 13 + (i % 2) * 6;
    teeth.push(poly([[p[0] - 5, p[1] - 2], [p[0] + 6, p[1] - 1], [p[0] + 3, p[1] + L]], true));
  }
  for (let i = 6; i < mlS.length - 2; i += 3) {
    const p = mlS[i], L = i > mlS.length - 8 ? 30 : 14 + (i % 2) * 6;
    teeth.push(poly([[p[0] - 6, p[1] + 3], [p[0] + 5, p[1] + 3], [p[0] - 3, p[1] - L]], true));
  }
  head.push(el('path', { d: teeth.join(''), fill: s.lin([[0, '#ffffe8'], [1, '#c8d890']]), stroke: '#1f3a20', 'stroke-width': 1, 'stroke-linejoin': 'round' }));
  head.push(el('path', { d: headD, fill: s.lin([[0, '#1c5e3e'], [0.26, '#3f8a4c'], [0.5, '#58a455'], [0.68, '#d0e686'], [1, '#f4f9b8']], 0, -68, 0, 73, true) }));
  const hin = [];
  // dark mask through the eye
  hin.push(el('path', { d: spline([[40, -26], [-30, -24], [-66, -22]]), fill: 'none', stroke: '#062a20', 'stroke-width': 22, opacity: 0.6, filter: 'url(#glow4)' }));
  for (let i = 0; i < 5; i++) hin.push(el('path', { d: `M${-10 - i * 30} -70q-14 16 -6 ${34 - i * 4}`, fill: 'none', stroke: '#062a20', 'stroke-width': 9 - i, opacity: 0.6, 'stroke-linecap': 'round' }));
  hin.push(el('ellipse', { cx: -30, cy: 86, rx: 150, ry: 26, fill: '#0b2c26', opacity: 0.5, filter: 'url(#glow8)' }));
  hin.push(el('ellipse', { cx: -60, cy: -70, rx: 110, ry: 18, fill: '#c8ffc0', opacity: 0.4, filter: 'url(#glow8)' }));
  hin.push(el('path', { d: 'M96 -66Q20 -78 -60 -62Q-120 -44 -180 -10', fill: 'none', stroke: '#1c5e3e', 'stroke-width': 30, opacity: 0.7, filter: 'url(#glow8)' }));
  hin.push(el('path', { d: poly(gillS), fill: 'none', stroke: '#e4ffa8', 'stroke-width': 2.5, opacity: 0.55 }));
  // lips
  hin.push(el('path', { d: poly(muS), fill: 'none', stroke: '#041c18', 'stroke-width': 7, opacity: 0.7 }));
  hin.push(el('path', { d: poly(mlS), fill: 'none', stroke: '#fbffc8', 'stroke-width': 5, opacity: 0.6 }));
  // gill covers
  hin.push(el('path', { d: 'M26 -60Q-16 0 16 68', fill: 'none', stroke: '#062a20', 'stroke-width': 14, opacity: 0.4, 'stroke-linecap': 'round', filter: 'url(#glow4)' }));
  hin.push(el('path', { d: 'M24 -58Q-18 0 14 66', fill: 'none', stroke: '#062a20', 'stroke-width': 4, opacity: 0.7, 'stroke-linecap': 'round' }));
  hin.push(el('path', { d: 'M-2 -30Q-22 4 -6 40', fill: 'none', stroke: '#062a20', 'stroke-width': 3, opacity: 0.45, 'stroke-linecap': 'round' }));
  // nostril and pits along the jaw
  hin.push(el('ellipse', { cx: -142, cy: -14, rx: 5, ry: 3, fill: '#041c18', transform: 'rotate(20 -142 -14)' }));
  for (let i = 0; i < 6; i++) hin.push(el('circle', { cx: -150 + i * 24, cy: 50 + i * 3.4, r: 2.4, fill: '#3f6a3a', opacity: 0.7 }));
  head.push(g({ 'clip-path': s.clip(el('path', { d: headD })) }, hin));
  body.push(g({ transform: HTF }, head));
  fish.push(g({ filter: s.emboss({ color: '#e8ffc0', az: 292, elev: 60, depth: 8, k: 0.16, exp: 30, blur: 8 }) }, body));

  // rim light down the back
  const topEdge = []; for (let i = 2; i < N; i += 2) topEdge.push(at(i, -0.5));
  fish.push(el('path', { d: spline(topEdge), fill: 'none', stroke: s.lin([[0, '#f4ffc8', 0.95], [1, '#f4ffc8', 0.25]], 320, 0, 850, 0, true), 'stroke-width': 3, 'stroke-linecap': 'round' }));
  fish.push(g({ transform: HTF }, [
    el('path', { d: poly(uS), fill: 'none', stroke: '#f4ffc8', 'stroke-width': 3, opacity: 0.9, 'stroke-linecap': 'round' }),
    // the eye: the one hot yellow thing in the forest
    el('circle', { cx: -70, cy: -20, r: 50, fill: '#ffe23a', opacity: 0.45, filter: 'url(#glow16)' }),
    el('ellipse', { cx: -70, cy: -20, rx: 29, ry: 27, fill: '#052018' }),
    el('ellipse', { cx: -70, cy: -20, rx: 24.5, ry: 22.5, fill: s.rad([[0, '#fffcc8'], [0.4, '#ffe93a'], [0.78, '#f7b21c'], [1, '#9a520a']], 0.42, 0.42, 0.62) }),
    el('ellipse', { cx: -75, cy: -19, rx: 6.5, ry: 15, fill: '#060a06' }),
    el('circle', { cx: -80, cy: -28, r: 5, fill: '#fff' }),
    el('circle', { cx: -64, cy: -10, r: 2.2, fill: '#fff', opacity: 0.8 }),
    // brow: a hard slanted ridge
    el('path', { d: 'M-112 -30Q-76 -54 -34 -54L-32 -42Q-70 -44 -106 -20Z', fill: '#0c3a2a' }),
    el('path', { d: 'M-112 -32Q-76 -56 -34 -56', fill: 'none', stroke: '#e4ffa8', 'stroke-width': 2.4, opacity: 0.85, 'stroke-linecap': 'round' }),
  ]));
  // pectoral fin, flattened back by speed
  const pf = at(9, 0.34);
  fish.push(el('path', { d: ribbon([pf, [pf[0] + 56, pf[1] + 22], [pf[0] + 118, pf[1] + 22]], 1, 1, (u) => 34 * Math.sin(Math.PI * Math.pow(u, 0.5)) + 2), fill: s.lin([[0, '#2f7a46', 0.95], [0.6, '#5fae5a', 0.85], [1, '#e4f77a', 0.7]], 0, 0, 1, 0) }));
  for (let i = 0; i < 4; i++) fish.push(el('path', { d: `M${pf[0] + 6} ${pf[1] + 4}L${pf[0] + 108} ${pf[1] + 12 + i * 7}`, stroke: '#fbffc8', 'stroke-width': 1.2, opacity: 0.4 }));
  s.add(2, g({ transform: 'translate(-14 22) translate(192 560) scale(1.08) translate(-192 -560)' }, fish));

  // ---- 3: near kelp whipping past, streaks, bubbles off the jaw
  const nearFill = s.lin([[0, '#0f3a2c'], [1, '#010c0c']]);
  const near = [];
  near.push(...kelp(r, { x: 30, y: 1100, h: 1250, sway: 40, w: 34, fill: nearFill, bladeLen: 170, bw: 60, every: 5 }));
  near.push(...kelp(r, { x: 1000, y: 1100, h: 1250, sway: 40, w: 38, fill: nearFill, bladeLen: 170, bw: 64, every: 5, flow: -1 }));
  s.add(3, g({ filter: blurH(12, 3) }, near));
  const st = [];
  for (let i = 0; i < 22; i++) {
    const x = r.range(120, 960), y = r.range(240, 760), len = r.range(120, 420);
    st.push(streak(x, y - (x - 500) * 0.22, len, r.range(1.6, 5)));
  }
  s.add(3, g({ fill: '#e4ffc8', opacity: 0.4, filter: 'url(#glow2)' }, st));
  const bub = [];
  for (let i = 0; i < 26; i++) {
    const t = r(), x = 380 + t * 520 + r.range(-20, 20), y = 420 - t * 200 + r.range(-60, 50), rr = r.range(2, 9) * (1 - t * 0.4);
    bub.push(el('ellipse', { cx: x, cy: y, rx: rr * 1.5, ry: rr, fill: '#e8ffd0', 'fill-opacity': 0.1, stroke: '#e8ffd0', 'stroke-width': 1.2, 'stroke-opacity': 0.7, transform: `rotate(-17 ${x.toFixed(1)} ${y.toFixed(1)})` }));
    bub.push(el('circle', { cx: x - rr * 0.4, cy: y - rr * 0.35, r: rr * 0.22, fill: '#fff', opacity: 0.9 }));
  }
  s.add(3, g({}, bub));
  // scraps of torn weed
  const scraps = [];
  for (let i = 0; i < 14; i++) {
    const x = r.range(150, 900), y = r.range(200, 800), k = r.range(8, 22);
    scraps.push(el('ellipse', { cx: x, cy: y, rx: k, ry: k * 0.3, fill: r.pick(['#2f7a4a', '#0c3a2c', '#5fa85a']), transform: `rotate(${r.range(-50, 20)} ${x.toFixed(1)} ${y.toFixed(1)})`, opacity: 0.85 }));
  }
  s.add(3, g({ filter: 'url(#glow2)' }, scraps));
  s.motes({ n: 40, rmin: 1, rmax: 3.6, colors: ['#e8ffc8', '#fff9a0', '#a8f0b0'], opacity: 0.7 });
}

/** A streak of rushing water, tapered at both ends, lying along the hunter's line of travel. */
function streak(x, y, len, w) {
  const c = Math.cos(-0.3), sn = Math.sin(-0.3);
  return el('path', { d: ribbon([[x, y], [x + c * len * 0.5, y + sn * len * 0.5], [x + c * len, y + sn * len]], 1, 1, (u) => w * Math.sin(Math.PI * Math.pow(u, 0.4)) + 0.3, 6) });
}

/** A spiny fin along the body between samples i0 and i1, on side sd (-1 back, +1 belly). */
function spikeFin(fr, at, W, i0, i1, sd, h, fill) {
  const base = [], tips = [], rays = [];
  for (let i = i0; i <= i1; i += 2) {
    const u = (i - i0) / (i1 - i0), f = fr[i], b = at(i, sd * 0.46), H = W(f.t) * h * (Math.sin(Math.PI * Math.pow(u, 0.6)) * 0.9 + 0.1) * (((i - i0) / 2) % 2 ? 0.74 : 1);
    const tip = [b[0] + sd * f.nx * H + f.dx * H * 0.9, b[1] + sd * f.ny * H + f.dy * H * 0.9];
    base.push(b); tips.push(tip);
    if (!(((i - i0) / 2) % 2)) rays.push(`M${b[0]} ${b[1]}L${tip[0]} ${tip[1]}`);
  }
  return g({}, [
    el('path', { d: poly([...base, ...tips.reverse()], true), fill }),
    el('path', { d: rays.join(''), fill: 'none', stroke: '#fbffc8', 'stroke-width': 1.6, opacity: 0.55 }),
    el('path', { d: poly(tips), fill: 'none', stroke: '#fbffc8', 'stroke-width': 1.4, opacity: 0.6 }),
  ]);
}

/** A kelp plant whose blades all stream one way in the current. Returns markup parts. */
function kelp(r, { x, y = 1060, h = 900, sway = 30, w = 14, fill, bladeLen = 160, bw = 30, every = 4, flow = 1 }) {
  const parts = [], ph = r.range(0, 6), pts = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    pts.push([x + Math.sin(t * 4.2 + ph) * sway * (0.4 + t), y - h * t]);
  }
  parts.push(el('path', { d: ribbon(pts, w, w * 0.4), fill }));
  const sm = sample(pts, 5);
  for (let i = 4; i < sm.length - 1; i += every) {
    const p = sm[i], L = bladeLen * r.range(0.6, 1.2), Wd = bw * r.range(0.7, 1.15), bp = r.range(0, 6), rise = r.range(-0.1, 0.45), sd = r() < 0.8 ? flow : -flow * 0.5;
    const bl = [p, [p[0] + sd * L * 0.3, p[1] - L * (0.14 + rise * 0.3)], [p[0] + sd * L * 0.65, p[1] - L * rise * 0.7 + Math.sin(bp) * 10], [p[0] + sd * L, p[1] - L * rise + Math.cos(bp) * 16]];
    parts.push(el('path', { d: ribbon(bl, 1, 1, (u) => Wd * Math.sin(Math.PI * Math.pow(u, 0.5)) * (1 + 0.14 * Math.sin(u * 13 + bp)) + 1.2, 12), fill }));
    parts.push(el('ellipse', { cx: p[0] + sd * w * 0.5, cy: p[1] - w * 0.2, rx: w * 0.62, ry: w * 0.8, fill }));
  }
  return parts;
}

/** Tinted cloud (the kit's fog comes out white whatever colour it is given). */
function tfog(s, { color, opacity = 0.3, freq = 0.006, seed = 1, contrast = 2.2, layer = 0 }) {
  const id = s.uid('tf'), c = [1, 3, 5].map((i) => (parseInt(color.slice(i, i + 2), 16) / 255).toFixed(3));
  s.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 ${c[0]}  0 0 0 0 ${c[1]}  0 0 0 0 ${c[2]}  ${contrast} 0 0 0 ${-(contrast - 1) * 0.62}"/></filter>`);
  s.add(layer, el('rect', { x: 0, y: 0, width: s.w, height: s.h, filter: `url(#${id})`, opacity }));
}
