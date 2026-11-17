// BRINE BOLT (common spell) — a spear of squeezed sea-water and lightning, thrown across the dark.
import { el, g, ribbon, poly, glint } from '../lib.mjs';

// The bolt is drawn lying along +x (tail at the left, point at the right) and turned into place.
const ANG = 40, CX = 500, CY = 452;
const TF = `translate(${CX} ${CY}) rotate(${ANG})`;
const CA = Math.cos(ANG * Math.PI / 180), SA = Math.sin(ANG * Math.PI / 180);
const toCanvas = (x, y) => [CX + x * CA - y * SA, CY + x * SA + y * CA];
const TIP = 372, TAIL = -590;

export function build(s) {
  const r = s.r;

  // ---- 0: deep navy, a seam of light along the bolt's path
  s.backdrop(s.rad([[0, '#143f8c'], [0.4, '#0b2566'], [0.75, '#06113c'], [1, '#02061c']], 0.56, 0.52, 0.8));
  tfog(s, { color: '#2a7bf0', opacity: 0.5, freq: 0.004, seed: 11 });
  tfog(s, { color: '#6a4fe6', opacity: 0.3, freq: 0.008, seed: 23 });
  s.add(0, g({ transform: TF }, [
    el('ellipse', { cx: -80, cy: 0, rx: 640, ry: 120, fill: '#2f9dff', opacity: 0.3, filter: 'url(#glow64)' }),
    el('ellipse', { cx: 180, cy: 0, rx: 300, ry: 150, fill: '#7fe6ff', opacity: 0.28, filter: 'url(#glow64)' }),
  ]));
  tfog(s, { color: '#01030f', opacity: 0.6, freq: 0.006, seed: 7 });
  s.motes({ n: 110, rmin: 0.5, rmax: 2, color: '#a8dcff', opacity: 0.45, glow: false, layer: 0 });
  s.vignette({ strength: 0.82, color: '#01020c' });
  s.grain({ opacity: 0.2 });

  // ---- 1: the wake — speed lines, the shock cone, far forks, the oldest ring
  const mid = [];
  const streaks = [];
  for (let i = 0; i < 70; i++) {
    const y = r.range(50, 520) * r.sign(), x = r.range(-760, 260), len = r.range(60, 340);
    streaks.push(el('path', { d: `M${x} ${y}h${len}`, stroke: '#9fe0ff', 'stroke-width': r.range(1, 3.4), opacity: r.range(0.06, 0.3) * (1 - Math.abs(y) / 620), 'stroke-linecap': 'round' }));
  }
  mid.push(g({ filter: 'url(#glow2)' }, streaks));
  // bow wave trailing off the point: a parabola of pushed water
  const wave = (k, sd) => { const pts = []; for (let d = 0; d <= 760; d += 20) pts.push([TIP + 16 - d, sd * k * Math.sqrt(d)]); return pts; };
  const fade = s.lin([[0, '#bdf3ff', 0], [0.5, '#bdf3ff', 0.18], [1, '#ffffff', 0.8]], TIP - 620, 0, TIP, 0, true);
  mid.push(el('path', { d: poly([...wave(17, -1), ...wave(17, 1).reverse()], true), fill: s.lin([[0, '#39a8ff', 0], [0.5, '#39a8ff', 0.1], [1, '#bdf3ff', 0.4]], TIP - 700, 0, TIP, 0, true), filter: 'url(#glow16)' }));
  for (const k of [17, 10.5]) {
    const d = poly(wave(k, -1)) + poly(wave(k, 1));
    mid.push(el('path', { d, fill: 'none', stroke: fade, 'stroke-width': 14, opacity: 0.4, filter: 'url(#glow8)' }));
    mid.push(el('path', { d, fill: 'none', stroke: fade, 'stroke-width': k > 12 ? 2.6 : 1.6, opacity: 0.8 }));
  }
  // the oldest, widest ring
  mid.push(ring(s, r, -400, 190, 0.3, 'both'));
  // far forks of lightning
  const far = [];
  lightning(r, [-300, -20], [-560, -300], far, { w: 2.6, forks: 3 });
  lightning(r, [-200, 30], [-380, 400], far, { w: 2.6, forks: 3 });
  lightning(r, [40, -40], [-30, -420], far, { w: 2.4, forks: 2 });
  mid.push(g({ opacity: 0.5 }, zapMarkup(far, '#6f7cff', '#cfe0ff')));
  s.add(1, g({ transform: TF }, mid));

  // the far sea the bolt is falling toward, its crests catching the light
  const tipC = toCanvas(TIP, 0);
  s.add(1, el('ellipse', { cx: tipC[0] - 10, cy: 850, rx: 330, ry: 70, fill: '#4fc0ff', opacity: 0.3, filter: 'url(#glow32)' }));
  s.add(1, sea(s, r, { y: 800, amp: 26, f: 0.021, top: '#17489c', bottom: '#050f36', lit: tipC[0], rim: 0.75, blur: true }));
  s.add(1, sea(s, r, { y: 848, amp: 38, f: 0.014, top: '#103a8a', bottom: '#030a28', lit: tipC[0], rim: 0.9 }));

  // ---- 2: the bolt itself
  const b = [];
  const HB = 150; // where the shaft meets the head
  const W = (t) => 8 + 84 * Math.pow(t, 1.35); // full width of the water shaft
  const axis = [[TAIL, 0], [-300, 0], [-60, 0], [HB + 30, 0]];
  // halo
  b.push(el('path', { d: ribbon(axis, 1, 1, (t) => 40 + 190 * t, 6), fill: '#2fa4ff', opacity: 0.42, filter: 'url(#glow32)' }));
  b.push(el('ellipse', { cx: 250, cy: 0, rx: 200, ry: 120, fill: '#8fe9ff', opacity: 0.4, filter: 'url(#glow32)' }));
  // rings: far halves go behind the shaft
  const rings = [[40, 104, 1], [-170, 150, 0.8]];
  for (const [x, R, o] of rings) b.push(ring(s, r, x, R, o, 'back'));
  // water peeling off the shaft and curling away behind it
  const peel = [];
  for (let i = 0; i < 12; i++) {
    const sd = i % 2 ? 1 : -1, x0 = HB - 10 - i * 46 - r.range(0, 20), t = (x0 - TAIL) / (HB + 30 - TAIL), y0 = sd * W(t) * 0.42;
    const L = r.range(90, 190) * (0.5 + t * 0.6), out = r.range(40, 120) * (0.5 + t * 0.6);
    const pts = [[x0, y0], [x0 - L * 0.4, y0 + sd * out * 0.25], [x0 - L * 0.8, y0 + sd * out * 0.7], [x0 - L, y0 + sd * out * 1.15], [x0 - L * 0.92, y0 + sd * out * 1.45]];
    peel.push(el('path', { d: ribbon(pts, r.range(16, 26) * (0.5 + t * 0.6), 1.5), fill: s.lin([[0, '#eafcff', 0.95], [0.5, '#6fd0ff', 0.75], [1, '#2a8cf0', 0.25]], x0, 0, x0 - L, 0, true) }));
    peel.push(el('circle', { cx: x0 - L * 0.9 - r.range(6, 20), cy: y0 + sd * out * 1.6, r: r.range(2, 5), fill: '#eafcff', opacity: 0.9 }));
  }
  b.push(g({ filter: s.rough(7, 0.03, 9) }, peel));
  // the shaft: a glassy rope of water, bright at its skin, deep inside
  const skin = s.lin([[0, '#f4feff', 0.95], [0.16, '#9fe8ff', 0.95], [0.36, '#4fb4ff', 0.85], [0.5, '#2f8cf0', 0.8], [0.64, '#4fb4ff', 0.85], [0.84, '#9fe8ff', 0.95], [1, '#f4feff', 0.95]], 0, -46, 0, 46, true);
  const shaftD = ribbon(axis, 1, 1, (t) => W(t) * (1 + 0.1 * Math.sin(t * 40)), 30);
  b.push(g({ filter: s.rough(9, 0.02, 5) }, [
    el('path', { d: shaftD, fill: skin }),
    el('path', { d: shaftD, fill: 'none', stroke: '#ffffff', 'stroke-width': 2.4, opacity: 0.9 }),
  ]));
  // twin helices of water wound round it
  const helix = [];
  for (const [ph, bold] of [[0, 1], [Math.PI, 0.45]]) {
    for (let x = TAIL + 30; x < HB + 20; x += 5) {
      const t = (x - TAIL) / (HB + 30 - TAIL), k = 0.03 + 0.008 * t;
      const y0 = W(t) * 0.5 * Math.sin(x * k + ph), y1 = W(t + 0.007) * 0.5 * Math.sin((x + 5.8) * k + ph), c = Math.cos(x * k + ph);
      if (c < -0.1) continue;
      helix.push(el('path', { d: `M${x} ${y0}L${x + 5.8} ${y1}`, stroke: '#ffffff', 'stroke-width': (1.5 + 13 * t) * bold * (0.25 + 0.75 * Math.max(0, c)), 'stroke-linecap': 'round', opacity: (0.2 + 0.75 * Math.max(0, c)) * (0.5 + 0.5 * bold) }));
    }
  }
  b.push(g({}, helix));
  // white-hot core
  b.push(el('path', { d: ribbon(axis, 1, 1, (t) => 4 + 30 * Math.pow(t, 1.6), 8), fill: '#aeeeff', opacity: 0.85, filter: 'url(#glow8)' }));
  b.push(el('path', { d: ribbon(axis, 1, 1, (t) => 2.5 + 13 * Math.pow(t, 1.6), 8), fill: '#ffffff' }));
  // the spearhead
  const head = `M${TIP} 0Q300 -20 216 -70Q180 -62 ${HB - 22} -58Q${HB + 20} -22 ${HB + 20} 0Q${HB + 20} 22 ${HB - 22} 58Q180 62 216 70Q300 20 ${TIP} 0Z`;
  b.push(el('path', { d: head, fill: '#7fe2ff', opacity: 0.85, filter: 'url(#glow16)' }));
  b.push(el('path', { d: head, fill: s.lin([[0, '#f6ffff'], [0.16, '#7fdcff'], [0.4, '#1670e0'], [0.5, '#dff8ff'], [0.6, '#1670e0'], [0.84, '#7fdcff'], [1, '#f6ffff']], 0, -70, 0, 70, true) }));
  const hc = s.clip(el('path', { d: head }));
  const hin = [];
  for (let i = 0; i < 13; i++) {
    const y = -66 + i * 11;
    hin.push(el('path', { d: `M${HB - 20} ${y}Q260 ${y * 0.75} ${TIP} 0`, fill: 'none', stroke: '#ffffff', 'stroke-width': 1.5, opacity: 0.4 }));
  }
  hin.push(el('path', { d: `M${HB} 0L230 -70L${TIP} -40L${TIP} 0Z`, fill: '#ffffff', opacity: 0.16 }));
  hin.push(el('ellipse', { cx: TIP - 40, cy: 0, rx: 90, ry: 18, fill: '#ffffff', opacity: 0.95, filter: 'url(#glow8)' }));
  hin.push(el('ellipse', { cx: 250, cy: 0, rx: 110, ry: 7, fill: '#ffffff', filter: 'url(#glow2)' }));
  b.push(g({ 'clip-path': hc }, hin));
  b.push(el('path', { d: head, fill: 'none', stroke: '#ffffff', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }));
  // rings: near halves cross in front, with their spray
  for (const [x, R, o] of rings) b.push(ring(s, r, x, R, o, 'front'));
  // lightning crawling along the shaft and leaping off it
  const zs = [];
  lightning(r, [-330, -10], [HB - 10, -52], zs, { w: 2.4, jag: 0.05, steps: 14, forks: 2, forkLen: 0.3 });
  lightning(r, [-460, 6], [-360, 150], zs, { w: 2, forks: 1 });
  lightning(r, [216, -70], [330, -230], zs, { w: 3.2, forks: 2 });
  lightning(r, [216, 70], [262, 250], zs, { w: 3.2, forks: 2 });
  lightning(r, [-100, -34], [-60, -230], zs, { w: 2.6, forks: 2 });
  lightning(r, [-280, 22], [-250, 190], zs, { w: 2.2, forks: 1 });
  b.push(g({}, zapMarkup(zs, '#5f8cff', '#ffffff')));
  // the flare at the point
  b.push(el('ellipse', { cx: TIP, cy: 0, rx: 70, ry: 6, fill: '#ffffff', filter: 'url(#glow4)' }));
  b.push(el('circle', { cx: TIP, cy: 0, r: 16, fill: '#ffffff', filter: 'url(#glow8)' }));
  s.add(2, g({ transform: TF }, b));
  const tip = toCanvas(TIP, 0);
  s.add(2, glint(tip[0], tip[1], 40, '#ffffff', 1));

  // ---- 3: the near swell, then spray thrown out in front of everything
  s.add(3, sea(s, r, { y: 930, amp: 60, f: 0.0085, top: '#0b2a70', bottom: '#01051a', lit: tipC[0] - 40, rim: 1 }));
  const spray = [];
  for (let i = 0; i < 90; i++) {
    const x = r.range(-420, 400), d = r.range(40, 330) * Math.pow(r(), 0.6), y = d * r.sign(), k = r.range(1.4, 6.5) * (1 - d / 520), len = r.range(1.6, 5);
    spray.push(el('ellipse', { cx: x, cy: y, rx: k * len, ry: k, fill: s.lin([[0, '#7fd6ff', 0.2], [0.6, '#dff8ff', 0.95], [1, '#ffffff', 1]], 0, 0, 1, 0), opacity: r.range(0.5, 1) }));
    if (k > 3.4) spray.push(el('ellipse', { cx: x + k * len * 0.5, cy: y - k * 0.3, rx: k * 0.6, ry: k * 0.3, fill: '#fff' }));
  }
  s.add(3, g({ transform: TF }, spray));
  s.motes({ n: 60, rmin: 1, rmax: 4, colors: ['#bfefff', '#ffffff', '#8fb4ff'], opacity: 0.85 });
  const g1 = toCanvas(60, -120), g2 = toCanvas(-160, 176), g3 = toCanvas(250, 232), g4 = toCanvas(-20, -212);
  s.add(3, glint(g1[0], g1[1], 20, '#fff', 0.9), glint(g2[0], g2[1], 16, '#dff6ff', 0.8), glint(g3[0], g3[1], 14, '#fff', 0.9), glint(g4[0], g4[1], 12, '#cfe0ff', 0.9));
}

