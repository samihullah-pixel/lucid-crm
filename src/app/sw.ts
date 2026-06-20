/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  CacheableResponsePlugin,
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  Serwist,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Fotos & Videos der Schritte (Vercel Blob) — offline-fest cachen
    {
      matcher: ({ url }) => url.hostname.endsWith("blob.vercel-storage.com"),
      handler: new CacheFirst({
        cacheName: "sop-media",
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({
            maxEntries: 120,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Tage
            purgeOnQuotaError: true,
          }),
        ],
      }),
    },
    // Anleitungs-Seiten /sop/<token> — online aktuell, offline aus Cache
    {
      matcher: ({ request, url }) =>
        request.mode === "navigate" && url.pathname.startsWith("/sop/"),
      handler: new NetworkFirst({
        cacheName: "sop-pages",
        networkTimeoutSeconds: 5,
        plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
      }),
    },
    // Google Fonts (Cormorant / Jost) offline verfügbar halten
    {
      matcher: ({ url }) =>
        url.hostname === "fonts.googleapis.com" ||
        url.hostname === "fonts.gstatic.com",
      handler: new CacheFirst({
        cacheName: "sop-fonts",
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 }),
        ],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
