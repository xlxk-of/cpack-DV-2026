// REEF SENTINEL (common, Guard) — a stout old crab, coral and barnacles growing on its shell, claws up, not moving.
import { el, g, spline, ribbon, ink, stroke, flat, inkCircle, inkEllipse, sticker, eye, star4, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const SEAM_Y = 412; // where the shell's rim seam meets the shell's sides
/** The seam's height at dx from the crab's middle (it is the quadratic drawn in the shell). */
const seamY = (dx) => { const t = (dx + 236) / 472; return SEAM_Y - 68 * 2 * t * (1 - t); };
const W_OUT = 16; // the finished outer line round the crab (the set's contour)
const RED = '#f2643a', RED_D = '#c93d2e', RED_L = '#ff9a5c', CREAM = '#f6e7c4', CORAL = '#b79df2', CORAL_D = '#8f74d6';

export function build(s) {
  const r = s.r;

  // ---- 0: bright turquoise shallows in flat bands, far reef with no ink
  s.bands([[0, '#6ee0d6'], [290, '#4bcdcb'], [540, '#31b4bf'], [790, '#2298ab']], { amp: 18, waves: 3 });
  s.shafts({ x: 330, y: -140, angle: 76, spread: 44, n: 4, color: '#ffffff', opacity: 0.16, width: 110 });
  s.lumps({ y: 700, amp: 120, n: 6, fill: '#2aa3b3', layer: 0 });
  for (const [x, y, k] of [[110, 640, 1], [905, 610, 1.15], [760, 690, 0.7]]) s.add(0, flat(branch(x, y, k, 0), '#2aa3b3'), flat(branch(x + 40 * k, y + 10, k * 0.7, 0.3), '#2aa3b3'));
  s.specks({ n: 36, rmin: 2, rmax: 5, colors: ['#ffffff', '#c9fff4'], opacity: 0.5, layer: 0 });
  s.lumps({ y: 880, amp: 70, n: 7, fill: '#1c8498', layer: 0 });
  s.paper();

  // ---- 1: the ledge it guards, and quiet growths either side
  s.weed({ x: 64, h: 560, fill: '#3fb6a4', sway: 26, width: 54 });
  s.weed({ x: 968, h: 620, fill: '#3fb6a4', sway: 28, width: 56, lean: -0.04 });
  s.add(1, growth(150, 800, 1.1, -0.1, '#e88fb0', W_MID), growth(884, 800, 0.95, 0.12, '#e88fb0', W_MID));
  s.lumps({ y: 778, amp: 34, n: 5, fill: '#2a8fa6', layer: 1, w: W_MID });
  for (const [x, y, rx] of [[250, 850, 46], [700, 880, 60], [470, 930, 40], [860, 940, 34]]) s.add(1, stroke(`M${x - rx} ${y}q${rx} -16 ${rx * 2} 0`, { w: W_MID - 2, stroke: '#1d7088' }));

  // ---- 2: the crab
  const cx = 512;
  const crab = [];

  // legs and arms behind the shell
  const limbs = [];
  for (const sd of [-1, 1]) {
    // stout legs: as chunky as the claws ask for, and kept short
    for (const [a, b, c] of [[[178, 522], [290, 562], [310, 690]], [[160, 562], [240, 616], [242, 718]], [[128, 590], [176, 652], [172, 738]]]) {
      limbs.push({ d: ribbon([[cx + sd * a[0], a[1]], [cx + sd * b[0], b[1]], [cx + sd * c[0], c[1]]], 74, 32), fill: RED_D });
    }
    limbs.push({ d: ribbon([[cx + sd * 185, 468], [cx + sd * 262, 452], [cx + sd * 246, 380]], 56, 50), fill: RED });
  }
  crab.push(sticker16(limbs));

  // what grows on its back: a coral, behind the shell's top edge
  const cor = [[[cx - 104, 372], [cx - 112, 300], [cx - 104, 236]], [[cx - 110, 318], [cx - 150, 282], [cx - 160, 236]], [[cx - 108, 300], [cx - 66, 268], [cx - 54, 222]]];
  crab.push(sticker16([...cor.map((p) => ({ d: ribbon(p, 34, 28), fill: CORAL })), ...cor.map((p) => ({ d: circ(p[2][0], p[2][1], 15), fill: CORAL, inner: 0 }))]));
  crab.push(...cor.map((p) => el('circle', { cx: p[2][0] - 4, cy: p[2][1] - 4, r: 6, fill: '#fff' })));

  // the shell
  const shell = `M${cx - 238} 482C${cx - 244} 388 ${cx - 150} 338 ${cx} 336C${cx + 150} 338 ${cx + 244} 388 ${cx + 238} 482C${cx + 232} 566 ${cx + 142} 618 ${cx} 620C${cx - 142} 618 ${cx - 232} 566 ${cx - 238} 482Z`;
  crab.push(ink(shell, RED, { w: W_OUT }));
  crab.push(g({ 'clip-path': s.clip(el('path', { d: shell })) }, [
    // one hard shadow: the right side and the underside
    flat(`M${cx + 110} 300C${cx + 220} 420 ${cx + 150} 540 ${cx - 20} 566C${cx - 110} 580 ${cx - 200} 560 ${cx - 270} 520L${cx - 270} 660L${cx + 290} 660L${cx + 290} 300Z`, RED_D),
    // the armoured rim of the carapace, high on the shell so it stays well clear of the brows, and its rivets on it
    stroke(`M${cx - 236} ${SEAM_Y}Q${cx} ${SEAM_Y - 68} ${cx + 236} ${SEAM_Y}`, { w: W_INNER }),
    ...[[-150, 11], [-192, 8], [-30, 9], [36, 12], [182, 9]].map(([dx, rr]) => inkCircle(cx + dx, seamY(dx), rr, RED_L, { w: W_DETAIL })),
    // hard highlight
    flat(`M${cx - 206} 470C${cx - 204} 440 ${cx - 190} 424 ${cx - 168} 414C${cx - 180} 432 ${cx - 184} 448 ${cx - 184} 470Z`, '#fff', { opacity: 0.9 }),
  ]));
  crab.push(stroke(shell, { w: W_OUT }));

  // barnacles sitting on the shell's shoulder
  crab.push(barnacle(cx + 150, 366, 26, 16), barnacle(cx + 92, 340, 38, -4), barnacle(cx + 40, 338, 22, -14));

  // the face: heavy lids, a flat unimpressed mouth
  for (const sd of [-1, 1]) {
    const ex = cx + sd * 82, ey = 488, er = 48;
    crab.push(eye(ex, ey, er, { look: [0, 0.3], lid: 0.36, lidRot: -sd * 15, lidFill: RED_D }));
    crab.push(stroke(lidLine(ex, ey, er, 0.36, -sd * 15, 14), { w: W_INNER + 4 }));
  }
  crab.push(stroke(`M${cx - 54} 584Q${cx} 556 ${cx + 54} 584`, { w: W_INNER + 2 }));
  crab.push(stroke(`M${cx - 66} 570q-8 12 2 24M${cx + 66} 570q8 12 -2 24`, { w: W_DETAIL + 1 }));

  // claws, up
  crab.push(g({ transform: `translate(${cx - 246} 300) rotate(-10)` }, claw(s)));
  crab.push(g({ transform: `translate(${cx + 246} 300) rotate(10) scale(-1 1)` }, claw(s)));
  s.add(2, g({ filter: s.wobble(5) }, crab));

  // ---- 3: near reef at the corners, bubbles, glints
  s.weed({ x: 36, y: 1080, h: 420, fill: '#1f8f8c', sway: 30, lean: 0.08, width: 84, layer: 3, w: W_INNER });
  s.weed({ x: 996, y: 1080, h: 380, fill: '#1f8f8c', sway: 30, lean: -0.1, width: 84, layer: 3, w: W_INNER });
  for (const [x, y, rx, ry] of [[70, 1040, 210, 130], [960, 1050, 230, 140]]) {
    s.add(3, inkEllipse(x, y, rx, ry, '#16708a', { w: W_INNER }));
    for (const [dx, dy, rr] of [[-0.3, -0.55, 16], [0.2, -0.62, 11], [0.5, -0.4, 14], [-0.62, -0.3, 10]]) s.add(3, el('circle', { cx: x + dx * rx, cy: y + dy * ry, r: rr, fill: '#2a8fa6' }));
  }
  for (const [x, y, rr] of [[150, 420, 20], [182, 350, 11], [880, 500, 16], [874, 228, 12], [900, 160, 22], [330, 150, 10], [622, 706, 12], [118, 600, 12]]) {
    s.add(3, inkCircle(x, y, rr, '#bfefff', { w: W_DETAIL, 'fill-opacity': 0.35 }), el('circle', { cx: x - rr * 0.34, cy: y - rr * 0.36, r: rr * 0.22, fill: '#fff' }));
  }
  s.add(3, star4(600, 232, 28), star4(196, 232, 20, '#fff6c0'), star4(868, 590, 22), star4(404, 700, 16, '#fff6c0'));
  s.specks({ n: 16, rmin: 3, rmax: 7, colors: ['#ffffff', '#d6fff4', '#ffe9c0'], opacity: 0.9 });
}

/** A claw pointing up, its palm at the origin: a fat mitten with a notch. */
function claw(s) {
  const d = 'M0 92C-58 94 -92 46 -90 -14C-88 -78 -54 -132 -16 -146C-4 -150 4 -140 0 -128L-20 -52L46 -108C56 -116 68 -110 70 -98C84 -40 80 28 54 64C40 84 20 92 0 92Z';
  return [
    ink(d, RED, { w: W_OUT }),
    g({ 'clip-path': s.clip(el('path', { d })) }, [
      flat('M-110 50C-50 80 30 50 60 -30C74 -70 70 -110 60 -150L140 -150L140 130L-110 130Z', RED_D),
      flat('M-70 -20C-70 -62 -54 -98 -30 -118C-44 -90 -50 -58 -48 -20Z', '#fff', { opacity: 0.9 }),
      inkCircle(-24, 30, 11, RED_L, { w: W_DETAIL }), inkCircle(12, 54, 8, RED_L, { w: W_DETAIL }),
    ]),
    stroke(d, { w: W_OUT }),
  ];
}

/** `sticker`, with the stamp behind each part sized by that part's own inner line (W_OUT less half of it), so the
 *  finished contour is W_OUT all the way round whether a part carries an inner line or none. */
function sticker16(parts) {
  const at = { 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const back = parts.map((p) => el('path', { d: p.d, fill: INK, stroke: INK, 'stroke-width': (W_OUT - (p.inner ?? W_INNER) / 2) * 2, ...at }));
  const front = parts.map((p) => el('path', { d: p.d, fill: p.fill, stroke: INK, 'stroke-width': p.inner ?? W_INNER, ...at }));
  return g({}, [g({}, back), g({}, front)]);
}

/** A barnacle: a little cream volcano. */
function barnacle(x, y, k, rot = 0) {
  return g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
    ink(`M${-k} ${k * 0.5}L${-k * 0.5} ${-k * 0.7}Q0 ${-k * 0.95} ${k * 0.5} ${-k * 0.7}L${k} ${k * 0.5}Q0 ${k * 0.8} ${-k} ${k * 0.5}Z`, CREAM, { w: W_INNER }),
    el('ellipse', { cx: 0, cy: -k * 0.62, rx: k * 0.3, ry: k * 0.14, fill: INK }),
    stroke(`M${-k * 0.42} ${k * 0.3}L${-k * 0.3} ${-k * 0.2}M${k * 0.42} ${k * 0.3}L${k * 0.3} ${-k * 0.2}`, { w: W_DETAIL - 1 }),
  ]);
}

