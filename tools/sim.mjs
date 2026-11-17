// Plays the AI against itself with nobody watching, to shake the rules for crashes and to see how the three
// opponents fare against the starter deck.   node tools/sim.mjs [games]
import { OPPONENTS, STARTER_DECK, PLAYER_HERO, CARD } from '../src/cards.js';
import { newGame, startGame } from '../src/engine.js';
import { aiTurn } from '../src/ai.js';
import { rng } from './art/lib.mjs';

const N = Number(process.argv[2] || 200);
for (const id of [...STARTER_DECK, ...OPPONENTS.flatMap((o) => o.deck)]) if (!CARD[id]) throw new Error('unknown card ' + id);

async function play(deckA, deckB, levelA, levelB, seed) {
  const g = newGame({ decks: [deckA, deckB], heroes: [PLAYER_HERO, PLAYER_HERO], random: rng(seed) });
  await startGame(g);
  let turns = 0;
  while (!g.over && turns++ < 200) await aiTurn(g, g.turn, g.turn === 0 ? levelA : levelB);
  return { winner: g.over ? g.winner : -2, rounds: g.round };
}

for (const opp of OPPONENTS) {
  let wins = 0, losses = 0, draws = 0, stuck = 0, rounds = 0;
  for (let i = 0; i < N; i++) {
    const r = await play(STARTER_DECK, opp.deck, 1, opp.level, 1000 + i);
    if (r.winner === 0) wins++; else if (r.winner === 1) losses++; else if (r.winner === -1) draws++; else stuck++;
    rounds += r.rounds;
  }
  console.log(`${opp.name.padEnd(18)} starter deck (played by the level-1 AI) wins ${(100 * wins / N).toFixed(0)}%  loses ${(100 * losses / N).toFixed(0)}%  draws ${draws}  unfinished ${stuck}  avg ${(rounds / N).toFixed(1)} turns`);
}
