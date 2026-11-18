// SIREN'S CHORUS (rare spell) — three sirens singing on rocks under a big flat moon; the song is drawn as broken
// rings round the moon with sparkles riding them. Doodle style: fat ink line, flat colour, one hard shadow.
import { el, g, ribbon, ink, stroke, flat, inkCircle, inkEllipse, eye, star4, halo, waveBand, INK, SKIN, SKIN_SHADE, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const circ = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const rr = (x, y, w, h, q) => `M${x + q} ${y}h${w - 2 * q}q${q} 0 ${q} ${q}v${h - 2 * q}q0 ${q} ${-q} ${q}h${-(w - 2 * q)}q${-q} 0 ${-q} ${-q}v${-(h - 2 * q)}q0 ${-q} ${q} ${-q}Z`;
const bar = (x, y, w, h, fill, o = {}) => el('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: h / 2, fill, ...o });
const diamond = (x, y, q, fill, w = W_DETAIL) => ink(`M${x} ${y - q}L${x + q * 0.72} ${y}L${x} ${y + q}L${x - q * 0.72} ${y}Z`, fill, { w });

const ell = (x, y, rx, ry) => `M${x - rx} ${y}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
const SKIN_D = SKIN_SHADE;
const TAIL = '#4fd3c6', TAIL_D = '#2ea3a6', FIN = '#aef3e4';       // aqua, so tails and fins stand off the indigo rocks
const ROCK = '#6452b8', ROCK_D = '#46379a', ROCK_L = '#a596ee';
const MOUTH = '#b93a78';

export function build(s) {
  const MX = 512, MY = 330, H = 690;

  // ---- 0: night in flat bands, the moon, flat sea
  s.bands([[0, '#2a1e66'], [200, '#372880'], [400, '#4a3299'], [560, '#6540a8']], { amp: 14, waves: 3 });
  s.specks({ n: 36, y1: 560, rmin: 2, rmax: 4, colors: ['#fff3c4', '#ffd1ef', '#c9b8ff'], opacity: 0.8, layer: 0 });
  s.add(0, star4(130, 150, 13, '#fff3c4', 0), star4(900, 110, 11, '#fff3c4', 0), star4(820, 470, 9, '#ffd1ef', 0), star4(210, 430, 9, '#ffd1ef', 0));
  s.add(0, halo(MX, MY, 350, '#ffc9ee', 3, 0.3), el('circle', { cx: MX, cy: MY, r: 236, fill: '#fff4e2' }));
  s.add(0, el('circle', { cx: MX - 96, cy: MY - 84, r: 40, fill: '#f6dcd6' }), el('circle', { cx: MX + 110, cy: MY - 20, r: 26, fill: '#f6dcd6' }),
    el('circle', { cx: MX + 36, cy: MY - 140, r: 18, fill: '#f6dcd6' }), el('circle', { cx: MX - 150, cy: MY + 40, r: 16, fill: '#f6dcd6' }));
  s.add(0, bar(150, 300, 280, 30, '#4a3299'), bar(90, 332, 200, 24, '#4a3299'), bar(900, 250, 260, 30, '#4a3299'), bar(940, 520, 300, 28, '#7a4cb4'), bar(110, 560, 260, 26, '#7a4cb4'));
  s.add(0, el('rect', { x: -40, y: H, width: 1104, height: 460, fill: '#35287e' }));
  s.add(0, flat(waveBand(1024, 1024, 770, 7, 4, 1), '#2b2070'), flat(waveBand(1024, 1024, 870, 9, 3, 2.4), '#221960'));
  s.add(0, bar(512, H + 14, 420, 14, '#c9a8ee'), bar(500, H + 44, 560, 12, '#9a80d8'), bar(140, H + 60, 150, 10, '#6a55b8'), bar(900, H + 40, 170, 10, '#6a55b8'),
    bar(230, H + 110, 180, 10, '#5a48a8'), bar(820, H + 104, 200, 10, '#5a48a8'));
  s.paper();

  // ---- 1: the song — broken rings round the moon, with sparkles in the gaps; far rocks
  const ring = (R, n, rot, fill, cw, lined) => {
    const C = 2 * Math.PI * R, on = C / n * 0.7, off = C / n * 0.3, o = { cx: MX, cy: MY, r: R, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': `${on.toFixed(1)} ${off.toFixed(1)}`, transform: `rotate(${rot} ${MX} ${MY})` };
    return lined ? [el('circle', { ...o, stroke: INK, 'stroke-width': cw + W_MID * 2 - 2 }), el('circle', { ...o, stroke: fill, 'stroke-width': cw })] : [el('circle', { ...o, stroke: fill, 'stroke-width': cw })];
  };
  const gapAt = (R, n, rot, i) => { const a = (rot + (i + 0.85) * 360 / n) * Math.PI / 180; return [MX + Math.cos(a) * R, MY + Math.sin(a) * R]; };
  const rings = [[282, 6, 8, '#ff9fdc', 16, true], [352, 7, 31, '#8a5cc4', 14, false], [428, 8, 5, '#6a4cb4', 12, false]];
  rings.forEach((q) => s.add(1, ...ring(...q)));
  const notes = [];
  rings.forEach(([R, n, rot], k) => { for (let i = 0; i < n; i++) {
    const [x, y] = gapAt(R, n, rot, i);
    if (y > 640 || y < 30) continue;
    const kind = (i + k) % 3;
    notes.push(kind === 0 ? star4(x, y, 22 - k * 2, '#fff3c4', W_DETAIL) : kind === 1 ? diamond(x, y, 15 - k, '#ffd1ef') : inkCircle(x, y, 9, '#ffffff', { w: W_DETAIL }));
  } });
  s.add(1, ...notes);
  const farRock = (x, y, k) => g({ transform: `translate(${x} ${y}) scale(${k} ${Math.abs(k)})` }, [
    ink('M-90 30Q-96 -40 -40 -62Q-6 -92 34 -60Q92 -44 92 30Z', '#43348c', { w: W_MID / Math.abs(k) }), flat('M-60 4Q-50 -34 -22 -44Q-40 -20 -40 6Z', ROCK_L), bar(0, 34, 230, 14, '#6a55b8')]);
  s.add(1, farRock(70, 716, 0.7), farRock(968, 722, -0.6));

  // ---- 2: the rocks and the three singers
  const form = (d, fill, inside = [], w = W_INNER) => g({}, [flat(d, fill), inside.length ? g({ 'clip-path': s.clip(el('path', { d })) }, inside) : '', stroke(d, { w })]);
  const contour = (ds, w = W_SUBJECT) => g({}, ds.map((d) => el('path', { d, fill: INK, stroke: INK, 'stroke-width': w * 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' })));
  const body = [];
  const rockC = 'M352 1010L372 650Q382 572 446 556Q512 540 578 556Q642 572 652 650L672 1010Z';
  const rockL = 'M140 1010L160 730Q168 668 226 656Q290 644 346 660Q396 678 400 736L412 1010Z';
  const rockR = 'M884 1010L864 730Q856 668 798 656Q734 644 678 660Q628 678 624 736L612 1010Z';
  body.push(contour([rockL, rockR, rockC]));
  // each rock: a lit top plane, the mid tone on its face, the dark tone only down one side
  body.push(form(rockL, ROCK, [flat('M110 640h82q-22 150 -4 400h-78z', ROCK_D), flat('M110 600H440V712Q290 676 110 716Z', ROCK_L), stroke('M330 760l22 30l-10 34', { w: W_DETAIL })]));
  body.push(form(rockR, ROCK, [flat('M590 640h74q-22 150 -4 400h-70z', ROCK_D), flat('M584 600H914V716Q734 676 584 712Z', ROCK_L), stroke('M800 756l-20 32l12 30', { w: W_DETAIL })]));
  body.push(form(rockC, ROCK, [flat('M330 560h84q-22 180 -4 480h-80z', ROCK_D), flat('M330 500H690V614Q512 580 330 614Z', ROCK_L), stroke('M604 690l14 34l-12 28', { w: W_DETAIL })]));

  // one siren, drawn round her head at (0,0), the head 180 across; `flip` mirrors her; `open` = the lead: eyes open,
  // both arms thrown up. The others sing with eyes shut and hands clasped.
  const siren = (x, y, k, flip, hair, hairD, open) => {
    const W = (w) => w / k, p = [], R = 90, mir = (pts) => pts.map(([a, b]) => [-a, b]);
    // the hair is one solid mass behind her (no gaps for the night to show through)
    const hairB = 'M-106 -10C-114 -104 -58 -130 0 -130C58 -130 114 -104 106 -10C108 60 126 112 114 198Q58 216 0 204Q-58 216 -114 198C-126 112 -108 60 -106 -10Z';
    const torso = 'M-40 66L40 66Q56 130 52 206L-52 206Q-56 130 -40 66Z';
    const tailPts = open ? [[0, 178], [-6, 232], [6, 280], [0, 312]] : [[0, 178], [0, 230], [12, 274], [40, 296]];
    const [fx, fy] = tailPts[3];
    const tail = ribbon(tailPts, 108, open ? 44 : 38);
    const fluke = open
      ? `M0 ${fy - 8}q-58 4 -74 60q42 -18 74 -12q32 -6 74 12q-16 -56 -74 -60z`
      : `M${fx - 10} ${fy}q22 -62 76 -66q-2 34 -24 58q30 10 36 46q-52 6 -88 -38z`;
    const head = circ(0, 0, R);
    const cap = (u) => (u < 0.2 ? Math.sqrt(1 - (1 - u / 0.2) ** 2) : 1);
    const armUp = [[38, 98], [98, 128], [124, 60], [136, -4]];
    const arms = open
      ? [ribbon(mir(armUp), 38, 32, cap), ribbon(armUp, 38, 32, cap)]
      : [ribbon([[-40, 92], [-64, 138], [-14, 148]], 38, 30, cap), ribbon([[40, 92], [64, 138], [14, 148]], 38, 30, cap)];
    // open mitten hands (a palm and one thumb) for the lead; one clasped pair for the others
    const hands = open ? [circ(-114, -30, 12), circ(114, -30, 12), ell(-140, -38, 26, 31), ell(140, -38, 26, 31)] : [circ(0, 148, 26)];
    p.push(contour([hairB, tail, fluke, torso, ...arms, ...hands, head], W(W_SUBJECT)));
    p.push(form(hairB, hair, [flat('M-150 104h300v130h-300z', hairD), stroke('M-92 140q-6 30 -14 44M92 140q6 30 14 44', { w: W(W_DETAIL) })], W(W_INNER)));
    p.push(form(fluke, FIN, [stroke(open ? `M-8 ${fy + 2}q-22 6 -40 26M8 ${fy + 2}q22 6 40 26` : `M${fx + 6} ${fy - 6}q30 -20 48 -44M${fx + 10} ${fy + 6}q30 4 50 22`, { w: W(W_DETAIL) })], W(W_INNER)));
    p.push(form(tail, TAIL, [
      flat(ribbon(tailPts.map(([a, b]) => [a - 30, b + 10]), 44, 20), TAIL_D),
      stroke('M-2 222q12 14 24 0M-18 248q11 13 22 0M10 252q11 13 22 0', { w: W(W_DETAIL) }),
    ], W(W_INNER)));
    p.push(form(torso, SKIN, [flat('M-60 60h34q-10 70 0 150h-34z', SKIN_D), flat('M-60 114h120v40h-120z', hair), stroke('M-60 114h120M-60 154h120', { w: W(W_DETAIL) }),
      flat('M-60 182h120v40h-120z', TAIL), stroke('M-60 182q20 12 30 0q20 12 30 0q20 12 30 0q20 12 30 0', { w: W(W_DETAIL) })], W(W_INNER)));
    arms.forEach((d) => p.push(form(d, SKIN, [], W(W_INNER))));
    hands.forEach((d) => p.push(form(d, SKIN, [], W(W_INNER))));
    p.push(form(head, SKIN_D, [flat(circ(9, -7, R), SKIN)], W(W_INNER)));
    // the fringe covers the top of the head's line, so hair and fringe are one mass
    const fringe = 'Q74 -56 16 -54Q-10 -22 -46 -31Q-76 -35 -88.6 -8';
    p.push(flat('M-88.6 -8A89 89 0 0 1 88.6 -8L97 -8A97.4 97.4 0 0 0 -97 -8Z', hair), flat(`M88.6 -8${fringe}A89 89 0 0 1 88.6 -8Z`, hair), stroke(`M88.6 -8${fringe}`, { w: W(W_DETAIL + 1) }));
    p.push(flat('M-54 -100h60q8 0 8 8t-8 8h-60q-8 0 -8 -8t8 -8z', '#ffffff', { opacity: 0.85 }));
    if (open) {
      p.push(eye(-37, 16, 30, { look: [0.1, -0.35], w: W(W_DETAIL + 1) }), eye(37, 16, 30, { look: [0.1, -0.35], w: W(W_DETAIL + 1) }));
      p.push(ink('M-22 52q22 -10 44 0q-2 30 -22 30q-20 0 -22 -30z', MOUTH, { w: W(W_DETAIL) }));
    } else {
      p.push(stroke('M-62 24q24 -32 48 0M14 24q24 -32 48 0', { w: W(W_INNER) }));
      p.push(inkEllipse(0, 56, 15, 18, MOUTH, { w: W(W_DETAIL) }));
    }
    p.push(el('ellipse', { cx: -64, cy: 46, rx: 15, ry: 9, fill: '#ff8fb0', opacity: 0.85 }), el('ellipse', { cx: 64, cy: 46, rx: 15, ry: 9, fill: '#ff8fb0', opacity: 0.85 }));
    p.push(star4(64, -86, 18, '#fff3c4', W(W_DETAIL)));
    return g({ transform: `translate(${x} ${y}) scale(${flip * k} ${k})` }, p);
  };
  body.push(siren(240, 440, 1.1, -1, '#b594f5', '#8f6fe0', false));
  body.push(siren(784, 440, 1.1, 1, '#f070b0', '#cf4f98', false));
  body.push(siren(512, 290, 1.35, 1, '#ff9fdc', '#ef74c4', true));
  s.add(2, g({ filter: s.wobble(5) }, body));

  // ---- 3: the near swell with foam at the foot of the rocks, the song's sparkles

  const foam = (x, y, k) => {
    const ds = [[-60, 2, 20], [-24, -8, 28], [20, -6, 25], [58, 4, 19]].map(([dx, dy, q]) => circ(dx, dy, q)).concat([rr(-84, -6, 168, 36, 18)]);
    return g({ transform: `translate(${x} ${y}) scale(${k} ${Math.abs(k)})` }, [contour(ds, W_DETAIL / Math.abs(k)), ...ds.map((d) => flat(d, '#ffffff')), stroke('M-34 2q10 -12 22 -4M14 4q10 -12 22 -4', { w: W_DETAIL / Math.abs(k) })]);
  };
  s.add(3, foam(270, 838, -0.9), foam(512, 842, 1.3), foam(752, 838, 1));
  s.add(3, ink(waveBand(1024, 1024, 846, 10, 5, 0.6), '#5445b2', { w: W_INNER }));
  s.add(3, flat(waveBand(1024, 1024, 930, 10, 4, 2), '#3b2f92'));
  s.add(3, bar(150, 890, 160, 12, '#8f7bd6'), bar(880, 886, 180, 12, '#8f7bd6'));
  s.add(3, star4(206, 236, 30), star4(826, 250, 24, '#ffd1ef'), star4(360, 128, 18, '#fff3c4'), star4(690, 118, 22), diamond(142, 330, 13, '#ffd1ef'), diamond(884, 316, 12, '#fff3c4'));
  s.specks({ n: 14, y1: 700, rmin: 3, rmax: 6, colors: ['#ffffff', '#ffd1ef', '#fff3c4'], opacity: 0.9 });
}
