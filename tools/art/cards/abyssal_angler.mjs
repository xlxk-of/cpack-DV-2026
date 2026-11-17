// ABYSSAL ANGLER (rare) — a huge anglerfish looming out of the black, its own lure lighting its needle teeth.
import { el, g, spline, ribbon, sample, poly, blob, orb, glint } from '../lib.mjs';

export function build(s) {
  const r = s.r;
  const LX = 246, LY = 300; // the lure

  // ---- 0: the black water
  s.backdrop(s.lin([[0, '#06202f'], [0.3, '#051224'], [0.7, '#040714'], [1, '#020208']]));
  s.add(0, el('ellipse', { cx: 600, cy: 520, rx: 560, ry: 420, fill: s.rad([[0, '#6a0f24', 0.5], [0.55, '#3a0718', 0.25], [1, '#3a0718', 0]]) }));
  mist(s, { color: '#8a1630', opacity: 0.3, freq: 0.006, cx: 600, cy: 640, rx: 760, ry: 460 });
  mist(s, { color: '#1a5a78', opacity: 0.24, freq: 0.005, cx: 430, cy: 240, rx: 800, ry: 460 });
  s.add(0, el('ellipse', { cx: LX + 20, cy: LY + 20, rx: 420, ry: 400, fill: s.rad([[0, '#39e6ff', 0.42], [0.35, '#1691b8', 0.2], [1, '#0b5a80', 0]]) }));
  s.motes({ n: 120, rmin: 0.5, rmax: 2, color: '#8fd6e6', opacity: 0.4, glow: false, layer: 0 });
  s.vignette({ strength: 0.85, cx: 0.42, cy: 0.42, r: 0.8 });
  s.grain({ opacity: 0.22 });

  // ---- 1: far trench walls, vents, and other lures out in the dark
  s.ridge({ y: 870, amp: 170, detail: 1, fill: s.lin([[0, '#0b1c30'], [1, '#04060f']]), layer: 1, opacity: 0.8 });
  // black smokers with a dull red throat
  const ventRough = s.rough(14, 0.025, 7);
  for (const [vx, vy, vh] of [[872, 900, 230], [958, 930, 150], [48, 930, 170]]) {
    s.add(1, el('path', { d: ribbon([[vx + 10, vy + 220], [vx - 8, vy], [vx + 12, vy - vh * 0.5], [vx, vy - vh]], 150, 26, (t) => 1 + 0.25 * Math.sin(t * 19 + vx)), fill: s.lin([[0, '#2a0c14'], [0.25, '#0c0a14'], [1, '#04050c']]), filter: ventRough }));
    s.add(1, el('ellipse', { cx: vx, cy: vy - vh + 2, rx: 22, ry: 9, fill: '#ff4a30', opacity: 0.42, filter: 'url(#glow8)' }));
    s.add(1, el('path', { d: ribbon([[vx, vy - vh], [vx + 26, vy - vh - 90], [vx - 14, vy - vh - 190], [vx + 40, vy - vh - 300]], 20, 120), fill: s.lin([[0, '#6a1822', 0.4], [1, '#200810', 0]], 0, 1, 0, 0), filter: 'url(#glow16)' }));
  }
  // distant anglers: only their lures and a hint of a jaw
  for (const [x, y, k] of [[850, 190, 1], [690, 110, 0.6], [108, 690, 0.8], [935, 560, 0.7]]) {
    s.add(1, orb(x, y, 4.5 * k, '#39d8f0', '#dffcff', 0.75));
  }
  s.ridge({ y: 990, amp: 60, detail: 1, fill: '#020308', layer: 1 });

  // ---- 2: the angler
  const outer = sample([[262, 452], [292, 376], [364, 302], [464, 254], [585, 238], [692, 264], [775, 324], [838, 396], [884, 446], [892, 492], [852, 552], [782, 626], [692, 694], [582, 738], [462, 752], [352, 736], [272, 694], [226, 644], [212, 596]], 12);
  const upLip = sample([[262, 452], [330, 474], [430, 488], [505, 514], [552, 552]], 10);
  const loLip = sample([[552, 552], [504, 622], [412, 664], [312, 664], [212, 596]], 10);
  const front = sample([[212, 596], [262, 560], [278, 510], [262, 452]], 8);
  const bodyD = poly(outer.concat(front), true);
  const mouthD = poly(upLip.concat(loLip.slice(1), front.slice(1)), true);
  const bodyClip = s.clip(el('path', { d: bodyD }));
  const A = [];

  // fins behind the body
  const finFill = s.lin([[0, '#1c0610'], [1, '#4a0e1e']], 0, 0, 1, 1);
  const fan = (ox, oy, a0, a1, n, len, jag) => {
    const pts = [[ox, oy]];
    for (let i = 0; i <= n; i++) {
      const a = (a0 + (a1 - a0) * (i / n)) * Math.PI / 180, L = len * (0.8 + 0.25 * Math.sin((i / n) * Math.PI)) * r.range(1 - jag, 1);
      pts.push([ox + Math.cos(a) * L, oy + Math.sin(a) * L]);
      if (i < n) { const am = a + (a1 - a0) * Math.PI / 180 / n / 2; pts.push([ox + Math.cos(am) * L * 0.74, oy + Math.sin(am) * L * 0.74]); }
    }
    const rays = [];
    for (let i = 0; i <= n; i++) { const p = pts[1 + i * 2]; rays.push(el('path', { d: `M${ox} ${oy}L${p[0]} ${p[1]}`, stroke: '#9a2a40', 'stroke-width': 2, opacity: 0.55 })); }
    return g({}, [el('path', { d: poly(pts, true), fill: finFill }), ...rays]);
  };
  A.push(fan(868, 470, -42, 44, 8, 170, 0.2)); // tail
  { // a low spiny dorsal sail
    const base = sample([[520, 246], [600, 240], [690, 264], [770, 320], [820, 376]], 6), top = [], rays = [];
    for (let i = 0; i < base.length; i += 2) {
      const t = i / (base.length - 1), L = (46 + 70 * Math.sin(Math.PI * Math.min(1, t * 1.25 + 0.1))) * r.range(0.8, 1.1), p = base[i];
      const tip = [p[0] + 26 + t * 30, p[1] - L * (1 - t * 0.45)];
      top.push(tip); if (i + 2 < base.length) top.push([(p[0] + base[i + 2][0]) / 2 + 20, (p[1] + base[i + 2][1]) / 2 - L * 0.5]);
      rays.push(el('path', { d: `M${p[0]} ${p[1] + 6}L${tip[0]} ${tip[1]}`, stroke: '#7a1c30', 'stroke-width': 2.4, opacity: 0.8 }));
      rays.push(el('path', { d: `M${p[0] - 2} ${p[1] + 6}L${tip[0] - 2} ${tip[1]}`, stroke: '#7fe9f8', 'stroke-width': 1.2, opacity: 0.55 * (1 - t) }));
    }
    A.push(g({}, [el('path', { d: poly(base.concat(top.reverse()), true), fill: s.lin([[0, '#7a182e'], [0.6, '#3a0a18'], [1, '#14040a']]), opacity: 0.92 }), ...rays]));
  }

  // the body
  A.push(el('path', { d: bodyD, fill: s.rad([[0, '#5c0f20'], [0.3, '#3a0916'], [0.65, '#19050c'], [1, '#080206']], 360, 400, 560, true), filter: s.emboss({ color: '#49e2ff', az: 215, elev: 40, depth: 14, k: 1.25, exp: 38, blur: 10 }) }));
  const inn = [];
  // heavy shadow under the belly and toward the tail
  inn.push(el('ellipse', { cx: 600, cy: 760, rx: 420, ry: 150, fill: '#050208', opacity: 0.85, filter: 'url(#glow32)' }));
  inn.push(el('ellipse', { cx: 880, cy: 470, rx: 200, ry: 260, fill: '#050208', opacity: 0.75, filter: 'url(#glow32)' }));
  // mottled hide
  const blot = [];
  for (let i = 0; i < 26; i++) blot.push(el('path', { d: blob(r.range(300, 860), r.range(260, 730), r.range(20, 60), r.range(14, 40), r, 7, 0.3), fill: i % 3 ? '#0a0206' : '#8a1c34', opacity: i % 3 ? 0.4 : 0.22 }));
  inn.push(g({ filter: 'url(#glow8)' }, blot));
  // a dull line of photophores down the flank
  for (let i = 0; i < 9; i++) {
    const x = 560 + i * 36, y = 452 + Math.sin(i * 0.5) * 16 + i * 2;
    inn.push(el('circle', { cx: x, cy: y, r: 9, fill: '#ff5a3a', opacity: 0.3, filter: 'url(#glow4)' }), el('circle', { cx: x, cy: y, r: 3.2, fill: '#ffb08a', opacity: 0.85 }));
  }
  // warty hide: dark pits with a lit lip toward the lure
  for (let i = 0; i < 170; i++) {
    const x = r.range(280, 880), y = r.range(240, 750), rr = 2 + 7 * Math.pow(r(), 2.4), dd = Math.hypot(x - LX, y - LY);
    const lit = Math.pow(Math.max(0, 1 - dd / 430), 1.6), ux = (LX - x) / dd, uy = (LY - y) / dd;
    inn.push(el('circle', { cx: x - ux * rr * 0.3, cy: y - uy * rr * 0.3, r: rr, fill: '#0a0206', opacity: 0.6 }));
    inn.push(el('circle', { cx: x, cy: y, r: rr * 0.8, fill: '#6a1428', opacity: 0.5 }));
    if (lit > 0.03) inn.push(el('circle', { cx: x + ux * rr * 0.4, cy: y + uy * rr * 0.4, r: rr * 0.45, fill: '#aef6ff', opacity: lit * 0.85 }));
  }
  // dull red glow from the vents under the belly
  inn.push(el('ellipse', { cx: 560, cy: 790, rx: 330, ry: 90, fill: '#ff3a2a', opacity: 0.3, filter: 'url(#glow32)' }));
  // gill folds
  for (let i = 0; i < 3; i++) {
    const x = 610 + i * 34;
    inn.push(el('path', { d: spline([[x, 400 + i * 14], [x + 40, 480], [x + 30, 560 - i * 10]]), fill: 'none', stroke: '#060104', 'stroke-width': 9 - i * 2, opacity: 0.7, 'stroke-linecap': 'round', filter: 'url(#glow2)' }));
    inn.push(el('path', { d: spline([[x - 7, 404 + i * 14], [x + 32, 480], [x + 23, 556 - i * 10]]), fill: 'none', stroke: '#8a2238', 'stroke-width': 2, opacity: 0.45 - i * 0.1, 'stroke-linecap': 'round' }));
  }
  // wet sheen on the brow and snout
  inn.push(el('path', { d: spline([[300, 400], [352, 332], [440, 282], [540, 262]]), fill: 'none', stroke: '#bffaff', 'stroke-width': 16, opacity: 0.5, 'stroke-linecap': 'round', filter: 'url(#glow8)' }));
  inn.push(el('path', { d: spline([[296, 440], [330, 452], [380, 462]]), fill: 'none', stroke: '#bffaff', 'stroke-width': 10, opacity: 0.4, 'stroke-linecap': 'round', filter: 'url(#glow8)' }));
  // the lure's light spilling over the face
  inn.push(el('circle', { cx: LX, cy: LY, r: 470, fill: s.rad([[0, '#c8fbff', 0.95], [0.16, '#4fdcf4', 0.7], [0.36, '#1a9cc4', 0.36], [0.6, '#127aa0', 0.12], [1, '#127aa0', 0]]) }));
  A.push(g({ 'clip-path': bodyClip }, inn));

  // pectoral fin, in front of the flank
  A.push(g({ opacity: 0.85 }, fan(676, 566, 14, 104, 7, 132, 0.22)));
  A.push(el('ellipse', { cx: 672, cy: 562, rx: 30, ry: 20, fill: '#2a0812', filter: 'url(#glow2)' }));

  // the mouth: a red-black cavern
  A.push(el('path', { d: mouthD, fill: s.rad([[0, '#050003'], [0.45, '#16020a'], [0.8, '#3c0716'], [1, '#5a0c20']], 540, 560, 360, true) }));
  A.push(g({ 'clip-path': s.clip(el('path', { d: mouthD })) }, [
    el('ellipse', { cx: 470, cy: 610, rx: 130, ry: 44, fill: '#7a1428', opacity: 0.55, filter: 'url(#glow8)', transform: 'rotate(-12 470 610)' }), // tongue
    el('circle', { cx: LX + 20, cy: LY + 60, r: 300, fill: s.rad([[0, '#8ff2ff', 0.4], [0.6, '#3ab8d8', 0.12], [1, '#3ab8d8', 0]]) }),
  ]));
  // gums
  A.push(el('path', { d: poly(upLip), fill: 'none', stroke: '#3a0814', 'stroke-width': 14, 'stroke-linecap': 'round' }));
  A.push(el('path', { d: poly(loLip), fill: 'none', stroke: '#3a0814', 'stroke-width': 16, 'stroke-linecap': 'round' }));
  A.push(el('path', { d: poly(upLip.slice(0, 26)), fill: 'none', stroke: '#7fe9f8', 'stroke-width': 2.5, opacity: 0.7, 'stroke-linecap': 'round' }));
  A.push(el('path', { d: poly(loLip.slice(14)), fill: 'none', stroke: '#7fe9f8', 'stroke-width': 3, opacity: 0.8, 'stroke-linecap': 'round' }));

  // needle teeth
  const toothFill = s.lin([[0, '#f4ffff'], [0.6, '#bff4fa'], [1, '#5fb6c6']], 0, 0, 0, 1);
  const tooth = (p, dx, dy, L, w, o = 1) => {
    const tx = p[0] + dx * L, ty = p[1] + dy * L, nx = -dy, ny = dx, bend = L * 0.16;
    return el('path', { d: `M${p[0] - nx * w} ${p[1] - ny * w}Q${p[0] + dx * L * 0.5 + nx * bend} ${p[1] + dy * L * 0.5 + ny * bend} ${tx} ${ty}Q${p[0] + dx * L * 0.5 + nx * (bend + w * 0.6)} ${p[1] + dy * L * 0.5 + ny * (bend + w * 0.6)} ${p[0] + nx * w} ${p[1] + ny * w}Z`, fill: toothFill, opacity: o, stroke: '#0c3a48', 'stroke-width': 0.8 });
  };
  const far = [], near = [];
  for (let i = 3; i < upLip.length - 6; i += 3) {
    const t = i / upLip.length, p = upLip[i];
    far.push(tooth([p[0] + 30, p[1] + 2], 0.1, 1, r.range(36, 70) * (1 - t * 0.5), 3.4, 0.4));
    near.push(tooth(p, r.range(0.02, 0.22), 1, r.range(70, 128) * (1 - t * 0.6) * (i % 2 ? 0.5 : 1), r.range(3.6, 5.2)));
  }
  for (let i = loLip.length - 2; i > 8; i -= 3) {
    const t = 1 - i / loLip.length, p = loLip[i], up = Math.min(1, (loLip.length - i) / 6);
    far.push(tooth([p[0] + 34, p[1] - 6], 0.12, -1, r.range(44, 86) * (1 - t * 0.5), 3.6, 0.4));
    near.push(tooth(p, r.range(0.05, 0.3), -1, r.range(96, 170) * (1 - t * 0.62) * (i % 2 ? 0.5 : 1) * (0.7 + 0.3 * up), r.range(4, 6)));
  }
  A.push(g({}, far));
  A.push(g({ filter: 'url(#bloomS)' }, near));

  // the pale eye under a heavy brow
  const ex = 432, ey = 394;
  A.push(el('ellipse', { cx: ex, cy: ey, rx: 48, ry: 42, fill: '#0c0308', opacity: 0.9, filter: 'url(#glow4)' }));
  A.push(el('circle', { cx: ex, cy: ey, r: 40, fill: '#bff6ff', opacity: 0.3, filter: 'url(#glow8)' }));
  A.push(el('circle', { cx: ex, cy: ey, r: 27, fill: s.rad([[0, '#ffffff'], [0.4, '#d8fbf8'], [0.75, '#8fd0d8'], [1, '#2f6474']], 0.4, 0.4, 0.7) }));
  A.push(el('circle', { cx: ex, cy: ey, r: 27, fill: 'none', stroke: '#04161c', 'stroke-width': 4 }));
  A.push(el('circle', { cx: ex - 8, cy: ey + 4, r: 13, fill: 'none', stroke: '#6fb0bc', 'stroke-width': 3, opacity: 0.5 }));
  A.push(el('ellipse', { cx: ex - 8, cy: ey + 4, rx: 3.2, ry: 8.5, fill: '#02080c', transform: `rotate(14 ${ex - 8} ${ey + 4})` }));
  A.push(el('ellipse', { cx: ex - 14, cy: ey - 10, rx: 7, ry: 4.4, fill: '#fff', transform: `rotate(-30 ${ex - 14} ${ey - 10})` }));
  A.push(el('circle', { cx: ex + 8, cy: ey + 12, r: 2.6, fill: '#fff', opacity: 0.7 }));
  A.push(el('path', { d: `M${ex - 56} ${ey - 12}Q${ex - 16} ${ey - 50} ${ex + 54} ${ey - 30}Q${ex + 6} ${ey - 26} ${ex - 34} ${ey - 2}Z`, fill: '#22060f' }));
  A.push(el('path', { d: `M${ex - 56} ${ey - 12}Q${ex - 16} ${ey - 50} ${ex + 54} ${ey - 30}`, fill: 'none', stroke: '#7fe9f8', 'stroke-width': 2, opacity: 0.55, 'stroke-linecap': 'round' }));
  // bony knobs over the brow and down the snout
  for (const [x, y, k] of [[388, 318, 1], [432, 296, 1.2], [482, 280, 1], [340, 362, 0.8], [312, 404, 0.7]]) {
    A.push(el('path', { d: `M${x - 10 * k} ${y + 6 * k}Q${x - 4 * k} ${y - 14 * k} ${x - 12 * k} ${y - 24 * k}Q${x + 8 * k} ${y - 12 * k} ${x + 12 * k} ${y + 4 * k}Z`, fill: '#2a0812' }));
    A.push(el('path', { d: `M${x - 10 * k} ${y + 6 * k}Q${x - 4 * k} ${y - 14 * k} ${x - 12 * k} ${y - 24 * k}`, fill: 'none', stroke: '#9ff0fc', 'stroke-width': 1.8, opacity: 0.8, 'stroke-linecap': 'round' }));
  }

  // cyan rim along everything that faces the lure
  const rimMask = s.mask(el('circle', { cx: LX, cy: LY, r: 520, fill: s.rad([[0, '#fff', 1], [0.55, '#fff', 0.7], [1, '#fff', 0]]) }));
  A.push(g({ mask: rimMask }, el('path', { d: poly(outer.slice(0, 70)), fill: 'none', stroke: '#b8fbff', 'stroke-width': 4, 'stroke-linecap': 'round', filter: 'url(#bloomS)' })));
  A.push(g({ mask: rimMask }, el('path', { d: poly(outer.slice(170)), fill: 'none', stroke: '#6fe2f4', 'stroke-width': 3.5, 'stroke-linecap': 'round', opacity: 0.8 })));

  A.push(el('path', { d: poly(outer.slice(120, 200)), fill: 'none', stroke: '#ff5a40', 'stroke-width': 3, opacity: 0.5, 'stroke-linecap': 'round', filter: 'url(#glow2)' }));
  // chin barbels trailing back
  for (let i = 0; i < 7; i++) {
    const p = outer[outer.length - 6 - i * 8], L = r.range(34, 84), ph = r.range(0, 6);
    const pts = [0, 1, 2, 3, 4].map((k) => [p[0] + k * L * 0.16 + Math.sin(k * 1.5 + ph) * 7, p[1] - 4 + k * L * 0.25]);
    A.push(el('path', { d: ribbon(pts, 6, 0.8), fill: '#2a0812' }));
    A.push(el('path', { d: spline(pts), fill: 'none', stroke: '#7fe9f8', 'stroke-width': 1, opacity: 0.45, transform: 'translate(-2 0)' }));
  }

  // the whole fish sinks back into the dark toward its tail
  const fade = s.mask(el('rect', { x: -200, y: -200, width: 1424, height: 1424, fill: s.lin([[0, '#fff'], [0.56, '#fff'], [0.78, '#666'], [1, '#111']], 0, 0, 1024, 0, true) }));
  s.add(2, g({ mask: fade }, A));

  // the lure on its stalk
  const stalk = [[452, 258], [436, 196], [372, 156], [296, 164], [252, 214], [LX, LY - 16]];
  const Lr = [];
  Lr.push(el('circle', { cx: LX, cy: LY, r: 150, fill: '#39e2ff', opacity: 0.2, filter: 'url(#glow64)' }));
  Lr.push(el('path', { d: ribbon(stalk, 20, 6), fill: s.lin([[0, '#4a0c1c'], [1, '#1c4a5c']], 452, 0, 246, 0, true) }));
  Lr.push(el('path', { d: spline(stalk), fill: 'none', stroke: s.lin([[0, '#6fe6f6', 0.1], [1, '#d8feff', 1]], 452, 0, 246, 0, true), 'stroke-width': 2.2, transform: 'translate(-3 3)' }));
  for (let i = 0; i < 7; i++) {
    const a = (0.15 + i / 6 * 0.7) * Math.PI, L = r.range(26, 60);
    const pts = [[LX + Math.cos(a) * 12, LY + Math.sin(a) * 12], [LX + Math.cos(a) * L * 0.6 + r.range(-8, 8), LY + Math.sin(a) * L * 0.6 + 8], [LX + Math.cos(a) * L + r.range(-12, 12), LY + Math.sin(a) * L + 18]];
    Lr.push(el('path', { d: spline(pts), fill: 'none', stroke: '#9ff6ff', 'stroke-width': 1.8, opacity: 0.8, 'stroke-linecap': 'round' }));
    Lr.push(el('circle', { cx: pts[2][0], cy: pts[2][1], r: 2.4, fill: '#fff' }));
  }
  const beams = [];
  for (let i = 0; i < 11; i++) {
    const a = i / 11 * Math.PI * 2 + r.range(-0.15, 0.15), L = r.range(120, 260), w = r.range(0.03, 0.07);
    beams.push(el('path', { d: `M${LX} ${LY}L${LX + Math.cos(a - w) * L} ${LY + Math.sin(a - w) * L}L${LX + Math.cos(a + w) * L} ${LY + Math.sin(a + w) * L}Z`, fill: s.rad([[0, '#bffaff', 0.5], [1, '#bffaff', 0]], LX, LY, L, true) }));
  }
  Lr.push(g({ filter: 'url(#glow4)', opacity: 0.6 }, beams));
  Lr.push(orb(LX, LY, 21, '#39e6ff', '#f4ffff'));
  Lr.push(el('circle', { cx: LX, cy: LY, r: 22, fill: 'none', stroke: '#dffdff', 'stroke-width': 1.5, opacity: 0.7 }));
  Lr.push(glint(LX, LY, 46, '#eaffff', 0.9));
  s.add(2, g({}, Lr));

  // ---- 3: the doomed, and the dark closing in
  const fishlet = (x, y, len, deg, o = 1) => {
    const h = len * 0.3;
    return g({ transform: `translate(${x} ${y}) rotate(${deg})`, opacity: o }, [
      el('path', { d: `M${len * 0.5} 0Q${len * 0.2} ${-h} ${-len * 0.3} ${-h * 0.2}L${-len * 0.55} ${-h * 0.9}L${-len * 0.48} 0L${-len * 0.55} ${h * 0.9}L${-len * 0.3} ${h * 0.2}Q${len * 0.2} ${h} ${len * 0.5} 0Z`, fill: '#0d3a4c' }),
      el('path', { d: `M${len * 0.5} 0Q${len * 0.2} ${-h} ${-len * 0.3} ${-h * 0.2}`, fill: 'none', stroke: '#bafaff', 'stroke-width': 1.6 }),
      el('path', { d: `M${len * 0.46} 0Q${len * 0.2} ${-h * 0.7} ${-len * 0.25} ${-h * 0.1}Q${len * 0.2} ${h * 0.1} ${len * 0.46} 0Z`, fill: '#6fdcec', opacity: 0.75 }),
      el('circle', { cx: len * 0.28, cy: -h * 0.12, r: len * 0.055, fill: '#fff' }),
    ]);
  };
  const shoal = [[146, 268, 50, 12], [178, 372, 40, -36], [112, 348, 30, -10], [190, 196, 34, 44], [326, 380, 36, -128], [136, 440, 26, -44], [318, 226, 28, 132]];
  for (const [x, y, len, deg] of shoal) s.add(3, fishlet(x, y, len, deg));
  s.motes({ n: 60, rmin: 0.8, rmax: 3.2, colors: ['#9fefff', '#d8feff', '#ffb0b8'], opacity: 0.7 });
  s.motes({ n: 26, x0: 100, y0: 150, x1: 420, y1: 470, rmin: 1, rmax: 3.6, color: '#c8fcff', opacity: 0.9 });
  s.bubbles({ n: 7, x0: 300, y0: 120, x1: 700, y1: 420, rmin: 3, rmax: 10, opacity: 0.4 });
  // near rock closing the frame
  const rockFill = s.lin([[0, '#0a0f1c'], [1, '#010103']]);
  s.add(3, el('path', { d: spline([[-80, 1100], [-80, 760], [10, 800], [60, 880], [150, 905], [230, 985], [330, 1010], [420, 1100]], true), fill: rockFill, filter: s.rough(10, 0.03, 5) }));
  s.add(3, el('path', { d: spline([[1100, 1100], [1100, 700], [1020, 760], [975, 870], [900, 920], [820, 995], [700, 1020], [600, 1100]], true), fill: rockFill, filter: s.rough(10, 0.03, 9) }));
  s.add(3, el('path', { d: spline([[-80, 760], [10, 800], [60, 880], [150, 905], [230, 985]]), fill: 'none', stroke: '#2a8fa8', 'stroke-width': 2, opacity: 0.28, filter: s.rough(10, 0.03, 5) }));
}

/** Turbulent murk over the whole canvas, shown only inside a soft ellipse (so it never ends on a hard edge). */
function mist(s, { color, opacity = 0.3, freq = 0.006, seed = null, layer = 0, cx = 512, cy = 512, rx = 600, ry = 400, contrast = 2.2 }) {
  const id = s.uid('mi'), sd = seed ?? s.r.int(1, 999), off = -(contrast - 1) * 0.62;
  s.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="${sd}"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${contrast} 0 0 0 ${off}"/><feComposite in2="SourceGraphic" operator="in"/></filter>`);
  const m = s.mask(el('ellipse', { cx, cy, rx, ry, fill: s.rad([[0, '#fff', 1], [0.55, '#fff', 0.75], [1, '#fff', 0]]) }));
  s.add(layer, g({ mask: m, opacity }, el('rect', { x: 0, y: 0, width: s.w, height: s.h, fill: color, filter: `url(#${id})` })));
}
