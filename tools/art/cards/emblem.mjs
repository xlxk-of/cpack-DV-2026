// EMBLEM — the NACRE sigil: a nautilus shell in cross-section, its chambers inlaid in mother-of-pearl between gold
// walls, coiled around a dark eye of deep water that cradles a fallen four-point star. Logo mark / app icon motif.
import { el, g, poly } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;
export const noThumb = true;
export const size = [512, 512];
export const transparent = true;

export function build(s) {
  const sg = sigil(s, { cx: 256, cy: 256, size: 426 });
  // soft outer glow (kept inside the padding)
  s.add(1, el('path', { d: sg.sil, fill: '#3fd8d2', opacity: 0.55, filter: s.blur(14) }));
  s.add(1, el('path', { d: sg.sil, fill: '#fff0cc', opacity: 0.6, filter: s.blur(5) }));
  s.add(2, sg.markup);
}

// ------------------------------------------------------------------------------------------------ the sigil
// The shell is a spiral that winds in onto a round eye: rad(t) = rho + (1 - rho) * G^(t / 2pi), t <= 0, so every
// whorl is G times narrower than the one outside it and the innermost coils hug the eye where the star sits.
// Everything is sized in "unit" space (outer lip radius = 1) so the sigil scales cleanly.

function sigil(s, o) {
  const { cx, cy, size, rot = -0.42, dir = -1, G = 3.0, rho = 0.26, body = 1.02, step = Math.PI / 6 } = o;
  const tints = o.tints || ['#ffb4dc', '#ffe2a0', '#98efe0', '#c4b8ff', '#ffc4b0', '#a4e0ff'];
  const sheenK = o.sheen ?? 0.62;
  const eyeStops = o.eye || [[0, '#2468b4'], [0.4, '#102c74'], [0.82, '#070d3c'], [1, '#03041c']];
  const TAU = Math.PI * 2, k = Math.log(G) / TAU;
  const rad = (t) => rho + (1 - rho) * Math.exp(k * t);
  const U = (t, rr) => [rr * Math.cos(dir * t + rot), rr * Math.sin(dir * t + rot)];
  const lipBow = 0.05, bow = step * 0.36;

  // silhouette (unit space), then fit its box to `size` around (cx, cy)
  const silU = [];
  const lipAt = (u) => { const t = -lipBow * Math.sin(Math.PI * u), a = rad(t), b = rad(t - TAU); return U(t, a + (b - a) * u); };
  const tipT = -0.085, tipU = 0.09;
  for (let i = 0; i <= 200; i++) { const t = -TAU + (TAU + tipT) * i / 200; silU.push(U(t, rad(t))); }
  { // the lip's outer corner, rounded off
    const a = U(tipT, rad(tipT)), c = U(0, rad(0)), b = lipAt(tipU);
    for (let i = 1; i <= 10; i++) { const q = i / 10, w = 1 - q; silU.push([w * w * a[0] + 2 * w * q * c[0] + q * q * b[0], w * w * a[1] + 2 * w * q * c[1] + q * q * b[1]]); }
  }
  for (let i = 1; i < 24; i++) silU.push(lipAt(tipU + (1 - tipU) * i / 24));
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const p of silU) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  const sc = size / Math.max(x1 - x0, y1 - y0);
  const tx = cx - sc * (x0 + x1) / 2, ty = cy - sc * (y0 + y1) / 2;
  const P = (p) => [tx + sc * p[0], ty + sc * p[1]];
  const sil = poly(silU.map(P), true);
  const pole = P([0, 0]);
  const px = sc / 259;                                    // 1 "design pixel" (the sigil was drawn at 512)

  // insets, in unit space
  const rim = 9.5 / 259, wall = 8 / 259, sep = 3.4 / 259;
  const mOut = (t) => { const f = Math.max(0, Math.min(1, (t + TAU) / 0.5 + 0.5)); return wall / 2 + (rim - wall / 2) * f; };
  const mIn = wall / 2;

  // one chamber, between boundary a (aperture side) and b (apex side)
  function cell(ta, bowA, ga, tb, bowB, gb) {
    const pts = [];
    const at = (t0, bw, u, sgn, gp) => {
      const t = t0 - bw * Math.sin(Math.PI * u);
      const ri = rad(t - TAU) + mIn, ro = rad(t) - mOut(t), rr = ri + (ro - ri) * u;
      return U(t + sgn * gp / rr, rr);
    };
    for (let i = 0; i <= 14; i++) pts.push(at(ta, bowA, i / 14, -1, ga));
    const f0 = ta - ga / (rad(ta) - mOut(ta)), f1 = tb + gb / (rad(tb) - mOut(tb));
    const n = Math.max(2, Math.ceil((f0 - f1) / 0.035));
    for (let i = 1; i < n; i++) { const t = f0 + (f1 - f0) * i / n; pts.push(U(t, rad(t) - mOut(t))); }
    for (let i = 14; i >= 0; i--) pts.push(at(tb, bowB, i / 14, 1, gb));
    const e0 = tb + gb / (rad(tb - TAU) + mIn), e1 = ta - ga / (rad(ta - TAU) + mIn);
    for (let i = 1; i < n; i++) { const t = e0 + (e1 - e0) * i / n; pts.push(U(t, rad(t - TAU) + mIn)); }
    // soften the four corners so each chamber is a rounded inlay
    const wpx = (rad(tb) - rad(tb - TAU)) * sc, d = Math.min(8 * px, wpx * 0.2);
    return roundCorners(pts.map(P), [[0, d], [14, ga === rim ? 15 * px : d], [14 + n, d], [28 + n, d]]);
  }
  const bounds = [[0, lipBow, rim]];
  for (let t = -body; ; t -= step) {
    if (rad(t) - rad(t - TAU) < 19 / 259) break;
    bounds.push([t, bow, sep]);
  }
  const midR = (t) => (rad(t) + rad(t - TAU)) / 2;
  const cells = [];
  for (let i = 0; i + 1 < bounds.length; i++) {
    const a = bounds[i], b = bounds[i + 1];
    const pts = cell(a[0], a[1], a[2], b[0], b[1], b[2]);
    cells.push({ d: poly(pts, true), front: P(U(a[0], midR(a[0]))), back: P(U(b[0], midR(b[0]))) });
  }
  const tEnd = bounds[bounds.length - 1][0];
  /** a strip of whorl from t0 to t1, between fractions f0..f1 of the way from the inner wall to the outer */
  const band = (t0, t1, f0, f1) => {
    const A = [], B = [], n = Math.ceil(Math.abs(t1 - t0) / 0.04);
    for (let i = 0; i <= n; i++) {
      const t = t0 + (t1 - t0) * i / n, ri = rad(t - TAU), w = rad(t) - ri;
      A.push(P(U(t, ri + w * f0))); B.push(P(U(t, ri + w * f1)));
    }
    return poly(A.concat(B.reverse()), true);
  };

  const m = [];
  const box = { x: cx - size / 2 - 20, y: cy - size / 2 - 20, width: size + 40, height: size + 40 };

  // --- gold bed: the rim, the walls between whorls and chambers, the solid inner coil
  const gold = s.lin([[0, '#fff6cf'], [0.22, '#f6cf6a'], [0.5, '#c98d2b'], [0.78, '#f3c860'], [1, '#8a5516']], box.x, box.y, box.x + box.width, box.y + box.height, true);
  m.push(el('path', { d: sil, fill: '#2a1604', stroke: '#2a1604', 'stroke-width': 3 * px, 'stroke-linejoin': 'round' }));
  // (only the gold that will show between the chambers is kept, so the emboss can round every wire)
  const wires = s.mask([el('path', { d: sil, fill: '#fff' }), ...cells.map((c) => el('path', { d: c.d, fill: '#000' }))]);
  const silClip = s.clip(el('path', { d: sil }));
  m.push(g({ filter: s.emboss({ color: '#fff7d0', az: 225, elev: 50, depth: 4 * px, k: 0.75, exp: 14, blur: 1.5 * px }) }, g({ mask: wires }, [
    el('path', { d: sil, fill: gold }),
    el('path', { d: sil, fill: 'none', stroke: '#6a3d0c', 'stroke-width': 2.4 * px, opacity: 0.5 }),
  ])));
  m.push(g({ 'clip-path': silClip, mask: wires }, [
    el('ellipse', { cx: cx - size * 0.22, cy: cy - size * 0.26, rx: size * 0.34, ry: size * 0.2, fill: '#fffbe6', opacity: 0.6, filter: s.blur(16 * px) }),
    el('ellipse', { cx: cx + size * 0.24, cy: cy + size * 0.3, rx: size * 0.36, ry: size * 0.2, fill: '#5c300a', opacity: 0.5, filter: s.blur(16 * px) }),
    el('path', { d: sil, fill: 'none', stroke: s.lin([[0, '#ffffff', 0.95], [0.5, '#ffffff', 0.15], [1, '#ffffff', 0]], box.x, box.y, box.x + box.width, box.y + box.height, true), 'stroke-width': 3.2 * px }),
  ]));

  // --- the pearl chambers
  const cellParts = [], clipParts = [];
  cells.forEach((c, i) => {
    clipParts.push(el('path', { d: c.d }));
    const fill = s.lin([[0, '#fffefa'], [0.45, '#f6f1ee'], [1, tints[i % tints.length]]], c.front[0], c.front[1], c.back[0], c.back[1], true);
    cellParts.push(el('path', { d: c.d, fill }));
  });
  const cellClip = s.clip(clipParts);
  m.push(g({ filter: s.emboss({ color: '#ffffff', az: 225, elev: 42, depth: 7 * px, k: 1.0, exp: 16, blur: 3 * px }) }, cellParts));
  // nacre: every whorl is a rounded tube (shade at the walls, light along the crown), with bands of colour drifting
  // across it, growth lines in the living chamber, a broad highlight and a cool shade away from the light
  const sheen = s.lin([[0, '#ff7fc0', 0], [0.18, '#ff7fc0', 0.6], [0.36, '#ffd97a', 0.5], [0.56, '#5fe6d4', 0.6], [0.78, '#9a8fff', 0.55], [1, '#9a8fff', 0]], box.x, box.y + box.height * 0.15, box.x + box.width, box.y + box.height * 0.85, true);
  const growth = [];
  for (let t = -0.14; t > -body + 0.1; t -= 0.125) {
    const pts = [];
    for (let i = 0; i <= 12; i++) { const u = i / 12, tt = t - (lipBow + 0.05) * Math.sin(Math.PI * u), ri = rad(tt - TAU); pts.push(P(U(tt, ri + (rad(tt) - ri) * u))); }
    growth.push(el('path', { d: poly(pts), fill: 'none', stroke: '#ffffff', 'stroke-width': 1.6 * px, opacity: 0.55 }));
    growth.push(el('path', { d: poly(pts), fill: 'none', stroke: '#7d74c8', 'stroke-width': 1.2 * px, opacity: 0.28, transform: `translate(${1.6 * px} ${1.2 * px})` }));
  }
  m.push(g({ 'clip-path': cellClip }, [
    el('rect', { ...box, fill: sheen, opacity: sheenK }),
    el('path', { d: band(tEnd - 0.2, 0.1, -0.05, 0.2), fill: '#3f3aa6', opacity: 0.42, filter: s.blur(6 * px) }),
    el('path', { d: band(tEnd - 0.2, 0.1, 0.86, 1.05), fill: '#5a4cb4', opacity: 0.32, filter: s.blur(6 * px) }),
    g({}, growth),
    el('path', { d: band(tEnd - 0.2, 0.1, 0.5, 0.72), fill: '#ffffff', opacity: 0.6, filter: s.blur(7 * px) }),
    el('rect', { ...box, fill: s.rad([[0, '#ffffff', 0.7], [0.4, '#ffffff', 0.2], [1, '#ffffff', 0]], cx - size * 0.22, cy - size * 0.3, size * 0.45, true) }),
    el('rect', { ...box, fill: s.rad([[0, '#2c2f8e', 0.55], [0.6, '#5a4fb0', 0.18], [1, '#5a4fb0', 0]], cx + size * 0.3, cy + size * 0.38, size * 0.55, true) }),
    el('ellipse', { cx: cx + size * 0.08, cy: cy + size * 0.345, rx: size * 0.3, ry: size * 0.055, fill: '#74f2e0', opacity: 0.6, filter: s.blur(8 * px), transform: `rotate(-22 ${cx} ${cy})` }),
    el('ellipse', { cx: cx + size * 0.36, cy: cy - size * 0.02, rx: size * 0.05, ry: size * 0.2, fill: '#ff9fd6', opacity: 0.42, filter: s.blur(9 * px), transform: `rotate(14 ${cx + size * 0.36} ${cy})` }),
  ]));
  // a crisp edge to every chamber so the inlay looks set into the gold
  m.push(g({ fill: 'none', stroke: '#5a3408', 'stroke-width': 1.1 * px, opacity: 0.55 }, cells.map((c) => el('path', { d: c.d }))));

  // --- the eye of deep water and the star
  const eyeR = (rad(tEnd - TAU * 0.5) - wall * 0.35) * sc * 0.93;
  const [ex, ey] = pole;
  m.push(el('circle', { cx: ex, cy: ey, r: eyeR + 3.4 * px, fill: '#3b2206' }));
  m.push(el('circle', { cx: ex, cy: ey, r: eyeR + 2.4 * px, fill: gold }));
  m.push(el('circle', { cx: ex, cy: ey, r: eyeR + 1.3 * px, fill: 'none', stroke: s.lin([[0, '#fffbe6', 0.95], [0.45, '#fffbe6', 0.1], [0.7, '#5c300a', 0.35], [1, '#5c300a', 0.5]], ex - eyeR, ey - eyeR, ex + eyeR, ey + eyeR, true), 'stroke-width': 1.5 * px }));
  m.push(el('circle', { cx: ex, cy: ey, r: eyeR, fill: s.rad(eyeStops, ex, ey, eyeR, true) }));
  m.push(el('circle', { cx: ex, cy: ey, r: eyeR - 1.5 * px, fill: 'none', stroke: '#01020c', 'stroke-width': 3 * px, opacity: 0.65 }));
  for (const [a, d, r] of [[0.7, 0.62, 1.3], [2.3, 0.7, 1], [3.7, 0.58, 1.5], [5.4, 0.72, 1.1], [1.5, 0.78, 0.8], [4.6, 0.8, 0.9]]) {
    m.push(el('circle', { cx: ex + Math.cos(a) * eyeR * d, cy: ey + Math.sin(a) * eyeR * d, r: r * px, fill: '#bfefff', opacity: 0.8 }));
  }
  m.push(star(s, ex, ey, eyeR * 0.93, px));

  return { markup: g({}, m), sil, pole, eyeR, sc };
}

