// src/services/dashboardService.ts
import type {
  DashboardSlide,
  MilestoneData,
  ReferralCardData,
  TopTrafficStats,
  TopPerformingLink,
  AnalyticsData,
  TimeRange,
  StatType,
  AdminDashboardStats,
} from "@/types/type";
import { Sparkles, Megaphone, Wallet, Star } from "lucide-react";
import { getToken } from "./authService";

// --- API BASE URL ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Helper: Auth headers (uses authService.getToken)
function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Helper untuk API call
const apiCall = async <T>(endpoint: string): Promise<T> => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: authHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  const json = await res.json();
  return json.data;
};

// --- SLIDES CONFIG: Static configuration only (text comes from translations) ---
export interface SlideConfig {
  id: string;
  link: string;
  icon: typeof Sparkles;
  theme: "blue" | "purple" | "orange";
}

export const SLIDE_CONFIGS: SlideConfig[] = [
  {
    id: "welcome",
    link: "/new-link",
    icon: Sparkles,
    theme: "blue",
  },
  {
    id: "event",
    link: "/levels",
    icon: Megaphone,
    theme: "purple",
  },
  {
    id: "feature",
    link: "/settings#payment",
    icon: Wallet,
    theme: "orange",
  },
];

// 🎨 DEMO MODE: Set to true for screenshot purposes
const DEMO_MODE = false;

// --- MILESTONE: Connect to /api/user/levels ---
export const getMilestone = async (): Promise<MilestoneData> => {
  // 🎨 DEMO: Pro-rank user — ~12-18 months active, content creator
  if (DEMO_MODE) {
    return {
      icon: Star,
      currentLevel: "Pro",
      nextLevel: "Master",
      currentEarnings: 2800,
      nextTarget: 5000,
      currentBonus: 15,
      nextBonus: 25,
      progress: 45,
      iconName: "gem",
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    };
  }

  try {
    const data = await apiCall<{
      card: {
        current_level: string;
        current_level_name: string;
        current_earnings: number;
        current_level_cpm: number;
        next_level_name: string | null;
        next_level_min: number;
        next_level_cpm: number;
        progress_percent: number;
      };
      levels: {
        id: string;
        name: string;
        icon: string;
        icon_color: string;
        bg_color: string;
        border_color: string;
      }[];
    }>("/user/levels");

    // Find current level styling from levels array
    const currentLevelData = data.levels.find(
      (l) => l.id.toLowerCase() === data.card.current_level.toLowerCase(),
    );

    return {
      icon: Star,
      currentLevel: data.card.current_level_name,
      nextLevel: data.card.next_level_name || "Max Level",
      currentEarnings: data.card.current_earnings,
      nextTarget: data.card.next_level_min,
      currentBonus: data.card.current_level_cpm,
      nextBonus: data.card.next_level_cpm,
      progress: data.card.progress_percent,
      // Level styling from DB
      iconName: currentLevelData?.icon || "star",
      iconColor: currentLevelData?.icon_color || "text-yellow-400",
      bgColor: currentLevelData?.bg_color || "bg-yellow-500/10",
      borderColor: currentLevelData?.border_color || "border-yellow-500/30",
    };
  } catch (error) {
    console.error("Failed to fetch milestone data:", error);
    // Fallback data
    return {
      icon: Star,
      currentLevel: "Beginner",
      nextLevel: "Rookie",
      currentEarnings: 0,
      nextTarget: 50,
      currentBonus: 0,
      nextBonus: 5,
      progress: 0,
      iconName: "star",
      iconColor: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
    };
  }
};

// --- REFERRAL: Connect to /api/dashboard/overview ---
export const getReferralData = async (): Promise<ReferralCardData> => {
  // 🎨 DEMO: Pro user — decent referral network
  if (DEMO_MODE) {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://shortlinkmu.com";
    return {
      referralLink: `${baseUrl}/register?ref=kevin24`,
      totalUsers: 12,
    };
  }

  try {
    const data = await apiCall<{
      referral: {
        code: string;
        users: number;
      };
    }>("/dashboard/overview");

    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://shortlinkmu.com";

    return {
      referralLink: `${baseUrl}/register?ref=${data.referral.code}`,
      totalUsers: data.referral.users,
    };
  } catch (error) {
    console.error("Failed to fetch referral data:", error);
    return {
      referralLink: "",
      totalUsers: 0,
    };
  }
};

