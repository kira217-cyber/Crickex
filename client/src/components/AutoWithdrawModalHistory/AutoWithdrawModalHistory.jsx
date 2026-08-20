import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Clock3,
  CheckCircle2,
  XCircle,
  Ban,
  Loader2,
  HourglassIcon,
  Receipt,
  Wallet,
  Landmark,
  Phone,
  Images,
  RefreshCw,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectTransactionHistoryColorSetting } from "../../features/global/globalSelectors";

const defaultHistoryColors = {
  modalBg: "#ffffff",
  headerBg: "#0865a9",
  headerText: "#ffffff",
  primaryBg: "#0865a9",
  primaryText: "#ffffff",
  sectionBg: "#f3f7fb",
  sectionBorder: "#e5e5e5",
  cardBg: "#ffffff",
  cardBorder: "#dce8f5",
  inputBg: "#eeeeee",
  inputText: "#222222",
  inputBorder: "#d7d7d7",
  normalText: "#222222",
  mutedText: "#777777",
  summaryBg: "#f4f8ff",
  summaryText: "#0865a9",
  successBg: "#dcfce7",
  successText: "#15803d",
  warningBg: "#fef9c3",
  warningText: "#a16207",
  dangerBg: "#fee2e2",
  dangerText: "#b91c1c",
};

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

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
};

const typeText = (type = "", isBangla = false) => {
  const v = String(type || "").toLowerCase();

  if (v === "personal") return isBangla ? "পার্সোনাল" : "Personal";
  if (v === "agent") return isBangla ? "এজেন্ট" : "Agent";
  if (v === "merchant") return isBangla ? "মার্চেন্ট" : "Merchant";

  return "—";
};

const STATUS_TABS = [
  "",
  "REVIEW",
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
];

/** Full-screen viewer, portalled so the history modal cannot clip it. */
const ProofLightbox = ({ viewer, setViewer }) => {
  if (!viewer) return null;

  const { images, index } = viewer;
  const total = images.length;

  const go = (step) =>
    setViewer({ images, index: (index + step + total) % total });

  return createPortal(
    <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/90 p-4">
      <button
        type="button"
        onClick={() => setViewer(null)}
        className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white"
      >
        <X size={22} />
      </button>

      {total > 1 ? (
        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute left-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white"
        >
          <ChevronLeft size={22} />
        </button>
      ) : null}

      <img
        src={getImageUrl(images[index])}
        alt={`proof ${index + 1}`}
        className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain"
      />

      {total > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-6 rounded-full bg-white/15 px-4 py-1.5 text-[12px] font-bold text-white">
            {index + 1} / {total}
          </div>
        </>
      ) : null}
    </div>,
    document.body,
  );
};

