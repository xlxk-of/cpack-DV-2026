// ARENA — the battle board's backdrop: a round duelling ring of worn stone and inlaid shell on the sea floor, seen
// from above at a slight angle. Everything loud (coral, anemones, shells, treasure) keeps to the edges and corners;
// the middle stays calm and dark so cards read on top of it.
import { el, g, spline, ribbon, sample, orb, glint, poly } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;
export const size = [1920, 1200];
export const noThumb = true;

const CX = 960, CY = 600, RX = 760, K = 540 / 760;
const P = (rad, a) => [CX + rad * Math.cos(a), CY + rad * Math.sin(a) * K];

export function build(s) {
  const r = s.r;
  const W = s.w, H = s.h;

  // ---- 0: the sea floor: dark sand, rippled
  s.backdrop(s.rad([[0, '#1c4654'], [0.6, '#143444'], [1, '#0a1c30']], 0.5, 0.5, 0.75));
  s.fog({ color: '#2a6a78', opacity: 0.3, freq: 0.004, fade: false });
  s.fog({ color: '#2a2a80', opacity: 0.22, freq: 0.007, fade: false });
  const rip = [];
  for (let i = 0; i < 46; i++) {
    const y = -20 + i * 28 + r.range(-6, 6), ph = r.range(0, 6), pts = [];
    for (let x = -40; x <= W + 40; x += 60) pts.push([x, y + Math.sin(x * 0.011 + ph) * 9 + Math.sin(x * 0.027 + ph * 2) * 4]);
    rip.push(el('path', { d: spline(pts, false, 4), fill: 'none', stroke: '#8fd0c8', 'stroke-width': r.range(3, 7), opacity: r.range(0.06, 0.14) }));
    rip.push(el('path', { d: spline(pts.map(([x, yy]) => [x, yy + 6]), false, 4), fill: 'none', stroke: '#020a14', 'stroke-width': r.range(3, 7), opacity: r.range(0.14, 0.26) }));
  }
  s.add(0, g({ filter: 'url(#glow2)' }, rip));
  const peb = [];
  for (let i = 0; i < 260; i++) {
    const x = r.range(0, W), y = r.range(0, H), rr = r.range(1.5, 6);
    peb.push(el('ellipse', { cx: x, cy: y + rr * 0.5, rx: rr * 1.1, ry: rr * 0.7, fill: '#020a14', opacity: 0.4 }));
    peb.push(el('ellipse', { cx: x, cy: y, rx: rr, ry: rr * 0.7, fill: r.pick(['#3a6a70', '#2a4a66', '#55807a', '#1c3a4c']), opacity: r.range(0.4, 0.8) }));
  }
  s.add(0, g({}, peb));

  // ---- 1: the ring
  s.add(1, ring(s, r));

  // ---- 2: everything loud, kept to the edges
  s.add(2, decor(s, r));

  // ---- 3: light through the water, then the finish
  s.def(`<filter id="caus" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.0045 0.0075" numOctaves="2" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 0.75  0 0 0 0 1  0 0 0 0 0.95  1 0 0 0 0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0 0 0 0 0 1 0 0 0 0 0 0"/></feComponentTransfer><feGaussianBlur stdDeviation="2.5"/></filter>`);
  s.def(`<filter id="caus2" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.007 0.011" numOctaves="2" seed="29"/><feColorMatrix type="matrix" values="0 0 0 0 0.7  0 0 0 0 0.95  0 0 0 0 1  0 1 0 0 0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0 0 0 0 0 1 0 0 0 0 0 0"/></feComponentTransfer><feGaussianBlur stdDeviation="1.8"/></filter>`);
  s.add(3, el('rect', { x: 0, y: 0, width: W, height: H, filter: 'url(#caus)', opacity: 0.15 }));
  s.add(3, el('rect', { x: 0, y: 0, width: W, height: H, filter: 'url(#caus2)', opacity: 0.09 }));
  const fgw = [];
  for (const [x, y, a0, n] of [[-30, 1230, -50, 5], [1950, 1230, -130, 5], [-30, -30, 40, 4], [1950, -30, 140, 4]]) {
    for (let i = 0; i < n; i++) {
      const a = (a0 + (i - (n - 1) / 2) * 16 + r.range(-5, 5)) * Math.PI / 180, L = r.range(200, 330), sw = r.range(-30, 30);
      const nx = -Math.sin(a), ny = Math.cos(a);
      const pts = [[x, y], [x + Math.cos(a) * L * 0.35 + nx * sw, y + Math.sin(a) * L * 0.35 + ny * sw], [x + Math.cos(a) * L * 0.7 - nx * sw, y + Math.sin(a) * L * 0.7 - ny * sw], [x + Math.cos(a) * L, y + Math.sin(a) * L]];
      fgw.push(el('path', { d: ribbon(pts, 46, 4, (t) => 0.8 + 0.25 * Math.sin(t * 16 + i), 14), fill: i % 2 ? '#03121c' : '#06202a', opacity: 0.9 }));
    }
  }
  s.add(3, g({ filter: 'url(#glow4)' }, fgw));
  s.motes({ n: 90, rmin: 0.8, rmax: 2.6, colors: ['#aef6ff', '#c8d0ff', '#ffffff'], opacity: 0.4, glow: false });
  // darken the frame, lift the centre a breath
  s.add(3, el('rect', { x: 0, y: 0, width: W, height: H, fill: s.rad([[0, '#2a8a9a', 0.1], [0.5, '#0a1a3a', 0], [0.8, '#030818', 0.3], [1, '#02040e', 0.72]], 0.5, 0.5, 0.72) }));
  s.grain({ opacity: 0.16, layer: 3 });
}

// ------------------------------------------------------------------------------------------------------ helpers

