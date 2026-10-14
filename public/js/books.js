// Books behaviour: Amazon buttons, the email signup and the sticky buy bar on phones.
// Settings live in /js/books-config.js (load it first). Click-to-play videos are in site.js.

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

    function amazonLink(bookId, format) {
        const urls = config.books[bookId]?.urls?.[format];
        if (!urls) return null;
        if (isAustralia() && AMAZON_URL.test(urls.au)) return { url: urls.au, au: true };
        return AMAZON_URL.test(urls.us) ? { url: urls.us, au: false } : null;
    }

    // <span class="label buy__soon" data-buy="handstand:kindle" data-class="btn"
    //       data-label="Kindle US$4.99" data-label-au="Kindle A$7.99">Kindle US$4.99 · coming soon</span>
    // becomes a real link once books-config.js has the Amazon URL. Until then it stays as is.
    // scripts/build-pages.js already writes the amazon.com link into the page when the URL is
    // set, so here that only changes for Australian visitors (amazon.com.au, A$ label).
    function initBuyButtons() {
        document.querySelectorAll('[data-buy]').forEach((el) => {
            const [bookId, format] = el.dataset.buy.split(':');
            const link = amazonLink(bookId, format);
            if (!link) return;
            const label = (link.au && el.dataset.labelAu) || el.dataset.label;
            if (el.tagName === 'A') {                       // already a link: just point it at the right store
                el.href = link.url;
                (el.querySelector('span') || el).textContent = label;
                return;
            }
            const a = document.createElement('a');
            a.className = el.dataset.class || 'btn';
            a.href = link.url;
            a.target = '_blank';
            a.rel = 'noopener';
            const text = document.createElement('span');
            text.textContent = label;
            a.append(text);
            el.replaceWith(a);
        });
    }

    // <div data-signup> ... <div class="signup-action">fallback note</div></div>
    function initSignup() {
        const { mode, email, formspreeId, subject } = config.signup || {};
        document.querySelectorAll('[data-signup]').forEach((box) => {
            const target = box.querySelector('.signup-action');
            if (!target) return;
            const key = box.dataset.signup || 'signup';

            if (mode === 'formspree' && /^[A-Za-z0-9]+$/.test(formspreeId || '') && formspreeId !== 'TODO') {
                target.innerHTML = `
                    <form class="signup-form" action="https://formspree.io/f/${formspreeId}" method="POST">
                        <input type="hidden" name="_subject" value="">
                        <label class="field">
                            <span class="visually-hidden">Email address</span>
                            <input id="signup-email-${key}" type="email" name="email" required placeholder="Your email" autocomplete="email">
                        </label>
                        <button class="btn" type="submit">Tell me</button>
                    </form>`;
                target.querySelector('input[name="_subject"]').value = subject;
            } else if (mode === 'mailto' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email || '')) {
                const a = document.createElement('a');
                a.className = 'btn';
                a.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
                a.textContent = 'Email me about new books';
                target.replaceChildren(a);
            }
            // otherwise keep the static "coming soon" note
        });
    }

    // Phones: show the sticky buy bar once the main buy buttons have scrolled out of view.
    function initBuyBar() {
        const bar = document.querySelector('.buy-bar');
        const target = document.getElementById('buy');
        if (!bar || !target || !('IntersectionObserver' in window)) return;
        const link = bar.querySelector('a');
        new IntersectionObserver(([entry]) => {
            const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
            bar.classList.toggle('is-visible', show);
            bar.setAttribute('aria-hidden', String(!show));
            link?.setAttribute('tabindex', show ? '0' : '-1');
        }).observe(target);
        link?.addEventListener('click', (e) => {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    function init() {
        initBuyBar();
        initBuyButtons();
        initSignup();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
