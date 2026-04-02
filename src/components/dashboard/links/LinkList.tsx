// src/components/dashboard/links/LinkList.tsx
"use client";

import { Loader2, Link2 } from "lucide-react";
import LinkItem from "./LinkItem";
import LinkFilters from "./LinkFilters";
import Pagination from "../Pagination";
import type { Shortlink, MemberLinkFilters } from "@/types/type";
import Spinner from "../Spinner";
import { useTranslations } from "next-intl";

interface LinkListProps {
  links: Shortlink[];
  totalPages: number;
  // Filter Props (Controlled from Parent)
  filters: MemberLinkFilters;
  setFilters: (v: MemberLinkFilters) => void;
  page: number;
  setPage: (v: number) => void;
  // Loading states
  isLoading: boolean;
  isFetching?: boolean;
  // Actions
  onEdit: (id: string) => void;
  onToggleStatus: (id: string, status: "active" | "disabled") => void;
}

export default function LinkList({
  links,
  totalPages,
  filters,
  setFilters,
  page,
  setPage,
  isLoading,
  isFetching = false,
  onEdit,
  onToggleStatus,
}: LinkListProps) {
  const t = useTranslations("Dashboard");
  // Show spinner for initial load OR during refetch
  const showLoading = isLoading || isFetching;

  return (
    <div className="rounded-xl mt-6 text-[10px]">
      <LinkFilters filters={filters} setFilters={setFilters} />

      <div className="space-y-3 sm:space-y-4 min-h-[200px]">
        {showLoading ? (
          <Spinner />
        ) : links.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-dashboard/30 flex items-center justify-center">
              <Link2 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-grays text-[1.4em]">
              {t("linkList.noLinksFound")}
            </p>
            <p className="text-gray-400 text-[1.3em] mt-1">
              {t("linkList.noLinksSubtitle")}
            </p>
          </div>
        ) : (
          links.map((link) => (
            <LinkItem
              key={link.id}
              link={link}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
            />
          ))
        )}
      </div>

      {!showLoading && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