function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function mix(a, b, t) {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

/** A tile: the piece of an annulus between two radii and two angles, squashed to the viewing angle. */
function sector(r0, r1, a0, a1, gap = 0) {
  const pts = [];
  const ga0 = gap / r1, ga1 = gap / Math.max(r0, 30);
  const n = Math.max(3, Math.ceil((a1 - a0) * r1 / 26));
  for (let i = 0; i <= n; i++) pts.push(P(r1 - gap, a0 + ga0 + (a1 - a0 - 2 * ga0) * (i / n)));
  for (let i = n; i >= 0; i--) pts.push(P(r0 + gap, a0 + ga1 + (a1 - a0 - 2 * ga1) * (i / n)));
  return poly(pts, true);
}
const ell = (rad, attrs) => el('ellipse', { cx: CX, cy: CY, rx: rad, ry: rad * K, ...attrs });

function ring(s, r) {
  const p = [];
  // paler sand banked round the ring
  p.push(el('ellipse', { cx: CX, cy: CY, rx: RX + 70, ry: (RX + 70) * K, fill: 'none', stroke: '#5a9a94', 'stroke-width': 110, opacity: 0.22, filter: 'url(#glow32)' }));
  // the ring sits a little proud of the sand: a shadow under its lower edge
  p.push(el('ellipse', { cx: CX + 8, cy: CY + 26, rx: RX + 16, ry: (RX + 16) * K, fill: '#01050c', opacity: 0.75, filter: 'url(#glow16)' }));
  // bed of dark sand that shows in the joints
  p.push(ell(RX, { fill: '#09202c' }));

  const rings = [[96, 196, 8], [196, 304, 12], [304, 412, 16], [412, 520, 20], [520, 628, 24]];
  const tiles = [], marks = [];
  const tone = (a, rad) => {
    // the far half leans indigo, the near half teal: each duellist's side, barely told apart
    const t = 0.5 - 0.5 * Math.sin(a) * Math.min(1, rad / 300);
    const base = mix('#0d303c', '#152248', t);
    return mix(base, r() < 0.5 ? '#0a2532' : '#174854', r.range(0, 0.22));
  };
  for (const [k, [r0, r1, n]] of rings.entries()) {
    const off = (k % 2) * Math.PI / n + 0.13 * k;
    for (let i = 0; i < n; i++) {
      const a0 = off + (i / n) * Math.PI * 2, a1 = off + ((i + 1) / n) * Math.PI * 2, am = (a0 + a1) / 2;
      tiles.push(el('path', { d: sector(r0, r1, a0, a1, 3.5), fill: tone(am, (r0 + r1) / 2) }));
      // wear: hairline cracks, only on the outer courses
      if (k >= 3 && r() < 0.3) {
        const q0 = P(r.range(r0 + 10, r1 - 10), a0 + (a1 - a0) * r.range(0.1, 0.4)), q1 = P(r.range(r0 + 10, r1 - 10), a0 + (a1 - a0) * r.range(0.6, 0.9));
        const mid = [(q0[0] + q1[0]) / 2 + r.range(-14, 14), (q0[1] + q1[1]) / 2 + r.range(-10, 10)];
        marks.push(el('path', { d: poly([q0, mid, q1]), fill: 'none', stroke: '#041018', 'stroke-width': 2, opacity: 0.6, 'stroke-linejoin': 'round' }));
      }
    }
  }
  // the centre stone
  tiles.push(ell(92, { fill: mix('#0f3642', '#17254e', 0.5) }));
  // shell course and the carved kerb
  const kerbN = 40;
  for (let i = 0; i < kerbN; i++) {
    const a0 = (i / kerbN) * Math.PI * 2 + 0.04, a1 = ((i + 1) / kerbN) * Math.PI * 2 + 0.04;
    tiles.push(el('path', { d: sector(690, 756, a0, a1, 3), fill: mix(tone((a0 + a1) / 2, 720), '#2a6470', 0.25) }));
  }
  p.push(g({ filter: s.emboss({ color: '#8fd6d6', az: 235, elev: 30, depth: 3, k: 0.36, blur: 2.4, exp: 18 }) }, tiles));
  p.push(g({}, marks));

  // the shell course: a band of dark stone set with lozenges of nacre
  const band = [];
  band.push(el('path', { d: sector(634, 684, 0, Math.PI * 2 - 0.0001, 0), fill: '#0a2a38' }));
  const nN = 56;
  for (let i = 0; i < nN; i++) {
    const a = (i / nN) * Math.PI * 2, c = P(659, a), u = P(659, a + 0.034), v = P(659 + 17, a), w2 = P(659, a - 0.034), x2 = P(659 - 17, a);
    const big = i % 2 === 0;
    const tint = ['#bfeff0', '#d8c8f4', '#f4d8e4', '#c8f0d4'][i % 4];
    if (big) band.push(el('path', { d: poly([u, v, w2, x2], true), fill: s.lin([[0, '#ffffff'], [0.45, tint], [1, '#7a6ab8']], 0, 0, 1, 1), opacity: 0.55 }));
    else band.push(el('ellipse', { cx: c[0], cy: c[1], rx: 5, ry: 5 * K, fill: tint, opacity: 0.45 }));
  }
  p.push(g({ filter: s.emboss({ color: '#ffffff', az: 235, elev: 30, depth: 2, k: 0.5, blur: 1.5 }) }, band));

  // carving on the kerb: curls of wave and little fans, no two quite alike
  const carve = [];
  for (let i = 0; i < kerbN; i++) {
    const am = ((i + 0.5) / kerbN) * Math.PI * 2 + 0.04;
    const c = P(723, am);
    if (i % 2) {
      // a wave-curl
      const pts = [];
      for (let k = 0; k <= 14; k++) { const t = k / 14, a = t * 4.6, d = 15 * (1 - t * 0.75); pts.push([c[0] + Math.cos(a + am) * d, c[1] + Math.sin(a + am) * d * K]); }
      carve.push(el('path', { d: spline(pts, false, 4), fill: 'none', stroke: '#041420', 'stroke-width': 3.2, opacity: 0.7, 'stroke-linecap': 'round' }));
      carve.push(el('path', { d: spline(pts.map(([x, y]) => [x + 1.5, y + 2]), false, 4), fill: 'none', stroke: '#7fd0d0', 'stroke-width': 1.2, opacity: 0.35, 'stroke-linecap': 'round' }));
    } else {
      // a fan of three strokes
      for (const da of [-0.5, 0, 0.5]) {
        const q0 = P(708, am), q1 = [c[0] + Math.cos(am + da) * 18, c[1] + Math.sin(am + da) * 18 * K];
        carve.push(el('path', { d: poly([q0, q1]), stroke: '#041420', 'stroke-width': 3, opacity: 0.65, 'stroke-linecap': 'round' }));
      }
      carve.push(el('ellipse', { cx: P(742, am)[0], cy: P(742, am)[1], rx: 4, ry: 3, fill: '#bfeff0', opacity: 0.5 }));
    }
  }
  p.push(g({}, carve));

  // the centre stone's inlay: a compass of the tides, almost worn away
  const med = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2, L = i % 2 ? 46 : 78;
    med.push(el('path', { d: poly([P(L, a), P(16, a + 0.5), P(16, a - 0.5)], true), fill: i % 2 ? '#7fc8d0' : '#c8e8f0', opacity: 0.16 }));
  }
  med.push(ell(84, { fill: 'none', stroke: '#9fe0e6', 'stroke-width': 2, opacity: 0.2 }));
  med.push(ell(14, { fill: '#c8f0f4', opacity: 0.25 }));
  p.push(g({}, med));

  // the divide between the two halves: a groove with a thread of nacre in it
  const dv = [];
  dv.push(el('path', { d: `M${CX - 688} ${CY}L${CX + 688} ${CY}`, stroke: '#020c16', 'stroke-width': 9, opacity: 0.55, 'stroke-linecap': 'round' }));
  dv.push(el('path', { d: `M${CX - 688} ${CY}L${CX + 688} ${CY}`, stroke: '#8fe6e6', 'stroke-width': 10, opacity: 0.1, filter: 'url(#glow8)' }));
  dv.push(el('path', { d: `M${CX - 684} ${CY}L${CX + 684} ${CY}`, stroke: s.lin([[0, '#bfeff0', 0.1], [0.2, '#bfeff0', 0.5], [0.5, '#e8dcf8', 0.6], [0.8, '#bfeff0', 0.5], [1, '#bfeff0', 0.1]], CX - 684, 0, CX + 684, 0, true), 'stroke-width': 2.2, 'stroke-dasharray': '26 10', opacity: 0.55 }));
  for (const dx of [-520, -260, 260, 520]) dv.push(el('path', { d: `M${CX + dx} ${CY - 9}l11 9l-11 9l-11 -9z`, fill: '#bfeff0', opacity: 0.28 }));
  p.push(g({}, dv));

  // age: stains across the courses, sand blown in from the edge, darker toward the kerb
  const cp = s.clip(ell(RX, {}));
  const age = [];
  for (let i = 0; i < 34; i++) {
    const a = r.range(0, Math.PI * 2), q = P(r.range(560, 780), a);
    age.push(el('ellipse', { cx: q[0], cy: q[1], rx: r.range(40, 120), ry: r.range(16, 44), fill: '#4a8a88', opacity: r.range(0.08, 0.2), filter: 'url(#glow16)', transform: `rotate(${(a * 180 / Math.PI + 90).toFixed(0)} ${q[0].toFixed(0)} ${q[1].toFixed(0)})` }));
  }
  for (let i = 0; i < 40; i++) {
    const q = P(Math.sqrt(r()) * 740, r.range(0, Math.PI * 2));
    age.push(el('ellipse', { cx: q[0], cy: q[1], rx: r.range(30, 110), ry: r.range(14, 50), fill: i % 2 ? '#03101c' : '#1f5a66', opacity: r.range(0.05, 0.13), filter: 'url(#glow16)' }));
  }
  age.push(ell(RX, { fill: s.rad([[0, '#000', 0], [0.72, '#01060e', 0], [1, '#01060e', 0.42]]) }));
  p.push(g({ 'clip-path': cp }, age));

  // sand drifted up over the kerb here and there
  for (const [a, w] of [[0.5, 0.2], [2.5, 0.26], [3.5, 0.16], [5.6, 0.22], [1.2, 0.12], [4.5, 0.14]]) {
    const q = P(770, a);
    p.push(el('ellipse', { cx: q[0], cy: q[1], rx: 770 * w, ry: 44, fill: '#4a8a88', opacity: 0.4, filter: 'url(#glow16)', transform: `rotate(${(Math.atan2(Math.cos(a) * K, -Math.sin(a)) * 180 / Math.PI).toFixed(0)} ${q[0].toFixed(0)} ${q[1].toFixed(0)})` }));
  }
  // each duellist's mark, set in the kerb at the far and near points: a scallop of nacre
  p.push(mark(s, CX, CY - 723 * K, 0.8, '#c9b8ff'), mark(s, CX, CY + 723 * K, 1, '#9ff0e0'));

  // rim-light on the upper lip of the kerb
  p.push(el('path', { d: poly(Array.from({ length: 61 }, (_, i) => P(757, Math.PI + 0.25 + (i / 60) * (Math.PI - 0.5)))), fill: 'none', stroke: '#9fe6e6', 'stroke-width': 2.5, opacity: 0.3 }));
  return g({}, p);
}

