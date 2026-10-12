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

    // The markdown came from the old Wix blog. Tidy it for this layout.
    function clean(md) {
        let s = md
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
        return s
            .replace(/^\*(?:By\s|Writer:|Published:|Reading Time:|Updated:|Last Updated:).+\*\s*$/gm, '')
            .replace(/^\*\*?\d+\s*min\s*read\*\*?\s*$/gm, '');
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
        $('post-body').innerHTML = `<p>${esc(text)} <a href="/blog">See all articles</a>.</p>`;
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
            photo.innerHTML = `<img src="${post.image}-480.webp" srcset="${post.image}-320.webp 320w, ${post.image}-480.webp 480w" sizes="(max-width: 860px) 100vw, 440px" width="480" height="320" alt="" decoding="async">`;
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
            const res = await fetch(post.file);
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
        } catch (error) {
            console.error('Could not load the article:', error);
            $('post-body').innerHTML = '<p>Could not load the article text. Check your connection and try again.</p>';
        }
        $('post-body').removeAttribute('aria-busy');
    }

    load();
})();
