// GHOSTSHIP REVENANT (epic) — a drowned galleon that never stopped sailing, ghost-green canvas full of a wind
// that is not there, gliding above the sea floor and trailing spirit-fog.
import { el, g, spline, ribbon, sample, poly, blob, orb, glint } from '../lib.mjs';

export function build(s) {
  const r = s.r;

  // ---- 0: deep water, a drowned moon of light above
  s.backdrop(s.lin([[0, '#0f5a5c'], [0.25, '#0a3a4c'], [0.6, '#071c36'], [1, '#03081a']]));
  s.add(0, el('ellipse', { cx: 600, cy: 130, rx: 520, ry: 360, fill: s.rad([[0, '#9fffd8', 0.5], [0.4, '#2fb8a0', 0.22], [1, '#2fb8a0', 0]]) }));
  s.add(0, el('ellipse', { cx: 500, cy: 520, rx: 600, ry: 420, fill: s.rad([[0, '#3fe6a8', 0.3], [0.6, '#1a8a8a', 0.1], [1, '#1a8a8a', 0]]) }));
  mist(s, { color: '#4fe0b0', opacity: 0.26, freq: 0.005, cx: 520, cy: 380, rx: 820, ry: 520 });
  mist(s, { color: '#6a4fd8', opacity: 0.36, freq: 0.007, cx: 420, cy: 780, rx: 900, ry: 440 });
  s.rays({ x: 640, y: -140, angle: 100, spread: 54, n: 9, color: '#c8ffe6', opacity: 0.17, width: 80 });
  s.motes({ n: 100, rmin: 0.6, rmax: 2, color: '#a8ffe0', opacity: 0.45, glow: false, layer: 0 });
  s.vignette({ strength: 0.78 });
  s.grain({ opacity: 0.2 });

  // ---- 1: the sea floor, a graveyard of older wrecks
  s.ridge({ y: 810, amp: 90, detail: 0.35, fill: s.lin([[0, '#113e52'], [1, '#07182c']]), layer: 1, opacity: 0.7 });
  const farInk = '#0a2a40';
  // ribs of a far hull
  const ribs = [];
  for (let i = 0; i < 9; i++) {
    const x = 70 + i * 30, h = 150 - Math.abs(i - 4) * 16;
    ribs.push(el('path', { d: `M${x} 900Q${x - 30} ${860 - h * 0.6} ${x + 24} ${850 - h}`, fill: 'none', stroke: farInk, 'stroke-width': 9, 'stroke-linecap': 'round' }));
  }
  ribs.push(el('path', { d: 'M30 868Q190 902 350 852', fill: 'none', stroke: farInk, 'stroke-width': 14, 'stroke-linecap': 'round' }));
  s.add(1, g({ opacity: 0.85 }, ribs));
  // a far leaning mast with a cross-yard
  s.add(1, g({ opacity: 0.85 }, [
    el('path', { d: 'M965 900L912 640', stroke: farInk, 'stroke-width': 13, 'stroke-linecap': 'round' }),
    el('path', { d: 'M872 716L980 688', stroke: farInk, 'stroke-width': 8, 'stroke-linecap': 'round' }),
    el('path', { d: 'M880 716Q900 780 928 762Q938 800 966 754L972 692Z', fill: farInk, opacity: 0.8 }),
    el('path', { d: 'M912 640L1010 900M912 640L860 900', stroke: farInk, 'stroke-width': 2, fill: 'none' }),
  ]));
  s.ridge({ y: 880, amp: 60, detail: 0.25, fill: s.lin([[0, '#0f3348'], [0.5, '#081a2e'], [1, '#040a18']]), layer: 1 });
  // the ship's light pooling on the sand beneath it
  s.add(1, el('ellipse', { cx: 520, cy: 905, rx: 360, ry: 52, fill: '#5fffb8', opacity: 0.22, filter: 'url(#glow32)' }));
  s.kelp({ x: 210, y: 930, h: 190, n: 2, color: '#07202e', layer: 1, width: 10 });
  s.kelp({ x: 760, y: 950, h: 160, n: 2, color: '#07202e', layer: 1, width: 10 });

  // ---- 2: the galleon (bow to the left, nose up)
  const S = []; // everything rotates together
  const GH = '#7dffc0';
  // the halo it sails in
  S.push(el('ellipse', { cx: 500, cy: 420, rx: 330, ry: 280, fill: '#4fffb0', opacity: 0.2, filter: 'url(#glow64)' }));

  // spirit-fog streaming aft
  const wisps = [];
  for (let i = 0; i < 16; i++) {
    const y0 = r.range(230, 660), x0 = r.range(560, 820), len = r.range(240, 460), w = r.range(24, 80);
    const pts = [[x0, y0], [x0 + len * 0.35, y0 + r.range(-30, 30)], [x0 + len * 0.7, y0 + r.range(-50, 40)], [x0 + len, y0 + r.range(-80, 40)]];
    wisps.push(el('path', { d: ribbon(pts, w, 2, (t) => 0.6 + 0.4 * Math.sin(t * 9 + i)), fill: s.lin([[0, GH, 0], [0.2, GH, 0.42], [1, '#4fd8c8', 0]], x0, 0, x0 + len, 0, true) }));
  }
  S.push(g({ filter: 'url(#glow8)' }, wisps));

  // masts and yards
  const wood = s.lin([[0, '#1c5a54'], [1, '#082028']], 0, 0, 1, 0);
  const masts = [[392, 524, 386, 228], [514, 548, 508, 160], [668, 498, 664, 258]];
  const spars = [];
  for (const [x0, y0, x1, y1] of masts) {
    spars.push(el('path', { d: ribbon([[x0, y0], [x1, y1]], 14, 5), fill: wood }));
    spars.push(el('path', { d: `M${x0 - 5} ${y0}L${x1 - 2} ${y1}`, stroke: GH, 'stroke-width': 1.6, opacity: 0.7 }));
  }
  spars.push(el('path', { d: ribbon([[306, 508], [128, 438]], 11, 4), fill: wood }));
  spars.push(el('path', { d: 'M306 503L128 435', stroke: GH, 'stroke-width': 1.4, opacity: 0.7 }));
  // crow's nest
  spars.push(el('path', { d: 'M490 312L530 310L524 334L496 335Z', fill: '#0c3438', stroke: GH, 'stroke-width': 1.4, 'stroke-opacity': 0.7 }));
  S.push(g({}, spars));

  // sails
  const sails = [
    { xc: 510, y: 196, hw: 74, h: 112, belly: 30 },
    { xc: 512, y: 336, hw: 104, h: 176, belly: 44 },
    { xc: 388, y: 262, hw: 60, h: 88, belly: 24 },
    { xc: 390, y: 372, hw: 86, h: 132, belly: 36 },
  ];
  const sailFill = (y, h) => s.lin([[0, '#e8fff2', 0.92], [0.35, '#8dffc8', 0.74], [0.75, '#3fdca6', 0.5], [1, '#1fae98', 0.28]], 0, y, 0, y + h, true);
  const glowSails = [], sharpSails = [];
  for (const [k, sl] of sails.entries()) {
    const d = sailPath(sl, r);
    glowSails.push(el('path', { d, fill: '#5fffb4', 'fill-rule': 'evenodd' }));
    const cp = s.clip(el('path', { d, 'clip-rule': 'evenodd' }));
    const seams = [];
    for (let i = 1; i < 7; i++) {
      const t = i / 7, x = sl.xc - sl.hw + sl.hw * 2 * t;
      seams.push(el('path', { d: `M${x} ${sl.y - 6}Q${x - sl.belly * (1.1 - t)} ${sl.y + sl.h * 0.5} ${x - 6} ${sl.y + sl.h + 10}`, fill: 'none', stroke: '#0c5a58', 'stroke-width': 1.6, opacity: 0.45 }));
    }
    // shading: the belly catches light, the edges fall off
    seams.push(el('ellipse', { cx: sl.xc - sl.belly * 0.5, cy: sl.y + sl.h * 0.42, rx: sl.hw * 0.62, ry: sl.h * 0.4, fill: '#f4fff8', opacity: 0.4, filter: 'url(#glow16)' }));
    seams.push(el('rect', { x: sl.xc + sl.hw * 0.35, y: sl.y - 10, width: sl.hw, height: sl.h + 60, fill: '#06383c', opacity: 0.35, filter: 'url(#glow16)' }));
    sharpSails.push(g({ filter: s.rough(5, 0.035, 3 + k) }, [
      el('path', { d, fill: sailFill(sl.y, sl.h), 'fill-rule': 'evenodd' }),
      g({ 'clip-path': cp }, seams),
      el('path', { d, fill: 'none', stroke: '#eafff4', 'stroke-width': 1.8, opacity: 0.8 }),
    ]));
    // the yard
    sharpSails.push(el('path', { d: `M${sl.xc - sl.hw - 12} ${sl.y + 5}L${sl.xc + sl.hw + 12} ${sl.y - 5}`, stroke: '#0c3438', 'stroke-width': 8, 'stroke-linecap': 'round' }));
    sharpSails.push(el('path', { d: `M${sl.xc - sl.hw - 12} ${sl.y + 2}L${sl.xc + sl.hw + 12} ${sl.y - 8}`, stroke: GH, 'stroke-width': 1.5, opacity: 0.8 }));
  }
  // the lateen on the mizzen
  {
    const a = [612, 432], b = [742, 266], c = [752, 470];
    const edge = [];
    for (let i = 0; i <= 14; i++) { const t = i / 14; edge.push([c[0] + (a[0] - c[0]) * t + (i % 2 ? r.range(4, 26) : 0) * (i > 0 && i < 14 ? 1 : 0), c[1] + (a[1] - c[1]) * t - Math.sin(t * Math.PI) * 26 - (i % 2 ? r.range(6, 40) : 0)]); }
    const d = `M${a[0]} ${a[1]}L${b[0]} ${b[1]}Q${c[0] + 30} ${(b[1] + c[1]) / 2} ${c[0]} ${c[1]}` + edge.slice(1).map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('') + 'Z';
    glowSails.push(el('path', { d, fill: '#5fffb4' }));
    sharpSails.push(g({ filter: s.rough(5, 0.035, 11) }, [
      el('path', { d, fill: s.lin([[0, '#e8fff2', 0.9], [0.5, '#6ff0c0', 0.6], [1, '#1fae98', 0.3]], 742, 266, 660, 470, true) }),
      el('path', { d, fill: 'none', stroke: '#eafff4', 'stroke-width': 1.8, opacity: 0.8 }),
    ]));
    sharpSails.push(el('path', { d: `M${a[0] - 14} ${a[1] + 18}L${b[0] + 10} ${b[1] - 14}`, stroke: '#0c3438', 'stroke-width': 7, 'stroke-linecap': 'round' }));
    sharpSails.push(el('path', { d: `M${a[0] - 16} ${a[1] + 15}L${b[0] + 8} ${b[1] - 17}`, stroke: GH, 'stroke-width': 1.4, opacity: 0.8 }));
  }
  S.push(g({ filter: 'url(#glow16)', opacity: 0.55 }, glowSails));
  S.push(g({}, sharpSails));

  // pennants streaming aft from the mastheads
  for (const [x, y, L] of [[508, 162, 120], [386, 230, 80], [664, 260, 70]]) {
    const pts = [[x, y], [x + L * 0.3, y - 10], [x + L * 0.65, y + 8], [x + L, y - 6]];
    S.push(el('path', { d: ribbon(pts, 20, 2, (t) => 1 - 0.3 * Math.sin(t * 12)), fill: s.lin([[0, '#c8ffe6', 0.9], [1, '#3fdca6', 0.1]], x, 0, x + L, 0, true), filter: 'url(#bloomS)' }));
  }

  // the hull
  const hullD = 'M246 514L338 504L344 540Q470 558 606 544L612 500L704 492L710 452L808 436Q824 440 822 470C816 540 802 602 770 642C700 680 420 694 330 652C288 630 260 580 246 514Z';
  const hullClip = s.clip(el('path', { d: hullD }));
  const H = [];
  // beakhead and figurehead
  H.push(el('path', { d: 'M250 516Q210 512 178 478Q196 520 214 536Q236 548 262 560Z', fill: '#0c3438', stroke: GH, 'stroke-width': 1.4, 'stroke-opacity': 0.6 }));
  // rudder
  H.push(el('path', { d: hullD, fill: s.lin([[0, '#1a5a54'], [0.3, '#0e3a40'], [0.7, '#082430'], [1, '#051420']], 0, 430, 0, 690, true) }));
  const hin = [];
  // planking
  for (let k = 0; k < 15; k++) {
    const o = k * 15;
    hin.push(el('path', { d: `M230 ${500 + o}Q470 ${556 + o * 1.05} 830 ${440 + o * 1.2}`, fill: 'none', stroke: '#031018', 'stroke-width': 2.2, opacity: 0.7 }));
    hin.push(el('path', { d: `M230 ${502.5 + o}Q470 ${558.5 + o * 1.05} 830 ${442.5 + o * 1.2}`, fill: 'none', stroke: '#3fa890', 'stroke-width': 1, opacity: 0.32 }));
  }
  for (let i = 0; i < 46; i++) { const x = r.range(250, 820), y = r.range(450, 690); hin.push(el('path', { d: `M${x} ${y}v${r.range(10, 15)}`, stroke: '#031018', 'stroke-width': 1.6, opacity: 0.6 })); }
  // wales: two pale bands of trim
  hin.push(el('path', { d: 'M230 548Q470 600 830 492', fill: 'none', stroke: '#5fd6ae', 'stroke-width': 6, opacity: 0.5 }));
  hin.push(el('path', { d: 'M230 600Q470 652 830 556', fill: 'none', stroke: '#3fa890', 'stroke-width': 4, opacity: 0.4 }));
  // weed and barnacle growth below
  for (let i = 0; i < 70; i++) { const x = r.range(280, 800), y = r.range(610, 690); hin.push(el('circle', { cx: x, cy: y, r: r.range(1.5, 5), fill: r.pick(['#2f8a7a', '#0a2a30', '#6fd6b0']), opacity: r.range(0.3, 0.7) })); }
  // a breach in the bow quarter, ribs showing, the glow of whatever crews her
  const breach = blob(350, 604, 40, 26, r, 11, 0.45);
  hin.push(el('path', { d: breach, fill: '#021016' }));
  hin.push(g({ 'clip-path': s.clip(el('path', { d: breach })) }, [
    el('ellipse', { cx: 356, cy: 618, rx: 34, ry: 16, fill: '#7dffb0', opacity: 0.5, filter: 'url(#glow8)' }),
    ...[0, 1, 2, 3].map((i) => el('path', { d: `M${322 + i * 19} 560Q${314 + i * 19} 606 ${326 + i * 19} 650`, fill: 'none', stroke: '#03141a', 'stroke-width': 4 })),
  ]));
  hin.push(el('path', { d: breach, fill: 'none', stroke: '#9fffd0', 'stroke-width': 1.6, opacity: 0.7 }));
  // shade toward the keel and stern
  hin.push(el('rect', { x: 200, y: 620, width: 700, height: 100, fill: s.lin([[0, '#020a12', 0], [1, '#020a12', 0.8]]) }));
  hin.push(el('ellipse', { cx: 300, cy: 520, rx: 150, ry: 60, fill: '#bfffe0', opacity: 0.22, filter: 'url(#glow16)' }));
  H.push(g({ 'clip-path': hullClip }, hin));

  // gun ports, lit from inside
  const lights = [];
  for (let i = 0; i < 6; i++) {
    const x = 402 + i * 56, t = (x - 230) / 600, y = (1 - t) * (1 - t) * 574 + 2 * (1 - t) * t * 630 + t * t * 520 - 4;
    H.push(el('rect', { x: x - 12, y: y - 22, width: 24, height: 8, fill: '#06202a', stroke: '#4fc8a0', 'stroke-width': 1, transform: `rotate(-4 ${x} ${y})` }));
    H.push(el('rect', { x: x - 11, y: y - 11, width: 22, height: 20, rx: 2, fill: s.rad([[0, '#ffffe8'], [0.6, '#d8ff9a'], [1, '#6fd070']]), stroke: '#04161c', 'stroke-width': 2.5 }));
    H.push(el('path', { d: `M${x} ${y - 11}v20M${x - 11} ${y - 1}h22`, stroke: '#0a3028', 'stroke-width': 1.6, opacity: 0.8 }));
    lights.push(el('circle', { cx: x, cy: y, r: 26, fill: '#d8ff8a', opacity: 0.55 }));
  }
  // stern-castle windows
  for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) {
    const x = 728 + i * 28, y = 474 + j * 34 - i * 5;
    H.push(el('path', { d: `M${x - 9} ${y + 12}V${y - 4}Q${x} ${y - 16} ${x + 9} ${y - 4}V${y + 12}Z`, fill: s.rad([[0, '#ffffe8'], [0.7, '#e0ff9a'], [1, '#7ad880']]), stroke: '#04161c', 'stroke-width': 2.2 }));
    H.push(el('path', { d: `M${x} ${y - 10}V${y + 12}`, stroke: '#0a3028', 'stroke-width': 1.4 }));
    lights.push(el('circle', { cx: x, cy: y, r: 20, fill: '#d8ff8a', opacity: 0.5 }));
  }
  // rails and the lit edge of every deck
  H.push(el('path', { d: 'M246 514L338 504M344 540Q470 558 606 544M612 500L704 492M710 452L808 436', fill: 'none', stroke: '#c8ffe6', 'stroke-width': 3, 'stroke-linecap': 'round', filter: 'url(#bloomS)' }));
  const rail = [];
  for (let x = 252; x < 806; x += 9) {
    let y; if (x < 338) y = 514 - (x - 246) * 0.109; else if (x < 344) continue; else if (x < 606) { const t = (x - 344) / 262; y = (1 - t) * (1 - t) * 540 + 2 * (1 - t) * t * 558 + t * t * 544; } else if (x < 612) continue; else if (x < 704) y = 500 - (x - 612) * 0.087; else if (x < 710) continue; else y = 452 - (x - 710) * 0.163;
    rail.push(`M${x} ${y.toFixed(1)}v-13`);
  }
  H.push(el('path', { d: rail.join(''), stroke: '#6fe6b8', 'stroke-width': 1.5, opacity: 0.75 }));
  H.push(el('path', { d: 'M248 501L338 491M346 527Q470 545 604 531M614 487L704 479M712 439L806 423', fill: 'none', stroke: '#9fffd0', 'stroke-width': 2, opacity: 0.85 }));
  H.push(el('path', { d: hullD, fill: 'none', stroke: '#5fe0b0', 'stroke-width': 1.6, opacity: 0.55 }));
  H.push(el('path', { d: 'M246 514C260 580 288 630 330 652', fill: 'none', stroke: '#c8ffe6', 'stroke-width': 3, opacity: 0.8, 'stroke-linecap': 'round', filter: 'url(#glow2)' }));
  // the keel dissolving into mist
  const hullFade = s.mask(el('rect', { x: 0, y: 0, width: 1024, height: 1024, fill: s.lin([[0, '#fff'], [0.6, '#fff'], [0.685, '#555']], 0, 0, 0, 1024, true) }));
  S.push(g({ mask: hullFade }, H));
  S.push(g({ filter: 'url(#glow8)' }, lights));

  // rigging
  const rig = [];
  const line = (x0, y0, x1, y1, sag = 0) => rig.push(`M${x0} ${y0}Q${(x0 + x1) / 2} ${(y0 + y1) / 2 + sag} ${x1} ${y1}`);
  line(508, 162, 386, 230, 10); line(386, 230, 128, 438, 16); line(508, 162, 664, 260, 12); line(664, 260, 806, 432, 14);
  line(386, 300, 180, 470, 14); line(508, 240, 392, 330, 8);
  for (const [mx, top, base, dir] of [[388, 262, 512, 1], [510, 196, 546, 1], [666, 300, 496, 1]]) {
    for (let k = 0; k < 4; k++) { line(mx, top, mx - 58 + k * 10, base - 4); line(mx, top, mx + 58 - k * 10, base - 6); }
    for (let k = 1; k < 7; k++) { const t = k / 7, y = top + (base - top) * t; rig.push(`M${mx - 58 * t} ${y}L${mx - 28 * t} ${y}M${mx + 58 * t} ${y}L${mx + 28 * t} ${y}`); }
  }
  S.push(el('path', { d: rig.join(''), fill: 'none', stroke: '#aaffd8', 'stroke-width': 1.3, opacity: 0.6 }));

  // stern lantern
  S.push(el('path', { d: 'M812 438L836 404', stroke: '#0c3438', 'stroke-width': 4 }));
  S.push(orb(838, 398, 9, '#c8ff8a', '#ffffe8'));

  // mist boiling under the keel
  mist(s, { color: '#8dffd0', opacity: 0, layer: 2 }); // (keeps the seeded stream stable)
  s.add(2, g({ transform: 'translate(14 44) rotate(-5 512 500)' }, S));
  mist(s, { color: '#8dffd0', opacity: 0.6, freq: 0.009, layer: 2, cx: 574, cy: 734, rx: 420, ry: 90, contrast: 2.6 });

  // soul-wisps keeping pace
  for (const [x, y, k, a] of [[214, 300, 1, -10], [300, 720, 0.8, 8], [860, 330, 0.9, -14], [690, 150, 0.7, -6], [150, 590, 0.7, 4]]) {
    const pts = [[x, y], [x + 40 * k, y + 8 * k], [x + 80 * k, y - 8 * k + a], [x + 130 * k, y + a * 2]];
    s.add(2, el('path', { d: ribbon(pts, 14 * k, 1), fill: s.lin([[0, '#d8ffec', 0.9], [1, GH, 0]], x, 0, x + 130 * k, 0, true), filter: 'url(#glow2)' }));
    s.add(2, orb(x, y, 6 * k, GH, '#f4fff8', 0.95));
  }

  // ---- 3: wreckage in the near dark
  const ink = s.lin([[0, '#0a2030'], [1, '#01040a']]);
  const F = [];
  // the ship's wheel, half buried, lower left
  {
    const W = [], hi = [];
    W.push(el('circle', { cx: 0, cy: 0, r: 96, fill: 'none', stroke: '#040c16', 'stroke-width': 17 }));
    W.push(el('circle', { cx: 0, cy: 0, r: 58, fill: 'none', stroke: '#040c16', 'stroke-width': 7 }));
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 + 0.2, c = Math.cos(a), sn = Math.sin(a);
      W.push(el('path', { d: `M${c * 14} ${sn * 14}L${c * 134} ${sn * 134}`, stroke: '#040c16', 'stroke-width': 9, 'stroke-linecap': 'round' }));
      W.push(el('circle', { cx: c * 136, cy: sn * 136, r: 9, fill: '#040c16' }));
      hi.push(`M${c * 20 - sn * 4} ${sn * 20 + c * 4}L${c * 132 - sn * 4} ${sn * 132 + c * 4}`);
    }
    W.push(el('circle', { cx: 0, cy: 0, r: 20, fill: '#040c16' }));
    W.push(el('path', { d: 'M-88 -56A104 104 0 0 1 60 -86', fill: 'none', stroke: '#4fd8a8', 'stroke-width': 2.2, opacity: 0.45, 'stroke-linecap': 'round' }));
    W.push(el('path', { d: hi.slice(4).join(''), stroke: '#4fd8a8', 'stroke-width': 1.4, opacity: 0.3 }));
    F.push(g({ transform: 'translate(150 962) rotate(-14) scale(1 0.94)' }, W));
  }
  // hull ribs, lower right
  for (let i = 0; i < 5; i++) {
    const x = 800 + i * 58, h = 110 + i * 34;
    F.push(el('path', { d: `M${x + 20} 1070Q${x - 40} ${1050 - h * 0.6} ${x + 26} ${1020 - h}`, fill: 'none', stroke: '#040c16', 'stroke-width': 24 - i, 'stroke-linecap': 'round' }));
    F.push(el('path', { d: `M${x + 12} 1070Q${x - 48} ${1050 - h * 0.6} ${x + 19} ${1018 - h}`, fill: 'none', stroke: '#3fc89a', 'stroke-width': 1.6, opacity: 0.3, 'stroke-linecap': 'round' }));
  }
  // an anchor fouled in its own chain
  const an = [];
  an.push(el('path', { d: 'M0 -150V70', stroke: '#040c16', 'stroke-width': 16, 'stroke-linecap': 'round' }));
  an.push(el('circle', { cx: 0, cy: -168, r: 17, fill: 'none', stroke: '#040c16', 'stroke-width': 8 }));
  an.push(el('path', { d: 'M-52 -124H52', stroke: '#040c16', 'stroke-width': 12, 'stroke-linecap': 'round' }));
  an.push(el('path', { d: 'M-86 6Q-70 80 0 82Q70 80 86 6', fill: 'none', stroke: '#040c16', 'stroke-width': 16, 'stroke-linecap': 'round' }));
  an.push(el('path', { d: 'M-104 20L-86 -22L-62 18ZM104 20L86 -22L62 18Z', fill: '#040c16' }));
  an.push(el('path', { d: 'M-7 -150V66M-92 6Q-76 74 -6 78', fill: 'none', stroke: '#4fd8a8', 'stroke-width': 1.6, opacity: 0.35 }));
  F.push(g({ transform: 'translate(600 968) rotate(28) scale(0.82)' }, an));
  const links = sample([[652, 826], [600, 836], [540, 900], [470, 950], [440, 1050]], 5);
  for (const [i, p] of links.entries()) F.push(el('ellipse', { cx: p[0], cy: p[1], rx: 8, ry: 5, fill: 'none', stroke: '#040c16', 'stroke-width': 3.5, transform: `rotate(${i % 2 ? 40 : -50} ${p[0]} ${p[1]})` }));
  // sand hummocks
  F.push(el('path', { d: spline([[-80, 1100], [-80, 985], [80, 975], [260, 1005], [430, 992], [600, 1010], [800, 996], [1100, 1004], [1100, 1100]], true), fill: '#02060e' }));
  s.add(3, g({}, F));
  s.motes({ n: 56, rmin: 1, rmax: 4.5, colors: ['#a8ffd8', '#d8fff0', '#c8ff9a'], opacity: 0.8 });
  s.bubbles({ n: 12, y0: 150, rmin: 3, rmax: 15, color: '#d8fff0', opacity: 0.5 });
  s.add(3, glint(838, 372, 20, '#f0ffd0', 0.8), glint(250, 250, 14, '#d8fff0', 0.7));
}

