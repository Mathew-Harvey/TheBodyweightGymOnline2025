#!/usr/bin/env node
// Makes web-sized book images in public/images/books/ (run with `npm run images`, needs `npm install`).
//
// Covers: drop the Kindle covers in public/images/books/ as
//   handstand-kindle-cover-1600x2560.jpg and muscleup-kindle-cover-1600x2560.jpg
// and this writes <name>-cover-{400,800}.{webp,jpg} plus <name>-cover-1200.jpg (Open Graph image).
// Photos: one exercise photo per book, resized to <name>-photo-800.{webp,jpg}.
// Outputs are committed; the deploy does not run this script.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..', 'public', 'images');
const OUT = path.join(ROOT, 'books');

const COVERS = ['handstand', 'muscleup'];
const PHOTOS = {
  handstand: 'guides/handstand/freestandinghandstand1.png',
  muscleup: 'guides/muscleup/ringmu1.png'
};

async function writeSizes(src, base, widths, formats) {
  for (const width of widths) {
    for (const format of formats) {
      const file = path.join(OUT, `${base}-${width}.${format}`);
      const img = sharp(src).resize({ width, withoutEnlargement: true });
      await (format === 'webp' ? img.webp({ quality: 80 }) : img.jpeg({ quality: 82, mozjpeg: true })).toFile(file);
      console.log(`wrote ${path.relative(path.join(__dirname, '..'), file)}`);
    }
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const name of COVERS) {
    const src = path.join(OUT, `${name}-kindle-cover-1600x2560.jpg`);
    if (!fs.existsSync(src)) {
      console.warn(`warning: ${path.relative(process.cwd(), src)} not found; skipping ${name} cover`);
      continue;
    }
    await writeSizes(src, `${name}-cover`, [400, 800], ['webp', 'jpg']);
    await writeSizes(src, `${name}-cover`, [1200], ['jpg']);
  }
  for (const [name, rel] of Object.entries(PHOTOS)) {
    await writeSizes(path.join(ROOT, rel), `${name}-photo`, [800], ['webp', 'jpg']);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
