// src/components/dashboard/tutorial/TutorialSteps.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  UserPlus,
  Link2,
  Share2,
  BanknoteArrowDown,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { useTranslations } from "next-intl";

export default function TutorialSteps() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("Dashboard");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const steps = [
    {
      icon: UserPlus,
      title: t("tutorialPage.step1Title"),
      desc: t("tutorialPage.step1Desc"),
      gradient: "from-blue-500 to-indigo-600",
      shadowLight: "shadow-blue-200",
      shadowDark: "shadow-blue-900/40",
      number: "01",
    },
    {
      icon: Link2,
      title: t("tutorialPage.step2Title"),
      desc: t("tutorialPage.step2Desc"),
      gradient: "from-purple-500 to-pink-600",
      shadowLight: "shadow-purple-200",
      shadowDark: "shadow-purple-900/40",
      number: "02",
    },
    {
      icon: Share2,
      title: t("tutorialPage.step3Title"),
      desc: t("tutorialPage.step3Desc"),
      gradient: "from-emerald-500 to-teal-600",
      shadowLight: "shadow-emerald-200",
      shadowDark: "shadow-emerald-900/40",
      number: "03",
    },
    {
      icon: BanknoteArrowDown,
      title: t("tutorialPage.step4Title"),
      desc: t("tutorialPage.step4Desc"),
      gradient: "from-amber-500 to-orange-600",
      shadowLight: "shadow-amber-200",
      shadowDark: "shadow-amber-900/40",
      number: "04",
    },
  ];

  return (
    <div className="py-10 font-figtree">
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={clsx(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4",
            isDark ? "bg-amber-500/20" : "bg-white shadow-sm",
          )}
        >
          <Sparkles
            className={clsx(
              "w-4 h-4",
              isDark ? "text-amber-400" : "text-amber-600",
            )}
          />
          <span
            className={clsx(
              "text-[1.4em] font-semibold",
              isDark ? "text-amber-400" : "text-amber-600",
            )}
          >
            {t("tutorialPage.quickGuide")}
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="text-[2.4em] font-bold text-shortblack"
        >
          {t("tutorialPage.quickGuide")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-[1.4em] text-grays mt-2"
        >
          {t("tutorialPage.quickGuideDesc")}
        </motion.p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {/* Connection line (desktop only) */}
        <div
          className={clsx(
            "hidden lg:block absolute top-1/2 left-[12%] right-[12%] h-0.5 -translate-y-1/2 z-0",
            isDark
              ? "bg-gradient-to-r from-blue-500/30 via-purple-500/30 via-emerald-500/30 to-amber-500/30"
              : "bg-gradient-to-r from-blue-200 via-purple-200 via-emerald-200 to-amber-200",
          )}
        />

        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.3 }}
            className="relative z-10 group"
          >
            <div
              className={clsx(
                "bg-card p-8 rounded-3xl text-center shadow-sm border border-gray-100 dark:border-gray-dashboard/30 hover:-translate-y-2 transition-all duration-200 h-full",
                isDark ? "hover:shadow-lg" : "hover:shadow-xl",
              )}
            >
              {/* Step number badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span
                  className={clsx(
                    "inline-block px-4 py-1 rounded-full text-[1.1em] font-bold text-white bg-gradient-to-r shadow-lg",
                    step.gradient,
                    isDark ? step.shadowDark : step.shadowLight,
                  )}
                >
                  Step {step.number}
                </span>
              </div>

              {/* Icon */}
              <div
                className={clsx(
                  "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5 mt-4 shadow-lg bg-gradient-to-br",
                  "group-hover:scale-105 transition-transform duration-200",
                  step.gradient,
                  isDark ? step.shadowDark : step.shadowLight,
                )}
              >
                <step.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-[1.6em] font-bold text-shortblack mb-1">
                {step.title}
              </h3>
              <p className="text-[1.3em] text-grays leading-relaxed">
                {step.desc}
              </p>

              {/* Arrow indicator (mobile only) */}
              {i < steps.length - 1 && (
                <div className="lg:hidden flex justify-center mt-5">
                  <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 rotate-90" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Pro Tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="text-center mt-10"
      >
        <p className="text-[1.3em] text-grays">
          {t("tutorialPage.proTip")}
        </p>
      </motion.div>
    </div>
  );
}