function mark(s, x, y, k, tint) {
  const p = [];
  p.push(el('ellipse', { cx: x, cy: y, rx: 80 * k, ry: 40 * k, fill: tint, opacity: 0.16, filter: 'url(#glow16)' }));
  p.push(el('ellipse', { cx: x, cy: y, rx: 44 * k, ry: 30 * k, fill: '#071c2a', stroke: '#2a6470', 'stroke-width': 3 }));
  let d = '';
  for (let i = 0; i <= 6; i++) {
    const a = Math.PI + (i / 6) * Math.PI, rr = (i % 2 ? 22 : 25) * k;
    d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr * 1.2).toFixed(1) + ' ' + (y + 12 * k + Math.sin(a) * rr).toFixed(1);
  }
  p.push(el('path', { d: d + `L${x} ${y + 16 * k}Z`, fill: s.lin([[0, '#ffffff'], [0.5, tint], [1, '#5a8a9a']]), opacity: 0.7, 'stroke-linejoin': 'round' }));
  for (let i = 1; i < 6; i++) {
    const a = Math.PI + (i / 6) * Math.PI;
    p.push(el('path', { d: `M${x} ${y + 14 * k}L${x + Math.cos(a) * 24 * k} ${y + 12 * k + Math.sin(a) * 21 * k}`, stroke: '#2a5a6a', 'stroke-width': 1.4, opacity: 0.7 }));
  }
  return g({}, p);
}

