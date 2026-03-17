// Server Component - No "use client" for SEO
import type { Metadata } from "next";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import PayoutRatesTable from "@/components/landing/PayoutRatesTable";
import { AnimateOnView } from "@/components/landing/AnimateWrappers";
import AuthCTA from "@/components/landing/AuthCTA";
import {
  Wallet,
  Building2,
  Coins,
  TrendingUp,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata.payoutRates");
  const locale = await getLocale();
  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(", "),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `https://shortlinkmu.com/${locale}/payout-rates`,
    },
    twitter: {
      title: t("ogTitle"),
      description: t("ogDescription"),
    },
    alternates: {
      canonical: `https://shortlinkmu.com/${locale}/payout-rates`,
      languages: {
        "id-ID": "https://shortlinkmu.com/id/payout-rates",
        "en-US": "https://shortlinkmu.com/en/payout-rates",
        "x-default": "https://shortlinkmu.com/en/payout-rates",
      },
    },
  };
}

const payoutRates = [
  { country: "Peru", cpm: 8.0, isoCode: "pe" }, // Tetap tertinggi karena data lu bagus di sini
  { country: "United States", cpm: 7.5, isoCode: "us" },
  { country: "United Kingdom", cpm: 7.0, isoCode: "gb" },
  { country: "Canada", cpm: 6.5, isoCode: "ca" },
  { country: "Singapore", cpm: 6.0, isoCode: "sg" },
  { country: "Indonesia", cpm: 5.5, isoCode: "id" }, // Masih sangat tinggi buat pasar lokal (rata-rata kompetitor cuma $3-4)
  { country: "Netherlands", cpm: 5.0, isoCode: "nl" },
  { country: "Austria", cpm: 5.0, isoCode: "at" },
  { country: "Germany", cpm: 4.5, isoCode: "de" },
  { country: "France", cpm: 4.5, isoCode: "fr" },
  { country: "Japan", cpm: 4.0, isoCode: "jp" },
  { country: "Mexico", cpm: 3.5, isoCode: "mx" },
  { country: "Brazil", cpm: 3.0, isoCode: "br" },
  { country: "India", cpm: 2.5, isoCode: "in" },
  { country: "Vietnam", cpm: 2.5, isoCode: "vn" },
  { country: "Thailand", cpm: 2.5, isoCode: "th" },
  { country: "Argentina", cpm: 2.0, isoCode: "ar" },
  { country: "Ecuador", cpm: 2.0, isoCode: "ec" },
  { country: "Philippines", cpm: 2.0, isoCode: "ph" },
  { country: "Others / Worldwide", cpm: 1.5, isoCode: "all" },
];

// Static data - rendered on server for SEO
// const payoutRates = [
//   { country: "United States", cpm: 8.0, isoCode: "us" },
//   { country: "United Kingdom", cpm: 7.5, isoCode: "gb" },
//   { country: "Australia", cpm: .0, isoCode: "au" },
//   { country: "Canada", cpm: 10.0, isoCode: "ca" },
//   { country: "Austria", cpm: 10.0, isoCode: "at" },
//   { country: "Indonesia", cpm: 9.6, isoCode: "id" },
//   { country: "Thailand", cpm: 8.0, isoCode: "th" },
//   { country: "Iceland", cpm: 8.0, isoCode: "is" },
//   { country: "India", cpm: 8.0, isoCode: "in" },
//   { country: "Greenland", cpm: 8.0, isoCode: "gl" },
//   { country: "Japan", cpm: 7.0, isoCode: "jp" },
//   { country: "Mexico", cpm: 7.0, isoCode: "mx" },
//   { country: "Germany", cpm: 6.0, isoCode: "de" },
//   { country: "Brazil", cpm: 6.0, isoCode: "br" },
//   { country: "Myanmar", cpm: 6.0, isoCode: "mm" },
//   { country: "Italy", cpm: 6.0, isoCode: "it" },
//   { country: "Norway", cpm: 6.0, isoCode: "no" },
//   { country: "France", cpm: 6.0, isoCode: "fr" },
//   { country: "Spain", cpm: 6.0, isoCode: "es" },
//   { country: "Switzerland", cpm: 6.0, isoCode: "ch" },
//   { country: "Pakistan", cpm: 5.0, isoCode: "pk" },
//   { country: "Nepal", cpm: 5.0, isoCode: "np" },
//   { country: "Saudi Arabia", cpm: 5.0, isoCode: "sa" },
//   { country: "United Arab Emirates", cpm: 5.0, isoCode: "ae" },
//   { country: "Philippines", cpm: 5.0, isoCode: "ph" },
//   { country: "Denmark", cpm: 5.0, isoCode: "dk" },
//   { country: "Vietnam", cpm: 5.0, isoCode: "vn" },
//   { country: "Malaysia", cpm: 4.0, isoCode: "my" },
//   { country: "Bangladesh", cpm: 4.0, isoCode: "bd" },
//   { country: "Others", cpm: 3.25, isoCode: "all" },
//   { country: "Singapore", cpm: 2.0, isoCode: "sg" },
//   { country: "Ukraine", cpm: 0.1, isoCode: "ua" },
//   { country: "Russia", cpm: 0.1, isoCode: "ru" },
// ];

