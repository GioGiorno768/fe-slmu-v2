// src/hooks/useSettings.ts
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as settingsService from "@/services/settingsService";
import { useAlert } from "@/hooks/useAlert";
import type {
  UserProfile,
  SavedPaymentMethod,
  UserPreferences,
} from "@/types/type";

// =======================
// 1. HOOK PROFILE
// =======================
export function useProfileLogic(type: "user" | "admin" = "user") {
  const { showAlert } = useAlert();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = async (data: UserProfile) => {
    setIsUpdating(true);
    try {
      if (type === "admin") {
        await settingsService.updateAdminProfile(data);
      } else {
        await settingsService.updateUserProfile(data);
      }
      showAlert("Profil berhasil diperbarui!", "success");
      // Refresh page after 1 second to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return true;
    } catch (error) {
      console.error(error);
      showAlert("Gagal menyimpan profil.", "error");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateProfile, isUpdating };
}

// ... (Security and Payment hooks remain unchanged) ...

// =======================
// 4. HOOK PREFERENCES
// =======================

// =======================
// 2. HOOK SECURITY (Ini yang tadi kurang)
// =======================
export function useSecurityLogic() {
  const { showAlert } = useAlert();
  const [isUpdating, setIsUpdating] = useState(false);

  const updatePass = async (
    current: string,
    newPass: string,
    confirmPass: string,
  ) => {
    setIsUpdating(true);
    try {
      await settingsService.changePassword(current, newPass, confirmPass);
      showAlert("Password berhasil diubah!", "success");
      return true;
    } catch (error: any) {
      console.error(error);

      // Parse Laravel validation errors
      const responseData = error.response?.data;
      const errors = responseData?.errors;

      let errorMsg = "Gagal mengubah password.";

      if (errors) {
        // Laravel returns errors as { field: [messages] }
        if (errors.current_password) {
          // Current password is incorrect
          errorMsg = "Password saat ini salah. Periksa kembali!";
        } else if (errors.password) {
          // New password validation failed
          const passwordErrors = errors.password;
          if (Array.isArray(passwordErrors) && passwordErrors.length > 0) {
            if (
              passwordErrors[0].includes("confirmed") ||
              passwordErrors[0].includes("confirmation")
            ) {
              errorMsg = "Konfirmasi password tidak cocok!";
            } else if (passwordErrors[0].includes("8")) {
              errorMsg = "Password minimal 8 karakter!";
            } else {
              errorMsg = passwordErrors[0];
            }
          }
        } else if (errors.password_confirmation) {
          errorMsg = "Konfirmasi password tidak cocok!";
        } else {
          // Get first error message from any field
          const firstField = Object.keys(errors)[0];
          const firstError = errors[firstField];
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      } else if (responseData?.message) {
        // Use general error message from response
        errorMsg = responseData.message;
      }

      showAlert(errorMsg, "error");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const toggle2FAStatus = async (enabled: boolean) => {
    try {
      await settingsService.toggle2FA(enabled);
      showAlert(
        `2FA ${enabled ? "diaktifkan" : "dinonaktifkan"}.`,
        enabled ? "success" : "warning",
      );
      return true;
    } catch (error) {
      console.error(error);
      showAlert("Gagal mengubah status 2FA.", "error");
      return false;
    }
  };

  return { updatePass, toggle2FAStatus, isUpdating };
}

// =======================
// 3. HOOK PAYMENT (React Query)
// =======================

// Query keys for payment methods
export const paymentKeys = {
  all: ["payment-methods"] as const,
  list: () => [...paymentKeys.all, "list"] as const,
  templates: () => ["payment-templates"] as const,
};

export function usePaymentLogic() {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  // Fetch payment methods with React Query
  const {
    data: methods = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: paymentKeys.list(),
    queryFn: settingsService.getPaymentMethods,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch available payment templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: paymentKeys.templates(),
    queryFn: async () => {
      const { getPaymentTemplates } =
        await import("@/services/paymentTemplateService");
      return getPaymentTemplates();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (templates change rarely)
  });

  // Mutation: Add payment method
  const addMutation = useMutation({
    mutationFn: (data: Omit<SavedPaymentMethod, "id" | "isDefault">) =>
      settingsService.addPaymentMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      showAlert("Metode pembayaran ditambahkan!", "success");
      // Hard refresh page after 1 second to ensure data is updated
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: () => {
      showAlert("Gagal menambah metode.", "error");
    },
  });

  // Mutation: Remove payment method
  const removeMutation = useMutation({
    mutationFn: (id: string) => settingsService.deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      showAlert("Metode pembayaran berhasil dihapus!", "success");
      // Reload page after 1 second to reflect auto-set default changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: () => {
      showAlert("Gagal menghapus metode.", "error");
    },
  });

  // Mutation: Update payment method
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; accountName: string; accountNumber: string; provider: string; category: string }) =>
      settingsService.updatePaymentMethod(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      showAlert("Metode pembayaran berhasil diperbarui!", "success");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Gagal memperbarui metode.";
      showAlert(msg, "error");
    },
  });

  // Mutation: Set as default
  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => settingsService.setDefaultPaymentMethod(id),
    onMutate: async (id: string) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: paymentKeys.list() });
      const previousMethods = queryClient.getQueryData<SavedPaymentMethod[]>(
        paymentKeys.list(),
      );
      queryClient.setQueryData<SavedPaymentMethod[]>(
        paymentKeys.list(),
        (old) => old?.map((m) => ({ ...m, isDefault: m.id === id })) ?? [],
      );
      return { previousMethods };
    },
    onSuccess: () => {
      showAlert("Metode utama diperbarui.", "success");
      // Refresh page after 1 second to reflect default change everywhere
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (_, __, context) => {
      // Revert on error
      if (context?.previousMethods) {
        queryClient.setQueryData(paymentKeys.list(), context.previousMethods);
      }
      showAlert("Gagal mengatur default.", "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });

  // Action wrappers for backwards compatibility
  const addMethod = async (
    data: Omit<SavedPaymentMethod, "id" | "isDefault">,
  ) => {
    try {
      await addMutation.mutateAsync(data);
      return true;
    } catch {
      return false;
    }
  };

  const removeMethod = async (id: string) => {
    try {
      await removeMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  const updateMethod = async (id: string, data: { accountName: string; accountNumber: string; provider: string; category: string }) => {
    try {
      await updateMutation.mutateAsync({ id, ...data });
      return true;
    } catch {
      return false;
    }
  };

  const setAsDefault = async (id: string) => {
    try {
      await setDefaultMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  const isProcessing =
    addMutation.isPending ||
    removeMutation.isPending ||
    updateMutation.isPending ||
    setDefaultMutation.isPending;

  return {
    methods,
    templates,
    isLoading,
    isLoadingTemplates,
    error: error ? "Gagal memuat metode pembayaran." : null,
    addMethod,
    removeMethod,
    updateMethod,
    setAsDefault,
    isProcessing,
  };
}

export function usePreferencesLogic(type: "user" | "admin" = "user") {
  const { showAlert } = useAlert();
  const [isSaving, setIsSaving] = useState(false);

  const savePreferences = async (data: UserPreferences) => {
    setIsSaving(true);
    try {
      if (type === "admin") {
        await settingsService.updateAdminPreferences(data);
      } else {
        await settingsService.updateUserPreferences(data);
      }
      showAlert("Pengaturan disimpan!", "success");
      return true;
    } catch (error) {
      console.error(error);
      showAlert("Gagal menyimpan pengaturan.", "error");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { savePreferences, isSaving };
}
