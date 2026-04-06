// src/components/dashboard/settings/SecuritySection.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  Lock,
  Shield,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Info,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useAlert } from "@/hooks/useAlert";
import type { SecuritySettings } from "@/types/type";
import clsx from "clsx";
import { useTheme } from "next-themes";
import { useSecurityLogic } from "@/hooks/useSettings";
import { useTranslations } from "next-intl";

interface SecuritySectionProps {
  initialData: SecuritySettings | null;
}

// Password strength calculator
function getPasswordStrength(password: string) {
  if (!password) return { score: 0, label: "", color: "", bg: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Very Weak", color: "text-red-500", bg: "bg-red-500" },
    { label: "Weak", color: "text-orange-500", bg: "bg-orange-500" },
    { label: "Fair", color: "text-yellow-500", bg: "bg-yellow-500" },
    { label: "Strong", color: "text-emerald-500", bg: "bg-emerald-500" },
    { label: "Very Strong", color: "text-cyan-500", bg: "bg-cyan-500" },
  ];

  const idx = Math.min(score, 5) - 1;
  if (idx < 0) return { score: 0, label: "", color: "", bg: "" };
  return { score, ...levels[idx] };
}

// Password requirement check
function getPasswordChecks(password: string) {
  return [
    { key: "length", met: password.length >= 8, label: "8+ characters" },
    { key: "upper", met: /[A-Z]/.test(password), label: "Uppercase letter" },
    { key: "number", met: /[0-9]/.test(password), label: "Number" },
    {
      key: "special",
      met: /[^A-Za-z0-9]/.test(password),
      label: "Special character",
    },
  ];
}

