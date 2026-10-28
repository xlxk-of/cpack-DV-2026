// Fights battles with no screen: computer against computer, every rival deck against every other, and checks that
// nothing breaks (no error, no NaN, every battle ends, nothing piles up) and that every card gets played. Prints how
// each deck fares, so a card that is far too strong or too weak shows up.
//
//   node tools/simtest.mjs [rounds] [skill]
import { readFileSync } from 'node:fs';
import { Battle } from '../src/battle/sim.js';
import { Brain } from '../src/battle/ai.js';
import { BATTLE } from '../src/battle/cards.js';
import { RIVAL_DECKS } from '../src/battle/decks.js';

const cards = JSON.parse(readFileSync(new URL('../data/cards.json', import.meta.url))).cards;
const rounds = parseInt(process.argv[2] || '2', 10);
const skill = parseFloat(process.argv[3] || '0.6');

const missing = cards.filter((c) => !BATTLE[c.id]).map((c) => c.id);
if (missing.length) throw new Error('no battle rules for: ' + missing.join(', '));
const inDecks = new Set(RIVAL_DECKS.flatMap((d) => d.cards));
const unused = cards.filter((c) => !inDecks.has(c.id)).map((c) => c.id);
if (unused.length) console.log('cards in no rival deck:', unused.join(', '));

const played = {};
const usage = {};
const record = {};
let games = 0, draws = 0, totalT = 0, crownsTotal = 0, maxEntities = 0, reasons = {};

function check(b) {
  for (const e of b.entities) {
    for (const k of ['x', 'y', 'hp', 'shield']) {
      if (!Number.isFinite(e[k])) throw new Error('NaN ' + k + ' on ' + (e.card || e.tower) + ' at t=' + b.t.toFixed(2));
    }
  }
  for (const p of b.players) if (!Number.isFinite(p.mana)) throw new Error('NaN mana');
  for (const p of b.projectiles) if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) throw new Error('NaN projectile ' + p.card);
}

let seed = 1;
for (let r = 0; r < rounds; r++) {
  for (const a of RIVAL_DECKS) {
    for (const c of RIVAL_DECKS) {
      if (a === c) continue;
      seed++;
      const b = new Battle(cards, [{ name: a.key, deck: a.cards }, { name: c.key, deck: c.cards }], { seed });
      const brains = [new Brain(b, 0, skill, seed * 3), new Brain(b, 1, skill, seed * 7)];
      const towerDmg = [0, 0], leaked = [0, 0];
      b.onDamage = (e, dealt, src) => { if (e.type === 'tower' && src.team >= 0 && src.team !== e.team) towerDmg[src.team] += dealt; };
      let steps = 0;
      while (!b.over) {
        brains[0].update(1 / 60);
        brains[1].update(1 / 60);
        for (const p of b.players) if (p.mana >= 9.999) leaked[p.team] += b.manaRate(p.team) / 60;
        b.step(1 / 60);
        for (const ev of b.drain()) {
          if (ev.t !== 'cast') continue;
          played[ev.card] = (played[ev.card] || 0) + 1;
          const key = (ev.team === 0 ? a : c).key;
          const use = usage[key] || (usage[key] = {});
          use[ev.card] = (use[ev.card] || 0) + 1;
        }
        if (++steps % 30 === 0) check(b);
        maxEntities = Math.max(maxEntities, b.entities.length + b.projectiles.length + b.zones.length);
        if (steps > 60 * 400) throw new Error('battle did not end');
      }
      games++;
      totalT += b.t;
      reasons[b.result.reason] = (reasons[b.result.reason] || 0) + 1;
      crownsTotal += b.result.crowns[0] + b.result.crowns[1];
      for (const [i, d] of [[0, a], [1, c]]) {
        const rec = record[d.key] || (record[d.key] = { w: 0, l: 0, d: 0, crowns: 0, tdmg: 0, spent: 0, leaked: 0, took: 0 });
        rec.crowns += b.result.crowns[i];
        rec.tdmg += towerDmg[i];
        rec.took += towerDmg[1 - i];
        rec.spent += b.players[i].spent;
        rec.leaked += leaked[i];
        if (b.result.winner === -1) rec.d++;
        else if (b.result.winner === i) rec.w++;
        else rec.l++;
      }
      if (b.result.winner === -1) draws++;
    }
  }
}

console.log(`${games} battles, skill ${skill}: average ${(totalT / games).toFixed(0)}s, ${(crownsTotal / games).toFixed(2)} crowns a battle, ${draws} draws, most things at once ${maxEntities}`);
console.log('ended by', reasons);
for (const d of RIVAL_DECKS) {
  const r = record[d.key];
  const n = r.w + r.l + r.d;
  console.log(d.name.padEnd(16), `won ${(100 * r.w / n).toFixed(0).padStart(3)}%`, ` w${r.w} l${r.l} d${r.d}`.padEnd(13), ` crowns ${(r.crowns / n).toFixed(2)}`,
    ` tower dmg dealt ${(r.tdmg / n).toFixed(0).padStart(5)} taken ${(r.took / n).toFixed(0).padStart(5)}`, ` mana spent ${(r.spent / n).toFixed(0)} wasted ${(r.leaked / n).toFixed(1)}`);
}
if (process.env.USAGE) {
  for (const d of RIVAL_DECKS) {
    const n = record[d.key].w + record[d.key].l + record[d.key].d;
    console.log(d.name.padEnd(16), d.cards.map((id) => id + ' ' + ((usage[d.key][id] || 0) / n).toFixed(1)).join(', '));
  }
}
const never = cards.filter((c) => !played[c.id]).map((c) => c.id);
console.log('never played:', never.length ? never.join(', ') : 'none');
const sorted = Object.entries(played).sort((x, y) => x[1] - y[1]);
console.log('least played:', sorted.slice(0, 8).map(([k, v]) => k + ' ' + v).join(', '));
console.log('most played:', sorted.slice(-6).map(([k, v]) => k + ' ' + v).join(', '));
