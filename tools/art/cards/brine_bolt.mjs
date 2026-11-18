// BRINE BOLT (common spell) — a fat zig-zag spear of water-lightning thrown down across the dark from off the top
// of the picture, crowns of spray bursting off it. No creature: one bold graphic shape with the same ink line as everything else.
import { el, g, poly, ink, stroke, flat, inkCircle, star4, halo, waveBand, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const CYAN = '#62defc', CYAN_D = '#2f9be8', AQUA = '#86f2dc', AQUA_D = '#3cc2bd', HOT = '#fff0a6';
// The bolt is drawn standing up (tail at the top, point at the bottom) and tipped over into place.
const ANG = -35, SC = 0.95, OX = 520, OY = 505;
const TF = `translate(${OX} ${OY}) rotate(${ANG}) scale(${SC})`;
const CA = Math.cos(ANG * Math.PI / 180), SA = Math.sin(ANG * Math.PI / 180);
const W_OUT = 16 / SC; // the bolt's outer line: the set's 16 contour once the bolt has been scaled into place
const toC = (x, y) => [OX + (x * CA - y * SA) * SC, OY + (x * SA + y * CA) * SC];

export function build(s) {
  const r = s.r;
  const [tx, ty] = toC(50, 395); // where the point lands

  // ---- 0: navy in flat bands, and ONE flat disc of the navy lightened toward the bolt's blue behind the strike (with
  // the aura hugging the bolt in layer 2 that makes the set's clean two-step halo; no bands of light, no third ring)
  s.bands([[0, '#1c317e'], [310, '#17286a'], [590, '#121f57'], [830, '#0d1745']], { amp: 18, waves: 3 });
  s.add(0, halo(500, 440, 294, ['#223f8c']));
  for (let i = 0; i < 9; i++) r(); // the nine draws three light shafts used to take here: keeps every speck where it was
  s.specks({ n: 40, rmin: 2, rmax: 5, colors: ['#8fd0ff', '#b9a6ff'], opacity: 0.5, layer: 0 });
  s.add(0, flat(waveBand(1024, 1024, 800, 22, 2.5, 1.2), '#0a1238'));
  s.paper();

  // ---- 1: far forks, streaks of rain along the bolt's line, the dark swell it is falling into
  s.add(1, fork([[838, 96], [800, 190], [856, 200], [812, 316]], '#6f9fea'), fork([[150, 470], [118, 560], [168, 566], [136, 664]], '#6f9fea'));
  const rain = [];
  for (const [x, y, len] of [[690, 250, 90], [760, 380, 60], [250, 560, 80], [330, 700, 60], [900, 560, 70], [120, 300, 60], [600, 120, 50]]) {
    rain.push(`M${x} ${y}l${-SA * len} ${CA * len}`);
  }
  s.add(1, el('path', { d: rain.join(''), fill: 'none', stroke: '#4f86e0', 'stroke-width': 9, 'stroke-linecap': 'round', opacity: 0.7 }));
  s.add(1, ink(waveBand(1024, 1024, 846, 16, 3.5, 0.4), '#1b3a94', { w: W_MID }));
  s.add(1, stroke('M120 880q40 -16 80 0M430 872q34 -14 68 0M880 884q36 -14 72 0', { w: W_MID - 2, stroke: '#4f86e0' }));
  s.add(1, ink(waveBand(1024, 1024, 914, 14, 4.5, 2.4), '#15307c', { w: W_MID }));

  // ---- 2: the bolt
  // it comes in from beyond the top-left corner: A and B are far off the canvas, so the bolt has no upper end
  const A = [-68, -760], B = [56, -760];
  const pts = [B, [-55, -340], [60, -365], [-5, -120], [110, -145], [46, 100], [156, 75], [50, 395], [-18, 190], [-123, 215], [-61, -25], [-166, 0], [-104, -240], [-209, -215], A];
  const boltD = poly(pts) + 'Z';
  const bolt = [];
  // drawn light: one flat opaque step of glow hugging the shape (the disc's blue lightened again toward the bolt).
  // It is cut off level with the strike, behind the star's arms, so no sliver of it shows underneath them.
  bolt.push(g({ 'clip-path': s.clip(el('rect', { x: 0, y: 0, width: 1024, height: ty + 8 })) }, [g({ transform: TF }, [
    el('path', { d: boltD, fill: '#3e6eaf', stroke: '#3e6eaf', 'stroke-width': 80, 'stroke-linejoin': 'round' }),
  ])]));
  // splash rings: far halves behind the bolt
  // crowns of spray, not hoops: the far half of each passes behind the bolt, the near half is burst open where the
  // bolt goes through and breaks into droplets there. [cx, cy, rx, ry, left piece ends at, right piece ends at (deg),
  // droplets across the gap [deg, size, tilt]]
  const rings = [[-82, -440, 140, 40, 142, 54, [[112, 9, -24], [84, 9, 20]]], [-5, 32, 235, 58, 130, 26, [[119, 10, -40], [104, 11, -20], [86, 11, 16]]]];
  const hit = [tx - 6, ty - 4, 150, 40, 116, 64, []];
  bolt.push(g({ transform: TF }, rings.map((q) => ring(...q, 'back'))));
  bolt.push(ring(...hit, 'back'));
  // the shape itself: flat cyan, one hard shadow down its right-hand edges, a white-hot core
  bolt.push(g({ transform: TF }, [
    ink(boltD, CYAN_D, { w: W_OUT }),
    g({ 'clip-path': s.clip(el('path', { d: boltD })) }, [
      el('path', { d: boltD, fill: CYAN, transform: 'translate(-36 -8)' }),
      el('path', { d: 'M-8 -770L-126 -314L-20 -340L-90 -72L16 -98L-48 150L54 126L46 292', fill: 'none', stroke: HOT, 'stroke-width': 26, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }),
    ]),
    stroke(boltD, { w: W_OUT }),
    ...rings.map((q) => ring(...q, 'front')),
  ]));
  bolt.push(ring(...hit, 'front'));
  // the strike: a big warm star, the one hot thing in all the blue
  bolt.push(star4(tx, ty - 6, 93, '#ffe27a', W_INNER), star4(tx, ty - 6, 39, '#fffbe4', 0, 45));
  s.add(2, g({ filter: s.wobble(5) }, bolt));

  // ---- 3: thrown droplets, sparks, the near swell
  const drops = [
    [toC(-250, -262), 20, -70], [toC(-300, -200), 12, -80], [toC(160, -262), 18, 60], [toC(210, -214), 11, 75],
    [toC(-280, 90), 16, -75], [toC(190, -70), 14, 70], [toC(270, -6), 9, 80],
    [[tx - 176, ty - 44], 16, -60], [[tx + 150, ty - 70], 18, 50], [[tx - 96, ty - 96], 12, -25], [[tx + 62, ty - 112], 13, 20], [[tx + 214, ty - 22], 10, 70],
  ];
  s.add(3, drops.map(([p, k, a]) => drop(p[0], p[1], k, a)));
  s.add(3, star4(742, 232, 32), star4(112, 404, 22, '#fff3a8'), star4(858, 506, 20), star4(408, 760, 18, '#fff3a8'), star4(560, 150, 16));
  s.specks({ n: 16, rmin: 3, rmax: 7, colors: ['#ffffff', '#bfefff', '#fff3a8'], opacity: 0.9 });
  s.add(3, ink(waveBand(1024, 1024, 978, 18, 2.5, 4), '#0e1d5a', { w: W_INNER }));
}

/** Half of a crown of spray seen nearly edge-on. 'back' is the far (upper) arc, whole. 'front' is the near one,
 *  burst open in the middle: two side pieces that stop at `aL` and `aR` degrees (0 = right end, 90 = nearest point,
 *  180 = left end), and `beads` ([deg, size, tilt]) are the droplets it has broken into across the gap. */
function ring(cx, cy, rx, ry, aL, aR, beads, half) {
  const P = (deg, k = 1) => [cx + rx * k * Math.cos(deg * Math.PI / 180), cy + ry * k * Math.sin(deg * Math.PI / 180)];
  const f = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  const band = (d, color) => [
    el('path', { d, fill: 'none', stroke: INK, 'stroke-width': 16 + W_INNER * 2, 'stroke-linecap': 'round' }),
    el('path', { d, fill: 'none', stroke: color, 'stroke-width': 16, 'stroke-linecap': 'round' }),
  ];
  if (half === 'back') return g({}, band(`M${cx - rx} ${cy}A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`, AQUA_D));
  const out = band(`M${cx - rx} ${cy}A${rx} ${ry} 0 0 0 ${f(P(aL))}M${cx + rx} ${cy}A${rx} ${ry} 0 0 1 ${f(P(aR))}`, AQUA);
  for (const [deg, k, rot] of beads) { const p = P(deg); out.push(drop(p[0], p[1], k, rot, AQUA)); }
  return g({}, out);
}

/** A far fork of lightning: a zig-zag line with the mid-distance ink round it. */
function fork(pts, color) {
  const d = poly(pts);
  return g({ opacity: 0.9 }, [
    el('path', { d, fill: 'none', stroke: INK, 'stroke-width': 12 + W_MID * 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }),
    el('path', { d, fill: 'none', stroke: color, 'stroke-width': 12, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }),
  ]);
}

/** A doodle droplet at (x, y), size k, its point trailing at `rot` degrees. */
function drop(x, y, k, rot, fill = CYAN) {
  return g({ transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot})` }, [
    ink(`M0 ${-k * 1.5}C${k * 0.5} ${-k * 0.6} ${k} ${-k * 0.1} ${k} ${k * 0.3}A${k} ${k} 0 0 1 ${-k} ${k * 0.3}C${-k} ${-k * 0.1} ${-k * 0.5} ${-k * 0.6} 0 ${-k * 1.5}Z`, fill, { w: W_DETAIL }),
    el('circle', { cx: -k * 0.32, cy: k * 0.2, r: k * 0.26, fill: '#fff' }),
  ]);
}
