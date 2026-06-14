import React, { useMemo, useState } from "react";
import {
  Clock3,
  CheckCircle2,
  XCircle,
  Receipt,
  Wallet,
  Landmark,
  Phone,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";

const money = (value) => {
  const num = Number(value || 0);

  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const typeText = (type = "", isBangla = false) => {
  const v = String(type || "").toLowerCase();

  if (v === "personal") return isBangla ? "পার্সোনাল" : "Personal";
  if (v === "agent") return isBangla ? "এজেন্ট" : "Agent";
  if (v === "merchant") return isBangla ? "মার্চেন্ট" : "Merchant";

  return "—";
};

const WithdrawHistoryModal = ({ onBackToWithdraw }) => {
  const { isBangla } = useLanguage();

  const [page, setPage] = useState(1);
  const limit = 10;

  const t = {
    subtitle: isBangla ? "আপনার উইথড্র হিস্টোরি" : "Your withdraw history",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    noData: isBangla
      ? "কোনো উইথড্র হিস্টোরি পাওয়া যায়নি"
      : "No withdraw history found",
    total: isBangla ? "মোট" : "Total",
    amount: isBangla ? "এমাউন্ট" : "Amount",
    method: isBangla ? "মেথড" : "Method",
    wallet: isBangla ? "ওয়ালেট" : "Wallet",
    status: isBangla ? "স্ট্যাটাস" : "Status",
    date: isBangla ? "তারিখ" : "Date",
    balanceBefore: isBangla ? "আগের ব্যালেন্স" : "Balance Before",
    balanceAfter: isBangla ? "পরের ব্যালেন্স" : "Balance After",
    adminNote: isBangla ? "এডমিন নোট" : "Admin Note",
    page: isBangla ? "পেজ" : "Page",
    of: isBangla ? "এর" : "of",
    prev: isBangla ? "আগের" : "Prev",
    next: isBangla ? "পরের" : "Next",
    withdrawAgain: isBangla ? "আবার উইথড্র" : "Withdraw Again",
    pending: isBangla ? "পেন্ডিং" : "Pending",
    approved: isBangla ? "এপ্রুভড" : "Approved",
    rejected: isBangla ? "রিজেক্টেড" : "Rejected",
    refresh: isBangla ? "রিফ্রেশ" : "Refresh",
  };

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));

    return params.toString();
  }, [page]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["withdraw-history-modal", queryParams],
    queryFn: async () => {
      const res = await api.get(`/api/withdraw-requests/my?${queryParams}`);
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 15000,
  });

  const rows = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta || {};

  const total = Number(meta.total || rows.length || 0);
  const totalPages = Math.max(
    1,
    Math.ceil(Number(meta.total || 0) / Number(meta.limit || limit)) || 1,
  );

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Refresh failed");
    }
  };

  const statusBadge = (statusValue) => {
    const s = String(statusValue || "pending").toLowerCase();

    if (s === "approved") {
      return {
        label: t.approved,
        cls: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle2 size={14} />,
      };
    }

    if (s === "rejected") {
      return {
        label: t.rejected,
        cls: "bg-red-100 text-red-700 border-red-200",
        icon: <XCircle size={14} />,
      };
    }

    return {
      label: t.pending,
      cls: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: <Clock3 size={14} />,
    };
  };

  return (
    <>
      <div className="shrink-0 bg-[#0865a9] px-4 pb-4">
        <div className="rounded-[4px] bg-white/10 px-4 py-3 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Receipt size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-[14px] font-bold">{t.subtitle}</p>
                <p className="mt-1 text-[12px] text-white/80">
                  {t.total}: {total}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[4px] bg-white/15 text-white"
            >
              <RefreshCw
                size={17}
                className={isFetching ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#f3f7fb] px-4 py-4">
        {isLoading ? (
          <div className="rounded-[6px] bg-white p-6 text-center text-[13px] text-[#666] shadow-sm">
            {t.loading}
          </div>
        ) : rows.length ? (
          <div className="space-y-3">
            {rows.map((item) => {
              const statusInfo = statusBadge(item?.status);

              const methodName =
                item?.walletSnapshot?.methodName?.en ||
                item?.walletSnapshot?.methodName?.bn ||
                item?.methodId ||
                "—";

              const walletNumber =
                item?.walletSnapshot?.walletNumber ||
                item?.wallet?.walletNumber ||
                "—";

              const walletType = typeText(
                item?.walletSnapshot?.walletType || item?.wallet?.walletType,
                isBangla,
              );

              const walletLabel =
                item?.walletSnapshot?.label || item?.wallet?.label || "";

              return (
                <div
                  key={item._id}
                  className="rounded-[6px] border border-[#dce8f5] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-[#222]">
                        {methodName}
                      </p>

                      <p className="mt-1 text-[12px] text-[#777]">
                        {t.date}: {formatDate(item?.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold ${statusInfo.cls}`}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                    <div className="rounded-[4px] bg-[#f4f8ff] p-2">
                      <div className="flex items-center gap-1 text-[#777]">
                        <Wallet size={13} />
                        <span>{t.amount}</span>
                      </div>

                      <p className="mt-1 font-bold text-[#0865a9]">
                        {money(item?.amount)}
                      </p>
                    </div>

                    <div className="rounded-[4px] bg-[#f4f8ff] p-2">
                      <div className="flex items-center gap-1 text-[#777]">
                        <Landmark size={13} />
                        <span>{t.method}</span>
                      </div>

                      <p className="mt-1 truncate font-bold text-[#222]">
                        {String(item?.methodId || "—").toUpperCase()}
                      </p>
                    </div>

                    <div className="rounded-[4px] bg-[#f4f8ff] p-2">
                      <div className="flex items-center gap-1 text-[#777]">
                        <Phone size={13} />
                        <span>{t.wallet}</span>
                      </div>

                      <p className="mt-1 font-bold text-[#222]">
                        {walletNumber}
                      </p>

                      <p className="mt-1 text-[11px] text-[#777]">
                        {walletType}
                      </p>
                    </div>

                    <div className="rounded-[4px] bg-[#f4f8ff] p-2">
                      <div className="flex items-center gap-1 text-[#777]">
                        <CheckCircle2 size={13} />
                        <span>{t.status}</span>
                      </div>

                      <p className="mt-1 font-bold text-[#222]">
                        {statusInfo.label}
                      </p>
                    </div>
                  </div>

                  {walletLabel || item?.adminNote ? (
                    <div className="mt-3 rounded-[4px] bg-[#eef5ff] p-3">
                      {walletLabel ? (
                        <p className="text-[12px] font-semibold text-[#0865a9]">
                          {walletLabel}
                        </p>
                      ) : null}

                      {item?.adminNote ? (
                        <p className="mt-1 text-[12px] text-[#666]">
                          {t.adminNote}: {item.adminNote}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#777]">
                    <div className="rounded bg-[#fafafa] p-2">
                      {t.balanceBefore}:{" "}
                      <span className="font-bold text-[#222]">
                        {money(item?.balanceBefore)}
                      </span>
                    </div>

                    <div className="rounded bg-[#fafafa] p-2 text-right">
                      {t.balanceAfter}:{" "}
                      <span className="font-bold text-[#222]">
                        {money(item?.balanceAfter)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[6px] bg-white p-8 text-center text-[13px] text-[#666] shadow-sm">
            {t.noData}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#e5e5e5] bg-white px-4 py-3">
        <div className="mb-3 flex items-center justify-between text-[12px] text-[#555]">
          <span>
            {t.page} {page} {t.of} {totalPages}
          </span>
          <span>
            {t.total}: {total}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1 || isFetching}
            className="flex h-[38px] cursor-pointer items-center justify-center gap-1 rounded-[4px] border border-[#d7d7d7] bg-white text-[13px] text-[#333] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} />
            {t.prev}
          </button>

          <button
            type="button"
            onClick={onBackToWithdraw}
            className="h-[38px] cursor-pointer rounded-[4px] bg-[#0865a9] text-[13px] font-bold text-white"
          >
            {t.withdrawAgain}
          </button>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages || isFetching}
            className="flex h-[38px] cursor-pointer items-center justify-center gap-1 rounded-[4px] border border-[#d7d7d7] bg-white text-[13px] text-[#333] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.next}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
};

export default WithdrawHistoryModal;
