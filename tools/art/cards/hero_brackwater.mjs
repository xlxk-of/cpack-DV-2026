// OLD BRACKWATER (the easy opponent) — the barnacle-crusted ghost of a fisherman: sou'wester, a beard of seaweed, one
// pale glowing eye and one screwed shut, a pipe that blows bubbles. Lobster-pot and net behind him in the murk.
import { el, g, spline, ribbon, sample, orb, glint, poly } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;

export function build(s) {
  const r = s.r;

  // ---- 0: harbour murk
  s.backdrop(s.lin([[0, '#1d4a40'], [0.4, '#12302e'], [0.8, '#0a1a1e'], [1, '#050c12']]));
  s.add(0, el('ellipse', { cx: 470, cy: 400, rx: 600, ry: 520, fill: s.rad([[0, '#8ff0e0', 0.5], [0.45, '#3f9a8a', 0.22], [1, '#3f9a8a', 0]]) }));
  s.fog({ color: '#7fd8b8', opacity: 0.26, freq: 0.006 });
  s.fog({ color: '#9aa860', opacity: 0.16, freq: 0.009, y: 300, h: 760 });
  s.rays({ x: 300, y: -140, angle: 80, spread: 50, n: 7, color: '#c8ffe8', opacity: 0.13, width: 90 });
  s.motes({ n: 120, rmin: 0.6, rmax: 2.2, color: '#c8f0d8', opacity: 0.45, glow: false, layer: 0 });
  s.vignette({ strength: 0.78 });
  s.grain({ opacity: 0.22 });

  // ---- 1: his gear, dim in the haze
  s.add(1, g({ opacity: 0.8 }, net(s, r)));
  s.add(1, g({ opacity: 0.9 }, pot(s, 96, 600, 1.15)));
  s.kelp({ x: 960, h: 460, n: 2, color: '#0a2420', layer: 1, lean: -0.1 });
  s.add(1, el('rect', { x: 0, y: 0, width: 1024, height: 1024, fill: s.rad([[0, '#2a6a5c', 0], [0.6, '#16403a', 0.25], [1, '#0a1c1e', 0.5]], 0.5, 0.45, 0.75) }));

  // ---- 2: the old ghost
  const fig = [];
  // ghost-light behind the whole figure
  fig.push(el('ellipse', { cx: 512, cy: 470, rx: 400, ry: 430, fill: '#8ff6f0', opacity: 0.3, filter: 'url(#glow64)' }));

  // coat: heavy oilskin, big turned-up collar
  const coatD = spline([[-40, 1080], [0, 900], [110, 790], [270, 720], [400, 660], [512, 650], [624, 660], [754, 720], [914, 790], [1024, 900], [1064, 1080]], true);
  const coat = [el('path', { d: coatD, fill: s.lin([[0, '#a8983a'], [0.3, '#75702e'], [0.65, '#454a26'], [1, '#1c2418']], 60, 700, 900, 1024, true) })];
  const coatClip = s.clip(el('path', { d: coatD }));
  const cf = [];
  for (let i = 0; i < 9; i++) {
    const x0 = 60 + i * 112 + r.range(-20, 20);
    cf.push(el('path', { d: ribbon([[512 + (x0 - 512) * 0.6, 700], [x0, 860], [x0 + (x0 - 512) * 0.1, 1060]], 10, 70), fill: '#0a1410', opacity: 0.5, filter: 'url(#glow8)' }));
    cf.push(el('path', { d: ribbon([[512 + (x0 - 512) * 0.6 - 26, 720], [x0 - 34, 860], [x0 - 44 + (x0 - 512) * 0.1, 1060]], 5, 26), fill: '#fff6b0', opacity: 0.14, filter: 'url(#glow8)' }));
  }
  cf.push(el('ellipse', { cx: 250, cy: 770, rx: 220, ry: 50, fill: '#fff8b8', opacity: 0.22, filter: 'url(#glow16)', transform: 'rotate(-18 250 770)' }));
  for (let i = 0; i < 12; i++) cf.push(el('ellipse', { cx: r.range(40, 980), cy: r.range(740, 1000), rx: r.range(16, 50), ry: r.range(8, 22), fill: '#1e3a26', opacity: r.range(0.15, 0.35), filter: 'url(#glow4)' }));
  coat.push(g({ 'clip-path': coatClip }, cf));
  fig.push(g({ filter: s.emboss({ color: '#c8fff0', az: 215, elev: 28, depth: 8, k: 1.0, blur: 8 }) }, coat));

  // ears, sticking out under the brim
  for (const [x, k] of [[306, 1], [718, -1]]) {
    fig.push(g({ filter: s.emboss({ color: '#d8fff8', az: 215, elev: 30, depth: 6, k: 0.7, blur: 5 }) }, [
      el('ellipse', { cx: x, cy: 452, rx: 34, ry: 52, fill: k > 0 ? '#9fc0aa' : '#4e7468', transform: `rotate(${k * -10} ${x} 452)` }),
      el('ellipse', { cx: x + k * 6, cy: 454, rx: 16, ry: 30, fill: k > 0 ? '#5a8072' : '#27403e', transform: `rotate(${k * -10} ${x} 452)` }),
    ]));
  }

  // head: broad and jowly
  const faceD = spline([[512, 262], [630, 278], [700, 356], [718, 452], [696, 544], [630, 612], [512, 632], [394, 612], [328, 544], [306, 452], [324, 356], [394, 278]], true);
  const faceClip = s.clip(el('path', { d: faceD }));
  const face = [];
  face.push(el('path', { d: faceD, fill: s.rad([[0, '#d0e6cc'], [0.28, '#9cbc9f'], [0.62, '#55796a'], [1, '#203838']], 400, 430, 380, true) }));
  const fs = [];
  fs.push(el('rect', { x: 290, y: 250, width: 450, height: 170, fill: s.lin([[0, '#081616', 0.95], [0.55, '#081616', 0.45], [1, '#081616', 0]]) }));
  fs.push(el('ellipse', { cx: 676, cy: 500, rx: 80, ry: 150, fill: '#0e2226', opacity: 0.6, filter: 'url(#glow16)' }));
  // apple cheeks, a drinker's bloom gone grey-violet
  fs.push(el('ellipse', { cx: 392, cy: 512, rx: 66, ry: 48, fill: '#c8a0c0', opacity: 0.5, filter: 'url(#glow16)' }));
  fs.push(el('ellipse', { cx: 636, cy: 512, rx: 60, ry: 46, fill: '#8a6a90', opacity: 0.45, filter: 'url(#glow16)' }));
  fs.push(el('ellipse', { cx: 376, cy: 498, rx: 30, ry: 16, fill: '#f4fff4', opacity: 0.55, filter: 'url(#glow8)', transform: 'rotate(-20 376 498)' }));
  // eye sockets
  fs.push(el('ellipse', { cx: 424, cy: 428, rx: 70, ry: 50, fill: '#0a2024', opacity: 0.8, filter: 'url(#glow8)' }));
  fs.push(el('ellipse', { cx: 602, cy: 432, rx: 64, ry: 40, fill: '#0a2024', opacity: 0.7, filter: 'url(#glow8)' }));
  // bags and wrinkles
  for (const [d, w, o] of [
    ['M362 476Q424 506 488 474', 5, 0.55], ['M374 494Q424 516 472 496', 3.5, 0.35],
    ['M548 470Q604 494 664 464', 5, 0.55], ['M560 488Q604 504 652 484', 3.5, 0.35],
    ['M668 420L708 402', 3.5, 0.55], ['M670 434L712 432', 3.5, 0.55], ['M666 448L706 462', 3.5, 0.5],
    ['M478 398Q512 386 546 400', 4, 0.5], ['M486 380Q512 372 538 382', 3, 0.35],
    ['M340 560Q360 590 400 604', 4, 0.35], ['M684 560Q664 590 624 604', 4, 0.35],
  ]) fs.push(el('path', { d, fill: 'none', stroke: '#10262a', 'stroke-width': w, opacity: o, 'stroke-linecap': 'round' }));
  face.push(g({ 'clip-path': faceClip }, fs));
  fig.push(g({ filter: s.emboss({ color: '#d8fff8', az: 210, elev: 28, depth: 8, k: 0.7, blur: 9 }) }, face));

  // the shut eye: screwed tight under a heavy brow
  fig.push(el('path', { d: 'M552 440Q602 468 658 432', fill: 'none', stroke: '#071418', 'stroke-width': 9, 'stroke-linecap': 'round' }));
  fig.push(el('path', { d: 'M558 428Q602 448 652 420', fill: 'none', stroke: '#c8e4d0', 'stroke-width': 3.5, opacity: 0.4, 'stroke-linecap': 'round' }));
  for (let i = 0; i < 5; i++) {
    const x = 572 + i * 18, y = 452 - Math.abs(i - 2) * 3.5;
    fig.push(el('path', { d: `M${x} ${y}l${-3 + i * 1.5} 12`, stroke: '#071418', 'stroke-width': 3.4, 'stroke-linecap': 'round', opacity: 0.85 }));
  }

  // the open eye: a pale lamp
  const ex = 424, ey = 430;
  fig.push(el('circle', { cx: ex, cy: ey, r: 170, fill: '#8ff6ff', opacity: 0.5, filter: 'url(#glow32)' }));
  fig.push(el('circle', { cx: ex, cy: ey, r: 50, fill: '#05141a', filter: 'url(#glow4)' }));
  fig.push(el('circle', { cx: ex, cy: ey, r: 66, fill: '#cffdff', opacity: 0.9, filter: 'url(#glow16)' }));
  fig.push(el('circle', { cx: ex, cy: ey, r: 47, fill: s.rad([[0, '#ffffff'], [0.45, '#e6fdff'], [0.8, '#8fecf6'], [1, '#3aa2b4']]) }));
  fig.push(el('circle', { cx: ex + 5, cy: ey + 3, r: 16, fill: 'none', stroke: '#58c4d6', 'stroke-width': 3, opacity: 0.8 }));
  fig.push(el('circle', { cx: ex + 5, cy: ey + 3, r: 7, fill: '#0e4656' }));
  fig.push(el('circle', { cx: ex - 11, cy: ey - 14, r: 8.5, fill: '#fff' }));
  fig.push(el('circle', { cx: ex + 16, cy: ey + 16, r: 3.6, fill: '#fff', opacity: 0.9 }));
  // lids: a heavy lower one, a suspicious upper one
  fig.push(el('path', { d: `M${ex - 52} ${ey + 20}Q${ex} ${ey + 68} ${ex + 52} ${ey + 20}Q${ex} ${ey + 48} ${ex - 52} ${ey + 20}Z`, fill: '#6e9886' }));
  fig.push(el('path', { d: `M${ex - 54} ${ey - 10}Q${ex} ${ey - 70} ${ex + 54} ${ey - 10}Q${ex} ${ey - 46} ${ex - 54} ${ey - 10}Z`, fill: '#48685a' }));
  fig.push(el('path', { d: `M${ex - 54} ${ey - 10}Q${ex} ${ey - 46} ${ex + 54} ${ey - 10}`, fill: 'none', stroke: '#061418', 'stroke-width': 4, 'stroke-linecap': 'round' }));

  // nose: a great bulb with wings
  const nose = [];
  const nfill = (fx, c0, c1, c2) => s.rad([[0, c0], [0.45, c1], [1, c2]], fx, 0.3, 0.75);
  nose.push(el('path', { d: 'M486 410Q512 396 538 410L548 470L476 470Z', fill: s.lin([[0, '#8fb09c'], [1, '#b89ab4']]) }));
  nose.push(el('circle', { cx: 468, cy: 512, r: 27, fill: nfill(0.35, '#e6d6da', '#b094a4', '#5a4a66') }));
  nose.push(el('circle', { cx: 556, cy: 512, r: 27, fill: nfill(0.35, '#b49aa8', '#7a6480', '#3a3050') }));
  nose.push(el('circle', { cx: 512, cy: 494, r: 54, fill: nfill(0.34, '#fff6f4', '#cfaab4', '#5a4668') }));
  fig.push(g({ filter: s.emboss({ color: '#e8fff8', az: 215, elev: 30, depth: 8, k: 0.8, blur: 6 }) }, nose));
  fig.push(el('ellipse', { cx: 492, cy: 474, rx: 15, ry: 11, fill: '#fff', opacity: 0.75, filter: 'url(#glow4)' }));
  fig.push(el('ellipse', { cx: 474, cy: 530, rx: 10, ry: 6, fill: '#140e22', opacity: 0.75 }));
  fig.push(el('ellipse', { cx: 550, cy: 530, rx: 10, ry: 6, fill: '#140e22', opacity: 0.75 }));
  // warts of barnacle on the nose
  fig.push(barnacle(s, 548, 468, 7));

  // brows: tufts of weed, one cocked, one clamped down
  fig.push(brow(s, r, [[350, 392], [392, 352], [452, 348], [494, 384]], 1));
  fig.push(brow(s, r, [[676, 408], [630, 388], [572, 392], [530, 412]], -1));

  // weed for hair, hanging from under the hat at the temples
  const side = [];
  for (const k of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const x0 = 512 + k * (186 + i * 7), y0 = 350 + i * 12, len = 170 + i * 26 + r.range(-20, 20), sw = r.range(-16, 16);
      const pts = [[x0, y0], [x0 + k * 30 + sw, y0 + len * 0.35], [x0 + k * 18 - sw, y0 + len * 0.7], [x0 + k * 44 + sw, y0 + len]];
      side.push(el('path', { d: ribbon(pts, 44, 3, (u) => 0.8 + 0.25 * Math.sin(u * 18 + i), 14), fill: s.lin([[0, '#0c2420'], [0.3, i % 2 ? '#2f7044' : '#1f5238'], [1, '#0d2a22']], 0, y0, 0, y0 + len, true) }));
      side.push(el('path', { d: spline(pts), fill: 'none', stroke: '#8fd088', 'stroke-width': 2, opacity: 0.3, 'stroke-linecap': 'round' }));
    }
  }
  fig.push(g({ filter: s.emboss({ color: '#c8ffe8', az: 215, elev: 30, depth: 6, k: 0.8, blur: 5 }) }, side));

  // beard of seaweed
  fig.push(beard(s, r));

  // pipe, and its bubbles
  const pipe = [];
  pipe.push(el('path', { d: ribbon([[572, 596], [636, 612], [706, 642]], 14, 18), fill: s.lin([[0, '#6a4428'], [1, '#1c120c']]) }));
  pipe.push(el('path', { d: 'M694 588L762 588L756 668Q728 690 700 668Z', fill: s.lin([[0, '#7a5030'], [0.5, '#402818'], [1, '#150c08']], 0, 0, 1, 0) }));
  pipe.push(el('ellipse', { cx: 728, cy: 588, rx: 34, ry: 10, fill: '#0c1c1c', stroke: '#9a7a50', 'stroke-width': 3 }));
  fig.push(g({ filter: 'url(#shadow)' }, g({ filter: s.emboss({ color: '#d8fff0', az: 215, elev: 30, depth: 5, k: 0.9, blur: 4 }) }, pipe)));
  fig.push(el('ellipse', { cx: 728, cy: 586, rx: 24, ry: 6, fill: '#9ffaff', opacity: 0.85, filter: 'url(#glow4)' }));
  fig.push(barnacle(s, 712, 648, 9), barnacle(s, 730, 660, 6));

  // the hat: crown, then the brim, turned up in front and drooping wide at the sides
  const hat = [];
  const crown = 'M300 306C286 132 424 60 512 60C600 60 738 132 724 306Z';
  hat.push(el('path', { d: crown, fill: s.lin([[0, '#e6c84e'], [0.3, '#b89a34'], [0.65, '#75692a'], [1, '#383a1e']], 290, 60, 760, 320, true) }));
  const crClip = s.clip(el('path', { d: crown }));
  const cr = [];
  for (const x1 of [330, 512, 694]) {
    cr.push(el('path', { d: `M512 62Q${512 + (x1 - 512) * 1.15} ${170} ${x1} 310`, fill: 'none', stroke: '#2a2610', 'stroke-width': 5, opacity: 0.5 }));
    cr.push(el('path', { d: `M512 62Q${512 + (x1 - 512) * 1.15 - 7} ${170} ${x1 - 8} 310`, fill: 'none', stroke: '#fff0a0', 'stroke-width': 3, opacity: 0.3 }));
  }
  cr.push(el('ellipse', { cx: 660, cy: 220, rx: 130, ry: 170, fill: '#141a0c', opacity: 0.55, filter: 'url(#glow32)' }));
  cr.push(el('ellipse', { cx: 512, cy: 320, rx: 260, ry: 50, fill: '#141a0c', opacity: 0.6, filter: 'url(#glow16)' }));
  cr.push(el('ellipse', { cx: 404, cy: 140, rx: 76, ry: 36, fill: '#fffbd0', opacity: 0.5, filter: 'url(#glow16)', transform: 'rotate(-34 404 140)' }));
  // slime, salt and weather
  for (let i = 0; i < 14; i++) cr.push(el('ellipse', { cx: r.range(300, 720), cy: r.range(90, 300), rx: r.range(14, 46), ry: r.range(8, 24), fill: i % 3 ? '#27482c' : '#e8f0c0', opacity: r.range(0.12, 0.34), filter: 'url(#glow4)' }));
  for (let i = 0; i < 5; i++) {
    const x = r.range(330, 690), y0 = r.range(100, 200);
    cr.push(el('path', { d: ribbon([[x, y0], [x + r.range(-8, 8), y0 + 60], [x + r.range(-10, 10), y0 + r.range(90, 150)]], 3, 9), fill: '#1c3a26', opacity: 0.4, filter: 'url(#glow2)' }));
  }
  hat.push(g({ 'clip-path': crClip }, cr));
  hat.push(el('ellipse', { cx: 512, cy: 64, rx: 20, ry: 11, fill: '#a08a30' }));
  const brimPts = [[112, 452], [160, 352], [254, 284], [380, 232], [512, 216], [644, 232], [770, 284], [864, 352], [912, 452], [840, 404], [760, 350], [656, 322], [512, 312], [368, 322], [264, 350], [184, 404]];
  const brimD = spline(brimPts, true);
  hat.push(el('path', { d: brimD, fill: '#040c0a', opacity: 0.7, filter: 'url(#glow16)', transform: 'translate(0 26)' }));
  hat.push(el('path', { d: brimD, fill: s.lin([[0, '#f2d65a'], [0.3, '#c4a63a'], [0.65, '#80722c'], [1, '#3a3c1e']], 150, 220, 880, 420, true) }));
  const brClip = s.clip(el('path', { d: brimD }));
  const br = [];
  br.push(el('path', { d: spline([[150, 440], [264, 366], [368, 338], [512, 328], [656, 338], [760, 366], [874, 440]]), fill: 'none', stroke: '#1a1c0c', 'stroke-width': 34, opacity: 0.55, filter: 'url(#glow8)' }));
  br.push(el('path', { d: spline([[170, 350], [254, 292], [380, 240], [512, 224], [644, 240]]), fill: 'none', stroke: '#fffbd8', 'stroke-width': 12, opacity: 0.55, filter: 'url(#glow4)' }));
  for (let i = 0; i < 12; i++) br.push(el('ellipse', { cx: r.range(150, 880), cy: r.range(230, 420), rx: r.range(12, 40), ry: r.range(6, 16), fill: i % 3 ? '#27482c' : '#f0f4c8', opacity: r.range(0.12, 0.3), filter: 'url(#glow4)' }));
  hat.push(g({ 'clip-path': brClip }, br));
  fig.push(g({ filter: s.emboss({ color: '#e8ffe0', az: 215, elev: 28, depth: 9, k: 1.0, blur: 7 }) }, hat));
  // stitched edge of the brim
  fig.push(el('path', { d: spline([[184, 392], [264, 338], [368, 310], [512, 300], [656, 310], [760, 338], [840, 392]]), fill: 'none', stroke: '#2a2610', 'stroke-width': 2.5, opacity: 0.5, 'stroke-dasharray': '10 8' }));

  // barnacles: on the brim, the crown, the cheek, the shoulder
  const bn = [];
  for (const [x, y, rr] of [[716, 282, 22], [752, 300, 16], [688, 262, 14], [782, 326, 13], [736, 252, 11], [664, 280, 10], [806, 350, 9], [336, 176, 16], [360, 152, 11], [318, 204, 10], [344, 208, 7],
    [676, 548, 15], [700, 524, 11], [656, 570, 9], [206, 800, 20], [240, 782, 13], [178, 822, 11], [226, 826, 8], [830, 812, 16], [806, 796, 10], [852, 836, 8]]) bn.push(barnacle(s, x, y, rr));
  fig.push(g({}, bn));

  // a hook and float caught in the brim
  const hk = [];
  hk.push(el('path', { d: 'M286 330C282 370 286 400 290 424C296 452 260 454 258 428', fill: 'none', stroke: '#d8e8e0', 'stroke-width': 5, 'stroke-linecap': 'round' }));
  hk.push(el('path', { d: 'M258 428l11 -4l-3 13z', fill: '#d8e8e0' }));
  hk.push(el('ellipse', { cx: 286, cy: 318, rx: 15, ry: 20, fill: s.lin([[0, '#f06a4a'], [0.5, '#f06a4a'], [0.5, '#f4f0e0'], [1, '#b8b4a0']]) }));
  hk.push(el('ellipse', { cx: 281, cy: 309, rx: 4.5, ry: 6, fill: '#fff', opacity: 0.7 }));
  fig.push(g({ filter: 'url(#shadow)' }, hk));

  s.add(2, g({}, fig));

  // ---- 3: he is a ghost: he thins to mist below, and bubbles rise from the pipe
  s.add(3, el('rect', { x: 0, y: 800, width: 1024, height: 224, fill: s.lin([[0, '#0c2424', 0], [0.7, '#0c2424', 0.55], [1, '#081416', 0.85]]) }));
  s.fog({ color: '#a8fff0', opacity: 0.22, freq: 0.007, layer: 3, y: 760, h: 380 });
  const wisps = [];
  for (let i = 0; i < 9; i++) {
    const x0 = r.range(40, 980), y0 = r.range(820, 1010), k = r.sign();
    const pts = [[x0, y0], [x0 + k * 40, y0 - 70], [x0 - k * 30, y0 - 150], [x0 + k * 26, y0 - 230], [x0 - k * 10, y0 - 300]];
    wisps.push(el('path', { d: ribbon(pts, 34, 2), fill: '#a8fff4', opacity: r.range(0.1, 0.26), filter: 'url(#glow8)' }));
  }
  s.add(3, g({}, wisps));
  const bub = [];
  for (const [x, y, rr] of [[726, 540, 14], [748, 488, 20], [716, 430, 12], [764, 392, 26], [730, 320, 10], [790, 290, 16], [752, 230, 8], [804, 200, 12], [776, 140, 7]]) {
    bub.push(el('circle', { cx: x, cy: y, r: rr, fill: '#9ffaff', 'fill-opacity': 0.14, stroke: '#dffeff', 'stroke-width': Math.max(1.6, rr * 0.13), 'stroke-opacity': 0.9 }));
    bub.push(el('circle', { cx: x, cy: y, r: rr * 1.6, fill: '#9ffaff', opacity: 0.12, filter: 'url(#glow8)' }));
    bub.push(el('ellipse', { cx: x - rr * 0.35, cy: y - rr * 0.4, rx: rr * 0.3, ry: rr * 0.17, fill: '#fff', opacity: 0.95, transform: `rotate(-35 ${x - rr * 0.35} ${y - rr * 0.4})` }));
  }
  s.add(3, g({}, bub));
  s.motes({ n: 46, rmin: 1.2, rmax: 4.4, colors: ['#bffff0', '#e8ffd0', '#ffffff'], opacity: 0.6 });
  s.add(3, glint(396, 372, 22, '#f4ffff'), glint(250, 520, 12, '#c8fff0'), glint(840, 610, 10, '#c8fff0'));
}

