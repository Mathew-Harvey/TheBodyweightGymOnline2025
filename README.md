# The Bodyweight Gym Online

A fully static site (no backend) hosted on GitHub Pages at <https://thebodyweightgym.org>. It sells the two Bodyweight Skills books by Mat Harvey (Amazon links) and gives away the gym's 2020 live-streamed classes as YouTube embeds (`youtube-nocookie.com`). The design rules are in `docs/DESIGN_BRIEF.md`.

## How it works

| Piece | Where |
| --- | --- |
| Site root (what gets deployed) | `public/` |
| Video list (hand-edited source of truth) | `public/data/videos.json` |
| Generated: categories, instructors, blog index | `public/data/{categories,instructors,blogs}.json` |
| Blog posts (markdown, rendered in the browser with `marked`) | `public/blogs/<slug>/*.md` |
| Blog publish list + card extras (author, category, image, ...) | `scripts/blog-meta.json` |
| Shared head, nav and footer | `src/partials/*.html`, written into every page by `scripts/build-pages.js` |
| Class lists, blog lists, numbers in the copy | pre-rendered into the pages by `scripts/build-pages.js` |
| `sitemap.xml`, `robots.txt` | written by `scripts/build-pages.js` for `https://thebodyweightgym.org` (every page, class and post) |
| Styles | `public/css/brand.css` (the only stylesheet) |
| Saved classes | the visitor's `localStorage` (`bwg:favourites`) |
| Filters, search, sorting on `/classes` | `public/js/classes.js`, on the pre-rendered rows |
| Photos, covers, class frames, icons | built by `npm run images` from `assets/` and YouTube frames |

`npm run build` regenerates the files under `public/data/` (`scripts/build-data.js`) and the generated regions of every page (`scripts/build-pages.js`, between `<!-- build:NAME -->` markers). Both use Node built-ins only. The output is committed so a fresh checkout previews without a build, and CI rebuilds it on every deploy.

## Local preview

```bash
npm run build   # regenerate public/data/*.json and the generated page regions
npm start       # npx serve public  ->  http://localhost:3000
```

## Adding or editing content

- **A video:** add an entry to `public/data/videos.json` with a unique `id` and its `youtubeId` (the 11-character ID from the YouTube URL), then run `node scripts/build-images.js classes` to fetch and grade its frame (check it is clear of the stream overlays). `"youtubeId": "TODO"` is allowed; the video is left out of the lists until you fill it in. `npm run build` warns while any TODO remain and fails on malformed IDs or duplicate `id`s. Only Mat Harvey is named on the site, so the "Coach X - " part of a title is not shown.
- **A blog post:** add `public/blogs/<slug>/<file>.md`, then add a `<slug>` entry to `scripts/blog-meta.json` (order there is the display order; folders not listed are skipped). Title, date and excerpt are read from the markdown (`# Title`, `*Published: Month D, YYYY*`, first paragraph) unless overridden in the meta file.
- Run `npm run build` and commit the regenerated `public/data/*.json`.

## View counts

Each video has a `views` number used for the "Most viewed" sort. The site can't count views itself, so `npm run build` fetches each video's YouTube view count when the `YOUTUBE_API_KEY` environment variable is set. Videos still marked `TODO` keep their stored count. If the API call fails, the build still succeeds and uses the stored counts.

To turn this on for deploys, create a YouTube Data API v3 key in Google Cloud (free quota is plenty; restrict the key to the YouTube Data API) and add it as a repository secret named `YOUTUBE_API_KEY` (Settings → Secrets and variables → Actions). The deploy workflow passes it to the build. Counts refresh on each deploy; they are not written back to the repo.

## Books (Amazon)

The two Bodyweight Skills books are sold on Amazon; the site only links to them.

