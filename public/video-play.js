// Minimal Video Player - The Bodyweight Gym Online

class MinimalVideoPlayer {
    constructor(videoElement) {
        this.video = videoElement;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.initKeyboardControls();
    }
    
    bindEvents() {
        this.video.addEventListener('ended', () => this.onEnded());
    }
    
    onEnded() {
        this.trackEvent('video_completed');
    }
    
    initKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            // Only handle keyboard events when video is focused or no input is focused
            if (document.activeElement === this.video || !document.activeElement.matches('input, textarea, select')) {
                this.handleKeyboard(e);
            }
        });
    }
    
    handleKeyboard(e) {
        switch(e.key) {
            case ' ':
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
                this.changeVolume(0.1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.changeVolume(-0.1);
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
    
    togglePlay() {
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }
    }
    
    skip(seconds) {
        this.video.currentTime += seconds;
    }
    
    changeVolume(delta) {
        const newVolume = Math.max(0, Math.min(1, this.video.volume + delta));
        this.video.volume = newVolume;
    }
    
    toggleMute() {
        this.video.muted = !this.video.muted;
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.video.requestFullscreen().catch(err => {
                console.log('Fullscreen failed:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    trackEvent(eventName, data = {}) {
        const videoId = this.video.dataset.videoId;
        if (videoId) {
            fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    event: eventName, 
                    video_id: videoId,
                    ...data 
                })
            }).catch(console.error);
        }
    }
}

// Initialize minimal player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach(video => {
        new MinimalVideoPlayer(video);
    });
});