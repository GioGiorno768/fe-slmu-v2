"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Link as LinkIcon,
  ClipboardCopy,
  Check,
  Share2,
  Loader2,
  OctagonAlert,
  ArrowRight,
  X,
  UserPlus,
  TriangleAlert,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  Plus,
} from "lucide-react";
import { useAlert } from "@/hooks/useAlert";
import * as linkService from "@/services/linkService";
import { isAuthenticated } from "@/services/authService";
import { Link } from "@/i18n/routing";
import Toast from "@/components/common/Toast";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";

export default function HeroShortLink() {
  const t = useTranslations("Landing.HeroShortLink");
  const { showAlert } = useAlert();
  const [urlInput, setUrlInput] = useState("");
  const [aliasInput, setAliasInput] = useState("");
  const [createdLinks, setCreatedLinks] = useState<string[]>([]);
  const [currentLinkIndex, setCurrentLinkIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showAliasField, setShowAliasField] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    show: false,
    message: "",
    type: "success",
  });
  const [validationErrors, setValidationErrors] = useState<{
    alias?: string;
  }>({});

  const validateAlias = (value: string) => {
    const regex = /^[a-zA-Z0-9-_]+$/;
    if (value && !regex.test(value)) {
      setValidationErrors((prev) => ({
        ...prev,
        alias: t("aliasOnlyAlphanumeric"),
      }));
    } else if (value && value.length > 20) {
      setValidationErrors((prev) => ({
        ...prev,
        alias: t("aliasMaxLength"),
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, alias: undefined }));
    }
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning",
  ) => {
    setToast({ show: true, message, type });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!urlInput) {
      showToast(t("pleaseEnterUrl"), "error");
      return;
    }

    if (validationErrors.alias) {
      showToast(validationErrors.alias, "error");
      return;
    }

    setIsLoading(true);
    setError("");
    setIsCopied(false);
    setShowErrorModal(false);

    try {
      let shortUrl: string;

      if (isAuthenticated()) {
        // Authenticated user → use createLink (no guest rate limit)
        const data = await linkService.createLink({
          url: urlInput,
          alias: aliasInput || undefined,
          adsLevel: "low", // Default ad level for landing page
        });
        shortUrl = data.shortUrl;
      } else {
        // Guest user → use createGuestLink
        const data = await linkService.createGuestLink(
          urlInput,
          aliasInput || undefined,
        );
        shortUrl = data.shortUrl;
      }

      // Add to history
      setCreatedLinks((prev) => [...prev, shortUrl]);
      setCurrentLinkIndex(createdLinks.length); // Point to the new link
      setShowForm(false);
      setUrlInput("");
      setAliasInput("");
      setShowAliasField(false);
    } catch (err: any) {
      let errorMessage = "Something went wrong. Please try again.";

      if (typeof err === "string") {
        errorMessage = err;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      if (err.errors?.alias) {
        showToast(err.errors.alias[0], "error");
      } else {
        const lowerError = errorMessage.toLowerCase();
        const isModalError =
          lowerError.includes("limit") ||
          lowerError.includes("disabled") ||
          lowerError.includes("register");

        if (!isModalError) {
          showToast(errorMessage, "error");
        }

        if (isModalError) {
          setShowErrorModal(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentLink =
    currentLinkIndex !== null ? createdLinks[currentLinkIndex] : null;

  const handleCopy = () => {
    if (!currentLink) return;
    navigator.clipboard.writeText(`${currentLink}`);
    setIsCopied(true);
    showToast(t("copiedToClipboard"), "success");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!currentLink) return;
    const protocol = window.location.protocol;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Shortlinkmu Link",
          text: `Check out my link: ${currentLink}`,
          url: `${protocol}//${currentLink}`,
        });
      } catch (err) {
        console.error("Failed to share:", err);
      }
    } else {
      handleCopy();
      showAlert(t("browserNoShare"), "info", "Info");
    }
  };

  const handleCreateNew = () => {
    setShowForm(true);
    setIsCopied(false);
  };

  const handleViewPrevious = () => {
    if (createdLinks.length > 0) {
      setCurrentLinkIndex(createdLinks.length - 1);
      setShowForm(false);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {showForm ? (
          // Form State
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* URL Input - Responsive */}
              <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 sm:p-2 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 focus-within:border-bluelanding focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                <div className="flex items-center flex-1 gap-2">
                  <div className="pl-2 sm:pl-3 text-slate-400">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 py-3 px-1 sm:px-2 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-[15px] min-w-0"
                    placeholder={t("inputPlaceholder")}
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-bluelanding hover:bg-blue-600 text-white font-medium rounded-xl transition-all disabled:opacity-60 group shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{t("shortenButton")}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              {/* Alias Toggle & Input */}
              {!showAliasField ? (
                <button
                  type="button"
                  onClick={() => setShowAliasField(true)}
                  className="self-start text-sm text-slate-400 hover:text-bluelanding transition-colors flex items-center gap-1 pl-1"
                >
                  <span>{t("addAlias")}</span>
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="relative"
                >
                  <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="pl-2 sm:pl-3 text-sm text-slate-400 whitespace-nowrap">
                      slmu.my.id/
                    </span>
                    <input
                      type="text"
                      value={aliasInput}
                      onChange={(e) => {
                        setAliasInput(e.target.value);
                        validateAlias(e.target.value);
                      }}
                      className={`flex-1 py-2 px-1 sm:px-2 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-[15px] min-w-0 ${
                        validationErrors.alias ? "text-red-500" : ""
                      }`}
                      placeholder={t("aliasPlaceholder")}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowAliasField(false);
                        setAliasInput("");
                        setValidationErrors({});
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {validationErrors.alias && (
                    <p className="mt-1 text-xs text-red-500 pl-2 flex items-center gap-1">
                      <TriangleAlert className="w-3 h-3" />
                      {validationErrors.alias}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Show previous link button if exists */}
              {createdLinks.length > 0 && (
                <button
                  type="button"
                  onClick={handleViewPrevious}
                  className="self-start text-sm text-bluelanding hover:text-blue-600 transition-colors flex items-center gap-1 pl-1"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>{t("viewPrevious")}</span>
                </button>
              )}
            </form>
          </motion.div>
        ) : (
          // Result State - Modern Card
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-bluelanding to-blue-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg shadow-blue-500/20">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-white/90">
                    {t("linkCreated")}
                  </span>
                </div>
                <button
                  onClick={handleCreateNew}
                  className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span className="hidden sm:inline">{t("createAnother")}</span>
                  <span className="sm:hidden">{t("new")}</span>
                </button>
              </div>

              {/* Link Display */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-4">
                <p className="text-xs text-white/60 mb-1">
                  {t("yourShortLink")}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Link
                    href={`${currentLink}`}
                    target="_blank"
                    rel="noopener"
                    className="text-sm sm:text-lg font-semibold text-white hover:text-white/90 truncate flex items-center gap-2 group min-w-0"
                  >
                    <span className="truncate text-center">{currentLink}</span>
                    <ExternalLink className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
              </div>

              {/* Link Counter */}
              {createdLinks.length > 1 && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <button
                    onClick={() =>
                      setCurrentLinkIndex((prev) =>
                        Math.max(0, (prev || 0) - 1),
                      )
                    }
                    disabled={currentLinkIndex === 0}
                    className="p-1 text-white/50 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-white/60">
                    {(currentLinkIndex || 0) + 1} {t("of")}{" "}
                    {createdLinks.length}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentLinkIndex((prev) =>
                        Math.min(createdLinks.length - 1, (prev || 0) + 1),
                      )
                    }
                    disabled={currentLinkIndex === createdLinks.length - 1}
                    className="p-1 text-white/50 hover:text-white disabled:opacity-30 transition-colors rotate-180"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                    isCopied
                      ? "bg-green-500 text-white"
                      : "bg-white text-bluelanding hover:bg-white/90"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t("copied")}</span>
                    </>
                  ) : (
                    <>
                      <ClipboardCopy className="w-4 h-4" />
                      <span>{t("copyLink")}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                  title={t("share")}
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Modal — rendered via Portal to escape stacking context */}
      {showErrorModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
            onClick={() => setShowErrorModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowErrorModal(false)}
                className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <OctagonAlert className="w-6 h-6 text-red-500" />
              </div>

              <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                {t("limitReached")}
              </h3>
              <p className="text-gray-500 text-center text-sm mb-5 leading-relaxed">
                {error}
              </p>

              <div className="flex flex-col gap-2">
                <Link
                  href="/register"
                  className="w-full py-2.5 px-4 bg-bluelanding text-white font-medium text-center rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  {t("signUpFree")}
                </Link>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="w-full py-2.5 px-4 text-gray-500 font-medium text-center hover:text-gray-700 transition-colors text-sm"
                >
                  {t("close")}
                </button>
              </div>
            </motion.div>
          </div>,
          document.body,
        )}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
