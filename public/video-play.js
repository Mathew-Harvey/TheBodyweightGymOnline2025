// video-player.js - Enhanced Video Player for The Bodyweight Gym Online

class BodyweightGymPlayer {
    constructor(videoElement, options = {}) {
        this.video = videoElement;
        this.container = videoElement.parentElement;
        this.options = {
            controls: true,
            autoplay: false,
            overlay: true,
            analytics: true,
            ...options
        };
        
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 1;
        this.playbackRate = 1;
        this.fullscreen = false;
        
        this.init();
    }
    
    init() {
        this.createControls();
        this.bindEvents();
        this.initializeOverlays();
        
        if (this.options.analytics) {
            this.initAnalytics();
        }
    }
    
    createControls() {
        const controlsHTML = `
            <div class="custom-video-controls">
                <div class="video-progress">
                    <div class="progress-bar">
                        <div class="progress-filled"></div>
                        <div class="progress-handle"></div>
                    </div>
                    <div class="time-display">
                        <span class="current-time">0:00</span> / <span class="duration">0:00</span>
                    </div>
                </div>
                
                <div class="video-controls-bottom">
                    <div class="controls-left">
                        <button class="play-pause-btn" aria-label="Play/Pause">
                            <svg class="play-icon" viewBox="0 0 24 24">
                                <polygon points="5 3 19 12 5 21"></polygon>
                            </svg>
                            <svg class="pause-icon hidden" viewBox="0 0 24 24">
                                <rect x="6" y="4" width="4" height="16"></rect>
                                <rect x="14" y="4" width="4" height="16"></rect>
                            </svg>
                        </button>
                        
                        <button class="skip-btn" data-skip="-10" aria-label="Skip back 10 seconds">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 4V1L8 5l4 4V6c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"/>
                                <text x="12" y="14" text-anchor="middle" font-size="8">10</text>
                            </svg>
                        </button>
                        
                        <button class="skip-btn" data-skip="10" aria-label="Skip forward 10 seconds">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 4V1l4 4-4 4V6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6h2c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8z"/>
                                <text x="12" y="14" text-anchor="middle" font-size="8">10</text>
                            </svg>
                        </button>
                        
                        <div class="volume-control">
                            <button class="volume-btn" aria-label="Mute/Unmute">
                                <svg class="volume-high" viewBox="0 0 24 24">
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19"></polygon>
                                    <path d="M15 9c1.5 1.5 1.5 3.5 0 5M19 6c3 3 3 8 0 11"></path>
                                </svg>
                                <svg class="volume-muted hidden" viewBox="0 0 24 24">
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19"></polygon>
                                    <line x1="23" y1="9" x2="17" y2="15" stroke-width="2"></line>
                                    <line x1="17" y1="9" x2="23" y2="15" stroke-width="2"></line>
                                </svg>
                            </button>
                            <input type="range" class="volume-slider" min="0" max="100" value="100">
                        </div>
                    </div>
                    
                    <div class="controls-right">
                        <button class="speed-btn" aria-label="Playback speed">1x</button>
                        
                        <button class="pip-btn" aria-label="Picture in Picture">
                            <svg viewBox="0 0 24 24">
                                <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
                                <rect x="12" y="10" width="8" height="6" rx="1" fill="currentColor"></rect>
                            </svg>
                        </button>
                        
                        <button class="fullscreen-btn" aria-label="Fullscreen">
                            <svg class="fullscreen-enter" viewBox="0 0 24 24">
                                <path d="M5 5h5V3H3v7h2V5zM19 5h-5V3h7v7h-2V5zM5 19h5v2H3v-7h2v5zM19 19h-5v2h7v-7h-2v5z"></path>
                            </svg>
                            <svg class="fullscreen-exit hidden" viewBox="0 0 24 24">
                                <path d="M3 8h5V3h2v7H3V8zM16 3h2v5h5v2h-7V3zM3 16h7v7H8v-5H3v-2zM16 14h7v2h-5v5h-2v-7z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const controlsDiv = document.createElement('div');
        controlsDiv.innerHTML = controlsHTML;
        this.container.appendChild(controlsDiv.firstElementChild);
        
        this.controls = {
            container: this.container.querySelector('.custom-video-controls'),
            playPause: this.container.querySelector('.play-pause-btn'),
            playIcon: this.container.querySelector('.play-icon'),
            pauseIcon: this.container.querySelector('.pause-icon'),
            progressBar: this.container.querySelector('.progress-bar'),
            progressFilled: this.container.querySelector('.progress-filled'),
            progressHandle: this.container.querySelector('.progress-handle'),
            currentTimeDisplay: this.container.querySelector('.current-time'),
            durationDisplay: this.container.querySelector('.duration'),
            volumeBtn: this.container.querySelector('.volume-btn'),
            volumeSlider: this.container.querySelector('.volume-slider'),
            speedBtn: this.container.querySelector('.speed-btn'),
            pipBtn: this.container.querySelector('.pip-btn'),
            fullscreenBtn: this.container.querySelector('.fullscreen-btn'),
            skipBtns: this.container.querySelectorAll('.skip-btn')
        };
    }
    
    bindEvents() {
        // Video events
        this.video.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
        this.video.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.video.addEventListener('play', () => this.onPlay());
        this.video.addEventListener('pause', () => this.onPause());
        this.video.addEventListener('ended', () => this.onEnded());
        
        // Control events
        this.controls.playPause.addEventListener('click', () => this.togglePlay());
        this.controls.progressBar.addEventListener('click', (e) => this.seek(e));
        this.controls.volumeBtn.addEventListener('click', () => this.toggleMute());
        this.controls.volumeSlider.addEventListener('input', (e) => this.changeVolume(e));
        this.controls.speedBtn.addEventListener('click', () => this.changeSpeed());
        this.controls.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        if (this.controls.pipBtn && 'pictureInPictureEnabled' in document) {
            this.controls.pipBtn.addEventListener('click', () => this.togglePiP());
        } else {
            this.controls.pipBtn?.remove();
        }
        
        this.controls.skipBtns.forEach(btn => {
            btn.addEventListener('click', () => this.skip(parseInt(btn.dataset.skip)));
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Show/hide controls
        let controlsTimeout;
        this.container.addEventListener('mousemove', () => {
            this.controls.container.style.opacity = '1';
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(() => {
                if (this.isPlaying) {
                    this.controls.container.style.opacity = '0';
                }
            }, 3000);
        });
    }
    
    onLoadedMetadata() {
        this.duration = this.video.duration;
        this.controls.durationDisplay.textContent = this.formatTime(this.duration);
    }
    
    onTimeUpdate() {
        this.currentTime = this.video.currentTime;
        const progress = (this.currentTime / this.duration) * 100;
        
        this.controls.progressFilled.style.width = `${progress}%`;
        this.controls.progressHandle.style.left = `${progress}%`;
        this.controls.currentTimeDisplay.textContent = this.formatTime(this.currentTime);
        
        // Update workout timer overlay if exists
        if (this.workoutTimer) {
            this.updateWorkoutTimer();
        }
    }
    
    onPlay() {
        this.isPlaying = true;
        this.controls.playIcon.classList.add('hidden');
        this.controls.pauseIcon.classList.remove('hidden');
        this.container.classList.add('playing');
    }
    
    onPause() {
        this.isPlaying = false;
        this.controls.playIcon.classList.remove('hidden');
        this.controls.pauseIcon.classList.add('hidden');
        this.container.classList.remove('playing');
    }
    
    onEnded() {
        this.isPlaying = false;
        this.showCompletionScreen();
    }
    
    togglePlay() {
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }
    }
    
    seek(e) {
        const rect = this.controls.progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.video.currentTime = pos * this.duration;
    }
    
    skip(seconds) {
        this.video.currentTime += seconds;
    }
    
    toggleMute() {
        this.video.muted = !this.video.muted;
        if (this.video.muted) {
            this.controls.volumeSlider.value = 0;
            this.container.querySelector('.volume-high').classList.add('hidden');
            this.container.querySelector('.volume-muted').classList.remove('hidden');
        } else {
            this.controls.volumeSlider.value = this.volume * 100;
            this.container.querySelector('.volume-high').classList.remove('hidden');
            this.container.querySelector('.volume-muted').classList.add('hidden');
        }
    }
    
    changeVolume(e) {
        this.volume = e.target.value / 100;
        this.video.volume = this.volume;
        this.video.muted = this.volume === 0;
        
        if (this.volume === 0) {
            this.container.querySelector('.volume-high').classList.add('hidden');
            this.container.querySelector('.volume-muted').classList.remove('hidden');
        } else {
            this.container.querySelector('.volume-high').classList.remove('hidden');
            this.container.querySelector('.volume-muted').classList.add('hidden');
        }
    }
    
    changeSpeed() {
        const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
        const currentIndex = speeds.indexOf(this.playbackRate);
        const nextIndex = (currentIndex + 1) % speeds.length;
        this.playbackRate = speeds[nextIndex];
        this.video.playbackRate = this.playbackRate;
        this.controls.speedBtn.textContent = `${this.playbackRate}x`;
    }
    
    toggleFullscreen() {
        if (!this.fullscreen) {
            if (this.container.requestFullscreen) {
                this.container.requestFullscreen();
            } else if (this.container.webkitRequestFullscreen) {
                this.container.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
        
        this.fullscreen = !this.fullscreen;
        this.container.querySelector('.fullscreen-enter').classList.toggle('hidden');
        this.container.querySelector('.fullscreen-exit').classList.toggle('hidden');
    }
    
    async togglePiP() {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await this.video.requestPictureInPicture();
            }
        } catch (error) {
            console.error('PiP failed:', error);
        }
    }
    
    handleKeyboard(e) {
        if (!this.container.contains(document.activeElement)) return;
        
        switch(e.key) {
            case ' ':
            case 'k':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.skip(-10);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.skip(10);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.changeVolume({ target: { value: Math.min(100, this.volume * 100 + 10) } });
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.changeVolume({ target: { value: Math.max(0, this.volume * 100 - 10) } });
                break;
            case 'f':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'm':
                e.preventDefault();
                this.toggleMute();
                break;
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    initializeOverlays() {
        // Add workout timer overlay
        const timerOverlay = document.createElement('div');
        timerOverlay.className = 'workout-timer-overlay hidden';
        timerOverlay.innerHTML = `
            <div class="timer-content">
                <div class="exercise-name">Get Ready!</div>
                <div class="exercise-timer">00:00</div>
                <div class="exercise-progress"></div>
                <div class="next-exercise">Next: <span></span></div>
            </div>
        `;
        this.container.appendChild(timerOverlay);
        this.workoutTimer = timerOverlay;
        
        // Add motivational overlay
        const motivationOverlay = document.createElement('div');
        motivationOverlay.className = 'motivation-overlay hidden';
        motivationOverlay.innerHTML = `
            <div class="motivation-content">
                <div class="motivation-text"></div>
                <button class="close-motivation">×</button>
            </div>
        `;
        this.container.appendChild(motivationOverlay);
        
        motivationOverlay.querySelector('.close-motivation').addEventListener('click', () => {
            motivationOverlay.classList.add('hidden');
        });
    }
    
    showMotivation(text) {
        const overlay = this.container.querySelector('.motivation-overlay');
        overlay.querySelector('.motivation-text').textContent = text;
        overlay.classList.remove('hidden');
        
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 5000);
    }
    
    showCompletionScreen() {
        const completionScreen = document.createElement('div');
        completionScreen.className = 'completion-screen';
        completionScreen.innerHTML = `
            <div class="completion-content">
                <h2>🎉 Workout Complete!</h2>
                <p>Great job! You've completed this workout.</p>
                <div class="completion-stats">
                    <div class="stat">
                        <span class="stat-value">${this.formatTime(this.duration)}</span>
                        <span class="stat-label">Duration</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">100%</span>
                        <span class="stat-label">Completed</span>
                    </div>
                </div>
                <div class="completion-actions">
                    <button class="btn btn-primary" onclick="location.reload()">Back to Workouts</button>
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
                </div>
            </div>
        `;
        this.container.appendChild(completionScreen);
    }
    
    initAnalytics() {
        // Track video engagement
        let watchedSegments = new Set();
        
        this.video.addEventListener('timeupdate', () => {
            const segment = Math.floor(this.currentTime / 10); // 10-second segments
            if (!watchedSegments.has(segment)) {
                watchedSegments.add(segment);
                this.trackEvent('segment_watched', {
                    segment: segment,
                    video_id: this.video.dataset.videoId
                });
            }
        });
        
        // Track completion
        this.video.addEventListener('ended', () => {
            const completionRate = (watchedSegments.size * 10) / this.duration;
            this.trackEvent('video_completed', {
                video_id: this.video.dataset.videoId,
                completion_rate: completionRate,
                duration: this.duration
            });
        });
    }
    
    trackEvent(eventName, data) {
        // Send to analytics endpoint
        fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: eventName, ...data })
        }).catch(console.error);
    }
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const videoElements = document.querySelectorAll('.bodyweight-gym-video');
    videoElements.forEach(video => {
        new BodyweightGymPlayer(video, {
            controls: true,
            analytics: true,
            overlay: true
        });
    });
});

// Add CSS for video player
const playerStyles = `
<style>
.custom-video-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    padding: 20px;
    transition: opacity 0.3s ease;
    color: white;
}

.video-progress {
    margin-bottom: 15px;
}

.progress-bar {
    height: 6px;
    background: rgba(255,255,255,0.3);
    border-radius: 3px;
    position: relative;
    cursor: pointer;
    margin-bottom: 10px;
}

.progress-filled {
    height: 100%;
    background: var(--primary-color);
    border-radius: 3px;
    width: 0%;
    transition: width 0.1s linear;
}

.progress-handle {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 14px;
    height: 14px;
    background: white;
    border-radius: 50%;
    left: 0%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.time-display {
    font-size: 0.9rem;
    opacity: 0.8;
}

.video-controls-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.controls-left, .controls-right {
    display: flex;
    align-items: center;
    gap: 15px;
}

.custom-video-controls button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    transition: background 0.3s ease;
}

.custom-video-controls button:hover {
    background: rgba(255,255,255,0.2);
}

.custom-video-controls svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
}

.volume-control {
    display: flex;
    align-items: center;
    gap: 10px;
}

.volume-slider {
    width: 80px;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255,255,255,0.3);
    border-radius: 2px;
    outline: none;
}

.volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
}

.workout-timer-overlay {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(0,0,0,0.8);
    padding: 20px;
    border-radius: 10px;
    color: white;
}

.exercise-timer {
    font-size: 2.5rem;
    font-weight: bold;
    margin: 10px 0;
}

.completion-screen {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-align: center;
}

.completion-content h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.completion-stats {
    display: flex;
    gap: 3rem;
    margin: 2rem 0;
    justify-content: center;
}

.completion-stats .stat-value {
    display: block;
    font-size: 2rem;
    font-weight: bold;
    color: var(--primary-color);
}

.completion-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
}

.hidden {
    display: none !important;
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', playerStyles);