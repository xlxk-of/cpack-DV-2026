// THE TIDECALLER (the player's hero) — a young tide-mage in a deep teal hood, holding up a lantern with a captured
// star in it. Warm gold from the lantern on one side of the face, cold sea-light on the other.
import { el, g, spline, ribbon, sample, orb, glint, poly } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;

const LX = 800, LY = 566; // the star in the lantern

export function build(s) {
  const r = s.r;

  // ---- 0: night water, cold on the left, warm around the lantern
  s.backdrop(s.lin([[0, '#0d3a56'], [0.4, '#0a2446'], [0.8, '#070f2c'], [1, '#04061a']]));
  s.add(0, el('ellipse', { cx: 220, cy: 240, rx: 560, ry: 480, fill: s.rad([[0, '#2fd0d0', 0.42], [0.5, '#1b78a8', 0.18], [1, '#1b78a8', 0]]) }));
  s.fog({ color: '#3ec9d2', opacity: 0.26, freq: 0.005 });
  s.fog({ color: '#6a57d6', opacity: 0.2, freq: 0.008, y: 420, h: 640 });
  s.rays({ x: 160, y: -140, angle: 62, spread: 44, n: 7, color: '#a8f5ff', opacity: 0.17, width: 90 });
  s.add(0, el('circle', { cx: LX, cy: LY, r: 560, fill: s.rad([[0, '#ffd27a', 0.62], [0.25, '#f09a3e', 0.3], [0.6, '#c2562e', 0.1], [1, '#c2562e', 0]]) }));
  s.motes({ n: 110, rmin: 0.6, rmax: 2.2, color: '#a6ecff', opacity: 0.5, glow: false, layer: 0 });
  s.vignette({ strength: 0.74 });
  s.grain({ opacity: 0.2 });

  // ---- 1: falling stars far behind, and dim sea-stacks
  const far = [];
  for (const [x, y, len, a] of [[150, 150, 190, 58], [300, 60, 120, 62], [930, 110, 150, 118], [70, 420, 110, 52]]) {
    const dx = Math.cos(a * Math.PI / 180) * len, dy = Math.sin(a * Math.PI / 180) * len;
    far.push(el('path', { d: poly([[x - dx, y - dy], [x - 2, y + 2], [x + 2, y - 2]], true), fill: s.lin([[0, '#bff6ff', 0], [1, '#f4ffff', 0.85]], x - dx, y - dy, x, y, true), filter: 'url(#glow2)' }));
    far.push(orb(x, y, 5, '#bff6ff', '#fff', 0.9));
  }
  s.add(1, g({}, far));
  s.ridge({ y: 930, amp: 150, detail: 0.9, fill: s.lin([[0, '#0b2c50'], [1, '#050a22']]), layer: 1, opacity: 0.8 });
  s.kelp({ x: 70, h: 520, n: 3, color: '#07203f', layer: 1, lean: 0.06 });
  s.kelp({ x: 965, h: 430, n: 2, color: '#1a1a36', layer: 1, lean: -0.08 });

  // ---- 2: the Tidecaller
  const fig = [];

  // cloak and hood are one mass of cloth: the hood runs down into the shoulders without a break
  const clothPts = [[-40, 1080], [-6, 950], [80, 852], [186, 786], [240, 700], [250, 560], [262, 420], [306, 280], [408, 150], [520, 96], [636, 134], [728, 256], [770, 420], [780, 560], [790, 700], [846, 786], [944, 852], [1030, 950], [1064, 1080]];
  const clothD = spline(clothPts, true);
  const cloth = [];
  cloth.push(el('path', { d: clothD, fill: s.lin([[0, '#052030'], [0.25, '#083648'], [0.5, '#0c4f5e'], [0.75, '#126a70'], [1, '#1d7c74']], 120, 0, 900, 0, true) }));
  const clothClip = s.clip(el('path', { d: clothD }));
  const hf = [];
  hf.push(el('rect', { x: -40, y: 60, width: 1104, height: 1020, fill: s.lin([[0, '#9ff0e6', 0.2], [0.2, '#9ff0e6', 0], [0.55, '#02101c', 0], [1, '#02101c', 0.78]]) }));
  const foldLines = [
    [[500, 108], [372, 230], [286, 470], [262, 700], [150, 860], [60, 1060]],
    [[522, 106], [424, 200], [318, 400], [296, 640], [250, 840], [220, 1060]],
    [[548, 106], [660, 200], [736, 410], [756, 640], [790, 840], [820, 1060]],
    [[566, 112], [700, 240], [766, 470], [776, 700], [880, 860], [980, 1060]],
    [[330, 700], [340, 830], [360, 1060]],
    [[694, 700], [690, 830], [680, 1060]],
    [[400, 800], [440, 900], [470, 1060]],
    [[624, 800], [590, 900], [560, 1060]],
    [[300, 600], [230, 760], [100, 900]],
    [[736, 600], [810, 760], [940, 900]],
  ];
  for (const pts of foldLines) {
    const right = pts[1][0] > 512;
    hf.push(el('path', { d: ribbon(pts, 6, 62, (t) => Math.sin(Math.PI * Math.min(1, t + 0.3))), fill: '#01101a', opacity: 0.62, filter: 'url(#glow8)' }));
    const hi = pts.map((p) => [p[0] + (right ? 26 : -26), p[1] + 6]);
    hf.push(el('path', { d: spline(hi), fill: 'none', stroke: right ? '#ffdf9a' : '#6fe8de', 'stroke-width': 16, opacity: right ? 0.2 : 0.13, 'stroke-linecap': 'round', filter: 'url(#glow8)' }));
  }
  // lantern light washing over the flank of the hood that faces it
  hf.push(el('circle', { cx: LX + 10, cy: LY - 20, r: 320, fill: s.rad([[0, '#ffe2a0', 0.85], [0.3, '#ffb85a', 0.42], [1, '#ffb85a', 0]]) }));
  hf.push(el('ellipse', { cx: 250, cy: 380, rx: 90, ry: 300, fill: '#58e0dc', opacity: 0.22, filter: 'url(#glow32)' }));
  cloth.push(g({ 'clip-path': clothClip }, hf));
  fig.push(g({ filter: s.emboss({ color: '#8ff0ee', az: 205, elev: 30, depth: 8, k: 0.9, blur: 8, exp: 26 }) },
    g({ filter: s.emboss({ color: '#ffd68a', az: 340, elev: 30, depth: 9, k: 1.1, blur: 8, exp: 24 }) }, cloth)));

  // the opening of the hood. First the turned-back hem, then the dark lining inside it.
  const openPts = [[512, 196], [614, 220], [688, 312], [708, 442], [688, 570], [636, 676], [566, 764], [512, 806], [458, 764], [388, 676], [336, 570], [316, 442], [336, 312], [410, 220]];
  const grow = (k, dx = 0) => openPts.map((p) => [512 + (p[0] - 512) * k + dx, 480 + (p[1] - 480) * k]);
  const hemOut = spline(grow(1.085), true), open = spline(openPts, true);
  const hem = [];
  hem.push(el('path', { d: hemOut, fill: '#01080f', opacity: 0.55, filter: 'url(#glow8)', transform: 'translate(0 8)' }));
  hem.push(el('path', { d: hemOut, fill: s.lin([[0, '#d9b871'], [0.12, '#3f9a8c'], [0.4, '#136273'], [0.75, '#0b3e52'], [1, '#07283a']], 290, 0, 734, 0, true) }));
  hem.push(el('path', { d: spline(grow(1.045), true), fill: 'none', stroke: s.lin([[0, '#fff0b4'], [0.5, '#d49a3c'], [1, '#7a5a2c']], 290, 0, 734, 0, true), 'stroke-width': 3, opacity: 0.9 }));
  const hemPts = sample(grow(1.045), 6, true);
  for (const [i, p] of hemPts.entries()) if (i % 3 === 0) hem.push(el('circle', { cx: p[0], cy: p[1], r: 4.2, fill: p[0] < 500 ? '#fff2c0' : '#c9a25a' }));
  fig.push(g({ filter: s.emboss({ color: '#ffe0a0', az: 345, elev: 30, depth: 6, k: 0.9, blur: 5 }) }, hem));
  const openClip = s.clip(el('path', { d: open }));
  fig.push(el('path', { d: open, fill: s.lin([[0, '#103e50'], [0.3, '#081c30'], [0.75, '#040a1a'], [1, '#020614']], 316, 0, 708, 0, true) }));
  fig.push(g({ 'clip-path': openClip }, [
    el('ellipse', { cx: 340, cy: 470, rx: 60, ry: 250, fill: '#f0a550', opacity: 0.4, filter: 'url(#glow16)' }),
    el('ellipse', { cx: 512, cy: 220, rx: 220, ry: 70, fill: '#01040c', opacity: 0.8, filter: 'url(#glow16)' }),
  ]));

  // hair behind the face: falls either side of the jaw
  const hairFill = s.lin([[0, '#0c2648'], [0.4, '#0f1438'], [0.86, '#18102c'], [1, '#3a2030']], 340, 0, 690, 0, true);
  const back = [];
  back.push(el('path', { d: spline([[512, 232], [620, 256], [682, 350], [690, 480], [668, 600], [640, 700], [600, 640], [512, 600], [424, 640], [384, 700], [356, 600], [334, 480], [342, 350], [404, 256]], true), fill: hairFill }));
  fig.push(g({ 'clip-path': openClip }, back));

  // neck, and the tunic under it
  fig.push(g({ 'clip-path': openClip }, [
    el('path', { d: 'M462 590Q470 680 440 760L590 760Q556 680 566 590Z', fill: s.lin([[0, '#142c40'], [0.5, '#5a3438'], [1, '#c98250']], 440, 0, 590, 0, true) }),
    el('path', { d: 'M430 606Q512 690 596 600L600 660Q512 726 428 666Z', fill: '#04091a', opacity: 0.8, filter: 'url(#glow8)' }),
    el('path', { d: 'M380 700Q512 760 644 700L600 820L424 820Z', fill: s.lin([[0, '#0a1c30'], [1, '#3a2c3a']], 0, 0, 1, 0) }),
    el('path', { d: 'M420 712Q512 756 604 712', fill: 'none', stroke: '#e0b060', 'stroke-width': 4, opacity: 0.8 }),
  ]));

  // ---- the face (drawn in a smaller box, then scaled up about the eyes)
  const F = [];
  const face = spline([[512, 286], [596, 304], [640, 376], [642, 456], [616, 534], [558, 592], [512, 606], [466, 592], [408, 534], [382, 456], [384, 376], [428, 304]], true);
  const faceClip = s.clip(el('path', { d: face }));
  const skin = s.lin([[0, '#1a4a58'], [0.13, '#2b3549'], [0.34, '#6e3f45'], [0.54, '#bd7650'], [0.78, '#f2b074'], [1, '#ffe4aa']], 380, 0, 646, 0, true);
  F.push(el('path', { d: face, fill: '#01040c', opacity: 0.6, filter: 'url(#glow8)', transform: 'translate(-4 12)' }));
  F.push(el('path', { d: face, fill: skin }));
  const fs = [];
  // shadow of the hood over the brow, soft modelling
  fs.push(el('rect', { x: 370, y: 270, width: 290, height: 150, fill: s.lin([[0, '#060f22', 0.9], [0.55, '#060f22', 0.3], [1, '#060f22', 0]]) }));
  fs.push(el('ellipse', { cx: 404, cy: 510, rx: 54, ry: 120, fill: '#081c30', opacity: 0.55, filter: 'url(#glow16)' }));
  fs.push(el('path', { d: 'M560 500Q590 540 566 590L620 560L640 480Z', fill: '#8a3c34', opacity: 0.35, filter: 'url(#glow8)' }));
  fs.push(el('ellipse', { cx: 512, cy: 632, rx: 110, ry: 36, fill: '#2a1626', opacity: 0.4, filter: 'url(#glow8)' }));
  fs.push(el('ellipse', { cx: 588, cy: 498, rx: 40, ry: 26, fill: '#ff7e5a', opacity: 0.38, filter: 'url(#glow16)' }));
  fs.push(el('ellipse', { cx: 606, cy: 462, rx: 22, ry: 56, fill: '#fff2c8', opacity: 0.5, filter: 'url(#glow16)' }));
  fs.push(el('ellipse', { cx: 548, cy: 380, rx: 60, ry: 22, fill: '#ffd9a0', opacity: 0.28, filter: 'url(#glow8)' }));
  // eye sockets
  fs.push(el('ellipse', { cx: 452, cy: 430, rx: 52, ry: 32, fill: '#120e2a', opacity: 0.5, filter: 'url(#glow8)' }));
  fs.push(el('ellipse', { cx: 574, cy: 430, rx: 50, ry: 30, fill: '#4a1c2a', opacity: 0.36, filter: 'url(#glow8)' }));
  // nose: a shadow down the unlit side, a warm plane on the lit one
  fs.push(el('path', { d: 'M500 426C494 462 482 490 474 508C484 524 502 526 512 524C508 496 506 462 508 426Z', fill: '#24163a', opacity: 0.5, filter: 'url(#glow4)' }));
  fs.push(el('path', { d: 'M516 436C518 466 522 490 528 504', fill: 'none', stroke: '#ffe6b4', 'stroke-width': 7, opacity: 0.5, 'stroke-linecap': 'round', filter: 'url(#glow4)' }));
  fs.push(el('ellipse', { cx: 521, cy: 505, rx: 10, ry: 8, fill: '#fff2cf', opacity: 0.6, filter: 'url(#glow2)' }));
  fs.push(el('path', { d: 'M490 517Q500 527 511 522', fill: 'none', stroke: '#200c22', 'stroke-width': 3.5, opacity: 0.75, 'stroke-linecap': 'round' }));
  fs.push(el('path', { d: 'M522 523Q534 525 541 514', fill: 'none', stroke: '#5a2428', 'stroke-width': 3, opacity: 0.65, 'stroke-linecap': 'round' }));
  // mouth: set, a little stubborn
  fs.push(el('path', { d: 'M472 554Q492 545 512 550Q532 544 554 552Q534 562 512 561Q490 563 472 554Z', fill: s.lin([[0, '#3a1830'], [1, '#a8483c']], 472, 0, 554, 0, true) }));
  fs.push(el('path', { d: 'M468 553Q492 549 512 553Q534 548 558 551', fill: 'none', stroke: '#22091a', 'stroke-width': 3.2, 'stroke-linecap': 'round', opacity: 0.9 }));
  fs.push(el('path', { d: 'M482 562Q512 584 544 561Q514 568 482 562Z', fill: s.lin([[0, '#5a2c40'], [1, '#f09a72']], 482, 0, 544, 0, true), opacity: 0.85 }));
  fs.push(el('ellipse', { cx: 526, cy: 568, rx: 9, ry: 2.6, fill: '#fff0d6', opacity: 0.5, filter: 'url(#glow2)' }));
  fs.push(el('ellipse', { cx: 512, cy: 588, rx: 28, ry: 7, fill: '#3a1a2a', opacity: 0.32, filter: 'url(#glow4)' }));
  // a cold rim along the unlit cheek
  fs.push(el('path', { d: 'M383 380C377 450 392 524 444 578', fill: 'none', stroke: '#62e6e0', 'stroke-width': 8, opacity: 0.6, filter: 'url(#glow4)' }));
  F.push(g({ 'clip-path': faceClip }, fs));
  F.push(el('path', { d: 'M641 384C646 450 628 520 580 574', fill: 'none', stroke: '#fff3cf', 'stroke-width': 3, opacity: 0.8, filter: 'url(#glow2)' }));
  // tide-marks: three small lights under the eye on the shadow side
  for (const [x, y, rr] of [[416, 490, 4.6], [434, 505, 3.8], [454, 513, 3]]) F.push(orb(x, y, rr, '#5ff2e6', '#eaffff', 0.95));
  F.push(eye(s, 452, 438, -1), eye(s, 574, 438, 1));
  // brows: drawn down toward the nose
  F.push(el('path', { d: ribbon([[400, 402], [434, 386], [474, 391], [497, 409]], 6, 15, (t) => 0.7 + 0.5 * Math.sin(Math.PI * t)), fill: '#080c20' }));
  F.push(el('path', { d: ribbon([[628, 400], [594, 385], [554, 390], [529, 409]], 6, 15, (t) => 0.7 + 0.5 * Math.sin(Math.PI * t)), fill: '#1c1024' }));
  fig.push(g({ transform: 'translate(512 446) scale(1.17) translate(-512 -440)' }, F));

  // fringe: ragged locks swept across the brow
  const fringe = [];
  const locks = [
    [[640, 250], [668, 330], [676, 420], [662, 500]],
    [[600, 236], [640, 300], [650, 370], [636, 430]],
    [[610, 236], [570, 290], [520, 330], [470, 352]],
    [[580, 226], [520, 276], [450, 320], [396, 356]],
    [[530, 220], [460, 262], [396, 320], [362, 400]],
    [[470, 224], [400, 270], [354, 350], [346, 440]],
    [[420, 240], [364, 300], [338, 390], [344, 500]],
  ];
  for (const [i, pts] of locks.entries()) {
    fringe.push(el('path', { d: ribbon(pts, 74, 6, (t) => 1 - t * t * 0.4), fill: hairFill }));
  }
  for (const [i, pts] of locks.entries()) {
    for (let k = -1; k <= 1; k += 2) {
      const o = pts.map((p, j) => [p[0] + k * 13 * (1 - j / 4), p[1] + k * 8 * (1 - j / 4)]);
      const warm = pts[1][0] > 600;
      fringe.push(el('path', { d: spline(o), fill: 'none', stroke: warm ? '#f0a860' : '#3f78b8', 'stroke-width': 3.2, opacity: warm ? 0.5 : 0.4, 'stroke-linecap': 'round', filter: 'url(#glow2)' }));
      const o2 = pts.map((p, j) => [p[0] + k * 26 * (1 - j / 4), p[1] + k * 15 * (1 - j / 4)]);
      fringe.push(el('path', { d: spline(o2), fill: 'none', stroke: '#05061a', 'stroke-width': 4, opacity: 0.55, 'stroke-linecap': 'round', filter: 'url(#glow2)' }));
    }
  }
  fringe.push(el('path', { d: spline([[668, 300], [682, 400], [668, 500]]), fill: 'none', stroke: '#ffcf8a', 'stroke-width': 5, opacity: 0.55, 'stroke-linecap': 'round', filter: 'url(#glow4)' }));
  fringe.push(el('ellipse', { cx: 512, cy: 214, rx: 230, ry: 60, fill: '#01040c', opacity: 0.85, filter: 'url(#glow16)' }));
  fig.push(g({ 'clip-path': openClip }, fringe));

  // the braid, out over the hem on the cold side
  const braidPts = sample([[366, 560], [344, 640], [334, 730], [348, 820], [368, 892]], 5);
  const braid = [];
  for (let i = 0; i < braidPts.length - 1; i++) {
    const p = braidPts[i], q = braidPts[i + 1], a = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
    const w = 24 - i * 0.4;
    braid.push(el('ellipse', { cx: p[0] + (i % 2 ? 6 : -6), cy: p[1], rx: w * 1.05, ry: w * 0.6, fill: s.lin([[0, '#2c5488'], [0.5, '#141a40'], [1, '#070b20']], 0, 0, 1, 1), transform: `rotate(${a + (i % 2 ? 40 : -40)} ${p[0]} ${p[1]})` }));
  }
  const bEnd = braidPts[braidPts.length - 1];
  braid.push(el('path', { d: ribbon([[bEnd[0], bEnd[1] - 6], [bEnd[0] + 8, bEnd[1] + 34], [bEnd[0] + 2, bEnd[1] + 76]], 26, 3), fill: '#0d1430' }));
  braid.push(el('rect', { x: bEnd[0] - 16, y: bEnd[1] - 16, width: 32, height: 18, rx: 6, fill: s.lin([[0, '#fff0b8'], [0.5, '#e3a23e'], [1, '#7a4a18']]) }));
  braid.push(orb(bEnd[0] - 1, bEnd[1] - 7, 3.4, '#7ff3e8', '#fff', 0.9));
  fig.push(g({ filter: 'url(#shadow)' }, g({ filter: s.emboss({ color: '#8fe8f0', az: 200, elev: 32, depth: 5, k: 0.9, blur: 3 }) }, braid)));

  // clasp: a gold shell at the throat
  const cl = [];
  cl.push(el('circle', { cx: 512, cy: 822, r: 36, fill: s.rad([[0, '#fff6c8'], [0.45, '#f0b84c'], [1, '#7a4a16']], 0.62, 0.35, 0.75) }));
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i / 6) * Math.PI;
    cl.push(el('path', { d: `M512 834L${512 + Math.cos(a) * 31} ${834 + Math.sin(a) * 31}`, stroke: '#7a4a16', 'stroke-width': 2.4, opacity: 0.6 }));
  }
  cl.push(orb(512, 834, 7, '#7ff3e8', '#fff'));
  fig.push(g({ filter: 'url(#shadow)' }, g({ filter: s.emboss({ color: '#fff0c0', az: 330, elev: 34, depth: 5, k: 0.9, blur: 3 }) }, cl)));

  // the raised arm: sleeve, hand, lantern
  const arm = [];
  const sleeve = ribbon([[1070, 1010], [990, 800], [900, 590], [822, 432]], 300, 96);
  const slClip = s.clip(el('path', { d: sleeve }));
  arm.push(el('path', { d: sleeve, fill: s.lin([[0, '#e8b868'], [0.14, '#2f8a80'], [0.5, '#0f5564'], [1, '#062434']], 800, 600, 1010, 720, true) }));
  const slf = [];
  for (let i = 0; i < 5; i++) {
    const o = i * 44;
    slf.push(el('path', { d: ribbon([[840 + o * 0.5, 450 + o], [900 + o * 0.6, 560 + o * 1.2], [960 + o, 760 + o]], 5, 40), fill: '#04202e', opacity: 0.45, filter: 'url(#glow8)' }));
  }
  arm.push(g({ 'clip-path': slClip }, slf));
  // the mouth of the sleeve, turned toward us
  arm.push(el('ellipse', { cx: 842, cy: 452, rx: 66, ry: 30, fill: '#03121c', stroke: '#e0aa50', 'stroke-width': 5, transform: 'rotate(-24 842 452)' }));
  fig.push(g({ filter: s.emboss({ color: '#ffdc96', az: 215, elev: 30, depth: 8, k: 1.0, blur: 8 }) }, arm));

  // lantern (hangs from the fist)
  fig.push(lantern(s, LX, LY));
  // wrist and fist, lit from underneath by the star
  const hand = [];
  const skinH = s.lin([[0, '#4a2a3a'], [0.4, '#a2603f'], [0.78, '#e89e62'], [1, '#ffd690']], 0, 0, 0.25, 1);
  hand.push(el('path', { d: ribbon([[852, 466], [836, 430], [820, 402]], 52, 60), fill: '#7a4634' }));
  hand.push(el('path', { d: spline([[762, 404], [764, 366], [792, 344], [832, 344], [858, 364], [862, 402], [846, 432], [800, 440], [772, 430]], true), fill: skinH }));
  for (let i = 0; i < 4; i++) {
    const x = 776 + i * 23, y = 410 + Math.abs(i - 1.4) * 3;
    hand.push(el('rect', { x: x - 12, y: y - 26, width: 24, height: 50, rx: 11, fill: skinH, transform: `rotate(${-7 + i * 4} ${x} ${y})` }));
  }
  const hd = [];
  for (let i = 0; i < 3; i++) {
    const x = 788 + i * 23, y = 412;
    hd.push(el('path', { d: `M${x} ${y - 22}Q${x + 3} ${y} ${x - 1} ${y + 22}`, fill: 'none', stroke: '#3a1626', 'stroke-width': 3, opacity: 0.6, 'stroke-linecap': 'round' }));
  }
  hd.push(el('path', { d: 'M768 388Q800 376 856 386', fill: 'none', stroke: '#3a1626', 'stroke-width': 2.5, opacity: 0.35, 'stroke-linecap': 'round' }));
  // thumb, folded across the fingers
  const thumb = el('path', { d: ribbon([[862, 398], [838, 428], [800, 436], [778, 430]], 30, 22), fill: skinH });
  fig.push(g({ filter: s.emboss({ color: '#fff0c0', az: 80, elev: 32, depth: 5, k: 0.9, blur: 4 }) }, hand));
  fig.push(g({}, hd));
  fig.push(g({ filter: s.emboss({ color: '#fff0c0', az: 80, elev: 32, depth: 4, k: 0.8, blur: 3 }) }, thumb));
  fig.push(el('ellipse', { cx: 810, cy: 444, rx: 44, ry: 12, fill: '#ffe6a8', opacity: 0.55, filter: 'url(#glow8)' }));

  s.add(2, g({}, fig));

  // ---- 3: sparks off the star, drifting motes
  const sp = [];
  for (let i = 0; i < 38; i++) {
    const a = r.range(0, Math.PI * 2), d = 60 + Math.pow(r(), 1.6) * 330;
    sp.push(orb(LX + Math.cos(a) * d, LY + Math.sin(a) * d * 0.9 - d * 0.25, r.range(1.2, 3.4), '#ffc864', '#fff8dc', r.range(0.4, 0.95)));
  }
  s.add(3, g({}, sp));
  s.motes({ n: 40, rmin: 1.2, rmax: 4.6, colors: ['#aef6ff', '#8fe8e0', '#ffffff'], opacity: 0.7, x1: 620 });
  s.bubbles({ n: 9, x1: 420, y0: 120, rmin: 4, rmax: 16, opacity: 0.5 });
  s.add(3, glint(LX + 74, LY - 96, 20, '#fff2c8'), glint(LX - 96, LY + 92, 13, '#ffe2a0'), glint(246, 300, 16, '#c8fbff'), glint(170, 640, 11, '#c8fbff'));
}

