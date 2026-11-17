// LANTERN FRY (common) — a small round deep-sea fish, cute but fierce, carrying its own lamp through the dark weed.
import { el, g, spline, ribbon, ink, stroke, flat, inkCircle, inkEllipse, sticker, eye, star4, halo, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const TEAL = '#35a9a4', TEAL_D = '#22808a', AMBER = '#ff9f3a', AMBER_D = '#e5741f', GOLD = '#ffd24a', CREAM = '#fff6dc';
const LX = 296, LY = 236; // the lantern

export function build(s) {
  const r = s.r;

  // ---- 0: teal-black water in flat bands, far weed with no ink
  s.bands([[0, '#15525c'], [300, '#10414d'], [570, '#0c313e'], [820, '#09242f']], { amp: 18, waves: 3 });
  s.shafts({ x: 660, y: -140, angle: 100, spread: 36, n: 3, color: '#7fe0d8', opacity: 0.07, width: 110 });
  for (const [x, h, wd] of [[60, 640, 70], [250, 420, 54], [420, 300, 46], [640, 360, 50], [790, 520, 60], [960, 700, 74]]) {
    s.weed({ x, h, width: wd, fill: '#0b2c38', layer: 0, w: 0, sway: 30 });
  }
  s.specks({ n: 36, rmin: 2, rmax: 5, colors: ['#6fd0c8', '#ffcf7a'], opacity: 0.45, layer: 0 });
  s.lumps({ y: 905, amp: 80, n: 7, fill: '#071b25', layer: 0 });
  s.paper();

  // ---- 1: dark weed, thinner line, quiet colour
  s.weed({ x: 120, h: 560, fill: '#1a6a66', sway: 36, width: 62 });
  s.weed({ x: 205, h: 330, fill: '#14524f', sway: 26, width: 48 });
  s.weed({ x: 900, h: 600, fill: '#1a6a66', sway: 36, lean: -0.05, width: 62 });
  s.weed({ x: 815, h: 350, fill: '#14524f', sway: 24, width: 48 });
  s.weed({ x: 690, h: 210, fill: '#14524f', sway: 18, width: 40 });
  s.lumps({ y: 965, amp: 60, n: 6, fill: '#0f3a48', layer: 1, w: W_MID });

  // ---- 2: the fry, face on, with its lamp
  s.add(2, halo(LX, LY, 205, '#ffc45a', 3, 0.6));
  const cx = 520, cy = 492;
  const fish = [];

  // fins and tail, behind the body
  const finL = `M${cx - 185} ${cy + 5}C${cx - 250} ${cy - 30} ${cx - 310} ${cy - 15} ${cx - 326} ${cy + 28}C${cx - 296} ${cy + 36} ${cx - 286} ${cy + 54} ${cx - 304} ${cy + 88}C${cx - 255} ${cy + 100} ${cx - 205} ${cy + 80} ${cx - 175} ${cy + 55}Z`;
  const finR = `M${cx + 185} ${cy + 5}C${cx + 245} ${cy - 30} ${cx + 296} ${cy - 15} ${cx + 310} ${cy + 28}C${cx + 284} ${cy + 36} ${cx + 276} ${cy + 54} ${cx + 292} ${cy + 88}C${cx + 248} ${cy + 100} ${cx + 205} ${cy + 80} ${cx + 175} ${cy + 55}Z`;
  const tail = `M${cx + 120} ${cy - 120}C${cx + 170} ${cy - 190} ${cx + 250} ${cy - 226} ${cx + 300} ${cy - 206}C${cx + 268} ${cy - 176} ${cx + 268} ${cy - 150} ${cx + 306} ${cy - 118}C${cx + 262} ${cy - 92} ${cx + 200} ${cy - 76} ${cx + 150} ${cy - 70}Z`;
  const crest = `M${cx + 10} ${cy - 170}L${cx + 36} ${cy - 262}L${cx + 76} ${cy - 205}L${cx + 112} ${cy - 250}L${cx + 140} ${cy - 150}Z`;
  fish.push(sticker([{ d: tail, fill: AMBER }, { d: crest, fill: AMBER }, { d: finL, fill: AMBER }, { d: finR, fill: AMBER }]));
  fish.push(stroke(`M${cx - 300} ${cy + 32}L${cx - 232} ${cy + 36}M${cx - 282} ${cy + 76}L${cx - 226} ${cy + 58}M${cx + 286} ${cy + 32}L${cx + 226} ${cy + 36}M${cx + 270} ${cy + 76}L${cx + 222} ${cy + 58}M${cx + 276} ${cy - 150}L${cx + 196} ${cy - 124}`, { w: W_DETAIL }));

  // the stalk of the lure, off the brow
  const stalk = [[cx - 46, cy - 178], [cx - 62, cy - 276], [cx - 124, cy - 326], [cx - 196, cy - 316], [LX + 6, LY - 30]];
  fish.push(sticker([{ d: ribbon(stalk, 28, 16), fill: TEAL_D }]));

  // the body: a dumpling
  const body = spline([[cx, cy - 196], [cx + 122, cy - 170], [cx + 196, cy - 80], [cx + 206, cy + 30], [cx + 160, cy + 140], [cx + 52, cy + 200], [cx - 62, cy + 198], [cx - 166, cy + 138], [cx - 208, cy + 30], [cx - 194, cy - 86], [cx - 118, cy - 172]], true);
  fish.push(ink(body, TEAL, { w: W_SUBJECT }));
  fish.push(g({ 'clip-path': s.clip(el('path', { d: body })) }, [
    // one hard shadow, away from the lamp
    flat(`M${cx + 70} ${cy - 260}C${cx + 190} ${cy - 110} ${cx + 150} ${cy + 80} ${cx - 10} ${cy + 150}C${cx - 90} ${cy + 180} ${cx - 170} ${cy + 150} ${cx - 240} ${cy + 90}L${cx - 240} ${cy + 260}L${cx + 280} ${cy + 260}L${cx + 280} ${cy - 260}Z`, TEAL_D),
    // freckles
    el('circle', { cx: cx + 96, cy: cy - 118, r: 13, fill: '#1a6873' }), el('circle', { cx: cx + 138, cy: cy - 78, r: 9, fill: '#1a6873' }), el('circle', { cx: cx + 62, cy: cy - 150, r: 8, fill: '#1a6873' }),
    // lamplight: hard highlights on the side facing the lure
    flat(`M${cx - 176} ${cy - 30}C${cx - 174} ${cy - 106} ${cx - 132} ${cy - 150} ${cx - 82} ${cy - 164}C${cx - 122} ${cy - 132} ${cx - 146} ${cy - 92} ${cx - 148} ${cy - 30}Z`, '#ffe9b0'),
    el('circle', { cx: cx - 160, cy: cy + 8, r: 12, fill: '#ffe9b0' }),
  ]));
  fish.push(stroke(body, { w: W_SUBJECT }));

  // the face: big scowling eyes, an underbite full of little fangs
  for (const sd of [-1, 1]) {
    const ex = cx + sd * 84, ey = cy - 22, er = 55;
    fish.push(eye(ex, ey, er, { look: [-0.45, -0.25], lid: 0.3, lidRot: -sd * 17, lidFill: TEAL_D }));
    fish.push(stroke(lidLine(ex, ey, er, 0.3, -sd * 17, 14), { w: W_INNER + 4 }));
  }
  const my = cy + 112, mouth = `M${cx - 132} ${my + 8}Q${cx} ${my - 50} ${cx + 132} ${my + 8}`;
  const mouthY = (x) => { const t = (x - (cx - 132)) / 264; return (1 - t) * (1 - t) * (my + 8) + 2 * t * (1 - t) * (my - 50) + t * t * (my + 8); };
  for (const [dx, h, wd] of [[-88, 52, 21], [-32, 30, 16], [26, 30, 16], [84, 52, 21]]) {
    const x = cx + dx, y = mouthY(x) + 3;
    fish.push(ink(`M${x - wd} ${y}L${x + (dx < 0 ? 3 : -3)} ${y - h}L${x + wd} ${y}Z`, CREAM, { w: W_DETAIL + 1 }));
  }
  fish.push(stroke(mouth, { w: W_INNER + 2 }));
  fish.push(stroke(`M${cx - 146} ${my - 8}q-6 18 6 32M${cx + 146} ${my - 8}q6 18 -6 32`, { w: W_DETAIL + 1 }));
  fish.push(inkEllipse(cx - 158, cy + 56, 22, 13, '#ff8f6a', { w: 0, stroke: 'none', opacity: 0.85 }), inkEllipse(cx + 158, cy + 56, 22, 13, '#ff8f6a', { w: 0, stroke: 'none', opacity: 0.85 }));

  // the lamp itself
  fish.push(inkCircle(LX, LY, 50, GOLD, { w: W_SUBJECT }));
  fish.push(el('path', { d: `M${LX - 50} ${LY}A50 50 0 0 0 ${LX + 50} ${LY}A62 44 0 0 1 ${LX - 50} ${LY}Z`, fill: AMBER }));
  fish.push(el('circle', { cx: LX, cy: LY - 6, r: 24, fill: '#fff6c0' }));
  fish.push(el('circle', { cx: LX - 22, cy: LY - 24, r: 9, fill: '#fff' }));
  fish.push(inkCircle(LX, LY, 50, 'none', { w: W_SUBJECT }));
  s.add(2, g({ filter: s.wobble(5) }, fish));

  // ---- 3: near weed at the edges, sparks off the lamp, bubbles
  s.weed({ x: -6, y: 1090, h: 640, fill: '#0b3038', sway: 40, lean: 0.07, width: 120, layer: 3, w: W_INNER });
  s.weed({ x: 1030, y: 1090, h: 560, fill: '#0b3038', sway: 40, lean: -0.08, width: 120, layer: 3, w: W_INNER });
  for (const [x, y, rr] of [[850, 548, 22], [884, 470, 12], [806, 720, 16], [612, 742, 14], [226, 640, 15], [262, 584, 9], [180, 740, 11], [700, 196, 10]]) {
    s.add(3, inkCircle(x, y, rr, '#bfefff', { w: W_DETAIL, 'fill-opacity': 0.35 }), el('circle', { cx: x - rr * 0.34, cy: y - rr * 0.36, r: rr * 0.22, fill: '#fff' }));
  }
  s.add(3, star4(LX + 126, LY + 16, 24, '#ffe9a8'), star4(LX - 92, LY + 40, 20, '#fff'), star4(LX - 48, LY - 104, 16, '#ffe9a8'), star4(770, 690, 20, '#ffe9a8'));
  s.specks({ n: 16, rmin: 3, rmax: 7, colors: ['#ffd98a', '#fff3cf', '#8fe6d6'], opacity: 0.9 });
}

/** The lower edge of an `eye` lid as a line (to ink it as a brow); `over` pokes it past the eyeball. */
function lidLine(x, y, r, lid, rot, over = 0) {
  const d = r * (2 * lid - 1), half = Math.sqrt(Math.max(0, r * r - d * d)) + over, a = rot * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
  const p = (px, py) => `${(x + px * c - py * sn).toFixed(1)} ${(y + px * sn + py * c).toFixed(1)}`;
  return `M${p(-half, d)}L${p(half, d)}`;
}
