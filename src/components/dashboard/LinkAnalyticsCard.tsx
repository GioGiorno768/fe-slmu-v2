// src/components/dashboard/LinkAnalyticsCard.tsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import {
  Loader2,
  OctagonAlert,
  ChevronDown,
  ArrowRightIcon,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";
import type { AnalyticsData, TimeRange, StatType } from "@/types/type";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { motion, AnimatePresence } from "motion/react";

// WAJIB: Import dinamis buat ApexCharts
const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-bluelight" />
    </div>
  ),
});

// Props yang diterima dari Parent
interface LinkAnalyticsCardProps {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  // State Filter dikontrol Parent
  range?: TimeRange;
  stat: StatType;
  // Callback buat minta Parent ganti data
  onChangeRange?: (range: TimeRange) => void;
  onChangeStat: (stat: StatType) => void;
  // Optional: Hide range filter if controlled externally
  hideRangeFilter?: boolean;
}

export default function LinkAnalyticsCard({
  data,
  isLoading,
  error,
  range = "perMonth",
  stat,
  onChangeRange,
  onChangeStat,
  hideRangeFilter = false,
}: LinkAnalyticsCardProps) {
  const t = useTranslations("Dashboard");
  const path = usePathname();
  const { format: formatCurrency } = useCurrency();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // State UI lokal (Dropdown Open/Close)
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const [isStatOpen, setIsStatOpen] = useState(false);
  const rangeRef = useRef<HTMLDivElement>(null);
  const statRef = useRef<HTMLDivElement>(null);

  // Opsi dropdown
  const timeRanges: { key: TimeRange; label: string }[] = [
    { key: "perWeek", label: t("perWeek") },
    { key: "perMonth", label: t("perMonth") },
    { key: "perYear", label: t("perYear") },
  ];

  // 🔧 Note: Only showing options that backend analytics endpoint supports
  const statOptions: {
    key: StatType;
    label: string;
    icon: typeof TrendingUp;
  }[] = [
    { key: "totalViews", label: t("totalViews"), icon: BarChart3 },
    { key: "totalEarnings", label: t("totalEarnings"), icon: TrendingUp },
  ];

  // Helper Warna Chart Dinamis
  const getColors = (type: StatType) => {
    switch (type) {
      case "totalEarnings":
        return ["#10b981"]; // Emerald green
      case "totalReferral":
        return ["#f59e0b"]; // Amber
      default:
        return ["#6366f1"]; // Indigo (Views)
    }
  };

  const getGradientColors = (type: StatType) => {
    switch (type) {
      case "totalEarnings":
        return { from: "#10b981", to: "#d1fae5" };
      case "totalReferral":
        return { from: "#f59e0b", to: "#fef3c7" };
      default:
        return { from: "#6366f1", to: "#e0e7ff" };
    }
  };

  // Calculate summary stats
  const totalValue = useMemo(() => {
    if (!data?.series?.[0]?.data) return 0;
    return data.series[0].data.reduce((sum, val) => sum + val, 0);
  }, [data]);

  const avgValue = useMemo(() => {
    if (!data?.series?.[0]?.data || data.series[0].data.length === 0) return 0;
    return totalValue / data.series[0].data.length;
  }, [data, totalValue]);

  // Konfigurasi Chart dengan fitur interaktif
  const chartOptions: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "area",
        height: 320,
        fontFamily: "Figtree, Inter, sans-serif",
        // 🔥 Zoom via drag selection (no scroll zoom)
        zoom: {
          enabled: true,
          type: "x",
          autoScaleYaxis: true,
        },
        // 🔥 Toolbar - only zoom in/out and home
        toolbar: {
          show: true,
          offsetX: 0,
          offsetY: -5,
          tools: {
            download: false,
            selection: false,
            zoom: false,
            zoomin: true,
            zoomout: true,
            pan: false,
            reset: true,
          },
        },
        // 🔥 Selection/brush for drag-to-zoom
        selection: {
          enabled: true,
          type: "x",
          fill: {
            color: "#6366f1",
            opacity: 0.1,
          },
          stroke: {
            width: 1,
            color: "#6366f1",
          },
        },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 500,
        },
        dropShadow: {
          enabled: true,
          color: getColors(stat)[0],
          top: 12,
          left: 0,
          blur: 4,
          opacity: 0.15,
        },
      },
      colors: getColors(stat),
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.3,
          gradientToColors: [getGradientColors(stat).to],
          inverseColors: false,
          opacityFrom: 0.6,
          opacityTo: 0.05,
          stops: [0, 100],
        },
      },
      stroke: {
        curve: "smooth",
        width: 3,
        lineCap: "round",
      },
      dataLabels: { enabled: false },
      markers: {
        size: 0,
        strokeWidth: 2,
        strokeColors: "#fff",
        hover: {
          size: 6,
          sizeOffset: 3,
        },
      },
      // 🔥 Enhanced tooltip
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        theme: isDark ? "dark" : "light",
        style: {
          fontSize: "13px",
          fontFamily: "Figtree, Inter, sans-serif",
        },
        x: {
          show: true,
        },
        y: {
          formatter: (val) =>
            stat === "totalEarnings"
              ? formatCurrency(val)
              : val.toLocaleString(),
          title: {
            formatter: () => (stat === "totalEarnings" ? "Earnings" : "Views"),
          },
        },
        marker: {
          show: true,
        },
      },
      xaxis: {
        type: "category",
        categories: data?.categories || [],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: "#94a3b8",
            fontSize: "12px",
            fontFamily: "Figtree, Inter, sans-serif",
          },
          rotate: 0,
          hideOverlappingLabels: true,
        },
        crosshairs: {
          show: true,
          stroke: {
            color: "#6366f1",
            width: 1,
            dashArray: 3,
          },
        },
      },
      yaxis: {
        labels: {
          formatter: (val) =>
            stat === "totalEarnings" ? formatCurrency(val) : val.toFixed(0),
          style: {
            colors: "#94a3b8",
            fontSize: "12px",
            fontFamily: "Figtree, Inter, sans-serif",
          },
        },
      },
      grid: {
        show: true,
        borderColor: "var(--color-gray-dashboard, #e2e8f0)",
        strokeDashArray: 4,
        padding: {
          left: 10,
          right: 10,
        },
      },
      legend: {
        show: false,
      },
    }),
    [data, stat, range, formatCurrency, isDark]
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rangeRef.current && !rangeRef.current.contains(event.target as Node))
        setIsRangeOpen(false);
      if (statRef.current && !statRef.current.contains(event.target as Node))
        setIsStatOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeStatOption = statOptions.find((o) => o.key === stat);
  const StatIcon = activeStatOption?.icon || BarChart3;

  return (
    <div className="bg-card p-6 rounded-3xl shadow-sm shadow-slate-500/50 hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      {/* Header */}
      <div className={path.includes("/dashboard") ? "flex flex-row items-start sm:items-center justify-between mb-4 gap-4" : "flex sm:flex-row flex-col items-start sm:items-center justify-between mb-4 gap-4"}>
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
              stat === "totalEarnings"
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200"
                : "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lightpurple-dashboard"
            )}
          >
            <StatIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-[1.8em] sm:text-[1.6em] font-bold text-shortblack">
              {t("clickAnalytics")}
            </h3>
            <p className="text-[1.4em] sm:text-[1.2em] text-bluelight">
              {stat === "totalEarnings" ? "Revenue trend" : "Traffic overview"}
            </p>
          </div>
        </div>

        {/* Grup Dropdown */}
        <div className="flex items-center gap-2 z-30">
          {path.includes("/dashboard") ? (
            <Link
              href="/analytics"
              className="text-[1.4em] bg-blues font-medium text-bluelight px-3 py-1.5 rounded-lg hover:bg-blue-dashboard transition-all duration-300 flex items-center gap-1 group"
            >
              <span>Detail</span>
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          ) : (
            <>
              {/* Dropdown 1: Tipe Stat */}
              <div className="relative" ref={statRef}>
                <button
                  onClick={() => setIsStatOpen(!isStatOpen)}
                  className={clsx(
                    "flex items-center gap-2 text-[1.3em] font-semibold text-shortblack px-4 py-2 rounded-xl transition-colors duration-300 border border-transparent",
                    isDark
                      ? "bg-subcard hover:bg-gray-dashboard/50"
                      : "bg-blues hover:bg-blue-100"
                  )}
                >
                  {statOptions.find((o) => o.key === stat)?.label}
                  <ChevronDown
                    className={clsx(
                      "w-4 h-4 transition-transform duration-300",
                      isStatOpen && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {isStatOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className={clsx(
                        "absolute top-full right-0 mt-2 p-1.5 w-max rounded-xl shadow-xl border z-[40]",
                        isDark
                          ? "bg-card border-gray-800"
                          : "bg-white border-gray-100"
                      )}
                    >
                      {statOptions.map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.key}
                            onClick={() => {
                              onChangeStat(opt.key);
                              setIsStatOpen(false);
                            }}
                            className={clsx(
                              "flex items-center gap-2 w-full text-left text-[1.3em] px-4 py-2.5 rounded-lg transition-all duration-300",
                              stat === opt.key
                                ? isDark
                                  ? "bg-gradient-to-r from-blue-background-gradient to-purple-background-gradient text-tx-blue-dashboard font-semibold"
                                  : "bg-bluelight/10 text-bluelight font-semibold"
                                : isDark
                                ? "text-grays hover:text-tx-blue-dashboard hover:bg-subcard"
                                : "text-shortblack hover:text-bluelight hover:bg-gray-50"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dropdown 2: Range Waktu */}
              {!hideRangeFilter && onChangeRange && (
                <div className="relative" ref={rangeRef}>
                  <button
                    onClick={() => setIsRangeOpen(!isRangeOpen)}
                    className={clsx(
                      "flex items-center gap-2 text-[1.3em] font-semibold text-shortblack px-4 py-2 rounded-xl transition-colors duration-300 border border-transparent",
                      isDark
                        ? "bg-subcard hover:bg-gray-dashboard/50"
                        : "bg-blues hover:bg-blue-100"
                    )}
                  >
                    {timeRanges.find((o) => o.key === range)?.label}
                    <ChevronDown
                      className={clsx(
                        "w-4 h-4 transition-transform duration-300",
                        isRangeOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {isRangeOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className={clsx(
                          "absolute top-full right-0 mt-2 p-1.5 w-max rounded-xl shadow-xl border z-20",
                          isDark
                            ? "bg-card border-gray-800"
                            : "bg-white border-gray-100"
                        )}
                      >
                        {timeRanges.map((r) => (
                          <button
                            key={r.key}
                            onClick={() => {
                              onChangeRange(r.key);
                              setIsRangeOpen(false);
                            }}
                            className={clsx(
                              "block w-full text-left text-[1.3em] px-4 py-2.5 rounded-lg transition-all duration-300",
                              range === r.key
                                ? isDark
                                  ? "bg-gradient-to-r from-blue-background-gradient to-purple-background-gradient text-tx-blue-dashboard font-semibold"
                                  : "bg-bluelight/10 text-bluelight font-semibold"
                                : isDark
                                ? "text-grays hover:text-tx-blue-dashboard hover:bg-subcard"
                                : "text-shortblack hover:text-bluelight hover:bg-gray-50"
                            )}
                          >
                            {r.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {!isLoading && !error && data && (
        <div className="flex items-center gap-6 mb-4 pb-4 border-b border-slate-100 dark:border-gray-dashboard">
          <div className="flex items-center gap-2">
            <span className="text-[1.1em] text-grays">Total:</span>
            <span className="text-[1.3em] font-bold text-shortblack">
              {stat === "totalEarnings"
                ? formatCurrency(totalValue)
                : totalValue.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[1.1em] text-grays">Average:</span>
            <span className="text-[1.3em] font-bold text-shortblack">
              {stat === "totalEarnings"
                ? formatCurrency(avgValue)
                : Math.round(avgValue).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Body (Chart) - Block scroll zoom, allow page scroll */}
      <div
        className="flex-1 min-h-[320px]"
        onWheelCapture={(e) => {
          // Prevent chart from receiving wheel event (disables scroll zoom)
          // Page will still scroll normally
          e.stopPropagation();
        }}
      >
        {isLoading ? (
          <div className="w-full h-[320px] flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-bluelight" />
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-redshortlink p-4">
            <OctagonAlert className="w-8 h-8 mb-2" />
            <p className="text-[1.4em] font-medium">{error}</p>
          </div>
        ) : (
          <Chart
            options={chartOptions}
            series={data?.series || []}
            type="area"
            height="100%"
            width="100%"
          />
        )}
      </div>

      {/* Chart interaction hint */}
      {!isLoading && !error && !path.includes("/dashboard") && (
        <p className="text-center text-[1em] text-gray-400 mt-3">
          💡 Drag to select area • Scroll to zoom • Use toolbar for more options
        </p>
      )}
    </div>
  );
}
