#!/usr/bin/env node
// Builds every image the site serves, from the originals in assets/ (run with
// `npm run images`; needs `npm install` for sharp). Outputs are committed; the deploy
// does not run this script.
//
//   public/images/photos/<name>-<width>.webp (+ <name>-<width>.jpg fallback)
//       graded photographs (see scripts/lib/grade.js), sizes from PHOTOS below
//   public/images/books/<book>-cover-{400,800}.{webp,jpg}, <book>-cover-1200.jpg
//       the Kindle covers, ungraded (product shots must match Amazon); 1200 is og:image
//   public/images/classes/<id>-{400,800}.webp
//       one graded frame per class, cropped clear of the live-stream overlays
//   public/images/demos/<youtubeId>-{320,640}.webp
//       posters for the demonstration videos on the book pages
//   public/images/blog/<slug>-{320,480}.webp
//       black and white thumbnails from each post's own photo (scripts/blog-meta.json)
//   public/images/brand/logo-{ink,paper}.png, public/icons/*
//       the wordmark in page black and paper white, the PWA icons and favicon
//
// Class frames come from YouTube's auto-generated frames at 25/50/75% of each stream
// and are cached in .cache/class-frames/ (git-ignored); they are downloaded with curl
// the first time.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const sharp = require('sharp');
const { grade, INK } = require('./lib/grade');

const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const IMG = path.join(PUB, 'images');
const CACHE = path.join(ROOT, '.cache', 'class-frames');
const rel = (f) => path.relative(ROOT, f);
const mkdir = (d) => fs.mkdirSync(d, { recursive: true });

// ---- Photographs -------------------------------------------------------------------
// crop: region of the original to keep. widths: output sizes (never upscaled).
const PHOTOS = [
  // The full handstand, head and hands in frame (the cover crop loses the head under the
  // title). Cropped inside the print border and clear of the "BAM" lettering.
  { name: 'handstand-full', src: 'assets/photos/mat-handstand-full.jpg',
    crop: { left: 85, top: 255, width: 915, height: 982 }, widths: [480, 915], grade: { warmth: 0.2, saturation: 0.85 } },
  { name: 'handstand-wall', src: 'assets/covers/handstand-kindle-cover-1600x2560.jpg',
    crop: { left: 0, top: 170, width: 1600, height: 1500 }, widths: [480, 960, 1440, 1600] },
  { name: 'rope', src: 'assets/covers/muscleup-kindle-cover-1600x2560.jpg',
    crop: { left: 0, top: 170, width: 1600, height: 1300 }, widths: [480, 960, 1440, 1600] },
  { name: 'rings', src: 'assets/photos/mat-rings.jpg', widths: [480, 960, 1080], grade: { coolSat: 0.15 } },
  { name: 'portrait', src: 'assets/photos/mat-portrait.jpg', widths: [480, 771] },
  { name: 'straddle', src: 'assets/photos/mat-straddle.jpg', widths: [480, 960, 1066] },
  { name: 'lsit-beach', src: 'assets/photos/mat-lsit-beach.jpg', widths: [480, 960, 1200], grade: { saturation: 0.85 } },
  { name: 'stream-set', src: 'assets/photos/gym-2020-stream-set.jpg',
    crop: { left: 136, top: 0, width: 1008, height: 720 }, widths: [480, 1008], grade: { contrast: 0.4, exposure: -0.1 } },
  { name: 'coaching', src: 'assets/photos/gym-coaching.avif', widths: [438], grade: { bw: true, contrast: 0.4, grain: 0.045 } },
  { name: 'gym-floor', src: 'assets/photos/gym-floor.avif', widths: [438], grade: { bw: true, contrast: 0.4, grain: 0.045 } },
  // Social card (og:image) for the home page, 1.91:1.
  { name: 'og-rings', src: 'assets/photos/mat-rings.jpg', crop: { left: 0, top: 80, width: 1080, height: 565 },
    widths: [1080], grade: { coolSat: 0.15 }, jpgOnly: true },
  // A press cutting: shown as it was printed, no grade.
  { name: 'stm-cover', src: 'assets/photos/stm-cover-2016-04-10.jpg', widths: [400, 806], grade: false },
];

