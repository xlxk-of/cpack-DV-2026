// CORAL COLOSSUS (epic) — a walking reef: boulders bound together by living coral, striding through the shafts of
// light with whole shoals wheeling round its shoulders.
import { el, g, spline, ribbon, sample, poly, blob, orb, glint } from '../lib.mjs';

const NEAR = { l: '#ffd2a0', m: '#ff7a72', d: '#a03a88', sh: '#4a1a6a', hi: '#ffe8c0' };
const MID = { l: '#f8b090', m: '#dc5e80', d: '#6c2e84', sh: '#34185e', hi: '#ffdcc0' };
const FAR = { l: '#b884a4', m: '#80509a', d: '#382c72', sh: '#141444', hi: '#e8c8e4' };

export function build(s) {
  const r = s.r;

  // ---- 0: sunlit water, the surface far overhead
  s.backdrop(s.lin([[0, '#8fe8f4'], [0.1, '#44b6e0'], [0.38, '#1c6eb4'], [0.72, '#103c86'], [1, '#08184c']]));
  s.add(0, el('ellipse', { cx: 540, cy: -40, rx: 560, ry: 330, fill: s.rad([[0, '#ffffff', 0.95], [0.4, '#c8fbff', 0.5], [1, '#c8fbff', 0]]) }));
  s.rays({ x: 540, y: -220, angle: 92, spread: 78, n: 13, color: '#eaffff', opacity: 0.34, width: 110, len: 1400, blur: 12 });
  s.rays({ x: 540, y: -220, angle: 90, spread: 40, n: 5, color: '#fff6d8', opacity: 0.2, width: 60, len: 1300, blur: 8 });
  mist(s, { color: '#9fe6ff', opacity: 0.3, freq: 0.005, cx: 512, cy: 300, rx: 800, ry: 460 });
  mist(s, { color: '#5a3ac8', opacity: 0.32, freq: 0.006, cx: 512, cy: 900, rx: 900, ry: 380 });
  s.motes({ n: 90, rmin: 0.6, rmax: 2, color: '#dffaff', opacity: 0.5, glow: false, layer: 0 });
  s.vignette({ strength: 0.6, cy: 0.4 });
  s.grain({ opacity: 0.18 });

  // ---- 1: the far reef, hazed blue; a wreck no bigger than its foot
  s.ridge({ y: 770, amp: 150, detail: 0.9, fill: s.lin([[0, '#2a78bc'], [1, '#143c84']]), layer: 1, opacity: 0.6 });
  const farRock = s.lin([[0, '#2a6cb4'], [1, '#122c70']]);
  const stack = (x, y, w, h, seed) => g({ filter: s.rough(12, 0.02, seed) }, [
    el('path', { d: `M${x - w} ${y + 300}L${x - w * 0.8} ${y - h * 0.3}L${x - w * 0.5} ${y - h * 0.5}L${x - w * 0.3} ${y - h}L${x + w * 0.2} ${y - h * 0.94}L${x + w * 0.5} ${y - h * 0.6}L${x + w * 0.9} ${y - h * 0.36}L${x + w * 1.1} ${y + 300}Z`, fill: farRock }),
    el('path', { d: `M${x - w * 0.8} ${y - h * 0.3}L${x - w * 0.5} ${y - h * 0.5}L${x - w * 0.3} ${y - h}L${x + w * 0.2} ${y - h * 0.94}`, fill: 'none', stroke: '#8fd8f4', 'stroke-width': 3, opacity: 0.25 }),
  ]);
  s.add(1, g({ opacity: 0.75 }, [stack(96, 800, 90, 330, 3), stack(930, 800, 100, 400, 5), stack(790, 830, 60, 210, 8), stack(232, 840, 50, 170, 4)]));
  // far shoal passing behind its head
  s.add(1, el('path', { d: shoal([[-40, 330], [150, 250], [330, 190], [520, 150], [720, 170], [900, 110], [1060, 60]], 230, 34, 7, r), fill: '#d8f6ff', opacity: 0.6 }));
  s.ridge({ y: 880, amp: 90, detail: 1, fill: s.lin([[0, '#1c4a9c'], [0.5, '#122c72'], [1, '#0a1648']]), layer: 1 });
  // the little wreck
  s.add(1, g({ transform: 'translate(742 846) rotate(-10)', opacity: 0.9 }, [
    el('path', { d: 'M-50 0Q-40 26 0 28Q44 26 56 -6L30 -2L-30 2Z', fill: '#0c1c50' }),
    el('path', { d: 'M-12 2V-60M18 0V-44M-30 -34H8M4 -26H32', stroke: '#0c1c50', 'stroke-width': 4, fill: 'none' }),
    el('path', { d: 'M-28 -32Q-18 -12 4 -32Z', fill: '#0c1c50', opacity: 0.8 }),
  ]));
  for (let i = 0; i < 14; i++) {
    const x = r.range(20, 1000), y = r.range(850, 930);
    s.add(1, g({ opacity: 0.8 }, coralTree(x, y, r.range(10, 22), 2, r, { base: '#16347c', tip: '#3a7ac8', light: null, w: 3.2 })));
  }

  // ---- 2: the colossus
  const C = [];
  const LIGHT = [-0.42, -0.91];
  // cast shadows and depth shared by every stone (each stone clips them to itself)
  const shade = [
    el('rect', { x: 0, y: 0, width: 1024, height: 1100, fill: s.lin([[0, '#1a1458', 0], [0.3, '#1a1458', 0], [1, '#1a1458', 0.5]], 0, 0, 0, 1060, true) }),
    el('rect', { x: 0, y: 0, width: 1024, height: 700, fill: s.lin([[0, '#ffa850', 0.5], [0.45, '#ff8a50', 0.26], [1, '#ff8a50', 0]], 0, 180, 0, 640, true) }),
    ...[[512, 604, 210, 74], [258, 432, 96, 64], [770, 424, 96, 64], [512, 752, 180, 56], [512, 296, 96, 34], [226, 690, 90, 40], [806, 676, 80, 36], [410, 838, 100, 40], [628, 832, 90, 40]]
      .map(([x, y, rx, ry]) => el('ellipse', { cx: x, cy: y, rx, ry, fill: s.rad([[0, '#160f48', 0.8], [0.6, '#160f48', 0.4], [1, '#160f48', 0]]) })),
  ];
  const crag = (cx, cy, rx, ry, n = 8, jit = 0.1) => {
    const V = [], a0 = r.range(0, 6.28);
    for (let i = 0; i < n; i++) {
      const a = a0 + (i + r.range(-0.22, 0.22)) / n * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
      const k = Math.pow(Math.max(Math.abs(c), Math.abs(sn)), -0.5) * (1 + r.range(-jit, jit)) * 0.9;
      V.push([cx + c * rx * k, cy + sn * ry * k]);
    }
    return V;
  };
  const chamfer = (V, f = 0.22) => {
    const P = [];
    for (let i = 0; i < V.length; i++) { const a = V[i], b = V[(i + 1) % V.length]; P.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], [b[0] + (a[0] - b[0]) * f, b[1] + (a[1] - b[1]) * f]); }
    return spline(P, true, 4);
  };
  // one faceted stone from its corner points
  const stone = (V, pal, { polyps = 10, extra = [] } = {}) => {
    const d = chamfer(V), n = V.length;
    let cx = 0, cy = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const v of V) { cx += v[0] / n; cy += v[1] / n; x0 = Math.min(x0, v[0]); x1 = Math.max(x1, v[0]); y0 = Math.min(y0, v[1]); y1 = Math.max(y1, v[1]); }
    const rx = (x1 - x0) / 2, ry = (y1 - y0) / 2, px = cx - rx * 0.16, py = cy - ry * 0.24;
    const inn = [];
    for (let i = 0; i < n; i++) {
      const a = V[i], b = V[(i + 1) % n];
      let nx = b[1] - a[1], ny = -(b[0] - a[0]); const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
      if (nx * ((a[0] + b[0]) / 2 - cx) + ny * ((a[1] + b[1]) / 2 - cy) < 0) { nx = -nx; ny = -ny; }
      const lit = nx * LIGHT[0] + ny * LIGHT[1], tri = `M${px} ${py}L${a[0] * 1.02 - cx * 0.02} ${a[1] * 1.02 - cy * 0.02}L${b[0] * 1.02 - cx * 0.02} ${b[1] * 1.02 - cy * 0.02}Z`;
      inn.push(el('path', { d: tri, fill: lit > 0 ? pal.hi : pal.sh, opacity: lit > 0 ? lit * 0.62 : -lit * 0.6, stroke: lit > 0 ? pal.hi : pal.sh, 'stroke-width': 1, 'stroke-opacity': 0.3 }));
    }
    for (let i = 0; i < n; i += 2) inn.push(el('path', { d: `M${px} ${py}L${V[i][0]} ${V[i][1]}`, stroke: pal.sh, 'stroke-width': 2, opacity: 0.3 }));
    // pits and scars
    for (let i = 0; i < 2 + rx / 30; i++) {
      const a = r.range(0, Math.PI * 2), q0 = [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry], q1 = [cx + r.range(-0.3, 0.3) * rx, cy + r.range(-0.3, 0.3) * ry], m = [(q0[0] + q1[0]) / 2 + r.range(-12, 12), (q0[1] + q1[1]) / 2 + r.range(-12, 12)];
      inn.push(el('path', { d: poly([q0, m, q1]), fill: 'none', stroke: pal.sh, 'stroke-width': r.range(1.6, 3.2), opacity: 0.55, 'stroke-linejoin': 'round' }));
      inn.push(el('path', { d: poly([q0, m, q1]), fill: 'none', stroke: pal.hi, 'stroke-width': 1, opacity: 0.35, transform: 'translate(2 3)' }));
    }
    for (let i = 0; i < rx * ry / 500; i++) {
      const x = cx + r.range(-1, 1) * rx, y = cy + r.range(-1, 1) * ry, rr = r.range(1.2, 4);
      inn.push(el('circle', { cx: x, cy: y, r: rr, fill: pal.sh, opacity: 0.4 }), el('circle', { cx: x + rr * 0.4, cy: y + rr * 0.4, r: rr * 0.5, fill: pal.hi, opacity: 0.3 }));
    }
    // living crust on the shoulders of each stone: polyps and little cups
    for (let i = 0; i < polyps; i++) {
      const x = cx + r.range(-0.95, 0.6) * rx, y = y0 + Math.pow(r(), 1.8) * ry * 0.9, rr = r.range(2.5, 6.5);
      inn.push(el('circle', { cx: x, cy: y, r: rr, fill: r.pick(['#ffbe72', '#ff9a80', '#ffe09a', '#ff7aa0']), opacity: 0.9 }));
      inn.push(el('circle', { cx: x, cy: y, r: rr * 0.4, fill: '#8a2a64', opacity: 0.8 }));
    }
    return g({}, [el('path', { d, fill: s.lin([[0, pal.l], [0.4, pal.m], [1, pal.d]], 0.25, 0, 0.7, 1) }), g({ 'clip-path': s.clip(el('path', { d })) }, [...inn, ...extra, ...shade])]);
  };
  const boulder = (cx, cy, rx, ry, pal, o = {}) => stone(crag(cx, cy, rx, ry, o.n || 8, o.jit ?? 0.1), pal, o);

  // light living in the joints: it leaks out between the stones
  const joints = [[512, 286, 44], [512, 566, 70], [512, 648, 70], [250, 392, 50], [770, 386, 46], [240, 524, 40], [786, 516, 36], [222, 676, 44], [808, 664, 36], [430, 708, 50], [602, 706, 44], [412, 838, 50], [624, 832, 40], [390, 968, 50], [644, 958, 40]];
  C.push(g({ filter: 'url(#glow8)' }, joints.map(([x, y, rr]) => el('circle', { cx: x, cy: y, r: rr, fill: '#ffae5a', opacity: 0.95 }))));

  // growths behind the shoulders
  C.push(...coralTree(700, 240, 50, 3, r, { base: '#b0507e', tip: '#f0a0a8', ang: -1.2, w: 10 }));
  C.push(...coralTree(756, 262, 44, 3, r, { base: '#b0507e', tip: '#f0a0a8', ang: -0.85, w: 9 }));

  // far leg and far arm
  C.push(boulder(606, 762, 70, 80, FAR, { polyps: 5 }));
  C.push(boulder(636, 896, 76, 90, FAR, { polyps: 4 }));
  C.push(boulder(652, 1006, 104, 50, FAR, { polyps: 3 }));
  C.push(boulder(766, 448, 56, 80, FAR, { polyps: 5 }));
  C.push(boulder(802, 590, 70, 100, MID, { polyps: 8 }));
  C.push(boulder(814, 724, 76, 66, MID, { polyps: 5, n: 7 }));
  // pelvis, belly
  C.push(boulder(512, 694, 126, 60, MID, { n: 9, polyps: 6 }));
  C.push(boulder(512, 608, 94, 56, MID, { n: 7, polyps: 4 }));
  // near leg
  C.push(boulder(426, 772, 84, 86, MID));
  C.push(boulder(402, 906, 94, 100, NEAR));
  C.push(boulder(380, 1014, 134, 56, NEAR, { n: 9 }));

  // chest, split by fissures of light from the heart-coral
  const chestV = [[336, 334], [398, 262], [512, 244], [626, 262], [688, 334], [704, 444], [642, 544], [512, 584], [382, 544], [320, 444]];
  const fiss = [], cracks = [];
  const crack = (x, y, a, L, w) => {
    const pts = [[x, y]]; let cx2 = x, cy2 = y, aa = a;
    for (let i = 0; i < 4; i++) { aa += r.range(-0.6, 0.6); cx2 += Math.cos(aa) * L / 4; cy2 += Math.sin(aa) * L / 4; pts.push([cx2, cy2]); if (i === 1 && L > 60) crack(cx2, cy2, aa + r.sign() * r.range(0.6, 1.1), L * 0.55, w * 0.6); }
    fiss.push(el('path', { d: poly(pts), fill: 'none', stroke: '#ff7a2a', 'stroke-width': w * 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    cracks.push(el('path', { d: poly(pts), fill: 'none', stroke: '#6a1a50', 'stroke-width': w * 1.9, opacity: 0.7, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }), el('path', { d: poly(pts), fill: 'none', stroke: '#fff2c0', 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
  };
  for (let i = 0; i < 5; i++) crack(520 + Math.cos(i * 1.26 + 0.4) * 18, 430 + Math.sin(i * 1.26 + 0.4) * 18, i * 1.26 + 0.4 + r.range(-0.2, 0.2), r.range(80, 140), 2.8);
  const heartD = blob(520, 430, 30, 34, r, 7, 0.22);
  C.push(stone(chestV, NEAR, { polyps: 26, extra: [g({ filter: 'url(#glow8)', opacity: 0.95 }, fiss), ...cracks] }));
  C.push(el('circle', { cx: 520, cy: 430, r: 64, fill: '#ffae4a', opacity: 0.5, filter: 'url(#glow16)' }));
  C.push(el('path', { d: heartD, fill: s.rad([[0, '#fffbe0'], [0.45, '#ffd06a'], [1, '#f0603a']], 0.45, 0.4, 0.7), stroke: '#8a2450', 'stroke-width': 2.5 }));
  C.push(el('path', { d: 'M506 412Q520 426 512 448M528 414Q520 430 532 446', fill: 'none', stroke: '#f0703a', 'stroke-width': 2, opacity: 0.6, 'stroke-linecap': 'round' }));
  C.push(el('ellipse', { cx: 512, cy: 418, rx: 9, ry: 6, fill: '#fff', opacity: 0.75, filter: 'url(#glow2)' }));

  // coral crown behind the head, then the head
  for (const [x, a, L] of [[478, -1.95, 34], [500, -1.68, 44], [526, -1.42, 40], [548, -1.15, 32]]) C.push(...coralTree(x, 204, L, 2, r, { base: '#e85a7a', tip: '#ffd0a8', ang: a, w: 7 }));
  C.push(stone([[462, 226], [484, 192], [540, 190], [564, 224], [560, 268], [534, 290], [490, 290], [464, 266]], NEAR, { polyps: 3 }));
  // eye sockets and eyes
  const eyes = 'M472 240L504 251L502 260L478 257ZM552 240L520 251L522 260L546 257Z';
  C.push(el('path', { d: 'M464 234L508 246L506 266L472 264ZM560 234L516 246L518 266L552 264Z', fill: '#24103c' }));
  C.push(el('path', { d: eyes, fill: '#ffd25a', filter: 'url(#glow8)' }));
  C.push(el('path', { d: eyes, fill: '#fffbe0', filter: 'url(#bloomS)' }));
  // brow slab
  C.push(stone([[452, 236], [470, 200], [512, 206], [554, 200], [572, 236], [540, 230], [512, 244], [484, 230]], NEAR, { polyps: 0 }));

  // shoulder growths, then the shoulders
  C.push(...coralTree(272, 250, 66, 4, r, { base: '#e8507a', tip: '#ffc0a0', ang: -1.95, w: 14 }));
  C.push(...coralTree(336, 236, 58, 3, r, { base: '#f0784a', tip: '#ffe0a0', ang: -1.5, w: 12 }));
  C.push(...coralTree(724, 240, 60, 4, r, { base: '#f0784a', tip: '#ffe0a0', ang: -1.25, w: 13 }));
  C.push(...sponges(s, 660, 250, r), ...sponges(s, 384, 250, r, 0.8));
  C.push(boulder(716, 314, 104, 88, MID, { n: 9, polyps: 16 }));
  C.push(boulder(308, 318, 112, 94, NEAR, { n: 9, polyps: 20 }));

  // cauliflower coral heaped along the tops
  const bump = s.rad([[0, '#ffe6c0'], [0.45, '#ff9a84'], [1, '#b03a7a']], 0.38, 0.32, 0.75);
  const bump2 = s.rad([[0, '#fff0b8'], [0.45, '#ffb060'], [1, '#c8503a']], 0.38, 0.32, 0.75);
  for (const [x, y, n, sp, f] of [[246, 250, 8, 44, bump], [356, 236, 6, 30, bump2], [690, 236, 7, 36, bump], [772, 262, 6, 30, bump2], [512, 198, 5, 26, bump], [214, 512, 6, 30, bump], [806, 506, 5, 26, bump2], [420, 700, 5, 30, bump2], [394, 812, 5, 30, bump]]) {
    for (let i = 0; i < n; i++) {
      const bx = x + (i - (n - 1) / 2) * sp * 2 / n + r.range(-4, 4), by = y + r.range(-8, 8) + Math.abs(i - (n - 1) / 2) * 3, rr = r.range(9, 17) * (1 - Math.abs(i - (n - 1) / 2) / n * 0.6);
      C.push(el('circle', { cx: bx, cy: by, r: rr, fill: f }));
      for (let k = 0; k < 4; k++) C.push(el('circle', { cx: bx + r.range(-0.5, 0.5) * rr, cy: by + r.range(-0.5, 0.4) * rr, r: 1.3, fill: '#7a1a5a', opacity: 0.5 }));
    }
  }

  // near arm
  C.push(boulder(260, 456, 62, 82, MID));
  C.push(boulder(226, 602, 80, 106, NEAR, { polyps: 14 }));
  C.push(...sponges(s, 176, 524, r, 0.9));
  C.push(boulder(222, 742, 88, 74, NEAR, { n: 7 }));
  // knuckle seams on the fist
  C.push(el('path', { d: 'M184 726Q192 768 186 800M222 718Q228 768 222 808M258 724Q262 764 254 798', fill: 'none', stroke: '#3a1450', 'stroke-width': 4, opacity: 0.7, 'stroke-linecap': 'round' }));

  // shelves of plate coral stepping down limbs and flanks
  for (const [x, y, w, c] of [[166, 596, 36, '#ff9a6a'], [176, 636, 26, '#ffb47a'], [330, 884, 38, '#ff9a6a'], [324, 928, 28, '#ffb47a'], [866, 604, 28, '#e88a8a']]) {
    C.push(el('path', { d: `M${x - w} ${y}Q${x} ${y + w * 0.62} ${x + w} ${y}Q${x} ${y - w * 0.2} ${x - w} ${y}Z`, fill: s.lin([[0, c], [1, '#8a2a70']]) }));
    C.push(el('path', { d: `M${x - w} ${y}Q${x} ${y - w * 0.2} ${x + w} ${y}`, fill: 'none', stroke: '#fff0d0', 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
    C.push(el('path', { d: `M${x - w * 0.6} ${y + w * 0.12}Q${x} ${y + w * 0.36} ${x + w * 0.6} ${y + w * 0.12}`, fill: 'none', stroke: '#ffe0b0', 'stroke-width': 1.2, opacity: 0.6 }));
  }

  // weed streaming back from arms and hips as it walks
  const weed = [];
  for (const [x, y, L, w] of [[292, 660, 230, 7], [270, 690, 170, 5], [776, 660, 190, 6], [840, 770, 150, 5], [600, 730, 160, 5], [340, 396, 130, 5], [690, 392, 110, 4]]) {
    const pts = [0, 1, 2, 3, 4, 5].map((i) => [x + i * L * 0.1 + Math.sin(i * 1.3 + x) * 10, y + i * L * 0.2]);
    weed.push(el('path', { d: ribbon(pts, w, 1, (t) => 1 + 0.3 * Math.sin(t * 14)), fill: s.lin([[0, '#3ab89a'], [1, '#12506a']]), opacity: 0.85 }));
  }
  C.push(g({}, weed));

  const body = g({ filter: s.emboss({ color: '#e8fbff', az: 262, elev: 34, depth: 10, k: 1.5, exp: 34, blur: 3.5 }) }, g({ filter: s.rough(6, 0.02, 4) }, C));
  // silt kicked up round the feet
  const silt = [];
  for (let i = 0; i < 12; i++) silt.push(el('ellipse', { cx: r.range(240, 800), cy: r.range(1020, 1070), rx: r.range(60, 130), ry: r.range(22, 44), fill: r.pick(['#9fc8f0', '#c8b0e8', '#7fa8e0']), opacity: r.range(0.12, 0.28) }));
  s.add(2, g({ transform: 'translate(512 540) rotate(-2.5) scale(0.86) translate(-512 -540)' }, [body, g({ filter: 'url(#glow16)' }, silt)]));

  // ---- 3: shoals wheeling in front, the near reef
  s.add(3, el('path', { d: shoal([[-60, 520], [120, 470], [260, 380], [420, 330], [600, 356], [760, 300], [900, 200], [1080, 150]], 150, 40, 12, r), fill: '#eafcff', opacity: 0.92 }));
  s.add(3, el('path', { d: shoal([[-60, 540], [130, 490], [270, 400], [430, 350], [610, 376], [770, 320], [910, 220], [1080, 170]], 70, 44, 12, r), fill: '#123a7a', opacity: 0.85 }));
  s.add(3, el('path', { d: shoal([[1080, 560], [900, 600], [760, 560], [640, 610]], 46, 30, 15, r, -1), fill: '#ffd88a', opacity: 0.95 }));
  // near reef
  const reefD = spline([[-80, 1100], [-80, 800], [-10, 770], [50, 840], [130, 880], [210, 960], [330, 990], [480, 1010], [640, 1000], [780, 975], [860, 900], [950, 850], [1010, 760], [1100, 780], [1100, 1100]], true);
  const R = [];
  R.push(...coralTree(60, 800, 66, 4, r, { base: '#1a1658', tip: '#d8508a', ang: -1.4, w: 13 }));
  R.push(...coralTree(960, 800, 70, 4, r, { base: '#1a1658', tip: '#f0806a', ang: -1.75, w: 14 }));
  R.push(...coralTree(196, 930, 44, 3, r, { base: '#1a1658', tip: '#f0806a', ang: -1.2, w: 9 }), ...coralTree(842, 940, 40, 3, r, { base: '#1a1658', tip: '#d8508a', ang: -1.9, w: 9 }));
  R.push(el('path', { d: reefD, fill: s.lin([[0, '#1c1c66'], [0.4, '#0e0e40'], [1, '#05051c']], 0, 760, 0, 1024, true), filter: s.rough(12, 0.03, 6) }));
  R.push(el('path', { d: spline([[-80, 800], [-10, 770], [50, 840], [130, 880], [210, 960], [330, 990]]), fill: 'none', stroke: '#8fc8ff', 'stroke-width': 3, opacity: 0.45, filter: s.rough(12, 0.03, 6) }));
  R.push(el('path', { d: spline([[780, 975], [860, 900], [950, 850], [1010, 760]]), fill: 'none', stroke: '#8fc8ff', 'stroke-width': 3, opacity: 0.45, filter: s.rough(12, 0.03, 6) }));
  R.push(...sponges(s, 250, 968, r, 1.2, ['#3a2a8a', '#c84a8a']), ...sponges(s, 800, 962, r, 1.1, ['#3a2a8a', '#e06a6a']));
  s.add(3, g({}, R));
  s.motes({ n: 50, rmin: 1, rmax: 4, colors: ['#eaffff', '#ffe0c8', '#bfe8ff'], opacity: 0.8 });
  s.bubbles({ n: 18, x0: 200, x1: 830, y0: 300, y1: 980, rmin: 3, rmax: 15, color: '#eaffff', opacity: 0.6 });
  s.add(3, glint(250, 214, 18, '#fff6e0', 0.8), glint(770, 250, 13, '#fff6e0', 0.7));
}

/** A branching coral rooted at (x, y): returns markup. `len` first branch length, `depth` levels. */
function coralTree(x, y, len, depth, r, { base = '#e8507a', tip = '#ffc0a0', light = '#fff2e0', ang = -Math.PI / 2, w = 10 } = {}) {
  const segs = [], tips = [];
  const grow = (x0, y0, a, L, ww, d) => {
    const x1 = x0 + Math.cos(a) * L, y1 = y0 + Math.sin(a) * L;
    segs.push([x0, y0, x1, y1, ww, d]);
    if (d <= 0) { tips.push([x1, y1, ww]); return; }
    const n = r() < 0.35 ? 3 : 2;
    for (let k = 0; k < n; k++) grow(x1, y1, a + (k - (n - 1) / 2) * r.range(0.6, 0.95) + r.range(-0.15, 0.15), L * r.range(0.62, 0.82), ww * 0.7, d - 1);
  };
  grow(x, y, ang, len, w, depth);
  const out = [];
  for (const [x0, y0, x1, y1, ww] of segs) out.push(el('path', { d: `M${x0 + 2} ${y0 + 3}L${x1 + 2} ${y1 + 3}`, stroke: '#3a1450', 'stroke-width': ww + 2.5, 'stroke-linecap': 'round', opacity: 0.6 }));
  for (const [x0, y0, x1, y1, ww, d] of segs) out.push(el('path', { d: `M${x0} ${y0}L${x1} ${y1}`, stroke: d <= 1 ? tip : base, 'stroke-width': ww, 'stroke-linecap': 'round' }));
  if (light) {
    for (const [x0, y0, x1, y1, ww] of segs) out.push(el('path', { d: `M${x0 - ww * 0.22} ${y0 - ww * 0.1}L${x1 - ww * 0.22} ${y1 - ww * 0.1}`, stroke: light, 'stroke-width': ww * 0.3, 'stroke-linecap': 'round', opacity: 0.55 }));
    for (const [tx, ty, ww] of tips) out.push(el('circle', { cx: tx, cy: ty, r: ww * 0.62, fill: light, opacity: 0.95 }));
  }
  return out;
}

/** A sea fan rooted at (x, y), radius R, leaning `deg` from upright. */
function fan(s, x, y, R, deg, color, r, lum = 1) {
  const pts = [[0, 0]], veins = [];
  for (let i = 0; i <= 16; i++) {
    const a = (-170 + i * 10) * Math.PI / 180, rr = R * (0.8 + 0.2 * Math.sin(i * 0.9 + 1)) * r.range(0.92, 1.04);
    pts.push([Math.cos(a) * rr * 0.82, Math.sin(a) * rr]);
    veins.push(`M0 0Q${Math.cos(a + 0.2) * rr * 0.4} ${Math.sin(a + 0.2) * rr * 0.5} ${Math.cos(a) * rr * 0.8} ${Math.sin(a) * rr * 0.97}`);
  }
  for (const k of [0.35, 0.55, 0.75, 0.9]) veins.push(`M${-R * k * 0.8} ${-R * k * 0.16}Q0 ${-R * k * 1.3} ${R * k * 0.8} ${-R * k * 0.16}`);
  return g({ transform: `translate(${x} ${y}) rotate(${deg})` }, [
    el('path', { d: spline(pts, true, 4), fill: s.lin([[0, lum < 1 ? '#c84a9a' : '#ffb0c0', 0.9], [1, color, 0.9]]) }),
    el('path', { d: veins.join(''), fill: 'none', stroke: '#ffe0e8', 'stroke-width': 1.4, opacity: 0.6 * lum }),
    el('path', { d: veins.join(''), fill: 'none', stroke: '#5a1450', 'stroke-width': 1.2, opacity: 0.4, transform: 'translate(2 2)' }),
  ]);
}

/** A cluster of tube sponges standing on (x, y). */
function sponges(s, x, y, r, k = 1, cols = ['#f08a4a', '#ffd88a']) {
  const out = [];
  for (let i = 0; i < 4; i++) {
    const bx = x + (i - 1.5) * 15 * k + r.range(-3, 3), h = r.range(26, 54) * k, w = r.range(11, 16) * k, lean = (i - 1.5) * 5 * k;
    const tx = bx + lean, ty = y - h;
    out.push(el('path', { d: `M${bx - w * 0.36} ${y}L${tx - w * 0.5} ${ty}L${tx + w * 0.5} ${ty}L${bx + w * 0.36} ${y}Z`, fill: s.lin([[0, cols[1]], [1, cols[0]]]) }));
    out.push(el('path', { d: `M${bx - w * 0.36} ${y}L${tx - w * 0.5} ${ty}`, stroke: '#fff2d8', 'stroke-width': 1.6, opacity: 0.7 }));
    out.push(el('ellipse', { cx: tx, cy: ty, rx: w * 0.5, ry: w * 0.24, fill: '#4a1444', stroke: cols[1], 'stroke-width': 1.6 }));
  }
  return out;
}

/** One path of `n` tiny fish swimming along a curve, scattered `spread` px either side, each about `size` long. */
function shoal(pts, n, spread, size, r, dir = 1) {
  const sm = sample(pts, 16);
  let d = '';
  for (let i = 0; i < n; i++) {
    const k = r.int(1, sm.length - 2), p = sm[k], q = sm[k + 1];
    let tx = (q[0] - p[0]) * dir, ty = (q[1] - p[1]) * dir; const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
    const a = Math.atan2(ty, tx) + r.range(-0.25, 0.25), c = Math.cos(a), sn = Math.sin(a);
    const off = (r() + r() + r() - 1.5) * spread * 1.3, x = p[0] + r.range(-20, 20) - sn * off, y = p[1] + r.range(-8, 8) + c * off;
    const l = size * r.range(0.6, 1.2), h = l * 0.2;
    const P = (u, v) => `${(x + c * u - sn * v).toFixed(1)} ${(y + sn * u + c * v).toFixed(1)}`;
    d += `M${P(l * 0.5, 0)}Q${P(l * 0.1, -h * 1.6)} ${P(-l * 0.3, 0)}L${P(-l * 0.52, -h * 1.1)}L${P(-l * 0.52, h * 1.1)}L${P(-l * 0.3, 0)}Q${P(l * 0.1, h * 1.6)} ${P(l * 0.5, 0)}Z`;
  }
  return d;
}

/** Turbulent murk over the whole canvas, shown only inside a soft ellipse (so it never ends on a hard edge). */
function mist(s, { color, opacity = 0.3, freq = 0.006, seed = null, layer = 0, cx = 512, cy = 512, rx = 600, ry = 400, contrast = 2.2 }) {
  const id = s.uid('mi'), sd = seed ?? s.r.int(1, 999), off = -(contrast - 1) * 0.62;
  s.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="${sd}"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${contrast} 0 0 0 ${off}"/><feComposite in2="SourceGraphic" operator="in"/></filter>`);
  const m = s.mask(el('ellipse', { cx, cy, rx, ry, fill: s.rad([[0, '#fff', 1], [0.55, '#fff', 0.75], [1, '#fff', 0]]) }));
  s.add(layer, g({ mask: m, opacity }, el('rect', { x: 0, y: 0, width: s.w, height: s.h, fill: color, filter: `url(#${id})` })));
}
