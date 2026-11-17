// MAELSTROM (epic spell) — the whole sea winding down into one bright eye: a fat spiral of water, chunky zig-zag
// lightning out of the cloud, and very small ships and planks going round and in. Steel blue, cyan-white core.
// Doodle style: see the DOODLE KIT in lib.mjs.
import { el, g, spline, ribbon, poly, ink, stroke, flat, inkCircle, star4, halo, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const CX = 512, CY = 486, R = 318, SQ = 0.86, TURNS = 1.75, A0 = -2.3, GAP = 80;
const DARK = ['#1f3a6e', '#274a84', '#31599a'], LIGHT = ['#5f93d0', '#8cbdea', '#bfe8fb'], CORE = '#eaffff', BOLT = '#ffe66b', WOOD = '#c98a5a', CANVAS = '#fff2d2';
const P = (rad, a) => [CX + Math.cos(a) * rad, CY + Math.sin(a) * rad * SQ];
/** A point on the spiral: t = 0 at the rim, 1 at the eye; dr pushes it outward. */
const sp = (t, dr = 0) => P(R * (1 - t * 0.9) + dr, A0 + t * TURNS * 2 * Math.PI);
const arc = (t0, t1, dr = 0, n = 28) => Array.from({ length: n + 1 }, (_, i) => sp(t0 + (t1 - t0) * i / n, dr));
const disc = (rad, fill) => el('ellipse', { cx: CX, cy: CY, rx: rad, ry: rad * SQ, fill });

export function build(s) {
  // ---- 0: storm sky over a slate sea, in flat bands; far cloud with no ink
  s.bands([[0, '#262e56'], [236, '#35527f'], [520, '#2d4672'], [800, '#243a61']], { amp: 16, waves: 3 });
  s.shafts({ x: 512, y: -160, angle: 90, spread: 50, n: 4, color: '#bfe6ff', opacity: 0.09, width: 110 });
  s.add(0, ...[[90, 60, 120], [270, 20, 130], [470, 50, 120], [680, 16, 140], [880, 60, 130], [1010, 130, 80], [0, 150, 70]].map(([x, y, rr]) => el('circle', { cx: x, cy: y, r: rr, fill: '#1c2345' })));
  s.add(0, ...[[120, 420], [820, 380], [900, 640], [80, 700], [300, 900], [700, 920]].map(([x, y]) => flat(`M${x - 50} ${y}q25 -22 50 0q25 22 50 0q-25 34 -50 12q-25 -22 -50 -12Z`, '#3f5f90')));
  s.specks({ n: 36, rmin: 2, rmax: 5, colors: ['#9fc4ff', '#dff3ff'], opacity: 0.45, layer: 0 });
  s.paper();

  // ---- 1: the sea already turning round the hole, and the storm cloud: thinner line, quiet colour
  const outer = ribbon(arc(-1.95, 0.04, 0, 130), 86, 86, (u) => 1 + 0.5 * Math.max(0, 1.95 - 1.99 * u), 1);
  s.add(1, ink(outer, '#466aa2', { w: W_MID }));
  s.add(1, ...[[-1.3, -1.2], [-1.02, -0.9], [-0.76, -0.66], [-0.5, -0.41], [-0.27, -0.19], [-0.08, -0.02]].map(([a0, a1]) => flat(ribbon(arc(a0, a1, -GAP * (1 - a0 * 0.3), 14), 20, 20, (u) => Math.sin(Math.PI * u), 1), '#86a8dc')));
  s.add(1, ...[[-1.16, -1.08], [-0.9, -0.8], [-0.6, -0.52], [-0.36, -0.29], [-0.14, -0.08]].map(([a0, a1]) => stroke(poly(arc(a0, a1, 8, 10)), { w: W_DETAIL })));
  const cloud = [[40, 40, 110], [200, 6, 120], [380, 30, 110], [560, 0, 120], [740, 24, 120], [900, 10, 110], [1020, 60, 90], [-30, 110, 80]];
  s.add(1, g({}, [...cloud.map(([x, y, rr]) => inkCircle(x, y, rr, INK, { w: W_MID * 2 })), ...cloud.map(([x, y, rr]) => el('circle', { cx: x, cy: y, r: rr, fill: '#414c80' })),
    ...cloud.map(([x, y, rr]) => flat(`M${x - rr * 0.7} ${y + rr * 0.5}Q${x} ${y + rr * 1.02} ${x + rr * 0.7} ${y + rr * 0.5}Q${x} ${y + rr * 0.8} ${x - rr * 0.7} ${y + rr * 0.5}Z`, '#59659c'))]));

  // ---- 2: the whirlpool, its eye, and the lightning
  const rim = bumpy(R, 9, 12, 0);
  const arm = ribbon(arc(0, 1, 0, 110), 86, 86, (t) => 1 - 0.7 * t * t, 1);
  const streak = (t0, t1, dr, w) => ribbon(arc(t0, t1, dr, 14), w, w, (t) => Math.sin(Math.PI * t), 1);
  const pool = [
    ink(rim, DARK[0], { w: W_SUBJECT * 2, stroke: INK }),
    g({ 'clip-path': s.clip(el('path', { d: rim })) }, [flat(rim, DARK[0]), disc(222, DARK[1]), disc(128, DARK[2])]),
    // the bright arm of the spiral, stepping lighter toward the eye
    g({ 'clip-path': s.clip(el('path', { d: arm })) }, [disc(R + 40, LIGHT[0]), disc(222, LIGHT[1]), disc(128, LIGHT[2])]),
    stroke(arm, { w: W_INNER }),
    // hard foam on the dark water, ink streaks on the light
    ...[[0.04, 0.15], [0.24, 0.33], [0.43, 0.5], [0.6, 0.66]].map(([a, b]) => flat(streak(a, b, -GAP, 16), '#ffffff', { opacity: 0.92 })),
    ...[[0.12, 0.2], [0.36, 0.43], [0.56, 0.62]].map(([a, b]) => stroke(poly(arc(a, b, 6, 10)), { w: W_DETAIL })),
    // the eye: drawn light, a bright core, a star
    halo(CX, CY, 132, '#c9f6ff', 3, 0.55),
    el('ellipse', { cx: CX, cy: CY, rx: 56, ry: 56 * SQ, fill: CORE, stroke: INK, 'stroke-width': W_INNER }),
    star4(CX, CY, 38, '#ffffff', W_DETAIL),
  ];
  const b1 = [[900, -160], [704, 136], [800, 168], [676, 296], [752, 324], [668, 404]], b2 = [[146, -150], [312, 140], [232, 166], [336, 300]];
  const bolts = [
    ink(zap(b1, 104), BOLT, { w: W_SUBJECT * 2, stroke: INK }), flat(zap(b1, 104), BOLT), flat(zap(b1.map(([x, y]) => [x - 8, y + 6]), 30), '#ffffff'), stroke(zap(b1, 104), { w: W_INNER }),
    ink(zap(b2, -80), BOLT, { w: W_SUBJECT * 2, stroke: INK }), flat(zap(b2, -80), BOLT), flat(zap(b2.map(([x, y]) => [x + 6, y + 5]), -24), '#ffffff'), stroke(zap(b2, -80), { w: W_INNER }),
    star4(666, 408, 34, '#ffffff', W_DETAIL), star4(338, 306, 26, '#ffffff', W_DETAIL),
  ];
  s.add(2, g({ filter: s.wobble(5) }, [...pool, ...bolts]));

  // ---- 3: little ships and planks going round and in, spray, sparkles
  s.add(3, g({ filter: s.wobble(3, 0.02, 9) }, [
    boat(...sp(0.08, -GAP), 1.2, -20), boat(...sp(0.3, -GAP), 1.05, 26), boat(...sp(0.5, -GAP), 0.8, -36),
    plank(...sp(0.17, 0), 1.3, 20), plank(...sp(0.37, 0), 1.2, -50), plank(...sp(0.62, 0), 1, 80), plank(...sp(0.14, -GAP), 1.2, 60), plank(...sp(0.4, -GAP), 1.1, -20),
  ]));
  s.add(3, ...[[214, 380, 13, -30], [238, 334, 9, -20], [812, 560, 13, 30], [834, 610, 9, 40], [420, 770, 11, 190], [600, 782, 9, 170], [180, 600, 10, -60]].map(([x, y, rr, rot]) => drop(x, y, rr, rot)));
  s.add(3, star4(150, 300, 24, '#ffffff'), star4(880, 300, 20, BOLT), star4(860, 800, 20, '#ffffff'), star4(170, 820, 22, '#c9f6ff'), star4(470, 180, 16, '#ffffff'));
  s.add(3, g({ opacity: 0.7 }, [[140, 170], [330, 300], [610, 200], [900, 180], [930, 460], [90, 480], [760, 760], [270, 720]].map(([x, y]) => el('path', { d: `M${x} ${y}l-12 34`, stroke: '#dff3ff', 'stroke-width': 6, 'stroke-linecap': 'round', fill: 'none' }))));
  s.specks({ n: 14, rmin: 3, rmax: 7, colors: ['#ffffff', '#c9f6ff'], opacity: 0.9 });
}

/** A closed ring round the whirlpool's centre with `n` soft bumps of height `amp` (a foamy rim). */
function bumpy(rad, amp, n, phase) {
  const pts = [];
  for (let i = 0; i < n * 6; i++) { const a = i / (n * 6) * Math.PI * 2; pts.push(P(rad + Math.cos(a * n + phase) * amp, a)); }
  return spline(pts, true, 3);
}

/** A chunky zig-zag bolt down the centreline `pts`, `w` wide at the top and coming to a point at the last one. */
function zap(pts, w) {
  const n = pts.length - 1, k = (i) => 1 - (i / n) * 0.55;
  const L = pts.slice(0, n).map(([x, y], i) => [x - w * 0.5 * k(i), y + Math.abs(w) * 0.38 * k(i)]);
  const Rr = pts.slice(0, n).map(([x, y], i) => [x + w * 0.5 * k(i), y - Math.abs(w) * 0.38 * k(i)]).reverse();
  return poly([...L, pts[n], ...Rr], true);
}

/** A very small ship: hull, mast, one square sail and a pennant. Line weights stay the same whatever the scale. */
function boat(x, y, k, rot) {
  const hull = `M-46 -6L46 -6L30 18Q0 28 -30 18Z`, sail = `M-24 -54Q0 -60 24 -54Q30 -32 26 -14L-26 -14Q-30 -32 -24 -54Z`, mast = `M0 -6L0 -74`, flag = `M0 -76L24 -68L0 -60Z`;
  const w = (W_DETAIL + 1) / k;
  return g({ transform: `translate(${x} ${y}) rotate(${rot}) scale(${k})` }, [
    ...[hull, sail, mast, flag].map((d) => ink(d, INK, { w: w * 2 + 12 / k })),
    stroke(mast, { w }), ink(flag, BOLT, { w }),
    flat(hull, WOOD), flat(`M-6 6L46 -6L30 18Q14 24 0 25Z`, '#a66a44'), stroke(hull, { w }),
    flat(sail, CANVAS), flat(`M8 -58L24 -54Q30 -32 26 -14L2 -14Z`, '#e8cfa6'), stroke(sail, { w }),
  ]);
}

function plank(x, y, k, rot) {
  return g({ transform: `translate(${x} ${y}) rotate(${rot}) scale(${k})` }, [ink(`M-24 -7H24V7H-24Z`, WOOD, { w: W_DETAIL }), stroke(`M-10 -1H6`, { w: 3 })]);
}

/** A drop of spray. */
function drop(x, y, R0, rot) {
  return g({ transform: `rotate(${rot} ${x} ${y})` }, [
    ink(`M${x} ${y - R0 * 1.7}C${x + R0 * 0.5} ${y - R0 * 0.8} ${x + R0} ${y - R0 * 0.3} ${x + R0} ${y + R0 * 0.2}A${R0} ${R0} 0 1 1 ${x - R0} ${y + R0 * 0.2}C${x - R0} ${y - R0 * 0.3} ${x - R0 * 0.5} ${y - R0 * 0.8} ${x} ${y - R0 * 1.7}Z`, '#c9f6ff', { w: W_DETAIL }),
    el('circle', { cx: x - R0 * 0.3, cy: y + R0 * 0.1, r: R0 * 0.26, fill: '#fff' }),
  ]);
}
