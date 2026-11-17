// ARENA — the battle board's backdrop, seen from above: a round duelling ring of chunky stone tiles on the sea floor,
// sand round it. Everything loud (coral, shells, starfish, the amphora, the chest) keeps to the outer edges and
// corners; the middle stays calm, dark and low-contrast so cards and minions read on top of it.
import { el, g, spline, poly, ribbon, ink, stroke, flat, inkCircle, inkEllipse, star4, INK, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;
export const size = [1920, 1200];
export const noThumb = true;

const CX = 960, CY = 600, R0 = 730, R1 = 806, K = 0.64; // floor radius, kerb radius, how squashed the circle is
const TAU = Math.PI * 2;
const P = (rad, a) => [CX + rad * Math.cos(a), CY + rad * Math.sin(a) * K];
const arc = (rad, a0, a1, n = 20) => Array.from({ length: n + 1 }, (_, i) => P(rad, a0 + (a1 - a0) * i / n));
const wedge = (r0, r1, a0, a1, n = 20) => poly([...arc(r1, a0, a1, n), ...arc(r0, a1, a0, n)], true);
const ring = (rad) => poly(arc(rad, 0, TAU, 120), true);
const inRing = (x, y, rad) => ((x - CX) / rad) ** 2 + ((y - CY) / (rad * K)) ** 2 < 1;
const at = (x, y, rot, inner, sc = 1) => g({ transform: `translate(${x} ${y}) rotate(${rot}) scale(${sc})` }, inner);
const SHADOW = '#1d4d66';
const shadow = (x, y, rx, ry, rot = 0) => el('ellipse', { cx: x, cy: y, rx, ry, fill: SHADOW, transform: rot ? `rotate(${rot} ${x} ${y})` : undefined });

// ------------------------------------------------------------------------------------------------ the props

/** Branching tube coral growing from (x, y) towards `ang` (degrees, -90 is up). */
function coral(r, x, y, ang, len, w, fill, lite) {
  const segs = [], tips = [];
  const grow = (px, py, a, l, wd, depth) => {
    const ex = px + Math.cos(a) * l, ey = py + Math.sin(a) * l, bend = r.range(-0.25, 0.25);
    const mx = (px + ex) / 2 + Math.cos(a + 1.57) * l * bend, my = (py + ey) / 2 + Math.sin(a + 1.57) * l * bend;
    segs.push({ d: `M${px.toFixed(1)} ${py.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`, w: wd });
    if (depth <= 0) { tips.push([ex, ey, wd]); return; }
    const sp = r.range(0.38, 0.6);
    grow(ex, ey, a - sp, l * r.range(0.62, 0.8), wd * 0.84, depth - 1);
    grow(ex, ey, a + sp, l * r.range(0.62, 0.8), wd * 0.84, depth - 1);
  };
  grow(x, y, ang * Math.PI / 180, len, w, 2);
  return g({}, [
    ...segs.map((sg) => stroke(sg.d, { w: sg.w + W_INNER * 2 })),
    ...segs.map((sg) => stroke(sg.d, { w: sg.w, stroke: fill })),
    ...tips.map(([tx, ty, wd]) => el('circle', { cx: tx - wd * 0.12, cy: ty - wd * 0.12, r: wd * 0.24, fill: lite })),
  ]);
}

/** A lumpy mound of brain coral: a scalloped dome with squiggles on it. */
function mound(r, x, y, rx, ry, fill, shade, lite) {
  const pts = [], n = 16;
  for (let i = 0; i < n; i++) { const a = i / n * TAU, k = i % 2 ? 1.07 : 0.93; pts.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]); }
  const d = spline(pts, true, 6);
  const id = 'md' + Math.round(x) + '_' + Math.round(y);
  const sq = [];
  for (const [qx, qy, fl] of [[-0.45, -0.1, 1], [0.05, -0.4, -1], [0.4, 0.05, 1], [-0.1, 0.25, -1], [-0.5, 0.45, 1], [0.45, 0.5, -1]]) {
    const px = x + qx * rx, py = y + qy * ry, u = rx * 0.2;
    sq.push(`M${(px - u).toFixed(1)} ${py.toFixed(1)}q${(u * 0.5).toFixed(1)} ${(-u * 0.7 * fl).toFixed(1)} ${u.toFixed(1)} 0q${(u * 0.5).toFixed(1)} ${(u * 0.7 * fl).toFixed(1)} ${u.toFixed(1)} 0`);
  }
  return g({}, [ink(d, fill, { w: W_INNER }), `<clipPath id="${id}"><path d="${d}"/></clipPath>`,
    g({ 'clip-path': `url(#${id})` }, flat(`M${x - rx * 1.3} ${y + ry * 0.5}Q${x + rx * 0.2} ${y + ry * 0.7} ${x + rx * 0.6} ${y - ry * 1.3}L${x + rx * 1.4} ${y - ry * 1.3}L${x + rx * 1.4} ${y + ry * 1.4}L${x - rx * 1.3} ${y + ry * 1.4}Z`, shade)),
    stroke(sq.join(''), { w: W_DETAIL, stroke: INK, opacity: 0.75 }), stroke(d, { w: W_INNER }),
    el('ellipse', { cx: x - rx * 0.44, cy: y - ry * 0.56, rx: rx * 0.18, ry: ry * 0.1, fill: lite, transform: `rotate(-28 ${x - rx * 0.44} ${y - ry * 0.56})` })]);
}

