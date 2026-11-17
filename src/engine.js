// The rules of a duel. No drawing happens here: the engine changes the state and tells whoever is watching what
// just happened (`g.emit(type, data)`, awaited, so the screen can animate it before the rules go on). With no watcher
// it runs flat out, which is how the AI is tested (tools/sim.mjs).
//
// A duel: two heroes at 30 health. Each turn you gain a pearl of mana (up to 10), all of them refill, and you draw.
// Minions cannot attack the turn they arrive (unless Swift). A hero at 0 loses. An empty deck hurts more each draw.
import { CARD, HERO_POWER } from './cards.js';

export const MAX_MANA = 10, MAX_HAND = 9, MAX_BOARD = 6, HERO_HP = 30;

export function newGame({ decks, heroes, emit = null, random = Math.random, first = null }) {
  const g = { p: [], turn: 0, round: 0, over: false, winner: null, uid: 1, random, emit: emit || (async () => {}), busy: false };
  for (let i = 0; i < 2; i++) {
    g.p.push({
      idx: i,
      hero: { uid: 'h' + i, isHero: true, owner: i, hp: HERO_HP, maxHp: HERO_HP, name: heroes[i].name, id: heroes[i].id },
      mana: 0, maxMana: 0, deck: shuffle(decks[i].slice(), random), hand: [], board: [], fatigue: 0, powerUsed: false,
    });
  }
  g.turn = first === null ? (random() < 0.5 ? 0 : 1) : first;
  return g;
}

export function shuffle(a, random = Math.random) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function startGame(g) {
  const a = g.turn, b = 1 - a;
  for (let i = 0; i < 3; i++) await drawCard(g, a, true);
  for (let i = 0; i < 4; i++) await drawCard(g, b, true);    // going second: one more card
  await startTurn(g);
}

// ---------------------------------------------------------------------------------------------------- turns

export async function startTurn(g) {
  const p = g.p[g.turn];
  g.round++;
  p.maxMana = Math.min(MAX_MANA, p.maxMana + 1);
  p.mana = p.maxMana;
  p.powerUsed = false;
  for (const m of p.board) { m.sleeping = false; m.attacked = false; }
  await g.emit('turn', { p: g.turn });
  await drawCard(g, g.turn);
  await settle(g);
}

export async function endTurn(g) {
  if (g.over) return;
  const me = g.turn;
  for (const m of g.p[me].board.slice()) {
    const def = CARD[m.id];
    if (def.ebb && !m.dead && !g.over) {
      await g.emit('trigger', { minion: m, kind: 'ebb' });
      await def.ebb(fxFor(g), me, m);
      await settle(g);
    }
  }
  if (g.over) return;
  g.turn = 1 - me;
  await startTurn(g);
}

export async function drawCard(g, pi, quiet = false) {
  const p = g.p[pi];
  if (g.over) return;
  if (!p.deck.length) {
    p.fatigue++;
    await g.emit('fatigue', { p: pi, n: p.fatigue });
    await damage(g, p.hero, p.fatigue);
    return;
  }
  const id = p.deck.pop();
  if (p.hand.length >= MAX_HAND) { await g.emit('burn', { p: pi, id }); return; }
  const card = { uid: 'c' + (g.uid++), id };
  p.hand.push(card);
  await g.emit('draw', { p: pi, card, quiet });
}

// ---------------------------------------------------------------------------------------------------- what may be done

export const costOf = (g, pi, card) => CARD[card.id].cost;

export function canPlay(g, pi, card) {
  if (g.over || g.turn !== pi) return false;
  const def = CARD[card.id], p = g.p[pi];
  if (costOf(g, pi, card) > p.mana) return false;
  if (def.type === 'minion') return p.board.length < MAX_BOARD;
  if (def.target) return spellTargets(g, pi, def).length > 0;
  return true;
}

/** Everything a targeted spell (or the hero power) may be aimed at. */
export function spellTargets(g, pi, def) {
  const mine = g.p[pi].board, theirs = g.p[1 - pi].board;
  switch (def.target) {
    case 'any': return [...theirs, g.p[1 - pi].hero, ...mine, g.p[pi].hero];
    case 'enemy': return [...theirs, g.p[1 - pi].hero];
    case 'enemy_minion': return [...theirs];
    case 'friendly_minion': return [...mine];
    default: return [];
  }
}

export function canAttack(g, m) {
  return !g.over && g.turn === m.owner && !m.dead && !m.sleeping && !m.attacked && m.atk > 0;
}

/** What a minion may attack: the enemy's Guards if there are any, otherwise anything of theirs. */
export function attackTargets(g, m) {
  const foe = g.p[1 - m.owner];
  const guards = foe.board.filter((x) => x.guard && !x.dead);
  if (guards.length) return guards;
  return [...foe.board.filter((x) => !x.dead), foe.hero];
}

export function canPower(g, pi) {
  const p = g.p[pi];
  return !g.over && g.turn === pi && !p.powerUsed && p.mana >= HERO_POWER.cost;
}
export const powerTargets = (g, pi) => spellTargets(g, pi, { target: 'any' });

export function find(g, uid) {
  for (const p of g.p) {
    if (p.hero.uid === uid) return p.hero;
    for (const m of p.board) if (m.uid === uid) return m;
  }
  return null;
}

// ---------------------------------------------------------------------------------------------------- doing it

export function makeMinion(g, id, owner) {
  const def = CARD[id], kw = def.kw || [];
  return { uid: 'm' + (g.uid++), id, owner, atk: def.atk, hp: def.hp, maxHp: def.hp,
    guard: kw.includes('guard'), swift: kw.includes('swift'), nacre: kw.includes('nacre'),
    sleeping: !kw.includes('swift'), attacked: false, dead: false };
}

