// Shared data helpers for The Bodyweight Gym (static site: JSON files + localStorage, no backend).

(function () {
    const FAVOURITES_KEY = 'bwg:favourites';

    const cache = {};
    function loadJson(path) {
        if (!cache[path]) {
            cache[path] = fetch(path).then((res) => {
                if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
                return res.json();
            });
            cache[path].catch(() => { delete cache[path]; });
        }
        return cache[path];
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (c) => (
            { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
        ));
    }

    // ---- Favourites (localStorage; falls back to memory if storage is blocked) ----
    let memoryFavourites = [];

    function getFavourites() {
        try {
            const ids = JSON.parse(localStorage.getItem(FAVOURITES_KEY) || '[]');
            return Array.isArray(ids) ? ids : [];
        } catch (e) {
            return memoryFavourites;
        }
    }

    function saveFavourites(ids) {
        memoryFavourites = ids;
        try {
            localStorage.setItem(FAVOURITES_KEY, JSON.stringify(ids));
        } catch (e) { /* storage unavailable: keep in memory for this page view */ }
    }

    function isFavourite(id) {
        return getFavourites().includes(Number(id));
    }

    // Returns the new state (true = now a favourite).
    function toggleFavourite(id) {
        id = Number(id);
        const ids = getFavourites();
        const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
        saveFavourites(next);
        return next.includes(id);
    }

    // ---- Stats (computed in the browser from videos.json) ----
    function computeStats(videos) {
        const minutes = videos.reduce((sum, v) => sum + (parseInt(v.duration, 10) || 0), 0);
        return {
            totalVideos: videos.length,
            totalHours: Math.round(minutes / 60),
            categories: new Set(videos.map((v) => v.category)).size,
            instructors: new Set(videos.map((v) => v.instructor)).size
        };
    }

    // The site root: empty on a custom domain, "/<repo>" when GitHub Pages serves the site from
    // <owner>.github.io/<repo>. The page head defines window.BWG_BASE and scripts/prepare-pages.js
    // sets it at deploy. Every URL a script builds must go through url(), never a bare "/path".
    const BASE = window.BWG_BASE || '';
    const url = (path) => BASE + path;

    window.BWG = {
        url,
        getVideos: () => loadJson(url('/data/videos.json')),
        getCategories: () => loadJson(url('/data/categories.json')),
        getInstructors: () => loadJson(url('/data/instructors.json')),
        getBlogs: () => loadJson(url('/data/blogs.json')),
        getFavourites,
        isFavourite,
        toggleFavourite,
        computeStats,
        escapeHtml,
        videoUrl: (id) => url(`/video?id=${encodeURIComponent(id)}`),
        blogUrl: (slug) => url(`/blog/post?slug=${encodeURIComponent(slug)}`),
        hasYoutubeId: (v) => /^[\w-]{11}$/.test(v.youtubeId || '')
    };
})();
