// A CARD FACE, laid out exactly as the game lays it out (scripts/ui/CardView.gd): 300 x 400 of stone frame, title bar
// with the casting cost, the picture, the type bar, the rules and the stat box. From level 6 the picture is FULL ART
// (the scene fills the card and the writing lies on translucent panels); at level 7 the scene MOVES and the card is
// BARE: its name and its cost in gold, and nothing else written on it. The border and the sheen are the card's LEVEL.
import { LEVEL_NEED, cardArt, hasAnim, hasScene, levelFor, maxLevel } from './rules.js';

const ART_RECT = [23, 65, 254, 184];
const FULL_RECT = [6, 6, 288, 388];
const FULL_PANELS = [[20, 20, 260, 38], [20, 256, 260, 32], [20, 292, 260, 82]];
const STAT_BOX = [196, 366, 84, 26];
const FPS = 12;

let running = [];        // the animated cards on the screen, stepped together by one clock

function px(el, rect) {
  el.style.left = rect[0] + 'px';
  el.style.top = rect[1] + 'px';
  el.style.width = rect[2] + 'px';
  el.style.height = rect[3] + 'px';
}

function div(cls, parent, rect) {
  const el = document.createElement('div');
  el.className = cls;
  if (rect) px(el, rect);
  if (parent) parent.appendChild(el);
  return el;
}

/**
 * Builds a card. `opts`: {level, look, art ('classic'|'alt'|'anim'), faceDown, showLevel}. The node is 300 x 400;
 * scale it to fit. Call update() on it to re-read the collection, and free() when it goes.
 */
