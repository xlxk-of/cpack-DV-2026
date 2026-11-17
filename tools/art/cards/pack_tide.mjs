// TIDE PACK — the standard booster: a sealed pouch of teal-to-indigo metallised foil, printed with the NACRE sigil
// rising out of a pearl-crested sea while the stars fall into it. Front view; the game tears it open along y = 150.
import { el, g, poly, ribbon } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;
export const noThumb = true;
export const size = [720, 1040];
export const transparent = true;

const W = 720, H = 1040, L = 20, R = 700, T = 20, B = 1020, SEAL = 100, TEAR = 150, TAU = Math.PI * 2;

export function build(s) {
  const r = s.r;
  const outline = packOutline();
  const clip = s.clip(el('path', { d: outline }));
  const CX = 360, CY = 540, MR = 196;                       // the medallion

  // ---- 0: the foil itself
  s.add(0, el('path', { d: outline, fill: '#01030c', opacity: 0.5, filter: s.blur(6), transform: 'translate(0 3)' }));
  const base = s.lin([[0, '#45d4ca'], [0.1, '#1fb0b2'], [0.3, '#0f86a8'], [0.55, '#11569e'], [0.8, '#1f3690'], [0.9, '#2430a0'], [1, '#2a34b4']], 0, T, 0, B, true);
  s.add(0, el('path', { d: outline, fill: base }));

  // ---- 1: what is printed on it — light behind the medallion, falling stars, the sea
  const printClip = s.clip(el('rect', { x: 46, y: 196, width: 628, height: 700, rx: 24 }));
  const art = [];
  art.push(el('rect', { x: 46, y: 196, width: 628, height: 700, fill: s.lin([[0, '#0b3f7a', 0], [0.5, '#0b2f78', 0.25], [1, '#120f55', 0.6]]) }));
  art.push(el('circle', { cx: CX, cy: CY, r: 400, fill: s.rad([[0, '#9ffff0', 0.6], [0.5, '#58e0e0', 0.22], [1, '#58e0e0', 0]]) }));
  art.push(rays(s, CX, CY, MR, 470, 36, 0.42, '#eaffff', 0.12));
  art.push(rays(s, CX, CY, MR, 400, 36, 0.1, '#ffffff', 0.34, TAU / 72));
  for (const [rr, o, w] of [[MR + 26, 0.55, 1.6], [MR + 50, 0.34, 1.3], [MR + 80, 0.2, 1.1]]) {
    art.push(el('circle', { cx: CX, cy: CY, r: rr, fill: 'none', stroke: '#eafffb', 'stroke-width': w, opacity: o }));
  }
  // falling stars, each with the streak it left on the way down
  for (const [x, y, a, lean] of [[128, 318, 21, 0.34], [594, 286, 27, -0.3], [574, 446, 11, -0.26], [108, 486, 13, 0.3], [236, 262, 9, 0.3], [486, 244, 8, -0.28], [634, 610, 9, -0.2], [84, 650, 8, 0.24]]) {
    const len = a * 6.5;
    art.push(el('path', { d: ribbon([[x, y], [x + lean * len * 0.5, y - len * 0.5], [x + lean * len, y - len]], a * 0.34, 0.4), fill: s.lin([[0, '#f6fffd', 0.85], [1, '#bdf6ff', 0]], x, y, x + lean * len, y - len, true) }));
    art.push(fallen(s, x, y, a));
  }
  // the sea: three swells with pearl crests, and the stars that have already drowned beneath them
  const seas = [
    { y: 746, amp: 15, wl: 232, ph: 0.6, top: '#35c4c6', bot: '#125a9e', o: 0.96 },
    { y: 792, amp: 17, wl: 268, ph: 2.9, top: '#1c88bc', bot: '#14308a', o: 0.98 },
    { y: 838, amp: 14, wl: 214, ph: 4.4, top: '#17509e', bot: '#191866', o: 1 },
  ];
  const sea = [];
  seas.forEach((w, i) => {
    const pts = [];
    for (let x = 20; x <= 700; x += 8) pts.push([x, swell(x, w)]);
    const crest = poly(pts);
    sea.push(el('path', { d: crest + `L700 930L20 930Z`, fill: s.lin([[0, w.top], [1, w.bot]], 0, w.y - w.amp, 0, w.y + 110, true), opacity: w.o }));
    sea.push(el('path', { d: crest, fill: 'none', stroke: '#fbfffb', 'stroke-width': 3, opacity: 0.92, 'stroke-linejoin': 'round' }));
    sea.push(el('path', { d: crest, fill: 'none', stroke: '#b9fff1', 'stroke-width': 1.2, opacity: 0.55, transform: 'translate(0 8)' }));
    sea.push(el('path', { d: crest, fill: 'none', stroke: '#b9fff1', 'stroke-width': 0.9, opacity: 0.3, transform: 'translate(0 15)' }));
    if (i === 2) sea.push(g({ 'clip-path': s.clip(el('path', { d: crest + `L700 930L20 930Z` })) }, seigaiha(46, w.y + 2, 674, 900, 26, '#c9fff4', 0.34)));
    if (i === 1) for (const [x, y, a] of [[168, 842, 7], [548, 836, 6]]) sea.push(fallen(s, x, y, a, 0.6));
  });
  for (const [x, y, a] of [[118, 874, 8], [262, 882, 5], [404, 876, 7], [520, 884, 5], [622, 872, 8]]) sea.push(fallen(s, x, y, a, 0.75));

  // the medallion: a dark pool ringed in pearl
  const med = [];
  med.push(el('circle', { cx: CX, cy: CY + 5, r: MR + 6, fill: '#030a30', opacity: 0.45, filter: 'url(#glow8)' }));
  med.push(el('circle', { cx: CX, cy: CY, r: MR, fill: s.rad([[0, '#2a6cc0'], [0.5, '#143583'], [0.85, '#0b1552'], [1, '#080d3c']]) }));
  med.push(rays(s, CX, CY, 0, MR, 24, 0.5, '#7fdcff', 0.13));
  const pearlRing = s.lin([[0, '#ffffff'], [0.28, '#ffe9f4'], [0.5, '#e2fff8'], [0.72, '#f1ecff'], [1, '#b9c0ee']], CX - MR, CY - MR, CX + MR, CY + MR, true);
  med.push(el('circle', { cx: CX, cy: CY, r: MR, fill: 'none', stroke: '#0a1648', 'stroke-width': 13 }));
  med.push(el('circle', { cx: CX, cy: CY, r: MR, fill: 'none', stroke: pearlRing, 'stroke-width': 10 }));
  med.push(el('circle', { cx: CX, cy: CY, r: MR - 2.4, fill: 'none', stroke: '#ffffff', 'stroke-width': 1.6, opacity: 0.8 }));
  med.push(el('circle', { cx: CX, cy: CY, r: MR - 13, fill: 'none', stroke: '#f6d27a', 'stroke-width': 1.4, opacity: 0.85 }));
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * TAU;
    med.push(el('circle', { cx: CX + Math.cos(a) * (MR - 21), cy: CY + Math.sin(a) * (MR - 21), r: i % 5 === 0 ? 2.6 : 1.3, fill: '#eafff8', opacity: i % 5 === 0 ? 0.95 : 0.6 }));
  }
  const sg = sigil(s, { cx: CX, cy: CY, size: 296 });
  med.push(el('path', { d: sg.sil, fill: '#6ff0e6', opacity: 0.55, filter: 'url(#glow16)' }));
  med.push(sg.markup);

  s.add(1, g({ 'clip-path': clip }, [
    g({ 'clip-path': printClip }, art),
    g({ 'clip-path': printClip }, med.slice(0, 1)),
  ]));
  s.add(2, g({ 'clip-path': clip }, [g({}, med.slice(1)), g({ 'clip-path': printClip }, sea)]));
  // the printed frame
  s.add(2, el('rect', { x: 46, y: 196, width: 628, height: 700, rx: 24, fill: 'none', stroke: '#06123f', 'stroke-width': 5, opacity: 0.5 }));
  s.add(2, el('rect', { x: 46, y: 196, width: 628, height: 700, rx: 24, fill: 'none', stroke: s.lin([[0, '#ffffff'], [0.35, '#ffe3f1'], [0.6, '#cffff3'], [1, '#c9c4ff']]), 'stroke-width': 3 }));
  s.add(2, el('rect', { x: 54, y: 204, width: 612, height: 684, rx: 18, fill: 'none', stroke: '#eafffb', 'stroke-width': 1, opacity: 0.6 }));

  // ---- 3: the foil's own surface — pillow shading, sheen, wrinkles, the crimped seals, the tear line
  s.add(3, g({ 'clip-path': clip }, foilSurface(s, r)));
  // the sigil is spot-varnished: it keeps most of its own colour under the film's reflections
  s.add(3, g({ opacity: 0.5 }, sg.markup));
  s.add(3, tearLine());
}

