"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  Pencil,
  EyeOff,
  Eye,
  Calendar,
  Lock,
  Megaphone,
  Link as LinkIcon,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  DollarSign,
  Globe,
} from "lucide-react";
import clsx from "clsx";
import type { Shortlink } from "@/types/type";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

interface LinkItemProps {
  link: Shortlink;
  onEdit: (id: string) => void;
  onToggleStatus: (id: string, status: "active" | "disabled") => void;
}

export default function LinkItem({
  link,
  onEdit,
  onToggleStatus,
}: LinkItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { format: formatCurrency } = useCurrency();
  const t = useTranslations("Dashboard");

  // Theme detection with next-themes
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  // Helpers
  const formatLinkDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString("en-US");
  };

  const stripProtocol = (url: string) => url.replace(/^https?:\/\//, "");

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(link.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get hostname safely
  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        "group relative rounded-2xl border transition-all duration-200",
        "hover:shadow-lg",
        isDark
          ? "bg-card hover:shadow-black/20"
          : "bg-white hover:shadow-gray-200/80",
        link.status === "disabled"
          ? "border-red-500/30 opacity-75"
          : isDark
            ? "border-gray-800 hover:border-blue-500/50"
            : "border-gray-200 hover:border-blue-400/50",
      )}
    >
      {/* Main Content */}
      <div className="p-4 sm:p-5">
        {/* Top Row: Title, Status, Menu */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Link Icon */}
            <div
              className={clsx(
                "w-10 h-10 rounded-lg sm:flex items-center justify-center shrink-0 transition-colors hidden",
                link.status === "active"
                  ? isDark
                    ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400"
                    : "bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600"
                  : isDark
                    ? "bg-red-500/10 text-red-500"
                    : "bg-red-50 text-red-500",
              )}
            >
              <LinkIcon className="w-5 h-5" />
            </div>

            {/* Title & Short URL */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={clsx(
                    "text-sm font-medium truncate",
                    isDark ? "text-gray-400" : "text-gray-500",
                  )}
                >
                  {link.title || t("linkList.untitled")}
                </h3>
                <span
                  className={clsx(
                    "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0",
                    link.status === "active"
                      ? isDark
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-emerald-50 text-emerald-600"
                      : isDark
                        ? "bg-red-500/10 text-red-500"
                        : "bg-red-50 text-red-600",
                  )}
                >
                  {link.status}
                </span>
              </div>

              {/* Short URL - Main Focus */}
              <div className="flex items-center gap-2">
                <a
                  href={link.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clsx(
                    "text-base sm:text-lg font-semibold truncate transition-colors",
                    isDark
                      ? "text-white hover:text-blue-400"
                      : "text-gray-900 hover:text-blue-600",
                  )}
                >
                  {stripProtocol(link.shortUrl)}
                </a>
                <button
                  onClick={handleCopyLink}
                  className={clsx(
                    "p-1.5 rounded-md transition-all shrink-0",
                    copied
                      ? "bg-emerald-500/10 text-emerald-500"
                      : isDark
                        ? "hover:bg-gray-800 text-gray-400 hover:text-gray-300"
                        : "hover:bg-gray-100 text-gray-400 hover:text-gray-600",
                  )}
                  title={t("linkList.copyLink")}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Password Badge */}
            {link.passwordProtected && (
              <div
                className={clsx(
                  "hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
                  isDark ? "bg-amber-500/10" : "bg-amber-50",
                )}
              >
                <Lock
                  className={clsx(
                    "w-3.5 h-3.5",
                    isDark ? "text-amber-400" : "text-amber-600",
                  )}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className={clsx(
                    "text-xs font-medium hover:underline",
                    isDark ? "text-amber-400" : "text-amber-600",
                  )}
                >
                  {showPassword ? link.password : "••••••"}
                </button>
              </div>
            )}

            {/* Menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={clsx(
                  "p-2 rounded-lg transition-colors",
                  isMenuOpen
                    ? isDark
                      ? "bg-gray-800"
                      : "bg-gray-100"
                    : isDark
                      ? "hover:bg-gray-800 text-gray-400"
                      : "hover:bg-gray-100 text-gray-500",
                )}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className={clsx(
                      "absolute top-full right-0 mt-1.5 w-40 rounded-xl shadow-xl border z-20 overflow-hidden",
                      isDark
                        ? "bg-gray-900 border-gray-800"
                        : "bg-white border-gray-200",
                    )}
                  >
                    <button
                      onClick={() => {
                        onEdit(link.id);
                        setIsMenuOpen(false);
                      }}
                      className={clsx(
                        "flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors",
                        isDark
                          ? "text-gray-300 hover:bg-gray-800"
                          : "text-gray-700 hover:bg-gray-50",
                      )}
                    >
                      <Pencil className="w-4 h-4" />
                      <span>{t("linkList.editLink")}</span>
                    </button>
                    <button
                      onClick={() => {
                        onToggleStatus(link.id, link.status);
                        setIsMenuOpen(false);
                      }}
                      className={clsx(
                        "flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors",
                        link.status === "active"
                          ? isDark
                            ? "text-red-400 hover:bg-red-500/10"
                            : "text-red-600 hover:bg-red-50"
                          : isDark
                            ? "text-emerald-400 hover:bg-emerald-500/10"
                            : "text-emerald-600 hover:bg-emerald-50",
                      )}
                    >
                      {link.status === "active" ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      <span>
                        {link.status === "active"
                          ? t("linkList.disable")
                          : t("linkList.enable")}
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Destination URL */}
        <div
          className={clsx(
            "flex items-center gap-2 mb-4 text-sm",
            isDark ? "text-gray-400" : "text-gray-500",
          )}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <a
            href={link.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              "truncate transition-colors flex items-center gap-1",
              isDark ? "hover:text-blue-400" : "hover:text-blue-600",
            )}
          >
            {getHostname(link.originalUrl)}
            <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
          </a>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Ads Level */}
          <div
            className={clsx(
              "items-center gap-1.5 px-3 py-1.5 rounded-lg hidden",
              isDark ? "bg-purple-500/10" : "bg-purple-50",
            )}
          >
            <Megaphone
              className={clsx(
                "w-3.5 h-3.5",
                isDark ? "text-purple-400" : "text-purple-600",
              )}
            />
            <span
              className={clsx(
                "text-xs font-medium capitalize",
                isDark ? "text-purple-400" : "text-purple-600",
              )}
            >
              {link.adsLevel}
            </span>
          </div>

          {/* Views */}
          <div
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
              isDark ? "bg-cyan-500/10" : "bg-cyan-50",
            )}
          >
            <TrendingUp
              className={clsx(
                "w-3.5 h-3.5",
                isDark ? "text-cyan-400" : "text-cyan-600",
              )}
            />
            <span
              className={clsx(
                "text-xs font-medium",
                isDark ? "text-cyan-400" : "text-cyan-600",
              )}
            >
              {formatNumber(link.totalClicks)} {t("linkList.views")}
            </span>
          </div>

          {/* Earnings */}
          <div
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
              isDark ? "bg-emerald-500/10" : "bg-emerald-50",
            )}
          >
            <DollarSign
              className={clsx(
                "w-3.5 h-3.5",
                isDark ? "text-emerald-400" : "text-emerald-600",
              )}
            />
            <span
              className={clsx(
                "text-xs font-semibold",
                isDark ? "text-emerald-400" : "text-emerald-600",
              )}
            >
              {formatCurrency(link.totalEarning)}
            </span>
          </div>

          {/* Password (Mobile) */}
          {link.passwordProtected && (
            <div
              className={clsx(
                "sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                isDark ? "bg-amber-500/10" : "bg-amber-50",
              )}
            >
              <Lock
                className={clsx(
                  "w-3.5 h-3.5",
                  isDark ? "text-amber-400" : "text-amber-600",
                )}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className={clsx(
                  "text-xs font-medium hover:underline",
                  isDark ? "text-amber-400" : "text-amber-600",
                )}
              >
                {showPassword ? link.password : "••••••"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className={clsx(
          "px-4 sm:px-5 py-3 border-t flex flex-wrap items-center gap-x-4 gap-y-1 text-xs",
          isDark
            ? "border-gray-800 bg-gray-800/30 text-gray-400"
            : "border-gray-100 bg-gray-50/50 text-gray-500",
        )}
      >
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {t("linkList.created")} {formatLinkDate(link.dateCreated)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {link.dateExpired
              ? `${t("linkList.expires")} ${formatLinkDate(link.dateExpired)}`
              : t("linkList.noExpiration")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
