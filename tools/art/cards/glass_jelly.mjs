// GLASS JELLY (rare) — a jellyfish of living glass, lit from within, hanging in the black water.
import { el, g, spline, ribbon, sample, orb, glint } from '../lib.mjs';

export function build(s) {
  const r = s.r;
  // ---- 0: the abyss
  s.backdrop(s.lin([[0, '#0b4a63'], [0.35, '#072a4a'], [0.75, '#060f2e'], [1, '#03051a']]));
  s.add(0, el('ellipse', { cx: 520, cy: 380, rx: 520, ry: 430, fill: s.rad([[0, '#2ad0d8', 0.55], [0.5, '#1a6fae', 0.25], [1, '#1a6fae', 0]]) }));
  s.fog({ color: '#39c6d6', opacity: 0.28, freq: 0.005 });
  s.fog({ color: '#7a4fd8', opacity: 0.22, freq: 0.008, y: 380, h: 700 });
  s.rays({ x: 420, y: -120, angle: 78, spread: 46, n: 8, color: '#bdfcff', opacity: 0.2, width: 90 });
  s.motes({ n: 90, rmin: 0.6, rmax: 2.2, color: '#9fe9ff', opacity: 0.5, glow: false, layer: 0 });
  s.vignette({ strength: 0.72 });
  s.grain({ opacity: 0.2 });

  // ---- 1: far reef and a drift of small jellies
  s.ridge({ y: 900, amp: 130, detail: 0.9, fill: s.lin([[0, '#0c2a55'], [1, '#050a22']]), layer: 1, opacity: 0.85 });
  s.kelp({ x: 90, h: 420, n: 3, color: '#071c3e', layer: 1 });
  s.kelp({ x: 930, h: 520, n: 3, color: '#071c3e', layer: 1, lean: -0.08 });
  for (let i = 0; i < 6; i++) {
    const x = r.range(60, 960), y = r.range(120, 700), k = r.range(0.35, 0.8);
    if (Math.abs(x - 512) < 250 && Math.abs(y - 430) < 300) continue;
    s.add(1, miniJelly(x, y, 34 * k, r, r.pick(['#63e6ff', '#b08cff', '#ff8ad8'])));
  }
  s.ridge({ y: 985, amp: 70, detail: 1, fill: '#030717', layer: 1 });

  // ---- 2: the jelly
  const cx = 512, cy = 380, R = 215;
  const body = [];
  // tentacles behind the bell: long glass threads
  for (let i = 0; i < 13; i++) {
    const t = i / 12, x0 = cx - R * 0.78 + R * 1.56 * t, sway = r.range(-70, 70), len = r.range(330, 560);
    const pts = [[x0, cy + 60], [x0 + sway * 0.3, cy + 60 + len * 0.3], [x0 - sway * 0.5, cy + 60 + len * 0.62], [x0 + sway, cy + 60 + len]];
    const c = ['#7ff3ff', '#c9a6ff', '#ffa6e6'][i % 3];
    body.push(el('path', { d: spline(pts), fill: 'none', stroke: c, 'stroke-width': 7, opacity: 0.22, filter: 'url(#glow4)', 'stroke-linecap': 'round' }));
    body.push(el('path', { d: spline(pts), fill: 'none', stroke: s.lin([[0, '#eaffff', 0.95], [1, c, 0.1]], 0, cy, 0, cy + len, true), 'stroke-width': 2.2, 'stroke-linecap': 'round' }));
    for (const p of sample(pts, 5).filter((_, k) => k % 3 === 2)) body.push(el('circle', { cx: p[0], cy: p[1], r: r.range(1.6, 3.4), fill: '#fff', opacity: 0.8 }));
  }
  // frilled oral arms
  const armFill = s.lin([[0, '#ffe3fb', 0.95], [0.5, '#c78cff', 0.6], [1, '#5fd8ff', 0.05]]);
  for (let i = 0; i < 5; i++) {
    const x0 = cx - 90 + i * 45, sway = (i - 2) * 26 + r.range(-18, 18), len = r.range(260, 400);
    const pts = [[x0, cy + 30], [x0 + sway * 0.4 + 22, cy + len * 0.3], [x0 + sway * 0.8 - 26, cy + len * 0.62], [x0 + sway * 1.3 + 14, cy + len]];
    body.push(el('path', { d: ribbon(pts, 46, 3, (t) => 0.75 + 0.35 * Math.sin(t * 26 + i)), fill: armFill, opacity: 0.8, filter: s.rough(9, 0.03, 4 + i) }));
  }
  // the bell
  const bell = `M${cx - R} ${cy + 40}C${cx - R * 1.02} ${cy - R * 0.95} ${cx - R * 0.45} ${cy - R * 1.12} ${cx} ${cy - R * 1.12}C${cx + R * 0.45} ${cy - R * 1.12} ${cx + R * 1.02} ${cy - R * 0.95} ${cx + R} ${cy + 40}`
    + scallop(cx + R, cx - R, cy + 40, 9, 26) + 'Z';
  body.push(el('path', { d: bell, fill: '#5ff0ff', opacity: 0.35, filter: 'url(#glow32)' }));
  body.push(el('path', { d: bell, fill: s.rad([[0, '#f4ffff', 0.95], [0.3, '#8ff2ff', 0.75], [0.62, '#5a8dff', 0.5], [0.85, '#a66bff', 0.55], [1, '#ff9be4', 0.8]], 0.5, 0.2, 0.85) }));
  const bellClip = s.clip(el('path', { d: bell }));
  const inner = [];
  // ribs of light running down the dome
  for (let i = 0; i < 11; i++) {
    const t = i / 10, x1 = cx - R * 0.95 + R * 1.9 * t;
    inner.push(el('path', { d: `M${cx} ${cy - R * 1.1}Q${cx + (x1 - cx) * 1.15} ${cy - R * 0.6} ${x1} ${cy + 60}`, fill: 'none', stroke: '#fff', 'stroke-width': 2.4, opacity: 0.32 }));
  }
  // the four glowing rings inside
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.6, x = cx + Math.cos(a) * 58, y = cy - 70 + Math.sin(a) * 26;
    inner.push(el('ellipse', { cx: x, cy: y, rx: 40, ry: 24, fill: 'none', stroke: '#ffd9fb', 'stroke-width': 7, opacity: 0.85, filter: 'url(#glow2)' }));
  }
  inner.push(el('ellipse', { cx, cy: cy - 70, rx: 120, ry: 62, fill: s.rad([[0, '#fff', 0.9], [1, '#ff9bea', 0]]), opacity: 0.7 }));
  // oil-slick sheen across the glass
  inner.push(el('ellipse', { cx: cx + 70, cy: cy - 40, rx: 230, ry: 120, fill: s.lin([[0, '#7dffcf', 0], [0.4, '#7dffcf', 0.4], [0.6, '#ffe27a', 0.35], [0.8, '#ff7ad0', 0.35], [1, '#ff7ad0', 0]], 0, 0, 1, 0.3), transform: `rotate(24 ${cx} ${cy})` }));
  // dark under-lip so the dome reads as hollow
  inner.push(el('ellipse', { cx, cy: cy + 70, rx: R * 1.05, ry: 60, fill: '#1a1f6e', opacity: 0.45, filter: 'url(#glow16)' }));
  body.push(g({ 'clip-path': bellClip }, inner));
  // rim light and highlights
  body.push(el('path', { d: bell, fill: 'none', stroke: '#fff', 'stroke-width': 3.5, opacity: 0.85 }));
  body.push(el('path', { d: `M${cx - R * 0.78} ${cy - R * 0.35}C${cx - R * 0.7} ${cy - R * 0.85} ${cx - R * 0.35} ${cy - R * 1.0} ${cx - R * 0.1} ${cy - R * 1.02}`, fill: 'none', stroke: '#fff', 'stroke-width': 16, 'stroke-linecap': 'round', opacity: 0.75, filter: 'url(#glow4)' }));
  body.push(el('ellipse', { cx: cx + 110, cy: cy - 150, rx: 26, ry: 12, fill: '#fff', opacity: 0.8, transform: `rotate(35 ${cx + 110} ${cy - 150})`, filter: 'url(#glow2)' }));
  for (let i = 0; i < 9; i++) {
    const x = cx - R + (2 * R) * ((i + 0.5) / 9);
    body.push(orb(x, cy + 52, 5, ['#7ff3ff', '#ffb0ea', '#fff3a6'][i % 3]));
  }
  s.add(2, g({}, body));

  // ---- 3: what drifts in front
  s.motes({ n: 46, rmin: 1.2, rmax: 5, colors: ['#aef6ff', '#e0c4ff', '#ffd0f2', '#ffffff'], opacity: 0.85 });
  s.bubbles({ n: 14, y0: 200, rmin: 4, rmax: 20 });
  s.add(3, glint(332, 250, 34), glint(720, 520, 22, '#ffe6fb'), glint(640, 170, 16), glint(250, 640, 18, '#c8fbff'));
}

