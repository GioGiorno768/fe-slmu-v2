"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Calendar,
  ChevronDown,
  Activity,
  Megaphone,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";
import type { MemberLinkFilters } from "@/types/type";
import { useTranslations } from "next-intl";

interface LinkFiltersProps {
  filters: MemberLinkFilters;
  setFilters: (f: MemberLinkFilters) => void;
}

/**
 * Determines whether a dropdown should open upward based on
 * the available viewport space below the trigger element.
 */
function shouldOpenUpward(
  ref: React.RefObject<HTMLDivElement | null>,
  menuHeight = 250,
): boolean {
  if (!ref.current) return false;
  const rect = ref.current.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  return spaceBelow < menuHeight;
}

export default function LinkFilters({ filters, setFilters }: LinkFiltersProps) {
  const t = useTranslations("Dashboard");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isLevelOpen, setIsLevelOpen] = useState(false);

  // Track direction: false = open downward (default), true = open upward
  const [sortUp, setSortUp] = useState(false);
  const [statusUp, setStatusUp] = useState(false);
  const [levelUp, setLevelUp] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (
        statusRef.current &&
        !statusRef.current.contains(event.target as Node)
      ) {
        setIsStatusOpen(false);
      }
      if (
        levelRef.current &&
        !levelRef.current.contains(event.target as Node)
      ) {
        setIsLevelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortOptions = [
    { label: t("linkList.sortNewest"), value: "newest" },
    { label: t("linkList.sortOldest"), value: "oldest" },
    { label: t("linkList.sortMostViews"), value: "most_views" },
    { label: t("linkList.sortLeastViews"), value: "least_views" },
    { label: t("linkList.sortMostEarnings"), value: "most_earnings" },
    { label: t("linkList.sortLeastEarnings"), value: "least_earnings" },
  ];

  const statusOptions = [
    { label: t("linkList.statusAll"), value: "all" },
    { label: t("linkList.statusActive"), value: "active" },
    { label: t("linkList.statusDisabled"), value: "disabled" },
    { label: t("linkList.statusExpired"), value: "expired" },
    { label: t("linkList.statusPassword"), value: "password" },
  ];

  const levelOptions = [
    { label: t("linkList.levelAll"), value: "all" },
    { label: t("linkList.levelLow"), value: "low" },
    { label: t("linkList.levelMedium"), value: "medium" },
    { label: t("linkList.levelHigh"), value: "high" },
    { label: t("linkList.levelAggressive"), value: "aggressive" },
  ];

  const getSortLabel = () => {
    return (
      sortOptions.find((o) => o.value === filters.sort)?.label ||
      t("linkList.sortNewest")
    );
  };

  const getStatusLabel = () => {
    return (
      statusOptions.find((o) => o.value === filters.status)?.label ||
      t("linkList.statusAll")
    );
  };

  const getLevelLabel = () => {
    return (
      levelOptions.find((o) => o.value === filters.adsLevel)?.label ||
      t("linkList.levelAll")
    );
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm p-6 mb-6 shadow-sm shadow-slate-500/50">
      <div className="flex flex-col gap-5">
        {/* Title Row */}
        <div className="flex items-center justify-between">
          <h3 className="text-[1.8em] font-bold text-shortblack">
            {t("linkList.title")}
          </h3>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grays" />
            <input
              type="text"
              placeholder={t("linkList.searchPlaceholder")}
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-subcard border border-gray-dashboard/30 focus:outline-none focus:ring-2 focus:ring-bluelight/20 text-[1.4em] text-shortblack placeholder:text-grays transition-all"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => {
                if (!isSortOpen) setSortUp(shouldOpenUpward(sortRef));
                setIsSortOpen(!isSortOpen);
                setIsStatusOpen(false);
                setIsLevelOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-dashboard/30 bg-subcard hover:bg-blues transition-colors text-[1.4em] min-w-[130px] justify-between w-full"
            >
              <div className="flex items-start gap-4">
                <Calendar className="w-4 h-4 text-grays" />
                <span className="text-shortblack font-medium">
                  {getSortLabel()}
                </span>
              </div>
              <ChevronDown
                className={clsx(
                  "w-4 h-4 text-grays transition-transform",
                  isSortOpen && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: sortUp ? 10 : -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: sortUp ? 10 : -10 }}
                  className={clsx(
                    "absolute left-0 w-full md:w-44 bg-card rounded-xl border border-gray-dashboard/30 shadow-lg z-20 overflow-hidden",
                    sortUp ? "bottom-full mb-2" : "top-full mt-2",
                  )}
                >
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilters({ ...filters, sort: opt.value });
                        setIsSortOpen(false);
                      }}
                      className={clsx(
                        "w-full px-4 py-3 text-left text-[1.3em] hover:bg-subcard transition-colors",
                        filters.sort === opt.value
                          ? "bg-subcard text-bluelight font-medium"
                          : "text-shortblack",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => {
                if (!isStatusOpen) setStatusUp(shouldOpenUpward(statusRef));
                setIsStatusOpen(!isStatusOpen);
                setIsSortOpen(false);
                setIsLevelOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-dashboard/30 bg-subcard hover:bg-blues transition-colors text-[1.4em] min-w-[140px] justify-between w-full"
            >
              <div className="flex items-start gap-4">
                <Activity className="w-4 h-4 text-grays" />
                <span className="text-shortblack font-medium">
                  {getStatusLabel()}
                </span>
              </div>
              <ChevronDown
                className={clsx(
                  "w-4 h-4 text-grays transition-transform",
                  isStatusOpen && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence>
              {isStatusOpen && (
                <motion.div
                  initial={{ opacity: 0, y: statusUp ? 10 : -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: statusUp ? 10 : -10 }}
                  className={clsx(
                    "absolute right-0 w-full md:w-48 bg-card rounded-xl border border-gray-dashboard/30 shadow-lg z-20 overflow-hidden",
                    statusUp ? "bottom-full mb-2" : "top-full mt-2",
                  )}
                >
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilters({ ...filters, status: opt.value });
                        setIsStatusOpen(false);
                      }}
                      className={clsx(
                        "w-full px-4 py-3 text-left text-[1.3em] hover:bg-subcard transition-colors",
                        filters.status === opt.value
                          ? "bg-subcard text-bluelight font-medium"
                          : "text-shortblack",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ads Level Filter Dropdown */}
          <div className="relative hidden" ref={levelRef}>
            <button
              onClick={() => {
                if (!isLevelOpen) setLevelUp(shouldOpenUpward(levelRef));
                setIsLevelOpen(!isLevelOpen);
                setIsSortOpen(false);
                setIsStatusOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-dashboard/30 bg-subcard hover:bg-blues transition-colors text-[1.4em] min-w-[140px] justify-between w-full"
            >
              <div className="flex items-start gap-4">
                <Megaphone className="w-4 h-4 text-grays" />
                <span className="text-shortblack font-medium">
                  {getLevelLabel()}
                </span>
              </div>
              <ChevronDown
                className={clsx(
                  "w-4 h-4 text-grays transition-transform",
                  isLevelOpen && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence>
              {isLevelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: levelUp ? 10 : -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: levelUp ? 10 : -10 }}
                  className={clsx(
                    "absolute right-0 w-full md:w-40 bg-card rounded-xl border border-gray-dashboard/30 shadow-lg z-20 overflow-hidden",
                    levelUp ? "bottom-full mb-2" : "top-full mt-2",
                  )}
                >
                  {levelOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilters({ ...filters, adsLevel: opt.value });
                        setIsLevelOpen(false);
                      }}
                      className={clsx(
                        "w-full px-4 py-3 text-left text-[1.3em] hover:bg-subcard transition-colors",
                        filters.adsLevel === opt.value
                          ? "bg-subcard text-bluelight font-medium"
                          : "text-shortblack",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
