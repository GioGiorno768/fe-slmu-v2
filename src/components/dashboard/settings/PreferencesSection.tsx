// src/components/dashboard/settings/PreferencesSection.tsx
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe,
  Clock,
  Save,
  Loader2,
  ChevronDown,
  ShieldAlert,
  Cookie,
  KeyRound,
  Check,
} from "lucide-react";
import { useAlert } from "@/hooks/useAlert";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";
import Image from "next/image";
import { useTheme } from "next-themes";
import type { UserPreferences, PrivacySettings } from "@/types/type";
import { usePreferencesLogic } from "@/hooks/useSettings";
import { useCurrency } from "@/contexts/CurrencyContext";
import currencyRatesService, {
  CurrencyItem,
} from "@/services/currencyRatesService";

// Default currency options (fallback if API fails)
const DEFAULT_CURRENCY_OPTIONS = [
  { code: "USD", label: "US Dollar", countryCode: "us" },
  { code: "IDR", label: "Indonesian Rupiah", countryCode: "id" },
  { code: "MYR", label: "Malaysian Ringgit", countryCode: "my" },
  { code: "SGD", label: "Singapore Dollar", countryCode: "sg" },
  { code: "EUR", label: "Euro", countryCode: "eu" },
  { code: "GBP", label: "British Pound", countryCode: "gb" },
];

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", countryCode: "us" },
  { code: "id", label: "Indonesia", countryCode: "id" },
];

interface PreferencesSectionProps {
  initialData: UserPreferences | null;
  type?: "user" | "admin";
}