// ------------------------------------------------------------------------------------------------ the pouch

/** The pouch outline: pinked (zig-zag) ends, sides drawn in slightly by the pillowing, a tear notch at each side. */
function packOutline() {
  const pts = [], teeth = 56, tw = (R - L) / teeth, td = 6.5;
  const side = (y) => 4.5 * Math.sin(Math.PI * Math.max(0, Math.min(1, (y - T - SEAL) / (B - T - 2 * SEAL))));
  for (let i = 0; i < teeth; i++) { pts.push([L + tw * i, T + td], [L + tw * (i + 0.5), T]); }
  pts.push([R, T + td]);
  pts.push([R, TEAR - 6], [R - 7, TEAR], [R, TEAR + 6]);
  for (let y = TEAR + 20; y <= B - SEAL; y += 20) pts.push([R - side(y), y]);
  pts.push([R, B - td]);
  for (let i = teeth - 1; i >= 0; i--) { pts.push([L + tw * (i + 0.5), B], [L + tw * i, B - td]); }
  for (let y = B - SEAL; y >= TEAR + 20; y -= 20) pts.push([L + side(y), y]);
  pts.push([L, TEAR + 6], [L + 7, TEAR], [L, TEAR - 6]);
  return poly(pts, true);
}

function tearLine() {
  // 24 dashes of 18 with gaps of 10, centred: 29 .. 691
  return g({}, [
    el('path', { d: `M29 ${TEAR + 1.2}H691`, stroke: '#04103a', 'stroke-width': 2.4, 'stroke-dasharray': '18 10', opacity: 0.35, fill: 'none' }),
    el('path', { d: `M29 ${TEAR}H691`, stroke: '#f2fffd', 'stroke-width': 2.4, 'stroke-dasharray': '18 10', opacity: 0.9, fill: 'none' }),
  ]);
}