/** A tattered square sail hanging from a yard at (xc, y): billowing to port, lower edge in shreds, holes torn through. */
function sailPath({ xc, y, hw, h, belly }, r) {
  const tl = [xc - hw, y + 5], tr = [xc + hw, y - 5];
  const bl = [xc - hw * 1.08 - belly * 0.25, y + h], br = [xc + hw * 1.02 - belly * 0.15, y + h - 8];
  let d = `M${tl[0]} ${tl[1]}L${tr[0]} ${tr[1]}Q${xc + hw - belly * 0.7} ${y + h * 0.5} ${br[0]} ${br[1]}`;
  const n = Math.round(hw / 5);
  for (let i = 1; i <= n; i++) {
    const t = i / n, x = br[0] + (bl[0] - br[0]) * t, base = br[1] + (bl[1] - br[1]) * t - Math.sin(t * Math.PI) * h * 0.1;
    const deep = r() < 0.2 ? r.range(0.3, 0.6) : r.range(0.02, 0.2);
    d += `L${(x + r.range(-3, 3)).toFixed(1)} ${(i % 2 ? base - h * deep : base + r.range(0, h * 0.12)).toFixed(1)}`;
  }
  d += `Q${xc - hw - belly} ${y + h * 0.5} ${tl[0]} ${tl[1]}Z`;
  for (let i = 0; i < 2; i++) d += blob(xc + (i ? 1 : -1) * r.range(hw * 0.2, hw * 0.6) - belly * 0.3, y + r.range(h * 0.3, h * 0.72), r.range(4, 10), r.range(8, 20), r, 7, 0.4);
  return d;
}

/** Turbulent murk over the whole canvas, shown only inside a soft ellipse (so it never ends on a hard edge). */
function mist(s, { color, opacity = 0.3, freq = 0.006, seed = null, layer = 0, cx = 512, cy = 512, rx = 600, ry = 400, contrast = 2.2 }) {
  if (!opacity) return;
  const id = s.uid('mi'), sd = seed ?? s.r.int(1, 999), off = -(contrast - 1) * 0.62;
  s.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="${sd}"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${contrast} 0 0 0 ${off}"/><feComposite in2="SourceGraphic" operator="in"/></filter>`);
  const m = s.mask(el('ellipse', { cx, cy, rx, ry, fill: s.rad([[0, '#fff', 1], [0.55, '#fff', 0.75], [1, '#fff', 0]]) }));
  s.add(layer, g({ mask: m, opacity }, el('rect', { x: 0, y: 0, width: s.w, height: s.h, fill: color, filter: `url(#${id})` })));
}
