// src/services/settingsService.ts
import type {
  UserProfile,
  SecuritySettings,
  SavedPaymentMethod,
  UserPreferences,
} from "@/types/type";
import apiClient from "./apiClient";

// ==========================================
// 1. PROFILE SERVICE
// ==========================================
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const response = await apiClient.get("/user/me");
    const userData = response.data.data;
    return {
      name: userData.name,
      email: userData.email,
      phone: "", // Not returned from API yet
      avatarUrl: userData.avatar
        ? `/avatars/${userData.avatar}.webp`
        : "/avatars/avatar-1.webp",
      username: userData.name, // Use name as username
    };
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    // Fallback to empty profile on error
    return {
      name: "Guest",
      email: "",
      phone: "",
      avatarUrl: "/avatars/avatar-1.webp",
      username: "Guest",
    };
  }
}

export async function updateUserProfile(
  data: UserProfile
): Promise<UserProfile> {
  // Extract avatar name from URL (e.g., "/avatars/avatar-2.webp" -> "avatar-2")
  const avatarMatch = data.avatarUrl?.match(/\/avatars\/(avatar-\d+)\.webp/);
  const avatarName = avatarMatch ? avatarMatch[1] : "avatar-1";

  const response = await apiClient.put("/user/profile", {
    name: data.name,
    avatar: avatarName,
  });
  return {
    ...data,
    name: response.data.data.name,
    avatarUrl: response.data.data.avatar
      ? `/avatars/${response.data.data.avatar}.webp`
      : data.avatarUrl,
  };
}

// ==========================================
// 2. SECURITY SERVICE (Ini yang tadi kurang)
// ==========================================
export async function getSecuritySettings(): Promise<SecuritySettings> {
  try {
    const response = await apiClient.get("/user/security");
    const data = response.data.data;
    return {
      twoFactorEnabled: data.twoFactorEnabled || false,
      lastPasswordChange: data.lastPasswordChange || null,
      isSocialLogin: data.isSocialLogin || false,
    };
  } catch (error) {
    console.error("Failed to fetch security settings:", error);
    // Fallback to safe defaults (assume has password)
    return {
      twoFactorEnabled: false,
      lastPasswordChange: null,
      isSocialLogin: false,
    };
  }
}

export async function changePassword(
  current: string,
  newPass: string,
  confirmPass: string
): Promise<boolean> {
  const response = await apiClient.put("/user/password", {
    current_password: current,
    password: newPass,
    password_confirmation: confirmPass,
  });
  return response.data.success;
}

export async function toggle2FA(enabled: boolean): Promise<boolean> {
  // NANTI GANTI: fetch('/api/user/2fa', { method: 'POST', body: { enabled } })
  await new Promise((r) => setTimeout(r, 800));
  return enabled;
}

// ==========================================
// 3. PAYMENT SERVICE
// ==========================================
export async function getPaymentMethods(): Promise<SavedPaymentMethod[]> {
  const response = await apiClient.get("/payment-methods");
  const methods = response.data.data || [];

  // Map backend fields to frontend format
  return methods.map((m: any) => ({
    id: String(m.id),
    provider: m.bank_name,
    accountName: m.account_name,
    accountNumber: m.account_number,
    isDefault: m.is_default || false,
    category:
      m.method_type === "ewallet"
        ? "wallet"
        : m.method_type === "crypto"
        ? "crypto"
        : "bank",
    fee: m.fee || 0,
    currency: m.template?.currency || null,
    templateId: m.template_id || null,
  }));
}

export async function addPaymentMethod(
  data: Omit<SavedPaymentMethod, "id" | "isDefault" | "fee"> & {
    templateId?: number;
  }
): Promise<SavedPaymentMethod> {
  const response = await apiClient.post("/payment-methods", {
    template_id: data.templateId,
    method_type:
      data.category === "wallet"
        ? "ewallet"
        : data.category === "crypto"
        ? "crypto"
        : "bank_transfer",
    account_name: data.accountName,
    account_number: data.accountNumber,
    bank_name: data.provider,
  });

  const m = response.data.data;
  return {
    id: String(m.id),
    provider: m.bank_name,
    accountName: m.account_name,
    accountNumber: m.account_number,
    isDefault: m.is_default || false,
    category: data.category,
    fee: m.fee || 0,
    currency: m.template?.currency || data.currency,
  };
}

