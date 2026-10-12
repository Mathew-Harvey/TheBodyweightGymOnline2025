# The Bodyweight Gym Online

A fully static site (no backend) hosted on GitHub Pages at <https://thebodyweightgym.org>. It sells the two Bodyweight Skills books by Mat Harvey (Amazon links) and gives away the gym's 2020 live-streamed classes as YouTube embeds (`youtube-nocookie.com`). The design rules are in `design/DESIGN_BRIEF.md`.

## How it works

| Piece | Where |
| --- | --- |
| Site root (what gets deployed) | `docs/` |
| Video list (hand-edited source of truth) | `docs/data/videos.json` |
| Generated: categories, instructors, blog index | `docs/data/{categories,instructors,blogs}.json` |
| Blog posts (markdown, rendered in the browser with `marked`) | `docs/blogs/<slug>/*.md` |
| Blog publish list + card extras (author, category, image, ...) | `scripts/blog-meta.json` |
| Shared head, nav and footer | `src/partials/*.html`, written into every page by `scripts/build-pages.js` |
| Class lists, blog lists, numbers in the copy | pre-rendered into the pages by `scripts/build-pages.js` |
| Styles | `docs/css/brand.css` (the only stylesheet) |
| Saved classes | the visitor's `localStorage` (`bwg:favourites`) |
| Filters, search, sorting on `/classes` | `docs/js/classes.js`, on the pre-rendered rows |
| Photos, covers, class frames, icons | built by `npm run images` from `assets/` and YouTube frames |

`npm run build` regenerates the files under `docs/data/` (`scripts/build-data.js`) and the generated regions of every page (`scripts/build-pages.js`, between `<!-- build:NAME -->` markers). Both use Node built-ins only. The output is committed, and GitHub Pages serves `docs/` exactly as committed, so run `npm run build` and commit before pushing to `main`.

## Local preview

```bash
npm run build   # regenerate docs/data/*.json and the generated page regions
npm start       # npx serve docs  ->  http://localhost:3000
```

## Adding or editing content

- **A video:** add an entry to `docs/data/videos.json` with a unique `id` and its `youtubeId` (the 11-character ID from the YouTube URL), then run `node scripts/build-images.js classes` to fetch and grade its frame (check it is clear of the stream overlays). `"youtubeId": "TODO"` is allowed; the video is left out of the lists until you fill it in. `npm run build` warns while any TODO remain and fails on malformed IDs or duplicate `id`s. Only Mat Harvey is named on the site, so the "Coach X - " part of a title is not shown.
- **A blog post:** add `docs/blogs/<slug>/<file>.md`, then add a `<slug>` entry to `scripts/blog-meta.json` (order there is the display order; folders not listed are skipped). Title, date and excerpt are read from the markdown (`# Title`, `*Published: Month D, YYYY*`, first paragraph) unless overridden in the meta file.
- Run `npm run build` and commit the regenerated `docs/data/*.json`.

## View counts

Each video has a `views` number used for the "Most viewed" sort. The site can't count views itself, so `npm run build` fetches each video's YouTube view count when the `YOUTUBE_API_KEY` environment variable is set. Videos still marked `TODO` keep their stored count. If the API call fails, the build still succeeds and uses the stored counts.

To refresh them, create a YouTube Data API v3 key in Google Cloud (free quota is plenty; restrict the key to the YouTube Data API), run `YOUTUBE_API_KEY=<key> npm run build` locally and commit the updated `docs/data/videos.json` and pages.

## Books (Amazon)

The two Bodyweight Skills books are sold on Amazon; the site only links to them.

- **Links and signup:** edit `docs/js/books-config.js`. Paste each Amazon URL in place of `TODO_AMAZON_URL` (optional `_AU` variants are used for Australian visitors). Until a URL is set, its button shows a disabled "coming soon on Amazon" state. Only `https://www.amazon.<store>/...` URLs become links; shorteners are ignored.
- **Email signup:** `SIGNUP_MODE = 'mailto'` with `SIGNUP_EMAIL` set shows an "Email me about new books" button (nothing stored by the site). `'formspree'` with `FORMSPREE_ID` set shows a form posting to Formspree's free tier. While the needed value is TODO, a "coming soon" note shows. GitHub Pages sends no Content-Security-Policy, so neither option needs a CSP change; if you add one later, Formspree needs `form-action https://formspree.io`.
- **Pages:** `docs/books/index.html`, `docs/books/handstand.html`, `docs/books/ring-muscle-up.html` (static HTML with Book JSON-LD for SEO), behaviour in `docs/js/books.js`. `/ebook` redirects to `/books`.
- **Covers:** the 1600x2560 Kindle covers live in `assets/covers/`. After replacing one, run `npm install` once, then `npm run images` and commit the generated files (400/800px WebP + JPG, and a 1200px JPG used as the Open Graph image).
- Do not add book text, PDFs or EPUBs to the site (Amazon KDP terms).

## Images

`npm run images` (`scripts/build-images.js`; run `npm install` once for sharp) builds every image the site uses and the outputs are committed:

- **Photos** from `assets/photos/`, colour graded by `scripts/lib/grade.js` so they read as one set.
- **Class frames** from YouTube's automatic frames of each stream, cropped clear of the stream overlays and graded. Per-class crop and frame choices are in `FRAME_CROP_FOR` and `FRAME_PICK`.
- **Demonstration posters**, **blog photos** (black and white), the **logo** in ink and paper, and the **app icons**.

`node scripts/build-images.js classes demos` runs single steps (brand, photos, covers, classes, demos, blog). YouTube frames are cached in `.cache/` (not committed).

## Deploying to GitHub Pages

One-time setup:

1. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch **main**, folder **/docs**.
2. Repo **Settings → Pages → Custom domain:** `thebodyweightgym.org`, and tick **Enforce HTTPS** once the certificate is issued.
3. DNS for `thebodyweightgym.org`: `A` records for `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (and optionally the matching `AAAA` records), plus `CNAME www -> <owner>.github.io`.

After that, every push to `main` publishes `docs/` as committed; there is no build step on GitHub. `docs/CNAME` keeps the custom domain and `docs/.nojekyll` stops Jekyll from processing the site.

Pages use relative URLs, so the site also works at the project address (`<owner>.github.io/<repo>/`) before the custom domain is set. `scripts/build-pages.js` rewrites root-relative `href`/`src` values into page-relative ones, the head partial defines `bwgUrl()` for scripts, and `404.html` sets its own `<base>` because it is served at any depth.

## URLs

| URL | File |
| --- | --- |
| `/` | `docs/index.html` |
| `/classes` (`?filter=saved` and the category names work as links) | `docs/classes.html` |
| `/video?id=<id>` | `docs/video.html` |
| `/blog` | `docs/blog/index.html` |
| `/blog/post?slug=<slug>` | `docs/blog/post.html` |
| `/blog/<slug>` (old links) | `docs/404.html` redirects to the URL above |
| `/books`, `/books/handstand`, `/books/ring-muscle-up` | `docs/books/*.html` |
| `/ebook` (old) | `docs/ebook.html` redirects to `/books` |

## Maintenance scripts (need FFmpeg and local video files)

- `npm run thumbnails` - generate thumbnails (see `THUMBNAIL_GENERATION.md`)
- `node analyze-video-start-times.js` - detect where each workout really starts
- `node update-video-database.js` - merge `video-start-times.json` into `docs/data/videos.json`