- **Links and signup:** edit `public/js/books-config.js`. Paste each Amazon URL in place of `TODO_AMAZON_URL` (optional `_AU` variants are used for Australian visitors). Until a URL is set, its button shows a disabled "coming soon on Amazon" state. Only `https://www.amazon.<store>/...` URLs become links; shorteners are ignored.
- **Email signup:** `SIGNUP_MODE = 'mailto'` with `SIGNUP_EMAIL` set shows an "Email me about new books" button (nothing stored by the site). `'formspree'` with `FORMSPREE_ID` set shows a form posting to Formspree's free tier. While the needed value is TODO, a "coming soon" note shows. GitHub Pages sends no Content-Security-Policy, so neither option needs a CSP change; if you add one later, Formspree needs `form-action https://formspree.io`.
- **Pages:** `public/books/index.html`, `public/books/handstand.html`, `public/books/ring-muscle-up.html` (static HTML with Book JSON-LD for SEO), behaviour in `public/js/books.js`. `/ebook` redirects to `/books`.
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

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Repo **Settings → Pages → Custom domain:** `thebodyweightgym.org`, and tick **Enforce HTTPS** once the certificate is issued.
3. DNS for `thebodyweightgym.org`: `A` records for `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (and optionally the matching `AAAA` records), plus `CNAME www -> <owner>.github.io`.

After that, every push to `main` runs `.github/workflows/pages.yml`. It runs `npm run build`, then `scripts/prepare-pages.js`, and publishes the result (`_site/`, not committed). You can also run the workflow manually from the Actions tab.

**Pages must be set to "GitHub Actions".** In Settings → Pages → Build and deployment, Source must be **GitHub Actions**, not "Deploy from a branch". With a branch source, GitHub also builds the repo root with Jekyll after every push, which shows this README at the domain instead of the site, and it publishes every file in the repo (the unpublished posts and the guide drawings included). Setting a custom domain while a branch source is selected makes GitHub commit a root `CNAME` file; that is the sign the source is wrong. The workflow has a `workflow_run` trigger that re-deploys after GitHub's branch build, so the site comes back about a minute after each push, but the right setting avoids the gap.

**Where the site is served from.** Until the custom domain is set in Settings → Pages, GitHub serves the site at <https://mathew-harvey.github.io/TheBodyweightGymOnline2025/>, one level below the domain root. The pages use root-based URLs (`/css/brand.css`), so `prepare-pages.js` copies `public/` and prefixes them with the base path GitHub reports (`/TheBodyweightGymOnline2025`). On the custom domain the prefix is empty and the copy is plain. The repo itself always keeps root-based URLs, so `npm start` and the custom domain need no special case.

**After you set or change the custom domain**, run the workflow once more (Actions → Deploy to GitHub Pages → Run workflow) so the site is rebuilt for its new address. Until you do, the published copy still carries the old prefix. While a custom domain is set, GitHub redirects the github.io address to it, so point DNS at GitHub first.

**What is deployed.** `prepare-pages.js` leaves out what no page links to: the guide drawings (`images/guides`), the old thumbnails, and the markdown and photos of posts that are not published (they name other coaches). It also serves a trimmed `data/videos.json` (no coach names, file names or placeholder ratings) and drops `data/instructors.json`. The source files in `public/` are untouched, so `npm start` shows the full data.

Rules for new code: HTML may use root-based URLs (`/images/...`, `/classes`). Scripts must build URLs with `BWG.url('/path')` (`public/js/data.js`), never a bare `'/path'` string. `/books/` and `/blog/` are directory pages, so link to them with the trailing slash (GitHub Pages redirects the bare form).

To try the prefixed copy locally: `node scripts/prepare-pages.js --base /TheBodyweightGymOnline2025 --out /tmp/site`, then serve `/tmp/site` under that path.

## URLs

| URL | File |
| --- | --- |
| `/` | `public/index.html` |
| `/classes` (`?filter=saved` and the category names work as links) | `public/classes.html` |
| `/video?id=<id>` | `public/video.html` |
| `/blog/` | `public/blog/index.html` |
| `/blog/post?slug=<slug>` | `public/blog/post.html` |
| `/blog/<slug>` (old links) | `public/404.html` redirects to the URL above |
| `/books/`, `/books/handstand`, `/books/ring-muscle-up` | `public/books/*.html` |
| `/ebook` (old) | `public/ebook.html` redirects to `/books` |

## Maintenance scripts (need FFmpeg and local video files)

- `npm run thumbnails` - generate thumbnails (see `THUMBNAIL_GENERATION.md`)
- `node analyze-video-start-times.js` - detect where each workout really starts
- `node update-video-database.js` - merge `video-start-times.json` into `public/data/videos.json`
