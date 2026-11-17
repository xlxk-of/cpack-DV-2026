// CARD BACK — a deep indigo field of wave-scales, a gold border of rolling waves with a pearl set in every corner,
// and at the centre the NACRE sigil in a pearl-rimmed medallion laid over a great four-point star.
// Everything but the sigil itself is built for one quarter and mirrored, so the back is symmetric both ways.
import { el, g, poly, ribbon } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;
export const noThumb = true;
export const size = [750, 1050];

const W = 750, H = 1050, CX = 375, CY = 525, TAU = Math.PI * 2;
const FIELD = 92;                                             // the field starts this far in from every edge
const GOLD_STOPS = [[0, '#a8721e'], [0.12, '#f3cd72'], [0.25, '#b98426'], [0.38, '#ffeaa8'], [0.5, '#d6a03a'], [0.62, '#ffeaa8'], [0.75, '#b98426'], [0.88, '#f3cd72'], [1, '#a8721e']];

/** Draw `inner` four times: as is, and mirrored left-right, top-bottom, and both. */
const four = (inner) => g({}, [
  g({}, inner),
  g({ transform: `translate(${W} 0) scale(-1 1)` }, inner),
  g({ transform: `translate(0 ${H}) scale(1 -1)` }, inner),
  g({ transform: `translate(${W} ${H}) scale(-1 -1)` }, inner),
]);

