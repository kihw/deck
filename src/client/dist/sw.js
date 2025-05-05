// Service Worker for Deck PWA
const CACHE_NAME = 'deck-cache-v1';
const RUNTIME_CACHE = 'deck-runtime-cache-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/favicon-32x32.png',
  '/icons/favicon-16x16.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('deck-') &&
                   cacheName !== CACHE_NAME &&
                   cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Handle Socket.IO requests
  if (request.url.includes('socket.io')) {
    return event.respondWith(fetch(request));
  }
  
  // Handle API requests
  if (request.url.includes('/api/')) {
    return event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(request).then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => {
          // Return cached API response if offline
          return cache.match(request);
        });
      })
    );
  }
  
  // Handle static assets
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        console.log('Serving from cache:', request.url);
        return response;
      }
      
      console.log('Fetching from network:', request.url);
      return fetch(request.clone()).then((response) => {
        // Don't cache if not a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Cache the fetched response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return response;
      });
    }).catch(() => {
      // Return a fallback for navigation requests when offline
      if (request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});

// Handle sync events for offline queue
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB
    const db = await openDB();
    const actions = await getOfflineActions(db);
    
    // Sync each action
    for (const action of actions) {
      try {
        const response = await fetch('/api/actions', {
          method: 'POST',
          body: JSON.stringify(action),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          await deleteOfflineAction(db, action.id);
        }
      } catch (error) {
        console.error('Failed to sync action:', error);
      }
    }
  } catch (error) {
    console.error('Failed to sync offline actions:', error);
  }
}

// IndexedDB helpers for offline storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DeckDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('actions')) {
        db.createObjectStore('actions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getOfflineActions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['actions'], 'readonly');
    const store = transaction.objectStore('actions');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteOfflineAction(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['actions'], 'readwrite');
    const store = transaction.objectStore('actions');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});