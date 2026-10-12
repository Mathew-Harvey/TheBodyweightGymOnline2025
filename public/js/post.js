// /blog/post?slug=: one article. The markdown lives in public/blogs/<slug>/ and is rendered
// with marked (loaded from jsDelivr in the page head).

(function () {
    if (!window.BWG) return;
    const $ = (id) => document.getElementById(id);
    const esc = BWG.escapeHtml;
    const slug = new URLSearchParams(location.search).get('slug');
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fmtDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };

    // "## Heading {#id}" anchors, so the tables of contents keep working: [heading text, id]
    let anchors = [];

    // Appendices that point at nothing: lists of tutorial videos that do not exist, resource and
    // reference lists with no sources, and an author blurb with credentials the site cannot back.
    // They are hidden here; the markdown files are untouched.
    const DROP = /^(video resources|video tutorial library|sleep optimization videos|resources and (further reading|references)|recommended resources|about the author)$/i;
    const isRule = (line) => /^(\*{3,}|-{3,}|_{3,})\s*$/.test(line);

    function dropSections(md) {
        const out = [];
        let skipLevel = 0;
        for (const line of md.split('\n')) {
            const heading = line.match(/^(#{1,6})\s+(.*?)\s*$/);
            if (skipLevel) {
                if (isRule(line)) skipLevel = 0;                                // a rule ends the appendix
                else if (heading && heading[1].length <= skipLevel) skipLevel = 0; // so does the next heading of its level or higher
                else continue;
            }
            if (heading && DROP.test(heading[2].replace(/[*_`:]/g, '').trim())) { skipLevel = heading[1].length; continue; }
            if (isRule(line)) {                                                 // never two rules in a row
                const previous = [...out].reverse().find((l) => l.trim());
                if (previous && isRule(previous)) continue;
            }
            out.push(line);
        }
        let s = out.join('\n');
        let before;
        do { before = s; s = s.replace(/(?:\n|^)[ \t]*(?:\*{3,}|-{3,}|_{3,})[ \t]*(?:\n\s*)*$/, '\n'); } while (s !== before);  // no rule at the very end
        return s;
    }

    // The markdown came from the old Wix blog. Tidy it for this layout.
    function clean(md) {
        let s = md
            .replace(/\r\n?/g, '\n')                                       // the files use Windows line endings
            .replace(/^\/\/\s*\.\.\..*/gm, '')                              // "// ..." editing notes
            .replace(/^---$/gm, '***')                                      // rules, not setext headings
            .replace(/!\[[^\]]*\]\(\/images\/guides\/[^)]*\)[ \t]*\n?/g, '') // drawings, not photographs (design brief 5.1)
            .replace(/\p{Extended_Pictographic}\uFE0F?[ \t]?/gu, '');        // no emoji (design brief 1)
        anchors = [];
        s = s.replace(/^(#{1,6})\s+(.+?)\s*\{#([\w-]+)\}[ \t]*$/gm, (m, hashes, text, id) => {
            anchors.push([text.replace(/[*_`]/g, '').trim(), id]);
            return `${hashes} ${text}`;
        }).replace(/\{#[\w-]+\}/g, '');
        const h1 = s.match(/^#\s+.+$/m);                                    // the page shows the title already
        if (h1) s = s.replace(h1[0], '');
        return dropSections(s
            .replace(/^\*(?:By\s|Writer:|Published:|Reading Time:|Updated:|Last Updated:).+\*\s*$/gm, '')
            .replace(/^\*\*?\d+\s*min\s*read\*\*?\s*$/gm, ''));
    }

    function postRow(b) {
        return `<li class="row post-row post-row--compact">
            <a class="row__link" href="${BWG.blogUrl(b.slug)}">
                <span class="label post-row__meta"><span>${esc(b.category)} · ${esc(b.readTime)}</span><span>${fmtDate(b.date)}</span></span>
                <div>
                    <h3 class="display post-row__title">${esc(b.title)}</h3>
                    <p class="post-row__excerpt">${esc(b.excerpt)}</p>
                </div>
                <span class="row__arrow" aria-hidden="true"></span>
            </a>
        </li>`;
    }

    function fail(title, text) {
        $('post-body').removeAttribute('aria-busy');
        document.title = `${title} | The Bodyweight Gym`;
        $('post-title').textContent = title;
        $('post-crumb').textContent = title;
        $('post-body').innerHTML = `<p>${esc(text)} <a href="${BWG.url('/blog/')}">See all articles</a>.</p>`;
    }

    async function load() {
        let posts;
        try {
            posts = await BWG.getBlogs();
        } catch (error) {
            console.error('Could not load the article list:', error);
            fail('Could not load this article', 'Check your connection and try again.');
            return;
        }
        const post = posts.find((p) => p.slug === slug);
        if (!post) {
            fail('Article not found', 'It may have moved when the site was rebuilt.');
            return;
        }

        document.title = `${post.title} | Training notes | The Bodyweight Gym`;
        document.querySelector('meta[name="description"]')?.setAttribute('content', post.excerpt);
        $('post-crumb').textContent = post.category;
        $('post-title').textContent = post.title;
        $('post-meta').textContent = `${post.author} · ${post.readTime} read · ${fmtDate(post.date)}`;
        if (post.image) {
            const photo = $('post-photo');
            const image = BWG.url(post.image);
            photo.innerHTML = `<img src="${image}-480.webp" srcset="${image}-320.webp 320w, ${image}-480.webp 480w" sizes="(max-width: 860px) 100vw, 440px" width="480" height="320" alt="" decoding="async">`;
            photo.hidden = false;
        }

        // Next article: the next one in the list (newest first), wrapping round.
        const ordered = [...posts].sort((a, b) => b.date.localeCompare(a.date));
        const next = ordered[(ordered.indexOf(post) + 1) % ordered.length];
        if (next && next !== post) {
            $('post-next-row').innerHTML = postRow(next);
            $('post-next').hidden = false;
        }

        try {
            const res = await fetch(BWG.url(post.file));
            if (!res.ok) throw new Error(`${post.file}: HTTP ${res.status}`);
            const md = await res.text();
            if (!window.marked) throw new Error('marked did not load');
            marked.setOptions({ breaks: true, gfm: true });
            const body = $('post-body');
            body.innerHTML = marked.parse(clean(md));
            const ids = new Map(anchors);
            body.querySelectorAll('h2, h3, h4').forEach((h) => {
                const id = ids.get(h.textContent.trim());
                if (id) h.id = id;
            });
            body.querySelectorAll('img').forEach((img) => {
                img.loading = 'lazy';
                img.decoding = 'async';
                const figure = document.createElement('figure');
                img.replaceWith(figure);
                figure.append(img);
                if (img.alt) {
                    const caption = document.createElement('figcaption');
                    caption.className = 'label';
                    caption.textContent = img.alt;
                    figure.append(caption);
                }
            });
            // A figure cannot sit inside a paragraph.
            body.querySelectorAll('p > figure').forEach((figure) => {
                const p = figure.parentElement;
                if (p.children.length === 1 && !p.textContent.trim()) p.replaceWith(figure);
            });
            body.querySelectorAll('a[href^="http"]').forEach((a) => { a.rel = 'noopener'; });
            // Site links inside an article follow the base path like everything else.
            body.querySelectorAll('a[href^="/"], img[src^="/"]').forEach((el) => {
                const attr = el.tagName === 'A' ? 'href' : 'src';
                const value = el.getAttribute(attr);
                if (!value.startsWith('//')) el.setAttribute(attr, BWG.url(value));
            });
        } catch (error) {
            console.error('Could not load the article:', error);
            $('post-body').innerHTML = '<p>Could not load the article text. Check your connection and try again.</p>';
        }
        $('post-body').removeAttribute('aria-busy');
    }

    load();
})();
