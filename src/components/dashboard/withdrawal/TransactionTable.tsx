// src/components/dashboard/withdrawal/TransactionTable.tsx
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  XCircle,
  ChevronDown,
  Calendar,
  Wallet,
  ExternalLink,
  Filter,
} from "lucide-react";
import clsx from "clsx";
import { useTheme } from "next-themes";
import type { Transaction } from "@/types/type";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getExchangeRates } from "@/utils/currency";
import { motion, AnimatePresence } from "motion/react";
import Pagination from "../Pagination";
import { useTranslations } from "next-intl";

interface TransactionTableProps {
  transactions: Transaction[];
  onCancel: (id: string) => void;
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
  search: string;
  setSearch: (s: string) => void;
  sortOrder: "newest" | "oldest";
  setSortOrder: (s: "newest" | "oldest") => void;
  methodFilter: string;
  setMethodFilter: (m: string) => void;
  availableMethods?: string[]; // List of payment methods for filter
  isLoading?: boolean;
}

export default function TransactionTable({
  transactions,
  onCancel,
  page,
  setPage,
  totalPages,
  search,
  setSearch,
  sortOrder,
  setSortOrder,
  methodFilter,
  setMethodFilter,
  availableMethods = [],
  isLoading,
}: TransactionTableProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { format: formatCurrency } = useCurrency();
  const t = useTranslations("Dashboard");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Dropdown states (for UI only)
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMethodOpen, setIsMethodOpen] = useState(false);

  // Refs for click outside detection
  const sortRef = useRef<HTMLDivElement>(null);
  const methodRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (
        methodRef.current &&
        !methodRef.current.contains(event.target as Node)
      ) {
        setIsMethodOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
        return isDark
          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          : "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "pending":
        return isDark
          ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
          : "bg-amber-50 text-amber-600 border-amber-200";
      case "rejected":
        return isDark
          ? "bg-red-500/20 text-red-400 border-red-500/30"
          : "bg-red-50 text-red-600 border-red-200";
      case "cancelled":
        return isDark
          ? "bg-slate-500/20 text-slate-400 border-slate-500/30"
          : "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return isDark
          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
          : "bg-blue-50 text-blue-600 border-blue-200";
    }
  };

  // Use availableMethods for dropdown, or extract from current transactions as fallback
  const paymentMethods = useMemo(() => {
    if (availableMethods.length > 0) {
      return ["all", ...availableMethods];
    }
    // Fallback: extract from visible transactions
    const methods = new Set(transactions.map((tx) => tx.method));
    return ["all", ...Array.from(methods)];
  }, [availableMethods, transactions]);

  const getTotalAmount = (tx: Transaction) => {
    return (
      (parseFloat(String(tx.amount)) || 0) + (parseFloat(String(tx.fee)) || 0)
    );
  };

  // Convert USD amount to transaction's currency for display
  const getDisplayAmount = (usdAmount: number, txCurrency?: string) => {
    if (!txCurrency) return usdAmount;
    const rates = getExchangeRates();
    const rate = rates[txCurrency as keyof typeof rates] || 1;
    return usdAmount * rate;
  };

  // Format amount based on currency - use saved local amount if available
  const formatAmountForCurrency = (
    usdAmount: number,
    currency: string,
    savedLocalAmount?: number,
  ) => {
    // If we have a saved local amount (from database), use it directly
    // This ensures user sees the exact amount they requested
    const displayAmount =
      savedLocalAmount !== undefined
        ? savedLocalAmount
        : getDisplayAmount(usdAmount, currency);

    if (currency === "IDR") {
      return `Rp ${Math.round(displayAmount).toLocaleString("id-ID")}`;
    } else if (currency === "USD") {
      return `$${displayAmount.toFixed(5)}`;
    }
    return `${currency} ${displayAmount.toFixed(5)}`;
  };

  return (
    <div
      className={clsx(
        "rounded-3xl shadow-sm border mt-8 font-figtree",
        isDark
          ? "bg-card border-gray-dashboard/30"
          : "bg-white border-gray-100",
      )}
    >
      {/* Header with Filters */}
      <div
        className={clsx(
          "p-6 md:p-8 border-b",
          isDark ? "border-gray-dashboard/30" : "border-gray-100",
        )}
      >
        <div className="flex flex-col gap-6">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <h3
              className={clsx(
                "text-[1.8em] font-bold",
                isDark ? "text-white" : "text-shortblack",
              )}
            >
              {t("withdrawalPage.transactionHistory")}
            </h3>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grays" />
              <input
                type="text"
                placeholder={t("withdrawalPage.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={clsx(
                  "w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-bluelight text-[1.4em] transition-all",
                  isDark
                    ? "bg-subcard border-gray-dashboard/50 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-200 text-shortblack",
                )}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsMethodOpen(false);
                }}
                className={clsx(
                  "flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors text-[1.4em] w-full sm:w-auto justify-between",
                  isDark
                    ? "border-gray-dashboard/50 bg-subcard hover:bg-gray-dashboard/50"
                    : "border-gray-200 bg-white hover:bg-slate-50",
                )}
              >
                <div className="flex items-center gap-4">
                  <Calendar className="w-4 h-4 text-grays" />
                  <span
                    className={clsx(
                      "font-medium",
                      isDark ? "text-white" : "text-shortblack",
                    )}
                  >
                    {sortOrder === "newest"
                      ? t("withdrawalPage.newest")
                      : t("withdrawalPage.oldest")}
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
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={clsx(
                      "absolute top-full left-0 mt-2 w-full rounded-xl border shadow-lg z-20 overflow-hidden",
                      isDark
                        ? "bg-card border-gray-dashboard/50"
                        : "bg-white border-gray-200",
                    )}
                  >
                    <button
                      onClick={() => {
                        setSortOrder("newest");
                        setIsSortOpen(false);
                      }}
                      className={clsx(
                        "w-full px-4 py-3 text-left text-[1.3em] transition-colors",
                        sortOrder === "newest"
                          ? isDark
                            ? "bg-blue-500/10 text-bluelight font-medium"
                            : "bg-blues text-bluelight font-medium"
                          : isDark
                            ? "text-white hover:bg-gray-dashboard/50"
                            : "text-shortblack hover:bg-blues",
                      )}
                    >
                      {t("withdrawalPage.newest")}
                    </button>
                    <button
                      onClick={() => {
                        setSortOrder("oldest");
                        setIsSortOpen(false);
                      }}
                      className={clsx(
                        "w-full px-4 py-3 text-left text-[1.3em] transition-colors",
                        sortOrder === "oldest"
                          ? isDark
                            ? "bg-blue-500/10 text-bluelight font-medium"
                            : "bg-blues text-bluelight font-medium"
                          : isDark
                            ? "text-white hover:bg-gray-dashboard/50"
                            : "text-shortblack hover:bg-blues",
                      )}
                    >
                      {t("withdrawalPage.oldest")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Method Filter Dropdown */}
            <div className="relative" ref={methodRef}>
              <button
                onClick={() => {
                  setIsMethodOpen(!isMethodOpen);
                  setIsSortOpen(false);
                }}
                className={clsx(
                  "flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors text-[1.4em] w-full sm:w-auto justify-between",
                  isDark
                    ? "border-gray-dashboard/50 bg-subcard hover:bg-gray-dashboard/50"
                    : "border-gray-200 bg-white hover:bg-slate-50",
                )}
              >
                <div className="flex items-center gap-4">
                  <Filter className="w-4 h-4 text-grays" />
                  <span
                    className={clsx(
                      "font-medium truncate max-w-[80px]",
                      isDark ? "text-white" : "text-shortblack",
                    )}
                  >
                    {methodFilter === "all"
                      ? t("withdrawalPage.allFilter")
                      : methodFilter}
                  </span>
                </div>
                <ChevronDown
                  className={clsx(
                    "w-4 h-4 text-grays transition-transform",
                    isMethodOpen && "rotate-180",
                  )}
                />
              </button>
              <AnimatePresence>
                {isMethodOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onWheel={(e) => e.stopPropagation()}
                    className={clsx(
                      "absolute top-full right-0 mt-2 sm:w-48 w-full rounded-xl border shadow-lg z-20 overflow-hidden max-h-60 overflow-y-auto",
                      isDark
                        ? "bg-card border-gray-dashboard/50"
                        : "bg-white border-gray-200",
                    )}
                  >
                    {paymentMethods.map((method) => (
                      <button
                        key={method}
                        onClick={() => {
                          setMethodFilter(method);
                          setIsMethodOpen(false);
                        }}
                        className={clsx(
                          "w-full px-4 py-3 text-left text-[1.3em] transition-colors",
                          methodFilter === method
                            ? isDark
                              ? "bg-blue-500/10 text-bluelight font-medium"
                              : "bg-blues text-bluelight font-medium"
                            : isDark
                              ? "text-white hover:bg-gray-dashboard/50"
                              : "text-shortblack hover:bg-blues",
                        )}
                      >
                        {method === "all"
                          ? t("withdrawalPage.allMethods")
                          : method}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div
        className={clsx(
          "divide-y",
          isDark ? "divide-gray-dashboard/30" : "divide-gray-100",
        )}
      >
        {isLoading ? (
          <div className="p-12 text-center text-grays text-[1.4em]">
            {t("withdrawalPage.loadingData")}
          </div>
        ) : transactions.length > 0 ? (
          transactions.map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={clsx(
                "p-5 md:p-6 transition-colors",
                isDark ? "hover:bg-gray-dashboard/30" : "hover:bg-slate-50/50",
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Left: Date, ID, Method */}
                <div className="flex-1 min-w-0">
                  {/* Top Row: Date & Status */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[1.3em] text-grays">
                      {formatDate(tx.date)}
                    </span>
                    <span
                      className={clsx(
                        "px-3 py-1 rounded-full text-[1.1em] font-semibold border capitalize",
                        getStatusStyle(tx.status),
                      )}
                    >
                      {tx.status}
                    </span>
                  </div>

                  {/* Transaction ID */}
                  <div className="text-[1.2em] font-mono text-grays mb-3">
                    {tx.txId || `#${tx.id}`}
                  </div>

                  {/* Method Info */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Wallet className="w-4 h-4 text-bluelight" />
                    <span
                      className={clsx(
                        "text-[1.4em] font-semibold",
                        isDark ? "text-white" : "text-shortblack",
                      )}
                    >
                      {tx.method}
                    </span>
                    <span className="text-[1.3em] text-grays">·</span>
                    {tx.accountName && (
                      <>
                        <span
                          className={clsx(
                            "text-[1.3em] font-medium",
                            isDark ? "text-gray-300" : "text-shortblack",
                          )}
                        >
                          {tx.accountName}
                        </span>
                        <span className="text-[1.3em] text-grays">·</span>
                      </>
                    )}
                    <span className="text-[1.3em] text-grays font-mono">
                      {tx.account}
                    </span>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Amount */}
                  <div className="text-right flex sm:flex-col flex-row sm:items-end items-center gap-2">
                    <div
                      className={clsx(
                        "text-[1.6em] font-bold flex items-center gap-2 justify-end",
                        isDark ? "text-white" : "text-shortblack",
                      )}
                    >
                      {tx.currency ? (
                        <>
                          <span
                            className={clsx(
                              "text-[0.7em] px-2 py-0.5 rounded-md font-medium",
                              isDark
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-purple-100 text-purple-600",
                            )}
                          >
                            {tx.currency}
                          </span>
                          {/* Use saved localAmount + fee converted at saved exchange rate */}
                          {formatAmountForCurrency(
                            getTotalAmount(tx),
                            tx.currency,
                            tx.localAmount !== undefined &&
                              tx.exchangeRate !== undefined
                              ? tx.localAmount +
                                  (parseFloat(String(tx.fee)) || 0) *
                                    tx.exchangeRate
                              : undefined,
                          )}
                        </>
                      ) : (
                        formatCurrency(getTotalAmount(tx))
                      )}
                    </div>
                    <div className="text-[1.2em] text-grays">
                      {t("withdrawalPage.fee")}{" "}
                      {tx.currency
                        ? formatAmountForCurrency(
                            parseFloat(String(tx.fee)) || 0,
                            tx.currency,
                            tx.exchangeRate !== undefined
                              ? (parseFloat(String(tx.fee)) || 0) *
                                  tx.exchangeRate
                              : undefined,
                          )
                        : formatCurrency(parseFloat(String(tx.fee)) || 0)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {tx.status === "pending" && (
                      <button
                        onClick={() => onCancel(tx.id)}
                        className={clsx(
                          "p-2.5 rounded-xl transition-colors",
                          isDark
                            ? "text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            : "text-red-400 hover:text-red-600 hover:bg-red-50",
                        )}
                        title={t("withdrawalPage.cancel")}
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                    {/* {tx.txId && (
                      <button
                        className="p-2.5 text-bluelight hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Lihat Detail"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    )} */}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-dashboard/30 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-grays text-[1.4em]">
              {search || methodFilter !== "all"
                ? t("withdrawalPage.noMatchingTx")
                : t("withdrawalPage.noTxHistory")}
            </p>
            <p className="text-gray-400 text-[1.3em] mt-1">
              {search || methodFilter !== "all"
                ? t("withdrawalPage.noMatchingTxSubtitle")
                : t("withdrawalPage.noTxHistorySubtitle")}
            </p>
          </div>
        )}
      </div>

      {/* Footer Pagination */}
      {totalPages > 1 && (
        <div
          className={clsx(
            "p-6 border-t",
            isDark ? "border-gray-dashboard/30" : "border-gray-100",
          )}
        >
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
