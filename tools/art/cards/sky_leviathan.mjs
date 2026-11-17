// LEVIATHAN OF THE SUNKEN SKY (legendary) — a colossal, solemn, friendly whale with constellations drawn across its
// back, swimming past the drowned moon over a sea floor of sunken clouds; a tiny diver for scale. Doodle style.
import { el, g, spline, poly, ink, stroke, flat, inkCircle, inkEllipse, sticker, eye, star4, halo, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const BLUE = '#3558cf', BLUE_SH = '#263d9c', BELLY = '#d9e6ff', BELLY_SH = '#a9bdf2', GOLD = '#ffd24d', MOON = '#ffefb5';

export function build(s) {
  const r = s.r;

  // ---- 0: the sunken night sky in flat bands, far stars and far constellations (no ink)
  s.bands([[0, '#252d7c'], [300, '#1d2468'], [570, '#171c55'], [810, '#111543']], { amp: 18, waves: 3 });
  s.shafts({ x: 600, y: -160, angle: 96, spread: 46, n: 4, color: '#9fc0ff', opacity: 0.1, width: 120 });
  const farC = [[[60, 150], [130, 90], [210, 130], [250, 60]], [[70, 560], [130, 620], [90, 700]], [[930, 520], [980, 600], [900, 650], [950, 720]], [[380, 40], [450, 90], [520, 50]]];
  for (const c of farC) {
    s.add(0, el('path', { d: poly(c), fill: 'none', stroke: '#4a5ab8', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    for (const [x, y] of c) s.add(0, el('circle', { cx: x, cy: y, r: 7, fill: '#7f93e6' }));
  }
  s.specks({ n: 60, rmin: 2, rmax: 5, colors: ['#9fb4ff', '#ffe9a8', '#c9b6ff'], opacity: 0.55, layer: 0 });
  s.add(0, flat(cloud(120, 900, 420, 110, 5), '#141a52'), flat(cloud(700, 880, 520, 130, 6), '#141a52'));
  s.lumps({ y: 930, amp: 50, n: 7, fill: '#0e1238', layer: 0 });
  s.paper();

  // ---- 1: the drowned moon with its drawn halo, sunken clouds on the floor
  const mx = 706, my = 236;
  s.add(1, halo(mx, my, 330, MOON, 3, 0.3));
  s.add(1, inkCircle(mx, my, 196, MOON, { w: W_MID }));
  s.add(1, g({ 'clip-path': s.clip(el('circle', { cx: mx, cy: my, r: 196 })) }, [
    el('circle', { cx: mx - 50, cy: my - 40, r: 214, fill: 'none', stroke: '#f5d588', 'stroke-width': 60 }),
    el('ellipse', { cx: mx - 80, cy: my - 96, rx: 30, ry: 22, fill: '#f5d588' }),
    el('ellipse', { cx: mx + 40, cy: my - 130, rx: 20, ry: 15, fill: '#f5d588' }),
    el('ellipse', { cx: mx - 130, cy: my + 10, rx: 16, ry: 12, fill: '#f5d588' }),
  ]));
  s.add(1, stroke(`M${mx - 196} ${my}a196 196 0 1 1 392 0a196 196 0 1 1 -392 0`, { w: W_MID }));
  s.add(1, star4(150, 240, 22, '#ffe9a8', W_DETAIL), star4(930, 470, 18, '#ffe9a8', W_DETAIL), star4(400, 70, 16, '#ffe9a8', W_DETAIL));
  s.add(1, ink(cloud(-140, 985, 520, 230, 5), '#3d4ba8', { w: W_MID }), flat(cloud(-90, 985, 360, 150, 4), '#5262c4'));
  s.add(1, ink(cloud(600, 985, 600, 260, 6), '#3d4ba8', { w: W_MID }), flat(cloud(690, 985, 400, 170, 5), '#5262c4'));
  s.lumps({ y: 985, amp: 50, n: 6, fill: '#252c78', layer: 1, w: W_MID });

  // ---- 2: the Leviathan
  const body = spline([[112, 432], [150, 292], [300, 198], [480, 172], [640, 204], [746, 262], [812, 258], [852, 204], [872, 150], [914, 172], [902, 282], [852, 402], [760, 500], [600, 586], [420, 620], [250, 602], [150, 532]], true, 12);
  const fluke = 'M866 196C822 176 778 132 764 74C814 74 866 102 890 146C916 108 958 90 1002 98C986 150 950 188 906 204Z';
  const flipFar = 'M236 590C240 660 280 716 344 730C350 676 330 618 296 580Z';
  const flipNear = 'M404 560C426 650 486 730 580 756C600 700 560 606 496 548Z';
  const out = [];
  out.push(sticker([{ d: flipFar, fill: BLUE_SH }, { d: fluke, fill: BLUE }, { d: body, fill: BLUE }, { d: flipNear, fill: BLUE }]));
  out.push(g({ 'clip-path': s.clip(el('path', { d: fluke })) }, [flat('M896 40L1060 40L1060 240L880 240C924 190 932 120 896 40Z', BLUE_SH)]));
  out.push(stroke(fluke, { w: W_INNER }), stroke('M800 104Q840 130 868 176', { w: W_DETAIL }), stroke('M964 118Q930 142 906 184', { w: W_DETAIL }));
  // the body: one hard shadow tone, the pale belly, the constellations
  const mouth = bez([80, 462], [220, 532], [420, 532], [600, 470]);
  const belly = poly([...mouth, [720, 424], [800, 350], [880, 230], [1000, 400], [800, 720], [60, 720]], true);
  const K = [
    { p: [[244, 316], [300, 262], [356, 300], [412, 244], [470, 290]], big: [1, 3] },
    { p: [[520, 232], [586, 296], [660, 280], [730, 326]], big: [0] },
    { p: [[586, 296], [604, 372], [684, 358], [660, 280]], big: [2] },
    { p: [[742, 414], [792, 350], [830, 290], [868, 226]], big: [3] },
    { p: [[474, 392], [532, 430], [468, 452], [474, 392]], big: [] },
  ];
  const stars = [];
  for (const k of K) stars.push(el('path', { d: poly(k.p), fill: 'none', stroke: '#ffe9a8', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  for (const k of K) k.p.forEach(([x, y], i) => stars.push(k.big.includes(i) ? star4(x, y, 26, GOLD, 4) : inkCircle(x, y, 10, GOLD, { w: 4 })));
  [[196, 392], [520, 330], [640, 420], [330, 352], [700, 246], [562, 196]].forEach(([x, y]) => stars.push(el('circle', { cx: x, cy: y, r: 5, fill: '#ffe9a8' })));
  out.push(g({ 'clip-path': s.clip(el('path', { d: body })) }, [
    flat('M60 404C240 484 430 478 600 414C700 376 790 300 850 170L1000 200L900 640L60 640Z', BLUE_SH),
    flat(belly, BELLY),
    flat('M100 560C260 640 450 640 620 590C740 550 830 470 890 380L940 700L100 700Z', BELLY_SH),
    stroke('M150 516C240 560 340 572 440 556', { w: W_DETAIL }),
    stroke('M190 560C270 590 350 598 430 590', { w: W_DETAIL }),
    stroke('M470 548C540 536 600 516 650 490', { w: W_DETAIL }),
    ...stars,
    // hard highlights
    flat('M176 350C184 286 232 240 296 224C250 262 222 304 212 354Z', '#ffffff', { opacity: 0.9 }),
    el('circle', { cx: 190, cy: 386, r: 11, fill: '#fff', opacity: 0.9 }),
  ]));
  out.push(stroke(body, { w: W_INNER }));
  // the near flipper over the belly
  out.push(ink(flipNear, BLUE, { w: W_INNER }), g({ 'clip-path': s.clip(el('path', { d: flipNear })) }, [flat('M400 540L470 540C520 620 560 690 600 780L400 780Z', BLUE_SH)]), stroke(flipNear, { w: W_INNER }));
  // the face: a long calm mouth, a heavy-lidded eye, a blush
  const mEnd = mouth.slice(1, 13);
  out.push(stroke(spline([...mEnd.filter((_, i) => i % 3 === 0), [352, 512], [392, 496], [408, 470]], false), { w: W_INNER }));
  out.push(eye(388, 410, 36, { look: [-0.45, 0.25], lid: 0.3, lidRot: 6, lidFill: BLUE_SH }));
  out.push(inkEllipse(318, 462, 24, 13, '#ff9fc6', { w: 0, stroke: 'none', opacity: 0.85 }));
  s.add(2, g({ filter: s.wobble(5) }, out));

  // ---- 3: the tiny diver, a near cloud, sparkles and bubbles
  s.add(3, ink(cloud(-200, 1010, 520, 150, 5), '#5b6cd2', { w: W_SUBJECT }), flat(cloud(-150, 1000, 360, 60, 4), '#7b8be8'));
  s.add(3, ink(cloud(760, 1040, 460, 130, 4), '#5b6cd2', { w: W_SUBJECT }), flat(cloud(800, 1030, 300, 50, 3), '#7b8be8'));
  s.add(3, g({ filter: s.wobble(3, 0.02, 9) }, diver(168, 716, 1.25, -24)));
  s.add(3, ...[[196, 640, 11], [176, 606, 8], [204, 580, 6]].map(([x, y, rr]) => g({}, [inkCircle(x, y, rr, '#bfd9ff', { w: W_DETAIL - 1, 'fill-opacity': 0.4 }), el('circle', { cx: x - rr * 0.3, cy: y - rr * 0.3, r: rr * 0.24, fill: '#fff' })])));
  s.inkBubbles({ n: 4, x0: 20, x1: 140, y0: 180, y1: 600, rmin: 8, rmax: 20, fill: '#bfd9ff' });
  s.inkBubbles({ n: 4, x0: 600, x1: 1000, y0: 520, y1: 800, rmin: 8, rmax: 20, fill: '#bfd9ff' });
  s.add(3, star4(96, 120, 34, GOLD), star4(330, 110, 22), star4(946, 330, 26, GOLD), star4(700, 660, 22, '#ffe9a8'), star4(90, 420, 20), star4(880, 640, 16), star4(520, 690, 14, GOLD));
  s.specks({ n: 16, rmin: 3, rmax: 7, colors: ['#ffffff', '#ffe9a8', '#c9d6ff'], opacity: 0.9 });
}

// ---------------------------------------------------------------------------------------------------- helpers

/** A cubic bezier sampled to points. */
function bez(a, b, c, d, n = 24) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]);
  }
  return out;
}

/** A doodle cloud bank: a flat base at y with n round bumps on top, w wide and h tall. */
function cloud(x, y, w, h, n) {
  const P = [];
  for (let i = 0; i <= n; i++) P.push([x + (w / n) * i, y - h * Math.sin((i / n) * Math.PI) * (i % 2 ? 1 : 0.8)]);
  let d = `M${x} ${y + 240}L${P[0][0]} ${P[0][1]}`;
  for (let i = 0; i < n; i++) {
    const rr = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]) * 0.56;
    d += `A${rr} ${rr} 0 0 1 ${P[i + 1][0]} ${P[i + 1][1]}`;
  }
  return d + `L${x + w} ${y + 240}Z`;
}

/** The tiny diver: brass helmet, pale suit, little flippers. */
function diver(x, y, k, rot) {
  const parts = [
    { d: 'M-12 12L-22 46L-34 60L-8 58L-6 40Z', fill: '#ff8fb0' },
    { d: 'M10 12L18 46L10 62L36 56L26 40Z', fill: '#ff8fb0' },
    { d: 'M-18 -6L-38 14L-28 24L-10 8Z', fill: '#f4efe4' },
    { d: 'M18 -6L40 -20L34 -32L12 -16Z', fill: '#f4efe4' },
    { d: 'M-18 -12Q0 -22 18 -12L16 30Q0 38 -16 30Z', fill: '#f4efe4' },
    { d: 'M-24 -34a24 24 0 1 1 48 0a24 24 0 1 1 -48 0', fill: '#ffcb52' },
  ];
  return g({ transform: `translate(${x} ${y}) rotate(${rot}) scale(${k})` }, [
    sticker(parts, { outer: 7, inner: 4 }),
    inkCircle(4, -36, 13, '#bfe6ff', { w: 4 }), el('circle', { cx: 0, cy: -40, r: 4, fill: '#fff' }),
  ]);
}
