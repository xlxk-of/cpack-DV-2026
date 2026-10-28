// WICK · ARENA — the cards of the game (scripts/ui/PackOpening.gd, DeckBuilder.gd) on a phone, with a battle to win
// them in. Build a deck of eight, fight across the river, and every win puts a pack in a slot: light its candle, wait
// for it to burn down, and tear it open with a finger. Climb the leagues (the ranked tiers of the packs) for better
// packs. Two players can share one phone: each has a profile, and a Duo Duel puts them on either side of the river.
import {
  CROWN_GOAL, DECK_SIZE, FREE_EVERY, LEAGUE_AT, PACKS, RANKED_TIER_NAMES, SLOTS, STARTER_DECK, battleGold, cardArt,
  copiesMax, embersToOpen, hasAnim, hasScene, leagueOf, levelFor, levelNeed, maxLevel, nextLevel, openPack, packForWin,
  packInfo, packPrice, packTier, trophyChange, unlockSeconds,
} from './rules.js';
import { makeCard } from './card.js';
import { PackRip, loadImage } from './pack.js';
import { Shatter } from './shatter.js';
import { Sfx } from './sfx.js';
import * as Save from './save.js';
import { BATTLE, battleStats } from './battle/cards.js';
import { BattleScreen, crowns } from './battle/play.js';
import { PRESET_DECKS, RIVAL_DECKS, rivalFor } from './battle/decks.js';
import { getOverride, setOverride, watch } from './duo.js';

const FLIP_EVERY = 0.42;       // seconds between two cards turning over
const LEVEL_UP_HOLD = 1.1;     // a card that levels up holds the next one back this much longer
const SCHOOLS = ['fire', 'frost', 'storm', 'shadow', 'arcane', 'holy'];

const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, cls, parent, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  if (parent) parent.appendChild(node);
  return node;
};
const sleep = (s) => new Promise((ok) => setTimeout(ok, s * 1000));
const now = () => Date.now();

function hms(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  if (h) return h + 'h ' + String(m).padStart(2, '0') + 'm';
  return m + ':' + String(r).padStart(2, '0');
}

/** A league's emblem: the medallion off the middle of its Ranked Pack. */
function emblem(tier, size = 1) {
  const e = document.createElement('span');
  e.className = 'emblem';
  e.style.setProperty('--s', size);
  e.style.backgroundImage = 'url(ui/pack_ranked_' + Math.max(0, Math.min(7, tier)) + '.png)';
  return e;
}

function collector() {
  try { return localStorage.getItem('wick.collector') === '1'; } catch (e) { return false; }
}

class App {
  constructor() {
    this.sfx = new Sfx();
    this.idx = Save.index();
    this.pid = this.idx.active;
    this.state = Save.load(this.pid);
    this.cards = [];
    this.byId = {};
    this.screen = 'home';
    this.back = 'home';
    this.filter = '';
    this.swap = null;
  }

  async start() {
    const data = await (await fetch('data/cards.json')).json();
    this.cards = data.cards;
    for (const c of this.cards) this.byId[c.id] = c;
    this.rip = new PackRip($('#rip-canvas'), this.sfx, (grade, stat) => this._opened(grade, stat));
    await this.rip.load();
    this._bindChrome();
    watch((f) => this._form(f));
    this._abandoned();
    this.show('home');
    $('#loading').remove();
    setInterval(() => this._tick(), 1000);
    if (!this.state.intro) this._intro();
  }

  // ---------------------------------------------------------------- the wizard playing
  _save() {
    Save.save(this.pid, this.state);
  }

  _use(id) {
    this.idx = Save.index();
    this.idx.active = id;
    Save.saveIndex(this.idx);
    this.pid = id;
    this.state = Save.load(id);
    this._abandoned();
    this._paintBar();
    this.show(this.screen === 'rip' ? 'home' : this.screen);
    if (!this.state.intro) this._intro();
  }

  tier() {
    return leagueOf(this.state.trophies);
  }

  /** The deck being played, with only cards still owned in it. */
  deck(state = this.state) {
    return (state.decks[state.deckAt] || []).filter((id) => (state.owned[id] || 0) > 0 && this.byId[id]);
  }

  levels(state = this.state) {
    const out = {};
    for (const id of Object.keys(state.owned)) if (this.byId[id]) out[id] = Math.max(1, levelFor(state.owned[id], this.byId[id]));
    return out;
  }

  /** A side of a battle, from a profile: its deck, its levels, and the pictures and tints it has chosen. */
  _side(state, opts = {}) {
    return {
      name: state.name,
      deck: this.deck(state),
      levels: opts.fair ? {} : this.levels(state),
      human: true,
      art: (id) => ((state.owned[id] || 0) > 0 ? cardArt(this.byId[id], state.owned, state.unlocked, state.artPicks) : 'classic'),
      look: (id) => {
        const lv = levelFor(state.owned[id] || 0, this.byId[id]);
        return Math.max(1, state.looks[id] ? Math.min(state.looks[id], lv) : lv);
      },
    };
  }

  // ---------------------------------------------------------------- chrome
  _bindChrome() {
    for (const tab of document.querySelectorAll('.tab')) {
      tab.addEventListener('click', () => {
        this.sfx.play('tick', 1, 0.5);
        this.swap = null;
        this.show(tab.dataset.go);
      });
    }
    $('#sound-btn').addEventListener('click', () => {
      this.sfx.setOn(!this.sfx.on);
      this._paintSound();
    });
    this._paintSound();
    $('#who').addEventListener('click', () => this._wizards());
    $('#rip-back').addEventListener('click', () => this.show(this.back));
    $('#again').addEventListener('click', () => this._again());
    $('#to-collection').addEventListener('click', () => {
      this.sfx.play('card_select', 1, 0.6);
      this.show(this.back);
    });
    $('#sheet-close').addEventListener('click', () => this._closeSheet());
    $('#sheet').addEventListener('click', (e) => { if (e.target === $('#sheet')) this._closeSheet(); });
    $('#reveal').addEventListener('pointerdown', () => {
      if (this._revealing && !this._hurry) {
        this._hurry = true;
        this.sfx.play('tick', 1.4, 0.4);
      }
    });
    $('#go-battle').addEventListener('click', () => this._ladder());
    $('#go-duo').addEventListener('click', () => this._duoTable());
    $('#go-practice').addEventListener('click', () => this._practice());
    $('#free-pack').addEventListener('click', () => this._free());
    $('#crown-pack').addEventListener('click', () => this._crownPack());
    $('#overlay').addEventListener('click', (e) => { if (e.target === $('#overlay') && this._overlayCloses) this._closeOverlay(); });
  }