function barnacle(s, x, y, rr) {
  const p = [];
  p.push(el('circle', { cx: x + rr * 0.2, cy: y + rr * 0.3, r: rr * 1.1, fill: '#040c0a', opacity: 0.55, filter: 'url(#glow2)' }));
  // a lumpy little volcano of plates
  const n = 9, pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + x, k = 0.86 + 0.22 * Math.abs(Math.sin(i * 2.3 + x + y));
    pts.push([x + Math.cos(a) * rr * k, y + Math.sin(a) * rr * k]);
  }
  p.push(el('path', { d: spline(pts, true, 4), fill: s.rad([[0, '#fbfdf0'], [0.45, '#c9d2bc'], [1, '#5c6c5e']], 0.34, 0.28, 0.85) }));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + x + 0.3;
    p.push(el('path', { d: `M${x + Math.cos(a) * rr * 0.42} ${y - rr * 0.08 + Math.sin(a) * rr * 0.34}L${x + Math.cos(a) * rr * 0.9} ${y + Math.sin(a) * rr * 0.9}`, stroke: '#4c5c50', 'stroke-width': Math.max(0.9, rr * 0.08), opacity: 0.6, 'stroke-linecap': 'round' }));
  }
  p.push(el('ellipse', { cx: x, cy: y - rr * 0.08, rx: rr * 0.42, ry: rr * 0.32, fill: '#e4ead8', opacity: 0.9 }));
  p.push(el('path', { d: `M${x - rr * 0.3} ${y - rr * 0.08}Q${x} ${y - rr * 0.34} ${x + rr * 0.3} ${y - rr * 0.08}Q${x} ${y + rr * 0.18} ${x - rr * 0.3} ${y - rr * 0.08}Z`, fill: '#141c1c' }));
  return g({}, p);
}

