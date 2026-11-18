// STORMCALLER RAY (rare) — a manta gliding straight at you with a cheeky grin, chunky zig-zag lightning on its
// wings. Doodle style: fat ink line, flat colour, one hard shadow, drawn light.
import { el, g, spline, ribbon, ink, stroke, flat, inkCircle, eye, star4, halo, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const BODY = '#6b5cf0', BODY_D = '#4840bd', BELLY = '#ece6ff', BELLY_D = '#cbbff5';
const ZAP = '#ffe14d', ZAP_D = '#ffb52e', ZAP_L = '#fff6b8';
// a chunky two-kink bolt, 120 long, pointing down from (0,0)
const BOLT = 'M-8 0L22 0L9 30L30 30L16 62L34 62L-8 122L2 78L-18 78L-5 46L-26 46Z';
const mirror = (inner) => g({ transform: 'translate(1024 0) scale(-1 1)' }, inner);

export function build(s) {
  const form = (d, fill, inside = [], w = W_INNER) => g({}, [flat(d, fill), inside.length ? g({ 'clip-path': s.clip(el('path', { d })) }, inside) : '', stroke(d, { w })]);
  const contour = (ds, w = W_SUBJECT) => g({}, ds.map((d) => el('path', { d, fill: INK, stroke: INK, 'stroke-width': w * 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' })));
  const bolt = (x, y, rot, k, o = {}) => { const { fill = ZAP, w = W_INNER, half = true } = o;
    return g({ transform: `translate(${x} ${y}) rotate(${rot}) scale(${k})` }, [
      el('path', { d: BOLT, fill, stroke: INK, 'stroke-width': w / k, 'stroke-linejoin': 'round' }),
      half ? flat('M30 30L16 62L34 62L-8 122L8 60L22 60Z', ZAP_D) : '',
      el('path', { d: BOLT, fill: 'none', stroke: INK, 'stroke-width': w / k, 'stroke-linejoin': 'round' })]); };

  // ---- 0: storm water in flat bands; far forks of lightning coming down from the surface, flat, no line
  s.bands([[0, '#2c5d8c'], [300, '#234b7a'], [560, '#1a3966'], [820, '#11284c']], { amp: 18, waves: 3 });
  s.shafts({ x: 512, y: -160, angle: 90, spread: 50, n: 4, color: '#a9d8ff', opacity: 0.1, width: 100 });
  const far = (x, y, rot, k, op) => el('path', { d: BOLT, fill: '#bfe6ff', opacity: op, transform: `translate(${x} ${y}) rotate(${rot}) scale(${k})` });
  s.add(0, far(170, -30, 8, 2.3, 0.3), far(884, -50, -6, 2.7, 0.3), far(350, -40, -12, 1.5, 0.22), far(700, -40, 14, 1.4, 0.2));
  s.specks({ n: 40, rmin: 2, rmax: 5, colors: ['#8fd0ff', '#b9a6ff'], opacity: 0.5, layer: 0 });
  s.lumps({ y: 900, amp: 90, n: 7, fill: '#0c1c3c', layer: 0 });
  s.paper();

  // ---- 1: the charge round the wing tips, drawn as flat rings; fish clearing off; the reef
  const CHARGE = ['#3c72a6', '#538dbf', '#73abd8'];     // opaque steps of the water lightened to pale blue: no yellow over blue
  s.add(1, halo(832, 232, 118, CHARGE), halo(192, 232, 118, CHARGE));
  const fish = (x, y, a, k, f) => g({ transform: `translate(${x} ${y}) rotate(${a}) scale(${k})`, opacity: 0.9 }, [
    ink('M-34 0L-64 -22Q-56 0 -64 22Z', f, { w: W_MID / k }), ink('M-40 0a40 25 0 1 0 80 0a40 25 0 1 0 -80 0Z', f, { w: W_MID / k }),
    el('circle', { cx: 18, cy: -5, r: 8, fill: '#fff' }), el('circle', { cx: 20, cy: -5, r: 4.5, fill: INK })]);
  s.add(1, fish(120, 560, 200, 0.8, '#4f8fc4'), fish(900, 610, -24, 0.9, '#4f8fc4'), fish(830, 730, -10, 0.6, '#5a7fd0'), fish(210, 720, 190, 0.6, '#5a7fd0'));
  s.weed({ x: 96, h: 330, fill: '#1c6f73', sway: 30, width: 52 });
  s.weed({ x: 936, h: 380, fill: '#1c6f73', sway: 32, lean: -0.05, width: 54 });
  s.weed({ x: 860, h: 240, fill: '#17595f', sway: 22, width: 44 });
  s.lumps({ y: 965, amp: 60, n: 6, fill: '#1a2a5c', layer: 1, w: W_MID });

  // ---- 2: the ray
  const half = [[512, 292], [600, 304], [690, 322], [768, 292], [838, 222], [822, 334], [768, 438], [696, 530], [614, 604], [512, 642]];
  const pts = half.concat(half.slice(1, -1).reverse().map(([x, y]) => [1024 - x, y]));
  const bodyD = spline(pts, true, 10);
  // the tail trails out from behind the body low on one side, tapering, a spark on its tip
  const tailPts = [[660, 500], [736, 566], [780, 636], [748, 708]];
  const tail = ribbon(tailPts, 36, 10);
  const lobeR = ribbon([[596, 570], [616, 632], [584, 668]], 62, 30), lobeL = ribbon([[428, 570], [408, 632], [440, 668]], 62, 30);
  const body = [];
  body.push(contour([tail, lobeL, lobeR, bodyD]));
  body.push(form(tail, BODY, [flat(ribbon(tailPts.map(([x, y]) => [x - 10, y + 12]), 18, 6), BODY_D)]));
  body.push(g({ transform: 'translate(746 706) rotate(26) scale(0.5)' }, el('path', { d: BOLT, fill: ZAP, stroke: INK, 'stroke-width': W_DETAIL / 0.5 + 12, 'stroke-linejoin': 'round' })), bolt(746, 706, 26, 0.5, { w: W_DETAIL, half: false }));
  body.push(form(lobeL, BODY, [flat(ribbon([[412, 570], [392, 632], [424, 668]], 30, 16), BODY_D)]), form(lobeR, BODY, [flat(ribbon([[580, 570], [600, 632], [568, 668]], 30, 16), BODY_D)]));
  const zapWing = [bolt(634, 442, -124, 1.66)];
  body.push(form(bodyD, BODY_D, [
    flat(bodyD, BODY, { transform: 'translate(0 -30)' }),
    // the pale underside showing at the front
    ink('M362 656a150 140 0 1 1 300 0Z', BELLY, { w: W_INNER }),
    flat('M362 656a150 140 0 0 1 20 -72q50 24 60 72z', BELLY_D),
    stroke('M604 590l24 -8M608 614l24 -6M420 590l-24 -8M416 614l-24 -6', { w: W_DETAIL }),
    // lightning down each wing
    ...zapWing, mirror(zapWing),
    // hard highlights
    flat('M470 312h70q9 0 9 8t-9 8h-70q-9 0 -9 -8t9 -8z', '#ffffff', { opacity: 0.85 }),
    flat('M742 300q30 -10 52 -34q-6 30 -40 50z', '#ffffff', { opacity: 0.85 }), flat('M282 300q-30 -10 -52 -34q6 30 40 50z', '#ffffff', { opacity: 0.85 }),
  ], W_SUBJECT));
  // the face
  body.push(eye(450, 446, 43, { look: [0.1, 0.3], lid: 0.2, lidRot: 14, lidFill: BODY_D }), eye(574, 446, 43, { look: [0.1, 0.3], lid: 0.2, lidRot: -14, lidFill: BODY_D }));
  const mouth = 'M450 546Q514 566 582 528Q584 602 518 606Q462 602 450 546Z';
  body.push(form(mouth, '#3a1b4d', [el('ellipse', { cx: 524, cy: 608, rx: 36, ry: 26, fill: '#ff86b4' })]));
  body.push(el('ellipse', { cx: 396, cy: 514, rx: 19, ry: 11, fill: '#ff9fdc', opacity: 0.85 }), el('ellipse', { cx: 630, cy: 510, rx: 19, ry: 11, fill: '#ff9fdc', opacity: 0.85 }));
  s.add(2, g({ filter: s.wobble(5) }, body));

  // ---- 3: sparks jumping off the wing tips, bubbles
  s.add(3, bolt(858, 176, -150, 0.72, { w: W_DETAIL }), bolt(876, 262, -74, 0.6, { w: W_DETAIL }), mirror([bolt(858, 176, -150, 0.72, { w: W_DETAIL }), bolt(876, 262, -74, 0.6, { w: W_DETAIL })]));
  s.add(3, bolt(826, 486, -20, 0.55, { w: W_DETAIL }), mirror(bolt(770, 560, -30, 0.45, { w: W_DETAIL })));
  s.add(3, star4(770, 190, 26, ZAP_L), star4(244, 176, 22, ZAP_L), star4(880, 380, 18), star4(150, 360, 20), star4(650, 180, 16, '#ffffff'), star4(300, 680, 18, ZAP_L));
  s.inkBubbles({ n: 7, y0: 700, rmin: 8, rmax: 22 });
  [[300, 250, 12], [322, 204, 8], [716, 236, 10]].forEach(([x, y, q]) => s.add(3, inkCircle(x, y, q, '#bfefff', { w: W_DETAIL, 'fill-opacity': 0.35 }), el('circle', { cx: x - q * 0.34, cy: y - q * 0.36, r: q * 0.22, fill: '#fff' })));
  s.specks({ n: 14, rmin: 3, rmax: 7, colors: ['#ffffff', ZAP_L, '#b9f3ff'], opacity: 0.9 });
}