export function build(s) {
  const gold = s.lin(GOLD_STOPS, 0, 0, W, 0, true);
  const goldV = s.lin([[0, '#fff', 0], [0.2, '#fff', 0.3], [0.35, '#3a1c04', 0.2], [0.5, '#fff', 0.3], [0.65, '#3a1c04', 0.2], [0.8, '#fff', 0.3], [1, '#fff', 0]], 0, 0, 0, H, true);
  const rr = (inset, rx, attrs) => el('rect', { x: inset, y: inset, width: W - 2 * inset, height: H - 2 * inset, rx, fill: 'none', ...attrs });

  // ---- 0: the field
  s.backdrop('#050824');
  s.add(0, el('rect', { x: 0, y: 0, width: W, height: H, fill: s.rad([[0, '#2532a0'], [0.35, '#191c7a'], [0.7, '#100d52'], [1, '#080830']], CX, CY, 640, true) }));
  const fieldClip = s.clip(el('rect', { x: FIELD, y: FIELD, width: W - 2 * FIELD, height: H - 2 * FIELD, rx: 12 }));
  const scales = seigaihaHalf(30);
  s.add(0, g({ 'clip-path': fieldClip }, [g({}, scales), g({ transform: `translate(0 ${H}) scale(1 -1)` }, scales)]));
  s.add(0, el('rect', { x: 0, y: 0, width: W, height: H, fill: s.rad([[0, '#5fe0e8', 0.3], [0.32, '#3f8cf0', 0.1], [0.6, '#02030f', 0], [1, '#02030f', 0.62]], CX, CY, 640, true) }));

  // ---- 1: the border
  const b = [];
  // everything outside the field: a dark margin, then the enamel band the waves run in
  b.push(el('path', { d: `M0 0H${W}V${H}H0Z` + roundRect(FIELD, FIELD, W - 2 * FIELD, H - 2 * FIELD, 12), 'fill-rule': 'evenodd', fill: '#050823' }));
  b.push(rr(60, 24, { stroke: s.lin([[0, '#0a2a5e'], [0.5, '#0f4c80'], [1, '#0a2a5e']], 0, 0, W, 0, true), 'stroke-width': 46 }));
  b.push(rr(60, 24, { stroke: s.lin([[0, '#02030f', 0.5], [0.5, '#02030f', 0], [1, '#02030f', 0.5]], 0, 0, 0, H, true), 'stroke-width': 46 }));
  b.push(rr(16, 34, { stroke: '#8fa6ff', 'stroke-width': 1, opacity: 0.22 }));
  for (const [inset, rx, w] of [[33.5, 38, 5], [83.5, 15, 2], [88.5, 13, 4.5]]) {
    b.push(rr(inset, rx, { stroke: '#150a02', 'stroke-width': w + 2.4, opacity: 0.75 }));
    b.push(rr(inset, rx, { stroke: gold, 'stroke-width': w }));
    b.push(rr(inset, rx, { stroke: goldV, 'stroke-width': w }));
  }
  b.push(rr(39.5, 34, { stroke: gold, 'stroke-width': 1.2, opacity: 0.9 }));
  s.add(1, g({}, b));

  // one quarter of the ornament (top-left), mirrored into the other three
  const q = [];
  // rolling waves along the band: each rises from the inner line and curls over toward the middle of its side
  const band = 41, BH = 40, waveFill = gold;
  const waves = [];
  const topU = (CX - 24 - 114) / 5, leftU = (CY - 24 - 114) / 8;
  for (let k = 0; k < 5; k++) waves.push(...waveUnit(114 + k * topU, topU, BH).map((w) => ({ ...w, pts: w.pts.map(([a, c]) => [a, band + c]) })));
  for (let k = 0; k < 8; k++) waves.push(...waveUnit(114 + k * leftU, leftU, BH).map((w) => ({ ...w, pts: w.pts.map(([a, c]) => [band + c, a]) })));
  for (const w of waves) {
    if (w.dot) q.push(el('circle', { cx: w.pts[0][0], cy: w.pts[0][1], r: w.dot, fill: waveFill }));
    else q.push(el('path', { d: ribbon(w.pts, w.w0, w.w1, null, 4), fill: waveFill, stroke: '#1a0c02', 'stroke-width': 0.5, 'stroke-opacity': 0.5 }));
  }
  // a scallop-shell fan in each corner of the field
  q.push(shellFan(s, FIELD + 2, FIELD + 2, 122, gold));
  // small stars, scattered
  for (const [dx, dy, a] of [[-118, -318, 9], [-170, -238, 6], [-246, -168, 6], [-62, -392, 5], [-232, -76, 7], [-150, -150, 4], [-52, -262, 4]]) q.push(tinyStar(CX + dx, CY + dy, a));
  s.add(1, four(q));

  // corner studs and the smaller pearls at the middle of each side (lit alike, so not mirrored top-to-bottom)
  const studs = [];
  for (const [x, y] of [[61, 61], [W - 61, 61], [61, H - 61], [W - 61, H - 61]]) studs.push(stud(s, x, y, 15.5, gold, 40));
  for (const [x, y] of [[CX, 61], [CX, H - 61], [61, CY], [W - 61, CY]]) studs.push(stud(s, x, y, 9, gold, 23));
  s.add(1, g({}, studs));

  // ---- 2: the medallion
  const m = [];
  // the great star behind it
  m.push(el('ellipse', { cx: CX, cy: CY, rx: 300, ry: 330, fill: s.rad([[0, '#8ff0ff', 0.4], [0.5, '#5aa8ff', 0.14], [1, '#5aa8ff', 0]]) }));
  { // a string of gold beads around it
    const beads = [];
    for (let i = 0; i < 96; i++) { const a = i / 96 * TAU; beads.push(el('circle', { cx: CX + Math.cos(a) * 219, cy: CY + Math.sin(a) * 219, r: i % 2 ? 1.5 : 2.3 })); }
    m.push(g({ fill: '#f3cd72' }, beads));
  }
  const bigStar = starPath4(CX, CY, 262, 356, 0.16), midStar = starPathX(CX, CY, 262, 0.2);
  m.push(el('path', { d: midStar, fill: '#0e3a78', stroke: '#150a02', 'stroke-width': 4.4, opacity: 0.9 }));
  m.push(el('path', { d: midStar, fill: 'none', stroke: gold, 'stroke-width': 2 }));
  m.push(el('path', { d: bigStar, fill: s.rad([[0, '#2ab0c0'], [0.62, '#147a9c'], [1, '#0d3f78']], CX, CY, 350, true), stroke: '#150a02', 'stroke-width': 6 }));
  m.push(el('path', { d: bigStar, fill: 'none', stroke: gold, 'stroke-width': 3.4 }));
  m.push(el('path', { d: starPath4(CX, CY, 232, 318, 0.145), fill: 'none', stroke: gold, 'stroke-width': 1.1, opacity: 0.8 }));
  m.push(el('circle', { cx: CX, cy: CY, r: 203, fill: 'none', stroke: '#150a02', 'stroke-width': 3.4, opacity: 0.6 }), el('circle', { cx: CX, cy: CY, r: 203, fill: 'none', stroke: gold, 'stroke-width': 1.6 }));
  // rings: gold, a band of mother-of-pearl, gold, then the dark pool
  const R0 = 190;
  m.push(el('circle', { cx: CX, cy: CY, r: R0 + 10, fill: '#02030f', opacity: 0.65, filter: 'url(#glow8)' }));
  m.push(el('circle', { cx: CX, cy: CY, r: R0 + 3, fill: '#150a02' }));
  m.push(el('circle', { cx: CX, cy: CY, r: R0, fill: gold }));
  m.push(el('circle', { cx: CX, cy: CY, r: R0, fill: goldV }));
  const nacre = s.lin([[0, '#ffd9ec'], [0.14, '#ffffff'], [0.3, '#c4fff0'], [0.42, '#fff3cf'], [0.5, '#e9e0ff'], [0.58, '#fff3cf'], [0.7, '#c4fff0'], [0.86, '#ffffff'], [1, '#ffd9ec']], 0, CY - R0, 0, CY + R0, true);
  m.push(el('circle', { cx: CX, cy: CY, r: R0 - 6, fill: '#3b2206' }));
  m.push(el('circle', { cx: CX, cy: CY, r: R0 - 7, fill: nacre }));
  m.push(el('circle', { cx: CX, cy: CY, r: R0 - 7, fill: s.lin([[0, '#a9b8ff', 0.5], [0.22, '#7ff0e0', 0.25], [0.5, '#ff9fd0', 0.34], [0.78, '#7ff0e0', 0.25], [1, '#a9b8ff', 0.5]], CX - R0, 0, CX + R0, 0, true) }));
  m.push(el('circle', { cx: CX, cy: CY, r: R0 - 9, fill: 'none', stroke: '#6a5cb8', 'stroke-width': 5, opacity: 0.4, filter: 'url(#glow2)' }));
  m.push(el('circle', { cx: CX, cy: CY, r: R0 - 25, fill: 'none', stroke: '#6a5cb8', 'stroke-width': 5, opacity: 0.45, filter: 'url(#glow2)' }));
  m.push(el('circle', { cx: CX, cy: CY, r: R0 - 15.5, fill: 'none', stroke: '#ffffff', 'stroke-width': 4.5, opacity: 0.75, filter: 'url(#glow2)' }));
  m.push(el('circle', { cx: CX, cy: CY, r: R0 - 27, fill: '#3b2206' }));
  m.push(el('circle', { cx: CX, cy: CY, r: R0 - 28, fill: gold }));
  m.push(el('circle', { cx: CX, cy: CY, r: R0 - 28, fill: goldV }));
  m.push(el('circle', { cx: CX, cy: CY, r: R0 - 32, fill: '#150a02' }));
  const PR = R0 - 33;
  m.push(el('circle', { cx: CX, cy: CY, r: PR, fill: s.rad([[0, '#2a62c4'], [0.5, '#14328a'], [0.85, '#0a1552'], [1, '#060b38']], CX, CY, PR, true) }));
  const spokes = [];
  for (let i = 0; i < 48; i++) {
    const a = (i + 0.5) / 48 * TAU, da = TAU / 48 * 0.22;
    spokes.push(poly([[CX + Math.cos(a - da) * 40, CY + Math.sin(a - da) * 40], [CX + Math.cos(a - da) * PR, CY + Math.sin(a - da) * PR], [CX + Math.cos(a + da) * PR, CY + Math.sin(a + da) * PR], [CX + Math.cos(a + da) * 40, CY + Math.sin(a + da) * 40]], true));
  }
  m.push(el('path', { d: spokes.join(''), fill: '#8fd0ff', opacity: 0.1 }));
  m.push(el('circle', { cx: CX, cy: CY, r: PR - 2, fill: 'none', stroke: '#02030f', 'stroke-width': 5, opacity: 0.5 }));
  for (let i = 0; i < 72; i++) {
    const a = i / 72 * TAU, big = i % 6 === 0;
    m.push(el('circle', { cx: CX + Math.cos(a) * (PR - 11), cy: CY + Math.sin(a) * (PR - 11), r: big ? 2.6 : 1.2, fill: big ? '#ffeaa8' : '#e2b24c', opacity: big ? 1 : 0.75 }));
  }
  const sg = sigil(s, { cx: CX, cy: CY, size: 246 });
  m.push(el('path', { d: sg.sil, fill: '#5fe6e0', opacity: 0.45, filter: 'url(#glow16)' }));
  m.push(sg.markup);
  s.add(2, g({}, m));
}

