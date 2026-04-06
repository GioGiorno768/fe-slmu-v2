// src/components/dashboard/settings/PaymentSection.tsx
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
  Pencil,
  X,
  Eye,
  EyeOff,
  CreditCard,
  Shield,
  MoreVertical,
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
import { formatAmount } from "@/services/paymentTemplateAdminService";

// Category config for icons and labels
const CATEGORY_CONFIG = {
  wallet: { label: "Digital Wallet", icon: Smartphone },
  bank: { label: "Bank Transfer", icon: Landmark },
  crypto: { label: "Crypto", icon: Bitcoin },
} as const;

type CategoryKey = keyof typeof CATEGORY_CONFIG;

// Category gradient configs for saved method cards
const CATEGORY_GRADIENTS = {
  wallet: {
    from: "from-violet-500",
    to: "to-purple-600",
    shadow: "shadow-purple-500/25",
    shadowDark: "shadow-purple-900/40",
    accent: "text-purple-400",
    accentBg: "bg-purple-500/10",
    accentBorder: "border-purple-500/20",
    accentLight: "text-purple-600",
    accentBgLight: "bg-purple-50",
    accentBorderLight: "border-purple-100",
  },
  bank: {
    from: "from-blue-500",
    to: "to-indigo-600",
    shadow: "shadow-blue-500/25",
    shadowDark: "shadow-blue-900/40",
    accent: "text-blue-400",
    accentBg: "bg-blue-500/10",
    accentBorder: "border-blue-500/20",
    accentLight: "text-blue-600",
    accentBgLight: "bg-blue-50",
    accentBorderLight: "border-blue-100",
  },
  crypto: {
    from: "from-amber-500",
    to: "to-orange-600",
    shadow: "shadow-amber-500/25",
    shadowDark: "shadow-amber-900/40",
    accent: "text-amber-400",
    accentBg: "bg-amber-500/10",
    accentBorder: "border-amber-500/20",
    accentLight: "text-amber-600",
    accentBgLight: "bg-amber-50",
    accentBorderLight: "border-amber-100",
  },
} as const;

