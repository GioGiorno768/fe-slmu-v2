"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowRight,
  ShieldCheck,
  Lock,
  Link2,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import * as linkService from "@/services/linkService";
import { useAlert } from "@/hooks/useAlert";
import { useFingerprint } from "@/hooks/useFingerprint";

interface SessionData {
  code: string;
  token: string;
  step: number;
  max_steps: number;
  ad_level: number;
  is_guest: boolean;
}

export default function ContinuePage() {
  const searchParams = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { showAlert } = useAlert();

  // 🛡️ Device Fingerprinting for Self-Click Detection
  const { visitorId } = useFingerprint();

  // Get session ID directly from URL param
  const sessionId = searchParams.get("s");

  // Don't auto-load, wait for user to click
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isValid, setIsValid] = useState(true);
  const [password, setPassword] = useState("");
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [error, setError] = useState("");

  // Fetch session and validate on mount
  useEffect(() => {
    const checkStatus = async () => {
      if (!sessionId) {
        setError("Session ID tidak ditemukan.");
        setIsValid(false);
        setIsCheckingStatus(false);
        return;
      }

      try {
        // 1. Fetch session data
        const sessionResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/links/session/${sessionId}`,
        );
        const sessionResult = await sessionResponse.json();

        if (!sessionResponse.ok) {
          setError("Session tidak ditemukan atau sudah kadaluarsa.");
          setIsValid(false);
          setIsCheckingStatus(false);
          return;
        }

        const data: SessionData = sessionResult.data;
        setSessionData(data);

        // 2. Check if all steps are completed
        const statusResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/links/${data.code}/check-step-status`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: data.token }),
          },
        );

        const statusResult = await statusResponse.json();

        if (!statusResponse.ok || !statusResult.data?.all_complete) {
          console.warn("🛡️ Direct continue access blocked:", statusResult);
          setError(
            "Anda harus menyelesaikan semua langkah artikel terlebih dahulu.",
          );
          setIsValid(false);
          setIsCheckingStatus(false);
          return;
        }

        // All steps completed - allow access
        setIsCheckingStatus(false);
      } catch (err) {
        console.error("Validation error:", err);
        setError("Gagal memverifikasi status link.");
        setIsValid(false);
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [sessionId]);

  const handleContinue = async () => {
    if (!sessionData) return;

    setIsLoading(true);
    setError("");

    try {
      // Pass password if state is set
      const originalUrl = await linkService.validateContinueToken(
        sessionData.code,
        sessionData.token,
        password || undefined,
        visitorId || undefined, // 🛡️ Pass fingerprint for self-click detection
      );

      // Success! Redirect to destination
      window.open(originalUrl, "_self");
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      const redirectUrl = err.response?.data?.redirect_url;

      if (status === 410 && redirectUrl) {
        // Link expired - redirect to expired page
        window.location.href = redirectUrl;
        return;
      } else if (status === 401) {
        // Password required
        setIsPasswordRequired(true);
        if (password) {
          setError("Incorrect password");
        }
      } else if (status === 403) {
        if (msg.includes("Token belum diaktivasi")) {
          // Token not activated
        }
        setError(msg);
        console.error("Link verification failed (403):", err);
      } else {
        console.error("Link verification failed:", err);
        setError(msg || "Gagal memproses link");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Loading State ---
  if (isCheckingStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1117]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-purple-600/10 ring-1 ring-purple-500/30">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-gray-400">Verifying link security...</p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (!isValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1117] px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30">
            <ShieldCheck className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Link Invalid</h1>
          <p className="mt-2 text-sm text-gray-400">
            {error || "Parameter tidak lengkap."}
          </p>
        </div>
      </div>
    );
  }

  // --- Main Content ---
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f1117] px-4 py-12">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Branding */}
      <div className="relative z-10 mb-8 flex items-center gap-2">
        <Link2 className="h-5 w-5 text-purple-400" />
        <span className="text-lg font-bold text-white tracking-tight">
          Short<span className="text-purple-400">linkmu</span>
        </span>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.06] bg-[#16181d] shadow-2xl shadow-black/40">
        {/* Top accent line */}
        <div className="h-1 bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-500" />

        <div className="p-8">
          {/* Status Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 ring-1 ring-purple-500/20">
              {isPasswordRequired ? (
                <Lock className="h-8 w-8 text-purple-400" />
              ) : (
                <ShieldCheck className="h-8 w-8 text-emerald-400" />
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-center text-xl font-bold text-white">
            {isPasswordRequired
              ? "Password Protected"
              : "You will be redirected to the Destination URL"}
          </h1>
          <p className="mb-8 text-center text-sm text-gray-400">
            {isPasswordRequired
              ? "Link ini dilindungi password. Masukkan password untuk melanjutkan."
              : "Press the OPEN LINK button to open your original destination URL"}
          </p>

          {/* Password Input */}
          {isPasswordRequired && (
            <div className="mb-5">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                placeholder="Enter password..."
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="group relative flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:shadow-purple-600/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isPasswordRequired ? "Validating..." : "Processing..."}
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                {isPasswordRequired ? "UNLOCK LINK" : "OPEN LINK"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Promo Banner */}
      <div className="relative z-10 mt-6 w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-700 shadow-xl shadow-purple-900/20">
        <a
          href="https://shortlinkmu.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-5 transition-all hover:brightness-110"
        >
          <div className="shrink-0">
            <Image
              src="/og-image.png"
              alt="Shortlinkmu"
              width={100}
              height={52}
              className="rounded-lg"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <Link2 className="h-3.5 w-3.5 text-purple-200" />
              <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
                Shortlinkmu
              </span>
            </div>
            <p className="text-base font-bold text-white leading-tight">
              Earn Money By Shortener URL
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm border border-white/10">
              Register For Free
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </a>
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-6 text-center text-xs text-gray-500">
        Protected by Shortlinkmu Security
      </p>
    </div>
  );
}
