// ASTRA, THE DROWNED STAR (mythic) — the star that fell, a being of light above the black sea floor, the whole spectrum
// breaking from her through the water.
import { el, g, spline, sample, poly, ribbon, glint } from '../lib.mjs';

// ------------------------------------------------------------------------------------------------ local helpers

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixc = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
function ramp(stops, t) {
  for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) return mixc(stops[i - 1][1], stops[i][1], (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0] || 1));
  return stops[stops.length - 1][1];
}
const HUES = ['#ff4466', '#ff9a3a', '#ffe84a', '#5aff9a', '#3ad8ff', '#5a7cff', '#b85aff'];

function frame(pts, per = 12) {
  const sm = sample(pts, per);
  let acc = 0;
  return sm.map((p, i) => {
    const a = sm[Math.max(0, i - 1)], b = sm[Math.min(sm.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    if (i > 0) acc += Math.hypot(p[0] - sm[i - 1][0], p[1] - sm[i - 1][1]);
    return { x: p[0], y: p[1], nx: -dy / l, ny: dx / l, t: 0, len: acc };
  }).map((p, i, all) => { p.t = p.len / (all[all.length - 1].len || 1); return p; });
}

function mottle(s, color, freq, contrast, seed) {
  const id = s.uid('mt'), off = -(contrast - 1) * 0.6, c = hex(color).map((v) => (v / 255).toFixed(3));
  s.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 ${c[0]}  0 0 0 0 ${c[1]}  0 0 0 0 ${c[2]}  ${contrast} 0 0 0 ${off}"/><feComposite in2="SourceGraphic" operator="in"/></filter>`);
  return `url(#${id})`;
}
function mist(s, { color, opacity = 0.3, freq = 0.006, seed = 1, x = 0, y = 0, w = 1024, h = 1024, contrast = 2.2 }) {
  const m = s.mask(el('rect', { x, y, width: w, height: h, fill: s.rad([[0, '#fff', 1], [0.7, '#fff', 0.7], [1, '#fff', 0]], 0.5, 0.5, 0.6) }));
  return g({ mask: m, opacity }, el('rect', { x, y, width: w, height: h, fill: color, filter: mottle(s, color, freq, contrast, seed) }));
}

/** A ribbon whose colour (and alpha) runs along its length: a streamer of light. */
function streamer(pts, w0, w1, stops, alpha = (t) => 1, shape = null, per = 10) {
  const f = frame(pts, per), out = [];
  const W = (t) => (w1 + (w0 - w1) * (1 - t)) * (shape ? shape(t) : 1);
  for (let i = 0; i < f.length - 1; i++) {
    const a = f[i], b = f[i + 1], wa = W(a.t) / 2, wb = W(b.t) / 2, tm = (a.t + b.t) / 2, c = ramp(stops, tm), o = alpha(tm);
    out.push(el('path', { d: poly([[a.x - a.nx * wa, a.y - a.ny * wa], [a.x + a.nx * wa, a.y + a.ny * wa], [b.x + b.nx * wb, b.y + b.ny * wb], [b.x - b.nx * wb, b.y - b.ny * wb]], true), fill: c, stroke: c, 'stroke-width': 0.7, opacity: o }));
  }
  return out.join('');
}

/** Branching coral as a flat shape. */
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
  const C = [512, 396];                 // her heart: everything radiates from here
  const P = (a, d, c = C) => [c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d];
  // spectrum gradients, radial about the heart, shared by every prismatic shaft
  const hueGrad = HUES.map((c) => s.rad([[0, c, 0], [0.1, c, 0], [0.24, c, 0.95], [0.55, c, 0.4], [1, c, 0]], C[0], C[1], 820, true));
  const whiteGrad = s.rad([[0, '#fff', 0], [0.06, '#fff', 0.9], [0.4, '#fff6d8', 0.4], [1, '#fff6d8', 0]], C[0], C[1], 820, true);
  /** A beam with a white heart and the spectrum fanned across its width. */
  const shaft = (a, w, len = 820) => {
    const out = [];
    for (let i = 0; i < 7; i++) {
      const ai = a + (i - 3) * w * 0.3, dw = w * 0.34;
      out.push(el('path', { d: poly([P(ai, 30), P(ai - dw, len), P(ai + dw, len)], true), fill: hueGrad[i] }));
    }
    out.push(el('path', { d: poly([P(a, 10), P(a - w * 0.42, len), P(a + w * 0.42, len)], true), fill: whiteGrad, opacity: 0.8 }));
    return out.join('');
  };
  const rainbowRing = (R, w, op, c = C) => g({ opacity: op, filter: s.blur(w * 0.55) }, HUES.map((h, i) => el('circle', { cx: c[0], cy: c[1], r: R + (3 - i) * w, fill: 'none', stroke: h, 'stroke-width': w * 1.2 })));

  // ---- 0: the black water, and her light going out into it
  s.backdrop(s.lin([[0, '#0b0a34'], [0.4, '#08072c'], [0.75, '#05041e'], [1, '#020210']]));
  s.add(0, el('circle', { cx: C[0], cy: C[1], r: 700, fill: s.rad([[0, '#fff3d0', 0.9], [0.1, '#ffd486', 0.7], [0.22, '#ff9a78', 0.42], [0.4, '#c24ad2', 0.3], [0.62, '#4a3cd8', 0.22], [1, '#2a2a9a', 0]]) }));
  s.add(0, mist(s, { color: '#7a4af0', opacity: 0.4, freq: 0.005, seed: 3 }));
  s.add(0, mist(s, { color: '#2ad0e0', opacity: 0.26, freq: 0.008, seed: 14 }));
  s.add(0, mist(s, { color: '#ff5aa8', opacity: 0.26, freq: 0.007, seed: 27, y: 200, h: 700 }));
  const shafts = [];
  const shaftAngles = [-2.82, -2.36, -1.98, -1.57, -1.12, -0.72, -0.3, 0.16, 0.52, 2.62, 3.0, -3.3 + Math.PI * 2];
  shaftAngles.forEach((a, i) => shafts.push(shaft(a + r.range(-0.05, 0.05), i % 3 === 0 ? 0.11 : i % 3 === 1 ? 0.06 : 0.085)));
  s.add(0, g({ opacity: 0.5, filter: s.blur(9) }, shafts));
  // the widest halos
  s.add(0, rainbowRing(470, 7, 0.2));
  s.add(0, el('circle', { cx: C[0], cy: C[1], r: 560, fill: 'none', stroke: '#c9b8ff', 'stroke-width': 1.5, opacity: 0.25 }));
  s.motes({ n: 150, rmin: 0.6, rmax: 2.4, colors: ['#fff6d8', '#ffd0f0', '#bfe8ff', '#ffe9a0'], opacity: 0.6, glow: false, layer: 0 });
  s.vignette({ strength: 0.86, cy: 0.4, r: 0.8 });
  s.grain({ opacity: 0.18 });

  // ---- 1: corona and halos behind her; the creatures drawn to the light; the lit sea floor
  const cor = [];
  cor.push(el('circle', { cx: C[0], cy: C[1], r: 300, fill: s.rad([[0, '#fff0c0', 0.7], [0.25, '#ffdc98', 0.55], [0.5, '#ffb880', 0.28], [0.78, '#ff9a90', 0.1], [1, '#ff9a90', 0]]) }));
  // needle rays: a blazing crown all the way round
  const needles = [];
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2 + r.range(-0.02, 0.02), main = i % 8 === 0, mid = i % 4 === 0;
    const len = main ? 560 : mid ? r.range(330, 400) : r.range(170, 290), w = main ? 0.022 : mid ? 0.015 : 0.009;
    needles.push(el('path', { d: poly([P(a - w, 46), P(a, len), P(a + w, 46)], true), fill: main ? '#ffffff' : '#fff3c8', opacity: main ? 0.95 : mid ? 0.8 : 0.6 }));
  }
  cor.push(g({ filter: 'url(#bloomS)' }, needles));
  // astrolabe rings
  cor.push(el('circle', { cx: C[0], cy: C[1], r: 196, fill: 'none', stroke: '#fff6d0', 'stroke-width': 3.2, opacity: 0.9, filter: 'url(#bloomS)' }));
  cor.push(el('circle', { cx: C[0], cy: C[1], r: 208, fill: 'none', stroke: '#ffd97a', 'stroke-width': 1.4, opacity: 0.85 }));
  cor.push(el('circle', { cx: C[0], cy: C[1], r: 184, fill: 'none', stroke: '#fff', 'stroke-width': 1.6, opacity: 0.7, 'stroke-dasharray': '2 10' }));
  cor.push(el('circle', { cx: C[0], cy: C[1], r: 318, fill: 'none', stroke: '#ffe9b8', 'stroke-width': 1.6, opacity: 0.6 }));
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2, p0 = P(a, 318), p1 = P(a, i % 6 === 0 ? 336 : 326);
    cor.push(el('path', { d: `M${p0[0]} ${p0[1]}L${p1[0]} ${p1[1]}`, stroke: '#ffe9b8', 'stroke-width': i % 6 === 0 ? 2 : 1, opacity: 0.6 }));
  }
  for (let i = 0; i < 12; i++) { const p = P((i / 12) * Math.PI * 2 + 0.26, 318); cor.push(el('circle', { cx: p[0], cy: p[1], r: 4, fill: '#fff8dc' }), el('circle', { cx: p[0], cy: p[1], r: 11, fill: '#ffe9a8', opacity: 0.3 })); }
  cor.push(rainbowRing(258, 4.2, 0.62));
  cor.push(el('circle', { cx: C[0], cy: C[1], r: 400, fill: 'none', stroke: '#e6d8ff', 'stroke-width': 1.2, opacity: 0.4, 'stroke-dasharray': '1 7' }));
  s.add(1, g({}, cor));

  // the sea floor, lit from her
  const floorLit = s.rad([[0, '#fff0c0'], [0.1, '#f0a878'], [0.24, '#a8508f'], [0.45, '#3c2a84'], [0.7, '#141040'], [1, '#06051a']], 512, 800, 640, true);
  const floorDim = s.rad([[0, '#d8a0a0'], [0.14, '#8a4a8f'], [0.34, '#2c2070'], [0.62, '#0e0c34'], [1, '#050416']], 512, 830, 620, true);
  const bedBack = [];
  for (const [x, y, len] of [[120, 900, 40], [230, 880, 32], [330, 872, 26], [700, 874, 28], [806, 880, 34], [920, 896, 42]]) coral(r, x, y, len, -1.57 + r.range(-0.2, 0.2), 4, len * 0.26, bedBack, floorLit);
  s.add(1, g({}, bedBack));
  s.ridge({ y: 868, amp: 50, detail: 0.8, fill: floorLit, layer: 1 });
  s.add(1, el('ellipse', { cx: 512, cy: 846, rx: 300, ry: 34, fill: '#fff3c8', opacity: 0.55, filter: 'url(#glow16)' }));
  // prismatic caustics crawling over the floor
  const caus = [];
  for (let i = 0; i < 26; i++) {
    const x = 512 + r.range(-430, 430), y = r.range(850, 960), w = r.range(30, 90);
    caus.push(el('path', { d: `M${x - w} ${y}Q${x} ${y - r.range(4, 12)} ${x + w} ${y}`, fill: 'none', stroke: HUES[i % 7], 'stroke-width': r.range(1.5, 3.5), opacity: 0.5 * (1 - Math.abs(x - 512) / 520), 'stroke-linecap': 'round' }));
  }
  s.add(1, g({ filter: 'url(#glow2)' }, caus));
  s.ridge({ y: 930, amp: 46, detail: 1, fill: floorDim, layer: 1 });

  // the shoal turning about her, each fish bright on the side that faces the star
  const litA = s.lin([[0, '#fff0c0'], [0.45, '#b06aa8'], [1, '#141040']]), litB = s.lin([[0, '#141040'], [0.55, '#b06aa8'], [1, '#fff0c0']]);
  const fishD = 'M13 0Q2 -7.5 -11 -1L-20 -7L-17 0L-20 7L-11 1Q2 7.5 13 0Z';
  const shoal = [];
  for (let i = 0; i < 54; i++) {
    const a = (i / 54) * Math.PI * 2 + r.range(-0.05, 0.05), rx = r.range(350, 470), ry = rx * 0.82;
    const x = C[0] + Math.cos(a) * rx, y = C[1] + 20 + Math.sin(a) * ry;
    if (y > 800 || y < 20) continue;
    const phi = Math.atan2(ry * Math.cos(a), -rx * Math.sin(a)), k = r.range(0.7, 1.5) * (0.7 + 0.5 * (Math.sin(a) + 1) / 2);
    const side = (C[0] - x) * -Math.sin(phi) + (C[1] - y) * Math.cos(phi);
    shoal.push(el('path', { d: fishD, fill: side < 0 ? litA : litB, opacity: 0.95 - (rx - 350) / 300, transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(phi * 180 / Math.PI + r.range(-8, 8)).toFixed(1)}) scale(${k.toFixed(2)})` }));
  }
  s.add(1, g({}, shoal));
  // small jellies, lit through
  const jelly = (x, y, R, c) => {
    const p = [];
    for (let i = 0; i < 6; i++) { const x0 = x - R * 0.7 + R * 1.4 * (i / 5), sw = r.range(-R, R) * 0.5; p.push(el('path', { d: spline([[x0, y], [x0 + sw, y + R * 1.3], [x0 - sw, y + R * 2.6]]), fill: 'none', stroke: c, 'stroke-width': 1.5, opacity: 0.6 })); }
    const d = `M${x - R} ${y}C${x - R} ${y - R * 1.35} ${x + R} ${y - R * 1.35} ${x + R} ${y}Q${x} ${y + R * 0.3} ${x - R} ${y}Z`;
    p.push(el('path', { d, fill: c, opacity: 0.3, filter: 'url(#glow8)' }), el('path', { d, fill: s.lin([[0, '#fff', 0.9], [1, c, 0.5]]) }));
    return g({ opacity: 0.85 }, p);
  };
  s.add(1, jelly(118, 372, 26, '#ff9ad8'), jelly(906, 500, 22, '#8ad8ff'), jelly(842, 166, 17, '#ffd98a'), jelly(196, 640, 15, '#b8a0ff'));

  // ---- 2: Astra
  const A = [];
  const HX = 512, HY = 296;
  /** A tapering strand of light: white at the root, through gold and rose to violet, gone by the tip. */
  const strand = (pts, w0, w1, shape = null) => {
    const a = pts[0], b = pts[pts.length - 1];
    const fill = s.lin([[0, '#ffffff', 1], [0.3, '#fff3c8', 0.95], [0.55, '#ffcf8a', 0.8], [0.74, '#ff9ab8', 0.55], [0.9, '#b88aff', 0.3], [1, '#6ab0ff', 0]], a[0], a[1], b[0], b[1], true);
    return el('path', { d: ribbon(pts, w0, w1, shape, 10), fill });
  };
  const dir = (th) => [Math.sin(th), -Math.cos(th)];   // th from straight up, clockwise
  // hair: fine strands of light lifting off her head on the current
  const hair = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < 13; i++) {
      const th = side * (0.1 + i * 0.125 + r.range(-0.03, 0.03)), L = 250 - i * 6 + r.range(-30, 30), x0 = HX + side * (3 + i * 1.8), y0 = HY - 26 + i * 1.6;
      const d0 = dir(th * 0.45), d1 = dir(th * 0.95), d2 = dir(th * 1.25), wv = side * r.range(10, 26);
      hair.push(strand([[x0, y0], [x0 + d0[0] * L * 0.3, y0 + d0[1] * L * 0.3], [x0 + d1[0] * L * 0.62 + d1[1] * wv, y0 + d1[1] * L * 0.62 - d1[0] * wv], [x0 + d2[0] * L * 0.86 - d2[1] * wv, y0 + d2[1] * L * 0.86 + d2[0] * wv], [x0 + d2[0] * L + side * 14, y0 + d2[1] * L + 22]], 11 - i * 0.3, 0.8, (t) => 0.55 + 0.75 * Math.sin(Math.PI * Math.min(1, t * 1.3 + 0.1))));
    }
  }
  A.push(g({ filter: 'url(#bloomS)' }, hair));
  // gown: her body runs out into a long hem of light that frays toward the floor
  const gown = [];
  for (let i = 0; i < 15; i++) {
    const k = (i - 7) / 7, x0 = HX + k * 34, ex = HX + k * 214 + r.range(-16, 16), ey = 852 - Math.abs(k) * 70 + r.range(-18, 18), sw = r.range(14, 30) * (i % 2 ? 1 : -1);
    gown.push(strand([[x0, 478], [x0 + (ex - x0) * 0.16 + sw * 0.4, 560], [x0 + (ex - x0) * 0.4 - sw, 640], [x0 + (ex - x0) * 0.68 + sw, 720], [x0 + (ex - x0) * 0.9 - sw * 0.6, ey - 46], [ex + sw * 0.5, ey]], 34, 1.5, (t) => 1 - 0.5 * t));
  }
  A.push(g({ filter: 'url(#bloomS)' }, gown));

  // the body: one clean shape of light
  const arm = (side) => ribbon([[HX + side * 46, 356], [HX + side * 78, 404], [HX + side * 100, 436], [HX + side * 138, 432], [HX + side * 166, 410]], 22, 8, (t) => 1 - 0.25 * Math.sin(Math.PI * t), 12);
  const torso = `M${HX - 9} 336C${HX - 22} 348 ${HX - 54} 344 ${HX - 56} 362C${HX - 54} 396 ${HX - 30} 420 ${HX - 26} 446C${HX - 30} 470 ${HX - 46} 486 ${HX - 50} 520L${HX + 50} 520C${HX + 46} 486 ${HX + 30} 470 ${HX + 26} 446C${HX + 30} 420 ${HX + 54} 396 ${HX + 56} 362C${HX + 54} 344 ${HX + 22} 348 ${HX + 9} 336Z`;
  const headD = `M${HX - 27} ${HY - 4}C${HX - 27} ${HY - 42} ${HX + 27} ${HY - 42} ${HX + 27} ${HY - 4}C${HX + 27} ${HY + 18} ${HX + 12} ${HY + 36} ${HX} ${HY + 38}C${HX - 12} ${HY + 36} ${HX - 27} ${HY + 18} ${HX - 27} ${HY - 4}Z`;
  const neck = `M${HX - 9} ${HY + 26}L${HX - 11} 344L${HX + 11} 344L${HX + 9} ${HY + 26}Z`;
  const hand = (side) => { const x = HX + side * 172, y = 402; return `M${x - side * 10} ${y + 8}Q${x} ${y + 12} ${x + side * 14} ${y - 2}L${x + side * 24} ${y - 12}L${x + side * 14} ${y - 10}Q${x} ${y - 4} ${x - side * 10} ${y - 2}Z`; };
  const figure = (fill, extra = {}) => g(extra, [torso, headD, neck, arm(-1), arm(1), hand(-1), hand(1)].map((d) => el('path', { d, fill })));
  // prismatic fringes: the light splits at her edges
  A.push(g({ filter: s.blur(5), opacity: 0.85 }, [figure('#ff3a7a', { transform: 'translate(-9 2)' }), figure('#3ad8ff', { transform: 'translate(9 2)' }), figure('#ffe84a', { transform: 'translate(0 -8)' }), figure('#b85aff', { transform: 'translate(0 9)' })]));
  A.push(figure('#fff6d0', { filter: 'url(#glow16)', opacity: 0.9 }));
  const bodyFill = s.lin([[0, '#ffffff'], [0.6, '#fffbe8'], [1, '#fff0c0']]);
  A.push(figure(bodyFill));
  // soft gold modelling inside the white so she has form
  const fclip = s.clip([torso, headD, neck, arm(-1), arm(1), hand(-1), hand(1)].map((d) => el('path', { d })).join(''));
  A.push(g({ 'clip-path': fclip }, [
    g({ filter: s.blur(5), opacity: 0.75 }, [torso, headD, arm(-1), arm(1)].map((d) => el('path', { d, fill: 'none', stroke: '#ffb850', 'stroke-width': 12 }))),
    el('ellipse', { cx: HX, cy: 500, rx: 70, ry: 40, fill: '#ffd070', opacity: 0.4, filter: 'url(#glow8)' }),
    el('path', { d: `M${HX - 20} ${HY + 34}Q${HX} ${HY + 52} ${HX + 20} ${HY + 34}`, fill: 'none', stroke: '#ffb850', 'stroke-width': 9, opacity: 0.6, filter: 'url(#glow4)' }),
  ]));
  A.push(g({ opacity: 0.9 }, [torso, headD, arm(-1), arm(1), hand(-1), hand(1)].map((d) => el('path', { d, fill: 'none', stroke: '#ffcf70', 'stroke-width': 1.3 }))));
  // her face: only the calm of closed eyes
  for (const side of [-1, 1]) {
    A.push(el('path', { d: `M${HX + side * 5} ${HY + 2}Q${HX + side * 12} ${HY + 7} ${HX + side * 19} ${HY + 1}`, fill: 'none', stroke: '#c8862a', 'stroke-width': 2, 'stroke-linecap': 'round' }));
    A.push(el('path', { d: `M${HX + side * 4} ${HY - 8}Q${HX + side * 12} ${HY - 13} ${HX + side * 21} ${HY - 8}`, fill: 'none', stroke: '#e0a850', 'stroke-width': 1.3, 'stroke-linecap': 'round', opacity: 0.8 }));
  }
  A.push(el('path', { d: `M${HX - 5} ${HY + 21}Q${HX} ${HY + 24} ${HX + 5} ${HY + 21}`, fill: 'none', stroke: '#d8963a', 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
  A.push(glint(HX, HY - 20, 9, '#fff'));
  // her crown: a fan of rays, shards of star hung above it
  const crown = [];
  for (let i = 0; i < 13; i++) {
    const a = -Math.PI / 2 + (i - 6) * 0.2, len = [150, 86, 118, 74, 104, 66, 92][Math.abs(i - 6)], w = 0.05;
    crown.push(el('path', { d: poly([P(a - w, 38, [HX, HY]), P(a, len, [HX, HY]), P(a + w, 38, [HX, HY])], true), fill: s.lin([[0, '#fff', 0.2], [0.5, '#fff8dc', 1], [1, '#ffe08a', 1]], 0, 1, 0, 0) }));
  }
  A.push(g({ filter: 'url(#bloomS)' }, crown));
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.4, p = P(a, i % 2 ? 100 : 134, [HX, HY]); A.push(glint(p[0], p[1], i === 3 ? 0 : i % 2 ? 9 : 12, '#fff8dc')); }
  // the heart: the star itself
  A.push(el('circle', { cx: C[0], cy: C[1], r: 70, fill: s.rad([[0, '#fff', 1], [0.35, '#fff8dc', 0.9], [1, '#ffe9a8', 0]]) }));
  const hs = [];
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, len = i % 2 ? 78 : 176, w = i % 2 ? 0.12 : 0.085; hs.push(el('path', { d: poly([P(a - w, 9), P(a, len), P(a + w, 9)], true), fill: '#fff' })); }
  A.push(g({ filter: 'url(#bloom)' }, hs), el('circle', { cx: C[0], cy: C[1], r: 15, fill: '#fff' }));
  // a small star cupped above each open hand
  for (const side of [-1, 1]) {
    const x = HX + side * 186, y = 366;
    A.push(el('circle', { cx: x, cy: y, r: 30, fill: '#fff3c8', opacity: 0.7, filter: 'url(#glow8)' }), glint(x, y, 22, '#fff'));
  }
  // motes of her light spilling down the gown
  for (let i = 0; i < 40; i++) {
    const y = r.range(520, 860), sp = (y - 480) * 0.56, x = HX + r.range(-sp, sp), rr = r.range(1, 3.2);
    A.push(el('circle', { cx: x, cy: y, r: rr * 3, fill: HUES[i % 7], opacity: 0.25 }), el('circle', { cx: x, cy: y, r: rr, fill: '#fff' }));
  }
  s.add(2, g({}, A));

  // ---- 3: fragments of her adrift, a ray passing, the near rocks
  const shardFills = [0, 1, 2, 3].map((i) => s.lin([[0, '#ffffff'], [0.45, '#fff3c8'], [1, HUES[[4, 6, 0, 3][i]]]], 0, 0, 1, 1));
  const shard = (x, y, L, rot, i, op = 1) => {
    const w = L * 0.34;
    const pts = [[0, -L], [w, -L * 0.2], [w * 0.55, L * 0.72], [0, L], [-w * 0.75, L * 0.46], [-w, -L * 0.32]];
    return g({ transform: `translate(${x} ${y}) rotate(${rot})`, opacity: op }, [
      el('path', { d: poly(pts, true), fill: HUES[(i * 3) % 7], opacity: 0.55, filter: L > 20 ? 'url(#glow16)' : 'url(#glow8)' }),
      el('path', { d: poly(pts, true), fill: shardFills[i % 4] }),
      el('path', { d: poly([[0, -L], [w * 0.1, 0], [0, L]]) + poly([[w, -L * 0.2], [w * 0.1, 0], [-w, -L * 0.32]]) + poly([[w * 0.55, L * 0.72], [w * 0.1, 0], [-w * 0.75, L * 0.46]]), fill: 'none', stroke: '#fff', 'stroke-width': 1, opacity: 0.7 }),
      el('path', { d: poly([[0, -L], [w * 0.1, 0], [-w, -L * 0.32]], true), fill: '#fff', opacity: 0.55 }),
    ]);
  };
  const shards = [];
  [[168, 232, 30, 20], [846, 318, 26, -34], [742, 652, 20, 62], [254, 560, 17, -18], [92, 520, 13, 40], [668, 110, 15, 12], [356, 118, 12, -50], [930, 700, 34, 24], [610, 778, 12, -30], [404, 738, 10, 34], [888, 100, 10, 60], [60, 150, 12, -12]]
    .forEach(([x, y, L, rot], i) => shards.push(shard(x, y, L, rot, i)));
  s.add(3, g({}, shards));
  // manta gliding across the corner, gold on its underside
  const manta = [];
  const mD = 'M0 -40C40 -44 120 -30 210 30C150 22 96 34 60 70C40 56 18 60 0 84C-18 60 -40 56 -60 70C-96 34 -150 22 -210 30C-120 -30 -40 -44 0 -40Z';
  manta.push(el('path', { d: 'M0 80Q10 170 -24 250', fill: 'none', stroke: '#0c0a34', 'stroke-width': 4, 'stroke-linecap': 'round' }));
  manta.push(el('path', { d: 'M-16 -36q-6 -26 4 -40M16 -36q6 -26 -4 -40', fill: 'none', stroke: '#0c0a34', 'stroke-width': 10, 'stroke-linecap': 'round' }));
  manta.push(el('path', { d: mD, fill: s.lin([[0, '#1c1654'], [0.5, '#0c0a34'], [1, '#07062a']], 0, 0, 1, 0) }));
  manta.push(el('path', { d: 'M210 30C150 22 96 34 60 70C40 56 18 60 0 84', fill: 'none', stroke: '#ffe0a8', 'stroke-width': 3, opacity: 0.9, 'stroke-linecap': 'round' }));
  manta.push(el('path', { d: 'M0 -40C40 -44 120 -30 210 30', fill: 'none', stroke: '#b89aff', 'stroke-width': 1.6, opacity: 0.6 }));
  manta.push(el('path', { d: 'M-210 30C-120 -30 -40 -44 0 -40', fill: 'none', stroke: '#6a5ad0', 'stroke-width': 1.4, opacity: 0.5 }));
  for (let i = 0; i < 5; i++) manta.push(el('path', { d: `M${-30 + i * 6} ${6 + i * 3}q10 14 6 30`, fill: 'none', stroke: '#2a2270', 'stroke-width': 1.6, opacity: 0.8, transform: 'translate(56 6)' }));
  s.add(3, g({ transform: 'translate(176 150) rotate(-38) scale(0.62)' }, manta));
  // near rocks and weed, rimmed with her light
  const rimLit = s.rad([[0, '#fff0c0', 1], [0.3, '#ff9ab0', 0.8], [0.6, '#8a6aff', 0.4], [1, '#8a6aff', 0]], 512, 900, 620, true);
  s.kelp({ x: 44, y: 1060, h: 330, n: 3, color: '#04031a', layer: 3, width: 18, lean: 0.05 });
  s.kelp({ x: 984, y: 1060, h: 360, n: 3, color: '#04031a', layer: 3, width: 18, lean: -0.05 });
  s.ridge({ y: 1000, amp: 54, detail: 1, fill: '#030214', layer: 3, stroke: rimLit });
  s.motes({ n: 46, rmin: 1.2, rmax: 4.6, colors: ['#fff6d8', '#ffd0f0', '#bfe8ff', '#ffe9a0', '#c8ffd8'], opacity: 0.9 });
  s.bubbles({ n: 14, x0: 60, x1: 960, y0: 80, y1: 860, rmin: 3, rmax: 15, color: '#fff3e0', opacity: 0.5 });
  // lens ghosts along one diagonal, as if the eye itself were dazzled
  const ghosts = [];
  [[0.42, 16, 4], [0.62, 30, 1], [0.8, 12, 5], [1.02, 46, 6], [-0.5, 22, 3]].forEach(([k, rr, h]) => {
    const x = C[0] + 300 * k, y = C[1] + 250 * k;
    ghosts.push(el('circle', { cx: x, cy: y, r: rr, fill: HUES[h], 'fill-opacity': 0.12, stroke: HUES[h], 'stroke-width': 1.4, 'stroke-opacity': 0.4 }));
  });
  s.add(3, g({}, ghosts));
  s.add(3, glint(C[0], C[1], 46, '#fff'), glint(HX - 186, 366, 16, '#fff'), glint(HX + 186, 366, 16, '#fff'), glint(168, 222, 16, '#fff', 0.9), glint(846, 308, 14, '#fff', 0.9));
}