// ------------------------------------------------------------------------------------------------------ dressing

function decor(s, r) {
  const p = [];
  const sh = (inner) => g({ filter: 'url(#shadow)' }, inner);
  const rocks = (list) => { for (const [x, y, rx, ry] of list) p.push(rock(s, r, x, y, rx, ry)); };

  // --- top left: a reef head with a stand of coral
  rocks([[40, 40, 190, 120], [250, 30, 150, 70], [50, 250, 110, 120], [190, 170, 90, 70], [470, 10, 110, 40]]);
  p.push(sh(coral(s, r, 250, 150, -70, 150, '#7a2a56', '#ff9ab0')));
  p.push(sh(coral(s, r, 110, 250, -95, 190, '#a0344a', '#ffb8a8')));
  p.push(sh(coral(s, r, 60, 400, -80, 120, '#5a2a80', '#d8a0f8')));
  p.push(anemone(s, r, 330, 100, 54, '#1a8a80', '#9ffff0'));
  p.push(anemone(s, r, 404, 56, 34, '#b05a1c', '#ffe0a0'));
  p.push(anemone(s, r, 182, 318, 40, '#a02a7a', '#ffc0ec'));
  p.push(sh(starfish(s, 276, 232, 30, 0.4, '#e07a50')));
  p.push(sh(scallop(s, 500, 44, 24, -20, '#f0c8d8')));
  p.push(sh(snail(s, 596, 30, 15, '#d8c8a8')));

  // --- left edge: an amphora against a rock, anemones at its foot
  rocks([[20, 600, 90, 150], [60, 830, 100, 80]]);
  p.push(sh(amphora(s, 104, 640, 0.95, -20)));
  p.push(anemone(s, r, 60, 800, 46, '#b05a1c', '#ffe0a0'));
  p.push(anemone(s, r, 136, 846, 30, '#1a8a80', '#9ffff0'));
  p.push(sh(starfish(s, 176, 762, 22, 1.2, '#d85a80')));

  // --- bottom left: the great clam and its pearl
  rocks([[60, 1150, 220, 120], [330, 1190, 160, 60], [30, 960, 80, 110]]);
  p.push(sh(coral(s, r, 50, 1020, -75, 130, '#9a4a1c', '#ffd09a')));
  p.push(sh(clam(s, r, 210, 1060, 130)));
  p.push(anemone(s, r, 404, 1132, 42, '#3a4ab0', '#c8d4ff'));
  p.push(anemone(s, r, 470, 1172, 24, '#a02a7a', '#ffc0ec'));
  for (let i = 0; i < 14; i++) p.push(coin(s, r.range(330, 640), r.range(1128, 1188), r.range(7, 11), r));
  p.push(sh(starfish(s, 560, 1150, 22, 2.2, '#e8985a')));
  p.push(gem(s, 372, 1080, 11, '#ff7ad0'));

  // --- top right: the chest, spilled
  rocks([[1880, 50, 190, 130], [1650, 20, 150, 60], [1880, 300, 90, 130]]);
  p.push(sh(coral(s, r, 1850, 290, -100, 160, '#7a2a56', '#ff9ac8')));
  p.push(sh(coral(s, r, 1560, 60, -110, 80, '#1a6a70', '#9ff0e8')));
  p.push(sh(chest(s, r, 1700, 150)));
  for (let i = 0; i < 30; i++) {
    const a = r.range(2.3, 3.5), d = r.range(100, 290);
    p.push(coin(s, 1700 + Math.cos(a) * d, 190 + Math.sin(a) * d * 0.4 + r.range(-10, 34), r.range(7, 11), r));
  }
  p.push(gem(s, 1556, 168, 13, '#5fe6ff'), gem(s, 1492, 110, 10, '#ff7ad0'), gem(s, 1604, 262, 11, '#9fff9a'));
  p.push(anemone(s, r, 1826, 440, 44, '#1a8a80', '#9ffff0'));
  p.push(sh(scallop(s, 1410, 36, 20, 20, '#c8e8f0')));

  // --- right edge: a sea-fan rooted in rock, shells
  rocks([[1900, 700, 80, 170], [1850, 900, 100, 80]]);
  p.push(sh(fan(s, r, 1890, 770, 130, 210, '#c0506a')));
  p.push(sh(scallop(s, 1800, 590, 26, 40, '#f4d8b8')));
  p.push(anemone(s, r, 1812, 900, 34, '#a02a7a', '#ffc0ec'));

  // --- bottom right: an anemone garden, a drowned blade
  rocks([[1860, 1140, 220, 130], [1600, 1190, 170, 60]]);
  p.push(sh(sword(s, 1430, 1158, -9)));
  p.push(sh(coral(s, r, 1880, 1040, -115, 130, '#1a6a70', '#9ff0e8')));
  p.push(anemone(s, r, 1738, 1050, 62, '#a02a7a', '#ffc0ec'));
  p.push(anemone(s, r, 1838, 1128, 44, '#3a4ab0', '#c8d4ff'));
  p.push(anemone(s, r, 1650, 1130, 40, '#b05a1c', '#ffe0a0'));
  p.push(anemone(s, r, 1760, 1160, 28, '#1a8a80', '#9ffff0'));
  p.push(sh(scallop(s, 1560, 1100, 20, -12, '#f0c8d8')));
  p.push(sh(snail(s, 1310, 1178, 15, '#c8d8e8')));

  // small things along the top and bottom, so the narrow crop has its share
  p.push(sh(starfish(s, 770, 1174, 18, 0.9, '#d85a80')));
  p.push(coin(s, 1050, 1180, 8, r), coin(s, 1078, 1187, 7, r), coin(s, 884, 20, 8, r), coin(s, 906, 28, 7, r));
  p.push(anemone(s, r, 1160, 24, 24, '#a02a7a', '#ffc0ec'));
  p.push(anemone(s, r, 700, 26, 26, '#1a8a80', '#9ffff0'));
  p.push(sh(scallop(s, 1010, 24, 15, 8, '#e8d8f4')));
  p.push(anemone(s, r, 930, 1180, 22, '#b05a1c', '#ffe0a0'));
  // the water's own colour over all of it, so nothing looks pasted on
  p.push(el('rect', { x: 0, y: 0, width: 1920, height: 1200, fill: '#0c3050', opacity: 0.16 }));
  return g({}, p);
}

