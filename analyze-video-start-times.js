const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// FFmpeg paths
const ffmpegPath = path.join(__dirname, 'ffmpeg-2025-08-04-git-9a32b86307-full_build', 'ffmpeg-2025-08-04-git-9a32b86307-full_build', 'bin', 'ffmpeg.exe');
const ffprobePath = path.join(__dirname, 'ffmpeg-2025-08-04-git-9a32b86307-full_build', 'ffmpeg-2025-08-04-git-9a32b86307-full_build', 'bin', 'ffprobe.exe');

// Check if FFmpeg executables exist
if (!fs.existsSync(ffmpegPath)) {
    console.error(`❌ FFmpeg not found at: ${ffmpegPath}`);
    process.exit(1);
}

if (!fs.existsSync(ffprobePath)) {
    console.error(`❌ FFprobe not found at: ${ffprobePath}`);
    process.exit(1);
}

console.log('✅ FFmpeg and FFprobe found');

// Function to discover all video files
function discoverVideoFiles() {
    const videosDir = path.join(__dirname, 'public', 'videos');
    const videoFiles = [];
    
    if (!fs.existsSync(videosDir)) {
        console.error(`❌ Videos directory not found: ${videosDir}`);
        process.exit(1);
    }
    
    const files = fs.readdirSync(videosDir);
    let id = 1;
    
    for (const file of files) {
        if (file.toLowerCase().endsWith('.mp4')) {
            // Extract title from filename
            let title = file.replace(/\.mp4$/i, '');
            title = title.replace(/-1280x720-avc1-mp4a\s*\(\d+\)?/g, '');
            title = title.replace(/-1280x720-avc1-mp4a/g, '');
            title = title.replace(/\s*\(\d+\)$/g, '');
            
            // Extract instructor name
            const instructorMatch = title.match(/^([^-]+)/);
            const instructor = instructorMatch ? instructorMatch[1].trim() : 'Unknown';
            
            // Extract category from title
            let category = 'Strength';
            if (title.toLowerCase().includes('mobility') || title.toLowerCase().includes('flexibility')) {
                category = 'Mobility';
            } else if (title.toLowerCase().includes('handstand')) {
                category = 'Skills';
            } else if (title.toLowerCase().includes('conditioning') || title.toLowerCase().includes('endurance')) {
                category = 'Conditioning';
            } else if (title.toLowerCase().includes('nutrition')) {
                category = 'Nutrition';
            }
            
            // Determine level
            let level = 'Intermediate';
            if (title.toLowerCase().includes('advanced') || title.toLowerCase().includes('handstand')) {
                level = 'Advanced';
            } else if (title.toLowerCase().includes('all levels') || title.toLowerCase().includes('beginner')) {
                level = 'All Levels';
            }
            
            // Determine equipment
            let equipment = 'None';
            if (title.toLowerCase().includes('wall')) {
                equipment = 'Wall';
            }
            
            const description = `${title} - Transform your body with this powerful workout.`;
            const thumbnailFilename = file.replace('.mp4', '.jpg');
            const thumbnail = `/images/thumbnails/${thumbnailFilename}`;
            
            videoFiles.push({
                id: id++,
                title: title,
                instructor: instructor,
                duration: "45 min",
                level: level,
                category: category,
                equipment: equipment,
                description: description,
                thumbnail: thumbnail,
                filename: file,
                views: 0,
                rating: 4.5 + (Math.random() * 0.5),
                startTime: 0,
                startTimeFormatted: "00:00:00"
            });
        }
    }
    
    return videoFiles;
}

// Function to get video duration
function getVideoDuration(videoPath) {
    return new Promise((resolve, reject) => {
        const command = `"${ffprobePath}" -v quiet -show_entries format=duration -of csv=p=0 "${videoPath}"`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error getting duration for ${videoPath}:`, error);
                resolve(2700);
                return;
            }
            
            const duration = parseFloat(stdout.trim());
            resolve(duration || 2700);
        });
    });
}

// Function to detect scene changes in the first 15 minutes
function detectSceneChanges(videoPath) {
    return new Promise((resolve, reject) => {
        // Use a lower threshold for more sensitive detection
        const command = `"${ffmpegPath}" -i "${videoPath}" -vf "select='gt(scene,0.08)',showinfo" -f null - 2>&1`;
        
        exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error detecting scenes for ${videoPath}:`, error);
                resolve([]);
                return;
            }
            
            const output = stdout + stderr;
            const sceneMatches = output.match(/pts_time:(\d+\.?\d*)/g);
            const sceneTimes = sceneMatches ? sceneMatches.map(match => {
                const time = parseFloat(match.replace('pts_time:', ''));
                return time;
            }).filter(time => time > 60 && time < 900) : []; // Consider scenes between 1-15 minutes
            
            resolve(sceneTimes);
        });
    });
}

// Function to detect motion in the first 15 minutes
function detectMotion(videoPath) {
    return new Promise((resolve, reject) => {
        // Use an even lower threshold for motion detection
        const command = `"${ffmpegPath}" -i "${videoPath}" -vf "select='gt(scene,0.05)',showinfo" -f null - 2>&1`;
        
        exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error detecting motion for ${videoPath}:`, error);
                resolve([]);
                return;
            }
            
            const output = stdout + stderr;
            const motionMatches = output.match(/pts_time:(\d+\.?\d*)/g);
            const motionTimes = motionMatches ? motionMatches.map(match => {
                const time = parseFloat(match.replace('pts_time:', ''));
                return time;
            }).filter(time => time > 60 && time < 900) : [];
            
            resolve(motionTimes);
        });
    });
}

// Function to analyze audio levels
function analyzeAudioLevels(videoPath) {
    return new Promise((resolve, reject) => {
        const command = `"${ffmpegPath}" -i "${videoPath}" -af "volumedetect" -f null - 2>&1`;
        
        exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error analyzing audio for ${videoPath}:`, error);
                resolve(null);
                return;
            }
            
            const output = stdout + stderr;
            const meanMatch = output.match(/mean_volume: ([-\d.]+) dB/);
            const meanVolume = meanMatch ? parseFloat(meanMatch[1]) : null;
            
            resolve(meanVolume);
        });
    });
}

