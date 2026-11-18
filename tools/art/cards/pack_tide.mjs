// TIDE PACK — the standard booster as a doodle: a sealed foil pouch, flat indigo over a teal cartoon sea, crimped
// teal seal strips, and the NACRE sigil in a pearl ring while the stars fall in. Front view; the game tears it open
// along the printed dashed line at y = 150, so nothing but foil sits above y = 220.
import { el, g, poly, ribbon, ink, stroke, flat, inkCircle, star4, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;
export const noThumb = true;
export const size = [720, 1040];
export const transparent = true;

const W = 720, H = 1040, XL = 36, XR = 684, T = 26, B = 1014, SEAL_T = 120, SEAL_B = 920, TEAR = 150, CX = 360, CY = 530;

export function build(s) {
  const r = s.r;
  const sil = pouch();
  const clip = s.clip(el('path', { d: sil }));
  const bodyClip = s.clip(el('rect', { x: 0, y: SEAL_T, width: W, height: SEAL_B - SEAL_T }));
  const wob = s.wobble(3, 0.014);
  const art = [];

  // ---- the printed body: indigo sky, a cartoon sea in three flat rows
  const body = [el('rect', { x: 0, y: SEAL_T, width: W, height: SEAL_B - SEAL_T, fill: '#2a3796' })];
  body.push(flat(`M0 ${SEAL_T}H${W}V330Q${CX} 250 0 330Z`, '#232d80'));                        // a darker cap of sky
  for (let i = 0; i < 26; i++) body.push(el('circle', { cx: r.range(50, 670), cy: r.range(230, 640), r: r.range(2, 4.5), fill: r.pick(['#8fd0ff', '#b9a6ff', '#ffffff']), opacity: r.range(0.4, 0.8) }));
  body.push(flat(seaRow(676, 96, 30, 0), '#2560b4'));
  body.push(ink(seaRow(752, 120, 36, 60), '#1f97a8', { w: W_MID }));
  body.push(ink(seaRow(836, 144, 40, 0), '#4fd0c0', { w: W_MID }));
  // foam glints on the front rows: short hard dashes
  for (const [x, y, l] of [[150, 800, 46], [396, 792, 60], [610, 806, 40], [80, 884, 50], [290, 890, 70], [520, 882, 56]]) body.push(stroke(`M${x} ${y}h${l}`, { w: 7, stroke: '#eafffb', opacity: 0.9 }));

  // foil shine: hard-edged diagonal stripes, under the medallion
  const shine = (x0, w, o) => flat(poly([[x0, SEAL_T], [x0 + w, SEAL_T], [x0 + w - 330, SEAL_B], [x0 - 330, SEAL_B]], true), '#ffffff', { opacity: o });
  body.push(shine(560, 96, 0.13), shine(686, 30, 0.13), shine(300, 40, 0.09));

  // falling stars with hard wedge tails
  body.push(faller(112, 330, 28, '#ffd65a'), faller(644, 410, 22, '#ffffff'), faller(470, 286, 17, '#ffe9a8'));
  body.push(star4(82, 560, 20, '#ffffff', 4), star4(636, 668, 18, '#ffe9a8', 4), star4(236, 262, 15, '#ffffff', 4), star4(652, 548, 14, '#ffffff', 4));
  art.push(g({ 'clip-path': bodyClip }, body));

  // ---- the medallion: a pearl ring round a teal well, and the sigil
  const R = 232;
  art.push(inkCircle(CX, CY, R, '#fff3d2', { w: W_SUBJECT - 2 }));
  const ringClip = s.clip(el('circle', { cx: CX, cy: CY, r: R }));
  art.push(g({ 'clip-path': ringClip }, [
    el('path', { d: `M0 0H${W}V${H}H0Z` + circle(CX - 12, CY - 12, R), 'fill-rule': 'evenodd', fill: '#f2b6d8' }),                   // the ring's one shadow tone
    flat(ribbon(arcPts(CX, CY, R - 13, 3.5, 4.5), 10, 10, (u) => Math.sin(Math.PI * u)), '#ffffff'),
  ]));
  art.push(inkCircle(CX, CY, R - 27, '#1f8fa6', { w: W_INNER }));
  art.push(el('circle', { cx: CX, cy: CY, r: R - 66, fill: '#2bb0b8' }));
  const sg = sigil(s, { cx: CX, cy: CY, size: 304, outer: 14, inner: 8 });   // star on the medallion centre; the lip clears the well rim
  art.push(sg.markup);
  art.push(star4(...sg.at(0.52, -0.6), 18, '#ffffff', 4), star4(CX + R * 0.72, CY - R * 0.72, 28, '#ffd65a'), star4(CX - R * 0.74, CY + R * 0.7, 22, '#ffffff'));

  // ---- the seal strips: flat crimp stripes, an ink line where they meet the body
  const seals = [];
  for (const [y0, y1] of [[0, SEAL_T], [SEAL_B, H]]) {
    seals.push(el('rect', { x: 0, y: y0, width: W, height: y1 - y0, fill: '#63dccb' }));
    for (let x = XL - 6; x < XR; x += 27) seals.push(el('rect', { x, y: y0, width: 11, height: y1 - y0, fill: '#37b4b8' }));
  }
  seals.push(el('rect', { x: 0, y: SEAL_T, width: W, height: 16, fill: INK, opacity: 0.28 }));    // the seal's hard shadow on the body
  seals.push(el('rect', { x: 0, y: SEAL_B - 10, width: W, height: 10, fill: '#ffffff', opacity: 0.16 }));
  seals.push(stroke(`M0 ${SEAL_T}H${W}`, { w: W_INNER }), stroke(`M0 ${SEAL_B}H${W}`, { w: W_INNER }));

  // ---- the pouch's own light: one hard shadow down the right and along the bottom, hard highlights on the left
  const light = [
    el('path', { d: `M-200 -200H${W + 200}V${H + 200}H-200Z` + sil, 'fill-rule': 'evenodd', fill: INK, opacity: 0.26, transform: 'translate(-26 -14)' }),
    stroke(`M58 ${SEAL_T + 60}V${SEAL_T + 96}`, { w: 10, stroke: '#ffffff', opacity: 0.7 }),
    stroke(`M62 48V96`, { w: 10, stroke: '#ffffff', opacity: 0.7 }), stroke(`M62 ${SEAL_B + 26}V${SEAL_B + 70}`, { w: 10, stroke: '#ffffff', opacity: 0.7 }),
  ];

  s.add(2, g({ filter: wob }, g({ 'clip-path': clip }, [el('rect', { x: 0, y: 0, width: W, height: H, fill: '#2a3796' }), ...art, ...seals, ...light])));
  // the tear line: printed, dead straight, exactly on y = 150, edge to edge (not wobbled)
  s.add(2, g({ 'clip-path': clip }, el('path', { d: `M5 ${TEAR}H${W}`, fill: 'none', stroke: '#eafcff', 'stroke-width': 6, 'stroke-dasharray': '18 10' })));
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

/** A row of cartoon sea: pointed crests `pitch` apart with sagging troughs, filled down past the body. */
function seaRow(y, pitch, sag, shift) {
  let d = `M${-pitch + shift} ${y}`;
  for (let x = -pitch + shift; x < W + pitch; x += pitch) d += `Q${x + pitch / 2} ${y + sag * 2} ${x + pitch} ${y}`;
  return d + `V${H}H${-pitch + shift}Z`;
}

/** A falling star: a four-point star dragging a flat, hard-edged wedge of light up and to the right. */
function faller(x, y, sz, fill) {
  const L = sz * 3.2;
  return g({}, [flat(poly([[x - sz * 0.5, y - sz * 0.3], [x + L * 0.62, y - L], [x + sz * 0.3, y + sz * 0.5]], true), fill, { opacity: 0.3 }), star4(x, y, sz, fill, sz > 20 ? W_DETAIL : 4)]);
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
