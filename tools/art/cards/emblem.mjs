// EMBLEM — the NACRE sigil as a doodle: a chunky nautilus shell, its chambers coloured in pearl pastels, coiled
// round a dark eye of deep water that cradles a fallen gold star. Logo mark / app icon motif; must read at 48px.
import { el, g, poly, ribbon, ink, stroke, flat, inkCircle, star4, INK, W_SUBJECT, W_INNER, W_DETAIL } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;
export const noThumb = true;
export const size = [512, 512];
export const transparent = true;

export function build(s) {
  const sg = sigil(s, { cx: 256, cy: 277, size: 414, outer: 17, inner: 9 });
  const sp = [star4(...sg.at(0.58, -0.54), 30, '#ffffff', W_DETAIL + 1), star4(...sg.at(0.33, -0.68), 15, '#ffe9a8', W_DETAIL)];
  s.add(2, g({ filter: s.wobble(2.5, 0.02) }, [sg.markup, ...sp]));
}

// ------------------------------------------------------------------------------------------------ the sigil
// The shell is a spiral that winds in onto a round eye: rad(t) = rho + (1 - rho) * G^(t / 2pi), t <= 0 (t = 0 is the
// lip), so every whorl is G times narrower than the one outside it. Drawn in "unit" space (lip radius = 1) and fitted
// so the silhouette's box is `size` across, centred on (cx, cy). Doodle rules: flat pastel chambers, ONE hard shadow
// tone (a violet film, hard-edged), a couple of hard highlights, fat ink contour, thinner ink inside.
// Returns { markup, sil (the silhouette path), eye: [x, y, r], at(ux, uy) -> canvas point, k (px per unit) }.

