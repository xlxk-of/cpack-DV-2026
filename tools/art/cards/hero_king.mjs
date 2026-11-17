// THE DROWNED KING (the hard opponent) — long dead on his sunken throne: a skull under a corroded crown with one
// living gem, cold fire in the sockets, a rotted mantle, weed and chain.
import { el, g, spline, ribbon, sample, orb, glint, poly, bolt } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;

export function build(s) {
  const r = s.r;

  // ---- 0: the black deep
  s.backdrop(s.lin([[0, '#0a1e3e'], [0.35, '#07122c'], [0.75, '#040818'], [1, '#02030c']]));
  s.add(0, el('ellipse', { cx: 512, cy: 330, rx: 560, ry: 460, fill: s.rad([[0, '#3aa0e0', 0.5], [0.45, '#1a4a9a', 0.22], [1, '#1a4a9a', 0]]) }));
  s.fog({ color: '#3f8fe0', opacity: 0.24, freq: 0.006 });
  s.fog({ color: '#2a3a9a', opacity: 0.2, freq: 0.01, y: 400, h: 700 });
  s.rays({ x: 512, y: -160, angle: 90, spread: 60, n: 9, color: '#9fd8ff', opacity: 0.13, width: 80 });
  s.motes({ n: 130, rmin: 0.6, rmax: 2.2, color: '#a8d8ff', opacity: 0.45, glow: false, layer: 0 });
  s.vignette({ strength: 0.85 });
  s.grain({ opacity: 0.22 });

  // ---- 1: the throne behind him, and what hangs
  s.add(1, throne(s, r));
  const ch = [];
  ch.push(chain(s, [[90, -20], [120, 200], [200, 380], [330, 470]], 30, 0.55));
  ch.push(chain(s, [[950, -20], [900, 240], [830, 420], [760, 520]], 30, 0.55));
  ch.push(chain(s, [[250, -20], [240, 140], [260, 250]], 22, 0.4));
  s.add(1, g({ filter: 'url(#glow2)' }, ch));
  s.kelp({ x: 60, h: 620, n: 3, color: '#04102a', layer: 1, lean: 0.05 });
  s.kelp({ x: 968, h: 560, n: 3, color: '#04102a', layer: 1, lean: -0.06 });
  s.add(1, el('rect', { x: 0, y: 0, width: 1024, height: 1024, fill: s.rad([[0, '#1a4a9a', 0], [0.55, '#0a1a40', 0.3], [1, '#02040e', 0.6]], 0.5, 0.42, 0.75) }));

  // ---- 2: the king
  const fig = [];
  fig.push(el('ellipse', { cx: 512, cy: 420, rx: 330, ry: 380, fill: '#4ab8ff', opacity: 0.22, filter: 'url(#glow64)' }));

  // mantle: rotted cloth over wide shoulders, ragged at the edges
  const mantleD = spline([[-40, 1080], [-10, 900], [80, 790], [230, 730], [380, 700], [512, 694], [644, 700], [794, 730], [944, 790], [1034, 900], [1064, 1080]], true);
  const mantle = [el('path', { d: mantleD, fill: s.lin([[0, '#1a2a5a'], [0.4, '#101a3e'], [1, '#04060f']]) })];
  const mClip = s.clip(el('path', { d: mantleD }));
  const mf = [];
  for (let i = 0; i < 10; i++) {
    const x0 = 40 + i * 104 + r.range(-20, 20);
    mf.push(el('path', { d: ribbon([[512 + (x0 - 512) * 0.6, 720], [x0, 880], [x0 + (x0 - 512) * 0.12, 1060]], 10, 70), fill: '#01030a', opacity: 0.6, filter: 'url(#glow8)' }));
    mf.push(el('path', { d: ribbon([[512 + (x0 - 512) * 0.6 - 24, 740], [x0 - 32, 880], [x0 - 40 + (x0 - 512) * 0.12, 1060]], 4, 22), fill: '#6aa8ff', opacity: 0.13, filter: 'url(#glow8)' }));
  }
  // rot: holes eaten through, a brocade pattern nearly gone
  for (let i = 0; i < 16; i++) {
    const x = r.range(20, 1000), y = r.range(800, 1010);
    mf.push(el('path', { d: blobD(r, x, y, r.range(10, 34), r.range(8, 22)), fill: '#01020a', opacity: 0.8 }));
  }
  for (let i = 0; i < 40; i++) mf.push(glint(r.range(30, 990), r.range(760, 1010), r.range(4, 8), '#8a9ad0', r.range(0.12, 0.3)));
  mantle.push(g({ 'clip-path': mClip }, mf));
  fig.push(g({ filter: s.emboss({ color: '#7ac0ff', az: 235, elev: 28, depth: 8, k: 1.0, blur: 8 }) }, mantle));

  // the neck: three vertebrae
  const neck = [];
  for (let i = 0; i < 4; i++) {
    const y = 690 + i * 30, w = 44 + i * 4;
    neck.push(el('rect', { x: 512 - w, y: y, width: w * 2, height: 24, rx: 11, fill: s.lin([[0, '#9fb4c8'], [0.5, '#5a7088'], [1, '#1c2840']], 0, 0, 1, 0) }));
    neck.push(el('rect', { x: 512 - w - 18, y: y + 4, width: 26, height: 14, rx: 7, fill: '#5a7088' }));
    neck.push(el('rect', { x: 512 + w - 8, y: y + 4, width: 26, height: 14, rx: 7, fill: '#2a3a58' }));
  }
  fig.push(g({ filter: s.emboss({ color: '#bfe6ff', az: 235, elev: 30, depth: 5, k: 0.8, blur: 4 }) }, neck));
  fig.push(el('ellipse', { cx: 512, cy: 700, rx: 130, ry: 50, fill: '#01030a', opacity: 0.75, filter: 'url(#glow16)' }));

  // the collar of fur, matted and grey
  fig.push(collar(s, r));

  // chain of office across the chest
  fig.push(g({ filter: 'url(#shadow)' }, chain(s, [[250, 800], [340, 900], [512, 960], [684, 900], [774, 800]], 44, 1, true)));

  // ---- the skull
  // the jaw first: it hangs a little open
  const jawD = spline([[398, 556], [402, 640], [438, 706], [512, 730], [586, 706], [622, 640], [626, 556], [598, 630], [556, 656], [512, 662], [468, 656], [426, 630]], true);
  const bone = s.rad([[0, '#eef4f2'], [0.22, '#c2d0d8'], [0.5, '#7890a8'], [0.78, '#33456a'], [1, '#121a32']], 410, 270, 520, true);
  fig.push(el('path', { d: 'M418 590L606 590L590 690L434 690Z', fill: '#01020a' }));
  const jaw = [el('path', { d: jawD, fill: bone })];
  const jawClip = s.clip(el('path', { d: jawD }));
  jaw.push(g({ 'clip-path': jawClip }, [
    el('ellipse', { cx: 512, cy: 750, rx: 150, ry: 50, fill: '#070d20', opacity: 0.8, filter: 'url(#glow16)' }),
    el('ellipse', { cx: 620, cy: 640, rx: 44, ry: 90, fill: '#070d20', opacity: 0.75, filter: 'url(#glow16)' }),
    el('ellipse', { cx: 512, cy: 600, rx: 130, ry: 40, fill: '#070d20', opacity: 0.7, filter: 'url(#glow16)' }),
  ]));
  fig.push(g({ filter: s.emboss({ color: '#d8f2ff', az: 235, elev: 28, depth: 8, k: 0.9, blur: 7 }) }, jaw));
  // lower teeth
  fig.push(teeth(s, r, [[442, 662], [476, 652], [512, 649], [548, 652], [582, 662]], -1, 9));

  const skullPts = [[512, 188], [624, 208], [700, 290], [712, 380], [692, 440], [700, 492], [668, 532], [634, 560], [626, 600], [596, 624], [512, 630], [428, 624], [398, 600], [390, 560], [356, 532], [324, 492], [332, 440], [312, 380], [324, 290], [400, 208]];
  const skullD = spline(skullPts, true);
  const skClip = s.clip(el('path', { d: skullD }));
  const skull = [el('path', { d: skullD, fill: bone })];
  const sk = [];
  // hollows: temples, under the cheekbones, around the mouth
  sk.push(el('ellipse', { cx: 330, cy: 420, rx: 34, ry: 70, fill: '#0a1228', opacity: 0.7, filter: 'url(#glow16)' }));
  sk.push(el('ellipse', { cx: 700, cy: 420, rx: 50, ry: 90, fill: '#050818', opacity: 0.9, filter: 'url(#glow16)' }));
  sk.push(el('path', { d: 'M352 540Q400 530 420 560Q424 600 404 620L370 580Z', fill: '#070d20', opacity: 0.75, filter: 'url(#glow8)' }));
  sk.push(el('path', { d: 'M672 540Q624 530 604 560Q600 600 620 620L654 580Z', fill: '#050818', opacity: 0.85, filter: 'url(#glow8)' }));
  sk.push(el('rect', { x: 300, y: 180, width: 430, height: 140, fill: s.lin([[0, '#02040e', 0.95], [0.6, '#02040e', 0.4], [1, '#02040e', 0]]) }));
  sk.push(el('ellipse', { cx: 640, cy: 400, rx: 110, ry: 220, fill: '#081028', opacity: 0.6, filter: 'url(#glow32)' }));
  sk.push(el('ellipse', { cx: 512, cy: 590, rx: 110, ry: 30, fill: '#081028', opacity: 0.5, filter: 'url(#glow16)' }));
  // the scowl: bone overhanging each socket
  sk.push(el('path', { d: 'M344 392Q420 350 512 430Q604 350 680 392', fill: 'none', stroke: '#040816', 'stroke-width': 30, opacity: 0.65, 'stroke-linecap': 'round', filter: 'url(#glow8)' }));
  // brow ridge and cheekbones catch the light
  sk.push(el('path', { d: 'M344 362Q420 318 500 386', fill: 'none', stroke: '#f8fdff', 'stroke-width': 13, opacity: 0.6, 'stroke-linecap': 'round', filter: 'url(#glow4)' }));
  sk.push(el('path', { d: 'M680 362Q604 318 524 386', fill: 'none', stroke: '#a8c8e4', 'stroke-width': 11, opacity: 0.32, 'stroke-linecap': 'round', filter: 'url(#glow4)' }));
  sk.push(el('path', { d: 'M336 500Q386 524 446 508', fill: 'none', stroke: '#f8fdff', 'stroke-width': 18, opacity: 0.55, 'stroke-linecap': 'round', filter: 'url(#glow8)' }));
  sk.push(el('path', { d: 'M688 500Q638 524 578 508', fill: 'none', stroke: '#8fb4d8', 'stroke-width': 14, opacity: 0.3, 'stroke-linecap': 'round', filter: 'url(#glow8)' }));
  sk.push(el('path', { d: 'M500 400Q506 440 498 476', fill: 'none', stroke: '#f8fdff', 'stroke-width': 9, opacity: 0.4, 'stroke-linecap': 'round', filter: 'url(#glow4)' }));
  // the glow of his own eyes on the bone under them
  sk.push(el('ellipse', { cx: 430, cy: 500, rx: 70, ry: 26, fill: '#5ad0ff', opacity: 0.3, filter: 'url(#glow16)' }));
  sk.push(el('ellipse', { cx: 594, cy: 500, rx: 70, ry: 26, fill: '#5ad0ff', opacity: 0.3, filter: 'url(#glow16)' }));
  // age: stains, pits, sutures
  for (let i = 0; i < 30; i++) sk.push(el('ellipse', { cx: r.range(330, 700), cy: r.range(260, 610), rx: r.range(4, 22), ry: r.range(3, 12), fill: i % 3 ? '#1c4a5a' : '#0a1228', opacity: r.range(0.14, 0.36), filter: 'url(#glow2)' }));
  sk.push(el('path', { d: 'M512 196Q506 240 516 270Q508 300 514 330', fill: 'none', stroke: '#0a1228', 'stroke-width': 2.4, opacity: 0.5 }));
  skull.push(g({ 'clip-path': skClip }, sk));
  fig.push(g({ filter: s.emboss({ color: '#d8f2ff', az: 235, elev: 26, depth: 10, k: 1.0, blur: 9 }) }, skull));

  // cracks
  for (const [x0, y0, x1, y1] of [[392, 268, 366, 372], [664, 300, 632, 386], [450, 560, 430, 610]]) {
    fig.push(el('path', { d: bolt(r, x0, y0, x1, y1, 0.22, 7), fill: 'none', stroke: '#050a1a', 'stroke-width': 3.5, opacity: 0.85, 'stroke-linejoin': 'round' }));
    fig.push(el('path', { d: bolt(r, (x0 + x1) / 2, (y0 + y1) / 2, (x0 + x1) / 2 + 36, (y0 + y1) / 2 + 22, 0.3, 4), fill: 'none', stroke: '#050a1a', 'stroke-width': 2.2, opacity: 0.7 }));
  }

  // sockets, angled in anger, and the cold fire in them
  for (const k of [-1, 1]) {
    const cx = 512 + k * 86, cy = 432;
    const sock = `M${cx + k * 64} ${cy - 42}Q${cx + k * 10} ${cy - 54} ${cx - k * 58} ${cy + 2}Q${cx - k * 60} ${cy + 38} ${cx - k * 14} ${cy + 52}Q${cx + k * 52} ${cy + 58} ${cx + k * 70} ${cy + 10}Q${cx + k * 76} ${cy - 20} ${cx + k * 64} ${cy - 42}Z`;
    fig.push(el('path', { d: sock, fill: '#040816', opacity: 0.7, filter: 'url(#glow8)', transform: `translate(0 5)` }));
    fig.push(el('path', { d: sock, fill: s.rad([[0, '#071634'], [0.6, '#02040e'], [1, '#000106']]) }));
    const cp = s.clip(el('path', { d: sock }));
    const fx = cx + k * 4, fy = cy + 16;
    const fl = [];
    fl.push(el('circle', { cx: fx, cy: fy, r: 34, fill: '#2a9aff', opacity: 0.55, filter: 'url(#glow16)' }));
    for (let i = 0; i < 5; i++) {
      const sw = r.range(-10, 10);
      fl.push(el('path', { d: ribbon([[fx + r.range(-8, 8), fy + 8], [fx + sw + k * 6, fy - 16], [fx - sw * 0.6 + k * 14, fy - 36], [fx + k * 24 + sw, fy - 62]], 20, 2), fill: i % 2 ? '#bff0ff' : '#4ab8ff', opacity: 0.8, filter: 'url(#glow2)' }));
    }
    fig.push(g({ 'clip-path': cp }, fl));
    // the wisp that escapes the socket at its outer corner
    for (let i = 0; i < 3; i++) {
      const sw = r.range(-10, 10);
      fig.push(el('path', { d: ribbon([[fx + k * 12, fy - 26], [fx + k * 40 + sw, fy - 60], [fx + k * 56 - sw, fy - 96 - i * 12], [fx + k * 86 + sw, fy - 138 - i * 22]], 18 - i * 4, 1), fill: '#7fd8ff', opacity: 0.42 - i * 0.1, filter: 'url(#glow4)' }));
    }
    fig.push(el('circle', { cx: fx, cy: fy, r: 62, fill: '#3ab0ff', opacity: 0.3, filter: 'url(#glow16)' }));
    fig.push(orb(fx, fy, 12, '#7fdcff', '#ffffff', 1));
    fig.push(el('ellipse', { cx: fx, cy: fy, rx: 4, ry: 10, fill: '#ffffff' }));
    // lit lower rim of the socket
    fig.push(el('path', { d: `M${cx - k * 50} ${cy + 24}Q${cx - k * 14} ${cy + 56} ${cx + k * 52} ${cy + 44}`, fill: 'none', stroke: '#bff0ff', 'stroke-width': 3.5, opacity: 0.75, 'stroke-linecap': 'round', filter: 'url(#glow2)' }));
  }

  // nose
  fig.push(el('path', { d: 'M512 478Q544 518 538 550Q524 562 512 542Q500 562 486 550Q480 518 512 478Z', fill: '#02040e' }));
  fig.push(el('path', { d: 'M486 550Q500 562 512 542Q524 562 538 550', fill: 'none', stroke: '#bfe0f0', 'stroke-width': 2.5, opacity: 0.55 }));

  // upper teeth
  fig.push(teeth(s, r, [[416, 614], [462, 604], [512, 600], [562, 604], [608, 614]], 1, 10));

  // weed caught on him
  const weed = [];
  for (const [x0, y0, len, w] of [[352, 250, 300, 22], [336, 270, 220, 16], [676, 262, 260, 20], [700, 300, 360, 24], [660, 250, 150, 14]]) {
    const sw = r.range(-30, 30), k = x0 < 512 ? -1 : 1;
    const pts = [[x0, y0], [x0 + k * 26 + sw * 0.4, y0 + len * 0.33], [x0 + k * 14 - sw * 0.5, y0 + len * 0.66], [x0 + k * 40 + sw, y0 + len]];
    weed.push(el('path', { d: ribbon(pts, w, 2, (t) => 0.8 + 0.3 * Math.sin(t * 20 + x0), 14), fill: s.lin([[0, '#1a5a5a'], [1, '#07202c']]) }));
    weed.push(el('path', { d: spline(pts), fill: 'none', stroke: '#5ac8c0', 'stroke-width': 1.6, opacity: 0.4 }));
  }
  fig.push(g({ filter: s.emboss({ color: '#9ff0f0', az: 235, elev: 30, depth: 5, k: 0.8, blur: 4 }) }, weed));

  // the crown
  fig.push(crown(s, r));

  s.add(2, g({}, fig));

  // ---- 3: marine snow, cold mist at his chest, weed across the corners
  s.fog({ color: '#5aa8ff', opacity: 0.22, freq: 0.007, layer: 3, y: 720, h: 420 });
  s.kelp({ x: 20, h: 380, n: 2, color: '#01040c', layer: 3, lean: 0.12, width: 22 });
  s.kelp({ x: 1010, h: 340, n: 2, color: '#01040c', layer: 3, lean: -0.12, width: 22 });
  s.motes({ n: 60, rmin: 1.2, rmax: 4.2, colors: ['#bfe6ff', '#8fc8ff', '#ffffff'], opacity: 0.6 });
  s.bubbles({ n: 8, y0: 100, y1: 700, rmin: 3, rmax: 12, opacity: 0.4 });
  s.add(3, glint(300, 590, 10, '#bfe6ff'), glint(770, 660, 12, '#bfe6ff'));
}

