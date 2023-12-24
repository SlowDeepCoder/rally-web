'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"flutter.js": "7d69e653079438abfbb24b82a655b0a4",
"manifest.json": "8742dde521128e9b47f54e5ce0c103e6",
"index.html": "ed1b80c7f9a5ba6b764c9f966ac976b1",
"/": "ed1b80c7f9a5ba6b764c9f966ac976b1",
"assets/AssetManifest.bin": "0e84ae68eeeb72e1f0e83ecf835a5f10",
"assets/fonts/MaterialIcons-Regular.otf": "64eed1ac4d91235864c7c186cce28ed2",
"assets/assets/music/jungle_drift.wav": "84986808e2fdf6bd32a63c1ef8ea3673",
"assets/assets/music/star_speed.wav": "c231923d4e11cbbdb2a6c93610852923",
"assets/assets/music/garage_funk.wav": "814ea4ef366652e49c6dd28019bb3108",
"assets/assets/images/desert_tile_5.png": "ed89aee54f52b409bc837f08012e8074",
"assets/assets/images/desert_tile_3.png": "16f61bd2066cb8b04b458259d75a70bf",
"assets/assets/images/desert_tile_4.png": "d4afe91ee568344b676d2cf07ea37595",
"assets/assets/images/rally-icon-new.png": "bcafbed49eefd9eba4b276d7c96a31ae",
"assets/assets/images/rally-icon-small.png": "23f7f401abd451ec373bb7fd3ba65627",
"assets/assets/images/desert_tile_2.png": "ddb18173ae15678af3c423bd4edf99db",
"assets/assets/images/explosion.png": "0940270018f81ca41ea1c0a1bc700b7f",
"assets/assets/images/rally-icon.png": "53d286f9fe4a0ee569cc703c2bf018b5",
"assets/assets/images/desert_tile_1.png": "4848f721be63dc5911f600e6fd6dc3ae",
"assets/assets/images/brick_tile_1.png": "d8d78297a0b69523b2e887d145fa02ac",
"assets/assets/images/wildwest.png": "860a9f70b6b8b0b8afd153bed77756e4",
"assets/assets/images/asfalt_tile_1.png": "d43c8a5dade9eb9bbcef3f7afa2d1023",
"assets/assets/tracks/wild_west.txt": "94042ddc3fa845892c83479f9746b8f1",
"assets/assets/sound_effects/clock_tick.mp3": "d42e61a0f75f3dee9698db5067f53e56",
"assets/assets/sound_effects/bubble_pop.mp3": "dfafb68ccecb84649ce6ba03d7793d22",
"assets/AssetManifest.bin.json": "c7df85a969bef5b0018d9d06efe5bda2",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/shaders/ink_sparkle.frag": "4096b5150bac93c41cbc9b45276bd90f",
"assets/NOTICES": "482be03bf5d23654a99e3b599b8173d8",
"assets/AssetManifest.json": "90f7566820d286dcef5f985178f1b313",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "89ed8f4e49bcdfc0b5bfc9b24591e347",
"favicon.png": "9fc4518bb01f84f1d2456a4943616928",
"main.dart.js": "6b74b75671dccc322315afc422a27e9c",
"version.json": "8abf0116b1cb2cb3b4dfd0135a556930",
"canvaskit/canvaskit.wasm": "64edb91684bdb3b879812ba2e48dd487",
"canvaskit/skwasm.js": "87063acf45c5e1ab9565dcf06b0c18b8",
"canvaskit/skwasm.wasm": "4124c42a73efa7eb886d3400a1ed7a06",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03",
"canvaskit/canvaskit.js": "eb8797020acdbdf96a12fb0405582c1b",
"canvaskit/chromium/canvaskit.wasm": "f87e541501c96012c252942b6b75d1ea",
"canvaskit/chromium/canvaskit.js": "0ae8bbcc58155679458a0f7a00f66873",
"icons/Icon-512.png": "af9b09f2e3aac266d6ce5419dcd468b6",
"icons/Icon-192.png": "451b3034328e09561e797eaa6b45eed7",
"icons/Icon-maskable-192.png": "451b3034328e09561e797eaa6b45eed7",
"icons/Icon-maskable-512.png": "af9b09f2e3aac266d6ce5419dcd468b6"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