  _paintSound() {
    $('#sound-btn').textContent = this.sfx.on ? 'SOUND ON' : 'SOUND OFF';
    $('#sound-btn').dataset.off = this.sfx.on ? '0' : '1';
  }

  _paintBar() {
    $('#gold').textContent = this.state.gold;
    $('#embers').textContent = this.state.embers;
    $('#who-name').textContent = this.state.name;
    const em = $('#who-emblem');
    em.replaceWith(Object.assign(emblem(this.tier(), 0.62), { id: 'who-emblem' }));
  }

  show(name) {
    this.screen = name;
    for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== 'screen-' + name;
    for (const t of document.querySelectorAll('.tab')) t.dataset.on = t.dataset.go === name ? '1' : '0';
    $('#tabs').hidden = name === 'rip';
    this._paintBar();
    if (name === 'home') this._paintHome();
    if (name === 'packs') this._paintPacks();
    if (name === 'collection') this._paintCollection();
  }

  /** The phone was opened, closed or turned. */
  _form(f) {
    const was = this._formKind;
    this._formKind = f.kind;
    if (this.battle) {
      this.battle.layout();
      // a Duo Duel's table folded shut: the two players have stopped, so the battle does too
      if (was === 'open' && f.kind !== 'open' && this.battle.duo) this.battle.pause(true);
    }
    if (was && was !== 'open' && f.kind === 'open' && !this.battle && this.screen === 'home') {
      this.toast('OPEN · LAY IT FLAT FOR A DUO DUEL ACROSS THE CREASE');
    }
    if (this.screen === 'collection') this._paintCollection();
  }