/** Round off corners of a closed polygon: `corners` is [[index, px], ...]; each corner is replaced by a smooth
 *  turn that starts about `px` before it and ends about `px` after it. */
function roundCorners(pts, corners) {
  const n = pts.length, skip = new Array(n).fill(false), arcAfter = new Map();
  const dist = (a, b) => Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1]);
  for (const [i, d] of corners) {
    let ia = i, ib = i, acc = 0, guard = 0;
    while (acc < d && guard++ < n / 3) { const j = (ia - 1 + n) % n; acc += dist(ia, j); ia = j; }
    acc = 0; guard = 0;
    while (acc < d && guard++ < n / 3) { const j = (ib + 1) % n; acc += dist(ib, j); ib = j; }
    for (let j = (ia + 1) % n; j !== ib; j = (j + 1) % n) skip[j] = true;
    const a = pts[ia], c = pts[i], b = pts[ib], arc = [];
    for (let q = 1; q < 8; q++) { const u = q / 8, w = 1 - u; arc.push([w * w * a[0] + 2 * w * u * c[0] + u * u * b[0], w * w * a[1] + 2 * w * u * c[1] + u * u * b[1]]); }
    arcAfter.set(ia, arc);
  }
  const out = [];
  for (let j = 0; j < n; j++) { if (!skip[j]) out.push(pts[j]); if (arcAfter.has(j)) out.push(...arcAfter.get(j)); }
  return out;
}

