// STORMCALLER RAY (rare) — a great manta sliding down out of the storm-lit shallows straight at us, lightning
// crawling over its wings and whipping off its tail.
import { el, g, spline, ribbon, poly, blob, glint, orb } from '../lib.mjs';

const FLASH = [742, 34];

/** A jagged bolt as points (so it can fork). */
function zap(r, a, b, jag = 0.16, steps = 9) {
  const pts = [a], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  for (let i = 1; i < steps; i++) { const t = i / steps, o = (r() * 2 - 1) * jag * len * (1 - Math.abs(t - 0.5) * 0.8); pts.push([a[0] + dx * t + nx * o, a[1] + dy * t + ny * o]); }
  pts.push(b);
  return pts;
}
/** A bolt with forks: returns [{d, w}] (main first). */
function tree(r, a, b, o = {}) {
  const main = zap(r, a, b, o.jag ?? 0.14, o.steps ?? 10), out = [{ d: poly(main), w: o.w ?? 1 }];
  const forks = o.forks ?? 3;
  for (let i = 0; i < forks; i++) {
    const j = r.int(2, main.length - 2), p = main[j], q = main[j + 1] || p, base = Math.atan2(q[1] - main[j - 1][1], q[0] - main[j - 1][0]);
    const ang = base + r.sign() * r.range(0.5, 1.1), l = Math.hypot(b[0] - a[0], b[1] - a[1]) * r.range(0.14, 0.34) * (o.fork ?? 1);
    const e = [p[0] + Math.cos(ang) * l, p[1] + Math.sin(ang) * l], f = zap(r, p, e, 0.22, 5);
    out.push({ d: poly(f), w: (o.w ?? 1) * 0.55 });
    if (r() < 0.5) { const m = f[3], a2 = ang + r.sign() * 0.7; out.push({ d: poly(zap(r, m, [m[0] + Math.cos(a2) * l * 0.5, m[1] + Math.sin(a2) * l * 0.5], 0.25, 4)), w: (o.w ?? 1) * 0.35 }); }
  }
  return out;
}
/** Draw bolts: wide halo, hot sheath, white core. */
function bolts(s, list, k = 1) {
  return [
    g({ filter: 'url(#glow16)', opacity: 0.55 }, list.map((b) => el('path', { d: b.d, fill: 'none', stroke: '#ffd84a', 'stroke-width': 26 * b.w * k, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }))),
    g({ filter: 'url(#glow4)' }, list.map((b) => el('path', { d: b.d, fill: 'none', stroke: '#ffe86a', 'stroke-width': 9 * b.w * k, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }))),
    g({}, list.map((b) => el('path', { d: b.d, fill: 'none', stroke: '#fffdf0', 'stroke-width': Math.max(1.2, 3.4 * b.w * k), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }))),
  ].join('');
}