// Load any source as 8-bit sRGB without alpha (AVIF/HEIF sources carry an alpha channel).
async function loadRGB(src, { crop, width, height, fit = 'cover', position = 'centre' } = {}) {
  let img = sharp(src).rotate().flatten({ background: { r: INK[0], g: INK[1], b: INK[2] } });
  if (crop) img = sharp(await img.extract(crop).png().toBuffer());
  if (width || height) img = img.resize({ width, height, fit, position, withoutEnlargement: !height });
  const { data, info } = await img.toColourspace('srgb').raw({ depth: 'uchar' }).toBuffer({ resolveWithObject: true });
  if (info.channels !== 3) throw new Error(`${src}: expected 3 channels, got ${info.channels}`);
  return { data, info };
}

async function writeImage(data, info, file, { quality = 74 } = {}) {
  const img = sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } });
  if (file.endsWith('.webp')) await img.webp({ quality, effort: 6 }).toFile(file);
  else await img.jpeg({ quality: quality + 6, mozjpeg: true }).toFile(file);
  console.log(`wrote ${rel(file)} (${info.width}x${info.height}, ${(fs.statSync(file).size / 1024).toFixed(0)} KB)`);
}

async function buildPhotos() {
  const dir = path.join(IMG, 'photos');
  mkdir(dir);
  for (const p of PHOTOS) {
    const src = path.join(ROOT, p.src);
    // Grade once at the largest size so the grain is consistent, then downscale.
    const max = Math.max(...p.widths);
    const { data, info } = await loadRGB(src, { crop: p.crop, width: max });
    const graded = p.grade === false ? data : grade(data, { seed: p.name, ...(p.grade || {}) });
    const master = await sharp(graded, { raw: { width: info.width, height: info.height, channels: 3 } }).png().toBuffer();
    for (const w of p.jpgOnly ? [] : p.widths) {
      const width = Math.min(w, info.width);
      const r = await sharp(master).resize({ width }).raw().toBuffer({ resolveWithObject: true });
      await writeImage(r.data, r.info, path.join(dir, `${p.name}-${w}.webp`));
    }
    // One JPEG for browsers without WebP and for sharing: the size closest to 960.
    const jw = p.widths.reduce((a, b) => (Math.abs(b - 960) < Math.abs(a - 960) ? b : a));
    const r = await sharp(master).resize({ width: Math.min(jw, info.width) }).raw().toBuffer({ resolveWithObject: true });
    await writeImage(r.data, r.info, path.join(dir, `${p.name}-${jw}.jpg`));
  }
}

// ---- Book covers (ungraded) -----------------------------------------------------------
async function buildCovers() {
  const dir = path.join(IMG, 'books');
  mkdir(dir);
  for (const book of ['handstand', 'muscleup']) {
    const src = path.join(ROOT, 'assets', 'covers', `${book}-kindle-cover-1600x2560.jpg`);
    for (const w of [400, 800]) {
      await sharp(src).resize({ width: w }).webp({ quality: 80, effort: 6 }).toFile(path.join(dir, `${book}-cover-${w}.webp`));
      await sharp(src).resize({ width: w }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(dir, `${book}-cover-${w}.jpg`));
    }
    await sharp(src).resize({ width: 1200 }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(dir, `${book}-cover-1200.jpg`));
    console.log(`wrote public/images/books/${book}-cover-{400,800}.{webp,jpg} and -1200.jpg`);
  }
}

// ---- Class frames ---------------------------------------------------------------------
// The 2020 streams carry overlays: an exercise caption top-left/right, a coach and class
// lower third, stickers on the left edge. This window avoids all of them.
const FRAME_CROP = { left: 190, top: 150, width: 800, height: 450 };
// Per-class windows where the default one catches an overlay: larger caption boxes at the
// top (2, 10, 13, 43), a caption at the bottom (14), a timer at the bottom (15).
const at = (top) => ({ ...FRAME_CROP, top });
const FRAME_CROP_FOR = { 2: at(215), 10: at(222), 13: at(226), 14: at(100), 15: at(96), 43: at(184) };
// YouTube's auto frames: 2 = halfway, 3 = three quarters, 1 = a quarter in (often the
// title card). Override where the halfway frame is a close-up or a joke.
const FRAME_PICK = { 15: 3, 42: 1, 45: 1, 51: 2, 59: 1 };

