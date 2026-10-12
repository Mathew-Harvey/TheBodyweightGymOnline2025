// /video?id=: one class. Reads videos.json, then fills in the poster (the player loads on
// click, see site.js), the details, three more classes of the same type and the matching book.

(function () {
    if (!window.BWG) return;
    const esc = BWG.escapeHtml;
    const url = BWG.url;
    const $ = (id) => document.getElementById(id);
    const id = new URLSearchParams(location.search).get('id');

    // Same rules as scripts/build-pages.js: only Mat Harvey is named on the site.
    const displayTitle = (v) => v.title.replace(/^[^-]+ - /, '');
    const minutes = (v) => parseInt(v.duration, 10) || 0;
    const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

    function classRow(v) {
        const img = url(`/images/classes/${v.id}`);
        return `<li class="row class-row" data-reveal>
            <a class="row__link" href="${BWG.videoUrl(v.id)}">
                <span class="class-row__thumb"><img src="${img}-400.webp" srcset="${img}-400.webp 400w, ${img}-800.webp 800w" sizes="(max-width: 760px) 120px, 240px" width="400" height="225" alt="" loading="lazy" decoding="async"></span>
                <span class="label class-row__meta"><span>${esc(v.category)}</span><span>${minutes(v)} min · ${esc(v.level)}</span></span>
                <h3 class="display class-row__title">${esc(displayTitle(v))}</h3>
                <span class="row__arrow" aria-hidden="true"></span>
            </a>
        </li>`;
    }

    // Point viewers of a class at the book for the matching skill.
    const BOOKS = {
        handstand: { key: 'handstand', title: 'The Handstand', tone: 'orange', url: url('/books/handstand'), cover: url('/images/books/handstand-cover'), alt: 'Cover of The Handstand by Mat Harvey', line: 'Six levels to a 60 second freestanding handstand.' },
        muscleup: { key: 'muscleup', title: 'The Ring Muscle Up', tone: 'teal', url: url('/books/ring-muscle-up'), cover: url('/images/books/muscleup-cover'), alt: 'Cover of The Ring Muscle Up by Mat Harvey', line: 'Six levels to a strict ring muscle up, with no kipping.' }
    };

    function cover(book) {
        return `<picture>
            <source type="image/webp" srcset="${book.cover}-400.webp">
            <img src="${book.cover}-400.jpg" width="400" height="640" alt="${esc(book.alt)}" loading="lazy" decoding="async">
        </picture>`;
    }

    function renderBook(v) {
        const text = `${v.title} ${v.category}`;
        const picks = /handstand/i.test(text) ? [BOOKS.handstand]
            : /muscle ?up|ring|pull/i.test(text) ? [BOOKS.muscleup]
            : [BOOKS.handstand, BOOKS.muscleup];
        const one = picks.length === 1 ? picks[0] : null;
        const href = one ? one.url : url('/books/');
        const box = $('video-book');
        box.className = `video-book ruled${one ? ` book--${one.tone}` : ''}`;
        box.innerHTML = `
            <a class="video-book__covers" href="${href}" tabindex="-1" aria-hidden="true">${picks.map(cover).join('')}</a>
            <div class="video-book__text">
                <p class="label${one ? ' book-num' : ''}">Want the full plan</p>
                <h2 class="display t-h3 video-book__title" id="book-title">${one ? esc(one.title) : 'The Bodyweight Skills books'}</h2>
                <p class="statement statement--s video-book__line">${one ? esc(one.line) : 'Two books by Mat Harvey, one skill each: the handstand and the ring muscle up. Six levels per book.'}</p>
                <div class="actions"><a class="arrow" href="${href}"><span>${one ? 'See the book' : 'See the books'}</span></a></div>
            </div>`;
        box.hidden = false;
    }

    function renderSave(v) {
        const button = $('video-save');
        const draw = (on) => {
            button.setAttribute('aria-pressed', String(on));
            button.textContent = on ? 'Saved' : 'Save this class';
        };
        draw(BWG.isFavourite(v.id));
        button.hidden = false;
        button.addEventListener('click', () => draw(BWG.toggleFavourite(v.id)));
    }

    function renderMore(v, videos) {
        const more = videos
            .filter((x) => x.id !== v.id && x.category === v.category && BWG.hasYoutubeId(x))
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 3);
        if (!more.length) return;
        $('more-title').textContent = `More ${v.category.toLowerCase()} classes`;
        $('more-rows').innerHTML = more.map(classRow).join('');
        $('video-more').hidden = false;
        window.BWGReveal?.($('video-more'));
    }

    function message(title, text) {
        $('player').innerHTML = `<div class="facade facade--empty"><p class="label facade__note">${esc(title)}</p></div>`;
        $('video-label').textContent = 'Free classes';
        $('video-title').textContent = title;
        $('video-desc').innerHTML = `${esc(text)} <a href="${url('/classes')}">See all classes</a>.`;
    }

    async function load() {
        let videos;
        try {
            videos = await BWG.getVideos();
        } catch (error) {
            console.error('Could not load the class list:', error);
            message('Could not load this class', 'Check your connection and try again.');
            return;
        }
        const v = videos.find((x) => String(x.id) === id);
        if (!v) {
            message('Class not found', 'It may have moved when the site was rebuilt.');
            return;
        }

        const title = displayTitle(v);
        document.title = `${title} | Free class | The Bodyweight Gym`;
        document.querySelector('meta[name="description"]')?.setAttribute('content', `A ${minutes(v)} minute ${v.category.toLowerCase()} class streamed live from The Bodyweight Gym, Perth, in 2020. Free, no account, no ads.`);
        $('video-label').textContent = `${v.category} · ${minutes(v)} min · ${v.level}`;
        $('video-title').textContent = title;

        if (!BWG.hasYoutubeId(v)) {
            $('player').innerHTML = '<div class="facade facade--empty"><p class="label facade__note">Not on YouTube yet</p></div>';
            $('video-desc').innerHTML = `This class has not been uploaded yet. <a href="${url('/classes')}">See the classes you can watch now</a>.`;
            renderBook(v);
            return;
        }

        const img = url(`/images/classes/${v.id}`);
        $('player').innerHTML = `
            <button class="facade" type="button" data-yt="${esc(v.youtubeId)}" data-start="${Math.floor(v.startTime || 0)}" data-title="${esc(title)}">
                <img src="${img}-800.webp" srcset="${img}-400.webp 400w, ${img}-800.webp 800w" sizes="(max-width: 1248px) 100vw, 1200px" width="800" height="450" alt="" fetchpriority="high">
                <span class="label facade__play">Play · ${minutes(v)} min<span class="visually-hidden">: ${esc(title)}</span></span>
            </button>`;
        $('video-desc').textContent = 'Streamed live from the gym floor in 2020.'
            + (v.startTime > 0 ? ` Playback starts at ${clock(v.startTime)} to skip the intro.` : '');

        renderSave(v);
        renderMore(v, videos);
        renderBook(v);
    }

    load();
})();
