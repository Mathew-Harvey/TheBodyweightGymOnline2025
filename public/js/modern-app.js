// Modern App JavaScript for The Bodyweight Gym

// ===== Global State =====
let workouts = [];
let currentFilter = 'all';
let currentSearch = '';
let workoutsLoaded = 12;

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    initializeAnimations();
    initializeNavigation();
    initializeVideoPlayer();
    initializeFilters();
    initializeSearch();
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
        
        // Hide overlay
        if (overlay) {
            overlay.style.display = 'none';
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

// ===== Load Workouts =====
async function loadWorkouts() {
    try {
        const response = await fetch('/api/videos');
        workouts = await response.json();
        renderWorkouts();
    } catch (error) {
        console.error('Error loading workouts:', error);
        // Fallback: Create sample workouts
        workouts = generateSampleWorkouts();
        renderWorkouts();
    }
}

function generateSampleWorkouts() {
    const categories = ['Strength', 'Mobility', 'Skills', 'Flexibility', 'Endurance'];
    const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
    const coaches = ['Coach Corey', 'Coach Maisie', 'Coach Kelvin', 'Coach Oscar', 'Coach Ray'];
    const sampleWorkouts = [];
    
    for (let i = 1; i <= 30; i++) {
        sampleWorkouts.push({
            id: i,
            title: `Workout ${i}: ${categories[i % categories.length]} Training`,
            instructor: coaches[i % coaches.length],
            category: categories[i % categories.length],
            level: levels[i % levels.length],
            duration: `${20 + Math.floor(Math.random() * 40)} min`,
            thumbnail: `/images/thumbnails/placeholder.jpg`,
            description: `A comprehensive ${categories[i % categories.length].toLowerCase()} workout suitable for ${levels[i % levels.length].toLowerCase()} practitioners.`
        });
    }
    
    return sampleWorkouts;
}

function renderWorkouts() {
    const grid = document.getElementById('workoutsGrid');
    if (!grid) return;
    
    const filteredWorkouts = getFilteredWorkouts();
    const workoutsToShow = filteredWorkouts.slice(0, workoutsLoaded);
    
    grid.innerHTML = workoutsToShow.map(workout => createWorkoutCard(workout)).join('');
    
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
        ? `background-image: url('${workout.thumbnail}');`
        : `background: linear-gradient(135deg, #0088CC 0%, #00C4FF 100%);`;
    
    return `
        <div class="workout-card" onclick="playWorkout(${workout.id})">
            <div class="workout-thumbnail" style="${thumbnail}">
                ${!workout.thumbnail || workout.thumbnail.includes('placeholder') 
                    ? `<div class="workout-initial">${workout.instructor.split(' ')[1]?.[0] || 'W'}</div>` 
                    : ''}
                <div class="workout-duration">${workout.duration}</div>
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
                    ${workout.startTimeFormatted ? `<span class="workout-start-time">⏰ ${workout.startTimeFormatted}</span>` : ''}
                </div>
                <p class="workout-description">${workout.description || 'Transform your body with this powerful workout.'}</p>
            </div>
        </div>
    `;
}

function getFilteredWorkouts() {
    let filtered = [...workouts];
    
    // Apply category filter
    if (currentFilter !== 'all') {
        if (currentFilter === 'beginner') {
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
    
    return filtered;
}

function filterWorkouts() {
    workoutsLoaded = 12; // Reset to initial load
    renderWorkouts();
}

function loadMoreWorkouts() {
    workoutsLoaded += 12;
    renderWorkouts();
}

function playWorkout(workoutId) {
    window.location.href = `/video?id=${workoutId}`;
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
        const response = await fetch('/api/blogs');
        const blogs = await response.json();
        
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
        <article class="blog-card ${index === 0 ? 'featured' : ''}" onclick="window.location.href='/blog/${blog.id}'" style="animation-delay: ${index * 0.1}s">
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
    background: white;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    transform: translateY(20px);
}

.workout-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
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
    opacity: 0.5;
}

.workout-duration {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.25rem 0.75rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
}

.workout-play {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    width: 48px;
    height: 48px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    opacity: 0;
}

.workout-card:hover .workout-play {
    opacity: 1;
    transform: scale(1.1);
}

.workout-play svg {
    width: 18px;
    height: 18px;
    margin-left: 2px;
    fill: #0088CC;
}

.workout-info {
    padding: 1.5rem;
}

.workout-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1A1A1C;
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
    font-size: 0.875rem;
    color: #71717A;
}

.workout-level {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.level-beginner,
.level-all-levels {
    background: #E8F5E9;
    color: #2E7D32;
}

.level-intermediate {
    background: #FFF3E0;
    color: #E65100;
}

.level-advanced {
    background: #FFEBEE;
    color: #C62828;
}

.workout-description {
    font-size: 0.875rem;
    color: #71717A;
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
</style>
`;

// Inject workout styles
document.head.insertAdjacentHTML('beforeend', workoutStyles);

// ===== Make functions globally available =====
window.playIntroVideo = playIntroVideo;
window.scrollToWorkouts = scrollToWorkouts;
window.loadMoreWorkouts = loadMoreWorkouts;
window.playWorkout = playWorkout;