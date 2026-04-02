// src/app/[locale]/(member)/withdrawal/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Loader2, Info } from "lucide-react";
import { useWithdrawal } from "@/hooks/useWithdrawal";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { useTranslations } from "next-intl";

// Components
import WithdrawalStatsCard from "@/components/dashboard/withdrawal/WithdrawalStatsCard";
import WithdrawalMethodCard from "@/components/dashboard/withdrawal/WithdrawalMethodCard";
import TransactionTable from "@/components/dashboard/withdrawal/TransactionTable";
import WithdrawalRequestModal from "@/components/dashboard/withdrawal/WithdrawalRequestModal";
import ConfirmationModal from "@/components/dashboard/ConfirmationModal";
import type { PaymentMethod } from "@/types/type";

export default function WithdrawalPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("Dashboard");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Panggil Logic dari Hook
  const {
    stats,
    method,
    allMethods,
    settings,
    transactions,
    totalPages,
    page,
    setPage,
    search,
    setSearch,
    sortOrder,
    setSortOrder,
    methodFilter,
    setMethodFilter,
    isLoading,
    isTableLoading,
    isProcessing,
    requestPayout,
    cancelTransaction,
  } = useWithdrawal();

  // Extract available payment methods for filter dropdown
  const availableMethods = useMemo(() => {
    return allMethods.map((m) => m.provider);
  }, [allMethods]);

  // UI State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [cancelModalData, setCancelModalData] = useState<{
    isOpen: boolean;
    txId: string;
  }>({
    isOpen: false,
    txId: "",
  });

  // Handlers
  const openCancelModal = (id: string) => {
    setCancelModalData({ isOpen: true, txId: id });
  };

  const onConfirmCancel = async () => {
    const success = await cancelTransaction(cancelModalData.txId);
    if (success) {
      setCancelModalData({ isOpen: false, txId: "" });
    }
  };

  const onConfirmRequest = async (
    amount: number,
    usedMethod: PaymentMethod,
  ) => {
    await requestPayout(amount, usedMethod);
  };

  // Only show full-page loading on initial load (no data yet)
  // Filter/pagination changes will show loading only in TransactionTable
  if (isLoading && !stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-bluelight" />
      </div>
    );
  }

  return (
    <div className="lg:text-[10px] text-[8px] font-figtree space-y-8 pb-10">
      {/* Info Card */}
      <div
        className={clsx(
          "rounded-2xl p-6 flex items-start gap-4 shadow-sm",
          isDark
            ? "bg-blue-500/10 border border-blue-500/20 text-blue-300"
            : "bg-blue-50 border border-blue-100 text-blue-800",
        )}
      >
        <div
          className={clsx(
            "p-2 rounded-full shrink-0",
            isDark ? "bg-blue-500/20" : "bg-blue-100",
          )}
        >
          <Info
            className={clsx(
              "w-6 h-6",
              isDark ? "text-blue-400" : "text-bluelight",
            )}
          />
        </div>
        <div className="lg:text-[1.4em] text-[1.6em] leading-relaxed">
          <p>
            <span className="font-bold">{t("withdrawalPage.infoTitle")}</span>{" "}
            {t.rich("withdrawalPage.infoDesc", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
          <p
            className={clsx(
              "mt-2 text-[0.95em]",
              isDark ? "text-blue-400/80" : "text-blue-700/80",
            )}
          >
            {t("withdrawalPage.infoNote")}
          </p>
        </div>
      </div>

      {/* Stats & Method Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <WithdrawalStatsCard
            stats={stats}
            onOpenModal={() => setIsRequestModalOpen(true)}
            minWithdrawal={settings?.minWithdrawal ?? 2}
          />
        </div>
        <div className="lg:col-span-2">
          <WithdrawalMethodCard method={method} />
        </div>
      </div>

      {/* Transaction History (Server-side filtered) */}
      <TransactionTable
        transactions={transactions}
        totalPages={totalPages}
        page={page}
        setPage={setPage}
        search={search}
        setSearch={setSearch}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        methodFilter={methodFilter}
        setMethodFilter={setMethodFilter}
        availableMethods={availableMethods}
        onCancel={openCancelModal}
        isLoading={isTableLoading}
      />

      {/* Modal: Request Payout */}
      <WithdrawalRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        defaultMethod={method}
        allMethods={allMethods}
        availableBalance={stats?.availableBalance || 0}
        withdrawalSettings={settings}
        onSuccess={onConfirmRequest}
      />

      {/* Modal: Cancel Confirmation */}
      <ConfirmationModal
        isOpen={cancelModalData.isOpen}
        onClose={() =>
          setCancelModalData({ ...cancelModalData, isOpen: false })
        }
        onConfirm={onConfirmCancel}
        title={t("withdrawalPage.cancelTitle")}
        description={t("withdrawalPage.cancelDesc")}
        confirmLabel={t("withdrawalPage.yesCancel")}
        type="warning"
        isLoading={isProcessing}
      />
    </div>
  );
}
