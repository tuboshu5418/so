// 定义缓存名称和版本
const CACHE_NAME = 'star-search-v1';
const urlsToCache = [
  '/',
  'index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap',
  'https://s.cn.bing.net/th?id=OHR.BunnyLove_ZH-CN1145897965_1920x1080.jpg',
  'https://cdn.jsdelivr.net/gh/zmf-imooc/images@main/wechat-pay.png',
  'https://cdn.jsdelivr.net/gh/zmf-imooc/images@main/alipay.png'
];

// 安装Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 拦截请求并使用缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中 - 返回响应
        if (response) {
          return response;
        }
        
        // 重要：克隆请求
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // 检查是否收到有效响应
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 重要：克隆响应
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

// 激活时清理旧缓存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