/** A sea anemone from above: a ring of stubby arms round a mouth. */
function anemone(x, y, R, fill, shade) {
  const arms = [], n = 9;
  for (let i = 0; i < n; i++) { const a = i / n * TAU + 0.2; arms.push(inkEllipse(x + Math.cos(a) * R * 0.72, y + Math.sin(a) * R * 0.72, R * 0.42, R * 0.24, fill, { w: W_DETAIL + 1, rot: a * 180 / Math.PI })); }
  return g({}, [shadow(x + R * 0.12, y + R * 0.2, R * 1.1, R), ...arms, inkCircle(x, y, R * 0.5, shade, { w: W_DETAIL + 1 }), el('circle', { cx: x, cy: y, r: R * 0.16, fill: INK })]);
}

/** A cluster of tube sponges: fat stubby pipes with dark mouths. */
function sponge(x, y, sc, fill, shade) {
  const pipe = (px, h, w) => g({}, [
    ink(`M${px - w} ${-h}L${px - w * 0.86} 0Q${px} ${w * 0.4} ${px + w * 0.86} 0L${px + w} ${-h}Z`, fill, { w: W_INNER }),
    flat(`M${px + w * 0.2} ${-h}L${px + w} ${-h}L${px + w * 0.86} 0Q${px + w * 0.5} ${w * 0.2} ${px + w * 0.3} ${w * 0.14}Z`, shade),
    inkEllipse(px, -h, w, w * 0.42, INK, { w: W_INNER }), el('ellipse', { cx: px, cy: -h, rx: w * 0.8, ry: w * 0.28, fill: shade }),
  ]);
  return at(x, y, 0, [pipe(-44, 70, 30), pipe(44, 90, 32), pipe(0, 130, 36)], sc);
}

function starfish(x, y, R, rot, fill, shade) {
  const pts = [], dots = [];
  for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5, rad = i % 2 ? R * 0.46 : R; pts.push([x + Math.cos(a) * rad, y + Math.sin(a) * rad]); }
  for (let i = 0; i < 5; i++) { const a = rot + i * TAU / 5; for (const q of [0.32, 0.58]) dots.push(el('circle', { cx: x + Math.cos(a) * R * q, cy: y + Math.sin(a) * R * q, r: R * (q < 0.5 ? 0.075 : 0.055), fill: shade })); }
  return g({}, [shadow(x + R * 0.12, y + R * 0.16, R * 0.9, R * 0.8), ink(spline(pts, true, 8), fill, { w: W_INNER }), ...dots, el('circle', { cx: x, cy: y, r: R * 0.1, fill: '#fff', opacity: 0.85 })]);
}

