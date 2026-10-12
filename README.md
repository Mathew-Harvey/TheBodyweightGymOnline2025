# The Bodyweight Gym Online

A fully static site (no backend) hosted on GitHub Pages at <https://thebodyweightgym.org>. Workout videos are YouTube embeds (`youtube-nocookie.com`); nothing is self-hosted.

## How it works

| Piece | Where |
| --- | --- |
| Site root (what gets deployed) | `public/` |
| Video list (hand-edited source of truth) | `public/data/videos.json` |
| Generated: categories, instructors, blog index | `public/data/{categories,instructors,blogs}.json` |
| Blog posts (markdown, rendered in the browser with `marked`) | `public/blogs/<slug>/*.md` |
| Blog publish list + card extras (author, category, image, ...) | `scripts/blog-meta.json` |
| Favourites | the visitor's `localStorage` (`bwg:favourites`) |
| Search, filters, sorting, stats | computed in the browser from the JSON files |

`npm run build` regenerates the files under `public/data/` (`scripts/build-data.js`, Node built-ins only). The generated files are committed so a fresh checkout previews without a build, and CI rebuilds them on every deploy.

## Local preview

```bash
npm run build   # regenerate public/data/*.json
npm start       # npx serve public  ->  http://localhost:3000
```

## Adding or editing content

- **A video:** add an entry to `public/data/videos.json` with a unique `id`, a `thumbnail` under `public/images/thumbnails/`, and its `youtubeId` (the 11-character ID from the YouTube URL). `"youtubeId": "TODO"` is allowed; that video's page shows "being added" until you fill it in. `npm run build` warns while any TODO remain and fails on malformed IDs or duplicate `id`s.
- **A blog post:** add `public/blogs/<slug>/<file>.md`, then add a `<slug>` entry to `scripts/blog-meta.json` (order there is the display order; folders not listed are skipped). Title, date and excerpt are read from the markdown (`# Title`, `*Published: Month D, YYYY*`, first paragraph) unless overridden in the meta file.
- Run `npm run build` and commit the regenerated `public/data/*.json`.

## View counts

Each video has a `views` number used for the "Most viewed" sort. The site can't count views itself, so `npm run build` fetches each video's YouTube view count when the `YOUTUBE_API_KEY` environment variable is set. Videos still marked `TODO` keep their stored count. If the API call fails, the build still succeeds and uses the stored counts.

To turn this on for deploys, create a YouTube Data API v3 key in Google Cloud (free quota is plenty; restrict the key to the YouTube Data API) and add it as a repository secret named `YOUTUBE_API_KEY` (Settings → Secrets and variables → Actions). The deploy workflow passes it to the build. Counts refresh on each deploy; they are not written back to the repo.

## Deploying to GitHub Pages

One-time setup:

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Repo **Settings → Pages → Custom domain:** `thebodyweightgym.org`, and tick **Enforce HTTPS** once the certificate is issued.
3. DNS for `thebodyweightgym.org`: `A` records for `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (and optionally the matching `AAAA` records), plus `CNAME www -> <owner>.github.io`.

After that, every push to `main` runs `.github/workflows/pages.yml`, which runs `npm run build` and publishes `public/`. `public/CNAME` keeps the custom domain and `public/.nojekyll` stops Jekyll from processing the site. You can also run the workflow manually from the Actions tab.

## URLs

| URL | File |
| --- | --- |
| `/` | `public/index.html` |
| `/video?id=<id>` | `public/video.html` |
| `/blog` | `public/blog/index.html` |
| `/blog/post?slug=<slug>` | `public/blog/post.html` |
| `/blog/<slug>` (old links) | `public/404.html` redirects to the URL above |
| `/ebook` | `public/ebook.html` |

## Maintenance scripts (need FFmpeg and local video files)

- `npm run thumbnails` - generate thumbnails (see `THUMBNAIL_GENERATION.md`)
- `node analyze-video-start-times.js` - detect where each workout really starts
- `node update-video-database.js` - merge `video-start-times.json` into `public/data/videos.json`
