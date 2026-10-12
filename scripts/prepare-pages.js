#!/usr/bin/env node
// Copies public/ to an output folder for deployment and adjusts it for the URL the site is
// served from. GitHub Pages serves a project site at https://<owner>.github.io/<repo>/, so
// every root-absolute URL in the pages ("/css/brand.css") needs the "/<repo>" prefix there.
// On a custom domain the prefix is empty and the output is a plain copy.
//
//   node scripts/prepare-pages.js [--base /<repo>] [--out _site]
//   SITE_BASE_PATH=/<repo> node scripts/prepare-pages.js
//
// The repo keeps root-absolute URLs, so `npm start` and a custom domain work unchanged. Only the
// deployed copy is rewritten: HTML attributes, CSS url(), manifest.json, and the
// window.BWG_BASE value that scripts use (see BWG.url in public/js/data.js).
//
// It also leaves out what no page links to: the guide drawings (the brief bans them from the site),
// the old thumbnails, and the markdown and photos of posts that are not published (they name other
// coaches). It serves a trimmed videos.json with only the fields the pages use. That keeps the
// deployed site to what is shown. Uses only Node built-ins.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'public');
const args = process.argv.slice(2);
const option = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };

// "/repo/", "repo" and "/" all normalise to a leading slash with no trailing one, or "" for none.
const raw = String(option('base') ?? process.env.SITE_BASE_PATH ?? '').trim().replace(/^\/+|\/+$/g, '');
const BASE = raw ? `/${raw}` : '';
if (BASE && !/^(\/[\w.~-]+)+$/.test(BASE)) throw new Error(`unsafe base path: ${BASE}`);

const OUT = path.resolve(ROOT, option('out') || '_site');
if (OUT === ROOT || OUT === SRC || OUT.startsWith(SRC + path.sep) || ROOT.startsWith(OUT + path.sep)) {
  throw new Error(`refusing to write to ${OUT}`);
}

const prefix = (url) => (BASE && url.startsWith('/') && !url.startsWith('//') ? BASE + url : url);
// "/a.webp 480w, /b.webp 915w": prefix each candidate URL.
const prefixSrcset = (value) => value.replace(/(^|,)(\s*)(\/(?!\/)[^\s,]*)/g, (m, lead, space, url) => lead + space + prefix(url));

function rewriteHtml(html) {
  return html
    .replace(/(\s(?:href|src|poster|action)=)(["'])([^"']*)\2/g, (m, name, q, value) => `${name}${q}${prefix(value)}${q}`)
    .replace(/(\s(?:srcset|imagesrcset)=)(["'])([^"']*)\2/g, (m, name, q, value) => `${name}${q}${prefixSrcset(value)}${q}`)
    .replace("window.BWG_BASE=''", `window.BWG_BASE='${BASE}'`);
}

function rewriteCss(css) {
  return css.replace(/url\(\s*(["']?)(\/(?!\/)[^)"']*)\1\s*\)/g, (m, q, url) => `url(${q}${prefix(url)}${q})`);
}

function rewriteManifest(text) {
  const keys = new Set(['start_url', 'scope', 'id', 'src', 'url']);
  const walk = (value, key) => {
    if (Array.isArray(value)) return value.map((v) => walk(v, key));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v, k)]));
    return typeof value === 'string' && keys.has(key) ? prefix(value) : value;
  };
  return `${JSON.stringify(walk(JSON.parse(text), ''), null, 2)}\n`;
}

function* files(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* files(p);
    else yield p;
  }
}

// Only the markdown of published posts (data/blogs.json, written by build-data.js) is served.
const publishedPosts = new Set(JSON.parse(fs.readFileSync(path.join(SRC, 'data', 'blogs.json'), 'utf8')).map((b) => b.file.replace(/^\//, '')));
function leftOut(rel) {
  const p = rel.split(path.sep).join('/');
  if (p.startsWith('images/guides/') || p.startsWith('images/thumbnails/')) return true;
  if (p === 'data/instructors.json') return true;                      // coach names; no page reads it
  if (p.startsWith('blogs/')) return !publishedPosts.has(p);
  return false;
}

fs.rmSync(OUT, { recursive: true, force: true });
let copied = 0, skipped = 0, skippedBytes = 0;
for (const file of files(SRC)) {
  const rel = path.relative(SRC, file);
  if (leftOut(rel)) { skipped++; skippedBytes += fs.statSync(file).size; continue; }
  fs.mkdirSync(path.dirname(path.join(OUT, rel)), { recursive: true });
  fs.copyFileSync(file, path.join(OUT, rel));
  copied++;
}

// videos.json for the browser: only what the pages use. No coach names (titles lose their "Coach X - " prefix,
// which the pages strip anyway), no file names, and no `rating`, which is placeholder data.
const PUBLIC_VIDEO_FIELDS = ['id', 'title', 'duration', 'level', 'category', 'description', 'youtubeId', 'views', 'startTime', 'startTimeFormatted'];
const videosOut = path.join(OUT, 'data', 'videos.json');
fs.writeFileSync(videosOut, `${JSON.stringify(JSON.parse(fs.readFileSync(videosOut, 'utf8')).map((v) => Object.fromEntries(
  PUBLIC_VIDEO_FIELDS.filter((k) => k in v).map((k) => [k, k === 'title' ? v.title.replace(/^[^-]+ - /, '') : v[k]]))))}\n`);

const counts = { html: 0, css: 0, manifest: 0 };
if (BASE) {
  const problems = [];
  for (const file of files(OUT)) {
    const rel = path.relative(OUT, file);
    const ext = path.extname(file);
    if (ext === '.html' && !rel.startsWith(`blogs${path.sep}`)) {
      const html = rewriteHtml(fs.readFileSync(file, 'utf8'));
      // Every page with the shared head must now carry the base, and no attribute may still point at the domain root.
      if (html.includes('/css/brand.css') && !html.includes(`window.BWG_BASE='${BASE}'`)) problems.push(`${rel}: window.BWG_BASE was not set`);
      for (const m of html.matchAll(/\s(?:href|src|poster|action)=(["'])(\/(?!\/)[^"']*)\1/g)) {
        if (m[2] !== BASE && !m[2].startsWith(`${BASE}/`)) problems.push(`${rel}: ${m[2]}`);
      }
      fs.writeFileSync(file, html);
      counts.html++;
    } else if (ext === '.css') {
      const css = rewriteCss(fs.readFileSync(file, 'utf8'));
      if (/url\(\s*["']?\/(?!\/)/.test(css.replace(new RegExp(`url\\(\\s*["']?${BASE}/`, 'g'), ''))) problems.push(`${rel}: a url() still points at the domain root`);
      fs.writeFileSync(file, css);
      counts.css++;
    } else if (rel === 'manifest.json') {
      fs.writeFileSync(file, rewriteManifest(fs.readFileSync(file, 'utf8')));
      counts.manifest++;
    }
  }
  if (problems.length) throw new Error(`prepare-pages left root-absolute URLs behind:\n  ${problems.slice(0, 20).join('\n  ')}`);
}

console.log(`prepared ${path.relative(ROOT, OUT) || OUT} for base "${BASE || '/'}": ${copied} files copied, ${skipped} left out (${(skippedBytes / 1048576).toFixed(1)} MB); ${BASE ? `${counts.html} pages, ${counts.css} stylesheet(s), ${counts.manifest} manifest rewritten` : 'no URL rewriting'}`);
