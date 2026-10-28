# WICK · Arena

The cards of **WICK** (*Wizards Into Cards that Kill*), on a phone, with a battle to win them in. Build a deck of
eight, fight across a river against another wizard's candle towers, and every win puts a pack in a slot: light its
candle, let it burn down, and tear the pack open with your finger, exactly as the pack opener always did.

It is made for the **iPhone Duo**. Folded, it plays on the cover screen; opened, it spreads over both halves; and
laid flat between two people it is a table: a **Duo Duel**, the river running along the crease and each player's hand
facing them, both throwing cards at once.

It is still a plain web page: no app store, no install, nothing to sign, no server and no account. Put it on GitHub
Pages, add it to the home screen, and it opens like an app, full-screen, and plays with no signal at all.

## Put it on your phone

1. **Publish it.** In the repository on GitHub: **Settings → Pages**, and under *Build and deployment* set
   *Source* to **Deploy from a branch**, the branch this is on, folder **`/ (root)`**. Save. After a minute GitHub
   gives you an address like `https://<your-name>.github.io/<repo>/`.
2. **Open that address in Safari on the iPhone.** (Safari, not Chrome: only Safari can add a web app to the home
   screen on iOS.)
3. Tap the **Share** button, scroll down, tap **Add to Home Screen**, then **Add**.
4. Open it from the home screen. It runs full-screen in either orientation, keeps every collection on the phone, and
   works on a plane.

To update it later: push the new files, then open the app twice (once to fetch the new version, once to run it).

The address is also how it is shared: send it to anyone and they can add it to their own phone. Each phone keeps its
own collections.

## Playing

**The battle.** Each side has three candle towers: a king in the middle at the back, and one on each lane. Mana fills
on its own (one every 2.8 seconds, twice as fast in the last minute); drag a card from your hand onto the field, or
tap it and then tap the field. Summons, buildings and traps go on your own half; spells go anywhere. Your summons walk
up their lane, over a bridge, and go for the towers. A tower's candle burns down as it is hurt and goes out when it
falls. A side tower is a **crown**; the king is all **three**. Three minutes; if the crowns are level, overtime, and
the next crown wins; after that the side whose weakest tower stands higher.

**Every card fights.** All 58 cards keep what they do in the game, said in the arena's terms (the card sheet shows
each one's battle rules and numbers at your level):

- **Summons** walk and fight: Ember Sprites are a floating swarm, the Inferno Golem and the Frostbound Sentinel walk
  for the towers and nothing else, the Phoenix leaves an egg, the Seraph heals your weakest tower as it strikes, a
  Mirror Image copies the enemy summon nearest where it lands.
- **Buildings** stand and run out: a Fire Totem shoots, a Snowman Decoy draws every enemy near it, a Rune Bulwark
  blocks ground summons and bolts, a Mana Pump pays you back, a lit Candlewick makes your fire cards cheaper.
- **Traps** wait under the floor (the Rune Trap, the Grave Hand), unseen by the computer rival. (In a Duo Duel
  there is one screen between you, so both of you can see them, faintly.)
- **Spells** land where they are aimed: Fireball, Meteor Cascade (lead your target: it is slow), Chain Lightning,
  Cyclone, Gravity Well, a cloud of rot, a holy blast. A spell hits a tower for a third of its damage.
- **Rituals** need no aim: Time Warp stops the enemy's half of the field, Nightmare turns their hand face down, Card
  Trick redraws yours, a Mirror Wand copies the last card you played for one more mana.

A card's **level** (1, 10, 50, 100, 250, 500 and 1000 copies, as ever) makes it 6% stronger a level. The picture and
tint a card wears in the collection are the ones it wears in your hand in battle, so a scene, or a scene that moves,
out of a Mythic Pack shows there too.

**Emotes.** The speech button by your name offers four card faces to say something across the river with: *HEE
HEE!*, *WELL PLAYED*, *OOPS…* and *GRRR!*. The computer rival has a few words of its own when a crown falls.

**The ladder.** Trophies are won (about 30) and lost (about 20) a battle at a time. The **leagues are the ranked tiers
of the packs**, Bronze up to Top 100, each with the emblem off its own pack; once reached, a league's trophies are
never lost again. A higher league means better packs and wiser rivals: eleven of them, each a deck with a theme
(Ember Cult, Frost Choir, Gravecallers, Paladins, Siegewrights…), and between them every card in the box turns up
on the other side of the river.

