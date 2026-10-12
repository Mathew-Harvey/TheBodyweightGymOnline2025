// Book page behaviour: Amazon buttons, click-to-load YouTube videos, email signup.
// Settings live in /js/books-config.js (load it first).

(function () {
    const config = window.BWG_BOOKS;
    if (!config) return;

    // Only real Amazon store URLs become links; anything else (TODO, typos, shorteners) stays disabled.
    const AMAZON_URL = /^https:\/\/(www\.)?amazon\.(com|com\.au|co\.uk|ca|de|fr|es|it|nl|co\.jp|in|com\.mx|com\.br)\//;

    function isAustralia() {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            if (tz.startsWith('Australia/')) return true;
        } catch (e) { /* ignore */ }
        return /-AU$/i.test(navigator.language || '');
    }

    function amazonUrl(bookId, format) {
        const urls = config.books[bookId]?.urls?.[format];
        if (!urls) return null;
        if (isAustralia() && AMAZON_URL.test(urls.au)) return urls.au;
        return AMAZON_URL.test(urls.us) ? urls.us : null;
    }

    // <span class="btn-buy is-disabled" data-buy="handstand:kindle" data-label="Get the Kindle ebook">...</span>
    function initBuyButtons() {
        document.querySelectorAll('[data-buy]').forEach((el) => {
            const [bookId, format] = el.dataset.buy.split(':');
            const url = amazonUrl(bookId, format);
            if (!url) return; // keep the static "coming soon" state
            const link = document.createElement('a');
            link.className = el.className.replace('is-disabled', '').trim();
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = el.dataset.label;
            el.replaceWith(link);
        });
    }

    // <button class="yt-lite" data-yt="VIDEO_ID" aria-label="Play video: ...">thumbnail</button>
    function initVideos() {
        document.querySelectorAll('.yt-lite[data-yt]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.yt;
                if (!/^[\w-]{11}$/.test(id)) return;
                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
                iframe.title = btn.getAttribute('aria-label')?.replace(/^Play video: /, '') || 'YouTube video';
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
                iframe.allowFullscreen = true;
                iframe.referrerPolicy = 'strict-origin-when-cross-origin';
                iframe.className = 'yt-lite-frame';
                btn.replaceWith(iframe);
            });
        });
    }

    // <div class="signup" data-signup>static fallback</div>
    function initSignup() {
        const { mode, email, formspreeId, subject } = config.signup || {};
        document.querySelectorAll('[data-signup]').forEach((box) => {
            const target = box.querySelector('.signup-action');
            if (!target) return;

            if (mode === 'formspree' && /^[A-Za-z0-9]+$/.test(formspreeId || '') && formspreeId !== 'TODO') {
                target.innerHTML = `
                    <form class="signup-form" action="https://formspree.io/f/${formspreeId}" method="POST">
                        <input type="hidden" name="_subject" value="">
                        <label class="visually-hidden" for="signup-email-${box.dataset.signup || 'x'}">Email address</label>
                        <input class="signup-input" id="signup-email-${box.dataset.signup || 'x'}" type="email" name="email" required placeholder="you@example.com" autocomplete="email">
                        <button class="btn-primary signup-button" type="submit">Tell me about new books</button>
                    </form>`;
                target.querySelector('input[name="_subject"]').value = subject;
            } else if (mode === 'mailto' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email || '')) {
                const href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
                target.innerHTML = '<a class="btn-primary signup-button"></a>';
                target.firstChild.href = href;
                target.firstChild.textContent = 'Email me about new books';
            }
            // otherwise keep the static "coming soon" note
        });
    }

    // Phones: show the sticky buy bar once the main buy buttons have scrolled out of view.
    function initBuyBar() {
        const bar = document.querySelector('.buy-bar');
        const target = document.getElementById('buy');
        if (!bar || !target || !('IntersectionObserver' in window)) return;
        new IntersectionObserver(([entry]) => {
            const below = entry.boundingClientRect.top < 0;
            const show = !entry.isIntersecting && below;
            bar.classList.toggle('is-visible', show);
            bar.setAttribute('aria-hidden', String(!show));
            bar.querySelector('a')?.setAttribute('tabindex', show ? '0' : '-1');
        }).observe(target);
        bar.querySelector('a')?.addEventListener('click', (e) => {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    function init() {
        initBuyBar();
        initBuyButtons();
        initVideos();
        initSignup();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
