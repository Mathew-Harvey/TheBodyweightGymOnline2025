# Thumbnail Generation Guide

This guide explains how to generate thumbnails from the workout videos in The Bodyweight Gym Online.

## Prerequisites

### Install FFmpeg

You need FFmpeg installed on your system to generate thumbnails:

#### Windows
1. Download FFmpeg from https://ffmpeg.org/download.html
2. Extract the files to a folder (e.g., `C:\ffmpeg`)
3. Add the `bin` folder to your system PATH
4. Restart your terminal/command prompt

#### macOS
```bash
brew install ffmpeg
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install ffmpeg
```

#### CentOS/RHEL
```bash
sudo yum install ffmpeg
```

## Generating Thumbnails

### Method 1: Using npm script (Recommended)
```bash
npm run thumbnails
```

### Method 2: Direct execution
```bash
node generate-thumbnails.js
```

## What the script does

1. **Scans the videos directory**: Looks for all `.mp4` files in `public/videos/`
2. **Creates thumbnails directory**: Ensures `public/images/thumbnails/` exists
3. **Generates thumbnails**: For each video, extracts a frame at 30% of the video duration
4. **Resizes thumbnails**: Scales them to 350x200 pixels with proper aspect ratio
5. **Skips existing thumbnails**: Won't regenerate thumbnails that already exist

## Thumbnail specifications

- **Size**: 350x200 pixels
- **Format**: JPEG
- **Quality**: High quality
- **Extraction point**: 30% of video duration (or 10 seconds as fallback)
- **Aspect ratio**: Maintained with padding if necessary

## Output

Thumbnails are saved to `public/images/thumbnails/` with the same name as the video file but with `.jpg` extension.

Example:
- Video: `Coach Corey - Full Body Workout-1280x720-avc1-mp4a.mp4`
- Thumbnail: `Coach Corey - Full Body Workout-1280x720-avc1-mp4a.jpg`

## Troubleshooting

### FFmpeg not found
If you get an error saying FFmpeg is not available:
1. Make sure FFmpeg is installed
2. Ensure it's in your system PATH
3. Restart your terminal/command prompt
4. Try running `ffmpeg -version` to verify installation

### Permission errors
- **Windows**: Run as administrator
- **macOS/Linux**: Use `sudo` if needed

### Video format issues
The script handles most common video formats. If a video fails:
1. Check if the video file is corrupted
2. Try converting the video to MP4 format first
3. The script will try an alternative extraction method automatically

## Integration with the website

Once thumbnails are generated, the website will automatically use them instead of the placeholder gradients. The thumbnails will appear in:

1. **Video grid on the main page**
2. **Video cards in search results**
3. **Related videos section**

## Performance notes

- The script processes videos sequentially to avoid overwhelming the system
- Each thumbnail generation takes a few seconds depending on video size
- The script includes a small delay between videos to prevent system overload
- Existing thumbnails are skipped to save time on subsequent runs

## Customization

You can modify the thumbnail generation by editing `generate-thumbnails.js`:

- **Size**: Change `THUMBNAIL_WIDTH` and `THUMBNAIL_HEIGHT`
- **Extraction point**: Modify the `-ss 30%` parameter
- **Quality**: Adjust FFmpeg parameters for different quality settings
- **Format**: Change from JPEG to PNG or other formats

## Batch processing

For large video collections, you can run the script in the background:

```bash
# Windows
start /B npm run thumbnails

# macOS/Linux
nohup npm run thumbnails &
```

The script will show progress and completion status in the console. 