  toast(text) {
    const t = $('#toast');
    t.textContent = text;
    t.classList.remove('show');
    void t.offsetWidth;
    t.classList.add('show');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /** Once a second: candles burning down, the free pack coming round. */
  _tick() {
    if (this.screen === 'home' && !this.battle && $('#overlay').hidden) this._paintSlots();
  }

  // ---------------------------------------------------------------- the first time
  _intro() {
    const s = this.state;
    const migrated = s.migrated;
    this._overlay((box) => {
      box.className = 'intro';
      const logo = el('img', 'intro-logo', box);
      logo.src = 'ui/logo.png';
      el('h1', '', box, migrated ? 'THE ARENA IS OPEN' : 'WELCOME, WIZARD');
      el('p', 'note', box, migrated
        ? 'Your collection came with you, every card of it. Now it fights: build a deck of eight, battle across the river, and every win brings a pack.'
        : 'Build a deck of eight cards and battle across the river. Snuff out the other wizard\'s candle towers; every win puts a pack in a slot.');
      const how = el('ul', 'how', box);
      for (const line of [
        'Drag a card from your hand onto the field. Mana fills on its own.',
        'Break a side tower for a crown; break the king for all three.',
        'Packs open by candle: light one, and tear it open when it burns down.',
        'Two of you, one iPhone Duo: open it flat for a DUO DUEL across the crease.',
      ]) el('li', '', how, line);
      el('div', 'label', box, 'YOUR WIZARD\'S NAME');
      const input = el('input', 'name-in', box);
      input.maxLength = 14;
      input.value = s.name === 'WIZARD' ? '' : s.name;
      input.placeholder = 'WIZARD';
      const go = el('button', 'big', box, 'LIGHT THE CANDLES');
      go.addEventListener('click', () => {
        this.sfx.play('pack_good', 1, 0.7);
        s.name = (input.value.trim() || 'WIZARD').toUpperCase().slice(0, 14);
        this._grantStart();
        s.intro = true;
        delete s.migrated;
        this._save();
        this._closeOverlay();
        this.show('home');
      });
    }, { closes: false });
  }

  /** The starter deck, and two Starter Packs ready to open, so the first thing a new wizard does is tear one. */
  _grantStart() {
    const s = this.state;
    const owned = Object.keys(s.owned).filter((id) => s.owned[id] > 0 && this.byId[id]);
    if (owned.length < DECK_SIZE) {
      for (const id of STARTER_DECK) if (!s.owned[id]) s.owned[id] = 1;
    }
    if (!s.decks[0].length) s.decks[0] = this._autoDeck(s);
    if (!s.slots.some(Boolean)) {
      s.slots[0] = { key: 'starter', lit: 1 };
      s.slots[1] = { key: 'starter', lit: 1 };
    }
  }

  /** Eight owned cards that make a deck: the starter's where owned, then summons first, the most-held first. */
  _autoDeck(s) {
    const owned = Object.keys(s.owned).filter((id) => s.owned[id] > 0 && BATTLE[id]);
    const pick = STARTER_DECK.filter((id) => owned.includes(id));
    const rest = owned.filter((id) => !pick.includes(id)).sort((a, b) => {
      const ta = BATTLE[a].kind === 'troop' ? 1 : 0, tb = BATTLE[b].kind === 'troop' ? 1 : 0;
      return tb - ta || s.owned[b] - s.owned[a];
    });
    return pick.concat(rest).slice(0, DECK_SIZE);
  }

  // ---------------------------------------------------------------- home
  _paintHome() {
    const s = this.state;
    const t = this.tier();
    const lg = $('#league');
    lg.innerHTML = '';
    lg.appendChild(emblem(t, 2.1));
    const info = el('div', 'league-info', lg);
    el('div', 'league-name', info, RANKED_TIER_NAMES[t] + ' LEAGUE');
    el('div', 'league-tro', info, s.trophies + ' TROPHIES');
    const bar = el('div', 'league-bar', info);
    const fill = el('div', 'league-fill', bar);
    if (t < LEAGUE_AT.length - 1) {
      const a = LEAGUE_AT[t], b = LEAGUE_AT[t + 1];
      fill.style.width = ((s.trophies - a) / (b - a)) * 100 + '%';
      el('div', 'league-next', info, (b - s.trophies) + ' to ' + RANKED_TIER_NAMES[t + 1]);
    } else {
      fill.style.width = '100%';
      el('div', 'league-next', info, 'the top of the ladder');
    }
    const deck = this.deck();
    const ok = deck.length === DECK_SIZE;
    $('#go-battle').dataset.ok = ok ? '1' : '0';
    $('#battle-sub').textContent = ok ? 'wins a ' + RANKED_TIER_NAMES[t] + ' Ranked Pack' : 'finish your deck: ' + deck.length + ' of 8';
    const peek = $('#deck-peek');
    peek.innerHTML = '';
    const head = el('div', 'peek-head', peek);
    el('span', '', head, 'DECK ' + (s.deckAt + 1));
    const avg = deck.length ? deck.reduce((a, id) => a + this.byId[id].cost, 0) / deck.length : 0;
    el('span', 'peek-avg', head, 'average ' + avg.toFixed(1) + ' mana');
    const row = el('div', 'peek-row', peek);
    for (let i = 0; i < DECK_SIZE; i++) {
      const id = deck[i];
      const c = el('button', 'hc hc-static peek', row);
      if (id) this._handFace(c, id, s);
      else c.dataset.empty = '1';
    }
    peek.onclick = () => this.show('collection');
    this._paintSlots();
    if (s.pending) {
      $('#home-note').textContent = 'A pack is half open.';
      const go = el('button', 'mini', $('#home-note'), 'FINISH OPENING');
      go.addEventListener('click', () => this._resume());
    } else {
      $('#home-note').textContent = collector() ? 'Collector mode: packs open at once and cost nothing.' : '';
    }
  }

  _handFace(node, id, state) {
    const card = this.byId[id];
    const side = this._side(state);
    const which = side.art(id);
    node.dataset.look = side.look(id);
    node.dataset.school = card.school;
    node.innerHTML = '<div class="hc-art"></div><div class="hc-cost"></div>';
    const art = $('.hc-art', node);
    art.dataset.full = which === 'classic' ? '0' : '1';
    art.style.backgroundImage = 'url(art/' + id + (which === 'classic' ? '' : '_alt') + '.png)';
    $('.hc-cost', node).textContent = card.cost;
  }

  _slotState(slot) {
    if (!slot) return 'empty';
    if (collector() || unlockSeconds(slot.key) === 0) return 'ready';
    if (!slot.lit) return 'sealed';
    return now() >= slot.lit + unlockSeconds(slot.key) * 1000 ? 'ready' : 'lit';
  }

  _paintSlots() {
    const s = this.state;
    const box = $('#slots');
    box.innerHTML = '';
    const burning = s.slots.some((sl) => this._slotState(sl) === 'lit');
    s.slots.forEach((slot, i) => {
      const st = this._slotState(slot);
      const b = el('button', 'slot-pack', box);
      b.dataset.state = st;
      if (!slot) {
        el('div', 'slot-empty', b, 'WIN A BATTLE');
        return;
      }
      const info = packInfo(slot.key);
      const pic = el('img', 'slot-art', b);
      pic.src = 'ui/' + info.art;
      pic.alt = '';
      const candle = el('div', 'slot-candle', b);
      const total = unlockSeconds(slot.key) * 1000;
      const left = slot.lit ? slot.lit + total - now() : total;
      candle.style.setProperty('--wax', st === 'lit' ? Math.max(0.08, left / total) : (st === 'ready' ? 0 : 1));
      const cap = el('div', 'slot-cap', b);
      if (st === 'ready') cap.textContent = 'OPEN!';
      else if (st === 'lit') {
        cap.innerHTML = hms(left) + '<span class="slot-ember"><span class="ico-ember"></span>' + embersToOpen(left / 1000) + '</span>';
      } else cap.textContent = burning ? hms(total) : 'LIGHT · ' + hms(total);
      b.addEventListener('click', () => this._slot(i));
    });
    // the free pack and the crown pack
    const free = $('#free-pack');
    const freeIn = s.freeAt - now();
    free.dataset.ready = freeIn <= 0 ? '1' : '0';
    free.innerHTML = '<img src="ui/pack_full.png" alt=""><span class="side-word">FREE PACK</span><span class="side-sub">'
      + (freeIn <= 0 ? 'ready' : 'in ' + hms(freeIn)) + '</span>';
    const cp = $('#crown-pack');
    cp.dataset.ready = s.crowns >= CROWN_GOAL ? '1' : '0';
    cp.innerHTML = '<img src="ui/pack_legendary.png" alt=""><span class="side-word">CROWN PACK</span><span class="side-sub">'
      + Math.min(s.crowns, CROWN_GOAL) + ' / ' + CROWN_GOAL + ' crowns</span><span class="side-bar"><span style="width:'
      + Math.min(100, (s.crowns / CROWN_GOAL) * 100) + '%"></span></span>';
  }

  _slot(i) {
    const s = this.state;
    const slot = s.slots[i];
    const st = this._slotState(slot);
    if (st === 'empty') {
      this.toast('WIN A BATTLE TO FILL THIS SLOT');
      return;
    }
    if (st !== 'sealed' && this._halfOpen()) return;
    if (st === 'ready') {
      this.sfx.play('card_select', 1, 0.7);
      s.slots[i] = null;
      this._openPaid(slot.key, 'home');
      return;
    }
    if (st === 'sealed') {
      if (s.slots.some((sl) => this._slotState(sl) === 'lit')) {
        this.toast('ONE CANDLE AT A TIME');
        return;
      }
      slot.lit = now();
      this._save();
      this.sfx.play('level_up', 1.2, 0.5);
      this.toast('LIT · ' + packInfo(slot.key).name + ' OPENS IN ' + hms(unlockSeconds(slot.key) * 1000));
      this._paintSlots();
      return;
    }
    // burning: embers burn it down at once
    const left = (slot.lit + unlockSeconds(slot.key) * 1000 - now()) / 1000;
    const cost = embersToOpen(left);
    this._confirm('BURN IT DOWN NOW?', 'Spend ' + cost + ' ember' + (cost > 1 ? 's' : '') + ' to open ' + packInfo(slot.key).name + ' now.',
      s.embers >= cost ? 'SPEND ' + cost : null, () => {
        s.embers -= cost;
        s.slots[i] = null;
        this._openPaid(slot.key, 'home');
      }, s.embers >= cost ? '' : 'You have ' + s.embers + '. Embers come from winning battles.');
  }

  _free() {
    const s = this.state;
    if (this._halfOpen()) return;
    if (s.freeAt - now() > 0) {
      this.toast('THE FREE PACK COMES ROUND IN ' + hms(s.freeAt - now()));
      return;
    }
    s.freeAt = now() + FREE_EVERY;
    this._openPaid('starter', 'home');
  }

  _crownPack() {
    const s = this.state;
    if (this._halfOpen()) return;
    if (s.crowns < CROWN_GOAL) {
      this.toast('WIN ' + (CROWN_GOAL - s.crowns) + ' MORE CROWNS FOR THE CROWN PACK');
      return;
    }
    s.crowns -= CROWN_GOAL;
    this._openPaid('legendary', 'home');
  }

  /** A pack that has been paid for, one way or another: it is kept as pending until its cards are in. */
  _openPaid(key, back) {
    this.state.pending = { key, back };
    this._save();
    this._startRip(key, back);
  }

  _resume() {
    const p = this.state.pending;
    if (p) this._startRip(p.key, p.back || 'home');
  }

  /** A pack already paid for and half open is finished first, so opening another can never lose it. */
  _halfOpen() {
    if (!this.state.pending) return false;
    this.toast('FINISH THE PACK YOU STARTED FIRST');
    this._resume();
    return true;
  }

  // ---------------------------------------------------------------- the shop
  _paintPacks() {
    const list = $('#pack-list');
    list.innerHTML = '';
    const tier = this.tier();
    const free = collector();
    for (const pack of PACKS) {
      const t = packTier(pack.key);
      const locked = t > tier && !free;
      const price = free ? 0 : packPrice(pack.key);
      const row = el('button', 'pack', list);
      row.dataset.locked = locked ? '1' : '0';
      row.addEventListener('click', () => this._buy(pack.key));
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
      const tag = el('div', 'price', row);
      if (locked) tag.innerHTML = '<span class="lock">REACH<br>' + RANKED_TIER_NAMES[t] + '</span>';
      else tag.innerHTML = price ? '<span class="ico-gold"></span>' + price : 'FREE';
      tag.dataset.afford = this.state.gold >= price ? '1' : '0';
    }
    const owned = Object.keys(this.state.owned).length;
    $('#packs-note').textContent = owned + ' of ' + this.cards.length + ' cards found  ·  ' + Save.totalCards(this.state) + ' in all';
    $('#packs-foot').hidden = free;
  }

  _buy(key) {
    if (this._halfOpen()) return;
    const t = packTier(key);
    const free = collector();
    if (t > this.tier() && !free) {
      this.toast('REACH ' + RANKED_TIER_NAMES[t] + ' LEAGUE TO BUY THIS PACK');
      return;
    }
    const price = free ? 0 : packPrice(key);
    if (this.state.gold < price) {
      this.toast('NOT ENOUGH GOLD · WIN BATTLES FOR MORE');
      this.sfx.play('tick', 0.7, 0.5);
      return;
    }
    this.sfx.play('card_select', 1, 0.6);
    this.state.gold -= price;
    this._openPaid(key, 'packs');
  }

  _again() {
    this.sfx.play('card_select', 1, 0.6);
    if (this.back === 'packs') return this._buy(this.key);
    const i = this.state.slots.findIndex((sl) => this._slotState(sl) === 'ready');
    if (i >= 0) return this._slot(i);
    this.show(this.back);
  }

  // ---------------------------------------------------------------- the rip
  _startRip(key, back = 'home') {
    this.key = key;
    this.back = back;
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
    this.state.pending = null;
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
    const again = $('#again');
    if (this.back === 'packs') {
      const price = collector() ? 0 : packPrice(this.key);
      again.hidden = this.state.gold < price;
      again.textContent = price ? 'ANOTHER · ' + price + ' GOLD' : 'OPEN ANOTHER';
    } else {
      const ready = this.state.slots.some((sl) => this._slotState(sl) === 'ready');
      again.hidden = !ready;
      again.textContent = 'OPEN THE NEXT';
    }
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
    void inst;
  }

  /** The old look cracks and breaks like glass; the new one is under it. */
  async _levelUp(m) {
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
        ? 'A RARE ONE: the scene MOVES, at any level, in your hand in battle too. The card keeps its own level, stars and tint.'
        : 'The card may wear its SCENE at any level, in your hand in battle too. Its level, stars and tint stay its own.';
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

  // ---------------------------------------------------------------- the cards: deck and collection
  _paintCollection() {
    this._paintDeck();
    const filters = $('#filters');
    filters.innerHTML = '';
    for (const key of [''].concat(SCHOOLS)) {
      const b = el('button', 'chip chip-school', filters);
      b.dataset.on = this.filter === key ? '1' : '0';
      if (key) {
        const pip = el('img', 'chip-pip', b);
        pip.src = 'ui/pip_' + key + '.png';
        b.title = key;
      } else b.textContent = 'ALL';
      b.addEventListener('click', () => {
        this.filter = key;
        this.sfx.play('tick', 1.1, 0.4);
        this._paintCollection();
      });
    }
    const grid = $('#grid');
    grid.innerHTML = '';
    if (this._shown) for (const c of this._shown) c.free();
    this._shown = [];
    const owned = this.cards.filter((c) => (this.state.owned[c.id] || 0) > 0);
    const missing = this.cards.length - owned.length;
    $('#collection-note').textContent = owned.length + ' of ' + this.cards.length + ' cards  ·  ' + Save.totalCards(this.state) + ' copies'
      + (missing ? '  ·  ' + missing + ' still to find' : '  ·  every card found');
    const inDeck = new Set(this.deck());
    const order = this.cards.filter((c) => !this.filter || c.school === this.filter).sort((a, b) => {
      const ca = this.state.owned[a.id] || 0, cb = this.state.owned[b.id] || 0;
      if ((ca > 0) !== (cb > 0)) return cb - ca;
      return levelFor(cb, b) - levelFor(ca, a) || a.cost - b.cost || a.name.localeCompare(b.name);
    });
    for (const card of order) {
      const copies = this.state.owned[card.id] || 0;
      const cell = el('button', 'cell', grid);
      cell.dataset.owned = copies > 0 ? '1' : '0';
      cell.dataset.deck = inDeck.has(card.id) ? '1' : '0';
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

  _paintDeck() {
    const s = this.state;
    const box = $('#deck-box');
    box.innerHTML = '';
    const head = el('div', 'deck-head', box);
    el('div', 'sec', head, 'BATTLE DECK');
    const tabs = el('div', 'deck-tabs', head);
    for (let i = 0; i < 3; i++) {
      const t = el('button', 'chip', tabs, String(i + 1));
      t.dataset.on = s.deckAt === i ? '1' : '0';
      t.addEventListener('click', () => {
        s.deckAt = i;
        this.swap = null;
        this._save();
        this.sfx.play('tick', 1, 0.4);
        this._paintCollection();
      });
    }
    const deck = this.deck();
    const avg = deck.length ? deck.reduce((a, id) => a + this.byId[id].cost, 0) / deck.length : 0;
    el('div', 'deck-avg', head, deck.length + '/8 · avg ' + avg.toFixed(1));
    if (this.swap) {
      const hint = el('div', 'deck-hint', box, 'TAP A CARD IN THE DECK TO SWAP IN ' + this.byId[this.swap].name.toUpperCase());
      const no = el('button', 'mini', hint, 'CANCEL');
      no.addEventListener('click', (e) => {
        e.stopPropagation();
        this.swap = null;
        this._paintCollection();
      });
    }
    const row = el('div', 'deck-row', box);
    row.dataset.swap = this.swap ? '1' : '0';
    for (let i = 0; i < DECK_SIZE; i++) {
      const id = deck[i];
      const c = el('button', 'hc hc-static deck-card', row);
      if (id) {
        this._handFace(c, id, s);
        el('div', 'hc-lv', c, 'LV' + Math.max(1, levelFor(s.owned[id], this.byId[id])));
      } else c.dataset.empty = '1';
      c.addEventListener('click', () => {
        if (this.swap) {
          if (deck.includes(this.swap)) {
            this.toast(this.byId[this.swap].name.toUpperCase() + ' IS ALREADY IN THIS DECK');
            this.swap = null;
            this._paintCollection();
            return;
          }
          const d = deck.slice();
          if (id) d[i] = this.swap;
          else d.push(this.swap);
          s.decks[s.deckAt] = d.slice(0, DECK_SIZE);
          this.swap = null;
          this._save();
          this.sfx.play('card_select', 1.1, 0.6);
          this._paintCollection();
          return;
        }
        if (id) this._sheet(this.byId[id]);
      });
    }
  }

  /** Puts a card in the deck: into a gap if there is one, else the player picks the card it replaces. */
  _useCard(id) {
    const s = this.state;
    const deck = this.deck();
    if (deck.includes(id)) return;
    if (deck.length < DECK_SIZE) {
      s.decks[s.deckAt] = deck.concat(id);
      this._save();
      this.sfx.play('card_select', 1.1, 0.6);
    } else {
      this.swap = id;
    }
    this._closeSheet();
    this._paintCollection();
  }

  _dropCard(id) {
    const s = this.state;
    s.decks[s.deckAt] = this.deck().filter((x) => x !== id);
    this._save();
    this._closeSheet();
    this._paintCollection();
  }

  /** One card, large, with what it does in the arena and what it may wear. */
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
    // the deck
    const deckRow = $('#sheet-deck');
    deckRow.innerHTML = '';
    if (copies > 0) {
      if (this.deck().includes(card.id)) {
        el('button', 'big ghost', deckRow, 'REMOVE FROM DECK').addEventListener('click', () => this._dropCard(card.id));
      } else {
        el('button', 'big', deckRow, 'USE IN DECK').addEventListener('click', () => this._useCard(card.id));
      }
    }
    // the arena
    const b = BATTLE[card.id];
    $('#sheet-battle').textContent = b ? b.text : '';
    const stats = $('#sheet-stats');
    stats.innerHTML = '';
    for (const [k, v] of battleStats(card.id, Math.max(1, lv))) {
      const r = el('div', 'stat', stats);
      el('span', 'stat-k', r, k);
      el('span', 'stat-v', r, v);
    }
    if (lv > 1) el('div', 'stat-note', stats, 'at your level ' + lv + ': +' + Math.round((lv - 1) * 6) + '% health and damage');
    // the tints it may wear
    const looks = $('#sheet-looks');
    looks.innerHTML = '';
    for (let i = 1; i <= maxLevel(card); i++) {
      const bt = el('button', 'chip', looks, 'LV ' + i);
      const wearing = (this.state.looks[card.id] || lv) === i;
      bt.dataset.on = wearing && copies > 0 ? '1' : '0';
      bt.disabled = i > lv;
      bt.title = i <= lv ? '' : 'Reach level ' + i + ' first (' + levelNeed(i, card) + ' copies)';
      bt.addEventListener('click', () => {
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
      const bt = el('button', 'chip', arts, label);
      bt.dataset.on = wearing === key ? '1' : '0';
      bt.disabled = !can || copies <= 0;
      bt.addEventListener('click', () => {
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
        : (moves ? 'The scene is alive, in your hand in battle too.' : 'Full art: the scene fills the whole card, in battle too.'));
    sheet.hidden = false;
  }

  _closeSheet() {
    $('#sheet').hidden = true;
    if (this._sheetCard) {
      this._sheetCard.free();
      this._sheetCard = null;
    }
  }

  // ---------------------------------------------------------------- panels over everything
  _overlay(build, opts = {}) {
    const o = $('#overlay');
    const box = $('#overlay-box');
    box.innerHTML = '';
    box.className = '';
    o.hidden = false;
    this._overlayCloses = opts.closes !== false;
    build(box);
  }

  _closeOverlay() {
    $('#overlay').hidden = true;
    $('#overlay-box').innerHTML = '';
  }

  /** A question with a yes and a no, asked on the page itself (a home-screen app shows no browser dialogs). */
  _confirm(title, text, yes, onYes, extra = '', onNo = null) {
    this._overlay((box) => {
      box.className = 'ask';
      el('h2', '', box, title);
      el('p', 'note', box, text);
      if (extra) el('p', 'note small', box, extra);
      const row = el('div', 'row', box);
      if (yes) {
        el('button', 'big', row, yes).addEventListener('click', () => {
          this._closeOverlay();
          onYes();
        });
      }
      el('button', 'big ghost', row, yes ? 'NOT NOW' : 'OK').addEventListener('click', () => {
        this._closeOverlay();
        if (onNo) onNo();
      });
    });
  }

  /** A wizard's name, typed on the page. */
  _askName(title, initial, onName, onNo) {
    this._overlay((box) => {
      box.className = 'ask';
      el('h2', '', box, title);
      const input = el('input', 'name-in', box);
      input.id = 'name-ask';
      input.maxLength = 14;
      input.value = initial;
      input.placeholder = 'WIZARD';
      input.autocomplete = 'off';
      const row = el('div', 'row', box);
      const ok = el('button', 'big', row, 'OK');
      const go = () => {
        const name = input.value.trim().toUpperCase().slice(0, 14);
        if (!name) return input.focus();
        this._closeOverlay();
        onName(name);
      };
      ok.addEventListener('click', go);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
      el('button', 'big ghost', row, 'CANCEL').addEventListener('click', () => {
        this._closeOverlay();
        if (onNo) onNo();
      });
      setTimeout(() => input.focus(), 50);
    }, { closes: false });
  }

  /** The collection as a line of text, to carry to another phone. */
  _export() {
    const text = Save.toText(this.state);
    this._overlay((box) => {
      box.className = 'ask';
      el('h2', '', box, 'EXPORT');
      el('p', 'note small', box, 'This line of text is ' + this.state.name + '\'s whole collection. Paste it into IMPORT on another phone.');
      const area = el('textarea', 'carry', box);
      area.id = 'carry-out';
      area.readOnly = true;
      area.value = text;
      const row = el('div', 'row', box);
      const copy = el('button', 'big', row, 'COPY');
      copy.addEventListener('click', () => {
        const done = () => { copy.textContent = 'COPIED'; };
        const fallback = () => { area.focus(); area.select(); copy.textContent = 'SELECTED · COPY IT'; };
        try {
          navigator.clipboard.writeText(text).then(done, fallback);
        } catch (e) {
          fallback();
        }
      });
      el('button', 'big ghost', row, 'BACK').addEventListener('click', () => this._wizards());
    }, { closes: false });
  }

  _import() {
    this._overlay((box) => {
      box.className = 'ask';
      el('h2', '', box, 'IMPORT');
      el('p', 'note small', box, 'Paste a collection exported from WICK. It replaces ' + this.state.name + '\'s cards, decks and trophies.');
      const area = el('textarea', 'carry', box);
      area.id = 'carry-in';
      area.placeholder = 'paste here';
      const bad = el('p', 'note small warn', box, '');
      bad.hidden = true;
      const row = el('div', 'row', box);
      el('button', 'big', row, 'IMPORT').addEventListener('click', () => {
        try {
          this.state = { ...Save.fromText(area.value), intro: true };
        } catch (e) {
          bad.hidden = false;
          bad.textContent = 'That is not a WICK collection: copy the whole line from EXPORT and paste it again.';
          return;
        }
        this._save();
        this._closeOverlay();
        this.toast('COLLECTION IMPORTED');
        this.show('collection');
      });
      el('button', 'big ghost', row, 'BACK').addEventListener('click', () => this._wizards());
    }, { closes: false });
  }

  // ---------------------------------------------------------------- battles
  _ladder() {
    if (this.deck().length < DECK_SIZE) {
      this.toast('YOUR DECK NEEDS 8 CARDS');
      this.show('collection');
      return;
    }
    this.sfx.play('card_select', 1, 0.7);
    const tier = this.tier();
    const rival = rivalFor(tier);
    const s = this.state;
    // finding a rival, then the two of you face to face
    this._overlay((box) => {
      box.className = 'match';
      el('div', 'match-candle', box);
      el('div', 'match-word', box, 'FINDING A RIVAL…');
    }, { closes: false });
    setTimeout(() => {
      this._overlay((box) => {
        box.className = 'vs';
        const me = el('div', 'vs-side', box);
        me.appendChild(emblem(tier, 1.6));
        el('div', 'vs-name', me, s.name);
        el('div', 'vs-sub', me, s.trophies + ' trophies');
        el('div', 'vs-word', box, 'VS');
        const them = el('div', 'vs-side', box);
        them.appendChild(emblem(tier, 1.6));
        el('div', 'vs-name', them, rival.name);
        el('div', 'vs-sub', them, rival.deckName);
      }, { closes: false });
      this.sfx.synth('horn', 1);
      setTimeout(() => {
        this._closeOverlay();
        this._fight('ladder', [this._side(s), {
          name: rival.name, deck: rival.deck, levels: rival.levels, human: false, skill: rival.skill, deckName: rival.deckName, tier,
        }], { tier, rival });
      }, 1700);
    }, 1300);
  }

  _practice() {
    if (this.deck().length < DECK_SIZE) {
      this.toast('YOUR DECK NEEDS 8 CARDS');
      this.show('collection');
      return;
    }
    let deckKey = RIVAL_DECKS[0].key, skill = 0.5;
    this._overlay((box) => {
      box.className = 'setup';
      el('h2', '', box, 'PRACTICE');
      el('p', 'note', box, 'A battle against a rival of your choosing. No trophies, no packs: just the cards.');
      el('div', 'label', box, 'RIVAL DECK');
      const decks = el('div', 'chips', box);
      for (const d of RIVAL_DECKS) {
        const b = el('button', 'chip', decks, d.name);
        b.dataset.on = d.key === deckKey ? '1' : '0';
        b.addEventListener('click', () => {
          deckKey = d.key;
          for (const x of decks.children) x.dataset.on = x === b ? '1' : '0';
        });
      }
      el('div', 'label', box, 'HOW WELL IT PLAYS');
      const lv = el('div', 'chips', box);
      for (const [name, v] of [['APPRENTICE', 0.15], ['ADEPT', 0.5], ['MAGUS', 0.8], ['ARCHMAGE', 1]]) {
        const b = el('button', 'chip', lv, name);
        b.dataset.on = v === skill ? '1' : '0';
        b.addEventListener('click', () => {
          skill = v;
          for (const x of lv.children) x.dataset.on = x === b ? '1' : '0';
        });
      }
      const row = el('div', 'row', box);
      el('button', 'big', row, 'FIGHT').addEventListener('click', () => {
        const d = RIVAL_DECKS.find((x) => x.key === deckKey);
        this._closeOverlay();
        this._fight('practice', [this._side(this.state), {
          name: rivalFor(0).name, deck: d.cards.slice(), levels: {}, human: false, skill, deckName: d.name,
        }], {});
      });
      el('button', 'big ghost', row, 'BACK').addEventListener('click', () => this._closeOverlay());
    });
  }

  /** The Duo Duel table: who sits on the far side of the river, with which deck, and on what terms. */
  _duoTable() {
    if (this.deck().length < DECK_SIZE) {
      this.toast('YOUR DECK NEEDS 8 CARDS');
      this.show('collection');
      return;
    }
    const others = Save.index().list.filter((p) => p.id !== this.pid);
    const ready = (id) => this.deck(Save.load(id)).length === DECK_SIZE;
    let foe = (others.find((p) => ready(p.id)) || { id: 'guest' }).id;
    let guestDeck = PRESET_DECKS[0].key;
    let fair = true;
    let minutes = 3;
    const paint = (box) => {
      box.innerHTML = '';
      box.className = 'setup duo-setup';
      el('h2', '', box, 'DUO DUEL');
      el('p', 'note', box, 'Two wizards, one Duo. Open it and lay it flat between you: the river runs along the crease and each of you gets a hand facing you. Play at the same time, with a finger each.');
      const open = document.documentElement.dataset.form === 'open';
      if (!open) el('p', 'note small warn', box, 'Best on the open Duo laid flat. It works on any screen, sharing it top and bottom.');
      el('div', 'label', box, 'NEAR SIDE');
      el('div', 'duo-who', box, this.state.name + ' · deck ' + (this.state.deckAt + 1));
      el('div', 'label', box, 'FAR SIDE');
      const who = el('div', 'chips', box);
      for (const p of others) {
        const st = Save.load(p.id);
        const ok = this.deck(st).length === DECK_SIZE;
        const b = el('button', 'chip', who, p.name + (ok ? '' : ' (no deck)'));
        b.disabled = !ok;
        b.dataset.on = foe === p.id ? '1' : '0';
        b.addEventListener('click', () => { foe = p.id; paint(box); });
      }
      const g = el('button', 'chip', who, 'A GUEST');
      g.dataset.on = foe === 'guest' ? '1' : '0';
      g.addEventListener('click', () => { foe = 'guest'; paint(box); });
      const add = el('button', 'chip', who, '+ NEW WIZARD');
      add.addEventListener('click', () => this._wizards());
      if (foe === 'guest') {
        el('div', 'label', box, 'THE GUEST\'S DECK');
        const decks = el('div', 'chips', box);
        for (const d of PRESET_DECKS) {
          const b = el('button', 'chip', decks, d.name);
          b.dataset.on = d.key === guestDeck ? '1' : '0';
          b.addEventListener('click', () => { guestDeck = d.key; paint(box); });
        }
      }
      el('div', 'label', box, 'TERMS');
      const terms = el('div', 'chips', box);
      const f = el('button', 'chip', terms, 'FAIR: EVERY CARD LEVEL 1');
      f.dataset.on = fair ? '1' : '0';
      f.addEventListener('click', () => { fair = !fair; paint(box); });
      for (const m of [2, 3]) {
        const b = el('button', 'chip', terms, m + ':00');
        b.dataset.on = minutes === m ? '1' : '0';
        b.addEventListener('click', () => { minutes = m; paint(box); });
      }
      const rec = foe !== 'guest' && this.state.rivals[foe];
      if (rec) el('p', 'note small', box, 'Between you so far: ' + rec.w + ' won, ' + rec.l + ' lost, ' + rec.d + ' drawn.');
      const row = el('div', 'row', box);
      el('button', 'big', row, 'TO THE RIVER').addEventListener('click', () => {
        if (foe !== 'guest' && !ready(foe)) {
          this.toast('THAT WIZARD NEEDS A DECK OF 8 FIRST');
          return;
        }
        let far;
        if (foe === 'guest') {
          const d = PRESET_DECKS.find((x) => x.key === guestDeck);
          far = { name: 'GUEST', deck: d.cards.slice(), levels: {}, human: true, art: () => 'classic', look: () => 1 };
        } else {
          far = this._side(Save.load(foe), { fair });
        }
        this._closeOverlay();
        this._fight('duo', [this._side(this.state, { fair }), far], { foe, minutes });
      });
      el('button', 'big ghost', row, 'BACK').addEventListener('click', () => this._closeOverlay());
    };
    this._overlay(paint);
  }

  _fight(mode, players, extra) {
    if (mode === 'ladder') {
      this.state.ongoing = { tier: extra.tier, rival: extra.rival.name, deckName: extra.rival.deckName };
      this._save();
    }
    const root = $('#battle');
    root.hidden = false;
    document.body.dataset.battle = '1';
    this.battle = new BattleScreen(root, {
      cards: this.cards, sfx: this.sfx, mode, players, seed: (Math.random() * 1e9) | 0,
      onEnd: (r) => this._battleEnd(mode, r, extra),
      onOver: mode === 'ladder' ? (r) => this._settle(r) : null,
      hint: mode !== 'duo' && this.state.stats.battles === 0 && !this._hinted,
    });
    this._hinted = true;
    if (extra.minutes) this.battle.b.duration = extra.minutes * 60;
  }

  _battleEnd(mode, r, extra) {
    this.battle = null;
    $('#battle').hidden = true;
    delete document.body.dataset.battle;
    const s = this.state;
    if (mode === 'ladder') this._rewards(r, extra);
    else if (mode === 'duo') {
      if (r.reason === 'left') return this.show('home');      // a duel walked away from is not scored
      s.stats.duels++;
      if (extra.foe && extra.foe !== 'guest') {
        const mine = s.rivals[extra.foe] || (s.rivals[extra.foe] = { w: 0, l: 0, d: 0 });
        const theirs = Save.load(extra.foe);
        const back = theirs.rivals[this.pid] || (theirs.rivals[this.pid] = { w: 0, l: 0, d: 0 });
        if (r.winner === 0) { mine.w++; back.l++; } else if (r.winner === 1) { mine.l++; back.w++; } else { mine.d++; back.d++; }
        theirs.stats.duels++;
        Save.save(extra.foe, theirs);
      }
      this._save();
      this.show('home');
    } else {
      this.show('home');
    }
  }

  /**
   * What a ladder battle brings: trophies, gold, embers, crowns toward the Crown Pack, and a pack for a win. Settled
   * (and saved) the moment the battle ends; the results panel only shows what was settled.
   */
  _settle(r) {
    const s = this.state;
    const tierBefore = this.tier();
    const dt = trophyChange(s.trophies, r.winner);
    const won = r.winner === 0;
    const myCrowns = r.crowns[0];
    s.trophies = Math.max(0, s.trophies + dt);
    s.bestTrophies = Math.max(s.bestTrophies, s.trophies);
    s.stats.battles++;
    if (won) s.stats.wins++;
    else if (r.winner === 1) s.stats.losses++;
    else s.stats.draws++;
    if (won && myCrowns >= 3) s.stats.three++;
    const purse = battleGold(tierBefore, r.winner, myCrowns);
    s.gold += purse.gold;
    s.embers += purse.embers;
    s.crowns += myCrowns;
    let pack = null, full = false;
    if (won) {
      const key = packForWin(tierBefore);
      const i = s.slots.findIndex((x) => !x);
      if (i >= 0) {
        s.slots[i] = { key, lit: 0 };
        pack = key;
      } else full = true;
    }
    delete s.ongoing;
    this._save();
    this._settled = { dt, won, myCrowns, purse, pack, full, tierBefore, tierAfter: this.tier() };
    return this._settled;
  }

  /** A ladder battle the app was closed in the middle of: it counts as lost, as walking away from it would. */
  _abandoned() {
    const o = this.state.ongoing;
    if (!o) return;
    const got = this._settle({ winner: 1, crowns: [0, 3], reason: 'abandoned' });
    this.toast('YOUR LAST BATTLE WAS LEFT UNFINISHED · ' + got.dt + ' TROPHIES');
  }

  _rewards(r, extra) {
    const s = this.state;
    const { dt, won, myCrowns, purse, pack, full, tierBefore, tierAfter } = this._settled || this._settle(r);
    this._settled = null;
    this.show('home');
    this._overlay((box) => {
      box.className = 'results';
      const title = el('div', 'res-title', box, won ? 'VICTORY' : (r.winner === -1 ? 'DRAW' : 'DEFEAT'));
      title.dataset.kind = won ? 'win' : (r.winner === -1 ? 'draw' : 'lose');
      const cr = el('div', 'crowns crowns-lg', box);
      cr.innerHTML = crowns(myCrowns);
      el('div', 'res-vs', box, 'against ' + extra.rival.name + ' · ' + extra.rival.deckName);
      const tro = el('div', 'res-row', box);
      tro.appendChild(emblem(tierAfter, 0.9));
      el('span', 'res-big', tro, (dt >= 0 ? '+' : '') + dt);
      el('span', 'res-small', tro, s.trophies + ' trophies');
      if (tierAfter > tierBefore) {
        el('div', 'res-promo', box, RANKED_TIER_NAMES[tierAfter] + ' LEAGUE!');
        this.sfx.play('level_up', 1, 0.9);
      }
      const purseRow = el('div', 'res-row', box);
      purseRow.innerHTML = '<span class="ico-gold"></span><span class="res-big">+' + purse.gold + '</span>'
        + (purse.embers ? '<span class="ico-ember"></span><span class="res-big">+' + purse.embers + '</span>' : '')
        + '<span class="res-small">crown pack ' + Math.min(s.crowns, CROWN_GOAL) + '/' + CROWN_GOAL + '</span>';
      if (pack) {
        const p = el('div', 'res-pack', box);
        const img = el('img', '', p);
        img.src = 'ui/' + packInfo(pack).art;
        el('div', 'res-small', p, packInfo(pack).name + ' takes a slot');
      } else if (full) {
        el('p', 'note', box, 'Your pack slots are full, so this win brought no pack. Open one to make room.');
      }
      el('button', 'big', box, 'CONTINUE').addEventListener('click', () => {
        this.sfx.play('card_select', 1, 0.6);
        this._closeOverlay();
        this.show('home');
      });
    }, { closes: false });
  }

  // ---------------------------------------------------------------- the wizards on this phone, and settings
  _wizards() {
    this.sfx.play('tick', 1, 0.5);
    const paint = (box) => {
      box.innerHTML = '';
      box.className = 'setup wizards';
      el('h2', '', box, 'WIZARDS ON THIS PHONE');
      el('p', 'note small', box, 'Everyone who plays on this phone can have a wizard of their own: their own cards, decks, trophies and packs. A Duo Duel puts two of them across the river.');
      const list = el('div', 'wiz-list', box);
      for (const p of Save.index().list) {
        const st = p.id === this.pid ? this.state : Save.load(p.id);
        const row = el('button', 'wiz', list);
        row.dataset.on = p.id === this.pid ? '1' : '0';
        row.appendChild(emblem(leagueOf(st.trophies), 0.8));
        const t = el('div', 'wiz-body', row);
        el('div', 'wiz-name', t, st.name);
        el('div', 'wiz-sub', t, st.trophies + ' trophies · ' + Object.keys(st.owned).length + ' cards' + (p.id === this.pid ? ' · playing' : ''));
        row.addEventListener('click', () => {
          if (p.id === this.pid) return;
          this._use(p.id);
          this.sfx.play('card_select', 1, 0.6);
          paint(box);
        });
      }
      const row = el('div', 'row', box);
      el('button', 'mini', row, '+ NEW WIZARD').addEventListener('click', () => {
        this._askName('A NEW WIZARD', '', (name) => this._use(Save.create(name)), () => this._wizards());
      });
      el('button', 'mini', row, 'RENAME').addEventListener('click', () => {
        this._askName('RENAME ' + this.state.name, this.state.name, (name) => {
          this.state.name = name;
          this._save();
          this._paintBar();
          this._wizards();
        }, () => this._wizards());
      });
      if (Save.index().list.length > 1) {
        el('button', 'mini', row, 'DELETE').addEventListener('click', () => {
          this._confirm('DELETE ' + this.state.name + '?', 'Every card, deck, trophy and pack they hold goes with them. This cannot be undone.', 'DELETE', () => {
            Save.remove(this.pid);
            this._use(Save.index().active);
            this._wizards();
          }, '', () => this._wizards());
        });
      }
      el('div', 'label', box, 'THE SCREEN');
      const scr = el('div', 'chips', box);
      for (const [key, name] of [['auto', 'AUTO'], ['cover', 'FOLDED'], ['open', 'OPEN']]) {
        const b = el('button', 'chip', scr, name);
        b.dataset.on = getOverride() === key ? '1' : '0';
        b.addEventListener('click', () => { setOverride(key); paint(box); });
      }
      el('p', 'note small', box, 'AUTO reads the Duo from the shape of the screen (and from Safari\'s fold flags, when they are on).');
      el('div', 'label', box, 'PACKS');
      const col = el('div', 'chips', box);
      const cm = el('button', 'chip', col, 'COLLECTOR MODE');
      cm.dataset.on = collector() ? '1' : '0';
      cm.addEventListener('click', () => {
        try { localStorage.setItem('wick.collector', collector() ? '0' : '1'); } catch (e) { /* private mode */ }
        paint(box);
      });
      el('p', 'note small', box, 'Collector mode is the pack opener as it was: every pack free, and candles burn down at once.');
      const st = this.state.stats;
      el('div', 'label', box, this.state.name + ' IN THE ARENA');
      const n = (k, word) => k + ' ' + word + (k === 1 ? '' : 's');
      el('p', 'note small', box, n(st.battles, 'battle') + ' · ' + st.wins + ' won · ' + st.three + ' three-crown · best ' + this.state.bestTrophies + ' trophies · '
        + n(st.duels, 'duel') + (this.state.best.avg !== null ? ' · straightest rip ' + this.state.best.avg.toFixed(2) + ' px off the line' : ''));
      el('div', 'label', box, 'THE COLLECTION');
      const io = el('div', 'row', box);
      el('button', 'mini', io, 'EXPORT').addEventListener('click', () => this._export());
      el('button', 'mini', io, 'IMPORT').addEventListener('click', () => this._import());
      el('button', 'mini', io, 'WIPE').addEventListener('click', () => {
        this._confirm('WIPE ' + this.state.name + '?', 'Their whole collection goes: every card, deck, trophy and pack. EXPORT it first to keep a copy.', 'WIPE', () => {
          Save.wipe(this.pid);
          this.state = Save.load(this.pid);
          this.show('home');
          this._intro();
        }, '', () => this._wizards());
      });
      el('button', 'big ghost', box, 'CLOSE').addEventListener('click', () => this._closeOverlay());
    };
    this._overlay(paint);
  }
}

const app = new App();
app.start();
window.wick = app;

// the service worker: it is what makes the app work with no signal once it is on the home screen
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
