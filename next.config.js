/** @type {import('next').NextConfig} */
const nextConfig = {};

const withSerwist = require("@serwist/next").default({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // Im Dev keinen Service Worker registrieren (verhindert Caching-Probleme beim Entwickeln)
  disable: process.env.NODE_ENV === "development",
});

module.exports = withSerwist(nextConfig);