function rock(s, r, x, y, rx, ry) {
  const pts = [];
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, k = 1 + (r() * 2 - 1) * 0.2; pts.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]); }
  const d = spline(pts, true, 6);
  const cp = s.clip(el('path', { d }));
  const inn = [];
  for (let i = 0; i < 10; i++) inn.push(el('ellipse', { cx: x + r.range(-rx, rx), cy: y + r.range(-ry, ry), rx: r.range(14, 50), ry: r.range(8, 26), fill: i % 2 ? '#020812' : '#5aa0a0', opacity: r.range(0.14, 0.34), filter: 'url(#glow4)' }));
  // weed and polyps crusting the top
  for (let i = 0; i < 16; i++) inn.push(el('circle', { cx: x + r.range(-rx, rx) * 0.8, cy: y + r.range(-ry, ry) * 0.8, r: r.range(2, 6), fill: r.pick(['#3ab0a0', '#b05a8a', '#c89a4a']), opacity: r.range(0.3, 0.6) }));
  return g({ filter: 'url(#shadow)' }, g({ filter: s.emboss({ color: '#9fe0e8', az: 235, elev: 30, depth: 10, k: 0.75, blur: 9 }) }, [
    el('path', { d, fill: s.lin([[0, '#3d7480'], [0.5, '#1d4458'], [1, '#0a1a30']], 0, 0, 0.6, 1) }), g({ 'clip-path': cp }, inn)]));
}

function coral(s, r, x, y, ang, len, c0, c1) {
  // a branching coral seen from a little above: it fans away from its foot, paling toward the tips
  const p = [], tips = [];
  const D = 4;
  const branch = (bx, by, a, L, w, depth) => {
    const rad = a * Math.PI / 180, ex = bx + Math.cos(rad) * L, ey = by + Math.sin(rad) * L;
    const bend = r.range(-0.25, 0.25) * L;
    p.push(el('path', { d: ribbon([[bx, by], [(bx + ex) / 2 - Math.sin(rad) * bend, (by + ey) / 2 + Math.cos(rad) * bend], [ex, ey]], w, w * 0.66), fill: mix(c1, c0, depth / D) }));
    if (depth <= 0 || L < 12) { tips.push([ex, ey, w * 0.52]); return; }
    const n = depth > 2 ? 3 : 2;
    for (let i = 0; i < n; i++) branch(ex, ey, a + (i - (n - 1) / 2) * r.range(30, 46) + r.range(-10, 10), L * r.range(0.62, 0.8), w * 0.68, depth - 1);
  };
  for (const da of [-52, -18, 16, 48]) branch(x, y, ang + da, len * r.range(0.3, 0.4), len * 0.13, D);
  for (const [tx, ty, tr] of tips) p.push(el('circle', { cx: tx, cy: ty, r: tr, fill: '#ffffff', opacity: 0.75 }));
  p.push(el('ellipse', { cx: x, cy: y + 4, rx: len * 0.17, ry: len * 0.09, fill: c0 }));
  return g({}, [el('ellipse', { cx: x, cy: y - len * 0.3, rx: len * 0.6, ry: len * 0.5, fill: c1, opacity: 0.14, filter: 'url(#glow16)' }),
    g({ filter: s.emboss({ color: '#ffffff', az: 235, elev: 30, depth: 4, k: 0.45, blur: 2.5 }) }, p)]);
}

function fan(s, r, x, y, w, h, c) {
  // a sea-fan: a lace of fine branches in one plane, leaning in from the edge
  const p = [];
  for (let i = 0; i < 15; i++) {
    const a = Math.PI * (0.6 + 0.8 * (i / 14)), L = h * (0.6 + 0.4 * Math.sin((i / 14) * Math.PI));
    const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L * 0.9;
    const mid = [(x + ex) / 2 + r.range(-12, 12), (y + ey) / 2 + r.range(-12, 12)];
    p.push(el('path', { d: spline([[x, y], mid, [ex, ey]]), fill: 'none', stroke: c, 'stroke-width': 4.2 - Math.abs(i - 7) * 0.2, 'stroke-linecap': 'round' }));
    for (let k = 1; k < 5; k++) {
      const t = k / 5, q = [x + (ex - x) * t, y + (ey - y) * t];
      p.push(el('path', { d: `M${q[0]} ${q[1]}l${Math.cos(a + 0.9) * 22} ${Math.sin(a + 0.9) * 22}`, stroke: c, 'stroke-width': 2, opacity: 0.8, 'stroke-linecap': 'round' }));
    }
  }
  return g({ opacity: 0.9 }, p);
}

