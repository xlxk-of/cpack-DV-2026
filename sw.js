// The service worker: what lets the game work with no signal at all once it is on the home screen. The shell (the
// page, the code, the card data, the pack art) is taken on the first visit; a card's picture is kept the first time it
// is seen, so a collection grows lighter to open the more of it you have opened (and the arena's own pictures are
// painted in code, so a battle needs nothing more). Bump VERSION to push an update out: the old cache is thrown away
// the next time the app is opened twice.
const VERSION = 'wick-arena-v1';
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'src/app.js',
  'src/arena.css',
  'src/duo.js',
  'src/battle/ai.js',
  'src/battle/art.js',
  'src/battle/cards.js',
  'src/battle/decks.js',
  'src/battle/play.js',
  'src/battle/sim.js',
  'src/battle/view.js',
  'src/card.js',
  'src/pack.js',
  'src/rules.js',
  'src/save.js',
  'src/sfx.js',
  'src/shatter.js',
  'src/style.css',
  'data/cards.json',
  'ui/card_face.png',
  'ui/card_back.png',
  'ui/star.png',
  'ui/logo.png',
  'ui/unlock_card.png',
  'ui/pack_glow.png',
  'ui/pack_tear.json',
  'ui/pack_full.png',
  'ui/pack_legendary.png',
  'ui/pack_mythic.png',
  'ui/pack_ranked_0.png',
  'ui/pack_ranked_1.png',
  'ui/pack_ranked_2.png',
  'ui/pack_ranked_3.png',
  'ui/pack_ranked_4.png',
  'ui/pack_ranked_5.png',
  'ui/pack_ranked_6.png',
  'ui/pack_ranked_7.png',
  'icons/icon_180.png',
  'icons/icon_192.png',
  'icons/icon_512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // one at a time, and never mind one that will not come: a missing file must not stop the app installing
    await Promise.all(SHELL.map((url) => cache.add(url).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key !== VERSION) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  const url = new URL(req.url);
  // The shell (the page, the code, the card data) is asked for FIRST and only falls back to what was kept: an update
  // lands the moment the phone has signal. Pictures and sounds never change, so they come out of the cache at once
  // and are kept the first time they are seen.
  const shell = req.mode === 'navigate' || /\.(js|css|json|webmanifest)$/.test(url.pathname);
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    if (shell) {
      try {
        const res = await fetch(req);
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      } catch (err) {
        return (await cache.match(req, { ignoreSearch: true }))
          || (req.mode === 'navigate' ? await cache.match('index.html') : Response.error());
      }
    }
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
      return res;
    } catch (err) {
      return Response.error();
    }
  })());
});
