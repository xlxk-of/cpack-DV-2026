// The art kit. Every picture in NACRE is drawn as layered SVG by a small scene script (tools/art/cards/*.mjs) and
// rendered to HD WebP by tools/art/render.mjs. A scene has up to four layers, back to front:
//   0  the backdrop (opaque, fills the whole canvas)
//   1  the middle distance
//   2  the subject
//   3  what floats in front of it: motes, bubbles, glints, foreground silhouettes
// The layers are saved separately as well as flattened, so the rarer cards can slide them against each other
// (parallax). That is why a layer must never rely on a blend mode against the layers below it: use alpha.

export function rng(seed) {
  let a = (seed >>> 0) || 1;
  const f = () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.range = (lo, hi) => lo + (hi - lo) * f();
  f.int = (lo, hi) => Math.floor(f.range(lo, hi + 1));
  f.pick = (arr) => arr[Math.floor(f() * arr.length)];
  f.sign = () => (f() < 0.5 ? -1 : 1);
  return f;
}

export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

const n2 = (v) => (Math.round(v * 100) / 100).toString();

/** `el('circle', {cx: 1, r: 2}, inner)` -> an SVG tag. Attributes that are undefined/null/false are left out. */
export function el(tag, attrs = {}, inner = null) {
  let s = '<' + tag;
  for (const k in attrs) {
    const v = attrs[k];
    if (v === undefined || v === null || v === false) continue;
    s += ' ' + k + '="' + (typeof v === 'number' ? n2(v) : String(v)) + '"';
  }
  if (inner === null) return s + '/>';
  return s + '>' + (Array.isArray(inner) ? inner.join('') : inner) + '</' + tag + '>';
}
export const g = (attrs, inner) => el('g', attrs, inner);

// ---------------------------------------------------------------------------------------------------- curves

/** Catmull-Rom through `pts` ([[x,y],...]) sampled to a polyline. */
export function sample(pts, per = 12, closed = false) {
  const out = [];
  const n = pts.length;
  const at = (i) => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}

/** A smooth path `d` through the points. */
export function spline(pts, closed = false, per = 10) {
  const s = sample(pts, per, closed);
  return poly(s, closed);
}

/** A straight-segment path `d`. */
export function poly(pts, closed = false) {
  return 'M' + pts.map((p) => n2(p[0]) + ' ' + n2(p[1])).join('L') + (closed ? 'Z' : '');
}

/** A tapered ribbon along a smooth curve: width `w0` at the start to `w1` at the end (a tentacle, a frond, a tail).
 *  `shape(t)` may reshape the width along the way (returns a multiplier). */