export default function PreferencesSection({
  initialData,
  type = "user",
}: PreferencesSectionProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const t = useTranslations("Dashboard");

  const { showAlert } = useAlert();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = useLocale();

  // Global currency context
  const { currency: globalCurrency, setCurrency: setGlobalCurrency } =
    useCurrency();

  // Panggil Logic dari Hook
  const { savePreferences, isSaving } = usePreferencesLogic(type);

  const [isPending, startTransition] = useTransition();
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  // Dynamic currency options from backend
  const [currencyOptions, setCurrencyOptions] = useState(
    DEFAULT_CURRENCY_OPTIONS,
  );
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);

  // Fetch currency options from backend
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const data = await currencyRatesService.getRates();
        if (data.currencies && data.currencies.length > 0) {
          const options = data.currencies.map((c: CurrencyItem) => ({
            code: c.code,
            label: c.name,
            countryCode: c.flag,
          }));
          setCurrencyOptions(options);
        }
      } catch (error) {
        console.warn(
          "Failed to fetch currency options, using defaults:",
          error,
        );
      } finally {
        setIsLoadingCurrencies(false);
      }
    };
    fetchCurrencies();
  }, []);

  // State Form (Default Value dari props or global context)
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    // Check jika ada pending currency reset dari language change
    let initialCurrency = globalCurrency || initialData?.currency || "USD";
    if (typeof window !== "undefined") {
      const pendingReset = localStorage.getItem("currency_lang_reset");
      if (pendingReset) {
        initialCurrency = pendingReset;
      }
    }
    return {
      language: (currentLocale as "en" | "id") || "en",
      currency: initialCurrency,
      timezone: initialData?.timezone || "Asia/Jakarta",
      privacy: initialData?.privacy || {
        loginAlert: true,
        cookieConsent: true,
        saveLoginInfo: false,
      },
    };
  });

  // Check & apply pending currency reset dari language change (works on both remount & re-render)
  useEffect(() => {
    const pendingReset = localStorage.getItem("currency_lang_reset");
    if (pendingReset) {
      // Apply reset
      setPreferences((prev) => ({
        ...prev,
        language: currentLocale as "en" | "id",
        currency: pendingReset,
      }));
      setGlobalCurrency(pendingReset);
      localStorage.setItem("preferred_currency", pendingReset);
      // Clear flag so it doesn't re-trigger
      localStorage.removeItem("currency_lang_reset");
    } else {
      // Normal sync - just update language
      setPreferences((prev) => ({
        ...prev,
        language: currentLocale as "en" | "id",
      }));
    }
  }, [currentLocale, setGlobalCurrency]);

  // Klik luar dropdown currency
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        currencyRef.current &&
        !currencyRef.current.contains(event.target as Node)
      ) {
        setIsCurrencyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ganti Bahasa (Langsung Redirect Client-Side)
  const handleLanguageChange = (lang: "en" | "id") => {
    // Auto-set default currency based on language
    const defaultCurrency = lang === "id" ? "IDR" : "USD";
    setPreferences({ ...preferences, language: lang, currency: defaultCurrency });
    setGlobalCurrency(defaultCurrency);

    // Set flag di localStorage SEBELUM navigasi — ini yang paling reliable
    // karena localStorage.setItem itu synchronous & survive across navigation
    localStorage.setItem("preferred_currency", defaultCurrency);
    localStorage.setItem("currency_lang_reset", defaultCurrency);

    // Persist language preference via cookie (read by next-intl middleware)
    document.cookie = `NEXT_LOCALE=${lang};path=/;max-age=${365 * 24 * 60 * 60}`;

    startTransition(() => {
      const currentParams = searchParams.toString();
      const targetPath = currentParams
        ? `${pathname}?${currentParams}`
        : pathname;
      router.replace(targetPath, { locale: lang });
    });
    showAlert(
      t("settingsPage.languageChanged", {
        lang: lang === "id" ? "Indonesia" : "English",
      }),
      "success",
    );
  };

  // Ganti Setting Privacy
  const handlePrivacyToggle = (key: keyof PrivacySettings) => {
    setPreferences((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: !prev.privacy[key] },
    }));
  };

  // Submit Form (Ke Backend)
  const handleSave = async () => {
    await savePreferences(preferences);
  };

  const activeCurrency =
    currencyOptions.find((c) => c.code === preferences.currency) ||
    currencyOptions[0] ||
    DEFAULT_CURRENCY_OPTIONS[0];

  return (
    <div className="space-y-8 font-figtree">
      {/* === GENERAL PREFERENCES === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={clsx(
          "rounded-3xl p-8 shadow-sm",
          isDark
            ? "bg-card border border-gray-800"
            : "bg-white border border-gray-100",
        )}
      >
        <h2 className="text-[2em] font-bold text-shortblack mb-8 flex items-center gap-3">
          <Globe className="w-6 h-6 text-bluelight" />
          {t("settingsPage.generalPreferences")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 1. Language Picker */}
          <div className="space-y-3">
            <label className="text-[1.4em] font-medium text-grays">
              {t("settingsPage.displayLanguage")}
            </label>
            <div className="flex gap-4">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code as "en" | "id")}
                  disabled={isPending}
                  className={clsx(
                    "flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 relative overflow-hidden",
                    preferences.language === lang.code
                      ? isDark
                        ? "border-bluelight bg-blue-500/10 text-bluelight"
                        : "border-bluelight bg-blue-50 text-bluelight"
                      : isDark
                        ? "border-gray-700 text-grays hover:border-blue-200 hover:bg-subcard"
                        : "border-gray-200 text-grays hover:border-blue-200 hover:bg-slate-50",
                  )}
                >
                  <div
                    className={clsx(
                      "relative w-8 h-6 shadow-sm rounded-md overflow-hidden shrink-0 border",
                      isDark ? "border-gray-700" : "border-gray-100",
                    )}
                  >
                    <Image
                      src={`https://flagcdn.com/${lang.countryCode}.svg`}
                      alt={lang.label}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[1.4em] font-bold">{lang.label}</span>
                  {preferences.language === lang.code && (
                    <div className="absolute top-0 right-0 p-[2px] bg-bluelight rounded-bl-lg">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Currency Picker */}
          <div className="space-y-3" ref={currencyRef}>
            <label className="text-[1.4em] font-medium text-grays">
              {t("settingsPage.displayCurrency")}
            </label>
            <div className="relative">
              <button
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                className={clsx(
                  "w-full pl-4 pr-10 py-3 rounded-xl text-shortblack flex items-center gap-3 hover:border-bluelight transition-all focus:ring-2 focus:ring-bluelight/50",
                  isDark
                    ? "bg-card border border-gray-700"
                    : "bg-white border border-gray-200",
                )}
              >
                <div
                  className={clsx(
                    "relative w-8 h-6 shadow-sm rounded-md overflow-hidden shrink-0 border",
                    isDark ? "border-gray-700" : "border-gray-100",
                  )}
                >
                  <Image
                    src={`https://flagcdn.com/${activeCurrency.countryCode}.svg`}
                    alt={activeCurrency.code}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-[1.5em] font-medium">
                  {activeCurrency.code} - {activeCurrency.label}
                </span>
                <ChevronDown
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-grays transition-transform ${
                    isCurrencyOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isCurrencyOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.98 }}
                    onWheel={(e) => e.stopPropagation()}
                    className={clsx(
                      "absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl z-20 overflow-y-auto max-h-[230px] p-1.5",
                      isDark
                        ? "bg-card border border-gray-800"
                        : "bg-white border border-gray-100",
                    )}
                  >
                    {currencyOptions.map((curr) => (
                      <button
                        key={curr.code}
                        onClick={() => {
                          setPreferences({
                            ...preferences,
                            currency: curr.code,
                          });
                          // Update global currency context immediately
                          setGlobalCurrency(curr.code);
                          setIsCurrencyOpen(false);
                          showAlert(
                            t("settingsPage.currencyChanged", {
                              currency: curr.label,
                            }),
                            "success",
                          );
                        }}
                        className={clsx(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                          preferences.currency === curr.code
                            ? isDark
                              ? "bg-blue-500/10 text-bluelight"
                              : "bg-blue-50 text-bluelight"
                            : isDark
                              ? "text-shortblack hover:bg-subcard"
                              : "text-shortblack hover:bg-gray-50",
                        )}
                      >
                        <div
                          className={clsx(
                            "relative w-8 h-6 shadow-sm rounded-md overflow-hidden shrink-0 border",
                            isDark ? "border-gray-700" : "border-gray-100",
                          )}
                        >
                          <Image
                            src={`https://flagcdn.com/${curr.countryCode}.svg`}
                            alt={curr.label}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-[1.3em] font-bold leading-none">
                            {curr.code}
                          </span>
                          <span className="text-[1.1em] opacity-70 leading-none mt-0.5">
                            {curr.label}
                          </span>
                        </div>
                        {preferences.currency === curr.code && (
                          <Check className="w-4 h-4 ml-auto" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="text-[1.2em] text-grays italic mt-1">
              {t("settingsPage.currencyNote")}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
