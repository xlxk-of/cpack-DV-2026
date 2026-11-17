// ABYSSAL PACK — the premium booster: black-violet foil with an oil-slick bloom of magenta, teal and gold, gold-foil
// seals and trim, and the NACRE sigil ablaze inside a corona of rays. Same pouch and tear line (y = 150) as the Tide Pack.
import { el, g, poly, ribbon } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;
export const noThumb = true;
export const size = [720, 1040];
export const transparent = true;

const W = 720, H = 1040, L = 20, R = 700, T = 20, B = 1020, SEAL = 100, TEAR = 150, TAU = Math.PI * 2;
const GOLD = [[0, '#fff6cf'], [0.2, '#f3c860'], [0.42, '#b9801f'], [0.6, '#ffe9a6'], [0.8, '#d39a30'], [1, '#8a5516']];

export function build(s) {
  const r = s.r;
  const outline = packOutline();
  const clip = s.clip(el('path', { d: outline }));
  const CX = 360, CY = 536, MR = 188;                       // the medallion
  const FX = 46, FY = 196, FW = 628, FH = 700;              // the printed frame
  const gold = s.lin(GOLD, 0, 180, 720, 920, true);

  // ---- 0: the foil itself: near-black violet with oil on it
  s.add(0, el('path', { d: outline, fill: '#01010a', opacity: 0.55, filter: s.blur(6), transform: 'translate(0 3)' }));
  s.add(0, el('path', { d: outline, fill: s.lin([[0, '#1c0e3a'], [0.12, '#120828'], [0.5, '#07031a'], [0.88, '#0e0624'], [1, '#180b30']], 0, T, 0, B, true) }));
  s.add(0, g({ 'clip-path': clip }, oilSlick(s, r)));

  // ---- 1: what is printed on it
  const printClip = s.clip(el('rect', { x: FX, y: FY, width: FW, height: FH, rx: 24 }));
  const art = [];
  art.push(el('circle', { cx: CX, cy: CY, r: 340, fill: s.rad([[0, '#ff7ad9', 0.5], [0.5, '#8a4dff', 0.24], [1, '#2b1a80', 0]]) }));
  // the corona: long and short spikes of gold light, and hair-thin white ones between
  art.push(rays(s, CX, CY, MR, 500, 48, 0.5, '#ffd98a', 0.06));
  art.push(el('circle', { cx: CX, cy: CY, r: MR + 46, fill: '#ffcf70', opacity: 0.55, filter: 'url(#glow32)' }));
  art.push(spikes(s, CX, CY, MR + 4, 64, (i) => (i % 8 === 0 ? 178 : i % 4 === 0 ? 132 : i % 2 === 0 ? 92 : 58), 0.34, [[0, '#fffbe6', 1], [0.35, '#ffd774', 0.95], [1, '#ff9d3c', 0]]));
  art.push(spikes(s, CX, CY, MR + 4, 64, (i) => (i % 2 ? 150 : 0), 0.07, [[0, '#ffffff', 1], [1, '#ffffff', 0]], TAU / 128));
  for (const [rr, o, w] of [[MR + 26, 0.75, 1.5], [MR + 34, 0.4, 1]]) art.push(el('circle', { cx: CX, cy: CY, r: rr, fill: 'none', stroke: '#ffe7a6', 'stroke-width': w, opacity: o }));
  // falling stars
  for (const [x, y, a, lean] of [[122, 312, 19, 0.34], [600, 290, 24, -0.3], [596, 470, 10, -0.26], [112, 500, 12, 0.3], [226, 250, 9, 0.3], [498, 240, 8, -0.28], [640, 650, 9, -0.2], [82, 668, 8, 0.24]]) {
    const len = a * 6.5;
    art.push(el('path', { d: ribbon([[x, y], [x + lean * len * 0.5, y - len * 0.5], [x + lean * len, y - len]], a * 0.34, 0.4), fill: s.lin([[0, '#fff3c4', 0.9], [1, '#ff9be0', 0]], x, y, x + lean * len, y - len, true) }));
    art.push(fallen(s, x, y, a));
  }
  // the sea, drawn in gold line on the dark: three swells and the stars under them
  const seas = [
    { y: 752, amp: 15, wl: 232, ph: 0.6, top: '#24104e', bot: '#0b0520', o: 1 },
    { y: 798, amp: 17, wl: 268, ph: 2.9, top: '#1a0b3c', bot: '#08031a', o: 1 },
    { y: 842, amp: 14, wl: 214, ph: 4.4, top: '#12072c', bot: '#060212', o: 1 },
  ];
  const sea = [];
  seas.forEach((w, i) => {
    const pts = [];
    for (let x = 20; x <= 700; x += 8) pts.push([x, swell(x, w)]);
    const crest = poly(pts), body = crest + 'L700 930L20 930Z';
    sea.push(el('path', { d: body, fill: s.lin([[0, w.top], [1, w.bot]], 0, w.y - w.amp, 0, w.y + 110, true), opacity: w.o }));
    sea.push(g({ 'clip-path': s.clip(el('path', { d: body })) }, [
      el('path', { d: crest, fill: 'none', stroke: ['#ff6fd0', '#3fe6d2', '#ffcf6a'][i], 'stroke-width': 30, opacity: 0.42, filter: 'url(#glow8)' }),
      i === 2 ? seigaiha(FX, w.y + 2, FX + FW, 900, 26, '#f3c860', 0.42) : '',
    ]));
    sea.push(el('path', { d: crest, fill: 'none', stroke: gold, 'stroke-width': 3.2, 'stroke-linejoin': 'round' }));
    sea.push(el('path', { d: crest, fill: 'none', stroke: '#ffe7a6', 'stroke-width': 1.1, opacity: 0.6, transform: 'translate(0 8)' }));
    sea.push(el('path', { d: crest, fill: 'none', stroke: '#ffe7a6', 'stroke-width': 0.9, opacity: 0.32, transform: 'translate(0 15)' }));
    if (i === 1) for (const [x, y, a] of [[168, 848, 7], [548, 842, 6]]) sea.push(fallen(s, x, y, a, 0.7));
  });
  for (const [x, y, a] of [[118, 876, 8], [262, 884, 5], [404, 878, 7], [520, 886, 5], [622, 874, 8]]) sea.push(fallen(s, x, y, a, 0.85));

  // the medallion: a well of night ringed in gold, the sigil burning in it
  const med = [];
  med.push(el('circle', { cx: CX, cy: CY, r: MR, fill: s.rad([[0, '#5a2aa8'], [0.45, '#2a1266'], [0.85, '#10062e'], [1, '#07031a']]) }));
  med.push(rays(s, CX, CY, 0, MR, 24, 0.5, '#ff9be8', 0.12));
  med.push(el('circle', { cx: CX, cy: CY, r: MR, fill: 'none', stroke: '#1a0c05', 'stroke-width': 14 }));
  med.push(el('circle', { cx: CX, cy: CY, r: MR, fill: 'none', stroke: s.lin(GOLD, CX - MR, CY - MR, CX + MR, CY + MR, true), 'stroke-width': 11 }));
  med.push(el('circle', { cx: CX, cy: CY, r: MR + 3.2, fill: 'none', stroke: '#fffbe0', 'stroke-width': 1.2, opacity: 0.85 }));
  med.push(el('circle', { cx: CX, cy: CY, r: MR - 3.4, fill: 'none', stroke: '#5c300a', 'stroke-width': 1.2, opacity: 0.7 }));
  med.push(el('circle', { cx: CX, cy: CY, r: MR - 14, fill: 'none', stroke: '#f6d27a', 'stroke-width': 1.4, opacity: 0.9 }));
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * TAU, big = i % 5 === 0;
    med.push(el('circle', { cx: CX + Math.cos(a) * (MR - 22), cy: CY + Math.sin(a) * (MR - 22), r: big ? 2.7 : 1.3, fill: big ? '#fff3c4' : '#f3c860', opacity: big ? 1 : 0.7 }));
  }
  const sg = sigil(s, { cx: CX, cy: CY, size: 286, tints: ['#ff9fdc', '#ffdf8a', '#7df2e0', '#b9a4ff', '#ffb0a0', '#8adcff'], sheen: 0.8, eye: [[0, '#6a2fc0'], [0.4, '#2d1278'], [0.82, '#0f0638'], [1, '#05021a']] });
  med.push(el('path', { d: sg.sil, fill: '#ff8fe0', opacity: 0.7, filter: 'url(#glow32)' }));
  med.push(el('path', { d: sg.sil, fill: '#fff0c0', opacity: 0.85, filter: 'url(#glow16)' }));
  med.push(el('path', { d: sg.sil, fill: '#ffffff', opacity: 0.8, filter: 'url(#glow4)' }));
  med.push(sg.markup);

  // the printed frame, in gold, with a bracket and a star in each corner
  const frame = [], orn = [];
  frame.push(el('rect', { x: FX, y: FY, width: FW, height: FH, rx: 24, fill: 'none', stroke: '#120804', 'stroke-width': 8, opacity: 0.7 }));
  frame.push(el('rect', { x: FX, y: FY, width: FW, height: FH, rx: 24, fill: 'none', stroke: gold, 'stroke-width': 5 }));
  frame.push(el('rect', { x: FX + 9, y: FY + 9, width: FW - 18, height: FH - 18, rx: 17, fill: 'none', stroke: gold, 'stroke-width': 1.4 }));
  for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const x = sx > 0 ? FX : FX + FW, y = sy > 0 ? FY : FY + FH;
    orn.push(el('path', { d: `M${x + sx * 21} ${y + sy * 96}V${y + sy * 44}Q${x + sx * 21} ${y + sy * 21} ${x + sx * 44} ${y + sy * 21}H${x + sx * 96}`, fill: 'none', stroke: gold, 'stroke-width': 2.2, 'stroke-linecap': 'round' }));
    orn.push(el('circle', { cx: x + sx * 21, cy: y + sy * 104, r: 2.6, fill: '#ffe7a6' }), el('circle', { cx: x + sx * 104, cy: y + sy * 21, r: 2.6, fill: '#ffe7a6' }));
    orn.push(fallen(s, x + sx * 46, y + sy * 46, 11));
  }
  s.add(1, g({ 'clip-path': clip }, g({ 'clip-path': printClip }, art)));
  s.add(2, g({ 'clip-path': clip }, [g({}, med), g({}, orn), g({ 'clip-path': printClip }, sea)]));
  s.add(2, g({}, frame));

  // ---- 3: the foil's own surface
  s.add(3, g({ 'clip-path': clip }, foilSurface(s, r)));
  s.add(3, g({ opacity: 0.62 }, sg.markup));
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
    el('path', { d: `M29 ${TEAR + 1.2}H691`, stroke: '#000000', 'stroke-width': 2.4, 'stroke-dasharray': '18 10', opacity: 0.5, fill: 'none' }),
    el('path', { d: `M29 ${TEAR}H691`, stroke: '#fff4d0', 'stroke-width': 2.4, 'stroke-dasharray': '18 10', opacity: 0.92, fill: 'none' }),
  ]);
}

