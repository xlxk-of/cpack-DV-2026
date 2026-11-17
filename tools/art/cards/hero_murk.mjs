// MADAME MURK (the medium opponent) — an octopus fortune-teller: jewelled headscarf, clever heavy-lidded eyes, gold
// hoops, and her arms curled about a crystal ball that lights her from below.
import { el, g, spline, ribbon, sample, orb, glint, poly } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;

const BX = 512, BY = 842, BR = 138; // the crystal ball

export function build(s) {
  const r = s.r;

  // ---- 0: the booth: violet dark, incense haze
  s.backdrop(s.lin([[0, '#2a1050'], [0.4, '#1c0a3e'], [0.8, '#12062a'], [1, '#08031a']]));
  s.add(0, el('ellipse', { cx: 512, cy: 420, rx: 620, ry: 520, fill: s.rad([[0, '#d040c0', 0.5], [0.5, '#7a2ab0', 0.24], [1, '#7a2ab0', 0]]) }));
  s.fog({ color: '#e05ad0', opacity: 0.26, freq: 0.006 });
  s.fog({ color: '#5a6af0', opacity: 0.2, freq: 0.009, y: 0, h: 600 });
  s.add(0, el('circle', { cx: BX, cy: BY, r: 560, fill: s.rad([[0, '#9ff4ff', 0.5], [0.3, '#7a8aff', 0.22], [1, '#7a8aff', 0]]) }));
  s.motes({ n: 120, rmin: 0.6, rmax: 2.4, colors: ['#ffd0f6', '#ffe9a8', '#c8d0ff'], opacity: 0.55, glow: false, layer: 0 });
  s.vignette({ strength: 0.78 });
  s.grain({ opacity: 0.2 });

  // ---- 1: drapes swagged across the top, hanging charms
  s.add(1, drapes(s, r));
  const charms = [];
  for (const [x, len, kind] of [[150, 250, 0], [246, 150, 1], [800, 170, 1], [890, 290, 0], [60, 120, 1], [968, 130, 1]]) {
    charms.push(el('path', { d: `M${x} 0L${x} ${len}`, stroke: '#c9a04a', 'stroke-width': 2, opacity: 0.7 }));
    if (kind === 0) {
      // a crescent moon charm
      charms.push(el('path', { d: `M${x} ${len}a26 26 0 1 0 0 52a20 20 0 1 1 0 -52z`, fill: s.lin([[0, '#fff2b0'], [1, '#c98a2a']]), transform: `rotate(-20 ${x} ${len + 26})` }));
      charms.push(el('circle', { cx: x, cy: len + 26, r: 44, fill: '#ffd070', opacity: 0.2, filter: 'url(#glow16)' }));
    } else {
      charms.push(glint(x, len + 14, 16, '#ffe9a8', 0.9));
    }
  }
  s.add(1, g({ opacity: 0.85 }, charms));

  // ---- 2: Madame Murk
  const fig = [];
  const skinDark = '#3a1060';

  // arms behind: two raised at the sides, curling
  const armFill = (x0, y0, x1, y1) => s.lin([[0, '#5a1a80'], [0.5, '#a02a98'], [1, '#e060b8']], x0, y0, x1, y1, true);
  const backArms = [];
  const raisedL = [[360, 640], [240, 700], [130, 660], [92, 540], [130, 430], [210, 400], [250, 450], [226, 500], [190, 490]];
  const raisedR = raisedL.map(([x, y]) => [1024 - x, y + 14]);
  backArms.push(arm(s, r, raisedL, 92, 9, armFill(360, 640, 100, 420), 1, true, [0.3, 0.36]));
  backArms.push(arm(s, r, raisedR, 92, 9, armFill(664, 640, 924, 420), -1, true, [0.33]));
  fig.push(g({}, backArms));

  // shawl: fringed, behind the head and over the "shoulders"
  const shawlD = spline([[150, 1080], [176, 860], [236, 700], [330, 610], [512, 580], [694, 610], [788, 700], [848, 860], [874, 1080]], true);
  const shawl = [el('path', { d: shawlD, fill: s.lin([[0, '#2c0e5a'], [0.5, '#1a0a3e'], [1, '#0c0420']]) })];
  const shClip = s.clip(el('path', { d: shawlD }));
  const sf = [];
  for (let i = 0; i < 60; i++) {
    const x = r.range(170, 860), y = r.range(620, 1010);
    sf.push(glint(x, y, r.range(5, 11), '#e8b85a', r.range(0.3, 0.7)));
  }
  for (let i = 0; i < 8; i++) {
    const x0 = 200 + i * 90;
    sf.push(el('path', { d: ribbon([[512 + (x0 - 512) * 0.5, 600], [x0, 800], [x0 + (x0 - 512) * 0.1, 1060]], 10, 60), fill: '#080314', opacity: 0.5, filter: 'url(#glow8)' }));
  }
  shawl.push(g({ 'clip-path': shClip }, sf));
  shawl.push(el('path', { d: spline([[176, 860], [236, 700], [330, 610], [512, 580], [694, 610], [788, 700], [848, 860]]), fill: 'none', stroke: s.lin([[0, '#ffe9a0'], [1, '#b87a2a']]), 'stroke-width': 7 }));
  fig.push(g({ filter: s.emboss({ color: '#ff9ae6', az: 215, elev: 30, depth: 7, k: 0.9, blur: 8 }) }, shawl));

  // hoops
  for (const [x, k] of [[286, 1], [738, -1]]) {
    fig.push(g({ filter: 'url(#shadow)' }, [
      el('circle', { cx: x, cy: 556, r: 46, fill: 'none', stroke: s.lin([[0, '#fff4b8'], [0.5, '#e8a838'], [1, '#8a5416']]), 'stroke-width': 11 }),
      el('path', { d: `M${x - 34} ${556 - 30}A46 46 0 0 1 ${x + 10} ${556 - 45}`, fill: 'none', stroke: '#fffbe0', 'stroke-width': 4, opacity: 0.9, 'stroke-linecap': 'round' }),
    ]));
  }

  // her body under the head, lit from below by the ball
  fig.push(el('path', { d: spline([[400, 560], [380, 660], [360, 760], [512, 800], [664, 760], [644, 660], [624, 560]], true), fill: s.lin([[0, '#6a1a88'], [0.5, '#b03aa8'], [1, '#ffc0f0']], 0, 600, 0, 760, true) }));
  fig.push(el('ellipse', { cx: 512, cy: 650, rx: 120, ry: 26, fill: '#2a0844', opacity: 0.6, filter: 'url(#glow8)' }));

  // necklaces: ropes of gold and a pendant, in the gap above the ball
  const nk = [];
  for (const [k, sag] of [[0, 40], [1, 74]]) {
    const pts = [];
    for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push([396 + 232 * t, 640 + Math.sin(t * Math.PI) * sag * 0.8]); }
    nk.push(el('path', { d: poly(pts), fill: 'none', stroke: '#8a5416', 'stroke-width': 6 }));
    nk.push(el('path', { d: poly(pts), fill: 'none', stroke: '#ffd870', 'stroke-width': 3.2, 'stroke-dasharray': k ? '2 7' : '9 4', 'stroke-linecap': 'round' }));
    if (k) for (let i = 2; i <= 14; i += 2) nk.push(el('circle', { cx: pts[i][0], cy: pts[i][1] + 9, r: i === 8 ? 0 : 7, fill: s.rad([[0, '#fffbd8'], [0.5, '#f0b848'], [1, '#8a5416']], 0.35, 0.3, 0.8) }));
  }
  fig.push(g({ filter: 'url(#shadow)' }, nk));

  // the crystal ball, on its little stand
  fig.push(ball(s, r));

  // arms in front, curled around the ball
  const front = [];
  const fl = [[440, 590], [300, 690], [262, 820], [300, 930], [400, 986], [470, 960], [476, 910], [444, 896]];
  const fr = [[584, 590], [740, 680], [790, 800], [760, 900], [690, 960], [630, 1000], [560, 1010]];
  front.push(arm(s, r, fl, 100, 10, armFill(420, 640, 300, 980), -1, true));
  front.push(arm(s, r, fr, 100, 10, armFill(604, 640, 700, 1000), 1, true));
  fig.push(g({}, front));
  // the head: a great soft bulb
  const headPts = [[512, 138], [640, 170], [726, 286], [744, 424], [704, 548], [614, 622], [512, 640], [410, 622], [320, 548], [280, 424], [298, 286], [384, 170]];
  const headD = spline(headPts, true);
  const headClip = s.clip(el('path', { d: headD }));
  const head = [];
  head.push(el('path', { d: headD, fill: s.rad([[0, '#ffb0e4'], [0.25, '#e45cc0'], [0.55, '#a02a9c'], [0.85, '#5a1a80'], [1, skinDark]], 512, 700, 620, true) }));
  const hs = [];
  // light from the ball climbs the chin; magenta rim from behind
  hs.push(el('ellipse', { cx: 512, cy: 650, rx: 190, ry: 90, fill: '#bff6ff', opacity: 0.55, filter: 'url(#glow32)' }));
  hs.push(el('ellipse', { cx: 300, cy: 380, rx: 50, ry: 200, fill: '#ff7ae0', opacity: 0.35, filter: 'url(#glow16)' }));
  hs.push(el('ellipse', { cx: 724, cy: 380, rx: 50, ry: 200, fill: '#8a6aff', opacity: 0.3, filter: 'url(#glow16)' }));
  // freckle-spots
  for (let i = 0; i < 70; i++) {
    const a = r.range(0, Math.PI * 2), d = Math.sqrt(r()) * 220, x = 512 + Math.cos(a) * d, y = 400 + Math.sin(a) * d * 1.1;
    if (Math.abs(x - 512) < 150 && y > 390 && y < 590) continue;
    const rr = r.range(4, 13);
    hs.push(el('ellipse', { cx: x, cy: y, rx: rr, ry: rr * 0.8, fill: '#ffc2ee', opacity: r.range(0.18, 0.4) }));
    hs.push(el('ellipse', { cx: x, cy: y, rx: rr * 0.5, ry: rr * 0.4, fill: '#7a1a8a', opacity: 0.3 }));
  }
  // the brows of an octopus are bumps
  hs.push(el('ellipse', { cx: 414, cy: 452, rx: 84, ry: 62, fill: '#3a0c5a', opacity: 0.55, filter: 'url(#glow16)' }));
  hs.push(el('ellipse', { cx: 610, cy: 452, rx: 84, ry: 62, fill: '#3a0c5a', opacity: 0.55, filter: 'url(#glow16)' }));
  hs.push(el('ellipse', { cx: 402, cy: 530, rx: 50, ry: 26, fill: '#ff8ad0', opacity: 0.5, filter: 'url(#glow16)' }));
  hs.push(el('ellipse', { cx: 622, cy: 530, rx: 50, ry: 26, fill: '#ff8ad0', opacity: 0.5, filter: 'url(#glow16)' }));
  head.push(g({ 'clip-path': headClip }, hs));
  fig.push(g({ filter: s.emboss({ color: '#ffb8f0', az: 215, elev: 28, depth: 10, k: 1.0, blur: 10 }) }, head));

  // eyes
  fig.push(eye(s, 410, 452, -1), eye(s, 614, 452, 1));
  // painted brows: one cocked
  fig.push(el('path', { d: ribbon([[334, 392], [380, 358], [438, 356], [480, 386]], 5, 13, (t) => Math.sin(Math.PI * Math.min(1, t + 0.25))), fill: '#2a0844' }));
  fig.push(el('path', { d: ribbon([[694, 370], [648, 336], [590, 340], [546, 378]], 5, 13, (t) => Math.sin(Math.PI * Math.min(1, t + 0.25))), fill: '#2a0844' }));
  // a knowing little mouth, painted
  fig.push(el('path', { d: 'M466 566Q488 558 512 564Q540 556 572 548Q548 590 512 588Q484 588 466 566Z', fill: s.lin([[0, '#8a0a50'], [1, '#d82a78']]) }));
  fig.push(el('path', { d: 'M462 564Q490 572 512 572Q544 570 578 544', fill: 'none', stroke: '#3a0430', 'stroke-width': 4, 'stroke-linecap': 'round' }));
  fig.push(el('ellipse', { cx: 520, cy: 580, rx: 16, ry: 4, fill: '#ffc0e0', opacity: 0.7, filter: 'url(#glow2)' }));
  fig.push(el('circle', { cx: 584, cy: 540, r: 5, fill: '#3a0430', opacity: 0.6 }));
  // beauty spot
  fig.push(el('circle', { cx: 450, cy: 548, r: 5.5, fill: '#2a0440' }));

  // the headscarf
  fig.push(scarf(s, r, headPts));

  // bangles on the raised arms
  s.add(2, g({}, fig));

  // ---- 3: light spilling up from the ball, and dust
  s.add(3, el('circle', { cx: BX, cy: BY, r: 300, fill: s.rad([[0, '#eaffff', 0.2], [0.4, '#9fe6ff', 0.1], [1, '#9fe6ff', 0]]) }));
  const sp = [];
  for (let i = 0; i < 30; i++) {
    const a = r.range(-Math.PI, 0), d = 150 + Math.pow(r(), 1.5) * 360;
    sp.push(orb(BX + Math.cos(a) * d, BY + Math.sin(a) * d, r.range(1.2, 3.2), i % 2 ? '#9ff4ff' : '#ffb0f0', '#fff', r.range(0.4, 0.9)));
  }
  s.add(3, g({}, sp));
  s.motes({ n: 34, rmin: 1.2, rmax: 4.2, colors: ['#ffd0f6', '#ffe9a8', '#ffffff'], opacity: 0.6 });
  s.add(3, glint(250, 330, 16, '#ffe9a8'), glint(800, 250, 20, '#ffd0f6'), glint(880, 640, 11, '#c8f6ff'), glint(140, 760, 12, '#ffd0f6'));
}

