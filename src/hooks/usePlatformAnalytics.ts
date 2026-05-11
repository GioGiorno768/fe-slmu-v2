import { useState, useEffect } from "react";
import apiClient from "@/services/apiClient";

export type TimeFilter = "all" | "week" | "month" | "year";

export interface PlatformAnalyticsStats {
  // Platform stats
  totalUsers: number;
  totalUsersGrowth: number;
  activeUsers: number;
  activeUsersGrowth: number;
  totalLinks: number;
  totalLinksGrowth: number;
  totalClicks: number;
  totalClicksGrowth: number;
  // Revenue stats
  totalEarnings: number;
  totalPaid: number;
  totalPending: number;
  totalTransactions: number;
}

export function usePlatformAnalytics(timeFilter: TimeFilter = "all") {
  const [stats, setStats] = useState<PlatformAnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // Include time filter as query param
        const params = timeFilter !== "all" ? { period: timeFilter } : {};
        const response = await apiClient.get("/admin/dashboard/overview", {
          params,
        });
        const data = response.data.data;

        setStats({
          // Platform stats
          totalUsers: data.total_users || 0,
          totalUsersGrowth: data.total_users_growth || 0,
          activeUsers: data.active_users || 0,
          activeUsersGrowth: data.active_users_growth || 0,
          totalLinks: data.total_links || 0,
          totalLinksGrowth: data.total_links_growth || 0,
          totalClicks: data.total_clicks || 0,
          totalClicksGrowth: data.total_clicks_growth || 0,
          // Revenue stats
          totalEarnings: data.total_earnings || 0,
          totalPaid: data.total_paid || 0,
          totalPending: data.total_pending || 0,
          totalTransactions: data.total_transactions || 0,
        });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeFilter]);

  return {
    stats,
    isLoading,
  };
}
