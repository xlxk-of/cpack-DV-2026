// THE ARENA'S PICTURES, painted in code: no file to load and nothing to keep in step with the game's art. Everything
// is drawn at ART pixels a tile on small canvases and shown large and hard, like the rest of WICK, so the stone, the
// river and the candle towers are pixel art beside the cards' own.
//
// The towers are candles. A tower's candle burns down as it loses health; when it falls the flame goes out. The summons
// on the field are tokens cut from their own card pictures, ringed in their side's colour.
import { BRIDGES, BRIDGE_HALF, H, RIVER, W } from './sim.js';

export const ART = 16;                       // art pixels a tile

export const TEAM = [
  { name: 'azure', ring: '#5ab8ff', ringDark: '#1f5c94', light: '#bfe6ff', bar: '#4fb0ff', flame: ['#fffbe0', '#ffe27a', '#ffae3c', '#ff7a1a'], banner: '#2f6fb8', bannerDark: '#1c4478' },
  { name: 'crimson', ring: '#ff5a78', ringDark: '#8c1f3c', light: '#ffc2cf', bar: '#ff4f6d', flame: ['#fff0f6', '#ff9ac6', '#ff4f8a', '#c41a5a'], banner: '#b52a4a', bannerDark: '#701630' },
];

const STONE = ['#2b2436', '#302840', '#352c46', '#3a3149', '#2f2a3e'];
const MORTAR = '#17121f';
const PATH = ['#4a3f52', '#51455a', '#463b4f', '#4d4256'];
const WAX = ['#fbf3dc', '#efe2c0', '#d8c79f', '#b8a57c'];

