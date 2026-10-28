// WICK · PACK OPENER — the card opening and collecting of the game (scripts/ui/PackOpening.gd, DeckBuilder.gd), on a
// phone. Pick a pack, tear it open with a finger, turn the cards over, and keep them. Every kind of pack is here and
// there is no end of them: this is the opening, not the duel.
import { PACKS, LOOK_NAMES, RANKED_TIER_NAMES, cardArt, copiesMax, hasAnim, hasScene, levelFor, levelNeed, maxLevel, nextLevel, openPack, packInfo } from './rules.js';
import { makeCard } from './card.js';
import { PackRip, loadImage } from './pack.js';
import { Shatter } from './shatter.js';
import { Sfx } from './sfx.js';
import * as Save from './save.js';

const FLIP_EVERY = 0.42;       // seconds between two cards turning over
const LEVEL_UP_HOLD = 1.1;     // a card that levels up holds the next one back this much longer

const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, cls, parent, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  if (parent) parent.appendChild(node);
  return node;
};
const sleep = (s) => new Promise((ok) => setTimeout(ok, s * 1000));

class App {
  constructor() {
    this.sfx = new Sfx();
    this.state = Save.load();
    this.cards = [];
    this.byId = {};
    this.screen = 'packs';
    this.opening = null;
  }

  async start() {
    const data = await (await fetch('data/cards.json')).json();
    this.cards = data.cards;
    for (const c of this.cards) this.byId[c.id] = c;
    this.rip = new PackRip($('#rip-canvas'), this.sfx, (grade, stat) => this._opened(grade, stat));
    await this.rip.load();
    this._bindChrome();
    this.show('packs');
    $('#loading').remove();
  }

  // ---------------------------------------------------------------- chrome
  _bindChrome() {
    for (const tab of document.querySelectorAll('.tab')) {
      tab.addEventListener('click', () => {
        this.sfx.play('tick', 1, 0.5);
        this.show(tab.dataset.go);
      });
    }
    $('#sound-btn').addEventListener('click', () => {
      this.sfx.setOn(!this.sfx.on);
      this._paintSound();
    });
    this._paintSound();
    $('#menu-btn').addEventListener('click', () => this._menu());
    $('#rip-back').addEventListener('click', () => this.show('packs'));
    $('#again').addEventListener('click', () => this._openAgain());
    $('#to-collection').addEventListener('click', () => this.show('collection'));
    $('#sheet-close').addEventListener('click', () => this._closeSheet());
    $('#sheet').addEventListener('click', (e) => { if (e.target === $('#sheet')) this._closeSheet(); });
    $('#reveal').addEventListener('pointerdown', () => {
      if (this._revealing && !this._hurry) {
        this._hurry = true;
        this.sfx.play('tick', 1.4, 0.4);
      }
    });
  }

  _paintSound() {
    $('#sound-btn').textContent = this.sfx.on ? 'SOUND ON' : 'SOUND OFF';
    $('#sound-btn').dataset.off = this.sfx.on ? '0' : '1';
  }

  show(name) {
    this.screen = name;
    for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== 'screen-' + name;
    for (const t of document.querySelectorAll('.tab')) t.dataset.on = t.dataset.go === name ? '1' : '0';
    $('#tabs').hidden = name === 'rip';
    if (name === 'packs') this._paintPacks();
    if (name === 'collection') this._paintCollection();
  }

  _save() {
    Save.save(this.state);
  }

