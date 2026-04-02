// src/components/dashboard/settings/PaymentSection.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Save,
  Loader2,
  Smartphone,
  Landmark,
  Bitcoin,
  ChevronDown,
  User,
  Plus,
  Trash2,
  Star,
  CheckCircle,
} from "lucide-react";
import clsx from "clsx";
import { useTheme } from "next-themes";
import type { SavedPaymentMethod } from "@/types/type";
import ConfirmationModal from "../ConfirmationModal";
import { usePaymentLogic } from "@/hooks/useSettings";
import { useTranslations } from "next-intl";
import type { PaymentMethodTemplate } from "@/services/paymentTemplateService";
import {
  groupTemplatesByType,
  getInputPlaceholder,
  getHtmlInputType,
  getInputPattern,
  getInputMode,
} from "@/services/paymentTemplateService";

// Category config for icons and labels
const CATEGORY_CONFIG = {
  wallet: { label: "Digital Wallet", icon: Smartphone },
  bank: { label: "Bank Transfer", icon: Landmark },
  crypto: { label: "Crypto", icon: Bitcoin },
} as const;

type CategoryKey = keyof typeof CATEGORY_CONFIG;

export default function PaymentSection() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const t = useTranslations("Dashboard");

  // Hook with templates from API
  const {
    methods,
    templates,
    isLoading,
    isLoadingTemplates,
    error,
    addMethod,
    removeMethod,
    setAsDefault,
    isProcessing,
  } = usePaymentLogic();

  // Group templates by type
  const groupedTemplates = useMemo(
    () => groupTemplatesByType(templates),
    [templates],
  );

  // Get available categories (only those with templates)
  const availableCategories = useMemo(() => {
    return (Object.keys(CATEGORY_CONFIG) as CategoryKey[]).filter(
      (key) => groupedTemplates[key]?.length > 0,
    );
  }, [groupedTemplates]);

  // State Form Lokal
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("wallet");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [details, setDetails] = useState({
    accountName: "",
    accountNumber: "",
  });

  // State Modal Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Get current category templates
  const currentTemplates = groupedTemplates[activeCategory] || [];

  // Get selected template
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) || null,
    [templates, selectedTemplateId],
  );

  // Set default template when category changes or templates load
  const handleCategoryChange = (key: CategoryKey) => {
    setActiveCategory(key);
    const categoryTemplates = groupedTemplates[key] || [];
    if (categoryTemplates.length > 0) {
      setSelectedTemplateId(categoryTemplates[0].id);
    }
    setDetails({ ...details, accountNumber: "" });
  };

  // Initialize default template when templates load
  useMemo(() => {
    if (templates.length > 0 && selectedTemplateId === null) {
      const firstCategory = availableCategories[0] || "wallet";
      setActiveCategory(firstCategory);
      const categoryTemplates = groupedTemplates[firstCategory] || [];
      if (categoryTemplates.length > 0) {
        setSelectedTemplateId(categoryTemplates[0].id);
      }
    }
  }, [templates, availableCategories, groupedTemplates, selectedTemplateId]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    const success = await addMethod({
      provider: selectedTemplate.name,
      accountName: details.accountName,
      accountNumber: details.accountNumber,
      category: selectedTemplate.type as "wallet" | "bank" | "crypto",
      templateId: selectedTemplate.id,
      currency: selectedTemplate.currency,
    });
    // Reset form kalau sukses
    if (success) setDetails({ accountName: "", accountNumber: "" });
  };

  // Filter account number input based on input_type
  const handleAccountNumberChange = (value: string) => {
    const inputType = selectedTemplate?.input_type || "text";

    let filteredValue = value;

    if (inputType === "phone") {
      // Allow only digits, +, -, and spaces for phone numbers
      filteredValue = value.replace(/[^0-9+\-\s]/g, "");
    } else if (inputType === "account_number") {
      // Allow only digits for bank account numbers
      filteredValue = value.replace(/[^0-9]/g, "");
    }
    // For email and other types, allow any input

    setDetails({ ...details, accountNumber: filteredValue });
  };

  // Loading state
  if (isLoading || isLoadingTemplates) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-bluelight" />
      </div>
    );
  }

  // Error state
  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-8 font-figtree">
      {/* 1. LIST METHODS */}
      <div
        className={clsx(
          "space-y-4 p-8 rounded-3xl shadow-sm",
          isDark
            ? "bg-card border border-gray-800"
            : "bg-white border border-gray-100",
        )}
      >
        <h2 className="text-[2em] font-bold text-shortblack">
          {t("settingsPage.savedMethods")}
        </h2>

        {methods.length === 0 ? (
          <div
            className={clsx(
              "p-8 text-center border-2 border-dashed rounded-3xl text-grays",
              isDark ? "border-gray-700" : "border-gray-200",
            )}
          >
            <p className="text-[1.4em]">{t("settingsPage.noSavedMethods")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {methods.map((method) => (
                <motion.div
                  key={method.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={clsx(
                    "relative p-6 rounded-3xl border-2 transition-all shadow-sm",
                    method.isDefault
                      ? isDark
                        ? "border-bluelight bg-blue-500/10"
                        : "border-bluelight bg-blue-50/30"
                      : isDark
                        ? "border-gray-800 bg-card"
                        : "border-gray-100 bg-white",
                  )}
                >
                  {/* Badge Default */}
                  {method.isDefault && (
                    <div className="absolute top-0 right-0 bg-bluelight text-white text-[1.1em] px-4 py-1 rounded-bl-2xl rounded-tr-2xl font-bold flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-current" />{" "}
                      {t("settingsPage.default")}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-2xl bg-blues text-bluelight">
                      {method.category === "bank" ? (
                        <Landmark className="w-6 h-6" />
                      ) : method.category === "crypto" ? (
                        <Bitcoin className="w-6 h-6" />
                      ) : (
                        <Smartphone className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[1.6em] font-bold text-shortblack">
                          {method.provider}
                        </h3>
                        {/* Currency Badge */}
                        {method.currency && (
                          <span
                            className={clsx(
                              "text-[1em] px-2 py-0.5 rounded-md font-medium",
                              isDark
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-purple-100 text-purple-600",
                            )}
                          >
                            {method.currency}
                          </span>
                        )}
                      </div>
                      <p className="text-[1.4em] text-grays truncate">
                        {method.accountName}
                      </p>
                      <p className="text-[1.3em] font-mono text-shortblack mt-1 break-all">
                        {method.accountNumber}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className={clsx(
                      "flex items-center justify-end gap-3 pt-4 border-t",
                      isDark ? "border-gray-700" : "border-gray-200/50",
                    )}
                  >
                    {!method.isDefault && (
                      <button
                        onClick={() => setAsDefault(method.id)}
                        disabled={isProcessing}
                        className={clsx(
                          "text-[1.3em] font-semibold text-bluelight px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2",
                          isDark ? "hover:bg-blue-500/10" : "hover:bg-blue-50",
                        )}
                      >
                        <CheckCircle className="w-4 h-4" />{" "}
                        {t("settingsPage.setDefault")}
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteId(method.id)}
                      disabled={isProcessing}
                      className={clsx(
                        "text-[1.3em] font-semibold text-red-500 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2",
                        isDark ? "hover:bg-red-500/10" : "hover:bg-red-50",
                      )}
                    >
                      <Trash2 className="w-4 h-4" /> {t("settingsPage.delete")}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div
        className={clsx("h-px my-8", isDark ? "bg-gray-700" : "bg-gray-200")}
      />

      {/* 2. ADD NEW METHOD FORM */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={clsx(
          "rounded-3xl p-8 shadow-sm",
          isDark
            ? "bg-card border border-gray-800"
            : "bg-white border border-gray-100",
        )}
      >
        <h2 className="text-[2em] font-bold text-shortblack mb-8 flex items-center gap-3">
          <Plus className="w-6 h-6 text-bluelight" />{" "}
          {t("settingsPage.addNewMethod")}
        </h2>

        {templates.length === 0 ? (
          <div
            className={clsx(
              "p-8 text-center border-2 border-dashed rounded-3xl text-grays",
              isDark ? "border-gray-700" : "border-gray-200",
            )}
          >
            <p className="text-[1.4em]">{t("settingsPage.noTemplates")}</p>
          </div>
        ) : (
          <form onSubmit={handleAddSubmit} className="space-y-8">
            {/* Category Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableCategories.map((key) => {
                const config = CATEGORY_CONFIG[key];
                const isActive = activeCategory === key;
                const count = groupedTemplates[key]?.length || 0;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleCategoryChange(key)}
                    className={clsx(
                      "p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all",
                      isActive
                        ? isDark
                          ? "border-bluelight bg-blue-500/10 text-bluelight ring-2 ring-bluelight/20"
                          : "border-bluelight bg-blue-50 text-bluelight ring-2 ring-bluelight/20"
                        : isDark
                          ? "border-gray-800 bg-card text-grays hover:bg-subcard"
                          : "border-gray-100 bg-white text-grays hover:bg-slate-50",
                    )}
                  >
                    <config.icon
                      className={clsx("w-8 h-8", isActive && "animate-bounce")}
                    />
                    <span className="text-[1.4em] font-bold">
                      {config.label}
                    </span>
                    <span className="text-[1.1em] text-grays">
                      {count}{" "}
                      {count !== 1
                        ? t("settingsPage.providers")
                        : t("settingsPage.provider")}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Input Fields */}
            <div
              className={clsx(
                "rounded-3xl p-8 space-y-6",
                isDark
                  ? "bg-blues border border-blue-500/30"
                  : "bg-blues border border-blue-100",
              )}
            >
              {/* Provider Select */}
              <div className="space-y-2">
                <label className="text-[1.4em] font-bold text-shortblack">
                  {t("settingsPage.selectProvider")}
                </label>
                <div className="relative">
                  <select
                    value={selectedTemplateId || ""}
                    onChange={(e) =>
                      setSelectedTemplateId(Number(e.target.value))
                    }
                    className={clsx(
                      "w-full px-6 py-4 pr-12 rounded-xl text-[1.6em] font-medium text-shortblack focus:outline-none focus:ring-2 focus:ring-bluelight/50 appearance-none cursor-pointer",
                      isDark
                        ? "bg-card border border-gray-700"
                        : "bg-white border border-gray-200",
                    )}
                  >
                    {currentTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.currency})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-grays pointer-events-none" />
                </div>
                {/* Selected template info */}
                {selectedTemplate && (
                  <div className="flex items-center gap-2 mt-2 text-[1.2em] text-grays">
                    <span>{t("settingsPage.currency")}</span>
                    <span
                      className={clsx(
                        "px-2 py-0.5 rounded font-medium",
                        isDark
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-purple-100 text-purple-600",
                      )}
                    >
                      {selectedTemplate.currency}
                    </span>
                    <span className="mx-2">•</span>
                    <span>
                      {t("settingsPage.fee")} $
                      {Number(selectedTemplate.fee).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div
                className={clsx(
                  "h-px my-4",
                  isDark ? "bg-blue-500/20" : "bg-blue-200/50",
                )}
              ></div>

              {/* Account Name */}
              <div className="space-y-2">
                <label className="text-[1.4em] font-medium text-grays">
                  {t("settingsPage.accountName")}
                </label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-grays" />
                  <input
                    type="text"
                    value={details.accountName}
                    onChange={(e) =>
                      setDetails({ ...details, accountName: e.target.value })
                    }
                    className={clsx(
                      "w-full pl-14 pr-4 py-3 rounded-xl text-[1.5em] text-shortblack focus:outline-none focus:ring-2 focus:ring-bluelight/50",
                      isDark
                        ? "bg-card border border-gray-700"
                        : "bg-white border border-gray-200",
                    )}
                    placeholder={t("settingsPage.accountNamePlaceholder")}
                    required
                  />
                </div>
              </div>

              {/* Account Number */}
              <div className="space-y-2">
                <label className="text-[1.4em] font-medium text-grays">
                  {selectedTemplate?.input_label ||
                    t("settingsPage.accountNumberLabel")}
                </label>
                <input
                  type={getHtmlInputType(
                    selectedTemplate?.input_type || "text",
                  )}
                  inputMode={getInputMode(
                    selectedTemplate?.input_type || "text",
                  )}
                  pattern={getInputPattern(
                    selectedTemplate?.input_type || "text",
                  )}
                  value={details.accountNumber}
                  onChange={(e) => handleAccountNumberChange(e.target.value)}
                  className={clsx(
                    "w-full px-6 py-3 rounded-xl text-[1.5em] text-shortblack focus:outline-none focus:ring-2 focus:ring-bluelight/50 font-mono",
                    isDark
                      ? "bg-card border border-gray-700"
                      : "bg-white border border-gray-200",
                  )}
                  placeholder={getInputPlaceholder(
                    selectedTemplate?.input_type || "text",
                  )}
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isProcessing || !selectedTemplate}
                className={clsx(
                  "bg-bluelight text-white px-10 py-4 rounded-xl font-bold text-[1.6em] hover:bg-opacity-90 transition-all flex items-center gap-3 disabled:opacity-50 shadow-lg",
                  isDark ? "shadow-purple-900/30" : "shadow-blue-200",
                )}
              >
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Save className="w-6 h-6" />
                )}
                {t("settingsPage.saveMethod")}
              </button>
            </div>
          </form>
        )}
      </motion.div>

      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) await removeMethod(deleteId);
          setDeleteId(null);
        }}
        isLoading={isProcessing}
        title={t("settingsPage.deleteMethodTitle")}
        description={t("settingsPage.deleteMethodDesc")}
        confirmLabel={t("settingsPage.deleteConfirm")}
        type="danger"
      />
    </div>
  );
}
