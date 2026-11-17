// A card, as DOM. Everything inside is sized in `cqw` (hundredths of the card's own width), so the same markup is a
// thumbnail in the hand and a poster in the inspector: set `--cw` (or just the element's width) and it scales.
//
// The foil: a "live" card follows the pointer (or sways by itself when nobody is touching it). Each frame the light's
// position is written to CSS variables and the stylesheet (card.css) does the rest:
//   --mx/--my  where the light is, as percentages of the card       --px/--py  the same, -1..1 from the centre
//   --o        how strongly the foil shows (0 at rest .. 1)
import { CARD, RARITIES } from './cards.js';

export const artFlat = (id) => `art/${id}.webp`;
export const artThumb = (id) => `art/${id}_s.webp`;

const FOILS = ['holo', 'oil', 'glitter', 'flakes', 'prism', 'rays'];

/** Build a card face. opts: `count` (a ×N badge), `flat` (never use the parallax layers), `thumb` (small art). */
export function cardEl(id, opts = {}) {
  const def = CARD[id], rar = RARITIES[def.rarity];
  const el = document.createElement('div');
  el.className = `card r-${def.rarity} t-${def.type}` + (rar.order >= 3 ? ' full' : '');
  el.dataset.id = id;
  const layered = rar.layers && !opts.flat;
  const art = layered
    ? [0, 1, 2, 3].map((i) => `<img class="art-l l${i}" src="art/${id}_l${i}.webp" alt="" draggable="false" loading="lazy">`).join('')
    : `<img class="art-l flat" src="${opts.thumb ? artThumb(id) : artFlat(id)}" alt="" draggable="false" loading="lazy">`;
  const foil = rar.foil;
  const fx = (name) => (foil.includes(name) ? `<div class="fx ${name}"></div>` : '');
  const len = def.name.length;
  const nameSize = len > 24 ? 4.5 : len > 19 ? 5.2 : len > 14 ? 6 : 6.9;
  const plain = def.text.replace(/<[^>]+>/g, '');
  const textSize = plain.length > 60 ? 5.3 : plain.length > 36 ? 5.9 : 6.6;
  el.innerHTML = `
    <div class="card-tilt">
      <div class="card-face">
        <div class="rim"></div>
        <div class="body"></div>
        <div class="art">${art}${fx('holo')}</div>
        <div class="plate"></div>
        <div class="fxs">${fx('oil')}${foil.includes('oil') ? '<div class="fx oil2"></div>' : ''}${fx('glitter')}${foil.includes('glitter') ? '<div class="fx flakes"></div>' : ''}${fx('prism')}${foil.includes('prism') ? '<div class="fx rays"></div>' : ''}</div>
        <div class="name" style="font-size:${nameSize}cqw">${def.name}</div>
        <div class="text" style="font-size:${textSize}cqw"><span>${def.text || `<i>${def.flavor}</i>`}</span></div>
        <div class="kind"><span class="gem"></span>${rar.name} ${def.type}</div>
        <div class="cost"><span>${def.cost}</span></div>
        ${def.type === 'minion' ? `<div class="atk"><span>${def.atk}</span></div><div class="hp"><span>${def.hp}</span></div>` : ''}
        ${foil.includes('shine') ? '<div class="fx shine"></div>' : ''}
        <div class="fx glare"></div>
        ${opts.count !== undefined ? `<div class="count">×${opts.count}</div>` : ''}
      </div>
    </div>`;
  return el;
}

/** A face-down card that can be turned over: `flip.classList.add('up')`. */
export function flipCardEl(id, opts = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'flip';
  const inner = document.createElement('div');
  inner.className = 'flip-inner';
  const back = document.createElement('div');
  back.className = 'card-back';
  const front = cardEl(id, opts);
  front.classList.add('flip-front');
  inner.append(back, front);
  wrap.append(inner);
  wrap.card = front;
  return wrap;
}

// ---------------------------------------------------------------------------------------------------- the foil

