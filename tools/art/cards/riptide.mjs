// RIPTIDE (rare spell) — a rip current seen from above: one fat spiral of foam, with little fish and driftwood
// dragged round it. Doodle style: fat ink line, flat colour, one hard shadow tone.
import { el, g, ribbon, poly, ink, stroke, flat, inkCircle, eye, star4, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const circ = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const rr = (x, y, w, h, q) => `M${x + q} ${y}h${w - 2 * q}q${q} 0 ${q} ${q}v${h - 2 * q}q0 ${q} ${-q} ${q}h${-(w - 2 * q)}q${-q} 0 ${-q} ${-q}v${-(h - 2 * q)}q0 ${-q} ${q} ${-q}Z`;

const CX = 520, CY = 424, TURN = 540, END = 160, R0 = 48, R1 = 292, GAP = R1 / (TURN / 360);
const SEA = '#22a59d', SEA_D = '#168582', SEA_DD = '#0f6a70', SEA_L = '#43c4b6';
const FOAM = '#ffffff', FOAM_D = '#bdebe6', STREAK = '#8fe6da';

// the spiral: t = 0 at the eye, 1 at the outer end (and on beyond 1); dr pushes the point outward
const ang = (t) => (END - (1 - t) * TURN) * Math.PI / 180;
const sp = (t, dr = 0) => { const a = ang(t), q = R0 + R1 * t + dr; return [CX + Math.cos(a) * q, CY + Math.sin(a) * q]; };
const arc = (t0, t1, dr = 0, n = 0) => { const N = n || Math.max(4, Math.ceil(Math.abs(t1 - t0) * 44)), out = []; for (let i = 0; i <= N; i++) out.push(sp(t0 + (t1 - t0) * i / N, dr)); return out; };
const deg = (t) => ang(t) * 180 / Math.PI + 90;      // the way the flow runs outward at t, in degrees
const fat = (t) => 26 + 58 * t;                        // the foam's width

export function build(s) {
  const r = s.r;
  const contour = (ds, w = W_SUBJECT) => g({}, ds.map((d) => el('path', { d, fill: INK, stroke: INK, 'stroke-width': w * 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' })));
  const form = (d, fill, inside = [], w = W_INNER) => g({}, [flat(d, fill), inside.length ? g({ 'clip-path': s.clip(el('path', { d })) }, inside) : '', stroke(d, { w })]);

  // ---- 0: flat sea from above, the current as broad flat spiral bands (no ink)
  s.backdrop(SEA);
  s.add(0, flat(ribbon(arc(-0.05, 2.6, GAP / 2), 70, 330, null, 3), SEA_D));
  s.add(0, flat(ribbon(arc(0.98, 2.6, 0), 90, 200, null, 3), SEA_L, { opacity: 0.55 }));
  s.add(0, flat(ribbon(arc(1.25, 2.9, GAP / 2), 40, 150, null, 3), SEA_DD, { opacity: 0.7 }));
  s.add(0, el('circle', { cx: CX, cy: CY, r: 96, fill: SEA_D }), el('circle', { cx: CX, cy: CY, r: 58, fill: SEA_DD }));
  s.specks({ n: 46, rmin: 2, rmax: 5, colors: ['#bff5ec', '#ffffff'], opacity: 0.5, layer: 0 });
  s.paper();

  // ---- 1: streaks of current under the surface, two fish not yet caught
  const lens = (u) => Math.sin(Math.PI * u) * 0.9 + 0.1;
  const streak = (t0, t1, dr, w) => ink(ribbon(arc(t0, t1, dr), w, w, lens, 4), STREAK, { w: W_MID });
  s.add(1, streak(0.36, 0.5, GAP / 2 + 8, 20), streak(0.62, 0.75, GAP / 2 - 6, 22), streak(0.86, 0.98, GAP / 2 + 16, 24), streak(1.1, 1.22, GAP / 2 - 30, 24),
    streak(1.32, 1.44, 40, 26), streak(1.5, 1.6, GAP / 2 + 20, 24), streak(1.02, 1.1, GAP / 2 + 70, 18), streak(1.72, 1.8, 10, 26), streak(0.03, 0.14, GAP / 2 - 10, 14));
  const farFish = (x, y, a, k) => g({ transform: `translate(${x} ${y}) rotate(${a}) scale(${k})`, opacity: 0.9 }, [
    ink('M-34 0L-64 -22Q-56 0 -64 22Z', '#2f8f93', { w: W_MID / k }), ink('M-40 0a40 25 0 1 0 80 0a40 25 0 1 0 -80 0Z', '#2f8f93', { w: W_MID / k }), el('circle', { cx: 18, cy: -5, r: 6, fill: INK })]);
  s.add(1, farFish(120, 200, 150, 0.9), farFish(930, 700, -30, 0.8), farFish(900, 150, 200, 0.7));

  // ---- 2: the foam spiral, with what it has caught
  const body = [];
  const line = arc(0, 1);
  const spiral = ribbon(line, fat(0), fat(1), null, 3);
  const blobs = [];
  for (let t = 0.12; t <= 1.001;) {
    const q = 22 + 28 * t + r.range(-3, 3), [x, y] = sp(t, fat(t) / 2 - 10);
    blobs.push([x, y, q, t]);
    t += (q * 1.62) / ((R0 + R1 * t) * (TURN * Math.PI / 180));
  }
  const [ex, ey] = sp(1), [ix, iy] = sp(0);
  const parts = [spiral, circ(ex, ey, fat(1) / 2 + 4), circ(ix, iy, fat(0) / 2), ...blobs.map(([x, y, q]) => circ(x, y, q))];
  body.push(contour(parts));
  body.push(g({}, parts.map((d) => flat(d, FOAM))));
  body.push(g({ 'clip-path': s.clip(parts.map((d) => el('path', { d })).join('')) }, [
    flat(ribbon(line.map((_, i) => sp(i / (line.length - 1), -fat(i / (line.length - 1)) * 0.3)), fat(0) * 0.46, fat(1) * 0.46, null, 3), FOAM_D),
    flat(circ(ex - 30, ey + 10, 26), FOAM_D),
  ]));
  // foam curls and the pull of the water, drawn
  blobs.forEach(([x, y, q, t], i) => {
    if (i % 2) return;
    const a = ang(t) + Math.PI * 0.2, c = q * 0.5;
    body.push(stroke(`M${x + Math.cos(a) * c} ${y + Math.sin(a) * c}A${c} ${c} 0 1 0 ${x + Math.cos(a + 4.2) * c} ${y + Math.sin(a + 4.2) * c}`, { w: W_DETAIL + 1 }));
  });
  [[0.2, 0.3], [0.38, 0.5], [0.58, 0.68], [0.76, 0.86], [0.92, 0.98]].forEach(([a, b]) => body.push(stroke(poly(arc(a, b, -fat((a + b) / 2) * 0.06)), { w: W_DETAIL + 1 })));
  // the eye of it
  body.push(inkCircle(CX, CY, 30, '#0b4f60', { w: W_INNER }), el('circle', { cx: CX + 4, cy: CY + 4, r: 13, fill: '#073544' }));

  // a caught fish, nose outward against the pull
  const fish = (t, dr, k, fill, shade, turn = 0) => {
    const [x, y] = sp(t, dr), W = (w) => w / k;
    const bodyD = 'M-46 0a46 31 0 1 0 92 0a46 31 0 1 0 -92 0Z', tail = 'M-38 0L-78 -28Q-66 0 -78 28Z', fin = 'M-8 -24q10 -26 30 -20q-4 14 -10 22z';
    return g({ transform: `translate(${x} ${y}) rotate(${deg(t) + turn}) scale(${k})` }, [
      contour([tail, fin, bodyD], W(10)),
      form(tail, shade, [], W(W_DETAIL)), form(fin, shade, [], W(W_DETAIL)),
      form(bodyD, fill, [flat('M-60 8Q0 30 60 8L60 40L-60 40Z', shade), flat('M-16 -20h22q5 0 5 4t-5 4h-22q-5 0 -5 -4t5 -4z', '#ffffff', { opacity: 0.85 })], W(W_DETAIL)),
      eye(20, -4, 13, { look: [-0.6, 0.2], w: W(W_DETAIL - 1) }),
      ink('M38 10a5 6 0 1 0 0.1 0Z', INK, { w: W(2) }),
    ]);
  };
  body.push(fish(0.26, GAP / 2 - 8, 0.9, '#ffb347', '#f08a3c', 8), fish(0.11, GAP / 2, 0.74, '#ff8fb0', '#e8648f', 10), fish(0.6, GAP / 2 + 24, 0.86, '#ffd75e', '#f5a83a', 6));
  // driftwood
  const wood = (t, dr, k, turn) => {
    const [x, y] = sp(t, dr), W = (w) => w / k;
    const log = rr(-58, -19, 116, 38, 17), stub = 'M6 -18l10 -24l20 6l-8 20z';
    return g({ transform: `translate(${x} ${y}) rotate(${deg(t) + turn}) scale(${k})` }, [
      contour([stub, log], W(10)), form(stub, '#b9825a', [], W(W_DETAIL)),
      form(log, '#dba873', [flat('M-70 4h140v30h-140z', '#b9825a'), stroke('M-30 -4h34M10 6h28', { w: W(W_DETAIL - 1) })], W(W_DETAIL)),
      ink('M46 0a8 13 0 1 0 0.1 0Z', '#f3d6a6', { w: W(W_DETAIL - 1), transform: 'translate(-8 -13)' }),
    ]);
  };
  body.push(wood(0.01, GAP / 2, 0.8, 14), wood(0.85, GAP / 2 + 22, 1, -8));
  s.add(2, g({ filter: s.wobble(5) }, body));

  // ---- 3: spray: foam bubbles, sparkles, flecks
  s.inkBubbles({ n: 11, rmin: 8, rmax: 22, fill: '#ffffff' });
  // droplets flung off the tail of the foam
  [[1.05, 30, 15], [1.09, -6, 10], [1.1, 44, 8], [1.14, 14, 6]].forEach(([t, dr, q]) => { const [x, y] = sp(t, dr); s.add(3, inkCircle(x, y, q, '#ffffff', { w: W_DETAIL })); });
  s.add(3, star4(236, 236, 30), star4(840, 560, 24, '#fff6c0'), star4(330, 830, 20), star4(800, 250, 18, '#bff5ec'));
  s.specks({ n: 18, rmin: 3, rmax: 7, colors: ['#ffffff', '#d9fbf5'], opacity: 0.9 });
}
