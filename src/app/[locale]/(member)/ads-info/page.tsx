// src/app/[locale]/(member)/ads-info/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Check,
  X as XIcon,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Zap,
  Flame,
  Bomb,
  Info,
  Lock,
} from "lucide-react";
import clsx from "clsx";
import { useAdsInfo } from "@/hooks/useAdsInfo";
import { useFeatureLocks } from "@/hooks/useFeatureLocks";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

// Helper Styles - returns different colors based on theme
const getThemeStyles = (theme: string, isDark: boolean) => {
  if (isDark) {
    // Dark mode - use softer, theme-matching colors
    switch (theme) {
      case "green":
        return {
          bg: "bg-green-900/30",
          text: "text-green-400",
          icon: ShieldCheck,
        };
      case "orange":
        return {
          bg: "bg-orange-900/30",
          text: "text-orange-400",
          icon: Flame,
        };
      case "red":
        return {
          bg: "bg-red-900/30",
          text: "text-red-400",
          icon: Bomb,
        };
      default: // Blue
        return {
          bg: "bg-blue-900/30",
          text: "text-blue-400",
          icon: Zap,
        };
    }
  } else {
    // Light mode - original colors
    switch (theme) {
      case "green":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          icon: ShieldCheck,
        };
      case "orange":
        return {
          bg: "bg-orange-50",
          text: "text-orange-700",
          icon: Flame,
        };
      case "red":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          icon: Bomb,
        };
      default: // Blue
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          icon: Zap,
        };
    }
  }
};

