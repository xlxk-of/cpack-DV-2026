// SIREN'S CHORUS (rare) — three sirens on the sea rocks under a vast moon; their song goes out as rings of light.
import { el, g, spline, ribbon, poly, blob, noise1, glint } from '../lib.mjs';

const MOON = [512, 356], MR = 252;
const HZ = 706;

export function build(s) {
  const r = s.r;

  // ---- 0: night, moon, sea
  s.backdrop(s.lin([[0, '#0b0828'], [0.25, '#22114e'], [0.48, '#4c1f78'], [0.62, '#8a3a96'], [0.688, '#d476b4'], [0.692, '#6a2f88'], [0.78, '#32175e'], [1, '#0c0726']]));
  s.motes({ n: 150, y1: 640, rmin: 0.5, rmax: 2, colors: ['#ffffff', '#ffd6f6', '#cfc4ff'], opacity: 0.85, glow: false, layer: 0 });
  s.glints({ n: 7, y1: 300, smin: 5, smax: 12, color: '#fff', opacity: 0.8, layer: 0 });
  s.fog({ color: '#b050c8', opacity: 0.35, freq: 0.005, y: 80, h: 660 });
  // moon halo
  s.add(0, el('circle', { cx: MOON[0], cy: MOON[1], r: 560, fill: s.rad([[0, '#ffd8f8', 0.75], [0.44, '#ff9ee0', 0.42], [0.62, '#b060e0', 0.2], [1, '#b060e0', 0]]) }));
  s.add(0, el('circle', { cx: MOON[0], cy: MOON[1], r: MR + 10, fill: '#fff', opacity: 0.6, filter: 'url(#glow32)' }));
  // the moon itself
  s.add(0, el('circle', { cx: MOON[0], cy: MOON[1], r: MR, fill: s.rad([[0, '#ffffff'], [0.55, '#fff6fd'], [0.85, '#f6d9f6'], [1, '#e2b4ee']], 0.42, 0.38, 0.72) }));
  const mc = s.clip(el('circle', { cx: MOON[0], cy: MOON[1], r: MR }));
  const mare = [];
  for (const [x, y, w, h, o] of [[-90, -90, 90, 66, 0.3], [40, -130, 70, 44, 0.24], [110, -20, 80, 96, 0.22], [-40, 40, 110, 70, 0.2], [-150, 30, 46, 70, 0.2], [60, 120, 90, 50, 0.18], [-110, 150, 60, 36, 0.16]])
    mare.push(el('path', { d: blob(MOON[0] + x, MOON[1] + y, w, h, r, 9, 0.3), fill: '#c79ade', opacity: o }));
  for (let i = 0; i < 16; i++) { const a = r.range(0, 6.28), d = Math.sqrt(r()) * MR * 0.9, k = r.range(5, 18); mare.push(el('circle', { cx: MOON[0] + Math.cos(a) * d, cy: MOON[1] + Math.sin(a) * d, r: k, fill: 'none', stroke: '#d6a8e6', 'stroke-width': k * 0.3, opacity: 0.3 })); }
  s.add(0, g({ 'clip-path': mc, filter: 'url(#glow8)' }, mare));
  s.add(0, g({ 'clip-path': mc }, el('circle', { cx: MOON[0] + 60, cy: MOON[1] + 70, r: MR * 1.25, fill: 'none', stroke: '#c58ae0', 'stroke-width': 90, opacity: 0.3, filter: 'url(#glow32)' })));
  // thin cloud across the sky
  const cl = [];
  for (let i = 0; i < 12; i++) {
    const y = r.range(90, 670), onMoon = Math.abs(y - MOON[1]) < MR, x = onMoon ? r.pick([r.range(-80, 230), r.range(800, 1100)]) : r.range(-80, 1100), w = r.range(140, 380), h = r.range(5, 13);
    cl.push(el('ellipse', { cx: x, cy: y, rx: w, ry: h, fill: s.lin([[0, '#ffd0f4', 0.75], [1, '#7a3aa8', 0.6]]), opacity: r.range(0.25, 0.55) }));
  }
  s.add(0, g({ filter: s.rough(16, 0.012, 6) }, cl));
  // horizon glow and the moon's road on the water
  s.add(0, el('rect', { x: 0, y: HZ - 36, width: 1024, height: 60, fill: s.lin([[0, '#ffc0ee', 0], [0.62, '#ffc8f0', 0.55], [1, '#ffc0ee', 0]]) }));
  const sea = [];
  for (let i = 0; i < 200; i++) {
    const t = Math.pow(r(), 1.6), y = HZ + 3 + t * 330, k = 0.2 + t * 1.5, x = r.range(-40, 1064), w = r.range(20, 80) * k, lit = r() < 0.45;
    sea.push(el('ellipse', { cx: x, cy: y, rx: w, ry: 1 + k * 2.2, fill: lit ? '#d58ae0' : '#12082e', opacity: (lit ? 0.3 : 0.5) * r.range(0.4, 1) }));
  }
  for (let i = 0; i < 170; i++) {
    const t = Math.pow(r(), 1.4), y = HZ + 2 + t * 320, k = 0.2 + t * 1.4, x = MOON[0] + r.range(-1, 1) * (70 + t * 210), w = r.range(8, 36) * k;
    sea.push(el('ellipse', { cx: x, cy: y, rx: w, ry: 1 + k * 1.8, fill: r() < 0.6 ? '#fff0fc' : '#ffb8ea', opacity: r.range(0.35, 0.95) * (1 - t * 0.45) }));
  }
  s.add(0, g({}, sea));
  s.vignette({ strength: 0.72, color: '#06031a', cy: 0.46 });
  s.grain({ opacity: 0.18 });

  // ---- 1: the song — clean rings of light rippling out from each singer — and far skerries
  const mouths = [[515, 334, 0], [296, 472, -1], [736, 458, 1]];
  const rings = [];
  for (const [mx, my, side] of mouths) {
    const n = side === 0 ? 8 : 5;
    for (let i = 0; i < n; i++) {
      const rad = side === 0 ? 74 + i * 52 + i * i * 5.5 : 46 + i * 38 + i * i * 4;
      const o = side === 0 ? 1 - i * 0.105 : 0.9 - i * 0.15;
      rings.push(songRing(mx, my, rad, o, i, side));
    }
  }
  s.add(1, g({}, rings));
  const sk = (x, w, h, sd) => s.add(1, el('path', { d: `M${x - w} ${HZ + 3}L${x - w * 0.6} ${HZ - h * 0.5}L${x - w * 0.2} ${HZ - h}L${x + w * 0.25} ${HZ - h * 0.8}L${x + w * 0.5} ${HZ - h * 0.35}L${x + w} ${HZ + 3}Z`, fill: s.lin([[0, '#7a4aa0'], [1, '#3a1c64']]), opacity: 0.85, filter: s.rough(6, 0.04, sd) }));
  sk(70, 70, 70, 2); sk(960, 60, 52, 4); sk(170, 30, 26, 6); sk(880, 24, 20, 8);

  // ---- 2: rocks and the three singers
  const rocks = [];
  rocks.push(rock(s, [[84, 900], [112, 836], [146, 768], [170, 714], [198, 672], [230, 642], [288, 634], [314, 658], [342, 716], [370, 776], [396, 838], [416, 900]], 11));
  rocks.push(rock(s, [[606, 900], [632, 830], [660, 760], [688, 694], [714, 644], [744, 622], [802, 616], [830, 642], [856, 702], [882, 770], [912, 836], [944, 900]], 23));
  rocks.push(rock(s, [[350, 930], [378, 846], [400, 752], [424, 656], [446, 586], [472, 538], [498, 526], [548, 528], [576, 556], [598, 624], [620, 706], [644, 800], [670, 868], [690, 930]], 37));
  s.add(2, g({}, rocks));
  s.def('<filter id="scRim"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.86  0 0 0 0 0.98  0 0 0 1 0"/></filter>');
  s.def('<filter id="scHalo" x="-40%" y="-40%" width="180%" height="180%"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.6  0 0 0 0 0.92  0 0 0 0.8 0"/><feGaussianBlur stdDeviation="9"/></filter>');
  const place = (fig, dx) => g({}, [g({ filter: 'url(#scHalo)' }, fig), g({ filter: 'url(#scRim)', transform: `translate(${dx} -2.6)` }, fig), fig]);
  s.add(2, place(sirenSide(s, 262, 632, 1.08, 1, 3), 1.6));
  s.add(2, place(sirenSide(s, 770, 618, 1.08, -1, 5), -1.6));
  s.add(2, place(sirenFront(s, 512, 526, 1.3), 0));
  // the breath of the song at each mouth
  for (const [mx, my] of [[296, 474], [736, 460]]) s.add(2, el('circle', { cx: mx, cy: my, r: 7, fill: '#fff', opacity: 0.75, filter: 'url(#glow4)' }));
  // surf round the feet of the rocks
  const surf = [];
  for (const [x, y, w] of [[250, 884, 200], [776, 884, 200], [520, 912, 210]]) {
    surf.push(el('ellipse', { cx: x, cy: y + 6, rx: w, ry: 24, fill: '#fbe3ff', opacity: 0.5, filter: 'url(#glow8)' }));
    for (let i = 0; i < 30; i++) { const a = r.range(Math.PI * 0.03, Math.PI * 0.97), k = r.range(0.7, 1.1); surf.push(el('ellipse', { cx: x + Math.cos(a) * w * k, cy: y + Math.sin(a) * 20 * k, rx: r.range(5, 18), ry: r.range(1.5, 3.5), fill: '#fff4ff', opacity: r.range(0.3, 0.8) })); }
  }
  s.add(2, g({ filter: 'url(#glow2)' }, surf));

  // ---- 3: near swell, mist, drifting sparks of song
  const nz = noise1(r, 32), near = [];
  for (let k = 0; k < 2; k++) {
    const pts = [[-40, 1064]];
    for (let i = 0; i <= 50; i++) { const x = -40 + 1104 * i / 50; pts.push([x, 940 + k * 44 + Math.sin(i * 0.5 + k * 2) * 10 + nz(i * 0.6 + k * 9) * 20]); }
    pts.push([1064, 1064]);
    near.push(el('path', { d: spline(pts, true, 4), fill: s.lin([[0, k ? '#1a0c3c' : '#2c1658'], [1, '#080420']]) }));
    near.push(el('path', { d: spline(pts.slice(1, -1), false, 4), fill: 'none', stroke: '#ffc8f4', 'stroke-width': 2.2, opacity: 0.4, 'stroke-dasharray': '70 30 24 44', 'stroke-linecap': 'round' }));
  }
  s.add(3, g({}, near));
  s.fog({ color: '#ff9ee6', opacity: 0.3, freq: 0.007, layer: 3, y: 740, h: 300, contrast: 2.4 });
  s.motes({ n: 44, y0: 60, y1: 820, rmin: 1.2, rmax: 4.2, colors: ['#ffd0f6', '#ffffff', '#e0c4ff'], opacity: 0.85 });
  const gl = [];
  for (const [mx, my, side] of mouths) for (let i = 1; i < (side === 0 ? 7 : 4); i++) {
    const rad = side === 0 ? 74 + i * 52 + i * i * 5.5 : 46 + i * 38 + i * i * 4, a = side === 0 ? r.range(-2.9, -0.2) : side < 0 ? r.range(-3.4, -1.2) : r.range(-1.9, 0.3);
    gl.push(glint(mx + Math.cos(a) * rad, my + Math.sin(a) * rad, r.range(9, 20) * (1 - i * 0.08), i % 2 ? '#ffd6f6' : '#ffffff', 0.95 - i * 0.08));
  }
  s.add(3, g({}, gl));
}