function eye(s, cx, cy, side) {
  const p = [];
  const w = 38, lit = side > 0;
  // side = -1 the left eye on screen (shadow side), +1 the right (lit). Inner corner sits toward the nose.
  const inner = [cx - side * w, cy + 5], outer = [cx + side * (w + 2), cy - 5];
  const shape = spline([inner, [cx - side * 16, cy - 17], [cx + side * 12, cy - 19], outer, [cx + side * 14, cy + 15], [cx - side * 14, cy + 16]], true);
  const cp = s.clip(el('path', { d: shape }));
  p.push(el('path', { d: shape, fill: lit ? '#fff4e2' : '#a9c6d6' }));
  const ix = cx + 3, iy = cy - 2, ir = 19;
  const inn = [];
  inn.push(el('circle', { cx: ix, cy: iy, r: ir, fill: s.rad([[0, '#ffe27a'], [0.32, '#35d6c0'], [0.72, '#0f6f8e'], [1, '#062a4a']], 0.5, 0.62, 0.62) }));
  inn.push(el('circle', { cx: ix, cy: iy, r: ir, fill: 'none', stroke: '#041a30', 'stroke-width': 3, opacity: 0.9 }));
  inn.push(el('circle', { cx: ix, cy: iy, r: 8, fill: '#050a18' }));
  inn.push(el('rect', { x: cx - 50, y: cy - 30, width: 100, height: 20, fill: '#0a0f24', opacity: 0.55, filter: 'url(#glow4)' }));
  p.push(g({ 'clip-path': cp }, inn));
  // catch-lights: the star in the lantern, and the sea
  p.push(el('circle', { cx: ix + 8, cy: iy - 6, r: 5.2, fill: '#fff8dc' }));
  p.push(el('circle', { cx: ix + 8, cy: iy - 6, r: 9, fill: '#ffd27a', opacity: 0.5, filter: 'url(#glow4)' }));
  p.push(el('circle', { cx: ix - 7, cy: iy + 7, r: 2.4, fill: '#bff8ff', opacity: 0.9 }));
  // lids and lashes
  p.push(el('path', { d: spline([inner, [cx - side * 16, cy - 17], [cx + side * 12, cy - 19], outer, [cx + side * (w + 10), cy - 12]]), fill: 'none', stroke: '#0a0a1c', 'stroke-width': 5.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  p.push(el('path', { d: spline([[cx - side * 26, cy + 15], [cx + side * 4, cy + 19], [cx + side * 30, cy + 9]]), fill: 'none', stroke: '#2a1428', 'stroke-width': 2, opacity: 0.55, 'stroke-linecap': 'round' }));
  p.push(el('path', { d: spline([[cx - side * 30, cy - 26], [cx - side * 4, cy - 32], [cx + side * 30, cy - 27]]), fill: 'none', stroke: '#2a1428', 'stroke-width': 2.4, opacity: 0.4, 'stroke-linecap': 'round' }));
  return g({}, p);
}

function lantern(s, x, y) {
  const p = [];
  const w = 54, h = 76; // half-width, half-height of the glass
  // bloom
  p.push(el('circle', { cx: x, cy: y, r: 190, fill: '#ffb84a', opacity: 0.3, filter: 'url(#glow64)' }));
  p.push(el('circle', { cx: x, cy: y, r: 110, fill: '#ffd98a', opacity: 0.5, filter: 'url(#glow32)' }));
  // ring and chain
  p.push(el('path', { d: `M${x} ${y - h - 110}L${x} ${y - h - 44}`, stroke: '#3a2412', 'stroke-width': 7, 'stroke-linecap': 'round' }));
  p.push(el('path', { d: `M${x} ${y - h - 110}L${x} ${y - h - 44}`, stroke: '#f3c46a', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-dasharray': '7 7' }));
  p.push(el('circle', { cx: x, cy: y - h - 34, r: 13, fill: 'none', stroke: '#e0a848', 'stroke-width': 6 }));
  // glass
  const glass = `M${x - w * 0.72} ${y - h}L${x + w * 0.72} ${y - h}Q${x + w * 1.12} ${y} ${x + w * 0.8} ${y + h}L${x - w * 0.8} ${y + h}Q${x - w * 1.12} ${y} ${x - w * 0.72} ${y - h}Z`;
  p.push(el('path', { d: glass, fill: s.rad([[0, '#fffbe6', 1], [0.3, '#ffe38a', 0.95], [0.7, '#f39a3a', 0.8], [1, '#b5521e', 0.75]], 0.5, 0.5, 0.62) }));
  // the star
  p.push(el('circle', { cx: x, cy: y, r: 36, fill: '#fff', opacity: 0.9, filter: 'url(#glow8)' }));
  p.push(glint(x, y, 50, '#fffdf0', 1));
  p.push(g({ transform: `rotate(45 ${x} ${y})` }, glint(x, y, 26, '#fff3c0', 0.9)));
  p.push(el('circle', { cx: x, cy: y, r: 11, fill: '#fff' }));
  // frame
  const brass = s.lin([[0, '#6a3c14'], [0.4, '#e0a040'], [0.6, '#ffe7a0'], [1, '#7a4818']], 0, 0, 1, 0);
  const dark = '#3a200c';
  for (const k of [-1, 0, 1]) {
    p.push(el('path', { d: `M${x + k * w * 0.72} ${y - h}Q${x + k * w * 1.12} ${y} ${x + k * w * 0.8} ${y + h}`, fill: 'none', stroke: dark, 'stroke-width': k ? 9 : 5, opacity: k ? 1 : 0.55 }));
    if (k) p.push(el('path', { d: `M${x + k * w * 0.72} ${y - h}Q${x + k * w * 1.12} ${y} ${x + k * w * 0.8} ${y + h}`, fill: 'none', stroke: '#f3c46a', 'stroke-width': 3, opacity: 0.9 }));
  }
  p.push(el('path', { d: `M${x - w * 0.86} ${y - h + 4}L${x - w * 0.5} ${y - h - 30}L${x + w * 0.5} ${y - h - 30}L${x + w * 0.86} ${y - h + 4}Z`, fill: brass, stroke: dark, 'stroke-width': 2 }));
  p.push(el('rect', { x: x - 12, y: y - h - 42, width: 24, height: 14, rx: 4, fill: brass, stroke: dark, 'stroke-width': 2 }));
  p.push(el('path', { d: `M${x - w * 0.94} ${y + h - 4}L${x + w * 0.94} ${y + h - 4}L${x + w * 0.74} ${y + h + 20}L${x - w * 0.74} ${y + h + 20}Z`, fill: brass, stroke: dark, 'stroke-width': 2 }));
  p.push(el('ellipse', { cx: x, cy: y + h + 24, rx: w * 0.4, ry: 7, fill: '#5a3210' }));
  // glass shine
  p.push(el('path', { d: `M${x - w * 0.62} ${y - h + 16}Q${x - w * 0.84} ${y - 6} ${x - w * 0.66} ${y + h * 0.5}`, fill: 'none', stroke: '#fff', 'stroke-width': 5, opacity: 0.6, 'stroke-linecap': 'round' }));
  return g({}, p);
}
