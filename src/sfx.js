// Sound. The pack sounds are recordings (sfx/*.m4a, from the WICK pack opener); everything in a duel is made on the
// spot with a few oscillators, so there is nothing else to download. Browsers keep sound asleep until the first
// touch, so the context is woken by it; until then calls do nothing. The on/off switch is remembered.
const FILES = ['rip_tiny', 'rip_short', 'rip_medium', 'rip_long', 'card_reveal', 'card_select', 'pack_good', 'pack_perfect', 'level_up', 'tick', 'card_shatter'];

class Sfx {
  constructor() {
    this.ctx = null;
    this.buffers = {};
    this.on = true;
    try { this.on = localStorage.getItem('nacre.sound') !== 'off'; } catch (e) { /* no storage */ }
    const wake = () => this.wake();
    for (const ev of ['pointerdown', 'touchstart', 'keydown']) window.addEventListener(ev, wake, { passive: true });
  }

  async wake() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.out = this.ctx.createGain();
      this.out.gain.value = 0.7;
      this.out.connect(this.ctx.destination);
      this._loadAll();
    }
    if (this.ctx.state === 'suspended') { try { await this.ctx.resume(); } catch (e) { /* still asleep */ } }
  }

  async _loadAll() {
    for (const name of FILES) {
      try {
        const raw = await (await fetch('sfx/' + name + '.m4a')).arrayBuffer();
        this.buffers[name] = await this.ctx.decodeAudioData(raw);
      } catch (e) { /* a sound that will not load is simply never heard */ }
    }
  }

  setOn(on) {
    this.on = on;
    try { localStorage.setItem('nacre.sound', on ? 'on' : 'off'); } catch (e) { /* no storage */ }
    if (on) this.wake();
  }

  /** A recording, or one of the made-up sounds below. `rate` shifts the pitch, `gain` the loudness. */
  play(name, rate = 1, gain = 1) {
    if (!this.on || !this.ctx || this.ctx.state !== 'running') return;
    try {
      if (this.buffers[name]) {
        const src = this.ctx.createBufferSource();
        src.buffer = this.buffers[name];
        src.playbackRate.value = rate;
        const vol = this.ctx.createGain();
        vol.gain.value = gain;
        src.connect(vol).connect(this.out);
        src.start();
      } else if (SYNTH[name]) SYNTH[name](this, rate, gain);
    } catch (e) { /* never let a sound break the game */ }
  }

  tone({ f = 440, f2 = null, t = 0.2, type = 'sine', gain = 0.3, at = 0, attack = 0.005 }) {
    const c = this.ctx, t0 = c.currentTime + at;
    const o = c.createOscillator(), v = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + t);
    v.gain.setValueAtTime(0.0001, t0);
    v.gain.exponentialRampToValueAtTime(gain, t0 + attack);
    v.gain.exponentialRampToValueAtTime(0.0001, t0 + t);
    o.connect(v).connect(this.out);
    o.start(t0);
    o.stop(t0 + t + 0.02);
  }

  noise({ t = 0.2, gain = 0.3, at = 0, f = 1200, f2 = null, q = 1, type = 'lowpass' }) {
    const c = this.ctx, t0 = c.currentTime + at;
    const len = Math.ceil(c.sampleRate * t), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(), flt = c.createBiquadFilter(), v = c.createGain();
    src.buffer = buf;
    flt.type = type; flt.Q.value = q;
    flt.frequency.setValueAtTime(f, t0);
    if (f2) flt.frequency.exponentialRampToValueAtTime(f2, t0 + t);
    v.gain.setValueAtTime(gain, t0);
    v.gain.exponentialRampToValueAtTime(0.0001, t0 + t);
    src.connect(flt).connect(v).connect(this.out);
    src.start(t0);
  }
}

const SYNTH = {
  tap: (s) => s.tone({ f: 660, f2: 880, t: 0.06, type: 'triangle', gain: 0.12 }),
  place: (s) => { s.noise({ t: 0.18, gain: 0.35, f: 500, f2: 120 }); s.tone({ f: 150, f2: 70, t: 0.2, gain: 0.35 }); },
  draw: (s) => s.noise({ t: 0.12, gain: 0.12, f: 2500, f2: 6000, type: 'bandpass', q: 2 }),
  hit: (s) => { s.noise({ t: 0.16, gain: 0.5, f: 900, f2: 150 }); s.tone({ f: 120, f2: 50, t: 0.18, gain: 0.45, type: 'triangle' }); },
  ting: (s) => { s.tone({ f: 2100, t: 0.5, gain: 0.16 }); s.tone({ f: 3150, t: 0.35, gain: 0.08 }); },
  zap: (s) => { s.tone({ f: 1400, f2: 180, t: 0.22, type: 'sawtooth', gain: 0.14 }); s.noise({ t: 0.2, gain: 0.2, f: 5000, f2: 800, type: 'bandpass', q: 3 }); },
  wave: (s) => { s.noise({ t: 0.9, gain: 0.4, f: 300, f2: 2400, type: 'bandpass', q: 0.8 }); s.tone({ f: 70, f2: 40, t: 0.8, gain: 0.3 }); },
  heal: (s) => [523, 659, 784].forEach((f, i) => s.tone({ f, t: 0.35, gain: 0.13, at: i * 0.07 })),
  buff: (s) => [392, 523, 784].forEach((f, i) => s.tone({ f, t: 0.25, gain: 0.12, type: 'triangle', at: i * 0.05 })),
  death: (s) => { s.tone({ f: 300, f2: 60, t: 0.4, type: 'sawtooth', gain: 0.1 }); s.noise({ t: 0.35, gain: 0.2, f: 1800, f2: 200 }); },
  turn: (s) => { s.tone({ f: 587, t: 0.5, gain: 0.16 }); s.tone({ f: 880, t: 0.6, gain: 0.12, at: 0.09 }); },
  error: (s) => s.tone({ f: 160, f2: 110, t: 0.16, type: 'square', gain: 0.07 }),
  coin: (s) => { s.tone({ f: 1320, t: 0.09, gain: 0.14, type: 'triangle' }); s.tone({ f: 1760, t: 0.25, gain: 0.14, type: 'triangle', at: 0.07 }); },
  win: (s) => [523, 659, 784, 1047, 1319].forEach((f, i) => s.tone({ f, t: 0.6, gain: 0.16, type: 'triangle', at: i * 0.11 })),
  lose: (s) => [392, 330, 262, 196].forEach((f, i) => s.tone({ f, t: 0.7, gain: 0.14, type: 'triangle', at: i * 0.16 })),
  shimmer: (s, rate = 1) => [1568, 2093, 2637, 3136].forEach((f, i) => s.tone({ f: f * rate, t: 0.5, gain: 0.07, at: i * 0.05 })),
  legend: (s) => { [262, 392, 523, 659, 784, 1047].forEach((f, i) => s.tone({ f, t: 1.2, gain: 0.12, type: 'triangle', at: i * 0.08 })); s.noise({ t: 1.2, gain: 0.15, f: 800, f2: 8000, type: 'bandpass', q: 1 }); },
};

export const sfx = new Sfx();
