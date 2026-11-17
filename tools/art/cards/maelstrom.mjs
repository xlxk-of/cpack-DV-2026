// MAELSTROM (epic spell) — the whole sea turning round one searing eye, under a sky that has come down to meet it.
import { el, g, spline, ribbon, sample, poly, blob, orb, glint, bolt } from '../lib.mjs';

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * Math.max(0, Math.min(1, t))).toString(16).padStart(2, '0')).join(''); };
const ramp = (stops, t) => { for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0])); return stops[stops.length - 1][1]; };

// the funnel: t = 0 at the lip, 1 at the eye (t < 0 is the open sea turning round it); a = angle round it
const HORIZON = 196;
const RX = (t) => t >= 0 ? 34 + 446 * Math.pow(1 - t, 1.25) : 480 + (-t) * 660;
const AS = (t) => 0.42 + 0.06 * Math.max(0, t);
const CY = (t) => 436 + 120 * Math.pow(Math.max(0, t), 0.85) - Math.max(0, -t) * 40;
const P = (t, a) => [512 + RX(t) * Math.cos(a), CY(t) + RX(t) * AS(t) * Math.sin(a)];
const TILT = 'rotate(-7 512 512)';

export function build(s) {
  const r = s.r;
  const streak = (t0, a0, da, w, pitch = 0.035) => {
    const pts = [];
    for (let j = 0; j <= 10; j++) { const a = a0 + da * j / 10; pts.push(P(Math.min(1, t0 + pitch * (a - a0)), a)); }
    return ribbon(pts, w, w, (u) => Math.sin(Math.PI * u), 4);
  };

  // ---- 0: storm sky and the open sea
  s.backdrop('#0a1626');
  const sky = [];
  sky.push(el('rect', { x: -300, y: -400, width: 1624, height: 400 + HORIZON, fill: s.lin([[0, '#03060d'], [0.45, '#0a1728'], [0.8, '#213f5a'], [0.95, '#4f8098'], [1, '#86b4c4']]) }));
  sky.push(el('rect', { x: -300, y: HORIZON, width: 1624, height: 1300, fill: s.lin([[0, '#3a6a84'], [0.04, '#1f4460'], [0.3, '#143049'], [1, '#081424']]) }));
  // the storm wheeling overhead: arcs of cloud round a pale gap
  const wheel = [];
  for (let i = 0; i < 26; i++) {
    const rx = r.range(180, 760), a0 = r.range(Math.PI, Math.PI * 2), da = r.range(0.4, 1.1), pts = [];
    for (let j = 0; j <= 8; j++) { const a = a0 + da * j / 8; pts.push([512 + Math.cos(a) * rx, 40 - Math.sin(a) * rx * -0.24 - rx * 0.05]); }
    wheel.push(el('path', { d: ribbon(pts, 40, 40, (u) => Math.sin(Math.PI * u)), fill: i % 3 ? '#02050b' : '#6f93ad', opacity: i % 3 ? 0.55 : 0.3 }));
  }
  sky.push(g({ filter: 'url(#glow16)' }, wheel));
  sky.push(el('ellipse', { cx: 512, cy: 40, rx: 300, ry: 90, fill: '#bfeaff', opacity: 0.3, filter: 'url(#glow32)' }));
  s.add(0, g({ transform: TILT }, sky));
  mist(s, { color: '#01030a', opacity: 0.8, freq: 0.007, cx: 512, cy: 20, rx: 900, ry: 300, contrast: 2.6 });
  mist(s, { color: '#7fa4c0', opacity: 0.24, freq: 0.009, cx: 600, cy: 130, rx: 700, ry: 130 });
  mist(s, { color: '#01030a', opacity: 0.75, freq: 0.01, cx: 150, cy: 40, rx: 520, ry: 200, contrast: 2.8 });
  mist(s, { color: '#01030a', opacity: 0.7, freq: 0.01, cx: 760, cy: 30, rx: 600, ry: 170, contrast: 2.8 });
  mist(s, { color: '#01030a', opacity: 0.6, freq: 0.012, cx: 200, cy: 150, rx: 520, ry: 190, contrast: 2.8 });
  // sheet lightning inside the cloud
  s.add(0, el('ellipse', { cx: 640, cy: 70, rx: 200, ry: 60, fill: '#d8f6ff', opacity: 0.42, filter: 'url(#glow32)' }));
  s.add(0, el('ellipse', { cx: 150, cy: 170, rx: 130, ry: 44, fill: '#a8dcff', opacity: 0.26, filter: 'url(#glow32)' }));
  // heavy cloud bellies, lit from underneath by the eye and the lightning
  const bellies = [], lit = [];
  for (let i = 0; i < 16; i++) {
    const x = -160 + i * 92 + r.range(-30, 30), y = r.range(-10, 120) - (i % 2) * 30, rx = r.range(110, 210), ry = r.range(40, 76);
    lit.push(el('ellipse', { cx: x, cy: y + 13, rx: rx * 0.96, ry, fill: Math.abs(x - 600) < 260 ? '#9fd8f0' : '#55809c', opacity: 0.6 }));
    bellies.push(el('ellipse', { cx: x, cy: y, rx, ry, fill: '#050a14' }));
  }
  s.add(0, g({ transform: TILT }, [g({ filter: 'url(#glow8)', opacity: 0.85 }, lit), g({ filter: 'url(#glow8)', opacity: 0.9 }, bellies)]));
  mist(s, { color: '#02040a', opacity: 0.55, freq: 0.014, cx: 512, cy: 40, rx: 900, ry: 220, contrast: 2.4 });
  // the eye's light thrown up into the weather
  s.add(0, el('ellipse', { cx: 520, cy: 520, rx: 520, ry: 330, fill: s.rad([[0, '#49d8f4', 0.42], [0.5, '#1f7fb0', 0.16], [1, '#1f7fb0', 0]]) }));
  s.vignette({ strength: 0.8, cy: 0.5, r: 0.8 });
  s.grain({ opacity: 0.22 });

  // ---- 1: the sea outside the lip, already turning; far weather
  const seaClip = s.clip(el('rect', { x: -400, y: HORIZON + 3, width: 1900, height: 1500 }));
  const outer = [], outerLight = [];
  for (let i = 0; i < 150; i++) {
    const t0 = -Math.pow(r(), 1.3) * 1.05, a0 = r.range(0, Math.PI * 2), da = r.range(0.25, 0.8) / (1 - t0);
    outer.push(el('path', { d: streak(t0, a0, da, r.range(10, 30), 0.05), fill: '#050f1d', opacity: r.range(0.25, 0.6) }));
  }
  for (let i = 0; i < 170; i++) {
    const t0 = -Math.pow(r(), 1.3) * 1.05, a0 = r.range(0, Math.PI * 2), da = r.range(0.12, 0.5) / (1 - t0), near = Math.sin(a0) > 0 ? 1.5 : 0.8;
    outerLight.push(el('path', { d: streak(t0, a0, da, r.range(1.5, 5) * near, 0.05), fill: '#cfe6f2', opacity: r.range(0.2, 0.6) }));
  }
  const far = [];
  // rain curtains and a waterspout on the horizon
  for (const [x, w, o] of [[60, 150, 0.3], [330, 100, 0.2], [760, 170, 0.28], [980, 120, 0.22]]) far.push(el('path', { d: `M${x} -40L${x + w} -40L${x + w - 70} ${HORIZON + 6}L${x - 70} ${HORIZON + 6}Z`, fill: s.lin([[0, '#9fc0d4', 0], [1, '#9fc0d4', o]]), filter: 'url(#glow8)' }));
  far.push(el('path', { d: ribbon([[262, -30], [236, 40], [250, 110], [232, HORIZON + 4]], 22, 4, (u) => 1 - 0.3 * Math.sin(u * 5)), fill: s.lin([[0, '#1a2e44', 0.5], [1, '#9cc4d8', 0.8]]), filter: 'url(#glow2)' }));
  far.push(el('ellipse', { cx: 232, cy: HORIZON + 4, rx: 26, ry: 6, fill: '#dff4ff', opacity: 0.7, filter: 'url(#glow4)' }));
  for (const [x0, y0, x1, y1] of [[820, -30, 868, HORIZON + 2], [96, -20, 70, HORIZON - 6]]) {
    const d = bolt(r, x0, y0, x1, y1, 0.16, 8);
    far.push(el('path', { d, fill: 'none', stroke: '#7fd8ff', 'stroke-width': 7, opacity: 0.6, filter: 'url(#glow4)' }), el('path', { d, fill: 'none', stroke: '#f4fdff', 'stroke-width': 1.8 }));
    far.push(el('ellipse', { cx: x1, cy: y1 + 4, rx: 60, ry: 10, fill: '#dff6ff', opacity: 0.6, filter: 'url(#glow8)' }));
  }
  far.push(el('rect', { x: -300, y: HORIZON - 14, width: 1624, height: 30, fill: '#a8d0e0', opacity: 0.35, filter: 'url(#glow8)' }));
  s.add(1, g({ transform: TILT }, [g({}, far), g({ 'clip-path': seaClip }, [g({ filter: 'url(#glow4)' }, outer), g({}, outerLight)])]));

  // ---- 2: the funnel and its eye
  const V = [];
  const seaRamp = [[0, '#1c435f'], [0.22, '#14324e'], [0.5, '#0c2542'], [0.68, '#0f3f66'], [0.82, '#1b86b2'], [0.92, '#62e2fb'], [1, '#f4ffff']];
  const N = 48;
  for (let i = 0; i <= N; i++) {
    const t = i / N, c = ramp(seaRamp, t);
    V.push(el('ellipse', { cx: 512, cy: CY(t), rx: RX(t), ry: RX(t) * AS(t), fill: s.lin([[0, mix(c, '#7fe9ff', 0.1 + 0.25 * t)], [0.5, c], [1, mix(c, '#030912', 0.42 * (1 - t * t))]]), opacity: Math.min(1, t / 0.1 + 0.04) }));
  }
  // troughs and foam drawn down the spiral
  const dark = [], foam = [], hot = [];
  for (let i = 0; i < 120; i++) {
    const t0 = Math.pow(r(), 0.9) * 0.86, a0 = r.range(0, Math.PI * 2), da = r.range(0.5, 1.5);
    dark.push(el('path', { d: streak(t0, a0, da, r.range(6, 20) * (1 - t0 * 0.6)), fill: '#040c18', opacity: r.range(0.2, 0.5) * Math.min(1, t0 / 0.08 + 0.2) }));
  }
  for (let i = 0; i < 260; i++) {
    const t0 = Math.pow(r(), 0.8) * 0.97, a0 = r.range(0, Math.PI * 2), da = r.range(0.3, 1.5), farWall = Math.sin(a0 + da / 2) < 0;
    const w = r.range(1.2, 6) * (1 - t0 * 0.55) * (farWall ? 0.8 : 1.3), o = r.range(0.25, 0.75) * Math.min(1, t0 / 0.08 + 0.25) * (farWall ? 1 : 0.8);
    (t0 > 0.62 ? hot : foam).push(el('path', { d: streak(t0, a0, da, w), fill: t0 > 0.62 ? mix('#9ff2ff', '#ffffff', (t0 - 0.62) * 3) : mix('#d8ecf6', '#b8f4ff', t0 * 1.5), opacity: o }));
  }
  V.push(g({ filter: 'url(#glow4)' }, dark));
  // the broken white water at the lip
  const lip = [];
  for (let i = 0; i < 150; i++) {
    const a = r.range(0, Math.PI * 2), p = P(r.range(0.0, 0.1), a), k = Math.sin(a) > 0 ? 1.4 : 0.7;
    lip.push(el('ellipse', { cx: p[0], cy: p[1], rx: r.range(5, 22) * k, ry: r.range(1.5, 5) * k, fill: '#e8f6fc', opacity: r.range(0.2, 0.7), transform: `rotate(${(Math.atan2(RX(0) * 0.42 * Math.cos(a), -RX(0) * Math.sin(a)) * 180 / Math.PI).toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)})` }));
  }
  V.push(g({ filter: s.rough(5, 0.05, 3) }, lip));
  V.push(g({}, foam));
  // the eye
  const ey = CY(1);
  V.push(el('ellipse', { cx: 512, cy: ey - 14, rx: 230, ry: 110, fill: '#39d4f6', opacity: 0.4, filter: 'url(#glow32)' }));
  V.push(g({ filter: 'url(#bloomS)' }, hot));
  V.push(el('path', { d: `M430 ${ey}L594 ${ey}L680 ${HORIZON - 120}L350 ${HORIZON - 120}Z`, fill: s.lin([[0, '#aef6ff', 0], [0.5, '#7fe9ff', 0.12], [1, '#dffcff', 0.5]], 0, HORIZON - 120, 0, ey, true), filter: 'url(#glow16)' }));
  V.push(el('ellipse', { cx: 512, cy: ey, rx: 120, ry: 52, fill: '#7ff0ff', opacity: 0.75, filter: 'url(#glow16)' }));
  V.push(el('ellipse', { cx: 512, cy: ey, rx: 64, ry: 27, fill: '#eaffff', filter: 'url(#glow8)' }));
  V.push(el('ellipse', { cx: 512, cy: ey, rx: 36, ry: 15, fill: '#ffffff', filter: 'url(#glow2)' }));

  // wreckage and ships going down the spiral
  const junk = [];
  for (let i = 0; i < 46; i++) {
    const t = r.range(0.06, 0.93), a = r.range(0, Math.PI * 2), p = P(t, a), L = r.range(5, 16) * (1 - t * 0.5) * (Math.sin(a) > 0 ? 1.3 : 0.8);
    const c = t > 0.7 ? '#02101c' : '#0a121c';
    junk.push(el('rect', { x: p[0] - L / 2, y: p[1] - L * 0.14, width: L, height: Math.max(1.6, L * 0.28), fill: c, transform: `rotate(${r.range(-60, 60).toFixed(0)} ${p[0].toFixed(1)} ${p[1].toFixed(1)})` }));
    if (t < 0.7) junk.push(el('ellipse', { cx: p[0], cy: p[1] + L * 0.3, rx: L * 0.8, ry: 1.6, fill: '#e8f6fc', opacity: 0.6 }));
  }
  V.push(g({}, junk));
  const fleet = [[0.05, 4.35, 24, 0], [0.15, 4.95, 30, 0], [0.03, 0.2, 36, 0.1], [0.24, 5.5, 54, 0], [0.42, 3.8, 50, 0.3], [0.36, 0.72, 72, 0.15], [0.1, 2.2, 108, 0], [0.6, 2.1, 52, 0.6], [0.74, 5.05, 36, 0.9], [0.83, 0.25, 36, 1], [0.9, 3.9, 24, 1]];
  for (const [t, a, len, dk] of fleet) {
    const p = P(t, a), th = Math.atan2(RX(t) * AS(t) * Math.cos(a), -RX(t) * Math.sin(a));
    let deg = th * 180 / Math.PI, flip = 1;
    if (Math.cos(th) < 0) { deg += 180; flip = -1; }
    deg = ((deg + 540) % 360) - 180; deg = Math.max(-26, Math.min(26, deg)) + (p[0] < 512 ? 1 : -1) * (5 + 16 * t);
    V.push(el('path', { d: streak(t - 0.014, a - 0.4, 0.38, len * 0.16), fill: '#f0faff', opacity: 0.7 }));
    V.push(ship(s, p[0], p[1], len, deg, flip, dk, r));
  }

  // the bolt that finds the eye
  const main = [];
  const mb = (x0, y0, x1, y1, w, jag = 0.2, n = 10) => {
    const d = bolt(r, x0, y0, x1, y1, jag, n);
    main.push(el('path', { d, fill: 'none', stroke: '#49cfff', 'stroke-width': w * 6, opacity: 0.4, filter: 'url(#glow8)', 'stroke-linejoin': 'round' }));
    main.push(el('path', { d, fill: 'none', stroke: '#bff2ff', 'stroke-width': w * 2.2, opacity: 0.85, filter: 'url(#glow2)', 'stroke-linejoin': 'round' }));
    main.push(el('path', { d, fill: 'none', stroke: '#ffffff', 'stroke-width': w, 'stroke-linejoin': 'round' }));
  };
  mb(640, -60, 600, 190, 4.5); mb(600, 190, 540, 380, 4); mb(540, 380, 516, ey - 6, 3.4, 0.12, 6);
  mb(600, 190, 720, 300, 1.8, 0.24, 6); mb(540, 380, 440, 430, 1.5, 0.24, 5); mb(618, 60, 520, 130, 1.4, 0.24, 5);
  V.push(g({}, main));
  V.push(glint(513, ey - 2, 50, '#ffffff', 0.9));
  s.add(2, g({ transform: TILT }, V));

  // ---- 3: the near sea, rain, things in the air
  const F = [];
  const waveFill = s.lin([[0, '#1d4a66'], [0.25, '#0d2238'], [1, '#030810']], 0, 740, 0, 1040, true);
  const crestL = [[-200, 850], [-80, 772], [40, 760], [150, 806], [250, 880], [370, 930], [500, 985], [610, 1040]];
  const crestR = [[1240, 770], [1120, 716], [1010, 730], [930, 800], [850, 876], [750, 940], [650, 992], [560, 1040]];
  for (const [k, crest] of [crestL, crestR].entries()) {
    const body = sample(crest, 10), dir = k ? -1 : 1;
    F.push(el('path', { d: poly([...body, [k ? 560 : 610, 1300], [k ? 1300 : -260, 1300]], true), fill: waveFill }));
    // light coming through the thin lip of the wave
    F.push(el('path', { d: poly(body.map((p) => [p[0] + dir * 6, p[1] + 26])), fill: 'none', stroke: '#2f8fb0', 'stroke-width': 40, opacity: 0.45, filter: 'url(#glow16)' }));
    // foam streaming down the face
    const run = [];
    for (let i = 0; i < 40; i++) {
      const p = body[r.int(2, body.length - 8)], L = r.range(50, 190);
      run.push(el('path', { d: ribbon([[p[0], p[1] + 4], [p[0] + dir * L * 0.32, p[1] + L * 0.45], [p[0] + dir * L * 0.4, p[1] + L]], r.range(4, 16), 1), fill: '#cfe8f4', opacity: r.range(0.08, 0.3) }));
    }
    F.push(g({}, run));
    // the breaking crest: a ragged band of white water, thicker where it curls
    const ph = r.range(0, 6);
    const cap = ribbon(crest.map((p) => [p[0], p[1] + 5]), 30, 30, (u) => (0.35 + 0.65 * Math.abs(Math.sin(u * 9 + ph))) * Math.sin(Math.PI * Math.min(1, u * 1.15 + 0.05)), 10);
    F.push(g({ filter: s.rough(16, 0.035, 3 + k) }, [
      el('path', { d: cap, fill: '#8fc4dc', opacity: 0.7, transform: 'translate(0 9)' }),
      el('path', { d: cap, fill: s.lin([[0, '#ffffff'], [1, '#cdeaf6']]) }),
    ]));
    const spray = [];
    for (let i = 0; i < 120; i++) {
      const p = body[r.int(1, body.length - 6)], h = Math.pow(r(), 2.2) * 150;
      spray.push(el('circle', { cx: p[0] + r.range(-24, 24) + dir * h * 0.5, cy: p[1] - h, r: r.range(1, 5) * (1 - h / 220), fill: '#f4fcff', opacity: r.range(0.3, 0.9) }));
    }
    for (let i = 0; i < 9; i++) { const p = body[r.int(3, body.length - 8)]; spray.push(el('ellipse', { cx: p[0] + r.range(-20, 20), cy: p[1] - r.range(4, 30), rx: r.range(16, 40), ry: r.range(8, 18), fill: '#eaf8ff', opacity: 0.16, filter: 'url(#glow8)' })); }
    F.push(g({}, spray));
  }
  // planks thrown clear
  for (const [x, y, a, L] of [[884, 660, 24, 44]]) {
    F.push(g({ transform: `translate(${x} ${y}) rotate(${a})` }, [
      el('rect', { x: -L / 2, y: -5, width: L, height: 10, fill: '#050b14' }),
      el('path', { d: `M${-L / 2} -5H${L / 2}`, stroke: '#7fe0f8', 'stroke-width': 1.6, opacity: 0.6 }),
    ]));
  }
  s.add(3, g({ transform: TILT }, F));
  const rain = [];
  for (let i = 0; i < 170; i++) { const x = r.range(-40, 1100), y = r.range(-60, 1000), L = r.range(26, 90); rain.push(`M${x.toFixed(0)} ${y.toFixed(0)}l${(-L * 0.3).toFixed(0)} ${L.toFixed(0)}`); }
  s.add(3, el('path', { d: rain.join(''), stroke: '#d8f0ff', 'stroke-width': 1.3, opacity: 0.22, 'stroke-linecap': 'round' }));
  s.add(3, el('path', { d: rain.slice(0, 40).join(''), stroke: '#ffffff', 'stroke-width': 2.2, opacity: 0.22, 'stroke-linecap': 'round', transform: 'translate(30 40)' }));
  s.motes({ n: 50, rmin: 1, rmax: 3.6, colors: ['#eefaff', '#9fe9ff'], opacity: 0.8 });
}

