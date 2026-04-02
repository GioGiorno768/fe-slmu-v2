"use client";

import { motion } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";

// Definisi tipe data buat satu kartu
export interface StatCardData {
  id: string;
  title: string;
  value: string;
  subLabel?: string;
  trend?: number;
  icon: LucideIcon;
  color:
    | "blue"
    | "green"
    | "red"
    | "orange"
    | "purple"
    | "emerald"
    | "indigo"
    | "amber";
}

interface SharedStatsGridProps {
  cards: StatCardData[];
  isLoading: boolean;
  columns?: 3 | 4;
}

// Gradient & style mapping per color — matching ReferralStatsGrid style
const COLOR_MAP: Record<
  string,
  {
    gradient: string;
    bgLight: string;
    shadowColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  blue: {
    gradient: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-500/20",
    shadowColor: "shadow-blue-200 dark:shadow-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-100 dark:border-blue-500/30",
  },
  green: {
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-500/20",
    shadowColor: "shadow-emerald-200 dark:shadow-emerald-900/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-100 dark:border-emerald-500/30",
  },
  red: {
    gradient: "from-red-500 to-rose-600",
    bgLight: "bg-red-500/20",
    shadowColor: "shadow-red-200 dark:shadow-red-900/30",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-100 dark:border-red-500/30",
  },
  orange: {
    gradient: "from-orange-500 to-amber-600",
    bgLight: "bg-orange-500/20",
    shadowColor: "shadow-orange-200 dark:shadow-orange-900/30",
    textColor: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-100 dark:border-orange-500/30",
  },
  purple: {
    gradient: "from-purple-500 to-violet-600",
    bgLight: "bg-purple-500/20",
    shadowColor: "shadow-purple-200 dark:shadow-purple-900/30",
    textColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-100 dark:border-purple-500/30",
  },
  emerald: {
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-500/20",
    shadowColor: "shadow-emerald-200 dark:shadow-emerald-900/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-100 dark:border-emerald-500/30",
  },
  indigo: {
    gradient: "from-indigo-500 to-blue-600",
    bgLight: "bg-indigo-500/20",
    shadowColor: "shadow-indigo-200 dark:shadow-indigo-900/30",
    textColor: "text-indigo-600 dark:text-indigo-400",
    borderColor: "border-indigo-100 dark:border-indigo-500/30",
  },
  amber: {
    gradient: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-500/20",
    shadowColor: "shadow-amber-200 dark:shadow-amber-900/30",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-100 dark:border-amber-500/30",
  },
};

const DEFAULT_STYLE = {
  gradient: "from-gray-500 to-slate-600",
  bgLight: "bg-gray-500/20",
  shadowColor: "shadow-gray-200 dark:shadow-gray-900/30",
  textColor: "text-gray-600 dark:text-gray-400",
  borderColor: "border-gray-100 dark:border-gray-500/30",
};

export default function SharedStatsGrid({
  cards,
  isLoading,
  columns = 4,
}: SharedStatsGridProps) {
  // Loading Skeleton
  if (isLoading) {
    return (
      <div
        className={clsx(
          "grid gap-6",
          columns === 3
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        )}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-[100px] bg-card rounded-3xl shadow-sm border border-gray-dashboard/30 flex items-center justify-center"
          >
            <Loader2 className="w-10 h-10 text-bluelight/20 animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "grid gap-6 font-figtree",
        columns === 3
          ? "grid-cols-1 md:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {cards.map((card, index) => {
        const style = COLOR_MAP[card.color] || DEFAULT_STYLE;
        const Icon = card.icon;
        const hasTrend = card.trend !== undefined;
        const isPositive = hasTrend && card.trend! > 0;

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            className={clsx(
              "relative bg-card p-6 rounded-3xl shadow-sm border overflow-hidden",
              "hover:shadow-lg hover:-translate-y-1 transition-all duration-200",
              style.borderColor,
            )}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 opacity-10">
              <div
                className={clsx(
                  "w-full h-full rounded-full bg-gradient-to-br",
                  style.gradient,
                )}
              />
            </div>

            <div className="relative flex items-center gap-5">
              {/* Icon — gradient filled square */}
              <div
                className={clsx(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br shrink-0",
                  style.gradient,
                  style.shadowColor,
                )}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="lg:text-[1.2em] text-[1.4em] text-grays mb-1">
                  {card.title}
                </p>
                <h3 className="text-[2.4em] font-bold text-shortblack font-manrope leading-none truncate">
                  {card.value}
                </h3>
                {card.subLabel && (
                  <p className={clsx("lg:text-[1.1em] text-[1.3em] mt-1", style.textColor)}>
                    {card.subLabel}
                  </p>
                )}
              </div>

              {/* Trend indicator */}
              {hasTrend ? (
                <div
                  className={clsx(
                    "p-2 rounded-xl shrink-0",
                    isPositive ? "bg-emerald-500/20" : "bg-red-500/20",
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
              ) : (
                <div className={clsx("p-2 rounded-xl shrink-0", style.bgLight)}>
                  <TrendingUp className={clsx("w-5 h-5", style.textColor)} />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
