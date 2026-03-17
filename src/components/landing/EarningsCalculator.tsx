"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { Link } from "@/i18n/routing";
import authService from "@/services/authService";
import { useTranslations } from "next-intl";

export default function EarningsCalculator() {
  const t = useTranslations("Landing.Calculator");
  const [views, setViews] = useState(50000);
  const [cpm, setCpm] = useState(6);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardPath, setDashboardPath] = useState("/dashboard");

  useEffect(() => {
    setMounted(true);
    setIsAuthenticated(authService.isAuthenticated());
    if (authService.isAuthenticated()) {
      setDashboardPath(authService.getRedirectPath());
    }
  }, []);

  const dailyIncome = (views * cpm) / 1000;
  const weeklyIncome = dailyIncome * 7;
  const monthlyIncome = dailyIncome * 30;
  const yearlyPotential = dailyIncome * 365;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

  // Compact format for mobile (shows K/M for large numbers)
  const formatCompact = (val: number) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `$${(val / 1000).toFixed(1)}K`;
    }
    return `$${val.toFixed(0)}`;
  };

  const formatNumber = (val: number) =>
    new Intl.NumberFormat("en-US").format(val);

  // Calculate slider percentage for gradient fill
  const viewsPercent = ((views - 1000) / (100000 - 1000)) * 100;
  const cpmPercent = ((cpm - 1) / (8 - 1)) * 100;

  if (!mounted) {
    // SSR placeholder: render the heading so crawlers can see it
    return (
      <section className="py-20 md:py-28 bg-slate-50/50 font-poppins">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-14">
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-semibold tracking-tight mb-3 text-slate-800">
              {t("title")}{" "}
              <span className="text-bluelanding">{t("titleHighlight")}</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28 bg-slate-50/50 font-poppins">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-[2.75rem] font-semibold tracking-tight mb-3 text-slate-800"
          >
            {t("title")}{" "}
            <span className="text-bluelanding">{t("titleHighlight")}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-base md:text-lg font-light max-w-lg mx-auto"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* Calculator Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left - Sliders */}
            <div className="space-y-8">
              {/* Daily Views */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-slate-600">
                    {t("dailyViews")}
                  </label>
                  <span className="text-lg font-semibold text-slate-800">
                    {formatNumber(views)}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={views}
                    onChange={(e) => setViews(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-100"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${viewsPercent}%, #f1f5f9 ${viewsPercent}%, #f1f5f9 100%)`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  <span>1K</span>
                  <span>100K</span>
                </div>
              </div>

              {/* CPM */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-slate-600">
                    {t("averageCpm")}
                  </label>
                  <span className="text-lg font-semibold text-bluelanding">
                    ${cpm.toFixed(2)}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="0.5"
                    value={cpm}
                    onChange={(e) => setCpm(parseFloat(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-100"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${cpmPercent}%, #f1f5f9 ${cpmPercent}%, #f1f5f9 100%)`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  <span>$1</span>
                  <span>$8</span>
                </div>
              </div>

              {/* Info */}
              <p className="text-xs text-slate-500 leading-relaxed">
                {t("cpmNote")}
              </p>
            </div>

            {/* Right - Results */}
            <div className="bg-gradient-to-br from-bluelanding to-blue-600 rounded-xl p-6 text-white">
              {/* Monthly - Main */}
              <div className="text-center mb-6">
                <p className="text-blue-100 text-sm mb-1">
                  {t("monthlyEarnings")}
                </p>
                <p className="text-4xl md:text-5xl font-bold tracking-tight">
                  {formatCurrency(monthlyIncome)}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <TrendingUp className="w-4 h-4 mx-auto mb-1 text-blue-200" />
                  <p className="text-base md:text-lg font-semibold">
                    {formatCompact(dailyIncome)}
                  </p>
                  <p className="text-[10px] text-blue-200">{t("daily")}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <Calendar className="w-4 h-4 mx-auto mb-1 text-blue-200" />
                  <p className="text-base md:text-lg font-semibold">
                    {formatCompact(weeklyIncome)}
                  </p>
                  <p className="text-[10px] text-blue-200">{t("weekly")}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <DollarSign className="w-4 h-4 mx-auto mb-1 text-blue-200" />
                  <p className="text-base md:text-lg font-semibold">
                    {formatCompact(yearlyPotential)}
                  </p>
                  <p className="text-[10px] text-blue-200">{t("yearly")}</p>
                </div>
              </div>

              {/* CTA */}
              <Link
                href={isAuthenticated ? dashboardPath : "/register"}
                className="flex items-center justify-center gap-2 w-full bg-white text-bluelanding font-semibold py-3 rounded-lg hover:bg-blue-50 transition-colors group"
              >
                <span>
                  {isAuthenticated ? t("goToDashboard") : t("startEarning")}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