function anemone(s, r, x, y, R, c, c2) {
  // seen from above: a rosette of soft arms around a dark mouth, dark at the root and lit at the tips
  const p = [];
  p.push(el('circle', { cx: x, cy: y, r: R * 1.7, fill: c2, opacity: 0.18, filter: 'url(#glow16)' }));
  p.push(el('ellipse', { cx: x + 5, cy: y + 10, rx: R * 1.0, ry: R * 0.84, fill: '#01050c', opacity: 0.65, filter: 'url(#glow8)' }));
  const fill = s.rad([[0, mix(c, '#04060f', 0.55)], [0.45, c], [0.85, c2], [1, '#ffffff']], x, y, R * 1.05, true);
  for (let ring = 0; ring < 3; ring++) {
    const n = 30 - ring * 8, L = R * (1 - ring * 0.27);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ring * 0.4 + r.range(-0.1, 0.1), bend = r.range(-0.4, 0.4), LL = L * r.range(0.82, 1.08);
      const q0 = [x + Math.cos(a) * R * 0.1, y + Math.sin(a) * R * 0.09], q2 = [x + Math.cos(a + bend) * LL, y + Math.sin(a + bend) * LL * 0.86];
      const q1 = [x + Math.cos(a + bend * 0.2) * LL * 0.55, y + Math.sin(a + bend * 0.2) * LL * 0.5];
      p.push(el('path', { d: ribbon([q0, q1, q2], R * 0.2, R * 0.035), fill, opacity: 0.92 }));
      if (ring === 0 && i % 2) p.push(el('circle', { cx: q2[0], cy: q2[1], r: R * 0.07, fill: c2, opacity: 0.5, filter: 'url(#glow2)' }));
    }
  }
  p.push(el('ellipse', { cx: x, cy: y, rx: R * 0.2, ry: R * 0.17, fill: '#0c0618' }));
  p.push(el('ellipse', { cx: x, cy: y, rx: R * 0.2, ry: R * 0.17, fill: 'none', stroke: c2, 'stroke-width': 1.6, opacity: 0.6 }));
  return g({}, p);
}

function scallop(s, x, y, R, rot, c) {
  const p = [];
  let d = '';
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (i / n) * Math.PI, a2 = Math.PI + ((i + 0.5) / n) * Math.PI;
    d += (i ? 'L' : 'M') + (Math.cos(a) * R).toFixed(1) + ' ' + (Math.sin(a) * R).toFixed(1);
    if (i < n) d += `Q${(Math.cos(a2) * R * 1.12).toFixed(1)} ${(Math.sin(a2) * R * 1.12).toFixed(1)} ${(Math.cos(a + Math.PI / n) * R).toFixed(1)} ${(Math.sin(a + Math.PI / n) * R).toFixed(1)}`;
  }
  d += `L${R * 0.3} ${R * 0.42}L${-R * 0.3} ${R * 0.42}Z`;
  p.push(el('path', { d, fill: s.rad([[0, '#ffffff'], [0.5, c], [1, '#6a7a9a']], 0.5, 0.9, 1) }));
  for (let i = 1; i < n; i++) {
    const a = Math.PI + (i / n) * Math.PI;
    p.push(el('path', { d: `M0 ${R * 0.36}L${Math.cos(a) * R * 0.96} ${Math.sin(a) * R * 0.96}`, stroke: '#5a6a8a', 'stroke-width': 1.3, opacity: 0.6 }));
  }
  return g({ transform: `translate(${x} ${y}) rotate(${rot})` }, p);
}

function snail(s, x, y, R, c) {
  const p = [];
  p.push(el('circle', { cx: x, cy: y, r: R, fill: s.rad([[0, '#ffffff'], [0.5, c], [1, '#5a5a7a']], 0.35, 0.3, 0.8) }));
  const pts = [];
  for (let k = 0; k <= 26; k++) { const t = k / 26, a = t * 11, d = R * 0.9 * (1 - t); pts.push([x + Math.cos(a) * d, y + Math.sin(a) * d]); }
  p.push(el('path', { d: spline(pts, false, 3), fill: 'none', stroke: '#5a4a6a', 'stroke-width': 1.8, opacity: 0.7 }));
  return g({}, p);
}

function starfish(s, x, y, R, rot, c) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = rot + i * Math.PI / 5, rr = i % 2 ? R * 0.4 : R;
    d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr * 0.9).toFixed(1);
  }
  const p = [el('path', { d: d + 'Z', fill: c, stroke: c, 'stroke-width': R * 0.22, 'stroke-linejoin': 'round' })];
  for (let i = 0; i < 5; i++) {
    const a = rot + i * 2 * Math.PI / 5;
    for (const k of [0.25, 0.5, 0.75]) p.push(el('circle', { cx: x + Math.cos(a) * R * k, cy: y + Math.sin(a) * R * k * 0.9, r: R * 0.06, fill: '#fff0d8', opacity: 0.8 }));
  }
  return g({ filter: s.emboss({ color: '#ffffff', az: 235, elev: 30, depth: 3, k: 0.5, blur: 2 }) }, p);
}