/** The scalloped lower lip of the bell, as path segments from x0 back to x1 along y. */
function scallop(x0, x1, y, n, depth) {
  let d = '';
  const step = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const a = x0 + step * i, b = a + step;
    d += `Q${(a + b) / 2} ${y + depth} ${b} ${y}`;
  }
  return d;
}

function miniJelly(x, y, R, r, c) {
  const parts = [];
  for (let i = 0; i < 5; i++) {
    const x0 = x - R * 0.7 + R * 1.4 * (i / 4), sw = r.range(-R, R) * 0.5;
    parts.push(el('path', { d: spline([[x0, y], [x0 + sw, y + R * 1.2], [x0 - sw, y + R * 2.4]]), fill: 'none', stroke: c, 'stroke-width': 1.6, opacity: 0.5 }));
  }
  parts.push(el('path', { d: `M${x - R} ${y}C${x - R} ${y - R * 1.3} ${x + R} ${y - R * 1.3} ${x + R} ${y}Z`, fill: c, opacity: 0.2, filter: 'url(#glow8)' }));
  parts.push(el('path', { d: `M${x - R} ${y}C${x - R} ${y - R * 1.3} ${x + R} ${y - R * 1.3} ${x + R} ${y}Z`, fill: c, opacity: 0.55 }));
  parts.push(el('path', { d: `M${x - R * 0.7} ${y - R * 0.35}C${x - R * 0.6} ${y - R * 0.9} ${x} ${y - R * 0.95} ${x + R * 0.2} ${y - R * 0.93}`, fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.7, 'stroke-linecap': 'round' }));
  return g({ opacity: 0.75 }, parts);
}