function blobD(r, cx, cy, rx, ry) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2, k = 1 + (r() * 2 - 1) * 0.35;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return spline(pts, true, 5);
}

function teeth(s, r, arc, dir, n) {
  // teeth set along an arc; dir = 1 hang down (upper), -1 stand up (lower)
  const p = [];
  const sm = sample(arc, Math.ceil((n * 2) / (arc.length - 1)));
  const step = (sm.length - 1) / n;
  for (let i = 0; i < n; i++) {
    if (i === 2 && dir < 0) continue; // one gone
    const a = sm[Math.round(i * step)], b = sm[Math.round((i + 1) * step)];
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, w = Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.86;
    const h = (24 + r.range(-3, 5)) * (dir > 0 ? 1.15 : 1) * (0.75 + 0.25 * Math.sin(((i + 0.5) / n) * Math.PI));
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
    const lit = 1 - i / n;
    p.push(el('path', {
      d: `M${-w / 2} 0L${w / 2} 0L${w * 0.38} ${dir * h * 0.8}Q0 ${dir * h * 1.15} ${-w * 0.38} ${dir * h * 0.8}Z`,
      fill: s.lin([[0, lit > 0.5 ? '#e6f0f2' : '#8fa6ba'], [1, lit > 0.5 ? '#8fa6ba' : '#34486a']], 0, 0, 1, 0), stroke: '#0a1228', 'stroke-width': 1.6,
      transform: `translate(${mx.toFixed(1)} ${(my - dir * 4).toFixed(1)}) rotate(${ang.toFixed(1)})`,
    }));
  }
  return g({}, p);
}