export const getTrafficStats = async (): Promise<TopTrafficStats> => {
  // 🎨 DEMO: Pro user — solid monthly traffic
  if (DEMO_MODE) {
    return {
      topMonth: { month: "March", views: 12480 },
      topYear: { year: "2026", views: 84230 },
      topLevel: { level: "pro", cpmBonusPercent: 15 },
    };
  }

  try {
    const data = await apiCall<{
      items: {
        month: string;
        label: string;
        valid_clicks: number;
        earnings: number;
        average_cpm: number;
        user_level: string;
        level_cpm_bonus: number;
      }[];
    }>("/analytics/monthly-performance?range=12months");

    // Find the month with highest activity
    // Priority: earnings > valid_clicks (earnings is more reliable indicator)
    // Edge case: if all months have 0 data, use current month (last in array)
    const hasAnyActivity = data.items.some(
      (item) => item.earnings > 0 || item.valid_clicks > 0,
    );

    let topMonth;
    if (!hasAnyActivity) {
      // If no activity at all, show current month instead of defaulting to January
      topMonth = data.items[data.items.length - 1];
    } else {
      topMonth = data.items.reduce((max, item) => {
        // If current item has higher earnings, it's the top
        if (item.earnings > (max?.earnings || 0)) {
          return item;
        }
        // If earnings are equal, compare valid_clicks
        if (
          item.earnings === (max?.earnings || 0) &&
          item.valid_clicks > (max?.valid_clicks || 0)
        ) {
          return item;
        }
        return max;
      }, data.items[0]);
    }

    // Get current month's level (last item in array)
    const currentMonth = data.items[data.items.length - 1];

    // Calculate total views this year
    const totalViewsYear = data.items.reduce(
      (sum, item) => sum + item.valid_clicks,
      0,
    );

    // Extract month name only (remove year from "December 2025" -> "December")
    const monthLabel = topMonth?.label || "N/A";
    const monthNameOnly = monthLabel.split(" ")[0]; // Get first word (month name)

    return {
      topMonth: {
        month: monthNameOnly,
        views: topMonth?.valid_clicks || 0,
      },
      topYear: {
        year: new Date().getFullYear().toString(),
        views: totalViewsYear,
      },
      topLevel: {
        level: (currentMonth?.user_level?.toLowerCase() || "beginner") as any,
        cpmBonusPercent: currentMonth?.level_cpm_bonus || 0,
      },
    };
  } catch (error) {
    console.error("Failed to fetch traffic stats:", error);
    return {
      topMonth: { month: "N/A", views: 0 },
      topYear: { year: new Date().getFullYear().toString(), views: 0 },
      topLevel: { level: "beginner", cpmBonusPercent: 0 },
    };
  }
};