/** A scallop shell: a fan with ribs, hinge at the bottom. */
function scallop(x, y, R, rot, fill, shade) {
  const pts = [[0, R * 0.62], [-R * 0.3, R * 0.5]];
  const n = 5, ribs = [];
  for (let i = 0; i <= n * 2; i++) { const a = Math.PI * (1.08 + 0.84 * i / (n * 2)), rad = i % 2 ? R * 1.06 : R * 0.92; pts.push([Math.cos(a) * rad, Math.sin(a) * rad * 0.95 + R * 0.1]); }
  pts.push([R * 0.3, R * 0.5]);
  for (let i = 1; i < n; i++) { const a = Math.PI * (1.08 + 0.84 * i / n); ribs.push(`M0 ${R * 0.5}L${(Math.cos(a) * R * 0.86).toFixed(1)} ${(Math.sin(a) * R * 0.82 + R * 0.1).toFixed(1)}`); }
  const d = spline(pts, true, 6);
  return g({}, [shadow(x + R * 0.12, y + R * 0.18, R, R * 0.8), at(x, y, rot, [ink(d, fill, { w: W_INNER }), stroke(ribs.join(''), { w: W_DETAIL, stroke: shade }), ink(`M${-R * 0.34} ${R * 0.46}L${R * 0.34} ${R * 0.46}L${R * 0.26} ${R * 0.72}L${-R * 0.26} ${R * 0.72}Z`, shade, { w: W_DETAIL + 1 })])]);
}

/** A snail-ish spiral shell. */
function spiral(x, y, R, rot, fill, shade) {
  const sp = [];
  for (let i = 0; i <= 40; i++) { const t = i / 40, a = t * TAU * 1.7, rad = R * 0.82 * (1 - t * 0.86); sp.push([Math.cos(a) * rad, Math.sin(a) * rad]); }
  return g({}, [shadow(x + R * 0.14, y + R * 0.2, R * 1.2, R * 0.9), at(x, y, rot, [
    ink(`M${R * 0.5} ${R * 0.5}L${R * 1.7} ${R * 0.34}L${R * 0.86} ${-R * 0.4}Z`, shade, { w: W_INNER }),
    inkCircle(0, 0, R, fill, { w: W_INNER }), flat(`M0 ${R}A${R} ${R} 0 0 0 ${R} 0A${R * 1.3} ${R * 1.3} 0 0 1 0 ${R}Z`, shade),
    stroke(poly(sp), { w: W_DETAIL + 1 }), el('circle', { cx: -R * 0.42, cy: -R * 0.5, r: R * 0.13, fill: '#fff' }), inkCircle(0, 0, R, 'none', { w: W_INNER }),
  ])]);
}

function rock(r, x, y, rx, ry, fill = '#3f5f94', shade = '#30497c') {
  const pts = [], n = 7;
  for (let i = 0; i < n; i++) { const a = i / n * TAU + 0.3, k = r.range(0.84, 1.12); pts.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]); }
  const d = spline(pts, true);
  const id = 'rk' + Math.round(x) + '_' + Math.round(y);
  return g({}, [shadow(x + rx * 0.14, y + ry * 0.24, rx * 1.02, ry * 0.9), ink(d, fill, { w: W_INNER }),
    `<clipPath id="${id}"><path d="${d}"/></clipPath>`, g({ 'clip-path': `url(#${id})` }, flat(`M${x - rx * 1.3} ${y + ry * 0.2}Q${x} ${y + ry * 0.7} ${x + rx * 0.3} ${y - ry * 1.3}L${x + rx * 1.4} ${y - ry * 1.3}L${x + rx * 1.4} ${y + ry * 1.4}L${x - rx * 1.3} ${y + ry * 1.4}Z`, shade)),
    stroke(d, { w: W_INNER }), el('ellipse', { cx: x - rx * 0.36, cy: y - ry * 0.42, rx: rx * 0.2, ry: ry * 0.12, fill: '#7f9fd0', transform: `rotate(-24 ${x - rx * 0.36} ${y - ry * 0.42})` })]);
}