  // ---------------------------------------------------------------- the packs
  _paintPacks() {
    const list = $('#pack-list');
    list.innerHTML = '';
    for (const pack of PACKS) {
      const row = el('button', 'pack', list);
      row.addEventListener('click', () => {
        this.sfx.play('card_select', 1, 0.6);
        this._startRip(pack.key);
      });
      const pic = el('img', 'pack-art', row);
      pic.src = 'ui/' + pack.art;
      pic.alt = '';
      const body = el('div', 'pack-body', row);
      el('div', 'pack-name', body, pack.name);
      el('div', 'pack-blurb', body, pack.blurb);
      const most = copiesMax(pack.key);
      el('div', 'pack-count', body, (most > 1 ? 'up to ' + most * 5 + ' cards' : '5 cards') + (pack.key === 'mythic' ? '  ·  + a cosmetic' : ''));
      const done = this.state.opened[pack.key] || 0;
      if (done) el('div', 'pack-opened', body, 'opened ' + done + (done === 1 ? ' time' : ' times'));
    }
    const owned = Object.keys(this.state.owned).length;
    $('#packs-note').textContent = owned
      ? owned + ' of ' + this.cards.length + ' cards found  ·  ' + Save.totalCards(this.state) + ' in all'
      : 'Tear one open: drag a finger across the top of the pack.';
  }

  // ---------------------------------------------------------------- the rip
  _startRip(key) {
    this.key = key;
    this.rip.reset(key);
    $('#rip-name').textContent = packInfo(key).name;
    $('#rip-hint').textContent = 'DRAG ACROSS THE TOP TO TEAR IT OPEN';
    $('#rip-grade').textContent = '';
    $('#rip-stage').hidden = false;
    $('#reveal').hidden = true;
    $('#reveal-cards').innerHTML = '';
    $('#reveal-foot').hidden = true;
    this.show('rip');
  }

  _openAgain() {
    this.sfx.play('card_select', 1, 0.6);
    this._startRip(this.key);
  }

  async _opened(grade, stat) {
    $('#rip-hint').textContent = '';
    $('#rip-grade').textContent = grade;
    $('#rip-grade').dataset.kind = grade === 'PERFECT!!' ? 'perfect' : (grade ? 'good' : 'none');
    if (stat && (this.state.best.avg === null || stat.avg < this.state.best.avg)) this.state.best.avg = stat.avg;
    this.state.opened[this.key] = (this.state.opened[this.key] || 0) + 1;
    const result = openPack(this.key, this.cards, this.state.owned, this.state.unlocked);
    for (const row of result.rows) this.state.owned[row.id] = row.after;
    if (result.cosmetic) {
      const bag = result.cosmetic.kind === 'anim' ? this.state.unlocked.anims : this.state.unlocked.scenes;
      if (!bag.includes(result.cosmetic.id)) bag.push(result.cosmetic.id);
    }
    this._save();
    await sleep(0.9);
    $('#rip-stage').hidden = true;
    await this._reveal(result);
  }

  /** The cards, turned over one after the other; a card that levels up breaks its old look first. A tap anywhere
   *  turns the rest over at once (the game lets a player hurry a rip the same way). */
  async _reveal(result) {
    const holder = $('#reveal-cards');
    $('#reveal').hidden = false;
    this._revealing = true;
    this._hurry = false;
    const made = [];
    for (const row of result.rows) {
      const card = this.byId[row.id];
      const slot = el('div', 'slot', holder);
      const inst = makeCard(card, { faceDown: true, level: row.levelBefore || 1, showLevel: true });
      inst.setArt(cardArt(card, { ...this.state.owned, [row.id]: row.before }, this.state.unlocked, this.state.artPicks));
      slot.appendChild(inst.el);
      const note = el('div', 'slot-note', slot, '');
      made.push({ inst, row, slot, note });
    }
    for (const m of made) {
      if (this._hurry) {
        m.inst.setFaceDown(false);
        m.slot.dataset.shown = '1';
        if (m.row.level > m.row.levelBefore) {
          m.inst.setLevel(m.row.level);
          m.inst.setArt(cardArt(this.byId[m.row.id], this.state.owned, this.state.unlocked, this.state.artPicks));
          m.slot.dataset.up = '1';
        }
        this._note(m);
        continue;
      }
      await sleep(FLIP_EVERY);
      m.inst.setFaceDown(false);
      m.slot.dataset.shown = '1';
      this.sfx.play('card_reveal', 0.95 + Math.random() * 0.1, 0.8);
      if (m.row.level > m.row.levelBefore) {
        await sleep(0.38);
        await this._levelUp(m);
      } else {
        this._note(m);
      }
    }
    this._revealing = false;
    if (result.cosmetic) {
      await sleep(0.5);
      await this._unlock(result.cosmetic);
    }
    $('#reveal-foot').hidden = false;
    const got = result.rows.reduce((a, r) => a + r.copies, 0);
    $('#reveal-sum').textContent = got + ' cards  ·  ' + result.rows.filter((r) => r.isNew).length + ' new';
  }