function canvas(w, h) {
  const c = typeof OffscreenCanvas !== 'undefined' && !globalThis.document ? new OffscreenCanvas(w, h) : document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/** A seeded random for decoration that must look the same every time. */
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

// ==================================================================== the floor
/**
 * The field without its river and bridges (they move, so view.js draws them): flagstones, the worn lanes, a rune ring
 * under each tower and candlelight pooled around them. `top` and `bottom` are extra rows of wall above and below.
 */
export function paintFloor(top = 2, bottom = 1) {
  const w = W * ART, h = (H + top + bottom) * ART;
  const c = canvas(w, h);
  const ctx = c.getContext('2d');
  const rand = seeded(7);
  const oy = top * ART;
  // the wall beyond the field, top and bottom
  px(ctx, 0, 0, w, h, '#110d19');
  for (let y = 0; y < h; y += 8) {
    const off = (y / 8) % 2 ? 0 : 8;
    for (let x = -off; x < w; x += 16) {
      px(ctx, x + 1, y + 1, 14, 6, rand() < 0.5 ? '#1c1628' : '#1a1425');
      px(ctx, x + 1, y + 1, 14, 1, '#241d33');
    }
  }
  // flagstones: big and small slabs, each its own shade, with a lit edge and a shadowed one
  const slab = (x, y, sw, sh, pal) => {
    const base = pal[Math.floor(rand() * pal.length)];
    px(ctx, x, y, sw, sh, MORTAR);
    px(ctx, x + 1, y + 1, sw - 1, sh - 1, base);
    px(ctx, x + 1, y + 1, sw - 2, 1, shade(base, 14));
    px(ctx, x + 1, y + 1, 1, sh - 2, shade(base, 8));
    px(ctx, x + 1, y + sh - 1, sw - 1, 1, shade(base, -12));
    for (let k = 0; k < (sw * sh) / 60; k++) {
      px(ctx, x + 2 + rand() * (sw - 4), y + 2 + rand() * (sh - 4), 1, 1, shade(base, rand() < 0.5 ? -9 : 9));
    }
    if (rand() < 0.12) {
      // a crack
      let cx = x + 3 + rand() * (sw - 6), cy = y + 3 + rand() * (sh - 6);
      for (let k = 0; k < 6; k++) {
        px(ctx, cx, cy, 1, 1, shade(base, -22));
        cx += rand() < 0.5 ? 1 : 0;
        cy += rand() < 0.5 ? 1 : -1;
      }
    }
  };
  for (let ty = 0; ty < H; ty += 2) {
    const shift = (ty / 2) % 2 ? ART : 0;
    for (let tx = -1; tx < W + 1; tx += 2) {
      const x = tx * ART + shift, y = oy + ty * ART;
      if (rand() < 0.35) {
        slab(x, y, ART * 2, ART * 2, STONE);
      } else {
        slab(x, y, ART, ART, STONE);
        slab(x + ART, y, ART, ART, STONE);
        slab(x, y + ART, ART, ART, STONE);
        slab(x + ART, y + ART, ART, ART, STONE);
      }
    }
  }
  // the lanes: worn paler stone from each bridge to the towers, and across behind the kings
  const lane = (x0, y0, x1, y1) => {
    for (let y = y0; y < y1; y += 8) {
      for (let x = x0; x < x1; x += 8) {
        if (rand() < 0.08) continue;
        const b = PATH[Math.floor(rand() * PATH.length)];
        px(ctx, x, y, 8, 8, MORTAR);
        px(ctx, x + 1, y + 1, 7, 7, b);
        px(ctx, x + 1, y + 1, 6, 1, shade(b, 10));
      }
    }
  };
  for (const bx of BRIDGES) {
    const x0 = Math.round((bx - 1) * ART), x1 = Math.round((bx + 1) * ART);
    lane(x0, oy + 4.2 * ART, x1, oy + RIVER[0] * ART);
    lane(x0, oy + RIVER[1] * ART, x1, oy + (H - 4.2) * ART);
  }
  lane(Math.round(3.5 * ART), oy + 1.6 * ART, Math.round(14.5 * ART), oy + 3.6 * ART);
  lane(Math.round(3.5 * ART), oy + (H - 3.6) * ART, Math.round(14.5 * ART), oy + (H - 1.6) * ART);
  // a rune ring under every tower
  const ring = (cx, cy, r, color) => {
    for (let a = 0; a < 360; a += 3) {
      const t = (a * Math.PI) / 180;
      px(ctx, cx + Math.cos(t) * r, cy + Math.sin(t) * r, 1, 1, color);
      if (a % 30 === 0) px(ctx, cx + Math.cos(t) * (r - 3), cy + Math.sin(t) * (r - 3), 2, 2, color);
    }
  };
  for (const [tx, ty, r] of [[9, 2.7, 2.6], [3.5, 5.7, 2.1], [14.5, 5.7, 2.1], [9, H - 2.7, 2.6], [3.5, H - 5.7, 2.1], [14.5, H - 5.7, 2.1]]) {
    ring(tx * ART, oy + ty * ART, r * ART, 'rgba(176,150,230,0.22)');
  }
  // candlelight: the floor is warmer around the towers and darker toward the walls
  ctx.globalCompositeOperation = 'source-atop';
  for (const [tx, ty, r] of [[9, 2.7, 6], [3.5, 5.7, 4.5], [14.5, 5.7, 4.5], [9, H - 2.7, 6], [3.5, H - 5.7, 4.5], [14.5, H - 5.7, 4.5]]) {
    const g = ctx.createRadialGradient(tx * ART, oy + ty * ART, 0, tx * ART, oy + ty * ART, r * ART);
    g.addColorStop(0, 'rgba(255,190,110,0.16)');
    g.addColorStop(1, 'rgba(255,190,110,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  const v = ctx.createLinearGradient(0, 0, w, 0);
  v.addColorStop(0, 'rgba(6,4,10,0.45)');
  v.addColorStop(0.12, 'rgba(6,4,10,0)');
  v.addColorStop(0.88, 'rgba(6,4,10,0)');
  v.addColorStop(1, 'rgba(6,4,10,0.45)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  // the edge of the field
  px(ctx, 0, oy - 2, w, 2, '#0a0710');
  px(ctx, 0, oy + H * ART, w, 2, '#0a0710');
  return c;
}

function shade(hex, d) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + d));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + d));
  const b = Math.max(0, Math.min(255, (n & 255) + d));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

