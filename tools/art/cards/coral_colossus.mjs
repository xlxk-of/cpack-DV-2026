// CORAL COLOSSUS (epic) — a towering blocky golem of coral and stone: boulder shoulders, stone fists, coral antlers,
// two small lamp eyes, and tiny fish wheeling round it to show how big it is. Coral pink and orange on blue.
// Doodle style: see the DOODLE KIT in lib.mjs.
import { el, g, ribbon, ink, stroke, flat, inkCircle, inkEllipse, eye, star4, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const CORAL = '#ff8b7b', CORAL_SH = '#e05c7a', ORANGE = '#ffb84d', ORANGE_SH = '#f08a3c', STONE = '#a595dc', STONE_SH = '#7a66b8', CREAM = '#ffd9b8', LAMP = '#fff3a0';

export function build(s) {
  const r = s.r;

  // ---- 0: sunlit reef water in flat bands, far coral with no ink
  s.bands([[0, '#3a8bd6'], [330, '#2e72c2'], [600, '#2459a8'], [830, '#1b418a']], { amp: 18, waves: 3 });
  s.shafts({ x: 400, y: -140, angle: 84, spread: 44, n: 4, color: '#bfeaff', opacity: 0.12, width: 110 });
  s.add(0, g({}, [farCoral(120, 940, 1.5), farCoral(900, 930, 1.7), farCoral(250, 950, 0.9), farCoral(770, 950, 1.0)].flat()));
  s.specks({ n: 40, rmin: 2, rmax: 5, colors: ['#9fd4ff', '#ffd1c4', '#ffffff'], opacity: 0.45, layer: 0 });
  s.lumps({ y: 850, amp: 90, n: 7, fill: '#173a7c', layer: 0 });
  s.paper();

  // ---- 1: the reef it walks through, and a far shoal: thinner line, quiet colour
  s.add(1, g({ opacity: 0.85 }, [[150, 250, 1], [196, 282, 0.8], [116, 300, 0.8], [880, 196, 1], [924, 232, 0.8], [840, 236, 0.8], [900, 600, 0.9]].map(([x, y, k], i) => minnow(x, y, 15 * k, i < 3 ? 1 : -1, '#8fc4f2', W_DETAIL))));
  s.add(1, branch(96, 960, 1.25, '#a068b8'), branch(936, 960, 1.4, '#a068b8'));
  s.add(1, dome(226, 900, 74, '#5f6cc4'), dome(812, 900, 86, '#5f6cc4'));
  s.add(1, tubes(742, 900, '#8a8ad4'), tubes(160, 930, '#8a8ad4'));
  // the rise of sea floor it stands on
  s.add(1, ink(`M-60 1100L-60 900C100 870 240 892 340 836C420 800 604 800 690 836C790 892 920 868 1084 896L1084 1100Z`, '#22367c', { w: W_MID }));
  s.add(1, flat(`M360 850Q512 818 664 850Q512 836 360 850Z`, '#3a55a8'));

  // ---- 2: the colossus
  const torso = `M344 324Q512 298 680 324Q702 500 668 684Q512 712 356 684Q322 500 344 324Z`;
  const sprout = (x, y, dx, h, w) => ribbon([[x, y], [x + dx * 0.4, y - h * 0.55], [x + dx, y - h]], w, w * 0.8);
  const antler = (m) => [
    ribbon([[512 + m * 44, 236], [512 + m * 76, 196], [512 + m * 124, 178], [512 + m * 136, 132]], 30, 22),
    ribbon([[512 + m * 80, 196], [512 + m * 66, 158], [512 + m * 78, 122]], 24, 20),
    ribbon([[512 + m * 118, 182], [512 + m * 160, 186], [512 + m * 178, 160]], 22, 18),
  ];
  const shadeBlock = (x0, y0, w, h, c) => flat(`M${x0 + w * 0.62} ${y0 - 20}L${x0 + w + 40} ${y0 - 20}L${x0 + w + 40} ${y0 + h + 40}L${x0 - 40} ${y0 + h + 40}L${x0 - 40} ${y0 + h * 0.8}L${x0 + w * 0.56} ${y0 + h * 0.8}Z`, c);
  const dots = (pts, c) => pts.map(([x, y, rr]) => el('circle', { cx: x, cy: y, r: rr, fill: c }));
  const golem = figure(s, [
    ...antler(-1).map((d) => ({ d, fill: ORANGE })), ...antler(1).map((d) => ({ d, fill: ORANGE, in: [flat(`M0 0H1024V1024H0Z`, ORANGE_SH)] })),
    // legs of stone
    { d: rr(388, 664, 118, 170, 30), fill: STONE, in: [shadeBlock(388, 664, 118, 170, STONE_SH)] },
    { d: rr(518, 664, 118, 170, 30), fill: STONE_SH },
    {
      d: torso, fill: CORAL, in: [
        flat(`M580 280C640 400 640 600 590 720L720 720L720 280Z`, CORAL_SH),
        flat(`M320 640Q512 676 700 640L700 730L320 730Z`, CORAL_SH),
        ...dots([[372, 372, 9], [392, 420, 6], [366, 520, 8], [384, 600, 6], [404, 350, 5]], '#ffb9a6'),
      ],
    },
    // coral sprouting from the shoulders
    { d: sprout(250, 330, -14, 70, 28), fill: ORANGE }, { d: sprout(296, 316, 6, 92, 30), fill: '#ff9fb4' }, { d: sprout(340, 326, 16, 60, 26), fill: ORANGE },
    { d: sprout(690, 326, -14, 62, 26), fill: ORANGE_SH }, { d: sprout(734, 316, 4, 86, 30), fill: '#ff9fb4' }, { d: sprout(778, 332, 16, 60, 26), fill: ORANGE_SH },
    // stone arms and fists
    { d: rr(204, 470, 142, 252, 58), fill: STONE, in: [shadeBlock(204, 470, 142, 252, STONE_SH), flat(`M190 560H360V606H190Z`, CORAL), stroke(`M190 560H360M190 606H360`, { w: W_DETAIL })] },
    { d: rr(678, 470, 142, 252, 58), fill: STONE, in: [shadeBlock(678, 470, 142, 252, STONE_SH), flat(`M660 560H840V606H660Z`, CORAL), flat(`M766 560H840V606H760Z`, CORAL_SH), stroke(`M660 560H840M660 606H840`, { w: W_DETAIL })] },
    // boulder shoulders
    { d: boulder(294, 396, 104, 96), fill: CORAL, in: [flat(`M330 280C380 360 370 450 300 520L420 520L420 280Z`, CORAL_SH), flat(`M214 390C214 340 244 312 286 306C250 330 238 356 236 392Z`, '#ffffff', { opacity: 0.9 }), ...dots([[262, 440, 8], [300, 462, 6], [240, 420, 5]], '#ffb9a6')] },
    { d: boulder(730, 396, 104, 96), fill: CORAL, in: [flat(`M766 280C816 360 806 450 736 520L860 520L860 280Z`, CORAL_SH), flat(`M650 390C650 340 680 312 722 306C686 330 674 356 672 392Z`, '#ffffff', { opacity: 0.9 }), ...dots([[690, 446, 8], [724, 466, 6]], '#ffb9a6')] },
    // the small head sunk between them, under a stone brow
    { d: rr(438, 222, 148, 132, 40), fill: CORAL, in: [flat(`M540 200C566 260 566 320 540 370L620 370L620 200Z`, CORAL_SH), el('circle', { cx: 480, cy: 306, r: 34, fill: LAMP, opacity: 0.45 }), el('circle', { cx: 544, cy: 306, r: 34, fill: LAMP, opacity: 0.45 })] },
    { d: rr(426, 226, 172, 50, 22), fill: STONE, in: [flat(`M540 200H620V300H530Z`, STONE_SH)] },
  ]);
  const plate = `M436 448Q512 420 588 448L588 540Q582 612 512 644Q442 612 436 540Z`;
  const details = [
    // lamp eyes, a flat little mouth
    eye(480, 306, 19, { look: [0, 0.5], white: LAMP, w: W_DETAIL + 1, pupil: 0.5 }), eye(544, 306, 19, { look: [0, 0.5], white: LAMP, w: W_DETAIL + 1, pupil: 0.5 }),
    stroke(`M498 336h28`, { w: W_DETAIL + 1 }),
    // a pale chest plate with a crack, knuckles, toes, coral pores
    ink(plate, CREAM, { w: W_INNER }),
    g({ 'clip-path': s.clip(el('path', { d: plate })) }, [flat(`M536 400C560 500 556 580 530 660L620 660L620 400Z`, '#f5b89a')]),
    stroke(plate, { w: W_INNER }),
    stroke(`M486 438L500 484L480 510L502 548M500 484L524 498`, { w: W_DETAIL }),
    stroke(`M236 690v24M276 694v26M312 690v24M712 690v24M750 694v26M788 690v24`, { w: W_DETAIL }),
    stroke(`M426 806v22M466 808v22M556 808v22M596 806v22`, { w: W_DETAIL }),
    ...[[612, 380, 9, 6], [636, 440, 7, 5], [622, 520, 9, 6], [392, 560, 7, 5], [640, 610, 7, 5], [320, 360, 8, 5], [770, 372, 8, 5], [338, 430, 6, 4]].map(([x, y, a, b]) => inkEllipse(x, y, a, b, '#b8405f', { w: 4 })),
    // round coral tips on the antlers
    ...[[-136, 132], [-78, 122], [-178, 160], [136, 132], [78, 122], [178, 160]].map(([dx, y]) => inkCircle(512 + dx, y, 15, dx < 0 ? '#ffd27a' : ORANGE, { w: W_INNER })),
  ];
  s.add(2, g({ filter: s.wobble(5) }, [golem, ...details]));

  // ---- 3: tiny fish round its shoulders, bubbles, sparkles, dark coral at the near corners
  const shoal = [[196, 270, 1, 1], [176, 330, 0.8, 1], [340, 214, 0.7, 1], [150, 392, 0.9, 1],
    [826, 262, 1, -1], [850, 322, 0.85, -1], [690, 200, 0.7, -1], [876, 390, 0.75, -1], [600, 150, 0.7, -1]];
  s.add(3, g({ filter: s.wobble(3, 0.02, 9) }, shoal.map(([x, y, k, dir], i) => minnow(x, y, 20 * k, dir, ['#ffe27a', '#ffffff', '#9fe8ff'][i % 3], W_DETAIL))));
  s.add(3, ink(nearCoral(-10, 1050, 1), '#16296a', { w: W_INNER }), ink(nearCoral(1034, 1050, -1), '#16296a', { w: W_INNER }));
  s.inkBubbles({ n: 4, x0: 120, x1: 190, y0: 440, y1: 800, rmin: 8, rmax: 22 });
  s.inkBubbles({ n: 4, x0: 840, x1: 910, y0: 430, y1: 800, rmin: 8, rmax: 22 });
  s.add(3, star4(300, 150, 22, '#ffffff'), star4(740, 140, 18, '#ffe9a8'), star4(170, 560, 22, '#ffffff'), star4(868, 640, 18, '#ffd1c4'), star4(260, 800, 16, '#ffffff'));
  s.specks({ n: 14, rmin: 3, rmax: 7, colors: ['#ffffff', '#ffd1c4', '#b9f3ff'], opacity: 0.9 });
  void r;
}

/** Parts with ONE fat contour round the whole silhouette, like lib's sticker, but each part may carry hard shadow
 *  and highlight patches (`in`) clipped to its own shape before its inner line goes on. */
function figure(s, parts, outer = W_SUBJECT) {
  const back = parts.map((p) => ink(p.d, INK, { w: outer * 2 }));
  const front = parts.map((p) => [flat(p.d, p.fill), p.in ? g({ 'clip-path': s.clip(el('path', { d: p.d })) }, p.in) : '', stroke(p.d, { w: p.w ?? W_INNER })].join(''));
  return g({}, [...back, ...front]);
}

/** A rounded block. */
function rr(x, y, w, h, c) {
  return `M${x + c} ${y}H${x + w - c}Q${x + w} ${y} ${x + w} ${y + c}V${y + h - c}Q${x + w} ${y + h} ${x + w - c} ${y + h}H${x + c}Q${x} ${y + h} ${x} ${y + h - c}V${y + c}Q${x} ${y} ${x + c} ${y}Z`;
}

/** A lumpy round boulder. */
function boulder(x, y, rx, ry) {
  return `M${x - rx} ${y + ry * 0.1}C${x - rx * 1.02} ${y - ry * 0.7} ${x - rx * 0.5} ${y - ry * 1.04} ${x + rx * 0.1} ${y - ry}C${x + rx * 0.7} ${y - ry * 0.96} ${x + rx * 1.06} ${y - ry * 0.4} ${x + rx} ${y + ry * 0.2}C${x + rx * 0.94} ${y + ry * 0.8} ${x + rx * 0.4} ${y + ry * 1.04} ${x - rx * 0.1} ${y + ry}C${x - rx * 0.66} ${y + ry * 0.96} ${x - rx * 0.98} ${y + ry * 0.7} ${x - rx} ${y + ry * 0.1}Z`;
}

/** A tiny fish: a bean, a tail and a dot of an eye. dir = 1 swims right, -1 left. */
function minnow(x, y, R, dir, c, w) {
  const d = `M${x + dir * R} ${y}C${x + dir * R * 0.6} ${y - R * 0.75} ${x - dir * R * 0.5} ${y - R * 0.6} ${x - dir * R * 0.8} ${y}L${x - dir * R * 1.5} ${y - R * 0.55}L${x - dir * R * 1.5} ${y + R * 0.55}L${x - dir * R * 0.8} ${y}C${x - dir * R * 0.5} ${y + R * 0.6} ${x + dir * R * 0.6} ${y + R * 0.75} ${x + dir * R} ${y}Z`;
  return g({}, [ink(d, c, { w }), el('circle', { cx: x + dir * R * 0.45, cy: y - R * 0.12, r: Math.max(2.4, R * 0.16), fill: INK })]);
}

/** Far branching coral for the backdrop: flat, no line. */
function farCoral(x, y, k) {
  const c = '#2562b0', b = (pts, w) => flat(ribbon(pts.map(([px, py]) => [x + px * k, y - py * k]), w * k, w * k * 0.8), c);
  const tips = [[-60, 250], [10, 300], [70, 240], [-24, 196]].map(([px, py]) => el('circle', { cx: x + px * k, cy: y - py * k, r: 15 * k, fill: c }));
  return [b([[0, -60], [0, 120], [10, 300]], 30), b([[0, 110], [-40, 170], [-60, 250]], 24), b([[4, 150], [50, 180], [70, 240]], 24), b([[-34, 160], [-22, 180], [-24, 196]], 20), ...tips];
}

/** Branching coral for the middle distance. */
function branch(x, y, k, c) {
  const b = (pts, w) => ribbon(pts.map(([px, py]) => [x + px * k, y - py * k]), w * k, w * k * 0.85);
  const parts = [b([[0, -40], [4, 120], [-6, 250]], 34), b([[2, 110], [-46, 160], [-56, 230]], 26), b([[2, 150], [48, 190], [60, 262]], 26)];
  const tips = [[-6, 250], [-56, 230], [60, 262]];
  return g({}, [...parts.map((d) => ink(d, INK, { w: W_MID * 2 })), ...tips.map(([px, py]) => inkCircle(x + px * k, y - py * k, 18 * k, INK, { w: W_MID * 2 })),
    ...parts.map((d) => flat(d, c)), ...tips.map(([px, py]) => el('circle', { cx: x + px * k, cy: y - py * k, r: 18 * k, fill: c })),
    ...tips.map(([px, py]) => el('circle', { cx: x + px * k - 5 * k, cy: y - py * k - 5 * k, r: 5 * k, fill: '#ffffff', opacity: 0.7 }))]);
}

/** A brain-coral dome for the middle distance. */
function dome(x, y, R, c) {
  return g({}, [ink(`M${x - R} ${y + 30}C${x - R} ${y - R * 1.25} ${x + R} ${y - R * 1.25} ${x + R} ${y + 30}Z`, c, { w: W_MID }),
    stroke(`M${x - R * 0.5} ${y - R * 0.3}q${R * 0.16} ${-R * 0.2} ${R * 0.32} 0q${R * 0.16} ${R * 0.2} ${R * 0.32} 0M${x - R * 0.1} ${y - R * 0.62}q${R * 0.14} ${-R * 0.18} ${R * 0.28} 0q${R * 0.14} ${R * 0.18} ${R * 0.28} 0`, { w: W_DETAIL })]);
}

/** Three tube corals for the middle distance. */
function tubes(x, y, c) {
  const one = (dx, h, w) => g({}, [ink(`M${x + dx - w / 2} ${y + 30}V${y - h}Q${x + dx} ${y - h - w * 0.5} ${x + dx + w / 2} ${y - h}V${y + 30}Z`, c, { w: W_MID }), inkEllipse(x + dx, y - h + 2, w * 0.28, w * 0.16, INK, { w: 0, stroke: 'none' })]);
  return g({}, [one(-30, 70, 36), one(32, 96, 40), one(0, 130, 44)]);
}

/** A dark branch of near coral leaning in from a bottom corner (m = 1 left corner, -1 right). */
function nearCoral(x, y, m) {
  return ribbon([[x, y], [x + m * 30, y - 150], [x + m * 90, y - 250]], 90, 44) + ribbon([[x + m * 20, y - 120], [x - m * 10, y - 230], [x + m * 10, y - 330]], 60, 40) + ribbon([[x + m * 60, y - 40], [x + m * 150, y - 110], [x + m * 190, y - 190]], 60, 36);
}