const live = new Map();     // element -> { x, y, tx, ty, o, to, held, t0, sway }
let running = false;

function loop(now) {
  if (!live.size) { running = false; return; }
  for (const [el, s] of live) {
    if (!el.isConnected) { live.delete(el); continue; }
    if (!s.held && s.sway) {
      // nobody is holding it: the light wanders in a slow figure of eight
      const t = (now - s.t0) / 1000;
      s.tx = 0.5 + Math.sin(t * 0.9) * 0.34;
      s.ty = 0.5 + Math.sin(t * 1.8 + 0.6) * 0.22;
      s.to = 1;
    }
    const k = s.held ? 0.22 : 0.07;
    s.x += (s.tx - s.x) * k;
    s.y += (s.ty - s.y) * k;
    s.o += (s.to - s.o) * 0.1;
    const st = el.style;
    st.setProperty('--mx', (s.x * 100).toFixed(2) + '%');
    st.setProperty('--my', (s.y * 100).toFixed(2) + '%');
    st.setProperty('--px', ((s.x - 0.5) * 2).toFixed(3));
    st.setProperty('--py', ((s.y - 0.5) * 2).toFixed(3));
    st.setProperty('--o', s.o.toFixed(3));
    if (!s.held && !s.sway && s.o < 0.01 && Math.abs(s.x - 0.5) < 0.005 && Math.abs(s.y - 0.5) < 0.005) {
      live.delete(el);
      el.classList.remove('live');
    }
  }
  requestAnimationFrame(loop);
}

function wake(el, sway) {
  let s = live.get(el);
  if (!s) {
    s = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, o: 0, to: 0, held: false, t0: performance.now(), sway };
    live.set(el, s);
    el.classList.add('live');
    if (!running) { running = true; requestAnimationFrame(loop); }
  }
  s.sway = sway;
  return s;
}

/** Make a card's foil answer the pointer. `sway`: keep shimmering by itself when nobody is touching it (the inspector
 *  and a pack's cards); otherwise it only wakes while hovered or held. */
export function foilOn(el, { sway = false } = {}) {
  if (el._foil) { if (sway) wake(el, true); return; }
  el._foil = true;
  const at = (e) => {
    const s = wake(el, sway), box = el.getBoundingClientRect();
    s.held = true;
    s.tx = Math.max(0, Math.min(1, (e.clientX - box.left) / box.width));
    s.ty = Math.max(0, Math.min(1, (e.clientY - box.top) / box.height));
    s.to = 1;
  };
  const off = () => {
    const s = live.get(el);
    if (!s) return;
    s.held = false;
    s.t0 = performance.now() - 1700;       // pick the sway up near the middle rather than jumping
    if (!s.sway) { s.tx = 0.5; s.ty = 0.5; s.to = 0; }
  };
  el.addEventListener('pointermove', at);
  el.addEventListener('pointerdown', at);
  el.addEventListener('pointerleave', off);
  el.addEventListener('pointercancel', off);
  el.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') off(); });
  if (sway) wake(el, true);
}

/** Let the foil follow the phone as it is tilted (asked for once, on a tap, as iOS insists). */
let tiltAsked = false;
export function askTilt() {
  if (tiltAsked) return;
  tiltAsked = true;
  const start = () => window.addEventListener('deviceorientation', (e) => {
    if (e.beta === null || e.gamma === null) return;
    const x = Math.max(0, Math.min(1, 0.5 + e.gamma / 50)), y = Math.max(0, Math.min(1, 0.5 + (e.beta - 45) / 60));
    for (const s of live.values()) if (s.sway && !s.touching) { s.held = true; s.tx = x; s.ty = y; s.to = 1; }
  });
  try {
    const D = window.DeviceOrientationEvent;
    if (D && typeof D.requestPermission === 'function') D.requestPermission().then((r) => { if (r === 'granted') start(); }).catch(() => {});
    else if (D && matchMedia('(pointer: coarse)').matches) start();
  } catch (e) { /* no tilt, the finger still works */ }
}
