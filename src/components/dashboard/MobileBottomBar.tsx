import { useState, useRef, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe,
  Link2,
  Wallet,
  Check,
  TrendingUp,
  CreditCard,
  Loader2,
  Info,
  Users,
  AlertTriangle,
  Clock,
  Banknote,
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import clsx from "clsx";
import { useHeader } from "@/hooks/useHeader";
import { Role, HeaderStats, AdminHeaderStats } from "@/types/type";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTheme } from "next-themes";

interface MobileBottomBarProps {
  isSidebarOpen: boolean;
  role?: Role;
}

export default function MobileBottomBar({
  isSidebarOpen,
  role = "member",
}: MobileBottomBarProps) {
  const [activePopup, setActivePopup] = useState<"lang" | "wallet" | null>(
    null,
  );
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const barRef = useRef<HTMLDivElement>(null);

  const isAdmin = role === "admin" || role === "super-admin";

  // 2. PANGGIL DATA REAL-TIME
  const { stats, isLoading } = useHeader(role);

  // 💱 Use global currency context
  const { format: formatWithCurrency } = useCurrency();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Helper Format Currency - uses global currency context
  const formatCurrency = (val?: number) => {
    if (val === undefined) return "...";
    return formatWithCurrency(val);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setActivePopup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      setActivePopup(null);
    }
  }, [isSidebarOpen]);

  const switchLanguage = (nextLocale: "en" | "id") => {
    // Auto-reset currency sesuai bahasa yang dipilih
    const defaultCurrency = nextLocale === "id" ? "IDR" : "USD";
    localStorage.setItem("preferred_currency", defaultCurrency);
    localStorage.setItem("currency_lang_reset", defaultCurrency);

    // Persist language preference via cookie (read by next-intl middleware)
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=${365 * 24 * 60 * 60}`;

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
      setActivePopup(null);
    });
  };

  const togglePopup = (name: "lang" | "wallet") => {
    setActivePopup(activePopup === name ? null : name);
  };

  // 3. GUNAKAN DATA DINAMIS DARI HOOK
  // Data Member
  const memberStats = stats as HeaderStats;
  const memberWalletData = [
    {
      label: "Balance",
      value: formatCurrency(memberStats?.balance),
      icon: Wallet,
      color: "text-bluelight",
    },
    {
      label: "Payout",
      value: formatCurrency(memberStats?.payout),
      icon: CreditCard,
      color: "text-green-600",
    },
    {
      label: "CPM",
      value: formatCurrency(memberStats?.cpm),
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ];

  // Data Admin
  const adminStats = stats as AdminHeaderStats;
  const adminInfoData = [
    {
      label: "Pending Withdrawals",
      value: adminStats?.pendingWithdrawals?.toString() || "0",
      icon: Clock,
      color: "text-orange-500",
    },
    {
      label: "Reported Links",
      value: adminStats?.abuseReports?.toString() || "0",
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      label: "New Users Today",
      value: adminStats?.newUsers?.toString() || "0",
      icon: Users,
      color: "text-bluelight",
    },
  ];

  const popupData = isAdmin ? adminInfoData : memberWalletData;
  const popupTitle = isAdmin ? "Admin Overview" : "Quick Stats";

  return (
    <AnimatePresence>
      {!isSidebarOpen && (
        <motion.div
          ref={barRef}
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-2 left-2 right-2 z-40 lg:hidden flex justify-center pointer-events-none text-[10px]"
        >
          {/* === THE BAR ITSELF === */}
          <div
            className={clsx(
              "w-full max-w-lg backdrop-blur-md border shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-[2.5em] p-1.5 px-6 flex items-center justify-between gap-4 pointer-events-auto relative",
              isDark
                ? "bg-card/90 border-gray-800"
                : "bg-white/90 border-white/40",
            )}
          >
            {/* === POPUPS (inside bar for proper positioning) === */}
            <AnimatePresence>
              {/* Language Popup */}
              {activePopup === "lang" && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className={clsx(
                    "absolute bottom-full left-0 mb-3 w-[180px] rounded-2xl shadow-2xl overflow-hidden",
                    isDark
                      ? "bg-card border border-gray-800"
                      : "bg-white border border-gray-100",
                  )}
                >
                  <div
                    className={clsx(
                      "p-3 border-b",
                      isDark
                        ? "bg-subcard border-gray-800"
                        : "bg-gray-50 border-gray-100",
                    )}
                  >
                    <span className="text-[1.1em] font-bold text-grays uppercase tracking-wider">
                      Language
                    </span>
                  </div>
                  <div className="p-1.5">
                    {["en", "id"].map((l) => (
                      <button
                        key={l}
                        onClick={() => switchLanguage(l as "en" | "id")}
                        className={clsx(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 text-[1.3em] font-medium mb-1",
                          locale === l
                            ? isDark
                              ? "bg-gradient-to-r from-blue-background-gradient to-purple-background-gradient text-tx-blue-dashboard font-semibold"
                              : "bg-blue-50 text-bluelight"
                            : isDark
                              ? "text-grays hover:text-tx-blue-dashboard hover:bg-subcard"
                              : "text-shortblack hover:bg-gray-50",
                        )}
                      >
                        <span className="flex items-center gap-2">
                          {locale === l && (
                            <span
                              className={clsx(
                                "w-1.5 h-1.5 rounded-full",
                                isDark
                                  ? "bg-tx-blue-dashboard"
                                  : "bg-bluelight",
                              )}
                            />
                          )}
                          {l === "en" ? "🇺🇸 English" : "🇮🇩 Indonesia"}
                        </span>
                        {locale === l && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Wallet / Admin Info Popup */}
              {activePopup === "wallet" && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className={clsx(
                    "absolute bottom-full right-0 mb-3 w-[240px] rounded-2xl shadow-2xl overflow-hidden",
                    isDark
                      ? "bg-card border border-gray-800"
                      : "bg-white border border-gray-100",
                  )}
                >
                  <div
                    className={clsx(
                      "p-3 border-b flex justify-between items-center",
                      isDark
                        ? "bg-subcard border-gray-800"
                        : "bg-gray-50 border-gray-100",
                    )}
                  >
                    <span className="text-[1.1em] font-bold text-grays uppercase tracking-wider">
                      {popupTitle}
                    </span>
                    {!isAdmin && (
                      <Link
                        href="/withdrawal"
                        className="text-[1.1em] text-bluelight font-semibold hover:underline"
                      >
                        Withdraw
                      </Link>
                    )}
                  </div>
                  <div
                    className={clsx(
                      "p-1.5 divide-y",
                      isDark ? "divide-gray-800" : "divide-gray-50",
                    )}
                  >
                    {isLoading ? (
                      <div className="p-4 flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-bluelight" />
                      </div>
                    ) : (
                      popupData.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={clsx(
                                "p-1.5 rounded-full",
                                isDark ? "bg-gray-800" : "bg-slate-50",
                                item.color,
                              )}
                            >
                              <item.icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[1.2em] font-medium text-grays">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-[1.3em] font-bold text-shortblack">
                            {item.value}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Left Button: Language */}
            <button
              onClick={() => togglePopup("lang")}
              className={clsx(
                "flex flex-col items-center justify-center w-12 h-12 transition-all duration-300",
                activePopup === "lang"
                  ? "text-bluelight scale-105"
                  : isDark
                    ? "text-grays hover:text-tx-blue-dashboard"
                    : "text-grays hover:text-shortblack",
              )}
            >
              <div
                className={clsx(
                  "p-2.5 rounded-full transition-colors",
                  activePopup === "lang"
                    ? isDark
                      ? "bg-subcard"
                      : "bg-blue-50"
                    : "bg-transparent",
                )}
              >
                <Globe className="w-5 h-5" strokeWidth={2.5} />
              </div>
            </button>

            {/* Center Button: New Link (Member) or Withdrawal (Admin) */}
            <Link
              href={isAdmin ? "/admin/withdrawals" : "/new-link"}
              className="relative -top-5"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className={clsx(
                  "w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white border-[3px] border-white ring-1",
                  isAdmin
                    ? "bg-gradient-to-br from-orange-400 to-red-500 shadow-orange-500/30 ring-orange-100"
                    : "bg-gradient-to-br from-bluelight to-blue-600 shadow-blue-500/30 ring-blue-100",
                )}
              >
                {isAdmin ? (
                  <Banknote className="w-6 h-6" strokeWidth={2.5} />
                ) : (
                  <Link2 className="w-6 h-6" strokeWidth={2.5} />
                )}
              </motion.div>
            </Link>

            {/* Right Button: Wallet (Member) or Info (Admin) */}
            <button
              onClick={() => togglePopup("wallet")}
              className={clsx(
                "flex flex-col items-center justify-center w-12 h-12 transition-all duration-300",
                activePopup === "wallet"
                  ? "text-bluelight scale-105"
                  : isDark
                    ? "text-grays hover:text-tx-blue-dashboard"
                    : "text-grays hover:text-shortblack",
              )}
            >
              <div
                className={clsx(
                  "p-2.5 rounded-full transition-colors",
                  activePopup === "wallet"
                    ? isDark
                      ? "bg-subcard"
                      : "bg-blue-50"
                    : "bg-transparent",
                )}
              >
                {isAdmin ? (
                  <Info className="w-5 h-5" strokeWidth={2.5} />
                ) : (
                  <Wallet className="w-5 h-5" strokeWidth={2.5} />
                )}
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
