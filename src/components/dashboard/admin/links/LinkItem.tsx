"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Link as LinkIcon,
  CheckCircle2,
  ExternalLink,
  Calendar,
  DollarSign,
  BarChart3,
  Clock,
  Ban,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import clsx from "clsx";
import type { AdminLink } from "@/types/type";
import { useTheme } from "next-themes";

interface LinkItemProps {
  link: AdminLink;
  isSelected: boolean;
  onToggleSelect: (id: string, status: string) => void;
  onAction: (id: string, action: "block" | "activate") => void;
  onMessage: (id: string) => void; // Keep for future use
}

export default function LinkItem({
  link,
  isSelected,
  onToggleSelect,
  onAction,
}: // onMessage - kept in props for future use when message feature is enabled
LinkItemProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // Check if link is from guest (no user_id)
  const isGuest = !link.owner.id;

  return (
    // 1. Container Utama: Clickable (Trigger Selection)
    <div
      onClick={() => onToggleSelect(link.id, link.status)}
      className={clsx(
        "rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md group relative overflow-hidden cursor-pointer",
        isSelected
          ? isDark
            ? "border-bluelight ring-2 ring-bluelight/20 bg-blue-500/10"
            : "border-bluelight ring-2 ring-bluelight/20 bg-blue-50/30"
          : isDark
            ? "bg-card border-gray-800 hover:border-blue-500/40"
            : "bg-white border-gray-100 hover:border-blue-200",
      )}
    >
      {/* HEADER SECTION */}
      <div className="p-5 flex items-start gap-4">
        {/* Checkbox Removed */}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Row: Title/Date & Status */}
          <div className="flex justify-between items-start mb-1">
            <div className="min-w-0">
              {/* For guest links without title, show created date here */}
              {isGuest && !link.title ? (
                <p className="text-[1.1em] text-grays truncate mb-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Created: {formatDate(link.createdAt)}
                </p>
              ) : link.title ? (
                <p className="text-[1.1em] text-grays truncate mb-0.5">
                  {link.title}
                </p>
              ) : null}
              <div className="flex items-center gap-2">
                {/* 2. Link Short URL: Stop Propagation biar gak trigger select pas diklik */}
                <a
                  href={`${link.shortUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[1.6em] font-bold text-bluelight hover:underline truncate"
                >
                  {link.shortUrl}
                </a>
                <span
                  className={clsx(
                    "px-2 py-0.5 rounded text-[1em] font-bold uppercase tracking-wide",
                    link.status === "active"
                      ? isDark
                        ? "bg-green-500/20 text-green-400"
                        : "bg-green-100 text-green-700"
                      : link.status === "disabled"
                        ? isDark
                          ? "bg-red-500/20 text-red-400"
                          : "bg-red-100 text-red-700"
                        : isDark
                          ? "bg-gray-500/20 text-gray-400"
                          : "bg-gray-100 text-gray-600",
                  )}
                >
                  {link.status}
                </span>
              </div>
            </div>

            {/* Right Side: Action Button/Dropdown & Selection Indicator */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Selection Indicator */}
              {isSelected && (
                <div
                  className={clsx(
                    "p-1.5 rounded-full animate-in zoom-in duration-200",
                    isDark ? "bg-blue-500/20" : "bg-blue-50",
                  )}
                >
                  <CheckCircle2 className="w-6 h-6 text-bluelight fill-blue-50" />
                </div>
              )}

              {/* Guest: Simple button, User: Direct button (same as guest) */}
              {/* 
                ===============================================
                MESSAGE USER FEATURE - DISABLED FOR NOW
                This was using a dropdown. Uncomment and restore if needed.
                onMessage prop still exists in interface for future use.
                ===============================================
              */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(
                    link.id,
                    link.status === "active" ? "block" : "activate",
                  );
                }}
                className={clsx(
                  "px-3 py-1.5 rounded-lg font-medium text-sm flex items-center gap-1.5 transition-colors border",
                  link.status === "active"
                    ? isDark
                      ? "text-red-400 hover:bg-red-500/10 border-red-500/30"
                      : "text-red-600 hover:bg-red-50 border-red-200"
                    : isDark
                      ? "text-green-400 hover:bg-green-500/10 border-green-500/30"
                      : "text-green-600 hover:bg-green-50 border-green-200",
                )}
              >
                {link.status === "active" ? (
                  <>
                    <Ban className="w-3.5 h-3.5" /> Block
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Activate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Original Link */}
          <div className="flex items-center gap-2 text-[1.2em] text-grays mb-4 group/link">
            <LinkIcon className="w-3.5 h-3.5 shrink-0" />
            <p className="truncate max-w-[80%]">{link.originalUrl}</p>
            {/* Optional: Kalau External Link diklik, jangan select row */}
            <a
              href={link.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={clsx(
                "opacity-0 group-hover/link:opacity-100 transition-opacity p-1 rounded",
                isDark ? "hover:bg-gray-700" : "hover:bg-slate-100",
              )}
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Password Indicator */}
          {link.password && (
            <div className="flex items-center gap-2 text-[1.2em] text-grays mb-4 group/pw">
              <Lock className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span className="text-amber-600 dark:text-amber-400 font-medium text-[0.9em]">
                Password:
              </span>
              <code
                className={clsx(
                  "px-2 py-0.5 rounded text-[0.9em] font-mono",
                  isDark
                    ? "bg-gray-800 text-gray-300"
                    : "bg-gray-100 text-gray-700",
                )}
              >
                {showPassword ? link.password : "••••••••"}
              </code>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPassword(!showPassword);
                }}
                className={clsx(
                  "p-1 rounded transition-colors",
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-200",
                )}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          <div
            className={clsx(
              "h-px w-full mb-4",
              isDark ? "bg-gray-800" : "bg-gray-100",
            )}
          />

          {/* Details Row */}
          {isGuest ? (
            /* Guest Link: Simplified view - only show "Guest" label */
            <div className="flex items-center gap-3 text-[1.2em]">
              <div
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border shadow-sm",
                  isDark
                    ? "bg-gray-700 text-gray-400 border-gray-600"
                    : "bg-gray-200 text-gray-500 border-white",
                )}
              >
                G
              </div>
              <div className="min-w-0">
                <p
                  className={clsx(
                    "font-medium",
                    isDark ? "text-gray-400" : "text-gray-500",
                  )}
                >
                  Guest Link
                </p>
                <p className="text-grays text-[0.9em]">Created without login</p>
              </div>
            </div>
          ) : (
            /* User Link: Full details */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-[1.2em]">
              <div className="flex items-center gap-3">
                {link.owner.avatarUrl ? (
                  <Image
                    src={link.owner.avatarUrl}
                    alt={link.owner.name}
                    width={32}
                    height={32}
                    className="rounded-full bg-gray-100 border border-white shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm border border-white shadow-sm">
                    {link.owner.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-shortblack truncate">
                    {link.owner.name}
                  </p>
                  <p className="text-grays text-[0.9em] truncate">
                    {link.owner.email || "No email"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="flex items-center gap-2 text-grays">
                  <BarChart3 className="w-3.5 h-3.5" /> Views:{" "}
                  <b className="text-shortblack">
                    {link.views.toLocaleString()}
                  </b>
                </p>
                <p className="flex items-center gap-2 text-grays">
                  <DollarSign className="w-3.5 h-3.5" /> Earn:{" "}
                  <b className="text-green-600">
                    $
                    {link.earnings.toLocaleString("en-US", {
                      minimumFractionDigits: 5,
                    })}
                  </b>
                </p>
              </div>

              <div className="space-y-1 text-grays">
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Created:{" "}
                  {formatDate(link.createdAt)}
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Valid:{" "}
                  <b className="text-green-600">
                    {(link.validViews ?? 0).toLocaleString()}
                  </b>
                </p>
                {link.expiredAt && (
                  <p className="flex items-center gap-2 text-red-500">
                    <Clock className="w-3.5 h-3.5" /> Exp:{" "}
                    {formatDate(link.expiredAt)}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <span
                  className={clsx(
                    "px-3 py-1 rounded-full text-[0.9em] font-bold border",
                    link.adsLevel === "noAds"
                      ? "bg-gray-50 border-gray-200 text-gray-500"
                      : "bg-purple-50 border-purple-200 text-purple-600",
                  )}
                >
                  {link.adsLevel === "noAds"
                    ? "No Ads"
                    : `Ads: ${link.adsLevel}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
