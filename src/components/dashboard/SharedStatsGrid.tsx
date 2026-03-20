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
    | "amber"; // Tambahin warna lain kalo butuh
}

interface SharedStatsGridProps {
  cards: StatCardData[];
  isLoading: boolean;
  columns?: 3 | 4; // Opsional: bisa atur mau 3 atau 4 kolom
}

export default function SharedStatsGrid({
  cards,
  isLoading,
  columns = 4,
}: SharedStatsGridProps) {
  // Helper Styles (Updated for Dark Mode with alpha-transparent colors)
  const getStyles = (color: string) => {
    switch (color) {
      case "blue":
        return {
          text: "text-blue-500 dark:text-blue-400",
          iconBg: "bg-blue-500/20",
          border: "border-blue-500/30",
        };
      case "green":
        return {
          text: "text-green-500 dark:text-green-400",
          iconBg: "bg-green-500/20",
          border: "border-green-500/30",
        };
      case "red":
        return {
          text: "text-red-500 dark:text-red-400",
          iconBg: "bg-red-500/20",
          border: "border-red-500/30",
        };
      case "orange":
        return {
          text: "text-orange-500 dark:text-orange-400",
          iconBg: "bg-orange-500/20",
          border: "border-orange-500/30",
        };
      case "emerald":
        return {
          text: "text-emerald-500 dark:text-emerald-400",
          iconBg: "bg-emerald-500/20",
          border: "border-emerald-500/30",
        };
      case "indigo":
        return {
          text: "text-indigo-500 dark:text-indigo-400",
          iconBg: "bg-indigo-500/20",
          border: "border-indigo-500/30",
        };
      case "amber":
        return {
          text: "text-amber-500 dark:text-amber-400",
          iconBg: "bg-amber-500/20",
          border: "border-amber-500/30",
        };
      case "purple":
        return {
          text: "text-purple-500 dark:text-purple-400",
          iconBg: "bg-purple-500/20",
          border: "border-purple-500/30",
        };
      default:
        return {
          text: "text-gray-500 dark:text-gray-400",
          iconBg: "bg-gray-500/20",
          border: "border-gray-500/30",
        };
    }
  };

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
            className="h-[160px] bg-card rounded-3xl shadow-sm border border-gray-dashboard/30 flex items-center justify-center"
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
        const style = getStyles(card.color);
        const isPositive = card.trend && card.trend > 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        const trendColor = isPositive
          ? "text-emerald-500 dark:text-emerald-400"
          : "text-red-500 dark:text-red-400";

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={clsx(
              "group bg-card p-6 rounded-3xl shadow-sm shadow-slate-500/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden border",
              style.border
            )}
          >
            {/* Header: Title */}
            <div className="flex items-center justify-between mb-2 relative z-10">
              <p className="text-[1.6em] font-semibold text-grays tracking-tight">
                {card.title}
              </p>
              {card.trend !== undefined ? (
                <div
                  className={clsx(
                    "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[1.1em] font-bold bg-subcard shadow-sm",
                    trendColor
                  )}
                >
                  <TrendIcon className="w-3.5 h-3.5" />
                  <span>{Math.abs(card.trend)}%</span>
                </div>
              ) : null}
            </div>

            {/* Body: Value & Icon */}
            <div className="flex justify-between items-end mt-2 relative z-10">
              <div>
                <h3
                  className={clsx(
                    "text-[3.2em] font-bold font-manrope leading-none mb-3",
                    style.text
                  )}
                >
                  {card.value}
                </h3>
                <div className="flex items-start flex-col gap-2">
                  <span className="text-[1.3em] text-slate-400 font-medium">
                    {card.subLabel}
                  </span>
                </div>
              </div>

              <div
                className={clsx(
                  "w-[4.5em] h-[4.5em] rounded-full flex justify-center items-center border-[1.5px] transition-transform duration-300 group-hover:scale-110 shrink-0",
                  style.iconBg,
                  style.border
                )}
              >
                <card.icon
                  className={clsx("w-[2.2em] h-[2.2em]", style.text)}
                />
              </div>
            </div>

            {/* Dekorasi Background */}
            <div
              className={clsx(
                "absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-5 pointer-events-none",
                style.text.replace("text-", "bg-")
              )}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