const AutoWithdrawModalHistory = ({ onBackToWithdraw }) => {
  const { isBangla } = useLanguage();

  const colorSetting = useSelector(selectTransactionHistoryColorSetting);
  const colors = {
    ...defaultHistoryColors,
    ...(colorSetting || {}),
  };

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [viewer, setViewer] = useState(null);

  const t = {
    subtitle: isBangla ? "অটো উইথড্র হিস্টোরি" : "Auto Withdraw History",
    back: isBangla ? "অটো উইথড্র" : "Auto Withdraw",
    total: isBangla ? "মোট" : "Total",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    empty: isBangla
      ? "কোনো অটো উইথড্র পাওয়া যায়নি।"
      : "No auto withdraw found.",

    amount: isBangla ? "এমাউন্ট" : "Amount",
    method: isBangla ? "মেথড" : "Method",
    wallet: isBangla ? "ওয়ালেট" : "Wallet",
    status: isBangla ? "স্ট্যাটাস" : "Status",
    date: isBangla ? "তারিখ" : "Date",
    invoice: isBangla ? "ইনভয়েস" : "Invoice",
    completedAt: isBangla ? "সম্পন্ন" : "Completed",
    proof: isBangla ? "প্রুফ" : "Proof",
    adminNote: isBangla ? "এডমিন নোট" : "Admin Note",
    reason: isBangla ? "কারণ" : "Reason",
    refundNote: isBangla
      ? "টাকা আপনার ব্যালেন্সে ফেরত দেওয়া হয়েছে।"
      : "The amount has been returned to your balance.",

    all: isBangla ? "সব" : "All",
    prev: isBangla ? "আগের" : "Prev",
    next: isBangla ? "পরের" : "Next",

    review: isBangla ? "রিভিউতে" : "In Review",
    pending: isBangla ? "পেন্ডিং" : "Pending",
    processing: isBangla ? "প্রসেসিং" : "Processing",
    completed: isBangla ? "সফল" : "Completed",
    failed: isBangla ? "ব্যর্থ" : "Failed",
    cancelled: isBangla ? "বাতিল" : "Cancelled",
    rejected: isBangla ? "রিজেক্ট" : "Rejected",
  };

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["auto-withdraw-history", page, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });

      if (status) params.set("status", status);

      const res = await api.get(`/api/auto-withdraw/history/my?${params}`);
      return res?.data?.data || {};
    },
  });

  const rows = Array.isArray(data?.items) ? data.items : [];
  const totalPages = Number(data?.totalPages || 1);
  const total = Number(data?.total || 0);

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Refresh failed");
    }
  };

  const statusBadge = (statusValue) => {
    const s = String(statusValue || "REVIEW").toUpperCase();

    const map = {
      COMPLETED: {
        label: t.completed,
        bg: colors.successBg,
        text: colors.successText,
        icon: <CheckCircle2 size={14} />,
      },
      PROCESSING: {
        label: t.processing,
        bg: colors.summaryBg,
        text: colors.summaryText,
        icon: <Loader2 size={14} />,
      },
      PENDING: {
        label: t.pending,
        bg: colors.summaryBg,
        text: colors.summaryText,
        icon: <Clock3 size={14} />,
      },
      FAILED: {
        label: t.failed,
        bg: colors.dangerBg,
        text: colors.dangerText,
        icon: <XCircle size={14} />,
      },
      CANCELLED: {
        label: t.cancelled,
        bg: colors.dangerBg,
        text: colors.dangerText,
        icon: <Ban size={14} />,
      },
      REJECTED: {
        label: t.rejected,
        bg: colors.dangerBg,
        text: colors.dangerText,
        icon: <XCircle size={14} />,
      },
    };

    return (
      map[s] || {
        label: t.review,
        bg: colors.warningBg,
        text: colors.warningText,
        icon: <HourglassIcon size={14} />,
      }
    );
  };

  return (
    <>
      <div
        className="shrink-0 px-4 pb-4"
        style={{ backgroundColor: colors.headerBg }}
      >
        <div
          className="rounded-[4px] px-4 py-3"
          style={{
            backgroundColor: "rgba(255,255,255,0.10)",
            color: colors.headerText,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Receipt size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-[14px] font-bold">{t.subtitle}</p>
                <p className="mt-1 text-[12px] opacity-80">
                  {t.total}: {total}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {onBackToWithdraw ? (
                <button
                  type="button"
                  onClick={onBackToWithdraw}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[4px] bg-white/15"
                  style={{ color: colors.headerText }}
                >
                  <RotateCcw size={17} />
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleRefresh}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[4px] bg-white/15"
                style={{ color: colors.headerText }}
              >
                <RefreshCw
                  size={17}
                  className={isFetching ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex shrink-0 items-center gap-1 overflow-x-auto border-b px-3 py-2 [scrollbar-width:none]"
        style={{
          backgroundColor: colors.sectionBg,
          borderColor: colors.sectionBorder,
        }}
      >
        {STATUS_TABS.map((key) => {
          const isSelected = status === key;

          return (
            <button
              key={key || "ALL"}
              type="button"
              onClick={() => {
                setStatus(key);
                setPage(1);
              }}
              className="shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-bold transition"
              style={{
                backgroundColor: isSelected ? colors.primaryBg : colors.cardBg,
                color: isSelected ? colors.primaryText : colors.mutedText,
                border: `1px solid ${
                  isSelected ? colors.primaryBg : colors.cardBorder
                }`,
              }}
            >
              {key || t.all}
            </button>
          );
        })}
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ backgroundColor: colors.sectionBg }}
      >
        {isLoading ? (
          <div
            className="rounded-[6px] p-6 text-center text-[13px] shadow-sm"
            style={{ backgroundColor: colors.cardBg, color: colors.mutedText }}
          >
            {t.loading}
          </div>
        ) : rows.length ? (
          <div className="space-y-3">
            {rows.map((item) => {
              const statusInfo = statusBadge(item?.status);
              const key = String(item?.status || "").toUpperCase();

              const isReturned = ["FAILED", "CANCELLED", "REJECTED"].includes(
                key,
              );

              const methodName =
                item?.walletSnapshot?.methodName?.en ||
                item?.walletSnapshot?.methodName?.bn ||
                item?.walletSnapshot?.methodId ||
                "—";

              const proofImages = Array.isArray(item?.proofImages)
                ? item.proofImages
                : [];

              return (
                <div
                  key={item._id}
                  className="rounded-[6px] border p-4 shadow-sm"
                  style={{
                    backgroundColor: colors.cardBg,
                    borderColor: colors.cardBorder,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className="truncate text-[14px] font-bold"
                        style={{ color: colors.normalText }}
                      >
                        {methodName}
                      </p>

                      <p
                        className="mt-1 text-[12px]"
                        style={{ color: colors.mutedText }}
                      >
                        {t.date}: {formatDate(item?.createdAt)}
                      </p>
                    </div>

                    <span
                      className="flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold"
                      style={{
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.text,
                        borderColor: statusInfo.bg,
                      }}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                    <div
                      className="rounded-[4px] p-2"
                      style={{ backgroundColor: colors.summaryBg }}
                    >
                      <div
                        className="flex items-center gap-1"
                        style={{ color: colors.mutedText }}
                      >
                        <Wallet size={13} />
                        <span>{t.amount}</span>
                      </div>

                      <p
                        className="mt-1 font-bold"
                        style={{ color: colors.summaryText }}
                      >
                        {money(item?.amount)}
                      </p>
                    </div>

                    <div
                      className="rounded-[4px] p-2"
                      style={{ backgroundColor: colors.summaryBg }}
                    >
                      <div
                        className="flex items-center gap-1"
                        style={{ color: colors.mutedText }}
                      >
                        <Landmark size={13} />
                        <span>{t.method}</span>
                      </div>

                      <p
                        className="mt-1 truncate font-bold uppercase"
                        style={{ color: colors.normalText }}
                      >
                        {item?.paymentMethod || "—"}
                      </p>
                    </div>

                    <div
                      className="rounded-[4px] p-2"
                      style={{ backgroundColor: colors.summaryBg }}
                    >
                      <div
                        className="flex items-center gap-1"
                        style={{ color: colors.mutedText }}
                      >
                        <Phone size={13} />
                        <span>{t.wallet}</span>
                      </div>

                      <p
                        className="mt-1 font-bold"
                        style={{ color: colors.normalText }}
                      >
                        {item?.accountNumber || "—"}
                      </p>

                      <p
                        className="mt-1 text-[11px]"
                        style={{ color: colors.mutedText }}
                      >
                        {typeText(item?.walletSnapshot?.walletType, isBangla)}
                      </p>
                    </div>

                    <div
                      className="rounded-[4px] p-2"
                      style={{ backgroundColor: colors.summaryBg }}
                    >
                      <div
                        className="flex items-center gap-1"
                        style={{ color: colors.mutedText }}
                      >
                        <CheckCircle2 size={13} />
                        <span>{t.status}</span>
                      </div>

                      <p
                        className="mt-1 font-bold"
                        style={{ color: colors.normalText }}
                      >
                        {statusInfo.label}
                      </p>
                    </div>
                  </div>

                  {proofImages.length ? (
                    <div
                      className="mt-3 rounded-[4px] p-3"
                      style={{ backgroundColor: colors.summaryBg }}
                    >
                      <div
                        className="flex items-center gap-1 text-[12px] font-semibold"
                        style={{ color: colors.summaryText }}
                      >
                        <Images size={13} />
                        {t.proof}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {proofImages.map((url, idx) => (
                          <button
                            key={url}
                            type="button"
                            onClick={() =>
                              setViewer({ images: proofImages, index: idx })
                            }
                            className="h-12 w-12 cursor-pointer overflow-hidden rounded-[4px] border transition active:scale-95"
                            style={{ borderColor: colors.cardBorder }}
                          >
                            <img
                              src={getImageUrl(url)}
                              alt={`proof ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {isReturned || item?.adminNote || item?.failureReason ? (
                    <div
                      className="mt-3 rounded-[4px] p-3"
                      style={{ backgroundColor: colors.summaryBg }}
                    >
                      {isReturned ? (
                        <p
                          className="text-[12px] font-semibold"
                          style={{ color: colors.successText }}
                        >
                          {t.refundNote}
                        </p>
                      ) : null}

                      {item?.adminNote ? (
                        <p
                          className="mt-1 text-[12px]"
                          style={{ color: colors.mutedText }}
                        >
                          {t.adminNote}: {item.adminNote}
                        </p>
                      ) : null}

                      {item?.failureReason ? (
                        <p
                          className="mt-1 text-[12px]"
                          style={{ color: colors.dangerText }}
                        >
                          {t.reason}: {item.failureReason}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div
                    className="mt-3 grid grid-cols-2 gap-2 text-[11px]"
                    style={{ color: colors.mutedText }}
                  >
                    <span className="truncate">
                      {t.invoice}: {item?.invoiceNumber}
                    </span>

                    <span className="truncate text-right">
                      {item?.completedAt
                        ? `${t.completedAt}: ${formatDate(item.completedAt)}`
                        : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-[6px] p-6 text-center text-[13px] shadow-sm"
            style={{ backgroundColor: colors.cardBg, color: colors.mutedText }}
          >
            {t.empty}
          </div>
        )}
      </div>

      {totalPages > 1 ? (
        <div
          className="flex shrink-0 items-center justify-between border-t px-4 py-3"
          style={{
            backgroundColor: colors.sectionBg,
            borderColor: colors.sectionBorder,
          }}
        >
          <button
            type="button"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex cursor-pointer items-center gap-1 rounded-[4px] border px-3 py-2 text-[12px] font-bold disabled:opacity-40"
            style={{
              borderColor: colors.cardBorder,
              backgroundColor: colors.cardBg,
              color: colors.normalText,
            }}
          >
            <ChevronLeft size={13} />
            {t.prev}
          </button>

          <span
            className="text-[12px] font-bold"
            style={{ color: colors.mutedText }}
          >
            {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex cursor-pointer items-center gap-1 rounded-[4px] border px-3 py-2 text-[12px] font-bold disabled:opacity-40"
            style={{
              borderColor: colors.cardBorder,
              backgroundColor: colors.cardBg,
              color: colors.normalText,
            }}
          >
            {t.next}
            <ChevronRight size={13} />
          </button>
        </div>
      ) : null}

      <ProofLightbox viewer={viewer} setViewer={setViewer} />
    </>
  );
};

export default AutoWithdrawModalHistory;
