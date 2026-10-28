// The game's own sounds, as AAC (iPhone Safari plays no Ogg). iOS keeps the sound asleep until the player has touched
// the screen once, so everything is loaded into one AudioContext that is woken by the first touch; until then calls do
// nothing. The player can turn it off, which is remembered.
const NAMES = ['rip_tiny', 'rip_short', 'rip_medium', 'rip_long', 'card_reveal', 'card_shatter', 'pack_good', 'pack_perfect', 'level_up', 'tick', 'card_select'];

export class Sfx {
  constructor() {
    this.ctx = null;
    this.buffers = {};
    this.on = localStorage.getItem('wick.sound') !== 'off';
    this.ready = false;
    const wake = () => this.wake();
    for (const ev of ['pointerdown', 'touchstart', 'keydown']) {
      window.addEventListener(ev, wake, { once: false, passive: true });
    }
  }

  async wake() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this._loadAll();
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
  }

  async _loadAll() {
    for (const name of NAMES) {
      try {
        // AAC in an MP4 box: named .m4a here, .mp4 where a host serves only that name for it
        let res = await fetch('sfx/' + name + '.m4a');
        if (!res.ok) res = await fetch('sfx/' + name + '.mp4');
        const raw = await res.arrayBuffer();
        this.buffers[name] = await this.ctx.decodeAudioData(raw);
      } catch (e) { /* a sound that will not load is simply never heard */ }
    }
    this.ready = true;
  }

  setOn(on) {
    this.on = on;
    localStorage.setItem('wick.sound', on ? 'on' : 'off');
    if (on) this.wake();
  }

  /**
   * The arena's own noises, made on the spot rather than recorded: a blow, a boom, a zap of lightning, a freeze, a
   * chime, a summons landing, a whoosh, a sparkle, a horn. Each kind is held back if it was just heard, so a big fight
   * is a roar and not a buzz.
   */
  synth(kind, gain = 1) {
    if (!this.on || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    this.lastSynth = this.lastSynth || {};
    if (now - (this.lastSynth[kind] || -1) < (SYNTH_GAP[kind] || 0.05)) return;
    this.lastSynth[kind] = now;
    try {
      SYNTH[kind] && SYNTH[kind](this.ctx, now, gain * 0.5);
    } catch (e) { /* never let a sound break the game */ }
  }

  /** `rate` shifts the pitch, `gain` the loudness (1 = as recorded). */
  play(name, rate = 1, gain = 1) {
    if (!this.on || !this.ctx || !this.buffers[name]) return;
    try {
      const src = this.ctx.createBufferSource();
      src.buffer = this.buffers[name];
      src.playbackRate.value = rate;
      const vol = this.ctx.createGain();
      vol.gain.value = gain;
      src.connect(vol).connect(this.ctx.destination);
      src.start();
    } catch (e) { /* never let a sound break the game */ }
  }
}

// ---------------------------------------------------------------- the arena's noises
const SYNTH_GAP = { hit: 0.06, arrow: 0.09, poof: 0.08, sparkle: 0.08, deploy: 0.05 };

function noise(ctx, seconds) {
  const n = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

function env(ctx, t, peak, attack, decay) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  g.connect(ctx.destination);
  return g;
}

function tone(ctx, t, type, f0, f1, peak, attack, decay) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + attack + decay);
  o.connect(env(ctx, t, peak, attack, decay));
  o.start(t);
  o.stop(t + attack + decay + 0.02);
}

function hiss(ctx, t, type, freq, q, peak, attack, decay) {
  const src = noise(ctx, attack + decay + 0.05);
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, t);
  f.Q.value = q;
  src.connect(f).connect(env(ctx, t, peak, attack, decay));
  src.start(t);
}

const SYNTH = {
  hit(ctx, t, g) { hiss(ctx, t, 'bandpass', 900 + Math.random() * 500, 1.2, 0.5 * g, 0.004, 0.07); tone(ctx, t, 'square', 180, 90, 0.08 * g, 0.004, 0.06); },
  arrow(ctx, t, g) { hiss(ctx, t, 'highpass', 3000, 0.7, 0.18 * g, 0.004, 0.05); },
  boom(ctx, t, g) { tone(ctx, t, 'sine', 120, 38, 0.9 * g, 0.006, 0.45); hiss(ctx, t, 'lowpass', 900, 0.6, 0.6 * g, 0.006, 0.4); },
  bigboom(ctx, t, g) { tone(ctx, t, 'sine', 90, 28, 1.2 * g, 0.01, 0.9); hiss(ctx, t, 'lowpass', 600, 0.5, 0.9 * g, 0.01, 0.9); },
  zap(ctx, t, g) { hiss(ctx, t, 'highpass', 2200, 0.8, 0.6 * g, 0.002, 0.18); tone(ctx, t, 'sawtooth', 1400, 300, 0.12 * g, 0.002, 0.15); },
  freeze(ctx, t, g) { for (const f of [1760, 2349, 2637]) tone(ctx, t + Math.random() * 0.04, 'triangle', f, f * 1.02, 0.12 * g, 0.004, 0.4); hiss(ctx, t, 'highpass', 5000, 0.5, 0.2 * g, 0.01, 0.3); },
  chime(ctx, t, g) { [784, 988, 1175].forEach((f, i) => tone(ctx, t + i * 0.06, 'triangle', f, f, 0.18 * g, 0.005, 0.5)); },
  whoosh(ctx, t, g) { hiss(ctx, t, 'bandpass', 500, 0.8, 0.5 * g, 0.08, 0.3); },
  sparkle(ctx, t, g) { [1568, 2093].forEach((f, i) => tone(ctx, t + i * 0.05, 'sine', f, f, 0.12 * g, 0.004, 0.18)); },
  deploy(ctx, t, g) { tone(ctx, t, 'sine', 160, 70, 0.5 * g, 0.004, 0.14); hiss(ctx, t, 'lowpass', 500, 0.7, 0.25 * g, 0.004, 0.1); },
  poof(ctx, t, g) { hiss(ctx, t, 'bandpass', 700, 0.6, 0.25 * g, 0.01, 0.18); },
  horn(ctx, t, g) { tone(ctx, t, 'sawtooth', 220, 220, 0.18 * g, 0.03, 0.5); tone(ctx, t + 0.02, 'sawtooth', 330, 330, 0.14 * g, 0.03, 0.5); },
  defeat(ctx, t, g) { [392, 330, 262].forEach((f, i) => tone(ctx, t + i * 0.22, 'triangle', f, f * 0.98, 0.25 * g, 0.01, 0.4)); },
  fanfare(ctx, t, g) { [523, 659, 784, 1047].forEach((f, i) => tone(ctx, t + i * 0.11, 'square', f, f, 0.12 * g, 0.005, i === 3 ? 0.6 : 0.16)); },
};
