#!/usr/bin/env node
// Fills the shared and data-driven parts of the static pages in public/ (run by
// `npm run build`, after build-data.js). Uses only Node built-ins.
//
// Pages keep their own content and mark the generated regions with comments:
//   <!-- build:head -->        ... <!-- /build:head -->       src/partials/head.html
//   <!-- build:nav current="books" --> ... <!-- /build:nav -->  src/partials/nav.html
//   <!-- build:footer -->      ... <!-- /build:footer -->     src/partials/footer.html
//   <!-- build:featured -->    ... <!-- /build:featured -->   six classes, one per coach
//   <!-- build:library -->     ... <!-- /build:library -->    every playable class (/classes)
//   <!-- build:playable -->    ... <!-- /build:playable -->   window.BWG_PLAYABLE, the ids that have a poster (/video)
//   <!-- build:notes -->       ... <!-- /build:notes -->      the three newest posts
//   <!-- build:posts -->       ... <!-- /build:posts -->      every post (blog index)
//   <span data-stat="classes">57</span>                       numbers from videos.json
// It also puts a content hash on local script URLs (like the stylesheet) and writes
// public/sitemap.xml and public/robots.txt for the custom domain.
// Running it again rewrites the same regions, so the output is committed as is.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// The address the site is meant to live at: canonical URLs and the sitemap use it.
const SITE = 'https://thebodyweightgym.org';

const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const PARTIALS = path.join(ROOT, 'src', 'partials');

const read = (f) => fs.readFileSync(f, 'utf8');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---- data ----
const videos = JSON.parse(read(path.join(PUB, 'data', 'videos.json')));
const blogs = JSON.parse(read(path.join(PUB, 'data', 'blogs.json')));
const playable = videos.filter((v) => /^[\w-]{11}$/.test(v.youtubeId || ''));

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const minutes = (v) => parseInt(v.duration, 10) || 0;
const coaches = new Set(playable.map((v) => v.instructor)).size;
const STATS = {
  classes: String(playable.length),
  hours: String(Math.round(playable.reduce((s, v) => s + minutes(v), 0) / 60)),
  coaches: WORDS[coaches] || String(coaches),
};

// "Coach Corey - Handstand class" -> "Handstand class". Only Mat Harvey is named on the site.
const displayTitle = (v) => v.title.replace(/^[^-]+ - /, '');
const classMeta = (v) => `<span>${esc(v.category)}</span><span>${minutes(v)} min · ${esc(v.level)}</span>`;
// "28 Jul 2019". Fixed names: en-AU spells some months out ("July", "Sept"), which breaks the label rhythm.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };

function classRow(v) {
  const img = `/images/classes/${v.id}`;
  return `<li class="row class-row" data-reveal>
          <a class="row__link" href="/video?id=${v.id}">
            <span class="class-row__thumb"><img src="${img}-400.webp" srcset="${img}-400.webp 400w, ${img}-800.webp 800w" sizes="(max-width: 760px) 120px, 240px" width="400" height="225" alt="" loading="lazy" decoding="async"></span>
            <span class="label class-row__meta">${classMeta(v)}</span>
            <h3 class="display class-row__title">${esc(displayTitle(v))}</h3>
            <span class="row__arrow" aria-hidden="true"></span>
          </a>
        </li>`;
}

// /classes: every playable class, with the data the filters need and a Save toggle.
function libraryRow(v) {
  const text = `${displayTitle(v)} ${v.category} ${v.level}`.toLowerCase();
  return classRow(v)
    .replace('<li class="row class-row" data-reveal>',
      `<li class="row class-row class-row--saveable" data-id="${v.id}" data-category="${esc(v.category.toLowerCase())}" data-minutes="${minutes(v)}" data-views="${v.views || 0}" data-text="${esc(text)}">`)
    .replace(/\n        <\/li>$/, `\n          <button class="save label" type="button" data-save="${v.id}" aria-pressed="false">Save<span class="visually-hidden">: ${esc(displayTitle(v))}</span></button>\n        </li>`);
}

function postRow(b, { compact = false } = {}) {
  const photo = !compact && b.image
    ? `<span class="post-row__photo"><img src="${b.image}-320.webp" srcset="${b.image}-320.webp 320w, ${b.image}-480.webp 480w" sizes="160px" width="320" height="213" alt="" loading="lazy" decoding="async"></span>`
    : compact ? '' : '<span class="post-row__photo"></span>';
  return `<li class="row post-row${compact ? ' post-row--compact' : ''}" data-reveal>
          <a class="row__link" href="/blog/post?slug=${encodeURIComponent(b.slug)}">
            <span class="label post-row__meta"><span>${esc(b.category)} · ${esc(b.readTime)}</span><span>${fmtDate(b.date)}</span></span>
            <div>
              <h3 class="display post-row__title">${esc(b.title)}</h3>
              <p class="post-row__excerpt">${esc(b.excerpt)}</p>
            </div>
            ${photo}
            <span class="row__arrow" aria-hidden="true"></span>
          </a>
        </li>`;
}