function foilSurface(s, r) {
  const m = [];
  const y0 = T + SEAL, y1 = B - SEAL;
  // pillowing: the body swells away from the seals and the side edges
  m.push(el('rect', { x: 0, y: y0, width: W, height: y1 - y0, fill: s.lin([[0, '#020a2c', 0.5], [0.07, '#020a2c', 0.12], [0.16, '#ffffff', 0.1], [0.3, '#ffffff', 0], [0.78, '#020a2c', 0], [0.93, '#020a2c', 0.2], [1, '#020a2c', 0.55]]) }));
  m.push(el('rect', { x: 0, y: y0, width: W, height: y1 - y0, fill: s.lin([[0, '#020a2c', 0.6], [0.06, '#020a2c', 0.18], [0.14, '#020a2c', 0], [0.86, '#020a2c', 0], [0.94, '#020a2c', 0.22], [1, '#020a2c', 0.65]], 0, 0, 1, 0) }));
  // long soft vertical highlights of metallised film
  m.push(el('rect', { x: 0, y: T, width: W, height: B - T, fill: s.lin([[0, '#fff', 0], [0.16, '#fff', 0], [0.235, '#fff', 0.16], [0.262, '#fff', 0.5], [0.285, '#fff', 0.14], [0.4, '#fff', 0], [0.68, '#fff', 0], [0.77, '#fff', 0.12], [0.803, '#fff', 0.34], [0.825, '#fff', 0.06], [1, '#fff', 0]], 0, 0, 1, 0) }));
  m.push(el('rect', { x: 0, y: T, width: W, height: B - T, fill: s.lin([[0, '#020a2c', 0], [0.1, '#020a2c', 0.16], [0.2, '#020a2c', 0], [0.3, '#020a2c', 0], [0.36, '#020a2c', 0.16], [0.48, '#020a2c', 0], [0.6, '#020a2c', 0], [0.7, '#020a2c', 0.14], [0.76, '#020a2c', 0], [0.84, '#020a2c', 0], [0.89, '#020a2c', 0.16], [1, '#020a2c', 0]], 0, 0, 1, 0) }));
  m.push(el('rect', { x: 0, y: y0, width: W, height: y1 - y0, fill: s.lin([[0, '#ff9ad8', 0], [0.3, '#ff9ad8', 0.16], [0.45, '#fff0b0', 0.14], [0.6, '#8fffe6', 0.16], [1, '#8fffe6', 0]], 0.1, 0, 0.9, 1) }));
  // wrinkles: stretched noise read as the room reflected in rumpled film — where it runs high a white veil, where it
  // runs low a blue-black one, and nothing in between, so flat foil stays exactly as printed
  const veil = (seed, fx, fy, gain, light) => {
    const id = s.uid('wr'), k = gain, c = -gain * 0.56;
    const row = light ? `0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${k} 0 0 0 ${c}` : `0 0 0 0 0.01  0 0 0 0 0.03  0 0 0 0 0.16  ${-k} 0 0 0 ${k * 0.46}`;
    s.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${fx} ${fy}" numOctaves="3" seed="${seed}"/><feColorMatrix type="matrix" values="${row}"/><feComposite in2="SourceAlpha" operator="in"/></filter>`);
    return `url(#${id})`;
  };
  for (const [seed, fx, fy, gain, o] of [[11, 0.0085, 0.0016, 6, 0.2], [5, 0.024, 0.0045, 4, 0.12]]) {
    m.push(el('rect', { x: L, y: y0, width: R - L, height: y1 - y0, fill: '#fff', filter: veil(seed, fx, fy, gain, true), opacity: o }));
    m.push(el('rect', { x: L, y: y0, width: R - L, height: y1 - y0, fill: '#fff', filter: veil(seed, fx, fy, gain, false), opacity: o * 1.1 }));
  }
  // pinch creases fanning out of each seal
  const creases = [];
  for (const [ys, sgn] of [[y0, 1], [y1, -1]]) {
    for (let i = 0; i < 13; i++) {
      const x = L + 34 + (R - L - 68) * (i + r.range(0.2, 0.8)) / 13, len = r.range(34, 96), lean = (360 - x) * 0.06 + r.range(-6, 6);
      const pts = [[x, ys], [x + lean * 0.5, ys + sgn * len * 0.5], [x + lean, ys + sgn * len]];
      creases.push(el('path', { d: ribbon(pts, r.range(4, 7), 0.3), fill: '#ffffff', opacity: 0.24 }));
      creases.push(el('path', { d: ribbon(pts.map((p) => [p[0] + 3.5, p[1]]), r.range(4, 7), 0.3), fill: '#020a2c', opacity: 0.32 }));
    }
  }
  m.push(g({ filter: s.blur(1.3) }, creases));

  // the heat seals: flat, ribbed, a little paler
  const rib = s.uid('rb'), ribG = s.uid('rbg');
  s.def(`<linearGradient id="${ribG}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#021040" stop-opacity="0.36"/><stop offset="0.45" stop-color="#ffffff" stop-opacity="0.42"/><stop offset="0.8" stop-color="#ffffff" stop-opacity="0.05"/><stop offset="1" stop-color="#021040" stop-opacity="0.36"/></linearGradient><pattern id="${rib}" width="7" height="40" patternUnits="userSpaceOnUse" x="20.5"><rect width="7" height="40" fill="url(#${ribG})"/></pattern>`);
  for (const [ya, yb, inner] of [[T, y0, y0], [y1, B, y1]]) {
    m.push(el('rect', { x: 0, y: ya, width: W, height: yb - ya, fill: '#bff7f0', opacity: 0.12 }));
    m.push(el('rect', { x: 0, y: ya, width: W, height: yb - ya, fill: `url(#${rib})` }));
    m.push(el('rect', { x: 0, y: ya, width: W, height: yb - ya, fill: s.lin([[0, '#fff', 0], [0.2, '#fff', 0.18], [0.3, '#fff', 0.42], [0.38, '#fff', 0.1], [0.7, '#fff', 0], [0.8, '#fff', 0.26], [0.86, '#fff', 0.04], [1, '#fff', 0]], 0, 0, 1, 0) }));
    // the seal's inner edge: a pressed line, and the two fine bars heat-sealers leave
    const d = inner === y0 ? -1 : 1;
    m.push(el('rect', { x: 0, y: inner - 1.5, width: W, height: 3, fill: '#021040', opacity: 0.5 }));
    m.push(el('rect', { x: 0, y: inner - 1.5 - d * 3, width: W, height: 1.4, fill: '#ffffff', opacity: 0.55 }));
    m.push(el('rect', { x: 0, y: inner + d * 18 - 1, width: W, height: 2, fill: '#021040', opacity: 0.22 }));
    m.push(el('rect', { x: 0, y: inner + d * 18 + 1, width: W, height: 1.2, fill: '#ffffff', opacity: 0.3 }));
    m.push(el('rect', { x: 0, y: inner + d * 82 - 1, width: W, height: 2, fill: '#021040', opacity: 0.22 }));
    m.push(el('rect', { x: 0, y: inner + d * 82 + 1, width: W, height: 1.2, fill: '#ffffff', opacity: 0.3 }));
  }
  // a bright cut edge all round
  m.push(el('path', { d: packOutline(), fill: 'none', stroke: '#eaffff', 'stroke-width': 2, opacity: 0.5 }));
  return m;
}

