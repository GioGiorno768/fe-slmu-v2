// src/app/[locale]/(member)/tutorial/page.tsx
"use client";

import TutorialHeader from "@/components/dashboard/tutorial/TutorialHeader";
import TutorialVideoSection from "@/components/dashboard/tutorial/TutorialVideoSection";
import TutorialSteps from "@/components/dashboard/tutorial/TutorialSteps";

export default function TutorialPage() {
  return (
    <div className="lg:text-[10px] text-[9px] font-figtree space-y-8 pb-10">
      {/* 1. Header Gradient */}
      <TutorialHeader />

      {/* 2. Video Tutorial Section */}
      <TutorialVideoSection />

      {/* 3. Quick Start Steps */}
      <TutorialSteps />
    </div>
  );
}
