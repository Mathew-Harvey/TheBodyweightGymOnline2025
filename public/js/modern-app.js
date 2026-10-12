// Modern App JavaScript for The Bodyweight Gym

// ===== Global State =====
let workouts = [];
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'default';
const INITIAL_WORKOUTS_SHOWN = 8;
let workoutsLoaded = INITIAL_WORKOUTS_SHOWN;

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    initializeAnimations();
    initializeNavigation();
    initializeVideoPlayer();
    initializeFilters();
    initializeSearch();
    initializeSort();
    loadWorkouts();
    loadHomeBlogPosts();
    animateStats();
    observeElements();
});

// ===== Animations =====
function initializeAnimations() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all animatable elements
    document.querySelectorAll('.principle-card, .blog-card, .story-content, .philosophy-text').forEach(el => {
        observer.observe(el);
    });
}

// ===== Navigation =====
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll
        if (currentScroll > lastScroll && currentScroll > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
    
    // Mobile menu toggle
    mobileToggle?.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        mobileMenu?.classList.toggle('active');
        document.body.style.overflow = mobileMenu?.classList.contains('active') ? 'hidden' : '';
    });
    
    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href?.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    // Close mobile menu if open
                    mobileMenu?.classList.remove('active');
                    mobileToggle?.classList.remove('active');
                    document.body.style.overflow = '';
                    
                    // Smooth scroll
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// ===== Video Player =====
function initializeVideoPlayer() {
    const videoFrame = document.getElementById('introVideoFrame');
    const videoOverlay = videoFrame?.querySelector('.video-overlay');
    
    videoOverlay?.addEventListener('click', playIntroVideo);
}

function playIntroVideo() {
    const videoFrame = document.getElementById('introVideoFrame');
    const iframe = videoFrame?.querySelector('iframe');
    const overlay = videoFrame?.querySelector('.video-overlay');
    
    if (iframe) {
        // Add autoplay parameter to URL
        const src = iframe.src;
        iframe.src = src.includes('?') ? src + '&autoplay=1' : src + '?autoplay=1';
        
        // Hide overlay with smooth transition
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }
}

// ===== Filters =====
function initializeFilters() {
    const filterPills = document.querySelectorAll('.filter-pill');
    
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Update active state
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            
            // Apply filter
            currentFilter = pill.dataset.filter;
            filterWorkouts();
        });
    });
}

// ===== Search =====
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    
    searchInput?.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        filterWorkouts();
    });
}

// ===== Sort =====
function initializeSort() {
    const select = document.getElementById('sortSelect');
    select?.addEventListener('change', () => {
        currentSort = select.value;
        filterWorkouts();
    });
}

// ===== Load Workouts =====
async function loadWorkouts() {
    try {
        workouts = await BWG.getVideos();
        fillStats(workouts);
        applyInitialFilterFromUrl();
        renderWorkouts();
    } catch (error) {
        console.error('Error loading workouts:', error);
        const grid = document.getElementById('workoutsGrid');
        if (grid) grid.innerHTML = '<p class="workouts-error">Unable to load workouts. Please refresh the page.</p>';
    }
}

function fillStats(videos) {
    const stats = BWG.computeStats(videos);
    document.querySelectorAll('[data-stat]').forEach(el => {
        const value = stats[el.dataset.stat === 'videos' ? 'totalVideos' : el.dataset.stat];
        if (value) el.textContent = value;
    });
}

// Supports links like /?filter=favourites#workouts (used by the PWA shortcuts)
function applyInitialFilterFromUrl() {
    const filter = new URLSearchParams(window.location.search).get('filter');
    const pill = filter && document.querySelector(`.filter-pill[data-filter="${CSS.escape(filter)}"]`);
    if (pill) pill.click();
}

function renderWorkouts() {
    const grid = document.getElementById('workoutsGrid');
    if (!grid) return;
    
    const filteredWorkouts = getFilteredWorkouts();
    const workoutsToShow = filteredWorkouts.slice(0, workoutsLoaded);
    
    grid.innerHTML = workoutsToShow.length
        ? workoutsToShow.map(workout => createWorkoutCard(workout)).join('')
        : `<p class="workouts-empty">${currentFilter === 'favourites' && !currentSearch
            ? 'Nothing saved yet. Tap the heart on a class to keep it here.'
            : 'No classes match your search.'}</p>`;
    
    // Update load more button visibility
    const loadMoreBtn = document.querySelector('.load-more-wrapper button');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = workoutsToShow.length < filteredWorkouts.length ? 'block' : 'none';
    }
}

