// Modern App JavaScript for The Bodyweight Gym

// ===== Global State =====
let workouts = [];
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'default';
const INITIAL_WORKOUTS_SHOWN = 6;
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
        applyInitialFilterFromUrl();
        renderWorkouts();
    } catch (error) {
        console.error('Error loading workouts:', error);
        const grid = document.getElementById('workoutsGrid');
        if (grid) grid.innerHTML = '<p class="workouts-error">Unable to load workouts. Please refresh the page.</p>';
    }
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
            ? 'No favourites yet. Tap the heart on a workout to save it here.'
            : 'No workouts match your search.'}</p>`;
    
    // Animate cards on load
    const cards = grid.querySelectorAll('.workout-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            requestAnimationFrame(() => {
                card.style.transition = 'all 0.5s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
        }, index * 50);
    });
    
    // Update load more button visibility
    const loadMoreBtn = document.querySelector('.load-more-wrapper button');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = workoutsToShow.length < filteredWorkouts.length ? 'block' : 'none';
    }
}

function createWorkoutCard(workout) {
    const levelClass = workout.level.toLowerCase().replace(' ', '-');
    const thumbnail = workout.thumbnail && !workout.thumbnail.includes('placeholder') 
        ? `background-image: url('${encodeURI(workout.thumbnail).replace(/'/g, '%27')}');`
        : `background: linear-gradient(135deg, #0088CC 0%, #00C4FF 100%);`;
    
    return `
        <div class="workout-card" onclick="playWorkout(${workout.id})">
            <div class="workout-thumbnail" style="${thumbnail}">
                ${!workout.thumbnail || workout.thumbnail.includes('placeholder') 
                    ? `<div class="workout-initial">${workout.instructor.split(' ')[1]?.[0] || 'W'}</div>` 
                    : ''}
                <div class="workout-duration">${workout.duration}</div>
                <button type="button" class="workout-fav${BWG.isFavourite(workout.id) ? ' active' : ''}"
                    onclick="toggleFavourite(event, ${workout.id})"
                    aria-pressed="${BWG.isFavourite(workout.id)}"
                    aria-label="${BWG.isFavourite(workout.id) ? 'Remove from favourites' : 'Add to favourites'}">${BWG.isFavourite(workout.id) ? '♥' : '♡'}</button>
                <div class="workout-play">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21"></polygon>
                    </svg>
                </div>
            </div>
            <div class="workout-info">
                <h3 class="workout-title">${workout.title}</h3>
                <div class="workout-meta">
                    <span class="workout-instructor">${workout.instructor}</span>
                    <span class="workout-level level-${levelClass}">${workout.level}</span>
                    ${workout.views > 0 ? `<span class="workout-views">${formatViews(workout.views)}</span>` : ''}
                    ${workout.startTimeFormatted ? `<span class="workout-start-time">⏰ ${workout.startTimeFormatted}</span>` : ''}
                </div>
                <p class="workout-description">${workout.description || 'Transform your body with this powerful workout.'}</p>
            </div>
        </div>
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
        
        // Show first 6 blog posts on homepage (or all if less than 6)
        const homeBlogPosts = blogs.slice(0, 6);
        renderHomeBlogPosts(homeBlogPosts, blogs.length);
    } catch (error) {
        console.error('Error loading blog posts:', error);
        blogGrid.innerHTML = `
            <div class="blog-error">
                <p>Unable to load articles. <a href="/blog">View all articles →</a></p>
            </div>
        `;
    }
}

function renderHomeBlogPosts(blogs, totalCount) {
    const blogGrid = document.getElementById('homeBlogGrid');
    
    blogGrid.innerHTML = blogs.map((blog, index) => `
        <article class="blog-card ${index === 0 ? 'featured' : ''}" onclick="window.location.href='${BWG.blogUrl(blog.slug)}'" style="animation-delay: ${index * 0.1}s">
            <div class="blog-image">
                <img src="${blog.image}" alt="${blog.title}" loading="lazy">
                <div class="blog-category-badge">${blog.category}</div>
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span class="blog-author">By ${blog.author}</span>
                    <span class="blog-divider">•</span>
                    <span class="blog-date">${formatBlogDate(blog.date)}</span>
                    <span class="blog-divider">•</span>
                    <span class="blog-read-time">${blog.readTime} read</span>
                </div>
                <h3 class="blog-title">${blog.title}</h3>
                <p class="blog-excerpt">${blog.excerpt}</p>
                <div class="blog-link">
                    Read Article
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        </article>
    `).join('');
    
    // Add post count indicator if there are more posts
    if (totalCount > blogs.length) {
        const remaining = totalCount - blogs.length;
        blogGrid.innerHTML += `
            <div class="blog-more-indicator">
                <p class="blog-more-text">+${remaining} more article${remaining > 1 ? 's' : ''} available</p>
            </div>
        `;
    }
}

function formatBlogDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// ===== Add Workout Card Styles =====
const workoutStyles = `
<style>
.workout-card {
    background: #161d2f;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.04);
    cursor: pointer;
    transition: all 0.4s;
    opacity: 0;
    transform: translateY(20px);
}

.workout-card:hover {
    transform: translateY(-3px);
    border-color: #2d8bc9;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.workout-thumbnail {
    position: relative;
    width: 100%;
    height: 200px;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.workout-initial {
    font-size: 3rem;
    font-weight: 700;
    color: white;
    opacity: 0.3;
}

.workout-duration {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.2rem 0.6rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.sort-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
    color: #94a3b8;
    font-size: 0.9rem;
}

.sort-select {
    min-height: 44px;
    padding: 0 0.75rem;
    background: #161d2f;
    color: #e2e8f0;
    border: 1px solid rgba(255, 255, 255, 0.08);
    font: inherit;
}

.workout-views {
    font-size: 0.75rem;
    color: #94a3b8;
}

.workout-fav {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 1.1rem;
    line-height: 1;
    cursor: pointer;
}

.workout-fav.active {
    color: #f87171;
}

.workouts-empty,
.workouts-error {
    grid-column: 1 / -1;
    text-align: center;
    color: #94a3b8;
    padding: 2rem 0;
}

.workout-play {
    position: absolute;
    bottom: 0.75rem;
    right: 0.75rem;
    width: 44px;
    height: 44px;
    background: #2d8bc9;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    opacity: 0;
}

.workout-card:hover .workout-play {
    opacity: 1;
    transform: scale(1.05);
}

.workout-play svg {
    width: 16px;
    height: 16px;
    margin-left: 2px;
    fill: white;
}

.workout-info {
    padding: 1.25rem;
}

.workout-title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: #e2e8f0;
    margin-bottom: 0.5rem;
    line-height: 1.3;
}

.workout-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.workout-instructor {
    font-size: 0.8rem;
    color: #94a3b8;
}

.workout-level {
    padding: 0.2rem 0.6rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.level-beginner,
.level-all-levels {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.2);
}

.level-intermediate {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.2);
}

.level-advanced {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.2);
}

.workout-description {
    font-size: 0.82rem;
    color: #94a3b8;
    line-height: 1.5;
}

.animate-in {
    animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 480px) {
    .workout-thumbnail { height: 180px; }
    .workout-info { padding: 1rem; }
    .workout-title { font-size: 0.95rem; }
    .workout-description { font-size: 0.8rem; -webkit-line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }
    .workout-meta { flex-wrap: wrap; gap: 0.5rem; }
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