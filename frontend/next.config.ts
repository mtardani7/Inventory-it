import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const normalizedBasePath = rawBasePath
  ? `/${rawBasePath.replace(/^\/+|\/+$/g, "")}`
  : "";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  register: false,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  scope: normalizedBasePath ? `${normalizedBasePath}/` : "/",
  swUrl: normalizedBasePath ? `${normalizedBasePath}/sw.js` : "/sw.js",
  additionalPrecacheEntries: [
    { url: normalizedBasePath ? `${normalizedBasePath}/offline` : "/offline", revision: "v1" },
    {
      url: normalizedBasePath
        ? `${normalizedBasePath}/images/offline-image.png`
        : "/images/offline-image.png",
      revision: "v1",
    },
    {
      url: normalizedBasePath
        ? `${normalizedBasePath}/fonts/offline-fallback.ttf`
        : "/fonts/offline-fallback.ttf",
      revision: "v1",
    },
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: normalizedBasePath || undefined,
  assetPrefix: normalizedBasePath || undefined,

  allowedDevOrigins: [
    "192.168.0.21",
  ],

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://backend/api/:path*",
      },
    ];
  },
};

export default withSerwist(nextConfig);