// ABYSSAL PACK — the premium booster as a doodle: black-violet foil with flat oil-slick rings of magenta, teal and
// gold, gold seal strips and a gold trim line, and the NACRE sigil in a gold ring with a drawn corona of pointed rays.
// Same pouch and tear line (the printed dashes at y = 150) as the Tide Pack; nothing but foil sits above y = 220.
import { el, g, poly, ribbon, blob, rng, ink, stroke, flat, inkCircle, star4, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;
export const noThumb = true;
export const size = [720, 1040];
export const transparent = true;

const W = 720, H = 1040, XL = 36, XR = 684, T = 26, B = 1014, SEAL_T = 120, SEAL_B = 920, TEAR = 150, CX = 360, CY = 566, TAU = Math.PI * 2;
const BODY = '#26143f', BODY2 = '#35195c', GOLD = '#ffd65a', GOLD_D = '#f09c36', GOLD_L = '#fff3b8', MAG = '#d23c9c', TEAL = '#1fb3a8';

export function build(s) {
  const r = s.r;
  const sil = pouch();
  const clip = s.clip(el('path', { d: sil }));
  const bodyClip = s.clip(el('rect', { x: 0, y: SEAL_T, width: W, height: SEAL_B - SEAL_T }));
  const wob = s.wobble(3, 0.014);
  const art = [];

  // ---- the printed body: oil on black water, in flat hard-edged rings
  const body = [el('rect', { x: 0, y: SEAL_T, width: W, height: SEAL_B - SEAL_T, fill: BODY })];
  body.push(flat(blob(360, 560, 420, 330, rng(5), 10, 0.14), BODY2));
  body.push(...slick(110, 792, 240, 190, 11, 0.3, 1, -1), ...slick(640, 318, 210, 170, 23, 1.2, -1, 1), ...slick(668, 800, 130, 120, 37, 2.1, -1, -1), ...slick(60, 380, 120, 130, 41, 0.9, 1, 1));
  for (let i = 0; i < 30; i++) body.push(el('circle', { cx: r.range(50, 670), cy: r.range(230, 900), r: r.range(2, 4.5), fill: r.pick([GOLD, '#ff9fdc', '#ffffff']), opacity: r.range(0.45, 0.9) }));
  // foil shine: hard-edged diagonal stripes, under the trim and the medallion
  const shine = (x0, w, o) => flat(poly([[x0, SEAL_T], [x0 + w, SEAL_T], [x0 + w - 330, SEAL_B], [x0 - 330, SEAL_B]], true), '#ffffff', { opacity: o });
  body.push(shine(560, 96, 0.1), shine(686, 30, 0.1), shine(300, 40, 0.07));
  // gold trim: one fat gold line with ink either side, a star on each corner
  const fx0 = 70, fx1 = 650, fy0 = 254, fy1 = 884;
  const frame = `M${fx0 + 34} ${fy0}H${fx1 - 34}Q${fx1} ${fy0} ${fx1} ${fy0 + 34}V${fy1 - 34}Q${fx1} ${fy1} ${fx1 - 34} ${fy1}H${fx0 + 34}Q${fx0} ${fy1} ${fx0} ${fy1 - 34}V${fy0 + 34}Q${fx0} ${fy0} ${fx0 + 34} ${fy0}Z`;
  body.push(stroke(frame, { w: 20 }), stroke(frame, { w: 9, stroke: GOLD }));
  for (const [x, y] of [[fx0 + 8, fy0 + 8], [fx1 - 8, fy0 + 8], [fx0 + 8, fy1 - 8], [fx1 - 8, fy1 - 8]]) body.push(goldStar(x, y, 30, W_DETAIL));
  art.push(g({ 'clip-path': bodyClip }, body));

  // ---- the corona: a ring of pointed gold rays, long and short, each with its hard shadow half
  const R = 196, N = 16, tips = [];
  const P = (rr, a) => [CX + Math.cos(a) * rr, CY + Math.sin(a) * rr];
  const rays = [], dark = [];
  for (let i = 0; i < N; i++) {
    const a = i * TAU / N - TAU / 4, hw = TAU / N / 2, R1 = R + (i % 2 ? 50 : 96) - (i % 4 === 0 ? 0 : 8);
    rays.push(P(R - 8, a - hw), P(R1, a));
    dark.push(flat(poly([P(R - 8, a), P(R1, a), P(R - 8, a + hw)], true), GOLD_D));
    tips.push(P(R1, a));
  }
  art.push(ink(poly(rays, true), GOLD, { w: W_INNER }), ...dark, stroke(poly(rays, true), { w: W_INNER }));

  // ---- the medallion: a gold ring round a violet well, and the sigil
  art.push(inkCircle(CX, CY, R, GOLD, { w: W_SUBJECT - 2 }));
  const ringClip = s.clip(el('circle', { cx: CX, cy: CY, r: R }));
  art.push(g({ 'clip-path': ringClip }, [
    el('path', { d: `M0 0H${W}V${H}H0Z` + circle(CX - 11, CY - 11, R), 'fill-rule': 'evenodd', fill: GOLD_D }),
    flat(ribbon(arcPts(CX, CY, R - 12, 3.5, 4.5), 10, 10, (u) => Math.sin(Math.PI * u)), GOLD_L),
  ]));
  art.push(inkCircle(CX, CY, R - 25, '#3b1d74', { w: W_INNER }));
  art.push(el('circle', { cx: CX, cy: CY, r: R - 58, fill: '#55289c' }));
  const sg = sigil(s, { cx: CX, cy: CY, size: 274, outer: 13, inner: 7, eye: '#2a1560', ring: '#6a2fb4' });
  art.push(sg.markup);
  art.push(star4(...sg.at(0.52, -0.6), 16, '#ffffff', 4));
  // sparkles off the ray tips and round the field
  art.push(star4(118, 330, 24, '#ffffff'), star4(610, 842, 22, GOLD_L), star4(590, 300, 16, GOLD_L, 4), star4(120, 700, 16, '#ffffff', 4), star4(206, 300, 13, '#ff9fdc', 4), star4(520, 868, 13, '#ff9fdc', 4));

  // ---- the seal strips: flat gold crimp stripes, an ink line where they meet the body
  const seals = [];
  for (const [y0, y1] of [[0, SEAL_T], [SEAL_B, H]]) {
    seals.push(el('rect', { x: 0, y: y0, width: W, height: y1 - y0, fill: GOLD }));
    for (let x = XL - 6; x < XR; x += 27) seals.push(el('rect', { x, y: y0, width: 11, height: y1 - y0, fill: GOLD_D }));
  }
  seals.push(el('rect', { x: 0, y: SEAL_T - 22, width: W, height: 8, fill: GOLD_L }), el('rect', { x: 0, y: SEAL_B + 14, width: W, height: 8, fill: GOLD_L }));   // a pale foil band
  seals.push(el('rect', { x: 0, y: SEAL_T, width: W, height: 16, fill: '#0c0618', opacity: 0.45 }));    // the seal's hard shadow on the body
  seals.push(stroke(`M0 ${SEAL_T}H${W}`, { w: W_INNER }), stroke(`M0 ${SEAL_B}H${W}`, { w: W_INNER }));

  // ---- the pouch's own light: one hard shadow down the right and along the bottom, hard highlights on the left
  const light = [
    el('path', { d: `M-200 -200H${W + 200}V${H + 200}H-200Z` + sil, 'fill-rule': 'evenodd', fill: '#0c0618', opacity: 0.34, transform: 'translate(-26 -14)' }),
    stroke(`M58 ${SEAL_T + 60}V${SEAL_T + 96}`, { w: 10, stroke: '#ffffff', opacity: 0.7 }),
    stroke(`M62 48V96`, { w: 10, stroke: '#ffffff', opacity: 0.8 }), stroke(`M62 ${SEAL_B + 26}V${SEAL_B + 70}`, { w: 10, stroke: '#ffffff', opacity: 0.8 }),
  ];

  s.add(2, g({ filter: wob }, g({ 'clip-path': clip }, [el('rect', { x: 0, y: 0, width: W, height: H, fill: BODY }), ...art, ...seals, ...light])));
  // the tear line: printed, dead straight, exactly on y = 150, edge to edge (not wobbled)
  s.add(2, g({ 'clip-path': clip }, el('path', { d: `M5 ${TEAR}H${W}`, fill: 'none', stroke: GOLD_L, 'stroke-width': 6, 'stroke-dasharray': '18 10' })));
  s.add(2, g({ filter: wob }, stroke(sil, { w: W_SUBJECT })));
}

// ------------------------------------------------------------------------------------------------ the pouch

/** The pouch silhouette: pinked (zig-zag) top and bottom edges, sides that belly out a little between the seals. */
function pouch() {
  const n = 24, tw = (XR - XL) / n, dep = 13, bulge = 13;
  let d = `M${XL} ${T + dep}`;
  for (let i = 0; i < n; i++) d += `L${XL + tw * (i + 0.5)} ${T}L${XL + tw * (i + 1)} ${T + dep}`;
  d += `L${XR} ${SEAL_T}C${XR + bulge} ${SEAL_T + 130} ${XR + bulge} ${SEAL_B - 130} ${XR} ${SEAL_B}L${XR} ${B - dep}`;
  for (let i = 0; i < n; i++) d += `L${XR - tw * (i + 0.5)} ${B}L${XR - tw * (i + 1)} ${B - dep}`;
  return d + `L${XL} ${SEAL_B}C${XL - bulge} ${SEAL_B - 130} ${XL - bulge} ${SEAL_T + 130} ${XL} ${SEAL_T}Z`;
}

/** An oil-slick: nested flat puddles (magenta, teal, gold) round a dark middle, all the same wobbly shape, each
 *  slid a little off the last so the bands run fat on one side and thin on the other. */
function slick(cx, cy, rx, ry, seed, rot = 0, dx = 1, dy = -1) {
  const band = (f, o, fill) => flat(blob(cx + dx * o * rx, cy + dy * o * ry, rx * f, ry * f, rng(seed), 8, 0.26, rot), fill);
  return [band(1, 0, MAG), band(0.8, 0.07, TEAL), band(0.64, 0.13, GOLD_D), band(0.52, 0.19, BODY2)];
}

const circle = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const arcPts = (x, y, r, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [x + Math.cos(a) * r, y + Math.sin(a) * r]; });

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