// ------------------------------------------------------------------------------------------------ motifs

function swell(x, w) {
  const p = (x / w.wl) * TAU + w.ph, c = 0.5 + 0.5 * Math.sin(p);
  return w.y - w.amp * (2 * Math.pow(c, 1.7) - 1) + 4 * Math.sin(p * 2.3 + 1);
}

/** n wedge-shaped rays around (cx, cy) from r0 to r1, each `frac` of its slot wide, fading outward. */
function rays(s, cx, cy, r0, r1, n, frac, color, opacity, rot = 0) {
  const parts = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * TAU, da = (TAU / n) * frac / 2;
    parts.push(el('path', { d: poly([[cx + Math.cos(a - da) * r0, cy + Math.sin(a - da) * r0], [cx + Math.cos(a - da) * r1, cy + Math.sin(a - da) * r1], [cx + Math.cos(a + da) * r1, cy + Math.sin(a + da) * r1], [cx + Math.cos(a + da) * r0, cy + Math.sin(a + da) * r0]], true) }));
  }
  const f0 = Math.min(0.98, r0 / r1);
  return g({ fill: s.rad([[0, color, 1], [f0, color, 1], [1, color, 0]], cx, cy, r1, true), opacity }, parts);
}

/** Seigaiha: rows of overlapping concentric arcs (the classic wave-scale pattern) over a rectangle. */
function seigaiha(x0, y0, x1, y1, rr, color, opacity) {
  const parts = [];
  let row = 0;
  for (let y = y0; y < y1 + rr; y += rr * 0.5, row++) {
    for (let x = x0 - rr + (row % 2 ? rr : 0); x < x1 + rr; x += rr * 2) {
      // each scale hides what is behind it, so only its own arcs show: draw three upper half-rings
      for (const k of [1, 0.68, 0.36]) parts.push(`M${(x - rr * k).toFixed(1)} ${y.toFixed(1)}A${(rr * k).toFixed(1)} ${(rr * k).toFixed(1)} 0 0 1 ${(x + rr * k).toFixed(1)} ${y.toFixed(1)}`);
    }
  }
  return el('path', { d: parts.join(''), fill: 'none', stroke: color, 'stroke-width': 1.1, opacity });
}