function eye(s, cx, cy, side) {
  const p = [];
  const w = 64, h = 52;
  const outline = `M${cx - w} ${cy}Q${cx} ${cy - h * 1.5} ${cx + w} ${cy}Q${cx} ${cy + h * 1.25} ${cx - w} ${cy}Z`;
  const cp = s.clip(el('path', { d: outline }));
  p.push(el('path', { d: outline, fill: '#1a0430', transform: `translate(0 4)`, filter: 'url(#glow4)' }));
  p.push(el('path', { d: outline, fill: s.rad([[0, '#fff6c0'], [0.45, '#ffc848'], [0.8, '#e07a1c'], [1, '#7a2a10']], 0.5, 0.7, 0.6) }));
  const inn = [];
  // an octopus's pupil: a dark bar, pinched
  inn.push(el('circle', { cx, cy: cy + 12, r: 36, fill: 'none', stroke: '#b8500c', 'stroke-width': 3, opacity: 0.55 }));
  inn.push(el('path', { d: `M${cx - 34} ${cy + 12}Q${cx - 18} ${cy - 3} ${cx} ${cy + 7}Q${cx + 18} ${cy - 3} ${cx + 34} ${cy + 12}Q${cx + 18} ${cy + 28} ${cx} ${cy + 21}Q${cx - 18} ${cy + 28} ${cx - 34} ${cy + 12}Z`, fill: '#12021c' }));
  inn.push(el('ellipse', { cx, cy: cy + 40, rx: 44, ry: 12, fill: '#bff6ff', opacity: 0.7, filter: 'url(#glow4)' }));
  // the heavy lid
  inn.push(el('path', { d: `M${cx - w - 6} ${cy + 2 - side * 5}Q${cx} ${cy - 14} ${cx + w + 6} ${cy + 2 + side * 5}L${cx + w + 6} ${cy - h * 2}L${cx - w - 6} ${cy - h * 2}Z`, fill: s.lin([[0, '#7a1a8a'], [0.55, '#4a2a9a'], [0.82, '#1fb0b0'], [1, '#7ff6e0']], 0, cy - h * 1.2, 0, cy - 4, true) }));
  inn.push(el('ellipse', { cx: cx - 8, cy: cy - 22, rx: 34, ry: 7, fill: '#eafffb', opacity: 0.5, filter: 'url(#glow4)' }));
  p.push(g({ 'clip-path': cp }, inn));
  p.push(el('circle', { cx: cx - 15, cy: cy + 8, r: 6.5, fill: '#fff' }));
  p.push(el('circle', { cx: cx + 18, cy: cy + 26, r: 3, fill: '#fff', opacity: 0.85 }));
  // lid line and lashes
  p.push(el('path', { d: `M${cx - w - 6} ${cy + 2 - side * 5}Q${cx} ${cy - 14} ${cx + w + 6} ${cy + 2 + side * 5}`, fill: 'none', stroke: '#12021c', 'stroke-width': 7, 'stroke-linecap': 'round' }));
  const ox = cx + side * (w + 2), oy = cy + 4 + side * side * 4;
  for (let i = 0; i < 3; i++) {
    p.push(el('path', { d: ribbon([[ox - side * i * 13, oy - 4 - i * 1.5], [ox + side * (14 - i * 8), oy - 8 - i * 5], [ox + side * (30 - i * 12), oy - 20 - i * 9]], 8, 1), fill: '#12021c' }));
  }
  p.push(el('path', { d: `M${cx - w + 8} ${cy + 16}Q${cx} ${cy + h * 1.22} ${cx + w - 8} ${cy + 16}`, fill: 'none', stroke: '#3a0c5a', 'stroke-width': 3, opacity: 0.7, 'stroke-linecap': 'round' }));
  return g({}, p);
}

