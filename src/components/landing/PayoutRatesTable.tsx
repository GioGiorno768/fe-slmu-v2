"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Search, Globe, TrendingUp, Sparkles } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface Rate {
  country: string;
  cpm: number;
  isoCode: string;
}

interface PayoutRatesTableProps {
  rates: Rate[];
}

export default function PayoutRatesTable({ rates }: PayoutRatesTableProps) {
  const t = useTranslations("Landing.PayoutRates.table");
  const [search, setSearch] = useState("");
  const [selectedTier, setSelectedTier] = useState<
    "all" | "tier1" | "tier2" | "tier3"
  >("all");

  // Tier classification
  const getTier = (cpm: number) => {
    if (cpm >= 7) return "tier1";
    if (cpm >= 4) return "tier2";
    return "tier3";
  };

  const filteredRates = rates.filter((rate) => {
    const matchesSearch = rate.country
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesTier =
      selectedTier === "all" || getTier(rate.cpm) === selectedTier;
    return matchesSearch && matchesTier;
  });

  // Stats
  const topRate = Math.max(...rates.map((r) => r.cpm));
  const avgRate = rates.reduce((sum, r) => sum + r.cpm, 0) / rates.length;

  const tierFilters = [
    { key: "all", label: t("all") },
    { key: "tier1", label: t("tier1") },
    { key: "tier2", label: t("tier2") },
    { key: "tier3", label: t("tier3") },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-2">
            <TrendingUp className="w-4 h-4" />
            {t("highestCPM")}
          </div>
          <p className="text-2xl md:text-3xl font-medium text-slate-800">
            ${topRate.toFixed(2)}
          </p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-bluelanding text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4" />
            {t("averageCPM")}
          </div>
          <p className="text-2xl md:text-3xl font-medium text-slate-800">
            ${avgRate.toFixed(2)}
          </p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-purple-600 text-sm font-medium mb-2">
            <Globe className="w-4 h-4" />
            {t("countries")}
          </div>
          <p className="text-2xl md:text-3xl font-medium text-slate-800">
            {rates.length}+
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col md:flex-row gap-4 mb-6"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3.5 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-bluelanding/30 focus:border-bluelanding transition-all text-slate-800"
            placeholder={t("searchPlaceholder")}
          />
        </div>

        {/* Tier Filter */}
        <div className="flex gap-2">
          {tierFilters.map((tier) => (
            <button
              key={tier.key}
              onClick={() => setSelectedTier(tier.key as any)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                selectedTier === tier.key
                  ? "bg-bluelanding text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Rates Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredRates.length > 0 ? (
          filteredRates.map((rate, index) => {
            return (
              <motion.div
                key={rate.country}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * Math.min(index, 8) }}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {rate.isoCode === "all" ? (
                      <div className="w-10 h-7 bg-slate-100 rounded-md flex items-center justify-center">
                        <Globe className="w-5 h-5 text-slate-400" />
                      </div>
                    ) : (
                      <Image
                        src={`https://flagcdn.com/${rate.isoCode}.svg`}
                        alt={`${rate.country} flag`}
                        width={40}
                        height={28}
                        className="rounded-md shadow-sm"
                      />
                    )}
                    <div>
                      <p className="font-medium text-slate-800">
                        {rate.country}
                      </p>
                      <p className="text-xs text-slate-400">
                        {t("per1kViews")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{t("upTo")}</p>
                    <p className="text-lg font-medium text-slate-800">
                      ${rate.cpm.toFixed(2)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center">
            <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">{t("noCountriesFound")}</p>
          </div>
        )}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-sm text-slate-400 mt-8"
      >
        {t("ratesDisclaimer")}
      </motion.p>
    </div>
  );
}
