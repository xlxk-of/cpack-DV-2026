# NACRE · Duels of the Drowned Stars

A collectible card duelling game that runs as a plain web page: open foil packs, build a twenty-card deck, trade,
and duel three lords of a drowned sea. Twenty original cards, all drawn as chunky marker doodles (fat ink line, flat
colour) and rendered in HD, with foils that get louder with rarity.

| Rarity | Cards | What the card does in your hand |
|---|---|---|
| Common | 7 | matte, with a soft lamp glare when held |
| Rare | 5 | **shine** — a band of light crosses the card as it tilts |
| Epic | 4 | shine + **parallax** (the picture is four layers that slide against each other) + **holo** lines |
| Legendary | 3 | full-art, parallax, shine, holo, **glitter** and an **oil-slick** that crawls as the card turns |
| Mythic | 1 | all of that plus a **prism** band, rainbow rays from the lamp and a turning prismatic rim |

Move the mouse (or a finger) over a card to tilt it; on a phone the inspector also follows the phone itself.

## Play it

It is static files with no build step, but it uses JavaScript modules, so it has to be served rather than opened from
disk:

```bash
python3 -m http.server 8000      # then open http://localhost:8000
```

or publish the repository with **GitHub Pages** (Settings → Pages → deploy from branch, folder `/ (root)`) and open
the address it gives you. On a phone, *Add to Home Screen* makes it open like an app.

Progress is kept in the browser's own storage; nothing is sent anywhere.

## The game

- **Duel** — two heroes at 30 health. Each turn you gain a pearl of mana (up to 10) and draw a card. Play minions and
  spells, attack with minions that have been on the board for a turn, and spend 2 mana on *Starspark* (1 damage to
  anything). Drag a card onto the board or onto a target, drag a minion onto an enemy — or tap it, then tap where it
  goes. Three opponents of rising difficulty: Old Brackwater, Madame Murk, The Drowned King.
- **Words on the cards** — *Guard* (must be attacked first), *Swift* (attacks the turn it arrives), *Nacre* (ignores
  the first damage), *Surface* (when played), *Last Breath* (when it dies), *Ebb* (at the end of your turn).
- **Collection** — every card, what you hold, and the deck builder (two copies of a card at most; one of a Legendary
  or Mythic). Tap a card to hold it up to the light.
- **Packs** — drag across the dashed line to tear a pack open (keep to the line for GOOD / PERFECT and a few coins),
  then turn five cards over. Tide Packs promise a Rare or better, Abyssal Packs an Epic or better; a Legendary is
  promised within every eight packs. You start with four packs; duels pay gold, first wins pay packs, and a free
  pack washes ashore every six hours.
- **Harbor Market** — trading. Three merchants offer swaps, trade-ups, trade-downs and gold deals, restocked after
  every duel. *Trade with a friend* works without a server: make an offer ("my X for your Y") and send the code; your
  friend pastes it, accepts, and sends back a receipt code that completes your side.

## What is in here

| | |
|---|---|
| `index.html`, `src/` | the whole game: plain JavaScript modules and CSS, no framework |
| `src/cards.js` | the twenty cards, the rarities, the opponents and their decks |
| `src/engine.js`, `src/ai.js` | the rules of a duel and the opponent's brain (no DOM; `tools/sim.mjs` plays them headless) |
| `src/battle.js` | the duel on screen: drag/tap input and the animation of the engine's events |
| `src/card.js`, `src/card.css` | a card at any size, and every foil effect |
| `src/packs.js`, `src/trade.js`, `src/collection.js` | the pack rip and reveal, the market, the collection and deck |
| `art/`, `ui/` | the rendered illustrations (WebP, 1024 px; rarer cards also as four parallax layers) |
| `fx/` | the tiling foil textures (oil slick, glitter, flakes) |
| `tools/art/` | the illustrations' source: each picture is a small script that draws layered SVG |
| `sfx/` | pack sounds (from the WICK pack opener); duel sounds are synthesised in `src/sfx.js` |

## Rebuilding the art

Every picture is drawn by a script in `tools/art/cards/` using the kit in `tools/art/lib.mjs`, and rendered with
headless Chromium (needs Node with Playwright, and ImageMagick):

```bash
node tools/art/render.mjs --all                 # everything
node tools/art/render.mjs kraken --preview out  # one picture, plus PNG previews of it and its layers
python3 tools/fx/make.py                        # the foil textures (needs numpy + Pillow)
node tools/sim.mjs 300                          # AI-vs-AI games, to check the rules and the difficulty curve
```

The drawing rules that keep thirty pictures in one hand (one ink colour and set of line weights, one eye, one skin
tone, drawn light instead of blur, safe margins) are written at the top of the doodle kit in `tools/art/lib.mjs`.

Fonts: Fredoka and Nunito (SIL Open Font License).