/** A small printed four-point star with a halo. */
function fallen(s, x, y, a, opacity = 1) {
  return g({ opacity }, [
    el('circle', { cx: x, cy: y, r: a * 1.1, fill: '#aefcff', opacity: 0.45, filter: 'url(#glow4)' }),
    el('path', { d: starPath(x, y, a, 0.12), fill: '#fffdf0' }),
    el('path', { d: starPath(x, y, a * 0.45, 0.1), fill: '#fffdf0', opacity: 0.8, transform: `rotate(45 ${x} ${y})` }),
  ]);
}

// ------------------------------------------------------------------------------------------------ the sigil
// The shell is a spiral that winds in onto a round eye: rad(t) = rho + (1 - rho) * G^(t / 2pi), t <= 0, so every
// whorl is G times narrower than the one outside it and the innermost coils hug the eye where the star sits.
// Everything is sized in "unit" space (outer lip radius = 1) so the sigil scales cleanly.

function sigil(s, o) {
  const { cx, cy, size, rot = -0.42, dir = -1, G = 3.0, rho = 0.26, body = 1.02, step = Math.PI / 6 } = o;
  const tints = o.tints || ['#ffb4dc', '#ffe2a0', '#98efe0', '#c4b8ff', '#ffc4b0', '#a4e0ff'];
  const sheenK = o.sheen ?? 0.62;
  const eyeStops = o.eye || [[0, '#2468b4'], [0.4, '#102c74'], [0.82, '#070d3c'], [1, '#03041c']];
  const TAU = Math.PI * 2, k = Math.log(G) / TAU;
  const rad = (t) => rho + (1 - rho) * Math.exp(k * t);
  const U = (t, rr) => [rr * Math.cos(dir * t + rot), rr * Math.sin(dir * t + rot)];
  const lipBow = 0.05, bow = step * 0.36;

  // silhouette (unit space), then fit its box to `size` around (cx, cy)
  const silU = [];
  const lipAt = (u) => { const t = -lipBow * Math.sin(Math.PI * u), a = rad(t), b = rad(t - TAU); return U(t, a + (b - a) * u); };
  const tipT = -0.085, tipU = 0.09;
  for (let i = 0; i <= 200; i++) { const t = -TAU + (TAU + tipT) * i / 200; silU.push(U(t, rad(t))); }
  { // the lip's outer corner, rounded off
    const a = U(tipT, rad(tipT)), c = U(0, rad(0)), b = lipAt(tipU);
    for (let i = 1; i <= 10; i++) { const q = i / 10, w = 1 - q; silU.push([w * w * a[0] + 2 * w * q * c[0] + q * q * b[0], w * w * a[1] + 2 * w * q * c[1] + q * q * b[1]]); }
  }
  for (let i = 1; i < 24; i++) silU.push(lipAt(tipU + (1 - tipU) * i / 24));
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const p of silU) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  const sc = size / Math.max(x1 - x0, y1 - y0);
  const tx = cx - sc * (x0 + x1) / 2, ty = cy - sc * (y0 + y1) / 2;
  const P = (p) => [tx + sc * p[0], ty + sc * p[1]];
  const sil = poly(silU.map(P), true);
  const pole = P([0, 0]);
  const px = sc / 259;                                    // 1 "design pixel" (the sigil was drawn at 512)

  // insets, in unit space
  const rim = 9.5 / 259, wall = 8 / 259, sep = 3.4 / 259;
  const mOut = (t) => { const f = Math.max(0, Math.min(1, (t + TAU) / 0.5 + 0.5)); return wall / 2 + (rim - wall / 2) * f; };
  const mIn = wall / 2;

  // one chamber, between boundary a (aperture side) and b (apex side)
  function cell(ta, bowA, ga, tb, bowB, gb) {
    const pts = [];
    const at = (t0, bw, u, sgn, gp) => {
      const t = t0 - bw * Math.sin(Math.PI * u);
      const ri = rad(t - TAU) + mIn, ro = rad(t) - mOut(t), rr = ri + (ro - ri) * u;
      return U(t + sgn * gp / rr, rr);
    };
    for (let i = 0; i <= 14; i++) pts.push(at(ta, bowA, i / 14, -1, ga));
    const f0 = ta - ga / (rad(ta) - mOut(ta)), f1 = tb + gb / (rad(tb) - mOut(tb));
    const n = Math.max(2, Math.ceil((f0 - f1) / 0.035));
    for (let i = 1; i < n; i++) { const t = f0 + (f1 - f0) * i / n; pts.push(U(t, rad(t) - mOut(t))); }
    for (let i = 14; i >= 0; i--) pts.push(at(tb, bowB, i / 14, 1, gb));
    const e0 = tb + gb / (rad(tb - TAU) + mIn), e1 = ta - ga / (rad(ta - TAU) + mIn);
    for (let i = 1; i < n; i++) { const t = e0 + (e1 - e0) * i / n; pts.push(U(t, rad(t - TAU) + mIn)); }
    // soften the four corners so each chamber is a rounded inlay
    const wpx = (rad(tb) - rad(tb - TAU)) * sc, d = Math.min(8 * px, wpx * 0.2);
    return roundCorners(pts.map(P), [[0, d], [14, ga === rim ? 15 * px : d], [14 + n, d], [28 + n, d]]);
  }
  const bounds = [[0, lipBow, rim]];
  for (let t = -body; ; t -= step) {
    if (rad(t) - rad(t - TAU) < 19 / 259) break;
    bounds.push([t, bow, sep]);
  }
  const midR = (t) => (rad(t) + rad(t - TAU)) / 2;
  const cells = [];
  for (let i = 0; i + 1 < bounds.length; i++) {
    const a = bounds[i], b = bounds[i + 1];
    const pts = cell(a[0], a[1], a[2], b[0], b[1], b[2]);
    cells.push({ d: poly(pts, true), front: P(U(a[0], midR(a[0]))), back: P(U(b[0], midR(b[0]))) });
  }
  const tEnd = bounds[bounds.length - 1][0];
  /** a strip of whorl from t0 to t1, between fractions f0..f1 of the way from the inner wall to the outer */
  const band = (t0, t1, f0, f1) => {
    const A = [], B = [], n = Math.ceil(Math.abs(t1 - t0) / 0.04);
    for (let i = 0; i <= n; i++) {
      const t = t0 + (t1 - t0) * i / n, ri = rad(t - TAU), w = rad(t) - ri;
      A.push(P(U(t, ri + w * f0))); B.push(P(U(t, ri + w * f1)));
    }
    return poly(A.concat(B.reverse()), true);
  };

  const m = [];
  const box = { x: cx - size / 2 - 20, y: cy - size / 2 - 20, width: size + 40, height: size + 40 };

  // --- gold bed: the rim, the walls between whorls and chambers, the solid inner coil
  const gold = s.lin([[0, '#fff6cf'], [0.22, '#f6cf6a'], [0.5, '#c98d2b'], [0.78, '#f3c860'], [1, '#8a5516']], box.x, box.y, box.x + box.width, box.y + box.height, true);
  m.push(el('path', { d: sil, fill: '#2a1604', stroke: '#2a1604', 'stroke-width': 3 * px, 'stroke-linejoin': 'round' }));
  // (only the gold that will show between the chambers is kept, so the emboss can round every wire)
  const wires = s.mask([el('path', { d: sil, fill: '#fff' }), ...cells.map((c) => el('path', { d: c.d, fill: '#000' }))]);
  const silClip = s.clip(el('path', { d: sil }));
  m.push(g({ filter: s.emboss({ color: '#fff7d0', az: 225, elev: 50, depth: 4 * px, k: 0.75, exp: 14, blur: 1.5 * px }) }, g({ mask: wires }, [
    el('path', { d: sil, fill: gold }),
    el('path', { d: sil, fill: 'none', stroke: '#6a3d0c', 'stroke-width': 2.4 * px, opacity: 0.5 }),
  ])));
  m.push(g({ 'clip-path': silClip, mask: wires }, [
    el('ellipse', { cx: cx - size * 0.22, cy: cy - size * 0.26, rx: size * 0.34, ry: size * 0.2, fill: '#fffbe6', opacity: 0.6, filter: s.blur(16 * px) }),
    el('ellipse', { cx: cx + size * 0.24, cy: cy + size * 0.3, rx: size * 0.36, ry: size * 0.2, fill: '#5c300a', opacity: 0.5, filter: s.blur(16 * px) }),
    el('path', { d: sil, fill: 'none', stroke: s.lin([[0, '#ffffff', 0.95], [0.5, '#ffffff', 0.15], [1, '#ffffff', 0]], box.x, box.y, box.x + box.width, box.y + box.height, true), 'stroke-width': 3.2 * px }),
  ]));

  // --- the pearl chambers
  const cellParts = [], clipParts = [];
  cells.forEach((c, i) => {
    clipParts.push(el('path', { d: c.d }));
    const fill = s.lin([[0, '#fffefa'], [0.45, '#f6f1ee'], [1, tints[i % tints.length]]], c.front[0], c.front[1], c.back[0], c.back[1], true);
    cellParts.push(el('path', { d: c.d, fill }));
  });
  const cellClip = s.clip(clipParts);
  m.push(g({ filter: s.emboss({ color: '#ffffff', az: 225, elev: 42, depth: 7 * px, k: 1.0, exp: 16, blur: 3 * px }) }, cellParts));
  // nacre: every whorl is a rounded tube (shade at the walls, light along the crown), with bands of colour drifting
  // across it, growth lines in the living chamber, a broad highlight and a cool shade away from the light
  const sheen = s.lin([[0, '#ff7fc0', 0], [0.18, '#ff7fc0', 0.6], [0.36, '#ffd97a', 0.5], [0.56, '#5fe6d4', 0.6], [0.78, '#9a8fff', 0.55], [1, '#9a8fff', 0]], box.x, box.y + box.height * 0.15, box.x + box.width, box.y + box.height * 0.85, true);
  const growth = [];
  for (let t = -0.14; t > -body + 0.1; t -= 0.125) {
    const pts = [];
    for (let i = 0; i <= 12; i++) { const u = i / 12, tt = t - (lipBow + 0.05) * Math.sin(Math.PI * u), ri = rad(tt - TAU); pts.push(P(U(tt, ri + (rad(tt) - ri) * u))); }
    growth.push(el('path', { d: poly(pts), fill: 'none', stroke: '#ffffff', 'stroke-width': 1.6 * px, opacity: 0.55 }));
    growth.push(el('path', { d: poly(pts), fill: 'none', stroke: '#7d74c8', 'stroke-width': 1.2 * px, opacity: 0.28, transform: `translate(${1.6 * px} ${1.2 * px})` }));
  }
  m.push(g({ 'clip-path': cellClip }, [
    el('rect', { ...box, fill: sheen, opacity: sheenK }),
    el('path', { d: band(tEnd - 0.2, 0.1, -0.05, 0.2), fill: '#3f3aa6', opacity: 0.42, filter: s.blur(6 * px) }),
    el('path', { d: band(tEnd - 0.2, 0.1, 0.86, 1.05), fill: '#5a4cb4', opacity: 0.32, filter: s.blur(6 * px) }),
    g({}, growth),
    el('path', { d: band(tEnd - 0.2, 0.1, 0.5, 0.72), fill: '#ffffff', opacity: 0.6, filter: s.blur(7 * px) }),
    el('rect', { ...box, fill: s.rad([[0, '#ffffff', 0.7], [0.4, '#ffffff', 0.2], [1, '#ffffff', 0]], cx - size * 0.22, cy - size * 0.3, size * 0.45, true) }),
    el('rect', { ...box, fill: s.rad([[0, '#2c2f8e', 0.55], [0.6, '#5a4fb0', 0.18], [1, '#5a4fb0', 0]], cx + size * 0.3, cy + size * 0.38, size * 0.55, true) }),
    el('ellipse', { cx: cx + size * 0.08, cy: cy + size * 0.345, rx: size * 0.3, ry: size * 0.055, fill: '#74f2e0', opacity: 0.6, filter: s.blur(8 * px), transform: `rotate(-22 ${cx} ${cy})` }),
    el('ellipse', { cx: cx + size * 0.36, cy: cy - size * 0.02, rx: size * 0.05, ry: size * 0.2, fill: '#ff9fd6', opacity: 0.42, filter: s.blur(9 * px), transform: `rotate(14 ${cx + size * 0.36} ${cy})` }),
  ]));
  // a crisp edge to every chamber so the inlay looks set into the gold
  m.push(g({ fill: 'none', stroke: '#5a3408', 'stroke-width': 1.1 * px, opacity: 0.55 }, cells.map((c) => el('path', { d: c.d }))));

  // --- the eye of deep water and the star
  const eyeR = (rad(tEnd - TAU * 0.5) - wall * 0.35) * sc * 0.93;
  const [ex, ey] = pole;
  m.push(el('circle', { cx: ex, cy: ey, r: eyeR + 3.4 * px, fill: '#3b2206' }));
  m.push(el('circle', { cx: ex, cy: ey, r: eyeR + 2.4 * px, fill: gold }));
  m.push(el('circle', { cx: ex, cy: ey, r: eyeR + 1.3 * px, fill: 'none', stroke: s.lin([[0, '#fffbe6', 0.95], [0.45, '#fffbe6', 0.1], [0.7, '#5c300a', 0.35], [1, '#5c300a', 0.5]], ex - eyeR, ey - eyeR, ex + eyeR, ey + eyeR, true), 'stroke-width': 1.5 * px }));
  m.push(el('circle', { cx: ex, cy: ey, r: eyeR, fill: s.rad(eyeStops, ex, ey, eyeR, true) }));
  m.push(el('circle', { cx: ex, cy: ey, r: eyeR - 1.5 * px, fill: 'none', stroke: '#01020c', 'stroke-width': 3 * px, opacity: 0.65 }));
  for (const [a, d, r] of [[0.7, 0.62, 1.3], [2.3, 0.7, 1], [3.7, 0.58, 1.5], [5.4, 0.72, 1.1], [1.5, 0.78, 0.8], [4.6, 0.8, 0.9]]) {
    m.push(el('circle', { cx: ex + Math.cos(a) * eyeR * d, cy: ey + Math.sin(a) * eyeR * d, r: r * px, fill: '#bfefff', opacity: 0.8 }));
  }
  m.push(star(s, ex, ey, eyeR * 0.93, px));

  return { markup: g({}, m), sil, pole, eyeR, sc };
}