export function ribbon(pts, w0, w1, shape = null, per = 12) {
  const s = sample(pts, per);
  const L = [], R = [];
  for (let i = 0; i < s.length; i++) {
    const a = s[Math.max(0, i - 1)], b = s[Math.min(s.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const t = i / (s.length - 1);
    let w = (w0 + (w1 - w0) * t) * 0.5;
    if (shape) w *= shape(t);
    L.push([s[i][0] - dy * w, s[i][1] + dx * w]);
    R.push([s[i][0] + dy * w, s[i][1] - dx * w]);
  }
  return poly(L.concat(R.reverse()), true);
}

/** A wobbly closed blob around (cx, cy). */
export function blob(cx, cy, rx, ry, r, n = 9, jitter = 0.18, rot = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    const k = 1 + (r() * 2 - 1) * jitter;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return spline(pts, true);
}

/** Smooth 1-D value noise, for ridgelines and wobble. */
export function noise1(r, n = 64) {
  const v = Array.from({ length: n + 2 }, () => r());
  return (x) => {
    const f = ((x % n) + n) % n, i = Math.floor(f), t = f - i, u = t * t * (3 - 2 * t);
    return v[i] * (1 - u) + v[i + 1] * u;
  };
}

// ---------------------------------------------------------------------------------------------------- the scene

export class Scene {
  constructor(seed = 1, w = 1024, h = 1024) {
    this.w = w; this.h = h;
    this.r = rng(seed);
    this.defs = [];
    this.layers = [[], [], [], []];
    this._n = 0;
    this.def(STD_DEFS);
  }
  uid(p = 'u') { return p + (this._n++); }
  def(s) { this.defs.push(s); return this; }
  /** Add markup to a layer (0 backdrop .. 3 foreground). */
  add(layer, ...parts) { this.layers[layer].push(parts.flat().join('')); return this; }

  /** A linear gradient; returns `url(#id)`. stops: [[offset, color, opacity?], ...]. Coordinates are 0..1 of the
   *  shape's box unless `user` is true (then they are canvas pixels). */
  lin(stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1, user = false) {
    const id = this.uid('lg');
    this.def(el('linearGradient', { id, x1, y1, x2, y2, gradientUnits: user ? 'userSpaceOnUse' : undefined }, stopsOf(stops)));
    return `url(#${id})`;
  }
  /** A radial gradient; returns `url(#id)`. */
  rad(stops, cx = 0.5, cy = 0.5, rr = 0.5, user = false, fx = undefined, fy = undefined) {
    const id = this.uid('rg');
    this.def(el('radialGradient', { id, cx, cy, r: rr, fx, fy, gradientUnits: user ? 'userSpaceOnUse' : undefined }, stopsOf(stops)));
    return `url(#${id})`;
  }
  /** A clip path from markup; returns `url(#id)`. */
  clip(inner) {
    const id = this.uid('cp');
    this.def(el('clipPath', { id }, inner));
    return `url(#${id})`;
  }
  /** A luminance mask from markup (white shows, black hides); returns `url(#id)`. */
  mask(inner) {
    const id = this.uid('mk');
    this.def(el('mask', { id, maskUnits: 'userSpaceOnUse', x: -200, y: -200, width: this.w + 400, height: this.h + 400 }, inner));
    return `url(#${id})`;
  }
  /** A custom blur; returns `url(#id)`. */
  blur(sd) {
    const id = this.uid('bl');
    this.def(`<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${sd}"/></filter>`);
    return `url(#${id})`;
  }
  /** Painterly edge wobble; returns `url(#id)`. `scale` px of displacement, `freq` the noise frequency. */
  rough(scale = 8, freq = 0.02, seed = 3) {
    const id = this.uid('rf');
    this.def(`<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/></filter>`);
    return `url(#${id})`;
  }
  /** Raised, rim-lit volume from a flat shape (use on the subject's group). `color` the light, `az`/`el` where it
   *  comes from (degrees), `depth` how round. Returns `url(#id)`. */
  emboss({ color = '#ffffff', az = 235, elev = 55, depth = 9, k = 0.9, exp = 22, blur = 7 } = {}) {
    const id = this.uid('em');
    this.def(`<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="${blur}" result="a"/>
      <feSpecularLighting in="a" surfaceScale="${depth}" specularConstant="${k}" specularExponent="${exp}" lighting-color="${color}" result="s"><feDistantLight azimuth="${az}" elevation="${elev}"/></feSpecularLighting>
      <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
      <feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
    </filter>`);
    return `url(#${id})`;
  }

  // ------------------------------------------------------------------------------------------------ set dressing

  /** Fill the whole canvas (layer 0 backdrop). `fill` is a color or a gradient url. */
  backdrop(fill, layer = 0) { return this.add(layer, el('rect', { x: 0, y: 0, width: this.w, height: this.h, fill })); }

  /** Shafts of light fanning down from (x, y). Soft, additive-looking (light color + alpha). */
  rays({ x = this.w / 2, y = -80, angle = 90, spread = 50, n = 7, len = 1200, width = 70, color = '#bff', opacity = 0.16, layer = 0, blur = 14 } = {}) {
    const r = this.r, parts = [];
    const fill = this.lin([[0, color, 1], [0.6, color, 0.35], [1, color, 0]], x, y, x + Math.cos(angle * Math.PI / 180) * len, y + Math.sin(angle * Math.PI / 180) * len, true);
    for (let i = 0; i < n; i++) {
      const a = (angle - spread / 2 + spread * (n === 1 ? 0.5 : i / (n - 1)) + r.range(-3, 3)) * Math.PI / 180;
      const wv = width * r.range(0.4, 1.4);
      const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
      const px = -Math.sin(a), py = Math.cos(a);
      parts.push(el('path', { d: poly([[x - px * wv * 0.12, y - py * wv * 0.12], [x + px * wv * 0.12, y + py * wv * 0.12], [ex + px * wv, ey + py * wv], [ex - px * wv, ey - py * wv]], true), fill, opacity: opacity * r.range(0.5, 1.2) }));
    }
    return this.add(layer, g({ filter: this.blur(blur) }, parts));
  }

  /** Scattered soft dots: plankton, sparks, stars, dust. `glow` adds a halo around each. */
  motes({ n = 60, x0 = 0, y0 = 0, x1 = this.w, y1 = this.h, rmin = 1, rmax = 4, color = '#cff', opacity = 0.8, glow = true, layer = 3, colors = null } = {}) {
    const r = this.r, parts = [];
    for (let i = 0; i < n; i++) {
      const x = r.range(x0, x1), y = r.range(y0, y1), rr = rmin + (rmax - rmin) * Math.pow(r(), 2.2);
      const c = colors ? r.pick(colors) : color, o = opacity * r.range(0.35, 1);
      if (glow) parts.push(el('circle', { cx: x, cy: y, r: rr * 3.4, fill: c, opacity: o * 0.16 }));
      parts.push(el('circle', { cx: x, cy: y, r: rr, fill: c, opacity: o }));
    }
    return this.add(layer, g({}, parts));
  }

  /** Bubbles with a rim and a highlight. */
  bubbles({ n = 18, x0 = 0, y0 = 0, x1 = this.w, y1 = this.h, rmin = 3, rmax = 16, color = '#dff', opacity = 0.6, layer = 3 } = {}) {
    const r = this.r, parts = [];
    for (let i = 0; i < n; i++) {
      const x = r.range(x0, x1), y = r.range(y0, y1), rr = rmin + (rmax - rmin) * Math.pow(r(), 2), o = opacity * r.range(0.5, 1);
      parts.push(el('circle', { cx: x, cy: y, r: rr, fill: color, 'fill-opacity': 0.06, stroke: color, 'stroke-width': Math.max(0.8, rr * 0.12), 'stroke-opacity': o }));
      parts.push(el('ellipse', { cx: x - rr * 0.35, cy: y - rr * 0.4, rx: rr * 0.28, ry: rr * 0.16, fill: '#fff', opacity: o, transform: `rotate(-35 ${n2(x - rr * 0.35)} ${n2(y - rr * 0.4)})` }));
    }
    return this.add(layer, g({}, parts));
  }

  /** Four-point star glints. */
  glints({ n = 8, x0 = 0, y0 = 0, x1 = this.w, y1 = this.h, smin = 8, smax = 30, color = '#fff', opacity = 0.9, layer = 3 } = {}) {
    const r = this.r, parts = [];
    for (let i = 0; i < n; i++) parts.push(glint(r.range(x0, x1), r.range(y0, y1), r.range(smin, smax), color, opacity * r.range(0.5, 1)));
    return this.add(layer, g({}, parts));
  }

  /** A ragged silhouette ridge across the canvas, filled down to the bottom: reef, rock, dune, far hills.
   *  `y` the mean height, `amp` how tall the bumps, `detail` how jagged (0..1). Returns the path `d` as well. */
  ridge({ y = 800, amp = 90, detail = 0.5, fill = '#012', layer = 1, steps = 90, opacity = 1, stroke, filter } = {}) {
    const a = noise1(this.r, 16), b = noise1(this.r, 64), c = noise1(this.r, 256);
    const pts = [[-40, this.h + 40]];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, x = -40 + (this.w + 80) * t;
      pts.push([x, y - amp * ((a(t * 5) - 0.5) * 1.6 + (b(t * 22) - 0.5) * 0.7 * detail + (c(t * 90) - 0.5) * 0.3 * detail)]);
    }
    pts.push([this.w + 40, this.h + 40]);
    const d = poly(pts, true);
    this.add(layer, el('path', { d, fill, opacity, stroke, 'stroke-width': stroke ? 2 : undefined, filter }));
    return d;
  }

  /** Swaying kelp or weed rooted at (x, y), `h` tall. */
  kelp({ x = 100, y = this.h + 20, h = 500, n = 1, color = '#0a3a34', lean = 0, width = 16, leaves = true, layer = 1, opacity = 1 } = {}) {
    const r = this.r, parts = [];
    for (let k = 0; k < n; k++) {
      const bx = x + r.range(-30, 30) * (n > 1 ? 1 : 0), hh = h * r.range(0.7, 1.1), ph = r.range(0, 6);
      const pts = [];
      for (let i = 0; i <= 7; i++) {
        const t = i / 7;
        pts.push([bx + Math.sin(t * 5 + ph) * 26 * (0.4 + t) + lean * t * hh, y - hh * t]);
      }
      parts.push(el('path', { d: ribbon(pts, width, 2), fill: color }));
      if (leaves) {
        const s = sample(pts, 6);
        for (let i = 4; i < s.length - 3; i += 3) {
          const side = (i / 3) % 2 ? 1 : -1, p = s[i], L = width * r.range(2.2, 4.2) * (1 - i / s.length * 0.6);
          const tip = [p[0] + side * L, p[1] - L * 0.9];
          parts.push(el('path', { d: ribbon([p, [p[0] + side * L * 0.55, p[1] - L * 0.25], tip], 2, 1, (t) => Math.sin(Math.PI * Math.min(1, t * 1.15)) * (width * 0.45) + 0.4), fill: color }));
        }
      }
    }
    return this.add(layer, g({ opacity }, parts));
  }

  /** Darken the corners (put on the last layer you want it to affect; usually layer 0). */
  vignette({ strength = 0.6, color = '#000208', layer = 0, cx = 0.5, cy = 0.45, r = 0.78 } = {}) {
    const fill = this.rad([[0.45, color, 0], [1, color, strength]], cx, cy, r);
    return this.add(layer, el('rect', { x: 0, y: 0, width: this.w, height: this.h, fill }));
  }

  /** A film of painterly grain over a layer (needs something under it in the same layer to be seen). */
  grain({ opacity = 0.22, layer = 0, freq = 0.9 } = {}) {
    const id = this.uid('gr');
    this.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${this.r.int(1, 99)}"/><feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0.9 0.9 0.9 0 -0.85"/></filter>`);
    const id2 = this.uid('gr');
    this.def(`<filter id="${id2}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${this.r.int(100, 199)}"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.9 0.9 0.9 0 -0.9"/></filter>`);
    return this.add(layer,
      el('rect', { x: 0, y: 0, width: this.w, height: this.h, filter: `url(#${id})`, opacity, style: 'mix-blend-mode:multiply' }),
      el('rect', { x: 0, y: 0, width: this.w, height: this.h, filter: `url(#${id2})`, opacity: opacity * 0.5, style: 'mix-blend-mode:screen' }));
  }

  /** Big soft cloud/fog/nebula patches built from turbulence, tinted `color`. Good for murk, mist, storm cloud. */
  fog({ color = '#3af', opacity = 0.35, freq = 0.006, seed = null, layer = 0, x = 0, y = 0, w = this.w, h = this.h, contrast = 2.2, fade = true } = {}) {
    const id = this.uid('fg'), sd = seed ?? this.r.int(1, 999);
    const off = -(contrast - 1) * 0.62;
    this.def(`<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="${sd}"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${contrast} 0 0 0 ${off}"/><feComposite in2="SourceGraphic" operator="in"/></filter>`);
    const m = fade ? this.mask(el('rect', { x, y, width: w, height: h, fill: this.rad([[0, '#fff', 1], [0.75, '#fff', 0.7], [1, '#fff', 0]], 0.5, 0.5, 0.6) })) : undefined;
    return this.add(layer, g({ mask: m, opacity }, el('rect', { x, y, width: w, height: h, fill: color, filter: `url(#${id})` })));
  }

  // ------------------------------------------------------------------------------------------------ output

  _wrap(inner) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.w}" height="${this.h}" viewBox="0 0 ${this.w} ${this.h}"><defs>${this.defs.join('')}</defs>${inner}</svg>`;
  }
  svg(layer) { return this._wrap(this.layers[layer].join('')); }
  svgAll() { return this._wrap(this.layers.map((l) => `<g>${l.join('')}</g>`).join('')); }
  used() { return this.layers.map((l) => l.length > 0); }
}

