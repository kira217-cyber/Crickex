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
} from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectIsAuth, selectUser } from "../../features/auth/authSelectors";
import { selectModalColorSetting } from "../../features/global/globalSelectors";

const defaultModalColors = {
  modalBg: "#ffffff",
  pageOverlayBg: "rgba(0,0,0,0.45)",

  headerBg: "#0865a9",
  headerText: "#ffffff",
  closeIconColor: "#ffffff",

  primaryBg: "#0865a9",
  primaryText: "#ffffff",

  secondaryBg: "#2e9bf3",
  secondaryText: "#ffffff",

  inactiveTabBg: "#00518c",
  inactiveTabText: "#ffffff",

  sectionBg: "#eef4ff",
  sectionBorder: "#97b6e9",
  sectionText: "#2451cc",

  cardBg: "#ffffff",
  cardBorder: "#dce8f5",

  inputBg: "#eeeeee",
  inputText: "#222222",
  inputBorder: "#d7d7d7",
  inputFocusBorder: "#0865a9",

  labelText: "#333333",
  normalText: "#333333",
  mutedText: "#777777",

  summaryBg: "#eef7ff",
  summaryText: "#0865a9",

  disabledBg: "#a6a6a6",
  disabledText: "#ffffff",

  dangerBg: "#e95b5b",
  dangerText: "#ffffff",

  successBg: "#22c55e",
  successText: "#ffffff",
};

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

const walletTypes = [{ key: "personal", bn: "পার্সোনাল", en: "Personal" }];

