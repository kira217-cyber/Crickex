import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Wallet,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Plus,
  Phone,
  CheckCircle2,
  Info,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectIsAuth, selectUser } from "../../features/auth/authSelectors";

const money = (value) => {
  const num = Number(value || 0);
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
};

const normalizePhone = (value) => String(value || "").replace(/[^\d]/g, "");

const walletTypes = [
  { key: "personal", bn: "পার্সোনাল", en: "Personal" },
  { key: "agent", bn: "এজেন্ট", en: "Agent" },
  { key: "merchant", bn: "মার্চেন্ট", en: "Merchant" },
];

const WithdrawModal = ({ open, onClose, onHistoryClick, onDepositClick }) => {
  const { isBangla, language } = useLanguage();

  const isAuthenticated = useSelector(selectIsAuth);
  const user = useSelector(selectUser);

  const [loading, setLoading] = useState(true);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const [methods, setMethods] = useState([]);
  const [wallets, setWallets] = useState([]);

  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [showAddWallet, setShowAddWallet] = useState(false);

  const [amount, setAmount] = useState("");
  const [walletType, setWalletType] = useState("personal");
  const [walletNumber, setWalletNumber] = useState("");
  const [walletLabel, setWalletLabel] = useState("");

  const [submittingWallet, setSubmittingWallet] = useState(false);
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  const [eligibility, setEligibility] = useState({
    eligible: false,
    hasRunningTurnover: false,
    hasPendingWithdraw: false,
    remaining: 0,
    message: "",
  });

  const t = {
    title: isBangla ? "উইথড্র" : "Withdraw",
    history: isBangla ? "হিস্টোরি" : "History",
    deposit: isBangla ? "ডিপোজিট" : "Deposit",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    loginRequired: isBangla
      ? "উইথড্র করতে আগে লগইন করুন"
      : "Please login first to withdraw.",
    method: isBangla ? "উইথড্র মেথড নির্বাচন করুন" : "Select Withdraw Method",
    wallet: isBangla ? "ওয়ালেট নির্বাচন করুন" : "Select Wallet",
    addWallet: isBangla ? "ওয়ালেট যোগ করুন" : "Add Wallet",
    closeWallet: isBangla ? "ওয়ালেট ফর্ম বন্ধ করুন" : "Close Wallet Form",
    maxWalletText: isBangla
      ? "প্রতিটি মেথডে সর্বোচ্চ ২টি নাম্বার যোগ করা যাবে।"
      : "You can add maximum 2 numbers for each method.",
    maxWalletReached: isBangla
      ? "এই মেথডে ২টির বেশি নাম্বার যোগ করা যাবে না।"
      : "You cannot add more than 2 numbers for this method.",
    walletType: isBangla ? "ওয়ালেট টাইপ" : "Wallet Type",
    walletNumber: isBangla ? "ওয়ালেট নাম্বার" : "Wallet Number",
    walletLabelPlaceholder: isBangla ? "যেমন: আমার নাম্বার" : "e.g. My number",
    amount: isBangla ? "উইথড্র এমাউন্ট" : "Withdraw Amount",
    enterAmount: isBangla ? "এমাউন্ট লিখুন" : "Enter amount",
    min: isBangla ? "সর্বনিম্ন" : "Min",
    max: isBangla ? "সর্বোচ্চ" : "Max",
    submit: isBangla ? "উইথড্র সাবমিট" : "Submit Withdraw",
    processing: isBangla ? "প্রসেস হচ্ছে..." : "Processing...",
    walletSaving: isBangla ? "ওয়ালেট সেভ হচ্ছে..." : "Saving wallet...",
    noMethod: isBangla
      ? "কোনো active withdraw method পাওয়া যায়নি"
      : "No active withdraw method found",
    noWallet: isBangla
      ? "এই মেথডের জন্য কোনো wallet নেই। Add Wallet বাটনে ক্লিক করে wallet যোগ করুন।"
      : "No wallet for this method. Click Add Wallet to add one.",
    turnoverTitle: isBangla ? "টার্নওভার বাকি আছে" : "Turnover Required",
    pendingTitle: isBangla ? "পেন্ডিং উইথড্র আছে" : "Pending Withdraw Exists",
    eligibleTitle: isBangla ? "উইথড্র করা যাবে" : "Withdraw Available",
    remaining: isBangla ? "বাকি টার্নওভার" : "Remaining Turnover",
    balance: isBangla ? "ব্যালেন্স" : "Balance",
    invalidAmount: isBangla ? "সঠিক এমাউন্ট দিন" : "Enter valid amount",
    invalidWallet: isBangla
      ? "একটি wallet নির্বাচন করুন"
      : "Please select a wallet",
    invalidMethod: isBangla
      ? "একটি withdraw method নির্বাচন করুন"
      : "Please select withdraw method",
    invalidPhone: isBangla
      ? "সঠিক বাংলাদেশি নাম্বার দিন"
      : "Enter a valid Bangladeshi phone number",
    walletCreated: isBangla ? "ওয়ালেট যোগ হয়েছে" : "Wallet added",
    requestCreated: isBangla
      ? "উইথড্র request submit হয়েছে"
      : "Withdraw request submitted",
    secureText: isBangla
      ? "টার্নওভার পূরণ না হলে withdraw করা যাবে না"
      : "Withdraw is blocked until turnover is completed",
  };

  const selectedMethod = useMemo(
    () =>
      methods.find(
        (item) => String(item.methodId) === String(selectedMethodId),
      ) || null,
    [methods, selectedMethodId],
  );

  const methodWallets = useMemo(() => {
    if (!selectedMethodId) return [];
    return wallets.filter(
      (item) => String(item.methodId) === String(selectedMethodId),
    );
  }, [wallets, selectedMethodId]);

  const selectedWallet = useMemo(
    () =>
      methodWallets.find(
        (item) => String(item._id) === String(selectedWalletId),
      ) || null,
    [methodWallets, selectedWalletId],
  );

  const amountNum = Number(amount || 0);
  const minAmount = Number(selectedMethod?.minimumWithdrawAmount || 0);
  const maxAmount = Number(selectedMethod?.maximumWithdrawAmount || 0);
  const userBalance = Number(user?.balance || 0);
  const walletLimitReached = methodWallets.length >= 2;

  const amountValid =
    Number.isFinite(amountNum) &&
    amountNum > 0 &&
    (minAmount <= 0 || amountNum >= minAmount) &&
    (maxAmount <= 0 || amountNum <= maxAmount) &&
    amountNum <= userBalance;

  const canWithdraw =
    isAuthenticated &&
    eligibility?.eligible &&
    selectedMethodId &&
    selectedWalletId &&
    amountValid &&
    !submittingWithdraw;

  const loadMethods = async () => {
    const { data } = await api.get("/api/withdraw-methods/public");
    const list = Array.isArray(data?.data) ? data.data : [];

    setMethods(list);

    if (list.length && !selectedMethodId) {
      setSelectedMethodId(list[0].methodId);
    }
  };

  const loadWallets = async (methodId = selectedMethodId) => {
    if (!methodId || !isAuthenticated) return;

    const { data } = await api.get("/api/e-wallets", {
      params: { methodId },
    });

    const list = Array.isArray(data?.data) ? data.data : [];

    setWallets((prev) => {
      const other = prev.filter((item) => item.methodId !== methodId);
      return [...other, ...list];
    });

    const defaultWallet = list.find((item) => item.isDefault) || list[0];
    setSelectedWalletId(defaultWallet?._id || "");
  };

  const loadEligibility = async () => {
    if (!isAuthenticated) {
      setEligibility({
        eligible: false,
        hasRunningTurnover: false,
        hasPendingWithdraw: false,
        remaining: 0,
        message: t.loginRequired,
      });
      return;
    }

    const { data } = await api.get("/api/withdraw-requests/eligibility");

    setEligibility({
      eligible: !!data?.data?.eligible,
      hasRunningTurnover: !!data?.data?.hasRunningTurnover,
      hasPendingWithdraw: !!data?.data?.hasPendingWithdraw,
      remaining: Number(data?.data?.remaining || 0),
      message: data?.data?.message || "",
    });
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      setEligibilityLoading(true);
      await Promise.all([loadMethods(), loadEligibility()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load withdraw");
    } finally {
      setLoading(false);
      setEligibilityLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    setShowAddWallet(false);
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || !selectedMethodId || !isAuthenticated) return;

    setShowAddWallet(false);
    loadWallets(selectedMethodId).catch((error) => {
      toast.error(error?.response?.data?.message || "Failed to load wallets");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedMethodId, isAuthenticated]);

  const handleSelectMethod = (methodId) => {
    setSelectedMethodId(methodId);
    setSelectedWalletId("");
    setShowAddWallet(false);
  };

  const handleAddWallet = async () => {
    if (!isAuthenticated) return toast.error(t.loginRequired);
    if (!selectedMethodId) return toast.error(t.invalidMethod);

    if (walletLimitReached) {
      toast.error(t.maxWalletReached);
      return;
    }

    const number = normalizePhone(walletNumber);

    if (!/^01[3-9]\d{8}$/.test(number)) {
      toast.error(t.invalidPhone);
      return;
    }

    try {
      setSubmittingWallet(true);

      const { data } = await api.post("/api/e-wallets", {
        methodId: selectedMethodId,
        walletType,
        walletNumber: number,
        label: walletLabel,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Wallet create failed");
      }

      toast.success(data?.message || t.walletCreated);

      setWalletNumber("");
      setWalletLabel("");
      setWalletType("personal");

      await loadWallets(selectedMethodId);
      setSelectedWalletId(data?.data?._id || "");
      setShowAddWallet(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
    } finally {
      setSubmittingWallet(false);
    }
  };

  const handleWithdraw = async () => {
    if (!isAuthenticated) return toast.error(t.loginRequired);
    if (!eligibility?.eligible)
      return toast.error(eligibility?.message || t.secureText);
    if (!selectedMethodId) return toast.error(t.invalidMethod);
    if (!selectedWalletId) return toast.error(t.invalidWallet);
    if (!amountValid) return toast.error(t.invalidAmount);

    try {
      setSubmittingWithdraw(true);

      const { data } = await api.post("/api/withdraw-requests", {
        methodId: selectedMethodId,
        walletId: selectedWalletId,
        amount: amountNum,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Withdraw request failed");
      }

      toast.success(data?.message || t.requestCreated);
      setAmount("");

      await loadEligibility();
      onClose?.();
      onHistoryClick?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  const EligibilityBox = () => {
    if (eligibilityLoading) {
      return (
        <div className="rounded-[4px] border border-[#dce8f5] bg-[#eef4ff] p-3 text-[#0865a9]">
          <div className="flex items-center gap-2 text-[13px] font-bold">
            <Loader2 size={15} className="animate-spin" />
            {t.loading}
          </div>
        </div>
      );
    }

    if (eligibility?.hasRunningTurnover) {
      return (
        <div className="rounded-[4px] border border-yellow-300 bg-yellow-50 p-3">
          <div className="flex items-start gap-2 text-yellow-700">
            <AlertCircle size={17} className="mt-[1px] shrink-0" />
            <div>
              <p className="text-[13px] font-bold">{t.turnoverTitle}</p>
              <p className="mt-1 text-[12px] leading-5">
                {t.remaining}: {money(eligibility.remaining)}
              </p>
              <p className="mt-1 text-[12px] leading-5">
                {eligibility.message || t.secureText}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (eligibility?.hasPendingWithdraw) {
      return (
        <div className="rounded-[4px] border border-yellow-300 bg-yellow-50 p-3">
          <div className="flex items-start gap-2 text-yellow-700">
            <AlertCircle size={17} className="mt-[1px] shrink-0" />
            <div>
              <p className="text-[13px] font-bold">{t.pendingTitle}</p>
              <p className="mt-1 text-[12px] leading-5">
                {eligibility.message}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-[4px] border border-green-200 bg-green-50 p-3">
        <div className="flex items-start gap-2 text-green-700">
          <CheckCircle2 size={17} className="mt-[1px] shrink-0" />
          <div>
            <p className="text-[13px] font-bold">{t.eligibleTitle}</p>
            <p className="mt-1 text-[12px] leading-5">{t.secureText}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/45 px-0 backdrop-blur-[3px] sm:px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-screen w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[700px] sm:max-w-[375px] sm:rounded-[8px]"
          >
            <div className="relative flex h-[50px] shrink-0 items-center justify-center bg-[#0865a9] text-white">
              <h2 className="text-[18px] font-semibold">{t.title}</h2>

              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex h-[52px] shrink-0 items-center gap-1 bg-[#0865a9] px-4 pb-3">
              <button
                type="button"
                onClick={onDepositClick}
                className="h-[34px] flex-1 cursor-pointer rounded-[3px] bg-[#00518c] text-[13px] font-bold text-white"
              >
                {t.deposit}
              </button>

              <button
                type="button"
                className="h-[34px] flex-1 cursor-pointer rounded-[3px] bg-[#2e9bf3] text-[13px] font-bold text-white"
              >
                {t.title}
              </button>

            </div>

            {loading ? (
              <div className="flex flex-1 items-center justify-center bg-white">
                <div className="flex items-center gap-2 text-[14px] font-semibold text-[#0865a9]">
                  <Loader2 size={18} className="animate-spin" />
                  {t.loading}
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto bg-white px-4 pb-5 pt-3">
                  <EligibilityBox />

                  <div className="mt-4 rounded-[4px] border border-[#dce8f5] bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[#0865a9]">
                        <Wallet size={18} />
                        <span className="text-[14px] font-bold">
                          {t.balance}
                        </span>
                      </div>

                      <span className="text-[14px] font-bold text-green-600">
                        {money(userBalance)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[4px] border border-[#dce8f5] bg-white p-3 shadow-sm">
                    <p className="text-[14px] font-bold text-[#0865a9]">
                      {t.method}
                    </p>

                    {methods.length ? (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {methods.map((method) => {
                          const active =
                            String(method.methodId) ===
                            String(selectedMethodId);

                          const name =
                            language === "Bangla"
                              ? method?.name?.bn || method?.name?.en
                              : method?.name?.en || method?.name?.bn;

                          return (
                            <button
                              key={method._id}
                              type="button"
                              onClick={() =>
                                handleSelectMethod(method.methodId)
                              }
                              className={`flex min-h-[82px] cursor-pointer flex-col items-center justify-center rounded-[6px] border transition ${
                                active
                                  ? "border-[#0865a9] bg-[#eaf4ff] shadow-sm"
                                  : "border-[#dce8f5] bg-[#f7f9fd]"
                              }`}
                            >
                              <div className="flex h-10 w-10 items-center justify-center overflow-hidden bg-white">
                                {method.logoUrl ? (
                                  <img
                                    src={getImageUrl(method.logoUrl)}
                                    alt={name || method.methodId}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <Wallet
                                    size={20}
                                    className="text-[#0865a9]"
                                  />
                                )}
                              </div>

                              <span
                                className={`mt-1 line-clamp-1 text-[11px] font-bold ${
                                  active ? "text-[#0865a9]" : "text-[#333]"
                                }`}
                              >
                                {name || method.methodId}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-3 text-[13px] text-[#777]">
                        {t.noMethod}
                      </p>
                    )}

                    {selectedMethod ? (
                      <div className="mt-2 text-[12px] text-[#777]">
                        {t.min}: {money(minAmount)} | {t.max}:{" "}
                        {maxAmount > 0 ? money(maxAmount) : "∞"}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 rounded-[4px] border border-[#dce8f5] bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[#0865a9]">
                        <Phone size={18} />
                        <span className="text-[14px] font-bold">
                          {t.wallet}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (walletLimitReached && !showAddWallet) {
                            toast.info(t.maxWalletReached);
                            return;
                          }
                          setShowAddWallet((prev) => !prev);
                        }}
                        className="flex h-[30px] cursor-pointer items-center gap-1 rounded-[4px] bg-[#0865a9] px-2 text-[11px] font-bold text-white"
                      >
                        {showAddWallet ? (
                          <ChevronUp size={14} />
                        ) : (
                          <Plus size={14} />
                        )}
                        {showAddWallet ? t.closeWallet : t.addWallet}
                      </button>
                    </div>

                    <p className="mt-2 rounded bg-[#eef5ff] p-2 text-[11px] leading-4 text-[#0865a9]">
                      {t.maxWalletText}
                    </p>

                    {methodWallets.length ? (
                      <div className="mt-3 space-y-2">
                        {methodWallets.map((wallet) => {
                          const active =
                            String(wallet._id) === String(selectedWalletId);

                          return (
                            <button
                              key={wallet._id}
                              type="button"
                              onClick={() => setSelectedWalletId(wallet._id)}
                              className={`flex w-full cursor-pointer items-center justify-between rounded-[5px] border p-3 text-left transition ${
                                active
                                  ? "border-[#0865a9] bg-[#eaf4ff]"
                                  : "border-[#dce8f5] bg-[#f7f9fd]"
                              }`}
                            >
                              <div>
                                <p className="text-[13px] font-bold text-[#222]">
                                  {wallet.walletNumber}
                                </p>
                                <p className="mt-1 text-[11px] text-[#777]">
                                  {wallet.label ||
                                    wallet.walletType ||
                                    "personal"}
                                </p>
                              </div>

                              {active ? (
                                <CheckCircle2
                                  size={18}
                                  className="text-green-600"
                                />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-3 text-[12px] text-[#777]">
                        {t.noWallet}
                      </p>
                    )}

                    <AnimatePresence>
                      {showAddWallet && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 grid grid-cols-1 gap-2 rounded-[5px] border border-[#dce8f5] bg-[#fafcff] p-3">
                            {walletLimitReached ? (
                              <div className="rounded bg-yellow-50 p-2 text-[12px] text-yellow-700">
                                {t.maxWalletReached}
                              </div>
                            ) : (
                              <>
                                <select
                                  value={walletType}
                                  onChange={(e) =>
                                    setWalletType(e.target.value)
                                  }
                                  className="h-[40px] rounded-[4px] border border-[#d7d7d7] bg-[#eeeeee] px-3 text-[13px] text-[#222] outline-none focus:border-[#0865a9]"
                                >
                                  {walletTypes.map((type) => (
                                    <option key={type.key} value={type.key}>
                                      {isBangla ? type.bn : type.en}
                                    </option>
                                  ))}
                                </select>

                                <input
                                  value={walletNumber}
                                  onChange={(e) =>
                                    setWalletNumber(
                                      normalizePhone(e.target.value),
                                    )
                                  }
                                  placeholder="01XXXXXXXXX"
                                  inputMode="numeric"
                                  className="h-[40px] rounded-[4px] border border-[#d7d7d7] bg-[#eeeeee] px-3 text-[13px] text-[#222] outline-none focus:border-[#0865a9]"
                                />

                                <input
                                  value={walletLabel}
                                  onChange={(e) =>
                                    setWalletLabel(e.target.value)
                                  }
                                  placeholder={t.walletLabelPlaceholder}
                                  className="h-[40px] rounded-[4px] border border-[#d7d7d7] bg-[#eeeeee] px-3 text-[13px] text-[#222] outline-none focus:border-[#0865a9]"
                                />

                                <button
                                  type="button"
                                  onClick={handleAddWallet}
                                  disabled={
                                    submittingWallet || !selectedMethodId
                                  }
                                  className="h-[36px] cursor-pointer rounded-[4px] bg-[#0865a9] text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#999]"
                                >
                                  {submittingWallet
                                    ? t.walletSaving
                                    : t.addWallet}
                                </button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-4 rounded-[4px] border border-[#dce8f5] bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-[#0865a9]">
                      <Wallet size={18} />
                      <span className="text-[14px] font-bold">{t.amount}</span>
                    </div>

                    <input
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value.replace(/[^\d.]/g, ""))
                      }
                      placeholder={t.enterAmount}
                      inputMode="decimal"
                      className="mt-3 h-[42px] w-full rounded-[4px] border border-[#d7d7d7] bg-[#eeeeee] px-4 text-[14px] text-[#222] outline-none focus:border-[#0865a9]"
                    />

                    <div className="mt-2 text-[12px] text-[#777]">
                      {t.min}: {money(minAmount)} | {t.max}:{" "}
                      {maxAmount > 0 ? money(maxAmount) : "∞"}
                    </div>
                  </div>

                  <div className="mt-4 rounded-[4px] border border-[#97b6e9] bg-[#eef4ff] p-3">
                    <div className="flex items-start gap-2 text-[#2451cc]">
                      <Info size={17} className="mt-[1px] shrink-0" />
                      <p className="text-[12px] leading-[18px]">
                        {t.secureText}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 bg-white px-4 pb-4">
                  <div className="mb-3 flex items-center justify-center gap-2 text-[12px] text-[#777]">
                    <ShieldCheck size={14} />
                    <span>
                      {eligibility?.eligible
                        ? t.eligibleTitle
                        : eligibility?.message || t.secureText}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleWithdraw}
                    disabled={!canWithdraw}
                    className="relative h-[38px] w-full cursor-pointer rounded-[2px] bg-[#0865a9] text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#a6a6a6]"
                  >
                    {submittingWithdraw ? t.processing : t.submit}

                    {!canWithdraw ? (
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[#333] bg-[#e95b5b] text-white">
                        <AlertCircle size={15} />
                      </span>
                    ) : (
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-green-700 bg-green-500 text-white">
                        <CheckCircle2 size={15} />
                      </span>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WithdrawModal;
