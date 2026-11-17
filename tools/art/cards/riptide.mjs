// RIPTIDE (rare) — the sea turned to a drain: a spiral of foam and black water seen from above and aslant, hauling
// wreckage and fish down its throat, spray tearing off the rim.
import { el, g, spline, ribbon, poly, blob, glint } from '../lib.mjs';

const CX = 512, CY = 404, SQ = 0.6, ROT = -9 * Math.PI / 180;
const DEEP = 96;                                 // how far the throat sinks (the eye lands near y = 500)
const R0 = 900, R1 = 44, TURNS = 1.36;

/** Disc coordinates (radius, angle) -> canvas. The surface dips toward the centre, so the eye slides down-screen. */
function P(rad, th) {
  const x = rad * Math.cos(th), y = rad * Math.sin(th) * SQ + DEEP * Math.exp(-rad / 125);
  return [CX + x * Math.cos(ROT) - y * Math.sin(ROT), CY + x * Math.sin(ROT) + y * Math.cos(ROT)];
}
/** A point on the streamline that starts at angle th0 on the rim; t 0 (rim) .. 1 (eye). */
const radOf = (t) => R0 * Math.pow(R1 / R0, t);
const S = (th0, t) => P(radOf(t), th0 + t * TURNS * Math.PI * 2);
const stream = (th0, ta, tb, n = 14) => { const q = []; for (let i = 0; i <= n; i++) q.push(S(th0, ta + (tb - ta) * i / n)); return q; };
const tangent = (th0, t) => { const a = S(th0, t - 0.004), b = S(th0, t + 0.004); return Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; };

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
function ramp(stops, v) {
  let i = 0; while (i < stops.length - 2 && v > stops[i + 1][0]) i++;
  const [a, ca] = stops[i], [b, cb] = stops[i + 1], t = Math.max(0, Math.min(1, (v - a) / (b - a))), A = hex(ca), B = hex(cb);
  return '#' + A.map((x, k) => Math.round(x + (B[k] - x) * t).toString(16).padStart(2, '0')).join('');
}

