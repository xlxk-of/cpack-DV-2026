// MADAME MURK (the medium opponent) — an octopus fortune-teller: bulbous head, jewelled headscarf, clever
// heavy-lidded eyes, a gold hoop, and her arms curled round a crystal ball that shines with drawn light.
import { el, g, spline, ribbon, sample, ink, stroke, flat, inkCircle, inkEllipse, eye, star4, halo, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;

const BX = 512, BY = 842, BR = 132; // the crystal ball
const SKIN = '#b866dc', SHADE = '#8c44bc', LIGHT = '#e6b0ff', GOLD = '#f6c544', GOLD_D = '#cf9326';

/** One fat contour round a whole silhouette: stamp every shape in ink, fattened; the fills go on top afterwards. */
const contour = (ds, w = W_SUBJECT) => g({}, ds.map((d) => el('path', { d, fill: INK, stroke: INK, 'stroke-width': w * 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' })));

/** A row of suckers along a curve. */
function suckers(pts, n, r0, r1, t0 = 0.15, t1 = 0.95, off = 0) {
  const sm = sample(pts, 16), out = [];
  for (let i = 0; i < n; i++) {
    const t = t0 + (t1 - t0) * (i / (n - 1)), k = Math.min(sm.length - 2, Math.floor(t * (sm.length - 1)));
    const a = sm[k], b = sm[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, rr = r0 + (r1 - r0) * (i / (n - 1));
    out.push(inkCircle(a[0] - dy / len * off, a[1] + dx / len * off, rr, '#ffd0ee', { w: W_DETAIL }));
  }
  return g({}, out);
}

export function build(s) {
  // ---- 0: the booth: violet dark in flat bands, a swag of curtain
  s.bands([[0, '#56288e'], [290, '#472078'], [560, '#391964'], [820, '#2b1250']], { amp: 18, waves: 3 });
  s.shafts({ x: 512, y: -160, angle: 90, spread: 50, n: 3, color: '#ff9fe8', opacity: 0.08, width: 130 });
  s.add(0, flat('M-20 -20L1044 -20L1044 150Q900 60 780 130Q650 30 512 110Q374 30 244 130Q124 60 -20 150Z', '#2b1250'));
  s.specks({ n: 30, rmin: 2, rmax: 5, colors: ['#ff9fe8', '#b9a6ff', '#ffe9a8'], opacity: 0.5, layer: 0 });
  s.lumps({ y: 950, amp: 60, n: 6, fill: '#1c0b3a', layer: 0 });
  s.paper();

  // ---- 1: the ball's light, drawn as flat rings behind her
  s.add(1, halo(BX, BY - 60, 470, '#ff8fe0', 3, 0.26));

  // ---- 2: Madame Murk
  const body = [];
  const head = 'M298 474C240 300 326 104 512 104C698 104 784 300 726 474C700 590 622 648 512 648C402 648 324 590 298 474Z';
  const skirt = spline([[250, 640], [512, 590], [774, 640], [850, 820], [800, 1100], [224, 1100], [174, 820]], true);
  const backL = [[330, 640], [190, 610], [116, 700], [150, 800], [226, 786]], backR = [[694, 640], [834, 610], [908, 700], [874, 800], [798, 786]];
  const waveR = [[716, 560], [850, 540], [920, 430], [880, 330], [812, 356]];
  const frontL = [[410, 600], [270, 690], [222, 860], [318, 962], [420, 914]], frontR = [[614, 600], [754, 690], [802, 860], [706, 962], [604, 914]];
  const tBackL = ribbon(backL, 120, 34), tBackR = ribbon(backR, 120, 34), tWave = ribbon(waveR, 110, 30);
  const tFrontL = ribbon(frontL, 130, 44), tFrontR = ribbon(frontR, 130, 44);
  const scarf = 'M254 318Q512 206 770 318L776 396Q512 298 248 396Z';
  const knot = 'M226 330C200 320 180 350 196 376C210 398 250 396 262 372C272 350 252 332 226 330Z';
  const tail1 = ribbon([[226, 370], [176, 440], [196, 540]], 66, 30), tail2 = ribbon([[238, 376], [240, 470], [290, 540]], 60, 26);
  const ball = `M${BX - BR} ${BY}A${BR} ${BR} 0 1 0 ${BX + BR} ${BY}A${BR} ${BR} 0 1 0 ${BX - BR} ${BY}Z`;
  const stand = `M${BX - 110} ${BY + 96}L${BX + 110} ${BY + 96}L${BX + 150} 1060L${BX - 150} 1060Z`;
  body.push(contour([tBackL, tBackR, tWave, skirt, head, scarf, knot, tail1, tail2, stand, ball, tFrontL, tFrontR]));

  // the arms behind
  for (const [d, pts, side] of [[tBackL, backL, 1], [tBackR, backR, -1], [tWave, waveR, -1]]) {
    body.push(ink(d, SHADE, { w: W_INNER }));
    body.push(suckers(pts, 5, 13, 7, 0.45, 0.95, side * 10));
  }
  // the mantle skirt under her chin
  body.push(ink(skirt, '#a656cc', { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: skirt })) }, [
    flat('M240 600Q512 760 784 600L784 560L240 560Z', '#7c38ac'),
    flat('M620 600C760 700 800 860 760 1100L900 1100L900 600Z', '#7c38ac'),
  ]));
  body.push(stroke(skirt, { w: W_INNER }));

  // the ball: its light on her, the stand, the glass
  body.push(halo(BX, BY, 250, '#c8f6ff', 3, 0.42));
  body.push(ink(stand, GOLD, { w: W_INNER }), flat(`M${BX + 30} ${BY + 100}L${BX + 108} ${BY + 100}L${BX + 144} 1060L${BX + 50} 1060Z`, GOLD_D), stroke(stand, { w: W_INNER }));
  body.push(ink(ball, '#b8f4ff', { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: ball })) }, [
    flat(`M${BX + 20} ${BY + BR + 10}C${BX + 110} ${BY + 60} ${BX + 120} ${BY - 40} ${BX + 80} ${BY - BR}L${BX + BR + 20} ${BY - BR}L${BX + BR + 20} ${BY + BR + 10}Z`, '#74c8f0'),
    flat(spline([[BX - 70, BY + 30], [BX - 20, BY - 10], [BX + 40, BY + 20], [BX + 60, BY + 70], [BX, BY + 90], [BX - 50, BY + 70]], true), '#e9d0ff'),
    flat(`M${BX - 98} ${BY - 20}C${BX - 100} ${BY - 70} ${BX - 66} ${BY - 104} ${BX - 26} ${BY - 110}C${BX - 60} ${BY - 88} ${BX - 78} ${BY - 60} ${BX - 78} ${BY - 20}Z`, '#ffffff'),
  ]));
  body.push(stroke(ball, { w: W_INNER }));
  body.push(star4(BX + 6, BY + 4, 44, '#ffffff', W_DETAIL + 1), star4(BX + 62, BY - 54, 18, '#fff6c0', W_DETAIL));

  // the arms in front, cradling it
  for (const [d, pts, side] of [[tFrontL, frontL, -1], [tFrontR, frontR, 1]]) {
    body.push(ink(d, SKIN, { w: W_INNER }));
    body.push(suckers(pts, 6, 15, 8, 0.3, 0.96, side * 6));
  }

  // the head
  body.push(ink(head, SKIN, { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: head })) }, [
    flat('M600 90C720 190 760 380 690 560C660 620 600 650 540 660L800 660L800 90Z', SHADE),
    flat('M240 380Q512 290 784 380L784 424Q512 330 240 424Z', SHADE),
    flat('M352 250C352 180 400 136 452 126C410 160 390 200 384 256Z', LIGHT),
    el('ellipse', { cx: 520, cy: 170, rx: 30, ry: 20, fill: SHADE }), el('ellipse', { cx: 600, cy: 222, rx: 20, ry: 14, fill: '#7a36ac' }),
    el('ellipse', { cx: 456, cy: 226, rx: 16, ry: 11, fill: SHADE }),
  ]));
  body.push(stroke(head, { w: W_INNER }));

  // the headscarf, its knot and tails
  body.push(ink(tail1, '#c22a78', { w: W_INNER }), ink(tail2, '#e2428e', { w: W_INNER }), ink(knot, '#e2428e', { w: W_INNER }));
  body.push(ink(scarf, '#e2428e', { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: scarf })) }, [
    flat('M620 200L800 200L800 420L680 420C700 340 680 270 620 200Z', '#b82672'),
    stroke('M248 372Q512 276 776 372', { w: 12, stroke: GOLD }),
    ...[[330, 310], [420, 280], [604, 280], [694, 310]].map(([x, y]) => star4(x, y, 15, GOLD, 0)),
  ]));
  body.push(stroke(scarf, { w: W_INNER }));
  // coins hanging off the hem, and the gem at the brow
  for (const [x, y] of [[352, 378], [428, 356], [596, 356], [672, 378]]) {
    body.push(stroke(`M${x} ${y - 26}L${x} ${y}`, { w: W_DETAIL }), inkCircle(x, y + 8, 19, GOLD, { w: W_DETAIL + 1 }), el('circle', { cx: x - 5, cy: y + 3, r: 5, fill: '#fff6c0' }));
  }
  body.push(inkCircle(512, 318, 44, GOLD, { w: W_INNER }));
  body.push(ink('M512 288L538 318L512 350L486 318Z', '#58e8e0', { w: W_DETAIL }), flat('M512 288L538 318L512 350Z', '#2fb8c8'), stroke('M512 288L538 318L512 350L486 318Z', { w: W_DETAIL }));
  body.push(el('circle', { cx: 502, cy: 310, r: 5, fill: '#fff' }));

  // the face: heavy lids, lashes, a knowing little smile
  body.push(eye(424, 474, 56, { look: [0.3, 0.45], lid: 0.42, lidRot: 8, lidFill: '#6a2aa0' }), eye(600, 474, 56, { look: [0.3, 0.45], lid: 0.42, lidRot: -8, lidFill: '#6a2aa0' }));
  body.push(stroke('M366 462L340 446M374 444L352 422M658 462L684 446M650 444L672 422', { w: W_DETAIL + 1 }));
  body.push(el('ellipse', { cx: 366, cy: 552, rx: 26, ry: 15, fill: '#ff8fd0', opacity: 0.8 }), el('ellipse', { cx: 658, cy: 552, rx: 26, ry: 15, fill: '#f078c8', opacity: 0.8 }));
  body.push(ink('M470 566Q492 556 512 566Q532 556 554 562Q540 600 512 600Q486 600 470 566Z', '#e2428e', { w: W_DETAIL + 1 }));
  body.push(stroke('M470 566Q512 584 554 562', { w: W_DETAIL }), stroke('M554 562q14 -4 20 -16', { w: W_DETAIL }));
  body.push(el('circle', { cx: 604, cy: 574, r: 7, fill: INK }));
  // the hoop
  body.push(el('circle', { cx: 738, cy: 548, r: 44, fill: 'none', stroke: INK, 'stroke-width': 28 }), el('circle', { cx: 738, cy: 548, r: 44, fill: 'none', stroke: GOLD, 'stroke-width': 12 }));
  body.push(el('path', { d: 'M738 504A44 44 0 0 1 782 548', fill: 'none', stroke: GOLD_D, 'stroke-width': 12 }));

  s.add(2, g({ filter: s.wobble(5) }, body));

  // ---- 3: sparkles and incense motes
  s.add(3, star4(170, 250, 30, '#fff6c0'), star4(880, 220, 24, '#ffd1ef'), star4(120, 560, 20), star4(930, 600, 22, '#fff6c0'), star4(690, 720, 20, '#ffffff'));
  s.inkBubbles({ n: 5, x0: 40, x1: 240, y0: 560, y1: 980, rmin: 8, rmax: 20, fill: '#f0c8ff' });
  s.specks({ n: 14, rmin: 3, rmax: 7, colors: ['#ffffff', '#ffd1ef', '#ffe9a8'], opacity: 0.9 });
}
