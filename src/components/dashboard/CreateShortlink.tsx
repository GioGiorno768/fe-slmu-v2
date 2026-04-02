// src/components/dashboard/CreateShortlink.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Link as LinkIcon,
  Plus,
  Minus,
  Loader2,
  Lock,
  Type,
  Calendar,
  ChevronDown,
  OctagonAlert,
  Clipboard,
  Check,
  Upload,
  Facebook,
  Twitter,
  Send,
  Megaphone,
  Sparkles,
  Bolt,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type {
  AdLevel,
  CreateLinkFormData,
  GeneratedLinkData,
} from "@/types/type";
import { Link } from "@/i18n/routing";
import { useAdsInfo } from "@/hooks/useAdsInfo";
import { useFeatureLocks } from "@/hooks/useFeatureLocks";
import { useTheme } from "next-themes";

// Definisi Props
interface CreateShortlinkProps {
  generatedLink: GeneratedLinkData | null;
  isLoading: boolean;
  error: string | null;
  onSubmit: (data: CreateLinkFormData) => Promise<boolean>; // Return true kalo sukses (biar bisa clear form)
}

export default function CreateShortlink({
  generatedLink,
  isLoading,
  error,
  onSubmit,
}: CreateShortlinkProps) {
  const t = useTranslations("Dashboard");

  // Fetch ad levels from API
  const { levels: adLevelsFromApi, isLoading: isLoadingLevels } = useAdsInfo();
  const { isAdLevelUnlocked } = useFeatureLocks();
  const { theme } = useTheme();

  // Prevent hydration mismatch - wait for client-side
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isDark = mounted && theme === "dark";

  // Helper Timezone Local
  const getMinDateTimeLocal = () => {
    const localDate = new Date();
    localDate.setMinutes(
      localDate.getMinutes() - localDate.getTimezoneOffset(),
    );
    return localDate.toISOString().slice(0, 16);
  };

  // State Form (Tetap di sini karena ini UI Control)
  const [formData, setFormData] = useState<CreateLinkFormData>({
    url: "",
    alias: "",
    password: "",
    title: "",
    expiresAt: "",
    adsLevel: "level1", // Default, will be updated when API loads
  });

  // State UI
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isAdsLevelOpen, setIsAdsLevelOpen] = useState(false);
  const [isShortCopied, setIsShortCopied] = useState(false);
  const [isDestCopied, setIsDestCopied] = useState(false);

  const adsLevelRef = useRef<HTMLDivElement>(null);

  // Map API data to dropdown options with lock status
  const adLevels = adLevelsFromApi.map((level, index) => ({
    key: level.slug as AdLevel,
    label: level.name,
    isLocked: !isAdLevelUnlocked(index + 1),
    requiredLevel: index === 2 ? "Elite" : index === 3 ? "Pro" : "",
  }));

  // Set default adsLevel when API loads
  useEffect(() => {
    if (adLevelsFromApi.length > 0 && formData.adsLevel === "level1") {
      // Find level with is_default: true, fallback to first level
      const defaultLevel =
        adLevelsFromApi.find((l) => l.is_default) || adLevelsFromApi[0];
      setFormData((prev) => ({
        ...prev,
        adsLevel: defaultLevel.slug as AdLevel,
      }));
    }
  }, [adLevelsFromApi]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        adsLevelRef.current &&
        !adsLevelRef.current.contains(event.target as Node)
      ) {
        setIsAdsLevelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleAdLevelChange = (level: AdLevel) => {
    setFormData({ ...formData, adsLevel: level });
    setIsAdsLevelOpen(false);
  };

  // Handler Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Panggil fungsi dari Parent
    const success = await onSubmit(formData);

    // Kalau sukses, reset form (tapi biarin settingan advanced)
    if (success) {
      setFormData({
        ...formData,
        url: "",
        alias: "",
      });
    }
  };

  const handleCopy = (text: string, type: "short" | "dest") => {
    navigator.clipboard.writeText(text);
    if (type === "short") {
      setIsShortCopied(true);
      setTimeout(() => setIsShortCopied(false), 2000);
    } else {
      setIsDestCopied(true);
      setTimeout(() => setIsDestCopied(false), 2000);
    }
  };

  const socialPlatforms = [
    {
      name: "WhatsApp",
      icon: <span className="meteor-icons--whatsapp w-5 h-5 bg-green-500" />,
      url: `https://api.whatsapp.com/send?text=`,
    },
    {
      name: "Facebook",
      icon: <Facebook className="w-5 h-5 text-blue-600" fill="currentColor" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=`,
    },
    {
      name: "Telegram",
      icon: <Send className="w-5 h-5 text-blue-500" />,
      url: `https://t.me/share/url?url=`,
    },
    {
      name: "Twitter",
      icon: <Twitter className="w-5 h-5 text-black" fill="currentColor" />,
      url: `https://twitter.com/intent/tweet?text=`,
    },
  ];

  const handleSocialShare = (platform: (typeof socialPlatforms)[0]) => {
    if (!generatedLink) return;
    const text = `${t("createShortlinkCard.shareText")} ${generatedLink.shortUrl}`;
    const encodedUrl = encodeURIComponent(generatedLink.shortUrl);
    const encodedText = encodeURIComponent(text);
    const shareUrl =
      platform.name === "WhatsApp" || platform.name === "Twitter"
        ? `${platform.url}${encodedText}`
        : `${platform.url}${encodedUrl}&text=${encodedText}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const handleGenericShare = async () => {
    if (navigator.share && generatedLink) {
      try {
        await navigator.share({
          title: t("createShortlinkCard.shareTitle"),
          text: `${t("createShortlinkCard.shareText")} ${generatedLink.shortUrl}`,
          url: generatedLink.shortUrl,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      alert(t("createShortlinkCard.browserNoShare"));
    }
  };

  return (
    <div className="space-y-6">
      {/* FORM CARD */}
      <div className="bg-card p-7 rounded-3xl shadow-sm shadow-slate-500/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                isDark
                  ? "bg-gradient-to-br from-blue-background-gradient to-purple-background-gradient shadow-lightpurple-dashboard/30"
                  : "bg-gradient-to-br from-bluelight to-indigo-600 shadow-blue-200"
              }`}
            >
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[1.8em] font-bold text-shortblack tracking-tight">
                {t("createShortlink")}
              </h3>
              <p className="text-[1.2em] text-grays mt-0.5">{t("descCreateShortlink")}</p>
            </div>
          </div>
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="flex items-center gap-2 text-[1.3em] font-semibold text-bluelight bg-subcard px-4 py-2 rounded-xl hover:bg-blues transition-all border border-gray-dashboard/30"
          >
            {/* {isAdvancedOpen ? (
              <Minus className="w-4 h-4" />
            ) : (
            )} */}
            <Bolt className="w-4 h-4" />
            <span className="hidden sm:inline-block">
              {isAdvancedOpen ? t("basicLink") : t("advancedLink")}
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="w-full text-[1.6em] px-4 py-3 rounded-xl border border-gray-dashboard/30 focus:outline-none focus:ring-2 focus:ring-bluelight bg-subcard text-shortblack placeholder:text-grays"
              placeholder={t("pasteUrl")}
              required
            />
            <div className="relative">
              <input
                type="text"
                name="alias"
                value={formData.alias}
                onChange={handleAliasChange}
                autoComplete="off"
                maxLength={20}
                className="w-full text-[1.6em] px-4 py-3 pr-22 rounded-xl border border-gray-dashboard/30 focus:outline-none focus:ring-2 focus:ring-bluelight bg-subcard text-shortblack placeholder:text-grays"
                placeholder={t("setAlias")}
              />
              <span
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-[1.2em] font-mono pointer-events-none ${
                  (formData.alias?.length ?? 0) > 0 &&
                  (formData.alias?.length ?? 0) < 4
                    ? "text-red-500"
                    : "text-grays"
                }`}
              >
                {formData.alias?.length ?? 0}/4-20
              </span>
            </div>
          </div>

          <AnimatePresence>
            {isAdvancedOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300">
                  <div className="relative">
                    <Lock className="w-4 h-4 text-grays absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className="w-full text-[1.6em] px-10 py-3 rounded-xl border border-gray-dashboard/30 focus:outline-none focus:ring-2 focus:ring-bluelight bg-subcard text-shortblack placeholder:text-grays"
                      placeholder={t("setPassword")}
                    />
                  </div>
                  <div className="relative">
                    <Type className="w-4 h-4 text-grays absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full text-[1.6em] px-10 py-3 rounded-xl border border-gray-dashboard/30 focus:outline-none focus:ring-2 focus:ring-bluelight bg-subcard text-shortblack placeholder:text-grays"
                      placeholder={t("setTitle")}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300 mt-4">
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-grays absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="datetime-local"
                      name="expiresAt"
                      value={formData.expiresAt}
                      onChange={handleChange}
                      className="w-full text-[1.6em] px-10 py-3 rounded-xl border border-gray-dashboard/30 focus:outline-none focus:ring-2 focus:ring-bluelight bg-subcard text-shortblack placeholder:text-grays"
                      min={getMinDateTimeLocal()}
                    />
                  </div>
                  {/* awal ads */}
                  <div
                    className="relative justify-stretch items-stretch gap-3 flex"
                    ref={adsLevelRef}
                  >
                    <button
                      type="button"
                      onClick={() => setIsAdsLevelOpen(!isAdsLevelOpen)}
                      disabled={isLoadingLevels}
                      className="w-full text-[1.6em] px-4 py-3 rounded-xl border border-gray-dashboard/30 bg-subcard flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-bluelight disabled:opacity-50"
                    >
                      {isLoadingLevels ? (
                        <span className="text-grays flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t("createShortlinkCard.loading")}
                        </span>
                      ) : (
                        <span className="text-shortblack">
                          {adLevels.find((l) => l.key === formData.adsLevel)
                            ?.label || t("adsLevel")}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-5 h-5 text-grays transition-transform ${
                          isAdsLevelOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {isAdsLevelOpen && !isLoadingLevels && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute top-full right-0 mt-2 p-2 w-full bg-card rounded-lg shadow-lg z-20 border border-gray-dashboard/30"
                        >
                          {adLevels.map((level) => (
                            <button
                              key={level.key}
                              type="button"
                              onClick={() =>
                                !level.isLocked &&
                                handleAdLevelChange(level.key)
                              }
                              disabled={level.isLocked}
                              className={`w-full text-left text-[1.4em] px-3 py-2 rounded-md flex items-center justify-between gap-2 ${
                                level.isLocked
                                  ? "text-gray-400 cursor-not-allowed"
                                  : formData.adsLevel === level.key
                                    ? "dark:bg-gradient-to-r dark:from-blue-background-gradient dark:to-purple-background-gradient text-tx-blue-dashboard font-semibold"
                                    : "text-shortblack hover:bg-subcard"
                              }`}
                            >
                              <span>{level.label}</span>
                              {level.isLocked && (
                                <span className="flex items-center gap-1 text-[0.85em] text-gray-400">
                                  <Lock className="w-3 h-3" />
                                  <span>{level.requiredLevel}</span>
                                </span>
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Link
                      href={"/ads-info"}
                      className="relative px-[1.5em] rounded-lg bg-subcard flex items-center justify-center hover:bg-blues transition-colors"
                    >
                      <Megaphone className="w-6 h-6 text-bluelight" />
                    </Link>
                  </div>
                  {/* batas ads */}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white text-[1.5em] font-semibold py-4 rounded-2xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg relative ${
              isDark
                ? "bg-gradient-to-r from-blue-background-gradient to-purple-background-gradient shadow-lightpurple-dashboard/50"
                : "bg-gradient-to-r from-bluelight to-indigo-600 shadow-blue-200"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>{isLoading ? t("generating") : t("generateShortlink")}</span>
          </button>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="text-redshortlink text-[1.4em] font-medium flex items-center justify-center gap-2"
              >
                <OctagonAlert className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* RESULT CARD */}
      <AnimatePresence>
        {generatedLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 custom:grid-cols-3 gap-4"
          >
            {/* Short Link */}
            <div className="bg-card p-4 rounded-xl shadow-sm shadow-slate-500/50 flex items-center justify-between gap-3 border border-gray-dashboard/30">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-subcard flex-shrink-0 flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-bluelight" />
                </div>
                <div className="min-w-0">
                  <p className="text-[1.2em] font-medium text-grays">
                    {t("yourLink")}
                  </p>
                  <p className="text-[1.6em] font-semibold text-shortblack truncate">
                    {generatedLink.shortUrl}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCopy(generatedLink.shortUrl, "short")}
                title={isShortCopied ? t("copied") : t("copy")}
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg text-bluelight hover:bg-blues transition-colors"
              >
                {isShortCopied ? (
                  <Check className="w-5 h-5 text-greenlight" />
                ) : (
                  <Clipboard className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Share */}
            <div className="bg-card p-4 rounded-xl shadow-sm shadow-slate-500/50 flex items-center justify-between gap-3 border border-gray-dashboard/30">
              <div className="flex items-center gap-2">
                {socialPlatforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handleSocialShare(platform)}
                    title={`Share to ${platform.name}`}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-subcard hover:bg-blues transition-colors"
                  >
                    {platform.icon}
                  </button>
                ))}
              </div>
              <button
                onClick={handleGenericShare}
                title={t("share")}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-bluelight hover:bg-blues transition-colors"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>

            {/* Original Link */}
            <div className="bg-card p-4 rounded-xl shadow-sm shadow-slate-500/50 flex items-center justify-between gap-3 border border-gray-dashboard/30">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-subcard flex-shrink-0 flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-bluelight" />
                </div>
                <div className="min-w-0">
                  <p className="text-[1.2em] font-medium text-grays">
                    {t("destinationLink")}
                  </p>
                  <p className="text-[1.6em] font-semibold text-shortblack truncate">
                    {generatedLink.originalUrl}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCopy(generatedLink.originalUrl, "dest")}
                title={isDestCopied ? t("copied") : t("copy")}
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg text-bluelight hover:bg-blues transition-colors"
              >
                {isDestCopied ? (
                  <Check className="w-5 h-5 text-greenlight" />
                ) : (
                  <Clipboard className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
