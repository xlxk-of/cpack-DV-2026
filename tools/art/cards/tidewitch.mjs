// TIDEWITCH NERAI (epic) — a small hooded sea-witch with lamp eyes in the dark of her hood, hair rising like
// tendrils, and the tide wound up into one swirling orb between her hands. Magenta and teal. Doodle style: see the
// DOODLE KIT in lib.mjs.
import { el, g, ribbon, ink, stroke, flat, inkCircle, eye, star4, halo, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const TEAL = '#25aaa2', TEAL_SH = '#177c88', MAG = '#f251a8', MAG_SH = '#c2338c', FACE = '#2d1b5a', ORB = '#84ecff', ORB_SH = '#3fbbe3', SKIN = '#dcc6ff';

export function build(s) {
  const OX = 512, OY = 606, OR = 64; // the orb

  // ---- 0: violet deep in flat bands, a drawn tide-moon behind her
  s.bands([[0, '#3d3ca0'], [330, '#33308a'], [600, '#292571'], [830, '#1f1b58']], { amp: 18, waves: 3 });
  s.add(0, halo(512, 372, 350, '#8f9bff', 3, 0.3));
  s.shafts({ x: 380, y: -140, angle: 82, spread: 40, n: 4, color: '#ff9fe0', opacity: 0.08, width: 110 });
  s.specks({ n: 40, rmin: 2, rmax: 5, colors: ['#9fb0ff', '#ff9fe0', '#84ecff'], opacity: 0.5, layer: 0 });
  s.lumps({ y: 905, amp: 80, n: 7, fill: '#151243', layer: 0 });
  s.paper();

  // ---- 1: the tide rearing up on either side of her, weed and the sea floor: thinner line, quiet colour
  const waves = [
    [curl(60, 1010, -Math.PI / 2 + 0.12, 380, 84, 1, 120), '#355ab8'], [curl(964, 1010, -Math.PI / 2 - 0.12, 430, 84, -1, 120), '#355ab8'],
    [curl(-10, 1010, -Math.PI / 2 + 0.1, 190, 60, 1, 100), '#2f4fae'], [curl(1034, 1010, -Math.PI / 2 - 0.1, 220, 60, -1, 100), '#2f4fae'],
  ];
  s.add(1, g({ opacity: 0.92 }, waves.map(([d, c]) => ink(d, c, { w: W_MID }))));
  s.add(1, ...[[116, 610, 9], [150, 574, 6], [912, 566, 9], [876, 528, 6], [60, 800, 7], [972, 790, 7]].map(([x, y, rr]) => el('circle', { cx: x, cy: y, r: rr, fill: '#b9d2ff', opacity: 0.9 })));
  s.weed({ x: 250, h: 210, fill: '#2a5a9c', sway: 20, width: 40 });
  s.weed({ x: 780, h: 230, fill: '#2a5a9c', sway: 22, width: 40, lean: -0.05 });
  s.lumps({ y: 965, amp: 60, n: 6, fill: '#262066', layer: 1, w: W_MID });

  // ---- 2: Nerai
  const tend = (pts, w, c) => ({ d: ribbon(pts, w, 12, (t) => 1 - t * 0.1), fill: c, in: [stroke(ribbon(pts, 6, 2), { w: 0, stroke: 'none', fill: '#ffffff', opacity: 0.55 })] });
  const hair = [
    tend([[440, 404], [340, 436], [250, 396], [212, 306], [244, 228], [214, 176]], 54, MAG_SH),
    tend([[584, 404], [690, 432], [778, 384], [802, 296], [768, 232], [800, 176]], 54, MAG_SH),
    tend([[430, 326], [340, 306], [292, 236], [318, 178], [286, 136]], 58, MAG),
    tend([[598, 334], [700, 334], [754, 274], [734, 216], [770, 170]], 56, MAG),
    tend([[462, 246], [408, 196], [424, 138]], 46, MAG_SH),
  ];
  const hood = `M388 462C336 384 356 244 468 192C520 168 580 150 644 156C616 176 604 198 610 224C672 284 680 384 636 462Z`;
  const robe = `M404 446C340 520 306 670 282 772` + scallop(282, 742, 772, 5, 30) + `C718 670 684 520 620 446Z`;
  const armL = `M400 456C350 496 324 548 340 596C350 630 372 656 396 668L466 612C440 580 436 540 452 498Z`;
  const armR = `M624 456C674 496 700 548 684 596C674 630 652 656 628 668L558 612C584 580 588 540 572 498Z`;
  const robeSh = `M560 400C600 520 610 660 580 840L800 840L800 400Z`, hem = `M200 716Q512 760 824 716L824 860L200 860Z`;
  const orbSwirl = `M${OX + 34} ${OY - 6}C${OX + 30} ${OY - 44} ${OX - 30} ${OY - 46} ${OX - 36} ${OY - 4}C${OX - 40} ${OY + 34} ${OX + 14} ${OY + 38} ${OX + 16} ${OY + 4}C${OX + 16} ${OY - 16} ${OX - 12} ${OY - 16} ${OX - 10} ${OY + 2}`;
  const fig = [
    figure(s, [
      ...hair,
      {
        d: robe, fill: TEAL, in: [
          // one hard shadow down her right side, a magenta hem
          flat(robeSh, TEAL_SH), flat(hem, MAG),
          g({ 'clip-path': s.clip(el('path', { d: hem })) }, flat(robeSh, MAG_SH)),
          stroke(`M250 720Q512 762 774 720`, { w: W_DETAIL }),
          star4(400, 690, 12, '#ffffff', 0), star4(470, 706, 9, '#ffffff', 0), star4(336, 672, 9, '#ffffff', 0),
        ],
      },
      {
        d: hood, fill: TEAL, in: [
          flat(`M566 100C640 240 652 380 600 500L760 500L760 100Z`, TEAL_SH),
          flat(`M392 350C388 280 426 226 492 204C448 240 424 290 420 352Z`, '#ffffff', { opacity: 0.9 }),
        ],
      },
    ]),
    // the dark of the hood, a magenta lining, and her face: lamp eyes and a small sure smile
    inkEll(512, 356, 116, 104, MAG), inkEll(512, 362, 98, 88, FACE),
    el('circle', { cx: 472, cy: 364, r: 44, fill: '#7fd8ff', opacity: 0.22 }), el('circle', { cx: 552, cy: 364, r: 44, fill: '#7fd8ff', opacity: 0.22 }),
    eye(472, 362, 30, { look: [0, 0.35], white: '#c9fdff', lid: 0.26, lidRot: 12, lidFill: FACE, pupil: 0.5 }),
    eye(552, 362, 30, { look: [0, 0.35], white: '#c9fdff', lid: 0.26, lidRot: -12, lidFill: FACE, pupil: 0.5 }),
    stroke(`M494 414q18 13 36 0`, { w: W_DETAIL + 1, stroke: '#ff9fd6' }),
    // the orb's drawn light on her robe, then sleeves, orb and hands
    halo(OX, OY, 150, ORB, 3, 0.42),
    figure(s, [
      { d: armL, fill: TEAL, in: [flat(`M300 600Q380 600 480 640L480 700L300 700Z`, TEAL_SH)] },
      { d: armR, fill: TEAL_SH },
      { d: circ(OX, OY, OR), fill: ORB, in: [el('circle', { cx: OX + 22, cy: OY + 24, r: OR, fill: ORB_SH }), el('circle', { cx: OX - 6, cy: OY - 6, r: OR - 14, fill: ORB }),
        stroke(orbSwirl, { w: W_INNER + 2, stroke: '#ffffff' }), el('circle', { cx: OX - 34, cy: OY - 38, r: 8, fill: '#fff' })] },
      { d: circ(OX - 70, OY + 26, 25), fill: SKIN }, { d: circ(OX + 70, OY + 26, 25), fill: SKIN },
    ], W_INNER + 2),
    stroke(`M${OX - 84} ${OY + 20}q10 -6 20 0M${OX + 64} ${OY + 20}q10 -6 20 0`, { w: W_DETAIL }),
  ];
  s.add(2, g({ filter: s.wobble(5) }, fig));

  // ---- 3: drops flung off the orb, sparkles, bubbles, and dark weed at the near corners
  s.add(3, g({ filter: s.wobble(4, 0.014, 7) }, [drop(404, 548, 13, -40), drop(622, 540, 12, 40), drop(452, 506, 9, -20), drop(574, 504, 9, 24)]));
  s.add(3, star4(250, 520, 32, '#ffffff'), star4(790, 500, 24, '#ffd1ef'), star4(690, 130, 22, '#ffffff'), star4(180, 250, 20, ORB), star4(830, 700, 18, '#ffffff'), star4(OX - 2, OY - 92, 18, '#ffffff'));
  s.add(3, ink(ribbon([[-20, 1060], [50, 900], [10, 780], [70, 690]], 70, 22), '#1b1650', { w: W_INNER }), ink(ribbon([[1044, 1060], [980, 910], [1020, 800], [960, 720]], 70, 22), '#1b1650', { w: W_INNER }));
  s.inkBubbles({ n: 5, x0: 130, x1: 300, y0: 600, y1: 900, rmin: 8, rmax: 22 });
  s.inkBubbles({ n: 5, x0: 740, x1: 900, y0: 180, y1: 880, rmin: 8, rmax: 22 });
  s.specks({ n: 14, rmin: 3, rmax: 7, colors: ['#ffffff', '#ffd1ef', '#b9f3ff'], opacity: 0.9 });
}

/** Parts with ONE fat contour round the whole silhouette, like lib's sticker, but each part may carry hard shadow
 *  and highlight patches (`in`) clipped to its own shape before its inner line goes on. */
function figure(s, parts, outer = W_SUBJECT) {
  const back = parts.map((p) => ink(p.d, INK, { w: outer * 2 }));
  const front = parts.map((p) => [flat(p.d, p.fill), p.in ? g({ 'clip-path': s.clip(el('path', { d: p.d })) }, p.in) : '', stroke(p.d, { w: p.w ?? W_INNER })].join(''));
  return g({}, [...back, ...front]);
}

const circ = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
const inkEll = (x, y, rx, ry, fill) => el('ellipse', { cx: x, cy: y, rx, ry, fill, stroke: INK, 'stroke-width': W_INNER });

/** A scalloped hem, as path segments from x0 to x1 along y. */
function scallop(x0, x1, y, n, depth) {
  let d = '';
  const step = (x1 - x0) / n;
  for (let i = 0; i < n; i++) { const a = x0 + step * i, b = a + step; d += `Q${(a + b) / 2} ${y + depth} ${b} ${y}`; }
  return d;
}

/** A rearing wave as a flat shape: a fat tail running `len` px from (x, y) along `ang`, rolling over into a curl of
 *  radius R (turn = 1 clockwise, -1 the other way). */
function curl(x, y, ang, len, R, turn = 1, w0 = 34) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const pts = [[x, y], [x + ca * len * 0.5 + sa * turn * len * 0.1, y + sa * len * 0.5 - ca * turn * len * 0.1]];
  const ex = x + ca * len, ey = y + sa * len, cx = ex - sa * turn * R, cy = ey + ca * turn * R;
  for (let i = 0; i <= 9; i++) {
    const t = i / 9, a = ang - turn * Math.PI / 2 + turn * t * Math.PI * 1.55, rr = R * (1 - t * 0.6);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return ribbon(pts, w0, 14, null, 8);
}

/** A flung water drop. */
function drop(x, y, R, rot) {
  return g({ transform: `rotate(${rot} ${x} ${y})` }, [
    ink(`M${x} ${y - R * 1.7}C${x + R * 0.5} ${y - R * 0.8} ${x + R} ${y - R * 0.3} ${x + R} ${y + R * 0.2}A${R} ${R} 0 1 1 ${x - R} ${y + R * 0.2}C${x - R} ${y - R * 0.3} ${x - R * 0.5} ${y - R * 0.8} ${x} ${y - R * 1.7}Z`, ORB, { w: W_DETAIL }),
    el('circle', { cx: x - R * 0.3, cy: y + R * 0.1, r: R * 0.26, fill: '#fff' }),
  ]);
}
