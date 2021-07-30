/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */
import { precacheAndRoute } from 'workbox-webpack-plugin';
import { registerRoute } from 'workbox-routing';
import {
  StaleWhileRevalidate,
  CacheFirst,
  NetworkFirst,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Config
precacheAndRoute(self.__WB_MANIFEST);

// Caching strategies
registerRoute(
  ({ request }) => request.destination === 'style',
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
      }),
      new CacheableResponsePlugin({
        statues: [0, 200],
      }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/social-timeline/'),
  new NetworkFirst(),
);

registerRoute(
  ({ url }) => url.href.startsWith('http'),
  new StaleWhileRevalidate(),
);