// "Coach Corey - Handstand class" -> "Handstand class" (the coach is shown separately)
function displayTitle(workout) {
    const prefix = `${workout.instructor} - `;
    return workout.title.startsWith(prefix) ? workout.title.slice(prefix.length) : workout.title;
}

function createWorkoutCard(workout) {
    const esc = BWG.escapeHtml;
    const levelClass = workout.level.toLowerCase().replace(' ', '-');
    const fav = BWG.isFavourite(workout.id);
    const thumb = workout.thumbnail && !workout.thumbnail.includes('placeholder')
        ? `<img src="${esc(encodeURI(workout.thumbnail))}" alt="" width="350" height="200" loading="lazy" decoding="async">`
        : '';

    return `
        <article class="workout-card">
            <a class="workout-link" href="${BWG.videoUrl(workout.id)}">
                <div class="workout-thumbnail">
                    ${thumb}
                    <span class="workout-duration">${esc(workout.duration)}</span>
                    <span class="workout-play" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20"></polygon></svg>
                    </span>
                </div>
                <div class="workout-info">
                    <span class="workout-category">${esc(workout.category)}</span>
                    <h3 class="workout-title">${esc(displayTitle(workout))}</h3>
                    <div class="workout-meta">
                        <span class="workout-instructor">${esc(workout.instructor)}</span>
                        <span class="workout-level level-${levelClass}">${esc(workout.level)}</span>
                        ${workout.views > 0 ? `<span class="workout-views">${formatViews(workout.views)}</span>` : ''}
                    </div>
                </div>
            </a>
            <button type="button" class="workout-fav${fav ? ' active' : ''}"
                onclick="toggleFavourite(event, ${workout.id})"
                aria-pressed="${fav}"
                aria-label="${fav ? 'Remove from saved' : 'Save'}: ${esc(displayTitle(workout))}">${fav ? '&#9829;' : '&#9825;'}</button>
        </article>
    `;
}

function formatViews(views) {
    return `${Number(views).toLocaleString('en-US')} view${views === 1 ? '' : 's'}`;
}