// --- TOP LINKS: Connect to /api/dashboard/overview (limit 10) ---
export const getTopLinks = async (): Promise<TopPerformingLink[]> => {
  // 🎨 DEMO: Pro user — Indonesian content creator with niche audience
  if (DEMO_MODE) {
    const shortlinkBaseUrl = "https://slmu.my.id";
    return [
      {
        id: "1",
        title: "Tutorial Laravel 11 CRUD Lengkap",
        shortUrl: `${shortlinkBaseUrl}/lrv11`,
        originalUrl: "https://youtube.com/watch?v=laravel-11-crud",
        validViews: 14820,
        totalEarnings: 68.17,
        cpm: 4.6,
        adsLevel: "level2",
      },
      {
        id: "2",
        title: "Source Code Aplikasi Kasir Gratis",
        shortUrl: `${shortlinkBaseUrl}/kasir`,
        originalUrl: "https://github.com/example/pos-system",
        validViews: 11250,
        totalEarnings: 49.50,
        cpm: 4.4,
        adsLevel: "level3",
      },
      {
        id: "3",
        title: "Cara Deploy Website ke VPS Murah",
        shortUrl: `${shortlinkBaseUrl}/vps26`,
        originalUrl: "https://blog.example.com/deploy-vps-guide",
        validViews: 8730,
        totalEarnings: 37.54,
        cpm: 4.3,
        adsLevel: "level2",
      },
      {
        id: "4",
        title: "Template CV ATS Friendly 2026",
        shortUrl: `${shortlinkBaseUrl}/cvats`,
        originalUrl: "https://drive.google.com/cv-template-ats",
        validViews: 6920,
        totalEarnings: 28.37,
        cpm: 4.1,
        adsLevel: "level2",
      },
      {
        id: "5",
        title: "Preset CapCut Cinematic Pack",
        shortUrl: `${shortlinkBaseUrl}/ccpak`,
        originalUrl: "https://drive.google.com/capcut-cinematic",
        validViews: 5410,
        totalEarnings: 21.10,
        cpm: 3.9,
        adsLevel: "level1",
      },
    ];
  }

  try {
    const data = await apiCall<{
      top_links: {
        id: number;
        title: string | null;
        short_url: string;
        original_url: string;
        views: number;
        valid_views: number;
        earnings: number;
        cpm: number;
      }[];
    }>("/dashboard/overview");

    // Shortlink base URL (backend handles shortlink resolution)
    const shortlinkBaseUrl =
      process.env.NEXT_PUBLIC_SHORTLINK_URL || "http://localhost:8000";

    let untitledCounter = 0;
    return data.top_links.slice(0, 10).map((link) => {
      // Extract code from backend URL: "http://localhost:8000/links/{code}" -> "{code}"
      const urlParts = link.short_url.split("/");
      const code = urlParts[urlParts.length - 1]; // Get last segment as code
      const cleanShortUrl = `${shortlinkBaseUrl}/${code}`;

      // Use title from backend, or "Untitled" with counter if no title
      let displayTitle = link.title;
      if (!displayTitle || displayTitle.trim() === "") {
        untitledCounter++;
        displayTitle = `Untitled ${untitledCounter}`;
      }

      return {
        id: link.id.toString(),
        title: displayTitle,
        shortUrl: cleanShortUrl,
        originalUrl: link.original_url,
        validViews: link.valid_views,
        totalEarnings: link.earnings,
        cpm: link.cpm,
        adsLevel: "level1", // Default
      };
    });
  } catch (error) {
    console.error("Failed to fetch top links:", error);
    return [];
  }
};

// --- ANALYTICS: Connect to /api/dashboard/analytics (Weekly Only) ---
export const getAnalytics = async (
  range: TimeRange,
  stat: StatType,
): Promise<AnalyticsData> => {
  // 🎨 DEMO: Pro user — consistent daily traffic with weekend peaks
  if (DEMO_MODE) {
    const daysOfWeek = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

    if (stat === "totalViews") {
      return {
        series: [
          {
            name: "Valid Clicks",
            data: [1120, 1340, 1080, 1510, 1780, 2430, 2150],
          },
        ],
        categories: daysOfWeek,
      };
    } else if (stat === "totalEarnings") {
      return {
        series: [
          {
            name: "Earnings",
            data: [4.93, 5.90, 4.75, 6.64, 7.83, 10.69, 9.46],
          },
        ],
        categories: daysOfWeek,
      };
    } else {
      return {
        series: [{ name: "Referrals", data: [1, 0, 2, 1, 0, 3, 2] }],
        categories: daysOfWeek,
      };
    }
  }

  try {
    // Map stat type to backend metric
    const metricMap: Record<StatType, string> = {
      totalViews: "valid_clicks",
      totalEarnings: "earnings",
      totalReferral: "valid_clicks", // Referral uses same metric for now
    };

    const metric = metricMap[stat];

    // Always fetch weekly data for dashboard (Mon-Sun)
    const data = await apiCall<{
      metric: string;
      points: { label: string; value: number; date: string }[];
      total: number;
    }>(`/dashboard/analytics?range=week&metric=${metric}&group_by=day`);

    // Extract labels and values
    const categories = data.points.map((p) => p.label);
    const values = data.points.map((p) => p.value);

    // Get stat name for chart legend
    let statName = "Valid Clicks";
    if (stat === "totalEarnings") statName = "Earnings";
    if (stat === "totalReferral") statName = "Referrals";

    return {
      series: [{ name: statName, data: values }],
      categories,
    };
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    // Return empty data
    return {
      series: [{ name: "Data", data: [] }],
      categories: [],
    };
  }
};

// === ADMIN DASHBOARD SERVICE (Connected to Real API) ===