function download(url, file) {
  try {
    execFileSync('curl', ['-sf', '-m', '30', '-o', file, url]);
    return fs.existsSync(file) && fs.statSync(file).size > 3000;
  } catch (e) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    return false;
  }
}

async function meanLuma(file) {
  const { data } = await sharp(file).extract(FRAME_CROP).resize(64, 36).greyscale().raw().toBuffer({ resolveWithObject: true });
  return data.reduce((a, b) => a + b, 0) / data.length;
}

async function buildClassFrames() {
  const videos = JSON.parse(fs.readFileSync(path.join(PUB, 'data', 'videos.json'), 'utf8'));
  const dir = path.join(IMG, 'classes');
  mkdir(dir);
  mkdir(CACHE);
  for (const v of videos) {
    if (!/^[\w-]{11}$/.test(v.youtubeId || '')) continue;
    const order = FRAME_PICK[v.id] ? [FRAME_PICK[v.id]] : [2, 3, 1];
    let chosen = null;
    for (const n of order) {
      const file = path.join(CACHE, `${v.youtubeId}-maxres${n}.jpg`);
      if (!fs.existsSync(file) && !download(`https://i.ytimg.com/vi/${v.youtubeId}/maxres${n}.jpg`, file)) continue;
      // Title and end cards are dark navy (mean luma ~40); the gym floor is 70 to 100.
      if (FRAME_PICK[v.id] || (await meanLuma(file)) > 60) { chosen = file; break; }
    }
    if (!chosen) {
      console.warn(`warning: class ${v.id} (${v.youtubeId}) has no usable frame`);
      continue;
    }
    const { data, info } = await loadRGB(chosen, { crop: FRAME_CROP_FOR[v.id] || FRAME_CROP, width: 800 });
    const graded = grade(data, { seed: `class-${v.id}`, contrast: 0.42, exposure: -0.15, coolSat: 0.3 });
    const master = await sharp(graded, { raw: { width: info.width, height: info.height, channels: 3 } }).png().toBuffer();
    for (const w of [400, 800]) {
      await sharp(master).resize({ width: w }).webp({ quality: 72, effort: 6 }).toFile(path.join(dir, `${v.id}-${w}.webp`));
    }
  }
  console.log(`wrote public/images/classes/<id>-{400,800}.webp`);
}

// ---- Demonstration video posters (book pages) -------------------------------------------
const DEMOS = ['2GnjFzWCXRU', '5t796EGmdn8', '7defUKA3D3w', '1_CIqS7CfwE', '3PbCufQo_Yc', '5R07lItt9EY'];
// Uploaded thumbnails that show a logo title card or a pillarboxed frame: use YouTube's
// automatic frame n instead (1, 2, 3 = about 25%, 50%, 75% through the video).
const DEMO_FRAME = { '5t796EGmdn8': 2, '3PbCufQo_Yc': 2, '5R07lItt9EY': 2 };

async function buildDemoPosters() {
  const dir = path.join(IMG, 'demos');
  mkdir(dir);
  mkdir(CACHE);
  for (const id of DEMOS) {
    const n = DEMO_FRAME[id];
    const file = path.join(CACHE, n ? `demo-${id}-maxres${n}.jpg` : `demo-${id}.jpg`);
    if (!fs.existsSync(file)) {
      const sizes = n ? [`maxres${n}`, `sd${n}`, `hq${n}`] : ['maxresdefault', 'sddefault', 'hqdefault'];
      const urls = sizes.map((v) => `https://i.ytimg.com/vi/${id}/${v}.jpg`);
      if (!urls.some((u) => download(u, file))) {
        console.warn(`warning: no poster for demo ${id}`);
        continue;
      }
    }
    const meta = await sharp(file).metadata();
    // sd/hqdefault are 4:3 with letterbox bars; keep the 16:9 picture.
    const h = Math.round(meta.width * 9 / 16);
    const crop = { left: 0, top: Math.round((meta.height - h) / 2), width: meta.width, height: h };
    const { data, info } = await loadRGB(file, { crop, width: 640 });
    const graded = grade(data, { seed: `demo-${id}`, contrast: 0.38, exposure: -0.1, coolSat: 0.3 });
    const master = await sharp(graded, { raw: { width: info.width, height: info.height, channels: 3 } }).png().toBuffer();
    for (const w of [320, 640]) {
      await sharp(master).resize({ width: w }).webp({ quality: 72, effort: 6 }).toFile(path.join(dir, `${id}-${w}.webp`));
    }
  }
  console.log('wrote public/images/demos/<id>-{320,640}.webp');
}

