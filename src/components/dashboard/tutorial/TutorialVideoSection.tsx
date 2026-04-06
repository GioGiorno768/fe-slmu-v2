// src/components/dashboard/tutorial/TutorialVideoSection.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, MonitorPlay, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { useTranslations } from "next-intl";

// Dummy YouTube video IDs — ganti dengan ID asli nanti
const VIDEOS = [
  {
    id: "naz0-szzYXk", // Dummy — ganti nanti
    titleKey: "video1Title",
    descKey: "video1Desc",
    featured: true,
  },
  {
    id: "naz0-szzYXk", // Dummy — ganti nanti
    titleKey: "video2Title",
    descKey: "video2Desc",
    featured: false,
  },
  {
    id: "naz0-szzYXk", // Dummy — ganti nanti
    titleKey: "video3Title",
    descKey: "video3Desc",
    featured: false,
  },
  {
    id: "naz0-szzYXk", // Dummy — ganti nanti
    titleKey: "video4Title",
    descKey: "video4Desc",
    featured: false,
  },
];

export default function TutorialVideoSection() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("Dashboard");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const featured = VIDEOS[0];
  const grid = VIDEOS.slice(1);

  return (
    <div className="font-figtree">
      {/* Section Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={clsx(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4",
            isDark ? "bg-emerald-500/20" : "bg-white shadow-sm",
          )}
        >
          <MonitorPlay
            className={clsx(
              "w-4 h-4",
              isDark ? "text-emerald-400" : "text-emerald-600",
            )}
          />
          <span
            className={clsx(
              "text-[1.4em] font-semibold",
              isDark ? "text-emerald-400" : "text-emerald-600",
            )}
          >
            {t("tutorialPage.videoSection")}
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="text-[2.4em] font-bold text-shortblack"
        >
          {t("tutorialPage.videoSection")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-[1.4em] text-grays mt-2"
        >
          {t("tutorialPage.videoSectionDesc")}
        </motion.p>
      </div>

      {/* Featured Video */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="mb-6"
      >
        <div
          className={clsx(
            "bg-card rounded-3xl shadow-sm border overflow-hidden group",
            isDark
              ? "border-gray-dashboard/30 hover:shadow-lg"
              : "border-gray-100 hover:shadow-xl",
            "transition-shadow duration-300",
          )}
        >
          {/* Video Iframe */}
          <div className="relative w-full aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${featured.id}`}
              title={t(`tutorialPage.${featured.titleKey}`)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full rounded-t-3xl"
            />
          </div>

          {/* Video Info */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={clsx(
                  "px-3 py-1 rounded-full text-[1.1em] font-bold text-white",
                  "bg-gradient-to-r from-emerald-500 to-teal-600",
                )}
              >
                {t("tutorialPage.featuredBadge")}
              </span>
            </div>
            <h3 className="text-[1.8em] font-bold text-shortblack mb-1">
              {t(`tutorialPage.${featured.titleKey}`)}
            </h3>
            <p className="text-[1.4em] text-grays">
              {t(`tutorialPage.${featured.descKey}`)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Grid Videos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {grid.map((video, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
          >
            <div
              className={clsx(
                "bg-card rounded-2xl shadow-sm border overflow-hidden group h-full",
                isDark
                  ? "border-gray-dashboard/30 hover:shadow-lg"
                  : "border-gray-100 hover:shadow-xl",
                "transition-all duration-300 hover:-translate-y-1",
              )}
            >
              {/* Video Iframe */}
              <div className="relative w-full aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={t(`tutorialPage.${video.titleKey}`)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>

              {/* Video Info */}
              <div className="p-5">
                <h4 className="text-[1.6em] font-bold text-shortblack mb-1">
                  {t(`tutorialPage.${video.titleKey}`)}
                </h4>
                <p className="text-[1.3em] text-grays leading-relaxed">
                  {t(`tutorialPage.${video.descKey}`)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
