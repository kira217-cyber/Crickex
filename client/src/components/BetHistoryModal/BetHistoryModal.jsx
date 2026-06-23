import React, { useMemo, useState } from "react";
import {
  Clock3,
  CheckCircle2,
  XCircle,
  Receipt,
  Wallet,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  TrendingUp,
  Hash,
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

const BetHistoryModal = () => {
  const { isBangla } = useLanguage();

  const [page, setPage] = useState(1);
  const [resultType, setResultType] = useState("");
  const limit = 10;

  const t = {
    subtitle: isBangla ? "আপনার বেট হিস্টোরি" : "Your bet history",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    noData: isBangla ? "কোনো বেট হিস্টোরি পাওয়া যায়নি" : "No bet history found",
    total: isBangla ? "মোট" : "Total",
    bet: isBangla ? "বেট" : "Bet",
    win: isBangla ? "উইন" : "Win",
    net: isBangla ? "নেট" : "Net",
    game: isBangla ? "গেম" : "Game",
    round: isBangla ? "রাউন্ড" : "Round",
    serial: isBangla ? "সিরিয়াল" : "Serial",
    status: isBangla ? "স্ট্যাটাস" : "Status",
    date: isBangla ? "তারিখ" : "Date",
    balanceBefore: isBangla ? "আগের ব্যালেন্স" : "Balance Before",
    balanceAfter: isBangla ? "পরের ব্যালেন্স" : "Balance After",
    page: isBangla ? "পেজ" : "Page",
    of: isBangla ? "এর" : "of",
    prev: isBangla ? "আগের" : "Prev",
    next: isBangla ? "পরের" : "Next",
    all: isBangla ? "সব" : "All",
    won: isBangla ? "জিতেছে" : "Won",
    lost: isBangla ? "হেরেছে" : "Lost",
    push: isBangla ? "পুশ" : "Push",
  };

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));

    if (resultType) {
      params.append("resultType", resultType);
    }

    return params.toString();
  }, [page, resultType]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["bet-history-modal", queryParams],
    queryFn: async () => {
      const res = await api.get(`/api/game-history/my?${queryParams}`);
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

  const statusBadge = (value) => {
    const s = String(value || "push").toLowerCase();

    if (s === "win") {
      return {
        label: t.won,
        cls: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle2 size={14} />,
      };
    }

    if (s === "loss") {
      return {
        label: t.lost,
        cls: "bg-red-100 text-red-700 border-red-200",
        icon: <XCircle size={14} />,
      };
    }

    return {
      label: t.push,
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

      <div className="shrink-0 bg-[#f3f7fb] px-4 py-3">
        <select
          value={resultType}
          onChange={(e) => {
            setResultType(e.target.value);
            setPage(1);
          }}
          className="h-[36px] w-full rounded-[4px] border border-[#dce8f5] bg-white px-3 text-[13px] text-[#333] outline-none"
        >
          <option value="">{t.all}</option>
          <option value="win">{t.won}</option>
          <option value="loss">{t.lost}</option>
          <option value="push">{t.push}</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#f3f7fb] px-4 py-4">
        {isLoading ? (
          <div className="rounded-[6px] bg-white p-6 text-center text-[13px] text-[#666] shadow-sm">
            {t.loading}
          </div>
        ) : rows.length ? (
          <div className="space-y-3">
            {rows.map((item) => {
              const statusInfo = statusBadge(item?.resultType);

              return (
                <div
                  key={item._id}
                  className="rounded-[6px] border border-[#dce8f5] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-[#222]">
                        {t.game}: {item?.game_uid || "—"}
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
                        <span>{t.bet}</span>
                      </div>
                      <p className="mt-1 font-bold text-[#0865a9]">
                        {money(item?.bet_amount)}
                      </p>
                    </div>

                    <div className="rounded-[4px] bg-[#f4f8ff] p-2">
                      <div className="flex items-center gap-1 text-[#777]">
                        <TrendingUp size={13} />
                        <span>{t.win}</span>
                      </div>
                      <p className="mt-1 font-bold text-[#222]">
                        {money(item?.win_amount)}
                      </p>
                    </div>

                    <div className="rounded-[4px] bg-[#f4f8ff] p-2">
                      <div className="flex items-center gap-1 text-[#777]">
                        <Gamepad2 size={13} />
                        <span>{t.net}</span>
                      </div>
                      <p
                        className={`mt-1 font-bold ${
                          Number(item?.net_amount || 0) > 0
                            ? "text-green-700"
                            : Number(item?.net_amount || 0) < 0
                              ? "text-red-700"
                              : "text-[#222]"
                        }`}
                      >
                        {money(item?.net_amount)}
                      </p>
                    </div>

                    <div className="rounded-[4px] bg-[#f4f8ff] p-2">
                      <div className="flex items-center gap-1 text-[#777]">
                        <Hash size={13} />
                        <span>{t.status}</span>
                      </div>
                      <p className="mt-1 font-bold text-[#222]">
                        {statusInfo.label}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-[4px] bg-[#eef5ff] p-3 text-[12px] text-[#555]">
                    <p className="truncate">
                      {t.round}:{" "}
                      <span className="font-bold text-[#222]">
                        {item?.game_round || "—"}
                      </span>
                    </p>

                    <p className="mt-1 truncate">
                      {t.serial}:{" "}
                      <span className="font-bold text-[#222]">
                        {item?.serial_number || "—"}
                      </span>
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#777]">
                    <div className="rounded bg-[#fafafa] p-2">
                      {t.balanceBefore}:{" "}
                      <span className="font-bold text-[#222]">
                        {money(item?.balance_before)}
                      </span>
                    </div>

                    <div className="rounded bg-[#fafafa] p-2 text-right">
                      {t.balanceAfter}:{" "}
                      <span className="font-bold text-[#222]">
                        {money(item?.balance_after)}
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

        <div className="grid grid-cols-2 gap-2">
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

export default BetHistoryModal;
