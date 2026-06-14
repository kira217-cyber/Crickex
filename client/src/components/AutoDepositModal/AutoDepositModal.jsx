import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ChevronDown,
  BadgePercent,
  AlertCircle,
  Info,
  Wallet,
  Gift,
  CheckCircle,
  ShieldCheck,
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

const n = (value) => {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
};

const calcBonus = (amount, selectedBonus) => {
  const amountNum = Math.floor(n(amount));

  if (!selectedBonus || selectedBonus?._id === "none") {
    return {
      bonusAmount: 0,
      creditedAmount: amountNum,
      turnoverMultiplier: 1,
      targetTurnover: amountNum,
    };
  }

  const bonusType = String(selectedBonus?.bonusType || "fixed").toLowerCase();
  const bonusValue = n(selectedBonus?.bonusValue);
  const turnoverMultiplier = n(selectedBonus?.turnoverMultiplier) || 1;

  const bonusAmount =
    bonusType === "percent"
      ? Math.floor((amountNum * bonusValue) / 100)
      : Math.floor(bonusValue);

  const creditedAmount = amountNum + bonusAmount;
  const targetTurnover = Math.floor(creditedAmount * turnoverMultiplier);

  return {
    bonusAmount,
    creditedAmount,
    turnoverMultiplier,
    targetTurnover,
  };
};

const getBonusText = (bonus) => {
  if (!bonus || bonus?._id === "none") return "";

  if (bonus.bonusType === "percent") {
    return `+${Number(bonus.bonusValue || 0)}%`;
  }

  return `+${money(bonus.bonusValue)}`;
};