/** A terracotta amphora lying on the sand. Drawn upright about (0, 0), ~300 tall; place with at(). */
function amphora(s) {
  const body = 'M-34 -150L-34 -96C-126 -70 -124 70 -26 168L26 168C124 70 126 -70 34 -96L34 -150Z';
  const hl = 'M-34 -128C-104 -138 -118 -84 -86 -40', hr = 'M34 -128C104 -138 118 -84 86 -40';
  return g({}, [
    stroke(hl, { w: 34 }), stroke(hr, { w: 34 }), stroke(hl, { w: 18, stroke: '#e58a58' }), stroke(hr, { w: 18, stroke: '#b85c3c' }),
    ink(body, '#e58a58', { w: W_INNER }),
    g({ 'clip-path': s.clip(el('path', { d: body })) }, [
      flat('M30 -160C110 -60 110 80 10 180L140 180L140 -160Z', '#b85c3c'),
      flat('M-130 -28L130 -28L130 4L-130 4Z', '#fff0c8'), stroke('M-110 -12l22 -10l22 10l22 -10l22 10l22 -10l22 10l22 -10l22 10l22 -10l22 10', { w: W_DETAIL, stroke: '#b85c3c' }),
      flat('M-130 62L130 62L130 78L-130 78Z', '#8a3f2c'),
      flat('M-78 -40C-90 0 -80 50 -50 96C-60 50 -64 0 -56 -40Z', '#ffc79a'),
    ]),
    stroke(body, { w: W_INNER }),
    ink('M-52 -176L52 -176L46 -146L-46 -146Z', '#e58a58', { w: W_INNER }), flat('M10 -172L48 -172L43 -150L10 -150Z', '#b85c3c'),
    stroke('M-70 96l18 14l-6 20', { w: W_DETAIL }),
  ]);
}

/** An open treasure chest, gold heaped in it. Drawn about (0, 0), ~260 wide; place with at(). */
function chest(s) {
  const lid = 'M-124 -14L-112 -104Q0 -150 112 -104L124 -14Z', box = 'M-128 -14L128 -14L118 112L-118 112Z';
  const heap = 'M-112 -6C-90 -52 -50 -62 -16 -44C10 -74 60 -70 80 -40C100 -40 110 -24 112 -6Z';
  return g({}, [
    ink(lid, '#7a4630', { w: W_INNER }), flat('M-96 -30L-88 -94Q0 -128 88 -94L96 -30Z', '#56301f'),
    stroke('M-58 -116L-64 -18M58 -116L64 -18', { w: 20 }), stroke('M-58 -116L-64 -18M58 -116L64 -18', { w: 8, stroke: '#f6c544' }),
    ink(heap, '#f6c544', { w: W_INNER }),
    g({ 'clip-path': s.clip(el('path', { d: heap })) }, flat('M30 -90C70 -60 90 -30 60 0L130 0L130 -90Z', '#d79a28')),
    inkEllipse(-56, -22, 22, 13, '#ffe07a', { w: W_DETAIL }), inkEllipse(14, -34, 22, 13, '#ffe07a', { w: W_DETAIL }), inkEllipse(-18, -10, 22, 13, '#f6c544', { w: W_DETAIL }),
    inkCircle(62, -24, 15, '#ff6f9c', { w: W_DETAIL }), el('circle', { cx: 57, cy: -29, r: 4, fill: '#fff' }),
    stroke(heap, { w: W_INNER }),
    ink(box, '#a8643a', { w: W_INNER }),
    g({ 'clip-path': s.clip(el('path', { d: box })) }, [flat('M-140 66L140 66L140 120L-140 120Z', '#7a4630'), stroke('M-124 30L124 30', { w: W_DETAIL, stroke: '#7a4630' })]),
    ink('M-88 -14L-58 -14L-56 112L-84 112Z', '#f6c544', { w: W_DETAIL + 1 }), ink('M58 -14L88 -14L84 112L56 112Z', '#d79a28', { w: W_DETAIL + 1 }),
    ink('M-134 -24L134 -24L132 6L-132 6Z', '#f6c544', { w: W_INNER }), flat('M40 -20L130 -20L128 2L40 2Z', '#d79a28'), stroke('M-134 -24L134 -24L132 6L-132 6Z', { w: W_INNER }),
    ink('M-22 -6L22 -6L22 40Q0 58 -22 40Z', '#ffe07a', { w: W_DETAIL + 1 }), el('circle', { cx: 0, cy: 16, r: 7, fill: INK }), stroke('M0 18L0 34', { w: W_DETAIL }),
    stroke(box, { w: W_INNER }),
  ]);
}