/** Round off corners of a closed polygon: `corners` is [[index, px], ...]; each corner is replaced by a smooth
 *  turn that starts about `px` before it and ends about `px` after it. */
function roundCorners(pts, corners) {
  const n = pts.length, skip = new Array(n).fill(false), arcAfter = new Map();
  const dist = (a, b) => Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1]);
  for (const [i, d] of corners) {
    let ia = i, ib = i, acc = 0, guard = 0;
    while (acc < d && guard++ < n / 3) { const j = (ia - 1 + n) % n; acc += dist(ia, j); ia = j; }
    acc = 0; guard = 0;
    while (acc < d && guard++ < n / 3) { const j = (ib + 1) % n; acc += dist(ib, j); ib = j; }
    for (let j = (ia + 1) % n; j !== ib; j = (j + 1) % n) skip[j] = true;
    const a = pts[ia], c = pts[i], b = pts[ib], arc = [];
    for (let q = 1; q < 8; q++) { const u = q / 8, w = 1 - u; arc.push([w * w * a[0] + 2 * w * u * c[0] + u * u * b[0], w * w * a[1] + 2 * w * u * c[1] + u * u * b[1]]); }
    arcAfter.set(ia, arc);
  }
  const out = [];
  for (let j = 0; j < n; j++) { if (!skip[j]) out.push(pts[j]); if (arcAfter.has(j)) out.push(...arcAfter.get(j)); }
  return out;
}

