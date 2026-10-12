# The Bodyweight Gym: design brief for the rebuild

Written 12 Oct 2026 for the session that builds the redesign. Read all of it before touching the frontend. Where this brief and the current code disagree, this brief wins.

The site has two jobs, in this order:

1. Sell the two Bodyweight Skills books (Kindle and paperback on Amazon).
2. Give away 66 full-length classes filmed at the gym, which is the reason anyone trusts the books.

Everything on the site should serve one of those two jobs or be removed.

---

## 1. Why the current site reads as AI-generated, and the rules that follow

Mat's words: "these strips are really sloppy AI, I don't want this to come across as an AI generated site." He is right. The current `public/index.html` (branch `redesign`) and the previous version both use the patterns that every template and every generated landing page uses. The build must not contain any of the following.

**Banned patterns (hard rules):**

- A strip of four big numbers with labels under them ("66 / 47+ / 6 / $0"). Real numbers go inside sentences.
- Uniform card grids with icons, three equal columns of "benefits", numbered "01 02 03 04" step tiles with giant faded numbers.
- Gradient text, gradient buttons, glowing blobs, radial "orbs" behind content, decorative blur circles.
- A hero made of: small pill badge, two-line headline with one coloured word, paragraph, two equal buttons side by side, a row of logos.
- Tick-mark bullet lists as the main way of describing a product.
- Rounded "glassmorphism" cards, drop shadows on photos, 3D-tilted book covers, floating mockups.
- Marquees, typing animations, counting-up numbers, cursor followers, cards that lift and glow on hover, staggered fade-in of every element on load.
- Emoji in UI (the current meta rows use ⏰ 👤 📊).
- Pencil-sketch or rendered "photos" of exercises on any marketing surface (see section 5; 60 of the 62 guide images are renders).
- Stock photography of any kind. If a real photo does not exist for a slot, the slot gets type, a rule, or nothing.
- Copy with hype words (ultimate, transform, unlock, secret, game-changing, journey), "not X but Y" constructions, invented testimonials, review counts, star ratings, or claims we cannot back with data in the repo.
- Em dashes anywhere in site copy.

**What replaces them:** photography of Mat and the gym, large condensed type, hairline rules, lists and rows instead of cards, real sentences with real numbers, white space, and restraint. The sites in section 3 show this working.

---

## 2. Positioning and audience

- **Who:** adults (mostly 25 to 50) who train with their own bodyweight, at home or in a park, and want a specific skill: a freestanding handstand or a strict ring muscle up. Many found the free classes on YouTube or Facebook first.
- **What we are:** a real gym that existed. The Bodyweight Gym was a calisthenics studio in Osborne Park, Perth (opened around 2017, closed in 2020). The classes on the site were filmed live there. The books are the method the gym taught, written up by its founder, Mat Harvey, who also broke his back and rebuilt from zero (his story, in his words, is already on the site).
- **Tone:** a coach talking plainly. Confident, specific, a little dry. Australian. No hype, no "journey", no exclamation marks.
- **Proof we can legitimately show:** the classes themselves (66, about 69 hours, 6 coaches, all free, all real), the gym's history, the Sunday Times Magazine cover Mat appeared on, Mat's own story. That is enough. We do not need to manufacture social proof.

---

## 3. References and what to take from each

Mat asked for three sites. I rendered each in Chromium at 1440 and 390 wide and read their computed styles. Two award-winning fitness sites are added for the category.

### wonder-vision.com (CGI studio, UK)
- White page. One typeface (FK Grotesk) at a **regular** weight: h1 70px/77px, body 26px/39px. Big type does not need to be bold to be big.
- Hero is a 16:9 showreel with a small white "Play Showreel" tab in the corner, then a giant three-line statement ("PUSH BEYOND REALITY") set in plain black.
- Work is shown edge to edge: full-width images stacked with no gaps, each with a small white caption box in the bottom-left corner. No cards, no shadows.
- **Take:** regular-weight statement sentences at 40 to 70px; full-bleed images with corner captions; the calm of one typeface.
- **Leave:** nothing to avoid, but we are not a studio and must not look like one.

