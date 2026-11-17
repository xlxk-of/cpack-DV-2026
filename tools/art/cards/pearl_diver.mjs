// PEARL DIVER (common) — a diver in an antique brass helmet reaches for a great pearl in a giant clam, in a single
// shaft of light from the surface.
import { el, g, spline, ribbon, sample, poly, blob, noise1, glint } from '../lib.mjs';

export function build(s) {
  const r = s.r;
  const PX = 652, PY = 592, PR = 58;           // the pearl
  const GY = 792;                              // the seabed under the diver's boots

  // ---- 0: deep water, one beam
  s.backdrop(s.lin([[0, '#1f7fa8'], [0.22, '#10528a'], [0.55, '#082a5c'], [0.82, '#051338'], [1, '#020719']]));
  s.fog({ color: '#2f9fd0', opacity: 0.3, freq: 0.005 });
  s.fog({ color: '#3d4fc4', opacity: 0.22, freq: 0.009, y: 420, h: 660 });
  // the beam: a wide soft shaft and a hot core, falling on the clam
  const beamFill = s.lin([[0, '#eaffff', 0.75], [0.45, '#bfeeff', 0.42], [0.8, '#bfeeff', 0.2], [1, '#bfeeff', 0]], 0, -60, 0, 900, true);
  s.add(0, g({ filter: s.blur(22) }, [
    el('path', { d: poly([[540, -80], [700, -80], [PX + 260, 900], [PX - 230, 900]], true), fill: beamFill, opacity: 0.85 }),
  ]));
  s.add(0, g({ filter: s.blur(9) }, [
    el('path', { d: poly([[585, -80], [665, -80], [PX + 135, 900], [PX - 120, 900]], true), fill: beamFill, opacity: 0.95 }),
    el('path', { d: poly([[612, -80], [640, -80], [PX + 40, 900], [PX - 46, 900]], true), fill: beamFill, opacity: 0.5 }),
  ]));
  s.rays({ x: 610, y: -140, angle: 88, spread: 26, n: 6, color: '#d6fbff', opacity: 0.13, width: 60, blur: 10 });
  // the pearl's light filling the water
  s.add(0, el('circle', { cx: PX, cy: PY, r: 430, fill: s.rad([[0, '#eafcff', 0.6], [0.25, '#9fdcff', 0.34], [0.6, '#4a8fe0', 0.14], [1, '#4a8fe0', 0]]) }));
  s.motes({ n: 110, rmin: 0.6, rmax: 2.2, color: '#b9ecff', opacity: 0.5, glow: false, layer: 0 });
  s.vignette({ strength: 0.78, cy: 0.5 });
  s.grain({ opacity: 0.2 });

  // ---- 1: far reef, hazy, and a sunk arch
  s.ridge({ y: 690, amp: 120, detail: 0.7, fill: s.lin([[0, '#1a5a94'], [1, '#0a2a5c']]), layer: 1, opacity: 0.55, filter: 'url(#glow2)' });
  const spire = (x, w, h, o, sd) => s.add(1, el('path', { d: `M${x - w} 820C${x - w * 0.9} ${820 - h * 0.5} ${x - w * 0.5} ${820 - h * 0.92} ${x - w * 0.1} ${820 - h}C${x + w * 0.3} ${820 - h * 0.97} ${x + w * 0.45} ${820 - h * 0.7} ${x + w * 0.5} ${820 - h * 0.62}C${x + w * 0.8} ${820 - h * 0.55} ${x + w} ${820 - h * 0.3} ${x + w * 1.1} 820Z`, fill: s.lin([[0, '#2a78b4'], [0.5, '#12427c'], [1, '#081f4c']]), opacity: o, filter: s.rough(16, 0.018, sd) }));
  spire(120, 120, 470, 0.5, 5); spire(930, 110, 560, 0.5, 7); spire(790, 70, 300, 0.4, 3); spire(300, 60, 250, 0.35, 8);
  for (let i = 0; i < 9; i++) {                 // a far shoal
    const x = 760 + r.range(-90, 120), y = 250 + r.range(-70, 80), k = r.range(0.6, 1.1);
    s.add(1, el('path', { d: `M${x} ${y}q${14 * k} ${-7 * k} ${28 * k} 0q${-14 * k} ${7 * k} ${-28 * k} 0zM${x} ${y}l${-9 * k} ${-6 * k}l0 ${12 * k}z`, fill: '#0b2f66', opacity: 0.55 }));
  }
  s.ridge({ y: 772, amp: 80, detail: 0.9, fill: s.lin([[0, '#1a5a9a'], [0.12, '#0e3a74'], [0.5, '#071c48']], 0, 700, 0, 1024, true), layer: 1, opacity: 0.92 });
  for (let i = 0; i < 7; i++) s.add(1, fan(s, r.pick([150, 210, 800, 860, 930, 60, 740]) + r.range(-20, 20), 790, r.range(60, 120), r.pick(['#1b4f96', '#27408f', '#16609a'])));
  s.kelp({ x: 880, y: 800, h: 430, n: 3, color: '#0a2a5e', layer: 1, lean: -0.06, opacity: 0.9 });
  s.kelp({ x: 60, y: 800, h: 300, n: 2, color: '#0a2a5e', layer: 1, opacity: 0.9 });

  // ---- 2: seabed, clam and pearl, diver
  const L = [];
  // sand, lit in a pool under the pearl
  const nz = noise1(r, 32);
  const sand = [[-40, 1064]];
  for (let i = 0; i <= 60; i++) { const x = -40 + 1104 * i / 60; sand.push([x, GY - 14 + nz(i * 0.45) * 26 - 30 * Math.exp(-Math.pow((x - PX) / 190, 2))]); }
  sand.push([1064, 1064]);
  const sandD = spline(sand, true, 4);
  L.push(el('path', { d: sandD, fill: s.lin([[0, '#2c5f8e'], [0.25, '#123765'], [1, '#040d2a']], 0, GY - 40, 0, 1024, true) }));
  const sandClip = s.clip(el('path', { d: sandD }));
  const pool = [el('ellipse', { cx: PX - 20, cy: GY + 6, rx: 460, ry: 130, fill: s.rad([[0, '#f2faff', 0.95], [0.35, '#9fd2f4', 0.5], [1, '#8fc8f0', 0]]) })];
  for (let i = 0; i < 70; i++) {                // pebbles and ripples in the sand
    const x = r.range(40, 990), y = r.range(GY - 10, 1000), w = r.range(6, 26);
    pool.push(el('ellipse', { cx: x, cy: y, rx: w, ry: w * 0.28, fill: r() < 0.5 ? '#cfe8ff' : '#020a22', opacity: r.range(0.05, 0.22) }));
  }
  L.push(g({ 'clip-path': sandClip }, pool));
  // long shadow the diver throws away from the pearl
  L.push(el('ellipse', { cx: 250, cy: GY + 22, rx: 200, ry: 24, fill: '#010616', opacity: 0.6, filter: 'url(#glow8)' }));

  L.push(clam(s, PX, PY, PR));
  L.push(diver(s, PX, PY, GY));
  s.add(2, g({}, L));

  // ---- 3: bubbles off the helmet, drift, near rock
  const bub = [];
  for (let i = 0; i < 22; i++) {
    const t = i / 21, y = 286 - t * 360 + r.range(-12, 12), x = 318 - t * 40 + Math.sin(t * 9) * 26 + r.range(-14, 14), rr = 3 + t * 9 * r.range(0.5, 1.3);
    bub.push(el('circle', { cx: x, cy: y, r: rr, fill: '#dff', 'fill-opacity': 0.1, stroke: '#e6ffff', 'stroke-width': Math.max(0.9, rr * 0.14), 'stroke-opacity': 0.75 }));
    bub.push(el('ellipse', { cx: x - rr * 0.35, cy: y - rr * 0.4, rx: rr * 0.3, ry: rr * 0.17, fill: '#fff', opacity: 0.85 }));
  }
  s.add(3, g({}, bub));
  s.motes({ n: 40, rmin: 1.2, rmax: 4.5, colors: ['#cfefff', '#ffffff', '#ffe9b0'], opacity: 0.8 });
  s.bubbles({ n: 9, y0: 120, y1: 720, rmin: 3, rmax: 13 });
  // near rocks and weed framing the bottom corners
  s.add(3, el('path', { d: blob(40, 1000, 250, 150, r, 11, 0.22), fill: '#020818', filter: s.rough(14, 0.02, 9) }));
  s.add(3, el('path', { d: blob(1010, 1010, 220, 130, r, 11, 0.22), fill: '#020818', filter: s.rough(14, 0.02, 11) }));
  s.kelp({ x: 24, y: 1040, h: 520, n: 2, color: '#020a1e', layer: 3, lean: 0.07, width: 20 });
  s.kelp({ x: 1000, y: 1040, h: 430, n: 2, color: '#020a1e', layer: 3, lean: -0.05, width: 20 });
  s.add(3, glint(PX - 18, PY - 22, 30, '#ffffff', 0.95), glint(PX + 96, PY - 92, 15, '#dff6ff', 0.8), glint(PX - 112, PY - 150, 11, '#fff', 0.7), glint(446, 262, 18, '#fff6cf', 0.9));
}