function sigil(s, o) {
  const { cx, cy, size, outer = W_SUBJECT, inner = W_INNER, rot = -0.42 } = o;
  const tints = o.tints || ['#fff3d2', '#ffc0e0', '#b3e0ff'], coilFill = o.coil || '#b4f0d8';
  const eyeFill = o.eye || '#27307f', eyeRing = o.ring || '#3a55c4';
  const shade = o.shade || '#6a48c4', shadeO = o.shadeO ?? 0.36;
  const TAU = Math.PI * 2, G = 3.0, rho = 0.24, eyeR = 0.31, step = TAU / 6, bow = 0.2, lipBow = 0.14, mouth = -0.17;
  const rad = (t) => rho + (1 - rho) * Math.pow(G, t / TAU);
  const inR = (t) => Math.max(eyeR, rad(t - TAU));
  const U = (t, rr) => [rr * Math.cos(rot - t), rr * Math.sin(rot - t)];
  const arc = (fn, t0, t1, n = 28) => Array.from({ length: n + 1 }, (_, i) => { const t = t0 + (t1 - t0) * i / n; return U(t, fn(t)); });
  /** A chamber wall at t, from the outer wall to the inner, bowed toward the lip. */
  const sept = (t, b = bow, n = 10) => Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n, tt = t + b * Math.sin(Math.PI * u);
    return U(tt, rad(tt) + (inR(tt) - rad(tt)) * u);
  });
  const lip = () => Array.from({ length: 11 }, (_, i) => { const u = i / 10; return U(lipBow * Math.sin(Math.PI * u), 1 + (rad(-TAU) - 1) * u); });

  // silhouette in unit space, then the fit
  const silU = [...arc(rad, -TAU, 0, 72), ...lip().slice(1, -1)];
  let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
  for (const p of silU) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  const k = size / Math.max(x1 - x0, y1 - y0), ox = cx - (x0 + x1) / 2 * k, oy = cy - (y0 + y1) / 2 * k;
  const at = (ux, uy) => [ox + ux * k, oy + uy * k];
  const M = (pts) => pts.map((p) => at(p[0], p[1]));
  const sil = poly(M(silU), true);
  const clip = s.clip(el('path', { d: sil }));
  const out = [];

  // chambers, lip inward: flat pastel fills (six round the outer whorl; the inner coil is one piece)
  out.push(flat(sil, tints[0]));
  const walls = [];
  for (let i = 0; i < 6; i++) {
    const ta = -i * step, tb = -(i + 1) * step;
    const a = i === 0 ? sept(0, mouth) : sept(ta), b = sept(tb);
    const pts = [...arc(rad, tb, ta, 14), ...a.slice(1), ...arc(inR, ta, tb, 14).slice(1), ...b.slice().reverse().slice(1)];
    out.push(flat(poly(M(pts), true), tints[i % tints.length]));
    if (i > 0) walls.push(stroke(poly(M(a)), { w: inner }));
  }
  walls.push(stroke(poly(M(sept(-TAU))), { w: inner }));
  // the mouth: a dark sliver of the inside, between the lip and the first chamber
  walls.push(ink(poly(M([...lip(), ...sept(0, mouth).reverse().slice(1, -1)]), true), eyeFill, { w: inner }));

  // one hard shadow tone: the lower-right rim of the shell, and the inner coil's shadow on the outer whorl
  const d = 0.085 * k;
  const coil = poly(M([...arc(rad, -2 * TAU, -TAU, 60), ...sept(-TAU).slice(1, -1)]), true);
  const far = `M${ox - 3 * k} ${oy - 3 * k}h${6 * k}v${6 * k}h${-6 * k}Z`;
  out.push(g({ 'clip-path': clip }, [
    el('path', { d: far + sil, 'fill-rule': 'evenodd', fill: shade, opacity: shadeO, transform: `translate(${-d} ${-d})` }),
    el('path', { d: coil, fill: shade, opacity: shadeO, transform: `translate(${d * 0.6} ${d * 0.6})` }),
  ]));
  out.push(flat(coil, coilFill));

  // hard highlights on the upper-left shoulder
  const hl = (ta, tb, f, w) => flat(ribbon(M(arc((t) => rad(t) - (rad(t) - inR(t)) * f, ta, tb, 8)), w * k, w * k * 0.5, (u) => Math.sin(Math.PI * Math.min(1, u * 1.1 + 0.08))), '#ffffff', { opacity: 0.92 });
  out.push(g({ 'clip-path': clip }, [hl(-0.79 * TAU, -0.6 * TAU, 0.26, 0.085)]));
  out.push(el('circle', { cx: at(...U(-0.545 * TAU, rad(-0.545 * TAU) * 0.86))[0], cy: at(...U(-0.545 * TAU, rad(-0.545 * TAU) * 0.86))[1], r: 0.036 * k, fill: '#fff', opacity: 0.92 }));

  // ink inside: chamber walls and the coil line
  out.push(...walls);
  out.push(stroke(poly(M(arc(rad, -2 * TAU, -TAU, 60))), { w: inner }));

  // the eye and its star
  const [ex, ey] = at(0, 0), er = eyeR * k;
  out.push(inkCircle(ex, ey, er, eyeFill, { w: inner }));
  out.push(el('circle', { cx: ex, cy: ey, r: er * 0.62, fill: eyeRing }));
  out.push(goldStar(ex, ey, er * 0.9, Math.max(W_DETAIL, inner - 2)));

  // the fat contour
  out.push(stroke(sil, { w: outer }));
  return { markup: g({}, out), sil, eye: [ex, ey, er], at, k };
}

/** The fallen star: a fat four-point star, gold, its lower-right facets in the one shadow tone. */
function goldStar(x, y, sz, w = W_DETAIL, fill = '#ffd65a', dark = '#f29f38') {
  const q = sz * 0.27;
  const d = `M${x} ${y - sz}L${x + q} ${y - q}L${x + sz} ${y}L${x + q} ${y + q}L${x} ${y + sz}L${x - q} ${y + q}L${x - sz} ${y}L${x - q} ${y - q}Z`;
  return g({}, [flat(d, fill), flat(`M${x} ${y}L${x + sz} ${y}L${x + q} ${y + q}L${x} ${y + sz}Z`, dark),
    flat(`M${x - q * 0.5} ${y - sz * 0.5}L${x} ${y - sz * 0.82}L${x} ${y - q * 0.9}Z`, '#fff6c8'), stroke(d, { w })]);
}
