import React, { useEffect, useMemo, useState, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Copy, ChevronRight, Lock, AlertCircle } from "lucide-react";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const money = (value) => {
  const num = Number(value || 0);
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const getImg = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
};

const safeCopy = async (text) => {
  try {
    await navigator.clipboard.writeText(String(text || ""));
    return true;
  } catch {
    return false;
  }
};

const InputRow = memo(
  ({
    label,
    value,
    onChange,
    placeholder,
    disabled = false,
    copyable = false,
    onCopy,
    type = "text",
  }) => {
    return (
      <div className="mt-3">
        <label className="mb-1 block text-[13px] font-semibold text-[#333]">
          {label}
        </label>

        <div className="relative">
          <input
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete="off"
            className="h-[42px] w-full rounded-[4px] border border-[#d7d7d7] bg-[#eeeeee] px-3 pr-10 text-[14px] text-[#222] outline-none placeholder:text-[#999] focus:border-[#0865a9] disabled:cursor-not-allowed disabled:text-[#666]"
          />

          {copyable && (
            <button
              type="button"
              onClick={onCopy}
              className="absolute right-2 top-1/2 flex h-[28px] w-[28px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-[4px] bg-[#0865a9] text-white"
            >
              <Copy size={15} />
            </button>
          )}
        </div>
      </div>
    );
  },
);

InputRow.displayName = "InputRow";