function starPath(x, y, a, k = 0.105) {
  const q = a * k;
  return `M${x} ${y - a}C${x + q} ${y - q} ${x + q} ${y - q} ${x + a} ${y}C${x + q} ${y + q} ${x + q} ${y + q} ${x} ${y + a}C${x - q} ${y + q} ${x - q} ${y + q} ${x - a} ${y}C${x - q} ${y - q} ${x - q} ${y - q} ${x} ${y - a}Z`;
}

function star(s, x, y, a, px = 1) {
  return g({}, [
    el('circle', { cx: x, cy: y, r: a * 0.5, fill: '#58dcff', opacity: 0.5, filter: s.blur(8 * px) }),
    el('path', { d: starPath(x, y, a), fill: '#ffd97a', opacity: 0.9, filter: s.blur(3 * px) }),
    el('path', { d: starPath(x, y, a * 0.5, 0.05), fill: '#fff6d0', opacity: 0.85, transform: `rotate(45 ${x} ${y})` }),
    el('path', { d: starPath(x, y, a), fill: s.rad([[0, '#ffffff'], [0.28, '#fffbe2'], [0.7, '#ffdf86'], [1, '#ffbf3c']], x, y, a, true), stroke: '#8a520c', 'stroke-width': 0.7 * px, 'stroke-linejoin': 'round' }),
    el('circle', { cx: x, cy: y, r: a * 0.13, fill: '#fff', filter: s.blur(1.4 * px) }),
  ]);
}
