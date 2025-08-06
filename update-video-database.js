const fs = require('fs');
const path = require('path');

// Read the analysis results
const startTimesData = JSON.parse(fs.readFileSync('video-start-times.json', 'utf8'));

// Read the current server.js file
const serverJsPath = path.join(__dirname, 'server.js');
let serverJsContent = fs.readFileSync(serverJsPath, 'utf8');

// Function to update video database with start times
function updateVideoDatabase() {
  console.log('Updating video database with start times...');
  
  // Find the video database section in server.js
  const videoDbStart = serverJsContent.indexOf('const videoDatabase = [');
  const videoDbEnd = serverJsContent.indexOf('];', videoDbStart) + 2;
  
  if (videoDbStart === -1 || videoDbEnd === -1) {
    console.error('Could not find video database in server.js');
    return;
  }
  
  // Create updated video database with start times
  let updatedVideoDb = 'const videoDatabase = [\n';
  
  startTimesData.forEach((video, index) => {
    updatedVideoDb += `  {\n`;
    updatedVideoDb += `    id: ${video.id},\n`;
    updatedVideoDb += `    title: "${video.title}",\n`;
    updatedVideoDb += `    instructor: "${video.instructor}",\n`;
    updatedVideoDb += `    duration: "${video.duration}",\n`;
    updatedVideoDb += `    level: "${video.level}",\n`;
    updatedVideoDb += `    category: "${video.category}",\n`;
    updatedVideoDb += `    equipment: "${video.equipment}",\n`;
    updatedVideoDb += `    description: "${video.description}",\n`;
    updatedVideoDb += `    thumbnail: "${video.thumbnail}",\n`;
    updatedVideoDb += `    filename: "${video.filename}",\n`;
    updatedVideoDb += `    views: ${video.views},\n`;
    updatedVideoDb += `    rating: ${video.rating},\n`;
    updatedVideoDb += `    startTime: ${video.startTime},\n`;
    updatedVideoDb += `    startTimeFormatted: "${video.startTimeFormatted}"\n`;
    updatedVideoDb += `  }`;
    
    if (index < startTimesData.length - 1) {
      updatedVideoDb += ',';
    }
    updatedVideoDb += '\n';
  });
  
  updatedVideoDb += '];\n';
  
  // Replace the video database section
  const beforeVideoDb = serverJsContent.substring(0, videoDbStart);
  const afterVideoDb = serverJsContent.substring(videoDbEnd);
  
  serverJsContent = beforeVideoDb + updatedVideoDb + afterVideoDb;
  
  // Write the updated server.js file
  fs.writeFileSync(serverJsPath, serverJsContent);
  
  console.log('✅ Video database updated with start times!');
  console.log(`📊 Updated ${startTimesData.length} videos with start times`);
}

// Run the update
updateVideoDatabase(); 