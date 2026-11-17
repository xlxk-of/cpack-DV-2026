// ASTRA, THE DROWNED STAR (mythic) — the fallen star herself: a star-headed being in a comet-tail gown of flat
// rainbow stripes, hovering over the sea floor in a drawn corona, a rainbow ring and striped light wedges, while
// the little creatures of the floor look up. Doodle style: see THE DOODLE KIT in lib.mjs.
import { el, g, spline, sample, poly, ink, stroke, flat, inkCircle, inkEllipse, eye, star4, halo, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const PINK = '#ff7fb8', GOLD = '#ffd24d', MINT = '#7df0c0', SKY = '#6fc8ff', VIOLET = '#a98bff';
const SPECTRUM = [PINK, GOLD, MINT, SKY, VIOLET];
const CORE = '#fffbe6', CORE_SH = '#ffe07a';
const CX = 512, CY = 336;

export function build(s) {
  const r = s.r;

  // ---- 0: near-black indigo in flat bands; hard rainbow-striped light wedges fanning from the star
  s.bands([[0, '#1d1654'], [300, '#181247'], [570, '#130e3a'], [810, '#0d0a2c']], { amp: 18, waves: 3 });
  const wedges = [];
  for (let i = 0; i < 8; i++) {
    const a0 = i * 45 + 12.5, span = 20;
    SPECTRUM.forEach((c, k) => {
      const a = (a0 + k * span / 5) * Math.PI / 180, b = (a0 + (k + 1) * span / 5) * Math.PI / 180;
      wedges.push(flat(poly([[CX, CY], [CX + Math.cos(a) * 1300, CY + Math.sin(a) * 1300], [CX + Math.cos(b) * 1300, CY + Math.sin(b) * 1300]], true), c));
    });
  }
  s.add(0, g({ opacity: 0.42 }, wedges));
  s.add(0, el('circle', { cx: CX, cy: CY, r: 520, fill: 'none', stroke: '#ffffff', 'stroke-width': 60, opacity: 0.05 }));
  s.specks({ n: 60, rmin: 2, rmax: 5, colors: ['#ffffff', '#ffe9a8', '#c9b6ff', '#9fe8ff'], opacity: 0.6, layer: 0 });
  s.lumps({ y: 900, amp: 80, n: 7, fill: '#0a0824', layer: 0 });
  s.paper();

  // ---- 1: concentric flat halos, the rainbow ring, the big corona of pointed rays; the watchers on the floor
  const mid = [];
  mid.push(halo(CX, CY, 372, '#fff3c4', 3, 0.22));
  [VIOLET, SKY, MINT, GOLD, PINK].forEach((c, i) => mid.push(el('circle', { cx: CX, cy: CY, r: 446 - i * 15, fill: 'none', stroke: c, 'stroke-width': 15.6 })));
  mid.push(el('circle', { cx: CX, cy: CY, r: 454, fill: 'none', stroke: INK, 'stroke-width': W_MID }), el('circle', { cx: CX, cy: CY, r: 378, fill: 'none', stroke: INK, 'stroke-width': W_MID }));
  mid.push(ink(burst(CX, CY, 8, 346, 282, 214, 0), GOLD, { w: W_MID }));
  mid.push(ink(burst(CX, CY, 8, 256, 256, 204, 11.25), '#ffe98a', { w: W_MID }));
  mid.push(el('circle', { cx: CX, cy: CY, r: 190, fill: '#fff6c0' }), el('circle', { cx: CX, cy: CY, r: 150, fill: '#fffbe0' }));
  s.add(1, g({}, mid));
  // the floor rises at both sides, with the watchers on it
  s.add(1, ink(spline([[-90, 1100], [-90, 790], [30, 756], [150, 770], [260, 820], [330, 900], [370, 1100]], true), '#2c2678', { w: W_MID }));
  s.add(1, flat(spline([[-30, 800], [60, 778], [160, 790], [230, 826], [130, 818], [40, 822]], true), '#3e3796'));
  s.add(1, ink(spline([[1110, 1100], [1110, 770], [1000, 738], [880, 752], [770, 810], [700, 900], [660, 1100]], true), '#2c2678', { w: W_MID }));
  s.add(1, flat(spline([[1050, 782], [960, 760], [870, 772], [800, 812], [900, 800], [990, 806]], true), '#3e3796'));
  s.add(1, fishy(132, 650, 1, '#5f82e6', '#4563c0', [0.75, -0.65]), fishy(912, 610, -1, '#56bcd0', '#3b93ae', [-0.75, -0.6]));
  s.add(1, crab(232, 786, '#e86a98', '#bf4c82', [0.6, -0.8]), octo(868, 716, '#9a78ea', '#7658c4', [-0.6, -0.8]));
  s.weed({ x: 40, y: 800, h: 190, fill: '#2f6fa8', sway: 18, width: 34 });
  s.weed({ x: 990, y: 780, h: 210, fill: '#2f6fa8', sway: 18, width: 34, lean: -0.05 });
  s.lumps({ y: 980, amp: 60, n: 6, fill: '#1c1858', layer: 1, w: W_MID });

  // ---- 2: Astra
  const out = [];
  const headD = starPath(CX, CY, 196, 116, 5, -90, 0.3);
  // the comet-tail gown: five flat stripes running down it
  const width = (t) => (t < 0.4 ? 70 + 170 * Math.sin((t / 0.4) * Math.PI / 2) : 240 - 222 * Math.pow((t - 0.4) / 0.6, 0.9));
  const gownSp = spine([[512, 430], [516, 530], [524, 620], [490, 704], [412, 754], [316, 764]], width);
  const gown = strip(gownSp, -1, 1);
  const armL = strip(spine([[484, 486], [424, 548], [372, 560]], () => 32), -1, 1), armR = strip(spine([[540, 486], [600, 548], [652, 560]], () => 32), -1, 1);
  out.push(g({}, [gown, armL, armR, headD].map((d) => el('path', { d, fill: INK, stroke: INK, 'stroke-width': W_SUBJECT * 2, 'stroke-linejoin': 'round' })))) ;
  out.push(ink(gown, CORE, { w: W_INNER }));
  out.push(g({ 'clip-path': s.clip(el('path', { d: gown })) }, [
    ...SPECTRUM.map((c, k) => flat(strip(gownSp, 1 - k * 0.4 + 0.02, 1 - (k + 1) * 0.4 - 0.02), c)),
    ...[1, 2, 3, 4].map((k) => stroke(poly(gownSp.filter((q) => q.t < 0.9).map((q) => [q.x + q.nx * q.hw * (1 - k * 0.4), q.y + q.ny * q.hw * (1 - k * 0.4)])), { w: W_DETAIL })),
    flat('M380 420L650 420L650 492Q512 520 380 492Z', INK, { opacity: 0.22 }),
  ]));
  out.push(stroke(gown, { w: W_INNER }));
  // little arms, open
  out.push(ink(armL, CORE, { w: W_INNER }), ink(armR, CORE, { w: W_INNER }));
  out.push(inkCircle(364, 560, 21, CORE, { w: W_INNER }), inkCircle(660, 560, 21, CORE, { w: W_INNER }));
  out.push(star4(364, 512, 20, GOLD, W_DETAIL), star4(660, 512, 20, GOLD, W_DETAIL));
  // the star head: white-gold, one hard shadow, hard highlights
  out.push(ink(headD, CORE, { w: W_INNER }));
  out.push(g({ 'clip-path': s.clip(el('path', { d: headD })) }, [
    flat(`M${CX + 40} ${CY - 220}C${CX + 150} ${CY - 60} ${CX + 120} ${CY + 70} ${CX + 10} ${CY + 130}L${CX - 140} ${CY + 220}L${CX + 240} ${CY + 220}L${CX + 240} ${CY - 220}Z`, CORE_SH),
    flat(`M${CX - 26} ${CY - 150}L${CX - 6} ${CY - 172}L${CX - 52} ${CY - 84}L${CX - 76} ${CY - 78}Z`, '#ffffff'),
    flat(`M${CX - 150} ${CY - 50}L${CX - 96} ${CY - 56}L${CX - 120} ${CY - 34}Z`, '#ffffff'),
  ]));
  out.push(stroke(headD, { w: W_INNER }));
  // the face: wide gentle eyes looking down at the watchers, a small smile, a blush
  out.push(eye(CX - 54, CY + 6, 33, { look: [0, 0.45] }), eye(CX + 54, CY + 6, 33, { look: [0, 0.45] }));
  out.push(stroke(`M${CX - 18} ${CY + 54}q18 16 36 0`, { w: W_INNER }));
  out.push(inkEllipse(CX - 98, CY + 46, 20, 12, PINK, { w: 0, stroke: 'none', opacity: 0.85 }), inkEllipse(CX + 98, CY + 46, 20, 12, PINK, { w: 0, stroke: 'none', opacity: 0.85 }));
  out.push(star4(CX, CY - 62, 17, GOLD, W_DETAIL - 1));
  s.add(2, g({ filter: s.wobble(5) }, out));

  // ---- 3: star fragments drifting, sparkles, a near reef
  const frag = [];
  const shards = [[140, 330, 44, PINK, 20], [872, 214, 40, MINT, -15], [246, 524, 30, SKY, 40], [776, 500, 32, GOLD, 10], [90, 120, 36, GOLD, -30], [936, 430, 30, VIOLET, 25],
    [330, 104, 22, '#ffffff', 0], [706, 92, 28, PINK, 30], [610, 770, 26, MINT, -20], [300, 694, 22, GOLD, 15], [52, 520, 26, VIOLET, -10], [826, 676, 22, '#ffffff', 35],
    [960, 640, 34, PINK, -25], [36, 700, 30, MINT, 30], [560, 40, 20, SKY, 15]];
  shards.forEach(([x, y, sz, c, rot], i) => frag.push(i % 3 === 2
    ? ink(starPath(x, y, sz, sz * 0.5, 5, rot - 90, 0.2), c, { w: W_DETAIL })
    : ink(shard(x, y, sz * 1.25, rot), c, { w: W_DETAIL })));
  frag.push(ink(starPath(70, 900, 80, 44, 5, -70, 0.26), GOLD, { w: W_SUBJECT }), flat('M40 868L62 850L58 888Z', '#fff'));
  frag.push(ink(shard(960, 880, 90, 28), SKY, { w: W_SUBJECT }), flat('M936 850L952 832L950 876Z', '#fff'));
  s.add(3, g({ filter: s.wobble(4, 0.012, 6) }, frag));
  s.lumps({ y: 1000, amp: 44, n: 5, fill: '#120e3c', layer: 3, w: W_SUBJECT });
  s.inkBubbles({ n: 4, x0: 30, x1: 300, y0: 380, y1: 760, rmin: 8, rmax: 18, fill: '#cfe6ff' });
  s.inkBubbles({ n: 4, x0: 720, x1: 1000, y0: 300, y1: 760, rmin: 8, rmax: 18, fill: '#cfe6ff' });
  s.add(3, star4(236, 220, 34), star4(800, 330, 26, '#ffe9a8'), star4(180, 620, 20, '#ffd1ef'), star4(716, 640, 22), star4(430, 60, 18, '#ffe9a8'), star4(900, 90, 22), star4(600, 866, 16));
  s.specks({ n: 18, rmin: 3, rmax: 7, colors: ['#ffffff', '#ffe9a8', '#ffd1ef', '#bff3ff'], opacity: 0.95 });
}

// ---------------------------------------------------------------------------------------------------- helpers

/** A chunky star with rounded tips: n points, outer radius R, inner r, rotated `rot` degrees. */
function starPath(cx, cy, R, r, n = 5, rot = -90, round = 0.3) {
  const V = [];
  for (let i = 0; i < n * 2; i++) { const a = (rot + i * 180 / n) * Math.PI / 180, rad = i % 2 ? r : R; V.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]); }
  let d = '';
  for (let i = 0; i < V.length; i++) {
    const p = V[(i - 1 + V.length) % V.length], v = V[i], q = V[(i + 1) % V.length], k = i % 2 ? round * 0.7 : round;
    d += `${i ? 'L' : 'M'}${f(v[0] + (p[0] - v[0]) * k)} ${f(v[1] + (p[1] - v[1]) * k)}Q${f(v[0])} ${f(v[1])} ${f(v[0] + (q[0] - v[0]) * k)} ${f(v[1] + (q[1] - v[1]) * k)}`;
  }
  return d + 'Z';
}
const f = (v) => Math.round(v * 10) / 10;

