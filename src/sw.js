const CACHE_NAME = 'pciseal-res'

globalThis.addEventListener('install', (event) => {
  globalThis.skipWaiting()

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache =>
        cache.addAll([
          './',
          './index.html',
          './src/main.tsx',
          './src/App.tsx',
          './src/styles/App.css',
          './public/logo.png',
          './public/apple.png',
          './public/canon.png',
          './public/dji.png',
          './public/fujifilm.png',
          './public/huawei.png',
          './public/leica.png',
          './public/nikon.png',
          './public/sony.png',
          './public/xiaomi.png',
          './src/wasm/gen_brand_photo_pictrue.js',
          './src/wasm/gen_brand_photo_pictrue_bg.wasm',
        ]),
      ),
  )
})

globalThis.addEventListener('activate', (_event) => {
  globalThis.clients.claim()
})

globalThis.addEventListener('fetch', (event) => {
  return event.respondWith(
    caches.match(event.request).then((cacheData) => {
      if (cacheData) {
        return cacheData
      }

      return fetch(event.request)
    }),
  )
})
