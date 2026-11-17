// KELP STALKER (common, Swift) — a long sleek toothy eel-fish going through the kelp like a thrown knife,
// one yellow eye on you.
import { el, g, spline, ribbon, sample, poly, ink, stroke, flat, inkCircle, sticker, eye, star4, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const GREEN = '#52bd68', GREEN_D = '#2f8f52', BELLY = '#dcef8e', YELLOW = '#ffd83a', YELLOW_D = '#f0a81e';
const SPEED = -24 * Math.PI / 180; // the line it is travelling along

export function build(s) {
  const r = s.r;

  // ---- 0: green gloom in flat bands, far kelp with no ink
  s.bands([[0, '#2f7c56'], [300, '#256849'], [570, '#1b523c'], [820, '#133e30']], { amp: 18, waves: 3 });
  s.shafts({ x: 740, y: -140, angle: 104, spread: 40, n: 4, color: '#d9ffa8', opacity: 0.09, width: 110 });
  for (const [x, h] of [[40, 760], [210, 520], [400, 820], [730, 700], [1000, 600]]) s.add(0, kelp(r, { x, h, fill: '#1a4f3b', w: 0, width: 22, leaf: 90 }));
  s.specks({ n: 36, rmin: 2, rmax: 5, colors: ['#bff0a0', '#fff3a0'], opacity: 0.45, layer: 0 });
  s.lumps({ y: 905, amp: 80, n: 7, fill: '#0e3026', layer: 0 });
  s.paper();

  // ---- 1: kelp it is threading, the water it has cut
  s.add(1, kelp(r, { x: 120, h: 900, fill: '#27714c', w: W_MID, width: 30, leaf: 120, n: 5 }));
  s.add(1, kelp(r, { x: 890, h: 960, fill: '#27714c', w: W_MID, width: 30, leaf: 120, n: 5 }));
  s.add(1, kelp(r, { x: 610, h: 330, fill: '#215f42', w: W_MID, width: 24, leaf: 84, n: 3 }));
  s.add(1, kelp(r, { x: 300, h: 300, fill: '#215f42', w: W_MID, width: 24, leaf: 84, n: 3 }));
  const wake = [];
  for (const [x, y, len] of [[560, 250, 230], [700, 180, 150], [380, 318, 120], [520, 700, 260], [700, 648, 180], [860, 520, 110], [380, 760, 130]]) {
    wake.push(`M${x} ${y}l${Math.cos(SPEED) * len} ${Math.sin(SPEED) * len}`);
  }
  s.add(1, el('path', { d: wake.join(''), fill: 'none', stroke: '#7fc084', 'stroke-width': 10, 'stroke-linecap': 'round', opacity: 0.45 }));
  s.lumps({ y: 975, amp: 50, n: 6, fill: '#174a38', layer: 1, w: W_MID });

  // ---- 2: the stalker — one long ribbon of fish, head low on the left, tail whipping up on the right
  const spine = [[246, 578], [330, 540], [422, 492], [518, 462], [612, 476], [694, 462], [750, 400], [770, 316]];
  const sm = sample(spine, 12), N = sm.length;
  const hw = (t) => 0.5 * (t < 0.24 ? 92 + 126 * Math.sin((t / 0.24) * Math.PI / 2) : 218 - 180 * Math.pow((t - 0.24) / 0.76, 0.8));
  const fr = sm.map((p, i) => {
    const a = sm[Math.max(0, i - 1)], b = sm[Math.min(N - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    return { p, t: i / (N - 1), dx, dy, nx: -dy, ny: dx };
  });
  const I = (t) => Math.round(t * (N - 1));
  /** A point on the fish: sample i, k across it (-0.5 the back edge, +0.5 the belly edge), `along` px toward the tail. */
  const at = (i, k, along = 0) => { const f = fr[i], w = hw(f.t) * 2 * k; return [f.p[0] + f.nx * w + f.dx * along, f.p[1] + f.ny * w + f.dy * along]; };

  // the silhouette, with a round snout
  const back = [], belly = [], cap = [];
  for (let i = 0; i < N; i++) { back.push(at(i, -0.5)); belly.push(at(i, 0.5)); }
  for (let a = 1; a < 9; a++) {
    const th = Math.PI * a / 9, f = fr[0], h0 = hw(0);
    cap.push([f.p[0] + (f.nx * Math.cos(th) - f.dx * Math.sin(th) * 1.15) * h0, f.p[1] + (f.ny * Math.cos(th) - f.dy * Math.sin(th) * 1.15) * h0]);
  }
  const bodyD = poly([...back, ...belly.reverse(), ...cap], true);

  // fins: a spiky sail down the back, a small one under, a forked tail
  const sail = (t0, t1, sd, H, n) => {
    const i0 = I(t0), i1 = I(t1), top = [], base = [];
    const up = (i, h) => { const f = fr[i], b = at(i, sd * 0.4); return [b[0] + sd * f.nx * (hw(f.t) * 0.2 + h) + f.dx * h * 0.7, b[1] + sd * f.ny * (hw(f.t) * 0.2 + h) + f.dy * h * 0.7]; };
    for (let i = i0; i <= i1; i++) base.push(at(i, sd * 0.4));
    for (let k = 0; k < n; k++) {
      const ia = Math.round(i0 + (i1 - i0) * k / n), ib = Math.round(i0 + (i1 - i0) * (k + 0.55) / n), h = H * (1 - 0.5 * k / n);
      top.push(up(ia, k ? h * 0.3 : 0), up(ib, h));
    }
    return poly([...top, ...base.reverse()], true);
  };
  const e = fr[N - 1], ep = e.p;
  const tailD = poly([[ep[0] - e.dx * 26 - e.nx * 14, ep[1] - e.dy * 26 - e.ny * 14], [ep[0] + e.dx * 96 - e.nx * 76, ep[1] + e.dy * 96 - e.ny * 76],
    [ep[0] + e.dx * 44, ep[1] + e.dy * 44], [ep[0] + e.dx * 78 + e.nx * 62, ep[1] + e.dy * 78 + e.ny * 62], [ep[0] - e.dx * 26 + e.nx * 14, ep[1] - e.dy * 26 + e.ny * 14]], true);
  const fish = [];
  fish.push(sticker([{ d: tailD, fill: YELLOW }, { d: sail(0.33, 0.7, -1, 74, 4), fill: YELLOW }, { d: sail(0.56, 0.76, 1, 44, 2), fill: YELLOW }, { d: bodyD, fill: GREEN }]));

  // inside the body: pale belly, dark bars over the back, one hard shadow along the underside, a hard highlight
  const band = (k0, k1, t0 = 0, t1 = 1) => { const a = [], b = []; for (let i = I(t0); i <= I(t1); i++) { a.push(at(i, k0)); b.push(at(i, k1)); } return poly([...a, ...b.reverse()], true); };
  const bars = [];
  for (const t of [0.36, 0.48, 0.6, 0.72, 0.84]) {
    const i = I(t), w = hw(t);
    bars.push(flat(ribbon([at(i, -0.62), at(i, -0.34, w * 0.2), at(i, -0.1, w * 0.5)], w * 0.44, 8), GREEN_D));
  }
  const hi = []; for (let i = I(0.06); i <= I(0.22); i++) hi.push(at(i, -0.36));
  fish.push(g({ 'clip-path': s.clip(el('path', { d: bodyD })) }, [
    flat(band(0.17, 0.7), BELLY),
    ...bars,
    flat(band(0.34, 0.7), INK, { opacity: 0.2 }),
    el('path', { d: poly(hi), fill: 'none', stroke: '#fff', 'stroke-width': 13, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.9 }),
    el('circle', { cx: at(I(0.26), -0.35)[0], cy: at(I(0.26), -0.35)[1], r: 8, fill: '#fff', opacity: 0.9 }),
  ]));
  fish.push(stroke(bodyD, { w: W_INNER }));

  // gill, and the fin behind it flattened back by speed
  const ig = I(0.29), ga = at(ig, -0.3), gb = at(ig, 0.3), gc = at(ig, 0, 36);
  fish.push(stroke(`M${ga[0]} ${ga[1]}Q${gc[0]} ${gc[1]} ${gb[0]} ${gb[1]}`, { w: W_INNER }));
  const pf = at(I(0.35), 0.14), f3 = fr[I(0.35)];
  const pfin = [pf, [pf[0] + f3.dx * 62 + f3.nx * 26, pf[1] + f3.dy * 62 + f3.ny * 26], [pf[0] + f3.dx * 128 + f3.nx * 30, pf[1] + f3.dy * 128 + f3.ny * 30]];
  fish.push(ink(ribbon(pfin, 1, 1, (u) => 56 * Math.sin(Math.PI * Math.pow(u, 0.5)) + 6), YELLOW, { w: W_INNER }));
  fish.push(stroke(`M${pf[0] + f3.dx * 30 + f3.nx * 12} ${pf[1] + f3.dy * 30 + f3.ny * 12}L${pfin[2][0] - f3.dx * 30} ${pfin[2][1] - f3.dy * 30}`, { w: W_DETAIL, stroke: YELLOW_D }));

  // the grin: a white band of teeth along the jaw, a zig-zag through it
  const i1 = I(0.012), i2 = I(0.25), mu = [], ml = [], zig = [];
  for (let i = i1; i <= i2; i++) {
    const u = (i - i1) / (i2 - i1), k = 0.2 - 0.24 * Math.pow(u, 2.4), th = 54 * Math.sin(Math.PI * Math.pow(0.14 + 0.86 * u, 0.8)), f = fr[i], c = at(i, k);
    mu.push([c[0] - f.nx * th / 2, c[1] - f.ny * th / 2]); ml.push([c[0] + f.nx * th / 2, c[1] + f.ny * th / 2]);
  }
  const nz = 13;
  for (let j = 0; j <= nz; j++) { const q = Math.round(j / nz * (mu.length - 1)), a = j % 2 ? 0.86 : 0.14; zig.push([mu[q][0] + (ml[q][0] - mu[q][0]) * a, mu[q][1] + (ml[q][1] - mu[q][1]) * a]); }
  fish.push(ink(poly([...mu, ...ml.slice().reverse()], true), '#fffdf0', { w: W_INNER }));
  fish.push(stroke(poly(zig), { w: W_DETAIL }));

  // the eye: the one hot yellow thing in the forest, under a hard brow
  const ie = I(0.125), ec = at(ie, -0.2), rot = Math.atan2(fr[ie].dy, fr[ie].dx) * 180 / Math.PI - 10;
  fish.push(eye(ec[0], ec[1], 47, { white: YELLOW, pupil: 0.46, look: [-0.5, 0.35], lid: 0.3, lidRot: rot, lidFill: GREEN_D }));
  fish.push(stroke(lidLine(ec[0], ec[1], 47, 0.3, rot, 14), { w: W_INNER + 4 }));
  const no = at(I(0.02), -0.22);
  fish.push(el('circle', { cx: no[0], cy: no[1], r: 5, fill: INK }));
  s.add(2, g({ filter: s.wobble(5) }, fish));

  // ---- 3: speed lines, bubbles off the jaw, torn leaf, near kelp whipping past the edges
  s.add(3, kelp(r, { x: -10, y: 1090, h: 900, fill: '#114032', w: W_INNER, width: 44, leaf: 150, n: 4, sway: 30 }));
  s.add(3, kelp(r, { x: 1034, y: 1090, h: 700, fill: '#114032', w: W_INNER, width: 44, leaf: 150, n: 3, sway: 30 }));
  s.add(3, streak(420, 316, 120, 12), streak(560, 232, 90, 10), streak(470, 700, 170, 12), streak(660, 640, 110, 10), streak(820, 560, 70, 9));
  for (const [x, y, rr] of [[196, 500, 15], [158, 446, 9], [226, 398, 11], [330, 330, 8], [866, 300, 13], [470, 790, 12]]) {
    s.add(3, inkCircle(x, y, rr, '#e4ffd8', { w: W_DETAIL, 'fill-opacity': 0.4 }), el('circle', { cx: x - rr * 0.34, cy: y - rr * 0.36, r: rr * 0.22, fill: '#fff' }));
  }
  s.add(3, scrap(330, 730, 24, -30, '#5fb86a'), scrap(842, 690, 20, 20, '#5fb86a'), scrap(430, 232, 18, -50, '#5fb86a'));
  s.add(3, star4(170, 640, 24, '#fff3a0'), star4(540, 180, 18), star4(880, 440, 16, '#fff3a0'));
  s.specks({ n: 16, rmin: 3, rmax: 7, colors: ['#ffffff', '#e8ffc8', '#fff3a0'], opacity: 0.9 });
}

/** Doodle kelp rooted at (x, y): a wavy stem with fat pointed blades either side, one ink line round the lot
 *  (w = 0 for the far backdrop: flat, no line). */
function kelp(r, { x, y = 1060, h = 700, sway = 30, width = 28, leaf = 120, fill, w = W_MID, n = 5 }) {
  const ph = r.range(0, 6), pts = [];
  for (let i = 0; i <= 7; i++) { const t = i / 7; pts.push([x + Math.sin(t * 4.2 + ph) * sway * (0.3 + t), y - h * t]); }
  const sm = sample(pts, 6);
  let d = ribbon(pts, width, width * 0.5);
  for (let k = 0; k < n; k++) {
    const p = sm[Math.round((0.22 + 0.72 * k / Math.max(1, n - 1)) * (sm.length - 1))], sd = k % 2 ? 1 : -1, L = leaf * (1 - 0.3 * k / n) * r.range(0.85, 1.15);
    d += ribbon([p, [p[0] + sd * L * 0.5, p[1] - L * 0.42], [p[0] + sd * L, p[1] - L * 0.62]], 1, 1, (u) => leaf * 0.36 * Math.sin(Math.PI * Math.pow(u, 0.6)) + 3);
  }
  if (!w) return flat(d, fill);
  return g({}, [el('path', { d, fill: INK, stroke: INK, 'stroke-width': w * 2, 'stroke-linejoin': 'round' }), el('path', { d, fill })]);
}

/** A speed line: a white dash with an ink line round it, lying along the direction of travel. */
function streak(x, y, len, w) {
  const d = `M${x} ${y}l${Math.cos(SPEED) * len} ${Math.sin(SPEED) * len}`;
  return g({}, [el('path', { d, fill: 'none', stroke: INK, 'stroke-width': w + W_DETAIL * 2, 'stroke-linecap': 'round' }), el('path', { d, fill: 'none', stroke: '#f4ffe0', 'stroke-width': w, 'stroke-linecap': 'round' })]);
}

/** A scrap of torn kelp. */
function scrap(x, y, k, rot, fill) {
  return ink(`M${-k} 0Q0 ${-k * 0.7} ${k} 0Q0 ${k * 0.7} ${-k} 0Z`, fill, { w: W_DETAIL, transform: `translate(${x} ${y}) rotate(${rot})` });
}

/** The lower edge of an `eye` lid as a line (to ink it as a brow); `over` pokes it past the eyeball. */
function lidLine(x, y, r, lid, rot, over = 0) {
  const d = r * (2 * lid - 1), half = Math.sqrt(Math.max(0, r * r - d * d)) + over, a = rot * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
  const p = (px, py) => `${(x + px * c - py * sn).toFixed(1)} ${(y + px * sn + py * c).toFixed(1)}`;
  return `M${p(-half, d)}L${p(half, d)}`;
}
