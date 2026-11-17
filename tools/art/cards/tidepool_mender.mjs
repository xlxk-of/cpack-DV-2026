// TIDEPOOL MENDER (common, healer) — a gentle frilled thing, half sea-slug, half axolotl, basking in a sunlit pool.
import { el, g, spline, ribbon, sample, poly, glint, blob } from '../lib.mjs';

export function build(s) {
  const r = s.r;

  // ---- 0: warm shallow water, the sun straight through it
  s.backdrop(s.lin([[0, '#fffbd6'], [0.09, '#ecf8a4'], [0.26, '#8fdc8c'], [0.5, '#35ab84'], [0.78, '#1c7c70'], [1, '#125c5a']]));
  s.add(0, el('ellipse', { cx: 540, cy: -30, rx: 720, ry: 300, fill: s.rad([[0, '#ffffff', 1], [0.45, '#fff9c4', 0.65], [1, '#f2f7a8', 0]]) }));
  // ripples on the underside of the surface
  const rip = [];
  for (let i = 0; i < 30; i++) {
    const y = 10 + i * 4.2 + r.range(-3, 3), x = r.range(-200, 900), w = r.range(160, 520);
    rip.push(el('path', { d: `M${x} ${y}q${w * 0.25} ${-r.range(4, 10)} ${w * 0.5} 0t${w * 0.5} 0`, fill: 'none', stroke: i % 3 ? '#ffffff' : '#5fc08a', 'stroke-width': r.range(2, 7), opacity: r.range(0.25, 0.6), 'stroke-linecap': 'round' }));
  }
  s.add(0, g({ filter: 'url(#glow4)' }, rip));
  s.rays({ x: 540, y: -240, angle: 92, spread: 80, n: 12, color: '#fffbc8', opacity: 0.42, width: 110, len: 1400, blur: 12 });
  s.rays({ x: 500, y: -240, angle: 90, spread: 56, n: 7, color: '#ffffff', opacity: 0.24, width: 36, len: 1300, blur: 5 });
  s.add(0, el('ellipse', { cx: 470, cy: 430, rx: 420, ry: 330, fill: s.rad([[0, '#f0ffa8', 0.5], [0.5, '#c8f08a', 0.2], [1, '#c8f08a', 0]]) }));
  s.fog({ color: '#ffffff', opacity: 0.1, freq: 0.006 });
  s.motes({ n: 60, rmin: 0.6, rmax: 2.2, color: '#fffde0', opacity: 0.6, glow: false, layer: 0 });
  s.vignette({ strength: 0.5, color: '#06302f', cy: 0.44, r: 0.82 });
  s.grain({ opacity: 0.14 });

  // ---- 1: the pool's far wall of boulders, its sandy floor, weed
  const far = [], farLit = [];
  for (const [x, y, rx, ry] of [[40, 430, 190, 250], [190, 560, 170, 170], [985, 400, 190, 270], [860, 570, 180, 170], [330, 650, 130, 90], [700, 660, 140, 90]]) {
    const d = blob(x, y, rx, ry, r, 9, 0.14);
    far.push(el('path', { d, fill: s.lin([[0, '#b8de84'], [0.18, '#62ae7c'], [0.6, '#2c7f6e'], [1, '#1a6460']]) }));
    farLit.push(el('ellipse', { cx: x + rx * 0.1, cy: y - ry * 0.86, rx: rx * 0.6, ry: ry * 0.12, fill: '#fffbc8' }));
    far.push(el('ellipse', { cx: x + rx * 0.25, cy: y + ry * 0.2, rx: rx * 0.7, ry: ry * 0.6, fill: '#0f5450', opacity: 0.35, filter: 'url(#glow16)' }));
  }
  s.add(1, g({ filter: 'url(#glow2)' }, far));
  s.add(1, g({ opacity: 0.5, filter: 'url(#glow8)' }, farLit));
  // weed growing between them
  const weed = [];
  for (let i = 0; i < 44; i++) {
    const left = i % 2, x = left ? r.range(-10, 330) : r.range(700, 1034), y = 770 + r.range(-20, 20), h = r.range(100, 300), b = r.range(-60, 60);
    weed.push(el('path', { d: ribbon([[x, y], [x + b * 0.2, y - h * 0.5], [x + b, y - h]], r.range(10, 20), 2), fill: r.pick(['#2f8a62', '#48a56c', '#237a62', '#6cbc68', '#a4d870']) }));
  }
  s.add(1, g({ opacity: 0.9 }, weed));
  // sand
  const sandTop = [];
  for (let x = -40; x <= 1064; x += 24) sandTop.push([x, 752 + Math.sin(x * 0.011 + 1) * 14 + Math.sin(x * 0.031) * 5]);
  const sandD = poly([...sandTop, [1064, 1064], [-40, 1064]], true);
  s.add(1, el('path', { d: sandD, fill: s.lin([[0, '#fbf3b8'], [0.25, '#e2e6a4'], [0.7, '#8fc494'], [1, '#4f9a84']], 0, 740, 0, 1024, true) }));
  caustics(s, { layer: 1, y0: 730, y1: 1024, color: '#fffff0', opacity: 0.8, freq: '0.007 0.02', seed: 5, clip: s.clip(el('path', { d: sandD })) });
  const peb = [];
  for (let i = 0; i < 40; i++) {
    const x = r.range(0, 1024), y = r.range(770, 1010), rr = r.range(2.5, 8);
    peb.push(el('ellipse', { cx: x, cy: y + rr * 0.5, rx: rr * 1.3, ry: rr * 0.5, fill: '#2f7a6a', opacity: 0.35 }));
    peb.push(el('ellipse', { cx: x, cy: y, rx: rr * 1.2, ry: rr * 0.75, fill: r.pick(['#fff6cc', '#d9d49a', '#a8c8a0', '#c4dcae']), opacity: 0.85 }));
  }
  s.add(1, g({}, peb));
  // anemones dotted on the sand
  const an = [];
  for (const [x, y, k, c] of [[130, 810, 1.1, '#ffd36a'], [205, 842, 0.7, '#ff9f7a'], [905, 816, 1.2, '#ffe07a'], [860, 856, 0.7, '#ff9f7a']]) an.push(anemone(r, x, y, 26 * k, c));
  s.add(1, g({}, an));

  // ---- 2: the mender on its stone
  const sub = [];
  sub.push(el('ellipse', { cx: 470, cy: 440, rx: 250, ry: 210, fill: '#f6ffb0', opacity: 0.3, filter: 'url(#glow64)' }));
  // the stone
  sub.push(el('ellipse', { cx: 540, cy: 836, rx: 340, ry: 34, fill: '#0f4a44', opacity: 0.55, filter: 'url(#glow16)' }));
  const stone = spline([[232, 804], [246, 716], [318, 660], [430, 632], [560, 626], [690, 638], [784, 680], [832, 744], [840, 808], [704, 840], [520, 850], [340, 842]], true);
  sub.push(el('path', { d: stone, fill: s.lin([[0, '#dbe88c'], [0.14, '#8fbf62'], [0.45, '#4b8c5e'], [0.8, '#2a6254'], [1, '#1c4c4a']], 0, 626, 0, 850, true) }));
  const stIn = [];
  for (let i = 0; i < 26; i++) {
    const x = r.range(240, 830), y = r.range(650, 840), rr = r.range(18, 50);
    stIn.push(el('path', { d: blob(x, y, rr * 1.4, rr * 0.7, r, 7, 0.3), fill: r.pick(['#c9e07a', '#3f8a5a', '#1f5a50', '#9ccc66', '#2a6a56']), opacity: r.range(0.2, 0.45) }));
  }
  const stTex = g({ filter: 'url(#glow4)' }, stIn.splice(0));
  stIn.push(stTex);
  for (let i = 0; i < 6; i++) {
    const x = r.range(280, 800), y = r.range(690, 760), n = r.range(-40, 40);
    stIn.push(el('path', { d: spline([[x, y], [x + n * 0.5, y + 34], [x + n, y + 70], [x + n * 0.4, y + 110]]), fill: 'none', stroke: '#123c3c', 'stroke-width': r.range(2, 4.5), opacity: 0.45, 'stroke-linecap': 'round' }));
  }
  stIn.push(el('ellipse', { cx: 500, cy: 634, rx: 300, ry: 30, fill: '#fffbd0', opacity: 0.6, filter: 'url(#glow16)' }));
  stIn.push(el('ellipse', { cx: 760, cy: 800, rx: 200, ry: 90, fill: '#0c3836', opacity: 0.55, filter: 'url(#glow32)' }));
  stIn.push(el('ellipse', { cx: 570, cy: 668, rx: 230, ry: 26, fill: '#123c34', opacity: 0.6, filter: 'url(#glow8)' }));
  sub.push(g({ 'clip-path': s.clip(el('path', { d: stone })) }, stIn));
  sub.push(el('path', { d: spline([[318, 660], [430, 632], [560, 626], [690, 638], [784, 680]]), fill: 'none', stroke: '#fffde0', 'stroke-width': 4, opacity: 0.75, 'stroke-linecap': 'round' }));
  // moss tufts and little anemones on the stone
  const tuft = [];
  for (let i = 0; i < 46; i++) {
    const x = r.range(250, 820), y = 640 + Math.pow(Math.abs(x - 540) / 300, 2) * 90 + r.range(0, 60), h = r.range(14, 44), b = r.range(-14, 14);
    tuft.push(el('path', { d: ribbon([[x, y + 6], [x + b * 0.4, y - h * 0.5], [x + b, y - h]], r.range(5, 9), 1.2), fill: r.pick(['#c6e670', '#7cc46a', '#4fa868']) }));
  }
  sub.push(g({}, tuft));
  sub.push(anemone(r, 780, 716, 24, '#ffd76a'), anemone(r, 286, 716, 18, '#ffb07a'));

  const cr = []; // the creature
  const HX = 410, HY = 440;
  const frillFill = s.rad([[0.3, '#49c98a'], [0.55, '#a6e86a'], [0.8, '#ffe76a'], [1, '#fffbd0']], HX + 10, HY - 10, 290, true);
  // tail fin (behind the body)
  const spine = [[440, 458], [506, 506], [590, 542], [676, 544], [752, 512], [800, 446], [800, 368], [766, 318], [722, 310]];
  const bodyW = (t) => (t < 0.42 ? 152 + 14 * Math.sin(t * 7) : 166 * Math.pow((1 - t) / 0.58, 1.15) + 9);
  const finD = ribbon(spine.slice(2), 1, 1, (t) => 40 + 150 * Math.sin(Math.PI * Math.pow(t, 0.8)) * (1 - 0.35 * t), 14);
  cr.push(el('path', { d: finD, fill: s.lin([[0, '#fff6a8', 0.85], [0.45, '#b6ec7a', 0.7], [1, '#4fc592', 0.55]], 820, 300, 600, 560, true) }));
  const finRays = [];
  const sp = sample(spine.slice(2), 8);
  for (let i = 4; i < sp.length - 1; i += 2) {
    const a = sp[i - 1], b = sp[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), t = i / sp.length, h = (20 + 75 * Math.sin(Math.PI * Math.pow(t, 0.8)) * (1 - 0.35 * t)) * 0.92;
    finRays.push(`M${sp[i][0] + dy / l * h - dx / l * 10} ${sp[i][1] - dx / l * h - dy / l * 10}L${sp[i][0] - dy / l * h - dx / l * 10} ${sp[i][1] + dx / l * h - dy / l * 10}`);
  }
  cr.push(el('path', { d: finRays.join(''), fill: 'none', stroke: '#ffffe0', 'stroke-width': 1.6, opacity: 0.3 }));
  cr.push(el('path', { d: finD, fill: 'none', stroke: '#fffde0', 'stroke-width': 2.4, opacity: 0.8 }));

  // back legs and the far foreleg
  const skin = s.lin([[0, '#f4ffd8'], [0.4, '#b9eeb0'], [1, '#56b592']]);
  cr.push(limb([640, 566], [694, 604], [684, 638], 42, skin, 1));

  // frills behind the head
  const fr = { stalks: [], fil: [], tips: [] };
  for (const [b, t, bend] of [
    [[322, 404], [230, 262], [-26, 4]], [[308, 432], [176, 372], [-8, -22]], [[318, 462], [196, 490], [-4, -20]],
    [[504, 398], [596, 248], [28, 6]], [[520, 424], [656, 344], [12, -24]], [[516, 452], [648, 452], [10, -22]],
  ]) frill(r, b, t, bend, fr);
  cr.push(g({ fill: '#f6ff9a', opacity: 0.75, filter: 'url(#glow16)' }, fr.fil));
  cr.push(g({ fill: frillFill }, [...fr.stalks, ...fr.fil]));
  cr.push(g({ fill: '#fffff0' }, fr.tips));

  // body
  const bodyD = ribbon(spine, 1, 1, bodyW, 14);
  const bodyG = [];
  bodyG.push(el('path', { d: bodyD, fill: s.lin([[0, '#f9ffd6'], [0.3, '#cdf3b4'], [0.62, '#86d6a2'], [1, '#3f9f88']], 0, 300, 0, 640, true) }));
  const bIn = [];
  bIn.push(el('path', { d: ribbon(spine.map((p) => [p[0] - 6, p[1] + 46]), 1, 1, (t) => bodyW(t) * 0.55, 14), fill: '#fbffe2', opacity: 0.55, filter: 'url(#glow8)' }));
  bIn.push(el('path', { d: ribbon(spine.map((p) => [p[0] + 4, p[1] + 78]), 1, 1, (t) => bodyW(t) * 0.5, 14), fill: '#1f7a6a', opacity: 0.4, filter: 'url(#glow16)' }));
  bIn.push(el('ellipse', { cx: 462, cy: 528, rx: 120, ry: 52, fill: '#1f7a6a', opacity: 0.5, filter: 'url(#glow8)' }));
  // golden freckles down the back
  const ss = sample(spine, 6);
  for (let i = 4; i < ss.length - 5; i += 2) {
    const t = i / ss.length, w = bodyW(t);
    for (let k = 0; k < 2; k++) {
      if (r() < 0.25) continue;
      const x = ss[i][0] + r.range(-10, 10), y = ss[i][1] - w * r.range(0.04, 0.36), rr = r.range(2, 7.5) * (1 - t * 0.5);
      bIn.push(el('circle', { cx: x, cy: y, r: rr * 2.2, fill: '#fff3a0', opacity: 0.35 }));
      bIn.push(el('circle', { cx: x, cy: y, r: rr, fill: '#ffe46a', opacity: 0.95 }));
    }
  }
  bodyG.push(g({ 'clip-path': s.clip(el('path', { d: bodyD })) }, bIn));
  // leaf-like lobes standing along the back, each tipped with light
  const lobes = [], lobeTips = [];
  for (let i = 5; i < ss.length - 8; i += 3) {
    const a = ss[i - 1], b = ss[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), t = i / ss.length, w = bodyW(t) * 0.5;
    const nx = dy / l, ny = -dx / l, base = [ss[i][0] + nx * (w - 10), ss[i][1] + ny * (w - 10)], L = 62 * (1 - t * 0.55) * r.range(0.85, 1.15);
    const tip = [base[0] + nx * L + dx / l * L * 0.45, base[1] + ny * L + dy / l * L * 0.45];
    lobes.push(el('path', { d: ribbon([base, [(base[0] + tip[0]) / 2 + nx * 6, (base[1] + tip[1]) / 2 + ny * 6], tip], 1, 1, (u) => 30 * (1 - t * 0.4) * Math.sin(Math.PI * Math.pow(u, 0.7)) + 2) }));
    lobeTips.push(tip);
  }
  cr.push(g({ fill: s.lin([[0, '#fffbb0'], [0.5, '#b4ec7c'], [1, '#52c592']]) }, lobes));
  for (const p of lobeTips) cr.push(el('circle', { cx: p[0], cy: p[1], r: 13, fill: '#fff9a0', opacity: 0.7, filter: 'url(#glow4)' }), el('circle', { cx: p[0], cy: p[1], r: 4.5, fill: '#fffff0' }));

  // head
  const headD = spline([[HX - 128, HY + 6], [HX - 112, HY - 62], [HX - 50, HY - 98], [HX + 30, HY - 100], [HX + 100, HY - 66], [HX + 128, HY], [HX + 104, HY + 62], [HX + 30, HY + 96], [HX - 50, HY + 94], [HX - 108, HY + 60]], true);
  bodyG.push(el('path', { d: headD, fill: s.rad([[0, '#ffffe6'], [0.35, '#dcf7c0'], [0.7, '#9adfaa'], [1, '#52b392']], HX - 30, HY - 50, 190, true) }));
  cr.push(g({ filter: s.emboss({ color: '#fffbe0', az: 255, elev: 58, depth: 12, k: 0.45, exp: 20, blur: 12 }) }, bodyG));

  // near foreleg, planted
  cr.push(limb([486, 548], [478, 598], [452, 626], 44, skin, -1));
  // the raised hand, cupping a mote of healing light
  cr.push(limb([372, 530], [322, 562], [290, 546], 38, skin, -1, true));

  // face
  const face = [];
  face.push(el('ellipse', { cx: HX - 74, cy: HY + 30, rx: 24, ry: 13, fill: '#ffae8a', opacity: 0.55, filter: 'url(#glow4)' }));
  face.push(el('ellipse', { cx: HX + 78, cy: HY + 24, rx: 24, ry: 13, fill: '#ffae8a', opacity: 0.55, filter: 'url(#glow4)' }));
  for (const [ex, ey] of [[HX - 62, HY - 14], [HX + 60, HY - 20]]) {
    face.push(el('ellipse', { cx: ex, cy: ey, rx: 25, ry: 27, fill: '#2f7a66', opacity: 0.5 }));
    face.push(el('ellipse', { cx: ex, cy: ey, rx: 21.5, ry: 23.5, fill: s.rad([[0, '#2a5a44'], [0.6, '#0e2a22'], [1, '#04120e']], 0.5, 0.7, 0.7) }));
    face.push(el('path', { d: `M${ex - 14} ${ey + 10}Q${ex} ${ey + 24} ${ex + 14} ${ey + 10}`, fill: 'none', stroke: '#9cf0a8', 'stroke-width': 3, opacity: 0.6, 'stroke-linecap': 'round' }));
    face.push(el('ellipse', { cx: ex - 7, cy: ey - 9, rx: 8, ry: 9, fill: '#fff' }));
    face.push(el('circle', { cx: ex + 8, cy: ey + 6, r: 3.6, fill: '#fff', opacity: 0.9 }));
    face.push(el('path', { d: `M${ex - 24} ${ey - 30}Q${ex} ${ey - 40} ${ex + 24} ${ey - 30}`, fill: 'none', stroke: '#3f9a7a', 'stroke-width': 3.5, opacity: 0.6, 'stroke-linecap': 'round' }));
  }
  face.push(el('path', { d: `M${HX - 46} ${HY + 30}Q${HX - 2} ${HY + 62} ${HX + 44} ${HY + 26}`, fill: 'none', stroke: '#1f6a58', 'stroke-width': 5, 'stroke-linecap': 'round' }));
  face.push(el('path', { d: `M${HX - 52} ${HY + 24}q-6 6 -2 12M${HX + 50} ${HY + 20}q6 6 2 12`, fill: 'none', stroke: '#1f6a58', 'stroke-width': 3.5, 'stroke-linecap': 'round', opacity: 0.8 }));
  face.push(el('circle', { cx: HX - 12, cy: HY + 8, r: 2.6, fill: '#2f7a66' }), el('circle', { cx: HX + 10, cy: HY + 7, r: 2.6, fill: '#2f7a66' }));
  for (let i = 0; i < 9; i++) {
    const x = HX + r.range(-60, 60), y = HY - r.range(50, 88), rr = r.range(2, 4.6);
    face.push(el('circle', { cx: x, cy: y, r: rr * 2, fill: '#fff3a0', opacity: 0.35 }), el('circle', { cx: x, cy: y, r: rr, fill: '#ffe46a' }));
  }
  cr.push(g({}, face));
  // sun on the crown
  cr.push(el('path', { d: spline([[HX - 112, HY - 62], [HX - 50, HY - 98], [HX + 30, HY - 100], [HX + 100, HY - 66]]), fill: 'none', stroke: '#ffffff', 'stroke-width': 4, opacity: 0.8, 'stroke-linecap': 'round' }));
  // the light in its hand
  cr.push(el('circle', { cx: 282, cy: 512, r: 60, fill: '#f4ff9a', opacity: 0.55, filter: 'url(#glow16)' }));
  cr.push(el('circle', { cx: 282, cy: 512, r: 22, fill: '#fffbc0', filter: 'url(#glow4)' }));
  cr.push(el('circle', { cx: 282, cy: 512, r: 12, fill: '#ffffff' }));
    sub.push(g({ transform: 'translate(22 12)' }, cr));
  s.add(2, g({}, sub));

  // ---- 3: healing motes rising, near weed, bubbles
  const nearW = [];
  for (let i = 0; i < 16; i++) {
    const left = i % 2, x = left ? r.range(-30, 150) : r.range(880, 1054), h = r.range(260, 520), b = r.range(-60, 60) + (left ? 50 : -50);
    nearW.push(el('path', { d: ribbon([[x, 1050], [x + b * 0.15, 1050 - h * 0.5], [x + b, 1050 - h]], r.range(26, 44), 3), fill: s.lin([[0, '#9fe07a'], [0.5, '#2f8a5a'], [1, '#0f4a40']]) }));
  }
  s.add(3, g({ filter: 'url(#glow4)', opacity: 0.95 }, nearW));
  const rise = [];
  for (let i = 0; i < 46; i++) {
    const t = r(), x = 304 + Math.sin(t * 9 + i) * (30 + 150 * t) + t * 120, y = 524 - t * 450 + r.range(-20, 20), rr = r.range(2, 7) * (1 - t * 0.5);
    const c = r.pick(['#fffbc0', '#e4ff8a', '#ffffff', '#ffe46a']);
    rise.push(el('circle', { cx: x, cy: y, r: rr * 3.2, fill: c, opacity: 0.22 }), el('circle', { cx: x, cy: y, r: rr, fill: c, opacity: 0.95 }));
  }
  s.add(3, g({}, rise));
  s.bubbles({ n: 12, y0: 80, y1: 760, rmin: 3, rmax: 13, color: '#ffffff', opacity: 0.7 });
  s.motes({ n: 34, rmin: 1, rmax: 3.6, colors: ['#ffffff', '#fffbc0', '#d9ff9a'], opacity: 0.7 });
  s.add(3, glint(304, 524, 30, '#ffffff', 0.95), glint(380, 300, 16, '#fffbd0', 0.85), glint(468, 196, 12, '#ffffff', 0.8), glint(250, 396, 10, '#fffbd0', 0.8));
}

