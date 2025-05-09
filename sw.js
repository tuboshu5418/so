// 定义缓存名称和版本
const CACHE_NAME = 'star-search-portal-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap'
];

// 安装Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截请求并返回缓存内容
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果缓存中有请求的资源，则返回缓存内容
        if (response) {
          return response;
        }

        // 否则从网络获取资源
        return fetch(event.request).then((response) => {
          // 检查是否获取到有效的响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 克隆响应以进行缓存
          const responseToCache = response.clone();

          // 将获取的资源添加到缓存中
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // 如果网络请求失败，可以返回一个备用页面
          return caches.match('/offline.html');
        });
      })
  );
});

// 监听推送事件
self.addEventListener('push', (event) => {
  const title = '星汉搜索';
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 监听通知点击事件
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