/** A shock ring round the bolt's axis at x, radius R, seen nearly edge-on. `half`: 'back', 'front' or 'both'. */
function ring(s, r, x, R, o, half) {
  const rx = R * 0.24, parts = [];
  const arcs = [];
  if (half !== 'front') arcs.push(`M${x} ${-R}A${rx} ${R} 0 0 0 ${x} ${R}`);
  if (half !== 'back') arcs.push(`M${x} ${-R}A${rx} ${R} 0 0 1 ${x} ${R}`);
  const d = arcs.join('');
  const dim = half === 'back' ? 0.5 : 1;
  parts.push(el('path', { d, fill: 'none', stroke: '#4fb8ff', 'stroke-width': R * 0.26, opacity: 0.5 * dim, filter: 'url(#glow8)' }));
  parts.push(el('path', { d, fill: 'none', stroke: '#bff2ff', 'stroke-width': R * 0.1, opacity: 0.85 * dim, filter: 'url(#glow2)' }));
  parts.push(el('path', { d, fill: 'none', stroke: '#ffffff', 'stroke-width': Math.max(2.4, R * 0.04), opacity: dim }));
  // spray torn off the ring and swept back
  const n = Math.round(R * 0.09);
  for (let i = 0; i < n; i++) {
    const th = half === 'back' ? r.range(Math.PI * 0.5, Math.PI * 1.5) : half === 'front' ? r.range(-Math.PI * 0.5, Math.PI * 0.5) : r.range(0, Math.PI * 2);
    const px = x + rx * Math.cos(th), py = R * Math.sin(th) * r.range(0.98, 1.06);
    const len = R * r.range(0.08, 0.5) * r(), out = Math.sin(th) * len * 0.45;
    parts.push(el('path', { d: ribbon([[px, py], [px - len * 0.5, py + out * 0.4], [px - len, py + out]], R * r.range(0.02, 0.045), 0.6), fill: '#dff8ff', opacity: 0.8 * dim }));
    parts.push(el('circle', { cx: px - len - r.range(4, 22), cy: py + out * 1.2 + r.range(-6, 6), r: r.range(1.2, 3.6), fill: '#ffffff', opacity: 0.9 * dim }));
  }
  return g({ opacity: o }, parts);
}

