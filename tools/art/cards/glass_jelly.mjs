// GLASS JELLY (rare) — a jellyfish of living glass. The style exemplar: fat ink line, flat colour, one hard shadow,
// drawn light. Read the DOODLE KIT rules at the bottom of lib.mjs before drawing another scene.
import { el, g, spline, ribbon, ink, stroke, flat, inkCircle, inkEllipse, sticker, eye, star4, halo, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

// The finished outer line is 16 (the set's contour): a bare `ink` line at 16, a `sticker` at 12 plus half its inner line.
const W_OUT = 16, W_STICK = 12;

export function build(s) {
  const r = s.r;

  // ---- 0: the deep, in flat bands (no ink in the far backdrop)
  s.bands([[0, '#1d4f8c'], [330, '#173d78'], [600, '#122c5e'], [830, '#0d1f47']], { amp: 18, waves: 3 });
  s.shafts({ x: 430, y: -140, angle: 80, spread: 40, n: 4, color: '#8fe3ff', opacity: 0.12, width: 110 });
  s.specks({ n: 40, rmin: 2, rmax: 5, colors: ['#8fd0ff', '#b9a6ff'], opacity: 0.5, layer: 0 });
  s.lumps({ y: 900, amp: 90, n: 7, fill: '#0b1838', layer: 0 });
  s.paper();

  // ---- 1: reef and two little jellies, thinner line, quieter colour
  s.weed({ x: 110, h: 430, fill: '#1c6f73', sway: 34, width: 56 });
  s.weed({ x: 190, h: 300, fill: '#17595f', sway: 26, width: 46 });
  s.weed({ x: 905, h: 480, fill: '#1c6f73', sway: 34, lean: -0.06, width: 56 });
  s.weed({ x: 830, h: 300, fill: '#17595f', sway: 24, width: 46 });
  s.add(1, mini(170, 250, 44, '#7fb2ff'), mini(880, 180, 34, '#c59bff'));
  s.lumps({ y: 965, amp: 60, n: 6, fill: '#1a2a5c', layer: 1, w: W_MID });

  // ---- 2: the jelly
  const cx = 512, cy = 354, R = 210; // high enough that the longest tentacle ends clear of the name plate (y 800)
  const body = [];
  // tentacles: fat ribbons, behind the bell
  const tent = [];
  for (let i = 0; i < 5; i++) {
    const x0 = cx - 150 + i * 75, sw = (i - 2) * 22 + r.range(-14, 14), len = [300, 380, 430, 370, 310][i];
    const pts = [[x0, cy + 30], [x0 + sw * 0.4 + 26, cy + len * 0.34], [x0 + sw * 0.8 - 30, cy + len * 0.68], [x0 + sw * 1.2 + 16, cy + len]];
    tent.push({ d: ribbon(pts, 46, 18, (t) => 1 - t * 0.2), fill: i % 2 ? '#c9a2ff' : '#ff9fdc' });
  }
  body.push(sticker(tent, { outer: W_STICK, inner: W_INNER }));
  // the bell
  const bell = `M${cx - R} ${cy + 36}C${cx - R * 1.04} ${cy - R * 0.98} ${cx - R * 0.5} ${cy - R * 1.14} ${cx} ${cy - R * 1.14}C${cx + R * 0.5} ${cy - R * 1.14} ${cx + R * 1.04} ${cy - R * 0.98} ${cx + R} ${cy + 36}`
    + scallop(cx + R, cx - R, cy + 36, 6, 34) + 'Z';
  body.push(ink(bell, '#8fe6f5', { w: W_OUT }));
  const clip = s.clip(el('path', { d: bell }));
  body.push(g({ 'clip-path': clip }, [
    // one hard shadow tone on the right and under the lip
    flat(`M${cx + 40} ${cy - R * 1.3}C${cx + 190} ${cy - 150} ${cx + 150} ${cy + 20} ${cx + 60} ${cy + 110}L${cx + R + 60} ${cy + 110}L${cx + R + 60} ${cy - R * 1.3}Z`, '#5fb8e6'),
    flat(`M${cx - R - 20} ${cy - 18}Q${cx} ${cy + 34} ${cx + R + 20} ${cy - 18}L${cx + R + 20} ${cy + 120}L${cx - R - 20} ${cy + 120}Z`, '#b79df2'),
    // the four rings inside, drawn as a clover
    ...[0, 1, 2, 3].map((i) => { const a = i * Math.PI / 2 + 0.78; return inkEllipse(cx + Math.cos(a) * 44, cy - 150 + Math.sin(a) * 30, 40, 27, '#ffd1ef', { w: W_DETAIL + 1 }); }),
    // hard highlights
    flat(`M${cx - 168} ${cy - 60}C${cx - 172} ${cy - 150} ${cx - 120} ${cy - 205} ${cx - 62} ${cy - 216}C${cx - 110} ${cy - 180} ${cx - 140} ${cy - 130} ${cx - 138} ${cy - 62}Z`, '#ffffff', { opacity: 0.9 }),
    el('circle', { cx: cx - 150, cy: cy - 22, r: 13, fill: '#fff', opacity: 0.9 }),
  ]));
  body.push(stroke(bell, { w: W_OUT }));
  // the face: big, simple, a little worried
  body.push(eye(cx - 74, cy - 42, 37, { look: [0.35, 0.3] }), eye(cx + 74, cy - 42, 37, { look: [0.35, 0.3] }));
  body.push(stroke(`M${cx - 26} ${cy + 2}q26 22 52 0`, { w: W_INNER }));
  body.push(inkEllipse(cx - 132, cy - 2, 20, 12, '#ff9fdc', { w: 0, stroke: 'none', opacity: 0.85 }), inkEllipse(cx + 132, cy - 2, 20, 12, '#ff9fdc', { w: 0, stroke: 'none', opacity: 0.85 }));
  s.add(2, g({ filter: s.wobble(5) }, body));

  // ---- 3: what drifts in front
  s.inkBubbles({ n: 9, y0: 260, rmin: 9, rmax: 26 });
  s.add(3, star4(300, 204, 36), star4(742, 254, 24, '#ffe9a8'), star4(700, 654, 20), star4(250, 594, 22, '#ffd1ef'));
  s.specks({ n: 14, rmin: 3, rmax: 7, colors: ['#ffffff', '#ffd1ef', '#b9f3ff'], opacity: 0.9 });
}

/** The scalloped lower lip of the bell, as path segments from x0 back to x1 along y. */
function scallop(x0, x1, y, n, depth) {
  let d = '';
  const step = (x1 - x0) / n;
  for (let i = 0; i < n; i++) { const a = x0 + step * i, b = a + step; d += `Q${(a + b) / 2} ${y + depth} ${b} ${y}`; }
  return d;
}

function mini(x, y, R, c) {
  const legs = [-0.5, 0, 0.5].map((k) => ink(ribbon([[x + k * R, y], [x + k * R + 8, y + R * 0.8], [x + k * R - 6, y + R * 1.6]], 12, 6), c, { w: W_MID - 1 }));
  return g({ opacity: 0.85 }, [...legs, ink(`M${x - R} ${y}C${x - R} ${y - R * 1.3} ${x + R} ${y - R * 1.3} ${x + R} ${y}Z`, c, { w: W_MID }),
    el('circle', { cx: x - R * 0.35, cy: y - R * 0.45, r: R * 0.14, fill: '#fff' })]);
}
