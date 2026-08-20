import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  WalletCards,
  ShieldCheck,
  Sparkles,
  Loader2,
  X,
  Ban,
  Clock3,
  AlertTriangle,
  Undo2,
} from "lucide-react";
import { api } from "../../api/axios";

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

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
};

const STATUSES = [
  "all",
  "REVIEW",
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "REJECTED",
];

const chipClass = (status) => {
  const s = String(status || "REVIEW").toUpperCase();

  if (s === "COMPLETED") {
    return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  }

  if (s === "FAILED" || s === "REJECTED" || s === "CANCELLED") {
    return "border-red-400/30 bg-red-500/15 text-red-200";
  }

  if (s === "PROCESSING" || s === "PENDING") {
    return "border-sky-400/30 bg-sky-500/15 text-sky-200";
  }

  return "border-yellow-400/30 bg-yellow-500/15 text-yellow-200";
};

const typeText = (type = "") => {
  const v = String(type || "").toLowerCase();
  if (v === "personal") return "Personal";
  if (v === "agent") return "Agent";
  if (v === "merchant") return "Merchant";
  return "—";
};

const inputWrap =
  "flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition focus-within:border-[#1A79D3]/60 focus-within:shadow-[0_0_25px_rgba(26,121,211,0.20)]";

const inputClass =
  "w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500";

const btnPrimary =
  "group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-4 py-3 text-sm font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.22)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60";

const btnGhost =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/20 bg-white/[0.07] px-4 py-3 text-sm font-bold text-slate-200 transition hover:bg-[#1A79D3]/15 disabled:cursor-not-allowed disabled:opacity-50";

const btnDanger =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50";

const cardClass =
  "rounded-[32px] border border-[#1A79D3]/20 bg-white/[0.07] shadow-2xl shadow-black/40 backdrop-blur-xl";

const SummaryCard = ({ title, value, icon, tone = "blue", sub }) => {
  const toneCls =
    tone === "green"
      ? "text-emerald-300"
      : tone === "yellow"
        ? "text-yellow-300"
        : tone === "red"
          ? "text-red-300"
          : "text-[#6fb5f4]";

  return (
    <div className="rounded-[26px] border border-[#1A79D3]/20 bg-black/35 p-5 shadow-xl shadow-black/25">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <h3 className={`mt-2 text-2xl font-black ${toneCls}`}>{value}</h3>

          {sub ? <p className="mt-2 text-xs text-slate-400">{sub}</p> : null}
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1A79D3]/30 bg-[#1A79D3]/15 text-[#6fb5f4]">
          {icon}
        </div>
      </div>
    </div>
  );
};

export const ProofThumbs = ({ images = [], onOpen }) => {
  if (!Array.isArray(images) || images.length === 0) {
    return <span className="text-xs text-slate-500">—</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {images.map((url, idx) => (
        <button
          key={url}
          type="button"
          onClick={() => onOpen(images, idx)}
          className="h-10 w-10 cursor-pointer overflow-hidden rounded-lg border border-[#1A79D3]/30 bg-black/40 transition hover:scale-105"
          title="Click to enlarge"
        >
          <img
            src={getImageUrl(url)}
            alt={`proof ${idx + 1}`}
            className="h-full w-full object-cover"
          />
        </button>
      ))}
    </div>
  );
};

export const ImageLightbox = ({ viewer, setViewer }) => {
  if (!viewer) return null;

  const { images, index } = viewer;
  const total = images.length;

  const go = (step) => {
    setViewer({ images, index: (index + step + total) % total });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setViewer(null)}
          className="absolute right-5 top-5 cursor-pointer rounded-full border border-white/15 bg-black/50 p-2 text-white transition hover:bg-white/10"
        >
          <X size={22} />
        </button>

        {total > 1 ? (
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-4 cursor-pointer rounded-full border border-white/15 bg-black/50 p-3 text-white transition hover:bg-white/10"
          >
            <ChevronLeft size={22} />
          </button>
        ) : null}

        <motion.img
          key={images[index]}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18 }}
          src={getImageUrl(images[index])}
          alt={`proof ${index + 1}`}
          className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
        />

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-4 cursor-pointer rounded-full border border-white/15 bg-black/50 p-3 text-white transition hover:bg-white/10"
            >
              <ChevronRight size={22} />
            </button>

            <div className="absolute bottom-6 rounded-full border border-white/15 bg-black/60 px-4 py-1.5 text-xs font-bold text-white">
              {index + 1} / {total}
            </div>
          </>
        ) : null}
      </div>
    </AnimatePresence>
  );
};

