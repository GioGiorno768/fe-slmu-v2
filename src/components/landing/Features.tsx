// Server Component - SEO friendly
import {
  TrendingUp,
  Shield,
  DollarSign,
  Wallet,
  Users,
  Award,
  Settings,
  Zap,
  Headphones,
  Sparkles,
} from "lucide-react";
import FeaturesClient from "./FeaturesClient";
import { getTranslations } from "next-intl/server";

const FeatureCard = ({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) => (
  <div className="group p-6 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-all hover:shadow-lg hover:shadow-slate-200/50 font-figtree h-full">
    <div className="size-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:bg-bluelanding group-hover:border-bluelanding group-hover:text-white transition-all text-slate-600">
      <Icon className="w-5 h-5" strokeWidth={1.5} />
    </div>
    <h3 className="text-base font-semibold mb-2 text-slate-800">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

export default async function Features() {
  const t = await getTranslations("Landing.Features");

  const features = [
    {
      icon: TrendingUp,
      title: t("highCpm.title"),
      desc: t("highCpm.desc"),
    },
    // {
    //   icon: Headphones,
    //   title: t("support.title"),
    //   desc: t("support.desc"),
    // },
    {
      icon: Award,
      title: t("levels.title"),
      desc: t("levels.desc"),
    },
    {
      icon: Settings,
      title: t("customization.title"),
      desc: t("customization.desc"),
    },
    {
      icon: Zap,
      title: t("multiAds.title"),
      desc: t("multiAds.desc"),
    },
    {
      icon: Sparkles,
      title: t("cleanUI.title"),
      desc: t("cleanUI.desc"),
    },
    {
      icon: Wallet,
      title: t("payouts.title"),
      desc: t("payouts.desc"),
    },
    {
      icon: Users,
      title: t("referral.title"),
      desc: t("referral.desc"),
    },
    {
      icon: Shield,
      title: t("antiFraud.title"),
      desc: t("antiFraud.desc"),
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-white font-poppins">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Clean style like Hero */}
        <div className="text-center mb-14 md:mb-16">
          <FeaturesClient>
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-semibold tracking-tight mb-4 text-slate-800">
              {t("title")}{" "}
              <span className="text-bluelanding">{t("titleHighlight")}</span>
            </h2>
          </FeaturesClient>
          <FeaturesClient delay={0.1}>
            <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto leading-relaxed font-light">
              {t("subtitle")}
            </p>
          </FeaturesClient>
        </div>

        {/* Cards Grid - Smaller, cleaner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {features.map((feature, idx) => (
            <FeaturesClient key={idx} delay={idx * 0.03}>
              <FeatureCard {...feature} />
            </FeaturesClient>
          ))}
        </div>
      </div>
    </section>
  );
}
