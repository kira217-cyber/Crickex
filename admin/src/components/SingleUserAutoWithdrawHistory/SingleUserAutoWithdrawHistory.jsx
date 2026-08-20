import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaWallet,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaFilter,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaMoneyBillWave,
  FaHourglassHalf,
} from "react-icons/fa";
import { api } from "../../api/axios";
import { ProofThumbs, ImageLightbox } from "../../pages/AutoWithdrawHistory/AutoWithdrawHistory";

const money = (value) => {
  const num = Number(value || 0);
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_FILTERS = [
  "",
  "REVIEW",
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "REJECTED",
];

const getStatusClass = (status = "") => {
  const s = String(status).toUpperCase();

  if (s === "COMPLETED") {
    return "border-green-400/40 bg-green-500/15 text-green-300";
  }

  if (s === "FAILED" || s === "REJECTED" || s === "CANCELLED") {
    return "border-red-400/40 bg-red-500/15 text-red-300";
  }

  if (s === "PENDING" || s === "PROCESSING") {
    return "border-sky-400/40 bg-sky-500/15 text-sky-300";
  }

  return "border-yellow-400/40 bg-yellow-500/15 text-yellow-300";
};

const typeText = (type = "") => {
  const v = String(type || "").toLowerCase();
  if (v === "personal") return "Personal";
  if (v === "agent") return "Agent";
  if (v === "merchant") return "Merchant";
  return "—";
};

const SingleUserAutoWithdrawHistory = ({ userId }) => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [viewer, setViewer] = useState(null);

  const limit = 10;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["single-user-auto-withdraw", userId, page, status],
    enabled: !!userId,
    queryFn: async () => {
      const params = { page, limit, userId };
      if (status) params.status = status;

      const res = await api.get("/api/auto-withdraw/admin/list", { params });
      return res?.data?.data || {};
    },
  });

  const items = Array.isArray(data?.items) ? data.items : [];
  const totalPages = Number(data?.totalPages || 1);
  const total = Number(data?.total || 0);

  const summary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const s = String(item?.status || "").toUpperCase();
        const amount = Number(item?.amount || 0);

        if (s === "COMPLETED") {
          acc.completed += amount;
          acc.completedCount += 1;
        } else if (["FAILED", "REJECTED", "CANCELLED"].includes(s)) {
          acc.returned += amount;
          acc.returnedCount += 1;
        } else if (s === "REVIEW") {
          acc.review += amount;
          acc.reviewCount += 1;
        } else {
          acc.running += amount;
          acc.runningCount += 1;
        }

        return acc;
      },
      {
        completed: 0,
        completedCount: 0,
        returned: 0,
        returnedCount: 0,
        review: 0,
        reviewCount: 0,
        running: 0,
        runningCount: 0,
      },
    );
  }, [items]);

  return (
    <div className="rounded-[32px] border border-[#1A79D3]/20 bg-white/[0.07] shadow-2xl shadow-black/40 backdrop-blur-xl">
      <div className="flex flex-col gap-4 border-b border-[#1A79D3]/20 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1A79D3]/30 bg-[#1A79D3]/15 text-[#6fb5f4]">
            <FaWallet size={20} />
          </div>

          <div>
            <h2 className="text-lg font-black text-white">
              Auto Withdraw History
            </h2>
            <p className="text-xs text-slate-400">
              {total} request(s) from this user.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/20 bg-white/[0.07] px-4 py-3 text-sm font-bold text-slate-200 transition hover:bg-[#1A79D3]/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaSyncAlt className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 border-b border-[#1A79D3]/20 p-5 md:grid-cols-4 md:p-6">
        {[
          {
            title: "Review",
            value: summary.reviewCount,
            sub: money(summary.review),
            icon: <FaHourglassHalf />,
            cls: "text-yellow-300",
          },
          {
            title: "In Progress",
            value: summary.runningCount,
            sub: money(summary.running),
            icon: <FaClock />,
            cls: "text-sky-300",
          },
          {
            title: "Completed",
            value: summary.completedCount,
            sub: money(summary.completed),
            icon: <FaCheckCircle />,
            cls: "text-emerald-300",
          },
          {
            title: "Returned",
            value: summary.returnedCount,
            sub: money(summary.returned),
            icon: <FaTimesCircle />,
            cls: "text-red-300",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-[#1A79D3]/20 bg-black/35 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                {card.title}
              </p>
              <span className={card.cls}>{card.icon}</span>
            </div>

            <h3 className={`mt-2 text-xl font-black ${card.cls}`}>
              {card.value}
            </h3>
            <p className="mt-1 text-[11px] text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[#1A79D3]/20 p-5 md:p-6">
        <FaFilter className="text-slate-400" />

        {STATUS_FILTERS.map((key) => (
          <button
            key={key || "ALL"}
            type="button"
            onClick={() => {
              setStatus(key);
              setPage(1);
            }}
            className={`cursor-pointer rounded-full border px-4 py-2 text-[11px] font-black transition ${
              status === key
                ? "border-[#1A79D3] bg-[#1A79D3]/25 text-white"
                : "border-white/10 bg-black/30 text-slate-300 hover:bg-white/10"
            }`}
          >
            {key || "ALL"}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[#1A79D3]/20 bg-black/50 text-left">
              {["Invoice", "Method", "Account", "Amount", "Status", "Proof", "Date"].map(
                (head) => (
                  <th
                    key={head}
                    className="px-4 py-4 text-xs font-black uppercase tracking-wide text-slate-300"
                  >
                    {head}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody className="bg-black/25">
            {isLoading ? (
              [...Array(3)].map((_, index) => (
                <tr key={index}>
                  <td colSpan={7} className="px-4 py-4">
                    <div className="h-14 animate-pulse rounded-2xl bg-[#1A79D3]/10" />
                  </td>
                </tr>
              ))
            ) : items.length ? (
              items.map((row) => (
                <tr
                  key={row._id}
                  className="border-b border-white/5 transition hover:bg-[#1A79D3]/[0.06]"
                >
                  <td className="px-4 py-4 text-xs text-slate-300">
                    {row.invoiceNumber}
                  </td>

                  <td className="px-4 py-4">
                    <div className="text-sm font-bold text-white">
                      {row?.walletSnapshot?.methodName?.en ||
                        row?.walletSnapshot?.methodId ||
                        "—"}
                    </div>
                    <div className="mt-1 text-[11px] uppercase text-[#6fb5f4]">
                      {row.paymentMethod || "—"}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="text-sm font-bold text-white">
                      {row.accountNumber || "—"}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      {typeText(row?.walletSnapshot?.walletType)}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm font-black text-[#6fb5f4]">
                    {money(row.amount)}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black ${getStatusClass(
                        row.status,
                      )}`}
                    >
                      {String(row.status || "").toUpperCase()}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <ProofThumbs
                      images={row.proofImages}
                      onOpen={(images, index) => setViewer({ images, index })}
                    />
                  </td>

                  <td className="px-4 py-4 text-xs text-slate-300">
                    {formatDate(row.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FaMoneyBillWave size={26} className="text-[#1A79D3]" />
                    <span className="text-sm font-bold">
                      No auto withdraw found for this user.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-[#1A79D3]/20 p-5 md:p-6">
          <button
            type="button"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-[#1A79D3]/20 bg-white/[0.07] px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-[#1A79D3]/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaChevronLeft />
            Prev
          </button>

          <span className="text-xs font-bold text-slate-400">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-[#1A79D3]/20 bg-white/[0.07] px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-[#1A79D3]/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <FaChevronRight />
          </button>
        </div>
      ) : null}

      <ImageLightbox viewer={viewer} setViewer={setViewer} />
    </div>
  );
};

export default SingleUserAutoWithdrawHistory;
