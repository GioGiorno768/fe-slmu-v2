// src/components/dashboard/DashboardFooter.tsx
"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Send, Youtube } from "lucide-react";

export default function DashboardFooter() {
  const t = useTranslations("Dashboard");

  // Link-link dari screenshot
  const footerLinks = [
    { label: t("terms"), href: "/terms-of-service" },
    { label: t("privacy"), href: "/privacy-policy" },
    { label: t("about"), href: "/about" },
    { label: t("contact"), href: "/contact" },
    { label: t("reportAbuse"), href: "/report-abuse" },
  ];

  // Ikon sosial media
  const socialIcons = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/shortlinkmu/", // <-- Ganti nomor WA lu
      // Pake class icon dari globals.css
      icon: <span className="mynaui--instagram w-6 h-6 bg-grays" />,
    },
    {
      label: "TikTok",
      href: "https://www.tiktok.com/@shortlinkmu", // <-- Ganti username TG lu
      icon: <span className="ic--sharp-tiktok w-5 h-5 bg-grays" />,
    },
    {
      label: "YouTube",
      href: "https://youtube.com/@shortlinkmu", // <-- Ganti link YT lu
      icon: <Youtube className="w-6 h-6 text-grays" />,
    },
  ];

  return (
    <footer className="mt-8 mb-4 lg:text-[10px] text-[8px] font-figtree">
      {/* Ini container card-nya, persis kayak di screenshot */}
      <div
        className="bg-card w-full py-4 px-6 md:py-5 md:px-8
                    rounded-xl shadow-sm shadow-slate-500/50 
                    flex flex-col md:flex-row items-center justify-between gap-4"
      >
        {/* Kiri: Link Teks */}
        <div className="flex items-center gap-x-4 md:gap-x-6 flex-wrap justify-center">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[1.4em] font-medium text-grays hover:text-bluelight transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Kanan: Ikon Sosial Media */}
        <div className="flex items-center gap-3">
          {socialIcons.map((social) => (
            <Link
              key={social.label}
              href={social.href}
              title={social.label}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-blues 
                             flex items-center justify-center 
                             hover:bg-blue-dashboard 
                             hover:scale-110 transition-all"
            >
              {social.icon}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