const coin = (x, y, rot = 0) => g({}, [inkEllipse(x, y, 20, 13, '#f6c544', { w: W_DETAIL, rot }), el('ellipse', { cx: x - 5, cy: y - 3, rx: 6, ry: 3.5, fill: '#fff3b0', transform: `rotate(${rot} ${x} ${y})` })]);
const bub = (x, y, r) => g({}, [inkCircle(x, y, r, '#bfefff', { w: W_DETAIL, 'fill-opacity': 0.35 }), el('circle', { cx: x - r * 0.34, cy: y - r * 0.36, r: r * 0.22, fill: '#fff' })]);
const tuft = (x, y, h, fill, lean = 0) => g({}, [-1, 0, 1].map((k) => ink(ribbon([[x + k * 16, y], [x + k * 30 + lean * 0.4, y - h * 0.5 * (1 - Math.abs(k) * 0.2)], [x + k * 52 + lean, y - h * (1 - Math.abs(k) * 0.28)]], 26, 9), fill, { w: W_MID })));

// ------------------------------------------------------------------------------------------------ the scene

export function build(s) {
  const r = s.r, W = s.w, H = s.h;

  // ---- 0: the sand, flat, with darker corners and quiet ripple marks
  s.backdrop('#2b6a84');
  s.add(0, flat(spline([[-60, -60], [620, -60], [470, 90], [250, 190], [120, 380], [-60, 520]], true), '#245b78'));
  s.add(0, flat(spline([[W + 60, -60], [W - 620, -60], [W - 470, 90], [W - 250, 190], [W - 120, 380], [W + 60, 520]], true), '#245b78'));
  s.add(0, flat(spline([[-60, H + 60], [620, H + 60], [470, H - 90], [250, H - 190], [120, H - 380], [-60, H - 520]], true), '#215471'));
  s.add(0, flat(spline([[W + 60, H + 60], [W - 620, H + 60], [W - 470, H - 90], [W - 250, H - 190], [W - 120, H - 380], [W + 60, H - 520]], true), '#215471'));
  const marks = [];
  for (let i = 0; i < 150; i++) {
    const x = r.range(10, W - 10), y = r.range(10, H - 10);
    if (inRing(x, y, R1 + 30)) continue;
    const l = r.range(22, 54), c = r.pick(['#3a8098', '#3a8098', '#1f506c']);
    marks.push(el('path', { d: `M${x.toFixed(0)} ${y.toFixed(0)}q${(l / 2).toFixed(0)} ${r.range(-10, -4).toFixed(0)} ${l.toFixed(0)} 0`, fill: 'none', stroke: c, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.7 }));
  }
  s.add(0, g({}, marks));
  s.specks({ n: 70, rmin: 3, rmax: 7, colors: ['#4f97aa', '#1f506c', '#6fb3bf'], opacity: 0.6, layer: 0 });
  s.paper({ opacity: 0.08 });

  // ---- 1: the ring
  const ringParts = [];
  ringParts.push(flat(poly(arc(R1 + 6, 0, TAU, 120).map(([x, y]) => [x + 16, y + 22]), true), SHADOW));       // its hard shadow on the sand
  // kerb stones: chunky, inked
  const NK = 34, kerb = [];
  for (let i = 0; i < NK; i++) {
    const a0 = i / NK * TAU + 0.05, a1 = (i + 1) / NK * TAU + 0.05;
    kerb.push(ink(wedge(R0 - 4, R1, a0, a1, 6), ['#3a4f92', '#33468a', '#3e5599'][i % 3], { w: W_MID }));
  }
  ringParts.push(flat(ring(R1), INK), ...kerb);
  // a hard highlight along the lit (upper left) kerb, a shadow tone along the lower right
  for (let i = 0; i < NK; i++) {
    const a0 = i / NK * TAU + 0.05, a1 = (i + 1) / NK * TAU + 0.05, mid = (a0 + a1) / 2;
    const lit = Math.cos(mid - Math.PI * 1.25);
    if (lit > 0.35) ringParts.push(flat(wedge(R1 - 26, R1 - 14, a0 + 0.035, a1 - 0.06, 5), '#5f7cc0'));
    if (lit < -0.3) ringParts.push(flat(wedge(R0 + 6, R0 + 30, a0 + 0.03, a1 - 0.03, 5), '#2a3a78'));
  }
  // the floor: big quiet tiles in three rings, thin low-contrast joints
  const JOINT = '#14244c';
  const floorClip = s.clip(el('path', { d: ring(R0 - 4) }));
  const tiles = [flat(ring(R0 - 4), '#1c2f60')];
  const bandOf = (r0, r1, n, off, tones) => {
    for (let i = 0; i < n; i++) tiles.push(el('path', { d: wedge(r0, r1, off + i / n * TAU, off + (i + 1) / n * TAU, 14), fill: tones[i % tones.length], stroke: JOINT, 'stroke-width': W_DETAIL, 'stroke-linejoin': 'round' }));
  };
  bandOf(486, R0 - 4, 16, 0.196, ['#1d3162', '#1b2d5b', '#1e3366']);
  bandOf(250, 486, 10, 0, ['#1c2f5f', '#1e3264']);
  tiles.push(el('path', { d: ring(250), fill: '#1d3162', stroke: JOINT, 'stroke-width': W_DETAIL }));
  // the two halves: a breath of violet for the far side, of teal for the near side
  tiles.push(el('rect', { x: 0, y: 0, width: W, height: CY, fill: '#5a3aa8', opacity: 0.1 }), el('rect', { x: 0, y: CY, width: W, height: CY, fill: '#1fa0a8', opacity: 0.09 }));
  // the kerb's shadow on the floor (light from the upper left)
  tiles.push(el('path', { d: ring(R0 - 4), fill: 'none', stroke: '#14244c', 'stroke-width': 44, opacity: 0.55, transform: 'translate(14 18)' }));
  // worn chips, quiet
  for (const [rad, a, sz] of [[600, 0.6, 22], [620, 2.3, 18], [380, 3.6, 20], [610, 4.1, 24], [360, 5.6, 16], [640, 5.2, 18], [150, 1.2, 14]]) {
    const [x, y] = P(rad, a);
    tiles.push(flat(`M${x} ${y}l${sz} ${-sz * 0.3}l${sz * 0.5} ${sz * 0.5}l${-sz * 0.9} ${sz * 0.4}Z`, '#17284f'));
  }
  // the divide between the two players' halves: a faint inlaid line with a small star at the centre
  tiles.push(el('path', { d: `M${CX - R0} ${CY}L${CX + R0} ${CY}`, stroke: '#14244c', 'stroke-width': 16 }), el('path', { d: `M${CX - R0} ${CY}L${CX + R0} ${CY}`, stroke: '#2d4a8a', 'stroke-width': 5, 'stroke-dasharray': '46 22', 'stroke-linecap': 'round' }));
  tiles.push(el('ellipse', { cx: CX, cy: CY, rx: 92, ry: 92 * K, fill: '#1c2f60', stroke: '#14244c', 'stroke-width': W_DETAIL }), el('ellipse', { cx: CX, cy: CY, rx: 70, ry: 70 * K, fill: 'none', stroke: '#2d4a8a', 'stroke-width': 4 }));
  tiles.push(g({ transform: `translate(${CX} ${CY}) scale(1 ${K})` }, star4(0, 0, 54, '#2d4a8a', 0)));
  ringParts.push(g({ 'clip-path': floorClip }, tiles));
  ringParts.push(el('path', { d: ring(R0 - 4), fill: 'none', stroke: INK, 'stroke-width': W_MID }), el('path', { d: ring(R1), fill: 'none', stroke: INK, 'stroke-width': W_INNER + 2 }));
  // gold studs where the divide meets the kerb (outside the play area)
  for (const sx of [-1, 1]) {
    const [x, y] = P((R0 + R1) / 2 - 2, sx < 0 ? Math.PI : 0);
    ringParts.push(inkEllipse(x, y, 30, 34, '#f6c544', { w: W_MID }), star4(x, y, 18, '#fff3b0', 0));
  }
  s.add(1, g({ filter: s.wobble(4, 0.008, 5) }, ringParts));

  // ---- 2: the loud things, kept to the corners and the outer edges
  const props = [];
  // top left: pink tube coral, a mound, shells
  props.push(shadow(150, 250, 190, 60), rock(r, 250, 236, 70, 44), coral(r, 96, 250, 290, 96, 40, '#ff7fa8', '#ffd0e0'), coral(r, 190, 226, 262, 80, 34, '#ff9a6a', '#ffe0c0'));
  props.push(shadow(388, 124, 96, 40), mound(r, 380, 96, 86, 58, '#b98cff', '#8d5fe0', '#e6d4ff'));
  props.push(scallop(92, 420, 44, -24, '#ffd9e6', '#f08fb0'), starfish(520, 62, 44, 0.4, '#ffb347', '#e07a2a'), spiral(64, 560, 30, 20, '#ffe9c8', '#e0b080'));
  // top right: the amphora, purple sponges, a starfish
  props.push(shadow(1716, 196, 190, 70, 12), at(1700, 150, 68, amphora(s), 0.9));
  props.push(shadow(1500, 130, 100, 34), sponge(1496, 128, 0.82, '#c79bff', '#9468e0'));
  props.push(starfish(1846, 380, 52, 0.2, '#ff7f8f', '#d9485f'), scallop(1380, 54, 36, 14, '#fff0c8', '#e0b060'));
  props.push(spiral(1858, 520, 26, -150, '#d8f0ff', '#8fb8e0'));
  // bottom left: the chest and its spill
  props.push(shadow(196, 1090, 210, 60), tuft(60, 1010, 150, '#2f9a7a', -20), at(180, 1000, -8, chest(s), 1));
  props.push(coin(370, 1090, 20), coin(410, 1136, -10), coin(322, 1150, 0), coin(60, 1150, 30), star4(292, 906, 26, '#fff6c0'), star4(84, 880, 16, '#ffffff'));
  props.push(starfish(480, 1130, 40, 1.0, '#c79bff', '#9468e0'), scallop(96, 800, 38, 160, '#bfefff', '#6fb8d8'), anemone(52, 690, 44, '#ff9fc8', '#ffe07a'));
  // bottom right: orange coral, a mound, shells
  props.push(shadow(1760, 1120, 200, 56), rock(r, 1690, 1100, 76, 46), coral(r, 1800, 1110, 262, 104, 42, '#ffa04a', '#ffe6b8'), coral(r, 1700, 1080, 250, 76, 32, '#ff7fa8', '#ffd0e0'));
  props.push(shadow(1500, 1128, 92, 36), mound(r, 1494, 1104, 80, 52, '#5fd8c8', '#2fa8a0', '#d8fff6'));
  props.push(spiral(1356, 1140, 30, -30, '#ffd9e6', '#f08fb0'), starfish(1866, 650, 44, 0.9, '#ffb347', '#e07a2a'), tuft(1884, 820, 120, '#2f9a7a', 16), anemone(1860, 236, 40, '#7fe8d8', '#fff0a0'));
  // little things along the top and bottom edges (so a phone-width crop still has some life), well clear of the middle
  props.push(scallop(770, 36, 26, 10, '#ffd9e6', '#f08fb0'), starfish(1130, 40, 30, 0.7, '#ff7f8f', '#d9485f'), rock(r, 944, 26, 34, 20));
  props.push(starfish(800, 1162, 30, 0.2, '#ffb347', '#e07a2a'), scallop(1120, 1164, 26, 170, '#fff0c8', '#e0b060'), rock(r, 966, 1176, 36, 20));
  s.add(2, g({ filter: s.wobble(4, 0.012, 2) }, props));

  // ---- 3: bubbles and glints, corners only
  s.add(3, bub(310, 330, 16), bub(350, 280, 10), bub(1610, 300, 14), bub(1580, 250, 9), bub(520, 1000, 12), bub(1420, 1010, 15), bub(1390, 960, 9), bub(40, 300, 12));
  s.add(3, star4(250, 60, 20, '#ffffff'), star4(1620, 60, 18, '#fff6c0'), star4(1900, 1000, 18, '#ffffff'), star4(600, 1100, 14, '#ffffff'));
}