/** One ring of song: a soft halo under a fine bright line; every other ring is a doubled or dotted line. */
function songRing(cx, cy, rad, o, i, side) {
  const p = [];
  p.push(el('circle', { cx, cy, r: rad, fill: 'none', stroke: '#ff6ed6', 'stroke-width': 14, opacity: 0.3, filter: 'url(#glow8)' }));
  p.push(el('circle', { cx, cy, r: rad, fill: 'none', stroke: '#ff9ae6', 'stroke-width': 5, opacity: 0.6, filter: 'url(#glow2)' }));
  p.push(el('circle', { cx, cy, r: rad, fill: 'none', stroke: side === 0 ? '#fff4fd' : '#ffd8f6', 'stroke-width': 2.2 }));
  if (i % 3 === 1) p.push(el('circle', { cx, cy, r: rad + 7, fill: 'none', stroke: '#ffc4f0', 'stroke-width': 1.2, opacity: 0.8 }));
  if (i % 3 === 2) p.push(el('circle', { cx, cy, r: rad - 8, fill: 'none', stroke: '#ffe0fa', 'stroke-width': 2.4, 'stroke-dasharray': '0.1 11', 'stroke-linecap': 'round', opacity: 0.9 }));
  return g({ opacity: Math.max(0.14, o) }, p);
}

