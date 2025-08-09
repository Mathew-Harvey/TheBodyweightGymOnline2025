// Ebook App JavaScript for The Bodyweight Gym

// ===== Global State =====
let currentPdf = null;
let currentPage = 1;
let totalPages = 1;
let currentEbook = null;
let currentZoom = 1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

// ===== Ebook Data =====
const ebooks = [
    {
        id: 'ring-muscle-up',
        title: 'Ring Muscle Up Program',
        description: 'A comprehensive guide to mastering the ring muscle up, including progressions, regressions, and programming.',
        filename: 'Ring Muscle Up Program.pdf',
        filepath: '/ebook/Ring Muscle Up Program.pdf',
        thumbnail: '/images/handring.png',
        coverColor: '#0088CC',
        coverIcon: 'rings',
        category: 'Strength Training',
        pages: '50+',
        size: '4.6MB'
    },
    {
        id: 'handstand-guide',
        title: 'The Handstand - Complete Training Guide',
        description: 'Everything you need to know about handstand training, from beginner to advanced techniques.',
        filename: 'The handstand - complete training guide .pdf',
        filepath: '/ebook/The handstand - complete training guide .pdf',
        thumbnail: '/images/handring.png',
        coverColor: '#00BFA5',
        coverIcon: 'handstand',
        category: 'Skill Training',
        pages: '40+',
        size: '3.4MB'
    }
];

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    initializeEbooks();
    initializeNavigation();
    initializePdfModal();
});

// ===== Initialize Ebooks =====
function initializeEbooks() {
    const ebookGrid = document.getElementById('ebookGrid');
    if (!ebookGrid) return;

    ebookGrid.innerHTML = ebooks.map(ebook => createEbookCard(ebook)).join('');
}

