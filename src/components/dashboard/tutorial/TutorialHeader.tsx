// src/components/dashboard/tutorial/TutorialHeader.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BookOpen, PlayCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

export default function TutorialHeader() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("Dashboard");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-200/50 dark:shadow-emerald-900/30 relative overflow-hidden font-figtree"
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="text-center lg:text-left space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm">
            <BookOpen className="w-4 h-4" />
            <span className="text-[1.3em] font-semibold">
              {t("tutorialPage.quickGuide")}
            </span>
          </div>
          <h1 className="text-[3em] font-bold leading-tight">
            {t("tutorialPage.title")}{" "}
            <span className="text-yellow-300">
              {t("tutorialPage.titleHighlight")}
            </span>
          </h1>
          <p className="text-[1.6em] text-emerald-100">
            {t("tutorialPage.subtitle")}
          </p>
        </div>

        {/* Decorative play icon */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
            <PlayCircle className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