/** A chunky three-fingered coral (or reef growth) rooted at (x, y), as one path. */
function branch(x, y, k, lean = 0) {
  const arm = (a, len, w) => ribbon([[x, y], [x + Math.sin(a) * len * 0.5 + lean * 20 * k, y - Math.cos(a) * len * 0.55], [x + Math.sin(a + lean) * len, y - Math.cos(a + lean) * len]], w * 1.2, w, null, 8)
    + circ(x + Math.sin(a + lean) * len, y - Math.cos(a + lean) * len, w * 0.5);
  return arm(-0.55, 120 * k, 34 * k) + arm(0.05, 170 * k, 36 * k) + arm(0.62, 110 * k, 32 * k);
}

/** The same growth, drawn: one ink line round the whole silhouette and none inside. */
function growth(x, y, k, lean, fill, w) {
  const d = branch(x, y, k, lean);
  return g({}, [el('path', { d, fill: INK, stroke: INK, 'stroke-width': w * 2, 'stroke-linejoin': 'round' }), el('path', { d, fill })]);
}

function circ(x, y, r) { return `M${x - r} ${y}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`; }

/** The lower edge of an `eye` lid as a line (to ink it as a brow); `over` pokes it past the eyeball. */
function lidLine(x, y, r, lid, rot, over = 0) {
  const d = r * (2 * lid - 1), half = Math.sqrt(Math.max(0, r * r - d * d)) + over, a = rot * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
  const p = (px, py) => `${(x + px * c - py * sn).toFixed(1)} ${(y + px * sn + py * c).toFixed(1)}`;
  return `M${p(-half, d)}L${p(half, d)}`;
}