function coin(s, x, y, rr, r) {
  const sq = r.range(0.5, 0.75);
  return g({}, [
    el('ellipse', { cx: x + 2, cy: y + 4, rx: rr, ry: rr * sq, fill: '#01050c', opacity: 0.6 }),
    el('ellipse', { cx: x, cy: y + 1.6, rx: rr, ry: rr * sq, fill: '#7a4a12' }),
    el('ellipse', { cx: x, cy: y, rx: rr, ry: rr * sq, fill: s.rad([[0, '#fff6c0'], [0.5, '#f0b848'], [1, '#a86a1c']], 0.35, 0.3, 0.8) }),
    el('ellipse', { cx: x, cy: y, rx: rr * 0.55, ry: rr * sq * 0.55, fill: 'none', stroke: '#a86a1c', 'stroke-width': 1, opacity: 0.6 }),
  ]);
}

function gem(s, x, y, R, c) {
  return g({}, [
    el('circle', { cx: x, cy: y, r: R * 2.6, fill: c, opacity: 0.25, filter: 'url(#glow8)' }),
    el('path', { d: `M${x} ${y - R}L${x + R * 0.8} ${y - R * 0.2}L${x} ${y + R}L${x - R * 0.8} ${y - R * 0.2}Z`, fill: c, stroke: '#ffffff', 'stroke-width': 1, 'stroke-opacity': 0.6 }),
    el('path', { d: `M${x} ${y - R}L${x + R * 0.8} ${y - R * 0.2}L${x} ${y}Z`, fill: '#fff', opacity: 0.55 }),
    el('path', { d: `M${x} ${y + R}L${x - R * 0.8} ${y - R * 0.2}L${x} ${y}Z`, fill: '#000', opacity: 0.25 }),
  ]);
}

function chest(s, r, x, y) {
  // an open sea-chest from above and in front: the raised lid behind, the heap of gold, the front boards
  const p = [];
  const w = 120, wood = s.lin([[0, '#6a4a34'], [1, '#2a1a1a']]), iron = s.lin([[0, '#8fa8b8'], [1, '#2a3a4c']]);
  // lid, thrown back
  p.push(el('path', { d: `M${x - w} ${y - 30}L${x - w + 12} ${y - 118}Q${x} ${y - 140} ${x + w - 12} ${y - 118}L${x + w} ${y - 30}Z`, fill: s.lin([[0, '#3a2620'], [1, '#1a1014']]) }));
  for (const dx of [-70, 0, 70]) p.push(el('path', { d: `M${x + dx - 7} ${y - 30}L${x + dx * 0.9 - 6} ${y - 126}L${x + dx * 0.9 + 6} ${y - 126}L${x + dx + 7} ${y - 30}Z`, fill: iron, opacity: 0.8 }));
  // the open mouth and the hoard
  p.push(el('path', { d: `M${x - w} ${y - 30}L${x + w} ${y - 30}L${x + w + 8} ${y + 34}L${x - w - 8} ${y + 34}Z`, fill: '#0a0608' }));
  p.push(el('ellipse', { cx: x, cy: y + 6, rx: w * 0.95, ry: 40, fill: '#ffc850', opacity: 0.5, filter: 'url(#glow16)' }));
  for (let i = 0; i < 70; i++) {
    const cx = x + r.range(-w + 14, w - 14), cy = y + r.range(-26, 30) - Math.cos(((cx - x) / w) * 1.5) * 12;
    p.push(coin(s, cx, cy, r.range(8, 12), r));
  }
  p.push(gem(s, x - 40, y - 10, 12, '#ff5a8a'), gem(s, x + 52, y + 2, 11, '#5fe6ff'));
  for (let i = 0; i < 9; i++) p.push(el('circle', { cx: x - 20 + i * 11, cy: y + 16 + Math.sin(i * 0.8) * 7, r: 5, fill: s.rad([[0, '#ffffff'], [1, '#b8c8e0']], 0.35, 0.3, 0.8) }));
  // the front
  p.push(el('path', { d: `M${x - w - 8} ${y + 34}L${x + w + 8} ${y + 34}L${x + w} ${y + 100}L${x - w} ${y + 100}Z`, fill: wood }));
  for (const yy of [56, 78]) p.push(el('path', { d: `M${x - w - 6} ${y + yy}L${x + w + 6} ${y + yy}`, stroke: '#1a1010', 'stroke-width': 2.5, opacity: 0.6 }));
  for (const dx of [-78, 0, 78]) p.push(el('rect', { x: x + dx - 8, y: y + 32, width: 16, height: 70, fill: iron }));
  p.push(el('rect', { x: x - 16, y: y + 44, width: 32, height: 30, rx: 5, fill: s.lin([[0, '#ffe9a0'], [1, '#a86a1c']]) }));
  p.push(el('circle', { cx: x, cy: y + 56, r: 5, fill: '#2a1a0a' }));
  p.push(glint(x - 60, y - 18, 16, '#fff6c8'), glint(x + 30, y - 4, 12, '#fff6c8'));
  return g({}, p);
}

function amphora(s, x, y, k, rot) {
  const p = [];
  const clay = s.lin([[0, '#c08a64'], [0.45, '#7e5040'], [1, '#2a1c2a']], 0, 0, 1, 1);
  p.push(el('path', { d: 'M-24 -110Q-30 -120 -22 -128L22 -128Q30 -120 24 -110L18 -70Q64 -40 58 30Q50 100 0 130Q-50 100 -58 30Q-64 -40 -18 -70Z', fill: clay }));
  p.push(el('path', { d: 'M-22 -104Q-70 -90 -52 -30', fill: 'none', stroke: '#8a5a46', 'stroke-width': 11, 'stroke-linecap': 'round' }));
  p.push(el('path', { d: 'M22 -104Q70 -90 52 -30', fill: 'none', stroke: '#5a3838', 'stroke-width': 11, 'stroke-linecap': 'round' }));
  for (const yy of [-20, 0, 60]) p.push(el('path', { d: `M${-56 + Math.abs(yy) * 0.1} ${yy}Q0 ${yy + 14} ${56 - Math.abs(yy) * 0.1} ${yy}`, fill: 'none', stroke: '#2a1a24', 'stroke-width': 4, opacity: 0.6 }));
  p.push(el('ellipse', { cx: 0, cy: -128, rx: 22, ry: 7, fill: '#120a10' }));
  for (const [bx, by, br] of [[-30, 40, 9], [-18, 58, 6], [26, -10, 7], [10, 90, 8], [-40, 10, 5]]) p.push(el('circle', { cx: bx, cy: by, r: br, fill: '#3a8a80', opacity: 0.55 }));
  return g({ transform: `translate(${x} ${y}) rotate(${rot}) scale(${k})`, filter: s.emboss({ color: '#bfe6e6', az: 235, elev: 30, depth: 6, k: 0.6, blur: 5 }) }, p);
}

