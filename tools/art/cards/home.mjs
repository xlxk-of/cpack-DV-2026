// HOME — the title screen. Night over the drowned sea: a chunky lighthouse on its rock, a flat hard-edged beam, a
// flat starry sky with a couple of stars falling; under the wavy waterline the sea is see-through: sunken ruins, a
// small whale, and the stars that fell in, still shining. The upper-centre sky is kept calm for the logo, and the
// middle 40% of the width works on its own (a phone crops to it).
import { el, g, spline, poly, ribbon, ink, stroke, flat, inkCircle, inkEllipse, eye, star4, halo, waveBand, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;
export const size = [1920, 1200];
export const noThumb = true;

const SEA = 664;            // the waterline
const LX = 1204, LY = 334;  // the lamp
const TY = 362 - LY;        // the tower is drawn with its lamp at y 362, then lifted by this much
const GOLD = '#f6c544', PALE = '#fff3a8';

/** A falling star: an inked head with a flat two-tone tail streaming back along (dx, dy). */
function falling(x, y, s, dx, dy) {
  const len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, px = -uy, py = ux;
  const tail = (w, l, c, o) => flat(poly([[x + px * w, y + py * w], [x + ux * l, y + uy * l], [x - px * w, y - py * w]], true), c, { opacity: o });
  return g({}, [tail(s * 0.5, len, GOLD, 0.45), tail(s * 0.24, len * 0.7, PALE, 0.85), star4(x, y, s, PALE, W_DETAIL, 12)]);
}

/** A drowned star: still alight on the sea bed, its light drawn as flat rings. */
const drowned = (x, y, s, rot = 0) => g({}, [halo(x, y, s * 2.3, '#fff3a0', 3, 0.5), star4(x, y, s, PALE, W_DETAIL, rot)]);

/** A sunken column: shaft, capital and base, flat. `h` tall, standing on y. */
function column(x, y, h, w, fill) {
  return g({}, [flat(`M${x - w / 2} ${y}L${x - w / 2} ${y - h}L${x + w / 2} ${y - h}L${x + w / 2} ${y}Z`, fill),
    flat(`M${x - w * 0.8} ${y - h}L${x + w * 0.8} ${y - h}L${x + w * 0.66} ${y - h + w * 0.36}L${x - w * 0.66} ${y - h + w * 0.36}Z`, fill),
    flat(`M${x - w * 0.8} ${y}L${x + w * 0.8} ${y}L${x + w * 0.8} ${y - w * 0.3}L${x - w * 0.8} ${y - w * 0.3}Z`, fill)]);
}

function cloud(x, y, sc, fill) {
  return g({ transform: `translate(${x} ${y}) scale(${sc})` }, flat('M-150 30C-190 30 -190 -14 -150 -16C-150 -56 -90 -66 -70 -36C-50 -80 30 -80 44 -34C80 -62 136 -34 120 -4C160 -4 160 30 124 30Z', fill));
}

export function build(s) {
  const r = s.r, W = s.w, H = s.h;

  // ---- 0: the night sky in flat bands, far stars, a moon, clouds
  s.bands([[0, '#17144a'], [240, '#1d1a5c'], [430, '#25216e'], [570, '#2f2a82']], { amp: 14, waves: 3 });
  const dots = [];
  for (let i = 0; i < 150; i++) {
    const x = r.range(0, W), y = r.range(0, SEA - 60), calm = x > 620 && x < 1300 && y > 170 && y < 470;
    if (calm && r() < 0.6) continue;
    const rr = calm ? r.range(2, 3.4) : r.range(2, 5.5);
    dots.push(el('circle', { cx: x, cy: y, r: rr, fill: r.pick(['#ffffff', '#ffe9a8', '#b9c6ff']), opacity: r.range(0.45, 0.95) }));
  }
  s.add(0, g({}, dots));
  s.add(0, cloud(250, 520, 1.25, '#25216e'), cloud(1660, 250, 1.1, '#221e66'), cloud(560, 590, 0.8, '#3a3594'), cloud(1790, 560, 1.0, '#3a3594'));
  // the moon: a fat crescent
  const moon = 'M352 96A92 92 0 1 0 452 232A74 74 0 1 1 352 96Z';
  s.add(0, halo(372, 180, 190, '#b9c6ff', 3, 0.2), ink(moon, '#fff6d0', { w: W_INNER }), flat('M318 150A92 92 0 0 0 400 262A74 74 0 0 1 330 150Z', '#e6d49a'), stroke(moon, { w: W_INNER }));
  // far islands on the horizon, flat
  s.add(0, flat(`M60 ${SEA + 10}Q110 600 190 612Q240 570 300 606Q360 600 420 ${SEA + 10}Z`, '#1d1a5c'), flat(`M1560 ${SEA + 10}Q1640 590 1730 600Q1790 540 1850 580Q1900 590 1960 ${SEA + 10}Z`, '#1d1a5c'));
  s.paper({ opacity: 0.08 });

  // ---- 1: the beam (flat, hard-edged), stars, falling stars
  s.add(1, flat(poly([[LX, LY - 26], [LX, LY + 26], [-60, 660], [-60, 400]], true), PALE, { opacity: 0.16 }));
  s.add(1, flat(poly([[LX, LY - 12], [LX, LY + 12], [-60, 590], [-60, 470]], true), PALE, { opacity: 0.16 }));
  s.add(1, flat(poly([[LX, LY - 26], [LX, LY + 26], [W + 60, 470], [W + 60, 250]], true), PALE, { opacity: 0.16 }));
  s.add(1, flat(poly([[LX, LY - 12], [LX, LY + 12], [W + 60, 410], [W + 60, 310]], true), PALE, { opacity: 0.16 }));
  const stars = [
    [640, 96, 26, PALE], [790, 150, 12, '#ffffff'], [900, 70, 16, '#ffffff'], [1010, 128, 11, PALE], [1120, 60, 24, PALE], [1290, 120, 14, '#ffffff'],
    [600, 250, 12, '#ffffff'], [1330, 230, 12, PALE], [880, 590, 11, PALE], [1040, 560, 12, '#ffffff'], [760, 560, 10, '#ffffff'],
    [120, 110, 30, '#ffffff'], [200, 330, 14, PALE], [520, 170, 22, PALE], [470, 400, 12, '#ffffff'], [70, 470, 16, PALE],
    [1500, 90, 30, PALE], [1640, 420, 13, '#ffffff'], [1800, 130, 16, '#ffffff'], [1870, 340, 26, PALE], [1450, 300, 12, '#ffffff'], [1560, 520, 12, PALE],
  ];
  // small stars are flat (far backdrop); the big ones get an ink line
  s.add(1, g({}, stars.map(([x, y, sz, c], i) => star4(x, y, sz, c, sz >= 22 ? W_DETAIL : 0, (i % 3) * 8))));
  s.add(1, falling(716, 196, 34, 200, -136), falling(610, 590, 30, 150, -150), falling(1690, 250, 32, 180, -126));

  // ---- 2: the lighthouse on its rock; then the sea drawn over the rock's foot
  const lh = [];
  const rock = spline([[1000, 740], [1034, 628], [1104, 578], [1170, 566], [1290, 566], [1350, 584], [1420, 636], [1462, 740], [1236, 790]], true);
  const rock2 = spline([[1410, 740], [1432, 652], [1486, 618], [1540, 640], [1572, 740]], true);
  lh.push(ink(rock2, '#34306e', { w: W_INNER + 2 }), flat('M1486 622Q1540 640 1566 740L1510 740Q1520 672 1486 622Z', '#262258'), stroke(rock2, { w: W_INNER + 2 }));
  lh.push(ink(rock, '#4a4690', { w: W_SUBJECT - 2 }));
  lh.push(g({ 'clip-path': s.clip(el('path', { d: rock })) }, [
    flat('M1300 540C1370 600 1396 680 1376 800L1500 800L1500 540Z', '#34306e'),
    flat('M1000 800L1000 680Q1090 640 1160 690Q1220 730 1300 706L1300 800Z', '#34306e'),
    flat('M1060 624Q1090 594 1134 586Q1100 608 1084 638Z', '#7a76c4'),
  ]));
  lh.push(stroke(rock, { w: W_SUBJECT - 2 }), stroke('M1090 660l26 -12M1340 640l24 10', { w: W_DETAIL }));
  const tw = [];
  // the tower
  const tower = `M${LX - 78} 600L${LX - 52} 410L${LX + 52} 410L${LX + 78} 600Z`;
  tw.push(ink(tower, '#f8f0dc', { w: W_SUBJECT - 2 }));
  tw.push(g({ 'clip-path': s.clip(el('path', { d: tower })) }, [
    flat(`M${LX - 90} 438L${LX + 90} 438L${LX + 90} 484L${LX - 90} 484Z`, '#2fb3b0'), flat(`M${LX - 90} 532L${LX + 90} 532L${LX + 90} 580L${LX - 90} 580Z`, '#2fb3b0'),
    flat(`M${LX + 14} 400L${LX + 90} 400L${LX + 90} 610L${LX + 30} 610Z`, INK, { opacity: 0.22 }),
  ]));
  tw.push(stroke(tower, { w: W_SUBJECT - 2 }));
  tw.push(ink(`M${LX - 17} 600L${LX - 17} 566Q${LX} 546 ${LX + 17} 566L${LX + 17} 600Z`, '#34306e', { w: W_DETAIL + 1 }), inkCircle(LX - 4, 508, 13, PALE, { w: W_DETAIL + 1 }));
  // the lamp room, its light drawn as flat rings, the gallery and the roof
  tw.push(halo(LX, 362, 170, '#ffe58a', 3, 0.42));
  tw.push(ink(`M${LX - 40} 326L${LX + 40} 326L${LX + 40} 402L${LX - 40} 402Z`, PALE, { w: W_INNER + 2 }), el('circle', { cx: LX, cy: 362, r: 22, fill: '#ffffff' }));
  tw.push(stroke(`M${LX - 14} 326L${LX - 14} 402M${LX + 14} 326L${LX + 14} 402`, { w: W_DETAIL + 1 }));
  tw.push(ink(`M${LX - 74} 396L${LX + 74} 396L${LX + 64} 424L${LX - 64} 424Z`, GOLD, { w: W_INNER + 2 }), flat(`M${LX + 14} 400L${LX + 70} 400L${LX + 62} 420L${LX + 14} 420Z`, '#cf9326'));
  const roof = `M${LX - 60} 330Q${LX - 50} 268 ${LX} 248Q${LX + 50} 268 ${LX + 60} 330Z`;
  tw.push(ink(roof, '#f08a4a', { w: W_INNER + 2 }), flat(`M${LX + 6} 250Q${LX + 50} 268 ${LX + 60} 330L${LX + 20} 330Q${LX + 24} 280 ${LX + 6} 250Z`, '#c4602e'), stroke(roof, { w: W_INNER + 2 }));
  tw.push(inkCircle(LX, 240, 11, GOLD, { w: W_DETAIL + 1 }));
  lh.push(g({ transform: `translate(0 ${-TY})` }, tw));
  s.add(2, g({ filter: s.wobble(4, 0.012, 3) }, lh));

  // the sea: an inked wavy line, a light skin, then flat bands going down into the dark
  const sea = [];
  sea.push(ink(waveBand(W, H, SEA, 9, 12, 0.6), '#49bcc8', { w: W_INNER + 2 }));
  sea.push(flat(waveBand(W, H, SEA + 30, 9, 12, 0.9), '#22809e'));
  sea.push(flat(waveBand(W, H, 800, 14, 5, 1.2), '#1c6a8e'), flat(waveBand(W, H, 920, 14, 4, 2.6), '#17567c'), flat(waveBand(W, H, 1040, 14, 4.6, 4.1), '#124468'));
  // where the lamp and the beam land on the water: flat pale dashes
  for (const [x, y, l] of [[1140, SEA + 18, 60], [1250, SEA + 16, 44], [1190, SEA + 44, 36], [80, SEA + 14, 70], [230, SEA + 20, 50], [150, SEA + 46, 40], [700, SEA + 16, 40], [930, SEA + 20, 46], [1600, SEA + 18, 50], [470, SEA + 18, 44]]) {
    sea.push(el('path', { d: `M${x} ${y}h${l}`, stroke: x > 1100 && x < 1300 || x < 300 ? PALE : '#c8f6ff', 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0.85 }));
  }
  // the drowned city: far ruins (flat, close to the water's colour), then nearer and darker
  const FAR = '#1a6088', MIDC = '#124268', NEAR = '#0f3559';
  sea.push(flat(spline([[1020, 700], [1236, 720], [1470, 700], [1500, 860], [1470, 1000], [1560, 1260], [1000, 1260], [1080, 1000], [1040, 860]], true), FAR)); // the rock's foot
  sea.push(column(420, 1100, 250, 40, FAR), column(520, 1100, 190, 40, FAR), flat('M380 842L470 800L470 842Z', FAR));
  sea.push(flat('M1560 1100L1560 860Q1650 760 1740 860L1740 1100L1690 1100L1690 900Q1650 850 1610 900L1610 1100Z', FAR), column(1830, 1100, 300, 44, FAR));
  sea.push(flat('M700 1100L700 930L730 930L730 900L760 900L760 930L790 930L790 1100Z', FAR));
  // the temple front in the middle: columns, a cracked pediment
  const tx = 790;
  for (const [dx, h] of [[0, 200], [84, 200], [168, 200], [252, 120]]) sea.push(column(tx + dx, 1110, h, 40, MIDC));
  sea.push(flat(`M${tx - 46} 912L${tx + 206} 912L${tx + 220} 880L${tx + 84} 814L${tx - 46} 880Z`, MIDC));
  sea.push(flat(`M${tx + 290} 1110L${tx + 372} 1110L${tx + 362} 1078L${tx + 312} 1072Z`, MIDC));
  // a broken arch and steps, nearer
  sea.push(flat('M250 1160L250 980Q250 880 350 880Q420 880 440 930L400 950Q384 924 350 924Q300 924 300 980L300 1160Z', NEAR), flat('M440 1160L440 1080L500 1080L500 1110L560 1110L560 1160Z', NEAR));
  sea.push(column(1420, 1160, 210, 50, NEAR), column(1510, 1160, 120, 50, NEAR), flat('M1370 950L1470 950L1470 918L1390 918Z', NEAR));
  s.add(2, g({}, sea));

  // the sea bed, inked; weed
  s.lumps({ y: 1150, amp: 60, n: 12, fill: '#0c2a50', layer: 2, w: 0 });
  s.weed({ x: 110, y: H + 20, h: 300, fill: '#1c7a78', sway: 30, width: 48, layer: 2 });
  s.weed({ x: 190, y: H + 20, h: 200, fill: '#17625f', sway: 22, width: 40, layer: 2 });
  s.weed({ x: 1790, y: H + 20, h: 280, fill: '#1c7a78', sway: 28, width: 46, layer: 2, lean: -0.06 });
  s.weed({ x: 540, y: H + 20, h: 150, fill: '#17625f', sway: 18, width: 34, layer: 2 });
  s.weed({ x: 1310, y: H + 20, h: 170, fill: '#17625f', sway: 18, width: 34, layer: 2 });
  // the stars that fell in, half sunk in the sea bed
  s.add(2, drowned(650, 1110, 40, 10), drowned(1000, 1140, 32), drowned(1236, 1040, 38, -8), drowned(1100, 800, 26, 14), drowned(330, 1090, 40), drowned(1640, 1120, 42, 8), drowned(1530, 800, 26), drowned(130, 860, 26, -10));
  s.lumps({ y: 1196, amp: 44, n: 10, fill: '#0a1e42', layer: 2, w: W_MID });

  // the small whale
  const wx = 830, wy = 800, wh = [];
  const wbody = `M${wx - 150} ${wy - 6}C${wx - 110} ${wy - 76} ${wx + 40} ${wy - 96} ${wx + 120} ${wy - 40}C${wx + 160} ${wy - 10} ${wx + 150} ${wy + 40} ${wx + 90} ${wy + 56}C${wx + 10} ${wy + 76} ${wx - 90} ${wy + 50} ${wx - 150} ${wy - 6}Z`;
  const fluke = `M${wx - 140} ${wy - 6}C${wx - 180} ${wy - 20} ${wx - 196} ${wy - 60} ${wx - 232} ${wy - 62}C${wx - 226} ${wy - 30} ${wx - 206} ${wy - 6} ${wx - 190} ${wy + 2}C${wx - 214} ${wy + 14} ${wx - 232} ${wy + 36} ${wx - 228} ${wy + 62}C${wx - 190} ${wy + 54} ${wx - 172} ${wy + 20} ${wx - 136} ${wy + 10}Z`;
  const fin = `M${wx + 10} ${wy + 40}C${wx - 10} ${wy + 70} ${wx - 50} ${wy + 86} ${wx - 76} ${wy + 78}C${wx - 60} ${wy + 60} ${wx - 50} ${wy + 40} ${wx - 30} ${wy + 30}Z`;
  wh.push(el('path', { d: fluke + wbody, fill: INK, stroke: INK, 'stroke-width': 20, 'stroke-linejoin': 'round' }));
  wh.push(ink(fluke, '#4f7fd0', { w: W_MID }), ink(wbody, '#6f9fe8', { w: W_MID }));
  wh.push(g({ 'clip-path': s.clip(el('path', { d: wbody })) }, [
    flat(`M${wx - 170} ${wy + 20}Q${wx} ${wy + 40} ${wx + 170} ${wy + 6}L${wx + 170} ${wy + 100}L${wx - 170} ${wy + 100}Z`, '#d6ecff'),
    stroke(`M${wx + 10} ${wy + 36}v40M${wx + 40} ${wy + 30}v40M${wx + 70} ${wy + 24}v40`, { w: W_DETAIL, stroke: '#9fc4ec' }),
    flat(`M${wx - 70} ${wy - 62}Q${wx - 10} ${wy - 84} ${wx + 50} ${wy - 70}Q${wx - 10} ${wy - 72} ${wx - 60} ${wy - 50}Z`, '#a8ccff'),
  ]));
  wh.push(stroke(wbody, { w: W_MID }), ink(fin, '#4f7fd0', { w: W_MID }));
  wh.push(eye(wx + 84, wy - 14, 17, { look: [0.4, -0.2], w: W_DETAIL }), stroke(`M${wx + 100} ${wy + 20}q22 6 40 -10`, { w: W_DETAIL + 1 }));
  wh.push(el('ellipse', { cx: wx + 60, cy: wy + 12, rx: 13, ry: 8, fill: '#ff9fc8', opacity: 0.85 }));
  s.add(2, g({ filter: s.wobble(4, 0.012, 7) }, wh));

  // ---- 3: bubbles and plankton
  const bub = (x, y, rr) => g({}, [inkCircle(x, y, rr, '#bfefff', { w: W_DETAIL, 'fill-opacity': 0.35 }), el('circle', { cx: x - rr * 0.34, cy: y - rr * 0.36, r: rr * 0.22, fill: '#fff' })]);
  s.add(3, bub(960, 720, 12), bub(982, 690, 7), bub(1130, 730, 6), bub(1150, 712, 8), bub(560, 900, 12), bub(590, 850, 7), bub(1700, 960, 12), bub(240, 780, 10), bub(1340, 880, 9));
  s.specks({ n: 40, y0: SEA + 60, rmin: 2, rmax: 5, colors: ['#bfefff', '#ffe9a8', '#8fd0ff'], opacity: 0.6 });
}
