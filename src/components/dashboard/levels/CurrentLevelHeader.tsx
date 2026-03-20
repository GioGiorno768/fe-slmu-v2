"use client";

import { motion } from "motion/react";
import {
  Shield,
  Star,
  Trophy,
  Gem,
  Rocket,
  Crown,
  Zap,
  TrendingUp,
  LucideIcon,
} from "lucide-react";
import type { UserLevelProgress } from "@/types/type";
import clsx from "clsx";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslations } from "next-intl";

interface CurrentLevelHeaderProps {
  data: UserLevelProgress;
}

// Icon mapper - convert level name to icon and colors
const levelIconMap: Record<
  string,
  { icon: LucideIcon; iconColor: string; bgColor: string; gradient: string }
> = {
  beginner: {
    icon: Shield,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100",
    gradient: "from-blue-500 to-indigo-600",
  },
  rookie: {
    icon: Star,
    iconColor: "text-green-600",
    bgColor: "bg-green-100",
    gradient: "from-green-500 to-emerald-600",
  },
  elite: {
    icon: Trophy,
    iconColor: "text-purple-600",
    bgColor: "bg-purple-100",
    gradient: "from-purple-500 to-pink-600",
  },
  pro: {
    icon: Gem,
    iconColor: "text-orange-600",
    bgColor: "bg-orange-100",
    gradient: "from-orange-500 to-red-600",
  },
  master: {
    icon: Rocket,
    iconColor: "text-red-600",
    bgColor: "bg-red-100",
    gradient: "from-red-500 to-rose-600",
  },
  mythic: {
    icon: Crown,
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-100",
    gradient: "from-yellow-500 to-amber-600",
  },
};

export default function CurrentLevelHeader({ data }: CurrentLevelHeaderProps) {
  const { format: formatCurrency } = useCurrency();
  const t = useTranslations("Dashboard");
  const earningsNeeded = Math.max(
    0,
    data.nextLevelEarnings - data.currentEarnings,
  );

  const levelConfig = levelIconMap[data.currentLevel] || levelIconMap.beginner;
  const LevelIcon = levelConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden"
    >
      {/* Main Card */}
      <div
        className={clsx(
          "bg-gradient-to-r rounded-3xl p-8 text-white shadow-xl relative",
          levelConfig.gradient,
        )}
      >
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
          {/* Icon Level */}
          <div className="relative">
            <div
              className={clsx(
                "w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl",
                levelConfig.bgColor,
              )}
            >
              <LevelIcon
                className={clsx("w-14 h-14", levelConfig.iconColor)}
                fill={data.currentLevel === "mythic" ? "currentColor" : "none"}
              />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-white/20 blur-xl -z-10" />
          </div>

          <div className="flex-1 w-full text-center lg:text-left">
            {/* Title & Badge */}
            <div className="flex flex-col lg:flex-row items-center gap-4 mb-4">
              <h2 className="text-[2.8em] font-bold capitalize tracking-tight">
                {data.currentLevel} {t("levelsPage.rank")}
              </h2>
              <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-1.5 rounded-full text-[1.2em] font-semibold">
                <Zap className="w-4 h-4 fill-current" />
                {t("levelsPage.currentTier")}
              </span>
            </div>

            {/* Description */}
            <p className="text-[1.5em] text-white/80 mb-6">
              {earningsNeeded > 0 ? (
                <>
                  {t("levelsPage.keepPushing")}{" "}
                  <span className="font-bold text-white">
                    {formatCurrency(earningsNeeded)}
                  </span>{" "}
                  {t("levelsPage.moreEarnings")}
                </>
              ) : (
                <span className="font-bold">
                  {t("levelsPage.highestLevel")}
                </span>
              )}
            </p>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[1.3em] font-medium text-white/70">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {formatCurrency(data.currentEarnings)}
                </span>
                <span>
                  {formatCurrency(data.nextLevelEarnings)} (
                  {t("levelsPage.target")})
                </span>
              </div>
              <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(data.progressPercent, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="h-full bg-white/90 rounded-full relative shadow-lg"
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white rounded-full" />
                </motion.div>
              </div>
              <p className="text-right text-[1.25em] text-white/60">
                {data.progressPercent.toFixed(1)}% {t("levelsPage.complete")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
