// GHOSTSHIP REVENANT (epic) — a chunky little ghost galleon still sailing along under the sea: tattered sails, lit
// portholes, a ghost's face on the bow and a hem of spirit curls where the keel used to be. Doodle style: see the
// DOODLE KIT in lib.mjs.
import { el, g, ribbon, ink, stroke, flat, inkCircle, eye, star4, halo, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const HULL = '#4fb89a', HULL_SH = '#35907f', SAIL = '#dcffe6', SAIL_SH = '#a6e8c6', DARK = '#256b68', GLOW = '#f4ff9c', WISP = '#bff7d2';

export function build(s) {
  // ---- 0: dark teal water in flat bands, a far wreck with no ink
  s.bands([[0, '#17566a'], [320, '#12475c'], [590, '#0e374c'], [830, '#0a2839']], { amp: 18, waves: 3 });
  s.shafts({ x: 620, y: -140, angle: 100, spread: 40, n: 4, color: '#9dffc8', opacity: 0.1, width: 110 });
  // a far wreck with no ink: a heeled-over hull and two broken masts
  s.add(0, flat(`M-60 1064L-60 780C60 760 250 800 400 900L400 1064Z`, '#0b2f40'), flat(`M120 800L170 500L196 504L160 810Z`, '#0b2f40'), flat(`M118 610L252 640L248 664L114 634Z`, '#0b2f40'), flat(`M270 850L296 660L318 664L300 856Z`, '#0b2f40'));
  s.add(0, flat(`M1084 1064L1084 720C1010 730 900 800 820 920L800 1064Z`, '#0b2f40'), flat(`M900 830L872 580L896 578L930 820Z`, '#0b2f40'), flat(`M836 668L950 650L954 672L840 692Z`, '#0b2f40'));
  s.specks({ n: 40, rmin: 2, rmax: 5, colors: ['#8fe8c8', '#c9ffd6', '#7fc8e8'], opacity: 0.45, layer: 0 });
  s.lumps({ y: 910, amp: 80, n: 7, fill: '#071e2c', layer: 0 });
  s.paper();

  // ---- 1: two little spirits, weed and the sea floor: thinner line, quiet colour
  s.weed({ x: 120, h: 380, fill: '#1c6f6a', sway: 30, width: 52 });
  s.weed({ x: 200, h: 250, fill: '#175a5c', sway: 22, width: 42 });
  s.weed({ x: 944, h: 340, fill: '#1c6f6a', sway: 28, width: 54, lean: -0.05 });
  s.weed({ x: 838, h: 250, fill: '#175a5c', sway: 22, width: 42 });
  s.add(1, spirit(150, 250, 46, '#6fcfae', -8), spirit(884, 520, 36, '#5fbfa6', 10), spirit(858, 150, 28, '#5fbfa6', -6));
  s.add(1, anchor(650, 900, 1.25, 18));
  s.lumps({ y: 965, amp: 60, n: 6, fill: '#123c4c', layer: 1, w: W_MID });

  // ---- 2: the ship, bow to the left, nose a little up
  const hem = scallop(748, 316, 650, 6, 46);
  const hull = `M226 468L684 480L688 408L800 398C814 500 800 596 748 650${hem}C264 622 232 540 226 468Z`;
  const mast = (x, y0, y1, w) => ribbon([[x, y0], [x - 4, y1]], w, w * 0.72);
  const yard = (x0, x1, y) => `M${x0} ${y - 8}L${x1} ${y - 4}L${x1} ${y + 10}L${x0} ${y + 6}Z`;
  const sails = [
    // main course (with a hole clean through it), main top, fore, mizzen: all blown ragged along the foot
    { d: `M376 300L590 304C598 352 594 402 582 448L550 420L522 460L488 424L452 464L420 430L386 458C366 402 362 350 376 300ZM574 372a31 31 0 1 0 -62 0a31 31 0 1 0 62 0Z`, sx: 500 },
    { d: `M404 176L560 180C566 214 562 246 552 278L520 258L488 284L456 260L414 282C398 246 396 212 404 176Z`, sx: 506 },
    { d: `M258 262L422 266C430 322 428 372 418 426L392 400L362 434L330 404L296 432L268 410C248 360 248 310 258 262Z`, sx: 372 },
    { d: `M690 256L796 260C800 296 796 336 788 370L764 350L740 378L708 354C694 322 690 290 690 256Z`, sx: 760 },
  ].map((p) => ({
    d: p.d, fill: SAIL, in: [
      flat(`M${p.sx} 100L1000 100L1000 600L${p.sx - 50} 600Z`, SAIL_SH),
      flat(`M${p.sx - 150} 100L${p.sx - 126} 100L${p.sx - 150} 600L${p.sx - 174} 600Z`, '#ffffff', { opacity: 0.9 }),
    ],
  }));
  const ship = figure(s, [
    // the spirit curls it trails, behind everything
    { d: wisp(770, 606, 0.3, 84, 32, -1, 44), fill: WISP },
    { d: wisp(706, 656, 0.8, 64, 26, -1, 36), fill: WISP },
    { d: ribbon([[246, 474], [198, 440]], 22, 14), fill: DARK },
    { d: mast(482, 486, 140, 24), fill: DARK },
    { d: mast(342, 480, 226, 22), fill: DARK },
    { d: mast(744, 404, 222, 20), fill: DARK },
    { d: `M480 142L566 134L536 158L570 182L478 176Z`, fill: GLOW },
    sails[0], { d: yard(366, 600, 298), fill: DARK },
    sails[1], { d: yard(394, 570, 174), fill: DARK },
    sails[2], { d: yard(248, 432, 260), fill: DARK },
    sails[3], { d: yard(680, 806, 254), fill: DARK },
    {
      d: hull, fill: HULL, in: [
        // one hard shadow under the turn of the hull, pale rails along the top, lamp-light round the ports
        flat(`M180 566Q500 618 860 552L860 800L180 800Z`, HULL_SH),
        flat(`M200 440L684 462L690 396L840 380L840 432L718 444L714 516L200 500Z`, WISP),
        stroke(`M210 500L714 516L718 444L820 434`, { w: W_DETAIL }),
        ...[[530, 574], [612, 576], [694, 572]].map(([x, y]) => el('circle', { cx: x, cy: y, r: 40, fill: GLOW, opacity: 0.35 })),
        stroke(`M470 634Q610 650 770 610`, { w: W_DETAIL }),
      ],
    },
  ]);
  const fittings = [
    // lit portholes and the stern window
    ...[[530, 574], [612, 576], [694, 572]].map(([x, y]) => g({}, [inkCircle(x, y, 24, GLOW, { w: W_INNER }), el('circle', { cx: x - 8, cy: y - 8, r: 6, fill: '#fff' })])),
    ink(`M730 446Q752 424 774 444L776 484L732 488Z`, GLOW, { w: W_INNER }), stroke(`M753 438L754 486`, { w: W_DETAIL }),
    // the face on the bow: two big lamp eyes and a wobbly ghost mouth
    eye(322, 562, 38, { look: [-0.5, 0.25], white: GLOW }), eye(416, 566, 38, { look: [-0.5, 0.25], white: GLOW }),
    stroke(`M326 622q14 16 28 0q14 -16 28 0q14 16 28 0`, { w: W_INNER }),
    // sail creases
    stroke(`M400 330Q420 380 404 420M446 200Q460 230 450 256M290 300Q306 350 292 396`, { w: W_DETAIL }),
    // the stern lantern
    stroke(`M796 404L806 352`, { w: W_INNER }),
  ];
  const lamp = [inkCircle(808, 336, 21, GLOW, { w: W_INNER }), el('circle', { cx: 801, cy: 329, r: 6, fill: '#fff' })];
  s.add(2, g({ filter: s.wobble(5), transform: 'rotate(4 512 480)' }, [halo(808, 336, 110, GLOW, 3, 0.4), ship, ...fittings, ...lamp]));

  // ---- 3: wisps, bubbles and sparkles drifting in front
  s.add(3, g({ filter: s.wobble(4, 0.014, 7) }, [
    flame(150, 600, 1.1, -14, WISP), flame(900, 690, 0.9, 12, WISP), flame(420, 880, 0.7, -8, GLOW),
  ]));
  s.inkBubbles({ n: 4, x0: 110, x1: 220, y0: 640, y1: 880, rmin: 8, rmax: 22, fill: '#c9ffe6' });
  s.inkBubbles({ n: 4, x0: 600, x1: 920, y0: 700, y1: 900, rmin: 8, rmax: 22, fill: '#c9ffe6' });
  s.add(3, star4(230, 300, 30, '#ffffff'), star4(868, 330, 22, GLOW), star4(610, 760, 20, '#ffffff'), star4(250, 760, 18, GLOW), star4(648, 150, 16, '#ffffff'));
  s.specks({ n: 14, rmin: 3, rmax: 7, colors: ['#ffffff', GLOW, WISP], opacity: 0.9 });
}

/** Parts with ONE fat contour round the whole silhouette, like lib's sticker, but each part may carry hard shadow
 *  and highlight patches (`in`) clipped to its own shape before its inner line goes on. */
function figure(s, parts, outer = W_SUBJECT) {
  const back = parts.map((p) => ink(p.d, INK, { w: outer * 2 }));
  const front = parts.map((p) => [flat(p.d, p.fill), p.in ? g({ 'clip-path': s.clip(el('path', { d: p.d })) }, p.in) : '', stroke(p.d, { w: p.w ?? W_INNER })].join(''));
  return g({}, [...back, ...front]);
}

/** A scalloped hem, as path segments from x0 back to x1 along y. */
function scallop(x0, x1, y, n, depth) {
  let d = '';
  const step = (x1 - x0) / n;
  for (let i = 0; i < n; i++) { const a = x0 + step * i, b = a + step; d += `Q${(a + b) / 2} ${y + depth} ${b} ${y}`; }
  return d;
}

/** A spirit curl as a flat shape: a tail running `len` px from (x, y) along `ang`, rolling up into a spiral of
 *  radius R (turn = 1 clockwise, -1 the other way). */
function wisp(x, y, ang, len, R, turn = 1, w0 = 34) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const pts = [[x, y], [x + ca * len * 0.5 + sa * turn * len * 0.14, y + sa * len * 0.5 - ca * turn * len * 0.14]];
  const ex = x + ca * len, ey = y + sa * len, cx = ex - sa * turn * R, cy = ey + ca * turn * R;
  for (let i = 0; i <= 9; i++) {
    const t = i / 9, a = ang - turn * Math.PI / 2 + turn * t * Math.PI * 1.6, rr = R * (1 - t * 0.66);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return ribbon(pts, w0, 9, null, 8);
}

/** A small drifting spirit for the middle distance. */
function spirit(x, y, R, c, rot) {
  const d = `M${x - R} ${y + R * 1.1}C${x - R * 1.1} ${y - R * 1.3} ${x + R * 1.1} ${y - R * 1.3} ${x + R} ${y + R * 1.1}` + scallop(x + R, x - R, y + R * 1.1, 3, -R * 0.4) + 'Z';
  return g({ opacity: 0.85, transform: `rotate(${rot} ${x} ${y})` }, [ink(d, c, { w: W_MID }),
    el('circle', { cx: x - R * 0.34, cy: y - R * 0.1, r: R * 0.15, fill: INK }), el('circle', { cx: x + R * 0.34, cy: y - R * 0.1, r: R * 0.15, fill: INK }),
    el('circle', { cx: x - R * 0.5, cy: y - R * 0.55, r: R * 0.13, fill: '#fff' })]);
}

/** A sunken anchor drawn as a fat line: ink underneath, colour on top (middle distance weights). */
function anchor(x, y, k, rot) {
  const d = `M0 -88L0 40M-34 -52L34 -52M-58 0Q-52 46 0 46Q52 46 58 0M-58 0l-12 20M58 0l12 20`;
  const line = (c, w) => el('path', { d, fill: 'none', stroke: c, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  return g({ transform: `translate(${x} ${y}) rotate(${rot}) scale(${k})`, opacity: 0.9 }, [line(INK, 24), el('circle', { cx: 0, cy: -104, r: 16, fill: 'none', stroke: INK, 'stroke-width': 22 }),
    line('#2f7f7c', 12), el('circle', { cx: 0, cy: -104, r: 16, fill: 'none', stroke: '#2f7f7c', 'stroke-width': 10 })]);
}

/** A little will-o'-the-wisp flame for the foreground: a teardrop with a curled tip. */
function flame(x, y, k, rot, c) {
  return g({ transform: `translate(${x} ${y}) rotate(${rot}) scale(${k})` }, [
    ink(`M0 30C-34 30 -40 -8 -18 -34C-8 -46 -2 -56 -6 -74C22 -60 40 -30 34 0C30 18 16 30 0 30Z`, c, { w: W_INNER }),
    flat(`M-4 18C-20 16 -22 -4 -10 -18C-10 -2 -2 8 8 12Z`, '#ffffff', { opacity: 0.9 }),
  ]);
}
