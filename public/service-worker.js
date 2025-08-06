// service-worker.js - The Bodyweight Gym Online PWA

const CACHE_NAME = 'bodyweight-gym-v1';
const DYNAMIC_CACHE = 'bodyweight-gym-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/main.css',
  '/video-play.js',
  '/manifest.json',
  '/offline.html',
  // Add any other static assets
];

// Video cache configuration
const VIDEO_CACHE = 'bodyweight-gym-videos-v1';
const MAX_VIDEO_CACHE_SIZE = 50; // Maximum number of videos to cache
const VIDEO_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE && cache !== VIDEO_CACHE) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle video streaming requests
  if (request.url.includes('/api/stream/')) {
    event.respondWith(handleVideoStream(request));
    return;
  }

  // Handle API requests
  if (request.url.includes('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Handle video streaming with partial content support
async function handleVideoStream(request) {
  const cache = await caches.open(VIDEO_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Check if cached video is still fresh
    const cachedTime = new Date(cachedResponse.headers.get('sw-cached-time'));
    const now = new Date();
    
    if (now - cachedTime < VIDEO_CACHE_DURATION) {
      console.log('Service Worker: Serving video from cache');
      return cachedResponse;
    }
  }

  try {
    const response = await fetch(request);
    
    if (response.status === 206) {
      // Handle partial content requests
      return response;
    }

    // Cache the full video response
    const responseToCache = response.clone();
    const headers = new Headers(responseToCache.headers);
    headers.append('sw-cached-time', new Date().toISOString());
    
    const cachedResponseWithTime = new Response(responseToCache.body, {
      status: responseToCache.status,
      statusText: responseToCache.statusText,
      headers: headers
    });

    cache.put(request, cachedResponseWithTime);
    
    // Clean up old video cache entries
    cleanVideoCache();
    
    return response;
  } catch (error) {
    // If network fails, try to return cached version
    if (cachedResponse) {
      console.log('Service Worker: Network failed, serving stale video from cache');
      return cachedResponse;
    }
    
    throw error;
  }
}

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful GET requests
    if (request.method === 'GET' && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // If network fails, try cache for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('Service Worker: Serving API response from cache');
        return cachedResponse;
      }
    }
    
    // Return error response
    return new Response(JSON.stringify({
      error: 'Network request failed',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Clean up old video cache entries
async function cleanVideoCache() {
  const cache = await caches.open(VIDEO_CACHE);
  const keys = await cache.keys();
  
  if (keys.length > MAX_VIDEO_CACHE_SIZE) {
    // Get all entries with their cached times
    const entries = await Promise.all(
      keys.map(async (key) => {
        const response = await cache.match(key);
        const cachedTime = new Date(response.headers.get('sw-cached-time') || 0);
        return { key, cachedTime };
      })
    );
    
    // Sort by cached time (oldest first)
    entries.sort((a, b) => a.cachedTime - b.cachedTime);
    
    // Delete oldest entries
    const entriesToDelete = entries.slice(0, keys.length - MAX_VIDEO_CACHE_SIZE);
    await Promise.all(
      entriesToDelete.map(({ key }) => cache.delete(key))
    );
    
    console.log(`Service Worker: Cleaned up ${entriesToDelete.length} old video cache entries`);
  }
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

async function syncFavorites() {
  const cache = await caches.open('offline-actions');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const response = await fetch(request.clone());
      
      if (response.ok) {
        await cache.delete(request);
        console.log('Service Worker: Synced offline action');
      }
    } catch (error) {
      console.error('Service Worker: Failed to sync offline action', error);
    }
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Go to workout',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close notification',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app and navigate to the workout
    event.waitUntil(
      clients.openWindow('/workouts')
    );
  }
});

// Handle message events for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_VIDEO') {
    event.waitUntil(
      cacheVideo(event.data.videoId, event.data.url)
    );
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    event.waitUntil(
      getCacheStatus().then((status) => {
        event.ports[0].postMessage(status);
      })
    );
  }
});

// Cache a specific video
async function cacheVideo(videoId, url) {
  try {
    const cache = await caches.open(VIDEO_CACHE);
    const response = await fetch(url);
    
    if (response.ok) {
      await cache.put(url, response);
      
      // Notify all clients that video was cached
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'VIDEO_CACHED',
          videoId: videoId
        });
      });
    }
  } catch (error) {
    console.error('Service Worker: Failed to cache video', error);
  }
}

// Get cache storage status
async function getCacheStatus() {
  const caches = await self.caches.keys();
  const status = {
    caches: {},
    totalSize: 0
  };

  for (const cacheName of caches) {
    const cache = await self.caches.open(cacheName);
    const keys = await cache.keys();
    
    let cacheSize = 0;
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        cacheSize += blob.size;
      }
    }
    
    status.caches[cacheName] = {
      count: keys.length,
      size: cacheSize
    };
    status.totalSize += cacheSize;
  }

  // Add storage quota info if available
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    status.quota = estimate.quota;
    status.usage = estimate.usage;
  }

  return status;
}

// Periodic background sync for updating cached content
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-videos') {
    event.waitUntil(updateCachedVideos());
  }
});

async function updateCachedVideos() {
  console.log('Service Worker: Updating cached videos in background');
  
  const cache = await caches.open(VIDEO_CACHE);
  const keys = await cache.keys();
  
  // Update metadata for cached videos
  for (const request of keys) {
    if (request.url.includes('/api/videos/')) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response);
        }
      } catch (error) {
        console.error('Service Worker: Failed to update cached video metadata', error);
      }
    }
  }
}