function brow(s, r, pts, side) {
  const p = [];
  const sm = sample(pts, 7);
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < sm.length; i++) {
      const [x, y] = sm[i], t = i / (sm.length - 1), L = (34 + 26 * Math.sin(Math.PI * t) + r.range(-6, 10)) * (pass ? 0.7 : 1);
      // hairs sweep outward from the nose
      const a = (-90 + side * (-64 + t * 50) + r.range(-14, 14)) * Math.PI / 180;
      p.push(el('path', { d: ribbon([[x, y + 10], [x + Math.cos(a) * L * 0.5, y + Math.sin(a) * L * 0.5 + 4], [x + Math.cos(a) * L - side * 8, y + Math.sin(a) * L]], 20, 2), fill: pass ? (i % 2 ? '#eef8e0' : '#c4dcc0') : (i % 2 ? '#8fb49a' : '#6a947e') }));
    }
  }
  p.push(el('path', { d: ribbon(pts, 16, 26, (t) => Math.sin(Math.PI * Math.min(1, t + 0.2))), fill: '#a8c8a8' }));
  return g({ filter: 'url(#shadow)' }, g({ filter: s.emboss({ color: '#ffffff', az: 215, elev: 30, depth: 4, k: 0.7, blur: 3 }) }, p));
}

function beard(s, r) {
  const p = [];
  p.push(el('path', { d: spline([[306, 470], [300, 580], [350, 700], [430, 800], [512, 850], [594, 800], [674, 700], [724, 580], [718, 470], [620, 560], [512, 580], [404, 560]], true), fill: s.lin([[0, '#1f5238'], [0.6, '#12362a'], [1, '#0c2a22']]) }));
  const cols = [['#12362a', '#0a1e1c'], ['#1f5238', '#0d2a22'], ['#2f7044', '#143826'], ['#4a8a48', '#1c4a2c'], ['#6aa450', '#2a5a30']];
  // three passes: far and long and dark, to near and short and bright
  for (let pass = 0; pass < 3; pass++) {
    const n = [15, 13, 11][pass];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n + r.range(-0.02, 0.02), a = Math.PI * (0.04 + 0.92 * t);
      // roots follow the jaw from cheek to cheek
      const x0 = 512 - Math.cos(a) * (212 - pass * 26), y0 = 480 + Math.sin(a) * (104 - pass * 4) + pass * 22;
      const len = (r.range(270, 430) - pass * 50) * (0.5 + 0.7 * Math.sin(a)), sw = r.range(-40, 40), out = -Math.cos(a) * 70;
      const pts = [[x0, y0], [x0 + out * 0.4 + sw * 0.5, y0 + len * 0.33], [x0 + out * 0.8 - sw * 0.6, y0 + len * 0.66], [x0 + out + sw, y0 + len]];
      const c = cols[Math.min(4, pass + r.int(0, 2))], ph = r.range(0, 6), w = r.range(46, 74) - pass * 5;
      const fill = s.lin([[0, c[1]], [0.2, c[0]], [1, c[1]]], 0, y0, 0, y0 + len, true);
      p.push(el('path', { d: ribbon(pts, w, 3, (u) => 0.8 + 0.28 * Math.sin(u * 22 + ph), 16), fill, filter: pass < 2 ? undefined : undefined }));
      p.push(el('path', { d: spline(pts), fill: 'none', stroke: pass === 2 ? '#c8f0a0' : '#5fa878', 'stroke-width': 2.2, opacity: 0.2 + pass * 0.14, 'stroke-linecap': 'round' }));
      if (pass === 2 && i % 3 === 1) {
        const q = sample(pts, 6)[10];
        p.push(el('ellipse', { cx: q[0] + 8, cy: q[1], rx: 9, ry: 13, fill: s.rad([[0, '#e4f8b0'], [0.6, '#7aa850'], [1, '#2a5a30']], 0.35, 0.3, 0.8) }));
      }
    }
  }
  // moustache: two heavy fronds, frosted pale
  const mfill = s.lin([[0, '#e8f6dc'], [0.5, '#9cc0a0'], [1, '#3e6a5a']]);
  const m = [];
  m.push(el('path', { d: ribbon([[520, 534], [440, 548], [366, 596], [328, 676], [344, 740]], 66, 6, (t) => 1 - t * 0.2 + 0.12 * Math.sin(t * 20)), fill: mfill }));
  m.push(el('path', { d: ribbon([[504, 534], [584, 548], [658, 596], [696, 676], [680, 740]], 66, 6, (t) => 1 - t * 0.2 + 0.12 * Math.sin(t * 20 + 2)), fill: s.lin([[0, '#b8d4b8'], [0.5, '#6e9884'], [1, '#2a4a44']]) }));
  for (let k = 0; k < 4; k++) {
    m.push(el('path', { d: spline([[500 - k * 8, 542 + k * 5], [430 - k * 6, 562 + k * 8], [368 - k * 2, 614 + k * 6], [338 + k * 3, 690]]), fill: 'none', stroke: '#3e6a5a', 'stroke-width': 2, opacity: 0.45 }));
    m.push(el('path', { d: spline([[524 + k * 8, 542 + k * 5], [594 + k * 6, 562 + k * 8], [656 - k * 2, 614 + k * 6], [686 - k * 3, 690]]), fill: 'none', stroke: '#1e3a36', 'stroke-width': 2, opacity: 0.45 }));
  }
  const body = g({ filter: s.emboss({ color: '#c8ffe8', az: 215, elev: 30, depth: 6, k: 0.8, blur: 5 }) }, p);
  const mo = g({ filter: 'url(#shadow)' }, g({ filter: s.emboss({ color: '#ffffff', az: 215, elev: 32, depth: 6, k: 0.8, blur: 5 }) }, m));
  // a small starfish that lives in there
  const st = [];
  const sx = 420, sy = 760;
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5 + 0.3, rr = i % 2 ? 11 : 30;
    d += (i ? 'L' : 'M') + (sx + Math.cos(a) * rr).toFixed(1) + ' ' + (sy + Math.sin(a) * rr).toFixed(1);
  }
  st.push(el('path', { d: d + 'Z', fill: s.rad([[0, '#ffd0a0'], [0.6, '#f08a5a'], [1, '#a84a3a']]), stroke: '#f08a5a', 'stroke-width': 7, 'stroke-linejoin': 'round' }));
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * 2 * Math.PI / 5 + 0.3;
    for (const k of [0.3, 0.55, 0.8]) st.push(el('circle', { cx: sx + Math.cos(a) * 30 * k, cy: sy + Math.sin(a) * 30 * k, r: 2, fill: '#fff0d0', opacity: 0.8 }));
  }
  const star = g({ filter: 'url(#shadow)' }, st);
  return g({}, [body, mo, star]);
}

