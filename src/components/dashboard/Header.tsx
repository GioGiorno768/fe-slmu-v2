"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { Bell, Clock, ShieldAlert, UserPlus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition, useRef, useEffect } from "react";
import NotificationDropdown from "./NotificationDropdown";
import { useHeader } from "@/hooks/useHeader";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useNotifications } from "@/hooks/useNotifications";

// 👇 1. IMPORT TIPE 'Role' DARI SINI
import type { Role } from "@/types/type";

interface HeaderProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  openMobileSidebar: () => void;
  // 👇 2. GANTI INI BIAR PAKE TIPE 'Role' (JANGAN DI-HARDCODE LAGI)
  role?: Role;
}

import { useTheme } from "next-themes";

export default function Header({
  isCollapsed,
  toggleSidebar,
  openMobileSidebar,
  role = "member",
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  // Ensure hydration match
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute isDark for UI
  const isDark = mounted ? theme === "dark" : false;
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Determine if user is admin/super-admin first
  const isAdminOrSuper = role === "admin" || role === "super-admin";

  const { stats: userStats, isLoading: userLoading } = useHeader();
  // Only call admin stats API if user is admin/super-admin
  const { stats: adminStats, isLoading: adminLoading } =
    useAdminStats(isAdminOrSuper);

  // 💱 Use global currency context for formatting
  const { format: formatWithCurrency } = useCurrency();

  // 🔔 Get unread notification count for badge
  const { unreadCount } = useNotifications();

  // Logic loading & data stats
  const isLoading = isAdminOrSuper ? adminLoading : userLoading;

  // Use global currency format for monetary values
  const formatCurrency = (val?: number) =>
    val !== undefined ? formatWithCurrency(val) : "...";

  const formatNumber = (val?: number) =>
    val !== undefined ? val.toLocaleString("en-US") : "...";

  const userHeadData = [
    {
      name: t("balance"),
      icon: (
        <span className="solar--wallet-linear w-[2.8em] h-[2.8em] bg-bluelight" />
      ),
      value: formatCurrency(
        (userStats as import("@/types/type").HeaderStats)?.balance
      ),
      color: "text-shortblack",
    },
    {
      name: t("payout"),
      icon: (
        <span className="hugeicons--money-send-circle w-[2.3em] h-[2.3em] bg-bluelight" />
      ),
      value: formatCurrency(
        (userStats as import("@/types/type").HeaderStats)?.payout
      ),
      color: "text-shortblack",
    },
    {
      name: t("cpm"),
      icon: (
        <span className="icon-park-outline--click-tap w-[2.5em] h-[2.5em] bg-bluelight" />
      ),
      value: formatCurrency(
        (userStats as import("@/types/type").HeaderStats)?.cpm
      ),
      color: "text-shortblack",
    },
  ];

  // Admin header items - Reports only shown for super-admin
  const adminHeadData = [
    {
      name: "Pending",
      icon: <Clock className="w-[2.5em] h-[2.5em] text-orange-500" />,
      value: formatNumber(adminStats?.pendingWithdrawals),
      color: "text-orange-600",
    },
    // Only show Reports for super-admin
    ...(role === "super-admin"
      ? [
          {
            name: "Reports",
            icon: <ShieldAlert className="w-[2.5em] h-[2.5em] text-red-500" />,
            value: formatNumber(adminStats?.abuseReports),
            color: "text-red-600",
          },
        ]
      : []),
    {
      name: "New Users",
      icon: <UserPlus className="w-[2.5em] h-[2.5em] text-blue-500" />,
      value: `+${formatNumber(adminStats?.newUsers)}`,
      color: "text-blue-600",
    },
  ];

  // 👇 3. UPDATE LOGIC SWITCHER (Biar super-admin juga dapet tampilan admin)
  const headItems = isAdminOrSuper ? adminHeadData : userHeadData;

  const switchLanguage = (nextLocale: "en" | "id") => {
    // Auto-reset currency sesuai bahasa yang dipilih
    const defaultCurrency = nextLocale === "id" ? "IDR" : "USD";
    localStorage.setItem("preferred_currency", defaultCurrency);
    localStorage.setItem("currency_lang_reset", defaultCurrency);

    // Persist language preference via cookie (read by next-intl middleware)
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=${365 * 24 * 60 * 60}`;

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifRef]);

  return (
    <nav
      className={`
        fixed top-0 right-0 left-0
        ${isCollapsed ? "custom:left-20" : "custom:left-64"}
        transition-all duration-300 ease-in-out z-50
        px-4 custom:px-8 sm:pt-6 pt-3
        font-figtree dark:bg-background
      `}
    >
      <div className="shadow-sm dark:shadow-shd-card/50 rounded-xl flex items-center justify-between md:px-[2em] px-[1em] lg:px-[4em] py-[1em] md:py-[2em] text-[10px] dark:bg-card dark:text-white">
        <div className="flex items-center gap-10">
          <button
            onClick={openMobileSidebar}
            className="hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors w-[3.5em] ml-[1em] h-[3.5en] flex justify-center items-center custom:hidden"
          >
            <span className="solar--hamburger-menu-broken w-[3em] h-[3em] dark:bg-foreground " />
          </button>

          <div className="lg:flex hidden cursor-default">
            {headItems.map((item, index) => (
              <div
                key={index}
                title={item.name}
                className={`sm:flex flex-col gap-[.8em] ${
                  index !== 2 &&
                  "border-r-[.2em] border-gray-dashboard pr-[3em]"
                } ${index !== 0 && "pl-[3em]"} `}
              >
                <span className="text-grays text-[1.4em] font-medium tracking-tight uppercase">
                  {item.name}
                </span>
                <div className="flex gap-[1.5em] justify-start items-center">
                  {item.icon}
                  {isLoading ? (
                    <div className="h-[2em] w-[6em] bg-lazyload animate-pulse rounded"></div>
                  ) : (
                    <span
                      className={`text-[1.8em] font-manrope font-bold ${item.color}`}
                    >
                      {item.value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 custom:gap-[2em]">
          {/* === LANGUAGE SWITCHER DROPDOWN (DESKTOP) === */}
          <div className="lg:block hidden relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              disabled={isPending}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg group hover:bg-subcard transition-colors duration-300 ease-in-out`}
            >
              <svg
                className={`w-6 h-6 dark:text-bluelight group-hover:dark:text-tx-blue-dashboard transition-colors duration-300 ease-in-out ${
                  showLangDropdown && "dark:text-tx-blue-dashboard"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                <path
                  strokeWidth="1.5"
                  d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                />
              </svg>
              <span
                className={`text-[1.4em] font-medium dark:text-bluelight group-hover:dark:text-tx-blue-dashboard transition-colors duration-300 ease-in-out ${
                  showLangDropdown && "dark:text-tx-blue-dashboard"
                }`}
              >
                {locale.toUpperCase()}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showLangDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowLangDropdown(false)}
                />
                <div className="absolute top-full right-0 mt-2 dark:bg-card rounded-xl shadow-sm dark:shadow-shd-card/50 border border-shd-card/10 min-w-[120px] z-50 overflow-hidden p-2">
                  <button
                    onClick={() => {
                      switchLanguage("en");
                      setShowLangDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-[1.4em] flex items-center gap-2 rounded-lg ${
                      locale === "en"
                        ? "dark:bg-gradient-to-r dark:from-blue-background-gradient dark:to-purple-background-gradient text-tx-blue-dashboard font-semibold"
                        : "dark:text-grays hover:dark:text-tx-blue-dashboard hover:bg-subcard transition-colors duration-300 ease-in-out"
                    }`}
                  >
                    {locale === "en" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-tx-blue-dashboard" />
                    )}
                    English
                  </button>
                  <button
                    onClick={() => {
                      switchLanguage("id");
                      setShowLangDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-[1.4em] flex items-center gap-2 rounded-lg ${
                      locale === "id"
                        ? "dark:bg-gradient-to-r dark:from-blue-background-gradient dark:to-purple-background-gradient text-tx-blue-dashboard font-semibold"
                        : "dark:text-grays hover:dark:text-tx-blue-dashboard hover:bg-subcard transition-colors duration-300 ease-in-out"
                    }`}
                  >
                    {locale === "id" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-bluelight" />
                    )}
                    Indonesia
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="custom:w-[5em] custom:h-[5em] w-[4em] h-[4em] flex justify-center items-center rounded-full custom:hover:-translate-y-1 transition-all duration-300 ease-in-out"
          >
            {isDark ? (
              <span className="solar--sun-broken custom:w-[3em] custom:h-[3em] w-[3em] h-[3em] bg-bluelight " />
            ) : (
              <span className="solar--moon-stars-broken custom:w-[2.5em] custom:h-[2.5em] w-[2.5em] h-[2.5em] bg-bluelight " />
            )}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 custom:hover:-translate-y-1 transition-all duration-300 ease-in-out relative"
            >
              <Bell className="w-[2.8em] h-[2.8em] text-bluelight stroke-[.15em]" />
              {/* Red dot only shows when there are unread notifications */}
              {unreadCount > 0 && (
                <span className="absolute top-2 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card"></span>
              )}
            </button>

            <NotificationDropdown
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
              role={role}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
