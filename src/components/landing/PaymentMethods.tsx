"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const paymentMethods = [
  { name: "PayPal", icon: "/payment-icons/paypal.png" },
  { name: "Dana", icon: "/payment-icons/dana.png" },
  { name: "OVO", icon: "/payment-icons/ovo.png" },
  { name: "ShopeePay", icon: "/payment-icons/shopeepay.png" },
  { name: "Gopay", icon: "/payment-icons/gopay.png" },
  { name: "Link Aja!", icon: "/payment-icons/linkaja.png" },
  { name: "Bank Transfer", icon: "/payment-icons/bank-transfer.png" },
];

// Duplicate for seamless loop
const marqueeItems = [...paymentMethods, ...paymentMethods];

export default function PaymentMethods() {
  const t = useTranslations("Landing.PaymentMethods");

  return (
    <section
      id="payment-methods"
      className="py-20 md:py-28 bg-white font-poppins overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-14">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-[2.75rem] font-semibold tracking-tight mb-2 text-slate-800"
            >
              {t("title")}{" "}
              <span className="text-bluelanding">{t("titleHighlight")}</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 text-base md:text-lg font-light max-w-lg"
            >
              {t("subtitle")}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-bluelanding hover:text-blue-600 font-medium text-sm transition-colors group"
            >
              {t("startEarning")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        {/* First Row - Left to Right */}
        <div className="flex mb-4 overflow-hidden">
          <motion.div
            className="flex gap-4 shrink-0"
            animate={{ x: [0, -50 * paymentMethods.length * 4] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {[...marqueeItems, ...marqueeItems].map((method, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-slate-200 transition-all cursor-pointer shrink-0"
              >
                <div className="w-10 h-10 relative bg-white rounded-lg p-1.5 shadow-sm">
                  <Image
                    src={method.icon}
                    alt={method.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">
                    {method.name}
                  </p>
                  <p className="text-[10px] text-green-600 font-medium">
                    {t("available")}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Second Row - Right to Left */}
        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-4 shrink-0"
            animate={{ x: [-50 * paymentMethods.length * 4, 0] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {[...marqueeItems, ...marqueeItems].map((method, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-slate-200 transition-all cursor-pointer shrink-0"
              >
                <div className="w-10 h-10 relative bg-white rounded-lg p-1.5 shadow-sm">
                  <Image
                    src={method.icon}
                    alt={method.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">
                    {method.name}
                  </p>
                  <p className="text-[10px] text-green-600 font-medium">
                    {t("available")}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
