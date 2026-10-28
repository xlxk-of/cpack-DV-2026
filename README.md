# WICK · Pack Opener

The card opening and collecting from **WICK** (*Wizards Into Cards that Kill*), on a phone. Pick a pack, tear it open
with your finger, turn the cards over one at a time, and keep them. No duel, no account, no server: just the packs.

It is a plain web page — no app store, no install, nothing to sign. Put it on GitHub Pages and add it to your iPhone's
home screen and it opens like an app, with no Safari chrome, and works with no signal.

## Put it on your phone

1. **Publish it.** In the repository on GitHub: **Settings → Pages**, and under *Build and deployment* set
   *Source* to **Deploy from a branch**, branch **main**, folder **`/ (root)`** if this folder is the whole
   repository, or **`/docs`** if you renamed it to `docs`. Save. After a minute GitHub gives you an address like
   `https://<your-name>.github.io/<repo>/`.
2. **Open that address in Safari on the iPhone.** (Safari, not Chrome: only Safari can add a web app to the home
   screen on iOS.)
3. Tap the **Share** button (the square with the arrow), scroll down, tap **Add to Home Screen**, then **Add**.
4. Open it from the home screen. It runs full-screen, keeps your collection on the phone, and works on a plane.

To update it later: push the new files, then open the app twice (once to fetch the new version, once to run it).

## Playing

- **PACKS** — every kind of pack the game has, and as many as you like: Starter, the eight Ranked tiers
  (Bronze up to Top 100), the Legendary Booster and the Mythic Pack. They cost nothing here.
- **The rip** — drag a finger across the top of the pack, along the printed dashes. Keep to the line and the rip is
  graded **GOOD** or **PERFECT!!**, exactly as the game grades it. The tear follows your own hand, so no two are alike.
- **The cards** — they turn over one at a time. A card that reaches a new level breaks its old look like a pane of
  glass. Tap anywhere to turn the rest over at once.
- **Levels** — 1, 10, 50, 100, 250 and 500 copies of a card are levels 1 to 6; at level 6 its picture becomes the
  full-art **scene**. A few cards have a seventh level at 1000 copies, where the scene **moves**.
- **A Mythic Pack** always holds one **cosmetic** as well: a card's scene, or — rarely, in rainbow glass — the
  animation. A cosmetic changes only what a card looks like. Its level, its stars and its tint stay its own.
- **COLLECTION** — every card, what you hold of it, and what it may wear. Tap one to see it large and to choose its
  level tint and its picture.
- **···** (top right) — how far along you are, and **export** / **import**, which carry a collection to another phone
  as a line of text. **wipe** throws it away.

## What is in here

| | |
|---|---|
| `index.html`, `src/` | the whole app: about 1,400 lines of plain JavaScript, no framework and no build step |
| `src/rules.js` | the opening rules, taken straight from the game (pack kinds, copies, levels, cosmetics) |
| `src/pack.js` | the rip: the pack is cut column by column on a canvas, wherever your finger goes |
| `src/card.js` | a card face, laid out at the game's own 300 × 400 coordinates |
| `src/shatter.js` | the breaking glass (a level-up, and a Mythic Pack's locked card) |
| `art/`, `ui/`, `sfx/` | the game's own pictures and sounds (`tools/build_web_pwa.py` in the game copies them here) |
| `sw.js` | the service worker: it is what lets the app work with no signal |

The collection lives in the phone's own storage. Clearing Safari's website data for the site throws it away, so
**export** before you do that.

Rebuild the assets from the game with:

```bash
python tools/build_web_pwa.py
```
