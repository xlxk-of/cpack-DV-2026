// MARISOL, PEARL SOVEREIGN (legendary) — a serene little mer-queen on an open-shell throne, pearl crown, long rose
// hair, a great pearl in her lap; a drawn gold halo and orbiting pearls behind. Doodle style: see lib.mjs.
import { el, g, spline, sample, poly, ink, stroke, flat, inkCircle, inkEllipse, star4, halo, INK, SKIN, SKIN_SHADE, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const PEARL = '#fff7ee', PEARL_SH = '#e6cde6', GOLD = '#ffcb52', GOLD_SH = '#f29b40', ROSE = '#ff7fa8', ROSE_SH = '#d9568f';
// the shell's inside and the bodice are a deeper pink-lilac, so the pearl, the hands and the white rim read against them
const SKIN_SH = SKIN_SHADE, SHELL_A = '#f6c6e6', SHELL_B = '#e9a9da', BODICE = '#cf86d0';

export function build(s) {
  const r = s.r;

  // ---- 0: deep teal in flat bands
  s.bands([[0, '#16707a'], [300, '#115b69'], [570, '#0c4757'], [810, '#083445']], { amp: 18, waves: 3 });
  s.shafts({ x: 512, y: -180, angle: 90, spread: 56, n: 5, color: '#fff3c4', opacity: 0.1, width: 120 });
  // far reef towers, plain darker shapes
  s.add(0, flat(spline([[-40, 1100], [-40, 520], [30, 470], [90, 520], [110, 700], [170, 760], [200, 1100]], true), '#0a3d4c'));
  s.add(0, flat(spline([[1064, 1100], [1064, 480], [990, 440], [940, 500], [925, 690], [860, 770], [830, 1100]], true), '#0a3d4c'));
  s.specks({ n: 36, rmin: 2, rmax: 5, colors: ['#9fe8e0', '#ffe9a8'], opacity: 0.45, layer: 0 });
  s.lumps({ y: 900, amp: 80, n: 7, fill: '#062a39', layer: 0 });
  s.paper();

  // ---- 1: the drawn halo, the orbiting pearls, quiet reef
  const hx = 512, hy = 332, HK = 0.88, oy = 330;
  const mid = [];
  mid.push(halo(hx, hy, 396, ['#1e7e84']), halo(hx, hy, 350, ['#35958f']));
  const rays = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 - Math.PI / 2, long = (i % 2 === 0 ? 62 : 34) * HK, r0 = 286 * HK, da = 0.085;
    rays.push(ink(poly([[hx + Math.cos(a - da) * r0, hy + Math.sin(a - da) * r0], [hx + Math.cos(a) * (r0 + long), hy + Math.sin(a) * (r0 + long)], [hx + Math.cos(a + da) * r0, hy + Math.sin(a + da) * r0]], true), GOLD, { w: W_MID }));
  }
  mid.push(...rays);
  mid.push(inkCircle(hx, hy, 290 * HK, GOLD, { w: W_MID }), inkCircle(hx, hy, 256 * HK, '#fff1b8', { w: W_MID }));
  mid.push(el('circle', { cx: hx, cy: hy, r: 214 * HK, fill: '#fffbe0' }));
  // the orbit: a dashed ring and pearls on it
  mid.push(el('ellipse', { cx: hx, cy: oy, rx: 440, ry: 400, fill: 'none', stroke: '#ffe9a0', 'stroke-width': 5, 'stroke-dasharray': '4 22', 'stroke-linecap': 'round', opacity: 0.8 }));
  [[-158, 30], [-128, 22], [-100, 34], [-72, 24], [-46, 30], [-18, 22], [2, 30], [170, 24], [196, 28]].forEach(([deg, pr]) => {
    const a = deg * Math.PI / 180;
    mid.push(pearl(s, hx + Math.cos(a) * 440, oy + Math.sin(a) * 400, pr, W_MID));
  });
  s.add(1, g({}, mid));
  s.weed({ x: 70, h: 360, fill: '#1c8a7c', sway: 30, width: 52 });
  s.weed({ x: 150, h: 240, fill: '#187367', sway: 22, width: 42 });
  s.weed({ x: 960, h: 380, fill: '#1c8a7c', sway: 30, width: 52, lean: -0.05 });
  s.weed({ x: 880, h: 250, fill: '#187367', sway: 22, width: 42 });
  // the rock the throne stands on
  s.add(1, ink(spline([[250, 1100], [270, 850], [380, 790], [512, 780], [650, 790], [760, 850], [780, 1100]], true), '#135a66', { w: W_MID }));
  s.add(1, flat(spline([[330, 850], [430, 815], [600, 812], [690, 850], [560, 838], [420, 842]], true), '#1c7a80'));
  s.lumps({ y: 970, amp: 60, n: 6, fill: '#0d4352', layer: 1, w: W_MID });

  // ---- 2: Marisol on her shell
  const H = [512, 705];
  // the upright shell: seven lobes fanned from the hinge
  const N = 7, A0 = -165, A1 = -15, RV = 336, RP = 400;
  const ang = (i) => (A0 + (A1 - A0) * i / N) * Math.PI / 180;
  let fan = `M${H[0]} ${H[1] + 40}L${H[0] + Math.cos(ang(0)) * RV} ${H[1] + Math.sin(ang(0)) * RV}`;
  for (let i = 0; i < N; i++) {
    const m = (ang(i) + ang(i + 1)) / 2;
    fan += `Q${H[0] + Math.cos(m) * RP} ${H[1] + Math.sin(m) * RP} ${H[0] + Math.cos(ang(i + 1)) * RV} ${H[1] + Math.sin(ang(i + 1)) * RV}`;
  }
  fan += 'Z';
  const fanIn = [];
  for (let i = 0; i < N; i++) fanIn.push(flat(poly([H, [H[0] + Math.cos(ang(i)) * 500, H[1] + Math.sin(ang(i)) * 500], [H[0] + Math.cos(ang(i + 1)) * 500, H[1] + Math.sin(ang(i + 1)) * 500]], true), i % 2 ? SHELL_A : SHELL_B));
  fanIn.push(el('circle', { cx: H[0], cy: H[1], r: 350, fill: 'none', stroke: PEARL, 'stroke-width': 70 }));
  fanIn.push(flat(`M${H[0] + 60} ${H[1] - 400}C${H[0] + 250} ${H[1] - 250} ${H[0] + 230} ${H[1] - 80} ${H[0] + 150} ${H[1] + 40}L${H[0] + 420} ${H[1] + 40}L${H[0] + 420} ${H[1] - 400}Z`, '#b877c0', { opacity: 0.4 }));
  for (let i = 1; i < N; i++) fanIn.push(stroke(`M${H[0] + Math.cos(ang(i)) * 150} ${H[1] + Math.sin(ang(i)) * 150}L${H[0] + Math.cos(ang(i)) * RV} ${H[1] + Math.sin(ang(i)) * RV}`, { w: W_DETAIL }));

  // hair: a mass behind the head and two long locks cascading into the shell
  const hairBack = spline([[512, 172], [610, 190], [672, 270], [680, 370], [640, 450], [512, 470], [384, 450], [344, 370], [352, 270], [414, 190]], true, 12);
  const lockL = spine([[430, 330], [372, 420], [352, 510], [306, 590], [316, 700]], 108, 64);
  const lockR = spine([[594, 330], [652, 420], [672, 510], [718, 590], [708, 700]], 108, 64);
  const lockLd = strip(lockL, -1, 1), lockRd = strip(lockR, -1, 1);
  const flowSp = spine([[420, 372], [350, 440], [304, 520], [262, 580], [236, 604]], 96, 20);
  const flow = strip(flowSp, -1, 1);

  // tail and fin
  const tailSp = spine([[716, 700], [764, 646], [798, 598], [804, 550], [798, 514]], 116, 44);
  const tail = strip(tailSp, -1, 1);
  const band = strip(tailSp.filter((q) => q.t >= 0.86), -1, 1);
  const fin = 'M776 540C724 500 700 440 716 376C766 400 800 436 814 474C838 432 880 408 920 414C912 478 872 530 812 548Z';

  // the lower shell, a scalloped bowl
  const rimY = (t) => 628 + 4 * 36 * t * (1 - t);
  let bowl = `M196 ${rimY(0)}`;
  for (let i = 0; i < 7; i++) {
    const t0 = i / 7, t1 = (i + 1) / 7, tm = (t0 + t1) / 2;
    bowl += `Q${196 + 632 * tm} ${rimY(tm) - 30} ${196 + 632 * t1} ${rimY(t1)}`;
  }
  bowl += 'C830 744 676 812 512 812C348 812 194 744 196 628Z';
  const bowlIn = [];
  for (let i = 0; i < 7; i++) bowlIn.push(flat(poly([[512, 900], [196 + 632 * i / 7 - (3.5 - i) * 30, 560], [196 + 632 * (i + 1) / 7 - (2.5 - i) * 30, 560]], true), i % 2 ? PEARL : '#ffe6ee'));
  bowlIn.push(flat('M180 676C300 768 420 768 512 768C604 768 724 768 844 676L844 900L180 900Z', PEARL_SH));
  for (let i = 1; i < 7; i++) bowlIn.push(stroke(`M${196 + 632 * i / 7} ${rimY(i / 7) + 8}L${512 + (196 + 632 * i / 7 - 512) * 0.5} 806`, { w: W_DETAIL }));
  bowlIn.push(flat('M236 690C232 668 236 652 246 640C254 664 256 690 276 734C254 724 242 708 236 690Z', '#ffffff'));

  // head, crown
  const head = spline([[512, 222], [596, 244], [628, 330], [600, 408], [512, 438], [424, 408], [396, 330], [428, 244]], true, 12);
  let crown = 'M434 250L428 196L462 214L472 166L498 200L512 140L526 200L552 166L562 214L596 196L590 250Q512 222 434 250Z';

  const body = [];
  body.push(g({}, [fan, hairBack, flow, lockLd, lockRd, tail, fin, bowl, crown].map((d) => el('path', { d, fill: INK, stroke: INK, 'stroke-width': W_SUBJECT * 2, 'stroke-linejoin': 'round' }))));
  // shell back
  body.push(ink(fan, SHELL_A, { w: W_INNER }), g({ 'clip-path': s.clip(el('path', { d: fan })) }, fanIn), stroke(fan, { w: W_INNER }));
  // hair behind
  body.push(ink(flow, ROSE, { w: W_INNER }), g({ 'clip-path': s.clip(el('path', { d: flow })) }, [flat(strip(flowSp, 0.2, 1.2), ROSE_SH)]), stroke(flow, { w: W_INNER }));
  body.push(ink(hairBack, ROSE, { w: W_INNER }));
  for (const [sp, d, side] of [[lockL, lockLd, -1], [lockR, lockRd, 1]]) {
    body.push(ink(d, ROSE, { w: W_INNER }), g({ 'clip-path': s.clip(el('path', { d })) }, [
      flat(strip(sp, -side * 0.2, -side * 1.2), ROSE_SH),
      flat(strip(sp.slice(8, 30), side * 0.5, side * 0.72), '#ffc2d6'),
    ]), stroke(d, { w: W_INNER }));
  }
  body.push(g({ 'clip-path': s.clip(el('path', { d: hairBack })) }, [flat('M330 372Q512 452 694 372L694 500L330 500Z', ROSE_SH)]), stroke(hairBack, { w: W_INNER }));
  // tail
  body.push(ink(fin, ROSE, { w: W_INNER }), g({ 'clip-path': s.clip(el('path', { d: fin })) }, [flat('M700 580L960 580L960 400C890 440 850 500 800 530Z', ROSE_SH)]), stroke(fin, { w: W_INNER }),
    stroke('M786 520Q748 470 738 420', { w: W_DETAIL }), stroke('M822 524Q852 474 892 446', { w: W_DETAIL }));
  // scales: rows of small shadow-tone scallops on the lit side (no ink, so they cannot read as a face)
  const scales = [];
  tailSp.forEach((q, i) => {
    if (i % 5 !== 2 || q.t < 0.3 || q.t > 0.8) return;
    const tx = q.ny, ty = -q.nx, row = ((i - 2) / 5) % 2;
    for (const u of row ? [-0.72, -0.24] : [-0.48, 0]) {
      const px = q.x + q.nx * q.hw * u, py = q.y + q.ny * q.hw * u, a = 10, b = 12;
      scales.push(ink(`M${px - q.nx * a} ${py - q.ny * a}Q${px + tx * b} ${py + ty * b} ${px + q.nx * a} ${py + q.ny * a}`, 'none', { w: W_DETAIL, stroke: ROSE_SH }));
    }
  });
  body.push(ink(tail, ROSE, { w: W_INNER }), g({ 'clip-path': s.clip(el('path', { d: tail })) }, [
    flat(strip(tailSp, 0.25, 1.2), ROSE_SH),
    ...scales,
  ]), ink(band, GOLD, { w: W_DETAIL + 1 }), stroke(tail, { w: W_INNER }));
  // torso and arms
  const torso = 'M466 440Q512 424 558 440L550 520Q552 575 566 612L458 612Q472 575 474 520Z';
  body.push(ink(torso, SKIN, { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: torso })) }, [flat('M440 420L584 420L584 462Q512 476 440 462Z', SKIN_SH)]));
  body.push(inkEllipse(490, 500, 24, 19, BODICE, { w: W_DETAIL }), inkEllipse(534, 500, 24, 19, BODICE, { w: W_DETAIL }));
  body.push(ink(`M452 606Q512 570 572 606L574 640L450 640Z`, GOLD, { w: W_INNER }));
  const armL = strip(spine([[470, 458], [444, 512], [458, 556], [488, 576]], 28, 26), -1, 1), armR = strip(spine([[554, 458], [580, 512], [566, 556], [536, 576]], 28, 26), -1, 1);
  body.push(ink(armL, SKIN, { w: W_INNER }), ink(armR, SKIN, { w: W_INNER }));
  // the lower shell in front of her tail
  body.push(ink(bowl, PEARL, { w: W_INNER }), g({ 'clip-path': s.clip(el('path', { d: bowl })) }, bowlIn), stroke(bowl, { w: W_INNER }));
  // the great pearl in her lap, hands round it
  body.push(pearl(s, 512, 566, 46, W_INNER), star4(540, 536, 20, '#fff', W_DETAIL - 1));
  body.push(inkCircle(470, 578, 17, SKIN, { w: W_INNER }), inkCircle(554, 578, 17, SKIN, { w: W_INNER }));
  // head
  body.push(ink(head, SKIN, { w: W_INNER }));
  body.push(ink('M518 212C446 204 388 250 390 352C426 334 484 296 518 250Z', ROSE, { w: W_INNER }));
  body.push(ink('M506 212C578 204 636 250 634 352C598 334 540 296 506 250Z', ROSE, { w: W_INNER }));
  body.push(flat('M430 262C444 240 466 228 490 226C470 244 452 262 440 284Z', '#ffc2d6'));
  // serene closed eyes, a small smile, a blush
  body.push(stroke('M440 348q26 26 52 0', { w: W_INNER + 2 }), stroke('M532 348q26 26 52 0', { w: W_INNER + 2 }));
  body.push(stroke('M438 350l-12 -8', { w: W_DETAIL + 1 }), stroke('M586 350l12 -8', { w: W_DETAIL + 1 }));
  body.push(stroke('M496 396q16 13 32 0', { w: W_INNER }));
  body.push(inkEllipse(436, 388, 21, 12, '#ff9fbf', { w: 0, stroke: 'none', opacity: 0.85 }), inkEllipse(588, 388, 21, 12, '#ff9fbf', { w: 0, stroke: 'none', opacity: 0.85 }));
  // crown: gold, a rose gem, a pearl on every point
  body.push(ink(crown, GOLD, { w: W_INNER }), g({ 'clip-path': s.clip(el('path', { d: crown })) }, [flat('M530 120L620 120L620 260L530 260Q560 200 530 120Z', GOLD_SH)]), stroke(crown, { w: W_INNER }));
  body.push(inkEllipse(512, 222, 13, 15, ROSE, { w: W_DETAIL }));
  [[428, 194, 12], [472, 164, 13], [512, 136, 18], [552, 164, 13], [596, 194, 12]].forEach(([x, y, pr]) => body.push(pearl(s, x, y, pr, W_DETAIL + 1)));
  s.add(2, g({ filter: s.wobble(5) }, g({ transform: 'translate(20.48 4.48) scale(0.96)' }, body)));

  // ---- 3: pearls and bubbles drifting in front
  s.add(3, g({ filter: s.wobble(4, 0.012, 5) }, [pearl(s, 96, 600, 44, W_SUBJECT - 2), pearl(s, 940, 520, 36, W_SUBJECT - 2), pearl(s, 922, 738, 44, W_SUBJECT - 2), pearl(s, 128, 744, 38, W_SUBJECT - 2)]));
  // bubbles (the set's ink bubble), placed by hand so none kisses a pearl, a sparkle or the fin
  s.add(3, g({}, [[176, 304, 14], [36, 318, 11], [46, 480, 10], [152, 676, 9], [862, 300, 13], [982, 442, 10], [868, 610, 12], [990, 640, 9]].flatMap(([x, y, rr]) => [
    inkCircle(x, y, rr, '#bff5ee', { w: W_DETAIL, 'fill-opacity': 0.35 }), el('circle', { cx: x - rr * 0.34, cy: y - rr * 0.36, r: rr * 0.22, fill: '#fff' })])));
  s.add(3, star4(236, 196, 32), star4(806, 250, 24, '#ffe9a8'), star4(200, 500, 20, '#ffd1ef'), star4(846, 690, 22), star4(690, 120, 16, '#ffe9a8'));
  s.specks({ n: 14, y1: 790, rmin: 3, rmax: 7, colors: ['#ffffff', '#ffe9a8', '#ffd1ef'], opacity: 0.9 });
}