  _note({ inst, row, note }) {
    const card = this.byId[row.id];
    const bits = [];
    if (row.copies > 1) bits.push('x' + row.copies);
    bits.push(row.isNew ? 'NEW' : 'x' + row.after + ' owned');
    if (row.level > row.levelBefore) bits.push('LEVEL ' + row.level);
    else {
      const next = nextLevel(row.after, card);
      if (next) bits.push(next.left + ' more for level ' + next.level);
    }
    note.textContent = bits.join('  ·  ');
    note.dataset.up = row.level > row.levelBefore ? '1' : '0';
  }

  /** The old look cracks and breaks like glass; the new one is under it. */
  async _levelUp(m) {
    const box = m.inst.el.getBoundingClientRect();
    const glass = el('canvas', 'glass', m.slot);
    glass.width = 300;
    glass.height = 400;
    const done = new Promise((ok) => {
      const s = new Shatter(glass, { w: 300, h: 400, impact: [150 + (Math.random() - 0.5) * 120, 200 + (Math.random() - 0.5) * 140] }, () => {
        glass.remove();
        ok();
      });
      this.sfx.play('card_shatter', 2.0, 0.35);
      s.crack(0.22);
      setTimeout(() => {
        s.burst();
        const card = this.byId[m.row.id];
        m.inst.setLevel(m.row.level);
        m.inst.setArt(cardArt(card, this.state.owned, this.state.unlocked, this.state.artPicks));
        this.sfx.play('card_shatter', 0.95 + Math.random() * 0.1);
        this.sfx.play('level_up', 1 + 0.06 * (m.row.level - 2), 0.8);
        m.slot.dataset.up = '1';
        this._note(m);
      }, 220);
    });
    await Promise.race([done, sleep(2.5).then(() => { glass.remove(); })]);
    await sleep(this._hurry ? 0 : LEVEL_UP_HOLD - 0.6);
  }

  /** A Mythic Pack's cosmetic: a black card with a lock breaks, and what was locked is under it. */
  async _unlock(cos) {
    const card = this.byId[cos.id];
    const rare = cos.kind === 'anim';
    const wrap = $('#unlock');
    wrap.hidden = false;
    wrap.dataset.rare = rare ? '1' : '0';
    $('#unlock-kind').textContent = rare ? 'ANIMATION' : 'SCENE';
    $('#unlock-new').hidden = true;
    $('#unlock-name').textContent = '';
    $('#unlock-hint').textContent = '';
    const stage = $('#unlock-stage');
    stage.innerHTML = '';
    const inst = makeCard(card, { level: Math.max(1, levelFor(this.state.owned[card.id] || 0, card)), showLevel: true });
    inst.setArt(rare ? 'anim' : 'alt');
    stage.appendChild(inst.el);
    const lock = el('img', 'lock-card', stage);
    lock.src = 'ui/unlock_card.png';
    await sleep(0.45);
    lock.dataset.shake = '1';
    this.sfx.play('card_reveal', 0.8, 0.9);
    await sleep(0.6);
    lock.hidden = true;
    const glass = el('canvas', 'glass glass-lock', stage);
    glass.width = 300;
    glass.height = 400;
    const img = await loadImage('ui/unlock_card.png');
    const out = () => {                      // what is under the glass, once it has given way
      $('#unlock-new').hidden = false;
      $('#unlock-name').textContent = cos.name.toUpperCase();
      $('#unlock-hint').textContent = rare
        ? 'A RARE ONE: the scene MOVES, at any level. The card keeps its own level, stars and tint.'
        : 'The card may wear its SCENE at any level. Its level, stars and tint stay its own.';
      stage.dataset.out = '1';
    };
    const broke = new Promise((ok) => {
      const s = new Shatter(glass, { w: 300, h: 400, img, rainbow: rare, impact: [150 + (Math.random() - 0.5) * 40, 208 + (Math.random() - 0.5) * 40] }, () => {
        glass.remove();
        ok();
      });
      this.sfx.play('card_shatter', 2.0, 0.4);
      s.crack(0.3);
      setTimeout(() => {
        s.burst();
        this.sfx.play('card_shatter', rare ? 0.92 : 1);
        this.sfx.play(rare ? 'pack_perfect' : 'pack_good');
        out();
      }, 300);
    });
    // a phone that goes to sleep mid-break stops the frames: never let that hold the unlock up for ever
    await Promise.race([broke, sleep(3)]);
    if (glass.isConnected) glass.remove();
    out();
    await new Promise((ok) => {
      const go = $('#unlock-go');
      go.hidden = false;
      go.onclick = () => {
        this.sfx.play('card_select', 1, 0.6);
        go.hidden = true;
        wrap.hidden = true;
        stage.dataset.out = '0';
        inst.free();
        stage.innerHTML = '';
        ok();
      };
    });
  }

