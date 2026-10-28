// THE iPHONE DUO, AND WHICH WAY IT IS OPEN. The Duo is a book: folded, it is a short wide phone (the cover screen,
// about 466 x 678); open, it is a small tablet with a crease down the middle (about 890 x 626, or 626 x 890 held the
// other way). The app is laid out for whichever it is right now, and changes on the spot when the phone is opened or
// closed, in the middle of a battle or not.
//
// Safari on the Duo can tell a page about the fold itself (the Device Posture and Viewport Segments APIs), but only
// with those turned on under Settings > Apps > Safari > Advanced > Feature Flags. When they are there they are used;
// when not, the shape of the screen says it well enough. And a player can always set it by hand.

const OPEN_MIN = 560;          // the short side of the open Duo is ~626; of the cover screen, ~466

let override = 'auto';
try { override = localStorage.getItem('wick.form') || 'auto'; } catch (e) { /* private mode */ }

/**
 * What the screen is now: {kind: 'open' | 'cover' | 'phone', land (wider than tall), crease: {axis: 'x'|'y', at} or
 * null, folded (half-open like a laptop, where the browser says so), source: what told us}.
 */
export function form() {
  const w = window.innerWidth, h = window.innerHeight;
  const land = w > h;
  const short = Math.min(w, h), ratio = Math.max(w, h) / Math.max(1, short);
  let kind, source = 'shape';
  const segs = window.viewport && window.viewport.segments;
  if (segs && segs.length === 2) {
    kind = 'open';
    source = 'segments';
  } else if (ratio >= 1.75) {
    kind = 'phone';
  } else {
    kind = short >= OPEN_MIN ? 'open' : 'cover';
  }
  if (override === 'open' || override === 'cover') {
    kind = override;
    source = 'setting';
  }
  let crease = null;
  if (kind === 'open') {
    if (segs && segs.length === 2) {
      const [a, b] = segs;
      crease = Math.abs(a.y - b.y) > Math.abs(a.x - b.x)
        ? { axis: 'y', at: (a.y + a.height + b.y) / 2 }
        : { axis: 'x', at: (a.x + a.width + b.x) / 2 };
    } else {
      // a book: the fold runs down the middle of the long side
      crease = land ? { axis: 'x', at: w / 2 } : { axis: 'y', at: h / 2 };
    }
  }
  const posture = navigator.devicePosture && navigator.devicePosture.type;
  return { kind, land, crease, folded: posture === 'folded', source, w, h };
}

export function getOverride() {
  return override;
}

export function setOverride(v) {
  override = v;
  try { localStorage.setItem('wick.form', v); } catch (e) { /* private mode */ }
  fire();
}

const listeners = new Set();
let last = '';
function fire() {
  const f = form();
  const key = [f.kind, f.land, f.folded, f.w, f.h].join(':');
  if (key === last) return;
  last = key;
  document.documentElement.dataset.form = f.kind;
  document.documentElement.dataset.land = f.land ? '1' : '0';
  for (const cb of listeners) cb(f);
}

/** Calls `cb(form)` now and whenever the phone is opened, closed or turned. */
export function watch(cb) {
  listeners.add(cb);
  cb(form());
  return () => listeners.delete(cb);
}

let timer = 0;
const soon = () => {
  clearTimeout(timer);
  timer = setTimeout(fire, 60);
};
window.addEventListener('resize', soon);
window.addEventListener('orientationchange', soon);
if (navigator.devicePosture && navigator.devicePosture.addEventListener) navigator.devicePosture.addEventListener('change', soon);
if (window.viewport && window.viewport.addEventListener) window.viewport.addEventListener('resize', soon);
fire();
