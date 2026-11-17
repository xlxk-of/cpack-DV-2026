// CARD BACK — a doodle card back: a deep indigo field of flat wave-scales, a fat gold border between two ink lines
// with a pearl stud on every corner, a big quiet four-point star, and the NACRE sigil in a pearl medallion ringed
// with little stars. Everything but the sigil is drawn for the left half and mirrored, so it is exactly symmetric.
import { el, g, poly, ribbon, ink, stroke, flat, inkCircle, star4, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;
export const noThumb = true;
export const size = [750, 1050];

const W = 750, H = 1050, CX = 375, CY = 525, TAU = Math.PI * 2;
const BLEED = '#161a4e', FIELD = '#222a7c', SCALE = '#2d3996', SCALE2 = '#273188';
const GOLD = '#ffd65a', GOLD_D = '#f09c36', GOLD_L = '#fff3b8', PEARL = '#fff6e4', PEARL_D = '#f0bfdc';
const BAND = 56, BAND_W = 30;                                 // the gold border: its centre line's inset, its width

export function build(s) {
  const rr = (inset, rx) => `M${inset + rx} ${inset}H${W - inset - rx}Q${W - inset} ${inset} ${W - inset} ${inset + rx}V${H - inset - rx}Q${W - inset} ${H - inset} ${W - inset - rx} ${H - inset}H${inset + rx}Q${inset} ${H - inset} ${inset} ${H - inset - rx}V${inset + rx}Q${inset} ${inset} ${inset + rx} ${inset}Z`;

  // ---- the field: flat, no ink. Rows of overlapping wave-scales in a slightly lighter tone, centred on the axis.
  s.backdrop(BLEED);
  const fieldClip = s.clip(el('path', { d: rr(BAND, 26) }));
  const sc = [el('rect', { x: 0, y: 0, width: W, height: H, fill: FIELD })];
  const PX = 90, PY = 41, SR = 45;                            // scales in a row just touch, so the draw order cannot break the symmetry
  for (let j = 0, y = 60; y < H + SR; j++, y += PY) {
    for (let i = -5; i <= 5; i++) {
      const x = CX + (i + (j % 2 ? 0.5 : 0)) * PX;
      sc.push(el('circle', { cx: x, cy: y + SR, r: SR, fill: FIELD, stroke: SCALE, 'stroke-width': 5 }), el('circle', { cx: x, cy: y + SR, r: SR * 0.52, fill: SCALE2 }));
    }
  }
  s.add(0, g({ 'clip-path': fieldClip }, sc));

  // ---- everything drawn: built whole, wobbled, cut down the middle, and the left half mirrored onto the right
  const P = [];
  // the big quiet star behind the medallion
  const bigStar = (sy, sx, q) => `M${CX} ${CY - sy}L${CX + q} ${CY - q}L${CX + sx} ${CY}L${CX + q} ${CY + q}L${CX} ${CY + sy}L${CX - q} ${CY + q}L${CX - sx} ${CY}L${CX - q} ${CY - q}Z`;
  P.push(ink(bigStar(408, 272, 74), '#2f45b0', { w: W_INNER }));
  P.push(flat(bigStar(330, 205, 56), '#3a56c8'));
  // the border: gold between two ink lines, its inner half in the one shadow tone, and a pinstripe inside it
  P.push(stroke(rr(BAND, 26), { w: BAND_W + 16 }), stroke(rr(BAND, 26), { w: BAND_W, stroke: GOLD }));
  P.push(stroke(rr(BAND + BAND_W / 4, 22), { w: BAND_W / 2, stroke: GOLD_D }));
  P.push(stroke(rr(BAND - BAND_W / 4 - 1, 28), { w: 4, stroke: GOLD_L, 'stroke-dasharray': '46 30' }));
  P.push(stroke(rr(BAND + 40, 16), { w: 5, stroke: '#4a63d6' }));
  // pearl studs on the corners, and on the big star's tips
  P.push(pearl(BAND + 4, BAND + 4, 25), pearl(BAND + 4, H - BAND - 4, 25), pearl(CX, CY - 408, 15), pearl(CX, CY + 408, 15));
  // a gold star in each corner of the field
  P.push(goldStar(150, 152, 30, W_DETAIL), goldStar(150, H - 152, 30, W_DETAIL), star4(104, 250, 13, PEARL, 4), star4(104, H - 250, 13, PEARL, 4), star4(246, 108, 13, PEARL, 4), star4(246, H - 108, 13, PEARL, 4));
  // the medallion: a pearl ring (its lower rim in shadow) round a teal well
  const R = 190;
  P.push(inkCircle(CX, CY, R, PEARL, { w: W_SUBJECT - 2 }));
  const ringClip = s.clip(el('circle', { cx: CX, cy: CY, r: R }));
  P.push(g({ 'clip-path': ringClip }, [
    el('path', { d: `M0 0H${W}V${H}H0Z` + circle(CX, CY - 13, R), 'fill-rule': 'evenodd', fill: PEARL_D }),
    flat(ribbon(arcPts(CX, CY, R - 13, 3.55, 4.35), 10, 10, (u) => Math.sin(Math.PI * u)), '#ffffff'),
  ]));
  P.push(inkCircle(CX, CY, R - 28, '#1f8aa4', { w: W_INNER }));
  P.push(el('circle', { cx: CX, cy: CY, r: R - 62, fill: '#2bacb6' }));
  // a ring of little stars round it: gold and pearl by turns
  for (let i = 0; i <= 6; i++) {
    const a = -TAU / 4 - i * TAU / 12, x = CX + Math.cos(a) * (R + 50), y = CY + Math.sin(a) * (R + 50);
    P.push(i % 2 ? star4(x, y, 15, PEARL, 4) : star4(x, y, 22, GOLD, W_DETAIL));
  }
  const wob = s.wobble(2.5, 0.014);
  const halfClip = s.clip(el('rect', { x: 0, y: 0, width: CX, height: H }));
  const half = g({ 'clip-path': halfClip }, g({ filter: wob }, P));
  s.add(1, half, g({ transform: `translate(${W} 0) scale(-1 1)` }, half));

  // ---- the sigil, the one thing that is not mirrored
  const sg = sigil(s, { cx: CX, cy: CY, size: 236, outer: 13, inner: 7 });   // star on the medallion centre; the lip clears the well rim
  s.add(2, g({ filter: wob }, [sg.markup, star4(...sg.at(0.52, -0.6), 15, '#ffffff', 4)]));
}

// ------------------------------------------------------------------------------------------------ pieces

/** A pearl stud: ink ring, pearl fill, a hard shadow crescent underneath, one glint. */
function pearl(x, y, r) {
  return g({}, [inkCircle(x, y, r, PEARL, { w: r > 20 ? W_INNER : W_DETAIL + 1 }),
    el('path', { d: `M${x - r * 0.72} ${y + r * 0.2}A${r * 0.76} ${r * 0.76} 0 0 0 ${x + r * 0.72} ${y + r * 0.2}A${r * 1.1} ${r * 1.1} 0 0 1 ${x - r * 0.72} ${y + r * 0.2}Z`, fill: PEARL_D }),
    el('circle', { cx: x - r * 0.28, cy: y - r * 0.3, r: r * 0.2, fill: '#ffffff' })]);
}

const circle = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const arcPts = (x, y, r, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [x + Math.cos(a) * r, y + Math.sin(a) * r]; });

