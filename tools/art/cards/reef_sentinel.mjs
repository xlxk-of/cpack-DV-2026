// REEF SENTINEL (common, Guard) — an old armoured crab, crusted with coral and barnacles, claws up on its ledge.
import { el, g, spline, ribbon, sample, poly, glint, noise1 } from '../lib.mjs';

export function build(s) {
  const r = s.r;

  // ---- 0: sunlit turquoise water
  s.backdrop(s.lin([[0, '#9df5e6'], [0.16, '#45cfd0'], [0.45, '#1193ae'], [0.75, '#0a5a82'], [1, '#062f52']]));
  s.add(0, el('ellipse', { cx: 300, cy: -30, rx: 560, ry: 380, fill: s.rad([[0, '#fbfff2', 0.95], [0.4, '#b9ffe9', 0.45], [1, '#7ff0e0', 0]]) }));
  s.fog({ color: '#bffff0', opacity: 0.2, freq: 0.005 });
  s.fog({ color: '#0a4a7a', opacity: 0.3, freq: 0.007, y: 420, h: 700 });
  s.rays({ x: 250, y: -200, angle: 66, spread: 62, n: 10, color: '#f0fff4', opacity: 0.3, width: 90, len: 1400, blur: 12 });
  s.rays({ x: 330, y: -200, angle: 70, spread: 40, n: 5, color: '#ffffff', opacity: 0.16, width: 36, len: 1300, blur: 6 });
  s.motes({ n: 70, rmin: 0.6, rmax: 2.2, color: '#eafffb', opacity: 0.45, glow: false, layer: 0 });
  s.vignette({ strength: 0.55, color: '#011a36', cy: 0.42 });
  s.grain({ opacity: 0.16 });

  // ---- 1: the reef falling away behind
  s.ridge({ y: 640, amp: 150, detail: 0.7, fill: s.lin([[0, '#3db4c4'], [1, '#157a9c']], 0, 0.4, 0, 1), layer: 1, opacity: 0.55, filter: 'url(#glow4)' });
  const farCoral = [];
  for (const [x, y, k] of [[90, 640, 1.2], [215, 690, 0.8], [800, 650, 1.1], [935, 620, 1.3], [690, 700, 0.7]]) {
    for (let i = 0; i < 3; i++) coral(farCoral, r, x + i * 26 * k - 26 * k, y, -Math.PI / 2 + r.range(-0.35, 0.35), 70 * k, 15 * k, 3);
  }
  s.add(1, g({ fill: '#1b88a6', opacity: 0.6, filter: 'url(#glow2)' }, farCoral));
  s.ridge({ y: 770, amp: 110, detail: 0.9, fill: s.lin([[0, '#1a85a0'], [1, '#0a4a70']], 0, 0.6, 0, 1), layer: 1, opacity: 0.9 });
  // a far school of little fish
  const school = [];
  for (let i = 0; i < 22; i++) {
    const x = 640 + r.range(0, 300) - i * 2, y = 170 + r.range(0, 130) + (x - 640) * 0.18, k = r.range(0.6, 1.2);
    school.push(el('path', { d: `M${x} ${y}q${10 * k} ${-6 * k} ${22 * k} 0l${8 * k} ${-5 * k}l${-2 * k} ${5 * k}l${2 * k} ${5 * k}l${-8 * k} ${-5 * k}q${-12 * k} ${6 * k} ${-22 * k} 0z`, transform: `rotate(${r.range(-14, 4)} ${x} ${y})` }));
  }
  s.add(1, g({ fill: '#0c5f86', opacity: 0.55 }, school));

  // ---- 2: the ledge and its keeper
  const sub = [];
  // the ledge: a sunlit shelf, then its dark face falling away
  const nzA = noise1(r, 32), nzB = noise1(r, 32);
  const backY = (x) => 694 + (nzA(x / 70) - 0.5) * 20 - 14 * Math.exp(-Math.pow((x - 512) / 320, 2));
  const lipY = (x) => 800 + (nzB(x / 46) - 0.5) * 40 - 12 * Math.cos((x - 512) / 300);
  const back = [], lip = [];
  for (let x = -40; x <= 1064; x += 16) { back.push([x, backY(x)]); lip.push([x, lipY(x)]); }
  const faceD = poly([...lip, [1064, 1064], [-40, 1064]], true), topD = poly([...back, ...lip.slice().reverse()], true);
  sub.push(el('path', { d: faceD, fill: s.lin([[0, '#1a6f8a'], [0.25, '#0d4266'], [0.7, '#07284a'], [1, '#041833']], 0, 780, 0, 1024, true) }));
  const fg = [];
  for (let i = 0; i < 22; i++) {
    const x = r.range(-20, 1044), y0 = lipY(x), h = r.range(60, 240), n2 = r.range(-30, 30);
    fg.push(el('path', { d: spline([[x, y0], [x + n2 * 0.4, y0 + h * 0.4], [x + n2, y0 + h * 0.7], [x + n2 * 0.6, y0 + h]]), fill: 'none', stroke: '#031226', 'stroke-width': r.range(3, 9), opacity: 0.5, 'stroke-linecap': 'round' }));
  }
  for (let i = 0; i < 70; i++) {
    const x = r.range(0, 1024), y = lipY(x) + r.range(14, 230), rr = r.range(3, 12);
    fg.push(el('ellipse', { cx: x, cy: y, rx: rr, ry: rr * 0.75, fill: '#031226', opacity: 0.5 }));
    fg.push(el('ellipse', { cx: x, cy: y + rr * 0.55, rx: rr, ry: rr * 0.4, fill: '#6fd6d8', opacity: 0.2 }));
  }
  sub.push(g({ 'clip-path': s.clip(el('path', { d: faceD })) }, fg));
  sub.push(el('path', { d: topD, fill: s.lin([[0, '#8fe6d2'], [0.35, '#49b3b0'], [1, '#1d7890']], 0, 680, 0, 820, true) }));
  const tg = [];
  for (let i = 0; i < 46; i++) {
    const x = r.range(0, 1024), y = r.range(700, 800), rr = r.range(10, 40);
    tg.push(el('ellipse', { cx: x, cy: y, rx: rr, ry: rr * 0.28, fill: r() < 0.5 ? '#0e5a78' : '#dffff2', opacity: r.range(0.12, 0.3) }));
  }
  for (let i = 0; i < 50; i++) {
    const x = r.range(0, 1024), y = r.range(700, 800), rr = r.range(2, 7);
    tg.push(el('ellipse', { cx: x, cy: y, rx: rr, ry: rr * 0.5, fill: '#0a4a68', opacity: 0.5 }));
  }
  tg.push(el('ellipse', { cx: 430, cy: 730, rx: 420, ry: 50, fill: '#f0fff0', opacity: 0.4, filter: 'url(#glow16)' }));
  tg.push(el('ellipse', { cx: 900, cy: 760, rx: 300, ry: 80, fill: '#073a5c', opacity: 0.5, filter: 'url(#glow32)' }));
  sub.push(g({ 'clip-path': s.clip(el('path', { d: topD })) }, tg));
  sub.push(el('path', { d: poly(lip), fill: 'none', stroke: '#d9fff2', 'stroke-width': 3.5, opacity: 0.75, 'stroke-linejoin': 'round' }));
  sub.push(el('path', { d: poly(lip), fill: 'none', stroke: '#04203c', 'stroke-width': 7, opacity: 0.5, transform: 'translate(0 7)', filter: 'url(#glow2)' }));
  // small growths along the ledge
  const lcor = [];
  for (const [x, k, c] of [[64, 1.1, 0], [150, 0.7, 1], [905, 0.9, 0], [975, 1.25, 1], [836, 0.5, 1]]) {
    const parts = [];
    for (let i = 0; i < 3; i++) coral(parts, r, x + (i - 1) * 16 * k, backY(x) + 30, -Math.PI / 2 + (i - 1) * 0.4 + r.range(-0.15, 0.15), 44 * k, 11 * k, 3);
    lcor.push(g({ fill: c ? s.lin([[0, '#ffe3cc'], [1, '#d9606a']]) : s.lin([[0, '#b0ffe8'], [1, '#1f8a96']]) }, parts));
  }
  sub.push(g({ filter: s.emboss({ color: '#ffffff', depth: 5, blur: 3, k: 0.6 }) }, lcor));
  // shadow under the crab
  sub.push(el('ellipse', { cx: 524, cy: 742, rx: 330, ry: 34, fill: '#021a30', opacity: 0.62, filter: 'url(#glow16)' }));

  const crab = [];
  const shellGrad = s.rad([[0, '#ffd08a'], [0.2, '#ff7e32'], [0.5, '#e03a1c'], [0.8, '#96161c'], [1, '#470a18']], 0.34, 0.14, 0.92);
  const legGrad = s.lin([[0, '#ffa565'], [0.4, '#e2452a'], [1, '#5a0e18']]);
  // legs: three a side, far ones first
  const legs = [];
  const L = [
    [[330, 600], [196, 572], [140, 716]],
    [[344, 622], [226, 628], [196, 750]],
    [[368, 640], [292, 668], [278, 764]],
  ];
  for (let i = 0; i < 3; i++) {
    for (const side of [-1, 1]) {
      const m = (p) => [side < 0 ? p[0] : 1024 - p[0] + (i - 1) * 8, p[1] + (side > 0 ? 5 - i * 4 : 0)];
      legs.push(leg(m(L[i][0]), m(L[i][1]), m(L[i][2]), 50 - (2 - i) * 4, legGrad, side));
    }
  }
  crab.push(g({}, legs));

  // arms, then the shell
  crab.push(el('path', { d: ribbon([[340, 590], [284, 600], [244, 556]], 66, 56), fill: legGrad }));
  crab.push(el('path', { d: ribbon([[684, 590], [740, 602], [778, 562]], 62, 52), fill: legGrad }));

  const shellPts = [[286, 502], [322, 428], [400, 378], [512, 360], [624, 378], [702, 428], [738, 502], [716, 568], [660, 620], [585, 648], [512, 656], [439, 648], [364, 620], [308, 568]];
  const shell = spline(shellPts, true);
  const shellClip = s.clip(el('path', { d: shell }));
  // thorns along the rim
  const rim = sample(shellPts.slice(0, 7), 10), spikes = [];
  for (let i = 3; i < rim.length - 2; i += 6) {
    if (i > 24 && i < 37) continue; // leave the crown clear for the eyes
    const p = rim[i], q = rim[i + 1], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy), nx = dy / l, ny = -dx / l;
    const len = 46 + 8 * Math.sin(i), w = 15;
    spikes.push(el('path', { d: poly([[p[0] - dx / l * w - nx * 6, p[1] - dy / l * w - ny * 6], [p[0] + nx * len, p[1] + ny * len], [p[0] + dx / l * w - nx * 6, p[1] + dy / l * w - ny * 6]], true), fill: s.lin([[0, '#fff0d2'], [0.5, '#f9743a'], [1, '#c92a1e']]) }));
  }
  crab.push(g({}, spikes));
  crab.push(el('path', { d: shell, fill: shellGrad }));
  const inn = [];
  // the brow: the front lip of the dome, sagging toward us in the middle
  const brow = [[276, 512], [372, 548], [512, 562], [652, 548], [748, 512]];
  // armour bands across the dome, each overlapping the next
  for (let k = 0; k < 3; k++) {
    const d = spline([[290, 478 - k * 30], [384, 508 - k * 38], [512, 520 - k * 42], [640, 508 - k * 38], [734, 478 - k * 30]]);
    inn.push(el('path', { d, fill: 'none', stroke: '#4a0a14', 'stroke-width': 16, opacity: 0.32, transform: 'translate(0 -8)', filter: 'url(#glow4)' }));
    inn.push(el('path', { d, fill: 'none', stroke: '#4a0a14', 'stroke-width': 5, opacity: 0.7, 'stroke-linecap': 'round' }));
    inn.push(el('path', { d, fill: 'none', stroke: '#ffe0b0', 'stroke-width': 3, opacity: 0.6, 'stroke-linecap': 'round', transform: 'translate(0 6)' }));
  }
  // knobbly tubercles
  for (let i = 0; i < 150; i++) {
    const x = r.range(292, 732), y = r.range(366, 545), rr = r.range(2, 6.5);
    inn.push(el('circle', { cx: x + 1, cy: y + 2, r: rr, fill: '#5a0c16', opacity: 0.5 }));
    inn.push(el('circle', { cx: x, cy: y, r: rr * 0.8, fill: '#ffc08a', opacity: 0.6 }));
  }
  // weed and algae crust on the dome
  for (let i = 0; i < 10; i++) {
    const x = r.range(310, 714), y = r.range(376, 470);
    inn.push(el('ellipse', { cx: x, cy: y, rx: r.range(20, 46), ry: r.range(9, 18), fill: r.pick(['#1f8a80', '#4fb09a', '#f0e2b0', '#1f8a80']), opacity: 0.4, filter: 'url(#glow4)' }));
  }
  // sunlight on the upper left of the dome, shade to the right
  inn.push(el('ellipse', { cx: 420, cy: 380, rx: 180, ry: 50, fill: '#fff0c8', opacity: 0.45, filter: 'url(#glow16)' }));
  inn.push(el('ellipse', { cx: 740, cy: 480, rx: 100, ry: 140, fill: '#3a0818', opacity: 0.55, filter: 'url(#glow16)' }));
  // the face under the brow, in shade
  inn.push(el('path', { d: poly([...sample(brow, 10), [760, 700], [270, 700]], true), fill: s.lin([[0, '#4a0a18'], [0.35, '#8a1c1e'], [1, '#2a0614']], 0, 520, 0, 660, true) }));
  for (let i = 0; i < 40; i++) {
    const x = r.range(320, 704), y = r.range(566, 650), rr = r.range(1.5, 4);
    inn.push(el('circle', { cx: x, cy: y, r: rr, fill: '#ff9a6a', opacity: 0.28 }));
  }
  // mouth parts, set in a scowl
  const jawFill = s.lin([[0, '#f59a5c'], [0.5, '#c8402a'], [1, '#6a1218']]);
  inn.push(el('ellipse', { cx: 512, cy: 616, rx: 56, ry: 34, fill: '#1e040c', opacity: 0.8, filter: 'url(#glow4)' }));
  inn.push(el('path', { d: 'M509 586Q474 580 466 606Q472 640 509 646Z', fill: jawFill }));
  inn.push(el('path', { d: 'M515 586Q550 580 558 606Q552 640 515 646Z', fill: jawFill }));
  inn.push(el('path', { d: 'M509 586Q474 580 466 606M515 586Q550 580 558 606', fill: 'none', stroke: '#ffd9b0', 'stroke-width': 2.6, opacity: 0.8, 'stroke-linecap': 'round' }));
  inn.push(el('path', { d: 'M490 592L492 640M534 592L532 640', fill: 'none', stroke: '#4a0a12', 'stroke-width': 2.5, opacity: 0.6 }));
  for (const sd of [-1, 1]) inn.push(el('path', { d: `M${512 + sd * 70} 590Q${512 + sd * 130} 584 ${512 + sd * 190} 560`, fill: 'none', stroke: '#2a0610', 'stroke-width': 5, opacity: 0.6, 'stroke-linecap': 'round' }));
  // belly shade
  inn.push(el('ellipse', { cx: 512, cy: 676, rx: 240, ry: 50, fill: '#22040f', opacity: 0.75, filter: 'url(#glow16)' }));
  crab.push(g({ 'clip-path': shellClip }, inn));
  // brow ridge, studded
  const browD = spline(brow.map((p, i) => [p[0] + (i === 0 ? 16 : i === 4 ? -16 : 0), p[1]]));
  crab.push(el('path', { d: browD, fill: 'none', stroke: '#2a0610', 'stroke-width': 16, 'stroke-linecap': 'round', opacity: 0.75, transform: 'translate(0 9)' }));
  crab.push(el('path', { d: browD, fill: 'none', stroke: s.lin([[0, '#ffe6b8'], [0.45, '#ff8a4a'], [1, '#c9361f']], 0, 0, 1, 0), 'stroke-width': 13, 'stroke-linecap': 'round' }));
  const bs = sample(brow, 6);
  for (let i = 2; i < bs.length - 2; i++) {
    if (Math.abs(bs[i][0] - 462) < 32 || Math.abs(bs[i][0] - 562) < 32) continue;
    crab.push(el('circle', { cx: bs[i][0], cy: bs[i][1], r: 5, fill: '#ffe0b0' }));
  }

  // eyes on short stalks, under heavy lids
  for (const [bx, ex, ey, sd] of [[470, 458, 492, -1], [554, 566, 494, 1]]) {
    crab.push(el('ellipse', { cx: ex, cy: ey + 4, rx: 40, ry: 40, fill: '#3a0810', opacity: 0.55, filter: 'url(#glow4)' }));
    crab.push(el('ellipse', { cx: ex, cy: ey, rx: 29, ry: 31, fill: '#3a0810' }));
    const ec = s.clip(el('ellipse', { cx: ex, cy: ey - 1, rx: 26, ry: 28 }));
    crab.push(g({ 'clip-path': ec }, [
      el('ellipse', { cx: ex, cy: ey - 1, rx: 26, ry: 28, fill: s.rad([[0, '#fff3b0'], [0.5, '#ffc640'], [0.85, '#e07a1a'], [1, '#7a2a0c']], 0.45, 0.55, 0.62) }),
      el('ellipse', { cx: ex - sd * 3, cy: ey + 6, rx: 12, ry: 14, fill: '#120406' }),
      el('ellipse', { cx: ex - sd * 3 - 6, cy: ey + 1, rx: 5, ry: 6, fill: '#fff' }),
      el('circle', { cx: ex - sd * 3 + 5, cy: ey + 12, r: 2.4, fill: '#fff', opacity: 0.8 }),
      // the lid, slanting down toward the middle
      el('path', { d: poly([[ex - 44, ey - 44], [ex + 44, ey - 44], [ex + 44, ey - 8 - sd * 12], [ex - 44, ey - 8 + sd * 12]], true), fill: s.lin([[0, '#ff8a4a'], [1, '#b82a1c']]) }),
    ]));
    crab.push(el('path', { d: `M${ex - 28} ${ey - 8 + sd * 8}L${ex + 28} ${ey - 8 - sd * 8}`, stroke: '#ffd9a8', 'stroke-width': 4.5, 'stroke-linecap': 'round' }));
    crab.push(el('path', { d: `M${ex - 28} ${ey - 3 + sd * 8}L${ex + 28} ${ey - 3 - sd * 8}`, stroke: '#2a0610', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.7 }));
  }

  // elbows and claws
  crab.push(el('ellipse', { cx: 244, cy: 536, rx: 40, ry: 42, fill: shellGrad }));
  crab.push(el('ellipse', { cx: 780, cy: 542, rx: 37, ry: 39, fill: shellGrad }));
  crab.push(g({ transform: 'translate(270 404) rotate(12) scale(1.12)' }, claw(s, r)));
  crab.push(g({ transform: 'translate(762 420) rotate(-15) scale(-0.95 0.95)' }, claw(s, r)));

  // the crust: coral, barnacles
  const crust = [];
  const cA = [], cB = [];
  for (const [x, y, a, k] of [[420, 380, -1.75, 1.1], [396, 392, -2.2, 0.65], [618, 380, -1.3, 0.8]]) { cA.push(el('ellipse', { cx: x, cy: y, rx: 12 * k, ry: 7 * k })); coral(cA, r, x, y, a, 44 * k, 12 * k, 3); }
  for (const [x, y, a, k] of [[584, 370, -1.5, 0.95], [452, 370, -1.45, 0.6]]) { cB.push(el('ellipse', { cx: x, cy: y, rx: 12 * k, ry: 7 * k })); coral(cB, r, x, y, a, 42 * k, 11 * k, 3); }
  crust.push(g({ fill: s.lin([[0, '#fff6e0'], [1, '#ff9488']]) }, cA));
  crust.push(g({ fill: s.lin([[0, '#c2fff2'], [1, '#1f9aa0']]) }, cB));
  for (const [x, y, k, a] of [[318, 440, 19, -38], [342, 416, 13, -30], [300, 468, 12, -50], [706, 440, 18, 38], [684, 414, 12, 30], [724, 470, 11, 52],
    [500, 366, 14, -4], [528, 364, 10, 6], [476, 372, 8, -10],
    [200, 440, 15, -72], [206, 410, 10, -64], [828, 452, 13, 74], [222, 566, 12, -50], [800, 574, 10, 50]]) crust.push(barnacle(s, x, y, k, a));
  crab.push(g({}, crust));

  sub.push(g({ filter: s.emboss({ color: '#ffe2b0', az: 228, elev: 50, depth: 10, k: 0.5, exp: 24, blur: 6 }) }, crab));
  // cool bounce light on the shaded side
  sub.push(el('path', { d: spline([[738, 502], [716, 568], [660, 620], [585, 648], [512, 656]]), fill: 'none', stroke: '#7ff0e6', 'stroke-width': 3, opacity: 0.5 }));
  s.add(2, g({}, sub));

  // ---- 3: near coral framing, bubbles, light flecks
  const near = [];
  for (const [x, y, k] of [[10, 1050, 1.5], [110, 1070, 1.0], [1016, 1050, 1.6], [910, 1075, 1.0]]) {
    for (let i = 0; i < 3; i++) coral(near, r, x + (i - 1) * 40 * k, y, -Math.PI / 2 + (i - 1) * 0.45 + r.range(-0.2, 0.2) + (x < 512 ? 0.1 : -0.1), 80 * k, 22 * k, 3);
  }
  s.add(3, g({ fill: s.lin([[0, '#0b4468'], [1, '#03172e']]), filter: 'url(#glow4)' }, near));
  s.bubbles({ n: 16, y0: 80, y1: 900, rmin: 3, rmax: 15, color: '#f0fffb', opacity: 0.65 });
  s.motes({ n: 40, rmin: 1, rmax: 4, colors: ['#ffffff', '#d6fff4', '#ffe9c0'], opacity: 0.75 });
  s.add(3, glint(300, 262, 20, '#fff', 0.85), glint(690, 300, 12, '#fff8e0', 0.7), glint(432, 376, 14, '#fff', 0.75));
}

