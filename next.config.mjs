import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "avatar.iran.liara.run",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
  // Add CSP headers to allow Google Sign-In
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://apis.google.com; " +
              "style-src 'self' 'unsafe-inline' https://accounts.google.com; " +
              "img-src 'self' data: https://api.iconify.design https://flagcdn.com https://avatar.iran.liara.run https://api.dicebear.com https://img.youtube.com; " +
              "frame-src https://accounts.google.com https://www.youtube.com https://www.youtube-nocookie.com; " +
              "connect-src 'self' ws://127.0.0.1:* ws://localhost:* wss://127.0.0.1:* wss://localhost:* https://accounts.google.com https://oauth2.googleapis.com https://api.iconify.design http://localhost:8000 https://shortlinkmu.space https://slmu.my.id https://api.frankfurter.app https://api.exchangerate-api.com;",
          },
        ],
      },
      // Prevent caching for authenticated pages
      {
        source: "/(dashboard|admin|super-admin)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