/** Grow a forked lightning stroke from a to b; pushes {d, w} onto `out`. */
function lightning(r, a, b, out, { w = 3, jag = 0.16, steps = 10, forks = 2, forkLen = 0.45 } = {}) {
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  const pts = [a];
  for (let i = 1; i < steps; i++) {
    const t = i / steps, o = (r() * 2 - 1) * jag * len * (1 - Math.abs(t - 0.5) * 0.8);
    pts.push([a[0] + dx * t + nx * o, a[1] + dy * t + ny * o]);
  }
  pts.push(b);
  out.push({ d: poly(pts), w });
  if (w < 1.2) return;
  for (let f = 0; f < forks; f++) {
    const i = r.int(2, steps - 2), p = pts[i], ang = Math.atan2(dy, dx) + r.sign() * r.range(0.45, 1.1), L = len * forkLen * r.range(0.5, 1);
    lightning(r, p, [p[0] + Math.cos(ang) * L, p[1] + Math.sin(ang) * L], out, { w: w * 0.55, jag: 0.2, steps: 6, forks: 1, forkLen: 0.5 });
  }
}

function zapMarkup(zs, glow, core) {
  return [
    g({ filter: 'url(#glow8)', opacity: 0.8 }, zs.map((z) => el('path', { d: z.d, fill: 'none', stroke: glow, 'stroke-width': z.w * 4.2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }))),
    g({ filter: 'url(#glow2)' }, zs.map((z) => el('path', { d: z.d, fill: 'none', stroke: '#aee4ff', 'stroke-width': z.w * 1.8, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }))),
    g({}, zs.map((z) => el('path', { d: z.d, fill: 'none', stroke: core, 'stroke-width': z.w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }))),
  ];
}