/** One crab leg: thigh, shin tapering to a point, knuckle between. */
function leg(a, b, c, w, fill, side) {
  const bend = [(b[0] + c[0]) / 2 - side * 16, (b[1] + c[1]) / 2 - 6];
  const parts = [
    el('path', { d: ribbon([b, bend, c], w * 0.92, 5, (t) => 1 - 0.1 * t), fill }),
    el('path', { d: ribbon([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 12], b], w, w * 0.88), fill }),
    el('circle', { cx: b[0], cy: b[1], r: w * 0.52, fill }),
    el('path', { d: poly([[b[0] - side * 6, b[1] - w * 0.4], [b[0] - side * 20, b[1] - w * 0.95], [b[0] + side * 12, b[1] - w * 0.42]], true), fill: '#ffb680' }),
    el('path', { d: poly([[c[0] + side * 9, c[1] - 40], c, [c[0] - side * 9, c[1] - 34]], true), fill: '#3a0812' }),
  ];
  // bands on the shin
  for (const t of [0.3, 0.55]) {
    const x = b[0] + (c[0] - b[0]) * t - side * 12 * Math.sin(t * Math.PI), y = b[1] + (c[1] - b[1]) * t;
    parts.push(el('path', { d: `M${x - w * 0.34} ${y - 3}L${x + w * 0.34} ${y + 3}`, stroke: '#5a0c16', 'stroke-width': 3, opacity: 0.5 }));
  }
  return g({}, parts);
}