const DepositConfirmModal = ({
  open,
  onClose,
  depositData,
  onSuccess,
  onBack,
}) => {
  const { isBangla, language } = useLanguage();

  const [seconds, setSeconds] = useState(15 * 60);
  const [values, setValues] = useState({});
  const [howOpen, setHowOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const methodDoc = depositData?.methodDoc || null;
  const channelDoc = depositData?.channelDoc || null;
  const contactDoc = depositData?.contactDoc || null;
  const calculation = depositData?.calculation || {};
  const amount = Number(depositData?.amount || 0);

  const t = {
    title: isBangla ? "ডিপোজিট নিশ্চিত করুন" : "Confirm Deposit",
    timeLeft: isBangla ? "বাকি সময়" : "Time left",
    amount: isBangla ? "পরিমাণ" : "Amount",
    depositNumber: isBangla ? "ডিপোজিট নাম্বার" : "Deposit Number",
    notSet: isBangla ? "সেট করা নেই" : "Not set",
    submit: isBangla ? "সাবমিট" : "Submit",
    submitting: isBangla ? "সাবমিট হচ্ছে..." : "Submitting...",
    back: isBangla ? "পিছনে" : "Back",
    copied: isBangla ? "কপি হয়েছে" : "Copied",
    copyFailed: isBangla ? "কপি ব্যর্থ হয়েছে" : "Copy failed",
    submitted: isBangla
      ? "ডিপোজিট রিকোয়েস্ট সাবমিট হয়েছে!"
      : "Deposit request submitted!",
    failed: isBangla
      ? "ডিপোজিট রিকোয়েস্ট ব্যর্থ হয়েছে"
      : "Deposit request failed",
    defaultInstruction: isBangla
      ? "নিচের নাম্বারে টাকা পাঠান এবং সঠিক তথ্য দিয়ে সাবমিট করুন।"
      : "Send money to the number below and submit correct information.",
    howToDeposit: isBangla ? "কীভাবে ডিপোজিট করবেন?" : "How to deposit?",
    step1: isBangla ? "আপনার পেমেন্ট অ্যাপ ওপেন করুন" : "Open your payment app",
    step2: isBangla
      ? "নিচের নাম্বারে টাকা পাঠান"
      : "Send money to the number below",
    step3: isBangla ? "ট্রানজেকশন আইডি কপি করুন" : "Copy transaction ID",
    step4: isBangla
      ? "সব তথ্য সঠিকভাবে পূরণ করুন"
      : "Fill all information correctly",
    step5: isBangla ? "রিকোয়েস্ট সাবমিট করুন" : "Submit the request",
    secure: isBangla
      ? "আপনি একটি নিরাপদ জায়গায় আছেন।"
      : "You are in a secure place.",
    senderNumber: isBangla ? "প্রেরকের নাম্বার *" : "Sender Number *",
    trxId: isBangla ? "ট্রানজেকশন আইডি *" : "Transaction ID *",
    required: isBangla ? "সব প্রয়োজনীয় তথ্য দিন" : "Fill required fields",
    expired: isBangla ? "সময় শেষ হয়েছে" : "Time expired",
    credited: isBangla ? "ক্রেডিট হবে" : "Credited Amount",
    turnover: isBangla ? "টার্নওভার" : "Turnover",
  };

  const methodName = useMemo(() => {
    return (
      (language === "Bangla"
        ? methodDoc?.methodName?.bn || methodDoc?.methodName?.en
        : methodDoc?.methodName?.en || methodDoc?.methodName?.bn) ||
      methodDoc?.methodId ||
      depositData?.methodId ||
      "PAY"
    );
  }, [language, methodDoc, depositData]);

  const contactLabel = useMemo(() => {
    return (
      (language === "Bangla"
        ? contactDoc?.label?.bn ||
          contactDoc?.label?.en ||
          channelDoc?.name?.bn ||
          channelDoc?.name?.en
        : contactDoc?.label?.en ||
          contactDoc?.label?.bn ||
          channelDoc?.name?.en ||
          channelDoc?.name?.bn) || t.depositNumber
    );
  }, [language, contactDoc, channelDoc, t.depositNumber]);

  const contactNumber = String(contactDoc?.number || "").trim();

  const inputDefs = useMemo(() => {
    const arr = methodDoc?.inputs;
    return Array.isArray(arr) ? arr : [];
  }, [methodDoc]);

  const instructions = useMemo(() => {
    return (
      (language === "Bangla"
        ? methodDoc?.instructions?.bn || methodDoc?.instructions?.en
        : methodDoc?.instructions?.en || methodDoc?.instructions?.bn) ||
      t.defaultInstruction
    );
  }, [methodDoc, language, t.defaultInstruction]);

  const logoUrl = getImg(methodDoc?.logoUrl);

  useEffect(() => {
    if (!open) return;

    setSeconds(15 * 60);
    setHowOpen(false);
    setSubmitting(false);

    const initial = {};

    if (inputDefs.length) {
      inputDefs.forEach((field) => {
        if (!field?.key) return;
        initial[field.key] = field.key === "amount" ? String(amount || "") : "";
      });
    } else {
      initial.senderNumber = "";
      initial.trxId = "";
    }

    setValues(initial);

    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [open, inputDefs, amount]);

  const setField = (key, value) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateField = (field, value) => {
    const val = String(value ?? "").trim();

    if (field?.required && !val) return false;
    if (field?.minLength && val.length < Number(field.minLength)) return false;
    if (field?.maxLength && val.length > Number(field.maxLength)) return false;

    if (field?.key === "amount") {
      const num = Number(val || 0);
      if (!Number.isFinite(num) || num <= 0) return false;
    }

    return true;
  };

  const canSubmit = useMemo(() => {
    if (seconds <= 0) return false;

    if (inputDefs.length) {
      return inputDefs.every((field) =>
        validateField(field, values[field.key]),
      );
    }

    return (
      String(values.senderNumber || "").trim().length >= 8 &&
      String(values.trxId || "").trim().length >= 4
    );
  }, [seconds, inputDefs, values]);

  const handleCopy = async (text) => {
    const ok = await safeCopy(text);
    if (ok) toast.success(t.copied);
    else toast.error(t.copyFailed);
  };

  const buildPayload = () => {
    const fields = {};

    Object.keys(values || {}).forEach((key) => {
      fields[key] =
        key === "amount"
          ? String(amount || values[key] || "")
          : String(values[key] || "");
    });

    if (!fields.amount) {
      fields.amount = String(amount || 0);
    }

    return {
      methodId: depositData?.methodId,
      channelId: depositData?.channelId,
      promoId: depositData?.promoId || "none",
      amount,
      fields,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (seconds <= 0) {
      toast.error(t.expired);
      return;
    }

    if (!canSubmit) {
      toast.error(t.required);
      return;
    }

    try {
      setSubmitting(true);

      const payload = buildPayload();
      const res = await api.post("/api/deposit-requests", payload);

      toast.success(res?.data?.message || t.submitted);

      onClose?.();
      onSuccess?.(res?.data?.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || t.failed);
    } finally {
      setSubmitting(false);
    }
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
            className="relative flex h-screen w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[700px] sm:max-w-[375px] sm:rounded-[8px]"
          >
            <div className="relative flex h-[50px] shrink-0 items-center justify-center bg-[#0865a9] text-white">
              <h2 className="text-[18px] font-semibold">{t.title}</h2>

              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6 pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={methodName}
                      className="h-[48px] w-[62px] object-contain"
                    />
                  ) : (
                    <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full border border-[#0865a9] bg-[#eef7ff] text-[12px] font-black text-[#0865a9]">
                      {String(depositData?.methodId || "PAY")
                        .slice(0, 3)
                        .toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h3 className="text-[17px] font-bold text-[#222]">
                      {methodName}
                    </h3>
                    <p className="text-[12px] text-[#777]">
                      {t.timeLeft}:{" "}
                      <span className="font-bold text-red-500">
                        {formatTime(seconds)}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose?.();
                    onBack?.();
                  }}
                  disabled={submitting}
                  className="cursor-pointer rounded-[4px] border border-[#d7d7d7] px-3 py-1 text-[12px] text-[#0865a9] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t.back}
                </button>
              </div>

              <p className="mt-4 rounded-[4px] bg-[#eef4ff] p-3 text-center text-[12px] leading-relaxed text-[#2451cc]">
                {instructions}
              </p>

              <form onSubmit={handleSubmit} className="mt-4">
                <InputRow
                  label={t.amount}
                  value={money(amount)}
                  onChange={() => {}}
                  disabled
                />

                <InputRow
                  label={contactLabel}
                  value={contactNumber || t.notSet}
                  onChange={() => {}}
                  disabled
                  copyable={!!contactNumber}
                  onCopy={() => handleCopy(contactNumber)}
                />

                {inputDefs.length ? (
                  inputDefs.map((field) => {
                    const label =
                      (language === "Bangla"
                        ? field?.label?.bn || field?.label?.en
                        : field?.label?.en || field?.label?.bn) ||
                      field?.key ||
                      "";

                    const placeholder =
                      (language === "Bangla"
                        ? field?.placeholder?.bn || field?.placeholder?.en
                        : field?.placeholder?.en || field?.placeholder?.bn) ||
                      "";

                    return (
                      <InputRow
                        key={field.key}
                        label={`${label}${field.required ? " *" : ""}`}
                        value={
                          field.key === "amount"
                            ? String(amount || "")
                            : values[field.key] || ""
                        }
                        onChange={(e) => {
                          if (field.key === "amount") return;
                          setField(field.key, e.target.value);
                        }}
                        placeholder={placeholder}
                        disabled={field.key === "amount"}
                        type={field.type || "text"}
                      />
                    );
                  })
                ) : (
                  <>
                    <InputRow
                      label={t.senderNumber}
                      value={values.senderNumber || ""}
                      onChange={(e) => setField("senderNumber", e.target.value)}
                      placeholder="01XXXXXXXXX"
                      type="tel"
                    />

                    <InputRow
                      label={t.trxId}
                      value={values.trxId || ""}
                      onChange={(e) => setField("trxId", e.target.value)}
                      placeholder="e.g. TXN123456"
                    />
                  </>
                )}

                <div className="mt-4 rounded-[4px] bg-[#eef7ff] p-3 text-[12px] text-[#0865a9]">
                  <div className="flex justify-between">
                    <span>{t.credited}</span>
                    <span className="font-bold">
                      {money(calculation.creditedAmount)}
                    </span>
                  </div>

                  <div className="mt-1 flex justify-between">
                    <span>{t.turnover}</span>
                    <span className="font-bold">
                      x{calculation.turnoverMultiplier || 1} /{" "}
                      {money(calculation.targetTurnover)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="relative mt-4 h-[42px] w-full cursor-pointer rounded-[3px] bg-[#0865a9] text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#a6a6a6]"
                >
                  {submitting ? t.submitting : t.submit}

                  {!canSubmit && (
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[#333] bg-[#e95b5b] text-white">
                      <AlertCircle size={15} />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setHowOpen((prev) => !prev)}
                  className="mt-4 flex h-[44px] w-full cursor-pointer items-center justify-between rounded-[4px] border border-[#d7d7d7] bg-white px-3"
                >
                  <div className="flex items-center gap-2 text-[14px] font-bold text-[#333]">
                    <ChevronRight
                      size={16}
                      className={`transition ${howOpen ? "rotate-90" : ""}`}
                    />
                    {t.howToDeposit}
                  </div>
                </button>

                {howOpen && (
                  <div className="mt-2 rounded-[4px] border border-[#d7d7d7] bg-[#fafafa] p-3 text-[12px] leading-relaxed text-[#555]">
                    <ol className="list-decimal space-y-1 pl-5">
                      <li>{t.step1}</li>
                      <li>{t.step2}</li>
                      <li>{t.step3}</li>
                      <li>{t.step4}</li>
                      <li>{t.step5}</li>
                    </ol>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-[#777]">
                  <Lock size={13} />
                  <span>{t.secure}</span>
                </div>
              </form>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="absolute right-3 top-3 hidden h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full text-white disabled:cursor-not-allowed disabled:opacity-60 sm:flex"
            >
              <IoMdClose size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DepositConfirmModal;
