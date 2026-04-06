// Server Component - No "use client" for SEO
import Image from "next/image";
import DashboardMockupClient from "./DashboardMockupClient";

export default function DashboardMockup() {
  return (
    <DashboardMockupClient>
      <div className="relative">
        {/* Gradient overlay to connect with Hero's bottom-left blur */}
        

        {/* Subtle glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-100/50 via-purple-100/30 to-blue-100/50 rounded-3xl blur-2xl"></div>

        {/* Main container */}
        <div className="relative rounded-2xl overflow-hidden bg-white shadow-2xl shadow-slate-200/80">
          {/* Browser Top Bar */}
          <div className="h-10 bg-slate-50 flex items-center px-4 gap-2">
            <div className="flex gap-2">
              <div className="size-3 rounded-full bg-red-400/80"></div>
              <div className="size-3 rounded-full bg-amber-400/80"></div>
              <div className="size-3 rounded-full bg-green-400/80"></div>
            </div>
            <div className="ml-4 flex-1 w-full">
              <div className="h-6 bg-white rounded-md border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 select-none px-3">
                <svg
                  className="w-3 h-3 mr-1 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                shortlinkmu.com/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard Screenshot */}
          <div className="relative w-full">
            <Image
              src="/landing/dashboard-with-ads.png"
              alt="Shortlinkmu Dashboard Preview - Analytics, Earnings, and Links Management"
              // width={2980}
              // height={1920}
              width={1910}
              height={1080}
              className="w-full h-auto"
              priority
              quality={90}
            />
          </div>
        </div>
      </div>
    </DashboardMockupClient>
  );
}
