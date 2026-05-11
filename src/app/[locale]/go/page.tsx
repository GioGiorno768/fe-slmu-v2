"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  ArrowRight,
  Globe,
  ScanEye,
  CircleCheckBig,
  ExternalLink,
  Link2,
  Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/routing";

interface SessionData {
  code: string;
  token: string;
  step: number;
  max_steps: number;
  ad_level: number;
  is_guest: boolean;
}

const AD_REDIRECT_URL =
  "https://www.effectivegatecpm.com/maa3nwdixq?key=4138ad4277e9895bed2bddfe7239d368";

function GoPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("s");

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [destinationUrl, setDestinationUrl] = useState<string>("");
  const [status, setStatus] = useState<
    "loading" | "ready" | "redirecting" | "error"
  >("loading");
  const [countdown, setCountdown] = useState(3);

  // Fetch session data on mount
  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    const fetchSession = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/links/session/${sessionId}`,
        );
        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          return;
        }

        setSessionData(data.data);

        // Extract destination domain for preview
        try {
          const url = new URL(data.data.code ? `https://placeholder.com` : "");
          setDestinationUrl(data.data.code || "");
        } catch {
          setDestinationUrl(data.data.code || "");
        }
      } catch (err) {
        console.error("Error fetching session:", err);
        setStatus("error");
      }
    };

    fetchSession();
  }, [sessionId]);

  // Countdown timer — starts when session data is loaded
  useEffect(() => {
    if (!sessionData) return;
    if (countdown <= 0) {
      setStatus("ready");
      return;
    }

    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, sessionData]);

  const handleContinue = useCallback(async () => {
    if (!sessionData) {
      setStatus("error");
      return;
    }

    setStatus("redirecting");

    try {
      // Call continue endpoint to get destination URL
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/links/${sessionData.code}/continue`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: sessionData.token }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Continue failed:", data);
        setStatus("error");
        return;
      }

      // Open destination in new tab
      window.open(data.data.original_url, "_blank");

      // Redirect current tab to ad page (monetization)
      window.location.href = AD_REDIRECT_URL;
    } catch (error: unknown) {
      console.error(error);
      setStatus("error");
    }
  }, [sessionData]);

  // Format destination URL for display
  const getDisplayUrl = (code: string) => {
    return `slmu.my.id/${code}`;
  };

  // Error state
  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafbfc] px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <ExternalLink className="h-7 w-7 text-red-500" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-gray-900">
            Link Tidak Valid
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-gray-500">
            Link yang Anda akses tidak ditemukan atau sudah kadaluarsa. Silakan
            periksa kembali URL Anda.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-bluelanding px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fafbfc]">
      {/* Header Banner — Branding */}
      <header className="border-b border-gray-200 bg-white px-4 py-3 flex justify-center items-center">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bluelanding p-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/logo.svg"
              alt="Shortlinkmu"
              className="h-full w-full"
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            Shortlink<span className="text-bluelanding">mu</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center px-4 pt-8 pb-32 sm:pt-12">
        <div className="w-full max-w-lg">
          {/* Title */}
          <p className="mb-5 text-center text-sm text-gray-500 sm:text-base">
            Berikut pratinjau tujuan Anda
          </p>

          {/* Destination Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            {/* Destination URL */}
            <div className="mb-4">
              <p className="mb-1 text-xs font-medium tracking-wide text-gray-400 uppercase">
                Tujuan:
              </p>
              {sessionData ? (
                <p className="break-all text-[15px] font-semibold text-bluelanding underline decoration-bluelanding/30 underline-offset-2">
                  {getDisplayUrl(sessionData.code)}
                </p>
              ) : (
                <div className="h-5 w-48 animate-pulse rounded bg-gray-100" />
              )}
            </div>

            {/* Info text */}
            <p className="mb-5 text-[13px] leading-relaxed text-gray-500">
              Kami sedang meninjau tautan tersebut untuk membantu menjaga Anda
              tetap aman. Tautan ini dibuat melalui{" "}
              <span className="font-medium text-gray-700">Shortlinkmu</span>.
            </p>

            {/* Security Checks */}
            <div className="mb-1">
              <h3 className="mb-3 text-sm font-semibold text-gray-800">
                Pemeriksaan keamanan
              </h3>

              <div className="space-y-3">
                {/* Check 1 */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center">
                    <Globe className="h-[18px] w-[18px] text-gray-400" />
                  </div>
                  <p className="text-[13px] text-gray-600">
                    Dipindai oleh Shortlinkmu
                  </p>
                </div>

                {/* Check 2 */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center">
                    <ScanEye className="h-[18px] w-[18px] text-gray-400" />
                  </div>
                  <p className="text-[13px] text-gray-600">
                    Tautan dipantau untuk perilaku mencurigakan
                  </p>
                </div>

                {/* Check 3 */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center">
                    <CircleCheckBig className="h-[18px] w-[18px] text-emerald-500" />
                  </div>
                  <p className="text-[13px] text-gray-600">
                    Tidak ada ancaman yang terdeteksi saat ini
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Promo Banner — Premium CTA */}
          <div className="relative mt-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-r from-bluelanding via-violet-600 to-indigo-700 shadow-xl shadow-purple-900/15">
            {/* Decorative glow orbs */}
            <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-purple-400/20 blur-2xl" />
            <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-indigo-400/20 blur-2xl" />

            <a
              href="https://shortlinkmu.com/register"
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center gap-4 p-5 transition-all hover:brightness-110"
            >
              {/* Thumbnail */}
              <div className="hidden shrink-0 sm:block">
                <Image
                  src="/og-image.png"
                  alt="Shortlinkmu"
                  width={100}
                  height={52}
                  className="rounded-lg ring-2 ring-white/10"
                />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-white/15 backdrop-blur-sm">
                    <Link2 className="h-3 w-3 text-purple-200" />
                  </div>
                  <span className="text-[11px] font-bold tracking-widest text-purple-200 uppercase">
                    Shortlinkmu
                  </span>
                </div>
                <p className="text-[15px] font-bold leading-tight text-white">
                  Dapatkan Penghasilan dari Shortlink
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-purple-200/80">
                  Buat link pendek, bagikan, dan hasilkan uang dari setiap klik.
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30">
                  <Sparkles className="h-3 w-3" />
                  Daftar Gratis
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </a>
          </div>

          {/* Footer */}
          <p className="mt-5 pb-2 text-center text-[11px] text-gray-400">
            Protected by{" "}
            <Link href="/" className="font-semibold text-gray-500 hover:text-bluelanding transition-colors">Shortlinkmu</Link>{" "}
            Security
          </p>
        </div>
      </main>

      {/* Fixed Bottom Bar — Continue Button */}
      <div className="fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white px-4 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="mx-auto max-w-lg">
          {status === "loading" ? (
            <>
              <button
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-200 px-6 py-3.5 text-sm font-semibold text-gray-400 transition-all"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Memeriksa keamanan...
              </button>
              <p className="mt-2 text-center text-xs text-gray-400">
                Mohon tunggu {countdown} detik...
              </p>
            </>
          ) : status === "redirecting" ? (
            <>
              <button
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-bluelanding px-6 py-3.5 text-sm font-semibold text-white opacity-70"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengalihkan...
              </button>
              <p className="mt-2 text-center text-xs text-gray-400">
                Membuka link tujuan di tab baru...
              </p>
            </>
          ) : (
            <>
              <button
                onClick={handleContinue}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-bluelanding px-6 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Lanjutkan ke tujuan
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-2 text-center text-xs text-gray-400">
                Anda akan dialihkan ke link tujuan
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafbfc]">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      }
    >
      <GoPageContent />
    </Suspense>
  );
}
