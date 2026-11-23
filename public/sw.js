const CACHE_NAME = 'operacion-verano-v2'
const CACHE_URLS = [
  '/operacion-verano-app/',
  '/operacion-verano-app/index.html',
  '/operacion-verano-app/manifest.webmanifest',
  '/operacion-verano-app/icons/icon-192.png',
  '/operacion-verano-app/icons/icon-512.png',
  '/operacion-verano-app/icons/apple-touch-icon.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_URLS)
    }).then(() => {
      self.skipWaiting()
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    }).then(() => {
      self.clients.claim()
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // If cache and network both fail, return a blank response
        // to avoid breaking the page with an error
        return new Response('', { status: 200, headers: { 'Content-Type': 'text/html' } })
      }).then((response) => {
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone)
          })
        }
        return response
      })
    })
  )
})

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (e) {
    data = { message: event.data ? event.data.text() : 'Recordatorio de OPERACIÓN VERANO' }
  }
  const title = data.title || 'OPERACIÓN VERANO'
  const options = {
    body: data.body || '¿Ya has entrenado hoy? Da el siguiente paso.',
    icon: '/operacion-verano-app/icons/icon-192.png',
    badge: '/operacion-verano-app/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: '/' },
    actions: [
      { action: 'open', title: 'Abrir app' },
      { action: 'dismiss', title: 'Más tarde' },
    ],
  }
  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'open') {
    event.waitUntil(
      self.clients.openWindow(self.location.origin + '/')
    )
  }
})
