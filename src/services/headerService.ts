// src/services/headerService.ts
import type { HeaderStats, AdminHeaderStats } from "@/types/type";
import apiClient from "./apiClient";

// 🎨 DEMO MODE: Set to true for screenshot purposes
const DEMO_MODE = false;

// In-memory cache for header stats
let cachedStats: HeaderStats | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 0; // No cache - always fetch fresh balance

/**
 * Get header stats with client-side caching.
 * Uses dedicated lightweight endpoint /api/user/stats
 */
export async function getHeaderStats(): Promise<HeaderStats> {
  // 🎨 DEMO: Pro-rank user — solid balance, good payout history
  if (DEMO_MODE) {
    return {
      balance: 285.6,
      payout: 2515.0,
      cpm: 4.4,
    };
  }

  // Return cached if still valid
  const now = Date.now();
  if (cachedStats && now - cacheTimestamp < CACHE_TTL) {
    return cachedStats;
  }

  try {
    const response = await apiClient.get("/user/stats");
    const data = response.data.data;

    cachedStats = {
      balance: data?.balance ?? 0,
      payout: data?.payout ?? 0,
      cpm: data?.cpm ?? 0,
    };
    cacheTimestamp = now;

    return cachedStats;
  } catch (error) {
    console.error("Failed to fetch header stats:", error);
    // Return cached if available, otherwise defaults
    return cachedStats ?? { balance: 0, payout: 0, cpm: 0 };
  }
}

/**
 * Force refresh header stats (invalidate cache).
 * Call this after withdrawal, payout, etc.
 * Also dispatches an event so components can listen and re-render.
 */
export async function refreshHeaderStats(): Promise<HeaderStats> {
  cachedStats = null;
  cacheTimestamp = 0;

  // Dispatch event so useHeader can listen and refetch
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("headerStatsRefresh"));
  }

  return getHeaderStats();
}

/**
 * Clear header cache completely.
 * Call this on logout to prevent stale data for next user.
 */
export function clearHeaderCache(): void {
  cachedStats = null;
  cacheTimestamp = 0;
}

/**
 * Get cached stats immediately (no fetch).
 * Returns null if cache is empty.
 */
export function getCachedHeaderStats(): HeaderStats | null {
  const now = Date.now();
  if (cachedStats && now - cacheTimestamp < CACHE_TTL) {
    return cachedStats;
  }
  return null;
}

// Cache for admin header stats
let adminCachedStats: AdminHeaderStats | null = null;
let adminCacheTimestamp = 0;
const ADMIN_CACHE_TTL = 30000; // 30 seconds

export async function getAdminHeaderStats(): Promise<AdminHeaderStats> {
  // Return cached if still valid
  const now = Date.now();
  if (adminCachedStats && now - adminCacheTimestamp < ADMIN_CACHE_TTL) {
    return adminCachedStats;
  }

  try {
    const response = await apiClient.get("/admin/dashboard/overview");
    const data = response.data.data;

    adminCachedStats = {
      pendingWithdrawals: data?.pending_withdrawals ?? 0,
      abuseReports: data?.links_blocked_today ?? 0, // Using blocked links as abuse indicator
      newUsers: data?.recent_users_list?.length ?? 0, // Count of today's new users
    };
    adminCacheTimestamp = now;

    return adminCachedStats;
  } catch (error) {
    console.error("Failed to fetch admin header stats:", error);
    return (
      adminCachedStats ?? {
        pendingWithdrawals: 0,
        abuseReports: 0,
        newUsers: 0,
      }
    );
  }
}

// Force refresh admin header stats
export function refreshAdminHeaderStats(): void {
  adminCachedStats = null;
  adminCacheTimestamp = 0;
}