/** A sea crag from its skyline (left foot .. right foot). */
function rock(s, prof, seed) {
  const r = s.r, p = [];
  const top = prof.map(([x, y], i) => [x + (i && i < prof.length - 1 ? r.range(-7, 7) : 0), y + (i && i < prof.length - 1 ? r.range(-7, 7) : 0)]);
  const x0 = top[0][0], x1 = top[top.length - 1][0], cx = (x0 + x1) / 2, ty = Math.min(...top.map((q) => q[1]));
  const d = poly([...top, [x1 + 20, 1000], [x0 - 20, 1000]], true);
  p.push(el('path', { d, fill: s.lin([[0, '#4a2f86'], [0.15, '#2e1a62'], [0.55, '#180c3e'], [1, '#080420']], 0, ty, 0, 940, true) }));
  const c = s.clip(el('path', { d }));
  const f = [];
  for (let i = 0; i < 9; i++) {              // planes of the rock, faint
    const j = r.int(1, top.length - 3), [x, y] = top[j], k = r.range(60, 150), sg = x < cx ? 1 : -1;
    f.push(el('path', { d: poly([[x, y], [x + sg * k * 0.5, y + k * 0.4], [x + sg * k * 0.3, y + k * 1.4], [x - sg * k * 0.2, y + k * 1.1]], true), fill: r() < 0.5 ? '#6a48a8' : '#06031a', opacity: r.range(0.1, 0.22) }));
  }
  for (let i = 0; i < 14; i++) {             // cracks running down
    const j = r.int(1, top.length - 2), [x, y] = top[j];
    f.push(el('path', { d: `M${x} ${y}l${r.range(-16, 16)} ${r.range(30, 70)}l${r.range(-20, 20)} ${r.range(30, 80)}l${r.range(-12, 12)} ${r.range(20, 60)}`, fill: 'none', stroke: '#06031a', 'stroke-width': r.range(1.4, 2.6), opacity: 0.55 }));
  }
  // moonlight along the skyline, strongest on the side toward the moon
  f.push(el('path', { d: poly(top), fill: 'none', stroke: '#ffb8f0', 'stroke-width': 22, opacity: 0.3, filter: 'url(#glow8)' }));
  f.push(el('path', { d: poly(top), fill: 'none', stroke: s.lin([[0, '#ffe6fb', cx < 500 ? 0.25 : 0.95], [1, '#ffe6fb', cx > 524 ? 0.25 : 0.95]], x0, 0, x1, 0, true), 'stroke-width': 5, 'stroke-linejoin': 'round' }));
  f.push(el('rect', { x: x0 - 30, y: 820, width: x1 - x0 + 60, height: 130, fill: s.lin([[0, '#06031a', 0], [1, '#06031a', 0.85]]) }));
  p.push(g({ 'clip-path': c }, f));
  return g({ filter: s.rough(8, 0.035, seed) }, p);
}