function getFilteredWorkouts() {
    let filtered = [...workouts];
    
    // Apply category filter
    if (currentFilter !== 'all') {
        if (currentFilter === 'favourites') {
            const favourites = BWG.getFavourites();
            filtered = filtered.filter(w => favourites.includes(w.id));
        } else if (currentFilter === 'beginner') {
            filtered = filtered.filter(w => 
                w.level.toLowerCase().includes('beginner') || 
                w.level.toLowerCase().includes('all levels')
            );
        } else {
            filtered = filtered.filter(w => 
                w.category.toLowerCase() === currentFilter.toLowerCase()
            );
        }
    }
    
    // Apply search filter
    if (currentSearch) {
        filtered = filtered.filter(w => 
            w.title.toLowerCase().includes(currentSearch) ||
            w.instructor.toLowerCase().includes(currentSearch) ||
            w.category.toLowerCase().includes(currentSearch) ||
            w.level.toLowerCase().includes(currentSearch) ||
            (w.description && w.description.toLowerCase().includes(currentSearch))
        );
    }
    
    // Apply sort (stable, so ties keep the featured order)
    if (currentSort === 'rating') {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (currentSort === 'views') {
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return filtered;
}

function filterWorkouts() {
    workoutsLoaded = INITIAL_WORKOUTS_SHOWN; // Reset to initial load
    renderWorkouts();
}

function loadMoreWorkouts() {
    const filtered = getFilteredWorkouts();
    workoutsLoaded = filtered.length; // Show all (search/filter already runs across full list)
    renderWorkouts();
}

function playWorkout(workoutId) {
    window.location.href = BWG.videoUrl(workoutId);
}

function toggleFavourite(event, workoutId) {
    event.stopPropagation();
    BWG.toggleFavourite(workoutId);
    renderWorkouts();
}

// ===== Animate Stats =====
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseInt(element.dataset.count);
                animateNumber(element, target);
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

function animateNumber(element, target) {
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// ===== Scroll to Workouts =====
function scrollToWorkouts() {
    const workoutsSection = document.getElementById('workouts');
    if (workoutsSection) {
        workoutsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ===== Observe Elements for Animations =====
function observeElements() {
    const elements = document.querySelectorAll('[data-animate]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const animation = entry.target.dataset.animate;
                entry.target.classList.add(animation);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => observer.observe(el));
}

// ===== Blog Functions =====
async function loadHomeBlogPosts() {
    const blogGrid = document.getElementById('homeBlogGrid');
    if (!blogGrid) return;

    try {
        const blogs = await BWG.getBlogs();
        const latest = [...blogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
        const esc = BWG.escapeHtml;
        blogGrid.innerHTML = latest.map(blog => `
            <a class="post-card" href="${BWG.blogUrl(blog.slug)}">
                <img src="${esc(blog.image)}" alt="" loading="lazy" decoding="async">
                <div>
                    <small>${esc(blog.category)} &middot; ${esc(blog.readTime)} read</small>
                    <h3>${esc(blog.title)}</h3>
                    <p>${esc(blog.excerpt)}</p>
                </div>
            </a>
        `).join('');
    } catch (error) {
        console.error('Error loading blog posts:', error);
        blogGrid.innerHTML = '<p><a href="/blog">Read the blog</a></p>';
    }
}

// ===== Add Workout Card Styles =====
const workoutStyles = `
<style>
.workout-card {
    position: relative;
    background: var(--card);
    border: 1px solid var(--line);
    transition: transform 0.2s, border-color 0.2s;
}

.workout-card:hover { transform: translateY(-3px); border-color: rgba(255, 255, 255, 0.22); }

.workout-link { display: block; color: inherit; text-decoration: none; }
.workout-link:focus-visible { outline: 2px solid var(--orange); outline-offset: 2px; }

.workout-thumbnail {
    position: relative;
    aspect-ratio: 16 / 9;
    background: linear-gradient(135deg, #24262c, #16171b);
    overflow: hidden;
}

.workout-thumbnail img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.workout-card:hover .workout-thumbnail img { transform: scale(1.04); }

.workout-duration {
    position: absolute;
    right: 0.6rem;
    bottom: 0.6rem;
    padding: 0.15rem 0.5rem;
    background: rgba(0, 0, 0, 0.78);
    color: #fff;
    font-family: var(--font-display);
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.workout-play {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--orange);
    color: #111214;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.85);
    transition: opacity 0.2s, transform 0.2s;
}

.workout-play svg { width: 20px; height: 20px; margin-left: 3px; }
.workout-card:hover .workout-play,
.workout-link:focus-visible .workout-play { opacity: 1; transform: scale(1); }

.workout-fav {
    position: absolute;
    top: 0.6rem;
    left: 0.6rem;
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;
}

.workout-fav.active { color: var(--orange); }

.workout-info { padding: 1rem 1.1rem 1.2rem; }

.workout-category {
    font-family: var(--font-display);
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--orange);
}

.workout-title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.05;
    text-transform: uppercase;
    color: var(--text);
    margin: 0.2rem 0 0.6rem;
}

.workout-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem 0.75rem;
    font-size: 0.9rem;
    color: var(--sub);
}

.workout-level {
    padding: 0.1rem 0.5rem;
    font-family: var(--font-display);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: 1px solid currentColor;
}

.level-beginner, .level-all-levels { color: #5fd3a5; }
.level-intermediate { color: #f3b35a; }
.level-advanced { color: #ff8a80; }

.workouts-empty,
.workouts-error {
    grid-column: 1 / -1;
    text-align: center;
    color: var(--sub);
    padding: 2rem 0;
}

.sort-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--sub);
    font-size: 0.95rem;
}

.sort-select {
    min-height: 44px;
    padding: 0 0.75rem;
    background: var(--card);
    color: var(--text);
    border: 1px solid var(--line);
    border-radius: 4px;
    font: inherit;
}
</style>
`;

// Inject workout styles
document.head.insertAdjacentHTML('beforeend', workoutStyles);

// ===== Make functions globally available =====
window.playIntroVideo = playIntroVideo;
window.scrollToWorkouts = scrollToWorkouts;
window.loadMoreWorkouts = loadMoreWorkouts;
window.playWorkout = playWorkout;
window.toggleFavourite = toggleFavourite;