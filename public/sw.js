// ============================================================================
// SERVICE WORKER - INTERBØX V2
// ============================================================================
// Push Notifications + PWA + Cache Strategy
// ============================================================================

const CACHE_NAME = 'interbox-v2-cache-v1';
const STATIC_CACHE = 'interbox-static-v1';
const DYNAMIC_CACHE = 'interbox-dynamic-v1';

// Assets para cache estático
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/favicon-192x192.png',
  '/favicon-512x512.png',
  '/offline.html'
];

// ============================================================================
// INSTALL EVENT - Cache estático
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error caching static assets:', error);
      })
  );
});

// ============================================================================
// ACTIVATE EVENT - Limpeza de caches antigos
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// ============================================================================
// FETCH EVENT - Estratégia de cache
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Estratégia para diferentes tipos de recursos
  if (url.pathname.startsWith('/api/')) {
    // API calls - Network First
    event.respondWith(networkFirstStrategy(request));
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|ico)$/)) {
    // Assets estáticos - Cache First
    event.respondWith(cacheFirstStrategy(request));
  } else if (url.pathname.startsWith('/')) {
    // Páginas - Stale While Revalidate
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// ============================================================================
// ESTRATÉGIAS DE CACHE
// ============================================================================

// Network First - Para API calls
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para API calls
    return new Response(
      JSON.stringify({ error: 'Network unavailable' }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache First - Para assets estáticos
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Asset not found in cache or network:', error);
    return new Response('Asset not found', { status: 404 });
  }
}

// Stale While Revalidate - Para páginas
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Se a rede falhar, retornar cached ou offline page
    return cachedResponse || caches.match('/offline.html');
  });
  
  return cachedResponse || fetchPromise;
}

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  if (!event.data) {
    console.log('[SW] Push event but no data');
    return;
  }
  
  try {
    const data = event.data.json();
    console.log('[SW] Push data:', data);
    
    const options = {
      body: data.body || 'Nova notificação do INTERBØX',
      icon: data.icon || '/favicon-192x192.png',
      badge: data.badge || '/favicon-96x96.png',
      image: data.image,
      tag: data.tag || 'interbox-notification',
      data: {
        url: data.action_url || '/',
        campaign_id: data.campaign_id,
        timestamp: Date.now()
      },
      actions: data.actions || [
        {
          action: 'open',
          title: 'Abrir',
          icon: '/favicon-96x96.png'
        },
        {
          action: 'dismiss',
          title: 'Dispensar'
        }
      ],
      requireInteraction: data.priority === 'urgent' || data.priority === 'high',
      silent: data.silent || false,
      vibrate: data.vibrate || [200, 100, 200],
      timestamp: data.timestamp || Date.now()
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'INTERBØX', options)
        .then(() => {
          console.log('[SW] Notification shown successfully');
          // Log da notificação enviada
          return logNotificationEvent(data.campaign_id, 'shown');
        })
        .catch((error) => {
          console.error('[SW] Error showing notification:', error);
          return logNotificationEvent(data.campaign_id, 'error', error.message);
        })
    );
    
  } catch (error) {
    console.error('[SW] Error parsing push data:', error);
    
    // Fallback para notificação simples
    event.waitUntil(
      self.registration.showNotification('INTERBØX', {
        body: 'Você tem uma nova notificação',
        icon: '/favicon-192x192.png',
        tag: 'interbox-fallback'
      })
    );
  }
});

// ============================================================================
// NOTIFICATION CLICK
// ============================================================================

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const data = event.notification.data || {};
  const action = event.action;
  
  if (action === 'dismiss') {
    console.log('[SW] Notification dismissed');
    return;
  }
  
  // Log do clique
  if (data.campaign_id) {
    logNotificationEvent(data.campaign_id, 'clicked');
  }
  
  // Abrir a URL da notificação
  const urlToOpen = data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Verificar se já existe uma janela aberta
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('[SW] Error opening window:', error);
      })
  );
});

// ============================================================================
// NOTIFICATION CLOSE
// ============================================================================

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
  
  const data = event.notification.data || {};
  if (data.campaign_id) {
    logNotificationEvent(data.campaign_id, 'closed');
  }
});

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'notification-log') {
    event.waitUntil(syncNotificationLogs());
  }
});

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

// Log de eventos de notificação
async function logNotificationEvent(campaignId, event, error = null) {
  if (!campaignId) return;
  
  try {
    const response = await fetch('/api/log-notification-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaign_id: campaignId,
        event: event,
        error: error,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      console.error('[SW] Failed to log notification event');
    }
  } catch (error) {
    console.error('[SW] Error logging notification event:', error);
  }
}

// Sincronizar logs de notificação
async function syncNotificationLogs() {
  try {
    // Implementar sincronização de logs offline
    console.log('[SW] Syncing notification logs...');
  } catch (error) {
    console.error('[SW] Error syncing notification logs:', error);
  }
}

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

self.addEventListener('error', (event) => {
  console.error('[SW] Service Worker error:', event);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event);
});

console.log('[SW] Service Worker loaded successfully');