export function makeCard(card, opts = {}) {
  const root = document.createElement('div');
  root.className = 'card';
  root.dataset.id = card.id;
  const glow = div('card-glow', root);          // the border's light, outside the card
  const flip = div('card-flip', root);         // face and back, turned over together
  const face = div('card-face', flip);
  const frame = document.createElement('img');
  frame.className = 'card-frame';
  frame.src = 'ui/card_face.png';
  frame.draggable = false;
  face.appendChild(frame);
  const window_ = div('card-window', face);
  const art = document.createElement('img');
  art.className = 'card-art';
  art.draggable = false;
  window_.appendChild(art);
  const layers = [0, 1, 2, 3].map(() => div('card-layer', window_));
  const panels = FULL_PANELS.map((r, i) => {
    const p = div('card-panel', face, r);
    p.style.background = 'rgba(8,5,13,' + (i < 2 ? 0.62 : 0.7) + ')';
    return p;
  });
  const statBox = div('card-statbox', face, STAT_BOX);
  const sheen = div('card-sheen', face);        // level 5+: the holographic light over the face
  const title = div('card-title', face, [30, 24, 170, 32]);
  const costCap = div('card-costcap', face, [196, 22, 50, 36]);
  costCap.textContent = 'Casting\nCost:';
  const cost = div('card-cost', face, [240, 22, 24, 36]);
  const pip = document.createElement('img');
  pip.className = 'card-pip';
  px(pip, [262, 30, 20, 20]);
  face.appendChild(pip);
  const type = div('card-type', face, [30, 259, 200, 28]);
  const pip2 = document.createElement('img');
  pip2.className = 'card-pip';
  px(pip2, [254, 263, 20, 20]);
  face.appendChild(pip2);
  const text = div('card-text', face, [30, 298, 240, 70]);
  const stats = div('card-stats', face, [198, 368, 80, 24]);
  const stars = div('card-stars', face);
  const back = document.createElement('img');
  back.className = 'card-back';
  back.src = 'ui/card_back.png';
  back.draggable = false;
  flip.appendChild(back);

  const state = { level: opts.level || 0, look: -1, art: opts.art || 'classic', anim: null, frame: -1, t: 0 };

  function dress() {
    const lv = state.level;
    const look = state.look < 0 ? lv : Math.min(state.look, lv);
    const full = state.art !== 'classic';
    const bare = state.art === 'anim';
    root.dataset.level = lv;
    root.dataset.look = look;
    root.dataset.full = full ? '1' : '0';
    root.dataset.bare = bare ? '1' : '0';
    px(window_, full ? FULL_RECT : ART_RECT);
    art.style.width = (full ? FULL_RECT[2] : ART_RECT[2]) + 'px';
    art.style.height = (full ? FULL_RECT[3] : ART_RECT[3]) + 'px';
    panels.forEach((p, i) => { p.style.display = full && !(bare && i > 0) ? 'block' : 'none'; });
    statBox.style.display = full && !bare ? 'block' : 'none';
    [costCap, type, pip2, text, stats].forEach((el) => { el.style.display = bare ? 'none' : 'block'; });
    pip.style.display = bare ? 'none' : 'block';
    sheen.style.display = look >= 5 ? 'block' : 'none';
    stars.innerHTML = '';
    if (opts.showLevel !== false) {
      for (let i = 0; i < lv; i++) {
        const s = document.createElement('img');
        s.src = 'ui/star.png';
        s.className = 'card-star';
        stars.appendChild(s);
      }
    }
  }

  function setArt(which) {
    state.art = which;
    stopAnim();
    if (which === 'anim' && card.anim) {
      art.style.display = 'none';
      layers.forEach((el, n) => {
        el.style.display = 'block';
        const cols = card.anim.cols;
        const rows = Math.ceil(card.anim.frames / cols);
        el.style.backgroundImage = 'url(art/' + card.id + '_anim_l' + n + '.png)';
        el.style.backgroundSize = (cols * FULL_RECT[2]) + 'px ' + (rows * FULL_RECT[3]) + 'px';
      });
      state.anim = card.anim;
      state.frame = -1;
      step(0);
      if (!running.includes(inst)) running.push(inst);
    } else {
      art.style.display = 'block';
      layers.forEach((el) => { el.style.display = 'none'; });
      art.src = 'art/' + card.id + (which === 'alt' ? '_alt' : '') + '.png';
    }
    dress();
  }

  function stopAnim() {
    state.anim = null;
    const at = running.indexOf(inst);
    if (at >= 0) running.splice(at, 1);
  }

  function step(dt) {
    if (!state.anim) return;
    state.t += dt;
    const n = Math.floor(state.t * FPS) % state.anim.frames;
    if (n === state.frame) return;
    state.frame = n;
    const cols = state.anim.cols;
    const x = -(n % cols) * FULL_RECT[2];
    const y = -Math.floor(n / cols) * FULL_RECT[3];
    layers.forEach((el) => { el.style.backgroundPosition = x + 'px ' + y + 'px'; });
  }

  const inst = {
    el: root,
    card,
    step,
    free: stopAnim,
    setFaceDown(down) { root.dataset.down = down ? '1' : '0'; },
    setLevel(lv, look) {
      state.level = Math.max(0, Math.min(maxLevel(card), lv));
      state.look = look === undefined ? -1 : look;
      dress();
    },
    setArt,
    get level() { return state.level; },
  };

  title.textContent = card.name;
  cost.textContent = String(card.cost);
  type.textContent = card.type;
  text.textContent = card.text;
  text.style.fontSize = card.text.length <= 120 ? '13px' : '11px';
  stats.textContent = card.power + ' / ' + card.secondary;
  pip.src = pip2.src = 'ui/pip_' + card.school + '.png';
  inst.setFaceDown(!!opts.faceDown);
  setArt(opts.art || 'classic');
  inst.setLevel(opts.level || 0, opts.look);
  return inst;
}

/** One clock for every moving picture on the screen. */
let last = 0;
function tick(now) {
  const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
  last = now;
  for (const c of running.slice()) c.step(dt);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/** A card as the collection shows it: the level it has reached and the picture the player picked for it. */
export function dressFromSave(inst, save, cards) {
  const card = inst.card;
  const copies = save.owned[card.id] || 0;
  inst.setLevel(levelFor(copies, card), save.looks[card.id]);
  inst.setArt(cardArt(card, save.owned, save.unlocked, save.artPicks));
}

export { ART_RECT, FULL_RECT, LEVEL_NEED, hasAnim, hasScene };