// ---------------------------------------------------------------------------------------------------- helpers

/** A pearl: white ball, one lilac shadow crescent, one glint. */
function pearl(s, x, y, r, w) {
  const clip = s.clip(el('circle', { cx: x, cy: y, r }));
  return g({}, [
    inkCircle(x, y, r, PEARL, { w }),
    g({ 'clip-path': clip }, [el('circle', { cx: x - r * 0.28, cy: y - r * 0.3, r: r * 1.04, fill: 'none', stroke: PEARL_SH, 'stroke-width': r * 0.5 })]),
    el('circle', { cx: x - r * 0.36, cy: y - r * 0.38, r: r * 0.2, fill: '#fff' }),
    el('circle', { cx: x, cy: y, r, fill: 'none', stroke: INK, 'stroke-width': w }),
  ]);
}

/** A centreline with normals and half-widths, tapering by arc length. */
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
    return { x: p[0], y: p[1], nx: -dy, ny: dx, hw: (w0 + (w1 - w0) * t) * 0.5, t };
  });
}
/** The strip of a spine between two offsets (fractions of the half-width), as a closed path. */
function strip(sp, a, b) {
  const L = sp.map((q) => [q.x + q.nx * q.hw * a, q.y + q.ny * q.hw * a]);
  const R = sp.map((q) => [q.x + q.nx * q.hw * b, q.y + q.ny * q.hw * b]);
  return poly(L.concat(R.reverse()), true);
}
