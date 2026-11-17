// PEARL DIVER (common) — a stubby diver in a round brass helmet reaches for the big pearl in an open clam.
// Doodle style: fat ink line, flat colour, one hard shadow, drawn light. See the DOODLE KIT in lib.mjs.
import { el, g, ribbon, ink, stroke, flat, inkCircle, eye, star4, halo, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const circ = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const rr = (x, y, w, h, q) => `M${x + q} ${y}h${w - 2 * q}q${q} 0 ${q} ${q}v${h - 2 * q}q0 ${q} ${-q} ${q}h${-(w - 2 * q)}q${-q} 0 ${-q} ${-q}v${-(h - 2 * q)}q0 ${-q} ${q} ${-q}Z`;

const GOLD = '#f7c243', GOLD_D = '#d18a2c', GOLD_L = '#ffe693';
const SUIT = '#f3e2bd', SUIT_D = '#cfb088';
const BOOT = '#8a5a4a', BOOT_D = '#6a4040';
const GLASS = '#21407f';
const SHELL = '#c9a2ff', SHELL_D = '#a57fe8', NACRE = '#ffd1ef', NACRE_D = '#f3a5dc';

export function build(s) {
  // one form: flat fill, hard patches clipped inside it, the ink line on top
  const form = (d, fill, inside = [], w = W_INNER) => g({}, [flat(d, fill), inside.length ? g({ 'clip-path': s.clip(el('path', { d })) }, inside) : '', stroke(d, { w })]);
  // the fat contour stamped under a set of forms
  const contour = (ds, w = W_SUBJECT) => g({}, ds.map((d) => el('path', { d, fill: INK, stroke: INK, 'stroke-width': w * 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' })));

  // ---- 0: deep water in flat bands, one hard beam falling on the clam
  s.bands([[0, '#1f5a9a'], [300, '#18468a'], [560, '#12326c'], [800, '#0d2250']], { amp: 18, waves: 3 });
  s.shafts({ x: 790, y: -160, angle: 98, spread: 24, n: 3, color: '#8fe3ff', opacity: 0.13, width: 120 });
  s.specks({ n: 40, rmin: 2, rmax: 5, colors: ['#8fd0ff', '#b9a6ff'], opacity: 0.5, layer: 0 });
  s.lumps({ y: 770, amp: 130, n: 6, fill: '#0b1a44', layer: 0 });
  s.paper();

  // ---- 1: weed and the seabed the diver stands on
  s.weed({ x: 96, y: 900, h: 400, fill: '#1c6f73', sway: 32, width: 54 });
  s.weed({ x: 176, y: 900, h: 250, fill: '#17595f', sway: 24, width: 44 });
  s.weed({ x: 940, y: 900, h: 330, fill: '#17595f', sway: 28, lean: -0.05, width: 48 });
  s.lumps({ y: 800, amp: 30, n: 5, fill: '#1c2f6a', layer: 1, w: W_MID });
  s.add(1, ink('M120 838q30 -34 66 -4q32 -16 44 14z', '#27407f', { w: W_MID }), ink('M840 850q24 -30 56 -6q20 -8 28 12z', '#27407f', { w: W_MID }));

  // ---- 2: the clam, then the diver in front of it
  const body = [];
  // the clam
  const HX = 698, HY = 706, FR = 170;
  const fanPts = [];
  for (let i = 0; i <= 5; i++) { const a = (-152 + i * 24.8) * Math.PI / 180; fanPts.push([HX + Math.cos(a) * FR, HY + Math.sin(a) * FR]); }
  let lid = `M${HX - 60} ${HY}L${fanPts[0][0]} ${fanPts[0][1]}`;
  for (let i = 1; i < fanPts.length; i++) {
    const a = fanPts[i - 1], b = fanPts[i], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, k = 1.16;
    lid += `Q${HX + (mx - HX) * k} ${HY + (my - HY) * k} ${b[0]} ${b[1]}`;
  }
  lid += `L${HX + 60} ${HY}Z`;
  const bowl = `M556 692q36 -22 71 0q36 -22 71 0q36 -22 71 0q36 -22 71 0C846 760 780 806 698 806C616 806 550 760 556 692Z`;
  const PX = 698, PY = 624, PR = 56;
  const pearl = circ(PX, PY, PR);
  body.push(halo(PX, PY - 20, 250, '#bfefff', 3, 0.3));
  body.push(contour([lid, bowl, pearl]));
  body.push(form(lid, NACRE, [
    flat(`M${HX - 220} ${HY - 60}L${HX + 220} ${HY - 60}L${HX + 220} ${HY + 20}L${HX - 220} ${HY + 20}Z`, NACRE_D),
    ...fanPts.slice(1, -1).map((p) => stroke(`M${HX + (p[0] - HX) * 0.3} ${HY + (p[1] - HY) * 0.3}L${HX + (p[0] - HX) * 0.86} ${HY + (p[1] - HY) * 0.86}`, { w: W_DETAIL })),
  ]));
  body.push(g({ 'clip-path': s.clip(el('path', { d: lid })) }, halo(PX, PY, 112, '#fffbe0', 2, 0.7)));
  body.push(form(pearl, '#e6d2f7', [
    flat(circ(PX + 12, PY - 12, PR), '#fff8ec'),
    flat(circ(PX + 20, PY - 22, 15), '#ffffff'),
    el('circle', { cx: PX - 4, cy: PY - 34, r: 6, fill: '#fff' }),
  ]));
  body.push(form(bowl, SHELL, [
    flat('M530 760Q698 800 866 760L866 830L530 830Z', SHELL_D),
    ...[-2, -1, 0, 1, 2].map((k) => stroke(`M${698 + k * 36} 714Q${698 + k * 30} 760 ${698 + k * 20} 790`, { w: W_DETAIL })),
    flat('M580 706q10 -12 26 -8q-14 8 -16 24z', '#ffffff', { opacity: 0.85 }),
  ]));

  // the diver
  const CX = 430, CY = 338, R = 150;        // the helmet
  const hose = ribbon([[346, 222], [292, 120], [352, 10], [296, -160]], 34, 34);
  const nub = circ(344, 226, 30);
  const armB = ribbon([[346, 548], [292, 588], [262, 640]], 64, 56);
  const gloveB = circ(256, 652, 37);
  const legL = rr(346, 630, 82, 116, 26), legR = rr(438, 630, 82, 116, 26);
  const bootL = 'M318 792q-8 -58 50 -62h44q24 4 22 34v28z', bootR = 'M432 792v-28q-2 -30 22 -34h44q58 4 50 62z';
  const torso = rr(332, 486, 202, 196, 72);
  const collar = 'M336 470L528 470Q566 500 548 536L316 536Q298 500 336 470Z';
  const helmet = circ(CX, CY, R);
  const armF = ribbon([[490, 520], [552, 566], [604, 592]], 66, 56);
  const gloveF = circ(608, 596, 37), thumb = circ(596, 560, 16);
  body.push(contour([hose, nub, armB, gloveB, legL, legR, bootL, bootR, torso, collar, helmet, armF, gloveF, thumb]));
  body.push(form(hose, SUIT, [flat(ribbon([[336, 222], [282, 120], [342, 10], [286, -160]], 14, 14), SUIT_D)]));
  body.push(form(nub, GOLD_D));
  body.push(form(armB, SUIT_D), form(gloveB, BOOT_D));
  body.push(form(legL, SUIT, [flat(rr(336, 620, 34, 140, 10), SUIT_D)]), form(legR, SUIT, [flat(rr(428, 620, 30, 140, 10), SUIT_D)]));
  body.push(form(bootL, BOOT, [flat('M300 770h160v40h-160z', BOOT_D), el('circle', { cx: 352, cy: 750, r: 7, fill: '#fff', opacity: 0.8 })]));
  body.push(form(bootR, BOOT, [flat('M420 770h160v40h-160z', BOOT_D)]));
  body.push(form(torso, SUIT, [
    flat('M320 480h64q-20 100 14 210h-78z', SUIT_D),
    flat('M320 606h230v34h-230z', BOOT),
    stroke('M320 606h230M320 640h230', { w: W_DETAIL }),
    ink(rr(410, 598, 50, 50, 12), GOLD, { w: W_DETAIL }),
  ]));
  body.push(form(armF, SUIT, [flat(ribbon([[480, 560], [552, 598], [596, 618]], 26, 22), SUIT_D)]));
  body.push(form(thumb, BOOT), form(gloveF, BOOT, [flat(circ(600, 612, 37), BOOT_D), el('circle', { cx: 620, cy: 580, r: 7, fill: '#fff', opacity: 0.8 })]));
  body.push(form(collar, GOLD, [flat('M300 512h270v40h-270z', GOLD_D), ...[352, 404, 456, 508].map((x) => el('circle', { cx: x, cy: 498, r: 7, fill: INK }))]));
  body.push(form(helmet, GOLD_D, [
    flat(circ(CX + 34, CY - 30, R), GOLD),
    // the little side port
    inkCircle(CX - 118, CY + 22, 34, GOLD_L, { w: W_DETAIL }), inkCircle(CX - 118, CY + 22, 18, GLASS, { w: W_DETAIL }),
    stroke(`M${CX + 20} ${CY - 122}q62 12 92 66`, { stroke: '#fff', w: 13 }),
    el('circle', { cx: CX + 122, cy: CY - 30, r: 8, fill: '#fff' }),
  ]));
  // the porthole, eyes inside
  const QX = CX + 22, QY = CY + 12;
  body.push(inkCircle(QX, QY, 108, GOLD_L));
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.39; body.push(el('circle', { cx: QX + Math.cos(a) * 96, cy: QY + Math.sin(a) * 96, r: 6, fill: INK })); }
  body.push(form(circ(QX, QY, 84), GLASS, [
    flat(circ(QX - 26, QY + 30, 84), '#2c55a0'),
    flat(`M${QX - 70} ${QY - 20}q8 -44 50 -56q-22 26 -26 60z`, '#bfefff', { opacity: 0.9 }),
  ]));
  body.push(eye(QX - 36, QY + 2, 31, { look: [0.75, 0.5] }), eye(QX + 38, QY + 2, 31, { look: [0.75, 0.5] }));
  body.push(stroke(`M${QX - 14} ${QY + 46}q16 14 32 0`, { stroke: '#bfefff', w: W_DETAIL + 1 }));
  s.add(2, g({ filter: s.wobble(5) }, body));

  // ---- 3: his breath going up, the pearl's sparkle, a near ledge
  [[572, 232, 17], [606, 166, 24], [566, 104, 13], [618, 60, 9]].forEach(([x, y, q]) => s.add(3, inkCircle(x, y, q, '#bfefff', { w: W_DETAIL, 'fill-opacity': 0.35 }), el('circle', { cx: x - q * 0.34, cy: y - q * 0.36, r: q * 0.22, fill: '#fff' })));
  s.inkBubbles({ n: 5, x0: 60, x1: 960, y0: 300, y1: 760, rmin: 8, rmax: 20 });
  s.add(3, star4(792, 548, 34), star4(636, 512, 20, '#ffe9a8'), star4(232, 330, 24), star4(818, 300, 18, '#ffd1ef'));
  s.specks({ n: 14, rmin: 3, rmax: 7, colors: ['#ffffff', '#ffd1ef', '#b9f3ff'], opacity: 0.9 });
  s.lumps({ y: 1000, amp: 60, n: 5, fill: '#0f1a45', layer: 3, w: W_MID });
}