interface AdminDashboardApiResponse {
  total_users: number;
  total_links: number;
  total_clicks: number;
  payments_today_amount: number;
  payments_today_count: number;
  users_paid_today: number;
  payments_trend: number;
  links_created_today: number;
  links_trend: number;
  links_blocked_today: number;
  blocked_trend: number;
  pending_withdrawals: number;
  total_withdrawals_amount: number;
  pending_payments_total: number;
  new_users_last_5_days: { date: string; count: number }[];
  pending_withdrawals_list: {
    id: string;
    user: { id: string; name: string; email: string; avatar: string | null };
    amount: number;
    method: string;
    account_number: string;
    status: string;
    date: string;
  }[];
  recent_links_list: {
    id: string;
    code: string;
    title: string;
    original_url: string;
    short_url: string;
    owner: { id: string; name: string; email: string };
    views: number;
    status: string;
    created_at: string;
  }[];
  recent_users_list: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    joined_at: string;
    status: string;
  }[];
}

// Cache for admin dashboard data (avoid duplicate calls)
let adminDashboardCache: AdminDashboardApiResponse | null = null;
let adminDashboardCacheTimestamp = 0;
const ADMIN_CACHE_TTL = 30 * 1000; // 30 seconds

async function fetchAdminDashboard(): Promise<AdminDashboardApiResponse> {
  const now = Date.now();

  // Return cached data if still valid
  if (
    adminDashboardCache &&
    now - adminDashboardCacheTimestamp < ADMIN_CACHE_TTL
  ) {
    return adminDashboardCache;
  }

  const data = await apiCall<AdminDashboardApiResponse>(
    "/admin/dashboard/overview",
  );

  // Update cache
  adminDashboardCache = data;
  adminDashboardCacheTimestamp = now;

  return data;
}

export const getAdminStats = async (): Promise<AdminDashboardStats> => {
  try {
    const data = await fetchAdminDashboard();

    return {
      financial: {
        paidToday: data.payments_today_amount,
        usersPaidToday: data.users_paid_today,
        trend: data.payments_trend,
      },
      content: {
        linksCreatedToday: data.links_created_today,
        trend: data.links_trend,
      },
    };
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    // Return fallback data
    return {
      financial: { paidToday: 0, usersPaidToday: 0, trend: 0 },
      content: { linksCreatedToday: 0, trend: 0 },
    };
  }
};

export const getAdminActivities = async (): Promise<{
  withdrawals: import("@/types/type").RecentWithdrawal[];
  users: import("@/types/type").RecentUser[];
  links: import("@/types/type").AdminLink[];
}> => {
  try {
    const data = await fetchAdminDashboard();

    // Map withdrawals
    const withdrawals: import("@/types/type").RecentWithdrawal[] =
      data.pending_withdrawals_list.map((w) => ({
        id: w.id,
        user: {
          id: w.user.id,
          name: w.user.name,
          email: w.user.email,
          // Use local avatar format: "avatar-1" -> "/avatars/avatar-1.webp"
          avatar: w.user.avatar ? `/avatars/${w.user.avatar}.webp` : undefined,
          level: "Member", // Default, can be enhanced later
        },
        amount: w.amount,
        fee: (w as any).fee || 0,
        method: w.method,
        accountNumber: w.account_number,
        status: w.status as "pending" | "approved" | "rejected" | "paid",
        date: w.date,
        transactionId: (w as any).transaction_id || `WD-${w.id}`,
        riskScore: "safe" as const, // Default, can be enhanced later
      }));

    // Map users
    const users: import("@/types/type").RecentUser[] =
      data.recent_users_list.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        // Use local avatar format: "avatar-1" -> "/avatars/avatar-1.webp"
        avatar: u.avatar ? `/avatars/${u.avatar}.webp` : undefined,
        joinedAt: u.joined_at,
        status: u.status as "active" | "suspended" | "process",
      }));

    // Map links
    const links: import("@/types/type").AdminLink[] =
      data.recent_links_list.map((l) => ({
        id: l.id,
        title: l.title,
        shortUrl: l.short_url,
        originalUrl: l.original_url,
        owner: {
          id: l.owner.id,
          name: l.owner.name,
          username: l.owner.name.toLowerCase().replace(/\s/g, ""),
          email: l.owner.email,
          // Owner avatar not in API response, use undefined for fallback
          avatarUrl: undefined,
        },
        views: l.views,
        earnings: 0, // Not included in dashboard endpoint, default
        createdAt: l.created_at,
        status: l.status as "active" | "disabled" | "expired",
        adsLevel: "level1", // Default
      }));

    return { withdrawals, users, links };
  } catch (error) {
    console.error("Failed to fetch admin activities:", error);
    return { withdrawals: [], users: [], links: [] };
  }
};

// Force refresh admin dashboard cache
export const refreshAdminDashboard = () => {
  adminDashboardCache = null;
  adminDashboardCacheTimestamp = 0;
};
