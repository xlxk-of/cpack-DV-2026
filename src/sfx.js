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
        const res = await fetch('sfx/' + name + '.m4a');
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
