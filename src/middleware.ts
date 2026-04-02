import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

// Valid locales for locale extraction
const VALID_LOCALES = ["en", "id"] as const;
type Locale = (typeof VALID_LOCALES)[number];

// Helper to safely extract locale from path segments
function getLocaleFromSegments(segments: string[]): Locale {
  const firstSegment = segments[0];
  if (firstSegment && VALID_LOCALES.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  return "id"; // Default locale
}

// Cache maintenance status to avoid repeated API calls
let maintenanceCache: {
  status: boolean;
  estimatedTime: string;
  timestamp: number;
} | null = null;

const CACHE_TTL = 30000; // 30 seconds

async function checkMaintenanceStatus(request: NextRequest): Promise<{
  isMaintenanceMode: boolean;
  isWhitelisted: boolean;
  estimatedTime: string;
}> {
  const now = Date.now();

  // Use cached status if available and not expired
  if (maintenanceCache && now - maintenanceCache.timestamp < CACHE_TTL) {
    // Still need to check whitelist per-request
    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    try {
      // Forward client IP to backend
      const clientIp =
        request.headers.get("x-forwarded-for")?.split(",")[0] ||
        request.headers.get("x-real-ip") ||
        "127.0.0.1";

      const response = await fetch(`${API_URL}/settings/maintenance`, {
        headers: { "X-Forwarded-For": clientIp },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        return {
          isMaintenanceMode: data.data.maintenance_mode,
          isWhitelisted: data.data.is_whitelisted,
          estimatedTime: data.data.estimated_time,
        };
      }
    } catch {
      // API error - assume no maintenance
    }
    return {
      isMaintenanceMode: false,
      isWhitelisted: false,
      estimatedTime: "",
    };
  }

  // Fetch fresh status
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const response = await fetch(`${API_URL}/settings/maintenance`, {
      headers: { "X-Forwarded-For": clientIp },
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();

      // Update cache
      maintenanceCache = {
        status: data.data.maintenance_mode,
        estimatedTime: data.data.estimated_time,
        timestamp: now,
      };

      return {
        isMaintenanceMode: data.data.maintenance_mode,
        isWhitelisted: data.data.is_whitelisted,
        estimatedTime: data.data.estimated_time,
      };
    }
  } catch {
    // API error - assume no maintenance
  }

  return { isMaintenanceMode: false, isWhitelisted: false, estimatedTime: "" };
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass API & Static
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|mp4|webm)$/)
  ) {
    return NextResponse.next();
  }

  // 1.1. MAINTENANCE MODE CHECK
  // Bypass paths that should always work
  const maintenanceBypassPaths = [
    "/backdoor", // Admin backdoor login
    "/maintenance", // Maintenance page itself
    "/en/backdoor",
    "/id/backdoor",
    "/en/maintenance",
    "/id/maintenance",
  ];

  const isMaintenanceBypass = maintenanceBypassPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  );

  // Check if user is logged in as admin/super_admin (from cookie)
  const maintenanceUserCookie = request.cookies.get("user_data")?.value;
  let isAdminUser = false;
  if (maintenanceUserCookie) {
    try {
      const userData = JSON.parse(decodeURIComponent(maintenanceUserCookie));
      isAdminUser =
        userData.role === "admin" || userData.role === "super_admin";
    } catch {
      isAdminUser = false;
    }
  }

  // Only check maintenance for non-admin users and non-bypass paths
  if (!isMaintenanceBypass && !isAdminUser) {
    const { isMaintenanceMode, isWhitelisted } =
      await checkMaintenanceStatus(request);

    if (isMaintenanceMode && !isWhitelisted) {
      // Redirect to maintenance page
      const url = request.nextUrl.clone();
      const locale = pathname.split("/").filter(Boolean)[0];
      const validLocale = getLocaleFromSegments([locale]);
      url.pathname = `/${validLocale}/maintenance`;
      return NextResponse.redirect(url);
    }
  }

  // 1.5. SHORTLINK REWRITE PROXY
  // Detect /{code} (single segment, not a locale) and REWRITE to Backend
  // Backend will return 302 Redirect, which Next.js will pass to browser.
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 1) {
    const potentialCode = segments[0];

    // Check if it's NOT a locale (id, en) and NOT a standard route
    const isLocale = potentialCode === "id" || potentialCode === "en";
    const isSpecial = [
      "admin",
      "super-admin",
      "dashboard",
      "login",
      "register",
      "continue",
      "go",
      "expired",
      "referral",
      "backdoor", // Admin backdoor login
      "maintenance", // Maintenance page
      "test-error", // 👈 Temporary for testing error page
      // Member routes
      "analytics",
      "levels",
      "withdrawal",
      "history",
      "settings",
      "new-link",
      "ads-info",
      "my-links",
      "notifications",
      "profile",
      "tutorial",
      // Landing pages
      "about",
      "contact",
      "payout-rates",
      "terms-of-service",
      "privacy-policy",
      "report-abuse",
      "blog",
      "faq",
      // Auth pages
      "forgot-password",
      "reset-password",
      "verify-email",
      "verification-pending",
    ].includes(potentialCode);

    if (!isLocale && !isSpecial) {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      // Gunakan Rewrite agar URL backend tidak terekspos langsung, tapi browser menerima respons 302 dari backend
      return NextResponse.rewrite(`${API_URL}/links/${potentialCode}`);
    }
  }

  // 2. Redirect bare /admin or /super-admin to dashboards
  // Extract locale and check path after locale
  // const segments = pathname.split("/").filter(Boolean);
  if (segments.length >= 1) {
    const locale = segments[0]; // en or id
    const path = segments.slice(1).join("/");

    // Check if accessing bare admin or super-admin
    if (path === "admin" || path === "super-admin") {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/${path}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  // 3. AUTH PROTECTION - Check token from cookie
  const token = request.cookies.get("auth_token")?.value;
  const userDataCookie = request.cookies.get("user_data")?.value;
  let userRole: string | null = null;

  if (userDataCookie) {
    try {
      const userData = JSON.parse(decodeURIComponent(userDataCookie));
      userRole = userData.role;
    } catch (e) {
      // Invalid user data
      userRole = null;
    }
  }

  // Check if accessing protected routes
  const isDashboardPath = pathname.includes("/dashboard");
  const isAdminPath = pathname.includes("/admin");
  const isSuperAdminPath = pathname.includes("/super-admin");

  // Auth pages (login, register)
  const isAuthPage =
    pathname.includes("/login") || pathname.includes("/register");

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    const url = request.nextUrl.clone();

    const locale = getLocaleFromSegments(segments);

    // If accessing register with referral code, redirect to referral page
    const hasRefParam = request.nextUrl.searchParams.has("ref");
    const isRegisterPage = pathname.includes("/register");

    if (isRegisterPage && hasRefParam) {
      // User is logged in and clicked a referral link → show their own referral page
      url.pathname = `/${locale}/referral`;
      return NextResponse.redirect(url);
    }

    // Redirect based on role
    if (userRole === "super_admin") {
      url.pathname = `/${locale}/super-admin/dashboard`;
    } else if (userRole === "admin") {
      url.pathname = `/${locale}/admin/dashboard`;
    } else {
      url.pathname = `/${locale}/dashboard`;
    }
    return NextResponse.redirect(url);
  }

  // Protect dashboard routes - require authentication
  const memberRoutes = [
    "/new-link",
    "/ads-info",
    "/analytics",
    "/history",
    "/levels",
    "/profile",
    "/referral",
    "/settings",
    "/withdrawal",
    "/tutorial",
  ];
  const isMemberPath = memberRoutes.some((route) => pathname.includes(route));

  if ((isDashboardPath || isMemberPath) && !isAdminPath && !isSuperAdminPath) {
    // This is user dashboard (/dashboard) or member page
    if (!token) {
      const url = request.nextUrl.clone();
      const locale = getLocaleFromSegments(segments);
      url.pathname = `/${locale}/login`;
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    // Block admin from accessing user dashboard (only super_admin can access)s
    if (userRole === "admin") {
      const url = request.nextUrl.clone();
      const locale = getLocaleFromSegments(segments);
      url.pathname = `/${locale}/admin/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  // Protect admin routes - require admin or super_admin role
  if (isAdminPath && !isSuperAdminPath) {
    if (!token) {
      const url = request.nextUrl.clone();
      const locale = getLocaleFromSegments(segments);
      url.pathname = `/${locale}/login`;
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (userRole !== "admin" && userRole !== "super_admin") {
      // Not authorized - redirect to user dashboard
      const url = request.nextUrl.clone();
      const locale = getLocaleFromSegments(segments);
      url.pathname = `/${locale}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  // Protect super-admin routes - require super_admin role only
  if (isSuperAdminPath) {
    if (!token) {
      const url = request.nextUrl.clone();
      const locale = getLocaleFromSegments(segments);
      url.pathname = `/${locale}/login`;
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (userRole !== "super_admin") {
      // Not super admin - redirect based on role
      const url = request.nextUrl.clone();
      const locale = getLocaleFromSegments(segments);
      if (userRole === "admin") {
        url.pathname = `/${locale}/admin/dashboard`;
      } else {
        url.pathname = `/${locale}/dashboard`;
      }
      return NextResponse.redirect(url);
    }
  }

  // 4. LOCALE PERSISTENCE via NEXT_LOCALE cookie
  // If user has a stored language preference (set when switching language anywhere),
  // redirect them to their preferred locale when visiting without explicit locale prefix
  const preferredLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (
    preferredLocale &&
    VALID_LOCALES.includes(preferredLocale as Locale) &&
    preferredLocale !== "id" // Only redirect for non-default locale
  ) {
    const firstSegment = segments[0];
    const hasLocalePrefix = VALID_LOCALES.includes(firstSegment as Locale);

    // If URL doesn't have a locale prefix, user is on default locale (id)
    // but their preference says otherwise → redirect to preferred locale
    if (!hasLocalePrefix) {
      const url = request.nextUrl.clone();
      url.pathname = `/${preferredLocale}${pathname}`;
      return NextResponse.redirect(url);
    }
  }

  // 5. Lanjut ke i18n Handler
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)", "/"],
};