export default function SecuritySection({ initialData }: SecuritySectionProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const { showAlert } = useAlert();
  const { updatePass, toggle2FAStatus, isUpdating } = useSecurityLogic();
  const t = useTranslations("Dashboard");

  const [is2FAEnabled, setIs2FAEnabled] = useState(
    initialData?.twoFactorEnabled || false,
  );

  const isSocialLogin = initialData?.isSocialLogin || false;

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password strength
  const strength = useMemo(
    () => getPasswordStrength(passwords.new),
    [passwords.new],
  );
  const checks = useMemo(
    () => getPasswordChecks(passwords.new),
    [passwords.new],
  );
  const passwordsMatch =
    passwords.confirm.length > 0 && passwords.new === passwords.confirm;
  const passwordsMismatch =
    passwords.confirm.length > 0 && passwords.new !== passwords.confirm;

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSocialLogin && !passwords.current) {
      showAlert(t("settingsPage.currentPasswordRequired"), "warning");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      showAlert(t("settingsPage.passwordMismatch"), "error");
      return;
    }
    if (passwords.new.length < 8) {
      showAlert(t("settingsPage.passwordMinLength"), "warning");
      return;
    }

    const success = await updatePass(
      passwords.current,
      passwords.new,
      passwords.confirm,
    );

    if (success) {
      setPasswords({ current: "", new: "", confirm: "" });
    }
  };

  const toggle2FA = async () => {
    const newState = !is2FAEnabled;
    await toggle2FAStatus(newState);
    setIs2FAEnabled(newState);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Change Password Card */}
      <div
        className={clsx(
          "rounded-3xl overflow-hidden shadow-sm",
          isDark
            ? "bg-card border border-gray-800"
            : "bg-white border border-gray-100",
        )}
      >
        {/* Gradient Header Banner */}
        <div
          className={clsx(
            "relative px-8 pt-8 pb-6",
            isDark
              ? "bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-transparent"
              : "bg-gradient-to-br from-blue-50 via-indigo-50/60 to-transparent",
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={clsx(
                "p-3 rounded-2xl shrink-0",
                isDark
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-blue-100 text-blue-600",
              )}
            >
              <Lock className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[2em] font-bold text-shortblack leading-tight">
                {isSocialLogin
                  ? t("settingsPage.setPassword")
                  : t("settingsPage.changePassword")}
              </h2>
              <p className="text-[1.3em] text-grays mt-1 leading-relaxed">
                {isSocialLogin
                  ? t("settingsPage.socialLoginDesc")
                  : t("settingsPage.passwordDesc")}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 pb-8 pt-2">
          <form onSubmit={handleSavePassword} className="space-y-5">
            {/* Current Password */}
            {!isSocialLogin && (
              <div className="space-y-2">
                <label className="text-[1.35em] font-semibold text-shortblack flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-grays" />
                  {t("settingsPage.currentPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    name="current"
                    value={passwords.current}
                    onChange={handlePassChange}
                    className={clsx(
                      "w-full px-5 pr-12 py-4 rounded-2xl text-shortblack focus:outline-none focus:ring-2 focus:ring-bluelight/40 text-[1.5em] transition-all",
                      isDark
                        ? "bg-subcard border border-gray-700 focus:border-bluelight"
                        : "bg-slate-50 border border-gray-200 focus:border-bluelight focus:bg-white",
                    )}
                    placeholder="••••••••"
                    required={!isSocialLogin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className={clsx(
                      "absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors",
                      isDark ? "hover:bg-gray-700" : "hover:bg-gray-200",
                    )}
                    tabIndex={-1}
                  >
                    {showCurrent ? (
                      <EyeOff className="w-5 h-5 text-grays" />
                    ) : (
                      <Eye className="w-5 h-5 text-grays" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* New & Confirm Password - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* New Password */}
              <div className="space-y-2">
                <label className="text-[1.35em] font-semibold text-shortblack flex items-center gap-2">
                  <Lock className="w-4 h-4 text-grays" />
                  {t("settingsPage.newPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    name="new"
                    value={passwords.new}
                    onChange={handlePassChange}
                    className={clsx(
                      "w-full px-5 pr-12 py-4 rounded-2xl text-shortblack focus:outline-none focus:ring-2 focus:ring-bluelight/40 text-[1.5em] transition-all",
                      isDark
                        ? "bg-subcard border border-gray-700 focus:border-bluelight"
                        : "bg-slate-50 border border-gray-200 focus:border-bluelight focus:bg-white",
                    )}
                    placeholder={t("settingsPage.minChars")}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className={clsx(
                      "absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors",
                      isDark ? "hover:bg-gray-700" : "hover:bg-gray-200",
                    )}
                    tabIndex={-1}
                  >
                    {showNew ? (
                      <EyeOff className="w-5 h-5 text-grays" />
                    ) : (
                      <Eye className="w-5 h-5 text-grays" />
                    )}
                  </button>
                </div>

                {/* Strength Indicator */}
                {passwords.new.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2 pt-1"
                  >
                    {/* Strength Bar */}
                    <div className="flex items-center gap-3">
                      <div
                        className={clsx(
                          "flex-1 h-1.5 rounded-full overflow-hidden",
                          isDark ? "bg-gray-700" : "bg-gray-200",
                        )}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(strength.score / 5) * 100}%`,
                          }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className={clsx("h-full rounded-full", strength.bg)}
                        />
                      </div>
                      <span
                        className={clsx(
                          "text-[1.1em] font-medium whitespace-nowrap",
                          strength.color,
                        )}
                      >
                        {strength.label}
                      </span>
                    </div>

                    {/* Requirements Checklist */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {checks.map((check) => (
                        <div
                          key={check.key}
                          className="flex items-center gap-1.5"
                        >
                          {check.met ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-grays/40 shrink-0" />
                          )}
                          <span
                            className={clsx(
                              "text-[1.05em]",
                              check.met ? "text-emerald-500" : "text-grays/60",
                            )}
                          >
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[1.35em] font-semibold text-shortblack flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-grays" />
                  {t("settingsPage.confirmPassword")}
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handlePassChange}
                    className={clsx(
                      "w-full px-5 pr-12 py-4 rounded-2xl text-shortblack focus:outline-none focus:ring-2 text-[1.5em] transition-all",
                      passwordsMatch
                        ? "ring-2 ring-emerald-500/30 border-emerald-500"
                        : passwordsMismatch
                          ? "ring-2 ring-red-500/30 border-red-400"
                          : "",
                      isDark
                        ? "bg-subcard border border-gray-700 focus:border-bluelight focus:ring-bluelight/40"
                        : "bg-slate-50 border border-gray-200 focus:border-bluelight focus:ring-bluelight/40 focus:bg-white",
                    )}
                    placeholder={t("settingsPage.retypePassword")}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className={clsx(
                      "absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors",
                      isDark ? "hover:bg-gray-700" : "hover:bg-gray-200",
                    )}
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5 text-grays" />
                    ) : (
                      <Eye className="w-5 h-5 text-grays" />
                    )}
                  </button>
                </div>

                {/* Match / Mismatch indicator */}
                {passwords.confirm.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1.5 pt-1"
                  >
                    {passwordsMatch ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-[1.1em] text-emerald-500 font-medium">
                          Passwords match
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-[1.1em] text-red-400 font-medium">
                          Passwords don&apos;t match
                        </span>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-3 gap-4 flex-wrap">
              {/* Security tip */}
              <div
                className={clsx(
                  "flex items-start gap-2 text-[1.15em] rounded-xl px-4 py-3 max-w-md",
                  isDark
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-amber-50 text-amber-700",
                )}
              >
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="leading-snug">
                  {isSocialLogin
                    ? t("settingsPage.socialLoginDesc")
                    : t("settingsPage.passwordDesc")}
                </span>
              </div>

              <button
                type="submit"
                disabled={isUpdating || passwordsMismatch}
                className={clsx(
                  "bg-bluelight text-white px-8 py-4 rounded-2xl font-bold text-[1.5em] hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-3 shadow-lg shrink-0",
                  isDark ? "shadow-blue-900/30" : "shadow-blue-200",
                )}
              >
                {isUpdating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Shield className="w-5 h-5" />
                )}
                {isSocialLogin
                  ? t("settingsPage.createPassword")
                  : t("settingsPage.updatePassword")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