const ConfirmModal = ({
  open,
  title,
  description,
  confirmText,
  confirmVariant = "approve",
  loading,
  note,
  setNote,
  reason,
  setReason,
  requireReason = false,
  onClose,
  onConfirm,
}) => {
  const reasonTooShort = requireReason && String(reason || "").trim().length < 5;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.94 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-[520px] rounded-[28px] border border-[#1A79D3]/20 bg-[#050607] p-6 text-white shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  {description}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="cursor-pointer text-slate-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={22} />
              </button>
            </div>

            {requireReason ? (
              <div className="mb-4">
                <label className="text-sm font-bold text-slate-200">
                  Reason required
                </label>

                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why is this being returned by hand?"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#1A79D3]/60"
                />

                {reasonTooShort ? (
                  <p className="mt-2 text-xs font-bold text-red-300">
                    At least 5 characters.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div>
              <label className="text-sm font-bold text-slate-200">
                Admin Note optional
              </label>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write a note for user..."
                className="mt-2 min-h-[100px] w-full rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#1A79D3]/60 focus:shadow-[0_0_25px_rgba(26,121,211,0.20)]"
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className={btnGhost}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={loading || reasonTooShort}
                className={confirmVariant === "reject" ? btnDanger : btnPrimary}
              >
                {loading ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : confirmVariant === "reject" ? (
                  <XCircle size={17} />
                ) : (
                  <CheckCircle2 size={17} />
                )}
                {loading ? "Processing..." : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AutoWithdrawHistory = () => {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("all");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");

  const [action, setAction] = useState(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [acting, setActing] = useState(false);

  const [viewer, setViewer] = useState(null);
  const [stuckAfterHours, setStuckAfterHours] = useState(6);

  const pageCount = useMemo(() => {
    const total = Number(meta.total || 0);
    const limit = Number(meta.limit || 20);
    return Math.max(1, Math.ceil(total / limit));
  }, [meta.total, meta.limit]);

  const summary = useMemo(() => {
    const by = (keys) =>
      list.filter((x) => keys.includes(String(x?.status || "").toUpperCase()));

    const sum = (arr) =>
      arr.reduce((total, item) => total + Number(item?.amount || 0), 0);

    const review = by(["REVIEW"]);
    const running = by(["PENDING", "PROCESSING"]);
    const done = by(["COMPLETED"]);
    const returned = by(["FAILED", "CANCELLED", "REJECTED"]);

    return {
      pageTotal: list.length,
      reviewCount: review.length,
      reviewAmount: sum(review),
      runningCount: running.length,
      runningAmount: sum(running),
      doneCount: done.length,
      doneAmount: sum(done),
      returnedCount: returned.length,
      returnedAmount: sum(returned),
    };
  }, [list]);

  const fetchData = async (
    page = meta.page,
    searchQ = q,
    nextStatus = status,
  ) => {
    try {
      setLoading(true);

      const params = { page, limit: meta.limit };

      if (searchQ) params.search = searchQ;
      if (nextStatus !== "all") params.status = nextStatus;

      const { data } = await api.get("/api/auto-withdraw/admin/list", {
        params,
      });

      const items = Array.isArray(data?.data?.items) ? data.data.items : [];

      setList(items);

      setMeta((prev) => ({
        ...prev,
        page: Number(data?.data?.page || page),
        limit: Number(data?.data?.limit || prev.limit),
        total: Number(data?.data?.total ?? items.length),
      }));

      if (data?.data?.stuckAfterHours) {
        setStuckAfterHours(Number(data.data.stuckAfterHours));
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load auto withdraws",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, q, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e?.preventDefault();

    const next = qInput.trim();
    setQ(next);
    fetchData(1, next, status);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    fetchData(1, q, value);
  };

  const openAction = (row, type) => {
    setAction({ row, type });
    setNote("");
    setReason("");
  };

  const openViewer = (images, index) => setViewer({ images, index });

  const runAction = async () => {
    if (!action?.row?._id) return;

    try {
      setActing(true);

      const { data } = await api.post(
        `/api/auto-withdraw/admin/${action.row._id}/${action.type}`,
        action.type === "force-return"
          ? { adminNote: note, reason: reason.trim() }
          : { adminNote: note },
      );

      if (!data?.success) {
        throw new Error(data?.message || "Action failed");
      }

      toast.success(data?.message || "Done");
      setAction(null);
      await fetchData(meta.page, q, status);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Action failed",
      );
    } finally {
      setActing(false);
    }
  };

  const actionCopy = {
    approve: {
      title: "Approve this auto withdraw?",
      description:
        "টাকা OraclePay-তে পাঠানো হবে এবং agent transfer শুরু করবে। Approve করার পর আর ফেরানো যাবে না।",
      confirmText: "Approve & Send",
      variant: "approve",
    },
    reject: {
      title: "Reject this auto withdraw?",
      description:
        "কোনো টাকা পাঠানো হবে না এবং সম্পূর্ণ amount user-এর balance-এ ফেরত যাবে।",
      confirmText: "Reject & Refund",
      variant: "reject",
    },
    cancel: {
      title: "Cancel this auto withdraw?",
      description:
        "OraclePay-কে cancel request পাঠানো হবে। কোনো agent ইতিমধ্যে booking করে ফেললে cancel হবে না।",
      confirmText: "Cancel & Refund",
      variant: "reject",
    },
    "force-return": {
      title: "Return this stuck withdraw by hand?",
      description:
        "প্রথমে OraclePay-তে cancel চেষ্টা করা হবে। cancel না হলে টাকা user-এর balance-এ ফেরত যাবে এবং request টি force-returned হিসেবে চিহ্নিত থাকবে। শুধু তখনই করুন যখন আপনি নিশ্চিত যে টাকা আসলে পাঠানো হয়নি।",
      confirmText: "Return & Refund",
      variant: "reject",
      requireReason: true,
    },
  };

  const copy = action ? actionCopy[action.type] : null;

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={`${cardClass} p-5 md:p-6`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1A79D3]/30 bg-[#1A79D3]/15 text-[#6fb5f4]">
                <WalletCards size={26} />
              </div>

              <div>
                <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
                  Auto Withdraw Requests
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Review requests before any money leaves, then track the
                  OraclePay transfer.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchData(meta.page, q, status)}
              className={btnGhost}
              disabled={loading}
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Waiting Review"
            value={summary.reviewCount}
            icon={<AlertTriangle size={22} />}
            tone="yellow"
            sub={money(summary.reviewAmount)}
          />

          <SummaryCard
            title="In Progress"
            value={summary.runningCount}
            icon={<Clock3 size={22} />}
            sub={money(summary.runningAmount)}
          />

          <SummaryCard
            title="Completed"
            value={summary.doneCount}
            icon={<CheckCircle2 size={22} />}
            tone="green"
            sub={money(summary.doneAmount)}
          />

          <SummaryCard
            title="Returned"
            value={summary.returnedCount}
            icon={<XCircle size={22} />}
            tone="red"
            sub={money(summary.returnedAmount)}
          />
        </div>

        <div className={`${cardClass} overflow-hidden`}>
          <div className="border-b border-[#1A79D3]/20 p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-3">
              <Sparkles className="h-5 w-5 text-[#1A79D3]" />
              <div>
                <h2 className="text-sm font-bold text-white">
                  Request Filters
                </h2>
                <p className="text-xs text-slate-300">
                  Search by invoice, account number or OraclePay id.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_160px]">
              <form onSubmit={onSearch}>
                <div className={inputWrap}>
                  <Search className="h-5 w-5 text-[#1A79D3]" />
                  <input
                    value={qInput}
                    onChange={(e) => setQInput(e.target.value)}
                    placeholder="Search: invoice / account / opay id..."
                    className={inputClass}
                  />
                </div>
              </form>

              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="h-[50px] cursor-pointer rounded-2xl border border-white/10 bg-black/35 px-4 text-sm font-bold text-white outline-none focus:border-[#1A79D3]/60"
              >
                {STATUSES.map((key) => (
                  <option key={key} className="bg-black" value={key}>
                    {key === "all" ? "All" : key}
                  </option>
                ))}
              </select>

              <button type="button" onClick={onSearch} className={btnPrimary}>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition duration-700 group-hover:translate-x-full" />
                <Search size={17} />
                Search
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1350px]">
              <thead>
                <tr className="border-b border-[#1A79D3]/20 bg-black/50 text-left">
                  {[
                    "User",
                    "Method",
                    "Account",
                    "Amount",
                    "Status",
                    "Proof",
                    "Date",
                    "Actions",
                  ].map((head) => (
                    <th
                      key={head}
                      className="px-4 py-4 text-xs font-black uppercase tracking-wide text-slate-300"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-black/25">
                {loading ? (
                  [...Array(5)].map((_, index) => (
                    <tr key={index}>
                      <td colSpan={8} className="px-4 py-4">
                        <div className="h-16 animate-pulse rounded-2xl bg-[#1A79D3]/10" />
                      </td>
                    </tr>
                  ))
                ) : list.length ? (
                  list.map((row) => {
                    const statusText = String(
                      row?.status || "REVIEW",
                    ).toUpperCase();

                    const isReview = statusText === "REVIEW";
                    const isPending = statusText === "PENDING";

                    const methodName =
                      row?.walletSnapshot?.methodName?.en ||
                      row?.walletSnapshot?.methodName?.bn ||
                      row?.walletSnapshot?.methodId ||
                      "—";

                    return (
                      <tr
                        key={row._id}
                        className="border-b border-white/5 transition hover:bg-[#1A79D3]/[0.06]"
                      >
                        <td className="px-4 py-4">
                          <div className="text-sm font-black text-white">
                            {row?.user?.userId || "—"}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {row?.user?.phone || "—"}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">
                            {row.invoiceNumber}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="text-sm font-bold text-white">
                            {methodName}
                          </div>
                          <div className="mt-1 text-xs uppercase text-[#6fb5f4]">
                            {row.paymentMethod || "—"}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="text-sm font-bold text-white">
                            {row.accountNumber || "—"}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {typeText(row?.walletSnapshot?.walletType)}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="text-sm font-black text-[#6fb5f4]">
                            {money(row.amount)}
                          </div>
                          {row.refunded ? (
                            <div className="mt-1 text-[11px] font-bold text-emerald-300">
                              Refunded
                            </div>
                          ) : null}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black ${chipClass(
                              statusText,
                            )}`}
                          >
                            {statusText}
                          </span>

                          {row.forceReturned ? (
                            <div className="mt-1 text-[11px] font-bold text-amber-300">
                              Returned by admin
                            </div>
                          ) : null}

                          {row.failureReason ? (
                            <div
                              className="mt-1 max-w-[180px] truncate text-[11px] text-red-300"
                              title={row.failureReason}
                            >
                              {row.failureReason}
                            </div>
                          ) : null}
                        </td>

                        <td className="px-4 py-4">
                          <ProofThumbs
                            images={row.proofImages}
                            onOpen={openViewer}
                          />
                        </td>

                        <td className="px-4 py-4">
                          <div className="text-xs text-slate-300">
                            {formatDate(row.createdAt)}
                          </div>
                          {row.completedAt ? (
                            <div className="mt-1 text-[11px] text-emerald-300">
                              {formatDate(row.completedAt)}
                            </div>
                          ) : null}
                        </td>

                        <td className="px-4 py-4">
                          {isReview ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openAction(row, "approve")}
                                className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-200 transition hover:bg-emerald-500/20"
                              >
                                <CheckCircle2 size={14} />
                                Approve
                              </button>

                              <button
                                type="button"
                                onClick={() => openAction(row, "reject")}
                                className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200 transition hover:bg-red-500/20"
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            </div>
                          ) : isPending || row.canForceReturn ? (
                            <div className="flex flex-wrap items-center gap-2">
                              {isPending ? (
                                <button
                                  type="button"
                                  onClick={() => openAction(row, "cancel")}
                                  className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200 transition hover:bg-red-500/20"
                                >
                                  <Ban size={14} />
                                  Cancel
                                </button>
                              ) : null}

                              {row.canForceReturn ? (
                                <button
                                  type="button"
                                  onClick={() => openAction(row, "force-return")}
                                  className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs font-black text-amber-200 transition hover:bg-amber-500/20"
                                  title={`Stuck for over ${stuckAfterHours} hours`}
                                >
                                  <Undo2 size={14} />
                                  Return
                                </button>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <ShieldCheck size={34} className="text-[#1A79D3]" />
                        <span className="text-sm font-bold">
                          No auto withdraw request found.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#1A79D3]/20 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <p className="text-xs text-slate-400">
              Page {meta.page} of {pageCount} — total {meta.total || 0} request
              (s)
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className={btnGhost}
                disabled={loading || meta.page <= 1}
                onClick={() => fetchData(meta.page - 1, q, status)}
              >
                <ChevronLeft size={16} />
                Prev
              </button>

              <button
                type="button"
                className={btnGhost}
                disabled={loading || meta.page >= pageCount}
                onClick={() => fetchData(meta.page + 1, q, status)}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!action}
        title={copy?.title || ""}
        description={copy?.description || ""}
        confirmText={copy?.confirmText || "Confirm"}
        confirmVariant={copy?.variant || "approve"}
        loading={acting}
        note={note}
        setNote={setNote}
        reason={reason}
        setReason={setReason}
        requireReason={!!copy?.requireReason}
        onClose={() => setAction(null)}
        onConfirm={runAction}
      />

      <ImageLightbox viewer={viewer} setViewer={setViewer} />
    </div>
  );
};

export default AutoWithdrawHistory;