/** A claw pointing up, palm at the origin; the heavy fixed finger on the left, the hinged one on the right. */
function claw(s, r) {
  const parts = [];
  const fing = s.lin([[0, '#fff6dc'], [0.25, '#ffc089'], [0.6, '#ee5a30'], [1, '#b02220']]);
  const palm = s.rad([[0, '#ffd9a0'], [0.25, '#fb8a44'], [0.6, '#d9381f'], [1, '#6e1218']], 0.34, 0.26, 0.85);
  const f1 = [[-72, -30], [-86, -108], [-62, -172], [-24, -206], [-36, -150], [-28, -104], [-2, -64]];
  const f2 = [[18, -58], [64, -44], [90, -108], [68, -174], [10, -214], [36, -152], [38, -104]];
  parts.push(el('path', { d: spline(f2, true), fill: fing }));
  parts.push(el('path', { d: spline(f1, true), fill: fing }));
  // crushing teeth on the inner edges
  for (let i = 0; i < 4; i++) {
    parts.push(el('circle', { cx: -25 - Math.sin(i * 0.9) * 4, cy: -96 - i * 22, r: 5.5 - i * 0.7, fill: '#fff3dc' }));
    parts.push(el('circle', { cx: 34 - Math.sin(i * 0.9) * 3, cy: -100 - i * 23, r: 5 - i * 0.6, fill: '#fff3dc' }));
  }
  parts.push(el('path', { d: spline([[-50, 78], [-84, 14], [-74, -48], [-32, -82], [22, -76], [66, -44], [80, 16], [52, 76], [0, 94]], true), fill: palm }));
  parts.push(el('ellipse', { cx: 22, cy: 50, rx: 60, ry: 40, fill: '#5a0c18', opacity: 0.45, filter: 'url(#glow8)' }));
  // hinge
  parts.push(el('circle', { cx: 46, cy: -56, r: 13, fill: '#ffb380' }));
  parts.push(el('circle', { cx: 46, cy: -56, r: 5, fill: '#7a1418' }));
  parts.push(el('path', { d: 'M-2 -66Q14 -40 46 -42', fill: 'none', stroke: '#6a0f18', 'stroke-width': 4, opacity: 0.6 }));
  // knobs toward the outer edge
  for (let i = 0; i < 16; i++) {
    const a = r.range(1.6, 4.6), d = r.range(26, 66), x = Math.cos(a) * d - 2, y = Math.sin(a) * d * 1.05 + 4, rr = r.range(3, 6.5);
    parts.push(el('circle', { cx: x + 1, cy: y + 2, r: rr, fill: '#5a0c16', opacity: 0.45 }));
    parts.push(el('circle', { cx: x, cy: y, r: rr * 0.8, fill: '#ffc896', opacity: 0.75 }));
  }
  parts.push(el('path', { d: spline([[-72, 10], [-66, -40], [-36, -72]]), fill: 'none', stroke: '#fff3d6', 'stroke-width': 5, opacity: 0.6, 'stroke-linecap': 'round' }));
  parts.push(el('path', { d: spline([[-76, -60], [-78, -120], [-56, -168]]), fill: 'none', stroke: '#ffffff', 'stroke-width': 4, opacity: 0.55, 'stroke-linecap': 'round' }));
  return parts;
}

