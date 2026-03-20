// src/components/dashboard/MilestoneCard.tsx
"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  TrendingUp,
  ChevronRight,
  Loader2,
  Lock,
  Star,
  Shield,
  Zap,
  Crown,
  Gem,
  Flame,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import type { MilestoneData } from "@/types/type";
import { useCurrency } from "@/contexts/CurrencyContext";

// Icon mapping from string name to component
const iconMap: Record<string, LucideIcon> = {
  star: Star,
  shield: Shield,
  zap: Zap,
  crown: Crown,
  gem: Gem,
  flame: Flame,
};

// Fallback styles for badge/progress when DB styling is not available
const getFallbackBadgeStyle = (iconColor?: string) => {
  // Extract color from iconColor class (e.g., "text-yellow-400" -> "yellow")
  const colorMatch = iconColor?.match(/text-(\w+)-/);
  const color = colorMatch?.[1] || "yellow";

  return {
    badgeBg: `bg-${color}-500/10`,
    badgeBorder: `border-${color}-500/30`,
    badgeText: `text-${color}-500`,
    progressGradient: `from-${color}-400 to-${color}-500`,
  };
};

interface MilestoneCardProps {
  data: MilestoneData | null;
}

export default function MilestoneCard({ data }: MilestoneCardProps) {
  const { format: formatCurrency } = useCurrency();
  const t = useTranslations("Dashboard.milestone");

  // Handle Loading State
  if (!data) {
    return (
      <div className="h-full min-h-[180px] bg-card p-6 rounded-3xl shadow-sm flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-bluelight" />
      </div>
    );
  }

  const {
    currentLevel,
    nextLevel,
    currentEarnings,
    nextTarget,
    currentBonus,
    nextBonus,
    progress,
    // Styling from DB
    iconName,
    iconColor,
    bgColor,
    borderColor,
  } = data;

  // Get icon component from name (fallback to Star)
  const LevelIcon = iconMap[iconName?.toLowerCase() || "star"] || Star;

  // Use DB styling or fallback
  const fallbackStyle = getFallbackBadgeStyle(iconColor);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative h-full p-8 bg-card rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 shadow-slate-400/50 text-shortblack overflow-hidden flex flex-col justify-between"
    >
      {/* === HEADER === */}
      <div className="flex justify-between items-start relative z-10">
        {/* Level Info */}
        <div className="flex items-center gap-4">
          {/* Icon Container - Dynamic from DB */}
          <div
            className={`w-12 h-12 ${
              bgColor || "bg-yellow-500/10"
            } backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/5`}
          >
            <LevelIcon
              className={`w-7 h-7 ${iconColor || "text-yellow-400"}`}
            />
          </div>
          <div>
            <p className="text-[1.5em] text-grays font-medium mb-0.5">
              {t("currentRank")}
            </p>
            <h3 className={`text-[2.2em] font-bold leading-none`}>
              {currentLevel}
            </h3>
          </div>
        </div>

        {/* CPM Bonus Badge - Dynamic from DB */}
        <div
          className={`hidden md:inline-flex items-center gap-2 ${
            bgColor || fallbackStyle.badgeBg
          } border ${
            borderColor || fallbackStyle.badgeBorder
          } px-4 py-2 rounded-full ${
            iconColor?.replace("text-", "text-") || fallbackStyle.badgeText
          } font-bold text-[1.2em]`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>+{currentBonus}% CPM</span>
        </div>

        {/* Mobile CPM Badge */}
        <div
          className={`md:hidden ${
            iconColor || fallbackStyle.badgeText
          } font-bold text-right`}
        >
          <div className="text-[2em]">+{currentBonus}%</div>
          <span className="text-[1em] opacity-80">{t("cpmBonus")}</span>
        </div>
      </div>

      {/* === PROGRESS SECTION === */}
      <div className="mt-8 relative z-10">
        {/* Earnings Row */}
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-[1.4em]">
            <span className="text-grays">{t("earnings")}: </span>
            <b className="text-bluelight">{formatCurrency(currentEarnings)}</b>
          </span>
          <span className="text-[1.4em] text-grays">
            {t("target")}: {formatCurrency(nextTarget)}
          </span>
        </div>

        {/* Progress Bar - Dynamic gradient based on iconColor */}
        <div className="h-3 bg-subcard rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${fallbackStyle.progressGradient} rounded-full relative`}
          >
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/40 blur-[2px] rounded-full" />
          </motion.div>
        </div>

        {/* Motivation Text */}
        <p className="mt-3 text-[1.3em] text-grays">
          <span className="text-bluelight font-semibold">
            {formatCurrency(nextTarget - currentEarnings)}
          </span>{" "}
          {t("moreToUnlock")}{" "}
          <span className={`${iconColor || "text-yellow-400"} font-bold`}>
            {nextLevel}
          </span>
        </p>
      </div>

      {/* === FOOTER === */}
      <div className="mt-6 pt-4 border-t border-gray-dashboard/30 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5 opacity-70">
          <Lock className="w-4 h-4 text-grays" />
          <span className="text-[1.3em] text-grays">
            {t("next")}:{" "}
            <span className="text-bluelight font-semibold">
              +{nextBonus}% CPM
            </span>
          </span>
        </div>

        <Link
          href="/levels"
          className="flex items-center gap-1 text-[1.3em] font-semibold text-bluelight/70 hover:text-bluelight transition-colors group"
        >
          {t("viewLevels")}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}