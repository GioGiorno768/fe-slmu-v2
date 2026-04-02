// src/components/dashboard/TopPerformingLinksCard.tsx
"use client";

import { useCurrency } from "@/contexts/CurrencyContext";

import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Loader2,
  ExternalLink,
  ChevronDown,
  Trophy,
  Medal,
  Link2,
  Eye,
  ArrowUpWideNarrow,
  ArrowDownWideNarrow,
  Coins,
  ChartNoAxesColumn,
  Megaphone,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";
import type { TopPerformingLink } from "@/types/type";

// Terima data lewat props
interface TopPerformingLinksCardProps {
  data: TopPerformingLink[] | null;
}

export default function TopPerformingLinksCard({
  data,
}: TopPerformingLinksCardProps) {
  const t = useTranslations("Dashboard");
  const { format: formatCurrency } = useCurrency();

  // State UI
  const [sortBy, setSortBy] = useState<"highest" | "lowest">("highest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Logic Sorting Client-Side (Pake useMemo biar efisien)
  const sortedLinks = useMemo(() => {
    if (!data) return [];
    // Copy array dulu biar gak mutasi props langsung
    return [...data].sort((a, b) => {
      if (sortBy === "highest") return b.validViews - a.validViews;
      return a.validViews - b.validViews; // Lowest
    });
  }, [data, sortBy]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Helper Icon Rank
  const getRankIcon = (index: number) => {
    if (sortBy === "lowest") {
      return (
        <span className="text-[1.2em] font-mono text-grays">
          <TrendingDown className="w-5 h-5 text-redshortlink" />
        </span>
      );
    }
    switch (index) {
      case 0:
        return (
          <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500/20" />
        );
      case 1:
        return <Medal className="w-6 h-6 text-slate-400 fill-slate-400/20" />;
      case 2:
        return <Medal className="w-6 h-6 text-orange-500 fill-orange-500/20" />;
      default:
        return <Link2 className="w-5 h-5 text-bluelight" />;
    }
  };

  return (
    <div className="bg-white dark:bg-card dark:text-white p-6 rounded-3xl shadow-sm shadow-slate-500/50 hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      {/* --- Header --- */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[1.8em] font-semibold text-shortblack tracking-tight flex items-center gap-2">
          {t("topPerformingLinks")}
        </h3>

        {/* Dropdown Filter */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 text-[1.3em] bg-blues font-medium text-bluelight transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-dashboard"
          >
            {sortBy === "highest"
              ? t("topLinks.highest")
              : t("topLinks.lowest")}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isSortOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {isSortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 w-40 dark:bg-card rounded-xl shadow-sm dark:shadow-shd-card/50 border border-shd-card/10 p-1 z-20 overflow-hidden"
              >
                <button
                  onClick={() => {
                    setSortBy("highest");
                    setIsSortOpen(false);
                  }}
                  className={clsx(
                    "flex items-center gap-2 w-full text-left text-[1.3em] px-3 py-2 rounded-lg transition-colors",
                    sortBy === "highest"
                      ? "dark:bg-gradient-to-r dark:from-blue-background-gradient dark:to-purple-background-gradient text-tx-blue-dashboard font-semibold"
                      : "dark:text-grays hover:dark:text-tx-blue-dashboard hover:bg-subcard transition-colors duration-300 ease-in-out",
                  )}
                >
                  <ArrowUpWideNarrow className="w-4 h-4" />{" "}
                  {t("topLinks.highest")}
                </button>
                <button
                  onClick={() => {
                    setSortBy("lowest");
                    setIsSortOpen(false);
                  }}
                  className={clsx(
                    "flex items-center gap-2 w-full text-left text-[1.3em] px-3 py-2 rounded-lg transition-colors",
                    sortBy === "lowest"
                      ? "dark:bg-gradient-to-r dark:from-blue-background-gradient dark:to-purple-background-gradient text-tx-blue-dashboard font-semibold"
                      : "dark:text-grays hover:dark:text-tx-blue-dashboard hover:bg-subcard transition-colors duration-300 ease-in-out",
                  )}
                >
                  <ArrowDownWideNarrow className="w-4 h-4" />{" "}
                  {t("topLinks.lowest")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- List Content --- */}
      <div className="flex-1 relative min-h-[250px]">
        {!data ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-bluelight" />
          </div>
        ) : (
          <div
            onWheel={(e) => e.stopPropagation()}
            className="space-y-0 overflow-y-auto h-[340px] pe-2 custom-scrollbar-minimal"
          >
            {sortedLinks.map((link, index) => (
              <div
                key={link.id}
                className="group rounded-2xl p-3.5 transition-all duration-200 hover:bg-subcard"
              >
                {/* Top: Rank + Title + External Link */}
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div
                    className={clsx(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                      index === 0 && sortBy === "highest"
                        ? "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-sm shadow-yellow-500/30"
                        : index === 1 && sortBy === "highest"
                          ? "bg-gradient-to-br from-slate-300 to-slate-400 shadow-sm shadow-slate-400/30"
                          : index === 2 && sortBy === "highest"
                            ? "bg-gradient-to-br from-orange-400 to-amber-600 shadow-sm shadow-orange-400/30"
                            : "bg-blues",
                    )}
                  >
                    {sortBy === "lowest" ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : index === 0 ? (
                      <Trophy className="w-4 h-4 text-white" />
                    ) : index === 1 ? (
                      <Medal className="w-4 h-4 text-white" />
                    ) : index === 2 ? (
                      <Medal className="w-4 h-4 text-white" />
                    ) : (
                      <Link2 className="w-3.5 h-3.5 text-bluelight" />
                    )}
                  </div>

                  {/* Link Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[1.5em] sm:text-[1.3em] font-semibold text-shortblack truncate group-hover:text-bluelight transition-colors">
                      {link.title}
                    </p>
                    <p className="text-[1.3em] sm:text-[1.2em] text-grays truncate">
                      {link.shortUrl}
                    </p>
                  </div>

                  {/* External Link */}
                  <a
                    href={link.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-card transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-grays group-hover:text-bluelight transition-colors" />
                  </a>
                </div>

                {/* Bottom: Inline Stats */}
                <div className="flex items-center gap-3 mt-2 ml-12 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-bluelight" />
                    <span className="text-[1.3em] font-medium text-grays">
                      {link.validViews.toLocaleString()}
                    </span>
                    <span className="text-[1.3em] text-grays/50">
                      {t("topLinks.views").toLowerCase()}
                    </span>
                  </div>
                  <span className="text-grays/25">•</span>
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-[1.3em] font-semibold text-tx-blue-dashboard">
                      {formatCurrency(link.totalEarnings)}
                    </span>
                  </div>
                  <span className="text-grays/25">•</span>
                  {/* TODO: TAMPILKAN ADS LEVEL */}
                  <div className="flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-[1.1em] font-medium text-grays capitalize">
                      {link.adsLevel}
                    </span>
                  </div>
                  {/* TODO: TAMPILKAN ADS LEVEL */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className=" text-center pt-4">
        <Link
          href="/new-link"
          className="text-[1.3em] font-semibold text-grays hover:text-bluelight flex items-center justify-center gap-1 transition-colors"
        >
          {t("topLinks.viewAllLinks")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
