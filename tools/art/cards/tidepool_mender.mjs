// TIDEPOOL MENDER (common, healer) — a gentle frilly-gilled axolotl sort of thing, sat smiling in a sunny tide pool,
// little plus-shaped sparks of mending drifting up off its raised hand.
import { el, g, spline, ribbon, sample, ink, stroke, flat, inkCircle, inkEllipse, sticker, eye, star4, halo, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const W_OUT = 16; // the finished outer line round the mender (the set's contour)
const LIME = '#a9e25c', LIME_D = '#78c24e', BELLY = '#fff6c4', GOLD = '#ffc93c', GOLD_D = '#f59a2e', PINK = '#ff9fb0';

export function build(s) {
  const r = s.r;

  // ---- 0: sunny shallow water in flat teal bands, deep enough that the lime head and gold gills sit two value steps
  // off them (sun rays included); the only pale thing is the sun's disc at the top, inside two opaque steps of the
  // water lightened toward it
  s.bands([[0, '#45b6b9'], [200, '#3fb2b6'], [450, '#37a7ae'], [700, '#309ca6']], { amp: 16, waves: 3 });
  s.add(0, halo(540, -70, 330, ['#4fbebe', '#69cbc6']), el('circle', { cx: 540, cy: -70, r: 150, fill: '#fff6c4' }));
  s.shafts({ x: 540, y: -160, angle: 90, spread: 56, n: 5, color: '#ffffff', opacity: 0.15, width: 110 });
  s.lumps({ y: 720, amp: 110, n: 6, fill: '#2a919b', layer: 0 });
  s.specks({ n: 36, rmin: 2, rmax: 5, colors: ['#ffffff', '#fffbd0'], opacity: 0.6, layer: 0 });
  s.paper();

  // ---- 1: the pool: mossy boulders either side, weed, a sandy floor
  s.weed({ x: 250, y: 860, h: 300, fill: '#4fb88a', sway: 24, width: 46 });
  s.add(1, ink(spline([[-80, 900], [-70, 560], [20, 470], [130, 500], [196, 620], [210, 900]], true), '#6fb8a0', { w: W_MID }));
  s.add(1, ink(spline([[820, 900], [836, 640], [910, 520], [1010, 500], [1100, 580], [1110, 900]], true), '#6fb8a0', { w: W_MID }));
  s.add(1, el('path', { d: 'M-10 560q60 -60 120 -30M900 580q50 -50 110 -40', fill: 'none', stroke: '#a9dcc0', 'stroke-width': 10, 'stroke-linecap': 'round' }));
  s.add(1, starfish(118, 640, 34, 12), starfish(930, 700, 28, -20));
  s.lumps({ y: 800, amp: 30, n: 5, fill: '#f3dc8e', layer: 1, w: W_MID });
  for (const [x, y, rx] of [[210, 880, 40], [700, 900, 54], [420, 950, 36], [880, 960, 30]]) s.add(1, stroke(`M${x - rx} ${y}q${rx} -14 ${rx * 2} 0`, { w: W_MID - 2, stroke: '#d9b860' }));
  for (const [x, y, rr] of [[320, 870, 12], [610, 850, 9], [790, 930, 13], [150, 950, 10]]) s.add(1, bubble(x, y, rr));

  // ---- 2: the mender
  const cx = 512;
  const ax = [];

  // tail with its fin, and the feet, behind the body
  const tailPts = [[cx + 40, 706], [cx + 170, 742], [cx + 262, 700], [cx + 286, 610]];
  ax.push(sticker16([
    { d: ribbon(tailPts, 150, 44, (t) => 0.75 + 0.25 * Math.sin(Math.PI * t)), fill: '#dcf394' },
    { d: ribbon(tailPts, 84, 22), fill: LIME },
    { d: oval(cx - 74, 766, 48, 24), fill: LIME }, { d: oval(cx + 74, 766, 48, 24), fill: LIME },
  ]));
  ax.push(stroke(`M${cx - 96} 770v12M${cx - 74} 772v12M${cx + 52} 772v12M${cx + 74} 770v12`, { w: W_DETAIL }));

  // gills: three frilly fronds a side, behind the head
  const gills = [];
  for (const sd of [-1, 1]) {
    for (const [b, m, t] of [[[140, 322], [186, 262], [214, 190]], [[172, 376], [240, 346], [296, 322]], [[166, 436], [236, 444], [292, 458]]]) {
      gills.push([[cx + sd * b[0], b[1]], [cx + sd * m[0], m[1]], [cx + sd * t[0], t[1]]]);
    }
  }
  ax.push(sticker16(gills.flatMap(frond)));
  ax.push(...gills.map((p) => stroke(spline([p[0], p[1], [p[1][0] + (p[2][0] - p[1][0]) * 0.6, p[1][1] + (p[2][1] - p[1][1]) * 0.6]]), { w: W_DETAIL + 1, stroke: GOLD_D })));

  // arms and body
  const armUp = [[cx - 96, 612], [cx - 172, 618], [cx - 220, 570]], armDn = [[cx + 96, 610], [cx + 150, 650], [cx + 138, 700]];
  const bodyD = `M${cx - 104} 490C${cx - 150} 630 ${cx - 144} 756 ${cx - 56} 768L${cx + 56} 768C${cx + 144} 756 ${cx + 150} 630 ${cx + 104} 490Z`;
  ax.push(sticker16([
    // the raised hand is a mitten: a round palm and one clear thumb held out toward the head
    { d: ribbon(armUp, 46, 40), fill: LIME },
    { d: ribbon([[cx - 232, 560], [cx - 206, 544], [cx - 184, 530]], 26, 24) + oval(cx - 184, 530, 12, 12), fill: LIME, inner: 0 },
    { d: oval(cx - 232, 560, 30, 31), fill: LIME, inner: 0 },
    { d: ribbon(armDn, 46, 40), fill: LIME }, { d: oval(cx + 138, 704, 28, 28), fill: LIME, inner: 0 },
    { d: bodyD, fill: LIME },
  ]));
  ax.push(g({ 'clip-path': s.clip(el('path', { d: bodyD })) }, [
    inkEllipse(cx, 676, 80, 92, BELLY, { w: W_INNER }),
    flat(`M${cx + 40} 520C${cx + 110} 620 ${cx + 100} 720 ${cx + 30} 790L${cx + 200} 790L${cx + 200} 520Z`, INK, { opacity: 0.16 }),
  ]));

  ax.push(stroke(`M${cx - 218} 533A30 31 0 0 1 ${cx - 202} 556`, { w: W_DETAIL }));

  // the head: a wide soft bun
  const head = spline([[cx - 194, 392], [cx - 170, 300], [cx - 84, 244], [cx, 236], [cx + 84, 244], [cx + 170, 300], [cx + 194, 392], [cx + 156, 478], [cx + 62, 520], [cx - 62, 520], [cx - 156, 478]], true);
  ax.push(ink(head, LIME, { w: W_OUT }));
  ax.push(g({ 'clip-path': s.clip(el('path', { d: head })) }, [
    // one hard shadow: right side and under the chin
    flat(`M${cx + 100} 200C${cx + 200} 330 ${cx + 130} 450 ${cx - 20} 476C${cx - 100} 490 ${cx - 170} 470 ${cx - 230} 440L${cx - 230} 560L${cx + 240} 560L${cx + 240} 200Z`, LIME_D),
    // gold freckles on the brow
    el('circle', { cx: cx - 20, cy: 282, r: 11, fill: GOLD }), el('circle', { cx: cx + 22, cy: 270, r: 8, fill: GOLD }), el('circle', { cx: cx + 52, cy: 294, r: 9, fill: GOLD }),
    // hard highlights
    flat(`M${cx - 160} 376C${cx - 158} 322 ${cx - 126} 284 ${cx - 82} 268C${cx - 112} 300 ${cx - 130} 336 ${cx - 132} 378Z`, '#ffffff', { opacity: 0.9 }),
    el('circle', { cx: cx - 148, cy: 408, r: 11, fill: '#fff', opacity: 0.9 }),
  ]));
  ax.push(stroke(head, { w: W_OUT }));

  // the face: wide-set happy eyes, a long soft smile, pink cheeks
  ax.push(eye(cx - 98, 384, 38, { look: [0.1, 0.1], pupil: 0.66 }), eye(cx + 98, 384, 38, { look: [0.1, 0.1], pupil: 0.66 }));
  ax.push(stroke(`M${cx - 60} 428Q${cx} 482 ${cx + 60} 428`, { w: W_INNER }));
  ax.push(stroke(`M${cx - 70} 420q-2 12 12 14M${cx + 70} 420q2 12 -12 14`, { w: W_DETAIL }));
  ax.push(inkEllipse(cx - 142, 440, 22, 13, PINK, { w: 0, stroke: 'none', opacity: 0.9 }), inkEllipse(cx + 142, 440, 22, 13, PINK, { w: 0, stroke: 'none', opacity: 0.9 }));

  // the mending, off its raised hand
  ax.push(plus(cx - 262, 500, 28, '#fff3a0', W_INNER, -10));
  s.add(2, g({ filter: s.wobble(5), transform: 'translate(0 -22)' }, ax));

  // ---- 3: plus-shaped sparks drifting up, bubbles, a near frond at each edge
  s.weed({ x: 20, y: 1080, h: 430, fill: '#3fa878', sway: 30, lean: 0.08, width: 88, layer: 3, w: W_INNER });
  s.weed({ x: 1000, y: 1080, h: 400, fill: '#3fa878', sway: 22, lean: -0.03, width: 88, layer: 3, w: W_INNER });
  s.add(3, plus(160, 372, 20, GOLD, W_DETAIL, 12), plus(206, 122, 16, '#ffffff', W_DETAIL, -8), plus(352, 112, 14, '#fff3a0', W_DETAIL, 20),
    plus(868, 300, 18, '#ffffff', W_DETAIL, 10), plus(884, 470, 14, GOLD, W_DETAIL, -14), plus(196, 700, 14, '#ffffff', W_DETAIL, 8));
  for (const [x, y, rr] of [[600, 118, 16], [646, 70, 9], [124, 480, 12], [916, 566, 16], [742, 536, 10], [430, 92, 10]]) {
    s.add(3, bubble(x, y, rr));
  }
  s.add(3, star4(512, 150, 22), star4(852, 166, 16, '#fff6c0'));
  s.specks({ n: 14, rmin: 3, rmax: 7, colors: ['#ffffff', '#fffbc0', '#ffe46a'], opacity: 0.9 });
}

/** `sticker`, with the stamp behind each part sized by that part's own inner line (W_OUT less half of it), so the
 *  finished contour is W_OUT all the way round whether a part carries an inner line or none. */
function sticker16(parts) {
  const at = { 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const back = parts.map((p) => el('path', { d: p.d, fill: INK, stroke: INK, 'stroke-width': (W_OUT - (p.inner ?? W_INNER) / 2) * 2, ...at }));
  const front = parts.map((p) => el('path', { d: p.d, fill: p.fill, stroke: INK, 'stroke-width': p.inner ?? W_INNER, ...at }));
  return g({}, [g({}, back), g({}, front)]);
}

/** The set's bubble: ink ring, tinted fill, one hard glint. */
function bubble(x, y, rr) {
  return g({}, [inkCircle(x, y, rr, '#bfefff', { w: W_DETAIL, 'fill-opacity': 0.35 }), el('circle', { cx: x - rr * 0.34, cy: y - rr * 0.36, r: rr * 0.22, fill: '#fff' })]);
}

/** A healing spark: a fat plus with the ink line round it. */
function plus(x, y, k, fill, w = W_DETAIL, rot = 0) {
  const a = k * 0.36;
  const d = `M${x - a} ${y - k}H${x + a}V${y - a}H${x + k}V${y + a}H${x + a}V${y + k}H${x - a}V${y + a}H${x - k}V${y - a}H${x - a}Z`;
  return ink(d, fill, { w, transform: rot ? `rotate(${rot} ${x} ${y})` : undefined });
}

/** One frilly gill along [base, mid, tip]: a stalk with round lobes down both sides, as sticker parts. */
function frond(p) {
  const sm = sample(p, 8), n = sm.length, parts = [{ d: ribbon(p, 36, 22), fill: GOLD, inner: 0 }];
  for (let i = 4; i < n; i += 3) {
    const a = sm[i - 1], b = sm[Math.min(n - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / l, ny = (b[0] - a[0]) / l, rr = 25 - 9 * (i / n);
    for (const sd of [-1, 1]) parts.push({ d: oval(sm[i][0] + nx * sd * 17, sm[i][1] + ny * sd * 17, rr, rr), fill: GOLD, inner: 0 });
  }
  parts.push({ d: oval(p[2][0], p[2][1], 17, 17), fill: GOLD, inner: 0 });
  return parts;
}

/** A little five-armed starfish for the rocks. */
function starfish(x, y, k, rot = 0) {
  const pts = [];
  for (let i = 0; i < 10; i++) { const a = (rot - 90 + i * 36) * Math.PI / 180, rr = i % 2 ? k * 0.46 : k; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  return g({}, [ink(spline(pts, true, 6), '#ffb85c', { w: W_MID }), el('circle', { cx: x, cy: y, r: k * 0.14, fill: '#fff6c4' })]);
}

function oval(x, y, rx, ry) { return `M${x - rx} ${y}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z`; }