const INK = ['#0e0628', '#1c0d44', '#2e1766'];

function fluke(s, x, y, deg, k) {
  const fill = s.lin([[0, '#3a1a80'], [0.55, '#9a48c8'], [1, '#ff9ee6']], 0, 0, 1, 0);
  const lobe = (sg) => `M0 0C18 ${sg * 6} 44 ${sg * 30} 80 ${sg * 46}C58 ${sg * 20} 46 ${sg * 4} 30 ${-sg * 2}C18 ${-sg * 3} 8 ${-sg * 2} 0 0Z`;
  const p = [el('path', { d: lobe(1), fill }), el('path', { d: lobe(-1), fill })];
  for (const sg of [1, -1]) for (let i = 1; i < 5; i++) p.push(el('path', { d: `M4 0Q${30 + i * 4} ${sg * i * 4} ${44 + i * 7} ${sg * (10 + i * 7.5)}`, fill: 'none', stroke: '#ffe0fa', 'stroke-width': 1.1, opacity: 0.5 }));
  return g({ transform: `translate(${x} ${y}) rotate(${deg}) scale(${k})` }, p);
}

/** Tail: dark at the hip, shimmering toward the fluke, a sheen down the moon side and a whisper of scales. */
function tailOf(s, pts, w0, w1, gx = 0, gy = 1) {
  const out = [];
  const shape = (t) => 1 - 0.14 * Math.sin(t * Math.PI);
  out.push(el('path', { d: ribbon(pts, w0, w1, shape), fill: s.lin([[0, INK[1]], [0.45, '#3a1c7a'], [1, '#9a4cc8']], 0, 0, gx, gy) }));
  out.push(el('path', { d: ribbon(pts, w0 * 0.28, w1 * 0.3, shape), fill: '#ff9ee6', opacity: 0.28, transform: 'translate(2 -3)', filter: 'url(#glow2)' }));
  const sm = [];
  for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 4; k++) sm.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k / 4, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k / 4]);
  for (let i = 2; i < sm.length - 1; i++) {
    const t = i / sm.length, a = Math.atan2(sm[i + 1][1] - sm[i][1], sm[i + 1][0] - sm[i][0]) * 180 / Math.PI, w = (w0 + (w1 - w0) * t) * 0.34;
    out.push(el('path', { d: `M0 ${-w}Q${w * 0.8} 0 0 ${w}`, fill: 'none', stroke: i % 2 ? '#ffb0ee' : '#a8c8ff', 'stroke-width': 1.1, opacity: 0.22, transform: `translate(${sm[i][0].toFixed(1)} ${sm[i][1].toFixed(1)}) rotate(${a.toFixed(1)})` }));
  }
  return out.join('');
}

