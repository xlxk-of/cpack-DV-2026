// OLD THOUSAND-ARMS (legendary) — the kraken rising out of the trench, one vast gold eye, arms without number.
import { el, g, spline, sample, poly, ribbon, glint } from '../lib.mjs';

// ------------------------------------------------------------------------------------------------ local helpers

/** Sampled centreline with unit normals and arc length. */
function frame(pts, per = 12) {
  const sm = sample(pts, per);
  let acc = 0;
  return sm.map((p, i) => {
    const a = sm[Math.max(0, i - 1)], b = sm[Math.min(sm.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    if (i > 0) acc += Math.hypot(p[0] - sm[i - 1][0], p[1] - sm[i - 1][1]);
    return { x: p[0], y: p[1], nx: -dy / l, ny: dx / l, t: 0, len: acc };
  }).map((p, i, all) => { p.t = p.len / (all[all.length - 1].len || 1); return p; });
}

/** Append a tightening spiral to the end of a point list (a curled arm tip). sign +1 turns clockwise on screen. */
function curl(pts, radius, turns, sign, shrink = 0.84) {
  const a = pts[pts.length - 2], b = pts[pts.length - 1];
  const h = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const cx = b[0] + Math.cos(h + sign * Math.PI / 2) * radius, cy = b[1] + Math.sin(h + sign * Math.PI / 2) * radius;
  const a0 = h - sign * Math.PI / 2, N = Math.ceil(turns * 9);
  const out = pts.slice();
  for (let k = 1; k <= N; k++) {
    const t = k / N, ang = a0 + sign * turns * Math.PI * 2 * t, rr = radius * (1 - shrink * t);
    out.push([cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr]);
  }
  return out;
}

/** A tapered arm with a suckered underside, edge shading and a rim light. Returns markup. */
function tentacle(s, pts, w0, w1, o) {
  const f = frame(pts, o.per || 12);
  const pw = o.pow || 1.25;
  const W = (t) => w1 + (w0 - w1) * Math.pow(1 - t, pw);
  const side = o.side || 1;
  const off = (p, k) => [p.x + p.nx * W(p.t) * k * side, p.y + p.ny * W(p.t) * k * side];
  const A = f.map((p) => off(p, 0.5)), B = f.map((p) => off(p, -0.5));
  const d = poly(A.concat(B.slice().reverse()), true);
  const out = [];
  if (o.glow) out.push(el('path', { d, fill: o.glow, opacity: o.glowOp || 0.3, filter: 'url(#glow16)' }));
  out.push(el('path', { d, fill: o.fill }));
  const inner = [];
  // the underside: a band along the sucker edge, soft where it meets the back
  const bw = o.bellyW ?? 0.3;
  const bellyA = f.map((p) => off(p, 0.56)), bellyB = f.map((p) => off(p, 0.5 - bw));
  inner.push(el('path', { d: poly(bellyA.concat(bellyB.slice().reverse()), true), fill: o.belly, opacity: o.bellyOp ?? 0.9, filter: s.blur(Math.max(0.8, w0 * 0.02)) }));
  // soft shadow down the far edge, highlight ridge along the back
  inner.push(el('path', { d: poly(B), fill: 'none', stroke: o.dark, 'stroke-width': w0 * 0.4, opacity: 0.8, filter: s.blur(Math.max(2, w0 * 0.08)), 'stroke-linejoin': 'round' }));
  inner.push(el('path', { d: poly(f.map((p) => off(p, -0.1))), fill: 'none', stroke: o.light, 'stroke-width': w0 * 0.13, opacity: o.lightOp ?? 0.5, filter: s.blur(Math.max(1.5, w0 * 0.05)), 'stroke-linecap': 'round' }));
  // freckles along the back
  if (o.spots) {
    let nx = 0, k = 0;
    for (const p of f) {
      const w = W(p.t);
      if (p.len < nx || w < 14) continue;
      nx = p.len + w * 0.42; k++;
      const c = off(p, -0.2 + 0.12 * Math.sin(k * 2.4));
      inner.push(el('circle', { cx: c[0], cy: c[1], r: w * (0.035 + 0.02 * Math.sin(k * 1.7) ** 2), fill: o.spots, opacity: 0.4 }));
    }
  }
  // suckers
  if (o.suckers !== false) {
    const sr = o.suckR ?? 0.105;
    let next = W(0) * 0.2;
    for (const p of f) {
      const w = W(p.t);
      if (p.len < next) continue;
      next = p.len + Math.max(3, w * sr * 2.7);
      const rr = w * sr;
      if (rr < 1) continue;
      const c = off(p, 0.5 - bw * 0.52);
      inner.push(el('circle', { cx: c[0], cy: c[1], r: rr, fill: o.sucker, stroke: o.suckerEdge, 'stroke-width': Math.max(0.5, rr * 0.16), 'stroke-opacity': 0.8 }));
      if (rr > 2) inner.push(el('circle', { cx: c[0] + rr * 0.06, cy: c[1] + rr * 0.08, r: rr * 0.45, fill: o.suckerEdge, opacity: 0.8 }));
      if (rr > 5) inner.push(el('circle', { cx: c[0] - rr * 0.4, cy: c[1] - rr * 0.42, r: rr * 0.17, fill: '#fff', opacity: 0.55 }));
    }
  }
  out.push(g({ 'clip-path': s.clip(el('path', { d })) }, inner));
  // edge lines: they also separate the coils of a curled tip
  out.push(el('path', { d: poly(A), fill: 'none', stroke: o.edge || o.dark, 'stroke-width': Math.max(1, w0 * 0.02), opacity: 0.75, 'stroke-linejoin': 'round' }));
  out.push(el('path', { d: poly(B.filter((_, i) => f[i].t >= (o.rimFrom || 0))), fill: 'none', stroke: o.rim, 'stroke-width': Math.max(1.1, w0 * 0.028), opacity: o.rimOp ?? 0.8, 'stroke-linejoin': 'round' }));
  return g({}, out);
}

/** A turbulence texture filter: fills its source shape with blotches of `color` (alpha from the noise). */
function mottle(s, color, freq, contrast, seed) {
  const id = s.uid('mt'), off = -(contrast - 1) * 0.6;
  const c = [1, 3, 5].map((i) => (parseInt(color.slice(i, i + 2), 16) / 255).toFixed(3));
  s.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 ${c[0]}  0 0 0 0 ${c[1]}  0 0 0 0 ${c[2]}  ${contrast} 0 0 0 ${off}"/><feComposite in2="SourceGraphic" operator="in"/></filter>`);
  return `url(#${id})`;
}

/** Tinted murk over a box, fading at its edges (the kit's fog comes out white whatever its colour). */
function mist(s, { color, opacity = 0.3, freq = 0.006, seed = 1, x = 0, y = 0, w = 1024, h = 1024, contrast = 2.2 }) {
  const m = s.mask(el('rect', { x, y, width: w, height: h, fill: s.rad([[0, '#fff', 1], [0.7, '#fff', 0.7], [1, '#fff', 0]], 0.5, 0.5, 0.6) }));
  return g({ mask: m, opacity }, el('rect', { x, y, width: w, height: h, fill: color, filter: mottle(s, color, freq, contrast, seed) }));
}

/** The tiny broken ship, drawn around (0,0), about 120 px long. */
function wreck(s, x, y, rot, k, hull = '#1a1030', sail = '#8f7aa8') {
  const p = [];
  // hull, snapped amidships
  p.push(el('path', { d: 'M-62 -6 Q-58 16 -30 20 L-6 20 L-2 4 L-10 -4 Z', fill: hull }));
  p.push(el('path', { d: 'M6 2 L12 22 L40 18 Q62 12 70 -12 L52 -6 L20 -2 Z', fill: hull, transform: 'rotate(14 10 10)' }));
  // masts and rags of sail
  p.push(el('path', { d: 'M-34 -4 L-40 -78', stroke: hull, 'stroke-width': 4, 'stroke-linecap': 'round' }));
  p.push(el('path', { d: 'M34 -2 L52 -58', stroke: hull, 'stroke-width': 3.4, 'stroke-linecap': 'round' }));
  p.push(el('path', { d: 'M-58 -52 L-20 -60', stroke: hull, 'stroke-width': 2.4 }));
  p.push(el('path', { d: 'M-56 -52 Q-48 -30 -52 -14 L-40 -22 L-34 -10 Q-26 -34 -22 -59 Z', fill: sail, opacity: 0.85 }));
  p.push(el('path', { d: 'M36 -44 Q44 -30 40 -14 L50 -20 L58 -12 Q62 -30 60 -50 Z', fill: sail, opacity: 0.7 }));
  p.push(el('path', { d: 'M-62 -6 L-84 -20', stroke: hull, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
  // lantern still burning
  p.push(el('circle', { cx: -40, cy: -80, r: 9, fill: '#ffd070', opacity: 0.5, filter: 'url(#glow4)' }));
  p.push(el('circle', { cx: -40, cy: -80, r: 2.6, fill: '#fff2c0' }));
  // top light on the hull
  p.push(el('path', { d: 'M-62 -6 L-10 -4', stroke: '#c9a6ff', 'stroke-width': 1.6, opacity: 0.7 }));
  p.push(el('path', { d: 'M14 -3 L58 -14', stroke: '#c9a6ff', 'stroke-width': 1.4, opacity: 0.6 }));
  return g({ transform: `translate(${x} ${y}) rotate(${rot}) scale(${k})` }, p);
}

// ------------------------------------------------------------------------------------------------ the scene

export function build(s) {
  const r = s.r;

  // ---- 0: the trench
  s.backdrop(s.lin([[0, '#1d3278'], [0.22, '#161c58'], [0.55, '#150a38'], [0.82, '#1f0628'], [1, '#090212']]));
  // far surface light, and the hot breath of the trench below
  s.add(0, el('ellipse', { cx: 470, cy: 20, rx: 640, ry: 340, fill: s.rad([[0, '#6f9cff', 0.6], [0.5, '#4458d8', 0.22], [1, '#4458d8', 0]]) }));
  s.add(0, el('ellipse', { cx: 512, cy: 930, rx: 640, ry: 360, fill: s.rad([[0, '#ff3a5c', 0.6], [0.45, '#b0185e', 0.3], [1, '#7a1070', 0]]) }));
  s.add(0, el('ellipse', { cx: 512, cy: 440, rx: 470, ry: 420, fill: s.rad([[0, '#8a3cff', 0.36], [0.6, '#5a2ad0', 0.14], [1, '#5a2ad0', 0]]) }));
  s.add(0, mist(s, { color: '#6a5cff', opacity: 0.42, freq: 0.005, seed: 11 }));
  s.add(0, mist(s, { color: '#ff3a6a', opacity: 0.4, freq: 0.007, seed: 23, y: 480, h: 660 }));
  s.rays({ x: 430, y: -160, angle: 84, spread: 64, n: 9, color: '#a9c2ff', opacity: 0.15, width: 80, len: 1100 });
  // the trench walls, far and soft
  const wall = (side, depth, fill, op, blur) => {
    const n = noise1b(r), pts = [];
    const x0 = side < 0 ? -60 : 1084;
    pts.push([x0, -60]);
    for (let i = 0; i <= 24; i++) {
      const t = i / 24, y = -60 + 1150 * t;
      pts.push([x0 - side * (depth * (0.5 + 0.95 * t * t) + 70 * (n(t * 9) - 0.5) + 26 * (n(t * 37 + 5) - 0.5)), y]);
    }
    pts.push([x0, 1100]);
    s.add(0, el('path', { d: poly(pts, true), fill, opacity: op, filter: s.blur(blur) }));
  };
  wall(-1, 150, '#0d0a36', 0.7, 10); wall(1, 170, '#0d0a36', 0.7, 10);
  wall(-1, 80, '#07041c', 0.85, 5); wall(1, 95, '#07041c', 0.85, 5);
  // countless arms further off still, no more than shadows in the murk
  const ghost = [];
  for (let i = 0; i < 9; i++) {
    const x = 60 + i * 113 + r.range(-30, 30), top = r.range(120, 420), sw = r.range(40, 110) * r.sign();
    const pts = curl([[x, 1100], [x + sw * 0.6, 800], [x - sw * 0.4, top + 200], [x + sw * 0.2, top]], r.range(24, 44), 1.1, r.sign());
    ghost.push(el('path', { d: ribbon(pts, r.range(36, 60), 3, null, 8), fill: '#181452' }));
  }
  s.add(0, g({ opacity: 0.6, filter: s.blur(5) }, ghost));
  s.motes({ n: 110, rmin: 0.6, rmax: 2.2, colors: ['#c9b8ff', '#ff9ab8', '#9fc0ff'], opacity: 0.5, glow: false, layer: 0 });
  s.vignette({ strength: 0.78, cy: 0.42 });
  s.grain({ opacity: 0.2 });

  // ---- 1: the arms behind, hazed by distance, one of them holding what is left of a ship
  const farStyle = (k) => ({
    fill: s.lin([[0, k ? '#3d3a8c' : '#4a3488'], [0.5, '#30246c'], [1, '#180f3c']]),
    belly: '#7a6cc0', bellyOp: 0.45, dark: '#120a30', light: '#7f84e0', lightOp: 0.3, rim: '#9aa0f0', rimOp: 0.5,
    sucker: '#9a90d8', suckerEdge: '#30246c', edge: '#120a30', bellyW: 0.3,
  });
  const far = [];
  const farArms = [
    // [points, w0, w1, curl radius, turns, sign, side]
    [[[300, 1100], [200, 800], [90, 520], [64, 340], [100, 250]], 96, 5, 60, 1.3, 1, -1],
    [[[720, 1100], [830, 800], [930, 560], [950, 340], [905, 220]], 96, 5, 54, 1.3, -1, 1],
    [[[400, 1100], [290, 760], [230, 520], [215, 400]], 60, 4, 36, 1.2, -1, 1],
    [[[640, 1100], [760, 780], [820, 420], [800, 180], [740, 90]], 62, 4, 38, 1.15, -1, 1],
    [[[180, 1100], [80, 900], [20, 700], [10, 560]], 60, 5, 40, 1.2, -1, 1],
    [[[860, 1100], [960, 900], [1010, 700], [1012, 590]], 60, 5, 40, 1.2, 1, -1],
    [[[560, 1100], [640, 860], [700, 700]], 50, 4, 30, 1.1, 1, -1],
    [[[470, 1100], [400, 880], [340, 730]], 50, 4, 30, 1.1, -1, 1],
  ];
  // the ship is caught in the first arm's coil
  farArms.forEach((a, i) => far.push(tentacle(s, curl(a[0], a[3], a[4], a[5]), a[1], a[2], { ...farStyle(i % 2), side: a[6] })));
  // splinters around the wreck
  for (let i = 0; i < 14; i++) {
    const x = 176 + r.range(-120, 130), y = 180 + r.range(-130, 150);
    far.push(el('rect', { x, y, width: r.range(4, 13), height: r.range(1.4, 3), fill: '#0e0a26', opacity: 0.8, transform: `rotate(${r.range(0, 180)} ${x} ${y})` }));
  }
  s.add(1, g({ opacity: 0.9, filter: s.blur(0.9) }, far.slice(1)));
  s.add(1, el('circle', { cx: 170, cy: 150, r: 90, fill: '#8fb0ff', opacity: 0.3, filter: 'url(#glow32)' }), wreck(s, 176, 176, -22, 1.05, '#0e0a26', '#c8bce8'));
  s.add(1, g({ opacity: 0.9, filter: s.blur(0.9) }, far[0]));
  // a veil of haze over the far arms so the head separates from them
  s.add(1, el('ellipse', { cx: 512, cy: 560, rx: 560, ry: 440, fill: s.rad([[0, '#5a3cd0', 0.4], [0.7, '#4a2ab0', 0.14], [1, '#4a2ab0', 0]]) }));

  // ---- 2: the head, the eye, and the near arms
  const midStyle = () => ({
    fill: s.lin([[0, '#c8243a'], [0.45, '#96143a'], [1, '#420c3c']]),
    belly: '#f09a98', bellyOp: 0.85, dark: '#30062a', light: '#ff7a68', lightOp: 0.5, rim: '#ffb39a', rimOp: 0.8,
    sucker: '#ffe0d4', suckerEdge: '#9a2848', edge: '#240520', glow: '#ff3a5c', glowOp: 0.16, spots: '#ffb0a0',
  });
  const arms = [];
  const midArms = [
    [[[400, 640], [320, 770], [200, 790], [130, 700], [140, 600]], 100, 6, 54, 1.35, 1, -1],
    [[[630, 640], [720, 760], [840, 760], [905, 660], [880, 540]], 100, 6, 58, 1.4, -1, 1],
    [[[450, 660], [430, 800], [350, 900], [270, 950]], 88, 8, 52, 1.25, 1, -1],
    [[[580, 660], [600, 810], [690, 910], [780, 960]], 88, 8, 50, 1.2, -1, 1],
    [[[350, 590], [250, 590], [190, 500], [205, 420]], 66, 5, 36, 1.3, 1, -1],
    [[[680, 600], [770, 640], [830, 610]], 60, 5, 34, 1.2, -1, 1],
  ];
  // two arms straight down into the dark, behind the rest
  arms.push(tentacle(s, [[480, 650], [430, 790], [500, 900], [610, 990], [640, 1120]], 96, 40, { ...midStyle(), side: 1, pow: 0.9 }));
  arms.push(tentacle(s, [[550, 650], [610, 780], [540, 900], [430, 1000], [400, 1120]], 92, 40, { ...midStyle(), side: -1, pow: 0.9 }));
  midArms.forEach((a) => arms.push(tentacle(s, curl(a[0], a[3], a[4], a[5]), a[1], a[2], { ...midStyle(), side: a[6] })));
  // the arms sink into shadow under the head
  arms.push(el('ellipse', { cx: 512, cy: 700, rx: 260, ry: 100, fill: '#1a0428', opacity: 0.8, filter: 'url(#glow32)' }));
  s.add(2, g({}, arms));

  const cx = 512, ey = 462, R = 110;
  const mir = (pts) => pts.concat(pts.slice(1, -1).reverse().map((p) => [1024 - p[0], p[1]]));
  const headPts = mir([[512, -6], [566, 30], [626, 116], [672, 228], [694, 330], [692, 404], [744, 488], [716, 596], [634, 668], [512, 694]]);
  const head = spline(headPts, true);
  const tilt = `rotate(7 512 500)`;
  const body = [];

  // the arrowhead fins of the mantle, behind it
  const finL = spline([[506, -24], [396, 52], [290, 160], [214, 292], [262, 318], [318, 322], [366, 372], [424, 250], [474, 100]], true);
  const finFill = s.lin([[0, '#3a1c78'], [0.55, '#501662'], [1, '#7a1848']], 0, 0.3, 1, 0.5);
  const finIn = [];
  for (let i = 0; i < 11; i++) {
    const y0 = 30 + i * 32, x0 = 500 - i * 15;
    finIn.push(el('path', { d: `M${x0} ${y0}Q${x0 - 90} ${y0 + 20} ${x0 - 230} ${y0 + 110}`, fill: 'none', stroke: '#d6a0ff', 'stroke-width': 1.6, opacity: 0.07 + 0.08 * (i % 2) }));
  }
  finIn.push(el('path', { d: spline([[474, 100], [424, 250], [350, 378]]), fill: 'none', stroke: '#1c0530', 'stroke-width': 70, opacity: 0.65, filter: 'url(#glow16)' }));
  const fin = [
    el('path', { d: finL, fill: finFill, filter: s.rough(14, 0.018, 5) }),
    g({ 'clip-path': s.clip(el('path', { d: finL })) }, finIn),
    el('path', { d: spline([[506, -24], [396, 52], [290, 160], [214, 292]]), fill: 'none', stroke: '#d0a8ff', 'stroke-width': 2.4, opacity: 0.6, 'stroke-linecap': 'round' }),
  ];
  body.push(g({ transform: tilt }, [g({}, fin), g({ transform: 'translate(1024 0) scale(-1 1)', opacity: 0.86 }, fin)]));

  body.push(el('path', { d: head, fill: '#ff2a55', opacity: 0.28, filter: 'url(#glow32)', transform: tilt }));
  const flesh = [];
  flesh.push(el('path', { d: head, fill: s.rad([[0, '#ea4430'], [0.22, '#c21c36'], [0.52, '#8a1038'], [0.8, '#4a0c42'], [1, '#220734']], 0.38, 0.22, 0.85) }));
  const hClip = s.clip(el('path', { d: head }));
  const skin = [];
  skin.push(el('rect', { x: 230, y: -20, width: 570, height: 730, fill: '#2a0428', opacity: 0.7, filter: mottle(s, '#2a0428', 0.012, 3.2, 7) }));
  skin.push(el('rect', { x: 230, y: -20, width: 570, height: 730, fill: '#ff7a5a', opacity: 0.3, filter: mottle(s, '#ff8a5a', 0.045, 3.6, 19) }));
  // pale ring spots
  for (let i = 0; i < 90; i++) {
    const x = r.range(260, 770), y = r.range(10, 680);
    if (Math.hypot(x - cx, y - ey) < R * 1.75) continue;
    const rr = r.range(3, 12) * (1.1 - y / 1100);
    skin.push(el('circle', { cx: x, cy: y, r: rr, fill: '#ffc8b0', 'fill-opacity': 0.07, stroke: '#ffb09a', 'stroke-width': rr * 0.26, 'stroke-opacity': 0.24 }));
  }
  // form shadows: right flank, underside, the pinch between mantle and face
  skin.push(el('ellipse', { cx: 790, cy: 340, rx: 130, ry: 420, fill: '#1c0534', opacity: 0.85, filter: 'url(#glow32)' }));
  skin.push(el('ellipse', { cx: 512, cy: 740, rx: 330, ry: 130, fill: '#160428', opacity: 0.9, filter: 'url(#glow32)' }));
  skin.push(el('path', { d: 'M300 392Q512 318 724 392', fill: 'none', stroke: '#22062e', 'stroke-width': 40, opacity: 0.45, filter: 'url(#glow16)' }));
  // sheen from the surface light
  skin.push(el('ellipse', { cx: 432, cy: 150, rx: 90, ry: 56, fill: '#ffc0b0', opacity: 0.32, filter: 'url(#glow32)', transform: 'rotate(-50 432 150)' }));
  // red light from the trench under the chin
  skin.push(el('ellipse', { cx, cy: 690, rx: 190, ry: 34, fill: '#ff4a4a', opacity: 0.3, filter: 'url(#glow16)' }));
  // gold light from the eye spilling over the face
  skin.push(el('circle', { cx, cy: ey, r: 190, fill: s.rad([[0, '#ffc060', 0.55], [0.6, '#ff5a2a', 0.2], [1, '#ff3a2a', 0]]) }));
  // bags under the eye, furrows over the brow
  for (let i = 0; i < 3; i++) {
    const a = R * 1.34 + i * 22, b = R * 1.02 + i * 20;
    skin.push(el('path', { d: `M${cx - a} ${ey + 26}A${a} ${b} 0 0 0 ${cx + a} ${ey + 26}`, fill: 'none', stroke: '#2a0626', 'stroke-width': 3.6 - i * 0.5, opacity: 0.5 - i * 0.08, 'stroke-linecap': 'round' }));
    skin.push(el('path', { d: `M${cx - a} ${ey + 22}A${a} ${b} 0 0 0 ${cx + a} ${ey + 22}`, fill: 'none', stroke: '#ffa070', 'stroke-width': 1.4, opacity: 0.25, 'stroke-linecap': 'round' }));
  }
  for (let i = 0; i < 2; i++) {
    const a = R * 1.6 + i * 30, b = R * 1.6 + i * 26;
    skin.push(el('path', { d: `M${cx - a} ${ey - 40}A${a} ${b} 0 0 1 ${cx + a} ${ey - 40}`, fill: 'none', stroke: '#2a0626', 'stroke-width': 3, opacity: 0.32 - i * 0.1, 'stroke-linecap': 'round' }));
  }
  // rows of violet photophores sweeping down the mantle
  for (let row = 0; row < 7; row++) {
    const k = (row - 3) / 3;
    const line = sample([[512 + k * 20, 12], [512 + k * 96, 100], [512 + k * 146, 220], [512 + k * 164, 318]], 6);
    line.forEach((p, i) => {
      if (i % 2) return;
      const rr = 1.5 + 2.4 * Math.sin(Math.PI * i / line.length) * (1 - Math.abs(k) * 0.35);
      skin.push(el('circle', { cx: p[0], cy: p[1], r: rr * 2.8, fill: '#b06cff', opacity: 0.3 }));
      skin.push(el('circle', { cx: p[0], cy: p[1], r: rr, fill: '#ecd8ff', opacity: 0.9 }));
    });
  }
  flesh.push(g({ 'clip-path': hClip }, skin));
  body.push(g({ transform: tilt, filter: s.emboss({ color: '#ffd9cf', az: 232, elev: 30, depth: 16, k: 0.75, exp: 30, blur: 13 }) }, flesh));
  // rim light along the crown
  body.push(el('path', { d: spline([[330, 330], [352, 228], [398, 116], [458, 30], [512, -6]]), fill: 'none', stroke: '#ffe0d6', 'stroke-width': 3, opacity: 0.7, 'stroke-linecap': 'round', filter: 'url(#glow2)', transform: tilt }));

  // the eye
  const eye = [];
  eye.push(el('circle', { cx, cy: ey, r: R * 1.25, fill: '#ffb030', opacity: 0.45, filter: 'url(#glow16)' }));
  eye.push(el('ellipse', { cx, cy: ey + 2, rx: R * 1.22, ry: R * 1.12, fill: '#14031c', opacity: 0.95, filter: 'url(#glow4)' }));
  eye.push(el('circle', { cx, cy: ey, r: R, fill: s.rad([[0, '#fffbe0'], [0.2, '#ffe884'], [0.48, '#ffc02e'], [0.75, '#f07a14'], [0.93, '#8a2a08'], [1, '#3a0c08']]) }));
  const iris = [];
  for (let i = 0; i < 110; i++) {
    const a = (i / 110) * Math.PI * 2 + r.range(-0.02, 0.02), r0 = R * r.range(0.2, 0.42), r1 = R * r.range(0.8, 0.99);
    iris.push(el('path', { d: `M${cx + Math.cos(a) * r0} ${ey + Math.sin(a) * r0}L${cx + Math.cos(a) * r1} ${ey + Math.sin(a) * r1}`, stroke: i % 3 ? '#8a3406' : '#fff6b8', 'stroke-width': r.range(0.8, 2.4), opacity: i % 3 ? 0.42 : 0.55 }));
  }
  iris.push(el('circle', { cx, cy: ey, r: R * 0.66, fill: 'none', stroke: '#fff3a0', 'stroke-width': 3, opacity: 0.35 }));
  iris.push(el('circle', { cx, cy: ey, r: R * 0.93, fill: 'none', stroke: '#5a1404', 'stroke-width': 7, opacity: 0.5 }));
  eye.push(g({}, iris));
  // the pupil: a horizontal slit, pinched at the ends
  const pw = R * 0.8, ph = R * 0.15, py = ey + R * 0.06;
  const pupil = `M${cx - pw} ${py}C${cx - pw * 0.5} ${py - ph * 1.7} ${cx + pw * 0.5} ${py - ph * 1.7} ${cx + pw} ${py}C${cx + pw * 0.5} ${py + ph * 1.7} ${cx - pw * 0.5} ${py + ph * 1.7} ${cx - pw} ${py}Z`;
  eye.push(el('path', { d: pupil, fill: '#7a2a04', opacity: 0.7, filter: 'url(#glow4)' }));
  eye.push(el('path', { d: pupil, fill: '#0a0210' }));
  // shadow cast by the brow, then highlights on the wet surface
  eye.push(g({ 'clip-path': s.clip(el('circle', { cx, cy: ey, r: R })) }, [
    el('ellipse', { cx, cy: ey - R * 0.9, rx: R * 1.3, ry: R * 0.62, fill: '#3a0810', opacity: 0.85, filter: 'url(#glow8)' }),
    el('ellipse', { cx, cy: ey + R * 1.25, rx: R * 1.2, ry: R * 0.4, fill: '#5a1408', opacity: 0.5, filter: 'url(#glow8)' }),
  ]));
  eye.push(el('ellipse', { cx: cx - 46, cy: ey - 8, rx: 21, ry: 11, fill: '#fff', opacity: 0.95, transform: `rotate(-28 ${cx - 46} ${ey - 8})` }));
  eye.push(el('circle', { cx: cx + 44, cy: ey + 46, r: 6, fill: '#fff', opacity: 0.6 }));
  eye.push(el('circle', { cx, cy: ey, r: R, fill: 'none', stroke: '#ffe9a0', 'stroke-width': 2.2, opacity: 0.6 }));
  // the brow: a heavy hood of flesh lowered over the eye in a scowl
  const browIn = `Q${cx + R * 0.7} ${ey - R * 0.62} ${cx} ${ey - R * 0.3}Q${cx - R * 0.7} ${ey - R * 0.62} ${cx - R * 1.66} ${ey + R * 0.12}`;
  const brow = `M${cx - R * 1.66} ${ey + R * 0.12}C${cx - R * 1.5} ${ey - R * 1.75} ${cx + R * 1.5} ${ey - R * 1.75} ${cx + R * 1.66} ${ey + R * 0.12}${browIn}Z`;
  const lidL = `M${cx - R * 1.44} ${ey + R * 0.4}C${cx - R * 0.8} ${ey + R * 1.42} ${cx + R * 0.8} ${ey + R * 1.42} ${cx + R * 1.44} ${ey + R * 0.4}C${cx + R * 0.7} ${ey + R * 1.2} ${cx - R * 0.7} ${ey + R * 1.2} ${cx - R * 1.44} ${ey + R * 0.4}Z`;
  eye.push(el('path', { d: brow, fill: s.lin([[0, '#9a1838', 0], [0.34, '#8a1438', 0.9], [0.72, '#4a0c30', 1], [1, '#22061e', 1]]) }));
  eye.push(el('path', { d: `M${cx - R * 1.2} ${ey - R * 0.56}Q${cx} ${ey - R * 1.22} ${cx + R * 1.2} ${ey - R * 0.56}`, fill: 'none', stroke: '#ff7a5a', 'stroke-width': 10, opacity: 0.28, 'stroke-linecap': 'round', filter: 'url(#glow8)' }));
  // gold light catching the lid edges
  eye.push(el('path', { d: `M${cx + R * 1.6} ${ey + R * 0.06}${browIn.replace(`${cx - R * 1.66} ${ey + R * 0.12}`, `${cx - R * 1.6} ${ey + R * 0.06}`)}`, fill: 'none', stroke: '#ffcf70', 'stroke-width': 3, opacity: 0.85, filter: 'url(#glow2)' }));
  // warts along the brow ridge
  for (let i = 0; i < 9; i++) {
    const t = (i + r.range(0.2, 0.8)) / 9, a = Math.PI * (1.1 + 0.8 * t), k = r.range(1.3, 1.62);
    const x = cx + Math.cos(a) * R * k, y = ey - 4 + Math.sin(a) * R * k * 0.84, rr = r.range(3, 8);
    eye.push(el('circle', { cx: x, cy: y, r: rr, fill: s.rad([[0, '#e86a58'], [0.5, '#8a1836'], [1, '#3a0a2c']], 0.35, 0.3, 0.7) }));
  }
  body.push(g({ transform: tilt }, eye));
  s.add(2, g({}, body));

  // ---- 3: the nearest arms, almost touching the glass, and the drift
  const nearStyle = () => ({
    fill: s.lin([[0, '#5a0c34'], [0.5, '#36082a'], [1, '#16041a']]),
    belly: '#c8607a', bellyOp: 0.8, dark: '#0a020e', light: '#b02a4a', lightOp: 0.45, rim: '#ff7a8a', rimOp: 0.9,
    sucker: '#ffc8c0', suckerEdge: '#5a1034', edge: '#0a020e', bellyW: 0.36, suckR: 0.12, spots: '#ff8a9a',
  });
  const near = [];
  near.push(tentacle(s, curl([[-150, 1100], [-60, 900], [50, 790], [180, 790], [250, 870]], 84, 1.3, 1), 250, 10, { ...nearStyle(), side: -1, per: 14, rimFrom: 0.66 }));
  near.push(tentacle(s, curl([[1180, 1030], [1080, 840], [980, 730], [890, 770]], 74, 1.25, -1), 230, 10, { ...nearStyle(), side: 1, per: 14 }));
  near.push(tentacle(s, curl([[1150, 250], [1050, 130], [960, 56], [880, 80]], 50, 1.2, -1), 150, 8, { ...nearStyle(), side: 1, per: 14 }));
  s.add(3, g({ filter: s.blur(1.3) }, near));
  s.add(3, el('rect', { x: -60, y: 760, width: 1144, height: 330, fill: s.lin([[0, '#12031c', 0], [0.6, '#12031c', 0.5], [1, '#0a0212', 0.8]]) }));
  s.rays({ x: 380, y: -200, angle: 80, spread: 40, n: 5, color: '#c9d6ff', opacity: 0.09, width: 70, len: 1000, layer: 3, blur: 18 });
  s.motes({ n: 50, rmin: 1.2, rmax: 5, colors: ['#ffb0c0', '#d9c2ff', '#ffe0a0', '#ffffff'], opacity: 0.8 });
  s.bubbles({ n: 16, x0: 120, x1: 900, y0: 60, y1: 800, rmin: 3, rmax: 17, color: '#ffd9e6', opacity: 0.55 });
  s.add(3, glint(478, 428, 26, '#fff6d0'), glint(700, 150, 14, '#e9d2ff', 0.8), glint(300, 560, 12, '#ffd0c0', 0.7));
}

/** A small noise function for the trench walls. */
function noise1b(r) {
  const v = Array.from({ length: 80 }, () => r());
  return (x) => { const f = ((x % 78) + 78) % 78, i = Math.floor(f), t = f - i, u = t * t * (3 - 2 * t); return v[i] * (1 - u) + v[i + 1] * u; };
}
