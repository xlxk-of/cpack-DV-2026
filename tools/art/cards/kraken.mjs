// OLD THOUSAND-ARMS (legendary) — a grumpy old kraken with a tall mantle, gold slit eyes and chunky suckered arms
// curling in from every side; a tiny shipwreck for scale. Doodle style: see THE DOODLE KIT in lib.mjs.
import { el, g, spline, sample, poly, ink, stroke, flat, inkCircle, inkEllipse, star4, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const RED = '#e8394f', RED_SH = '#b22352', PINK = '#ffb9c6', VIOLET = '#8c52d9', GOLD = '#ffc93c', GOLD_SH = '#f0962e';
const MID = '#7d2c68', MID_SH = '#5e2059', MID_SUCK = '#b86a8c';

export function build(s) {
  const r = s.r;

  // ---- 0: the deep, in flat bands; far arms as plain darker shapes (no ink)
  s.bands([[0, '#3d2c80'], [300, '#31236c'], [560, '#261b58'], [800, '#1d1446']], { amp: 18, waves: 3 });
  s.shafts({ x: 520, y: -160, angle: 92, spread: 50, n: 4, color: '#c9a6ff', opacity: 0.1, width: 120 });
  const far = [
    [[[-100, 520], [60, 470], [150, 360], [120, 250]], 1, 90, 60],
    [[[1130, 560], [960, 520], [880, 400], [930, 290]], -1, 90, 60],
    [[[380, 1100], [330, 930], [250, 860], [170, 880]], 1, 80, 50],
    [[[700, 1100], [740, 940], [830, 870], [900, 900]], -1, 80, 50],
  ];
  for (const [pts, dir, w0, r0] of far) s.add(0, flat(strip(spine(curl(pts, dir, r0, 1.05), w0, 22), -1, 1), '#2a1c62'));
  s.specks({ n: 36, rmin: 2, rmax: 5, colors: ['#b79cff', '#ff9fc0'], opacity: 0.45, layer: 0 });
  s.lumps({ y: 905, amp: 80, n: 7, fill: '#170f3a', layer: 0 });
  s.paper();

  // ---- 1: arms behind, thinner line and quieter colour; the wreck on its rock
  const back = [
    arm(s, curl([[-140, 330], [30, 300], [150, 200], [215, 120]], 1, 56, 1.15), 120, 26, { side: 1, w: W_MID, fill: MID, shade: MID_SH, suck: MID_SUCK }),
    arm(s, curl([[1160, 250], [1000, 250], [880, 170], [815, 95]], -1, 54, 1.15), 120, 26, { side: -1, w: W_MID, fill: MID, shade: MID_SH, suck: MID_SUCK }),
    arm(s, curl([[1170, 640], [1010, 660], [925, 600], [935, 520]], 1, 44, 1.1), 104, 24, { side: 1, w: W_MID, fill: MID, shade: MID_SH, suck: MID_SUCK }),
    arm(s, curl([[-150, 560], [-20, 590], [60, 540], [70, 470]], -1, 40, 1.1), 100, 24, { side: -1, w: W_MID, fill: MID, shade: MID_SH, suck: MID_SUCK }),
  ];
  s.add(1, g({ opacity: 0.95 }, back.map((a) => a.markup)));
  s.add(1, ink(spline([[-60, 1100], [-60, 800], [60, 760], [200, 752], [330, 790], [400, 860], [420, 1100]], true), '#2c1f66', { w: W_MID }));
  s.add(1, flat(spline([[40, 800], [150, 778], [250, 790], [200, 812], [90, 818]], true), '#3d2c80'));
  s.add(1, wreck(196, 716, 1.15, -13));
  s.weed({ x: 60, y: 800, h: 150, fill: '#3a4a9c', sway: 16, width: 30 });
  s.lumps({ y: 975, amp: 60, n: 6, fill: '#22164f', layer: 1, w: W_MID });

  // ---- 2: Old Thousand-Arms
  const body = [];
  const arms = [
    arm(s, curl([[410, 500], [300, 570], [200, 520], [165, 400], [185, 310]], 1, 58, 1.2), 96, 22, { side: 1 }),
    arm(s, curl([[614, 500], [730, 575], [840, 540], [880, 430], [862, 345]], -1, 56, 1.2), 96, 22, { side: -1 }),
    arm(s, curl([[440, 520], [390, 640], [330, 690], [270, 660]], 1, 46, 1.1), 90, 22, { side: 1 }),
    arm(s, curl([[584, 520], [650, 650], [740, 720], [830, 700]], -1, 50, 1.15), 90, 22, { side: -1 }),
    arm(s, curl([[490, 530], [470, 690], [420, 800], [445, 900]], -1, 44, 1.0), 86, 24, { side: -1 }),
    arm(s, curl([[540, 530], [570, 700], [640, 830], [610, 930]], 1, 44, 1.0), 86, 24, { side: 1 }),
  ];
  const mantle = spline([[516, 58], [640, 112], [706, 250], [698, 372], [736, 468], [688, 545], [512, 566], [336, 545], [288, 468], [326, 372], [318, 250], [388, 112]], true, 12);
  // one fat contour round the whole silhouette, then each part with its inner line
  body.push(g({}, [...arms.map((a) => a.d), mantle].map((d) => el('path', { d, fill: INK, stroke: INK, 'stroke-width': W_SUBJECT * 2, 'stroke-linejoin': 'round' }))));
  body.push(...arms.map((a) => a.markup));
  body.push(ink(mantle, RED, { w: W_INNER }));
  const clip = s.clip(el('path', { d: mantle }));
  body.push(g({ 'clip-path': clip }, [
    // one hard shadow tone: down the right side and under the brow
    flat('M560 0C700 150 640 330 650 420C660 500 620 560 560 600L800 600L800 0Z', RED_SH),
    flat('M250 520Q512 590 780 520L780 620L250 620Z', RED_SH),
    // spots on the mantle
    inkEllipse(470, 150, 34, 24, VIOLET, { w: W_DETAIL, rot: -18 }),
    inkEllipse(560, 215, 26, 19, VIOLET, { w: W_DETAIL, rot: 12 }),
    inkEllipse(420, 250, 20, 15, VIOLET, { w: W_DETAIL, rot: -8 }),
    inkEllipse(600, 120, 17, 13, VIOLET, { w: W_DETAIL, rot: 20 }),
    inkEllipse(505, 285, 14, 11, VIOLET, { w: W_DETAIL }),
    // hard highlights
    flat('M352 300C344 210 372 140 428 104C396 170 384 230 384 300Z', '#ffffff', { opacity: 0.9 }),
    el('circle', { cx: 366, cy: 338, r: 12, fill: '#fff', opacity: 0.9 }),
  ]));
  body.push(stroke(mantle, { w: W_INNER }));
  // the face: two gold slit eyes under heavy old lids, a furrowed brow and a small sour mouth
  body.push(slitEye(s, 424, 440, 60, 13), slitEye(s, 600, 440, 60, -13));
  body.push(stroke('M492 366q10 14 6 30', { w: W_DETAIL + 1 }), stroke('M532 366q-10 14 -6 30', { w: W_DETAIL + 1 }));
  body.push(stroke('M476 526q36 -24 72 0', { w: W_INNER }));
  body.push(inkEllipse(350, 500, 22, 13, '#ff8fb0', { w: 0, stroke: 'none', opacity: 0.85 }), inkEllipse(674, 500, 22, 13, '#ff8fb0', { w: 0, stroke: 'none', opacity: 0.85 }));
  s.add(2, g({ filter: s.wobble(5) }, body));

  // ---- 3: two big arm tips in front, bubbles, sparkles
  const front = [
    arm(s, curl([[1180, 930], [1010, 930], [900, 850], [905, 740]], -1, 78, 1.2), 190, 44, { side: -1, w: W_SUBJECT, wi: W_INNER, big: true }),
    arm(s, curl([[-190, 960], [-40, 1000], [80, 950], [130, 860]], -1, 60, 1.05), 170, 44, { side: -1, w: W_SUBJECT, wi: W_INNER, big: true }),
  ];
  s.add(3, g({ filter: s.wobble(5, 0.012, 7) }, front.map((a) => a.markup)));
  s.inkBubbles({ n: 8, y0: 120, y1: 760, rmin: 9, rmax: 24, fill: '#d9c4ff' });
  s.add(3, star4(250, 160, 30), star4(770, 250, 22, '#ffe9a8'), star4(742, 610, 20, '#ffd1ef'), star4(120, 620, 18));
  s.specks({ n: 14, rmin: 3, rmax: 7, colors: ['#ffffff', '#ffd1ef', '#d9c4ff'], opacity: 0.9 });
}

// ---------------------------------------------------------------------------------------------------- helpers

/** Add a spiral to the end of a point list: `dir` +1 turns clockwise on screen, -1 anticlockwise. */
function curl(pts, dir, r0, turns = 0.85, n = 9, shrink = 0.6) {
  turns = Math.min(turns, 0.9);
  const [px, py] = pts[pts.length - 1], [qx, qy] = pts[pts.length - 2];
  const h = Math.atan2(py - qy, px - qx);
  const cx = px - r0 * dir * Math.sin(h), cy = py + r0 * dir * Math.cos(h);
  const a0 = Math.atan2(py - cy, px - cx);
  const out = pts.slice();
  for (let k = 1; k <= n; k++) {
    const a = a0 + dir * (k / n) * turns * Math.PI * 2, rad = r0 * (1 - (k / n) * shrink);
    out.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
  }
  return out;
}

/** A centreline with normals and half-widths, tapering by arc length, with a rounded tip. */
function spine(pts, w0, w1, per = 10) {
  const sm = sample(pts, per);
  const acc = [0];
  for (let i = 1; i < sm.length; i++) acc.push(acc[i - 1] + Math.hypot(sm[i][0] - sm[i - 1][0], sm[i][1] - sm[i - 1][1]));
  const total = acc[acc.length - 1];
  return sm.map((p, i) => {
    const a = sm[Math.max(0, i - 1)], b = sm[Math.min(sm.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    const t = acc[i] / total;
    let hw = (w0 + (w1 - w0) * Math.pow(t, 0.85)) * 0.5;
    const end = (total - acc[i]) / (w1 * 0.6);
    if (end < 1) hw *= Math.sqrt(Math.max(0.02, 1 - (1 - end) * (1 - end)));
    return { x: p[0], y: p[1], nx: -dy, ny: dx, hw, t, at: acc[i] };
  });
}
/** The strip of a spine between two offsets (fractions of the half-width, -1..1), as a closed path. */
function strip(sp, a, b) {
  const L = sp.map((q) => [q.x + q.nx * q.hw * a, q.y + q.ny * q.hw * a]);
  const R = sp.map((q) => [q.x + q.nx * q.hw * b, q.y + q.ny * q.hw * b]);
  return poly(L.concat(R.reverse()), true);
}

/** One chunky arm: flat base, a hard shadow down the outer side, round suckers down the inner side (`side`). */
function arm(s, pts, w0, w1, { side = 1, w = W_INNER, wi = W_DETAIL, fill = RED, shade = RED_SH, suck = PINK, big = false } = {}) {
  const sp = spine(pts, w0, w1);
  const d = strip(sp, -1, 1);
  const inner = [flat(strip(sp, -side * 1.2, -side * 0.3), shade)];
  if (big) inner.push(flat(strip(sp, side * 0.1, side * 1.2), suck));
  let next = sp[sp.length - 1].at * 0.1;
  for (const q of sp) {
    if (q.at < next || q.t > 0.95) continue;
    const rr = q.hw * (big ? 0.3 : 0.3), off = big ? 0.56 : 0.5;
    inner.push(inkCircle(q.x + q.nx * q.hw * off * side, q.y + q.ny * q.hw * off * side, rr, big ? '#fff0f3' : suck, { w: rr < 7 ? 3 : wi }));
    if (big) inner.push(el('circle', { cx: q.x + q.nx * q.hw * off * side, cy: q.y + q.ny * q.hw * off * side, r: rr * 0.36, fill: RED_SH }));
    next = q.at + rr * 2.7;
  }
  const clip = s.clip(el('path', { d }));
  const markup = g({}, [ink(d, fill, { w }), g({ 'clip-path': clip }, inner), stroke(d, { w })]);
  return { d, markup };
}

/** A gold eye with a slit pupil and a heavy lid, tilted `rot` degrees. */
function slitEye(s, x, y, r, rot) {
  const clip = s.clip(el('circle', { cx: x, cy: y, r }));
  return g({}, [
    inkCircle(x, y, r, GOLD, { w: W_INNER }),
    g({ 'clip-path': clip }, [
      el('circle', { cx: x + r * 0.3, cy: y + r * 0.42, r: r * 1.02, fill: 'none', stroke: GOLD_SH, 'stroke-width': r * 0.34 }),
      flat(`M${x} ${y - r * 0.7}Q${x + r * 0.34} ${y + r * 0.1} ${x} ${y + r * 0.86}Q${x - r * 0.34} ${y + r * 0.1} ${x} ${y - r * 0.7}Z`, INK),
      el('circle', { cx: x - r * 0.4, cy: y + r * 0.02, r: r * 0.17, fill: '#fff' }),
      el('rect', { x: x - r * 1.6, y: y - r * 2.4, width: r * 3.2, height: r * 1.95, fill: RED_SH, stroke: INK, 'stroke-width': W_INNER, transform: `rotate(${rot} ${x} ${y})` }),
    ]),
    el('circle', { cx: x, cy: y, r, fill: 'none', stroke: INK, 'stroke-width': W_INNER }),
  ]);
}

/** The tiny shipwreck: a holed hull, a snapped mast and a rag of sail. Mid-distance line. */
function wreck(x, y, k, rot) {
  const W = W_MID / k;
  return g({ transform: `translate(${x} ${y}) rotate(${rot}) scale(${k})` }, [
    stroke('M-6 -4L2 -86', { w: 13 }), stroke('M-6 -4L2 -86', { w: 5, stroke: '#a8716f' }),
    stroke('M-30 -62L34 -70', { w: 11 }), stroke('M-30 -62L34 -70', { w: 4, stroke: '#a8716f' }),
    ink('M-26 -60L30 -67L24 -34L10 -40L0 -22L-12 -36L-22 -28Z', '#eadfd6', { w: W }),
    ink('M-70 -8L74 -14Q70 30 36 40L-34 40Q-62 30 -70 -8Z', '#a8716f', { w: W }),
    flat('M-60 14Q0 26 66 8Q62 30 36 37L-34 37Q-54 30 -60 14Z', '#84526a'),
    stroke('M-70 -8L74 -14Q70 30 36 40L-34 40Q-62 30 -70 -8Z', { w: W }),
    inkEllipse(18, 12, 13, 9, INK, { w: 0, stroke: 'none' }),
    stroke('M-46 4L-12 2', { w: 4 }), stroke('M40 0L60 -2', { w: 4 }),
  ]);
}