/** Oil on dark foil: nested rings of cycling colour around a few centres (thin-film fringes), blurred into each
 *  other, then stirred by a displacement so they marble. */
function oilSlick(s, r) {
  const id = s.uid('oil');
  s.def(`<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="7" result="b"/><feTurbulence type="fractalNoise" baseFrequency="0.0046 0.0038" numOctaves="2" seed="23" result="n"/><feDisplacementMap in="b" in2="n" scale="210" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.5"/></filter>`);
  const cols = ['#ff2fb0', '#ffb43c', '#12e2c8', '#3a2aa8', '#0a0420', '#0a0420', '#5a1c9a'];
  const parts = [];
  const pools = [[100, 330, 300, 0], [640, 470, 290, 2], [170, 830, 280, 3], [600, 900, 260, 1], [400, 150, 250, 4], [360, 640, 240, 2]];
  for (const [x, y, R0, c0] of pools) {
    const rings = [];
    let i = 0;
    for (let rr = 14; rr < R0; rr += 17, i++) rings.push(el('ellipse', { cx: x, cy: y, rx: rr, ry: rr * 0.82, fill: 'none', stroke: cols[(c0 + i) % cols.length], 'stroke-width': 18 }));
    const fade = s.mask(el('circle', { cx: x, cy: y, r: R0, fill: s.rad([[0, '#fff', 1], [0.5, '#fff', 0.75], [1, '#fff', 0]]) }));
    parts.push(g({ mask: fade, transform: `rotate(${r.range(-40, 40).toFixed(1)} ${x} ${y})` }, rings));
  }
  return [g({ filter: `url(#${id})`, opacity: 0.46 }, parts)];
}

