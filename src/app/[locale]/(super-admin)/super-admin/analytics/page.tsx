"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Users,
  UserCheck,
  Link2,
  MousePointerClick,
  DollarSign,
  CreditCard,
  Clock,
  ChevronDown,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import {
  usePlatformAnalytics,
  type TimeFilter,
} from "@/hooks/usePlatformAnalytics";
import ActiveUsersDetailCard from "@/components/dashboard/super-admin/ActiveUsersDetailCard";
import TopCountriesCard from "@/components/dashboard/super-admin/TopCountriesCard";
import RevenueEstimationChart from "@/components/dashboard/super-admin/RevenueEstimationChart";
import { useTheme } from "next-themes";
import clsx from "clsx";

const TIME_FILTER_OPTIONS: { key: TimeFilter; label: string }[] = [
  { key: "all", label: "All Time" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
];

// ─── Hero Card Color Presets ────────────────────────────────
interface HeroPreset {
  gradient: string;
  iconBg: string;
  accentText: string;
  badge: string;
  glowFrom: string;
}

const HERO_PRESETS: Record<string, HeroPreset> = {
  green: {
    gradient: "from-emerald-500 to-teal-600",
    iconBg: "bg-white/20",
    accentText: "text-emerald-100",
    badge: "bg-emerald-400/25 text-emerald-50",
    glowFrom: "bg-emerald-400/15",
  },
  blue: {
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-white/20",
    accentText: "text-blue-100",
    badge: "bg-blue-400/25 text-blue-50",
    glowFrom: "bg-blue-400/15",
  },
  amber: {
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-white/20",
    accentText: "text-amber-100",
    badge: "bg-amber-400/25 text-amber-50",
    glowFrom: "bg-amber-400/15",
  },
};

// ─── Compact Card Color Presets ─────────────────────────────
interface CompactPreset {
  iconGradient: string;
  shadowColor: string;
  accentText: string;
  borderColor: string;
}

const COMPACT_PRESETS: Record<string, CompactPreset> = {
  purple: {
    iconGradient: "from-purple-500 to-violet-600",
    shadowColor: "shadow-purple-200 dark:shadow-purple-900/30",
    accentText: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-100 dark:border-purple-500/20",
  },
  orange: {
    iconGradient: "from-orange-500 to-amber-600",
    shadowColor: "shadow-orange-200 dark:shadow-orange-900/30",
    accentText: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-100 dark:border-orange-500/20",
  },
  blue: {
    iconGradient: "from-blue-500 to-indigo-600",
    shadowColor: "shadow-blue-200 dark:shadow-blue-900/30",
    accentText: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-100 dark:border-blue-500/20",
  },
  green: {
    iconGradient: "from-emerald-500 to-teal-600",
    shadowColor: "shadow-emerald-200 dark:shadow-emerald-900/30",
    accentText: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-100 dark:border-emerald-500/20",
  },
  rose: {
    iconGradient: "from-rose-500 to-pink-600",
    shadowColor: "shadow-rose-200 dark:shadow-rose-900/30",
    accentText: "text-rose-600 dark:text-rose-400",
    borderColor: "border-rose-100 dark:border-rose-500/20",
  },
};

export default function PlatformAnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { stats, isLoading } = usePlatformAnalytics(timeFilter);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Format compact number (K, M, B)
  const formatCompact = (num: number): string => {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };

  // Format currency with compact option
  const formatCurrency = (val: number, compact: boolean = false) => {
    if (compact && val >= 1_000) {
      return "$" + formatCompact(val);
    }
    return (
      "$" +
      val.toLocaleString("en-US", {
        minimumFractionDigits: 5,
        maximumFractionDigits: 5,
      })
    );
  };

  // Get current filter label
  const currentFilterLabel =
    TIME_FILTER_OPTIONS.find((f) => f.key === timeFilter)?.label || "All Time";

  // Get period text for subLabels based on filter
  type PeriodType =
    | "users"
    | "active"
    | "links"
    | "clicks"
    | "revenue"
    | "paid"
    | "pending"
    | "usersPaid";
  const getPeriodText = (type: PeriodType) => {
    const periodMap: Record<TimeFilter, Record<PeriodType, string>> = {
      all: {
        users: "All registered users",
        active: "All active users",
        links: "All created links",
        clicks: "Platform-wide",
        revenue: "All time earnings",
        paid: "Total disbursement",
        pending: "Pending withdrawals",
        usersPaid: "All users paid",
      },
      week: {
        users: "Registered this week",
        active: "Active this week",
        links: "Created this week",
        clicks: "This week",
        revenue: "Earned this week",
        paid: "Paid this week",
        pending: "Pending this week",
        usersPaid: "Users paid this week",
      },
      month: {
        users: "Registered this month",
        active: "Active this month",
        links: "Created this month",
        clicks: "This month",
        revenue: "Earned this month",
        paid: "Paid this month",
        pending: "Pending this month",
        usersPaid: "Users paid this month",
      },
      year: {
        users: "Registered this year",
        active: "Active this year",
        links: "Created this year",
        clicks: "This year",
        revenue: "Earned this year",
        paid: "Paid this year",
        pending: "Pending this year",
        usersPaid: "Users paid this year",
      },
    };
    return periodMap[timeFilter][type];
  };

  // ─── Hero Cards Data (Financial) ──────────────────────────
  const heroCards: {
    id: string;
    title: string;
    value: string;
    subLabel: string;
    icon: LucideIcon;
    preset: HeroPreset;
  }[] = [
    {
      id: "total-earnings",
      title: "Total Earnings",
      value: stats ? formatCurrency(stats.totalEarnings, true) : "$0",
      subLabel: getPeriodText("revenue"),
      icon: DollarSign,
      preset: HERO_PRESETS.green,
    },
    {
      id: "total-paid",
      title: "Total Paid",
      value: stats ? formatCurrency(stats.totalPaid, true) : "$0",
      subLabel: getPeriodText("paid"),
      icon: CreditCard,
      preset: HERO_PRESETS.blue,
    },
    {
      id: "total-pending",
      title: "Total Pending",
      value: stats ? formatCurrency(stats.totalPending, true) : "$0",
      subLabel: getPeriodText("pending"),
      icon: Clock,
      preset: HERO_PRESETS.amber,
    },
  ];

  // ─── Compact Cards Data (Platform) ────────────────────────
  const compactCards: {
    id: string;
    title: string;
    value: string;
    subLabel: string;
    icon: LucideIcon;
    preset: CompactPreset;
  }[] = [
    {
      id: "total-links",
      title: "Total Links",
      value: stats ? formatCompact(stats.totalLinks) : "0",
      subLabel: getPeriodText("links"),
      icon: Link2,
      preset: COMPACT_PRESETS.purple,
    },
    {
      id: "total-transactions",
      title: "Withdrawals",
      value: stats ? formatCompact(stats.totalTransactions) : "0",
      subLabel: getPeriodText("paid"),
      icon: CreditCard,
      preset: COMPACT_PRESETS.orange,
    },
    {
      id: "total-users",
      title: "Total Users",
      value: stats ? formatCompact(stats.totalUsers) : "0",
      subLabel: getPeriodText("users"),
      icon: Users,
      preset: COMPACT_PRESETS.blue,
    },
    {
      id: "active-users",
      title: "Active Users",
      value: stats ? formatCompact(stats.activeUsers) : "0",
      subLabel: getPeriodText("active"),
      icon: UserCheck,
      preset: COMPACT_PRESETS.green,
    },
    {
      id: "total-clicks",
      title: "Total Clicks",
      value: stats ? formatCompact(stats.totalClicks) : "0",
      subLabel: getPeriodText("clicks"),
      icon: MousePointerClick,
      preset: COMPACT_PRESETS.rose,
    },
  ];

  return (
    <div className="space-y-8 pb-10 font-figtree text-[10px]">
      {/* Header with Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className={clsx(
              "text-[2.4em] font-bold",
              isDark ? "text-white" : "text-shortblack",
            )}
          >
            Platform Analytics
          </h1>
          <p
            className={clsx(
              "text-[1.4em]",
              isDark ? "text-gray-400" : "text-gray-400",
            )}
          >
            Comprehensive overview of platform performance and metrics
          </p>
        </div>

        {/* Time Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={clsx(
              "flex items-center gap-2 text-[1.4em] font-medium px-5 py-3 rounded-2xl transition-all duration-300 border",
              isDark
                ? "bg-subcard border-gray-700 text-white hover:bg-gray-700"
                : "bg-white border-gray-200 text-slate-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm",
            )}
          >
            <Calendar className="w-4 h-4 text-bluelight" />
            <span>{currentFilterLabel}</span>
            <ChevronDown
              className={clsx(
                "w-4 h-4 transition-transform duration-300",
                isDark ? "text-gray-400" : "text-gray-400",
                isFilterOpen && "rotate-180",
              )}
            />
          </button>

          {isFilterOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsFilterOpen(false)}
              />
              {/* Dropdown Menu */}
              <div
                className={clsx(
                  "absolute top-full right-0 mt-2 p-2 w-44 rounded-2xl shadow-xl border z-20",
                  isDark
                    ? "bg-card border-gray-700"
                    : "bg-white border-gray-100",
                )}
              >
                {TIME_FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => {
                      setTimeFilter(option.key);
                      setIsFilterOpen(false);
                    }}
                    className={clsx(
                      "block w-full text-left text-[1.3em] px-4 py-2.5 rounded-xl transition-colors",
                      timeFilter === option.key
                        ? isDark
                          ? "bg-gradient-to-r from-blue-background-gradient to-purple-background-gradient text-tx-blue-dashboard font-semibold"
                          : "bg-bluelight/10 text-bluelight font-semibold"
                        : isDark
                          ? "text-gray-400 hover:text-white hover:bg-subcard"
                          : "text-slate-600 hover:bg-gray-50",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── HERO ROW: Financial Stats ─────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[140px] bg-card rounded-3xl border border-gray-dashboard/30 flex items-center justify-center"
            >
              <Loader2 className="w-8 h-8 text-bluelight/20 animate-spin" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {heroCards.map((card, index) => {
            const Icon = card.icon;
            const p = card.preset;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className={clsx(
                  "relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-lg",
                  "hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300",
                  p.gradient,
                )}
              >
                {/* Decorative glow */}
                <div
                  className={clsx(
                    "absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl",
                    p.glowFrom,
                  )}
                />
                <div
                  className={clsx(
                    "absolute -bottom-8 -left-8 h-24 w-24 rounded-full blur-2xl",
                    p.glowFrom,
                  )}
                />

                <div className="relative">
                  {/* Top row: Icon + Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={clsx(
                        "flex h-12 w-12 items-center justify-center rounded-2xl",
                        p.iconBg,
                      )}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[1.1em] font-semibold",
                        p.badge,
                      )}
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      {currentFilterLabel}
                    </span>
                  </div>

                  {/* Value */}
                  <h3 className="text-[3.2em] font-bold font-manrope leading-none tracking-tight">
                    {card.value}
                  </h3>

                  {/* Title + SubLabel */}
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[1.4em] font-semibold text-white/90">
                      {card.title}
                    </p>
                    <p className={clsx("text-[1.1em]", p.accentText)}>
                      {card.subLabel}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ─── COMPACT ROW: Platform Stats ───────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[90px] bg-card rounded-2xl border border-gray-dashboard/30 flex items-center justify-center"
            >
              <Loader2 className="w-6 h-6 text-bluelight/20 animate-spin" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {compactCards.map((card, index) => {
            const Icon = card.icon;
            const p = card.preset;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.06, duration: 0.3 }}
                className={clsx(
                  "group relative bg-card rounded-2xl p-4 border overflow-hidden",
                  "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
                  p.borderColor,
                )}
              >
                {/* Top: Icon + Title */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div
                    className={clsx(
                      "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm shrink-0",
                      p.iconGradient,
                      p.shadowColor,
                    )}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-[1.2em] text-grays leading-tight">
                    {card.title}
                  </p>
                </div>

                {/* Value */}
                <h4 className="text-[2.2em] font-bold text-shortblack font-manrope leading-none">
                  {card.value}
                </h4>

                {/* SubLabel */}
                <p className={clsx("text-[1em] mt-1.5", p.accentText)}>
                  {card.subLabel}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveUsersDetailCard />
        <TopCountriesCard />
      </div>

      {/* Revenue Estimation Chart - Full Version with Filters */}
      <RevenueEstimationChart />
    </div>
  );
}