export async function deletePaymentMethod(id: string): Promise<boolean> {
  await apiClient.delete(`/payment-methods/${id}`);
  return true;
}

export async function setDefaultPaymentMethod(id: string): Promise<boolean> {
  await apiClient.patch(`/payment-methods/${id}/default`);
  return true;
}

export async function updatePaymentMethod(
  id: string,
  data: { accountName: string; accountNumber: string; provider: string; category: string }
): Promise<SavedPaymentMethod> {
  const response = await apiClient.put(`/payment-methods/${id}`, {
    method_type:
      data.category === "wallet"
        ? "ewallet"
        : data.category === "crypto"
        ? "crypto"
        : "bank_transfer",
    account_name: data.accountName,
    account_number: data.accountNumber,
    bank_name: data.provider,
  });

  const m = response.data.data;
  return {
    id: String(m.id),
    provider: m.bank_name,
    accountName: m.account_name,
    accountNumber: m.account_number,
    isDefault: m.is_default || false,
    category: data.category as "wallet" | "bank" | "crypto",
    fee: m.fee || 0,
    currency: m.template?.currency || undefined,
  };
}

// ==========================================
// 4. PREFERENCES SERVICE (Ini yang tadi kurang)
// ==========================================
export async function getUserPreferences(): Promise<UserPreferences> {
  // NANTI GANTI: fetch('/api/user/preferences')
  await new Promise((r) => setTimeout(r, 500));
  return {
    language: "en",
    currency: "USD",
    timezone: "Asia/Jakarta",
    privacy: {
      loginAlert: true,
      cookieConsent: true,
      saveLoginInfo: false,
    },
  };
}

export async function updateUserPreferences(
  data: UserPreferences
): Promise<UserPreferences> {
  // NANTI GANTI: fetch('/api/user/preferences', { method: 'PUT', body: JSON.stringify(data) })
  await new Promise((r) => setTimeout(r, 1000));
  return data;
}
// ==========================================
// 5. ADMIN SERVICES
// ==========================================
export async function getAdminProfile(): Promise<UserProfile> {
  try {
    const response = await apiClient.get("/user/me");
    const userData = response.data.data;
    return {
      name: userData.name,
      email: userData.email,
      phone: "",
      avatarUrl: userData.avatar
        ? `/avatars/${userData.avatar}.webp`
        : "/avatars/avatar-1.webp",
      username: userData.name,
    };
  } catch (error) {
    console.error("Failed to fetch admin profile:", error);
    return {
      name: "Admin",
      email: "",
      phone: "",
      avatarUrl: "/avatars/avatar-1.webp",
      username: "Admin",
    };
  }
}

export async function updateAdminProfile(
  data: UserProfile
): Promise<UserProfile> {
  // Extract avatar name from URL (e.g., "/avatars/avatar-2.webp" -> "avatar-2")
  const avatarMatch = data.avatarUrl?.match(/\/avatars\/(avatar-\d+)\.webp/);
  const avatarName = avatarMatch ? avatarMatch[1] : "avatar-1";

  const response = await apiClient.put("/user/profile", {
    name: data.name,
    avatar: avatarName,
  });
  return {
    ...data,
    name: response.data.data.name,
    avatarUrl: response.data.data.avatar
      ? `/avatars/${response.data.data.avatar}.webp`
      : data.avatarUrl,
  };
}

export async function getAdminPreferences(): Promise<UserPreferences> {
  // TODO: Implement real API call when endpoint is ready
  await new Promise((r) => setTimeout(r, 500));
  return {
    language: "en",
    currency: "USD",
    timezone: "UTC",
    privacy: {
      loginAlert: true,
      cookieConsent: true,
      saveLoginInfo: true,
    },
  };
}

export async function updateAdminPreferences(
  data: UserPreferences
): Promise<UserPreferences> {
  // TODO: Implement real API call when endpoint is ready
  await new Promise((r) => setTimeout(r, 1000));
  return data;
}