// Helper: mask account number
function maskAccountNumber(text: string): string {
  if (!text) return "••••";
  // Email format
  if (text.includes("@")) {
    const [name, domain] = text.split("@");
    const masked = name.length > 2 ? name.slice(0, 2) + "••••" : "•••";
    return `${masked}@${domain}`;
  }
  // Number format
  if (text.length > 4) {
    return "•••• •••• " + text.slice(-4);
  }
  return "•••• ••••";
}

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
    updateMethod,
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

  // State Dropdown Provider
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const providerRef = useRef<HTMLDivElement>(null);

  // Click outside to close provider dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        providerRef.current &&
        !providerRef.current.contains(event.target as Node)
      ) {
        setIsProviderOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // State Modal Edit
  const [editMethod, setEditMethod] = useState<SavedPaymentMethod | null>(null);
  const [editDetails, setEditDetails] = useState({
    accountName: "",
    accountNumber: "",
  });

  const openEditModal = (method: SavedPaymentMethod) => {
    setEditMethod(method);
    setEditDetails({
      accountName: method.accountName,
      accountNumber: method.accountNumber,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMethod) return;
    const success = await updateMethod(editMethod.id, {
      accountName: editDetails.accountName,
      accountNumber: editDetails.accountNumber,
      provider: editMethod.provider,
      category: editMethod.category,
    });
    if (success) setEditMethod(null);
  };

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
      {/* 1. ADD NEW METHOD FORM */}
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
          <form onSubmit={handleAddSubmit} className="space-y-6">
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

            {/* Provider Custom Dropdown */}
            <div className="space-y-2">
              <label className="text-[1.4em] font-bold text-shortblack">
                {t("settingsPage.selectProvider")}
              </label>
              <div className="relative" ref={providerRef}>
                <button
                  type="button"
                  onClick={() => setIsProviderOpen(!isProviderOpen)}
                  className={clsx(
                    "w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all text-[1.5em]",
                    isDark
                      ? "bg-subcard border-gray-700 hover:border-gray-600"
                      : "bg-white border-gray-200 hover:border-gray-300",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-medium text-shortblack truncate">
                      {selectedTemplate
                        ? selectedTemplate.name
                        : t("settingsPage.selectProvider")}
                    </span>
                    {selectedTemplate && (
                      <span
                        className={clsx(
                          "text-[0.75em] px-2 py-0.5 rounded-md font-semibold shrink-0",
                          isDark
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-purple-100 text-purple-600",
                        )}
                      >
                        {selectedTemplate.currency}
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={clsx(
                      "w-5 h-5 text-grays transition-transform shrink-0 ml-2",
                      isProviderOpen && "rotate-180",
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isProviderOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className={clsx(
                        "absolute left-0 right-0 top-full mt-2 rounded-xl border shadow-xl z-30 overflow-hidden max-h-[280px] overflow-y-auto",
                        isDark
                          ? "bg-card border-gray-700"
                          : "bg-white border-gray-200",
                      )}
                    >
                      {currentTemplates.map((tmpl) => (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => {
                            setSelectedTemplateId(tmpl.id);
                            setIsProviderOpen(false);
                          }}
                          className={clsx(
                            "w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors",
                            selectedTemplateId === tmpl.id
                              ? isDark
                                ? "bg-blue-500/10 text-bluelight"
                                : "bg-blue-50 text-bluelight"
                              : isDark
                                ? "text-shortblack hover:bg-subcard"
                                : "text-shortblack hover:bg-slate-50",
                          )}
                        >
                          <span className="text-[1.4em] font-medium">
                            {tmpl.name}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={clsx(
                                "text-[1.1em] px-2 py-0.5 rounded-md font-medium",
                                isDark
                                  ? "bg-purple-500/20 text-purple-400"
                                  : "bg-purple-100 text-purple-600",
                              )}
                            >
                              {tmpl.currency}
                            </span>
                            <span className="text-[1.1em] text-grays">
                              {formatAmount(Number(tmpl.fee), tmpl.currency)}
                            </span>
                            {selectedTemplateId === tmpl.id && (
                              <CheckCircle className="w-4 h-4 text-bluelight" />
                            )}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Selected template info */}
              {selectedTemplate && (
                <div className="flex items-center gap-2 text-[1.2em] text-grays">
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
                  <span className="mx-1">•</span>
                  <span>
                    {t("settingsPage.fee")}{" "}
                    {formatAmount(Number(selectedTemplate.fee), selectedTemplate.currency)}
                  </span>
                </div>
              )}
            </div>

            {/* Account Name */}
            <div className="space-y-2">
              <label className="text-[1.4em] font-semibold text-shortblack">
                {t("settingsPage.accountName")}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grays" />
                <input
                  type="text"
                  value={details.accountName}
                  onChange={(e) =>
                    setDetails({ ...details, accountName: e.target.value })
                  }
                  className={clsx(
                    "w-full pl-13 pr-4 py-4 rounded-xl text-[1.5em] text-shortblack focus:outline-none focus:ring-2 focus:ring-bluelight/40 transition-all",
                    isDark
                      ? "bg-subcard border border-gray-700 focus:border-bluelight"
                      : "bg-white border border-gray-200 focus:border-bluelight",
                  )}
                  placeholder={t("settingsPage.accountNamePlaceholder")}
                  required
                />
              </div>
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <label className="text-[1.4em] font-semibold text-shortblack">
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
                  "w-full px-5 py-4 rounded-xl text-[1.5em] text-shortblack focus:outline-none focus:ring-2 focus:ring-bluelight/40 font-mono transition-all",
                  isDark
                    ? "bg-subcard border border-gray-700 focus:border-bluelight"
                    : "bg-white border border-gray-200 focus:border-bluelight",
                )}
                placeholder={getInputPlaceholder(
                  selectedTemplate?.input_type || "text",
                )}
                required
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isProcessing || !selectedTemplate}
                className={clsx(
                  "bg-bluelight text-white px-10 py-4 rounded-xl font-bold text-[1.6em] hover:opacity-90 transition-all flex items-center gap-3 disabled:opacity-50 shadow-lg",
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

      <div
        className={clsx("h-px my-8", isDark ? "bg-gray-700" : "bg-gray-200")}
      />

      {/* 2. SAVED METHODS */}
      <SavedMethodsSection
        methods={methods}
        isDark={isDark}
        isProcessing={isProcessing}
        setAsDefault={setAsDefault}
        openEditModal={openEditModal}
        setDeleteId={setDeleteId}
        t={t}
      />

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

      {/* Edit Modal */}
      <AnimatePresence>
        {editMethod && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditMethod(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={clsx(
                "w-full max-w-md rounded-3xl p-8 shadow-2xl",
                isDark ? "bg-card border border-gray-800" : "bg-white",
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[1.8em] font-bold text-shortblack flex items-center gap-3">
                  <Pencil className="w-5 h-5 text-amber-500" />
                  {t("settingsPage.editMethodTitle")}
                </h3>
                <button
                  onClick={() => setEditMethod(null)}
                  className={clsx(
                    "p-2 rounded-xl transition-colors",
                    isDark ? "hover:bg-gray-800" : "hover:bg-gray-100",
                  )}
                >
                  <X className="w-5 h-5 text-grays" />
                </button>
              </div>

              {/* Provider Info (read-only) */}
              <div
                className={clsx(
                  "flex items-center gap-3 p-4 rounded-2xl mb-6",
                  isDark ? "bg-subcard" : "bg-slate-50",
                )}
              >
                <div className="p-2.5 rounded-xl bg-blues text-bluelight">
                  {editMethod.category === "bank" ? (
                    <Landmark className="w-5 h-5" />
                  ) : editMethod.category === "crypto" ? (
                    <Bitcoin className="w-5 h-5" />
                  ) : (
                    <Smartphone className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-[1.4em] font-bold text-shortblack">
                    {editMethod.provider}
                  </p>
                  {editMethod.currency && (
                    <span
                      className={clsx(
                        "text-[1em] px-2 py-0.5 rounded font-medium",
                        isDark
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-purple-100 text-purple-600",
                      )}
                    >
                      {editMethod.currency}
                    </span>
                  )}
                </div>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleEditSubmit} className="space-y-5">
                {/* Account Name */}
                <div className="space-y-2">
                  <label className="text-[1.3em] font-medium text-grays">
                    {t("settingsPage.accountName")}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grays" />
                    <input
                      type="text"
                      value={editDetails.accountName}
                      onChange={(e) =>
                        setEditDetails({
                          ...editDetails,
                          accountName: e.target.value,
                        })
                      }
                      className={clsx(
                        "w-full pl-12 pr-4 py-3 rounded-xl text-[1.4em] text-shortblack focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                        isDark
                          ? "bg-subcard border border-gray-700"
                          : "bg-white border border-gray-200",
                      )}
                      placeholder={t("settingsPage.accountNamePlaceholder")}
                      required
                    />
                  </div>
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <label className="text-[1.3em] font-medium text-grays">
                    {t("settingsPage.accountNumberLabel")}
                  </label>
                  <input
                    type="text"
                    value={editDetails.accountNumber}
                    onChange={(e) =>
                      setEditDetails({
                        ...editDetails,
                        accountNumber: e.target.value,
                      })
                    }
                    className={clsx(
                      "w-full px-5 py-3 rounded-xl text-[1.4em] text-shortblack focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono",
                      isDark
                        ? "bg-subcard border border-gray-700"
                        : "bg-white border border-gray-200",
                    )}
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditMethod(null)}
                    className={clsx(
                      "flex-1 py-3 rounded-xl font-bold text-[1.4em] transition-colors",
                      isDark
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                    )}
                  >
                    {t("settingsPage.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 py-3 rounded-xl font-bold text-[1.4em] bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {t("settingsPage.saveChanges")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===== SAVED METHODS SECTION (Redesigned) =====

interface SavedMethodsSectionProps {
  methods: SavedPaymentMethod[];
  isDark: boolean;
  isProcessing: boolean;
  setAsDefault: (id: string) => Promise<boolean>;
  openEditModal: (method: SavedPaymentMethod) => void;
  setDeleteId: (id: string | null) => void;
  t: ReturnType<typeof useTranslations<"Dashboard">>;
}

function SavedMethodsSection({
  methods,
  isDark,
  isProcessing,
  setAsDefault,
  openEditModal,
  setDeleteId,
  t,
}: SavedMethodsSectionProps) {
  // Track which card has visible account number
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  // Track which card has open action menu (mobile)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleVisible = (id: string) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getCategoryIcon = (category: string) => {
    if (category === "bank") return Landmark;
    if (category === "crypto") return Bitcoin;
    return Smartphone;
  };

  const getGradient = (category: string) => {
    return CATEGORY_GRADIENTS[category as keyof typeof CATEGORY_GRADIENTS] || CATEGORY_GRADIENTS.wallet;
  };

  // Stats counts
  const totalMethods = methods.length;
  const defaultMethod = methods.find((m) => m.isDefault);
  const walletCount = methods.filter((m) => m.category === "wallet").length;
  const bankCount = methods.filter((m) => m.category === "bank").length;
  const cryptoCount = methods.filter((m) => m.category === "crypto").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={clsx(
        "rounded-3xl shadow-sm overflow-hidden",
        isDark
          ? "bg-card border border-gray-800"
          : "bg-white border border-gray-100",
      )}
    >
      {/* Section Header */}
      <div className="p-8 pb-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[2em] font-bold text-shortblack flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-bluelight" />
            {t("settingsPage.savedMethods")}
          </h2>
          {totalMethods > 0 && (
            <span
              className={clsx(
                "text-[1.2em] font-bold px-3 py-1 rounded-full",
                isDark
                  ? "bg-bluelight/10 text-bluelight"
                  : "bg-blue-50 text-bluelight",
              )}
            >
              {totalMethods}
            </span>
          )}
        </div>

        {/* Stats Summary Bar */}
        {totalMethods > 0 && (
          <div
            className={clsx(
              "flex flex-wrap gap-3 mt-4 mb-6 p-4 rounded-2xl",
              isDark ? "bg-subcard/50" : "bg-slate-50",
            )}
          >
            {walletCount > 0 && (
              <div className="flex items-center gap-2">
                <div
                  className={clsx(
                    "w-2 h-2 rounded-full",
                    "bg-purple-500",
                  )}
                />
                <span className="text-[1.2em] text-grays">
                  {walletCount} Wallet
                </span>
              </div>
            )}
            {bankCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[1.2em] text-grays">
                  {bankCount} Bank
                </span>
              </div>
            )}
            {cryptoCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[1.2em] text-grays">
                  {cryptoCount} Crypto
                </span>
              </div>
            )}
            {defaultMethod && (
              <>
                <div
                  className={clsx(
                    "w-px h-4 self-center",
                    isDark ? "bg-gray-700" : "bg-gray-200",
                  )}
                />
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-[1.2em] text-grays">
                    {defaultMethod.provider}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Methods List */}
      <div className="px-8 pb-8">
        {totalMethods === 0 ? (
          <div
            className={clsx(
              "flex flex-col items-center justify-center py-16 px-8 border-2 border-dashed rounded-3xl",
              isDark ? "border-gray-700" : "border-gray-200",
            )}
          >
            <div
              className={clsx(
                "w-20 h-20 rounded-full flex items-center justify-center mb-5",
                isDark ? "bg-gray-800" : "bg-slate-100",
              )}
            >
              <CreditCard
                className={clsx(
                  "w-9 h-9",
                  isDark ? "text-gray-600" : "text-gray-300",
                )}
              />
            </div>
            <p className="text-[1.5em] font-semibold text-shortblack mb-1">
              {t("settingsPage.noSavedMethods")}
            </p>
            <p className="text-[1.2em] text-grays text-center max-w-[280px]">
              {t("settingsPage.noTemplates")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <AnimatePresence>
              {methods.map((method, index) => {
                const gradient = getGradient(method.category);
                const Icon = getCategoryIcon(method.category);
                const isVisible = visibleIds.has(method.id);
                const isMenuOpen = openMenuId === method.id;

                return (
                  <motion.div
                    key={method.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className={clsx(
                      "group relative rounded-2xl overflow-hidden transition-all duration-300",
                      isDark
                        ? "bg-subcard hover:shadow-lg"
                        : "bg-white hover:shadow-xl border border-gray-100",
                      isDark ? gradient.shadowDark : gradient.shadow,
                      method.isDefault && (isDark
                        ? "ring-2 ring-bluelight/30"
                        : "ring-2 ring-bluelight/20"),
                    )}
                  >
                    {/* Category Gradient Strip */}
                    <div
                      className={clsx(
                        "h-1.5 bg-gradient-to-r",
                        gradient.from,
                        gradient.to,
                      )}
                    />

                    <div className="p-5">
                      {/* Top Row: Icon + Provider + Badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={clsx(
                              "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                              isDark
                                ? `${gradient.accentBg} ${gradient.accent}`
                                : `${gradient.accentBgLight} ${gradient.accentLight}`,
                            )}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-[1.5em] font-bold text-shortblack leading-tight">
                                {method.provider}
                              </h3>
                              {method.currency && (
                                <span
                                  className={clsx(
                                    "text-[0.95em] px-2 py-0.5 rounded-md font-semibold",
                                    isDark
                                      ? `${gradient.accentBg} ${gradient.accent}`
                                      : `${gradient.accentBgLight} ${gradient.accentLight}`,
                                  )}
                                >
                                  {method.currency}
                                </span>
                              )}
                            </div>
                            <p className="text-[1.2em] text-grays truncate max-w-[180px] leading-snug mt-0.5">
                              {method.accountName}
                            </p>
                          </div>
                        </div>

                        {/* Default Badge or Menu Button */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {method.isDefault && (
                            <div
                              className={clsx(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[1.05em] font-bold",
                                isDark
                                  ? "bg-green-500/15 text-green-400"
                                  : "bg-green-50 text-green-600",
                              )}
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                              {t("settingsPage.default")}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Account Number Row */}
                      <div
                        className={clsx(
                          "flex items-center justify-between px-4 py-3 rounded-xl mb-4",
                          isDark ? "bg-card" : "bg-slate-50",
                        )}
                      >
                        <p className="text-[1.35em] font-mono text-shortblack tracking-wide truncate flex-1">
                          {isVisible
                            ? method.accountNumber
                            : maskAccountNumber(method.accountNumber)}
                        </p>
                        <button
                          onClick={() => toggleVisible(method.id)}
                          className={clsx(
                            "ml-3 p-1.5 rounded-lg transition-colors shrink-0",
                            isDark
                              ? "hover:bg-gray-700 text-gray-500 hover:text-gray-300"
                              : "hover:bg-gray-200 text-gray-400 hover:text-gray-600",
                          )}
                          title={
                            isVisible ? "Hide" : "Show"
                          }
                        >
                          {isVisible ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div
                        className={clsx(
                          "flex items-center gap-2 pt-3 border-t",
                          isDark ? "border-gray-700/50" : "border-gray-100",
                        )}
                      >
                        {/* Set Default Button */}
                        {!method.isDefault && (
                          <button
                            onClick={() => setAsDefault(method.id)}
                            disabled={isProcessing}
                            className={clsx(
                              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[1.15em] font-semibold transition-all disabled:opacity-50",
                              isDark
                                ? "text-bluelight hover:bg-blue-500/10"
                                : "text-bluelight hover:bg-blue-50",
                            )}
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span className="">
                              {t("settingsPage.setDefault")}
                            </span>
                          </button>
                        )}

                        <div className="flex-1" />

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(method)}
                          disabled={isProcessing}
                          className={clsx(
                            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[1.15em] font-semibold transition-all disabled:opacity-50",
                            isDark
                              ? "text-amber-400 hover:bg-amber-500/10"
                              : "text-amber-500 hover:bg-amber-50",
                          )}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">
                            {t("settingsPage.edit")}
                          </span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteId(method.id)}
                          disabled={isProcessing}
                          className={clsx(
                            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[1.15em] font-semibold transition-all disabled:opacity-50",
                            isDark
                              ? "text-red-400 hover:bg-red-500/10"
                              : "text-red-500 hover:bg-red-50",
                          )}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">
                            {t("settingsPage.delete")}
                          </span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