// Function to determine start time based on actual detection
function determineStartTime(sceneTimes, motionTimes, audioLevel, duration) {
    // Combine all detected times
    const allTimes = [...sceneTimes, ...motionTimes].sort((a, b) => a - b);
    
    if (allTimes.length === 0) {
        // No significant changes detected, use audio level to estimate
        if (audioLevel && audioLevel < -35) {
            // Very low audio might indicate intro screen, use conservative estimate
            return 300; // 5 minutes
        } else if (audioLevel && audioLevel < -30) {
            // Low audio, use moderate estimate
            return 240; // 4 minutes
        } else {
            // Normal audio, might start earlier
            return 180; // 3 minutes
        }
    }
    
    // Use the first significant change after 60 seconds
    const firstSignificantChange = allTimes.find(time => time > 60);
    if (firstSignificantChange) {
        // If the detected time is reasonable (between 1-10 minutes), use it
        if (firstSignificantChange >= 60 && firstSignificantChange <= 600) {
            return Math.round(firstSignificantChange);
        }
        // If too early or too late, use a reasonable default
        return Math.min(Math.max(firstSignificantChange, 120), 480); // Between 2-8 minutes
    }
    
    // Fallback based on audio level
    if (audioLevel && audioLevel < -35) {
        return 300; // 5 minutes for very low audio
    } else if (audioLevel && audioLevel < -30) {
        return 240; // 4 minutes for low audio
    } else {
        return 180; // 3 minutes for normal audio
    }
}

// Function to format time as HH:MM:SS
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Main analysis function
async function analyzeVideo(video, index, total) {
    const videoPath = path.join(__dirname, 'public', 'videos', video.filename);
    
    console.log(`\n📹 Analyzing video ${index}/${total}: ${video.title}`);
    console.log(`   File: ${video.filename}`);
    
    // Check if video file exists
    if (!fs.existsSync(videoPath)) {
        console.log(`   ⚠️  Video file not found, skipping...`);
        return { ...video, startTime: 300, startTimeFormatted: "00:05:00" };
    }
    
    try {
        // Get video duration
        const duration = await getVideoDuration(videoPath);
        video.duration = `${Math.round(duration / 60)} min`;
        
        // Detect scene changes
        console.log(`   🔍 Detecting scene changes...`);
        const sceneTimes = await detectSceneChanges(videoPath);
        console.log(`   📊 Found ${sceneTimes.length} significant scene changes`);
        
        // Detect motion
        console.log(`   🎬 Detecting motion...`);
        const motionTimes = await detectMotion(videoPath);
        console.log(`   📊 Found ${motionTimes.length} motion events`);
        
        // Analyze audio levels
        console.log(`   🔊 Analyzing audio levels...`);
        const audioLevel = await analyzeAudioLevels(videoPath);
        console.log(`   📊 Mean audio level: ${audioLevel ? audioLevel.toFixed(2) + ' dB' : 'Unknown'}`);
        
        // Determine start time
        const startTime = determineStartTime(sceneTimes, motionTimes, audioLevel, duration);
        const startTimeFormatted = formatTime(startTime);
        
        console.log(`   ⏰ Detected start time: ${startTimeFormatted} (${startTime} seconds)`);
        
        return {
            ...video,
            duration: video.duration,
            startTime: startTime,
            startTimeFormatted: startTimeFormatted
        };
        
    } catch (error) {
        console.error(`   ❌ Error analyzing ${video.filename}:`, error);
        return { ...video, startTime: 300, startTimeFormatted: "00:05:00" };
    }
}

// Main execution
async function main() {
    console.log('🎬 Video Start Time Analysis - Calibrated Detection');
    console.log('==================================================\n');
    
    // Discover all video files
    console.log('🔍 Discovering video files...');
    const videos = discoverVideoFiles();
    console.log(`📊 Found ${videos.length} video files\n`);
    
    if (videos.length === 0) {
        console.log('❌ No video files found!');
        return;
    }
    
    // Analyze each video
    const results = [];
    for (let i = 0; i < videos.length; i++) {
        const result = await analyzeVideo(videos[i], i + 1, videos.length);
        results.push(result);
    }
    
    // Save results
    fs.writeFileSync('video-start-times.json', JSON.stringify(results, null, 2));
    
    // Print summary
    console.log('\n📊 Analysis Summary');
    console.log('==================');
    console.log(`Total videos analyzed: ${results.length}`);
    
    const startTimeDistribution = {};
    results.forEach(video => {
        const time = video.startTimeFormatted;
        startTimeDistribution[time] = (startTimeDistribution[time] || 0) + 1;
    });
    
    console.log('\nStart time distribution:');
    Object.entries(startTimeDistribution)
        .sort((a, b) => a[1] - b[1])
        .reverse()
        .forEach(([time, count]) => {
            console.log(`  ${time}: ${count} videos`);
        });
    
    console.log('\n✅ Analysis complete! Results saved to video-start-times.json');
    console.log('💡 Run update-video-database.js to update the server database');
}

main().catch(console.error); 