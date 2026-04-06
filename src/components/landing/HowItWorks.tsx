// Server Component - SEO friendly
import FeaturesClient from "./FeaturesClient";
import { HowItWorksAuthLink, HowItWorksStepCard } from "./HowItWorksClient";
import { getTranslations } from "next-intl/server";

export default async function HowItWorks() {
  const t = await getTranslations("Landing.HowItWorks");

  const steps = [
    {
      number: "01",
      title: t("step1.title"),
      desc: t("step1.desc"),
      color: "from-bluelanding to-blue-600",
      bgIcon: (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      ),
      content: (
        <div className="space-y-2.5">
          <div className="h-8 bg-white/10 rounded-lg flex items-center px-3 backdrop-blur-sm">
            <span className="text-xs text-white/70">john@mail.com</span>
          </div>
          <div className="h-8 bg-white/10 rounded-lg flex items-center px-3 backdrop-blur-sm">
            <span className="text-xs text-white/50">••••••••</span>
          </div>
          <div className="h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-xs font-medium text-bluelanding">
              {t("step1.button")}
            </span>
          </div>
        </div>
      ),
    },
    {
      number: "02",
      title: t("step2.title"),
      desc: t("step2.desc"),
      color: "from-bluelanding to-purple-600",
      bgIcon: (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
        </svg>
      ),
      content: (
        <div className="space-y-2.5">
          <div className="h-8 bg-white/10 rounded-lg flex items-center px-3 backdrop-blur-sm">
            <span className="text-[10px] text-white/60 truncate">
              https://example.com/long...
            </span>
          </div>
          <div className="h-8 bg-white/20 border border-white/30 rounded-lg flex items-center justify-between px-3">
            <span className="text-xs font-medium text-white">
              slmu.my.id/x7k
            </span>
            <svg
              className="w-4 h-4 text-green-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-6 bg-white/10 rounded flex items-center justify-center">
              <span className="text-[9px] text-white/60">
                2.4K {t("step2.clicks")}
              </span>
            </div>
            <div className="flex-1 h-6 bg-white/10 rounded flex items-center justify-center">
              <span className="text-[9px] text-white/60">$12.50</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: "03",
      title: t("step3.title"),
      desc: t("step3.desc"),
      color: "from-bluelanding to-fuchsia-600",
      bgIcon: (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
      ),
      content: (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">D</span>
              </div>
              <span className="text-[10px] text-white/80">DANA</span>
            </div>
            <span className="text-[9px] text-green-300">✓</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 10V7c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v3H4zm0 2v5c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5H4zm5 2h6v2H9v-2z" />
                </svg>
              </div>
              <span className="text-[10px] text-white/80">Bank Transfer</span>
            </div>
            <span className="text-[9px] text-green-300">✓</span>
          </div>
          <div className="h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-xs font-semibold text-bluelanding">
              {t("step3.withdraw")} $248.50
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white font-poppins">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - SSR rendered for SEO */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-16">
          <div>
            <FeaturesClient>
              <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-semibold tracking-tight mb-2 text-slate-800">
                {t("title")}{" "}
                <span className="text-bluelanding">{t("titleHighlight")}</span>
              </h2>
            </FeaturesClient>
            <FeaturesClient delay={0.1}>
              <p className="text-slate-500 text-base md:text-lg font-light">
                {t("subtitle")}
              </p>
            </FeaturesClient>
          </div>
          <HowItWorksAuthLink
            createAccountLabel={t("createAccount")}
            goToDashboardLabel={t("goToDashboard")}
          />
        </div>

        {/* Steps - Client component for animations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((step, idx) => (
            <HowItWorksStepCard key={idx} step={step} delay={idx * 0.15} />
          ))}
        </div>
      </div>
    </section>
  );
}