const AutoWithdrawModal = ({ open, onClose, onWithdrawClick, onHistoryClick }) => {
  const { isBangla } = useLanguage();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuth);

  const modalColorSetting = useSelector(selectModalColorSetting);
  const colors = {
    ...defaultModalColors,
    ...(modalColorSetting || {}),
  };

  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [methods, setMethods] = useState([]);
  const [globalMin, setGlobalMin] = useState(0);
  const [globalMax, setGlobalMax] = useState(0);

  const [wallets, setWallets] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState("");

  const [amount, setAmount] = useState("");
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [walletType, setWalletType] = useState("personal");
  const [walletNumber, setWalletNumber] = useState("");
  const [walletLabel, setWalletLabel] = useState("");

  const [submittingWallet, setSubmittingWallet] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [eligibility, setEligibility] = useState({
    eligible: true,
    hasRunningTurnover: false,
    hasPendingWithdraw: false,
    remaining: 0,
    message: "",
  });

  const t = {
    title: isBangla ? "অটো উইথড্র" : "Auto Withdraw",
    withdraw: isBangla ? "উইথড্র" : "Withdraw",
    history: isBangla ? "হিস্টোরি" : "History",

    selectMethod: isBangla ? "মেথড নির্বাচন করুন" : "Select Method",
    selectWallet: isBangla ? "ওয়ালেট নির্বাচন করুন" : "Select Wallet",
    addWallet: isBangla ? "নতুন ওয়ালেট যোগ করুন" : "Add New Wallet",
    walletNumber: isBangla ? "ওয়ালেট নাম্বার" : "Wallet Number",
    walletLabel: isBangla ? "লেবেল (ঐচ্ছিক)" : "Label (optional)",
    walletTypeLabel: isBangla ? "ওয়ালেট টাইপ" : "Wallet Type",
    save: isBangla ? "সেভ করুন" : "Save",
    cancel: isBangla ? "বাতিল" : "Cancel",

    amount: isBangla ? "উইথড্র এমাউন্ট" : "Withdraw Amount",
    enterAmount: isBangla ? "এমাউন্ট লিখুন" : "Enter amount",
    min: isBangla ? "সর্বনিম্ন" : "Min",
    max: isBangla ? "সর্বোচ্চ" : "Max",
    balance: isBangla ? "ব্যালেন্স" : "Balance",
    submit: isBangla ? "সাবমিট" : "Submit",
    processing: isBangla ? "প্রসেস হচ্ছে..." : "Processing...",

    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    disabledTitle: isBangla ? "অটো উইথড্র বন্ধ" : "Auto Withdraw Disabled",
    disabledText: isBangla
      ? "এই মুহূর্তে অটো উইথড্র সার্ভিস বন্ধ আছে।"
      : "Auto withdraw service is currently disabled.",
    loginRequired: isBangla
      ? "অটো উইথড্র করতে আগে লগইন করুন"
      : "Please login first to use auto withdraw.",
    noMethod: isBangla
      ? "কোনো অটো উইথড্র মেথড পাওয়া যায়নি।"
      : "No auto withdraw method available.",
    noWallet: isBangla
      ? "এই মেথডে কোনো ওয়ালেট নেই। নতুন একটি যোগ করুন।"
      : "No wallet for this method. Please add one.",
    invalidAmount: isBangla ? "সঠিক এমাউন্ট দিন" : "Enter valid amount",
    invalidPhone: isBangla
      ? "সঠিক মোবাইল নাম্বার দিন"
      : "Enter a valid mobile number",
    pickWallet: isBangla ? "একটি ওয়ালেট নির্বাচন করুন" : "Select a wallet",
    insufficient: isBangla ? "পর্যাপ্ত ব্যালেন্স নেই" : "Insufficient balance",
    walletAdded: isBangla ? "ওয়ালেট যোগ হয়েছে" : "Wallet added",
    success: isBangla
      ? "অটো উইথড্র রিকোয়েস্ট রিভিউতে পাঠানো হয়েছে"
      : "Auto withdraw request sent for review",
    secureText: isBangla
      ? "নিরাপদ OraclePay auto withdraw gateway"
      : "Secure OraclePay auto withdraw gateway",
    note: isBangla
      ? "রিকোয়েস্ট প্রথমে এডমিন রিভিউতে যাবে। এডমিন approve করলে টাকা সরাসরি আপনার ওয়ালেটে পাঠানো হবে।"
      : "Your request goes to admin review first. Once approved, the money is sent straight to your wallet.",
  };

  const balance = Number(user?.balance || 0);

  const selectedMethod = useMemo(
    () =>
      methods.find(
        (item) => String(item.methodId) === String(selectedMethodId),
      ) || null,
    [methods, selectedMethodId],
  );

  const methodWallets = useMemo(
    () =>
      wallets.filter(
        (item) =>
          String(item.methodId || "").toUpperCase() ===
          String(selectedMethodId || "").toUpperCase(),
      ),
    [wallets, selectedMethodId],
  );

  // A method may tighten the global limits but never loosen them, which is the
  // same rule the server applies when it validates the request.
  const effectiveMin = useMemo(() => {
    return Math.max(Number(globalMin || 0), Number(selectedMethod?.minAmount || 0));
  }, [globalMin, selectedMethod]);

  const effectiveMax = useMemo(() => {
    const methodMax = Number(selectedMethod?.maxAmount || 0);
    const gMax = Number(globalMax || 0);

    if (gMax > 0 && methodMax > 0) return Math.min(gMax, methodMax);
    return gMax > 0 ? gMax : methodMax;
  }, [globalMax, selectedMethod]);

  const loadStatus = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/auto-withdraw/status");

      const list = Array.isArray(data?.data?.methods) ? data.data.methods : [];

      setEnabled(!!data?.data?.enabled);
      setMethods(list);
      setGlobalMin(Number(data?.data?.minAmount || 0));
      setGlobalMax(Number(data?.data?.maxAmount || 0));

      if (list.length > 0) {
        setSelectedMethodId((prev) =>
          list.some((item) => String(item.methodId) === String(prev))
            ? prev
            : list[0].methodId,
        );
      } else {
        setSelectedMethodId("");
      }
    } catch (err) {
      setEnabled(false);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to load",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadWallets = async (methodId = selectedMethodId) => {
    if (!methodId || !isAuthenticated) return;

    try {
      const { data } = await api.get("/api/e-wallets", {
        params: { methodId },
      });

      const list = Array.isArray(data?.data) ? data.data : [];

      setWallets((prev) => {
        const other = prev.filter(
          (item) =>
            String(item.methodId || "").toUpperCase() !==
            String(methodId).toUpperCase(),
        );

        return [...other, ...list];
      });

      const preferred = list.find((item) => item.isDefault) || list[0];
      setSelectedWalletId(preferred?._id || "");
    } catch {
      // A wallet load failure is not fatal; the user can still add a new one.
    }
  };

  const loadEligibility = async () => {
    if (!isAuthenticated) return;

    try {
      const { data } = await api.get("/api/auto-withdraw/eligibility");

      if (data?.success) {
        setEligibility({
          eligible: !!data?.data?.eligible,
          hasRunningTurnover: !!data?.data?.hasRunningTurnover,
          hasPendingWithdraw: !!data?.data?.hasPendingWithdraw,
          remaining: Number(data?.data?.remaining || 0),
          message: data?.data?.message || "",
        });
      }
    } catch {
      // Leave the last known eligibility in place; the server re-checks on submit.
    }
  };

  useEffect(() => {
    if (!open) return;

    loadStatus();
    loadEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || !selectedMethodId) return;

    loadWallets(selectedMethodId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedMethodId]);

  useEffect(() => {
    if (!open) {
      setAmount("");
      setShowAddWallet(false);
      setWalletNumber("");
      setWalletLabel("");
    }
  }, [open]);

  const handleSelectMethod = (methodId) => {
    setSelectedMethodId(methodId);
    setSelectedWalletId("");
    setShowAddWallet(false);
  };

  const handleAddWallet = async () => {
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
        throw new Error(data?.message || "Failed to add wallet");
      }

      toast.success(t.walletAdded);

      setShowAddWallet(false);
      setWalletNumber("");
      setWalletLabel("");

      await loadWallets(selectedMethodId);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to add wallet",
      );
    } finally {
      setSubmittingWallet(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error(t.loginRequired);
      return;
    }

    const amountNum = Math.floor(Number(amount || 0));

    if (!selectedMethodId) {
      toast.error(t.selectMethod);
      return;
    }

    if (!selectedWalletId) {
      toast.error(t.pickWallet);
      return;
    }

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error(t.invalidAmount);
      return;
    }

    if (effectiveMin > 0 && amountNum < effectiveMin) {
      toast.error(`${t.min}: ${effectiveMin}`);
      return;
    }

    if (effectiveMax > 0 && amountNum > effectiveMax) {
      toast.error(`${t.max}: ${effectiveMax}`);
      return;
    }

    if (amountNum > balance) {
      toast.error(t.insufficient);
      return;
    }

    try {
      setSubmitting(true);

      const { data } = await api.post("/api/auto-withdraw/create", {
        methodId: selectedMethodId,
        walletId: selectedWalletId,
        amount: amountNum,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Auto withdraw failed");
      }

      toast.success(data?.message || t.success);
      setAmount("");

      await loadEligibility();

      if (onHistoryClick) onHistoryClick();
      else onClose?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Auto withdraw failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const blocked = !eligibility.eligible;

  const renderBody = () => {
    if (loading) {
      return (
        <div
          className="flex flex-1 items-center justify-center px-5"
          style={{ backgroundColor: colors.modalBg }}
        >
          <div
            className="text-center text-[14px] font-semibold"
            style={{ color: colors.primaryBg }}
          >
            {t.loading}
          </div>
        </div>
      );
    }

    if (!enabled) {
      return (
        <div
          className="flex flex-1 items-center justify-center px-5"
          style={{ backgroundColor: colors.modalBg }}
        >
          <div className="text-center">
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.sectionBg }}
            >
              <AlertCircle size={34} style={{ color: colors.sectionText }} />
            </div>

            <div
              className="mt-4 text-[16px] font-bold"
              style={{ color: colors.normalText }}
            >
              {t.disabledTitle}
            </div>

            <div
              className="mt-1 text-[13px]"
              style={{ color: colors.mutedText }}
            >
              {t.disabledText}
            </div>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div
          className="flex flex-1 items-center justify-center px-5 text-center text-[14px] font-semibold"
          style={{ backgroundColor: colors.modalBg, color: colors.mutedText }}
        >
          {t.loginRequired}
        </div>
      );
    }

    if (methods.length === 0) {
      return (
        <div
          className="flex flex-1 items-center justify-center px-5 text-center text-[14px] font-semibold"
          style={{ backgroundColor: colors.modalBg, color: colors.mutedText }}
        >
          {t.noMethod}
        </div>
      );
    }

    return (
      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ backgroundColor: colors.modalBg }}
      >
        <div
          className="flex items-center justify-between rounded-[6px] px-4 py-3"
          style={{
            backgroundColor: colors.summaryBg,
            color: colors.summaryText,
          }}
        >
          <span className="text-[13px] font-semibold">{t.balance}</span>
          <span className="text-[16px] font-bold">{money(balance)}</span>
        </div>

        {blocked ? (
          <div
            className="mt-3 flex items-start gap-2 rounded-[6px] border px-4 py-3"
            style={{
              backgroundColor: colors.sectionBg,
              borderColor: colors.sectionBorder,
              color: colors.sectionText,
            }}
          >
            <Info size={16} className="mt-0.5 shrink-0" />
            <span className="text-[12px] font-semibold">
              {eligibility.message}
            </span>
          </div>
        ) : null}

        <div className="mt-4">
          <div
            className="mb-2 text-[13px] font-bold"
            style={{ color: colors.labelText }}
          >
            {t.selectMethod}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {methods.map((method) => {
              const isSelected =
                String(method.methodId) === String(selectedMethodId);

              const name = isBangla ? method?.name?.bn : method?.name?.en;

              return (
                <button
                  key={method._id}
                  type="button"
                  onClick={() => handleSelectMethod(method.methodId)}
                  className="flex cursor-pointer flex-col items-center gap-1 rounded-[6px] border px-2 py-3 transition"
                  style={{
                    backgroundColor: isSelected
                      ? colors.summaryBg
                      : colors.cardBg,
                    borderColor: isSelected
                      ? colors.primaryBg
                      : colors.cardBorder,
                    color: isSelected ? colors.summaryText : colors.normalText,
                  }}
                >
                  {method.logoUrl ? (
                    <img
                      src={getImageUrl(method.logoUrl)}
                      alt={name || method.methodId}
                      className="h-7 w-7 rounded object-contain"
                    />
                  ) : (
                    <Wallet size={22} />
                  )}

                  <span className="text-[11px] font-bold">
                    {name || method.methodId}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span
              className="text-[13px] font-bold"
              style={{ color: colors.labelText }}
            >
              {t.selectWallet}
            </span>

            <button
              type="button"
              onClick={() => setShowAddWallet((v) => !v)}
              className="flex cursor-pointer items-center gap-1 text-[12px] font-bold"
              style={{ color: colors.primaryBg }}
            >
              <Plus size={14} />
              {t.addWallet}
            </button>
          </div>

          {methodWallets.length === 0 && !showAddWallet ? (
            <div
              className="rounded-[6px] border px-4 py-4 text-center text-[12px] font-semibold"
              style={{
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
                color: colors.mutedText,
              }}
            >
              {t.noWallet}
            </div>
          ) : null}

          <div className="space-y-2">
            {methodWallets.map((wallet) => {
              const isSelected = String(wallet._id) === String(selectedWalletId);

              return (
                <button
                  key={wallet._id}
                  type="button"
                  onClick={() => setSelectedWalletId(wallet._id)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-[6px] border px-4 py-3 transition"
                  style={{
                    backgroundColor: isSelected
                      ? colors.summaryBg
                      : colors.cardBg,
                    borderColor: isSelected
                      ? colors.primaryBg
                      : colors.cardBorder,
                    color: isSelected ? colors.summaryText : colors.normalText,
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Phone size={15} />
                    <span className="text-[13px] font-bold">
                      {wallet.walletNumber}
                    </span>
                    {wallet.label ? (
                      <span
                        className="text-[11px]"
                        style={{ color: colors.mutedText }}
                      >
                        ({wallet.label})
                      </span>
                    ) : null}
                  </span>

                  {isSelected ? <CheckCircle2 size={17} /> : null}
                </button>
              );
            })}
          </div>

          {showAddWallet ? (
            <div
              className="mt-3 rounded-[6px] border p-4"
              style={{
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
              }}
            >
              <div
                className="mb-1 text-[12px] font-bold"
                style={{ color: colors.labelText }}
              >
                {t.walletTypeLabel}
              </div>

              <select
                value={walletType}
                onChange={(e) => setWalletType(e.target.value)}
                className="mb-3 w-full rounded-[4px] border px-3 py-2 text-[13px] outline-none"
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.inputText,
                }}
              >
                {walletTypes.map((item) => (
                  <option key={item.key} value={item.key}>
                    {isBangla ? item.bn : item.en}
                  </option>
                ))}
              </select>

              <div
                className="mb-1 text-[12px] font-bold"
                style={{ color: colors.labelText }}
              >
                {t.walletNumber}
              </div>

              <input
                value={walletNumber}
                onChange={(e) => setWalletNumber(e.target.value)}
                inputMode="numeric"
                placeholder="01XXXXXXXXX"
                className="mb-3 w-full rounded-[4px] border px-3 py-2 text-[13px] outline-none"
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.inputText,
                }}
              />

              <div
                className="mb-1 text-[12px] font-bold"
                style={{ color: colors.labelText }}
              >
                {t.walletLabel}
              </div>

              <input
                value={walletLabel}
                onChange={(e) => setWalletLabel(e.target.value)}
                className="mb-3 w-full rounded-[4px] border px-3 py-2 text-[13px] outline-none"
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.inputText,
                }}
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWallet(false)}
                  className="h-9 flex-1 cursor-pointer rounded-[4px] border text-[13px] font-bold"
                  style={{
                    borderColor: colors.cardBorder,
                    color: colors.mutedText,
                  }}
                >
                  {t.cancel}
                </button>

                <button
                  type="button"
                  onClick={handleAddWallet}
                  disabled={submittingWallet}
                  className="h-9 flex-1 cursor-pointer rounded-[4px] text-[13px] font-bold disabled:opacity-60"
                  style={{
                    backgroundColor: colors.primaryBg,
                    color: colors.primaryText,
                  }}
                >
                  {submittingWallet ? (
                    <Loader2 size={15} className="mx-auto animate-spin" />
                  ) : (
                    t.save
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4">
          <div
            className="mb-2 text-[13px] font-bold"
            style={{ color: colors.labelText }}
          >
            {t.amount}
          </div>

          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
            inputMode="numeric"
            placeholder={t.enterAmount}
            className="w-full rounded-[4px] border px-3 py-3 text-[14px] font-bold outline-none"
            style={{
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.inputText,
            }}
          />

          <div
            className="mt-2 flex items-center justify-between text-[12px] font-semibold"
            style={{ color: colors.mutedText }}
          >
            <span>
              {t.min}: {effectiveMin || 0}
            </span>
            <span>
              {t.max}: {effectiveMax > 0 ? effectiveMax : "-"}
            </span>
          </div>
        </div>

        <div
          className="mt-4 flex items-start gap-2 rounded-[6px] border px-4 py-3"
          style={{
            backgroundColor: colors.sectionBg,
            borderColor: colors.sectionBorder,
            color: colors.sectionText,
          }}
        >
          <Info size={16} className="mt-0.5 shrink-0" />
          <span className="text-[12px] font-semibold">{t.note}</span>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || blocked}
          className="mt-4 flex h-11 w-full cursor-pointer items-center justify-center rounded-[4px] text-[14px] font-bold disabled:cursor-not-allowed"
          style={{
            backgroundColor:
              submitting || blocked ? colors.disabledBg : colors.primaryBg,
            color: submitting || blocked ? colors.disabledText : colors.primaryText,
          }}
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              {t.processing}
            </>
          ) : (
            t.submit
          )}
        </button>

        <div
          className="mt-3 flex items-center justify-center gap-1 text-[11px] font-semibold"
          style={{ color: colors.mutedText }}
        >
          <ShieldCheck size={13} />
          {t.secureText}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center px-0 backdrop-blur-[3px] sm:px-4"
          style={{ background: colors.pageOverlayBg }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-dvh w-full flex-col overflow-hidden shadow-2xl sm:h-[700px] sm:max-w-[375px] sm:rounded-[8px]"
            style={{ backgroundColor: colors.modalBg }}
          >
            <div
              className="relative flex h-[50px] shrink-0 items-center justify-center"
              style={{
                backgroundColor: colors.headerBg,
                color: colors.headerText,
              }}
            >
              <h2 className="text-[18px] font-semibold">{t.title}</h2>

              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center"
                style={{ color: colors.closeIconColor }}
              >
                <X size={24} />
              </button>
            </div>

            <div
              className="flex h-[52px] shrink-0 items-center gap-1 px-4 pb-3"
              style={{ backgroundColor: colors.headerBg }}
            >
              <button
                type="button"
                onClick={onWithdrawClick}
                className="h-[34px] flex-1 cursor-pointer rounded-[3px] text-[13px] font-bold"
                style={{
                  backgroundColor: colors.inactiveTabBg,
                  color: colors.inactiveTabText,
                }}
              >
                {t.withdraw}
              </button>

              <button
                type="button"
                className="h-[34px] flex-1 cursor-pointer rounded-[3px] text-[13px] font-bold"
                style={{
                  backgroundColor: colors.secondaryBg,
                  color: colors.secondaryText,
                }}
              >
                {t.title}
              </button>
            </div>

            {renderBody()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AutoWithdrawModal;
