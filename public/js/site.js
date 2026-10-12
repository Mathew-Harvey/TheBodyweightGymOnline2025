// Site-wide behaviour: the mobile menu, scroll reveals, the hero parallax and click-to-play videos.
// Motion follows docs/DESIGN_BRIEF.md 4.5: rare, physical, off for reduced motion.

(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Mobile menu: full-screen panel, Esc or Close to dismiss, focus kept inside ----
    const menu = document.getElementById('menu');
    const openBtn = document.querySelector('.nav__menu[aria-controls="menu"]');
    if (menu && openBtn) {
        const closeBtn = menu.querySelector('[data-menu-close]');
        const focusables = () => [...menu.querySelectorAll('a, button')];
        const close = () => {
            menu.hidden = true;
            openBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            openBtn.focus();
        };
        openBtn.addEventListener('click', () => {
            menu.hidden = false;
            openBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            (closeBtn || focusables()[0]).focus();
        });
        closeBtn?.addEventListener('click', close);
        menu.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
        menu.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
            if (e.key !== 'Tab') return;
            const f = focusables();
            if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
            else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        });
    }

    // ---- Reveal images and rows once, when 15% visible ----
    const reveal = (root = document) => {
        const items = root.querySelectorAll('[data-reveal]:not(.is-in)');
        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach((el) => el.classList.add('is-in'));
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        items.forEach((el) => io.observe(el));
    };
    reveal();
    // Other scripts call this after adding rows.
    window.BWGReveal = reveal;

    // ---- Click-to-play video: a poster button until pressed, then the youtube-nocookie player ----
    // <button class="facade" data-yt="VIDEO_ID" data-start="300" data-title="...">poster, PLAY label</button>
    // In a .demo-row the row opens to full width first, so the video plays at a useful size.
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.facade[data-yt]');
        if (!btn || !/^[\w-]{11}$/.test(btn.dataset.yt)) return;
        const params = new URLSearchParams({ autoplay: '1', rel: '0' });
        const start = Math.floor(Number(btn.dataset.start) || 0);
        if (start > 0) params.set('start', String(start));
        const iframe = document.createElement('iframe');
        iframe.className = 'player-frame';
        iframe.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.yt}?${params}`;
        iframe.title = btn.dataset.title || 'Video';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        btn.closest('.demo-row')?.classList.add('is-playing');
        btn.replaceWith(iframe);
        iframe.focus();
    });

    // Old links into the home page's class list (/?filter=favourites#workouts) now go to /classes.
    if (location.pathname === '/' && new URLSearchParams(location.search).has('filter')) {
        location.replace(`/classes${location.search}`);
    }

    // ---- Hero parallax: at most 6% of the photo's height ----
    const photo = document.querySelector('[data-parallax] img');
    if (photo && !reduceMotion) {
        const band = photo.closest('section');
        let ticking = false;
        const update = () => {
            ticking = false;
            const rect = band.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight) return;
            const progress = Math.min(1, Math.max(0, -rect.top / rect.height));
            photo.style.transform = `translate3d(0, ${(progress * 6).toFixed(2)}%, 0) scale(1.06)`;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        update();
    }
})();