function collar(s, r) {
  const p = [];
  // two heavy rolls of fur, shoulder to breastbone, built from a dark core and layers of matted tufts
  const roll = (pts, w0, w1, lit) => {
    const out = [];
    out.push(el('path', { d: ribbon(pts, w0, w1, (t) => 0.9 + 0.1 * Math.sin(t * 9), 14), fill: s.lin([[0, lit ? '#3e5478' : '#243250'], [1, '#080e20']]) }));
    const sm = sample(pts, 16);
    for (let row = 0; row < 5; row++) {
      for (let i = 0; i < sm.length; i++) {
        const t = i / (sm.length - 1), a = sm[Math.max(0, i - 1)], b = sm[Math.min(sm.length - 1, i + 1)];
        let dx = b[0] - a[0], dy = b[1] - a[1];
        const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
        const w = (w0 + (w1 - w0) * t) * 0.5, off = (-0.95 + row * 0.42) * w + r.range(-8, 8);
        // across the roll: the perpendicular that points up the screen
        const nx = dy > 0 ? -dy : dy, ny = dy > 0 ? dx : -dx;
        const up = ny > 0 ? -1 : 1;
        const x = sm[i][0] + nx * up * -off + r.range(-8, 8), y = sm[i][1] + ny * up * -off;
        const L = r.range(40, 70), sw = r.range(-10, 10) + (sm[i][0] < 512 ? -14 : 14);
        const shade = row < 1 ? (lit ? ['#a9c0d6', '#7d98b6', '#93adc8'] : ['#566e90', '#3a4e72', '#465c80']) : row < 3 ? (lit ? ['#5f7a9c', '#46608a', '#506a90'] : ['#2c3e62', '#1e2c4c', '#263656']) : (lit ? ['#34486c', '#27385a', '#2e4064'] : ['#18233e', '#101a30', '#141e38']);
        out.push(el('path', { d: ribbon([[x, y], [x + sw * 0.7, y + L * 0.45], [x + sw * 0.4, y + L]], 30, 2, (u) => Math.sin(Math.PI * Math.min(1, u * 0.8 + 0.25)) * 1.2), fill: shade[(i + row) % 3] }));
      }
    }
    // ermine tails, black and few
    for (let i = 2; i < sm.length - 1; i += 4) {
      const x = sm[i][0] + r.range(-20, 20), y = sm[i][1] + r.range(-26, 20);
      out.push(el('path', { d: ribbon([[x, y], [x + r.range(-6, 6), y + 20], [x + r.range(-10, 10), y + 44]], 13, 1), fill: '#04060f' }));
    }
    return g({}, out);
  };
  p.push(roll([[30, 900], [140, 800], [290, 748], [410, 770], [500, 850]], 150, 110, true));
  p.push(roll([[994, 900], [884, 800], [734, 748], [614, 770], [524, 850]], 150, 110, false));
  return g({ filter: 'url(#shadow)' }, g({ filter: s.emboss({ color: '#bfe6ff', az: 235, elev: 26, depth: 6, k: 0.5, blur: 6 }) }, p));
}