/** A tiny ship, `len` long, heeling `deg`, bow toward +x unless flip = -1. dk 0..1: how far it is just a silhouette
 *  against the eye's light. */
function ship(s, x, y, len, deg, flip, dk, r) {
  const k = len / 100, hull = mixHex('#141c26', '#020a12', dk), sail = mixHex('#c2d2dc', '#06202e', dk), rim = dk > 0.5 ? '#aef6ff' : '#e8f4fa';
  const sails = 'M-36 -94Q-18 -86 -2 -94L0 -60Q-18 -52 -38 -60ZM-40 -56Q-18 -46 2 -56L4 -20Q-18 -12 -42 -20ZM0 -108Q16 -100 32 -108L34 -68Q16 -60 -2 -68ZM-4 -64Q16 -54 36 -64L38 -22Q16 -14 -6 -22ZM44 -78L62 -22L38 -24ZM-64 -26L-24 -92L-26 -34Z';
  const parts = [
    el('path', { d: 'M-18 -10V-100M16 -10V-114M42 -12V-82M-44 -14L-70 -30', stroke: hull, 'stroke-width': 3.6, 'stroke-linecap': 'round', fill: 'none' }),
    el('path', { d: sails, fill: sail }),
    el('path', { d: 'M-36 -94Q-18 -86 -2 -94M0 -108Q16 -100 32 -108M-40 -56Q-18 -46 2 -56M-4 -64Q16 -54 36 -64M-64 -26L-24 -92', stroke: rim, 'stroke-width': 2.4, opacity: 0.8, fill: 'none' }),
    el('path', { d: 'M-50 -8Q-52 -18 -62 -24L-40 -13L46 -15L62 -26Q56 4 38 10Q0 18 -38 10Q-48 4 -50 -8Z', fill: hull }),
    el('path', { d: 'M-40 -13L46 -15L62 -26', stroke: rim, 'stroke-width': 2.4, opacity: 0.75, fill: 'none' }),
    el('path', { d: 'M16 -114l22 5l-22 6Z', fill: dk > 0.5 ? hull : '#c8443a' }),
    el('ellipse', { cx: 0, cy: 12, rx: 66, ry: 7, fill: '#f0faff', opacity: 0.75 }),
    el('ellipse', { cx: -52, cy: 8, rx: 16, ry: 9, fill: '#f0faff', opacity: 0.7 }),
  ];
  return g({ transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)}) scale(${(k * flip).toFixed(3)} ${k.toFixed(3)})` }, parts);
}
function mixHex(a, b, t) { return mix(a, b, t); }

/** Turbulent murk over the whole canvas, shown only inside a soft ellipse (so it never ends on a hard edge). */
function mist(s, { color, opacity = 0.3, freq = 0.006, seed = null, layer = 0, cx = 512, cy = 512, rx = 600, ry = 400, contrast = 2.2 }) {
  const id = s.uid('mi'), sd = seed ?? s.r.int(1, 999), off = -(contrast - 1) * 0.62;
  s.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="${sd}"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${contrast} 0 0 0 ${off}"/><feComposite in2="SourceGraphic" operator="in"/></filter>`);
  const m = s.mask(el('ellipse', { cx, cy, rx, ry, fill: s.rad([[0, '#fff', 1], [0.55, '#fff', 0.75], [1, '#fff', 0]]) }));
  s.add(layer, g({ mask: m, opacity }, el('rect', { x: 0, y: 0, width: s.w, height: s.h, fill: color, filter: `url(#${id})` })));
}
