// Auth Branding Component - Modern design with feature slider
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, TrendingUp, Zap, Globe, Wallet } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface AuthBrandingProps {
  title?: string;
  subtitle?: string;
  accentColor?: "blue" | "purple";
}

export default function AuthBranding({
  accentColor = "blue",
}: AuthBrandingProps) {
  const t = useTranslations("Auth");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      icon: TrendingUp,
      badge: t("branding.slide1.badge"),
      title: t("branding.slide1.title"),
      description: t("branding.slide1.desc"),
    },
    {
      icon: Zap,
      badge: t("branding.slide2.badge"),
      title: t("branding.slide2.title"),
      description: t("branding.slide2.desc"),
    },
    {
      icon: Wallet,
      badge: t("branding.slide3.badge"),
      title: t("branding.slide3.title"),
      description: t("branding.slide3.desc"),
    },
    // {
    //   icon: Globe,
    //   badge: t("branding.slide4.badge"),
    //   title: t("branding.slide4.title"),
    //   description: t("branding.slide4.desc"),
    // },
  ];

  const colorConfig = {
    blue: {
      gradient: "from-bluelanding via-bluelanding to-blue-500",
      badgeBg: "bg-white/20",
      backText: "text-blue-200 hover:text-white",
      dotActive: "bg-white",
      dotInactive: "bg-white/30",
    },
    purple: {
      gradient: "from-purple-600 to-bluelanding",
      badgeBg: "bg-white/20",
      backText: "text-purple-200 hover:text-white",
      dotActive: "bg-white",
      dotInactive: "bg-white/30",
    },
  };

  const colors = colorConfig[accentColor];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Auto-rotate slides
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(nextSlide, 4500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`hidden lg:flex bg-bluelanding items-center justify-center relative overflow-hidden`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Back button */}
      <Link
        href="/"
        className={`absolute top-8 left-8 flex items-center gap-2 ${colors.backText} transition-colors group z-20`}
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-semibold">{t("backToHome")}</span>
      </Link>

      {/* Background decorations - simplified */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Decorative icon - right side */}
      <div className="absolute right-8 bottom-20 opacity-10">
        <CurrentIcon className="w-48 h-48 text-white" strokeWidth={2} />
      </div>

      {/* Main content */}
      <div className="relative z-10 px-12 max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <svg
              width="28"
              height="32"
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
        </motion.div>

        {/* Slider content */}
        <div className="min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Badge */}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.badgeBg} backdrop-blur-sm mb-4`}
              >
                <CurrentIcon className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">
                  {slides[currentSlide].badge}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {slides[currentSlide].title}
              </h1>

              {/* Description */}
              <p className="text-lg text-white/70 leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination dots - iOS style (pill for active) */}
        <div className="flex items-center gap-2 mt-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? `w-6 ${colors.dotActive}`
                  : `w-2 ${colors.dotInactive} hover:bg-white/50`
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