/** Play a card from the hand. `target` for a targeted spell; `pos` where on the board a minion goes. */
export async function playCard(g, pi, cardUid, target = null, pos = null) {
  const p = g.p[pi];
  const i = p.hand.findIndex((c) => c.uid === cardUid);
  if (i < 0) return false;
  const card = p.hand[i], def = CARD[card.id];
  if (!canPlay(g, pi, card)) return false;
  if (def.type === 'spell' && def.target && !spellTargets(g, pi, def).includes(target)) return false;
  p.mana -= costOf(g, pi, card);
  p.hand.splice(i, 1);
  if (def.type === 'minion') {
    const m = makeMinion(g, card.id, pi);
    const at = pos === null ? p.board.length : Math.max(0, Math.min(p.board.length, pos));
    p.board.splice(at, 0, m);
    await g.emit('play', { p: pi, card, minion: m });
    if (def.surface) {
      await g.emit('trigger', { minion: m, kind: 'surface' });
      await def.surface(fxFor(g), pi, m);
    }
  } else {
    await g.emit('spell', { p: pi, card, target });
    await def.cast(fxFor(g), pi, target);
  }
  await settle(g);
  return true;
}

export async function attack(g, attackerUid, targetUid) {
  const a = find(g, attackerUid), t = find(g, targetUid);
  if (!a || !t || a.isHero || !canAttack(g, a) || !attackTargets(g, a).includes(t)) return false;
  a.attacked = true;
  await g.emit('attack', { attacker: a, target: t });
  const back = t.isHero ? 0 : t.atk;
  await damage(g, t, a.atk, { quiet: true });
  if (back > 0) await damage(g, a, back, { quiet: true });
  await g.emit('attacked', { attacker: a, target: t });
  await settle(g);
  return true;
}

export async function heroPower(g, pi, targetUid) {
  const t = find(g, targetUid);
  if (!canPower(g, pi) || !t) return false;
  const p = g.p[pi];
  p.mana -= HERO_POWER.cost;
  p.powerUsed = true;
  await g.emit('power', { p: pi, target: t });
  await damage(g, t, 1, { bolt: true, from: p.hero });
  await settle(g);
  return true;
}

export async function damage(g, t, n, opts = {}) {
  if (n <= 0 || t.dead || g.over) return;
  if (opts.bolt) await g.emit('bolt', { target: t, from: opts.from || null });
  if (t.nacre) {
    t.nacre = false;
    await g.emit('damage', { target: t, n: 0, absorbed: true });
    return;
  }
  t.hp -= n;
  if (t.hp <= 0 && !t.isHero) t.dead = true;
  await g.emit('damage', { target: t, n });
}

export async function heal(g, t, n) {
  const before = t.hp;
  t.hp = Math.min(t.maxHp, t.hp + n);
  await g.emit('heal', { target: t, n: t.hp - before });
}

/** Clear away the dead, run their last breaths (which may kill more), and see whether a hero has fallen. */
export async function settle(g) {
  for (let guard = 0; guard < 30; guard++) {
    const dead = [];
    for (const p of g.p) for (const m of p.board) if (m.dead || m.hp <= 0) { m.dead = true; dead.push(m); }
    if (!dead.length) break;
    await g.emit('death', { minions: dead });
    for (const p of g.p) p.board = p.board.filter((m) => !m.dead);
    await g.emit('sync', {});
    for (const m of dead) {
      const def = CARD[m.id];
      if (def.lastBreath && !g.over) {
        await g.emit('trigger', { minion: m, kind: 'lastBreath' });
        await def.lastBreath(fxFor(g), m.owner, m);
      }
    }
  }
  if (!g.over) {
    const d0 = g.p[0].hero.hp <= 0, d1 = g.p[1].hero.hp <= 0;
    if (d0 || d1) {
      g.over = true;
      g.winner = d0 && d1 ? -1 : (d0 ? 1 : 0);
      await g.emit('over', { winner: g.winner });
    }
  }
  await g.emit('sync', {});
}

/** The toolkit a card's effect is written with. */
function fxFor(g) {
  return {
    g,
    hero: (pi) => g.p[pi].hero,
    minions: (pi) => g.p[pi].board.filter((m) => !m.dead),
    pick: (arr) => arr[Math.floor(g.random() * arr.length)],
    damage: (t, n, opts) => damage(g, t, n, opts),
    async damageAll(targets, n) {
      await g.emit('wave', { targets });
      for (const t of targets) await damage(g, t, n, { quick: true });
    },
    heal: (t, n) => heal(g, t, n),
    draw: async (pi, n) => { for (let i = 0; i < n; i++) await drawCard(g, pi); },
    async buff(m, atk, hp, kw = {}) {
      if (m.dead) return;
      m.atk += atk; m.hp += hp; m.maxHp += hp;
      if (kw.nacre) m.nacre = true;
      if (kw.guard) m.guard = true;
      await g.emit('buff', { minion: m });
    },
    async destroyAll(targets) {
      await g.emit('wave', { targets, wipe: true });
      for (const t of targets) t.dead = true;
    },
    async addToHand(pi, id) {
      const p = g.p[pi];
      if (p.hand.length >= MAX_HAND) return;
      const card = { uid: 'c' + (g.uid++), id };
      p.hand.push(card);
      await g.emit('draw', { p: pi, card, returned: true });
    },
  };
}