**Packs.** A win puts a pack in one of four slots: usually your league's Ranked Pack, sometimes the next league's,
now and then a Legendary Booster or a Mythic Pack. A pack is sealed with a candle: tap it to light it (one at a time),
and when it has burned down, tear it open. **Embers**, won in battle, burn a candle down at once. There is also a
**free Starter Pack** every four hours, a **Crown Pack** (a Legendary Booster) for every ten crowns, and the **shop**,
where gold won in battle buys any pack up to your league. The rip, the grades (**GOOD**, **PERFECT!!**), the level-ups
breaking like glass and the Mythic cosmetics are all the opener's own. **Collector mode** (in the wizards panel)
brings the old opener back: every pack free, every candle out at once.

**CARDS** holds three decks of eight and the whole collection. Tap a card to see it large, what it does in the arena,
the level tint and the picture it may wear, and to put it in the deck.

## The iPhone Duo

| | |
|---|---|
| **Folded** (the cover screen) | the arena on the left, your hand in a column on the right, where a thumb is |
| **Open, held sideways** | two panes, one either side of the crease. Home: the battle on one side, the packs on the other. In battle: the rival's corner, the arena between, your hand. A card's sheet: the card on one half, its rules on the other. A pack: all five cards at once |
| **Open, held upright** | the arena tall, your hand beside it |
| **Duo Duel** | two players, one Duo laid flat. The river is on the crease, each hand faces its player, and both play at once with a finger each. Fold it shut and the duel pauses |

Opening or closing the Duo in the middle of anything (a battle included) lays the screen out again on the spot. With
*Reduce Motion* on (Settings → Accessibility → Motion), the field no longer shakes and the glowing UI holds still.

How the app knows: from the shape of the screen, which is enough on its own. Safari on the Duo can also tell a page
about the fold directly, through the **Device Posture** and **Viewport Segments** APIs, but only with them turned on
under *Settings → Apps → Safari → Advanced → Feature Flags*; when they are on, the app uses them. And the wizards
panel can set it by hand: **AUTO**, **FOLDED** or **OPEN**.

**Sharing one phone.** Every person who plays has a **wizard** of their own (tap the name at the top left): their own
cards, decks, trophies and packs. A Duo Duel puts two of them across the river, or one of them against a guest
borrowing a ready-made deck, with every card at level 1 if you want it fair. The phone keeps the score between each
pair. A collection from the old pack opener becomes the first wizard, every card kept.

## What is in here

| | |
|---|---|
| `index.html`, `src/` | the whole app: plain JavaScript, no framework and no build step |
| `src/app.js` | the screens: home, the ladder, pack slots, the shop, the deck and collection, the wizards |
| `src/battle/sim.js` | the battle itself, as numbers: towers, summons, spells, mana, the clock. It never touches the page |
| `src/battle/cards.js` | every card's rules in the arena |
| `src/battle/ai.js`, `decks.js` | the computer wizard, and the rivals' decks |
| `src/battle/art.js`, `view.js` | the arena drawn: pixel-art floor, river, candle towers and tokens cut from the cards' own pictures, and every spark and bolt |
| `src/battle/play.js` | the battle screen: the layouts, the fingers, the hand, the clock and the crowns |
| `src/duo.js` | which way the Duo is open |
| `src/rules.js` | the opening rules from the game, and the ladder's (leagues, rewards, candle times, prices) |
| `src/pack.js`, `card.js`, `shatter.js` | the rip, a card face, and breaking glass, as they were |
| `art/`, `ui/`, `sfx/` | the game's own pictures and sounds (the battle's sounds are made on the spot) |
| `sw.js` | the service worker: it is what lets the app work with no signal |
| `tools/simtest.mjs` | fights every rival deck against every other with no screen, and reports how each fares |

The collections live in the phone's own storage. Clearing Safari's website data for the site throws them away, so
**export** first (wizards panel → THE COLLECTION).

The battle can be tested without a browser:

```bash
node tools/simtest.mjs 2 0.6      # rounds, and how well the computer plays (0 to 1)
```

It checks that nothing breaks, that every battle ends and every card gets played, and prints each deck's record,
tower damage and mana: the place to look before changing a card's numbers.

Rebuild the pictures and sounds from the game with `python tools/build_web_pwa.py` there, copying only `art/`, `ui/`,
`sfx/` and `data/` over: the code here is the arena's own now.