export function build(s) {
  const r = s.r;

  // ---- 0: indigo water under a storm; the surface a rippling ceiling lit by a flash
  s.backdrop(s.lin([[0, '#4a56d8'], [0.1, '#2c34a8'], [0.28, '#191d72'], [0.55, '#0e1048'], [0.8, '#07082a'], [1, '#030416']]));
  s.add(0, el('circle', { cx: FLASH[0], cy: FLASH[1], r: 620, fill: s.rad([[0, '#fffbe0', 1], [0.1, '#ffe98a', 0.7], [0.3, '#8a9cff', 0.4], [1, '#8a9cff', 0]]) }));
  s.fog({ color: '#5a48d8', opacity: 0.2, freq: 0.005 });
  s.fog({ color: '#2a3ad0', opacity: 0.2, freq: 0.009, y: 300, h: 760 });
  s.rays({ x: FLASH[0], y: -90, angle: 104, spread: 62, n: 9, color: '#dfe4ff', opacity: 0.2, width: 80, len: 1300 });
  // the ceiling of ripples: rows of bright lens-shaped cells, crowding together with distance
  const surf = [], crest = [];
  const lightFill = s.rad([[0, '#ffffff', 1], [0.25, '#fff2b0', 0.85], [0.55, '#b8c2ff', 0.55], [1, '#7f8cff', 0.28]], FLASH[0], FLASH[1], 820, true);
  for (let k = 0; k < 13; k++) {
    const u = (k + 1) / 13, y = 286 - 280 * Math.pow(u, 1.45), th = 2 + 34 * Math.pow(u, 1.7), amp = 2 + 20 * u, f1 = 0.011 + 0.034 * (1 - u), p1 = r.range(0, 6), p2 = r.range(0, 6), p3 = r.range(0, 6), p4 = r.range(0, 6);
    const top = [], bot = [];
    for (let i = 0; i <= 110; i++) {
      const x = -30 + 1084 * i / 110, w = Math.sin(x * f1 + p1) * amp + Math.sin(x * f1 * 2.3 + p2) * amp * 0.45 + Math.sin(x * f1 * 0.37 + p4) * amp * 0.8;
      top.push([x, y + w]); bot.push([x, y + w + th * (0.06 + 0.94 * Math.pow(Math.abs(Math.sin(x * f1 * 1.3 + p3 + Math.sin(x * f1 * 0.6) * 1.4)), 1.8))]);
    }
    surf.push(el('path', { d: poly(top.concat(bot.slice().reverse()), true), fill: lightFill, opacity: 0.12 + 0.88 * Math.pow(u, 1.3) }));
    crest.push(el('path', { d: poly(top), fill: 'none', stroke: lightFill, 'stroke-width': 0.8 + 2.4 * u, opacity: 0.2 + 0.8 * u }));
  }
  s.add(0, g({ filter: 'url(#bloomS)' }, surf));
  s.add(0, g({}, crest));
  s.add(0, el('rect', { x: 0, y: 130, width: 1024, height: 300, fill: s.lin([[0, '#171b6a', 0], [0.5, '#151962', 0.8], [1, '#12154e', 0]]) }));
  s.add(0, el('ellipse', { cx: 512, cy: 430, rx: 520, ry: 330, fill: s.rad([[0, '#5a6cf0', 0.55], [0.6, '#3a48d0', 0.22], [1, '#3a48d0', 0]]) }));
  s.motes({ n: 100, rmin: 0.6, rmax: 2.2, color: '#c4ccff', opacity: 0.5, glow: false, layer: 0 });
  s.vignette({ strength: 0.74, color: '#02031a', cy: 0.44 });
  s.grain({ opacity: 0.2 });

  // ---- 1: the storm seen through the water, far rays following, the reef far below
  const sky = [];
  for (const [x0, x1, y1] of [[FLASH[0], 620, 190], [FLASH[0] + 30, 880, 150], [250, 180, 120]]) sky.push(...tree(r, [x0, -30], [x1, y1], { forks: 4, jag: 0.2 }));
  s.add(1, g({ filter: 'url(#glow8)', opacity: 0.75 }, sky.map((b) => el('path', { d: b.d, fill: 'none', stroke: '#fff6c8', 'stroke-width': 12 * b.w, 'stroke-linecap': 'round' }))));
  s.add(1, g({ filter: 'url(#glow2)', opacity: 0.8 }, sky.map((b) => el('path', { d: b.d, fill: 'none', stroke: '#ffffff', 'stroke-width': 3.4 * b.w, 'stroke-linecap': 'round' }))));
  for (const [x, y, k, rot, o] of [[150, 560, 0.2, -14, 0.5], [884, 640, 0.15, 12, 0.45], [300, 190, 0.1, 8, 0.4]])
    s.add(1, g({ transform: `translate(${x} ${y}) rotate(${rot}) scale(${k}) translate(-512 -420)`, opacity: o * 0.8, filter: 'url(#glow8)' }, [el('path', { d: WING, fill: '#2c38a8' }), el('path', { d: ribbon([[512, 250], [530, 180], [580, 110]], 16, 3), fill: '#2c38a8' })]));
  const school = [];
  for (let i = 0; i < 34; i++) {
    const x = 190 + r.range(-130, 190) + i * 2, y = 800 + r.range(-60, 50) - (x - 190) * 0.2, k = r.range(0.55, 1.15), a = 158 + r.range(-12, 12);
    school.push(g({ transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)}) scale(${k.toFixed(2)})` }, [
      el('path', { d: 'M-14 0C-6 -7 8 -6 16 0C8 6 -6 7 -14 0ZM-12 0L-22 -6L-20 0L-22 6Z', fill: '#080a34' }),
      el('path', { d: 'M-8 -3C0 -6 8 -5 13 -1', fill: 'none', stroke: '#ffe98a', 'stroke-width': 1.4, opacity: 0.7, 'stroke-linecap': 'round' }),
    ]));
  }
  s.add(1, g({ opacity: 0.85 }, school));
  s.ridge({ y: 890, amp: 110, detail: 0.8, fill: s.lin([[0, '#1c2488'], [1, '#090b3a']]), layer: 1, opacity: 0.6, filter: 'url(#glow2)' });
  s.ridge({ y: 960, amp: 80, detail: 1, fill: s.lin([[0, '#0e1150'], [1, '#04051e']], 0, 880, 0, 1024, true), layer: 1 });

  // ---- 2: the ray
  s.add(2, g({ transform: 'translate(0 26)' }, ray(s)));

  // ---- 3: sparks and near crackle
  const fr = [];
  for (const [a, b] of [[[104, 252], [36, 170]], [[948, 342], [1012, 270]], [[742, 96], [880, 40]]]) fr.push(...tree(r, a, b, { forks: 2, jag: 0.22, w: 0.6, fork: 1.6 }));
  s.add(3, bolts(s, fr, 0.8));
  s.motes({ n: 60, x0: 60, x1: 964, y0: 120, y1: 760, rmin: 1.2, rmax: 4.6, colors: ['#fff6b0', '#ffe36a', '#ffffff', '#c4ccff'], opacity: 0.9 });
  s.bubbles({ n: 16, y0: 120, rmin: 3, rmax: 15, color: '#d8ddff' });
  s.add(3, glint(108, 254, 30, '#fffbe0', 0.95), glint(944, 344, 26, '#fffbe0', 0.9), glint(742, 96, 22, '#fffbe0', 0.9));
}

// the wing outline, head toward us (bottom), tail root at the top
const WING = 'M512 610C480 610 452 598 438 578C360 554 250 470 190 372C160 322 130 272 104 226C150 280 200 310 262 322C340 338 430 318 496 262L512 240L528 262C590 318 690 356 780 366C840 372 896 360 948 316C922 390 860 450 790 490C720 530 640 562 586 578C572 598 544 610 512 610Z';

function ray(s) {
  const r = s.r, P = [];
  const wingClip = s.clip(el('path', { d: WING }));

  // tail whipping up behind, toward the surface
  const tail = [[512, 254], [528, 190], [572, 132], [644, 92], [742, 70]];
  P.push(el('path', { d: ribbon(tail, 18, 2.5), fill: s.lin([[0, '#262e96'], [1, '#5a66e0']], 0, 1, 0, 0), stroke: '#080a36', 'stroke-width': 1.5 }));

  // cephalic fins: two short paddles reaching forward either side of the mouth
  for (const sg of [-1, 1]) {
    const cx = 512 + sg * 58;
    P.push(el('path', { d: ribbon([[cx - sg * 4, 574], [cx + sg * 8, 604], [cx + sg * 12, 634], [cx + sg * 6, 660]], 2, 2, (t) => 15 - 8 * t * t + 2 * Math.sin(t * Math.PI)), fill: s.lin([[0, '#151a6a'], [0.55, '#2e3ab0'], [1, '#7a88f0']], sg < 0 ? 0 : 1, 0, sg < 0 ? 1 : 0, 0), stroke: '#070930', 'stroke-width': 2.5 }));
    P.push(el('path', { d: spline([[cx - sg * 8, 590], [cx, 612], [cx + sg * 5, 634], [cx + sg * 3, 652]]), fill: 'none', stroke: '#c8d0ff', 'stroke-width': 2.4, opacity: 0.5, 'stroke-linecap': 'round' }));
  }
  // the pale underside showing as a lip under the near edge of each wing
  P.push(el('path', { d: WING, fill: s.lin([[0, '#5a66d8'], [0.5, '#c4ccff'], [1, '#5a66d8']], 0, 0, 1, 0), stroke: '#070930', 'stroke-width': 3, 'stroke-linejoin': 'round', transform: 'translate(0 11)' }));

  // the disc
  P.push(el('path', { d: WING, fill: s.rad([[0, '#222c98'], [0.3, '#141868'], [0.65, '#0b0d44'], [1, '#050626']], 512, 430, 470, true), stroke: '#070930', 'stroke-width': 3, 'stroke-linejoin': 'round' }));
  const inn = [];
  // fin rays fanning from the body to the trailing edge
  for (const sg of [-1, 1]) for (let i = 0; i < 16; i++) {
    const t = i / 15, ex = 512 + sg * (60 + 380 * t), ey = 300 + 30 * Math.sin(t * 3) + (sg > 0 ? 50 * t : -40 * t), sx = 512 + sg * (40 + 60 * t), sy = 560 - 180 * t;
    inn.push(el('path', { d: `M${sx} ${sy}Q${(sx + ex) / 2 + sg * 40} ${(sy + ey) / 2 + 30} ${ex} ${ey}`, fill: 'none', stroke: i % 2 ? '#0a0c40' : '#6a78e8', 'stroke-width': 2, opacity: i % 2 ? 0.35 : 0.22 }));
  }
  // darker toward the near (leading) edge, where the wing turns under
  inn.push(el('path', { d: 'M438 578C360 554 250 470 190 372C160 322 130 272 104 226', fill: 'none', stroke: '#05062a', 'stroke-width': 60, opacity: 0.55, filter: 'url(#glow16)' }));
  inn.push(el('path', { d: 'M586 578C640 562 720 530 790 490C860 450 922 390 948 316', fill: 'none', stroke: '#05062a', 'stroke-width': 60, opacity: 0.55, filter: 'url(#glow16)' }));
  // storm light along the far (trailing) edge
  inn.push(el('path', { d: 'M104 226C150 280 200 310 262 322C340 338 430 318 496 262L512 240L528 262C590 318 690 356 780 366C840 372 896 360 948 316', fill: 'none', stroke: '#b8c4ff', 'stroke-width': 30, opacity: 0.7, filter: 'url(#glow8)' }));
  // the body: a long swell down the middle, the head a broad dome
  inn.push(el('ellipse', { cx: 512, cy: 430, rx: 78, ry: 190, fill: s.rad([[0, '#6a7aec', 0.6], [0.5, '#3a48c0', 0.3], [1, '#3a48c0', 0]], 0.5, 0.4, 0.5) }));
  inn.push(el('ellipse', { cx: 512, cy: 556, rx: 92, ry: 50, fill: s.rad([[0, '#7a88f0', 0.5], [1, '#4a58d0', 0]]) }));
  inn.push(el('path', { d: 'M512 262L512 520', stroke: '#b4beff', 'stroke-width': 5, opacity: 0.35, filter: 'url(#glow2)', 'stroke-linecap': 'round' }));
  // pale shoulder blazes, like a brand
  for (const sg of [-1, 1]) {
    const X = (x) => 512 + sg * x;
    inn.push(el('path', { d: `M${X(34)} 500C${X(80)} 470 ${X(140)} 456 ${X(206)} 428C${X(160)} 474 ${X(110)} 512 ${X(56)} 536C${X(44)} 526 ${X(36)} 514 ${X(34)} 500Z`, fill: '#dfe6ff', opacity: 0.6 }));
    inn.push(el('path', { d: `M${X(40)} 420C${X(70)} 400 ${X(104)} 392 ${X(140)} 380C${X(110)} 408 ${X(80)} 428 ${X(48)} 440Z`, fill: '#c4ceff', opacity: 0.5, filter: 'url(#glow2)' }));
  }
  // freckles
  for (let i = 0; i < 46; i++) { const sg = r.sign(), t = r(), x = 512 + sg * (70 + 330 * t), y = 330 + r.range(-10, 150) * (1 - t * 0.6) + (sg > 0 ? 40 * t : -50 * t); inn.push(el('circle', { cx: x, cy: y, r: r.range(2, 5.5), fill: '#aab6ff', opacity: r.range(0.15, 0.4) })); }
  P.push(g({ 'clip-path': wingClip }, inn));

  // lightning on the skin: it runs out from the shoulders to the wingtips, and down the spine into the tail
  const L = [];
  L.push(...tree(r, [430, 470], [112, 236], { forks: 4, jag: 0.1, steps: 12, w: 1.35 }));
  L.push(...tree(r, [594, 470], [940, 322], { forks: 4, jag: 0.1, steps: 12, w: 1.35 }));
  L.push(...tree(r, [452, 396], [250, 318], { forks: 2, jag: 0.14, w: 0.7 }));
  L.push(...tree(r, [572, 396], [790, 362], { forks: 2, jag: 0.14, w: 0.7 }));
  L.push({ d: poly(zap(r, [512, 330], [512, 252], 0.2, 5)), w: 0.7 });
  // its glow soaks into the hide
  P.push(g({ 'clip-path': wingClip, filter: 'url(#glow16)', opacity: 0.3 }, L.map((b) => el('path', { d: b.d, fill: 'none', stroke: '#ffd84a', 'stroke-width': 44 * b.w, 'stroke-linecap': 'round' }))));

  // mouth: a wide dark gape under the brow, a pale lip below
  P.push(el('path', { d: 'M462 592C482 600 542 600 562 592C552 616 472 616 462 592Z', fill: '#02031a', stroke: '#070930', 'stroke-width': 2 }));
  P.push(el('path', { d: 'M470 606C492 616 532 616 554 606', fill: 'none', stroke: '#c8d0ff', 'stroke-width': 3, opacity: 0.7, 'stroke-linecap': 'round' }));
  // eyes, wide-set, lit from inside
  for (const sg of [-1, 1]) {
    const ex = 512 + sg * 86, ey = 568;
    P.push(el('ellipse', { cx: ex, cy: ey, rx: 18, ry: 14, fill: '#05062a' }));
    P.push(el('circle', { cx: ex, cy: ey, r: 22, fill: '#ffe36a', opacity: 0.5, filter: 'url(#glow8)' }));
    P.push(el('ellipse', { cx: ex, cy: ey, rx: 12, ry: 10, fill: s.rad([[0, '#ffffff'], [0.5, '#fff3a0'], [1, '#ffc02a']]) }));
    P.push(el('ellipse', { cx: ex, cy: ey, rx: 3, ry: 8, fill: '#1a1040' }), el('circle', { cx: ex - 4, cy: ey - 4, r: 2.4, fill: '#fff' }));
  }

  const lit = g({ filter: s.emboss({ color: '#c8d2ff', az: 270, elev: 40, depth: 10, k: 0.6, exp: 18, blur: 6 }) }, P);
  // bolts over everything, and the whip of light off the tail
  const T = [];
  T.push({ d: spline(tail.map(([x, y], i) => [x + (i % 2 ? 7 : -7), y + (i % 2 ? -5 : 5)]), false, 3), w: 0.8 });
  T.push(...tree(r, [742, 70], [900, 96], { forks: 3, jag: 0.2, w: 0.8, fork: 1.5 }));
  T.push(...tree(r, [460, 660], [564, 660], { forks: 1, jag: 0.26, w: 0.4, steps: 7 }));
  const halo = [[108, 228, 110], [944, 318, 110], [742, 70, 80], [512, 330, 70]].map(([x, y, k]) => el('circle', { cx: x, cy: y, r: k, fill: '#ffe36a', opacity: 0.3, filter: 'url(#glow32)' })).join('');
  return g({}, [halo, g({ filter: 'url(#shadow)' }, lit), bolts(s, L), bolts(s, T)]);
}