// Six classes for the home page: the most watched class of each coach, most watched first.
function featured() {
  const best = new Map();
  for (const v of playable) {
    const cur = best.get(v.instructor);
    if (!cur || (v.views || 0) > (cur.views || 0)) best.set(v.instructor, v);
  }
  return [...best.values()].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6);
}

const newestFirst = [...blogs].sort((a, b) => b.date.localeCompare(a.date));

// ---- partials ----
const cssVersion = crypto.createHash('sha1').update(read(path.join(PUB, 'css', 'brand.css'))).digest('hex').slice(0, 8);
const partial = (name) => read(path.join(PARTIALS, `${name}.html`)).trimEnd();
const HEAD = partial('head').replace('{{cssVersion}}', cssVersion);
const FOOTER = partial('footer').replace('{{year}}', String(new Date().getFullYear()));
const NAV = partial('nav');

function region(html, name, render) {
  const re = new RegExp(`(<!-- build:${name}((?: [a-z]+="[^"]*")*) -->)[\\s\\S]*?(<!-- /build:${name} -->)`, 'g');
  return html.replace(re, (m, open, attrs, close) => {
    const opts = Object.fromEntries([...attrs.matchAll(/([a-z]+)="([^"]*)"/g)].map((a) => [a[1], a[2]]));
    return `${open}\n${render(opts)}\n${close}`;
  });
}

function renderNav({ current }) {
  return NAV.replace(/data-nav="([a-z]+)"/g, (m, key) => (key === current ? `${m} aria-current="page"` : m));
}

// A content hash on local scripts, like the stylesheet: a deploy never pairs a new page with a cached old script.
const scriptHash = {};
const scriptVersion = (name) => (scriptHash[name] ||= crypto.createHash('sha1').update(read(path.join(PUB, 'js', name))).digest('hex').slice(0, 8));

function processPage(file) {
  const before = read(file);
  let html = before;
  html = region(html, 'head', () => HEAD);
  html = region(html, 'nav', renderNav);
  html = region(html, 'footer', () => FOOTER);
  html = region(html, 'featured', () => '        ' + featured().map(classRow).join('\n        '));
  html = region(html, 'library', () => '        ' + [...playable].sort((a, b) => (b.views || 0) - (a.views || 0) || a.id - b.id).map(libraryRow).join('\n        '));
  html = region(html, 'playable', () => `    <script>window.BWG_PLAYABLE=${JSON.stringify(playable.map((v) => v.id))}</script>`);
  html = region(html, 'notes', () => '        ' + newestFirst.slice(0, 3).map((b) => postRow(b, { compact: true })).join('\n        '));
  html = region(html, 'posts', () => '        ' + newestFirst.map((b) => postRow(b)).join('\n        '));
  html = html.replace(/(<script\b[^>]*?\ssrc=")\/js\/([\w.-]+\.js)(?:\?v=[0-9a-f]+)?(")/g, (m, open, name, close) => `${open}/js/${name}?v=${scriptVersion(name)}${close}`);
  html = html.replace(/(<span data-stat="([a-z]+)">)[^<]*(<\/span>)/g, (m, open, key, close) => {
    if (!(key in STATS)) throw new Error(`${path.relative(ROOT, file)}: unknown data-stat "${key}"`);
    return `${open}${STATS[key]}${close}`;
  });
  if (html !== before) {
    fs.writeFileSync(file, html);
    console.log(`updated ${path.relative(ROOT, file)}`);
  }
}

function pages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return ['blogs', 'images', 'fonts', 'data'].includes(d.name) ? [] : pages(p);
    return d.name.endsWith('.html') ? [p] : [];
  });
}

for (const file of pages(PUB)) processPage(file);

function writeIfChanged(file, content) {
  if (fs.existsSync(file) && read(file) === content) return;
  fs.writeFileSync(file, content);
  console.log(`updated ${path.relative(ROOT, file)}`);
}
// Every public page. /books/ and /blog/ are directory pages, so the slash is the real address.
const sitemapPaths = [
  '/', '/classes', '/books/', '/books/handstand', '/books/ring-muscle-up', '/blog/',
  ...[...playable].sort((a, b) => a.id - b.id).map((v) => `/video?id=${v.id}`),
  ...newestFirst.map((b) => `/blog/post?slug=${b.slug}`),
];
writeIfChanged(path.join(PUB, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths.map((p) => `  <url><loc>${esc(SITE + p)}</loc></url>`).join('\n')}\n</urlset>\n`);
writeIfChanged(path.join(PUB, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`stats: ${STATS.classes} classes, about ${STATS.hours} hours, ${STATS.coaches} coaches`);
