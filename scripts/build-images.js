#!/usr/bin/env node
// Makes web-sized book images in public/images/books/ (run with `npm run images`, needs `npm install`).
//
// Covers: drop the Kindle covers in public/images/books/ as
//   handstand-kindle-cover-1600x2560.jpg and muscleup-kindle-cover-1600x2560.jpg
// and this writes <name>-cover-{400,800}.{webp,jpg} plus <name>-cover-1200.jpg (Open Graph image).
// It also crops the photo (no title text) from each cover for the home page hero:
//   <name>-art-{800,1400}.{webp,jpg}
// Photos: one exercise photo per book, resized to <name>-photo-800.{webp,jpg}.
// Outputs are committed; the deploy does not run this script.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..', 'public', 'images');
const OUT = path.join(ROOT, 'books');

const COVERS = ['handstand', 'muscleup'];
// Photo area of each 1600x2560 cover, above the title lettering.
const ART_CROPS = {
  handstand: { left: 0, top: 170, width: 1600, height: 1500 },
  muscleup: { left: 0, top: 170, width: 1600, height: 1300 }
};
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

// PWA icons: the ring logo centred on the brand background.
async function writeIcons() {
  const logo = path.join(ROOT, 'ringLogo.png');
  const dir = path.join(__dirname, '..', 'public', 'icons');
  for (const size of [72, 96, 128, 144, 152, 192, 384, 512]) {
    const mark = await sharp(logo).resize({ height: Math.round(size * 0.66), fit: 'inside' }).toBuffer();
    const file = path.join(dir, `icon-${size}x${size}.png`);
    await sharp({ create: { width: size, height: size, channels: 4, background: '#111214' } })
      .composite([{ input: mark, gravity: 'center' }])
      .png()
      .toFile(file);
    console.log(`wrote ${path.relative(path.join(__dirname, '..'), file)}`);
  }
}

// Blog card images: the source PNGs are 0.5-1MB each, so cards use an 800px WebP.
// scripts/blog-meta.json keeps the original path in `imageSource` and the web copy in `image`.
async function writeBlogImages() {
  const metaFile = path.join(__dirname, 'blog-meta.json');
  const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
  const dir = path.join(ROOT, 'blog');
  fs.mkdirSync(dir, { recursive: true });
  for (const [slug, post] of Object.entries(meta)) {
    post.imageSource = post.imageSource || post.image;
    const file = path.join(dir, `${slug}-800.webp`);
    await sharp(path.join(__dirname, '..', 'public', post.imageSource))
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(file);
    post.image = `/images/blog/${slug}-800.webp`;
    console.log(`wrote ${path.relative(path.join(__dirname, '..'), file)}`);
  }
  fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n');
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  await writeIcons();
  await writeBlogImages();
  for (const name of COVERS) {
    const src = path.join(OUT, `${name}-kindle-cover-1600x2560.jpg`);
    if (!fs.existsSync(src)) {
      console.warn(`warning: ${path.relative(process.cwd(), src)} not found; skipping ${name} cover`);
      continue;
    }
    await writeSizes(src, `${name}-cover`, [400, 800], ['webp', 'jpg']);
    await writeSizes(src, `${name}-cover`, [1200], ['jpg']);
    for (const width of [800, 1400]) {
      for (const format of ['webp', 'jpg']) {
        const file = path.join(OUT, `${name}-art-${width}.${format}`);
        const img = sharp(src).extract(ART_CROPS[name]).resize({ width });
        await (format === 'webp' ? img.webp({ quality: 78 }) : img.jpeg({ quality: 80, mozjpeg: true })).toFile(file);
        console.log(`wrote ${path.relative(path.join(__dirname, '..'), file)}`);
      }
    }
  }
  for (const [name, rel] of Object.entries(PHOTOS)) {
    await writeSizes(path.join(ROOT, rel), `${name}-photo`, [800], ['webp', 'jpg']);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
