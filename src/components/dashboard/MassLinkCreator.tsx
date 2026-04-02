// src/components/dashboard/MassLinkCreator.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Link as LinkIcon,
  Loader2,
  ChevronDown,
  Trash2,
  CheckCircle2,
  XCircle,
  Megaphone,
  Clipboard,
  Check,
  Layers,
  Sparkles,
  Lock,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { AdLevel } from "@/types/type";
import { Link } from "@/i18n/routing";
import { useAdsInfo } from "@/hooks/useAdsInfo";
import { massCreateLinks, type MassCreateResult } from "@/services/linkService";
import clsx from "clsx";
import { useAlert } from "@/hooks/useAlert";
import { useQueryClient } from "@tanstack/react-query";
import { useLinkSettings } from "@/hooks/useLinkSettings";
import { useFeatureLocks } from "@/hooks/useFeatureLocks";
import { useTheme } from "next-themes";

interface MassLinkResult extends MassCreateResult {
  status: "pending" | "success" | "error";
}

export default function MassLinkCreator() {
  const t = useTranslations("Dashboard");
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  // Fetch ad levels from API
  const { levels: adLevelsFromApi, isLoading: isLoadingLevels } = useAdsInfo();

  // Fetch link settings for mass_link_limit
  const { settings: linkSettings } = useLinkSettings();
  const massLinkLimit = linkSettings.mass_link_limit ?? 20;
  const { isAdLevelUnlocked } = useFeatureLocks();
  const { theme } = useTheme();

  // Prevent hydration mismatch - wait for client-side
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isDark = mounted && theme === "dark";

  // State for URLs textarea
  const [urlsText, setUrlsText] = useState("");
  const [parsedUrls, setParsedUrls] = useState<string[]>([]);

  // State for global settings (only adsLevel for now, backend only supports that)
  const [adsLevel, setAdsLevel] = useState<AdLevel>("medium");

  // State for results
  const [results, setResults] = useState<MassLinkResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // UI State
  const [isAdsLevelOpen, setIsAdsLevelOpen] = useState(false);
  const adsLevelRef = useRef<HTMLDivElement>(null);

  // Map API data to dropdown options with lock status
  const adLevels = adLevelsFromApi.map((level, index) => ({
    key: level.slug as AdLevel,
    label: level.name,
    isLocked: !isAdLevelUnlocked(index + 1),
    requiredLevel: index === 2 ? "Elite" : index === 3 ? "Pro" : "",
  }));

  // Set default adsLevel when API loads
  useEffect(() => {
    if (adLevelsFromApi.length > 0 && adsLevel === "medium") {
      const defaultLevel =
        adLevelsFromApi.find((l) => l.is_default) || adLevelsFromApi[0];
      setAdsLevel(defaultLevel.slug as AdLevel);
    }
  }, [adLevelsFromApi]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        adsLevelRef.current &&
        !adsLevelRef.current.contains(event.target as Node)
      ) {
        setIsAdsLevelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Parse URLs from textarea
  useEffect(() => {
    const urls = urlsText
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => {
        if (!url) return false;
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });
    // Limit to mass_link_limit URLs (from backend settings)
    setParsedUrls(urls.slice(0, massLinkLimit));
  }, [urlsText, massLinkLimit]);

  const handleAdLevelChange = (level: AdLevel) => {
    setAdsLevel(level);
    setIsAdsLevelOpen(false);
  };

  // Process all URLs with batch API
  const handleMassCreate = async () => {
    if (parsedUrls.length === 0) return;

    setIsProcessing(true);

    // Initialize results with pending status
    const initialResults: MassLinkResult[] = parsedUrls.map((url) => ({
      original_url: url,
      status: "pending",
    }));
    setResults(initialResults);

    try {
      // Call batch API
      const apiResults = await massCreateLinks({
        urls: parsedUrls,
        adLevel: adsLevel,
      });

      // Map API results to display format
      const mappedResults: MassLinkResult[] = apiResults.map((result) => ({
        ...result,
        status: result.error ? "error" : "success",
      }));

      setResults(mappedResults);

      // Invalidate links query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["links"] });

      const successCount = mappedResults.filter(
        (r) => r.status === "success",
      ).length;
      const errorCount = mappedResults.filter(
        (r) => r.status === "error",
      ).length;

      if (errorCount === 0) {
        showAlert(
          t("massLinkCard.successAlert", { count: successCount }),
          "success",
        );
      } else {
        showAlert(
          t("massLinkCard.partialAlert", {
            success: successCount,
            error: errorCount,
          }),
          errorCount > successCount ? "error" : "warning",
        );
      }
    } catch (err: any) {
      showAlert(err.message || t("massLinkCard.errorAlert"), "error");
      // Set all as error
      setResults(
        parsedUrls.map((url) => ({
          original_url: url,
          status: "error",
          error: t("massLinkCard.errorOccurred"),
        })),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearAll = () => {
    setUrlsText("");
    setResults([]);
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <div className="space-y-6">
      {/* FORM CARD */}
      <div className="bg-card p-7 rounded-3xl shadow-sm shadow-slate-500/50 border border-gray-dashboard/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                isDark
                  ? "bg-gradient-to-br from-blue-background-gradient to-purple-background-gradient shadow-lightpurple-dashboard/30"
                  : "bg-gradient-to-br from-bluelight to-indigo-600 shadow-blue-200"
              }`}
            >
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[1.8em] font-bold text-shortblack tracking-tight">
                {t("massLinkCard.title")}
              </h3>
              <p className="text-[1.2em] text-grays mt-0.5">
                {t("massLinkCard.subtitle", { limit: massLinkLimit })}
              </p>
            </div>
          </div>
          {(urlsText || results.length > 0) && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 text-[1.2em] font-semibold text-red-500 hover:text-red-600 bg-red-500/10 px-4 py-2 rounded-xl transition-all border border-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
              {t("massLinkCard.clear")}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* URLs Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[1.4em] font-medium text-shortblack">
                {t("massLinkCard.urlsLabel")}
              </label>
              <span
                className={clsx(
                  "text-[1.2em]",
                  parsedUrls.length > massLinkLimit
                    ? "text-red-500"
                    : "text-grays",
                )}
              >
                {parsedUrls.length} / {massLinkLimit}{" "}
                {t("massLinkCard.urlsValid")}
              </span>
            </div>
            <textarea
              value={urlsText}
              onChange={(e) => setUrlsText(e.target.value)}
              placeholder={`https://example.com/page1\nhttps://example.com/page2\nhttps://example.com/page3`}
              className="w-full text-[1.4em] px-4 py-3 rounded-xl border border-gray-dashboard/30 focus:outline-none focus:ring-2 focus:ring-bluelight bg-subcard text-shortblack placeholder:text-grays min-h-[150px] resize-y font-mono"
              disabled={isProcessing}
            />
          </div>

          {/* Ads Level Selection */}
          <div className="items-center gap-4 flex">
            <span className="text-[1.4em] font-medium text-shortblack">
              {t("massLinkCard.adsLevel")}
            </span>
            <div className="relative flex-1 max-w-xs" ref={adsLevelRef}>
              <button
                type="button"
                onClick={() => setIsAdsLevelOpen(!isAdsLevelOpen)}
                disabled={isLoadingLevels || isProcessing}
                className="w-full text-[1.4em] px-4 py-3 rounded-xl border border-gray-dashboard/30 bg-subcard flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-bluelight disabled:opacity-50"
              >
                {isLoadingLevels ? (
                  <span className="text-grays flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("massLinkCard.loading")}
                  </span>
                ) : (
                  <span className="text-shortblack">
                    {adLevels.find((l) => l.key === adsLevel)?.label ||
                      t("massLinkCard.adsLevelFallback")}
                  </span>
                )}
                <ChevronDown
                  className={`w-5 h-5 text-grays transition-transform ${
                    isAdsLevelOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {isAdsLevelOpen && !isLoadingLevels && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 mt-2 p-2 w-full bg-card rounded-lg shadow-lg z-20 border border-gray-dashboard/30"
                  >
                    {adLevels.map((level) => (
                      <button
                        key={level.key}
                        type="button"
                        onClick={() =>
                          !level.isLocked && handleAdLevelChange(level.key)
                        }
                        disabled={level.isLocked}
                        className={`w-full text-left text-[1.3em] px-3 py-2 rounded-md flex items-center justify-between gap-2 ${
                          level.isLocked
                            ? "text-gray-400 cursor-not-allowed"
                            : adsLevel === level.key
                              ? "dark:bg-gradient-to-r dark:from-blue-background-gradient dark:to-purple-background-gradient text-tx-blue-dashboard font-semibold"
                              : "text-shortblack hover:bg-subcard"
                        }`}
                      >
                        <span>{level.label}</span>
                        {level.isLocked && (
                          <span className="flex items-center gap-1 text-[0.85em] text-gray-400">
                            <Lock className="w-3 h-3" />
                            <span>{level.requiredLevel}</span>
                          </span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link
              href={"/ads-info"}
              className="px-4 py-3 rounded-xl bg-subcard flex items-center justify-center hover:bg-blues transition-colors"
            >
              <Megaphone className="w-5 h-5 text-bluelight" />
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleMassCreate}
            disabled={isProcessing || parsedUrls.length === 0}
            className={`w-full text-white text-[1.5em] font-semibold py-4 rounded-2xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg ${
              isDark
                ? "bg-gradient-to-r from-blue-background-gradient to-purple-background-gradient shadow-lightpurple-dashboard/50"
                : "bg-gradient-to-r from-bluelight to-indigo-600 shadow-blue-200"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t("massLinkCard.processing")}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>
                  {t("massLinkCard.generateBtn", { count: parsedUrls.length })}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RESULTS CARD */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card p-7 rounded-3xl shadow-sm shadow-slate-500/50 border border-gray-dashboard/30"
          >
            {/* Stats Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[1.6em] font-semibold text-shortblack">
                {t("massLinkCard.resultsTitle")}
              </h4>
              <div className="flex items-center gap-4 text-[1.3em]">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  {successCount} {t("massLinkCard.success")}
                </span>
                {errorCount > 0 && (
                  <span className="flex items-center gap-1 text-red-500">
                    <XCircle className="w-4 h-4" />
                    {errorCount} {t("massLinkCard.failed")}
                  </span>
                )}
              </div>
            </div>

            {/* Results List */}
            <div
              onWheel={(e) => e.stopPropagation()}
              className="space-y-2 max-h-[400px] overflow-y-auto"
            >
              {results.map((result, index) => (
                <div
                  key={index}
                  className={clsx(
                    "p-3 rounded-lg border",
                    result.status === "success" &&
                      (isDark
                        ? "bg-green-900/20 border-green-700/30"
                        : "bg-green-50 border-green-200"),
                    result.status === "error" &&
                      (isDark
                        ? "bg-red-900/20 border-red-700/30"
                        : "bg-red-50 border-red-200"),
                    result.status === "pending" &&
                      (isDark
                        ? "bg-subcard border-gray-dashboard/30"
                        : "bg-gray-50 border-gray-200"),
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {result.status === "success" && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      )}
                      {result.status === "error" && (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                      )}
                      {result.status === "pending" && (
                        <Loader2 className="w-5 h-5 text-grays animate-spin shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[1.2em] text-grays truncate">
                          {result.original_url}
                        </p>
                        {result.short_url && (
                          <p className="text-[1.4em] font-semibold text-shortblack truncate">
                            {result.short_url}
                          </p>
                        )}
                      </div>
                    </div>
                    {result.short_url && (
                      <button
                        onClick={() => handleCopy(result.short_url!, index)}
                        className={`p-2 rounded-lg transition-colors shrink-0 ${
                          isDark
                            ? "hover:bg-green-900/30"
                            : "hover:bg-green-100"
                        }`}
                      >
                        {copiedIndex === index ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clipboard className="w-5 h-5 text-green-600" />
                        )}
                      </button>
                    )}
                    {result.error && (
                      <span className="text-[1.2em] text-red-500 shrink-0">
                        {result.error}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