export default function AdsInfoPage() {
  const { levels, isLoading, error } = useAdsInfo();
  const { isAdLevelUnlocked } = useFeatureLocks();
  const { theme } = useTheme();
  const t = useTranslations("AdsInfo");

  // Prevent hydration mismatch - wait for client-side
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isDark = mounted && theme === "dark";

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-bluelight" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-redshortlink text-[1.6em]">
        {error}
      </div>
    );
  }

  const getAdLevelNumber = (levelIndex: number): number => levelIndex + 1;

  const getRequiredLevel = (adLevel: number): string => {
    if (adLevel === 3) return "Elite";
    if (adLevel === 4) return "Pro";
    return "";
  };

  return (
    <div className="lg:text-[10px] text-[8px] font-figtree pb-10">
      {/* Header Page */}
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-[3em] font-bold text-shortblack">{t("title")}</h1>
        <p className="text-[1.6em] text-grays max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {levels.map((level, index) => {
          const themeStyle = getThemeStyles(level.colorTheme, isDark);
          const LevelIcon = themeStyle.icon;
          const adLevelNumber = getAdLevelNumber(index);
          const isLocked = !isAdLevelUnlocked(adLevelNumber);
          const requiredLevel = getRequiredLevel(adLevelNumber);

          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={clsx(
                "relative rounded-3xl p-8 flex flex-col border-2 transition-all duration-300 group",
                // Background
                isDark ? "bg-card" : "bg-white",
                // Opacity for locked
                isLocked && "opacity-80",
                // Border & Shadow
                level.isPopular && !isLocked
                  ? isDark
                    ? "border-bluelight shadow-xl shadow-lightpurple-dashboard/30 scale-105 z-10"
                    : "border-bluelight shadow-xl shadow-blue-100 scale-105 z-10"
                  : isLocked
                    ? isDark
                      ? "border-lightpurple-dashboard/30 shadow-sm"
                      : "border-gray-200 shadow-sm"
                    : isDark
                      ? "border-gray-dashboard/50 shadow-sm hover:shadow-lg hover:-translate-y-1"
                      : "border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1",
              )}
            >
              {/* Locked Overlay - Purple-tinted for dark mode */}
              {isLocked && (
                <div
                  className={clsx(
                    "absolute inset-0 rounded-3xl z-10 pointer-events-none",
                    isDark
                      ? "bg-gradient-to-b from-[#1c133a]/90 via-transparent to-transparent"
                      : "bg-gradient-to-b from-gray-100/80 via-transparent to-transparent",
                  )}
                />
              )}

              {/* Locked Badge */}
              {isLocked && (
                <div
                  className={clsx(
                    "absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[1.2em] font-semibold shadow-md tracking-wide flex items-center gap-2 z-20",
                    isDark
                      ? "bg-lightpurple-dashboard text-white"
                      : "bg-gray-600 text-white",
                  )}
                >
                  <Lock className="w-3 h-3" />
                  <span>{t("locked")}</span>
                </div>
              )}

              {/* Badge Popular */}
              {level.isPopular && !isLocked && (
                <div
                  className={clsx(
                    "absolute -top-4 left-1/2 -translate-x-1/2 text-white px-4 py-1 rounded-full text-[1.2em] font-semibold shadow-md tracking-wide",
                    isDark
                      ? "bg-gradient-to-r from-blue-background-gradient to-purple-background-gradient"
                      : "bg-bluelight",
                  )}
                >
                  {t("mostPopular")}
                </div>
              )}

              {/* Card Header */}
              <div
                className={clsx(
                  "mb-6 text-center",
                  isLocked && !isDark && "grayscale",
                )}
              >
                <div
                  className={clsx(
                    "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4",
                    themeStyle.bg,
                  )}
                >
                  <LevelIcon className={clsx("w-8 h-8", themeStyle.text)} />
                </div>
                <h2 className="text-[2.4em] font-bold text-shortblack mb-2">
                  {level.name}
                </h2>
                <p className="text-[1.4em] text-grays leading-snug min-h-[3em]">
                  {level.description}
                </p>
              </div>

              {/* Revenue Info */}
              <div
                className={clsx(
                  "mb-8 p-4 rounded-xl text-center",
                  isDark ? "bg-subcard" : "bg-slate-50",
                  isLocked && !isDark && "grayscale",
                )}
              >
                <div className="flex justify-center items-baseline gap-1">
                  <span className="text-[3em] font-bold text-shortblack">
                    {level.revenueShare}%
                  </span>
                  <span className="text-[1.4em] text-grays font-medium">
                    {t("revenue")}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <ul
                className={clsx(
                  "space-y-4 mb-8 flex-1",
                  isLocked && !isDark && "grayscale",
                )}
              >
                {level.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-[1.4em]">
                    {feature.included ? (
                      <Check
                        className={clsx(
                          "w-5 h-5 flex-shrink-0 mt-0.5",
                          isDark ? "text-green-400" : "text-green-500",
                        )}
                      />
                    ) : (
                      <XIcon
                        className={clsx(
                          "w-5 h-5 flex-shrink-0 mt-0.5",
                          isDark ? "text-gray-600" : "text-gray-300",
                        )}
                      />
                    )}
                    <div className="flex flex-col">
                      <span
                        className={
                          feature.included
                            ? "text-shortblack"
                            : isDark
                              ? "text-gray-500"
                              : "text-gray-400"
                        }
                      >
                        {feature.label}
                      </span>
                      {feature.value !== false && feature.value !== true && (
                        <span className="text-[0.85em] text-grays font-medium">
                          {feature.value}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Unlock Requirement */}
              {isLocked && requiredLevel && (
                <div
                  className={clsx(
                    "mb-4 py-3 px-4 rounded-xl text-center border",
                    isDark
                      ? "bg-lightpurple-dashboard/20 border-lightpurple-dashboard/30"
                      : "bg-amber-50 border-amber-200",
                  )}
                >
                  <p
                    className={clsx(
                      "text-[1.3em] font-medium",
                      isDark ? "text-purple-300" : "text-amber-700",
                    )}
                  >
                    {t("unlockAtLevel")}{" "}
                    <span className="font-bold">{requiredLevel}</span>
                  </p>
                </div>
              )}

              {/* Demo Button */}
              <a
                href={level.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  "w-full py-4 rounded-xl font-semibold text-[1.6em] flex items-center justify-center gap-2 transition-all relative z-20",
                  level.isPopular && !isLocked
                    ? isDark
                      ? "bg-gradient-to-r from-blue-background-gradient to-purple-background-gradient text-white hover:opacity-90 shadow-lg shadow-lightpurple-dashboard/50"
                      : "bg-bluelight text-white hover:bg-opacity-90 shadow-lg shadow-blue-200"
                    : isDark
                      ? "bg-subcard border-2 border-gray-dashboard/30 text-shortblack hover:border-bluelight hover:text-bluelight"
                      : "bg-white border-2 border-gray-200 text-shortblack hover:border-bluelight hover:text-bluelight",
                )}
              >
                <span>{t("viewDemo")}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          );
        })}
      </div>

      {/* Info Section Bawah */}
      <div
        className={clsx(
          "mt-16 p-8 rounded-2xl flex items-start gap-4 border",
          isDark
            ? "bg-subcard border-gray-dashboard/30"
            : "bg-blue-dashboard border-bluelight/20",
        )}
      >
        <Info className="w-8 h-8 text-bluelight flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-[1.6em] font-bold text-shortblack mb-2">
            {t("infoTitle")}
          </h3>
          <p className="text-[1.4em] text-grays">{t("infoDesc")}</p>
          <ul className="list-disc list-inside mt-2 text-[1.4em] text-grays ml-2 space-y-1">
            <li>{t("infoList.revenueShare")}</li>
            <li>{t("infoList.popups")}</li>
            <li>{t("infoList.adTypes")}</li>
            <li>{t("infoList.demoLink")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