/** A burst of n pointed rays alternating long and short, with valleys at rv. */
function burst(cx, cy, n, RL, RS, rv, rot) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (rot + i * 180 / n - 90) * Math.PI / 180, b = (rot + (i + 0.5) * 180 / n - 90) * Math.PI / 180, R = i % 2 ? RS : RL;
    pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R], [cx + Math.cos(b) * rv, cy + Math.sin(b) * rv]);
  }
  return poly(pts, true);
}

/** A broken sliver of star: a wonky kite. */
function shard(x, y, sz, rot) {
  const a = rot * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
  return poly([[0, -sz], [sz * 0.5, -sz * 0.1], [sz * 0.16, sz * 0.7], [-sz * 0.44, sz * 0.2]].map(([px, py]) => [x + px * c - py * sn, y + px * sn + py * c]), true);
}

/** A centreline with normals; the full width at t (0..1 by arc length) comes from `width(t)`. */
function spine(pts, width, per = 10) {
  const sm = sample(pts, per);
  const acc = [0];
  for (let i = 1; i < sm.length; i++) acc.push(acc[i - 1] + Math.hypot(sm[i][0] - sm[i - 1][0], sm[i][1] - sm[i - 1][1]));
  const total = acc[acc.length - 1];
  return sm.map((p, i) => {
    const a = sm[Math.max(0, i - 1)], b = sm[Math.min(sm.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    const t = acc[i] / total;
    return { x: p[0], y: p[1], nx: -dy, ny: dx, hw: width(t) * 0.5, t };
  });
}
function strip(sp, a, b) {
  const L = sp.map((q) => [q.x + q.nx * q.hw * a, q.y + q.ny * q.hw * a]);
  const R = sp.map((q) => [q.x + q.nx * q.hw * b, q.y + q.ny * q.hw * b]);
  return poly(L.concat(R.reverse()), true);
}

// ---- the watchers (mid-distance line, quiet colour, every eye turned up to the star)
function fishy(x, y, dir, c, sh, look) {
  const body = `M${x - 46} ${y}C${x - 46} ${y - 44} ${x + 46} ${y - 44} ${x + 46} ${y}C${x + 46} ${y + 40} ${x - 46} ${y + 40} ${x - 46} ${y}Z`;
  const tail = `M${x - dir * 40} ${y}L${x - dir * 82} ${y - 30}L${x - dir * 72} ${y}L${x - dir * 82} ${y + 30}Z`;
  return g({}, [ink(tail, sh, { w: W_MID }), ink(body, c, { w: W_MID }),
    flat(`M${x - 40} ${y + 12}Q${x} ${y + 30} ${x + 40} ${y + 12}Q${x + 20} ${y + 34} ${x} ${y + 34}Q${x - 20} ${y + 34} ${x - 40} ${y + 12}Z`, sh),
    eye(x + dir * 16, y - 8, 15, { look, w: W_DETAIL }), inkEllipse(x + dir * 36, y + 12, 5, 6, INK, { w: 0, stroke: 'none' })]);
}
function crab(x, y, c, sh, look) {
  return g({}, [
    stroke(`M${x - 16} ${y - 20}L${x - 22} ${y - 46}`, { w: W_MID }), stroke(`M${x + 16} ${y - 20}L${x + 22} ${y - 46}`, { w: W_MID }),
    ink(`M${x - 40} ${y - 6}L${x - 66} ${y - 30}`, 'none', { w: W_MID + 5 }), ink(`M${x + 40} ${y - 6}L${x + 66} ${y - 30}`, 'none', { w: W_MID + 5 }),
    inkCircle(x - 70, y - 40, 16, c, { w: W_MID }), inkCircle(x + 70, y - 40, 16, c, { w: W_MID }),
    inkEllipse(x, y, 44, 28, c, { w: W_MID }), flat(`M${x - 38} ${y + 8}Q${x} ${y + 24} ${x + 38} ${y + 8}Q${x + 20} ${y + 26} ${x} ${y + 26}Q${x - 20} ${y + 26} ${x - 38} ${y + 8}Z`, sh),
    eye(x - 22, y - 50, 12, { look, w: W_DETAIL }), eye(x + 22, y - 50, 12, { look, w: W_DETAIL }),
    inkEllipse(x, y + 2, 6, 7, INK, { w: 0, stroke: 'none' }),
  ]);
}
function octo(x, y, c, sh, look) {
  const legs = [-36, -12, 12, 36].map((k) => inkEllipse(x + k, y + 30, 13, 16, c, { w: W_MID }));
  const dome = `M${x - 46} ${y + 22}C${x - 56} ${y - 60} ${x + 56} ${y - 60} ${x + 46} ${y + 22}Z`;
  return g({}, [...legs, ink(dome, c, { w: W_MID }), flat(`M${x + 12} ${y - 38}C${x + 40} ${y - 20} ${x + 36} ${y + 6} ${x + 26} ${y + 20}L${x + 44} ${y + 18}C${x + 50} ${y - 20} ${x + 36} ${y - 34} ${x + 12} ${y - 38}Z`, sh),
    eye(x - 16, y - 8, 13, { look, w: W_DETAIL }), eye(x + 16, y - 8, 13, { look, w: W_DETAIL }),
    inkEllipse(x, y + 12, 5, 6, INK, { w: 0, stroke: 'none' })]);
}