/** A chain of oval links along a curve. */
function chain(s, pts, size, opacity = 1, pendant = false) {
  const p = [];
  const sm = sample(pts, 16);
  // walk the curve at even spacing
  let acc = 0, i = 0;
  const step = size * 0.74;
  const at = [];
  for (let k = 1; k < sm.length; k++) {
    const d = Math.hypot(sm[k][0] - sm[k - 1][0], sm[k][1] - sm[k - 1][1]);
    acc += d;
    if (acc >= step) { at.push([sm[k], Math.atan2(sm[k][1] - sm[k - 1][1], sm[k][0] - sm[k - 1][0])]); acc = 0; }
  }
  for (const [q, a] of at) {
    const flat = i++ % 2;
    const metal = s.lin([[0, '#9fc0d8'], [0.4, '#3e587a'], [1, '#0c1428']]);
    if (flat) p.push(el('ellipse', { cx: q[0], cy: q[1], rx: size * 0.5, ry: size * 0.3, fill: 'none', stroke: metal, 'stroke-width': size * 0.2, transform: `rotate(${(a * 180 / Math.PI).toFixed(1)} ${q[0].toFixed(1)} ${q[1].toFixed(1)})` }));
    else p.push(el('path', { d: `M${q[0] - Math.cos(a) * size * 0.42} ${q[1] - Math.sin(a) * size * 0.42}L${q[0] + Math.cos(a) * size * 0.42} ${q[1] + Math.sin(a) * size * 0.42}`, stroke: metal, 'stroke-width': size * 0.24, 'stroke-linecap': 'round' }));
  }
  if (pendant) {
    const m = sm[Math.floor(sm.length / 2)];
    p.push(el('circle', { cx: m[0], cy: m[1] + 30, r: 34, fill: s.rad([[0, '#9fc0d8'], [0.6, '#2a3e60'], [1, '#0a1020']], 0.35, 0.3, 0.8) }));
    p.push(el('circle', { cx: m[0], cy: m[1] + 30, r: 22, fill: 'none', stroke: '#0a1020', 'stroke-width': 3, opacity: 0.7 }));
    p.push(orb(m[0], m[1] + 30, 8, '#5ac8ff', '#eaffff', 0.9));
  }
  return g({ opacity }, p);
}

