#!/usr/bin/env node
// Generates the derived JSON files the static site fetches from docs/data/:
//   categories.json  - unique video categories (from videos.json)
//   instructors.json - unique video instructors (from videos.json)
//   blogs.json       - blog index (from docs/blogs/<slug>/*.md)
//
// docs/data/videos.json is hand-maintained and is the source of truth for videos.
// If YOUTUBE_API_KEY is set, each video's `views` is refreshed from YouTube first
// (videos still marked youtubeId "TODO" keep their stored count).
// Run via `npm run build`. Uses only Node built-ins (Node 18+ for fetch).

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'docs', 'data');
const BLOGS_DIR = path.join(ROOT, 'docs', 'blogs');
const BLOG_META = path.join(__dirname, 'blog-meta.json');

function writeJson(name, value) {
  fs.writeFileSync(path.join(DATA_DIR, name), JSON.stringify(value, null, 2) + '\n');
  console.log(`wrote docs/data/${name} (${Array.isArray(value) ? value.length : 1} entries)`);
}

// ---- YouTube view counts ----
async function refreshYoutubeViews() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    console.log('YOUTUBE_API_KEY not set; keeping stored view counts');
    return;
  }
  const file = path.join(DATA_DIR, 'videos.json');
  const videos = JSON.parse(fs.readFileSync(file, 'utf8'));
  const withIds = videos.filter((v) => /^[\w-]{11}$/.test(v.youtubeId || ''));

  let updated = 0;
  try {
    for (let i = 0; i < withIds.length; i += 50) {
      const batch = withIds.slice(i, i + 50);
      const url = 'https://www.googleapis.com/youtube/v3/videos?part=statistics'
        + `&id=${batch.map((v) => v.youtubeId).join(',')}&key=${encodeURIComponent(key)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`YouTube API HTTP ${res.status}`);
      const { items = [] } = await res.json();
      for (const item of items) {
        const count = Number(item.statistics && item.statistics.viewCount);
        if (!Number.isFinite(count)) continue;
        for (const v of batch) if (v.youtubeId === item.id) { v.views = count; updated++; }
      }
    }
  } catch (err) {
    // A failed refresh should not block a deploy; the stored counts are still valid.
    console.warn(`warning: could not refresh YouTube view counts (${err.message}); keeping stored counts`);
    return;
  }
  fs.writeFileSync(file, JSON.stringify(videos, null, 2) + '\n');
  console.log(`refreshed YouTube view counts for ${updated}/${videos.length} videos`);
}

// ---- Videos -> categories + instructors ----
function buildVideoData() {
  const videos = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'videos.json'), 'utf8'));

  const ids = new Set();
  for (const v of videos) {
    if (ids.has(v.id)) throw new Error(`videos.json: duplicate id ${v.id}`);
    ids.add(v.id);
    if (!Number.isInteger(v.views) || v.views < 0) {
      throw new Error(`videos.json: video ${v.id} needs a whole-number "views" (use 0 if unknown)`);
    }
    if (v.youtubeId !== 'TODO' && !/^[\w-]{11}$/.test(v.youtubeId || '')) {
      throw new Error(`videos.json: video ${v.id} has an invalid youtubeId "${v.youtubeId}"`);
    }
  }

  const todo = videos.filter((v) => v.youtubeId === 'TODO').length;
  if (todo) console.warn(`warning: ${todo}/${videos.length} videos still have youtubeId "TODO"`);

  const unique = (key) => [...new Set(videos.map((v) => v[key]))].sort((a, b) => a.localeCompare(b));
  writeJson('categories.json', unique('category'));
  writeJson('instructors.json', unique('instructor'));
}

// ---- Blogs ----
// Title, date and excerpt are read from the markdown (H1, "*Published: ...*" line, first
// paragraph). scripts/blog-meta.json lists which posts are published (and their order) and
// may override any field, including the card extras (author, category, readTime, image,
// featured). A folder with markdown but no entry there is skipped.
function stripMarkdown(text) {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDate(text) {
  const m = text.match(/^\*?Published:\s*([A-Za-z]+ \d{1,2}, \d{4})/m);
  if (!m) return null;
  const d = new Date(`${m[1]} 12:00:00 UTC`);
  return isNaN(d) ? null : d.toISOString().slice(0, 10);
}

function firstParagraph(md) {
  const blocks = md.split(/\n\s*\n/).map((b) => b.trim());
  for (const b of blocks) {
    if (!b || /^(#|!\[|\*[^*]|---|\d+\.|[-*] |\||```)/.test(b)) continue;
    const text = stripMarkdown(b);
    if (text.length > 40) return text.length > 200 ? text.slice(0, 197).replace(/\s+\S*$/, '') + '...' : text;
  }
  return '';
}

function buildBlogData() {
  const meta = JSON.parse(fs.readFileSync(BLOG_META, 'utf8'));
  const blogs = [];

  for (const slug of Object.keys(meta)) {
    const dir = path.join(BLOGS_DIR, slug);
    const mdFile = fs.existsSync(dir) && fs.readdirSync(dir).find((f) => f.endsWith('.md'));
    if (!mdFile) throw new Error(`blog-meta.json lists "${slug}" but docs/blogs/${slug}/ has no .md file`);

    const md = fs.readFileSync(path.join(dir, mdFile), 'utf8');
    const title = (md.match(/^#\s+(.+)$/m) || [])[1];
    const words = stripMarkdown(md).split(/\s+/).filter(Boolean).length;
    const derived = {
      title: title && stripMarkdown(title),
      date: parseDate(md),
      excerpt: firstParagraph(md),
      readTime: `${Math.max(1, Math.round(words / 230))} min`,
    };
    // imageSource is the original photo; scripts/build-images.js turns it into
    // /images/blog/<slug>-{480,960}.webp. Only the web copy is published.
    const { imageSource, ...rest } = meta[slug];
    const post = { slug, file: `/blogs/${slug}/${mdFile}`, ...derived, ...rest };
    if (imageSource) post.image = `/images/blog/${slug}`;

    for (const f of ['title', 'date', 'excerpt']) {
      if (!post[f]) throw new Error(`blog "${slug}": no ${f} (add it to scripts/blog-meta.json)`);
    }
    blogs.push(post);
  }

  for (const dir of fs.readdirSync(BLOGS_DIR)) {
    if (!(dir in meta) && fs.readdirSync(path.join(BLOGS_DIR, dir)).some((f) => f.endsWith('.md'))) {
      console.warn(`warning: docs/blogs/${dir} has markdown but is not in scripts/blog-meta.json; skipped`);
    }
  }

  writeJson('blogs.json', blogs);
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  await refreshYoutubeViews();
  buildVideoData();
  buildBlogData();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
