// OLD BRACKWATER (the easy opponent) — the barnacled ghost of a grumpy fisherman: yellow sou'wester, a beard of
// seaweed, one pale glowing eye and one screwed shut, a pipe that blows bubbles. A bit comic.
import { el, g, spline, ribbon, ink, stroke, flat, inkCircle, inkEllipse, eye, star4, halo, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;

const LIFT = 36; // how far the hat is pushed back up off his brow
/** One fat contour round a whole silhouette: stamp every shape in ink, fattened; the fills go on top afterwards. */
const contour = (ds, w = W_SUBJECT) => g({}, ds.map((d) => el('path', { d, fill: INK, stroke: INK, 'stroke-width': w * 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' })));
const rot = (pts, deg, cx, cy) => { const a = deg * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a); return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * sn, cy + (x - cx) * sn + (y - cy) * c - LIFT]); };

function barnacle(x, y, r) {
  return g({}, [inkCircle(x, y, r, '#e3dcc6', { w: W_DETAIL }), el('path', { d: `M${x - r} ${y}A${r} ${r} 0 0 0 ${x + r} ${y}Z`, fill: '#b9b09a', opacity: 0.9 }),
    el('circle', { cx: x, cy: y, r, fill: 'none', stroke: INK, 'stroke-width': W_DETAIL }), el('ellipse', { cx: x, cy: y - r * 0.08, rx: r * 0.42, ry: r * 0.34, fill: INK })]);
}

export function build(s) {
  // ---- 0: harbour murk in flat bands
  s.bands([[0, '#356a5c'], [300, '#2c5a52'], [560, '#234a46'], [820, '#1a3a39']], { amp: 18, waves: 3 });
  s.shafts({ x: 320, y: -140, angle: 82, spread: 40, n: 3, color: '#c8ffe8', opacity: 0.09, width: 120 });
  s.specks({ n: 34, rmin: 2, rmax: 5, colors: ['#9fe0c8', '#d8e8a0'], opacity: 0.45, layer: 0 });
  s.lumps({ y: 930, amp: 80, n: 6, fill: '#122b2c', layer: 0 });
  s.paper();

  // ---- 1: his ghost-light, drawn as flat rings; weed
  s.add(1, halo(512, 450, 440, '#8ff0e0', 3, 0.3));
  s.weed({ x: 80, h: 400, fill: '#2a6f5a', sway: 30, width: 52 });
  s.weed({ x: 950, h: 460, fill: '#2a6f5a', sway: 30, width: 52, lean: -0.05 });

  // ---- 2: Old Brackwater
  const body = [];
  const HX = 512, HY = 300, TILT = -6;
  const coat = spline([[110, 1100], [140, 910], [270, 780], [512, 740], [754, 780], [884, 910], [914, 1100], [512, 1160]], true);
  const head = 'M286 450C286 300 398 262 512 262C626 262 738 300 738 450C738 590 642 668 512 668C382 668 286 590 286 450Z';
  const earL = 'M300 430C250 420 236 480 262 510C276 526 300 520 306 500Z', earR = 'M724 430C774 420 788 480 762 510C748 526 724 520 718 500Z';
  const crown = spline(rot([[322, 310], [326, 206], [408, 124], [512, 106], [616, 124], [698, 206], [702, 310], [512, 330]], TILT, HX, HY), true);
  const brim = spline(rot([[120, 372], [230, 282], [512, 236], [794, 282], [904, 372], [820, 410], [512, 352], [204, 410]], TILT, HX, HY), true);
  // the seaweed beard: fat fronds off the jaw
  const fr = [[322, 560, 230, -22], [384, 600, 290, 16], [450, 620, 250, -14], [520, 630, 330, 12], [592, 620, 270, -16], [654, 600, 240, 18], [706, 560, 200, 22]];
  const fronds = fr.map(([x, y, len, sw]) => ribbon([[x, y], [x + sw, y + len * 0.36], [x - sw * 0.6, y + len * 0.7], [x + sw * 0.8, y + len]], 92, 58, (t) => (0.86 + 0.2 * Math.sin(t * 13 + x)) * (t > 0.9 ? 1 - (t - 0.9) * 4 : 1), 14));
  const chin = 'M290 520C300 660 400 720 512 720C624 720 724 660 734 520C660 580 364 580 290 520Z';
  body.push(contour([coat, head, earL, earR, crown, brim, chin, ...fronds]));

  // coat
  body.push(ink(coat, '#3d6670', { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: coat })) }, [
    flat('M560 700C700 760 760 900 740 1100L1000 1100L1000 700Z', '#2d4d5a'),
    flat('M250 760Q512 900 774 760L774 700L250 700Z', '#2d4d5a'),
  ]));
  body.push(stroke(coat, { w: W_INNER }));
  body.push(ink('M150 900C230 820 330 800 420 850L360 1000C290 950 220 950 160 990Z', '#527f80', { w: W_INNER }));
  body.push(ink('M874 900C794 820 694 800 604 850L664 1000C734 950 804 950 864 990Z', '#466f74', { w: W_INNER }));
  body.push(inkCircle(250, 1000, 26, '#f2c531', { w: W_DETAIL + 1 }));

  // head: pale ghost-grey, one shadow tone under the brim and down the far side
  body.push(ink(earL, '#a9d6c6', { w: W_INNER }), ink(earR, '#86b5a8', { w: W_INNER }));
  body.push(ink(head, '#b4dece', { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: head })) }, [
    flat('M260 230L760 230L760 352Q512 330 260 392Z', '#86b5a8'),
    flat('M650 380C700 460 700 560 640 680L770 680L770 380Z', '#86b5a8'),
  ]));
  body.push(stroke(head, { w: W_INNER }));

  // beard
  const GREENS = ['#3f9468', '#57ad6c'];
  fronds.forEach((d, i) => body.push(ink(d, GREENS[i % 2], { w: W_INNER })));
  body.push(ink(chin, '#3f9468', { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: chin })) }, flat('M560 540C640 600 700 600 760 520L760 740L520 740C600 700 600 600 560 540Z', '#2c7556')));
  fr.forEach(([x, y, len, sw], i) => body.push(stroke(spline([[x, y + 60], [x + sw, y + len * 0.36], [x - sw * 0.6, y + len * 0.7], [x + sw * 0.6, y + len * 0.9]]), { w: W_DETAIL, stroke: i % 2 ? '#3f9468' : '#2c7556' })));
  [[372, 800, 15], [530, 880, 17], [650, 770, 14], [452, 790, 12]].forEach(([x, y, rr]) => body.push(inkCircle(x, y, rr, '#b6e88a', { w: W_DETAIL }), el('circle', { cx: x - rr * 0.3, cy: y - rr * 0.3, r: rr * 0.26, fill: '#fff' })));
  // the moustache: two drooping leaves
  body.push(ink(ribbon([[520, 572], [446, 566], [384, 606], [346, 668]], 30, 16, (t) => 0.9 + Math.sin(Math.PI * Math.min(1, t * 1.2)) * 1.7), '#7fcf7a', { w: W_INNER }));
  body.push(ink(ribbon([[504, 572], [578, 566], [640, 606], [678, 668]], 30, 16, (t) => 0.9 + Math.sin(Math.PI * Math.min(1, t * 1.2)) * 1.7), '#6dbd70', { w: W_INNER }));

  // the pipe, out of the corner of his mouth
  body.push(ink('M600 628L716 610L716 560L790 560L790 640C790 668 760 676 730 664L606 660Z', '#8a5a3c', { w: W_INNER }));
  body.push(flat('M722 630L784 630L784 640C784 660 762 668 734 658Z', '#643c2a'));
  body.push(ink('M708 548L798 548L798 572L708 572Z', '#b9834e', { w: W_DETAIL + 1 }));

  // the glowing eye and the squint
  body.push(halo(418, 446, 118, '#7ff5ee', 2, 0.7));
  body.push(eye(418, 446, 62, { look: [0.25, 0.15], iris: '#28b8cc', white: '#f2fffb', pupil: 0.5 }));
  body.push(el('circle', { cx: 423, cy: 449, r: 13, fill: INK }));
  body.push(stroke('M556 462Q604 428 652 462', { w: W_INNER + 4 }));
  body.push(stroke('M560 492q40 16 84 0', { w: W_DETAIL }), stroke('M662 440l22 -10M664 462l24 4', { w: W_DETAIL }));
  // brows: one up, one jammed down
  body.push(ink('M340 372C370 330 450 322 494 350C500 366 492 380 480 384C440 368 390 372 352 396C340 392 336 382 340 372Z', '#f1f6e6', { w: W_INNER }));
  body.push(ink('M540 410C570 386 650 388 700 420C708 434 700 448 688 448C650 430 590 428 552 440C538 434 534 420 540 410Z', '#d5e3d0', { w: W_INNER }));
  // the nose
  body.push(inkEllipse(512, 520, 62, 54, '#8fc9d0', { w: W_INNER }));
  body.push(flat('M512 574A62 54 0 0 0 574 520A62 54 0 0 0 556 484C566 530 540 562 500 572Z', '#6aa6b4'));
  body.push(el('ellipse', { cx: 490, cy: 498, rx: 16, ry: 11, fill: '#fff', opacity: 0.9, transform: 'rotate(-30 490 498)' }));
  body.push(inkEllipse(512, 520, 62, 54, 'none', { w: W_INNER }));

  // the sou'wester
  body.push(ink(crown, '#f2c531', { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: crown })) }, [
    flat('M560 40C660 100 700 200 700 340L800 340L800 40Z', '#d99a1e'),
    flat('M318 170C338 130 388 106 428 104C388 130 358 160 344 210Z', '#fff0a0'),
  ]));
  body.push(stroke(crown, { w: W_INNER }));
  body.push(ink(brim, '#f7d23e', { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: brim })) }, [
    flat(spline(rot([[100, 420], [204, 380], [512, 318], [820, 376], [930, 420], [930, 470], [100, 470]], TILT, HX, HY), true), '#d99a1e'),
    flat(spline(rot([[600, 220], [800, 270], [920, 380], [940, 200]], TILT, HX, HY), true), '#d99a1e'),
  ]));
  body.push(stroke(brim, { w: W_INNER }));
  // barnacles: on the hat, the cheek, the shoulder
  body.push(barnacle(620, 128, 28), barnacle(664, 170, 20), barnacle(604, 178, 15), barnacle(236, 288, 24), barnacle(274, 262, 16));
  body.push(barnacle(336, 560, 22), barnacle(690, 520, 18), barnacle(760, 870, 28), barnacle(716, 900, 18));
  s.add(2, g({ filter: s.wobble(5) }, body));

  // ---- 3: pipe bubbles, a glint off the eye
  const bub = (x, y, r) => g({}, [inkCircle(x, y, r, '#bfefff', { w: W_DETAIL, 'fill-opacity': 0.4 }), el('circle', { cx: x - r * 0.34, cy: y - r * 0.36, r: r * 0.22, fill: '#fff' })]);
  s.add(3, bub(770, 500, 20), bub(810, 440, 28), bub(790, 366, 16), bub(850, 300, 34), bub(880, 520, 12));
  s.add(3, star4(330, 400, 26, '#ffffff'), star4(150, 250, 26, '#d8fff8'), star4(900, 700, 20, '#fff6c0'), star4(120, 640, 18));
  s.specks({ n: 12, rmin: 3, rmax: 7, colors: ['#ffffff', '#d8fff8', '#e8f0a8'], opacity: 0.85 });
}