/** Tinted cloud (the kit's fog comes out white whatever colour it is given). */
function tfog(s, { color, opacity = 0.3, freq = 0.006, seed = 1, contrast = 2.2, layer = 0 }) {
  const id = s.uid('tf'), c = [1, 3, 5].map((i) => (parseInt(color.slice(i, i + 2), 16) / 255).toFixed(3));
  s.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 ${c[0]}  0 0 0 0 ${c[1]}  0 0 0 0 ${c[2]}  ${contrast} 0 0 0 ${-(contrast - 1) * 0.62}"/></filter>`);
  s.add(layer, el('rect', { x: 0, y: 0, width: s.w, height: s.h, filter: `url(#${id})`, opacity }));
}

/** A line of sea swell, its crests rim-lit, brightest near x = `lit`. */
function sea(s, r, { y, amp, f, top, bottom, lit, rim = 1, blur = false }) {
  const p1 = r.range(0, 6), p2 = r.range(0, 6), p3 = r.range(0, 6), pts = [];
  const h = (x) => 0.55 * Math.sin(x * f + p1 + 0.5 * Math.sin(x * f * 0.9 + p2)) + 0.3 * Math.sin(x * f * 2.3 + p2) + 0.15 * Math.sin(x * f * 4.1 + p3);
  for (let x = -40; x <= 1064; x += 8) pts.push([x, y - amp * h(x)]);
  const parts = [el('path', { d: poly([...pts, [1064, 1064], [-40, 1064]], true), fill: s.lin([[0, top], [1, bottom]], 0, y - amp, 0, y + amp * 3.5, true) })];
  // light along each crest, fading down its shoulders
  const soft = [], hard = [];
  for (let i = 2; i < pts.length - 2; i++) {
    if (!(pts[i][1] <= pts[i - 1][1] && pts[i][1] < pts[i + 1][1])) continue;
    const k = Math.max(0.12, 1 - Math.abs(pts[i][0] - lit) / 560) * rim, n = 4 + Math.round(4 * r());
    const seg = pts.slice(Math.max(0, i - n), Math.min(pts.length, i + n + 1));
    soft.push(el('path', { d: poly(seg), fill: 'none', stroke: '#8fdcff', 'stroke-width': 10, opacity: 0.5 * k, 'stroke-linecap': 'round' }));
    hard.push(el('path', { d: poly(seg.slice(1, -1)), fill: 'none', stroke: '#f2fdff', 'stroke-width': 2.6, opacity: k, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  }
  parts.push(g({ filter: 'url(#glow4)' }, soft), g({}, hard));
  // glitter on the faces of the waves
  for (let i = 0; i < 50; i++) {
    const x = lit + r.range(-460, 460) * r(), yy = y - amp * h(x) + r.range(0.25, 2.8) * amp, w = r.range(8, 40);
    parts.push(el('path', { d: `M${x - w} ${yy}q${w} ${-r.range(2, 6)} ${2 * w} 0`, fill: 'none', stroke: '#bfeeff', 'stroke-width': r.range(1, 2.6), opacity: r.range(0.15, 0.6) * rim, 'stroke-linecap': 'round' }));
  }
  return g({ filter: blur ? 'url(#glow2)' : undefined }, parts);
}
