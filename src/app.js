// NACRE — the front door: the title screen, the list of duellists, and the switching between screens.
import { OPPONENTS, CARDS, DECK_SIZE } from './cards.js';
import { S, load, save, wipe, deckReady, uniqueOwned } from './save.js';
import { $, h, btn, toast, refreshBar, confirmBox } from './ui.js';
import { sfx } from './sfx.js';
import * as battle from './battle.js';
import * as collection from './collection.js';
import * as packs from './packs.js';
import * as trade from './trade.js';

const TITLES = { duels: 'Choose a Duel', collection: 'Collection', packs: 'Card Packs', trade: 'Harbor Market' };
const screens = ['home', 'duels', 'battle', 'collection', 'packs', 'trade'];

export function go(name, arg) {
  for (const s of screens) $('#' + s).hidden = s !== name;
  $('#bar').hidden = name === 'home' || name === 'battle';
  $('#bar-title').textContent = TITLES[name] || '';
  document.body.dataset.screen = name;
  refreshBar();
  window.scrollTo(0, 0);
  if (name === 'home') home();
  else if (name === 'duels') duels();
  else if (name === 'battle') battle.start(arg);
  else if (name === 'collection') collection.show();
  else if (name === 'packs') packs.show();
  else if (name === 'trade') trade.show();
}

function home() {
  const nPacks = (S.packs.tide || 0) + (S.packs.abyss || 0);
  $('#home').replaceChildren(
    h('div.home-bg'),
    h('div.home-top', {},
      h('span.purse.gold', {}, h('i.coin'), h('b', {}, String(S.gold))),
      h('button.btn.mini.ghost', { onclick: () => { sfx.setOn(!sfx.on); home(); } }, sfx.on ? 'Sound on' : 'Sound off')),
    h('div.logo', {},
      h('img.logo-mark', { src: 'ui/emblem.webp', alt: '' }),
      h('h1', { 'data-t': 'NACRE' }, 'NACRE'),
      h('p', {}, 'Duels of the Drowned Stars')),
    h('nav.menu', {},
      btn('Duel', () => go('duels'), 'big'),
      btn('Collection <small>' + uniqueOwned() + '/' + CARDS.length + '</small>', () => go('collection'), 'big'),
      btn('Packs' + (nPacks ? ` <span class="badge">${nPacks}</span>` : ''), () => go('packs'), 'big'),
      btn('Harbor Market', () => go('trade'), 'big')),
    h('p.home-foot', {}, `${S.stats.won} wins · ${S.stats.opened} packs opened · `,
      h('a', { href: '#', onclick: async (e) => { e.preventDefault(); if (await confirmBox('Throw away your collection and start again?', 'Start again', 'Keep it')) { wipe(); home(); } } }, 'start again')));
}

function duels() {
  const ready = deckReady();
  $('#duels').replaceChildren(
    ready ? null : h('p.note.warn', {}, `Your deck has ${S.deck.length} of ${DECK_SIZE} cards. `, h('a', { href: '#', onclick: (e) => { e.preventDefault(); go('collection'); } }, 'Finish it in the Collection'), ' before duelling.'),
    h('div.foes', {}, OPPONENTS.map((o, i) => {
      const wins = S.wins[o.id] || 0;
      return h('div.foe', {},
        h('img', { src: `ui/${o.id}.webp`, alt: '' }),
        h('div.foe-body', {},
          h('div.foe-stars', {}, '★'.repeat(i + 1) + '☆'.repeat(2 - i)),
          h('h3', {}, o.name), h('div.foe-title', {}, o.title),
          h('p', {}, o.blurb),
          h('p.note', { html: `Win: <i class="coin"></i> ${o.gold}` + (wins ? ` · beaten ${wins}×` : ` · first win: ${Object.entries(o.firstWin).map(([k, n]) => `${n} ${k === 'abyss' ? 'Abyssal' : 'Tide'} pack${n > 1 ? 's' : ''}`).join(', ')}`) }),
          btn('Duel', () => { if (!deckReady()) { toast('Your deck needs ' + DECK_SIZE + ' cards'); return; } go('battle', o); }, ready ? '' : 'off')));
    })));
}

load();
save();
battle.mount($('#battle'), { exit: () => go('home') });
collection.mount($('#collection'));
packs.mount($('#packs'));
trade.mount($('#trade'));
$('#bar-back').addEventListener('click', () => { sfx.play('tap'); go('home'); });
document.addEventListener('contextmenu', (e) => { if (e.target.closest('.card, .tok, canvas')) e.preventDefault(); });
// open straight onto a screen with index.html#packs (handy while building)
const want = location.hash.slice(1);
go(screens.includes(want) && want !== 'battle' ? want : 'home');
