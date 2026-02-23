import type {
  AdminLink,
  AdminLinkFilters,
  AdminLinkStats,
  LinkStatus,
} from "@/types/type";
import { getToken } from "./authService";

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

// ===========================
// GET LINKS (with filters)
// ===========================
export async function getLinks(
  page: number = 1,
  filters: AdminLinkFilters,
): Promise<{ data: AdminLink[]; totalPages: number; totalCount: number }> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: "10",
  });

  // Map frontend filters to backend params
  if (filters.search) params.set("search", filters.search);
  if (filters.status && filters.status !== "all") {
    // Frontend uses 'active'/'disabled', backend uses is_banned 0/1
    params.set("is_banned", filters.status === "disabled" ? "1" : "0");
  }
  if (filters.adsLevel && filters.adsLevel !== "all") {
    // Map level1 -> 1, level2 -> 2, etc.
    const levelMap: Record<string, string> = {
      level1: "1",
      level2: "2",
      level3: "3",
      level4: "4",
    };
    params.set("ad_level", levelMap[filters.adsLevel] || filters.adsLevel);
  }
  if (filters.ownerType && filters.ownerType !== "all") {
    params.set("owner_type", filters.ownerType);
  }
  if (filters.sort) {
    // Map frontend sort to backend sort_by
    const sortMap: Record<string, string> = {
      newest: "newest",
      oldest: "oldest",
      most_views: "most_views",
      least_views: "least_views",
      most_earnings: "most_earnings",
      least_earnings: "least_earnings",
    };
    params.set("sort_by", sortMap[filters.sort] || "newest");
  }

  const res = await fetch(`${API_URL}/admin/links?${params}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Admin Links API Error:", res.status, errorData);
    throw new Error(
      errorData.message || `Failed to fetch links (${res.status})`,
    );
  }

  const json = await res.json();
  // Response structure: { data: Array, meta: { current_page, last_page, total, ... } }
  const rawLinks = json.data || [];

  // Transform backend response to frontend format
  const data: AdminLink[] = rawLinks.map((link: any) => {
    // Debug log to check raw data
    console.log("Raw link data:", {
      id: link.id,
      total_views: link.total_views,
      total_earned: link.total_earned,
      valid_views: link.valid_views,
      user: link.user,
    });

    return {
      id: String(link.id),
      title: link.title || undefined,
      shortUrl: link.short_url || `http://localhost:8000/${link.code}`,
      originalUrl: link.original_url,
      alias: link.alias || undefined,
      owner: {
        id: String(link.user?.id || ""),
        name: link.user?.name || "Guest",
        username: link.user?.email?.split("@")[0] || "guest",
        email: link.user?.email || "",
        // Use undefined instead of empty string to prevent img src error
        avatarUrl: link.user?.avatar
          ? `/avatars/${link.user.avatar}.webp`
          : undefined,
      },
      views: link.total_views || 0,
      validViews: link.valid_views || 0,
      earnings: parseFloat(link.total_earned) || 0,
      createdAt: link.created_at,
      expiredAt: link.expired_at || undefined,
      status: link.is_banned ? "disabled" : "active",
      adsLevel: link.ad_level ? `level${link.ad_level}` : "level1",
      password: link.password || undefined,
    };
  });

  return {
    data,
    totalPages: json.meta?.last_page || 1,
    totalCount: json.meta?.total || 0,
  };
}

// ===========================
// GET LINK STATS
// ===========================
export async function getLinkStats(): Promise<AdminLinkStats> {
  const res = await fetch(`${API_URL}/admin/links/stats`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch link stats");

  const json = await res.json();
  return {
    totalLinks: json.data?.total_links || 0,
    newToday: json.data?.links_today || 0,
    disabledLinks: json.data?.banned_links || 0,
    activeLinks: json.data?.active_links || 0,
  };
}

// ===========================
// BULK ACTION (by IDs or selectAll)
// ===========================
export async function bulkUpdateLinkStatus(params: {
  ids: string[];
  selectAll: boolean;
  filters?: AdminLinkFilters;
  status: "active" | "disabled";
  reason?: string;
}): Promise<boolean> {
  const { ids, selectAll, filters, status } = params;

  const body: Record<string, any> = {
    action: status === "disabled" ? "ban" : "activate",
    selectAll,
  };

  if (selectAll && filters) {
    body.filters = {
      is_banned:
        filters.status === "disabled"
          ? "1"
          : filters.status === "active"
            ? "0"
            : undefined,
      ad_level: filters.adsLevel !== "all" ? filters.adsLevel : undefined,
      search: filters.search || undefined,
    };
  } else {
    body.ids = ids.map(
      (id) => parseInt(id.replace("link-", ""), 10) || parseInt(id, 10),
    );
  }

  const res = await fetch(`${API_URL}/admin/links/bulk-action`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("Bulk action failed");
  return true;
}

// ===========================
// UPDATE SINGLE LINK STATUS
// ===========================
export async function updateLinkStatus(
  id: string,
  status: LinkStatus,
  reason?: string,
): Promise<boolean> {
  const linkId = id.replace("link-", "") || id;

  const res = await fetch(`${API_URL}/admin/links/${linkId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      is_banned: status === "disabled",
      ban_reason: reason,
    }),
  });

  if (!res.ok) throw new Error("Failed to update link status");
  return true;
}

// ===========================
// DELETE LINKS
// ===========================
export async function deleteLinks(ids: string[]): Promise<boolean> {
  // Delete one by one (could be optimized with bulk endpoint if needed)
  for (const id of ids) {
    const linkId = id.replace("link-", "") || id;
    const res = await fetch(`${API_URL}/admin/links/${linkId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to delete link ${id}`);
  }
  return true;
}

// ===========================
// SEND MESSAGE TO USER
// ===========================
export async function sendMessageToUser(
  linkId: string,
  message: string,
  type: "warning" | "announcement",
): Promise<boolean> {
  const id = linkId.replace("link-", "") || linkId;

  // Use the update endpoint with admin_comment to send notification
  const res = await fetch(`${API_URL}/admin/links/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      admin_comment: message,
    }),
  });

  if (!res.ok) throw new Error("Failed to send message");
  return true;
}
