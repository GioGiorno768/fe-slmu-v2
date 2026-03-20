// src/components/dashboard/EditLinkModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Edit,
  Loader2,
  Lock,
  Calendar,
  X,
  Megaphone,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { EditableLinkData, AdLevel } from "@/types/type";
import { useAdsInfo } from "@/hooks/useAdsInfo";
import { useFeatureLocks } from "@/hooks/useFeatureLocks";

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditableLinkData) => Promise<void>;
  initialData: EditableLinkData | null;
  isUpdating: boolean;
  shortUrlDisplay?: string; // Buat nampilin shortlink di header modal
  tittleDisplay?: string; // Buat nampilin title di header modal
  originalUrlDisplay?: string; // Buat nampilin original link di header modal
}

export default function EditLinkModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isUpdating,
  shortUrlDisplay,
  tittleDisplay,
  originalUrlDisplay,
}: EditLinkModalProps) {
  const t = useTranslations("Dashboard");
  const modalRef = useRef<HTMLDivElement>(null);
  const adLevelRef = useRef<HTMLDivElement>(null);

  // Fetch ad levels from API
  const { levels: adLevelsFromApi, isLoading: isLoadingLevels } = useAdsInfo();
  const { isAdLevelUnlocked, getRequiredLevelForAd } = useFeatureLocks();

  // State Form
  const [formData, setFormData] = useState<EditableLinkData>({
    alias: "",
    password: "",
    expiresAt: "",
    adsLevel: "medium", // Default to medium
  });

  // State Dropdown Ads Level
  const [isAdLevelDropdownOpen, setIsAdLevelDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Map API data to dropdown options with lock status
  const adLevels = adLevelsFromApi.map((level, index) => ({
    key: level.slug as AdLevel,
    label: level.name,
    isLocked: !isAdLevelUnlocked(index + 1),
    requiredLevel: getRequiredLevelForAd(index + 1),
  }));

  // Isi form saat modal dibuka / data berubah
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        alias: initialData.alias || "",
        password: initialData.password || "",
        expiresAt: initialData.expiresAt || "",
        adsLevel: initialData.adsLevel || "medium",
      });
    }
  }, [isOpen, initialData]);

  // Handle klik luar untuk nutup modal & dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Tutup dropdown ads level
      if (
        adLevelRef.current &&
        !adLevelRef.current.contains(event.target as Node)
      ) {
        setIsAdLevelDropdownOpen(false);
      }
      // Tutup modal (klik backdrop)
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        (event.target as HTMLElement).id === "modal-backdrop"
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Alias validation: only alphanumeric + dash + underscore (alpha_dash), min 4 / max 20 chars
  const handleAliasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/[^a-zA-Z0-9_-]/g, "") // Allow alpha_dash only
      .slice(0, 20); // Max 20 characters
    setFormData({ ...formData, alias: value });
  };

  const handleAdLevelChange = (level: AdLevel, isLocked: boolean) => {
    if (isLocked) return;
    setFormData({ ...formData, adsLevel: level });
    setIsAdLevelDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Helper min datetime
  const getMinDateTimeLocal = () => {
    const localDate = new Date();
    localDate.setMinutes(
      localDate.getMinutes() - localDate.getTimezoneOffset(),
    );
    return localDate.toISOString().slice(0, 16);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[90vh]"
          >
            {/* Tombol Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-grays hover:bg-subcard hover:text-shortblack transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              {/* Header Modal */}
              <div className="flex items-start gap-4 mb-6 pr-8 shrink-0">
                <div className="shrink-0 w-12 h-12 bg-subcard rounded-xl flex items-center justify-center">
                  <Edit className="w-6 h-6 text-bluelight" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-[1.8em] font-bold text-shortblack truncate">
                    {shortUrlDisplay || "Edit Link"}
                  </h3>
                  <p className="text-[1.4em] text-grays truncate">
                    {tittleDisplay}
                  </p>
                </div>
              </div>

              {/* Form Inputs (Scrollable) */}
              <div className="space-y-5  pr-2 custom-scrollbar-minimal flex-1 pb-4">
                {/* Alias */}
                <div>
                  <label className="block text-[1.4em] font-semibold text-shortblack mb-2">
                    {t("aliasLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="alias"
                      value={formData.alias}
                      onChange={handleAliasChange}
                      autoComplete="off"
                      maxLength={20}
                      className="w-full text-[1.5em] px-5 py-3 pr-22 rounded-xl border border-gray-dashboard/30 bg-subcard focus:bg-card focus:outline-none focus:ring-2 focus:ring-bluelight/50 focus:border-bluelight transition-all text-shortblack placeholder:text-grays"
                      placeholder="e.g., my-awesome-link"
                    />
                    <span
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-[1.1em] font-mono pointer-events-none ${
                        formData.alias.length > 0 && formData.alias.length < 4
                          ? "text-red-500"
                          : "text-grays"
                      }`}
                    >
                      {formData.alias.length}/4-20
                    </span>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[1.4em] font-semibold text-shortblack mb-2">
                    {t("passwordLabel")}
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-grays absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full text-[1.5em] pl-12 pr-12 py-3 rounded-xl border border-gray-dashboard/30 bg-subcard focus:bg-card focus:outline-none focus:ring-2 focus:ring-bluelight/50 focus:border-bluelight transition-all text-shortblack placeholder:text-grays"
                      placeholder={t("setPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-grays hover:text-shortblack transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expired Date */}
                <div>
                  <label className="block text-[1.4em] font-semibold text-shortblack mb-2">
                    {t("setExpiry")}
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-grays absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="datetime-local"
                      name="expiresAt"
                      value={formData.expiresAt}
                      onChange={handleChange}
                      className="w-full text-[1.5em] pl-12 pr-5 py-3 rounded-xl border border-gray-dashboard/30 bg-subcard focus:bg-card focus:outline-none focus:ring-2 focus:ring-bluelight/50 focus:border-bluelight transition-all text-shortblack"
                      min={getMinDateTimeLocal()}
                    />
                  </div>
                </div>

                {/* Dropdown Ads Level */}
                {/* <div className="relative" ref={adLevelRef}>
                  <label className="block text-[1.4em] font-semibold text-shortblack mb-2">
                    {t("adsLevel")}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setIsAdLevelDropdownOpen(!isAdLevelDropdownOpen)
                    }
                    className="w-full text-[1.5em] px-5 py-3 rounded-xl border border-gray-dashboard/30 bg-subcard flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-bluelight/50 hover:border-bluelight transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Megaphone className="w-5 h-5 text-bluelight" />
                      {isLoadingLevels ? (
                        <span className="text-grays flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </span>
                      ) : (
                        <span className="text-shortblack font-medium">
                          {adLevels.find((l) => l.key === formData.adsLevel)
                            ?.label || t("adsLevel")}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-grays transition-transform duration-300 ${
                        isAdLevelDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isAdLevelDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-15 left-0 right-0 mt-2 bg-card rounded-xl shadow-xl z-50 border border-gray-dashboard/30"
                      >
                        <div className="custom-scrollbar-minimal p-2">
                          {adLevels.map((level) => (
                            <button
                              key={level.key}
                              type="button"
                              onClick={() =>
                                handleAdLevelChange(level.key, level.isLocked)
                              }
                              disabled={level.isLocked}
                              className={`flex items-center justify-between w-full text-left text-[1.4em] px-4 py-3 rounded-lg transition-colors ${
                                level.isLocked
                                  ? "text-gray-400 cursor-not-allowed"
                                  : formData.adsLevel === level.key
                                    ? "bg-subcard text-bluelight font-semibold"
                                    : "text-shortblack hover:bg-subcard"
                              }`}
                            >
                              <div className="flex items-center">
                                {formData.adsLevel === level.key &&
                                  !level.isLocked && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-bluelight mr-3" />
                                  )}
                                <span
                                  className={
                                    formData.adsLevel !== level.key ||
                                    level.isLocked
                                      ? "ml-4"
                                      : ""
                                  }
                                >
                                  {level.label}
                                </span>
                              </div>
                              {level.isLocked && level.requiredLevel && (
                                <span className="flex items-center gap-1 text-[0.85em] text-gray-400">
                                  <Lock className="w-3 h-3" />
                                  <span>{level.requiredLevel}</span>
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div> */}
              </div>

              {/* Footer / Submit Button */}
              <div className="pt-4 mt-auto border-t border-gray-dashboard/30 shrink-0">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full bg-bluelight text-white text-[1.6em] font-semibold py-4 rounded-xl mt-2 
                           hover:bg-opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center gap-3"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