// ==================================================================== the river and its bridges
/** A strip of the mana river that tiles side to side; view.js scrolls it. */
export function paintRiver() {
  const w = 64, h = (RIVER[1] - RIVER[0]) * ART;
  const c = canvas(w, h);
  const ctx = c.getContext('2d');
  const rand = seeded(3);
  for (let y = 0; y < h; y++) {
    const k = Math.abs(y - h / 2) / (h / 2);
    px(ctx, 0, y, w, 1, k > 0.8 ? '#1a1a46' : (k > 0.5 ? '#23286a' : '#2a3488'));
  }
  for (let i = 0; i < 26; i++) {
    const y = 3 + Math.floor(rand() * (h - 6)), x = Math.floor(rand() * w), len = 3 + Math.floor(rand() * 8);
    const col = rand() < 0.3 ? '#9ad8ff' : (rand() < 0.5 ? '#5d8fe8' : '#7a62e0');
    for (let k = 0; k < len; k++) px(ctx, (x + k) % w, y, 1, 1, col);
  }
  for (let i = 0; i < 6; i++) px(ctx, Math.floor(rand() * w), 2 + Math.floor(rand() * (h - 4)), 1, 1, '#e6f6ff');
  // the banks
  px(ctx, 0, 0, w, 2, '#120f22');
  px(ctx, 0, 2, w, 1, '#3c4fa8');
  px(ctx, 0, h - 2, w, 2, '#120f22');
  px(ctx, 0, h - 3, w, 1, '#1d2560');
  return c;
}

export function paintBridge() {
  const w = Math.round(BRIDGE_HALF * 2 * ART), h = (RIVER[1] - RIVER[0]) * ART + 10;
  const c = canvas(w, h);
  const ctx = c.getContext('2d');
  const rand = seeded(11);
  px(ctx, 0, 3, w, h - 3, '#0e0a14');
  for (let x = 3; x < w - 3; x += 4) {
    const wood = ['#6b4628', '#73502e', '#5f3f24'][Math.floor(rand() * 3)];
    px(ctx, x, 2, 3, h - 4, wood);
    px(ctx, x, 2, 1, h - 4, shade(wood, 16));
    px(ctx, x + 1, 2 + Math.floor(rand() * (h - 8)), 1, 2, shade(wood, -18));
  }
  // rails and posts
  px(ctx, 0, 0, 3, h, '#3d2716');
  px(ctx, w - 3, 0, 3, h, '#3d2716');
  px(ctx, 1, 0, 1, h, '#8a603a');
  px(ctx, w - 2, 0, 1, h, '#8a603a');
  for (const y of [0, h / 2 - 2, h - 4]) {
    px(ctx, 0, y, 4, 4, '#2c1c10');
    px(ctx, w - 4, y, 4, 4, '#2c1c10');
    px(ctx, 1, y + 1, 2, 1, '#a07448');
    px(ctx, w - 3, y + 1, 2, 1, '#a07448');
  }
  return c;
}

// ==================================================================== the candle towers
/**
 * A tower's stone body, cached per side and kind: the candle on top is drawn by drawCandle(), since it burns.
 * Returns {canvas, w, h, footY (where the footprint's middle sits, from the top), rimY (where the candle stands)}.
 */