// ------------------------------------------------------------------------------------------------ the sigil
// The shell is a spiral that winds in onto a round eye: rad(t) = rho + (1 - rho) * G^(t / 2pi), t <= 0 (t = 0 is the
// lip), so every whorl is G times narrower than the one outside it. Drawn in "unit" space (lip radius = 1) and scaled
// so the silhouette's box is `size` across, with the STAR (the eye's centre), not the box, on (cx, cy): the shell
// reaches 0.65 units left of the star, 0.95 right, 0.55 up, 0.78 down, and at most 0.99 from it (the lip's corner).
// Doodle rules: flat pastel chambers, ONE hard shadow tone (a violet film, hard-edged), a couple of hard highlights,
// fat ink contour, thinner ink inside.
// Returns { markup, sil (the silhouette path), eye: [x, y, r], at(ux, uy) -> canvas point, k (px per unit) }.

function sigil(s, o) {
  const { cx, cy, size, outer = W_SUBJECT, inner = W_INNER, rot = -0.42 } = o;
  const tints = o.tints || ['#fff3d2', '#ffc0e0', '#b3e0ff'], coilFill = o.coil || '#b4f0d8';
  const eyeFill = o.eye || '#27307f', eyeRing = o.ring || '#3a55c4';
  const shade = o.shade || '#6a48c4', shadeO = o.shadeO ?? 0.36;
  const TAU = Math.PI * 2, G = 3.0, rho = 0.24, eyeR = 0.31, step = TAU / 6, bow = 0.2, lipBow = 0.14, mouth = -0.17, deep = 0.5, tipT = -0.09, tipU = 0.16;
  const rad = (t) => rho + (1 - rho) * Math.pow(G, t / TAU);
  const inR = (t) => Math.max(eyeR, rad(t - TAU));
  const U = (t, rr) => [rr * Math.cos(rot - t), rr * Math.sin(rot - t)];
  const arc = (fn, t0, t1, n = 28) => Array.from({ length: n + 1 }, (_, i) => { const t = t0 + (t1 - t0) * i / n; return U(t, fn(t)); });
  /** A chamber wall at t, from the outer wall to the inner, bowed toward the lip. */
  const sept = (t, b = bow, n = 10) => Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n, tt = t + b * Math.sin(Math.PI * u);
    return U(tt, rad(tt) + (inR(tt) - rad(tt)) * u);
  });
  /** The lip: a plain bowed edge from the end of the outer wall to the inner whorl, its outer corner rounded off. */
  const lipAt = (u) => U(lipBow * Math.sin(Math.PI * u), 1 + (rad(-TAU) - 1) * u);
  const lip = () => {
    const a = U(tipT, rad(tipT)), c = U(0, 1), b = lipAt(tipU);
    const corner = Array.from({ length: 7 }, (_, i) => { const v = i / 6, w0 = (1 - v) * (1 - v), w1 = 2 * v * (1 - v), w2 = v * v; return [w0 * a[0] + w1 * c[0] + w2 * b[0], w0 * a[1] + w1 * c[1] + w2 * b[1]]; });
    return [...corner, ...Array.from({ length: 10 }, (_, i) => lipAt(tipU + (1 - tipU) * (i + 1) / 10))];
  };

  // silhouette in unit space, then the fit: the box sets the scale, the star sets the place
  const silU = [...arc(rad, -TAU, tipT, 72), ...lip().slice(1, -1)];
  let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
  for (const p of silU) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  const k = size / Math.max(x1 - x0, y1 - y0), ox = cx, oy = cy;
  const at = (ux, uy) => [ox + ux * k, oy + uy * k];
  const M = (pts) => pts.map((p) => at(p[0], p[1]));
  const sil = poly(M(silU), true);
  const clip = s.clip(el('path', { d: sil }));
  const out = [];

  // chambers, lip inward: flat pastel fills (six round the outer whorl; the inner coil is one piece)
  out.push(flat(sil, tints[0]));
  const fills = [], walls = [];
  for (let i = 0; i < 6; i++) {
    const ta = -i * step, tb = -(i + 1) * step;
    const a = i === 0 ? sept(0, mouth) : sept(ta), b = sept(tb);
    const pts = [...arc(rad, tb, ta, 14), ...a.slice(1), ...arc(inR, ta, tb, 14).slice(1), ...b.slice().reverse().slice(1)];
    fills.push(flat(poly(M(pts), true), tints[i % tints.length]));
    if (i > 0) walls.push(stroke(poly(M(a)), { w: inner }));
  }
  out.push(g({ 'clip-path': clip }, fills));
  walls.push(stroke(poly(M(sept(-TAU))), { w: inner }));
  // the mouth: the inside of the shell seen between the lip and the first chamber, in the shell's one shadow tone
  // (cream under the violet film); the deep water shows only as a thin crescent against the back wall
  const back = sept(0, mouth), mouthD = poly(M([...lip(), ...back.slice().reverse().slice(1)]), true);
  walls.push(flat(mouthD, tints[0]), flat(mouthD, shade, { opacity: shadeO }));
  walls.push(flat(poly(M([...back, ...sept(0, mouth * deep).reverse().slice(1, -1)]), true), eyeFill));
  walls.push(stroke(mouthD, { w: inner }));

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
  out.push(g({ 'clip-path': clip }, walls));
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