// ---- Blog thumbnails --------------------------------------------------------------------
async function buildBlogImages() {
  const meta = JSON.parse(fs.readFileSync(path.join(__dirname, 'blog-meta.json'), 'utf8'));
  const dir = path.join(IMG, 'blog');
  fs.rmSync(dir, { recursive: true, force: true });
  mkdir(dir);
  for (const [slug, post] of Object.entries(meta)) {
    if (!post.imageSource) continue;
    const { data, info } = await loadRGB(path.join(PUB, post.imageSource), { width: 480, height: 320 });
    const graded = grade(data, { seed: `blog-${slug}`, bw: true, contrast: 0.4, grain: 0.045 });
    const master = await sharp(graded, { raw: { width: info.width, height: info.height, channels: 3 } }).png().toBuffer();
    for (const w of [320, 480]) {
      await sharp(master).resize({ width: w }).webp({ quality: 74, effort: 6 }).toFile(path.join(dir, `${slug}-${w}.webp`));
    }
  }
  console.log('wrote public/images/blog/<slug>-{320,480}.webp');
}

// ---- Wordmark, icons, favicon ---------------------------------------------------------------
async function tint(src, rgb, width) {
  const alpha = await sharp(src).resize({ width }).ensureAlpha().extractChannel(3).toBuffer();
  const { width: w, height: h } = await sharp(alpha).metadata();
  return sharp({ create: { width: w, height: h, channels: 3, background: { r: rgb[0], g: rgb[1], b: rgb[2] } } })
    .joinChannel(alpha)
    .png({ compressionLevel: 9, palette: true });
}

async function buildBrand() {
  const dir = path.join(IMG, 'brand');
  mkdir(dir);
  const logo = path.join(IMG, 'Bwglogo2.png');
  await (await tint(logo, [20, 20, 20], 360)).toFile(path.join(dir, 'logo-ink.png'));
  await (await tint(logo, [243, 241, 236], 360)).toFile(path.join(dir, 'logo-paper.png'));
  console.log('wrote public/images/brand/logo-{ink,paper}.png');

  // App icons: the ring mark in orange on the page black.
  const ring = path.join(IMG, 'ringLogo.png');
  const icons = path.join(PUB, 'icons');
  mkdir(icons);
  for (const size of [32, 72, 96, 128, 144, 152, 180, 192, 384, 512]) {
    const mark = await (await tint(ring, [232, 119, 39], Math.max(8, Math.round(size * 0.66 * 74 / 156)))).toBuffer();
    const file = path.join(icons, size === 32 ? 'favicon-32.png' : size === 180 ? 'apple-touch-icon.png' : `icon-${size}x${size}.png`);
    await sharp({ create: { width: size, height: size, channels: 4, background: '#121214' } })
      .composite([{ input: mark, gravity: 'center' }])
      .png()
      .toFile(file);
  }
  console.log('wrote public/icons/*');
}

// `npm run images` builds everything; `node scripts/build-images.js demos photos` only those steps.
const STEPS = { brand: buildBrand, photos: buildPhotos, covers: buildCovers, classes: buildClassFrames, demos: buildDemoPosters, blog: buildBlogImages };

async function main() {
  const only = process.argv.slice(2);
  const unknown = only.filter((name) => !STEPS[name]);
  if (unknown.length) throw new Error(`unknown step(s): ${unknown.join(', ')}. Steps: ${Object.keys(STEPS).join(', ')}`);
  for (const [name, step] of Object.entries(STEPS)) {
    if (!only.length || only.includes(name)) await step();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