function hairMass(s, locks, strands, seed) {
  const out = [];
  locks.forEach(([pts, w], i) => {
    const tipLeft = pts[pts.length - 1][0] < pts[0][0];
    out.push(el('path', { d: ribbon(pts, w, 2, (t) => (0.75 + 0.3 * Math.sin(t * 7 + i * 1.7 + seed)) * (1 - 0.5 * t * t) * Math.min(1, 0.3 + t * 5)), fill: s.lin([[0, INK[1]], [0.6, '#3c1e80'], [1, '#8a44c0']], tipLeft ? 1 : 0, 0, tipLeft ? 0 : 1, 0) }));
    out.push(el('path', { d: spline(pts.map(([x, y]) => [x, y - w * 0.16])), fill: 'none', stroke: '#ffb8f0', 'stroke-width': 1.3, opacity: 0.4 }));
  });
  strands.forEach((pts) => out.push(el('path', { d: spline(pts), fill: 'none', stroke: '#4a2690', 'stroke-width': 2.4, 'stroke-linecap': 'round' })));
  return out.join('');
}

const HAND = 'M0 2C-6 -6 -6 -17 -1 -26C2 -19 6 -21 10 -29C11 -18 9 -6 0 2Z';

/** A siren seen side-on, seated with hips at (x, y), head thrown back in song. `flip` -1 mirrors her. */
function sirenSide(s, x, y, k, flip, seed) {
  const p = [];
  const body = s.lin([[0, INK[1]], [1, INK[2]]], 0, 1, 0, 0);
  p.push(hairMass(s, [
    [[[8, -160], [-34, -174], [-84, -154], [-130, -164], [-184, -128]], 46],
    [[[-4, -156], [-40, -138], [-66, -100], [-106, -90], [-138, -52]], 36],
    [[[-8, -148], [-28, -112], [-24, -70], [-42, -36]], 22],
  ], [
    [[-60, -172], [-110, -190], [-150, -176], [-196, -188]],
    [[-70, -120], [-120, -118], [-160, -92], [-190, -98]],
    [[-40, -90], [-70, -56], [-96, -50]],
  ], seed));
  // arm propped behind
  p.push(el('path', { d: ribbon([[-12, -100], [-32, -68], [-36, -32], [-28, -2]], 13, 8), fill: INK[0] }));
  // tail down the rock, fluke lifted
  const tail = [[-4, -6], [36, 6], [70, 44], [80, 98], [62, 146], [30, 176]];
  p.push(fluke(s, 31, 174, 150, 0.84));
  p.push(tailOf(s, tail, 52, 10));
  // torso, arched
  p.push(el('path', { d: ribbon([[-2, 12], [-8, -26], [-14, -60], [-8, -92], [0, -110]], 2, 2, (t) => 24 - 11 * Math.sin(Math.min(1, t * 1.5) * Math.PI) + 6 * Math.max(0, Math.sin((t - 0.45) * 2.6))), fill: body }));
  // neck, head (profile turned up to the sky), mouth open
  p.push(el('path', { d: ribbon([[-2, -104], [6, -130]], 14, 12), fill: body }));
  p.push(el('path', { d: 'M-18 -4C-20 -22 -4 -27 8 -23C16 -20 20 -13 21 -7L28 -1L21 3L23 7L18 10L22 15L17 21C9 25 0 22 -8 16C-14 12 -18 4 -18 -4Z', fill: INK[2], transform: 'translate(8 -146) rotate(-28)' }));
  // raised arm, hand open to the moon
  p.push(el('path', { d: ribbon([[2, -102], [30, -104], [52, -132], [68, -172]], 15, 7), fill: INK[2] }));
  p.push(el('path', { d: HAND, fill: INK[2], transform: 'translate(68 -170) rotate(16)' }));
  // hip fin
  p.push(el('path', { d: 'M10 -2C30 -20 52 -22 68 -16C52 -8 36 4 22 10Z', fill: s.lin([[0, '#4a2090'], [1, '#e088e0']], 0, 0, 1, 0) }));
  return g({ transform: `translate(${x} ${y}) scale(${k * flip} ${k})` }, p);
}

