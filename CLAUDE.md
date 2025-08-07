# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Bodyweight Gym Online is a Node.js/Express-based video streaming platform that serves 30+ hours of bodyweight workout videos. The application provides a Progressive Web App (PWA) experience with video streaming, filtering, search, and user engagement features.

## Architecture

### Backend (Express Server)
- **server.js**: Main server file with video database, API routes, and video streaming
- **Video Database**: In-memory array containing metadata for 67+ workout videos with titles, instructors, categories, durations, thumbnails, and start times
- **API Routes**: RESTful endpoints for videos, streaming, search, favorites, and statistics
- **Video Streaming**: Range-request support for efficient video delivery with seeking capability

### Frontend (Vanilla JavaScript/CSS)
- **public/index.html**: Main application entry point
- **public/video.html**: Dedicated video player page
- **public/js/modern-app.js**: Main application logic with video management, filtering, search
- **public/css/modern-style.css**: Complete styling with responsive design
- **PWA Features**: Service worker, manifest.json, offline support

### Video Management System
- **Videos**: Stored in `public/videos/` directory (MP4 format, various resolutions)
- **Thumbnails**: Auto-generated in `public/images/thumbnails/` using FFmpeg
- **Start Times**: Automatically detected to skip intro screens and start at actual workout content

## Common Commands

### Development
```bash
# Start development server with auto-restart
npm run dev

# Start production server
npm start
```

### Video Processing
```bash
# Generate thumbnails from videos (requires FFmpeg)
npm run thumbnails

# Analyze video start times (requires FFmpeg)
node analyze-video-start-times.js

# Update video database with new metadata
node update-video-database.js
```

### Testing
```bash
# No tests currently configured
npm test
```

## Key Features & Implementation Details

### Video Streaming
- **Range Requests**: Supports partial content delivery for video seeking
- **Auto Start Times**: Videos automatically start at detected workout beginning (skipping intros)
- **Categories**: Strength, Mobility, Conditioning, Skills, Nutrition
- **Levels**: Beginner, Intermediate, Advanced

### Video Analysis Pipeline
1. **FFmpeg Integration**: Uses local FFmpeg for video analysis and thumbnail generation
2. **Scene Detection**: Analyzes scene changes to detect workout start points
3. **Audio Analysis**: Detects "starting soon" screens with low audio levels
4. **Smart Defaults**: Falls back to sensible defaults when analysis fails

### Data Structure
Videos include comprehensive metadata:
```javascript
{
  id, title, instructor, duration, level, category, equipment,
  description, thumbnail, filename, views, rating,
  startTime, startTimeFormatted
}
```

## Development Workflow

### Adding New Videos
1. Place MP4 files in `public/videos/`
2. Run `npm run thumbnails` to generate thumbnails
3. Run `node analyze-video-start-times.js` to detect start times
4. Update video database in `server.js` with new entries

### Video Processing Requirements
- **FFmpeg**: Must be installed locally for video analysis and thumbnail generation
- **Analysis Scripts**: Located in root directory for video processing tasks
- **Batch Processing**: Scripts handle multiple videos automatically

### Frontend Architecture
- **Modular JavaScript**: Organized by functionality (navigation, filters, search, video player)
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Responsive Design**: Mobile-first CSS with breakpoints
- **Performance Optimized**: Lazy loading, compression, caching headers

## File Organization

### Core Application Files
- `server.js` - Main Express server and video database
- `package.json` - Dependencies and scripts
- `public/` - Static assets and frontend code

### Video Processing Scripts
- `generate-thumbnails.js` - FFmpeg-based thumbnail generation
- `analyze-video-start-times.js` - Smart start time detection
- `update-video-database.js` - Database synchronization

### Documentation
- `README.md` - Server setup and deployment guide
- `THUMBNAIL_GENERATION.md` - Thumbnail generation process
- `VIDEO_START_TIME_IMPLEMENTATION.md` - Start time detection details

## Configuration

### Environment Variables
```env
NODE_ENV=production
PORT=3000
VIDEO_PATH=/path/to/videos
MAX_CONCURRENT_STREAMS=50
CACHE_DURATION=3600
```

### Dependencies
- **Production**: express, cors, compression, helmet, express-rate-limit, dotenv
- **Development**: nodemon
- **External**: FFmpeg (for video processing)

## Performance Considerations

### Video Delivery
- Compression middleware enabled
- Rate limiting on API endpoints
- Range request support for efficient streaming
- Thumbnail caching and optimization

### Frontend Optimization
- Service worker for offline functionality
- Progressive loading of video content
- Responsive images and lazy loading
- Minimal JavaScript for core functionality

## Security Features
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation on API endpoints
- No user authentication (public content)