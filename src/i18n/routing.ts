import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // Bahasa yang didukung
  locales: ["en", "id"],

  // Bahasa default jika user tidak terdeteksi atau langsung buka '/'
  defaultLocale: "id",

  // Opsional: matikan prefix untuk default locale (misal '/about' bukan '/id/about')
  localePrefix: "as-needed",

  // Disable browser Accept-Language auto-detection (first-time visitors always get Indonesian)
  // Language persistence is handled via NEXT_LOCALE cookie in custom middleware
  localeDetection: false,
});

// Wrapper untuk navigasi agar otomatis menyesuaikan dengan locale aktif
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