const AutoDepositModal = ({ open, onClose, onDepositClick }) => {
  const promoBoxRef = useRef(null);
  const { isBangla, language } = useLanguage();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuth);

  const userMongoId = user?._id || user?.id || "";
  const userId = user?.userId || "";
  const phone = user?.phone || "";

  const [loadingStatus, setLoadingStatus] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [minAmount, setMinAmount] = useState(5);
  const [maxAmount, setMaxAmount] = useState(0);
  const [bonuses, setBonuses] = useState([]);

  const [amount, setAmount] = useState("");
  const [selectedBonusId, setSelectedBonusId] = useState("none");
  const [bonusOpen, setBonusOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const t = {
    title: isBangla ? "ফান্ডস" : "Funds",
    deposit: isBangla ? "ডিপোজিট" : "Deposit",
    autoDeposit: isBangla ? "অটো ডিপোজিট" : "Auto Deposit",

    selectBonus: isBangla ? "বোনাস নির্বাচন করুন" : "Select Bonus",
    noBonus: isBangla ? "কোনো বোনাস নয়" : "No Bonus",
    amount: isBangla ? "ডিপোজিট এমাউন্ট" : "Deposit Amount",
    enterAmount: isBangla ? "এমাউন্ট লিখুন" : "Enter amount",
    min: isBangla ? "সর্বনিম্ন" : "Min",
    max: isBangla ? "সর্বোচ্চ" : "Max",
    bonus: isBangla ? "বোনাস" : "Bonus",
    credited: isBangla ? "ক্রেডিট হবে" : "Credited",
    turnover: isBangla ? "টার্নওভার" : "Turnover",
    submit: isBangla ? "সাবমিট" : "Submit",
    processing: isBangla ? "প্রসেস হচ্ছে..." : "Processing...",

    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    disabledTitle: isBangla ? "অটো ডিপোজিট বন্ধ" : "Auto Deposit Disabled",
    disabledText: isBangla
      ? "এই মুহূর্তে অটো ডিপোজিট সার্ভিস বন্ধ আছে।"
      : "Auto deposit service is currently disabled.",
    loginRequired: isBangla
      ? "অটো ডিপোজিট করতে আগে লগইন করুন"
      : "Please login first to use auto deposit.",
    invalidAmount: isBangla ? "সঠিক এমাউন্ট দিন" : "Enter valid amount",
    firstDepositOnly: isBangla ? "শুধু প্রথম ডিপোজিট" : "First Deposit Only",
    allTime: isBangla ? "সবসময়" : "All Time",
    paymentFailed: isBangla
      ? "পেমেন্ট লিংক তৈরি করা যায়নি"
      : "Payment link create failed",
    secureText: isBangla
      ? "নিরাপদ OraclePay auto deposit gateway"
      : "Secure OraclePay auto deposit gateway",
    firstDepositNote: isBangla
      ? "আপনি যদি আগে অটো ডিপোজিট করে থাকেন, তাহলে First Deposit bonus নিতে পারবেন না।"
      : "If you already made an auto deposit before, First Deposit bonus will not be available.",
  };

  useEffect(() => {
    if (!open) return;

    const loadStatus = async () => {
      try {
        setLoadingStatus(true);

        const { data } = await api.get("/api/auto-deposit/status");

        setEnabled(!!data?.data?.enabled);
        setMinAmount(Number(data?.data?.minAmount || 5));
        setMaxAmount(Number(data?.data?.maxAmount || 0));

        const list = Array.isArray(data?.data?.bonuses)
          ? data.data.bonuses
          : [];

        setBonuses(
          list.map((item) => ({
            _id: String(item?._id || ""),
            title: {
              bn: item?.title?.bn || "",
              en: item?.title?.en || "",
            },
            bonusType: item?.bonusType === "percent" ? "percent" : "fixed",
            bonusScope:
              item?.bonusScope === "first-deposit"
                ? "first-deposit"
                : "all-time",
            bonusValue: Number(item?.bonusValue || 0),
            turnoverMultiplier: Number(item?.turnoverMultiplier || 1),
          })),
        );
      } catch (error) {
        setEnabled(false);
        setBonuses([]);
      } finally {
        setLoadingStatus(false);
      }
    };

    loadStatus();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!promoBoxRef.current) return;

      if (!promoBoxRef.current.contains(event.target)) {
        setBonusOpen(false);
      }
    };

    if (bonusOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [bonusOpen]);

  const bonusOptions = useMemo(() => {
    return [
      {
        _id: "none",
        title: {
          bn: t.noBonus,
          en: t.noBonus,
        },
        bonusType: "fixed",
        bonusScope: "all-time",
        bonusValue: 0,
        turnoverMultiplier: 1,
      },
      ...bonuses,
    ];
  }, [bonuses, t.noBonus]);

  useEffect(() => {
    const exists = bonusOptions.some(
      (item) => String(item._id) === String(selectedBonusId),
    );

    if (!exists) {
      setSelectedBonusId("none");
    }
  }, [bonusOptions, selectedBonusId]);

  const selectedBonus = useMemo(() => {
    return (
      bonusOptions.find((item) => String(item._id) === selectedBonusId) ||
      bonusOptions[0]
    );
  }, [bonusOptions, selectedBonusId]);

  const amountNum = Math.floor(n(amount));

  const calculation = useMemo(() => {
    return calcBonus(amountNum, selectedBonus);
  }, [amountNum, selectedBonus]);

  const selectedBonusName = useMemo(() => {
    if (!selectedBonus) return t.noBonus;

    return language === "Bangla"
      ? selectedBonus?.title?.bn || selectedBonus?.title?.en || t.noBonus
      : selectedBonus?.title?.en || selectedBonus?.title?.bn || t.noBonus;
  }, [selectedBonus, language, t.noBonus]);

  const amountValid =
    amountNum > 0 &&
    amountNum >= Number(minAmount || 0) &&
    (Number(maxAmount || 0) <= 0 || amountNum <= Number(maxAmount || 0));

  const canSubmit =
    enabled && isAuthenticated && !!userMongoId && amountValid && !processing;

  const handleSubmit = async () => {
    if (!enabled) {
      toast.error(t.disabledText);
      return;
    }

    if (!isAuthenticated || !userMongoId) {
      toast.error(t.loginRequired);
      return;
    }

    if (!amountValid) {
      toast.error(t.invalidAmount);
      return;
    }

    try {
      setProcessing(true);

      const invoiceNumber = `AUTO-${userMongoId}-${Date.now()}`;

      const { data } = await api.post("/api/auto-deposit/create", {
        amount: amountNum,
        invoiceNumber,
        selectedBonusId:
          selectedBonus && selectedBonus._id !== "none"
            ? selectedBonus._id
            : "",
        checkoutItems: {
          type: "deposit",
          method: "auto",
          gateway: "oraclepay",
          userId: userId || "",
          phone: phone || "",
          username: userId || "",
          selectedBonusId:
            selectedBonus && selectedBonus._id !== "none"
              ? selectedBonus._id
              : "",
          selectedBonusScope:
            selectedBonus && selectedBonus._id !== "none"
              ? selectedBonus.bonusScope
              : "",
        },
      });

      if (data?.success && data?.payment_page_url) {
        window.location.href = data.payment_page_url;
        return;
      }

      toast.error(data?.message || t.paymentFailed);
    } catch (error) {
      toast.error(error?.response?.data?.message || t.paymentFailed);
    } finally {
      setProcessing(false);
    }
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
                {t.autoDeposit}
              </button>
            </div>

            {loadingStatus ? (
              <div className="flex flex-1 items-center justify-center bg-white px-5">
                <div className="text-center text-[14px] font-semibold text-[#0865a9]">
                  {t.loading}
                </div>
              </div>
            ) : !enabled ? (
              <div className="flex flex-1 items-center justify-center bg-white px-5">
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eaf4ff] text-[#0865a9]">
                    <AlertCircle size={42} />
                  </div>

                  <h3 className="mt-5 text-[24px] font-bold text-[#0865a9]">
                    {t.disabledTitle}
                  </h3>

                  <p className="mx-auto mt-2 max-w-[280px] text-[14px] leading-6 text-[#666]">
                    {t.disabledText}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto bg-white px-4 pb-5 pt-3">
                  <div ref={promoBoxRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setBonusOpen((prev) => !prev)}
                      className="flex h-[40px] w-full cursor-pointer items-center justify-between rounded-[3px] bg-[#e9b20d] px-3 text-white"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <BadgePercent size={18} />

                        <span className="shrink-0 text-[14px] font-medium">
                          {t.selectBonus}
                        </span>

                        <span className="truncate text-[12px] font-bold">
                          {selectedBonus?._id !== "none"
                            ? selectedBonusName
                            : ""}
                        </span>
                      </div>

                      <ChevronDown size={18} />
                    </button>

                    {bonusOpen && (
                      <div className="absolute left-0 right-0 top-[44px] z-30 max-h-[260px] overflow-y-auto rounded-[3px] border border-[#d8d8d8] bg-white shadow-xl">
                        {bonusOptions.map((bonus) => {
                          const active =
                            String(selectedBonusId) === String(bonus._id);

                          const bonusName =
                            language === "Bangla"
                              ? bonus?.title?.bn || bonus?.title?.en
                              : bonus?.title?.en || bonus?.title?.bn;

                          return (
                            <button
                              key={bonus._id}
                              type="button"
                              onClick={() => {
                                setSelectedBonusId(bonus._id);
                                setBonusOpen(false);
                              }}
                              className={`flex w-full cursor-pointer items-start justify-between gap-3 px-3 py-3 text-left text-[13px] ${
                                active
                                  ? "bg-[#eaf4ff] text-[#0865a9]"
                                  : "bg-white text-[#333]"
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="font-semibold">{bonusName}</div>

                                {bonus._id !== "none" ? (
                                  <div className="mt-1 text-[11px] text-[#777]">
                                    {bonus.bonusScope === "first-deposit"
                                      ? t.firstDepositOnly
                                      : t.allTime}
                                  </div>
                                ) : null}
                              </div>

                              <span className="shrink-0 text-[12px] font-bold">
                                {bonus._id === "none"
                                  ? "x1"
                                  : `${getBonusText(bonus)} | x${
                                      bonus.turnoverMultiplier
                                    }`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-[4px] border border-[#97b6e9] bg-[#eef4ff] p-3">
                    <div className="flex items-start gap-2 text-[#2451cc]">
                      <Info size={17} className="mt-[1px] shrink-0" />
                      <p className="text-[13px] leading-[18px]">
                        {t.firstDepositNote}
                      </p>
                    </div>
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
                      {Number(maxAmount || 0) > 0 ? money(maxAmount) : "∞"}
                    </div>
                  </div>

                  <div className="mt-4 rounded-[4px] bg-[#eef7ff] p-3 text-[12px] text-[#0865a9]">
                    <div className="flex justify-between">
                      <span>{t.bonus}</span>
                      <span>{money(calculation.bonusAmount)}</span>
                    </div>

                    <div className="mt-1 flex justify-between font-bold">
                      <span>{t.credited}</span>
                      <span>{money(calculation.creditedAmount)}</span>
                    </div>

                    <div className="mt-1 flex justify-between">
                      <span>{t.turnover}</span>
                      <span>
                        x{calculation.turnoverMultiplier} /{" "}
                        {money(calculation.targetTurnover)}
                      </span>
                    </div>
                  </div>

                  {selectedBonus?._id !== "none" ? (
                    <div className="mt-4 rounded-[4px] border border-[#dce8f5] bg-white p-3">
                      <div className="flex items-center gap-2 text-[#0865a9]">
                        <Gift size={17} />
                        <span className="text-[14px] font-bold">
                          {selectedBonusName}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
                        <div className="rounded bg-[#f4f8ff] p-2">
                          <p className="text-[#777]">{t.bonus}</p>
                          <p className="font-bold text-[#0865a9]">
                            {getBonusText(selectedBonus)}
                          </p>
                        </div>

                        <div className="rounded bg-[#f4f8ff] p-2">
                          <p className="text-[#777]">
                            {isBangla ? "ধরণ" : "Scope"}
                          </p>
                          <p className="font-bold text-[#0865a9]">
                            {selectedBonus.bonusScope === "first-deposit"
                              ? t.firstDepositOnly
                              : t.allTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="shrink-0 bg-white px-4 pb-4">
                  <div className="mb-3 flex items-center justify-center gap-2 text-[12px] text-[#777]">
                    <ShieldCheck size={14} />
                    <span>{t.secureText}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="relative h-[38px] w-full cursor-pointer rounded-[2px] bg-[#0865a9] text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#a6a6a6]"
                  >
                    {processing ? t.processing : t.submit}

                    {!canSubmit && (
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[#333] bg-[#e95b5b] text-white">
                        <AlertCircle size={15} />
                      </span>
                    )}

                    {canSubmit && (
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-green-700 bg-green-500 text-white">
                        <CheckCircle size={15} />
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

export default AutoDepositModal;