function clam(s, r, x, y, R) {
  // a giant clam, gaping: two fluted valves with wavy lips, a jewelled mantle between, a pearl
  const p = [];
  const n = 5;
  const valve = (dy, dir, depth, fill) => {
    // dir -1: the far valve, rising behind; +1: the near valve, falling toward us
    let d = `M${x - R} ${y + dy}`;
    for (let i = 0; i < n; i++) {
      const x0 = x - R + (2 * R / n) * i, x1 = x0 + 2 * R / n;
      d += `Q${(x0 + x1) / 2} ${y + dy - 30} ${x1} ${y + dy}`;
    }
    d += `Q${x + R * 1.02} ${y + dy + dir * depth * 0.8} ${x + R * 0.5} ${y + dy + dir * depth}L${x - R * 0.5} ${y + dy + dir * depth}Q${x - R * 1.02} ${y + dy + dir * depth * 0.8} ${x - R} ${y + dy}Z`;
    const out = [el('path', { d, fill })];
    for (let i = 0; i <= n; i++) {
      const x0 = x - R + (2 * R / n) * i;
      out.push(el('path', { d: `M${x0} ${y + dy}Q${x0 + (x - x0) * 0.3} ${y + dy + dir * depth * 0.6} ${x + (x0 - x) * 0.42} ${y + dy + dir * depth}`, fill: 'none', stroke: '#2a3050', 'stroke-width': 5, opacity: 0.4, filter: 'url(#glow2)' }));
      if (i < n) {
        const xm = x0 + R / n;
        out.push(el('path', { d: `M${xm} ${y + dy - 12}Q${xm + (x - xm) * 0.3} ${y + dy + dir * depth * 0.55} ${x + (xm - x) * 0.42} ${y + dy + dir * depth * 0.95}`, fill: 'none', stroke: '#ffffff', 'stroke-width': 7, opacity: 0.3, filter: 'url(#glow4)' }));
      }
    }
    return g({ filter: s.emboss({ color: '#ffffff', az: 235, elev: 30, depth: 6, k: 0.6, blur: 4 }) }, out);
  };
  p.push(valve(-22, -1, 70, s.lin([[0, '#56608a'], [1, '#a8a8c0']])));
  // the mantle: velvet violet, beaded with tiny lights
  p.push(el('path', { d: `M${x - R * 0.98} ${y}Q${x} ${y - 46} ${x + R * 0.98} ${y}Q${x} ${y + 40} ${x - R * 0.98} ${y}Z`, fill: s.rad([[0, '#ff9ae0'], [0.5, '#9a3ab8'], [1, '#2a1050']]) }));
  for (let i = 0; i < 15; i++) {
    const t = (i + 0.5) / 15, bx = x - R * 0.86 + t * R * 1.72, by = y - 18 * Math.sin(t * Math.PI) + (i % 2 ? 9 : -3);
    p.push(el('circle', { cx: bx, cy: by, r: 3.6, fill: '#7ff6e6', opacity: 0.9 }));
    p.push(el('circle', { cx: bx, cy: by, r: 8, fill: '#5ff0e0', opacity: 0.3, filter: 'url(#glow4)' }));
  }
  p.push(el('circle', { cx: x + 8, cy: y - 4, r: 50, fill: '#eafcff', opacity: 0.45, filter: 'url(#glow16)' }));
  p.push(el('circle', { cx: x + 8, cy: y - 6, r: 21, fill: s.rad([[0, '#ffffff'], [0.6, '#e4ecfa'], [1, '#8a9ac8']], 0.35, 0.3, 0.8) }));
  p.push(el('circle', { cx: x + 1, cy: y - 13, r: 5, fill: '#fff', opacity: 0.9 }));
  p.push(valve(22, 1, 96, s.lin([[0, '#f0e6e0'], [0.45, '#a8a4c0'], [1, '#3a4266']])));
  return g({}, p);
}

function sword(s, x, y, rot) {
  // an old blade lying on the sand
  const p = [];
  p.push(el('path', { d: 'M0 -7L210 -4L236 0L210 4L0 7Z', fill: s.lin([[0, '#d8ecf4'], [0.5, '#7a98b0'], [1, '#2a3e5a']]) }));
  p.push(el('path', { d: 'M0 0L226 0', stroke: '#2a3e5a', 'stroke-width': 1.5, opacity: 0.6 }));
  p.push(el('rect', { x: -10, y: -30, width: 13, height: 60, rx: 5, fill: s.lin([[0, '#ffe9a0'], [1, '#8a5416']]) }));
  p.push(el('rect', { x: -58, y: -6, width: 50, height: 12, rx: 5, fill: '#3a2228' }));
  p.push(el('circle', { cx: -64, cy: 0, r: 11, fill: s.rad([[0, '#fff6c0'], [1, '#a86a1c']], 0.35, 0.3, 0.8) }));
  for (const bx of [60, 130, 168]) p.push(el('ellipse', { cx: bx, cy: 1, rx: 12, ry: 5, fill: '#1c4a4a', opacity: 0.6 }));
  return g({ transform: `translate(${x} ${y}) rotate(${rot})` }, p);
}