### thestart.com.au/is-oso-the-new-seo (Perth agency, article page)
- Pale grey page (#f6f6f6) ruled into visible 1px cells, like a worksheet. Content sits in cells; some cells are deliberately empty.
- Neue Haas Grotesk at 40px for the title, 18px body; a mono face (VCR OSD Mono) for breadcrumbs, labels and the footer link lists, all caps.
- Pill tags for category, a circular avatar for the author, generous empty space, a single image.
- **Take:** the ruled grid (hairlines as the main structural device), mono labels in caps, the article measure and rhythm for the blog, the "one image, lots of air" confidence. They are Perth-based, which fits.
- **Leave:** the collage art direction and the cute "Ask us anything" search; not our register.

### dept.global/en-au (agency)
- White page, Inter Variable at **112px, weight 900, uppercase, tracking -3.4px** for "THE GROWTH INVENTION COMPANY" with one word in orange (#ff4901). Logo centred in the header, pill "CONTACT" button top-right.
- Full-bleed video band with a huge word ("PARTNER-LED.") over it.
- Services are numbered 01 to 04 as **hairline rows**, not cards. Work is a two-column grid of unequal-height images. Insights are three plain images with a bracketed category label.
- Orange footer band; tiny bracketed tags; everything left-aligned.
- **Take:** heavy condensed-feeling uppercase display type with one accent word; numbered hairline rows; unequal image grids; the orange accent happens to match the Handstand cover.
- **Leave:** the centred logo; the agency sprawl (12,700px tall); the AI-everything copy.

### phive.pt/en (gym, Portugal; Awwwards Site of the Day, Aug 2025)
- Everything is one yellow (#FFD904) and black. Giant marquee type ("TRAIN EVERY DAY"), photo collage of the clubs, scribbled script accents, the app, class timetable. Very loud.
- **Take:** the courage to make one colour do all the work; photos of real clubs and real members; a class schedule treated as content.
- **Leave:** marquees and the scribble accents; it is a 15,000px scroll and would read as noise at our scale.

### coachsportifecublens.com (Essor Fitness, Switzerland; Awwwards Honorable Mention, Jan 2026)
- Black page, Inter Display 49px medium, a wordmark set at ~250px across the full width, a services marquee, a star-rating line, hairline sections, numbered service rows, real photos of the coach and the 70 m² studio.
- **Take:** black-and-white confidence for a small, personal fitness business; numbered rows; photos of the actual coach in the actual space.
- **Leave:** the marquee, the custom cursor, the star rating (we have no reviews to show and will not invent them).

**Common thread across all five:** one or two typefaces, hairline rules, photographs of the real thing, left alignment, and no "feature cards". That is the standard to hit.

---

## 4. Design system

### 4.1 Colour

Taken from the book covers (sampled from the 1600x2560 files).

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#F3F1EC` | Page background. Warm off-white, not pure white. |
| `--ink` | `#141414` | Text on paper; black bands. |
| `--ink-2` | `#4A4A48` | Secondary text on paper (7.9:1). |
| `--rule` | `rgba(20, 20, 20, 0.16)` | Hairlines on paper. |
| `--black` | `#121214` | Full-bleed photo bands, footer. Matches the cover background (#191a1e) once a photo sits on it. |
| `--on-black` | `#F3F1EC` | Text on black. |
| `--on-black-2` | `#A8A8A4` | Secondary text on black (7.5:1). |
| `--rule-dark` | `rgba(243, 241, 236, 0.18)` | Hairlines on black. |
| `--orange` | `#E87727` | The one accent. Book 1, links, the single highlighted word, focus rings. Dark text on orange only (#141414 on #E87727 is 7.4:1; white on orange fails at 2.9:1). |
| `--teal` | `#28AAA0` | Book 2 only (its label, its link, its rule). Never elsewhere. |

The page is **light by default**. Black is used for full-bleed photographic bands (hero, classes, book heroes) and the footer. This is the opposite of the current dark site and is deliberate: dark pages with glows are the generated-site default; a paper page with black photo bands reads as printed and intentional, and the bright white gym in the class thumbnails sits better on it.

No other colours. No gradients. No transparency effects beyond the rules above.

### 4.2 Type

Two families, both free on Google Fonts, loaded with `font-display: swap` and preconnect (keep the async pattern already in the pages).

- **Archivo** (variable: width 62 to 125, weight 100 to 900). One family does display and text, which keeps the site to one voice. Load: `family=Archivo:ital,wdth,wght@0,62..125,100..900`.
  - **Display:** `font-variation-settings: "wdth" 75` (condensed), weight 800, uppercase, letter-spacing -0.01em, line-height 0.9. This is the closest free match to the heavy condensed lettering on the covers.
  - **Statement:** width 100, weight 400, 28 to 44px, line-height 1.15, sentence case. The Wonder Vision voice; used for the manifesto sentence, book standfirsts, pull quotes.
  - **Body:** width 100, weight 400, 17px (18px on wide screens), line-height 1.55, max measure 68ch.
  - **UI / buttons:** width 90, weight 600, 14px, uppercase, letter-spacing 0.06em.
- **IBM Plex Mono** weight 500 for labels, metadata and table-like rows: 12 to 13px, uppercase, letter-spacing 0.08em. Replaces the current badges, pills and category chips.

Scale (desktop → mobile via `clamp`):

| Role | Size |
| --- | --- |
| h1 (hero) | `clamp(64px, 11vw, 168px)` |
| h2 (section) | `clamp(44px, 7vw, 104px)` |
| h3 (row title) | `clamp(26px, 3vw, 40px)` |
| statement | `clamp(26px, 3vw, 44px)` |
| body | 17 to 18px |
| label | 12 to 13px mono |

Headings are left-aligned, uppercase, and allowed to break across lines; never centre a heading over a full-width section. One word per page may be set in `--orange` (`<em class="hl">`); never more.

Delete Barlow / Barlow Condensed from the pages and `brand.css`.

### 4.3 Layout

- Max content width 1440px, side margins `clamp(20px, 4vw, 48px)`, 12 columns, 24px gutter.
- **Hairline rules are the structural device.** Every section starts with a 1px rule across the content width; list rows are separated by rules; two-column layouts get a vertical rule between columns at desktop (see The Start). Rules replace cards, boxes and background panels.
- Corners: 0. (Mono tags may have 2px.) No box shadows anywhere.
- Vertical rhythm: section padding `clamp(56px, 8vw, 120px)`; inside sections, 32 to 48px between blocks. Let big type carry the page; do not fill gaps with extra elements.
- Full-bleed bands (black) break the content width; the content inside them still sits on the 12-column grid.

### 4.4 Components

- **Primary button:** 48px high, square, `--ink` fill with `--paper` text on paper; inverted on black. UI type. Hover: fill becomes `--orange` with `--ink` text. Only one primary button per screen.
- **Secondary action:** an underlined text link with a trailing arrow (→ drawn as an SVG, not a character), underline thickens on hover. Not an outlined button.
- **Buy buttons (books):** primary style, label "Kindle US$4.99" and "Paperback US$9.99" so the price is on the button. The disabled "coming soon on Amazon" state already implemented in `books.js` stays, rendered as a mono label with a dashed bottom rule, not a dashed box.
- **Labels:** mono caps, e.g. `BOOK 1`, `58 MIN`, `MOBILITY`, `COACH MAISIE`. Replace every coloured badge/pill.
- **Rows:** the list item used for classes, coaches, blog posts, levels. Grid: `[mono label] [thumbnail or nothing] [title + one line] [meta] [arrow]`, 1px rule between rows, hover tints the row `rgba(20,20,20,0.04)` (or the dark equivalent). Whole row is the link.
- **Images:** no borders, no rounded corners, no shadows. Captions are mono labels either below or in a small paper-coloured box in the corner (Wonder Vision).
- **Forms:** the email field is a single underlined input (bottom rule only) with the button beside it.
- **Nav:** paper background, bottom rule, 64px tall; wordmark left, four links, one primary button "Get the books" right. On scroll it stays put (sticky), no hide/show animation, no transparency.

### 4.5 Motion

Motion should be physical and rare.

- Scroll reveal: images and rows fade from 0 to 1 and rise 12px, 400ms, `cubic-bezier(.2,.7,.2,1)`, once, triggered at 15% visibility. Text does not animate in.
- Hero photograph: parallax of at most 6% of its height. Nothing else moves on scroll.
- Hovers: underline weight, row tint, image opacity 1 → 0.92. Under 200ms.
- Video posters: play glyph is always visible (small, bottom-left, mono "PLAY 58:12"), does not scale on hover.
- `prefers-reduced-motion`: everything above off, except hover colour.
- No: marquee, counters, typewriter, cursor effects, tilt, glow, stagger-on-load, loading screens, smooth-scroll libraries.

---

## 5. Photography and assets

This is the part that most decides whether the site reads as real. Rule: **only photographs of Mat, the coaches, the gym, or its people.** No stock, no renders, no sketches, no icons-as-illustration.

### 5.1 What exists in the repo (verified by eye, 12 Oct 2026)

**Hero-grade (full resolution):**

| File | Shows | Notes |
| --- | --- | --- |
| `public/images/books/handstand-kindle-cover-1600x2560.jpg` | Mat, freestanding handstand against a brick wall, studio lighting | Book 1 cover. The photo area above the title crops to 1600x1500 (`handstand-art-*.{webp,jpg}` already generated). |
| `public/images/books/muscleup-kindle-cover-1600x2560.jpg` | Mat inverted on a rope/ring against black | Book 2 cover. Crop 1600x1300 (`muscleup-art-*`). |

**Real photographs, Wix-era, low resolution (438px wide unless noted). Use at or below 440px CSS width, or larger in black and white with grain, which hides the resolution gap.** Paths are under `public/blogs/`; filenames shortened to the first 13 characters of the Wix id (all end `~mv2.avif`).

| File (folder / id prefix) | Shows | Suggested use |
| --- | --- | --- |
| `goalsetting/7232a3_1914db7…` (925x478) | Black studio, Mat pressing on parallettes | Same shoot as the covers. Books index, story section. |
| `strengthtrainingandrecovery/7232a3_b4abe1d…` (925x618) | Black studio, Mat on the rope | Same shoot. Book 2 page body. |
| `goalsetting/7232a3_d7ed5d4…` | Black studio, straddle on parallettes | Same shoot. Small. |
| `thebodyweightteam/7232a3_f48a6d2…` (438x655) | Black studio handstand (the cover frame) | Duplicate of cover; not needed. |
| `thebodyweightteam/7232a3_2e9ccef…` (438x328) | **Inside the gym**: Mat on parallettes, kettlebells, wall bars, rig | The only interior shot. Story section, B&W. |
| `fiveprinicipalsofstrengthtraining/7232a3_ee70a93…` | **Mat coaching an older client on rings**, another coach beside | The most human photo in the set. Story section. Needs the client's OK. |
| `weightliftingtokungfu/7232a3_b127c5b…` | Coaching a child's handstand at the gym | Story, if permitted. |
| `fiveprinicipalsofstrengthtraining/7232a3_eab74e9…` | Handstand on a box at the gym (wall bars behind) | Classes section, B&W. |
| `fiveprinicipalsofstrengthtraining/7232a3_bc52c9b…` | Hanging from a wall-mounted bar in the gym | Original was 6000x4000 (ask for it). |
| `buildingfoundations/7232a3_f9b192c…` (438x521) | **The Sunday Times Magazine cover**, Mat on rings | Credibility. Ask Mat for a high-res scan or the tear sheet. Show it plainly with a one-line caption; no "as seen in" badge. |
| `firstmu/7232a3_0e1c3d9…` (438x774) | Wooden rings hanging in the gym corridor | Texture; book 2 page. |
| `buildingfoundations/7232a3_61a2937…` (306x766) | Mat hanging on a brick wall | Small only. |
| `buildingfoundations/7232a3_ae1f770…`, `…fb372b3…` | Hollow body on the floor; squat | Blog only. |
| `fiveprinicipalsofstrengthtraining/7232a3_8df751a…` | Torso, outdoors | Blog only. |
| `thebodyweightteam/7232a3_af157a9…`, `weightliftingtokungfu/7232a3_a84400a…` | Human flag on a pole in a park | Blog / classes B&W. |
| `thebodyweightteam/7232a3_7c0f550…`, `fiveprinicipals…/7232a3_e6014ec…` | Aerial hoop / contortion performer on black | Possibly a coach; confirm before using outside the blog. |
| `weightliftingtokungfu/7232a3_44ca8f1…`, `…9936d03…`, `…fc5fe95…`, `wellrested/7232a3_f93f1d2…` | Corey: street movement, kung fu training in China, mat work, portrait | Corey's posts and the coach list, if he agrees. |
| `gettingoutofcomfort/1.jpeg` | Coach Ana, portrait | Author photo. |
| `suppliments/7232a3_a2a7ad4…` | Carla Duncan, portrait | Author photo. |

**Not photographs (never use outside their own blog post):** `goalsetting/…50c1f3f…` (cartoon), `strengthtrainingandrecovery/…6635daf…` (food pyramid), `suppliments/…6ae4656…` and `…fb06f57…` (diagrams), `trainingandpain/…25e9477…` (cartoon), `…51138d6…` (chart), everything in `wellrested/` except Corey's portrait (stock: dumbbell, notebook, bottles, sleeper).

**Renders, banned from marketing surfaces:** `public/images/guides/handstand/*` and `public/images/guides/muscleup/*` are pencil-sketch renders except `handstand/finpushups.png` (a photo). The current book pages use two of them as "photos" (`public/images/books/handstand-photo-800.*` from `freestandinghandstand1.png`, `muscleup-photo-800.*` from `ringmu1.png`) and the blog cards use several more. Replace all of these. Delete `handstand-photo-800.*` and `muscleup-photo-800.*`; stop generating them in `scripts/build-images.js`. Blog card images in `scripts/blog-meta.json` currently point at guide renders for 9 posts; replace with the real photo from each post's own folder, or run the blog list without images (preferred; see section 6.8).

**Class thumbnails:** `public/images/thumbnails/*.jpg` are 350x200 and only a fallback. Classes with a `youtubeId` (most of them, see section 8) use the stream frame at `https://i.ytimg.com/vi/<id>/maxresdefault.jpg` (1280x720), with `hqdefault.jpg` as the fallback before the local file.

**Logo:** `public/images/Bwglogo2.png` (648x174) is blue, which fights the orange/black system. Ask Mat for the vector source. Until then, use it with `filter: brightness(0)` on paper and `filter: brightness(0) invert(1)` on black (it is a flat-colour PNG, so this gives a clean black or paper version). The ring mark on its own is the favicon and PWA icon (icons are already generated by `npm run images`).

**Video and stream frames (the best news in this inventory):** the 2020 classes were **streamed live from the gym** and sit under the channel's Live tab (62 streams titled "Coach X - ..."). Every matched class therefore has a real 1280x720 frame at `https://i.ytimg.com/vi/<youtubeId>/maxresdefault.jpg`: the coach on the mat, the wall bars and rig behind, a "Coach / Class" lower-third from the stream overlay. These are honest, consistent, and far better than the 350px local thumbnails; the class list should use them wherever a `youtubeId` exists (58 of 66 as of this brief; see section 8).

The channel also has the 2020 announcement video "FREE live fitness classes" (`_UARrLERb2k`, **58K views**, the gym's most-watched upload). Its frame (Mat in a crow pose under studio lights, the streaming rig behind him) is saved at `public/images/gym/2020-live-classes-frame.jpg` (1280x720) and is a legitimate hero candidate alongside the cover photos, because it shows the real gym and the real setup the classes came from. Ask Mat for the source footage: a 6 to 10 second muted loop from it would make the hero.

"The Bodyweight Gym flythrough" (`1OxqgPVjmIA`) is a hand-held, overexposed GoPro walk past the wall bars; not usable without grading.

### 5.2 Asset requests for Mat (block the hero quality until answered)

1. **The book photoshoot originals.** The two covers and the black-studio blog images are from one session. Ask the photographer for every usable frame at full resolution. This single request supplies the hero, both book pages and the story section with consistent imagery.
2. The Sunday Times Magazine cover at print resolution.
3. The 6000x4000 original of the wall-bar hang (`bc52c9b…`).
4. An export of the gym's Instagram (`@the_bodyweight_gym`) and Facebook page (`facebook.com/thebodyweightgym.com.au`, ~1,300 likes): Settings → Your information → Download. Class photos from 2017 to 2020 are what the classes section needs.
5. The logo source (AI/SVG/PDF).
6. Coach photos for the six coaches, or confirmation to list them by name only.
7. Permission for the two client photos (older client on rings; child's handstand).

### 5.3 Image treatment

- Colour photos keep their colour. Apply one consistent grade in the build script (sharp): contrast +6%, slight warm shift, blacks lifted to #141414 so they match `--black`.
- Any photo narrower than 900px that must be shown wider than 440px is converted to black and white with light grain (`sharp().grayscale()` plus a 2% noise overlay). Mixing B&W archival shots with colour studio shots is a normal editorial device and hides the quality difference.
- Never place text over a face. Headlines may overlap the empty part of a photo (the brick wall, the black studio background).
- Serve WebP with JPEG fallback, `srcset` at 480 / 960 / 1440 / 2000, `width`/`height` set, `loading="lazy"` below the fold, `fetchpriority="high"` on the hero. All generated by `scripts/build-images.js`; outputs are committed.

---

## 6. Page by page

Copy below is written to the copy rules (section 7) and uses only facts in the repo. Mat may change wording; do not add claims.

### 6.1 Navigation (every page)

`[wordmark] Classes Books Story Blog [Get the books]`

Mobile: wordmark + "Menu" (full-screen paper panel with the same five items set in display type at 40px). "Books" is not coloured; the button is enough.

### 6.2 Home

Keep the home short. Six sections plus footer. The full class library moves to `/classes`.

**1. Hero (black band, full viewport height on desktop, natural height on mobile).**
Photo: the handstand cover crop (`handstand-art-1400.webp`) full-bleed, anchored right, fading to black on the left so the type sits on black, not on the figure. Alternative if Mat prefers the gym over the studio: the 2020 live-classes frame (`public/images/gym/2020-live-classes-frame.jpg`), which shows the real floor and rig; it is 1280px, so use it at full bleed only on screens up to 1440px wide and ask for the source footage for larger.
Left column, bottom-aligned:
- mono label: `BODYWEIGHT SKILLS · BOOKS 1 AND 2 · MAT HARVEY`
- h1: `LEARN THE HANDSTAND. EARN THE MUSCLE UP.` (two lines; "EARN" in orange is the one accent word on the page)
- statement (26 to 32px, regular): `Two training books from the coach of The Bodyweight Gym, Perth. Six levels each, from your first plank or ring hang to the finished skill.`
- primary button `See the books`; secondary text link `Watch a free class →` (anchors to section 3).
No badge, no stat strip, no second button, no scroll-down arrow.

**2. Statement (paper).** One ruled block, one sentence in statement type at 44px, max 20 words per line:
`The Bodyweight Gym opened in Osborne Park in 2017 and closed in 2020. When the doors shut we streamed the classes live from the gym floor. All 66 are still free. The method is in two books.`
(Confirm the 2017 date with Mat; the gym's Facebook and LinkedIn say July 2017.) Right of it, in the second column, the Sunday Times cover at 320px with a mono caption `MAT HARVEY ON THE COVER OF THE SUNDAY TIMES MAGAZINE`. If the high-res scan does not arrive, leave the column empty.

**3. Free classes (black band).**
- h2: `FREE CLASSES FROM THE GYM FLOOR`
- statement: `66 full-length classes, about 69 hours, streamed live from the gym in 2020 with six coaches. No account, no ads.` (numbers come from `videos.json` via `BWG.computeStats`; render them into the sentence, never as tiles.)
- A ruled list of **6 featured classes** (one per coach, chosen by rating in data, or hand-picked by ids in a small array): row = thumbnail 240x135 · mono `STRENGTH · 56 MIN` · title in h3 · `Coach Corey` · arrow. Whole row links to `/video?id=`.
- Below the list: text link `All 66 classes →` to `/classes`.

**4. The books (paper).** Two ruled rows, each the full content width, alternating image side.
Row 1: left 5 columns: the cover photograph (not the cover with title, the photo crop) 4:5, flat. Right 7 columns: mono `BOOK 1`, h2 `THE HANDSTAND`, statement `Six levels to a 60 second freestanding handstand.`, two short paragraphs from the approved copy (already in `public/books/handstand.html`), mono price line `KINDLE US$4.99 · PAPERBACK US$9.99 · ABOUT 36 PAGES`, buy buttons, text link `What's inside →`.
Row 2 mirrors it for The Ring Muscle Up with the `--teal` label and rule.
Approved book copy is in `public/books/*.html`; use it verbatim, trimmed, never extended.

**5. Story (paper).** Two columns with a vertical rule. Left: the photo of Mat coaching the older client (B&W, 5:4). Right: mono `MAT HARVEY · FOUNDER`, the existing quote in statement type (`A few years ago I broke my back. Overnight I went from a ring routine and handstand to not even one pushup. Now I'm back and stronger than ever.`), then the two existing paragraphs (scientist → coaching; gym closed in COVID). No mini-stats, no logo in a frame.

**6. From the blog (paper).** h2 `TRAINING NOTES`. Three latest posts as ruled rows: mono `TRAINING · 3 MIN · 9 JUL 2018`, h3 title, one-line excerpt, arrow. No images. Link `All articles →`.

**Footer (black).** Two rows. Top: mono `NEW BOOKS FIRST` + one sentence + the email input and button (the existing `data-signup` behaviour and config stay; the "coming soon" state renders as a mono line). Bottom: four ruled columns: Explore (Classes, Books, Story, Blog), Books (The Handstand, The Ring Muscle Up), Connect (YouTube, Instagram, Facebook), About (`The Bodyweight Gym, Perth, Western Australia. Free classes forever.`); then the existing "Also by Mat Harvey" strip and the copyright line. Drop the "Promise" column; the sentence in About covers it.

### 6.3 Classes (`/classes`, new page)

- Header: h1 `ALL CLASSES`, statement with the computed numbers, then a tools row: category toggles as **underlined text** (All · Strength · Mobility · Skills · Conditioning · Saved), a search field (bottom rule only), a sort select styled as text with a chevron.
- The library as a ruled list, not a grid: thumbnail 200x113 (320x180 on wide screens) · mono `MOBILITY · 57 MIN · INTERMEDIATE` · h3 title (title without the "Coach X - " prefix; the prefix is removed by `displayTitle()` already) · `Coach Corey` · heart (saved state) · arrow.
- Show 12, then `Show all →`. Keep the existing JS behaviour (`modern-app.js`: filters, search, sort, favourites in `localStorage`); only the markup and CSS change. Keep the `?filter=` deep links.
- Empty states are one mono sentence.

### 6.4 Video (`/video?id=`)

Black page. Player at the top (16:9, max 1200px). Under it, a ruled block: mono `STRENGTH · 56 MIN · INTERMEDIATE`, h1 title, `Coach Corey`, the one-line description, save button as a text toggle. Then a ruled row: `More from Coach Corey` (3 rows). Then the book row: mono `WANT THE FULL PLAN`, h3 `The Handstand` or `The Ring Muscle Up` (matching logic already in `video.html`), one sentence, text link. No upsell box with a border.

### 6.5 Book pages (`/books/handstand`, `/books/ring-muscle-up`)

These are hand-maintained HTML files (there is no generator in the repo).

- **Hero (black band):** the book's photo crop full-bleed right; left: mono `BODYWEIGHT SKILLS · BOOK 1 · MAT HARVEY`, h1 `THE HANDSTAND`, statement = the subtitle, mono price line, buy buttons (disabled state until URLs exist), text link `Read a sample on Amazon` only once the URL exists.
- **Inside (paper):** the approved description as two paragraphs at body size, then the six "Inside" items as **numbered ruled rows** (`01` to `06` in mono, item text in h3 at 26px). Then the time-expectation sentence as a statement line.
- **Watch (paper, ruled):** the three demonstration videos as rows (poster 320x180, mono `PLAY · 2:14`, title, "Want the full six-level plan? Get the book" becomes a single text link under the list, not under each video).
- **The other book:** one ruled row linking across.
- **Signup** in the footer, as on the home page.
- Keep the structured data, OG tags, canonical, and the sticky mobile buy bar (`.buy-bar`), restyled: paper background, top rule, title in mono, one black button.

### 6.6 Books index (`/books`)

The two book rows from the home page, full-height versions, plus the "how each book works" sentence. No cards.

### 6.7 Blog list (`/blog`)

Ruled rows, newest first: mono date/category/read time, h3 title, excerpt. Optional 160px B&W image from the post's own folder when it is a real photograph (Corey's posts, Mat's); none otherwise.

### 6.8 Blog post (`/blog/post?slug=`)

The Start's article rhythm: mono breadcrumb row, h1 at 44px (statement weight, sentence case, not uppercase), author line with a 40px circular photo where a real one exists (Ana, Carla; Mat's needs supplying), body at 18px on a 680px measure, h2s in display type at 32px, images full measure with mono captions, a ruled "Next article" row at the end. Markdown rendering via `marked` stays.

### 6.9 404

Paper. h1 `NOT HERE.` and three text links. Keep the `/blog/<slug>` redirect script.

---

## 7. Copy rules and the facts you may state

Rules (Mat's, plus mine):
- Plain voice, short sentences, sentence case except display headings. Australian spelling (favourite, colour).
- No em dashes. Use a full stop, comma or colon.
- No hype words, no "journey", no "not X, it's Y", no exclamation marks, no emoji.
- No invented testimonials, ratings, review counts, member counts, "trusted by", credentials or medical promises. The only health note is the existing line: `Train within your limits. The books and videos are general training information, not medical advice.`
- Numbers must come from data: 66 classes, about 69 hours (sum of durations in `videos.json`), 6 coaches, 36 pages, US$4.99 / US$9.99 (£3.99 / £7.99, A$7.99 / A$14.99). The old "47+ hours" and "79 classes" are wrong and must go.
- Gym facts: Osborne Park, Perth; closed in 2020; the classes were streamed live from the gym during the 2020 lockdown; the announcement video has 58K views on YouTube (public count, may be quoted as "58,000 people watched"); founder Mat Harvey, former scientist, broke his back and rebuilt. Opening year to be confirmed.

---

## 8. Technical constraints (do not change)

- Fully static site on GitHub Pages; deploy from `public/` by `.github/workflows/pages.yml`. No server, no `/api/*`.
- Data: `public/data/videos.json` is hand-maintained; `npm run build` regenerates `categories.json`, `instructors.json`, `blogs.json` and (with `YOUTUBE_API_KEY`) view counts. `scripts/blog-meta.json` controls the blog list.
- `public/js/data.js` (`window.BWG`): JSON loading, favourites, stats, URL helpers. `public/js/modern-app.js`: filters, search, sort, cards. `public/js/books-config.js` + `books.js`: Amazon URL config (TODO → disabled state), AU store switch, click-to-load YouTube (`youtube-nocookie.com`), signup modes, sticky buy bar. Keep these contracts; change markup and CSS.
- **YouTube IDs.** The 66 classes are the gym's 2020 live streams (channel `@thebodyweightgym8512`, id `UCsmQBMATmOL14n-v53jug8Q`; the full listing of 245 uploads and streams is in `scripts/youtube-channel.json`). On this branch `videos.json` now carries a `youtubeId` for 58 classes: 46 matched the stream title exactly, 12 matched by coach and class type where the local file only had a short name (`strength3_corey` and the like). 8 remain `TODO` (Coach Kelvin - Full Body Workout, Coach Oscar - Handstand 3, Coach Maisie - Mobility 6, Coach Corey - Strength 3, Coach Corey - Strength 4, Coach Corey - Strength 6, Coach Maisie - Strength 6, Coach Corey - Strength 7).
  Caveat for Mat to spot-check: where the same title exists several times on both sides ("coach corey handstand class", "coach corey strength and movement", "coach corey strength training legs knees shoulder focus", "coach kelvin strength conditioning", "coach maisie flexibility and mobility", "coach maisie flexibility mobility", "coach maisie mobility and flexibility class", "coach maisie mobility and strength", "coach maisie mobility class", "coach maisie mobility flexibility", "coach maisie upper body strength", "coach mikhail mik strength development", "coach mikhail nazaryev mik strength development with progressions and regressions", "coach oscar calisthenics", "coach oscar handstand class", "coach ray strength and conditioning"), the pairing inside that group is by upload order, so a card may open a different session of the same class with the same coach. The title and coach are right either way; swap IDs in `videos.json` if a class should point at a specific session. To redo the matching after new uploads, refresh `scripts/youtube-channel.json` (`yt-dlp --flat-playlist -J` on the channel's `/videos` and `/streams` tabs) and match on the local `filename` with the size suffix stripped (`-1280x720-avc1-mp4a.mp4`, ` (720p)`), case- and punctuation-insensitive.
  Thumbnails: prefer `https://i.ytimg.com/vi/<youtubeId>/maxresdefault.jpg`, fall back to `hqdefault.jpg`, then the local 350px file. With the IDs in place, `npm run build` with `YOUTUBE_API_KEY` also fills real view counts.
- Keep: `404.html` redirect, `ebook.html` redirect to `/books`, service worker (bump `CACHE_NAME` on release), manifest (icons now real), `CNAME`, `.nojekyll`.
- Scripts: `npm run build`, `npm run images` (sharp; covers, art crops, blog images, icons), `npm start` (`npx serve public`).

---

## 9. Budgets and acceptance

Performance (Lighthouse mobile, `npx serve public`): Performance ≥ 90 on home, classes, both book pages; LCP ≤ 2.5s on the throttled mobile profile; CLS 0; total transfer for the home page ≤ 1.2 MB with images, ≤ 60 KB CSS, ≤ 40 KB JS (no frameworks, no animation libraries).

Accessibility: Lighthouse ≥ 98; every text/background pair ≥ 4.5:1 (orange gets dark text only); visible focus rings (`--orange`, 2px, offset 3px); all controls ≥ 44px; heading order with no skips; `prefers-reduced-motion` honoured; images have alt text that describes the photo or are `alt=""` when decorative.

Checklist before the branch is handed back:
- [ ] None of the banned patterns in section 1 appear on any page (grep for `stat`, `badge`, `gradient`, `glow`, `marquee`, emoji).
- [ ] No guide renders or stock images are referenced from any page (`grep -r "images/guides" public --include=*.html --include=*.js --include=*.json` returns nothing outside the book-internal data).
- [ ] Every number on the site is computed or in the copy table (section 7).
- [ ] Home, `/classes`, `/video?id=2`, both book pages, `/books`, `/blog`, one post, `/404` render at 360, 768 and 1440 with no horizontal scroll and no console errors.
- [ ] Filters, search, sort, favourites across reload, the buy-button disabled state, the AU store switch and both signup modes still pass the checks in `scratchpad` scripts (re-create: they are listed in the PR #2 description).
- [ ] Lighthouse and transfer budgets above met; `npm run build` and `npm run images` succeed.
- [ ] `docs/DESIGN_BRIEF.md` updated with anything you decided differently, and why.

---

## 10. Build order (suggested)

1. Tokens and type: new `public/css/brand.css` from section 4 (replace the current file entirely; keep `modern-style.css` only for what the blog post body still needs, then trim it).
2. Image pipeline: extend `scripts/build-images.js` with the grade, the B&W variant and the 480/960/1440/2000 srcset sizes; remove the guide-render outputs; add `scripts/featured-classes.json` if hand-picking.
3. Nav + footer as shared markup (copy into each page; there is no templating).
4. Home (section 6.2) and `/classes` (6.3).
5. Book pages and `/books` (6.5, 6.6); keep JSON-LD/OG.
6. Video, blog list, blog post, 404.
7. Checks (section 9), screenshots at three widths into the PR description, then hand back.

---

## 11. State of the repo

- Branches: `static-github-pages` (PR #1, static site), `books-amazon` (PR #2, stacked on #1), `redesign` (this brief and WIP groundwork, stacked on `books-amazon`). Build the redesign on `redesign`; open a PR against `books-amazon`.
- Keep from the WIP commit on `redesign`: cleaned titles and coach names in `videos.json` (6 coaches), `npm run images` (covers, art crops, real PWA icons, compressed blog images), async font loading pattern, contrast fixes, the video-page book link logic, the sticky buy bar logic.
- Replace: the home page layout, `brand.css` (hero/proof/steps/cta-band), the brand layer at the end of `books.css`, the book-page "photo" slots, the blog card images.
- Open questions for Mat are in section 5.2 and the opening year in 6.2.

---

## 12. As built (Oct 2026): where the build differs from this brief, and why

The rebuild follows sections 1 to 9. These are the deliberate differences, plus the facts Mat confirmed after the brief was written.

**Facts confirmed by Mat**
- The gym opened in **2016** (not 2017). The Sunday Times Magazine cover is dated **10 April 2016** ("WA's most unusual new gym"); the scan is `assets/photos/stm-cover-2016-04-10.jpg`.
- **Only Mat Harvey is named on the site.** Coach names are stripped from class titles in the UI (`displayTitle()` in `scripts/build-pages.js` and `public/js/video.js`), are not in any description, and the stream lower-thirds that carried them are cropped out of every class frame. "More from Coach X" became "More strength classes". The three guest posts (`weightliftingtokungfu`, `wellrested`, `gettingoutofcomfort`) are unpublished in `scripts/blog-meta.json`; their markdown stays in the repo.
- Client photos may be used (members signed a waiver), so the coaching photo is in the story section.

**Numbers**
- Only classes with a YouTube upload are listed or counted: **57 classes, about 60 hours, six coaches** (computed at build into `<span data-stat>`). The 9 without an upload (ids 4, 49, 53, 58, 60, 61, 63, 64, 65) stay in `videos.json`; `/video?id=` explains they are not uploaded yet.
- The "Highest rated" sort is gone: the `rating` values were placeholders, not ratings. Sorts are Most viewed (real YouTube counts), Shortest first, Longest first.
- Read times are computed from word count at build (230 words a minute).

**Build and markup**
- Shared nav, head and footer live in `src/partials/` and are written into every page by `scripts/build-pages.js` (Node built-ins only, part of `npm run build`), instead of being copied by hand. The same step pre-renders the featured classes, the full class library on `/classes`, and the blog lists, so those pages work without JavaScript and do not shift when scripts run.
- Fonts are self-hosted (`public/fonts/`, latin subset, OFL licences alongside) rather than loaded from Google Fonts: one fewer origin, and both files are preloaded. Local fallbacks are size-matched to Archivo (measured against Arial) so nothing moves when the web font arrives.
- `modern-app.js`, `modern-style.css` and `books.css` are replaced by `public/js/classes.js`, `video.js`, `post.js`, `site.js` and the single `public/css/brand.css`. The `books.js` contracts (TODO URL stays disabled, AU store switch, signup modes, buy bar) are unchanged; click-to-play moved to `site.js` so the class page uses it too.

**Colour and accessibility**
- Orange and teal fail 4.5:1 as text on paper, so text uses darker ink versions (`--orange-ink #A84D17`, `--teal-ink #1B766F`); the bright values are kept for black bands, rules and fills.
- Focus rings are ink on paper and orange on black. Orange on paper is too faint for a focus ring.
- The "fade to black" on hero photos is a CSS mask on the photo (section 6.2 asks for it). There are no visible colour gradients anywhere.

**Photography**
- Every photo goes through one grade in `scripts/lib/grade.js` (run by `npm run images`): warm hues keep their saturation while cool and magenta casts are pulled toward grey, an S-curve adds contrast, mid-tones are warmed, blacks map to `#121214` and whites to the paper colour, and seeded grain is added. The Wix-era interior shots are black and white with grain, as in 5.3.
- Home hero: the full-figure handstand from Mat's photo set, shown at its own shape, so the frame always runs from feet to hands. The brief's cover crop cut the head off at common laptop sizes.
- Book page heroes: the Book 1 cover photograph, and the rings photograph for Book 2 (more on-topic than the rope shot on the cover).
- In the book rows the cover itself is shown flat, because the cover is the product people will see on Amazon. The photo crops lead the book pages.
- Class thumbnails are self-hosted, graded crops of YouTube's automatic stream frames, chosen and cropped clear of the overlays (`FRAME_CROP`, `FRAME_CROP_FOR`, `FRAME_PICK` in `scripts/build-images.js`). Two demonstration videos had a logo title card as their thumbnail; they use a real frame instead (`DEMO_FRAME`).
- The 404 page carries one photo (Mat in an L-sit by the sea) beside "Not here.".

**Blog**
- Rendered drawings (`/images/guides/`) and emoji are stripped from posts at render time; `{#id}` heading anchors are kept so the tables of contents work.
- The post bodies themselves are unedited. They still contain hype words, em dashes and an "About the Author" line with credentials the repo cannot back ("certified", "over 10 years", in `buildingfoundations.md`). They need Mat's edit; that is content work, outside this rebuild.

**Deploy**
- The workflow publishes `_site/`, made by `scripts/prepare-pages.js`, not `public/` directly. GitHub serves a project site one level below the domain root until the custom domain is set, and the pages use root-based URLs, so the deployed copy gets the base path GitHub reports (`configure-pages` `base_path`) as a prefix. HTML and CSS are rewritten at deploy; scripts use `BWG.url()`. On the custom domain the prefix is empty. After changing the custom domain, run the workflow again.

**Not done, or left as it was**
- No page registers `public/service-worker.js` (none did before either). Its cache name is bumped to v5 so it is ready if registration is added.
- Assets still wanted from section 5.2: the photoshoot originals, the logo source, coach photos (not needed while only Mat is named).

**Checks run (Oct 2026)**
- Lighthouse, mobile, local preview, before the last fixes: home 98 performance / 100 accessibility, `/classes` 99 / 100, `/books/handstand` 99 / 100, `/books/ring-muscle-up` 100 / 100, `/blog` 100 / 98 (heading order, since fixed), `/video?id=2` 82 / 100 (layout shift, since fixed). Best practices and SEO 100 on all six.
- After the fixes, measured in Chromium on a throttled phone profile: layout shift under 0.03 on every page, one `h1` and no skipped heading levels, no horizontal scroll at 360, 768 and 1440. Page weight is 166 to 359 KB, CSS 34 KB, JS 12 to 31 KB including `marked` on posts.
- The behaviour suite passes: filters, search, sort, show all, saved classes across reload, `?filter=` deep links, no-JS library, class page, demo playback, buy bar, disabled buy state, US and AU Amazon links, mailto and Formspree signup, blog rendering, old `/blog/<slug>` redirects and the mobile menu.
