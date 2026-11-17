// Renders the scene scripts in tools/art/cards/ to WebP.
//
//   node tools/art/render.mjs glass_jelly kraken     the named scenes
//   node tools/art/render.mjs --all                  every scene
//   ... --preview <dir>                              also write <id>.png (flattened, 640px) and <id>_layers.png
//                                                    (the four layers side by side on a checkerboard) to look at
//
// Out: art/<id>.webp (flattened), art/<id>_s.webp (384px thumbnail), art/<id>_l0..l3.webp (the layers, for parallax).
// A scene may export `out = 'ui'` to be written to ui/ instead, `size = [w, h]` for a canvas that is not 1024²,
// `flatOnly = true` for no separate layers, `noThumb = true` for no thumbnail, and `transparent = true` to keep the
// flattened picture's empty areas see-through.
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Scene, hashStr } from './lib.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');

const args = process.argv.slice(2);
let previewDir = null;
const ids = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--preview') previewDir = path.resolve(args[++i]);
  else if (args[i] === '--all') ids.push(...fs.readdirSync(path.join(here, 'cards')).filter((f) => f.endsWith('.mjs')).map((f) => f.slice(0, -4)));
  else ids.push(args[i]);
}
if (!ids.length) { console.error('usage: node tools/art/render.mjs <id>... | --all [--preview dir]'); process.exit(1); }
if (previewDir) fs.mkdirSync(previewDir, { recursive: true });

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nacre-art-'));
const browser = await chromium.launch();

async function shot(svg, w, h, file, transparent) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:${transparent ? 'transparent' : '#000'}">${svg}</body></html>`);
  await page.screenshot({ path: file, omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } });
  await page.close();
}
const magick = (...a) => execFileSync('convert', a);

for (const id of ids) {
  const t0 = Date.now();
  const mod = await import(pathToFileURL(path.join(here, 'cards', id + '.mjs')).href + '?t=' + Date.now());
  const [w, h] = mod.size || [1024, 1024];
  const s = new Scene(hashStr(id), w, h);
  mod.build(s);
  const outDir = path.join(root, mod.out || 'art');
  fs.mkdirSync(outDir, { recursive: true });
  const used = s.used();
  const full = path.join(tmp, id + '.png');
  await shot(s.svgAll(), w, h, full, !!mod.transparent);
  magick(full, '-quality', '88', path.join(outDir, id + '.webp'));
  if (!mod.noThumb) magick(full, '-resize', '384x384', '-quality', '84', path.join(outDir, id + '_s.webp'));
  const layerFiles = [];
  if (!mod.flatOnly) {
    for (let i = 0; i < 4; i++) {
      const out = path.join(outDir, `${id}_l${i}.webp`);
      if (!used[i]) { if (fs.existsSync(out)) fs.unlinkSync(out); continue; }
      const f = path.join(tmp, `${id}_l${i}.png`);
      await shot(s.svg(i), w, h, f, i > 0);
      magick(f, '-quality', '88', '-define', 'webp:alpha-quality=90', out);
      layerFiles.push(f);
    }
  }
  if (previewDir) {
    magick(...(mod.transparent ? ['-size', `${w}x${h}`, 'tile:pattern:checkerboard', full, '-composite'] : [full]), '-resize', '640x640', path.join(previewDir, id + '.png'));
    if (layerFiles.length) {
      const tiles = layerFiles.map((f, i) => {
        const o = path.join(tmp, `${id}_t${i}.png`);
        magick('-size', `${w}x${h}`, 'tile:pattern:checkerboard', f, '-composite', '-resize', '320x320', o);
        return o;
      });
      magick(...tiles, '+append', path.join(previewDir, id + '_layers.png'));
    }
  }
  console.log(`${id}: ${used.filter(Boolean).length} layers, ${Date.now() - t0} ms`);
}
await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });
