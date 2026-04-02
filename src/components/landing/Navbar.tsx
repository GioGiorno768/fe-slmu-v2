"use client";

import { usePathname, useRouter, Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition, useEffect } from "react";
import { Link2, X } from "lucide-react";
import authService from "@/services/authService";
import Modal from "@/components/common/Modal";

export default function Navbar() {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dashboardPath, setDashboardPath] = useState("/dashboard");
  const [isOpen, setIsOpen] = useState(false);

  // Registration disabled state
  const [isRegistrationDisabled, setIsRegistrationDisabled] = useState(false);
  const [isLoginDisabled, setIsLoginDisabled] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Section links for navigation - now using translations
  const navLinks = [
    { name: t("features"), href: "/#features" },
    { name: t("howItWorks"), href: "/#how-it-works" },
    { name: t("payment"), href: "/#payment-methods" },
    { name: t("faq"), href: "/#faq" },
  ];

  // Check auth status
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    if (authService.isAuthenticated()) {
      setDashboardPath(authService.getRedirectPath());
    }
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch access settings
  useEffect(() => {
    const fetchAccessSettings = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/settings/access`,
        );
        if (response.ok) {
          const data = await response.json();
          setIsRegistrationDisabled(data.data?.disable_registration ?? false);
          setIsLoginDisabled(data.data?.disable_login ?? false);
        }
      } catch (error) {
        console.error("Failed to fetch access settings:", error);
      }
    };
    fetchAccessSettings();
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleRegisterClick = () => {
    if (isRegistrationDisabled) {
      setShowRegisterModal(true);
    } else {
      router.push("/register");
    }
    setIsOpen(false);
  };

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

  const scrollToSection = (href: string) => {
    setIsOpen(false);
    const sectionId = href.replace("/#", "");

    // Check if we're on the homepage
    if (pathname === "/" || pathname === "") {
      // We're on homepage, just scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // We're on a different page, navigate to homepage with hash
      router.push(`/#${sectionId}`);
    }
  };

  return (
    <>
      <nav
        className={`fixed w-full font-poppins transition-all duration-300 z-50 ${
          isScrolled || isOpen
            ? "bg-white shadow-sm"
            : "bg-white/50 backdrop-blur-md"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main navbar row */}
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-bluelanding flex items-center justify-center">
                <svg
                  width="20"
                  height="22"
                  viewBox="0 0 153 171"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M118.483 70.3298L117.697 70.6345C111.006 73.226 104.496 66.4884 107.315 59.891C111.325 52.0061 129.842 41.3239 115.527 28.1765C105.29 18.774 84.2807 35.59 70.7758 51.3724C53.2467 71.8577 62.3024 92.4722 79.3197 96.6568C91.5741 99.6702 69.2325 110.525 52.6375 93.8808C32.554 73.7378 51.6333 44.2901 64.9336 30.6665C78.2338 17.0428 107.832 -5.52019 129.749 16.8186C151.004 38.4832 132.426 62.1135 119.611 69.7866C119.25 70.003 118.876 70.1776 118.483 70.3298Z"
                    fill="currentColor"
                  />
                  <path
                    d="M34.1459 99.7246L34.9326 99.4198C41.6228 96.8283 48.1333 103.566 45.3139 110.163C41.3044 118.048 22.7874 128.73 37.1018 141.878C47.3388 151.28 68.3485 134.464 81.8533 118.682C99.3824 98.1966 90.3267 77.5822 73.3094 73.3975C61.055 70.3841 83.3967 59.5295 99.9916 76.1735C120.075 96.3165 100.996 125.764 87.6956 139.388C74.3953 153.012 44.7969 175.575 22.8803 153.236C1.62511 131.571 20.2033 107.941 33.0181 100.268C33.3795 100.051 33.7531 99.8767 34.1459 99.7246Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold text-slate-800">
                Shortlinkmu
              </span>
            </Link>

            {/* Desktop Navigation - Center */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href as any}
                  className="text-sm text-slate-600 hover:text-bluelanding transition-colors font-medium"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/payout-rates"
                className="text-sm text-slate-600 hover:text-bluelanding transition-colors font-medium"
              >
                {t("payoutRates")}
              </Link>
            </div>

            {/* Desktop Right Side */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Language Toggle */}
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => switchLanguage("en")}
                  disabled={isPending}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    locale === "en"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => switchLanguage("id")}
                  disabled={isPending}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    locale === "id"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  ID
                </button>
              </div>

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <Link
                  href={dashboardPath as any}
                  className="text-sm font-medium bg-bluelanding hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg transition-colors"
                >
                  {t("dashboard")}
                </Link>
              ) : !isLoginDisabled ? (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-slate-700 hover:text-bluelanding px-4 py-2 transition-colors"
                  >
                    {t("login")}
                  </Link>
                  <button
                    onClick={handleRegisterClick}
                    className="text-sm font-medium bg-bluelanding hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg transition-colors"
                  >
                    {t("register")}
                  </button>
                </>
              ) : null}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Collapse style */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white border-t border-slate-100 px-4 py-6 max-h-[80vh] overflow-y-auto">
            {/* Navigation Links */}
            <div className=" mb-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href as any}
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-left py-3 text-base font-medium text-slate-700 hover:text-bluelanding transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/payout-rates"
                onClick={() => setIsOpen(false)}
                className="block py-3 text-base font-medium text-slate-700 hover:text-bluelanding transition-colors"
              >
                {t("payoutRates")}
              </Link>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 my-4"></div>

            {/* Language Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => switchLanguage("en")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  locale === "en"
                    ? "bg-bluelanding text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                English
              </button>
              <button
                onClick={() => switchLanguage("id")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  locale === "id"
                    ? "bg-bluelanding shadow-lg shadow-blue-500/50 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Indonesia
              </button>
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <Link
                href={dashboardPath as any}
                onClick={() => setIsOpen(false)}
                className="block w-full text-center py-3 text-base font-medium bg-bluelanding shadow-lg shadow-blue-500/50 hover:bg-blue-600 text-white rounded-xl transition-colors"
              >
                {t("dashboard")}
              </Link>
            ) : !isLoginDisabled ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-3 text-base font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  {t("login")}
                </Link>
                <button
                  onClick={handleRegisterClick}
                  className="w-full py-3 text-base font-medium bg-bluelanding hover:bg-blue-600 shadow-lg shadow-blue-500/50 text-white rounded-xl transition-colors"
                >
                  {t("register")}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Mobile menu backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Registration Disabled Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title={t("registrationClosed")}
        message={t("registrationClosedMessage")}
        type="warning"
        buttonLabel={t("backToHome")}
        onButtonClick={() => {
          setShowRegisterModal(false);
          router.push("/");
        }}
      />
    </>
  );
}
