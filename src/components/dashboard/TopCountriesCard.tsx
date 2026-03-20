// src/components/dashboard/TopCountriesCard.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Loader2, Globe, ArrowRight, Lock } from "lucide-react";
import type { CountryStat } from "@/types/type";
import { motion } from "motion/react";
import { Link } from "@/i18n/routing";
import clsx from "clsx";

interface TopCountriesCardProps {
  data: CountryStat[] | null;
  isLocked?: boolean;
  requiredLevel?: string | null;
}

export default function TopCountriesCard({
  data,
  isLocked = false,
  requiredLevel,
}: TopCountriesCardProps) {
  const t = useTranslations("Dashboard");
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  // Get gradient color based on rank
  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return "from-yellow-400 to-amber-500 text-white shadow-yellow-200";
      case 1:
        return "from-slate-300 to-slate-400 text-white shadow-slate-200";
      case 2:
        return "from-orange-400 to-amber-600 text-white shadow-orange-200";
      default:
        return "bg-blues text-bluelight";
    }
  };

  // Locked state UI
  if (isLocked) {
    return (
      <div className="bg-card sm:p-0 p-4 rounded-3xl shadow-sm shadow-slate-500/50 h-full flex flex-col relative overflow-hidden">
        {/* Locked overlay */}
        <div
          className={clsx(
            "absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm",
            isDark
              ? "bg-gradient-to-b from-card/98 via-subcard/95 to-background/90"
              : "bg-gradient-to-b from-gray-100/90 via-gray-50/80 to-white/95",
          )}
        >
          <div
            className={clsx(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border",
              isDark
                ? "bg-purple-500/20 border-purple-500/30"
                : "bg-gray-100 border-gray-200",
            )}
          >
            <Lock
              className={clsx(
                "w-8 h-8",
                isDark ? "text-purple-400" : "text-gray-500",
              )}
            />
          </div>
          <h3
            className={clsx(
              "text-[1.8em] font-bold mb-2",
              isDark ? "text-white" : "text-gray-600",
            )}
          >
            {t("topCountries.title")}
          </h3>
          <p
            className={clsx(
              "text-[1.3em] mb-4 text-center px-4",
              isDark ? "text-gray-300" : "text-gray-500",
            )}
          >
            {requiredLevel ? (
              <>
                {t("topCountries.unlockAtLevel")}{" "}
                <span
                  className={clsx(
                    "font-bold",
                    isDark ? "text-purple-400" : "text-purple-600",
                  )}
                >
                  {requiredLevel}
                </span>
              </>
            ) : (
              t("topCountries.upgradeToUnlock")
            )}
          </p>
        </div>

        {/* Blurred background content */}
        <div
          className={clsx(
            "pointer-events-none",
            isDark ? "opacity-20" : "opacity-30 grayscale",
          )}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[1.8em] sm:text-[1.6em] font-bold text-shortblack">
                {t("topCountries.title")}
              </h3>
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={clsx(
                  "h-12 rounded-xl",
                  isDark ? "bg-subcard" : "bg-gray-100",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-3xl shadow-sm shadow-slate-500/50 hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-[1.8em] sm:text-[1.6em] font-bold text-shortblack">
              {t("topCountries.title")}
            </h3>
            <p className="text-[1.4em] sm:text-[1.2em] text-grays">
              {t("topCountries.subtitle")}
            </p>
          </div>
        </div>
        <Link
          href="/analytics#countries"
          className="flex items-center gap-1 text-[1.4em] text-bluelight hover:underline font-medium group"
        >
          <span>{t("topCountries.detail")}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 relative min-h-[200px]">
        {!data ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-bluelight" />
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <Globe className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-grays text-[1.3em]">
              {t("topCountries.noData")}
            </p>
            <p className="text-gray-400 text-[1.1em]">
              {t("topCountries.startSharing")}
            </p>
          </div>
        ) : (
          <div
            className="space-y-3 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar-minimal"
            onWheel={(e) => e.stopPropagation()}
          >
            {data.slice(0, 5).map((country, index) => (
              <motion.div
                key={country.isoCode}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 px-3 rounded-xl hover:bg-blues/30 transition-colors group"
              >
                {/* Rank Badge */}
                <div
                  className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[1.1em] font-bold",
                    index < 3
                      ? `bg-gradient-to-br ${getRankStyle(index)} shadow-md`
                      : "bg-blues text-bluelight",
                  )}
                >
                  {index + 1}
                </div>

                {/* Flag */}
                <Image
                  src={`https://flagcdn.com/${country.isoCode}.svg`}
                  alt={country.name}
                  width={32}
                  height={24}
                  className="rounded-md object-cover h-[24px] shrink-0 shadow-sm"
                />

                {/* Country Name & Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[1.3em] font-semibold text-shortblack truncate group-hover:text-bluelight transition-colors">
                      {country.name}
                    </span>
                    <span className="text-[1.2em] font-bold text-bluelight">
                      {formatViews(country.views)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-blues rounded-full overflow-hidden">
                    <motion.div
                      className={clsx(
                        "h-full rounded-full",
                        index === 0
                          ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                          : index === 1
                            ? "bg-gradient-to-r from-slate-400 to-slate-500"
                            : index === 2
                              ? "bg-gradient-to-r from-orange-400 to-amber-500"
                              : "bg-bluelight",
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${country.percentage}%` }}
                      transition={{
                        duration: 0.6,
                        ease: "easeOut",
                        delay: index * 0.1,
                      }}
                    />
                  </div>
                </div>

                {/* Percentage */}
                <span className="text-[1.15em] font-semibold text-grays w-12 text-right shrink-0">
                  {country.percentage.toFixed(1)}%
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
