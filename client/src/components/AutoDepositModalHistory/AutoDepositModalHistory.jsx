import React, { useMemo, useState } from "react";
import {
  Clock3,
  CheckCircle2,
  XCircle,
  Gift,
  Receipt,
  Wallet,
  RotateCcw,
  Search,
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

const AutoDepositModalHistory = ({ onBackToDeposit }) => {
  const { isBangla } = useLanguage();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const limit = 10;

  const t = {
    subtitle: isBangla ? "আপনার অটো ডিপোজিট লিস্ট" : "Your auto deposit list",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    noData: isBangla
      ? "কোনো অটো ডিপোজিট হিস্টোরি পাওয়া যায়নি"
      : "No auto deposit history found",
    all: isBangla ? "সব" : "All",
    pending: isBangla ? "পেন্ডিং" : "Pending",
    paid: isBangla ? "পেইড" : "Paid",
    failed: isBangla ? "ফেইলড" : "Failed",
    searchPlaceholder: isBangla
      ? "ইনভয়েস / ট্রানজেকশন / বোনাস"
      : "Invoice / Transaction / Bonus",
    invoice: isBangla ? "ইনভয়েস" : "Invoice",
    deposit: isBangla ? "ডিপোজিট" : "Deposit",
    bonus: isBangla ? "বোনাস" : "Bonus",
    credited: isBangla ? "ক্রেডিটেড" : "Credited",
    turnover: isBangla ? "টার্নওভার" : "Turnover",
    transaction: isBangla ? "ট্রানজেকশন" : "Transaction",
    date: isBangla ? "তারিখ" : "Date",
    page: isBangla ? "পেজ" : "Page",
    of: isBangla ? "এর" : "of",
    prev: isBangla ? "আগের" : "Prev",
    next: isBangla ? "পরের" : "Next",
    total: isBangla ? "মোট" : "Total",
    depositAgain: isBangla ? "আবার ডিপোজিট" : "Deposit Again",
    firstDeposit: isBangla ? "শুধু প্রথম ডিপোজিট" : "First Deposit Only",
    allTime: isBangla ? "সবসময়" : "All Time",
    noBonus: isBangla ? "কোনো বোনাস নয়" : "No Bonus",
  };

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));

    if (status !== "all") {
      params.append("status", status.toUpperCase());
    }

    return params.toString();
  }, [page, status]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["auto-deposit-history-modal", queryParams],
    queryFn: async () => {
      const res = await api.get(`/api/auto-deposit/history/my?${queryParams}`);
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 15000,
  });

  const rows = useMemo(() => {
    const list = Array.isArray(data?.data) ? data.data : [];

    if (!search.trim()) return list;

    const q = search.trim().toLowerCase();

    return list.filter((item) => {
      const invoice = String(item?.invoiceNumber || "").toLowerCase();
      const trx = String(item?.transactionId || "").toLowerCase();
      const session = String(item?.sessionCode || "").toLowerCase();
      const bonusBn = String(
        item?.selectedBonus?.title?.bn || "",
      ).toLowerCase();
      const bonusEn = String(
        item?.selectedBonus?.title?.en || "",
      ).toLowerCase();

      return (
        invoice.includes(q) ||
        trx.includes(q) ||
        session.includes(q) ||
        bonusBn.includes(q) ||
        bonusEn.includes(q)
      );
    });
  }, [data, search]);

  const meta = data?.meta || {};
  const total = Number(meta.total || rows.length || 0);
  const totalPages = Math.max(
    1,
    Math.ceil(Number(meta.total || 0) / Number(meta.limit || limit)) || 1,
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Refresh failed");
    }
  };

  const statusBadge = (statusValue) => {
    const s = String(statusValue || "").toUpperCase();

    if (s === "PAID") {
      return {
        cls: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle2 size={14} />,
      };
    }

    if (s === "FAILED") {
      return {
        cls: "bg-red-100 text-red-700 border-red-200",
        icon: <XCircle size={14} />,
      };
    }

    return {
      cls: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: <Clock3 size={14} />,
    };
  };

  return (
    <>
      <div className="shrink-0 bg-[#0865a9] px-4 pb-4">
        <div className="rounded-[4px] bg-white/10 px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <Receipt size={20} />
            </div>

            <div>
              <p className="text-[14px] font-bold">{t.subtitle}</p>
              <p className="mt-1 text-[12px] text-white/80">
                {t.total}: {total}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-b border-[#e5e5e5] bg-white px-4 py-3">
        <div className="grid grid-cols-1 gap-2">
          <form onSubmit={handleSearch} className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0865a9]"
            />

            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="h-[40px] w-full rounded-[4px] border border-[#d7d7d7] bg-[#eeeeee] pl-10 pr-3 text-[13px] text-[#222] outline-none focus:border-[#0865a9]"
            />
          </form>

          <div className="grid grid-cols-[1fr_42px] gap-2">
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="h-[40px] cursor-pointer rounded-[4px] border border-[#d7d7d7] bg-[#eeeeee] px-3 text-[13px] text-[#222] outline-none focus:border-[#0865a9]"
            >
              <option value="all">{t.all}</option>
              <option value="pending">{t.pending}</option>
              <option value="paid">{t.paid}</option>
              <option value="failed">{t.failed}</option>
            </select>

            <button
              type="button"
              onClick={handleRefresh}
              className="flex h-[40px] cursor-pointer items-center justify-center rounded-[4px] bg-[#0865a9] text-white"
            >
              <RefreshCw
                size={18}
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
              const bonusTitle =
                (isBangla
                  ? item?.selectedBonus?.title?.bn
                  : item?.selectedBonus?.title?.en) || t.noBonus;

              return (
                <div
                  key={item._id}
                  className="rounded-[6px] border border-[#dce8f5] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-[#222]">
                        {item.invoiceNumber || "—"}
                      </p>

                      <p className="mt-1 break-all text-[12px] text-[#777]">
                        {t.transaction}:{" "}
                        {item?.transactionId || item?.sessionCode || "N/A"}
                      </p>
                    </div>

                    <span
                      className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold capitalize ${statusInfo.cls}`}
                    >
                      {statusInfo.icon}
                      {String(item?.status || "PENDING")}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                    <div className="rounded-[4px] bg-[#f4f8ff] p-2">
                      <div className="flex items-center gap-1 text-[#777]">
                        <Wallet size={13} />
                        <span>{t.deposit}</span>
                      </div>
                      <p className="mt-1 font-bold text-[#222]">
                        {money(item?.amount)}
                      </p>
                    </div>

                    <div className="rounded-[4px] bg-[#f4f8ff] p-2">
                      <div className="flex items-center gap-1 text-[#777]">
                        <Gift size={13} />
                        <span>{t.bonus}</span>
                      </div>
                      <p className="mt-1 font-bold text-[#0865a9]">
                        {money(item?.calc?.bonusAmount || 0)}
                      </p>
                    </div>

                    <div className="rounded-[4px] bg-[#f4f8ff] p-2">
                      <div className="flex items-center gap-1 text-[#777]">
                        <CheckCircle2 size={13} />
                        <span>{t.credited}</span>
                      </div>
                      <p className="mt-1 font-bold text-green-700">
                        {money(item?.calc?.creditedAmount || item?.amount)}
                      </p>
                    </div>

                    <div className="rounded-[4px] bg-[#f4f8ff] p-2">
                      <div className="flex items-center gap-1 text-[#777]">
                        <RotateCcw size={13} />
                        <span>{t.turnover}</span>
                      </div>
                      <p className="mt-1 font-bold text-[#222]">
                        x{item?.calc?.turnoverMultiplier || 1}
                      </p>
                    </div>
                  </div>

                  {item?.selectedBonus?.bonusId ? (
                    <div className="mt-3 rounded-[4px] bg-[#eef5ff] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-semibold text-[#0865a9]">
                            {bonusTitle}
                          </p>

                          <p className="mt-1 text-[11px] text-[#666]">
                            {item?.selectedBonus?.bonusScope === "first-deposit"
                              ? t.firstDeposit
                              : t.allTime}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-[11px] text-[#666]">
                            x{item?.selectedBonus?.turnoverMultiplier || 1}
                          </p>

                          <p className="text-[12px] font-bold text-[#0865a9]">
                            {item?.selectedBonus?.bonusType === "percent"
                              ? `${item?.selectedBonus?.bonusValue}%`
                              : money(item?.selectedBonus?.bonusValue || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <p className="mt-3 text-right text-[12px] text-[#777]">
                    {t.date}: {formatDate(item?.createdAt)}
                  </p>
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
            onClick={onBackToDeposit}
            className="h-[38px] cursor-pointer rounded-[4px] bg-[#0865a9] text-[13px] font-bold text-white"
          >
            {t.depositAgain}
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

export default AutoDepositModalHistory;