function crown(s, r) {
  const p = [];
  // the band rides the brow in a shallow arc; five tines (one snapped, one bent) with low points between
  const bandTop = (x) => 226 + Math.pow((x - 512) / 200, 2) * 34;
  const tines = [[-176, 110, -22, 0], [-88, 150, -8, 0], [0, 196, 0, 0], [88, 150, 26, 1], [176, 62, 16, 2]];
  let d = `M304 ${bandTop(304) + 70}L304 ${bandTop(304)}`;
  for (const [i, [dx, h, lean, kind]] of tines.entries()) {
    const x = 512 + dx, y = bandTop(x), w = 27;
    d += `L${x - w} ${y}`;
    if (kind === 2) d += `L${x - w * 0.7} ${y - h}L${x - 8} ${y - h + 20}L${x + 6} ${y - h - 12}L${x + w * 0.8} ${y - h + 16}`; // snapped off
    else if (kind === 1) d += `L${x - 12} ${y - h * 0.6}L${x + lean + 14} ${y - h}L${x + 16} ${y - h * 0.5}`; // bent
    else d += `Q${x - w * 0.5} ${y - h * 0.5} ${x + lean - 4} ${y - h}L${x + lean + 4} ${y - h}Q${x + w * 0.5} ${y - h * 0.5} ${x + w} ${y}`;
    d += `L${x + w} ${y}`;
    if (i < 4) { const mx = x + 44, my = bandTop(mx); d += `L${mx - 12} ${my}L${mx} ${my - 38}L${mx + 12} ${my}`; }
  }
  d += `L720 ${bandTop(720)}L720 ${bandTop(720) + 70}Q512 ${bandTop(512) + 50} 304 ${bandTop(304) + 70}Z`;
  const metal = s.lin([[0, '#5a7896'], [0.3, '#2a3c58'], [0.7, '#141e34'], [1, '#080c1a']], 300, 60, 720, 300, true);
  const body = [el('path', { d, fill: metal, 'stroke-linejoin': 'round' })];
  const cp = s.clip(el('path', { d }));
  const inn = [];
  // verdigris and rust
  for (let i = 0; i < 40; i++) inn.push(el('path', { d: blobD(r, r.range(300, 724), r.range(60, 300), r.range(8, 30), r.range(6, 20)), fill: i % 3 ? '#2a9a90' : '#0a1020', opacity: r.range(0.2, 0.55), filter: 'url(#glow2)' }));
  // band mouldings
  for (const o of [10, 58]) {
    const pts = [];
    for (let x = 300; x <= 724; x += 20) pts.push([x, bandTop(x) + o - Math.pow((x - 512) / 200, 2) * 8]);
    inn.push(el('path', { d: poly(pts), fill: 'none', stroke: '#040814', 'stroke-width': 5, opacity: 0.8 }));
    inn.push(el('path', { d: poly(pts.map(([x, y]) => [x, y + 4])), fill: 'none', stroke: '#8fc0e0', 'stroke-width': 2, opacity: 0.5 }));
  }
  // studs where lesser gems were
  for (const dx of [-150, -76, 76, 150]) {
    const x = 512 + dx, y = bandTop(x) + 34;
    inn.push(el('circle', { cx: x, cy: y, r: 11, fill: '#02040c' }));
    inn.push(el('circle', { cx: x, cy: y, r: 11, fill: 'none', stroke: '#6a8aa8', 'stroke-width': 2.5, opacity: 0.7 }));
  }
  inn.push(el('ellipse', { cx: 512, cy: 262, rx: 150, ry: 60, fill: '#4ab8ff', opacity: 0.4, filter: 'url(#glow16)' }));
  body.push(g({ 'clip-path': cp }, inn));
  p.push(g({ filter: 'url(#shadow)' }, g({ filter: s.emboss({ color: '#bfe6ff', az: 235, elev: 28, depth: 8, k: 1.2, blur: 5 }) }, body)));
  // the one gem still alive
  const gx = 512, gy = bandTop(512) + 34;
  p.push(el('circle', { cx: gx, cy: gy, r: 120, fill: '#3ab0ff', opacity: 0.4, filter: 'url(#glow32)' }));
  p.push(el('path', { d: `M${gx} ${gy - 40}L${gx + 30} ${gy}L${gx} ${gy + 40}L${gx - 30} ${gy}Z`, fill: '#0a1428', stroke: '#8fc0e0', 'stroke-width': 3 }));
  p.push(el('path', { d: `M${gx} ${gy - 31}L${gx + 22} ${gy}L${gx} ${gy + 31}L${gx - 22} ${gy}Z`, fill: s.lin([[0, '#ffffff'], [0.4, '#9fe6ff'], [1, '#1a6ad0']]) }));
  p.push(el('path', { d: `M${gx} ${gy - 31}L${gx + 22} ${gy}L${gx} ${gy}Z`, fill: '#fff', opacity: 0.5 }));
  p.push(el('path', { d: `M${gx} ${gy - 31}L${gx + 22} ${gy}L${gx} ${gy + 31}L${gx - 22} ${gy}Z`, fill: '#bff0ff', opacity: 0.8, filter: 'url(#glow8)' }));
  p.push(glint(gx - 5, gy - 9, 22, '#ffffff', 0.95));
  return g({}, p);
}

