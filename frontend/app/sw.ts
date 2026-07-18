import { defaultCache } from "@serwist/next/worker";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  Serwist,
  type PrecacheEntry,
  type SerwistGlobalConfig,
  StaleWhileRevalidate,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: typeof globalThis & ServiceWorkerGlobalScope;

const API_GET_CACHE_NAME = "inventory-api-get";
const STYLE_CACHE_NAME = "inventory-styles";
const SCRIPT_CACHE_NAME = "inventory-scripts";
const FONT_CACHE_NAME = "inventory-fonts";
const IMAGE_CACHE_NAME = "inventory-images";
const NEXT_STATIC_CACHE_NAME = "inventory-next-static";

const scopePathname = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const scopedPath = (path: string) => `${scopePathname}${path}`;

const OFFLINE_DOCUMENT_PATH = scopedPath("/offline");
const OFFLINE_IMAGE_PATH = scopedPath("/images/offline-image.png");
const OFFLINE_FONT_PATH = scopedPath("/fonts/offline-fallback.ttf");

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  cleanupOutdatedCaches: true,
  disableDevLogs: true,
  runtimeCaching: [
    ...defaultCache,
    {
      matcher: ({ request }) => request.destination === "style",
      handler: new StaleWhileRevalidate({
        cacheName: STYLE_CACHE_NAME,
        plugins: [new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 7 })],
      }),
    },
    {
      matcher: ({ request }) => request.destination === "script",
      handler: new StaleWhileRevalidate({
        cacheName: SCRIPT_CACHE_NAME,
        plugins: [new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 7 })],
      }),
    },
    {
      matcher: ({ request }) => request.destination === "font",
      handler: new CacheFirst({
        cacheName: FONT_CACHE_NAME,
        plugins: [new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 })],
      }),
    },
    {
      matcher: ({ request }) => request.destination === "image",
      handler: new StaleWhileRevalidate({
        cacheName: IMAGE_CACHE_NAME,
        plugins: [new ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 })],
      }),
    },
    {
      matcher: ({ url }) => url.pathname.includes("/_next/static/"),
      handler: new StaleWhileRevalidate({
        cacheName: NEXT_STATIC_CACHE_NAME,
        plugins: [new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 })],
      }),
    },
    {
      matcher: ({ request, url }) =>
        request.method === "GET" &&
        (url.pathname.startsWith("/api/") || url.pathname.includes("/api/")),
      handler: new NetworkFirst({
        cacheName: API_GET_CACHE_NAME,
        networkTimeoutSeconds: 8,
        plugins: [new ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 60 * 60 * 6 })],
      }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: OFFLINE_DOCUMENT_PATH,
        matcher: ({ request }) => request.destination === "document",
      },
      {
        url: OFFLINE_IMAGE_PATH,
        matcher: ({ request }) => request.destination === "image",
      },
      {
        url: OFFLINE_FONT_PATH,
        matcher: ({ request }) => request.destination === "font",
      },
    ],
  },
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

serwist.addEventListeners();