function starPath(x, y, a, k = 0.105) {
  const q = a * k;
  return `M${x} ${y - a}C${x + q} ${y - q} ${x + q} ${y - q} ${x + a} ${y}C${x + q} ${y + q} ${x + q} ${y + q} ${x} ${y + a}C${x - q} ${y + q} ${x - q} ${y + q} ${x - a} ${y}C${x - q} ${y - q} ${x - q} ${y - q} ${x} ${y - a}Z`;
}

function star(s, x, y, a, px = 1) {
  return g({}, [
    el('circle', { cx: x, cy: y, r: a * 0.5, fill: '#58dcff', opacity: 0.5, filter: s.blur(8 * px) }),
    el('path', { d: starPath(x, y, a), fill: '#ffd97a', opacity: 0.9, filter: s.blur(3 * px) }),
    el('path', { d: starPath(x, y, a * 0.5, 0.05), fill: '#fff6d0', opacity: 0.85, transform: `rotate(45 ${x} ${y})` }),
    el('path', { d: starPath(x, y, a), fill: s.rad([[0, '#ffffff'], [0.28, '#fffbe2'], [0.7, '#ffdf86'], [1, '#ffbf3c']], x, y, a, true), stroke: '#8a520c', 'stroke-width': 0.7 * px, 'stroke-linejoin': 'round' }),
    el('circle', { cx: x, cy: y, r: a * 0.13, fill: '#fff', filter: s.blur(1.4 * px) }),
  ]);
}