/** The lead siren, facing us on the high rock: one arm lifted, one held out, her hair a banner on the wind. */
function sirenFront(s, x, y, k) {
  const p = [];
  const body = s.lin([[0, INK[1]], [1, INK[2]]], 0, 1, 0, 0);
  p.push(hairMass(s, [
    [[[8, -168], [-30, -186], [-80, -172], [-128, -190], [-180, -164], [-222, -176]], 50],
    [[[-6, -164], [-46, -152], [-88, -122], [-134, -126], [-176, -96]], 40],
    [[[-12, -152], [-32, -116], [-28, -82], [-44, -52]], 22],
  ], [
    [[-90, -190], [-140, -210], [-190, -196], [-236, -206]],
    [[-100, -140], [-150, -146], [-196, -122], [-226, -130]],
    [[-60, -116], [-100, -88], [-130, -84]],
  ], 2));
  // tail swept off the rock in an S, fluke raised
  const tail = [[4, 4], [8, 44], [40, 86], [92, 98], [134, 70], [150, 28]];
  p.push(fluke(s, 150, 30, -78, 0.94));
  p.push(tailOf(s, tail, 58, 11, 1, 0.4));
  // torso
  p.push(el('ellipse', { cx: 4, cy: 4, rx: 29, ry: 15, fill: INK[1] }));
  p.push(el('path', { d: ribbon([[5, 10], [7, -24], [1, -56], [-3, -88], [0, -110]], 2, 2, (t) => t < 0.45 ? 28 - 16 * Math.sin(t / 0.45 * Math.PI / 2) : 12 + 15 * Math.sin(Math.min(1, (t - 0.45) / 0.4) * Math.PI / 2) - (t > 0.9 ? (t - 0.9) * 30 : 0), 16), fill: body }));
  // one arm lifted over her head, the other held out to the sea
  p.push(el('path', { d: ribbon([[-24, -103], [-54, -88], [-86, -62], [-120, -66]], 16, 7), fill: INK[2] }));
  p.push(el('path', { d: HAND, fill: INK[2], transform: 'translate(-119 -66) rotate(-82)' }));
  p.push(el('path', { d: ribbon([[24, -104], [56, -116], [80, -156], [96, -204]], 16, 7), fill: INK[2] }));
  p.push(el('path', { d: HAND, fill: INK[2], transform: 'translate(96 -202) rotate(14)' }));
  // neck and head, chin lifted
  p.push(el('ellipse', { cx: 0, cy: -105, rx: 27, ry: 9, fill: INK[2] }));
  p.push(el('path', { d: ribbon([[0, -104], [1, -136]], 13, 10), fill: INK[2] }));
  p.push(el('ellipse', { cx: 2, cy: -154, rx: 18, ry: 22, fill: INK[2], transform: 'rotate(6 2 -154)' }));
  return g({ transform: `translate(${x} ${y}) scale(${k})` }, p);
}
