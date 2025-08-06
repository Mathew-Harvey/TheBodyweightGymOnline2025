const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

// Configuration
const VIDEOS_DIR = path.join(__dirname, 'public', 'videos');
const THUMBNAILS_DIR = path.join(__dirname, 'public', 'images', 'thumbnails');
const THUMBNAIL_WIDTH = 350;
const THUMBNAIL_HEIGHT = 200;

// Ensure thumbnails directory exists
if (!fs.existsSync(THUMBNAILS_DIR)) {
    fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
}

// Function to get video duration in seconds
async function getVideoDuration(videoPath) {
    try {
        const { stdout } = await execAsync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${videoPath}"`);
        return parseFloat(stdout.trim());
    } catch (error) {
        console.error(`Error getting duration for ${videoPath}:`, error.message);
        return null;
    }
}

async function generateThumbnails() {
    try {
        console.log('🎬 Starting thumbnail generation...');
        
        // Get all video files
        const videoFiles = fs.readdirSync(VIDEOS_DIR)
            .filter(file => file.endsWith('.mp4'))
            .map(file => ({
                filename: file,
                name: path.parse(file).name,
                fullPath: path.join(VIDEOS_DIR, file)
            }));
        
        console.log(`Found ${videoFiles.length} video files`);
        
        // Process each video
        for (let i = 0; i < videoFiles.length; i++) {
            const video = videoFiles[i];
            const thumbnailPath = path.join(THUMBNAILS_DIR, `${video.name}.jpg`);
            
            // Skip if thumbnail already exists
            if (fs.existsSync(thumbnailPath)) {
                console.log(`⏭️  Thumbnail already exists for ${video.filename}`);
                continue;
            }
            
            console.log(`🔄 Generating thumbnail for ${video.filename} (${i + 1}/${videoFiles.length})`);
            
            try {
                // Get video duration
                const duration = await getVideoDuration(video.fullPath);
                
                if (!duration) {
                    console.log(`⚠️  Could not get duration for ${video.filename}, using 30 seconds`);
                    // Use 30 seconds as fallback
                    const ffmpegCommand = `ffmpeg -i "${video.fullPath}" -ss 30 -vframes 1 -vf "scale=${THUMBNAIL_WIDTH}:${THUMBNAIL_HEIGHT}:force_original_aspect_ratio=decrease,pad=${THUMBNAIL_WIDTH}:${THUMBNAIL_HEIGHT}:(ow-iw)/2:(oh-ih)/2" -y "${thumbnailPath}"`;
                    await execAsync(ffmpegCommand);
                    console.log(`✅ Generated thumbnail for ${video.filename} (fallback method)`);
                } else {
                    // Calculate middle time (50% of duration)
                    const middleTime = Math.floor(duration / 2);
                    console.log(`📊 Video duration: ${duration}s, extracting frame at ${middleTime}s`);
                    
                    const ffmpegCommand = `ffmpeg -i "${video.fullPath}" -ss ${middleTime} -vframes 1 -vf "scale=${THUMBNAIL_WIDTH}:${THUMBNAIL_HEIGHT}:force_original_aspect_ratio=decrease,pad=${THUMBNAIL_WIDTH}:${THUMBNAIL_HEIGHT}:(ow-iw)/2:(oh-ih)/2" -y "${thumbnailPath}"`;
                    
                    await execAsync(ffmpegCommand);
                    console.log(`✅ Generated thumbnail for ${video.filename}`);
                }
                
                // Add a small delay to prevent overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`❌ Error generating thumbnail for ${video.filename}:`, error.message);
                
                // Try alternative method - extract frame at 25% of duration
                try {
                    const duration = await getVideoDuration(video.fullPath);
                    const quarterTime = duration ? Math.floor(duration * 0.25) : 15;
                    
                    const alternativeCommand = `ffmpeg -i "${video.fullPath}" -ss ${quarterTime} -vframes 1 -vf "scale=${THUMBNAIL_WIDTH}:${THUMBNAIL_HEIGHT}:force_original_aspect_ratio=decrease,pad=${THUMBNAIL_WIDTH}:${THUMBNAIL_HEIGHT}:(ow-iw)/2:(oh-ih)/2" -y "${thumbnailPath}"`;
                    await execAsync(alternativeCommand);
                    console.log(`✅ Generated thumbnail for ${video.filename} (alternative method)`);
                } catch (altError) {
                    console.error(`❌ Alternative method also failed for ${video.filename}:`, altError.message);
                }
            }
        }
        
        console.log('🎉 Thumbnail generation completed!');
        
        // Generate a summary
        const generatedThumbnails = fs.readdirSync(THUMBNAILS_DIR)
            .filter(file => file.endsWith('.jpg'))
            .length;
        
        console.log(`📊 Summary:`);
        console.log(`   - Total videos: ${videoFiles.length}`);
        console.log(`   - Generated thumbnails: ${generatedThumbnails}`);
        console.log(`   - Thumbnails saved to: ${THUMBNAILS_DIR}`);
        
    } catch (error) {
        console.error('❌ Error during thumbnail generation:', error);
        process.exit(1);
    }
}

// Check if FFmpeg is available
async function checkFFmpeg() {
    try {
        await execAsync('ffmpeg -version');
        console.log('✅ FFmpeg is available');
        return true;
    } catch (error) {
        console.error('❌ FFmpeg is not installed or not in PATH');
        console.log('Please install FFmpeg to generate thumbnails:');
        console.log('  - Windows: Download from https://ffmpeg.org/download.html');
        console.log('  - macOS: brew install ffmpeg');
        console.log('  - Ubuntu/Debian: sudo apt install ffmpeg');
        return false;
    }
}

// Main execution
async function main() {
    console.log('🎬 The Bodyweight Gym - Thumbnail Generator');
    console.log('==========================================');
    
    const ffmpegAvailable = await checkFFmpeg();
    if (!ffmpegAvailable) {
        process.exit(1);
    }
    
    await generateThumbnails();
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { generateThumbnails }; 