function pot(s, x, y, k) {
  // a lobster-pot: a half-barrel of withies and netting, seen from one end
  const p = [];
  const W = 190 * k, H = 200 * k;
  const arch = (w, h) => `M${x - w} ${y}C${x - w} ${y - h * 1.3} ${x + w} ${y - h * 1.3} ${x + w} ${y}`;
  p.push(el('path', { d: arch(W, H) + 'Z', fill: '#0c2422', opacity: 0.8 }));
  const cp = s.clip(el('path', { d: arch(W, H) + 'Z' }));
  const mesh = [];
  for (let i = -8; i <= 8; i++) {
    mesh.push(el('path', { d: `M${x + i * 44 * k - 200} ${y}L${x + i * 44 * k + 60} ${y - H * 1.1}`, stroke: '#7a9a7c', 'stroke-width': 2.5, opacity: 0.5 }));
    mesh.push(el('path', { d: `M${x + i * 44 * k + 200} ${y}L${x + i * 44 * k - 60} ${y - H * 1.1}`, stroke: '#7a9a7c', 'stroke-width': 2.5, opacity: 0.5 }));
  }
  p.push(g({ 'clip-path': cp }, mesh));
  // the funnel mouth
  p.push(el('ellipse', { cx: x + 10, cy: y - H * 0.48, rx: 50 * k, ry: 44 * k, fill: '#040c0e', stroke: '#9ab08a', 'stroke-width': 5 }));
  for (const f of [1, 0.72, 0.42]) p.push(el('path', { d: arch(W * f, H * (0.6 + 0.4 * f)), fill: 'none', stroke: s.lin([[0, '#b8b47a'], [1, '#4a4a30']]), 'stroke-width': 11 * k, opacity: f === 1 ? 1 : 0.55 }));
  p.push(el('rect', { x: x - W - 12, y: y - 8, width: W * 2 + 24, height: 26, rx: 6, fill: s.lin([[0, '#8a865a'], [1, '#2e3020']]) }));
  for (let i = 0; i < 6; i++) p.push(el('rect', { x: x - W + i * (W * 2 / 6) + 6, y: y + 18, width: W * 2 / 6 - 12, height: 16, rx: 4, fill: '#3a3c26' }));
  return g({ filter: 'url(#glow2)' }, p);
}

function net(s, r) {
  // a net slung from the top right corner, sagging, with cork floats along its edge
  const p = [];
  const sag = (u, v) => [1100 - u * 560 + v * 110, -60 + v * 470 + Math.sin(u * Math.PI) * 60 * v + u * u * 130];
  for (let i = 0; i <= 14; i++) {
    const a = [], b = [];
    for (let j = 0; j <= 14; j++) { a.push(sag(i / 14, j / 14)); b.push(sag(j / 14, i / 14)); }
    p.push(el('path', { d: spline(a), fill: 'none', stroke: '#8ab49a', 'stroke-width': 2.2, opacity: 0.42 }));
    p.push(el('path', { d: spline(b), fill: 'none', stroke: '#8ab49a', 'stroke-width': i === 14 ? 6 : 2.2, opacity: i === 14 ? 0.7 : 0.42 }));
  }
  for (let i = 1; i < 7; i++) {
    const q = sag(i / 7, 1);
    p.push(el('ellipse', { cx: q[0], cy: q[1], rx: 17, ry: 12, fill: s.lin([[0, '#c8a070'], [1, '#5a3e28']]), opacity: 0.9 }));
  }
  return g({ filter: 'url(#glow2)' }, p);
}