// ------------------------------------------------------------------------------------------------ pieces

function roundRect(x, y, w, h, r) {
  return `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
}

/** Seigaiha (overlapping wave-scales) for the top half of the card, built up from the middle line; each scale is
 *  hidden where the scales in front of it (nearer the middle) lie over it. Mirrored for the bottom half. */
function seigaihaHalf(rr) {
  const outer = [], inner = [];
  const arc = (x, y, rad, front) => {
    let a0 = null, a1 = null;
    for (let deg = 180; deg <= 360; deg += 1.5) {
      const a = deg * Math.PI / 180, px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
      if (front.every(([fx, fy]) => Math.hypot(px - fx, py - fy) >= rr - 0.01)) { if (a0 === null) a0 = a; a1 = a; }
    }
    if (a0 === null || a1 - a0 < 0.05) return '';
    return `M${(x + Math.cos(a0) * rad).toFixed(1)} ${(y + Math.sin(a0) * rad).toFixed(1)}A${rad.toFixed(1)} ${rad.toFixed(1)} 0 0 1 ${(x + Math.cos(a1) * rad).toFixed(1)} ${(y + Math.sin(a1) * rad).toFixed(1)}`;
  };
  for (let j = 0; CY - j * rr / 2 > FIELD - rr; j++) {
    const y = CY - j * rr / 2;
    for (let k = -8; k <= 8; k++) {
      const x = CX + (j % 2 ? rr : 0) + k * rr * 2;
      if (x < FIELD - rr || x > W - FIELD + rr) continue;
      const front = [];
      if (j >= 1) front.push([x - rr, y + rr / 2], [x + rr, y + rr / 2]);
      if (j >= 2) front.push([x, y + rr]);
      outer.push(arc(x, y, rr, front));
      inner.push(arc(x, y, rr * 0.7, front), arc(x, y, rr * 0.4, front));
    }
  }
  return [
    el('path', { d: outer.join(''), fill: 'none', stroke: '#7fb4ff', 'stroke-width': 1.5, opacity: 0.42 }),
    el('path', { d: inner.join(''), fill: 'none', stroke: '#7fa0ff', 'stroke-width': 1, opacity: 0.24 }),
  ];
}

/** One rolling wave of the border, in band coordinates (a along the band, c across it: 0 outer edge, bh inner). */
function waveUnit(a0, u, bh) {
  const cc = [a0 + u * 0.56, bh * 0.46], r0 = bh * 0.36;
  const pts = [[a0 - u * 0.2, bh - 1], [a0 + u * 0.02, bh - 3.5], [cc[0] - r0 * 1.12, cc[1] + r0 * 0.62]];
  let last = null;
  for (let ph = Math.PI; ph <= Math.PI + 7.4; ph += 0.35) {
    const rad = r0 * Math.exp(-0.2 * (ph - Math.PI));
    last = [cc[0] + Math.cos(ph) * rad, cc[1] + Math.sin(ph) * rad];
    pts.push(last);
  }
  return [{ pts, w0: 6, w1: 1.6 }, { pts: [last], dot: 2.5 }];
}

/** A scallop shell opened into the corner at (x, y): ribs fanning through a quarter turn, a scalloped rim. */
function shellFan(s, x, y, R, gold) {
  const n = 6, parts = [];
  const at = (a, rad) => [x + Math.cos(a) * rad, y + Math.sin(a) * rad];
  let d = `M${x} ${y}L${x + R} ${y}`;
  for (let i = 0; i < n; i++) {
    const a1 = (i + 1) / n * Math.PI / 2, am = (i + 0.5) / n * Math.PI / 2;
    const c = at(am, R * 1.13), e = at(a1, R);
    d += `Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${e[0].toFixed(1)} ${e[1].toFixed(1)}`;
  }
  d += 'Z';
  parts.push(el('path', { d, fill: s.rad([[0, '#23a0b4'], [0.55, '#126a94'], [1, '#0c356e']], x, y, R * 1.1, true), stroke: '#150a02', 'stroke-width': 4.6, 'stroke-linejoin': 'round' }));
  parts.push(el('path', { d, fill: 'none', stroke: gold, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }));
  let ribs = '';
  for (let i = 1; i < n; i++) { const a = i / n * Math.PI / 2, p0 = at(a, 30), p1 = at(a, R); ribs += `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`; }
  parts.push(el('path', { d: ribs, fill: 'none', stroke: gold, 'stroke-width': 1.3, opacity: 0.9 }));
  for (const [rad, w] of [[30, 2], [R * 0.62, 0.9]]) parts.push(el('path', { d: `M${x + rad} ${y}A${rad} ${rad} 0 0 1 ${x} ${y + rad}`, fill: 'none', stroke: gold, 'stroke-width': w, opacity: rad === 30 ? 1 : 0.6 }));
  parts.push(el('path', { d: `M${x} ${y}H${x + 30}A30 30 0 0 1 ${x} ${y + 30}Z`, fill: gold, opacity: 0.9 }));
  return g({}, parts);
}

/** A pearl in a gold bezel sitting on a small four-point gold star; `tip` is the star's reach. */
function stud(s, x, y, r, gold, tip) {
  return g({}, [
    el('path', { d: starPath(x, y, tip, 0.2), fill: '#150a02', stroke: '#150a02', 'stroke-width': 2.4 }),
    el('path', { d: starPath(x, y, tip, 0.2), fill: gold }),
    el('path', { d: starPathX(x, y, tip * 0.62, 0.24), fill: '#150a02', stroke: '#150a02', 'stroke-width': 2.4 }),
    el('path', { d: starPathX(x, y, tip * 0.62, 0.24), fill: gold }),
    el('circle', { cx: x, cy: y, r: r + 5, fill: '#150a02' }),
    el('circle', { cx: x, cy: y, r: r + 3.8, fill: gold }),
    el('circle', { cx: x, cy: y, r: r + 0.9, fill: '#3b2206' }),
    el('circle', { cx: x, cy: y, r, fill: s.rad([[0, '#ffffff'], [0.35, '#f6eef4'], [0.7, '#cfc6ea'], [1, '#8a86c6']], x, y - r * 0.35, r * 1.35, true) }),
    el('circle', { cx: x, cy: y, r, fill: s.lin([[0, '#ff9fd0', 0], [0.42, '#ff9fd0', 0.32], [0.62, '#7ff0e0', 0.4], [1, '#7ff0e0', 0]], 0, y - r, 0, y + r, true) }),
    el('ellipse', { cx: x, cy: y + r * 0.62, rx: r * 0.55, ry: r * 0.2, fill: '#9ff5ff', opacity: 0.5 }),
    el('ellipse', { cx: x, cy: y - r * 0.5, rx: r * 0.42, ry: r * 0.24, fill: '#ffffff', opacity: 0.95 }),
  ]);
}

function tinyStar(x, y, a) {
  return g({}, [
    el('circle', { cx: x, cy: y, r: a * 1.1, fill: '#ffe7a6', opacity: 0.25, filter: 'url(#glow4)' }),
    el('path', { d: starPath(x, y, a, 0.14), fill: '#ffeebc' }),
  ]);
}

/** A four-point star turned 45 degrees (drawn turned, not rotated by a transform, so its gradient stays put). */
function starPathX(x, y, a, k = 0.2) {
  const t = a * Math.SQRT1_2, q = a * k * Math.SQRT2;
  const tips = [[x + t, y - t], [x + t, y + t], [x - t, y + t], [x - t, y - t]];
  const ctr = [[x + q, y], [x, y + q], [x - q, y], [x, y - q]];
  let d = `M${tips[3][0]} ${tips[3][1]}`;
  for (let i = 0; i < 4; i++) { const c = ctr[(i + 3) % 4], e = tips[i]; d += `C${c[0]} ${c[1]} ${c[0]} ${c[1]} ${e[0]} ${e[1]}`; }
  return d + 'Z';
}

/** A four-point star with different reach across (ax) and up-down (ay). */
function starPath4(x, y, ax, ay, k = 0.12) {
  const qx = ax * k, qy = ay * k;
  return `M${x} ${y - ay}C${x + qx} ${y - qy} ${x + qx} ${y - qy} ${x + ax} ${y}C${x + qx} ${y + qy} ${x + qx} ${y + qy} ${x} ${y + ay}C${x - qx} ${y + qy} ${x - qx} ${y + qy} ${x - ax} ${y}C${x - qx} ${y - qy} ${x - qx} ${y - qy} ${x} ${y - ay}Z`;
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
