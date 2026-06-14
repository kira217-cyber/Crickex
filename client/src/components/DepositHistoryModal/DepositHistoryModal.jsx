import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  History,
  Wallet,
  BanknoteArrowDown,
  Gamepad2,
  Landmark,
  RotateCcw,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import AutoDepositModalHistory from "../AutoDepositModalHistory/AutoDepositModalHistory";
import WithdrawHistoryModal from "../WithdrawHistoryModal/WithdrawHistoryModal";

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

const getStatusClass = (status) => {
  const s = String(status || "").toLowerCase();

  if (s === "approved") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (s === "rejected") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  return "bg-yellow-100 text-yellow-700 border-yellow-200";
};

const getTransactionText = (item) => {
  return (
    item?.fields?.transactionId ||
    item?.fields?.trxId ||
    item?.fields?.trx_id ||
    item?.fields?.reference ||
    item?.fields?.senderNumber ||
    item?._id ||
    "N/A"
  );
};

const DepositHistoryModal = ({ open, onClose, onBackToDeposit }) => {
  const { isBangla, language } = useLanguage();

  const [activeTab, setActiveTab] = useState("deposit");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const limit = 10;

  const t = {
    withdrawHistory: isBangla ? "উইথড্র হিস্টোরি" : "Withdraw History",
    betHistory: isBangla ? "বেট হিস্টোরি" : "Bet History",
    depositHistory: isBangla ? "ডিপোজিট হিস্টোরি" : "Deposit History",
    autoDepositHistory: isBangla
      ? "অটো ডিপোজিট হিস্টোরি"
      : "Auto Deposit History",
    turnoverHistory: isBangla ? "টার্নওভার হিস্টোরি" : "Turnover History",

    subtitle: isBangla
      ? "আপনার ডিপোজিট রিকোয়েস্ট লিস্ট"
      : "Your deposit request list",
    all: isBangla ? "সব" : "All",
    pending: isBangla ? "পেন্ডিং" : "Pending",
    approved: isBangla ? "অ্যাপ্রুভড" : "Approved",
    rejected: isBangla ? "রিজেক্টেড" : "Rejected",
    searchPlaceholder: isBangla
      ? "ট্রানজেকশন / মেথড / চ্যানেল"
      : "Transaction / Method / Channel",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    noData: isBangla
      ? "কোনো ডিপোজিট হিস্টোরি পাওয়া যায়নি"
      : "No deposit history found",
    channel: isBangla ? "চ্যানেল" : "Channel",
    amount: isBangla ? "এমাউন্ট" : "Amount",
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
    comingSoon: isBangla ? "শীঘ্রই আসছে" : "Coming Soon",
    comingSoonText: isBangla
      ? "এই হিস্টোরি সার্ভিস খুব শীঘ্রই চালু হবে।"
      : "This history service will be available soon.",
  };

  const tabs = [
    {
      key: "withdraw",
      label: t.withdrawHistory,
      icon: <BanknoteArrowDown size={16} />,
    },
    {
      key: "bet",
      label: t.betHistory,
      icon: <Gamepad2 size={16} />,
    },
    {
      key: "deposit",
      label: t.depositHistory,
      icon: <Wallet size={16} />,
    },
    {
      key: "autoDeposit",
      label: t.autoDepositHistory,
      icon: <Landmark size={16} />,
    },
    {
      key: "turnover",
      label: t.turnoverHistory,
      icon: <RotateCcw size={16} />,
    },
  ];

  const title = useMemo(() => {
    return tabs.find((tab) => tab.key === activeTab)?.label || t.depositHistory;
  }, [activeTab, tabs, t.depositHistory]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));

    if (status !== "all") {
      params.append("status", status);
    }

    return params.toString();
  }, [page, status]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["deposit-history-modal", queryParams],
    queryFn: async () => {
      const res = await api.get(`/api/deposit-requests/my?${queryParams}`);
      return res.data;
    },
    enabled: open && activeTab === "deposit",
    keepPreviousData: true,
    staleTime: 15000,
  });

  const rows = useMemo(() => {
    const list = Array.isArray(data?.data) ? data.data : [];

    if (!search.trim()) return list;

    const q = search.trim().toLowerCase();

    return list.filter((item) => {
      const transaction = getTransactionText(item).toLowerCase();
      const method = String(item?.methodId || "").toLowerCase();
      const channel = String(item?.channelId || "").toLowerCase();
      const methodNameBn = String(
        item?.display?.methodName?.bn || "",
      ).toLowerCase();
      const methodNameEn = String(
        item?.display?.methodName?.en || "",
      ).toLowerCase();

      return (
        transaction.includes(q) ||
        method.includes(q) ||
        channel.includes(q) ||
        methodNameBn.includes(q) ||
        methodNameEn.includes(q)
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

  const getMethodName = (item) => {
    return language === "Bangla"
      ? item?.display?.methodName?.bn ||
          item?.display?.methodName?.en ||
          item?.methodId ||
          "—"
      : item?.display?.methodName?.en ||
          item?.display?.methodName?.bn ||
          item?.methodId ||
          "—";
  };

  const getChannelName = (item) => {
    return language === "Bangla"
      ? item?.display?.channelName?.bn ||
          item?.display?.channelName?.en ||
          item?.channelId ||
          "—"
      : item?.display?.channelName?.en ||
          item?.display?.channelName?.bn ||
          item?.channelId ||
          "—";
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
    setSearch("");
    setSearchInput("");
  };

  const TransactionTab = () => {
    return (
      <div className="shrink-0 bg-[#0865a9] px-3 pb-3">
        <div className="overflow-x-auto">
          <div className="flex min-w-max items-center gap-2">
            {tabs.map((tab) => {
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex h-[36px] cursor-pointer items-center gap-2 rounded-[4px] px-3 text-[12px] font-bold transition ${
                    active
                      ? "bg-[#2e9bf3] text-white shadow-sm"
                      : "bg-[#00518c] text-white/85 hover:bg-[#0b6cad]"
                  }`}
                >
                  {tab.icon}
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const ComingSoon = () => {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#f3f7fb] px-5">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eaf4ff] text-[#0865a9]">
            <Clock size={42} />
          </div>

          <h3 className="mt-5 text-[24px] font-bold text-[#0865a9]">
            {t.comingSoon}
          </h3>

          <p className="mx-auto mt-2 max-w-[280px] text-[14px] leading-6 text-[#666]">
            {t.comingSoonText}
          </p>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 px-0 backdrop-blur-[3px] sm:px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-screen w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[700px] sm:max-w-[430px] sm:rounded-[8px]"
          >
            <div className="relative flex h-[50px] shrink-0 items-center justify-center bg-[#0865a9] text-white">
              <h2 className="text-[18px] font-semibold">{title}</h2>

              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center text-white"
              >
                <X size={24} />
              </button>
            </div>

            <TransactionTab />

            {activeTab === "deposit" ? (
              <>
                <div className="shrink-0 bg-[#0865a9] px-4 pb-4">
                  <div className="rounded-[4px] bg-white/10 px-4 py-3 text-white">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                        <History size={20} />
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
                        <option value="approved">{t.approved}</option>
                        <option value="rejected">{t.rejected}</option>
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
                        const statusText = String(item?.status || "pending");

                        return (
                          <div
                            key={item._id}
                            className="rounded-[6px] border border-[#dce8f5] bg-white p-4 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-[14px] font-bold text-[#222]">
                                  {getMethodName(item)}
                                </p>

                                <p className="mt-1 text-[12px] text-[#777]">
                                  {t.channel}: {getChannelName(item)}
                                </p>

                                <p className="mt-1 break-all text-[12px] text-[#777]">
                                  {t.transaction}: {getTransactionText(item)}
                                </p>
                              </div>

                              <span
                                className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-bold capitalize ${getStatusClass(
                                  statusText,
                                )}`}
                              >
                                {statusText}
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                              <div className="rounded-[4px] bg-[#f4f8ff] p-2">
                                <p className="text-[#777]">{t.amount}</p>
                                <p className="mt-1 font-bold text-[#222]">
                                  {money(item?.amount)}
                                </p>
                              </div>

                              <div className="rounded-[4px] bg-[#f4f8ff] p-2">
                                <p className="text-[#777]">{t.bonus}</p>
                                <p className="mt-1 font-bold text-[#0865a9]">
                                  {money(item?.calc?.totalBonus)}
                                </p>
                              </div>

                              <div className="rounded-[4px] bg-[#f4f8ff] p-2">
                                <p className="text-[#777]">{t.credited}</p>
                                <p className="mt-1 font-bold text-green-700">
                                  {money(item?.calc?.creditedAmount)}
                                </p>
                              </div>

                              <div className="rounded-[4px] bg-[#f4f8ff] p-2">
                                <p className="text-[#777]">{t.turnover}</p>
                                <p className="mt-1 font-bold text-[#222]">
                                  x{item?.calc?.turnoverMultiplier || 1}
                                </p>
                              </div>
                            </div>

                            <p className="mt-3 text-[12px] text-[#777]">
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
                      onClick={() => {
                        onClose?.();
                        onBackToDeposit?.();
                      }}
                      className="h-[38px] cursor-pointer rounded-[4px] bg-[#0865a9] text-[13px] font-bold text-white"
                    >
                      {t.depositAgain}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={page >= totalPages || isFetching}
                      className="flex h-[38px] cursor-pointer items-center justify-center gap-1 rounded-[4px] border border-[#d7d7d7] bg-white text-[13px] text-[#333] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {t.next}
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : activeTab === "autoDeposit" ? (
              <AutoDepositModalHistory
                onBackToDeposit={() => {
                  onClose?.();
                  onBackToDeposit?.();
                }}
              />
            ) : activeTab === "withdraw" ? (
              <WithdrawHistoryModal
                onBackToWithdraw={() => {
                  onClose?.();
                }}
              />
            ) : (
              <ComingSoon />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DepositHistoryModal;