// ===== Create Ebook Card =====
function createEbookCard(ebook) {
    // Create cover design based on ebook type
    const coverDesign = ebook.coverIcon === 'rings' ? `
        <div class="ebook-cover-design" style="background: linear-gradient(135deg, ${ebook.coverColor}, ${ebook.coverColor}dd);">
            <div class="ebook-cover-pattern"></div>
            <svg class="ebook-cover-icon" viewBox="0 0 100 100" fill="none" stroke="white" stroke-width="2">
                <!-- Gymnastic Rings -->
                <circle cx="30" cy="40" r="15" stroke-width="3"/>
                <circle cx="70" cy="40" r="15" stroke-width="3"/>
                <line x1="30" y1="25" x2="30" y2="5" stroke-width="2"/>
                <line x1="70" y1="25" x2="70" y2="5" stroke-width="2"/>
                <path d="M20 60 Q30 70 40 60 T60 60 Q70 70 80 60" stroke-width="2" fill="none"/>
            </svg>
            <div class="ebook-cover-text">
                <div class="ebook-cover-title">Ring Muscle Up</div>
                <div class="ebook-cover-subtitle">Training Program</div>
            </div>
        </div>
    ` : `
        <div class="ebook-cover-design" style="background: linear-gradient(135deg, ${ebook.coverColor}, ${ebook.coverColor}dd);">
            <div class="ebook-cover-pattern"></div>
            <svg class="ebook-cover-icon" viewBox="0 0 100 100" fill="none" stroke="white" stroke-width="2">
                <!-- Handstand figure -->
                <circle cx="50" cy="70" r="8" stroke-width="3"/>
                <line x1="50" y1="62" x2="50" y2="30" stroke-width="3"/>
                <line x1="50" y1="45" x2="35" y2="25" stroke-width="2"/>
                <line x1="50" y1="45" x2="65" y2="25" stroke-width="2"/>
                <line x1="50" y1="30" x2="40" y2="10" stroke-width="2"/>
                <line x1="50" y1="30" x2="60" y2="10" stroke-width="2"/>
                <line x1="25" y1="85" x2="75" y2="85" stroke-width="1" opacity="0.5"/>
            </svg>
            <div class="ebook-cover-text">
                <div class="ebook-cover-title">Handstand</div>
                <div class="ebook-cover-subtitle">Complete Guide</div>
            </div>
        </div>
    `;
    
    return `
        <div class="ebook-card" data-ebook-id="${ebook.id}">
            <div class="ebook-image">
                ${coverDesign}
                <div class="ebook-overlay">
                    <button class="btn-primary" onclick="viewEbook('${ebook.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                        </svg>
                        View Ebook
                    </button>
                </div>
            </div>
            <div class="ebook-content">
                <div class="ebook-category">${ebook.category}</div>
                <h3 class="ebook-title">${ebook.title}</h3>
                <p class="ebook-description">${ebook.description}</p>
                <div class="ebook-meta">
                    <span class="ebook-pages">${ebook.pages} pages</span>
                    <span class="ebook-size">${ebook.size}</span>
                </div>
                <div class="ebook-actions">
                    <button class="btn-primary" onclick="viewEbook('${ebook.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                        </svg>
                        View Online
                    </button>
                    <button class="btn-secondary" onclick="downloadEbookDirect('${ebook.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ===== View Ebook =====
async function viewEbook(ebookId) {
    const ebook = ebooks.find(e => e.id === ebookId);
    if (!ebook) return;

    currentEbook = ebook;
    currentPage = 1;
    
    // Show modal
    const modal = document.getElementById('pdfModal');
    const modalTitle = document.getElementById('pdfModalTitle');
    modalTitle.textContent = ebook.title;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Show loading state
    const pdfViewerContainer = document.querySelector('.pdf-viewer-container');
    pdfViewerContainer.innerHTML = `
        <div class="pdf-loading">
            <div class="loading-spinner"></div>
            <p>Loading PDF...</p>
        </div>
    `;

    // Load PDF
    try {
        await loadPdf(ebook.filepath);
    } catch (error) {
        console.error('Error loading PDF:', error);
        // Show error message and provide download option
        pdfViewerContainer.innerHTML = `
            <div class="pdf-error">
                <h3>Unable to load PDF viewer</h3>
                <p>The PDF viewer is temporarily unavailable. You can still download the ebook to view it on your device.</p>
                <button class="btn-primary" onclick="downloadEbook()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Ebook
                </button>
            </div>
        `;
    }
}

// ===== Load PDF =====
async function loadPdf(filepath) {
    try {
        // Check if PDF.js is loaded
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF.js library not loaded');
        }
        
        const loadingTask = pdfjsLib.getDocument(filepath);
        currentPdf = await loadingTask.promise;
        totalPages = currentPdf.numPages;
        
        // Replace loading state with the PDF viewer
        const pdfViewerContainer = document.querySelector('.pdf-viewer-container');
        pdfViewerContainer.innerHTML = `<canvas id="pdfCanvas"></canvas>`;
        
        // Update page info
        document.getElementById('totalPages').textContent = totalPages;
        document.getElementById('currentPage').textContent = currentPage;
        
        await renderPage(currentPage);
        updateNavigationButtons();
    } catch (error) {
        console.error('Error loading PDF:', error);
        throw error;
    }
}

// ===== Render Page =====
async function renderPage(pageNumber) {
    if (!currentPdf) return;

    try {
        const page = await currentPdf.getPage(pageNumber);
        const canvas = document.getElementById('pdfCanvas');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        const context = canvas.getContext('2d');
        
        // Get the container dimensions
        const container = document.querySelector('.pdf-viewer-container');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Get the page's original viewport
        const originalViewport = page.getViewport({ scale: 1 });
        
        // Calculate scale to fit the container
        const padding = 40; // Padding around the PDF
        const scaleX = (containerWidth - padding) / originalViewport.width;
        const scaleY = (containerHeight - padding) / originalViewport.height;
        const baseScale = Math.min(scaleX, scaleY, 2.5); // Increased max scale for better readability
        const scale = baseScale * currentZoom; // Apply zoom
        
        // Get the scaled viewport
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        await page.render(renderContext).promise;
        
        // Update page info
        if (document.getElementById('currentPage')) {
            document.getElementById('currentPage').textContent = pageNumber;
        }
        currentPage = pageNumber;
        updateNavigationButtons();
    } catch (error) {
        console.error('Error rendering page:', error);
    }
}

// ===== Navigation Functions =====
function previousPage() {
    if (currentPage > 1) {
        renderPage(currentPage - 1);
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        renderPage(currentPage + 1);
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    
    prevBtn.style.opacity = currentPage <= 1 ? '0.5' : '1';
    nextBtn.style.opacity = currentPage >= totalPages ? '0.5' : '1';
}

// ===== Zoom Functions =====
function zoomIn() {
    if (currentZoom < MAX_ZOOM) {
        currentZoom = Math.min(currentZoom * 1.2, MAX_ZOOM);
        renderPage(currentPage);
    }
}

function zoomOut() {
    if (currentZoom > MIN_ZOOM) {
        currentZoom = Math.max(currentZoom / 1.2, MIN_ZOOM);
        renderPage(currentPage);
    }
}

function resetZoom() {
    currentZoom = 1;
    renderPage(currentPage);
}

// ===== Close Modal =====
function closePdfModal() {
    const modal = document.getElementById('pdfModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentPdf = null;
    currentEbook = null;
    currentZoom = 1; // Reset zoom when closing
    
    // Exit fullscreen if active
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
}

// ===== Fullscreen Toggle =====
function toggleFullscreen() {
    const modal = document.getElementById('pdfModal');
    
    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (modal.requestFullscreen) {
            modal.requestFullscreen();
        } else if (modal.webkitRequestFullscreen) {
            modal.webkitRequestFullscreen();
        } else if (modal.msRequestFullscreen) {
            modal.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// ===== Download Functions =====
function downloadEbook() {
    if (currentEbook) {
        downloadEbookDirect(currentEbook.id);
    }
}

function downloadEbookDirect(ebookId) {
    const ebook = ebooks.find(e => e.id === ebookId);
    if (!ebook) return;

    const link = document.createElement('a');
    link.href = ebook.filepath;
    link.download = ebook.filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===== Initialize Navigation =====
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
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
}

// ===== Initialize PDF Modal =====
function initializePdfModal() {
    const modal = document.getElementById('pdfModal');
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePdfModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closePdfModal();
        }
    });
}

// ===== Keyboard Navigation =====
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('pdfModal');
    if (!modal.classList.contains('active')) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            previousPage();
            break;
        case 'ArrowRight':
            e.preventDefault();
            nextPage();
            break;
        case 'f':
        case 'F':
            e.preventDefault();
            toggleFullscreen();
            break;
        case '+':
        case '=':
            e.preventDefault();
            zoomIn();
            break;
        case '-':
        case '_':
            e.preventDefault();
            zoomOut();
            break;
        case '0':
            e.preventDefault();
            resetZoom();
            break;
    }
});
