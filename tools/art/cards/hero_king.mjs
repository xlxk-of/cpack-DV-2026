// THE DROWNED KING (the hard opponent) — long dead on his sunken throne: a chunky skull under a dented crown with one
// living gem, cold blue pinpricks in the hollow sockets, a ragged collar, chains. Menacing, but still a doodle.
import { el, g, spline, poly, sample, ink, stroke, flat, inkCircle, inkEllipse, star4, halo, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;

const BONE = '#dde9f6', BONE_S = '#a2b6d8', STEEL = '#7088cc', STEEL_S = '#465a9e', STEEL_L = '#b9cdfa', ICE = '#8ff2ff';

/** One fat contour round a whole silhouette: stamp every shape in ink, fattened; the fills go on top afterwards. */
const contour = (ds, w = W_SUBJECT) => g({}, ds.map((d) => el('path', { d, fill: INK, stroke: INK, 'stroke-width': w * 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' })));
const rotP = (pts, deg, cx, cy) => { const a = deg * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a); return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * sn, cy + (x - cx) * sn + (y - cy) * c]); };

/** A chain of chunky links along a curve: rings and edge-on bars by turns. */
function chain(pts, n) {
  const sm = sample(pts, 20), out = [];
  for (let i = 0; i < n; i++) {
    const k = Math.round((i + 0.5) / n * (sm.length - 1)), a = sm[Math.max(0, k - 1)], b = sm[Math.min(sm.length - 1, k + 1)], p = sm[k];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI, tr = `rotate(${ang.toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)})`;
    if (i % 2 === 0) {
      out.push(el('ellipse', { cx: p[0], cy: p[1], rx: 27, ry: 17, fill: 'none', stroke: INK, 'stroke-width': 24, transform: tr }));
      out.push(el('ellipse', { cx: p[0], cy: p[1], rx: 27, ry: 17, fill: 'none', stroke: STEEL, 'stroke-width': 10, transform: tr }));
      out.push(el('path', { d: `M${p[0] - 27} ${p[1]}A27 17 0 0 1 ${p[0]} ${p[1] - 17}`, fill: 'none', stroke: STEEL_L, 'stroke-width': 10, 'stroke-linecap': 'round', transform: tr }));
    } else {
      out.push(el('path', { d: `M${p[0] - 20} ${p[1]}L${p[0] + 20} ${p[1]}`, stroke: INK, 'stroke-width': 26, 'stroke-linecap': 'round', transform: tr }));
      out.push(el('path', { d: `M${p[0] - 20} ${p[1]}L${p[0] + 20} ${p[1]}`, stroke: STEEL_S, 'stroke-width': 12, 'stroke-linecap': 'round', transform: tr }));
    }
  }
  return g({}, out);
}

/** A hollow socket with a cold pinprick of light in it and a bone brow slanting down over it. side: -1 left, 1 right. */
function socket(s, x, y, r, side) {
  const id = s.clip(el('circle', { cx: x, cy: y, r }));
  const px = x - side * r * 0.12, py = y + r * 0.2;
  const y0 = y - r * 0.82, y1 = y - r * 0.02; // the brow: high at the temple, low at the nose
  const xa = x + side * r * 1.3, xb = x - side * r * 1.3;
  return g({}, [
    inkCircle(x, y, r, '#0a0f2c', { w: W_INNER }),
    halo(px, py, r * 0.62, '#3fa8ff', 2, 0.55),
    el('circle', { cx: px, cy: py, r: r * 0.24, fill: ICE }), el('circle', { cx: px, cy: py, r: r * 0.11, fill: '#fff' }),
    g({ 'clip-path': id }, [flat(`M${xa} ${y - r * 1.4}L${xb} ${y - r * 1.4}L${xb} ${y1}L${xa} ${y0}Z`, BONE_S), stroke(`M${xb} ${y1}L${xa} ${y0}`, { w: W_INNER })]),
    el('circle', { cx: x, cy: y, r, fill: 'none', stroke: INK, 'stroke-width': W_INNER }),
  ]);
}

export function build(s) {
  // ---- 0: the black deep in flat bands
  s.bands([[0, '#1b2a66'], [300, '#152154'], [560, '#101942'], [820, '#0a1030']], { amp: 18, waves: 3 });
  s.shafts({ x: 512, y: -160, angle: 90, spread: 54, n: 3, color: '#7fb8ff', opacity: 0.08, width: 130 });
  s.specks({ n: 34, rmin: 2, rmax: 5, colors: ['#7fb8ff', '#b9a6ff', '#bff6ff'], opacity: 0.45, layer: 0 });
  // the back of his throne, far and flat
  s.add(0, flat('M150 1100L150 420L210 330L270 420L270 250L340 150L410 250L410 1100Z', '#0c1436'), flat('M874 1100L874 420L814 330L754 420L754 250L684 150L614 250L614 1100Z', '#0c1436'));
  s.lumps({ y: 960, amp: 60, n: 6, fill: '#070b22', layer: 0 });
  s.paper();

  // ---- 1: the cold light round his head, drawn as flat rings
  s.add(1, halo(512, 420, 430, '#4a9cff', 3, 0.3));

  // ---- 2: the king
  const body = [];
  const cloak = spline([[100, 1100], [130, 910], [262, 800], [512, 760], [762, 800], [894, 910], [924, 1100], [512, 1160]], true);
  const collar = poly([[250, 840], [128, 470], [190, 520], [196, 398], [252, 462], [282, 372], [330, 470], [400, 700], [624, 700], [694, 470], [742, 372], [772, 462], [828, 398], [834, 520], [896, 470], [774, 840]], true);
  const neck = 'M462 700L562 700L570 830L454 830Z';
  const skull = 'M290 424C290 248 396 176 512 176C628 176 734 248 734 424C734 500 712 540 678 566L672 614C668 640 650 650 640 652L632 716C626 760 580 782 512 782C444 782 398 760 392 716L384 652C374 650 356 640 352 614L346 566C312 540 290 500 290 424Z';
  const TILT = -7, CX = 512, CY = 250;
  const crownPts = rotP([[312, 288], [296, 140], [366, 200], [410, 96], [462, 190], [512, 62], [562, 190], [604, 132], [636, 150], [658, 200], [728, 140], [712, 288], [612, 262], [512, 254], [412, 262]], TILT, CX, CY);
  const crown = poly(crownPts, true);
  body.push(contour([cloak, collar, neck, skull, crown]));

  // the ragged collar and the mantle
  body.push(ink(collar, '#2a3676', { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: collar })) }, [flat('M512 300L920 300L920 860L512 860Z', '#1d2659'), flat('M330 470L400 700L624 700L694 470L694 860L330 860Z', '#141a44')]));
  body.push(stroke(collar, { w: W_INNER }));
  body.push(stroke('M196 398L236 560M828 398L788 560', { w: W_DETAIL }));
  body.push(ink(cloak, '#1a2152', { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: cloak })) }, [
    flat('M560 740C720 800 780 920 760 1100L1000 1100L1000 740Z', '#11163c'),
    flat('M240 790Q512 930 784 790L784 740L240 740Z', '#11163c'),
  ]));
  body.push(stroke(cloak, { w: W_INNER }));
  // tatters: holes and a patch of pale weed on the shoulder
  body.push(ink('M196 930q30 -26 54 4q-8 34 -40 30q-22 -8 -14 -34Z', '#0a1030', { w: W_DETAIL }), ink('M800 960q24 -20 44 6q-10 26 -34 20q-16 -8 -10 -26Z', '#0a1030', { w: W_DETAIL }));

  // the neck bones
  body.push(ink(neck, BONE_S, { w: W_INNER }), stroke('M462 742L562 742M458 784L566 784', { w: W_DETAIL + 1 }));

  // the skull: one hard shadow tone down the far side and under the cheekbones
  body.push(ink(skull, BONE, { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: skull })) }, [
    flat('M610 160C720 250 740 420 670 560L650 800L800 800L800 160Z', BONE_S),
    flat('M330 560Q512 640 694 560L694 600Q512 670 330 600Z', BONE_S),
    flat('M338 330C338 270 380 226 430 212C394 244 374 280 370 334Z', '#ffffff'),
  ]));
  body.push(stroke(skull, { w: W_INNER }));
  body.push(stroke('M346 566q20 14 38 86M678 566q-20 14 -38 86', { w: W_DETAIL }));
  // sockets, nose, cracks
  body.push(socket(s, 414, 452, 70, -1), socket(s, 610, 452, 70, 1));
  body.push(ink('M512 518L482 574Q496 590 512 574Q528 590 542 574Z', '#0a0f2c', { w: W_DETAIL + 1 }));
  body.push(stroke('M650 330L628 362L654 384L640 410', { w: W_DETAIL }), stroke('M330 520l22 14l-8 20', { w: W_DETAIL }));
  // the teeth: clenched, turned down at the corners
  const teeth = 'M404 660Q512 626 620 660L612 738Q512 708 412 738Z';
  body.push(ink(teeth, '#f6fbff', { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: teeth })) }, [
    flat('M560 600L640 600L640 760L560 760Z', BONE_S),
    stroke('M440 630L444 760M476 630L478 760M512 630L512 760M548 630L546 760M584 630L580 760', { w: W_DETAIL + 1 }),
    stroke('M404 700Q512 668 620 700', { w: W_DETAIL + 1 }),
  ]));
  body.push(stroke(teeth, { w: W_INNER }));

  // the crown: dented, one point snapped, one gem still alive
  body.push(ink(crown, STEEL, { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: crown })) }, [
    flat(poly(rotP([[540, 40], [760, 40], [760, 320], [600, 320], [612, 180]], TILT, CX, CY), true), STEEL_S),
    flat(poly(rotP([[290, 236], [512, 206], [734, 236], [734, 320], [290, 320]], TILT, CX, CY), true), STEEL_S),
    flat(poly(rotP([[318, 170], [340, 190], [338, 232], [322, 236]], TILT, CX, CY), true), STEEL_L),
    flat(poly(rotP([[402, 130], [420, 150], [428, 206], [404, 210]], TILT, CX, CY), true), STEEL_L),
  ]));
  body.push(stroke(crown, { w: W_INNER }));
  body.push(stroke(poly(rotP([[304, 232], [412, 212], [512, 204], [612, 212], [720, 232]], TILT, CX, CY)), { w: W_DETAIL + 1 }));
  body.push(stroke(poly(rotP([[672, 222], [684, 250], [668, 262], [680, 282]], TILT, CX, CY)), { w: W_DETAIL }));
  const tips = rotP([[296, 140], [410, 96], [512, 62], [728, 140]], TILT, CX, CY);
  tips.forEach(([x, y], i) => body.push(inkCircle(x, y, i === 2 ? 20 : 16, STEEL_L, { w: W_DETAIL + 1 })));
  const [[gx, gy]] = rotP([[512, 240]], TILT, CX, CY);
  body.push(halo(gx, gy, 92, '#bff6ff', 2, 0.5));
  body.push(ink(`M${gx} ${gy - 40}L${gx + 30} ${gy}L${gx} ${gy + 40}L${gx - 30} ${gy}Z`, ICE, { w: W_INNER }));
  body.push(flat(`M${gx} ${gy - 40}L${gx + 30} ${gy}L${gx} ${gy + 40}Z`, '#3fc0e8'), stroke(`M${gx} ${gy - 40}L${gx + 30} ${gy}L${gx} ${gy + 40}L${gx - 30} ${gy}Z`, { w: W_INNER }));
  body.push(el('circle', { cx: gx - 10, cy: gy - 8, r: 6, fill: '#fff' }));

  // chains across his chest, and one hanging loose
  body.push(chain([[236, 838], [370, 900], [512, 918], [654, 900], [788, 838]], 13));
  body.push(chain([[300, 880], [296, 960], [310, 1040]], 3));
  s.add(2, g({ filter: s.wobble(5) }, body));

  // ---- 3: cold sparks, a few bubbles
  s.add(3, star4(gx + 66, gy - 62, 26, '#ffffff'), star4(160, 250, 26, '#bff6ff'), star4(884, 300, 20), star4(120, 640, 18, '#bff6ff'), star4(900, 700, 22));
  s.inkBubbles({ n: 5, x0: 780, x1: 980, y0: 420, y1: 900, rmin: 8, rmax: 20 });
  s.specks({ n: 12, rmin: 3, rmax: 7, colors: ['#ffffff', '#bff6ff', '#9fb8ff'], opacity: 0.85 });
}