function throne(s, r) {
  const p = [];
  // a high pointed back between two posts
  const stone = s.lin([[0, '#1c3464'], [0.5, '#101e44'], [1, '#060a1c']]);
  p.push(el('path', { d: 'M196 1040L196 330Q250 130 512 30Q774 130 828 330L828 1040Z', fill: stone }));
  const cp = s.clip(el('path', { d: 'M196 1040L196 330Q250 130 512 30Q774 130 828 330L828 1040Z' }));
  const inn = [];
  inn.push(el('path', { d: 'M250 1040L250 350Q300 190 512 110Q724 190 774 350L774 1040Z', fill: '#060c22', opacity: 0.7 }));
  for (let i = 0; i < 9; i++) {
    const x = 270 + i * 60;
    inn.push(el('path', { d: `M${x} 1040L${x} ${360 - Math.sin((i / 8) * Math.PI) * 200}`, stroke: '#2a4a8a', 'stroke-width': 3, opacity: 0.4 }));
  }
  inn.push(el('ellipse', { cx: 400, cy: 200, rx: 200, ry: 120, fill: '#5a9ae0', opacity: 0.22, filter: 'url(#glow32)' }));
  p.push(g({ 'clip-path': cp }, inn));
  p.push(el('path', { d: 'M196 330Q250 130 512 30Q774 130 828 330', fill: 'none', stroke: '#5a9ae0', 'stroke-width': 4, opacity: 0.5 }));
  for (const x of [150, 874]) {
    p.push(el('path', { d: `M${x - 46} 1040L${x - 46} 300L${x - 30} 270L${x - 30} 210L${x} 110L${x + 30} 210L${x + 30} 270L${x + 46} 300L${x + 46} 1040Z`, fill: stone }));
    p.push(el('path', { d: `M${x - 46} 1040L${x - 46} 300L${x - 30} 270L${x - 30} 210L${x} 110`, fill: 'none', stroke: '#5a9ae0', 'stroke-width': 3, opacity: 0.5 }));
    p.push(el('circle', { cx: x, cy: 100, r: 18, fill: '#16284e' }));
    for (let y = 340; y < 1000; y += 90) p.push(el('rect', { x: x - 46, y, width: 92, height: 10, fill: '#060a1c', opacity: 0.6 }));
  }
  return g({ opacity: 0.9, filter: 'url(#glow2)' }, p);
}