  // ---------------------------------------------------------------- the collection
  _paintCollection() {
    const grid = $('#grid');
    grid.innerHTML = '';
    if (this._shown) for (const c of this._shown) c.free();
    this._shown = [];
    const owned = this.cards.filter((c) => (this.state.owned[c.id] || 0) > 0);
    const missing = this.cards.length - owned.length;
    $('#collection-note').textContent = owned.length + ' of ' + this.cards.length + ' cards  ·  ' + Save.totalCards(this.state) + ' copies'
      + (missing ? '  ·  ' + missing + ' still to find' : '  ·  every card found');
    const order = this.cards.slice().sort((a, b) => {
      const ca = this.state.owned[a.id] || 0, cb = this.state.owned[b.id] || 0;
      if ((ca > 0) !== (cb > 0)) return cb - ca;
      return levelFor(cb, b) - levelFor(ca, a) || a.cost - b.cost || a.name.localeCompare(b.name);
    });
    for (const card of order) {
      const copies = this.state.owned[card.id] || 0;
      const cell = el('button', 'cell', grid);
      cell.dataset.owned = copies > 0 ? '1' : '0';
      const inst = makeCard(card, { level: levelFor(copies, card), look: this.state.looks[card.id], showLevel: true });
      inst.setArt(copies > 0 ? cardArt(card, this.state.owned, this.state.unlocked, this.state.artPicks) : 'classic');
      cell.appendChild(inst.el);
      this._shown.push(inst);
      el('div', 'cell-tag', cell, copies > 0 ? 'x' + copies : 'not found');
      cell.addEventListener('click', () => {
        this.sfx.play('tick', 1.2, 0.4);
        this._sheet(card);
      });
    }
  }