const towerCache = new Map();
export function towerBody(team, kind) {
  const key = team + kind;
  if (towerCache.has(key)) return towerCache.get(key);
  const king = kind === 'king';
  const w = king ? 64 : 46, h = king ? 66 : 54;
  const c = canvas(w, h);
  const ctx = c.getContext('2d');
  const col = TEAM[team];
  const rand = seeded(king ? 5 : 9);
  const cx = w / 2;
  const bodyTop = king ? 22 : 18, bodyBot = h - 6;
  const halfW = king ? 26 : 18;
  // shadow on the floor
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(cx, h - 6, halfW + 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // the drum: brick courses, lit from the left
  for (let y = bodyTop; y < bodyBot; y += 4) {
    const off = ((y - bodyTop) / 4) % 2 ? 0 : 4;
    for (let x = cx - halfW - off; x < cx + halfW; x += 8) {
      const x0 = Math.max(cx - halfW, x), x1 = Math.min(cx + halfW, x + 7);
      if (x1 <= x0) continue;
      const k = (x0 - (cx - halfW)) / (halfW * 2);
      const base = k < 0.25 ? '#8f8a9c' : k < 0.6 ? '#76718a' : k < 0.85 ? '#5d586f' : '#46415a';
      px(ctx, x0, y, x1 - x0, 3, base);
      px(ctx, x0, y, x1 - x0, 1, shade(base, 18));
      if (rand() < 0.15) px(ctx, x0 + 1 + rand() * (x1 - x0 - 2), y + 1, 1, 1, shade(base, -20));
    }
    px(ctx, cx - halfW, y + 3, halfW * 2, 1, '#2a2536');
  }
  // the base course flares out
  px(ctx, cx - halfW - 2, bodyBot - 4, halfW * 2 + 4, 4, '#4a4560');
  px(ctx, cx - halfW - 2, bodyBot - 4, halfW * 2 + 4, 1, '#7e7994');
  px(ctx, cx - halfW - 2, bodyBot, halfW * 2 + 4, 1, '#221d2c');
  // the crown of the tower: a crenellated rim
  const rimY = bodyTop - 6;
  px(ctx, cx - halfW - 2, rimY + 2, halfW * 2 + 4, 6, '#5d586f');
  px(ctx, cx - halfW - 2, rimY + 2, halfW * 2 + 4, 1, '#a19cb0');
  px(ctx, cx - halfW - 2, rimY + 7, halfW * 2 + 4, 1, '#2a2536');
  for (let x = cx - halfW - 2; x < cx + halfW + 2; x += 6) {
    px(ctx, x, rimY - 2, 4, 4, '#6e6984');
    px(ctx, x, rimY - 2, 4, 1, '#b2adc2');
    px(ctx, x + 3, rimY - 1, 1, 3, '#3b364c');
  }
  // the banner: the side's colour, with a candle on it
  const bw = king ? 14 : 10, bh = king ? 20 : 15, bx = cx - bw / 2, by = bodyTop + 3;
  px(ctx, bx - 1, by - 1, bw + 2, 2, '#c9a14a');
  px(ctx, bx, by, bw, bh, col.banner);
  px(ctx, bx, by, 2, bh, shade(col.banner, 22));
  px(ctx, bx + bw - 2, by, 2, bh, col.bannerDark);
  for (let i = 0; i < bw; i += 2) px(ctx, bx + i, by + bh, 1, (i / 2) % 2 ? 2 : 3, col.banner);
  px(ctx, cx - 1, by + (king ? 8 : 6), 2, king ? 7 : 5, '#f4ead0');
  px(ctx, cx - 1, by + (king ? 5 : 4), 2, 2, '#ffd36e');
  if (king) {
    // a crown above the banner, and side turrets
    for (const [dx, dy] of [[-4, 0], [-2, -2], [0, 0], [2, -2], [4, 0]]) px(ctx, cx + dx - 1, by - 6 + dy, 2, 3 - dy, '#ffd36e');
    px(ctx, cx - 5, by - 4, 10, 2, '#e0a83a');
    for (const sx of [cx - halfW - 4, cx + halfW - 4]) {
      px(ctx, sx, bodyTop + 2, 8, 22, '#5d586f');
      px(ctx, sx, bodyTop + 2, 2, 22, '#8f8a9c');
      px(ctx, sx + 6, bodyTop + 2, 2, 22, '#3b364c');
      px(ctx, sx - 1, bodyTop - 2, 10, 4, '#6e6984');
      px(ctx, sx - 1, bodyTop - 2, 10, 1, '#b2adc2');
      px(ctx, sx + 3, bodyTop + 8, 2, 4, '#170f05');
      px(ctx, sx + 3, bodyTop + 8, 2, 1, '#ffb347');
    }
  }
  // arrow slits glowing with the candle inside
  if (!king) {
    for (const sx of [cx - halfW + 4, cx + halfW - 6]) {
      px(ctx, sx, bodyTop + 8, 2, 5, '#170f05');
      px(ctx, sx, bodyTop + 9, 2, 1, '#ffb347');
    }
  }
  const out = { canvas: c, w, h, footY: h - 8, rimY, halfW, king };
  towerCache.set(key, out);
  return out;
}

/** The candle on top of a tower, burned down to `frac` of its health, and its flame (out when the tower is gone). */
export function drawCandle(ctx, team, body, frac, t, lit = true) {
  const col = TEAM[team];
  const cx = body.w / 2;
  const cw = body.king ? 14 : 10;
  const tall = body.king ? 22 : 16;
  const hgt = Math.max(2, Math.round(3 + (tall - 3) * Math.max(0, Math.min(1, frac))));
  const base = body.rimY + 3;
  const top = base - hgt;
  // wax pooled on the rim
  px(ctx, cx - cw / 2 - 3, base - 1, cw + 6, 3, WAX[2]);
  px(ctx, cx - cw / 2 - 2, base - 1, cw + 4, 1, WAX[0]);
  // the column of wax, lit from the left, with drips
  px(ctx, cx - cw / 2, top, cw, hgt, WAX[1]);
  px(ctx, cx - cw / 2, top, 2, hgt, WAX[0]);
  px(ctx, cx + cw / 2 - 2, top, 2, hgt, WAX[3]);
  px(ctx, cx - cw / 2, top, cw, 1, WAX[0]);
  for (const [dx, len] of [[1, 3], [cw - 4, 5], [Math.floor(cw / 2), 2]]) {
    if (hgt > len + 2) px(ctx, cx - cw / 2 + dx, top + 1, 1, len, WAX[0]);
  }
  // the band of the side's colour round the candle
  if (hgt > 6) px(ctx, cx - cw / 2, base - 5, cw, 2, col.banner);
  // the wick and the flame
  px(ctx, cx - 0.5, top - 2, 1, 2, '#2a1a10');
  if (!lit) return;
  const f = col.flame;
  const flick = Math.sin(t * 13 + team) * 0.8 + Math.sin(t * 7.3) * 0.6;
  const fh = (body.king ? 11 : 8) + Math.round(flick);
  const fy = top - 2 - fh;
  // a soft glow, then the flame in four bands
  ctx.save();
  const g = ctx.createRadialGradient(cx, fy + fh * 0.6, 0, cx, fy + fh * 0.6, body.king ? 22 : 16);
  g.addColorStop(0, team ? 'rgba(255,90,140,0.35)' : 'rgba(255,200,90,0.35)');
  g.addColorStop(1, 'rgba(255,160,60,0)');
  ctx.fillStyle = g;
  ctx.fillRect(cx - 24, fy - 16, 48, 48);
  ctx.restore();
  const sway = Math.round(Math.sin(t * 5 + team * 2) * 1);
  const bands = [[f[3], 1.0, 4], [f[2], 0.8, 3], [f[1], 0.55, 2], [f[0], 0.3, 1]];
  for (const [color, k, wHalf] of bands) {
    const hh = Math.max(2, Math.round(fh * k));
    for (let i = 0; i < hh; i++) {
      const narrow = Math.round(wHalf * (1 - i / hh) * (body.king ? 1.25 : 1)) + 1;
      const xo = i > hh * 0.5 ? sway : 0;
      px(ctx, cx - narrow + xo, top - 3 - i, narrow * 2, 1, color);
    }
  }
}

/** What is left of a tower when it falls: rubble, a puddle of wax and a dead wick. */
const rubbleCache = new Map();
export function towerRubble(kind) {
  if (rubbleCache.has(kind)) return rubbleCache.get(kind);
  const king = kind === 'king';
  const w = king ? 64 : 46, h = 30;
  const c = canvas(w, h);
  const ctx = c.getContext('2d');
  const rand = seeded(king ? 21 : 23);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h - 8, w / 2 - 2, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // the wax, run out over the stones
  ctx.fillStyle = WAX[2];
  ctx.beginPath();
  ctx.ellipse(w / 2 + 3, h - 9, w / 3, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  px(ctx, w / 2 - 6, h - 12, 10, 1, WAX[0]);
  for (let i = 0; i < (king ? 26 : 18); i++) {
    const bw = 3 + Math.floor(rand() * 7), bh = 2 + Math.floor(rand() * 4);
    const x = 4 + rand() * (w - 8 - bw), y = h - 6 - bh - rand() * 12;
    const base = ['#76718a', '#5d586f', '#8f8a9c', '#46415a'][Math.floor(rand() * 4)];
    px(ctx, x, y, bw, bh, base);
    px(ctx, x, y, bw, 1, shade(base, 18));
  }
  px(ctx, w / 2, h - 18, 1, 5, '#1a1009');
  const out = { canvas: c, w, h };
  rubbleCache.set(kind, out);
  return out;
}

// ==================================================================== tokens: the summons, cut from their cards
const tokenCache = new Map();
const artCache = new Map();

/** The card's picture, loaded once. */
export function cardImage(id, variant = '') {
  const key = id + variant;
  if (artCache.has(key)) return artCache.get(key);
  const img = new Image();
  img.src = 'art/' + id + variant + '.png';
  artCache.set(key, img);
  return img;
}

/**
 * A round token of a card's picture, `d` art pixels across, ringed in the side's colour: a coin for a summon, a
 * square stone for a building. A mirror image gets a pale ring (view.js makes it shimmer). Null until the picture loads.
 */
export function token(id, team, d, opts = {}) {
  const key = [id, team, d, opts.building ? 1 : 0, opts.air ? 1 : 0, opts.mirror ? 1 : 0].join(':');
  if (tokenCache.has(key)) return tokenCache.get(key);
  const img = cardImage(id);
  if (!img.complete || !img.naturalWidth) return null;
  const pad = 2;
  const size = d + pad * 2;
  const c = canvas(size, size);
  const ctx = c.getContext('2d');
  const col = TEAM[team];
  const o = pad;
  // the picture, shrunk with smoothing to the token's few pixels, then everything after drawn hard
  const small = canvas(d, d);
  const sctx = small.getContext('2d');
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = 'high';
  const crop = Math.min(img.naturalWidth, img.naturalHeight) * 0.86;
  sctx.drawImage(img, (img.naturalWidth - crop) / 2, (img.naturalHeight - crop) / 2 - crop * 0.02, crop, crop, 0, 0, d, d);
  ctx.imageSmoothingEnabled = false;
  if (opts.building) {
    px(ctx, o - 1, o - 1, d + 2, d + 2, '#0c0912');
    ctx.drawImage(small, o, o);
    px(ctx, o, o, d, 2, '#8f8a9c');
    px(ctx, o, o + d - 2, d, 2, '#46415a');
    px(ctx, o, o, 2, d, '#76718a');
    px(ctx, o + d - 2, o, 2, d, '#5d586f');
    for (const [cx, cy] of [[o - 1, o - 1], [o + d - 2, o - 1], [o - 1, o + d - 2], [o + d - 2, o + d - 2]]) px(ctx, cx, cy, 3, 3, col.ring);
  } else {
    const r = d / 2;
    const mask = canvas(d, d);
    const mctx = mask.getContext('2d');
    mctx.drawImage(small, 0, 0);
    mctx.globalCompositeOperation = 'destination-in';
    mctx.beginPath();
    mctx.arc(r, r, r - 1.5, 0, Math.PI * 2);
    mctx.fill();
    ctx.drawImage(mask, o, o);
    // the ring: a dark edge, the side's colour, a lit arc at the top left
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0c0912';
    ctx.beginPath();
    ctx.arc(o + r, o + r, r - 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = opts.mirror ? '#e6d4ff' : col.ring;
    ctx.beginPath();
    ctx.arc(o + r, o + r, r - 1.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = opts.mirror ? '#ffffff' : col.light;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(o + r, o + r, r - 1.6, Math.PI * 1.05, Math.PI * 1.55);
    ctx.stroke();
  }
  tokenCache.set(key, c);
  return c;
}

/** The phoenix's egg, which is not a card. */
export function eggSprite(team) {
  const key = 'egg' + team;
  if (tokenCache.has(key)) return tokenCache.get(key);
  const c = canvas(14, 18);
  const ctx = c.getContext('2d');
  const rows = [[5, 4], [4, 6], [3, 8], [2, 10], [2, 10], [1, 12], [1, 12], [1, 12], [1, 12], [1, 12], [2, 10], [2, 10], [3, 8], [4, 6]];
  rows.forEach(([x, w], y) => {
    px(ctx, x, y + 2, w, 1, '#ff8a2a');
    px(ctx, x, y + 2, Math.max(1, w / 3), 1, '#ffd36e');
  });
  for (const [x, y] of [[5, 6], [8, 9], [4, 11], [9, 5], [7, 13]]) px(ctx, x, y, 1, 1, '#b8331a');
  px(ctx, 1, 16, 12, 2, TEAM[team].ring);
  tokenCache.set(key, c);
  return c;
}