function foilSurface(s, r) {
  const m = [];
  const y0 = T + SEAL, y1 = B - SEAL;
  // the heat seals: flat gold foil (laid over the dark film), ribbed
  const rib = s.uid('rb'), ribG = s.uid('rbg');
  s.def(`<linearGradient id="${ribG}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#2a1203" stop-opacity="0.5"/><stop offset="0.45" stop-color="#fffbe0" stop-opacity="0.5"/><stop offset="0.8" stop-color="#ffffff" stop-opacity="0.05"/><stop offset="1" stop-color="#2a1203" stop-opacity="0.5"/></linearGradient><pattern id="${rib}" width="7" height="40" patternUnits="userSpaceOnUse" x="20.5"><rect width="7" height="40" fill="url(#${ribG})"/></pattern>`);
  const sealGold = s.lin([[0, '#8a5516'], [0.1, '#d9a23a'], [0.24, '#fff3c0'], [0.34, '#e2ad44'], [0.5, '#a8701c'], [0.66, '#e9b84e'], [0.78, '#fff0b4'], [0.88, '#c98d2b'], [1, '#7a4a12']], L, 0, R, 0, true);
  // pillowing: the body swells away from the seals and the side edges
  m.push(el('rect', { x: 0, y: y0, width: W, height: y1 - y0, fill: s.lin([[0, '#000', 0.6], [0.07, '#000', 0.15], [0.16, '#fff', 0.1], [0.3, '#fff', 0], [0.78, '#000', 0], [0.93, '#000', 0.22], [1, '#000', 0.6]]) }));
  m.push(el('rect', { x: 0, y: y0, width: W, height: y1 - y0, fill: s.lin([[0, '#000', 0.65], [0.06, '#000', 0.2], [0.14, '#000', 0], [0.86, '#000', 0], [0.94, '#000', 0.24], [1, '#000', 0.7]], 0, 0, 1, 0) }));
  // long soft vertical highlights of metallised film, bright beside dark
  m.push(el('rect', { x: 0, y: y0, width: W, height: y1 - y0, fill: s.lin([[0, '#fff', 0], [0.16, '#fff', 0], [0.235, '#e9d8ff', 0.14], [0.262, '#fff', 0.46], [0.285, '#e9d8ff', 0.12], [0.4, '#fff', 0], [0.68, '#fff', 0], [0.77, '#e9d8ff', 0.1], [0.803, '#fff', 0.3], [0.825, '#fff', 0.05], [1, '#fff', 0]], 0, 0, 1, 0) }));
  m.push(el('rect', { x: 0, y: y0, width: W, height: y1 - y0, fill: s.lin([[0, '#000', 0], [0.1, '#000', 0.2], [0.2, '#000', 0], [0.3, '#000', 0], [0.36, '#000', 0.2], [0.48, '#000', 0], [0.6, '#000', 0], [0.7, '#000', 0.18], [0.76, '#000', 0], [0.84, '#000', 0], [0.89, '#000', 0.2], [1, '#000', 0]], 0, 0, 1, 0) }));
  m.push(el('rect', { x: 0, y: y0, width: W, height: y1 - y0, fill: s.lin([[0, '#ff5ac8', 0], [0.28, '#ff5ac8', 0.2], [0.45, '#ffd66a', 0.18], [0.62, '#3ff0d8', 0.2], [1, '#3ff0d8', 0]], 0.1, 0, 0.9, 1) }));
  // wrinkles: stretched noise read as the room reflected in rumpled film — a pale veil where it runs high, a black
  // one where it runs low, nothing in between
  const veil = (seed, fx, fy, gain, light) => {
    const id = s.uid('wr'), k = gain, c = -gain * 0.56;
    const row = light ? `0 0 0 0 1  0 0 0 0 0.94  0 0 0 0 1  ${k} 0 0 0 ${c}` : `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0.04  ${-k} 0 0 0 ${k * 0.46}`;
    s.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${fx} ${fy}" numOctaves="3" seed="${seed}"/><feColorMatrix type="matrix" values="${row}"/><feComposite in2="SourceAlpha" operator="in"/></filter>`);
    return `url(#${id})`;
  };
  for (const [seed, fx, fy, gain, o] of [[31, 0.0085, 0.0016, 6, 0.2], [8, 0.024, 0.0045, 4, 0.13]]) {
    m.push(el('rect', { x: L, y: y0, width: R - L, height: y1 - y0, fill: '#fff', filter: veil(seed, fx, fy, gain, true), opacity: o }));
    m.push(el('rect', { x: L, y: y0, width: R - L, height: y1 - y0, fill: '#fff', filter: veil(seed, fx, fy, gain, false), opacity: o * 1.2 }));
  }
  // pinch creases fanning out of each seal
  const creases = [];
  for (const [ys, sgn] of [[y0, 1], [y1, -1]]) {
    for (let i = 0; i < 13; i++) {
      const x = L + 34 + (R - L - 68) * (i + r.range(0.2, 0.8)) / 13, len = r.range(34, 96), lean = (360 - x) * 0.06 + r.range(-6, 6);
      const pts = [[x, ys], [x + lean * 0.5, ys + sgn * len * 0.5], [x + lean, ys + sgn * len]];
      creases.push(el('path', { d: ribbon(pts, r.range(4, 7), 0.3), fill: '#f3e6ff', opacity: 0.22 }));
      creases.push(el('path', { d: ribbon(pts.map((p) => [p[0] + 3.5, p[1]]), r.range(4, 7), 0.3), fill: '#000', opacity: 0.4 }));
    }
  }
  m.push(g({ filter: s.blur(1.3) }, creases));

  for (const [ya, yb, inner] of [[T, y0, y0], [y1, B, y1]]) {
    const d = inner === y0 ? -1 : 1;
    m.push(el('rect', { x: 0, y: ya, width: W, height: yb - ya, fill: sealGold }));
    m.push(el('rect', { x: 0, y: ya, width: W, height: yb - ya, fill: `url(#${rib})` }));
    m.push(el('rect', { x: 0, y: ya, width: W, height: yb - ya, fill: s.lin(d < 0 ? [[0, '#fff', 0.25], [0.5, '#fff', 0], [1, '#3a1c04', 0.3]] : [[0, '#3a1c04', 0.3], [0.5, '#fff', 0], [1, '#fff', 0.2]]) }));
    // the seal's inner edge: a pressed line, and the two fine bars heat-sealers leave
    m.push(el('rect', { x: 0, y: inner - 2, width: W, height: 4, fill: '#1a0c02', opacity: 0.75 }));
    m.push(el('rect', { x: 0, y: inner - 1.5 + d * 3.5, width: W, height: 1.4, fill: '#fffbe0', opacity: 0.7 }));
    for (const off of [18, 82]) {
      m.push(el('rect', { x: 0, y: inner + d * off - 1, width: W, height: 2, fill: '#3a1c04', opacity: 0.4 }));
      m.push(el('rect', { x: 0, y: inner + d * off + 1, width: W, height: 1.2, fill: '#fffbe0', opacity: 0.45 }));
    }
  }
  // a bright cut edge all round
  m.push(el('path', { d: packOutline(), fill: 'none', stroke: '#ffe9b0', 'stroke-width': 2, opacity: 0.5 }));
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

/** n needle spikes standing on the circle r0, `len(i)` long, each `frac` of its slot wide at the foot. */
function spikes(s, cx, cy, r0, n, len, frac, stops, rot = 0) {
  const parts = [];
  let maxLen = 0;
  for (let i = 0; i < n; i++) {
    const l = len(i);
    if (!l) continue;
    maxLen = Math.max(maxLen, l);
    const a = rot + (i / n) * TAU, da = (TAU / n) * frac / 2;
    parts.push(el('path', { d: poly([[cx + Math.cos(a - da) * r0, cy + Math.sin(a - da) * r0], [cx + Math.cos(a) * (r0 + l), cy + Math.sin(a) * (r0 + l)], [cx + Math.cos(a + da) * r0, cy + Math.sin(a + da) * r0]], true) }));
  }
  const rr = r0 + maxLen, f0 = r0 / rr;
  return g({ fill: s.rad([[0, stops[0][1], stops[0][2]], ...stops.map((st) => [f0 + (1 - f0) * st[0], st[1], st[2]])], cx, cy, rr, true) }, parts);
}

/** Seigaiha: rows of overlapping concentric arcs (the classic wave-scale pattern) over a rectangle. */
function seigaiha(x0, y0, x1, y1, rr, color, opacity) {
  const parts = [];
  let row = 0;
  for (let y = y0; y < y1 + rr; y += rr * 0.5, row++) {
    for (let x = x0 - rr + (row % 2 ? rr : 0); x < x1 + rr; x += rr * 2) {
      for (const k of [1, 0.68, 0.36]) parts.push(`M${(x - rr * k).toFixed(1)} ${y.toFixed(1)}A${(rr * k).toFixed(1)} ${(rr * k).toFixed(1)} 0 0 1 ${(x + rr * k).toFixed(1)} ${y.toFixed(1)}`);
    }
  }
  return el('path', { d: parts.join(''), fill: 'none', stroke: color, 'stroke-width': 1.1, opacity });
}

/** A small printed four-point star with a halo. */
function fallen(s, x, y, a, opacity = 1) {
  return g({ opacity }, [
    el('circle', { cx: x, cy: y, r: a * 1.2, fill: '#ffc86a', opacity: 0.5, filter: 'url(#glow4)' }),
    el('path', { d: starPath(x, y, a, 0.12), fill: '#fff6d6' }),
    el('path', { d: starPath(x, y, a * 0.45, 0.1), fill: '#fff6d6', opacity: 0.8, transform: `rotate(45 ${x} ${y})` }),
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
