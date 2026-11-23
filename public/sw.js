const CACHE_NAME = 'operacion-verano-v4'

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
  const { request } = event
  const { url } = request
  const isHtml = request.mode === 'navigate' || url.pathname.endsWith('.html')
  const isStatic = url.pathname.includes('icons/') || url.pathname.includes('manifest.webmanifest')

  // Network-first para HTML y JS/CSS (siempre recargar y actualizar el bundle)
  if (isHtml || (url.pathname.includes('.js') || url.pathname.includes('.css'))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache la respuesta recién obtenida
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone)
          })
          return response
        })
        .catch(() => {
          // Fallback: intentar caché local si la red falla
          return caches.match(request).then((cached) => cached || caches.match('/operacion-verano-app/index.html'))
        })
    )
    return
  }

  // Cache-first para assets estáticos (iconos, manifesto)
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).catch(() => null)
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