export default async function PayoutRates() {
  const t = await getTranslations("Landing.PayoutRates");

  const paymentMethods = [
    {
      icon: Wallet,
      name: t("paymentMethods.digitalWallet"),
      minPayout: "$5.00",
      processingTime: "1-3 days",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: Building2,
      name: t("paymentMethods.bankTransfer"),
      minPayout: "$10.00",
      processingTime: "3-7 days",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: Coins,
      name: t("paymentMethods.cryptocurrency"),
      minPayout: "$25.00",
      processingTime: "1-2 days",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: t("features.dailyPayouts"),
    },
    {
      icon: Shield,
      title: t("features.securePayments"),
    },
    {
      icon: Clock,
      title: t("features.fastProcessing"),
    },
  ];

  return (
    <main className="min-h-screen bg-white font-poppins">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-50/60 to-transparent"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl"></div>
          <div className="absolute top-40 -left-20 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimateOnView>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bluelanding/10 text-bluelanding text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              {t("badge")}
            </div>
          </AnimateOnView>

          <AnimateOnView delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-800 mb-5 tracking-tight">
              {t("title1")}{" "}
              <span className="text-bluelanding">{t("title2")}</span>
            </h1>
          </AnimateOnView>

          <AnimateOnView delay={0.2}>
            <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-light font-figtree">
              {t("subtitle")}
            </p>
          </AnimateOnView>

          {/* Features pills */}
          <AnimateOnView delay={0.3}>
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm"
                >
                  <feature.icon className="w-4 h-4 text-bluelanding" />
                  <span className="text-sm text-slate-600 font-medium">
                    {feature.title}
                  </span>
                </div>
              ))}
            </div>
          </AnimateOnView>
        </div>
      </section>

      {/* Rates Table Section */}
      <section className="py-16 md:py-28">
        <PayoutRatesTable rates={payoutRates} />
      </section>

      {/* Payment Methods */}
      <section className="py-16 md:py-20 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnView className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 mb-4">
              {t("paymentMethods.title")}
            </h2>
            <p className="text-slate-500 text-base md:text-lg font-light font-figtree">
              {t("paymentMethods.subtitle")}
            </p>
          </AnimateOnView>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paymentMethods.map((method, index) => (
              <AnimateOnView key={method.name} delay={index * 0.1}>
                <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div
                    className={`w-14 h-14 ${method.iconBg} rounded-xl mx-auto mb-5 flex items-center justify-center ${method.iconColor}`}
                  >
                    <method.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">
                    {method.name}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-600">
                      {t("paymentMethods.minimum")}:{" "}
                      <span className="font-semibold text-slate-800">
                        {method.minPayout}
                      </span>
                    </p>
                    <p className="text-slate-500 font-figtree">
                      {t("paymentMethods.processing")}: {method.processingTime}
                    </p>
                  </div>
                </div>
              </AnimateOnView>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Client Component */}
      <AuthCTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}
