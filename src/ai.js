// The opponent. It takes one action at a time and looks again, since every action changes the board:
//   1. if what it has can kill the enemy hero this turn, it does that;
//   2. it spends its mana on the best card it can afford (spells only when they are worth it);
//   3. it attacks: good trades first, then the face.
// `level` 0 is forgetful (never uses its spark, attacks at random, sometimes keeps a card it could have played),
// 1 plays properly, 2 also weighs trades more carefully and holds its board wipes for when it is losing.
import { CARD, HERO_POWER } from './cards.js';
import { canPlay, canAttack, attackTargets, canPower, playCard, attack, heroPower, endTurn, spellTargets } from './engine.js';

export async function aiTurn(g, pi, level = 1, pause = async () => {}) {
  for (let step = 0; step < 60 && !g.over && g.turn === pi; step++) {
    const act = choose(g, pi, level);
    if (!act) break;
    await pause(act);
    if (act.kind === 'play') await playCard(g, pi, act.card.uid, act.target || null, act.pos ?? null);
    else if (act.kind === 'attack') await attack(g, act.attacker.uid, act.target.uid);
    else if (act.kind === 'power') await heroPower(g, pi, act.target.uid);
  }
  if (!g.over && g.turn === pi) { await pause({ kind: 'end' }); await endTurn(g); }
}

function choose(g, pi, level) {
  const me = g.p[pi], foe = g.p[1 - pi];
  const attackers = me.board.filter((m) => canAttack(g, m));
  const guards = foe.board.filter((m) => m.guard);

  // ---- lethal: is the face open, and is there enough?
  if (!guards.length) {
    let reach = attackers.reduce((s, m) => s + m.atk, 0);
    let mana = me.mana;
    const burn = me.hand.filter((c) => CARD[c.id].ai?.kind === 'damage').sort((a, b) => CARD[a.id].cost - CARD[b.id].cost);
    const plan = [];
    for (const c of burn) if (CARD[c.id].cost <= mana) { mana -= CARD[c.id].cost; reach += CARD[c.id].ai.n; plan.push(c); }
    const spark = level > 0 && canPower(g, pi) && mana >= HERO_POWER.cost;
    if (spark) reach += 1;
    const need = foe.hero.hp;
    if (reach >= need) {
      if (attackers.length) return { kind: 'attack', attacker: attackers[0], target: foe.hero };
      if (plan.length && canPlay(g, pi, plan[0])) return { kind: 'play', card: plan[0], target: foe.hero };
      if (spark) return { kind: 'power', target: foe.hero };
    }
  }

  // ---- cards
  const playable = me.hand.filter((c) => canPlay(g, pi, c));
  let best = null;
  for (const c of playable) {
    const s = scorePlay(g, pi, c, level);
    if (s && (!best || s.score > best.score)) best = s;
  }
  if (best && !(level === 0 && g.random() < 0.12)) return best;

  // ---- attacks
  if (attackers.length) {
    if (level === 0) {
      const a = attackers[0], ts = attackTargets(g, a);
      return { kind: 'attack', attacker: a, target: ts[Math.floor(g.random() * ts.length)] };
    }
    let bestA = null;
    for (const a of attackers) {
      for (const t of attackTargets(g, a)) {
        const s = scoreAttack(g, pi, a, t, level);
        if (!bestA || s > bestA.score) bestA = { kind: 'attack', attacker: a, target: t, score: s };
      }
    }
    if (bestA) return bestA;
  }

  // ---- the spark, with whatever mana is left
  if (level > 0 && canPower(g, pi)) {
    const kill = foe.board.filter((m) => m.hp === 1 && !m.nacre).sort((a, b) => b.atk - a.atk)[0];
    const pop = foe.board.filter((m) => m.nacre).sort((a, b) => b.atk - a.atk)[0];
    return { kind: 'power', target: kill || pop || foe.hero };
  }
  return null;
}

const worth = (m) => m.atk * 1.1 + m.hp + (m.guard ? 1.5 : 0) + (m.nacre ? 1.5 : 0);

