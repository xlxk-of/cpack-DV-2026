// TIDEWITCH NERAI (epic) — a hooded sea-witch, hair rising like tendrils, drawing the tide into a single orb
// between her hands. Magenta and teal.
import { el, g, spline, ribbon, sample, poly, blob, orb, glint } from '../lib.mjs';

export function build(s) {
  const r = s.r;
  const OX = 512, OY = 588, OR = 64; // the orb

  // ---- 0: violet deep, a tide-moon of light behind her
  s.backdrop(s.lin([[0, '#1c0a40'], [0.3, '#1a1a5c'], [0.62, '#0c2a56'], [1, '#050c24']]));
  s.add(0, el('ellipse', { cx: 512, cy: 380, rx: 470, ry: 430, fill: s.rad([[0, '#6ffff0', 0.62], [0.35, '#1fb8c8', 0.34], [0.7, '#2a5ac8', 0.12], [1, '#2a5ac8', 0]]) }));
  mist(s, { color: '#e83ab8', opacity: 0.36, freq: 0.006, cx: 240, cy: 760, rx: 640, ry: 460 });
  mist(s, { color: '#c83ae0', opacity: 0.3, freq: 0.006, cx: 860, cy: 300, rx: 520, ry: 480 });
  mist(s, { color: '#3fe0d8', opacity: 0.24, freq: 0.005, cx: 512, cy: 420, rx: 760, ry: 520 });
  s.rays({ x: 512, y: -160, angle: 90, spread: 62, n: 9, color: '#d8c8ff', opacity: 0.14, width: 80 });
  s.motes({ n: 110, rmin: 0.6, rmax: 2, colors: ['#9ff6ff', '#ffb0f0'], opacity: 0.5, glow: false, layer: 0 });
  s.vignette({ strength: 0.78 });
  s.grain({ opacity: 0.2 });

  // ---- 1: the ring of tides (moon phases), drowned pillars
  const ring = [];
  const RC = [512, 372], RR = 318;
  ring.push(el('circle', { cx: RC[0], cy: RC[1], r: RR, fill: 'none', stroke: '#9ffff0', 'stroke-width': 2, opacity: 0.7 }));
  ring.push(el('circle', { cx: RC[0], cy: RC[1], r: RR - 16, fill: 'none', stroke: '#9ffff0', 'stroke-width': 1, opacity: 0.5, 'stroke-dasharray': '2 9' }));
  ring.push(el('circle', { cx: RC[0], cy: RC[1], r: RR + 26, fill: 'none', stroke: '#ff8ae0', 'stroke-width': 1.2, opacity: 0.45, 'stroke-dasharray': '40 14 4 14' }));
  for (let i = 0; i < 48; i++) {
    const a = i / 48 * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a), L = i % 4 === 0 ? 14 : 6;
    ring.push(el('path', { d: `M${RC[0] + c * (RR + 3)} ${RC[1] + sn * (RR + 3)}L${RC[0] + c * (RR + 3 + L)} ${RC[1] + sn * (RR + 3 + L)}`, stroke: '#9ffff0', 'stroke-width': 1.4, opacity: 0.6 }));
  }
  for (let i = 0; i < 12; i++) {
    const a = -Math.PI / 2 + i / 12 * Math.PI * 2, x = RC[0] + Math.cos(a) * (RR + 52), y = RC[1] + Math.sin(a) * (RR + 52);
    ring.push(moon(x, y, 15, i / 12));
  }
  s.add(1, g({ filter: 'url(#bloomS)', opacity: 0.8 }, ring));
  const pil = s.lin([[0, '#2a2a7a'], [0.5, '#161a52'], [1, '#080624']]);
  const pillar = (x, top, w, seed) => {
    const P = [];
    P.push(el('path', { d: `M${x - w} 1100L${x - w * 0.82} ${top + 40}L${x - w * 1.1} ${top + 26}L${x - w * 1.05} ${top}L${x + w * 0.5} ${top - 18}L${x + w * 1.12} ${top + 22}L${x + w * 0.84} ${top + 44}L${x + w} 1100Z`, fill: pil }));
    for (let k = -2; k <= 2; k++) P.push(el('path', { d: `M${x + k * w * 0.32} ${top + 50}V1100`, stroke: '#070420', 'stroke-width': 4, opacity: 0.5 }));
    P.push(el('path', { d: `M${x - w * 0.82} ${top + 40}V1100`, stroke: '#7fe9ff', 'stroke-width': 2, opacity: 0.3 }));
    return g({ filter: s.rough(9, 0.03, seed) }, P);
  };
  s.add(1, g({ opacity: 0.55, filter: 'url(#glow2)' }, [pillar(82, 430, 58, 3), pillar(950, 520, 64, 5), pillar(200, 700, 40, 8), pillar(838, 760, 36, 6)]));
  s.ridge({ y: 950, amp: 70, detail: 0.8, fill: s.lin([[0, '#1a1050'], [1, '#060420']]), layer: 1 });

  // ---- 2: Nerai
  const N = [];
  const mir = (inner) => g({ transform: 'translate(1024 0) scale(-1 1)' }, inner);
  const hairGrad = s.lin([[0, '#5ffff0'], [0.35, '#3fc8e8'], [0.65, '#c83ad0'], [1, '#7a1a8a']], 0, 90, 0, 470, true);
  const tendril = (pts, w, k) => {
    const out = [el('path', { d: ribbon(pts, w, 2, (t) => (0.72 + 0.5 * Math.sin(Math.PI * Math.min(1, t * 1.6))) * (1 + 0.08 * Math.sin(t * 16 + k))), fill: hairGrad })];
    const sm = sample(pts, 10), off = (o) => sm.map((p, i) => { const a = sm[Math.max(0, i - 1)], b = sm[Math.min(sm.length - 1, i + 1)], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, tt = i / (sm.length - 1); return [p[0] - (b[1] - a[1]) / L * o * w * (1 - tt), p[1] + (b[0] - a[0]) / L * o * w * (1 - tt)]; });
    out.push(el('path', { d: poly(off(0.2)), fill: 'none', stroke: '#f0ffff', 'stroke-width': Math.max(1.2, w * 0.07), opacity: 0.6, 'stroke-linecap': 'round' }));
    out.push(el('path', { d: poly(off(-0.24)), fill: 'none', stroke: '#2a0a5a', 'stroke-width': Math.max(1, w * 0.06), opacity: 0.4, 'stroke-linecap': 'round' }));
    return out;
  };
  // hair rising behind the hood like a crown of tendrils
  const backHair = [], fineHair = [];
  const drift = (y) => Math.pow(Math.max(0, (410 - y) / 340), 1.5) * 54; // the current leans everything to the right as it rises
  const lock = (d, w, k, sw, lift, reach = 1) => {
    const ad = Math.abs(d);
    const raw = [[d * 100, 410], [d * 176, 322 + ad * 18], [d * 240 + sw, 232 + ad * 42 + lift], [d * 292 - sw * 0.7, 150 + ad * 74 + lift], [d * 320 + sw * 0.4, 92 + ad * 94 + lift], [d * 304 + sw * 1.5, 56 + ad * 104 + lift]];
    return tendril(raw.map(([x, y]) => { const yy = 410 - (410 - y) * reach; return [512 + x * (0.55 + 0.45 * reach) + drift(yy), yy]; }), w, k);
  };
  const locks = [-1.02, -0.7, -0.4, -0.12, 0.16, 0.44, 0.74, 1.04];
  for (const [i, d] of locks.entries()) {
    backHair.push(...lock(d, r.range(40, 54), i, (i % 2 ? 1 : -1) * r.range(24, 44), r.range(-16, 16)));
    fineHair.push(...lock(d + r.range(0.1, 0.2), r.range(13, 20), i + 9, (i % 2 ? -1 : 1) * r.range(20, 50), r.range(-10, 30), r.range(0.62, 0.84)));
    if (i % 2) fineHair.push(...lock(d - r.range(0.08, 0.18), r.range(10, 16), i + 20, (i % 2 ? 1 : -1) * r.range(30, 60), r.range(0, 30), r.range(0.5, 0.7)));
  }
  N.push(g({ filter: 'url(#glow16)', opacity: 0.55 }, backHair.filter((_, i) => i % 3 === 0)));
  N.push(g({ opacity: 0.85 }, fineHair));
  N.push(g({}, backHair));

  // water arcs circling behind her
  const arcs = (list, layerParts) => {
    for (const [rx, ry, rot, a0, a1, w, o] of list) {
      const pts = [];
      for (let i = 0; i <= 14; i++) {
        const a = (a0 + (a1 - a0) * i / 14) * Math.PI / 180, c = Math.cos(rot * Math.PI / 180), sn = Math.sin(rot * Math.PI / 180);
        const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
        pts.push([OX + x * c - y * sn, OY + x * sn + y * c]);
      }
      layerParts.push(el('path', { d: ribbon(pts, w, w, (t) => Math.pow(Math.sin(Math.PI * t), 0.7)), fill: s.lin([[0, '#eaffff', o], [0.5, '#5fe9f0', o * 0.75], [1, '#c86af0', o * 0.5]], 0, 0, 1, 1) }));
      layerParts.push(el('path', { d: spline(pts.slice(2, 13)), fill: 'none', stroke: '#fff', 'stroke-width': 1.6, opacity: o * 0.9, 'stroke-linecap': 'round' }));
      for (let k = 0; k < 5; k++) { const p = pts[r.int(1, 13)]; layerParts.push(el('circle', { cx: p[0] + r.range(-16, 16), cy: p[1] + r.range(-16, 16), r: r.range(1.5, 4.5), fill: '#dffcff', opacity: o })); }
    }
  };
  const backArcs = [];
  arcs([[250, 80, -18, 185, 345, 20, 0.6], [330, 110, 14, 200, 330, 16, 0.45]], backArcs);
  N.push(g({ filter: 'url(#bloomS)' }, backArcs));

  // the robe
  const robeD = 'M336 458C280 500 258 590 246 700L196 1100H828L778 700C766 590 744 500 688 458C640 430 384 430 336 458Z';
  const robeFill = s.lin([[0, '#2a1466'], [0.4, '#1a0d4a'], [1, '#0a0626']], 0, 430, 0, 1024, true);
  const B = [];
  B.push(el('path', { d: robeD, fill: robeFill }));
  const rin = [];
  // the orb's light on her chest, and folds
  rin.push(el('circle', { cx: OX, cy: OY, r: 300, fill: s.rad([[0, '#8ffff0', 0.9], [0.3, '#2fc8d0', 0.5], [0.7, '#2a6ad0', 0.14], [1, '#2a6ad0', 0]]) }));
  for (let i = 0; i < 6; i++) {
    const t = i / 5, x0 = 430 + 164 * t, x1 = 250 + 524 * t, bend = (t - 0.5) * 120 + (i % 2 ? 26 : -26);
    const pts = [[x0, 690 + Math.abs(t - 0.5) * 50], [(x0 * 2 + x1) / 3 + bend * 0.4, 800], [(x0 + x1 * 2) / 3 + bend, 930], [x1, 1100]];
    rin.push(el('path', { d: spline(pts), fill: 'none', stroke: '#050214', 'stroke-width': 14, opacity: 0.5, filter: 'url(#glow8)' }));
    rin.push(el('path', { d: spline(pts), fill: 'none', stroke: '#7a6ae8', 'stroke-width': 1.6, opacity: 0.3, transform: 'translate(9 0)' }));
  }
  // drowned stars sewn into the hem
  for (let i = 0; i < 90; i++) {
    const y = 680 + 400 * Math.pow(r(), 0.7), x = r.range(200, 824), rr = r.range(0.8, 2.8);
    rin.push(el('circle', { cx: x, cy: y, r: rr, fill: r.pick(['#9ffff0', '#ff9ae8', '#ffffff']), opacity: r.range(0.4, 0.95) }));
  }
  rin.push(el('rect', { x: 150, y: 820, width: 724, height: 300, fill: s.lin([[0, '#050316', 0], [1, '#050316', 0.85]]) }));
  B.push(g({ 'clip-path': s.clip(el('path', { d: robeD })) }, rin));
  B.push(el('path', { d: 'M336 458C280 500 258 590 246 700L196 1100', fill: 'none', stroke: '#ff7ae0', 'stroke-width': 3.5, opacity: 0.8, filter: 'url(#glow2)' }));
  B.push(el('path', { d: 'M688 458C744 500 766 590 778 700L828 1100', fill: 'none', stroke: '#8a7af0', 'stroke-width': 2.5, opacity: 0.6 }));
  N.push(g({}, B));

  // the hood
  const hoodD = 'M548 146C470 176 380 268 374 388C372 428 350 448 318 470C400 500 624 500 706 470C674 448 652 428 650 388C644 268 604 184 548 146Z';
  const openD = 'M512 236C452 242 428 312 440 376C450 424 490 450 512 452C534 450 574 424 584 376C596 312 572 242 512 236Z';
  const Hd = [];
  Hd.push(el('path', { d: hoodD, fill: s.lin([[0, '#3a1c86'], [0.5, '#22105a'], [1, '#12083a']], 0, 150, 0, 500, true) }));
  const hin = [];
  hin.push(el('path', { d: 'M534 150C500 220 470 300 420 480', fill: 'none', stroke: '#0a0528', 'stroke-width': 26, opacity: 0.5, filter: 'url(#glow8)' }));
  hin.push(el('path', { d: 'M534 150C570 220 596 300 640 480', fill: 'none', stroke: '#0a0528', 'stroke-width': 30, opacity: 0.6, filter: 'url(#glow8)' }));
  hin.push(el('path', { d: 'M520 168C470 210 420 290 404 400', fill: 'none', stroke: '#8a6af0', 'stroke-width': 14, opacity: 0.45, filter: 'url(#glow8)' }));
  hin.push(el('ellipse', { cx: 512, cy: 520, rx: 240, ry: 90, fill: '#5ffff0', opacity: 0.4, filter: 'url(#glow16)' }));
  Hd.push(g({ 'clip-path': s.clip(el('path', { d: hoodD })) }, hin));
  Hd.push(el('path', { d: 'M548 146C470 176 380 268 374 388C372 428 350 448 318 470', fill: 'none', stroke: '#ff8ae6', 'stroke-width': 3.5, opacity: 0.9, 'stroke-linecap': 'round', filter: 'url(#glow2)' }));
  Hd.push(el('path', { d: 'M548 146C604 184 644 268 650 388C652 428 674 448 706 470', fill: 'none', stroke: '#c86af0', 'stroke-width': 2.5, opacity: 0.7, 'stroke-linecap': 'round' }));
  // inside the hood
  Hd.push(el('path', { d: openD, fill: s.lin([[0, '#05020f'], [0.6, '#0c0a2a'], [1, '#124a5a']], 0, 236, 0, 452, true) }));
  // the face: only what the orb's light finds
  const faceD = 'M468 342C466 300 558 300 556 342C556 388 534 420 512 432C490 420 468 388 468 342Z';
  const fc = [];
  fc.push(el('path', { d: faceD, fill: s.lin([[0, '#1a1440'], [0.42, '#3a4a86'], [0.8, '#7fd8dc'], [1, '#d8fff8']], 0, 300, 0, 436, true) }));
  fc.push(el('path', { d: 'M512 352Q506 378 512 386', fill: 'none', stroke: '#16224a', 'stroke-width': 2, opacity: 0.6, 'stroke-linecap': 'round' }));
  fc.push(el('path', { d: 'M496 404Q512 398 528 404Q512 416 496 404Z', fill: '#a01a7a' }));
  fc.push(el('path', { d: 'M496 404Q512 408 528 404', fill: 'none', stroke: '#3a0a3a', 'stroke-width': 1.4 }));
  fc.push(el('path', { d: 'M476 372Q482 404 504 424', fill: 'none', stroke: '#1a2a6a', 'stroke-width': 8, opacity: 0.35, filter: 'url(#glow4)' }));
  fc.push(el('path', { d: 'M468 342C466 300 558 300 556 342', fill: 'none', stroke: '#05020f', 'stroke-width': 30, opacity: 0.85, filter: 'url(#glow8)' }));
  Hd.push(g({ 'clip-path': s.clip(el('path', { d: openD })) }, fc));
  // eyes
  const eye = (x, flip) => {
    const d = `M${x - 17 * flip} ${356}Q${x - 2 * flip} ${340} ${x + 17 * flip} ${346}Q${x + 2 * flip} ${362} ${x - 17 * flip} ${356}Z`;
    return [el('path', { d, fill: '#5ffff0', filter: 'url(#glow8)' }), el('path', { d, fill: '#5ffff0', filter: 'url(#glow4)' }), el('path', { d, fill: '#f4ffff' })];
  };
  Hd.push(...eye(487, -1), ...eye(537, 1));
  // lining and trim round the opening
  Hd.push(el('path', { d: openD, fill: 'none', stroke: s.lin([[0, '#ff5ad0'], [1, '#8a2ad0']], 0, 236, 0, 452, true), 'stroke-width': 11 }));
  Hd.push(el('path', { d: openD, fill: 'none', stroke: '#ffd0f6', 'stroke-width': 1.6, opacity: 0.8, transform: 'translate(0 -1)' }));
  for (const p of sample([[512, 452], [550, 438], [578, 396], [590, 340], [574, 276], [512, 236], [450, 276], [434, 340], [446, 396], [474, 438]], 3, true)) Hd.push(el('circle', { cx: p[0], cy: p[1], r: 2.2, fill: '#fff', opacity: 0.85 }));
  N.push(g({}, Hd));
  // crescent clasp
  N.push(el('circle', { cx: 512, cy: 482, r: 22, fill: '#5ffff0', opacity: 0.4, filter: 'url(#glow8)' }));
  N.push(moon(512, 482, 15, 0.86, '#f4ffff', 1));

  // sleeves and hands (mirrored)
  const sleeveD = 'M348 466C296 520 276 610 300 684C312 742 344 792 374 804C388 752 410 694 432 656L396 614C384 570 392 510 404 472Z';
  const arm = () => {
    const A = [];
    A.push(el('path', { d: sleeveD, fill: s.lin([[0, '#34187a'], [0.6, '#1c0e50'], [1, '#0c0630']], 0, 460, 0, 800, true) }));
    A.push(g({ 'clip-path': s.clip(el('path', { d: sleeveD })) }, [
      el('circle', { cx: OX, cy: OY, r: 240, fill: s.rad([[0, '#8ffff0', 0.9], [0.45, '#2fc8d0', 0.42], [1, '#2a6ad0', 0]]) }),
      el('path', { d: 'M348 466C296 520 276 610 300 684C312 742 344 792 374 804', fill: 'none', stroke: '#060318', 'stroke-width': 34, opacity: 0.6, filter: 'url(#glow8)' }),
      el('path', { d: 'M372 520C350 580 352 660 380 730', fill: 'none', stroke: '#060318', 'stroke-width': 6, opacity: 0.5, filter: 'url(#glow2)' }),
    ]));
    A.push(el('path', { d: 'M348 466C296 520 276 610 300 684C312 742 344 792 374 804', fill: 'none', stroke: '#a88af8', 'stroke-width': 2, opacity: 0.55, 'stroke-linecap': 'round' }));
    A.push(el('path', { d: 'M374 804C388 752 410 694 432 656L396 614', fill: 'none', stroke: '#ff5ad0', 'stroke-width': 7, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    A.push(el('path', { d: 'M374 804C388 752 410 694 432 656L396 614', fill: 'none', stroke: '#ffd0f6', 'stroke-width': 1.4, opacity: 0.9 }));
    // the hand, cupping the orb
    const skin = s.lin([[0, '#3a5a9a'], [0.55, '#8fe0e0'], [1, '#f0fffb']], 380, 0, 470, 0, true);
    const fingers = [
      [[404, 612], [384, 582], [380, 548], [390, 522]],
      [[410, 604], [392, 564], [396, 522], [414, 496]],
      [[418, 598], [406, 552], [416, 508], [440, 484]],
      [[428, 598], [424, 556], [436, 522], [458, 504]],
      [[430, 630], [452, 650], [470, 664], [490, 668]],
    ];
    const hd = [];
    hd.push(el('path', { d: blob(420, 620, 24, 28, r, 8, 0.08, 0.4), fill: skin, stroke: '#16224a', 'stroke-width': 1.5 }));
    for (const [i, f] of fingers.entries()) hd.push(el('path', { d: ribbon(f, i === 4 ? 18 : 16 - (i === 0 ? 3 : 0), 5, (u) => 1 - 0.25 * u * u), fill: skin, stroke: '#16224a', 'stroke-width': 1.2, 'stroke-linejoin': 'round' }));
    hd.push(el('path', { d: blob(420, 620, 22, 26, r, 8, 0.05, 0.4), fill: skin }));
    A.push(g({}, hd));
    return A;
  };
  N.push(g({}, arm()), mir(arm()));

  // two locks spilling out of the hood and lifting on the current
  const frontHair = [];
  frontHair.push(...tendril([[470, 440], [440, 482], [398, 478], [372, 438], [372, 392], [392, 362]], 20, 1));
  frontHair.push(...tendril([[556, 440], [590, 490], [640, 492], [672, 452], [676, 402], [700, 366], [730, 356]], 20, 2));
  frontHair.push(...tendril([[548, 446], [566, 500], [610, 524], [650, 508]], 12, 3));
  N.push(g({ filter: 'url(#glow8)', opacity: 0.4 }, frontHair.filter((_, i) => i % 3 === 0)));
  N.push(g({}, frontHair));

  // the orb: the tide, wound into a ball
  const O = [];
  O.push(el('circle', { cx: OX, cy: OY, r: 190, fill: '#3ff0e8', opacity: 0.26, filter: 'url(#glow64)' }));
  O.push(el('circle', { cx: OX, cy: OY, r: OR + 30, fill: '#7ffff4', opacity: 0.4, filter: 'url(#glow16)' }));
  O.push(el('circle', { cx: OX, cy: OY, r: OR, fill: s.rad([[0, '#ffffff'], [0.25, '#c8fffa'], [0.55, '#4fe0e8'], [0.82, '#2a7ae0'], [1, '#7a3ae0']], 0.42, 0.38, 0.7) }));
  const oin = [];
  for (let k = 0; k < 7; k++) {
    const a0 = k / 7 * Math.PI * 2, pts = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12, rr = OR * (0.08 + 0.95 * t), a = a0 + t * 3.6; pts.push([OX + Math.cos(a) * rr, OY + Math.sin(a) * rr * 0.92]); }
    oin.push(el('path', { d: ribbon(pts, 1, 9, (t) => Math.sin(Math.PI * Math.min(1, t * 1.1))), fill: k % 2 ? '#ffffff' : '#b8fff8', opacity: k % 2 ? 0.75 : 0.5 }));
  }
  oin.push(el('ellipse', { cx: OX + 14, cy: OY + 34, rx: 60, ry: 30, fill: '#3a1ac8', opacity: 0.35, filter: 'url(#glow8)' }));
  O.push(g({ 'clip-path': s.clip(el('circle', { cx: OX, cy: OY, r: OR })) }, oin));
  O.push(el('circle', { cx: OX, cy: OY, r: OR, fill: 'none', stroke: '#f4ffff', 'stroke-width': 2.5, opacity: 0.9 }));
  O.push(el('path', { d: `M${OX - 44} ${OY - 26}Q${OX - 30} ${OY - 50} ${OX - 4} ${OY - 54}`, fill: 'none', stroke: '#fff', 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0.85, filter: 'url(#glow2)' }));
  O.push(el('circle', { cx: OX, cy: OY, r: 16, fill: '#fff', filter: 'url(#glow8)' }));
  O.push(glint(OX - 2, OY - 2, 46, '#ffffff', 0.85));
  N.push(g({}, O));
  s.add(2, g({}, N));

  // ---- 3: the tide answering, in front of her
  const front = [];
  arcs([[270, 86, -18, 20, 160, 22, 0.8], [350, 120, 14, 40, 150, 16, 0.6], [150, 44, -30, 10, 170, 12, 0.85]], front);
  s.add(3, g({ filter: 'url(#bloomS)' }, front));
  s.add(3, glint(690, 640, 20, '#c8fffa', 0.9), glint(322, 560, 16, '#ffc8f4', 0.9), glint(590, 205, 14, '#c8fffa', 0.8));
  s.motes({ n: 60, rmin: 1, rmax: 4.5, colors: ['#9ffff0', '#ff9ae8', '#ffffff', '#c8a6ff'], opacity: 0.85 });
  s.motes({ n: 40, x0: 300, y0: 420, x1: 724, y1: 760, rmin: 1, rmax: 3.6, colors: ['#dffffb', '#9ffff0'], opacity: 0.95 });
  s.bubbles({ n: 14, y0: 100, rmin: 3, rmax: 16, color: '#e6f4ff', opacity: 0.5 });
  // near weed framing the corners
  s.kelp({ x: 40, y: 1060, h: 420, n: 3, color: '#07041c', layer: 3, width: 20 });
  s.kelp({ x: 990, y: 1060, h: 380, n: 3, color: '#07041c', layer: 3, width: 20, lean: -0.06 });
}

/** A moon disc at phase p (0 new .. 0.5 full .. 1 new). */
function moon(x, y, R, p, color = '#c8fffa', o = 0.9) {
  const k = Math.cos(p * Math.PI * 2); // +1 new, -1 full
  const waxing = p < 0.5, sweepLit = waxing ? 1 : 0;
  const parts = [el('circle', { cx: x, cy: y, r: R, fill: 'none', stroke: color, 'stroke-width': 1.2, opacity: o * 0.7 })];
  const rx = Math.abs(k) * R;
  const d = `M${x} ${y - R}A${R} ${R} 0 0 ${sweepLit} ${x} ${y + R}A${rx} ${R} 0 0 ${k > 0 ? (waxing ? 0 : 1) : (waxing ? 1 : 0)} ${x} ${y - R}Z`;
  if (Math.abs(k) < 0.999 || k < 0) parts.push(el('path', { d, fill: color, opacity: o }));
  return g({}, parts);
}

/** Turbulent murk over the whole canvas, shown only inside a soft ellipse (so it never ends on a hard edge). */
function mist(s, { color, opacity = 0.3, freq = 0.006, seed = null, layer = 0, cx = 512, cy = 512, rx = 600, ry = 400, contrast = 2.2 }) {
  const id = s.uid('mi'), sd = seed ?? s.r.int(1, 999), off = -(contrast - 1) * 0.62;
  s.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="${sd}"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${contrast} 0 0 0 ${off}"/><feComposite in2="SourceGraphic" operator="in"/></filter>`);
  const m = s.mask(el('ellipse', { cx, cy, rx, ry, fill: s.rad([[0, '#fff', 1], [0.55, '#fff', 0.75], [1, '#fff', 0]]) }));
  s.add(layer, g({ mask: m, opacity }, el('rect', { x: 0, y: 0, width: s.w, height: s.h, fill: color, filter: `url(#${id})` })));
}