export function build(s) {
  const r = s.r;
  s.def(`<filter id="rtFoam" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="11" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="20" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="3" seed="4" result="n2"/>
    <feColorMatrix in="n2" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  4.2 0 0 0 -1.25" result="h"/>
    <feComposite in="d" in2="h" operator="in" result="lace0"/>
    <feGaussianBlur in="lace0" stdDeviation="0.9" result="lace"/>
    <feGaussianBlur in="d" stdDeviation="6" result="soft"/>
    <feComponentTransfer in="soft" result="soft2"><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
    <feMerge><feMergeNode in="soft2"/><feMergeNode in="lace"/></feMerge></filter>`);

  // ---- 0: the sea, already bending toward the drain
  s.backdrop(s.rad([[0, '#12909a'], [0.35, '#0b6a7e'], [0.7, '#063a54'], [1, '#021a30']], 0.5, 0.44, 0.78));
  s.fog({ color: '#2fd6c8', opacity: 0.22, freq: 0.006 });
  s.fog({ color: '#03121f', opacity: 0.3, freq: 0.009, contrast: 2.4 });
  const far = [];
  for (let i = 0; i < 150; i++) {                // long swell lines riding the spiral
    const th0 = r.range(0, 6.283), ta = r.range(0, 0.3), tb = ta + r.range(0.05, 0.16), lit = r() < 0.5;
    far.push(el('path', { d: poly(stream(th0, ta, tb)), fill: 'none', stroke: lit ? '#7fe6da' : '#021420', 'stroke-width': r.range(2, 9), opacity: (lit ? 0.22 : 0.4) * r.range(0.4, 1), 'stroke-linecap': 'round' }));
  }
  s.add(0, g({ filter: 'url(#glow2)' }, far));
  // a cold sheen of sky on the far water
  s.add(0, el('ellipse', { cx: 330, cy: 130, rx: 520, ry: 150, fill: '#b8fff4', opacity: 0.14, filter: 'url(#glow64)', transform: 'rotate(-12 330 130)' }));
  s.vignette({ strength: 0.75, color: '#010a14', cy: 0.48 });
  s.grain({ opacity: 0.2 });

  // ---- 1: the outer arms of foam and the far streaks
  const ARMS = [0.3, 1.9, 3.5, 5.0];
  // each arm is a hank of foam strands laid along the flow, so it reads as water being dragged, not as cloud
  const hank = (th0, n, ta0, tb0, w, spread) => {
    const lit = [], dark = [];
    for (let j = 0; j < n; j++) {
      const th = th0 + r.range(-spread, spread), ta = ta0 + r.range(0, 0.16), tb = tb0 - r.range(0, 0.2), ph = r.range(0, 6), ww = w * r.range(0.35, 1);
      const pts = stream(th, ta, tb, 46);
      lit.push(el('path', { d: ribbon(pts, ww, ww, (u) => Math.sin(Math.PI * Math.pow(u, 0.6)) * (0.6 + 0.4 * Math.sin(u * 15 + ph)) * (1 - 0.6 * u) + 0.03, 3), fill: '#ffffff', opacity: r.range(0.6, 1) }));
      dark.push(el('path', { d: poly(stream(th + 0.07, ta + 0.02, tb, 40)), fill: 'none', stroke: '#02141f', 'stroke-width': ww * 0.2, opacity: 0.3, 'stroke-linecap': 'round' }));
    }
    return { lit, dark };
  };
  const outerLit = [], outerDark = [];
  ARMS.forEach((th0) => { const h = hank(th0, 9, 0.0, 0.62, 76, 0.3); outerLit.push(...h.lit); outerDark.push(...h.dark); const h2 = hank(th0 + 0.8, 4, 0.02, 0.5, 40, 0.16); outerLit.push(...h2.lit); });
  s.add(1, g({ filter: 'url(#glow4)' }, outerDark));
  s.add(1, g({ filter: 'url(#rtFoam)', opacity: 0.78 }, outerLit));
  const lines1 = [];
  for (let i = 0; i < 130; i++) {
    const th0 = r.range(0, 6.283), ta = r.range(0.02, 0.36), tb = ta + r.range(0.04, 0.12), lit = r() < 0.62;
    lines1.push(el('path', { d: poly(stream(th0, ta, tb)), fill: 'none', stroke: lit ? '#f2fffd' : '#021a26', 'stroke-width': r.range(1.2, 4.5), opacity: (lit ? 0.6 : 0.5) * r.range(0.35, 1), 'stroke-linecap': 'round' }));
  }
  s.add(1, g({}, lines1));
  s.add(1, el('rect', { x: 0, y: 0, width: 1024, height: 330, fill: s.lin([[0, '#0a4a5e', 0.75], [0.5, '#1c7684', 0.3], [1, '#1c7684', 0]]) }));

  // ---- 2: the throat — glassy wall, bright inner arms, the black eye — and what it is swallowing
  const wall = [];
  const cols = [[0, '#00050a'], [40, '#010c16'], [64, '#03283a'], [96, '#0a6078'], [130, '#1cb0b4'], [166, '#6ff0de'], [206, '#2fc6c0'], [260, '#149aa0'], [330, '#0e7686'], [400, '#0b6070']];
  for (let i = 0; i <= 44; i++) {
    const rad = 400 * Math.pow(1 - i / 44, 1.25) + 8;
    const pts = []; for (let k = 0; k < 40; k++) pts.push(P(rad, k / 40 * Math.PI * 2));
    wall.push(el('path', { d: poly(pts, true), fill: ramp(cols, rad), opacity: Math.min(1, i / 9) }));
  }
  s.add(2, g({ filter: 'url(#glow4)' }, wall));
  { const q = []; for (let k = 0; k < 40; k++) q.push(P(176, k / 40 * Math.PI * 2)); s.add(2, el('path', { d: poly(q, true), fill: 'none', stroke: '#8ffff0', 'stroke-width': 40, opacity: 0.4, filter: 'url(#glow16)' })); }
  // light on the far wall, shadow under the near lip
  const arcOf = (rad, a0, a1) => { const q = []; for (let k = 0; k <= 24; k++) q.push(P(rad, a0 + (a1 - a0) * k / 24)); return poly(q); };
  s.add(2, g({ filter: 'url(#glow8)' }, [
    el('path', { d: arcOf(150, -2.7, -0.5), fill: 'none', stroke: '#eafffb', 'stroke-width': 26, opacity: 0.5, 'stroke-linecap': 'round' }),
    el('path', { d: arcOf(108, -2.4, -0.9), fill: 'none', stroke: '#9ff6ea', 'stroke-width': 16, opacity: 0.4, 'stroke-linecap': 'round' }),
    el('path', { d: arcOf(120, 0.5, 2.7), fill: 'none', stroke: '#01101c', 'stroke-width': 34, opacity: 0.6, 'stroke-linecap': 'round' }),
  ]));
  const innerLit = [], innerDark = [];
  ARMS.forEach((th0) => { const h = hank(th0, 8, 0.3, 0.97, 54, 0.22); innerLit.push(...h.lit); innerDark.push(...h.dark); const h2 = hank(th0 + 0.8, 4, 0.4, 0.95, 26, 0.14); innerLit.push(...h2.lit); });
  s.add(2, g({ filter: 'url(#glow4)' }, innerDark));
  s.add(2, g({ filter: 'url(#rtFoam)' }, innerLit));
  const lines2 = [];
  for (let i = 0; i < 230; i++) {
    const th0 = r.range(0, 6.283), ta = r.range(0.3, 0.92), tb = Math.min(0.99, ta + r.range(0.03, 0.1)), lit = r() < 0.66, w = (1 - ta) * 4.4 + 0.8;
    lines2.push(el('path', { d: poly(stream(th0, ta, tb, 18)), fill: 'none', stroke: lit ? '#ffffff' : '#011520', 'stroke-width': w * r.range(0.5, 1.2), opacity: (lit ? 0.85 : 0.6) * r.range(0.35, 1), 'stroke-linecap': 'round' }));
  }
  s.add(2, g({}, lines2));
  // the eye
  const eye = []; for (let k = 0; k < 30; k++) eye.push(P(44, k / 30 * Math.PI * 2));
  s.add(2, el('path', { d: poly(eye, true), fill: '#00040a', filter: 'url(#glow4)' }));
  const eye2 = []; for (let k = 0; k < 30; k++) eye2.push(P(62, k / 30 * Math.PI * 2));
  s.add(2, el('path', { d: poly(eye2, true), fill: 'none', stroke: '#bffff4', 'stroke-width': 2.5, opacity: 0.65, 'stroke-dasharray': '26 12 8 14' }));

  // wreckage and fish riding the arms inward
  const stuff = [];
  const put = (th0, t, markup, k = 1, spin = 0) => {
    const [x, y] = S(th0, t), a = tangent(th0, t) + spin, sc = k * (0.62 + 0.5 * y / 1024);
    stuff.push(el('ellipse', { cx: x, cy: y + 4 * sc, rx: 46 * sc, ry: 10 * sc, fill: '#ffffff', opacity: 0.4, filter: 'url(#glow4)', transform: `rotate(${a.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})` }));
    stuff.push(g({ transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)}) scale(${sc.toFixed(3)} ${(sc * 0.8).toFixed(3)})` }, markup));
  };
  for (let i = 0; i < 12; i++) put(r.range(0, 6.283), r.range(0.14, 0.6), plank(s, r.range(34, 70), r.range(7, 11)), 1.3, r.range(-40, 40));
  put(ARMS[2] + 0.5, 0.33, boat(s), 1.7, 8);
  put(ARMS[0] + 0.3, 0.46, barrel(s), 1.4, 70);
  put(ARMS[1] + 0.45, 0.27, mast(s), 1.5, -14);
  put(ARMS[3] + 0.4, 0.52, crate(s), 1.2, 25);
  for (let i = 0; i < 12; i++) put(r.range(0, 6.283), r.range(0.2, 0.7), fish(s, r), r.range(0.8, 1.15), 180 + r.range(-25, 25));
  s.add(2, g({ filter: 'url(#shadow)' }, stuff));

  // ---- 3: spray off the near rim, flecks, cold glints
  const spray = [];
  const plume = (x, y, deg, size, n) => {
    const a = deg * Math.PI / 180;
    spray.push(el('ellipse', { cx: x, cy: y, rx: size * 0.42, ry: size * 0.2, fill: '#f6fffd', opacity: 0.6, filter: 'url(#glow16)' }));
    for (let j = 0; j < 7; j++) {                // ribbons of thrown water
      const aa = a + r.range(-0.55, 0.55), l = size * r.range(0.4, 1), bend = r.range(-0.3, 0.3);
      const pts = [[x + r.range(-18, 18), y + r.range(-6, 6)], [x + Math.cos(aa) * l * 0.5, y + Math.sin(aa) * l * 0.5], [x + Math.cos(aa + bend) * l, y + Math.sin(aa + bend) * l + l * 0.12]];
      spray.push(el('path', { d: ribbon(pts, r.range(7, 15), 1), fill: '#ffffff', opacity: r.range(0.5, 0.9) }));
    }
    for (let i = 0; i < n; i++) {                // droplets, small and fast at the tips
      const d = Math.pow(r(), 0.8) * size * 1.25, aa = a + r.range(-0.75, 0.75), px = x + Math.cos(aa) * d, py = y + Math.sin(aa) * d + d * d / size * 0.14, k = r.range(1.6, 6.5) * (1.15 - d / (size * 1.4));
      spray.push(el('path', { d: `M${px.toFixed(1)} ${py.toFixed(1)}l${(Math.cos(aa) * k * 2.2).toFixed(1)} ${(Math.sin(aa) * k * 2.2).toFixed(1)}`, stroke: '#ffffff', 'stroke-width': Math.max(1.2, k), 'stroke-linecap': 'round', opacity: r.range(0.6, 1) }));
    }
  };
  plume(292, 596, -128, 150, 60); plume(716, 612, -50, 160, 64); plume(150, 420, -160, 120, 40); plume(872, 368, -24, 130, 44);
  plume(842, 452, -70, 110, 40); plume(470, 250, -100, 80, 26);
  s.add(3, g({}, spray));
  const bokeh = [];
  for (let i = 0; i < 12; i++) { const x = r.pick([r.range(0, 200), r.range(824, 1024)]), y = r.range(80, 980), k = r.range(8, 24); bokeh.push(el('circle', { cx: x, cy: y, r: k, fill: '#eafffb', opacity: r.range(0.14, 0.34) })); }
  s.add(3, g({ filter: 'url(#glow4)' }, bokeh));
  // the nearest water: thick strands of foam tearing past along the bottom edge
  const near = [];
  for (let i = 0; i < 60 && near.length < 9; i++) {
    const th0 = r.range(0, 6.283), ta = r.range(-0.07, 0.0), tb = ta + r.range(0.07, 0.12), mid = S(th0, (ta + tb) / 2);
    if (mid[1] < 880 || mid[0] < -100 || mid[0] > 1124) continue;
    const ph = r.range(0, 6);
    near.push(el('path', { d: ribbon(stream(th0, ta, tb, 30), 70, 70, (u) => Math.sin(Math.PI * u) * (0.6 + 0.4 * Math.sin(u * 12 + ph)) + 0.02, 3), fill: '#f6fffd', opacity: r.range(0.55, 0.95) }));
  }
  s.add(3, g({ filter: 'url(#rtFoam)' }, near));
  s.fog({ color: '#eafffb', opacity: 0.22, freq: 0.008, layer: 3, y: 600, h: 440, contrast: 2.6 });
  s.motes({ n: 70, rmin: 1, rmax: 4.4, colors: ['#ffffff', '#cffff6', '#9ff0e6'], opacity: 0.85 });
  s.bubbles({ n: 10, y0: 560, rmin: 3, rmax: 12, color: '#eafffb' });
  s.add(3, glint(404, 356, 22, '#fff', 0.9), glint(668, 310, 14, '#eafffb', 0.8), glint(300, 612, 16, '#fff', 0.8), glint(742, 588, 20, '#fff', 0.85), glint(560, 232, 11, '#eafffb', 0.7));
}

// ---------------------------------------------------------------------------------------------------- flotsam

const WOOD = (s) => s.lin([[0, '#ffc98a'], [0.25, '#b9743a'], [1, '#4a2616']]);

function plank(s, w, h) {
  return [
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 1.5, fill: WOOD(s), stroke: '#1e0e08', 'stroke-width': 1.5 }),
    el('path', { d: `M${-w / 2 + 3} ${-h / 2 + 2.5}L${w / 2 - 6} ${-h / 2 + 2.5}`, stroke: '#ffe3b8', 'stroke-width': 1.4, opacity: 0.8 }),
  ].join('');
}

function boat(s) {
  return [
    el('path', { d: 'M-66 -14C-50 22 44 26 70 -18L52 -6C24 6 -30 4 -52 -8Z', fill: s.lin([[0, '#c98044'], [0.5, '#7a4322'], [1, '#2e1608']]), stroke: '#1e0e08', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }),
    el('path', { d: 'M-66 -14C-40 -30 40 -34 70 -18L52 -6C24 6 -30 4 -52 -8Z', fill: '#1c0c08', stroke: '#1e0e08', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }),
    el('path', { d: 'M-66 -14C-40 -30 40 -34 70 -18', fill: 'none', stroke: '#ffd9a0', 'stroke-width': 3, 'stroke-linecap': 'round' }),
    el('path', { d: 'M-30 -8L-26 -27M4 -5L6 -30M36 -8L34 -27', stroke: '#b06a34', 'stroke-width': 5 }),
    el('path', { d: 'M-58 2C-30 16 30 18 60 0', fill: 'none', stroke: '#3a1c0c', 'stroke-width': 2, opacity: 0.7 }),
    el('path', { d: 'M12 -24L96 -64', stroke: '#e0a060', 'stroke-width': 5, 'stroke-linecap': 'round' }),
    el('path', { d: 'M86 -66L112 -76L106 -56Z', fill: '#e0a060', stroke: '#1e0e08', 'stroke-width': 1.5 }),
  ].join('');
}

function barrel(s) {
  return [
    el('rect', { x: -30, y: -20, width: 60, height: 40, rx: 15, fill: s.lin([[0, '#ffc98a'], [0.3, '#b06a30'], [1, '#3e1e10']]), stroke: '#1e0e08', 'stroke-width': 2.5 }),
    ...[-16, 0, 16].map((x) => el('rect', { x: x - 2.5, y: -20, width: 5, height: 40, fill: '#2a3440', opacity: 0.85 })),
    el('path', { d: 'M-22 -13L22 -13', stroke: '#fff0d0', 'stroke-width': 2.4, opacity: 0.8, 'stroke-linecap': 'round' }),
  ].join('');
}

function crate(s) {
  return [
    el('rect', { x: -24, y: -22, width: 48, height: 44, rx: 2, fill: WOOD(s), stroke: '#1e0e08', 'stroke-width': 2.5 }),
    el('path', { d: 'M-24 -22L24 22M-24 22L24 -22M-24 -8L24 -8M-24 8L24 8', stroke: '#3a1c0c', 'stroke-width': 2.4, opacity: 0.7 }),
    el('path', { d: 'M-20 -18L20 -18', stroke: '#ffe3b8', 'stroke-width': 2, opacity: 0.8 }),
  ].join('');
}

function mast(s) {
  return [
    el('path', { d: 'M-30 -4C-10 -52 40 -58 78 -34C52 -30 30 -14 22 4Z', fill: s.lin([[0, '#f6fff8'], [1, '#8fb8b4']]), stroke: '#14303a', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
    el('path', { d: 'M-12 -22C10 -34 34 -36 56 -32M-2 -10C14 -20 30 -24 44 -22', fill: 'none', stroke: '#5a8a8c', 'stroke-width': 1.6, opacity: 0.8 }),
    el('rect', { x: -86, y: -6, width: 172, height: 12, rx: 5, fill: WOOD(s), stroke: '#1e0e08', 'stroke-width': 2.5 }),
    el('path', { d: 'M-80 -2L60 -2', stroke: '#ffe3b8', 'stroke-width': 2, opacity: 0.8 }),
    el('path', { d: 'M86 -6L98 -12L94 -2L102 4L88 6Z', fill: '#8a4c24', stroke: '#1e0e08', 'stroke-width': 1.5 }),
    el('rect', { x: -40, y: -9, width: 7, height: 18, fill: '#2a3440' }), el('rect', { x: 30, y: -9, width: 7, height: 18, fill: '#2a3440' }),
  ].join('');
}

function fish(s, r) {
  const c = r.pick([['#f2fffb', '#6fd0d0', '#0e4a5c'], ['#fff6d8', '#ffc070', '#a84a20'], ['#f2fffb', '#8ab8e0', '#1c3c70']]);
  return [
    el('path', { d: 'M-20 0L-36 -11L-31 0L-36 11Z', fill: c[1], stroke: '#04202c', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }),
    el('path', { d: 'M-22 0C-8 -13 12 -12 24 0C12 11 -8 12 -22 0Z', fill: s.lin([[0, c[0]], [0.45, c[1]], [1, c[2]]]), stroke: '#04202c', 'stroke-width': 1.5 }),
    el('path', { d: 'M-4 -9L4 -17L10 -8Z', fill: c[1], stroke: '#04202c', 'stroke-width': 1.2 }),
    el('circle', { cx: 14, cy: -2, r: 2.6, fill: '#04202c' }), el('circle', { cx: 14.8, cy: -2.8, r: 0.9, fill: '#fff' }),
    el('path', { d: 'M-12 -5C0 -9 10 -8 16 -6', fill: 'none', stroke: '#fff', 'stroke-width': 1.6, opacity: 0.85, 'stroke-linecap': 'round' }),
  ].join('');
}