// ---------------------------------------------------------------------------------------------------- the clam

function clam(s, PX, PY, PR) {
  const r = s.r, out = [];
  const cx = PX, my = PY + 62;                  // centre of the mouth
  const RX = 178, RY = 46;
  // upper valve: a fluted fan standing open behind the pearl, its nacre lining toward us
  const hinge = [cx, my + 20];
  const N = 8, top = [];
  const fan = (t, k = 1) => {                   // t 0..1 across the fan
    const a = (-168 + 156 * t) * Math.PI / 180;
    return [hinge[0] + Math.cos(a) * 232 * k, hinge[1] - 44 + Math.sin(a) * 250 * k * (0.86 + 0.14 * Math.sin(Math.PI * t))];
  };
  let d = `M${cx - RX + 6} ${my}L${fan(0)[0].toFixed(1)} ${fan(0)[1].toFixed(1)}`;
  for (let i = 0; i < N; i++) {
    const a = fan(i / N), b = fan((i + 1) / N), m = fan((i + 0.5) / N, 1.13);
    d += `Q${m[0].toFixed(1)} ${m[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
    top.push(a);
  }
  d += `L${cx + RX - 6} ${my}Z`;
  // shell thickness: the same fan, a little bigger, behind
  out.push(el('path', { d, fill: '#1b2a55', stroke: '#2b3f73', 'stroke-width': 26, 'stroke-linejoin': 'round' }));
  out.push(el('path', { d, fill: 'none', stroke: '#9fc6ea', 'stroke-width': 3, 'stroke-linejoin': 'round', opacity: 0.55, transform: 'translate(0 -11)' }));
  out.push(el('path', { d, fill: s.rad([[0, '#fff6fb'], [0.16, '#f6d2ec'], [0.4, '#c9aee8'], [0.68, '#7fa6e0'], [0.9, '#4370bc'], [1, '#2a4a90']], PX, PY + 10, 300, true) }));
  const fanClip = s.clip(el('path', { d }));
  const inn = [];
  for (let i = 0; i <= N; i++) {                // flutes
    const a = fan(i / N, 1.02);
    inn.push(el('path', { d: `M${hinge[0]} ${hinge[1]}L${a[0]} ${a[1]}`, stroke: '#3a5aa6', 'stroke-width': 5, opacity: 0.4, filter: 'url(#glow2)' }));
    if (i < N) { const m = fan((i + 0.5) / N, 1.1); inn.push(el('path', { d: `M${hinge[0]} ${hinge[1]}L${m[0]} ${m[1]}`, stroke: '#ffffff', 'stroke-width': 12, opacity: 0.2, filter: 'url(#glow4)' })); }
  }
  for (let k = 0; k < 5; k++) {                 // growth bands of iridescence
    const pts = []; for (let i = 0; i <= 16; i++) pts.push(fan(i / 16, 0.5 + k * 0.11));
    inn.push(el('path', { d: spline(pts), fill: 'none', stroke: ['#ffd9f0', '#c8f6ff', '#fff3c4', '#d8c8ff', '#c8f6ff'][k], 'stroke-width': 7, opacity: 0.3, filter: 'url(#glow2)' }));
  }
  out.push(g({ 'clip-path': fanClip }, inn));
  out.push(el('path', { d, fill: 'none', stroke: '#ffffff', 'stroke-width': 3, opacity: 0.8, 'stroke-linejoin': 'round' }));

  // the mouth: mantle flesh, glowing where the pearl sits
  out.push(el('ellipse', { cx, cy: my, rx: RX, ry: RY, fill: s.rad([[0, '#fff'], [0.3, '#ffd6ee'], [0.6, '#b46ad8'], [0.85, '#3a3a9c'], [1, '#141a55']], 0.5, 0.3, 0.6) }));
  const frill = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2, k = 0.86 + 0.07 * Math.sin(i * 3.1);
    frill.push([cx + Math.cos(a) * RX * k, my + Math.sin(a) * RY * k]);
  }
  out.push(el('path', { d: spline(frill, true, 4), fill: 'none', stroke: '#35e0d0', 'stroke-width': 7, opacity: 0.75, filter: 'url(#glow2)' }));
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + 0.1;
    out.push(el('circle', { cx: cx + Math.cos(a) * RX * 0.74, cy: my + Math.sin(a) * RY * 0.7, r: 2.6, fill: '#fff6a8', opacity: 0.85 }));
  }

  // the pearl
  out.push(el('ellipse', { cx: PX + 4, cy: PY + PR - 2, rx: PR * 0.9, ry: 13, fill: '#3a2a7a', opacity: 0.45, filter: 'url(#glow4)' }));
  out.push(el('circle', { cx: PX, cy: PY, r: PR * 3.3, fill: '#d9f4ff', opacity: 0.22, filter: 'url(#glow64)' }));
  out.push(el('circle', { cx: PX, cy: PY, r: PR * 1.4, fill: '#ffffff', opacity: 0.5, filter: 'url(#glow16)' }));
  out.push(el('circle', { cx: PX, cy: PY, r: PR, fill: s.rad([[0, '#ffffff'], [0.38, '#fffdf6'], [0.64, '#f2d6e8'], [0.85, '#b4a6e2'], [1, '#7a8ed0']], 0.38, 0.34, 0.74) }));
  out.push(el('path', { d: `M${PX - PR * 0.72} ${PY + PR * 0.3}A${PR * 0.8} ${PR * 0.8} 0 0 0 ${PX + PR * 0.5} ${PY + PR * 0.62}`, fill: 'none', stroke: '#9ff0ff', 'stroke-width': 6, opacity: 0.55, 'stroke-linecap': 'round', filter: 'url(#glow2)' }));
  out.push(el('path', { d: `M${PX + PR * 0.5} ${PY - PR * 0.62}A${PR * 0.8} ${PR * 0.8} 0 0 1 ${PX + PR * 0.78} ${PY + PR * 0.1}`, fill: 'none', stroke: '#ffc4e6', 'stroke-width': 5, opacity: 0.6, 'stroke-linecap': 'round', filter: 'url(#glow2)' }));
  out.push(el('ellipse', { cx: PX - PR * 0.3, cy: PY - PR * 0.36, rx: PR * 0.3, ry: PR * 0.2, fill: '#fff', transform: `rotate(-35 ${PX - PR * 0.3} ${PY - PR * 0.36})`, filter: 'url(#glow2)' }));
  out.push(el('circle', { cx: PX, cy: PY, r: PR, fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.9 }));

  // lower valve: a fluted bowl, weed-grown outside, bright scalloped lip
  const lipY = (x) => my + RY * Math.sqrt(Math.max(0, 1 - Math.pow((x - cx) / RX, 2)));
  const M = 9;
  let lo = `M${cx - RX - 8} ${my - 4}`;
  for (let i = 0; i < M; i++) {
    const xa = cx - RX - 8 + (2 * RX + 16) * (i / M), xb = cx - RX - 8 + (2 * RX + 16) * ((i + 1) / M), xm = (xa + xb) / 2;
    lo += `Q${xm} ${lipY(xm) - 16} ${xb} ${i === M - 1 ? my - 4 : lipY(xb) + 6}`;
  }
  lo += `C${cx + RX + 6} ${my + 92} ${cx + 110} ${my + 172} ${cx} ${my + 176}C${cx - 110} ${my + 172} ${cx - RX - 6} ${my + 92} ${cx - RX - 8} ${my - 4}Z`;
  out.push(el('path', { d: lo, fill: s.lin([[0, '#9ab4dc'], [0.16, '#4d6aa6'], [0.5, '#22356e'], [1, '#0a1238']]) }));
  const loClip = s.clip(el('path', { d: lo }));
  const li = [];
  for (let i = 0; i <= M; i++) {
    const xa = cx - RX - 8 + (2 * RX + 16) * (i / M);
    li.push(el('path', { d: `M${xa} ${lipY(xa) + 2}Q${cx + (xa - cx) * 0.75} ${my + 110} ${cx + (xa - cx) * 0.2} ${my + 180}`, fill: 'none', stroke: '#050a2a', 'stroke-width': 7, opacity: 0.6, filter: 'url(#glow2)' }));
    if (i < M) { const xm = xa + (RX + 8) / M; li.push(el('path', { d: `M${xm} ${lipY(xm) - 4}Q${cx + (xm - cx) * 0.75} ${my + 100} ${cx + (xm - cx) * 0.2} ${my + 180}`, fill: 'none', stroke: '#b9d6ff', 'stroke-width': 9, opacity: 0.22, filter: 'url(#glow4)' })); }
  }
  for (let i = 0; i < 46; i++) {                // barnacles and weed specks
    const x = cx + r.range(-RX, RX), y = my + r.range(40, 170), k = r.range(2, 6);
    li.push(el('circle', { cx: x, cy: y, r: k, fill: r() < 0.6 ? '#0c1a44' : '#3c8f8a', opacity: r.range(0.3, 0.7) }));
    li.push(el('circle', { cx: x - k * 0.2, cy: y - k * 0.3, r: k * 0.4, fill: '#bfe0ff', opacity: 0.35 }));
  }
  li.push(el('ellipse', { cx, cy: my + 190, rx: RX, ry: 60, fill: '#02061c', opacity: 0.6, filter: 'url(#glow16)' }));
  li.push(el('ellipse', { cx: PX, cy: my + 26, rx: RX * 0.8, ry: 34, fill: '#fff', opacity: 0.55, filter: 'url(#glow16)' }));
  out.push(g({ 'clip-path': loClip }, li));
  // the lip itself catches the pearl's light
  let lipD = `M${cx - RX - 8} ${my - 4}`;
  for (let i = 0; i < M; i++) {
    const xa = cx - RX - 8 + (2 * RX + 16) * (i / M), xb = cx - RX - 8 + (2 * RX + 16) * ((i + 1) / M), xm = (xa + xb) / 2;
    lipD += `Q${xm} ${lipY(xm) - 16} ${xb} ${i === M - 1 ? my - 4 : lipY(xb) + 6}`;
  }
  out.push(el('path', { d: lipD, fill: 'none', stroke: '#ffffff', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.9, filter: 'url(#bloomS)' }));
  return g({}, out);
}

// ---------------------------------------------------------------------------------------------------- the diver

function diver(s, PX, PY, GY) {
  const r = s.r;
  const H = [372, 312], HR = 76;                // helmet
  // canvas suit: shadowed away from the pearl, warm where its light lands
  const suit = s.lin([[0, '#3a2a1c'], [0.35, '#6e5333'], [0.7, '#b0905c'], [1, '#f0dcaa']], 220, 0, 520, 0, true);
  const suitDk = s.lin([[0, '#241a14'], [0.5, '#4c3a26'], [1, '#86694a']], 220, 0, 520, 0, true);
  const brass = s.lin([[0, '#5a2606'], [0.3, '#c06c0e'], [0.6, '#f7ac24'], [0.85, '#ffdc70'], [1, '#fff6cf']], 0, 0, 1, 0.25);
  const lead = s.lin([[0, '#1d2433'], [1, '#8b9bb5']], 0, 0, 1, 0.3);
  const fold = (pts, w = 3, o = 0.5, c = '#1d0f0a') => el('path', { d: spline(pts), fill: 'none', stroke: c, 'stroke-width': w, 'stroke-linecap': 'round', opacity: o });
  const bulge = (t) => 1 + 0.16 * Math.sin(Math.PI * t);

  const back = [], body = [], front = [];

  // air hose trailing up and away, ribbed
  const hose = [[H[0] - 58, H[1] - 38], [272, 218], [236, 120], [300, 30], [262, -60]];
  back.push(el('path', { d: spline(hose), fill: 'none', stroke: '#160d0a', 'stroke-width': 17, 'stroke-linecap': 'round' }));
  back.push(el('path', { d: spline(hose), fill: 'none', stroke: s.lin([[0, '#3a2c2a'], [0.5, '#8a6a3c'], [1, '#d9aa58']], 0, -60, 0, 290, true), 'stroke-width': 12, 'stroke-linecap': 'round' }));
  back.push(el('path', { d: spline(hose), fill: 'none', stroke: '#22130c', 'stroke-width': 12, 'stroke-dasharray': '2 9', opacity: 0.7 }));
  back.push(el('path', { d: spline(hose.map((p) => [p[0] + 3, p[1] - 1])), fill: 'none', stroke: '#ffe6a8', 'stroke-width': 2, opacity: 0.6 }));

  // far arm, swung back for balance
  const armB = [[318, 432], [262, 492], [236, 566]];
  back.push(el('path', { d: ribbon(armB, 54, 40, bulge), fill: suitDk }));
  back.push(fold([[280, 462], [262, 480], [250, 470]]), fold([[262, 510], [246, 522], [238, 512]]));
  back.push(mitt(s, 232, 590, 100, 0.95, false));
  back.push(el('path', { d: ribbon([[240, 552], [234, 572]], 46, 44), fill: brass }));

  // far leg (planted behind)
  const legB = [[340, 590], [318, 680], [300, 762]];
  back.push(el('path', { d: ribbon(legB, 74, 50, bulge), fill: suitDk }));
  back.push(fold([[300, 668], [318, 682], [338, 672]]), fold([[296, 700], [314, 712], [332, 704]], 3, 0.4));
  back.push(boot(s, 304, GY, 0.95, true));

  // near leg, striding toward the clam
  const legF = [[390, 592], [452, 672], [446, 762]];
  body.push(el('path', { d: ribbon(legF, 78, 52, bulge), fill: suit }));
  body.push(fold([[424, 660], [448, 680], [476, 664]]), fold([[428, 692], [450, 706], [472, 696]], 3, 0.4), fold([[384, 620], [410, 640], [428, 624]], 3, 0.35));
  body.push(fold([[462, 636], [478, 686], [470, 740]], 4, 0.55, '#ffe9b0'));
  body.push(boot(s, 454, GY, 1.05, false));

  // torso
  const torso = 'M296 420C286 480 292 548 316 606C352 624 408 622 432 600C448 548 452 480 446 420C404 396 336 396 296 420Z';
  body.push(el('path', { d: torso, fill: suit }));
  body.push(fold([[312, 470], [330, 520], [322, 580]], 4, 0.45), fold([[352, 500], [362, 540], [354, 590]], 3, 0.35), fold([[400, 480], [396, 530], [408, 570]], 3, 0.3));
  body.push(fold([[436, 440], [442, 500], [432, 580]], 5, 0.6, '#ffe9b0'));
  // belt with lead weights and a knife
  body.push(el('path', { d: ribbon([[296, 572], [364, 596], [438, 574]], 26, 26), fill: '#24140c' }));
  for (let i = 0; i < 4; i++) body.push(el('rect', { x: 306 + i * 33, y: 566 + [6, 13, 13, 5][i], width: 24, height: 34, rx: 4, fill: lead, stroke: '#0c1018', 'stroke-width': 1.5 }));
  body.push(el('rect', { x: 356, y: 570, width: 22, height: 22, rx: 3, fill: brass, stroke: '#3a1c06', 'stroke-width': 2 }));

  // corselet: the brass breastplate the helmet bolts to
  const cors = 'M268 428C272 392 312 368 372 366C432 368 470 392 474 428C452 448 426 458 404 492C388 512 356 512 340 492C318 458 290 448 268 428Z';
  body.push(el('path', { d: cors, fill: brass, stroke: '#3a1c06', 'stroke-width': 3 }));
  body.push(el('path', { d: 'M284 424C292 398 322 382 372 380C422 382 452 398 460 424', fill: 'none', stroke: '#fff3c0', 'stroke-width': 3, opacity: 0.7 }));
  for (let i = 0; i < 7; i++) {
    const t = i / 6, x = 286 + 172 * t, y = 430 + Math.sin(Math.PI * t) * 46;
    body.push(el('circle', { cx: x, cy: y, r: 6.5, fill: '#5a2e0a' }), el('circle', { cx: x + 1.5, cy: y - 1.5, r: 3.6, fill: '#ffe9a0' }));
  }
  body.push(el('rect', { x: 352, y: 452, width: 40, height: 46, rx: 6, fill: lead, stroke: '#0c1018', 'stroke-width': 2 }));

  // helmet
  body.push(el('ellipse', { cx: H[0] - 2, cy: H[1] + 68, rx: 64, ry: 20, fill: brass, stroke: '#3a1c06', 'stroke-width': 3 }));
  body.push(el('circle', { cx: H[0], cy: H[1], r: HR, fill: s.rad([[0, '#fffbe0'], [0.16, '#ffd45a'], [0.48, '#f09a12'], [0.8, '#a04c08'], [1, '#4a1c04']], 0.68, 0.36, 0.8), stroke: '#2e1404', 'stroke-width': 3 }));
  // cool bounce from the water on the shadow side
  body.push(el('path', { d: `M${H[0] - HR * 0.86} ${H[1] + HR * 0.4}A${HR * 0.94} ${HR * 0.94} 0 0 1 ${H[0] - HR * 0.6} ${H[1] - HR * 0.72}`, fill: 'none', stroke: '#6fc4ff', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.5, filter: 'url(#glow2)' }));
  // seam band over the crown
  body.push(el('path', { d: `M${H[0] - 46} ${H[1] - 60}Q${H[0] + 6} ${H[1] - 30} ${H[0] + 14} ${H[1] + 72}`, fill: 'none', stroke: '#5a2c08', 'stroke-width': 4, opacity: 0.55 }));
  // hose elbow and exhaust valve at the back
  body.push(el('rect', { x: H[0] - 84, y: H[1] - 52, width: 34, height: 22, rx: 7, fill: brass, stroke: '#2e1404', 'stroke-width': 2.5, transform: `rotate(28 ${H[0] - 66} ${H[1] - 40})` }));
  body.push(el('circle', { cx: H[0] - 70, cy: H[1] + 16, r: 13, fill: brass, stroke: '#2e1404', 'stroke-width': 2.5 }), el('circle', { cx: H[0] - 70, cy: H[1] + 16, r: 5, fill: '#2e1404' }));
  // top light
  body.push(port(s, H[0] + 4, H[1] - 54, 20, 10, -6, false));
  // side window with a grille
  body.push(port(s, H[0] - 26, H[1] + 6, 17, 25, 0, true));
  // the faceplate, turned to the pearl and full of its light
  body.push(port(s, H[0] + 40, H[1] + 12, 31, 38, 8, false, true));
  // specular kiss on the dome
  body.push(el('ellipse', { cx: H[0] + 24, cy: H[1] - 44, rx: 22, ry: 9, fill: '#fff', opacity: 0.85, transform: `rotate(24 ${H[0] + 24} ${H[1] - 44})`, filter: 'url(#glow2)' }));

  // near arm reaching for the pearl
  const armF = [[424, 432], [486, 496], [548, 546]];
  front.push(el('path', { d: ribbon(armF, 62, 42, bulge), fill: s.lin([[0, '#6e5333'], [0.5, '#bfa06a'], [1, '#fff0c4']], 410, 0, 570, 0, true) }));
  front.push(fold([[470, 470], [482, 496], [470, 516]], 3.5, 0.5), fold([[494, 488], [504, 508], [494, 528]], 3, 0.4), fold([[440, 452], [470, 500], [520, 540]], 4, 0.5, '#fff0c0'));
  front.push(el('path', { d: ribbon([[536, 536], [556, 552]], 50, 46), fill: brass, stroke: '#3a1c06', 'stroke-width': 2 }));
  front.push(mitt(s, 574, 566, 38, 1.05, true));

  const stitch = (pts, o = 0.55) => el('path', { d: spline(pts), fill: 'none', stroke: '#fbe8b8', 'stroke-width': 1.7, 'stroke-dasharray': '5 5', opacity: o, 'stroke-linecap': 'round' });
  const patch = (x, y, rx, ry, rot) => g({ transform: `rotate(${rot} ${x} ${y})` }, [el('ellipse', { cx: x, cy: y, rx, ry, fill: '#7a5c36', stroke: '#2a1810', 'stroke-width': 1.5, opacity: 0.85 }), el('ellipse', { cx: x, cy: y, rx: rx - 4, ry: ry - 4, fill: 'none', stroke: '#fbe8b8', 'stroke-width': 1.4, 'stroke-dasharray': '4 4', opacity: 0.6 })]);
  const legX = [patch(452, 676, 21, 27, -8), stitch([[404, 600], [440, 664], [436, 752]], 0.45), el('path', { d: ribbon([[420, 742], [446, 750], [472, 742]], 12, 12), fill: '#2a1810' }), el('path', { d: ribbon([[284, 744], [302, 750], [322, 744]], 11, 11), fill: '#160c08' })];
  body.splice(7, 0, stitch([[372, 420], [366, 500], [372, 580]], 0.45), patch(322, 520, 15, 22, 6));
  front.splice(1, 0, el('path', { d: spline([[424, 462], [476, 520], [528, 562]]), fill: 'none', stroke: '#2a1408', 'stroke-width': 9, opacity: 0.3, 'stroke-linecap': 'round', filter: 'url(#glow2)' }), stitch([[436, 428], [492, 484], [540, 524]], 0.5), patch(488, 500, 16, 20, -42));
  // legs stay planted; everything above the hips leans in toward the pearl
  const hoseG = g({ transform: 'translate(-44 0) rotate(11 370 604)' }, back.splice(0, 4));
  const legsB = back.filter((_, i) => i >= back.length - 4), upB = back.filter((_, i) => i < back.length - 4);
  const legsF = body.splice(0, 6);
  const lean = (inner) => g({ transform: 'rotate(11 370 604)' }, inner);
  const fig = g({ transform: 'translate(-44 0)' }, [lean(upB), ...legsB, ...legsF, ...legX, lean([...body, ...front])]);
  // form shadow: the side turned from the pearl sinks into the blue of the water
  s.def('<filter id="pdWhite"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>');
  const sil = s.mask(g({ filter: 'url(#pdWhite)' }, fig));
  const shade = el('rect', { x: 0, y: 0, width: 1024, height: 1024, mask: sil, fill: s.lin([[0, '#1a0c3a', 0], [0.4, '#160a38', 0.22], [1, '#070a30', 0.78]], 560, 600, 170, 330, true) });
  // volume from the pearl (low right) and from the beam (above)
  const lit = g({ filter: s.emboss({ color: '#fff4d6', az: 290, elev: 48, depth: 7, k: 0.5, exp: 18, blur: 6 }) },
    g({ filter: s.emboss({ color: '#e6f6ff', az: 35, elev: 38, depth: 9, k: 0.95, exp: 14, blur: 7 }) }, [fig, shade]));
  return g({}, [hoseG, g({ filter: 'url(#shadow)' }, lit)]);
}

/** A porthole: brass ring, dark glass. `bars` adds a grille; `glow` fills it with the pearl's light. */
function port(s, x, y, rx, ry, rot, bars, glow = false) {
  const p = [];
  p.push(el('ellipse', { cx: x, cy: y, rx: rx + 8, ry: ry + 8, fill: s.lin([[0, '#5a2c08'], [0.5, '#f2bd50'], [1, '#fff3c0']], 0, 0, 1, 0.4), stroke: '#2e1404', 'stroke-width': 2.5 }));
  p.push(el('ellipse', { cx: x, cy: y, rx, ry, fill: glow ? s.rad([[0, '#ffffff'], [0.3, '#c9f2ff'], [0.7, '#3a8fd0'], [1, '#0a2a5c']], 0.72, 0.7, 0.8) : s.rad([[0, '#3a7ab8'], [1, '#06142e']], 0.6, 0.6, 0.7), stroke: '#1c0c02', 'stroke-width': 3 }));
  if (bars) for (let i = -1; i <= 1; i++) p.push(el('rect', { x: x - rx, y: y + i * ry * 0.5 - 2, width: rx * 2, height: 4, fill: '#e2a840', stroke: '#2e1404', 'stroke-width': 1 }));
  if (glow) {
    p.push(el('path', { d: `M${x - rx * 0.6} ${y - ry * 0.35}Q${x - rx * 0.3} ${y - ry * 0.8} ${x + rx * 0.3} ${y - ry * 0.7}`, fill: 'none', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.8 }));
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; p.push(el('circle', { cx: x + Math.cos(a) * (rx + 4), cy: y + Math.sin(a) * (ry + 4), r: 2.2, fill: '#4a2408' })); }
  } else p.push(el('ellipse', { cx: x - rx * 0.25, cy: y - ry * 0.35, rx: rx * 0.35, ry: ry * 0.2, fill: '#cfeeff', opacity: 0.6 }));
  return g({ transform: `rotate(${rot} ${x} ${y})` }, p);
}

/** A three-fingered diving mitt at (x, y), pointing along `deg`. */
function mitt(s, x, y, deg, k, lit) {
  const f = lit ? s.lin([[0, '#7a4a22'], [1, '#ffe2a0']], 0, 0, 1, 0.5) : '#3a2216';
  const p = [];
  p.push(el('ellipse', { cx: 0, cy: 0, rx: 22, ry: 17, fill: f }));
  p.push(el('path', { d: ribbon([[8, -10], [30, -16], [44, -10]], 13, 9), fill: f }));
  p.push(el('path', { d: ribbon([[12, 0], [36, 0], [50, 6]], 14, 9), fill: f }));
  p.push(el('path', { d: ribbon([[8, 10], [28, 16], [38, 24]], 13, 9), fill: f }));
  p.push(el('path', { d: ribbon([[-6, -12], [4, -28], [16, -32]], 12, 8), fill: f }));
  return g({ transform: `translate(${x} ${y}) rotate(${deg}) scale(${k})` }, p);
}

/** A weighted boot standing on the seabed at (x, gy), toe to the right. */
function boot(s, x, gy, k, dark) {
  const p = [];
  const leather = dark ? s.lin([[0, '#1a0e0a'], [1, '#5a3a20']], 0, 0, 1, 0) : s.lin([[0, '#3a2012'], [0.6, '#a87438'], [1, '#f0cc88']], 0, 0, 1, 0);
  p.push(el('path', { d: 'M-34 -52C-36 -30 -36 -14 -34 0L62 0C64 -22 46 -34 22 -36C18 -44 18 -50 16 -56Z', fill: leather, stroke: '#1a0c06', 'stroke-width': 2.5 }));
  p.push(el('path', { d: 'M30 -34C52 -32 64 -20 62 0L28 0C26 -12 26 -24 30 -34Z', fill: s.lin([[0, '#8a5212'], [0.6, '#f2bd50'], [1, '#fff3c0']], 0, 0, 1, 0.3), stroke: '#3a1c06', 'stroke-width': 2 }));
  p.push(el('rect', { x: -40, y: -2, width: 108, height: 15, rx: 5, fill: s.lin([[0, '#141a26'], [1, '#7d8ca6']], 0, 0, 1, 0), stroke: '#080b12', 'stroke-width': 2 }));
  p.push(el('rect', { x: -36, y: -34, width: 56, height: 8, rx: 3, fill: '#1a0e0a' }), el('rect', { x: -8, y: -37, width: 14, height: 14, rx: 2, fill: '#e8b048', stroke: '#3a1c06', 'stroke-width': 1.5 }));
  return g({ transform: `translate(${x} ${gy - 12}) scale(${k})` }, p);
}

/** A far sea-fan: a little tree of branching strokes. */
function fan(s, x, y, h, color) {
  const r = s.r, p = [];
  const grow = (x0, y0, a, len, w, depth) => {
    const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len;
    p.push(el('path', { d: `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`, stroke: color, 'stroke-width': w, 'stroke-linecap': 'round' }));
    if (depth > 0) for (const da of [-0.45, 0.4]) grow(x1, y1, a + da + r.range(-0.15, 0.15), len * 0.7, w * 0.7, depth - 1);
  };
  grow(x, y, -Math.PI / 2 + r.range(-0.15, 0.15), h * 0.36, 5, 4);
  return g({ opacity: 0.7 }, p);
}
