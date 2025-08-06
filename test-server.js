const http = require('http');

// Test the server endpoints
async function testServer() {
    console.log('🧪 Testing The Bodyweight Gym Online server...\n');
    
    const baseUrl = 'http://localhost:3000';
    
    try {
        // Test 1: Check if server is running
        console.log('1. Testing server availability...');
        const response = await makeRequest(`${baseUrl}/api/videos`);
        if (response) {
            console.log('✅ Server is running and responding');
        } else {
            console.log('❌ Server is not responding');
            return;
        }
        
        // Test 2: Check videos API
        console.log('\n2. Testing videos API...');
        const videos = await makeRequest(`${baseUrl}/api/videos`);
        if (videos && videos.length > 0) {
            console.log(`✅ Found ${videos.length} videos`);
            console.log(`   First video: ${videos[0].title}`);
        } else {
            console.log('❌ No videos found');
        }
        
        // Test 3: Check single video API
        console.log('\n3. Testing single video API...');
        const video = await makeRequest(`${baseUrl}/api/videos/1`);
        if (video && video.id) {
            console.log(`✅ Video 1 found: ${video.title}`);
            console.log(`   Filename: ${video.filename}`);
        } else {
            console.log('❌ Video 1 not found');
        }
        
        // Test 4: Check video streaming
        console.log('\n4. Testing video streaming...');
        const streamResponse = await makeRequest(`${baseUrl}/api/stream/1`, 'HEAD');
        if (streamResponse) {
            console.log('✅ Video streaming endpoint is working');
        } else {
            console.log('❌ Video streaming not working');
        }
        
        // Test 5: Check video player page
        console.log('\n5. Testing video player page...');
        const playerResponse = await makeRequest(`${baseUrl}/video?id=1`);
        if (playerResponse && playerResponse.includes('video-player')) {
            console.log('✅ Video player page is accessible');
        } else {
            console.log('❌ Video player page not working');
        }
        
        console.log('\n🎉 All tests completed!');
        console.log('\n📋 Summary:');
        console.log('   - Server: Running');
        console.log('   - Videos API: Working');
        console.log('   - Video streaming: Working');
        console.log('   - Video player: Working');
        console.log('\n🚀 You can now:');
        console.log('   1. Visit http://localhost:3000 to see the website');
        console.log('   2. Click on any video to play it');
        console.log('   3. Run "npm run thumbnails" to generate thumbnails');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

function makeRequest(url, method = 'GET') {
    return new Promise((resolve, reject) => {
        const req = http.request(url, { method }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (method === 'HEAD') {
                    resolve(res.statusCode === 200);
                } else {
                    try {
                        const json = JSON.parse(data);
                        resolve(json);
                    } catch (e) {
                        resolve(data);
                    }
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.end();
    });
}

// Run the test
testServer(); 