function scorePlay(g, pi, card, level) {
  const def = CARD[card.id], me = g.p[pi], foe = g.p[1 - pi];
  if (def.type === 'minion') {
    let score = def.cost * 2 + def.atk * 0.3 + def.hp * 0.2;
    if (card.id === 'kraken' || card.id === 'stormcaller_ray') score += foe.board.length ? 2 : -1.5;
    if (card.id === 'pearl_sovereign') score += me.board.length * 1.5 - 1;
    if (card.id === 'tidepool_mender') score += me.hero.hp < 24 ? 1.5 : 0;
    if (card.id === 'drowned_star') score += 4;
    return { kind: 'play', card, score, pos: Math.floor(g.random() * (me.board.length + 1)) };
  }
  const ai = def.ai || {};
  if (ai.kind === 'damage') {
    // best minion it kills outright; never worth it on something trivial
    let pick = null;
    for (const m of foe.board) {
      if (m.nacre || m.hp > ai.n) continue;
      const v = worth(m) - (ai.n - m.hp) * 0.4;
      if (!pick || v > pick.v) pick = { m, v };
    }
    if (pick && pick.v >= 4) return { kind: 'play', card, target: pick.m, score: 3 + pick.v };
    if (foe.hero.hp <= 8 && !foe.board.some((m) => m.guard)) return { kind: 'play', card, target: foe.hero, score: 4 };
    return null;
  }
  if (ai.kind === 'buff') {
    const ready = me.board.filter((m) => canAttack(g, m)).sort((a, b) => b.atk - a.atk)[0];
    const any = me.board.slice().sort((a, b) => worth(b) - worth(a))[0];
    const t = ready || any;
    if (!t) return null;
    return { kind: 'play', card, target: t, score: ready ? 5 : 2.5 };
  }
  if (ai.kind === 'aoe') {
    const hit = foe.board.filter((m) => !m.nacre);
    const kills = hit.filter((m) => m.hp <= ai.n).length;
    const v = kills * 3 + (foe.board.length - kills) * 1;
    if (foe.board.length >= 2 && v >= 4) return { kind: 'play', card, score: 4 + v };
    return null;
  }
  if (ai.kind === 'wipe') {
    const mine = me.board.reduce((s, m) => s + worth(m), 0), theirs = foe.board.reduce((s, m) => s + worth(m), 0);
    const margin = level >= 2 ? 9 : 6;
    if (foe.board.length >= 2 && theirs - mine >= margin) return { kind: 'play', card, score: 20 };
    return null;
  }
  if (def.target) {
    const ts = spellTargets(g, pi, def);
    return ts.length ? { kind: 'play', card, target: ts[0], score: 1 } : null;
  }
  return { kind: 'play', card, score: 1 };
}

function scoreAttack(g, pi, a, t, level) {
  const foe = g.p[1 - pi], me = g.p[pi];
  if (t.isHero) {
    // going face: better the lower they are, worse if we are the one being raced down
    const threat = foe.board.reduce((s, m) => s + m.atk, 0);
    return 3 + a.atk * 0.5 + (foe.hero.hp <= 12 ? 2 : 0) - (level >= 2 && threat >= me.hero.hp - 6 ? 3 : 0);
  }
  const kills = !t.nacre && a.atk >= t.hp;
  const dies = !a.nacre && t.atk >= a.hp;
  let s = 0;
  if (kills) s += worth(t) + 2;
  else if (t.nacre) s += 1.5;                     // at least it strips the pearl coat
  else s += Math.min(a.atk, t.hp) * 0.4;
  if (dies) s -= worth(a) * (level >= 2 ? 1 : 0.8);
  else s += 1.5;
  if (t.guard) s += 1.5;                           // guards are in the way of everything else
  if (CARD[t.id].ebb) s += 2;                      // engines get worse every turn they live
  if (CARD[a.id].lastBreath && dies) s += 1.5;
  return s;
}
