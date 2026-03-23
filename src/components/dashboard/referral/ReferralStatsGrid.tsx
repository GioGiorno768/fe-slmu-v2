"use client";

import { motion } from "motion/react";
import {
  DollarSign,
  Users,
  Activity,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import type { ReferralStats } from "@/types/type";
import { useCurrency } from "@/contexts/CurrencyContext";
import clsx from "clsx";
import { useTranslations } from "next-intl";

interface ReferralStatsGridProps {
  stats: ReferralStats | null;
}

export default function ReferralStatsGrid({ stats }: ReferralStatsGridProps) {
  const { format: formatCurrency } = useCurrency();
  const t = useTranslations("Dashboard");

  const maxReferrals = stats?.maxReferrals ?? 10;
  const isUnlimited = maxReferrals === -1;
  const isLimitReached = isUnlimited ? false : (stats?.isLimitReached ?? false);

  const statsData = [
    {
      icon: DollarSign,
      label: t("referralPage.referralEarnings"),
      value: formatCurrency(stats?.totalEarnings || 0),
      subLabel: t("referralPage.totalCommission"),
      gradient: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-500/20",
      shadowColor: "shadow-emerald-200 dark:shadow-emerald-900/30",
      textColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-100 dark:border-emerald-500/30",
    },
    {
      icon: Users,
      label: t("referralPage.totalInvited"),
      value: `${stats?.totalReferred || 0} / ${isUnlimited ? '∞' : maxReferrals}`,
      subLabel: isLimitReached
        ? t("referralPage.limitReached")
        : t("referralPage.registeredUsers"),
      gradient: isLimitReached
        ? "from-amber-500 to-orange-600"
        : "from-blue-500 to-indigo-600",
      bgLight: isLimitReached ? "bg-amber-500/20" : "bg-blue-500/20",
      shadowColor: isLimitReached
        ? "shadow-amber-200 dark:shadow-amber-900/30"
        : "shadow-blue-200 dark:shadow-blue-900/30",
      textColor: isLimitReached
        ? "text-amber-600 dark:text-amber-400"
        : "text-blue-600 dark:text-blue-400",
      borderColor: isLimitReached
        ? "border-amber-200 dark:border-amber-500/30"
        : "border-blue-100 dark:border-blue-500/30",
      showWarning: isLimitReached,
    },
    {
      icon: Activity,
      label: t("referralPage.activeUsers"),
      value: `${stats?.activeReferred || 0}`,
      subLabel: t("referralPage.generatingCommission"),
      gradient: "from-orange-500 to-amber-600",
      bgLight: "bg-orange-500/20",
      shadowColor: "shadow-orange-200 dark:shadow-orange-900/30",
      textColor: "text-orange-600 dark:text-orange-400",
      borderColor: "border-orange-100 dark:border-orange-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-figtree">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            className={clsx(
              "relative bg-card p-6 rounded-3xl shadow-sm border overflow-hidden",
              "hover:shadow-lg hover:-translate-y-1 transition-all duration-200",
              stat.borderColor,
            )}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 opacity-10">
              <div
                className={clsx(
                  "w-full h-full rounded-full bg-gradient-to-br",
                  stat.gradient,
                )}
              />
            </div>

            {/* Limit warning badge */}
            {"showWarning" in stat && stat.showWarning && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-[1em] font-medium text-amber-700 dark:text-amber-300">
                  {t("referralPage.upgradeRank")}
                </span>
              </div>
            )}

            <div className="relative flex items-center gap-5">
              {/* Icon */}
              <div
                className={clsx(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br",
                  stat.gradient,
                  stat.shadowColor,
                )}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className="lg:text-[1.2em] text-[1.4em] text-grays mb-1">{stat.label}</p>
                <h3 className="text-[2.4em] font-bold text-shortblack font-manrope leading-none">
                  {stat.value}
                </h3>
                <p className={clsx("lg:text-[1.1em] text-[1.3em] mt-1", stat.textColor)}>
                  {stat.subLabel}
                </p>
              </div>

              {/* Trend indicator */}
              <div className={clsx("p-2 rounded-xl", stat.bgLight)}>
                <TrendingUp className={clsx("w-5 h-5", stat.textColor)} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
