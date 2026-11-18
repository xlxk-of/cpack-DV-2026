// ABYSSAL ANGLER (rare) — a big round menace of an anglerfish with a huge underbite, its own lure lighting its face,
// and two very small fish who have just noticed. Doodle style: see the DOODLE KIT in lib.mjs.
import { el, g, spline, ribbon, ink, stroke, flat, inkCircle, eye, star4, halo, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const RED = '#a52a48', RED_SH = '#6b1838', FIN = '#d8475f', MAW = '#5a1238', TOOTH = '#fff2d2', CYAN = '#6ff3ff';

export function build(s) {
  // ---- 0: the abyss, in flat bands (no ink)
  s.bands([[0, '#252c6b'], [300, '#1e2259'], [580, '#181a48'], [820, '#111336']], { amp: 18, waves: 3 });
  s.shafts({ x: 600, y: -140, angle: 98, spread: 36, n: 3, color: '#8fb4ff', opacity: 0.06, width: 110 });
  s.add(0, flat(spire(70, 1100, 150, 560), '#14163f'), flat(spire(930, 1100, 190, 640), '#14163f'), flat(spire(770, 1100, 110, 330), '#14163f'));
  s.specks({ n: 40, rmin: 2, rmax: 5, colors: ['#7f9bff', '#6ff3ff', '#b9a6ff'], opacity: 0.45, layer: 0 });
  s.lumps({ y: 905, amp: 80, n: 7, fill: '#0d0f2c', layer: 0 });
  s.paper();

  // ---- 1: rock teeth and weed in the middle distance, thinner line, quiet colour
  s.add(1, ink(spire(120, 1100, 120, 420), '#2b2a6e', { w: W_MID }), ink(spire(915, 1100, 140, 470), '#2b2a6e', { w: W_MID }));
  s.add(1, flat(`M92 900C84 800 96 740 118 706C104 780 110 840 122 900Z`, '#3d3c8c'), flat(`M880 880C872 780 884 700 910 662C896 750 900 820 912 880Z`, '#3d3c8c'));
  s.weed({ x: 215, h: 250, fill: '#274a7c', sway: 22, width: 40 });
  s.weed({ x: 810, h: 300, fill: '#274a7c', sway: 26, width: 44, lean: -0.05 });
  s.weed({ x: 740, h: 190, fill: '#1f3c6a', sway: 18, width: 36 });
  s.lumps({ y: 960, amp: 60, n: 6, fill: '#1f1d55', layer: 1, w: W_MID });

  // ---- 2: the angler (drawn facing left, then nudged into the frame)
  const LX = 250, LY = 248, DX = -34; // the lure; DX slides the whole fish left, clear of the frame crop
  const U = [304, 384], K = [552, 548], J = [226, 522]; // upper lip tip, mouth corner, jaw tip
  const UC = [410, 506], LC = [392, 580]; // lip curve controls
  const q = (a, c, b, t) => [(1 - t) * (1 - t) * a[0] + 2 * t * (1 - t) * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * t * (1 - t) * c[1] + t * t * b[1]];
  const body = `M${U}C300 290 400 205 540 205C680 205 790 310 790 450C790 580 690 682 540 686C430 692 300 660 246 588C226 562 218 540 ${J}Q${LC} ${K}Q${UC} ${U}Z`;
  const maw = `M${U}Q${UC} ${K}Q${LC} ${J}Z`;
  const tooth = (p, len, wd, dir) => {
    const tip = [p[0] + dir[0] * len, p[1] + dir[1] * len], b = [-dir[0] * 12, -dir[1] * 12];
    return `M${p[0] - wd / 2 + b[0]} ${p[1] + b[1]}Q${tip[0] - wd * 0.2} ${(p[1] + tip[1]) / 2} ${tip[0]} ${tip[1]}Q${tip[0] + wd * 0.2} ${(p[1] + tip[1]) / 2} ${p[0] + wd / 2 + b[0]} ${p[1] + b[1]}Z`;
  };
  const upper = [[0.1, 64], [0.34, 54], [0.57, 38]].map(([t, len]) => ({ d: tooth(q(U, UC, K, t), len, 56, [-0.12, 1]), fill: TOOTH }));
  const lower = [[0.08, 118], [0.3, 86], [0.5, 62], [0.69, 40]].map(([t, len], i) => ({ d: tooth(q(J, LC, K, t), len, i ? 56 : 62, [0.04, -1]), fill: TOOTH }));
  const stalk = ribbon([[468, 222], [448, 160], [352, 130], [268, 164], [LX + 2, LY - 30]], 28, 20); // the crest stays clear of the card window's top (y 96)
  const tail = `M765 440C798 420 824 376 836 334C848 386 842 426 824 455C842 486 850 528 836 580C820 544 798 492 765 472Z`;
  const dorsal = [`M508 222Q520 160 552 140Q578 180 600 226Z`, `M610 236Q632 186 664 172Q682 214 700 268Z`, `M706 280Q734 250 762 248Q768 290 772 340Z`];
  const pect = `M588 498C640 470 704 506 700 588C652 580 606 556 588 498Z`;

  const shade = [
    // one hard shadow tone: the back and the belly, away from the lure
    flat(`M520 150C700 280 720 470 470 600C420 640 330 640 250 600L250 760L900 760L900 150Z`, RED_SH),
    el('circle', { cx: 640, cy: 330, r: 22, fill: RED }), el('circle', { cx: 700, cy: 400, r: 15, fill: RED }), el('circle', { cx: 690, cy: 300, r: 11, fill: RED }),
    // the lure's light: one thin hard wedge on the forehead, on the side facing the lure
    flat(`M300 362C300 280 380 214 456 204Q386 264 308 356Z`, CYAN, { opacity: 0.9 }),
  ];
  const fish = figure(s, [
    { d: tail, fill: FIN, in: [flat(`M800 455L900 330L900 600Z`, '#b23350'), stroke(`M796 455L828 388M796 458L830 524`, { w: W_DETAIL })] },
    ...dorsal.map((d) => ({ d, fill: FIN })),
    { d: stalk, fill: RED_SH },
    { d: maw, fill: MAW },
    ...upper, ...lower,
    { d: body, fill: RED, in: shade },
    { d: pect, fill: FIN, in: [flat(`M640 470L720 500L710 600Z`, '#b23350'), stroke(`M604 510Q650 520 684 566M612 500Q662 498 694 536`, { w: W_DETAIL })] },
    { d: circ(LX, LY, 36), fill: CYAN, in: [el('circle', { cx: LX + 14, cy: LY + 16, r: 36, fill: '#35c6e6' }), el('circle', { cx: LX - 4, cy: LY - 4, r: 25, fill: CYAN }), el('circle', { cx: LX - 12, cy: LY - 13, r: 9, fill: '#fff' })] },
  ]);
  const face = [
    // gill crease, cheek and a mean little eye under a heavy brow
    stroke(`M584 380Q626 450 590 520`, { w: W_INNER }),
    stroke(`M548 536Q576 548 580 578`, { w: W_INNER }),
    eye(432, 340, 48, { look: [-0.7, 0.45], lid: 0.42, lidRot: -22, lidFill: RED_SH, white: '#fff', pupil: 0.44 }),
    stroke(`M364 320L492 266`, { w: W_SUBJECT }),
  ];
  s.add(2, halo(LX + DX, LY, 208, CYAN, 3, 0.42));
  s.add(2, g({ filter: s.wobble(5), transform: `translate(${DX} 0)` }, [fish, ...face]));

  // ---- 3: two tiny fish who have just noticed, bubbles, sparkles
  s.add(3, g({ filter: s.wobble(4, 0.014, 5) }, [fry(184, 702, 44, '#ffd76a', -8), fry(318, 770, 36, '#8fe3a8', 10)]));
  s.add(3, star4(LX + DX, LY, 20, '#ffffff', 0), star4(300, 204, 26, '#ffffff'), star4(160, 330, 20, CYAN), star4(118, 196, 14, '#ffffff'));
  s.inkBubbles({ n: 5, x0: 800, x1: 920, y0: 140, y1: 860, rmin: 8, rmax: 24 });
  s.add(3, ...[[168, 470, 13], [142, 430, 8], [130, 780, 16], [236, 880, 10], [440, 800, 12]].map(([x, y, rr]) => g({}, [inkCircle(x, y, rr, '#bfefff', { w: W_DETAIL, 'fill-opacity': 0.35 }), el('circle', { cx: x - rr * 0.34, cy: y - rr * 0.36, r: rr * 0.22, fill: '#fff' })])));
  s.specks({ n: 14, rmin: 3, rmax: 6, colors: ['#ffffff', CYAN, '#ffb3c4'], opacity: 0.85 });
}

/** Parts with ONE fat contour round the whole silhouette, like lib's sticker, but each part may carry hard shadow
 *  and highlight patches (`in`) clipped to its own shape before its inner line goes on. */
function figure(s, parts, outer = W_SUBJECT) {
  const back = parts.map((p) => ink(p.d, INK, { w: outer * 2 }));
  const front = parts.map((p) => [flat(p.d, p.fill), p.in ? g({ 'clip-path': s.clip(el('path', { d: p.d })) }, p.in) : '', stroke(p.d, { w: p.w ?? W_INNER })].join(''));
  return g({}, [...back, ...front]);
}

const circ = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;

/** A round-topped rock tooth standing on the sea floor: base centre x, base y, width, height. */
function spire(x, y, w, h) {
  return `M${x - w / 2} ${y}C${x - w * 0.46} ${y - h * 0.6} ${x - w * 0.3} ${y - h} ${x} ${y - h}C${x + w * 0.34} ${y - h} ${x + w * 0.42} ${y - h * 0.55} ${x + w / 2} ${y}Z`;
}

/** A tiny scared fish fleeing left and looking back over its shoulder. */
function fry(x, y, R, c, rot) {
  const body = `M${x - R} ${y}C${x - R} ${y - R * 0.9} ${x + R * 0.7} ${y - R * 0.8} ${x + R} ${y}C${x + R * 0.7} ${y + R * 0.8} ${x - R} ${y + R * 0.9} ${x - R} ${y}Z`;
  const tail = `M${x + R * 0.8} ${y}L${x + R * 1.55} ${y - R * 0.6}L${x + R * 1.4} ${y}L${x + R * 1.55} ${y + R * 0.6}Z`;
  const w = W_DETAIL + 1;
  return g({ transform: `rotate(${rot} ${x} ${y})` }, [
    ink(tail, INK, { w: w * 2 + 6 }), ink(body, INK, { w: w * 2 + 6 }),
    ink(tail, c, { w }), ink(body, c, { w }),
    eye(x - R * 0.28, y - R * 0.12, R * 0.46, { look: [0.8, -0.5], w, pupil: 0.42 }),
    inkCircle(x - R * 0.72, y + R * 0.36, R * 0.13, MAW, { w: 3 }),
    // a bead of sweat
    ink(`M${x + R * 0.2} ${y - R * 1.5}q${R * 0.2} ${R * 0.3} 0 ${R * 0.42}q${-R * 0.2} ${-R * 0.12} 0 ${-R * 0.42}Z`, '#bfefff', { w: 3 }),
  ]);
}