/** A branching coral, as round-tipped ribbons pushed onto `parts`. */
function coral(parts, r, x, y, a, len, w, depth) {
  const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
  parts.push(el('path', { d: ribbon([[x, y], [(x + x2) / 2 + r.range(-4, 4), (y + y2) / 2 + r.range(-3, 3)], [x2, y2]], w, w * 0.74) }));
  parts.push(el('circle', { cx: x2, cy: y2, r: w * 0.37 }));
  if (depth > 0) {
    const n = r() < 0.35 ? 3 : 2;
    for (let i = 0; i < n; i++) coral(parts, r, x2, y2, a + (i - (n - 1) / 2) * r.range(0.55, 0.9) + r.range(-0.12, 0.12), len * r.range(0.62, 0.84), w * 0.74, depth - 1);
  }
}

/** A barnacle: a little ridged volcano. */
function barnacle(s, x, y, k, rot = 0) {
  return g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
    el('path', { d: `M${-k} ${k * 0.3}Q${-k * 0.9} ${-k * 0.5} ${-k * 0.42} ${-k * 0.9}L${k * 0.42} ${-k * 0.9}Q${k * 0.9} ${-k * 0.5} ${k} ${k * 0.3}Q0 ${k * 0.62} ${-k} ${k * 0.3}Z`, fill: s.lin([[0, '#fffaf0'], [0.5, '#d9cdb8'], [1, '#8a7a78']], 0, 0, 1, 0.6), stroke: '#5a4a50', 'stroke-width': 1.2, 'stroke-linejoin': 'round' }),
    el('path', { d: `M${-k * 0.55} ${k * 0.36}L${-k * 0.22} ${-k * 0.9}M0 ${k * 0.44}V${-k * 0.9}M${k * 0.55} ${k * 0.36}L${k * 0.22} ${-k * 0.9}`, stroke: '#6a5a5c', 'stroke-width': 1.3, opacity: 0.6, fill: 'none' }),
    el('ellipse', { cx: 0, cy: -k * 0.9, rx: k * 0.42, ry: k * 0.18, fill: '#1e1216' }),
    el('path', { d: `M${-k * 0.42} ${-k * 0.9}A${k * 0.42} ${k * 0.18} 0 0 1 ${k * 0.42} ${-k * 0.9}`, fill: 'none', stroke: '#ffffff', 'stroke-width': 1.4, opacity: 0.8 }),
  ]);
}
