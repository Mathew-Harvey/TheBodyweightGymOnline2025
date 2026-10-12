// Merges detected start times (video-start-times.json) into public/data/videos.json by video id.
// Other fields, including youtubeId, are left untouched. Run `npm run build` afterwards.
const fs = require('fs');
const path = require('path');

const videosPath = path.join(__dirname, 'public', 'data', 'videos.json');
const startTimes = JSON.parse(fs.readFileSync(path.join(__dirname, 'video-start-times.json'), 'utf8'));
const videos = JSON.parse(fs.readFileSync(videosPath, 'utf8'));

let updated = 0;
for (const entry of startTimes) {
  const video = videos.find((v) => v.id === entry.id);
  if (!video) continue;
  video.startTime = entry.startTime;
  video.startTimeFormatted = entry.startTimeFormatted;
  updated++;
}

fs.writeFileSync(videosPath, JSON.stringify(videos, null, 2) + '\n');
console.log(`Updated start times for ${updated} of ${videos.length} videos in public/data/videos.json`);