/** A tentacle: tapered ribbon with volume and, if `suckers`, a row of pale cups along one flank. */
function arm(s, r, pts, w0, w1, fill, side, suckers = true, bangles = []) {
  const p = [];
  const shape = (t) => 1 - 0.12 * Math.sin(t * Math.PI);
  p.push(el('path', { d: ribbon(pts, w0, w1, shape, 14), fill }));
  // pale underside along one edge
  const sm = sample(pts, 14);
  const edge = [], inner = [];
  for (let i = 0; i < sm.length; i++) {
    const a = sm[Math.max(0, i - 1)], b = sm[Math.min(sm.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    const t = i / (sm.length - 1), w = (w0 + (w1 - w0) * t) * 0.5 * shape(t);
    edge.push([sm[i][0] - dy * w * side, sm[i][1] + dx * w * side]);
    inner.push([sm[i][0] - dy * w * side * 0.25, sm[i][1] + dx * w * side * 0.25, w]);
  }
  p.push(el('path', { d: poly(edge.concat(inner.map((q) => [q[0], q[1]]).reverse()), true), fill: '#ffc6ea', opacity: 0.5 }));
  if (suckers) {
    for (let i = 6; i < sm.length - 3; i += 5) {
      const t = i / (sm.length - 1), q = inner[i], e = edge[i];
      const x = (q[0] + e[0]) / 2, y = (q[1] + e[1]) / 2, rr = Math.max(2.5, q[2] * 0.3);
      p.push(el('circle', { cx: x, cy: y, r: rr, fill: '#ffe2f4', stroke: '#b0408a', 'stroke-width': Math.max(1, rr * 0.22) }));
      p.push(el('circle', { cx: x, cy: y, r: rr * 0.42, fill: '#a02a80' }));
    }
  }
  // spots on the back
  for (let i = 4; i < sm.length - 6; i += 4) {
    const q = inner[i], e = edge[i], x = q[0] - (e[0] - q[0]) * r.range(0.5, 1.1), y = q[1] - (e[1] - q[1]) * r.range(0.5, 1.1);
    p.push(el('circle', { cx: x, cy: y, r: Math.max(1.5, q[2] * r.range(0.08, 0.16)), fill: '#ffc2ee', opacity: 0.4 }));
  }
  const out = [g({ filter: s.emboss({ color: '#ffc8f4', az: 215, elev: 28, depth: 8, k: 1.0, blur: 6 }) }, p)];
  for (const t of bangles) {
    const i = Math.round(t * (sm.length - 1)), a = sm[i - 1], b = sm[i + 1];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy); dx /= len; dy /= len;
    const w = (w0 + (w1 - w0) * t) * 0.5 * shape(t) + 3;
    const d = `M${sm[i][0] - dy * w} ${sm[i][1] + dx * w}Q${sm[i][0] + dx * 12} ${sm[i][1] + dy * 12} ${sm[i][0] + dy * w} ${sm[i][1] - dx * w}`;
    out.push(el('path', { d, fill: 'none', stroke: '#7a4a10', 'stroke-width': 13, 'stroke-linecap': 'round' }));
    out.push(el('path', { d, fill: 'none', stroke: '#f0b848', 'stroke-width': 9, 'stroke-linecap': 'round' }));
    out.push(el('path', { d, fill: 'none', stroke: '#fffbd0', 'stroke-width': 2.5, 'stroke-linecap': 'round', opacity: 0.9, transform: `translate(${-dx * 2} ${-dy * 2})` }));
  }
  return g({ filter: 'url(#shadow)' }, out);
}

function scarf(s, r, headPts) {
  const p = [];
  // the cloth covers the crown of the head down to a line across the brow
  const top = sample([[286, 372], [296, 286], [384, 166], [512, 132], [640, 166], [728, 286], [738, 372]], 10).map(([x, y]) => [512 + (x - 512) * 1.035, 380 + (y - 380) * 1.035]);
  const low = sample([[742, 370], [640, 318], [512, 302], [384, 318], [282, 370]], 10);
  const d = poly(top.concat(low), true);
  const cloth = s.lin([[0, '#5a4af0'], [0.35, '#3a2ac0'], [0.7, '#261a8a'], [1, '#160c50']], 300, 130, 700, 380, true);
  const body = [el('path', { d, fill: cloth })];
  const cp = s.clip(el('path', { d }));
  const pat = [];
  // woven bands and little stars
  for (let k = 0; k < 4; k++) {
    const yy = 170 + k * 46;
    pat.push(el('path', { d: spline([[270, yy + 70], [390, yy + 14], [512, yy], [634, yy + 14], [754, yy + 70]]), fill: 'none', stroke: k % 2 ? '#e8b85a' : '#7a8aff', 'stroke-width': k % 2 ? 3 : 10, opacity: k % 2 ? 0.8 : 0.3 }));
  }
  for (let i = 0; i < 26; i++) pat.push(glint(r.range(300, 724), r.range(150, 350), r.range(5, 10), '#ffe9a8', r.range(0.4, 0.85)));
  // folds: the cloth is pulled round toward the knot
  for (let k = 0; k < 7; k++) {
    const y0 = 150 + k * 30, pts = [[280 + k * 6, y0 + 150 - k * 10], [420, y0 + 40], [580, y0 + 20 + k * 6], [760, 350]];
    pat.push(el('path', { d: ribbon(pts, 8, 30, (t) => Math.sin(Math.PI * Math.min(1, t + 0.15))), fill: '#0a0630', opacity: 0.4, filter: 'url(#glow4)' }));
    pat.push(el('path', { d: spline(pts.map(([x, y]) => [x, y - 13])), fill: 'none', stroke: '#b0b8ff', 'stroke-width': 4, opacity: 0.25, filter: 'url(#glow2)' }));
  }
  pat.push(el('ellipse', { cx: 410, cy: 200, rx: 90, ry: 40, fill: '#c0c8ff', opacity: 0.35, filter: 'url(#glow16)', transform: 'rotate(-30 410 200)' }));
  body.push(g({ 'clip-path': cp }, pat));
  // the band along the brow: gold
  const band = ribbon([[748, 372], [640, 320], [512, 304], [384, 320], [276, 372]], 30, 30);
  body.push(el('path', { d: band, fill: s.lin([[0, '#fff4b8'], [0.5, '#e8a838'], [1, '#8a5416']]) }));
  // knot at one side, and its tails
  const knot = [];
  knot.push(el('path', { d: ribbon([[744, 360], [800, 430], [790, 540], [826, 640]], 60, 14, (t) => 1 + 0.2 * Math.sin(t * 9)), fill: s.lin([[0, '#2a2aa8'], [1, '#140c48']]) }));
  knot.push(el('path', { d: ribbon([[750, 356], [840, 400], [880, 500], [870, 590]], 54, 12, (t) => 1 + 0.2 * Math.sin(t * 9 + 2)), fill: s.lin([[0, '#3a4ae0'], [1, '#201a78']]) }));
  knot.push(el('ellipse', { cx: 752, cy: 362, rx: 34, ry: 30, fill: s.rad([[0, '#5a6aff'], [1, '#201a78']], 0.35, 0.3, 0.8) }));
  p.push(g({ filter: 'url(#shadow)' }, g({ filter: s.emboss({ color: '#c0c8ff', az: 215, elev: 28, depth: 6, k: 0.9, blur: 5 }) }, knot)));
  p.push(g({ filter: s.emboss({ color: '#e0e4ff', az: 215, elev: 28, depth: 8, k: 0.9, blur: 8 }) }, body));
  // coins hanging from the band
  const coins = [];
  const bandPts = sample([[726, 372], [640, 334], [512, 318], [384, 334], [298, 372]], 3);
  for (const [i, q] of bandPts.entries()) {
    if (i === 6) continue;
    const drop = 20 + (i % 2) * 8;
    coins.push(el('path', { d: `M${q[0]} ${q[1]}l0 ${drop}`, stroke: '#c9902a', 'stroke-width': 2.5 }));
    coins.push(el('circle', { cx: q[0], cy: q[1] + drop + 10, r: 11, fill: s.rad([[0, '#fffbd8'], [0.5, '#f0b848'], [1, '#8a5416']], 0.35, 0.3, 0.8) }));
    coins.push(el('circle', { cx: q[0], cy: q[1] + drop + 10, r: 5, fill: 'none', stroke: '#8a5416', 'stroke-width': 1.5, opacity: 0.6 }));
  }
  p.push(g({ filter: 'url(#shadow)' }, coins));
  // the jewel at the centre of the brow
  const jx = 512, jy = 330;
  p.push(el('circle', { cx: jx, cy: jy, r: 60, fill: '#5ff6e6', opacity: 0.35, filter: 'url(#glow16)' }));
  p.push(el('path', { d: `M${jx} ${jy - 34}L${jx + 26} ${jy}L${jx} ${jy + 40}L${jx - 26} ${jy}Z`, fill: s.lin([[0, '#fff4b8'], [1, '#a86a1c']]), stroke: '#6a3e0c', 'stroke-width': 2 }));
  p.push(el('path', { d: `M${jx} ${jy - 24}L${jx + 17} ${jy}L${jx} ${jy + 28}L${jx - 17} ${jy}Z`, fill: s.lin([[0, '#eafffb'], [0.4, '#3fe0d0'], [1, '#0a6a7a']]) }));
  p.push(el('path', { d: `M${jx} ${jy - 24}L${jx + 17} ${jy}L${jx} ${jy}Z`, fill: '#fff', opacity: 0.45 }));
  p.push(glint(jx - 6, jy - 8, 13, '#fff', 0.95));
  return g({}, p);
}

function ball(s, r) {
  const p = [];
  const x = BX, y = BY, R = BR;
  // stand
  p.push(el('path', { d: `M${x - 96} ${y + R + 60}Q${x} ${y + R - 40} ${x + 96} ${y + R + 60}L${x + 120} ${y + R + 90}L${x - 120} ${y + R + 90}Z`, fill: s.lin([[0, '#fff0a8'], [0.4, '#d89a34'], [1, '#5a340c']]) }));
  // bloom
  p.push(el('circle', { cx: x, cy: y, r: R * 1.6, fill: '#7ff0ff', opacity: 0.28, filter: 'url(#glow64)' }));
  p.push(el('circle', { cx: x, cy: y, r: R * 1.12, fill: '#c8fbff', opacity: 0.55, filter: 'url(#glow16)' }));
  p.push(el('circle', { cx: x, cy: y, r: R, fill: s.rad([[0, '#ffffff'], [0.22, '#c8fbff'], [0.5, '#6ad0f6'], [0.78, '#6a5ae0'], [1, '#3a1a8a']], 0.5, 0.52, 0.5) }));
  const cp = s.clip(el('circle', { cx: x, cy: y, r: R }));
  const inn = [];
  // mist turning inside
  for (let i = 0; i < 5; i++) {
    const a0 = i * 1.3, pts = [];
    for (let k = 0; k <= 8; k++) {
      const a = a0 + k * 0.5, d = R * (0.15 + k * 0.1);
      pts.push([x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8]);
    }
    inn.push(el('path', { d: ribbon(pts, 6, 40), fill: i % 2 ? '#ff9af0' : '#eaffff', opacity: 0.4, filter: 'url(#glow8)' }));
  }
  for (let i = 0; i < 16; i++) {
    const a = r.range(0, Math.PI * 2), d = r.range(0.2, 0.85) * R;
    inn.push(glint(x + Math.cos(a) * d, y + Math.sin(a) * d, r.range(4, 9), '#fff', r.range(0.5, 1)));
  }
  inn.push(el('ellipse', { cx: x, cy: y + R * 0.75, rx: R, ry: R * 0.4, fill: '#2a0c6a', opacity: 0.45, filter: 'url(#glow16)' }));
  p.push(g({ 'clip-path': cp }, inn));
  // the star she is reading
  p.push(el('circle', { cx: x, cy: y - 6, r: 34, fill: '#fff', opacity: 0.95, filter: 'url(#glow8)' }));
  p.push(glint(x, y - 6, 64, '#ffffff', 1));
  p.push(g({ transform: `rotate(45 ${x} ${y - 6})` }, glint(x, y - 6, 30, '#eaffff', 0.9)));
  // glass: rim and highlights
  p.push(el('circle', { cx: x, cy: y, r: R - 1.5, fill: 'none', stroke: '#eaffff', 'stroke-width': 3, opacity: 0.8 }));
  p.push(el('path', { d: `M${x - R * 0.78} ${y - R * 0.3}A${R * 0.84} ${R * 0.84} 0 0 1 ${x - R * 0.2} ${y - R * 0.8}`, fill: 'none', stroke: '#fff', 'stroke-width': 12, 'stroke-linecap': 'round', opacity: 0.8, filter: 'url(#glow2)' }));
  p.push(el('ellipse', { cx: x + R * 0.5, cy: y - R * 0.58, rx: 14, ry: 8, fill: '#fff', opacity: 0.8, transform: `rotate(38 ${x + R * 0.5} ${y - R * 0.58})` }));
  return g({}, p);
}

function drapes(s, r) {
  const p = [];
  const cloth = s.lin([[0, '#5a1a90'], [0.5, '#34105e'], [1, '#1a0834']]);
  // two swags meeting off-centre, and side curtains
  const swag = (x0, x1, sagY, topY) => {
    const pts = [];
    for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push([x0 + (x1 - x0) * t, topY + Math.sin(t * Math.PI) * sagY]); }
    return poly([[x0, -20], ...pts, [x1, -20]], true);
  };
  for (const [x0, x1, sag, top, o] of [[-60, 420, 150, 40, 1], [380, 760, 110, 30, 0.9], [700, 1084, 160, 40, 1]]) {
    p.push(el('path', { d: swag(x0, x1, sag, top), fill: cloth, opacity: o }));
    for (let k = 1; k < 7; k++) {
      const t = k / 7, x = x0 + (x1 - x0) * t;
      p.push(el('path', { d: `M${x} -20Q${x + (0.5 - t) * 70} ${top + sag * 0.5} ${x0 + (x1 - x0) * (0.5 + (t - 0.5) * 0.5)} ${top + Math.sin((0.5 + (t - 0.5) * 0.5) * Math.PI) * sag}`, fill: 'none', stroke: '#12052a', 'stroke-width': 9, opacity: 0.45, filter: 'url(#glow4)' }));
    }
    // gold fringe along the hem
    for (let i = 1; i < 26; i++) {
      const t = i / 26, x = x0 + (x1 - x0) * t, y = top + Math.sin(t * Math.PI) * sag;
      p.push(el('path', { d: `M${x} ${y - 2}l0 16`, stroke: '#d8a848', 'stroke-width': 3, opacity: 0.7, 'stroke-linecap': 'round' }));
    }
    const hem = [];
    for (let i = 0; i <= 20; i++) { const t = i / 20; hem.push([x0 + (x1 - x0) * t, top + Math.sin(t * Math.PI) * sag]); }
    p.push(el('path', { d: poly(hem), fill: 'none', stroke: '#e8b85a', 'stroke-width': 4, opacity: 0.8 }));
  }
  for (const k of [-1, 1]) {
    const x = k < 0 ? 0 : 1024;
    p.push(el('path', { d: `M${x - k * -60} -20L${x + k * -130} -20Q${x + k * -70} 400 ${x + k * -150} 1060L${x - k * -60} 1060Z`, fill: s.lin([[0, '#4a1680'], [1, '#12052a']], k < 0 ? 0 : 1, 0, k < 0 ? 1 : 0, 0) }));
  }
  return g({ filter: 'url(#glow2)' }, p);
}
