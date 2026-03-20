// src/app/[locale]/(member)/levels/page.tsx
"use client";

import { useAlert } from "@/hooks/useAlert";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

// Components
import CurrentLevelHeader from "@/components/dashboard/levels/CurrentLevelHeader";
import LevelsGrid from "@/components/dashboard/levels/LevelsGrid";

// Hook
import { useLevels } from "@/hooks/useLevels";

export default function LevelsPage() {
  const { showAlert } = useAlert();
  const t = useTranslations("Dashboard");

  // Pake Hook yang udah kita benerin
  const { userProgress, levelsConfig, isLoading, error } = useLevels();

  // Tampilkan alert kalo ada error dari hook
  useEffect(() => {
    if (error) {
      showAlert(error, "error");
    }
  }, [error, showAlert]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-bluelight" />
      </div>
    );
  }

  // Render aman karena ada check if(isLoading) diatas
  // tapi kita double check userProgress biar gak null
  if (!userProgress) return null;

  return (
    <div className="lg:text-[10px] text-[8px] font-figtree pb-10">
      {/* Header Page */}
      {/* <div className="mb-8 text-center md:text-left">
        <h1 className="text-[2.5em] font-bold text-shortblack">
          {t("levelsPage.title")}
        </h1>
        <p className="text-[1.6em] text-grays mt-2">
          {t("levelsPage.description")}
        </p>
      </div> */}

      {/* 1. Header: Data Progress User */}
      <CurrentLevelHeader data={userProgress} />

      {/* 2. Grid: Config Level (Sekarang Dinamis dari API) */}
      <LevelsGrid
        currentLevel={userProgress.currentLevel}
        levels={levelsConfig} // <-- Pass data dinamis ke sini
      />
    </div>
  );
}