/** A feathery gill stalk from `b` to `t`. */
function frill(r, b, t, bend, out) {
  const pts = [b, [(b[0] + t[0]) / 2 + bend[0], (b[1] + t[1]) / 2 + bend[1]], t];
  out.stalks.push(el('path', { d: ribbon(pts, 26, 5) }));
  const sm = sample(pts, 9);
  for (let i = 3; i < sm.length; i++) {
    const u = i / (sm.length - 1), a = sm[i - 1], c = sm[Math.min(sm.length - 1, i + 1)];
    let dx = c[0] - a[0], dy = c[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    for (const sd of [-1, 1]) {
      const L = (20 + 30 * Math.sin(Math.PI * Math.min(1, u * 1.05))) * r.range(0.8, 1.2), p = sm[i];
      const e = [p[0] + (-dy * sd * 0.8 + dx * 0.6) * L, p[1] + (dx * sd * 0.8 + dy * 0.6) * L];
      const m = [p[0] + (-dy * sd * 0.55 + dx * 0.12) * L, p[1] + (dx * sd * 0.55 + dy * 0.12) * L];
      out.fil.push(el('path', { d: ribbon([p, m, e], 8, 2.4) }));
      out.tips.push(el('circle', { cx: e[0], cy: e[1], r: 2.6 }));
    }
  }
  out.tips.push(el('circle', { cx: t[0], cy: t[1], r: 4 }));
}

/** A stubby limb with a little splayed hand. */
function limb(a, b, c, w, fill, side, up = false) {
  const parts = [el('path', { d: ribbon([a, b, c], w, w * 0.62), fill })];
  const ang = Math.atan2(c[1] - b[1], c[0] - b[0]);
  for (let i = 0; i < 4; i++) {
    const t = ang + (i - 1.5) * 0.42, L = w * 0.62;
    parts.push(el('path', { d: ribbon([c, [c[0] + Math.cos(t) * L * 0.6, c[1] + Math.sin(t) * L * 0.6], [c[0] + Math.cos(t) * L, c[1] + Math.sin(t) * L - (up ? 6 : 0)]], w * 0.3, w * 0.2), fill }));
    parts.push(el('circle', { cx: c[0] + Math.cos(t) * L, cy: c[1] + Math.sin(t) * L - (up ? 6 : 0), r: w * 0.11, fill: '#f4ffd8' }));
  }
  parts.push(el('circle', { cx: c[0], cy: c[1], r: w * 0.34, fill }));
  return g({}, parts);
}

/** A small anemone: a stub and a crown of soft arms. */
function anemone(r, x, y, k, c) {
  const parts = [el('path', { d: `M${x - k * 0.5} ${y + k * 0.7}Q${x - k * 0.6} ${y} ${x - k * 0.4} ${y - k * 0.2}L${x + k * 0.4} ${y - k * 0.2}Q${x + k * 0.6} ${y} ${x + k * 0.5} ${y + k * 0.7}Z`, fill: '#d9785a' })];
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI * (0.08 + 0.84 * (i / 10)), L = k * r.range(0.8, 1.2);
    parts.push(el('path', { d: ribbon([[x + Math.cos(a) * k * 0.3, y - k * 0.2], [x + Math.cos(a) * L * 0.6 + r.range(-3, 3), y - k * 0.2 + Math.sin(a) * L * 0.7], [x + Math.cos(a) * L, y - k * 0.2 + Math.sin(a) * L]], k * 0.22, k * 0.1), fill: c }));
    parts.push(el('circle', { cx: x + Math.cos(a) * L, cy: y - k * 0.2 + Math.sin(a) * L, r: k * 0.09, fill: '#fffbe0' }));
  }
  return g({}, parts);
}

/** A net of light, as the sun through ripples lays on sand. */
function caustics(s, { layer, y0, y1, color = '#ffffff', opacity = 0.5, freq = '0.01 0.03', seed = 3, clip }) {
  const id = s.uid('ca'), c = [1, 3, 5].map((i) => (parseInt(color.slice(i, i + 2), 16) / 255).toFixed(3));
  s.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="turbulence" baseFrequency="${freq}" numOctaves="2" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 ${c[0]}  0 0 0 0 ${c[1]}  0 0 0 0 ${c[2]}  -9 0 0 0 1.15"/><feGaussianBlur stdDeviation="1.4"/></filter>`);
  s.add(layer, g({ 'clip-path': clip, opacity }, el('rect', { x: 0, y: y0, width: s.w, height: y1 - y0, filter: `url(#${id})` })));
}
