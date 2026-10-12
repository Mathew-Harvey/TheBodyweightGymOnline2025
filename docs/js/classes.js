// /classes: filter, search, sort and save. The rows are already in the page (scripts/build-pages.js
// renders every playable class), so this only shows, hides and reorders them. Saved classes use
// the favourites in localStorage (BWG.toggleFavourite), so they survive a reload.

(function () {
    const list = document.getElementById('library');
    if (!list || !window.BWG) return;

    const rows = [...list.querySelectorAll('.class-row')];
    const filterButtons = [...document.querySelectorAll('[data-filter]')];
    const search = document.getElementById('search');
    const sort = document.getElementById('sort');
    const results = document.getElementById('results');
    const empty = document.getElementById('empty');
    const showAll = document.getElementById('show-all');
    const showCount = document.getElementById('show-count');

    const LIMIT = 12;
    const CATEGORIES = ['strength', 'mobility', 'skills', 'conditioning'];
    const ALIASES = { favourites: 'saved', favorites: 'saved' };
    const SORTS = {
        views: { label: 'most viewed first', fn: (a, b) => b.dataset.views - a.dataset.views || a.dataset.id - b.dataset.id },
        shortest: { label: 'shortest first', fn: (a, b) => a.dataset.minutes - b.dataset.minutes || b.dataset.views - a.dataset.views },
        longest: { label: 'longest first', fn: (a, b) => b.dataset.minutes - a.dataset.minutes || b.dataset.views - a.dataset.views }
    };

    const params = new URLSearchParams(location.search);
    let filter = ALIASES[params.get('filter')] || params.get('filter') || 'all';
    if (filter !== 'saved' && !CATEGORIES.includes(filter)) filter = 'all';
    let expanded = false;

    const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 'es'}`;

    function renderSave(button, on) {
        button.setAttribute('aria-pressed', String(on));
        button.firstChild.textContent = on ? 'Saved' : 'Save';
    }

    function syncSaved() {
        const saved = new Set(BWG.getFavourites().map(String));
        rows.forEach((row) => renderSave(row.querySelector('[data-save]'), saved.has(row.dataset.id)));
    }

    function order() {
        const sorter = SORTS[sort.value] || SORTS.views;
        rows.sort(sorter.fn);
        list.append(...rows);
    }

    function apply({ focusFrom = -1 } = {}) {
        const words = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
        const saved = new Set(BWG.getFavourites().map(String));
        const matches = rows.filter((row) => {
            if (filter === 'saved' && !saved.has(row.dataset.id)) return false;
            if (CATEGORIES.includes(filter) && row.dataset.category !== filter) return false;
            return words.every((w) => row.dataset.text.includes(w));
        });
        const shown = new Set(expanded ? matches : matches.slice(0, LIMIT));
        rows.forEach((row) => { row.hidden = !shown.has(row); });
        list.classList.add('is-ready');

        filterButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));

        // One sentence describing what is on screen.
        const kind = filter === 'saved' ? 'saved class' : CATEGORIES.includes(filter) ? `${filter} class` : 'class';
        let text = plural(matches.length, kind);
        if (words.length) text += ` matching “${search.value.trim()}”`;
        if (matches.length > 1) text += `, ${SORTS[sort.value]?.label || SORTS.views.label}`;
        results.textContent = text;

        empty.hidden = matches.length > 0;
        if (!matches.length) {
            empty.textContent = filter === 'saved' && !saved.size
                ? 'Nothing saved yet. Press Save on any class to keep it here.'
                : 'No classes match. Try another word or show all classes.';
        }

        showAll.hidden = expanded || matches.length <= LIMIT;
        showCount.textContent = matches.length;

        if (focusFrom >= 0) matches[focusFrom]?.querySelector('a')?.focus();
    }

    function setFilter(next) {
        filter = next;
        const url = filter === 'all' ? location.pathname : `${location.pathname}?filter=${filter}`;
        history.replaceState(null, '', url);
        apply();
    }

    filterButtons.forEach((b) => b.addEventListener('click', () => setFilter(b.dataset.filter)));
    search.addEventListener('input', () => apply());
    sort.addEventListener('change', () => { order(); apply(); });
    showAll.addEventListener('click', () => { expanded = true; apply({ focusFrom: LIMIT }); });

    list.addEventListener('click', (e) => {
        const button = e.target.closest('[data-save]');
        if (!button) return;
        renderSave(button, BWG.toggleFavourite(button.dataset.save));
    });

    // Another tab changed the saved list.
    window.addEventListener('storage', (e) => { if (e.key === 'bwg:favourites') { syncSaved(); apply(); } });

    syncSaved();
    order();
    apply();
})();
