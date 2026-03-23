"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import clsx from "clsx";
import type { ReferredUser } from "@/types/type";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslations } from "next-intl";

interface ReferralTableProps {
  users: ReferredUser[];
}

export default function ReferralTable({ users }: ReferralTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 💱 Currency context
  const { format: formatCurrency } = useCurrency();
  const t = useTranslations("Dashboard");

  // 1. Filter Data (Search by name only)
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // 2. Reset Page kalau search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 3. Hitung Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Handler Ganti Halaman
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-gray-dashboard/30 overflow-hidden font-figtree">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-dashboard/30 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-[1.8em] font-semibold text-shortblack">
          {t("referralPage.friendsList")}
        </h3>

        {/* Search Bar */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grays" />
          <input
            type="text"
            placeholder={t("referralPage.searchUser")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-subcard border border-gray-200 dark:border-gray-dashboard/30 focus:outline-none focus:ring-2 focus:ring-bluelight/20 focus:border-bluelight text-[1.4em] text-shortblack placeholder:text-gray-400 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* List Container */}
      <div className="divide-y divide-gray-100 dark:divide-gray-dashboard/30">
        {currentData.length > 0 ? (
          currentData.map((user) => (
            <div
              key={user.id}
              className="p-4 sm:p-5 hover:bg-subcard transition-all group"
            >
              {/* Main Content Row */}
              <div className="flex items-start sm:items-center justify-between gap-4">
                {/* Left Side - User Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Avatar */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white font-bold text-sm sm:text-base">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Name & Status */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-shortblack text-[1.4em] truncate">
                        {user.name}
                      </span>
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded-full text-[1.2em] lg:text-[1em] font-medium whitespace-nowrap",
                          user.status === "active"
                            ? "bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-dashboard/30 text-gray-500 dark:text-gray-400",
                        )}
                      >
                        {user.status === "active"
                          ? t("referralPage.active")
                          : t("referralPage.inactive")}
                      </span>
                    </div>

                    {/* Date - Desktop inline, Mobile below */}
                    <div className="flex items-center gap-1 text-grays text-[1.3em] mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {t("referralPage.joined")}{" "}
                        {new Date(user.dateJoined).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side - Earnings */}
                <div className="text-right flex-shrink-0">
                  <div className="text-[1.2em] text-grays mb-0.5">
                    {t("referralPage.earnings")}
                  </div>
                  <div className="font-bold text-bluelight text-[1.6em] sm:text-[1.6em]">
                    {formatCurrency(user.totalEarningsForMe)}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-dashboard/30 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-grays text-[1.4em]">
              {searchTerm
                ? t("referralPage.userNotFound")
                : t("referralPage.noFriendsYet")}
            </p>
            <p className="text-gray-400 text-[1.3em] mt-1">
              {!searchTerm && t("referralPage.shareToInvite")}
            </p>
          </div>
        )}
      </div>

      {/* --- FOOTER PAGINATION --- */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-dashboard/30 flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-dashboard/30 bg-subcard text-shortblack hover:bg-blues disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={clsx(
                "w-8 h-8 rounded-lg text-[1.3em] font-bold transition-all",
                currentPage === page
                  ? "bg-bluelight text-white shadow-md shadow-blue-200 dark:shadow-blue-900/30"
                  : "bg-subcard border border-gray-200 dark:border-gray-dashboard/30 text-shortblack hover:bg-blues",
              )}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-dashboard/30 bg-subcard text-shortblack hover:bg-blues disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