  /** One card, large, with what it may wear. */
  _sheet(card) {
    const sheet = $('#sheet');
    const stage = $('#sheet-card');
    stage.innerHTML = '';
    if (this._sheetCard) this._sheetCard.free();
    const copies = this.state.owned[card.id] || 0;
    const lv = levelFor(copies, card);
    const inst = makeCard(card, { level: lv, look: this.state.looks[card.id], showLevel: true });
    inst.setArt(copies > 0 ? cardArt(card, this.state.owned, this.state.unlocked, this.state.artPicks) : 'classic');
    stage.appendChild(inst.el);
    this._sheetCard = inst;
    $('#sheet-name').textContent = card.name;
    const next = nextLevel(copies, card);
    $('#sheet-copies').textContent = copies > 0
      ? 'x' + copies + ' owned  ·  LEVEL ' + lv + (next ? '  ·  ' + next.left + ' more for level ' + next.level : '  ·  top level')
      : 'Not found yet.';
    // the tints it may wear
    const looks = $('#sheet-looks');
    looks.innerHTML = '';
    for (let i = 1; i <= maxLevel(card); i++) {
      const b = el('button', 'chip', looks, 'LV ' + i);
      const wearing = (this.state.looks[card.id] || lv) === i;
      b.dataset.on = wearing && copies > 0 ? '1' : '0';
      b.disabled = i > lv;
      b.title = i <= lv ? '' : 'Reach level ' + i + ' first (' + levelNeed(i, card) + ' copies)';
      b.addEventListener('click', () => {
        this.state.looks[card.id] = i === lv ? undefined : i;
        if (this.state.looks[card.id] === undefined) delete this.state.looks[card.id];
        this._save();
        this.sfx.play('card_select', 1 + 0.05 * i, 0.5);
        this._sheet(card);
        this._paintCollection();
      });
    }
    // and which picture
    const arts = $('#sheet-arts');
    arts.innerHTML = '';
    const scene = hasScene(card, this.state.owned, this.state.unlocked);
    const moves = hasAnim(card, this.state.owned, this.state.unlocked);
    const wearing = copies > 0 ? cardArt(card, this.state.owned, this.state.unlocked, this.state.artPicks) : 'classic';
    const choices = [['classic', 'CLASSIC', true], ['alt', 'SCENE', scene]];
    if (card.anim) choices.push(['anim', 'IT MOVES', moves]);
    for (const [key, label, can] of choices) {
      const b = el('button', 'chip', arts, label);
      b.dataset.on = wearing === key ? '1' : '0';
      b.disabled = !can || copies <= 0;
      b.addEventListener('click', () => {
        this.state.artPicks[card.id] = key;
        this._save();
        this.sfx.play('card_select', 1, 0.5);
        this._sheet(card);
        this._paintCollection();
      });
    }
    $('#sheet-art-note').textContent = !scene
      ? 'The scene unlocks at level 6 (' + levelNeed(6, card) + ' copies), or comes out of a Mythic Pack.'
      : (card.anim && !moves
        ? 'At level 7 (' + levelNeed(7, card) + ' copies) the scene MOVES; a Mythic Pack may hold the animation too.'
        : (moves ? 'The scene is alive.' : 'Full art: the scene fills the whole card.'));
    sheet.hidden = false;
  }

  _closeSheet() {
    $('#sheet').hidden = true;
    if (this._sheetCard) {
      this._sheetCard.free();
      this._sheetCard = null;
    }
  }

  // ---------------------------------------------------------------- the menu behind the dots
  _menu() {
    const lines = [
      'WICK · PACK OPENER',
      '',
      Save.totalCards(this.state) + ' cards, ' + Object.keys(this.state.owned).length + ' of ' + this.cards.length + ' different',
      this.state.best.avg !== null ? 'straightest rip: ' + this.state.best.avg.toFixed(2) + ' px off the line' : '',
      '',
      'EXPORT copies your collection to the clipboard; IMPORT takes one back.',
    ].filter(Boolean);
    const what = prompt(lines.join('\n') + '\n\nType: export, import, or wipe', '');
    if (!what) return;
    const word = what.trim().toLowerCase();
    if (word === 'export') {
      const text = Save.toText(this.state);
      navigator.clipboard?.writeText(text).catch(() => {});
      prompt('Your collection (copy this):', text);
    } else if (word === 'import') {
      const text = prompt('Paste a collection:', '');
      if (!text) return;
      try {
        this.state = Save.fromText(text);
        this._save();
        this.show('collection');
      } catch (e) {
        alert('That is not a WICK collection.');
      }
    } else if (word === 'wipe') {
      if (confirm('Throw the whole collection away?')) {
        Save.wipe();
        this.state = Save.load();
        this.show('packs');
      }
    }
  }
}

const app = new App();
app.start();
window.wick = app;

// the service worker: it is what makes the app work with no signal once it is on the home screen
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
