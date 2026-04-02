// src/components/dashboard/withdrawal/WithdrawalStatsCard.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Wallet,
  Clock,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Wallet2,
} from "lucide-react";
import { useTheme } from "next-themes";
import clsx from "clsx";
import type { WithdrawalStats } from "@/types/type";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslations } from "next-intl";

interface WithdrawalStatsCardProps {
  stats: WithdrawalStats | null;
  onOpenModal: () => void;
  minWithdrawal?: number; // USD - from withdrawal settings
}

export default function WithdrawalStatsCard({
  stats,
  onOpenModal,
  minWithdrawal = 2, // Default $2 if not passed
}: WithdrawalStatsCardProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("Dashboard");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // 💱 Use global currency context
  const { format: formatCurrency, symbol, currency } = useCurrency();

  // 🔄 Round minimum withdrawal up to a clean number per currency
  const roundMinimumUp = (amountUSD: number): number => {
    // First convert USD to local currency using formatCurrency internals
    // formatCurrency already handles conversion, so we need to get the converted value
    // For simplicity, we'll import the conversion function
    const { convertFromUSD } = require("@/utils/currency");
    const convertedAmount = convertFromUSD(amountUSD, currency);

    switch (currency) {
      case "IDR":
        // Round up to nearest 1000 (e.g., 16695 → 17000)
        return Math.ceil(convertedAmount / 1000) * 1000;
      case "MYR":
      case "SGD":
        // Round up to nearest 1 (e.g., 8.15 → 9)
        return Math.ceil(convertedAmount);
      case "EUR":
      case "GBP":
        // Round up to nearest 0.5 (e.g., 1.84 → 2)
        return Math.ceil(convertedAmount * 2) / 2;
      default:
        // USD: Keep as is
        return convertedAmount;
    }
  };

  // Get the rounded minimum in local currency
  const displayMinWithdrawal = roundMinimumUp(minWithdrawal);

  // Format with symbol based on currency
  const formatLocalAmount = (amount: number): string => {
    if (currency === "IDR") {
      return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
    }
    return `${symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "rounded-3xl shadow-sm h-full flex flex-col relative overflow-hidden font-figtree",
        isDark
          ? "bg-card border border-gray-dashboard/30 shadow-black/20"
          : "bg-white border border-gray-100 shadow-slate-500/20",
      )}
    >
      {/* Header Section (Judul & Tombol) */}
      <div className="p-8 pb-4 flex justify-between items-start z-10">
        <div className="flex items-center gap-4">
          <Wallet className="w-8.5 h-8.5 text-bluelight" />
          <div className="space-y-0">
            <h2
              className={clsx(
                "text-[1.8em] font-bold flex items-center gap-2",
                isDark ? "text-white" : "text-shortblack",
              )}
            >
              {t("withdrawalPage.financeOverview")}
            </h2>
            <p className="text-[1.3em] text-grays mt-1">
              {t("withdrawalPage.financeDesc")}
            </p>
          </div>
        </div>

        {/* Tombol Request Payout ditaruh di atas biar gampang dijangkau */}
        <button
          onClick={onOpenModal}
          className={clsx(
            "hidden bg-bluelight text-white px-6 py-3 rounded-xl font-bold text-[1.4em]",
            "hover:bg-opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300",
            "md:flex items-center gap-2 shadow-md",
            isDark ? "shadow-blue-900/30" : "shadow-blue-200",
          )}
        >
          <span>{t("withdrawalPage.requestPayout")}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Balance Section ( Tengah - Flex Grow biar ngisi ruang kosong ) */}
      <div className="px-8  flex-1 flex flex-col justify-center z-10">
        <div
          className={clsx(
            "rounded-2xl gap-8 flex flex-col md:flex-row justify-between items-center p-6 shadow-sm relative overflow-hidden",
            isDark
              ? "bg-subcard shadow-black/30"
              : "bg-white shadow-slate-400/50",
          )}
        >
          {/* Dekorasi blob kecil */}
          <div
            className={clsx(
              "w-24 h-24 md:order-2 rounded-full flex items-center mr-4 justify-center shadow-inner",
              isDark
                ? "bg-blue-500/10 border border-blue-500/20"
                : "bg-blue-50 border border-blue-100",
            )}
          >
            <div
              className={clsx(
                "w-16 h-16 rounded-full flex items-center justify-center text-bluelight",
                isDark ? "bg-blue-500/20" : "bg-blue-100",
              )}
            >
              <Wallet2 className="w-8 h-8" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-[1.4em] font-medium text-grays mb-1 flex items-center gap-2">
              {t("withdrawalPage.availableBalance")}
              <span
                className={clsx(
                  "text-[0.8em] px-2 py-0.5 rounded-md font-bold flex items-center gap-1",
                  isDark
                    ? "bg-green-500/20 text-green-400"
                    : "bg-green-100 text-green-700",
                )}
              >
                <TrendingUp className="w-3 h-3" /> {t("withdrawalPage.ready")}
              </span>
            </p>
            <h1 className="text-[4.5em] font-bold text-bluelight tracking-tight leading-none my-2">
              {formatCurrency(stats?.availableBalance || 0)}
            </h1>
            <p className="text-[1.3em] text-grays opacity-80">
              {t("withdrawalPage.minPayoutThreshold")}{" "}
              <span
                className={clsx(
                  "font-semibold",
                  isDark ? "text-white" : "text-shortblack",
                )}
              >
                {formatLocalAmount(displayMinWithdrawal)}
              </span>
            </p>
          </div>
          {/* Tombol Request Payout ditaruh di atas biar gampang dijangkau */}
          <button
            onClick={onOpenModal}
            className={clsx(
              "md:hidden lg:hidden bg-bluelight text-white px-6 py-3 rounded-xl font-bold text-[1.4em]",
              "hover:bg-opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300",
              "flex items-center gap-2 shadow-md",
              isDark ? "shadow-blue-900/30" : "shadow-blue-200",
            )}
          >
            <span>{t("withdrawalPage.requestPayout")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer Stats Grid (Bawah) */}
      <div className="mt-auto p-8 z-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Pending */}
          <div className="flex items-center gap-4">
            <div
              className={clsx(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                isDark
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/20"
                  : "bg-orange-50 text-orange-500 border border-orange-100",
              )}
            >
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[1.2em] text-grays uppercase font-semibold tracking-wider mb-0.5">
                {t("withdrawalPage.pending")}
              </p>
              <p
                className={clsx(
                  "text-[1.8em] font-bold leading-none",
                  isDark ? "text-white" : "text-shortblack",
                )}
              >
                {formatCurrency(stats?.pendingWithdrawn || 0)}
              </p>
            </div>
          </div>
          <div
            className={clsx(
              "w-[0.15em] rounded-full",
              isDark ? "bg-blue-500/20" : "bg-blue-100",
            )}
          ></div>
          {/* Total Withdrawn */}
          <div className="flex items-center gap-4 pr-10">
            <div
              className={clsx(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                isDark
                  ? "bg-green-500/20 text-green-400 border border-green-500/20"
                  : "bg-green-50 text-green-600 border border-green-100",
              )}
            >
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[1.2em] text-grays uppercase font-semibold tracking-wider mb-0.5">
                {t("withdrawalPage.withdrawn")}
              </p>
              <p
                className={clsx(
                  "text-[1.8em] font-bold leading-none",
                  isDark ? "text-white" : "text-shortblack",
                )}
              >
                {formatCurrency(stats?.totalWithdrawn || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