function stopsOf(stops) {
  return stops.map((s) => el('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] === undefined ? undefined : s[2] })).join('');
}

/** A soft glowing ball of light (halo + core). */
export function orb(x, y, r, color = '#bff', core = '#fff', opacity = 1) {
  return g({ opacity }, [
    el('circle', { cx: x, cy: y, r: r * 4, fill: color, opacity: 0.10, filter: 'url(#glow32)' }),
    el('circle', { cx: x, cy: y, r: r * 2.2, fill: color, opacity: 0.35, filter: 'url(#glow16)' }),
    el('circle', { cx: x, cy: y, r: r * 1.15, fill: color, opacity: 0.9, filter: 'url(#glow4)' }),
    el('circle', { cx: x, cy: y, r: r * 0.6, fill: core }),
  ]);
}

/** One four-point star glint. */
export function glint(x, y, s, color = '#fff', opacity = 1) {
  const k = s * 0.11;
  const d = `M${n2(x)} ${n2(y - s)}Q${n2(x + k)} ${n2(y - k)} ${n2(x + s)} ${n2(y)}Q${n2(x + k)} ${n2(y + k)} ${n2(x)} ${n2(y + s)}Q${n2(x - k)} ${n2(y + k)} ${n2(x - s)} ${n2(y)}Q${n2(x - k)} ${n2(y - k)} ${n2(x)} ${n2(y - s)}Z`;
  return g({ opacity }, [el('circle', { cx: x, cy: y, r: s * 0.7, fill: color, opacity: 0.25, filter: 'url(#glow8)' }), el('path', { d, fill: color })]);
}

/** A jagged lightning bolt from a to b, as a path `d`. */
export function bolt(r, x0, y0, x1, y1, jag = 0.18, steps = 9) {
  const pts = [[x0, y0]];
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  for (let i = 1; i < steps; i++) {
    const t = i / steps, o = (r() * 2 - 1) * jag * len * (1 - Math.abs(t - 0.5));
    pts.push([x0 + dx * t + nx * o, y0 + dy * t + ny * o]);
  }
  pts.push([x1, y1]);
  return poly(pts);
}

// Filters every scene has. glowN = a pure blur of N px (draw a bright shape under/over the sharp one); bloom = the
// shape plus its own halo; shadow = a soft dark drop under a subject.
const STD_DEFS = `
<filter id="glow2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>
<filter id="glow4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="glow8" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="glow16" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16"/></filter>
<filter id="glow32" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="32"/></filter>
<filter id="glow64" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="64"/></filter>
<filter id="bloom" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="10" result="b"/><feGaussianBlur in="SourceGraphic" stdDeviation="28" result="b2"/><feMerge><feMergeNode in="b2"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="bloomS" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="18"/><feOffset dy="16"/><feComponentTransfer><feFuncA type="linear" slope="0.55"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
`;
