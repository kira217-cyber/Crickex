import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronDown, Info, BadgePercent, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import AutoDepositModal from "../AutoDepositModal/AutoDepositModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

const parsePercent = (tagText = "") => {
  const text = String(tagText || "");
  if (!text.includes("%")) return 0;

  const parsed = parseFloat(text.replace("+", "").replace("%", ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const getImg = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
};

const DepositFundsModal = ({ open, onClose, onNext }) => {
  const { isBangla, language } = useLanguage();

  const [activeModal, setActiveModal] = useState("deposit");

  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [selectedPromoId, setSelectedPromoId] = useState("none");
  const [amount, setAmount] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveModal("deposit");
    }
  }, [open]);

  const t = {
    title: isBangla ? "ফান্ডস" : "Funds",
    deposit: isBangla ? "ডিপোজিট" : "Deposit",
    autoDeposit: isBangla ? "অটো ডিপোজিট" : "Auto Deposit",
    selectPromotion: isBangla ? "প্রোমোশন নির্বাচন করুন" : "Select Promotion",
    requiredInfo: isBangla
      ? "ডিপোজিট রিকোয়েস্ট করার জন্য নিচের তথ্যগুলো প্রয়োজন।"
      : "Below info are required to proceed deposit request.",
    contactInfo: isBangla ? "যোগাযোগ তথ্য" : "Contact Info",
    phoneNumber: isBangla ? "ফোন নাম্বার" : "Phone Number",
    paymentMethod: isBangla ? "পেমেন্ট মেথড" : "Payment Method",
    depositChannel: isBangla ? "ডিপোজিট চ্যানেল" : "Deposit Channel",
    amount: isBangla ? "ডিপোজিট এমাউন্ট" : "Deposit Amount",
    enterAmount: isBangla ? "এমাউন্ট লিখুন" : "Enter amount",
    submit: isBangla ? "সাবমিট" : "Submit",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    noMethod: isBangla ? "কোনো ডিপোজিট মেথড নেই" : "No deposit method found",
    noChannel: isBangla ? "চ্যানেল পাওয়া যায়নি" : "No channel found",
    min: isBangla ? "সর্বনিম্ন" : "Min",
    max: isBangla ? "সর্বোচ্চ" : "Max",
    selectMethod: isBangla ? "মেথড নির্বাচন করুন" : "Please select method",
    selectChannel: isBangla ? "চ্যানেল নির্বাচন করুন" : "Please select channel",
    validAmount: isBangla ? "সঠিক এমাউন্ট দিন" : "Enter valid amount",
    noNumber: isBangla
      ? "ডিপোজিট নাম্বার পাওয়া যায়নি"
      : "Deposit number not found",
    noBonus: isBangla ? "কোনো বোনাস নয়" : "No Bonus",
    bonus: isBangla ? "বোনাস" : "Bonus",
    credited: isBangla ? "ক্রেডিট হবে" : "Credited",
    turnover: isBangla ? "টার্নওভার" : "Turnover",
  };

  const { data, isLoading } = useQuery({
    queryKey: ["deposit-methods-public"],
    queryFn: async () => {
      const res = await api.get("/api/deposit-methods/public");
      return res.data;
    },
    enabled: open,
    staleTime: 30000,
  });

  const methods = useMemo(() => {
    return Array.isArray(data?.data)
      ? data.data.filter((m) => m?.isActive !== false)
      : [];
  }, [data]);

  useEffect(() => {
    if (!open) return;

    if (methods.length && !selectedMethodId) {
      const first = methods[0];
      setSelectedMethodId(first.methodId || "");

      const firstChannel =
        first?.channels?.filter((c) => c?.isActive !== false)?.[0]?.id || "";

      setSelectedChannelId(firstChannel);
    }
  }, [open, methods, selectedMethodId]);

  const selectedMethod = useMemo(() => {
    return methods.find((m) => m.methodId === selectedMethodId) || null;
  }, [methods, selectedMethodId]);

  const channels = useMemo(() => {
    return Array.isArray(selectedMethod?.channels)
      ? selectedMethod.channels.filter((c) => c?.isActive !== false)
      : [];
  }, [selectedMethod]);

  const contacts = useMemo(() => {
    return Array.isArray(selectedMethod?.contacts)
      ? selectedMethod.contacts
          .filter((c) => c?.isActive !== false)
          .sort((a, b) => n(a?.sort) - n(b?.sort))
      : [];
  }, [selectedMethod]);

  const selectedContact = contacts[0] || null;

  const selectedChannel = useMemo(() => {
    return channels.find((c) => c.id === selectedChannelId) || null;
  }, [channels, selectedChannelId]);

  const promotions = useMemo(() => {
    const list = Array.isArray(selectedMethod?.promotions)
      ? selectedMethod.promotions.filter((p) => p?.isActive !== false)
      : [];

    return [
      {
        id: "none",
        name: { bn: t.noBonus, en: t.noBonus },
        bonusType: "fixed",
        bonusValue: 0,
        turnoverMultiplier: selectedMethod?.turnoverMultiplier || 1,
      },
      ...list.sort((a, b) => n(a?.sort) - n(b?.sort)),
    ];
  }, [selectedMethod, t.noBonus]);

  const selectedPromo = useMemo(() => {
    return promotions.find((p) => p.id === selectedPromoId) || promotions[0];
  }, [promotions, selectedPromoId]);

  useEffect(() => {
    if (!selectedMethod) return;

    const channelExists = channels.some((c) => c.id === selectedChannelId);
    if (!channelExists) {
      setSelectedChannelId(channels?.[0]?.id || "");
    }

    const promoExists = promotions.some((p) => p.id === selectedPromoId);
    if (!promoExists) {
      setSelectedPromoId("none");
    }
  }, [
    selectedMethod,
    channels,
    promotions,
    selectedChannelId,
    selectedPromoId,
  ]);

  const calculation = useMemo(() => {
    const amountNum = n(amount);

    const channelPercent = parsePercent(selectedChannel?.tagText);
    const percentBonus = (amountNum * channelPercent) / 100;

    let promoBonus = 0;

    if (selectedPromo && selectedPromo.id !== "none") {
      if (selectedPromo.bonusType === "percent") {
        promoBonus = (amountNum * n(selectedPromo.bonusValue)) / 100;
      } else {
        promoBonus = n(selectedPromo.bonusValue);
      }
    }

    const totalBonus = percentBonus + promoBonus;

    const turnoverMultiplier =
      selectedPromo && selectedPromo.id !== "none"
        ? n(selectedPromo.turnoverMultiplier) || 1
        : n(selectedMethod?.turnoverMultiplier) || 1;

    const creditedAmount = amountNum + totalBonus;
    const targetTurnover = creditedAmount * turnoverMultiplier;

    return {
      amountNum,
      channelPercent,
      percentBonus,
      promoBonus,
      totalBonus,
      turnoverMultiplier,
      creditedAmount,
      targetTurnover,
    };
  }, [amount, selectedChannel, selectedPromo, selectedMethod]);

  const methodName = (method) => {
    if (!method) return "";

    return language === "Bangla"
      ? method?.methodName?.bn || method?.methodName?.en || method?.methodId
      : method?.methodName?.en || method?.methodName?.bn || method?.methodId;
  };

  const channelName = (channel) => {
    if (!channel) return "";

    return language === "Bangla"
      ? channel?.name?.bn || channel?.name?.en || channel?.id
      : channel?.name?.en || channel?.name?.bn || channel?.id;
  };

  const promoName = (promo) => {
    if (!promo) return t.noBonus;

    return language === "Bangla"
      ? promo?.name?.bn || promo?.name?.en || promo?.id
      : promo?.name?.en || promo?.name?.bn || promo?.id;
  };

  const canSubmit =
    !!selectedMethod &&
    !!selectedChannel &&
    !!selectedContact?.number &&
    calculation.amountNum > 0;

  const handleSubmit = () => {
    if (!selectedMethod) return toast.error(t.selectMethod);
    if (!selectedChannel) return toast.error(t.selectChannel);
    if (!selectedContact?.number) return toast.error(t.noNumber);

    if (calculation.amountNum <= 0) {
      return toast.error(t.validAmount);
    }

    const minDeposit = n(selectedMethod.minDepositAmount);
    const maxDeposit = n(selectedMethod.maxDepositAmount);

    if (minDeposit > 0 && calculation.amountNum < minDeposit) {
      return toast.error(`${t.min}: ${money(minDeposit)}`);
    }

    if (maxDeposit > 0 && calculation.amountNum > maxDeposit) {
      return toast.error(`${t.max}: ${money(maxDeposit)}`);
    }

    onClose?.();

    onNext?.({
      amount: calculation.amountNum,
      methodId: selectedMethod.methodId,
      channelId: selectedChannel.id,
      promoId: selectedPromo?.id || "none",
      methodDoc: selectedMethod,
      channelDoc: selectedChannel,
      contactDoc: selectedContact,
      calculation,
    });
  };

  return (
    <>
      <AnimatePresence>
        {open && activeModal === "deposit" && (
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
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex h-[52px] shrink-0 items-center gap-1 bg-[#0865a9] px-4 pb-3">
                <button
                  type="button"
                  className="h-[34px] flex-1 cursor-pointer rounded-[3px] bg-[#2e9bf3] text-[13px] font-bold text-white"
                >
                  {t.deposit}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModal("auto")}
                  className="h-[34px] flex-1 cursor-pointer rounded-[3px] bg-[#00518c] text-[13px] font-bold text-white"
                >
                  {t.autoDeposit}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-white px-4 pb-5 pt-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPromoOpen((p) => !p)}
                    className="flex h-[40px] w-full cursor-pointer items-center justify-between rounded-[3px] bg-[#e9b20d] px-3 text-white"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <BadgePercent size={18} />
                      <span className="shrink-0 text-[14px] font-medium">
                        {t.selectPromotion}
                      </span>
                      <span className="truncate text-[12px] font-bold">
                        {selectedPromo?.id !== "none"
                          ? promoName(selectedPromo)
                          : ""}
                      </span>
                    </div>

                    <ChevronDown size={18} />
                  </button>

                  {promoOpen && (
                    <div className="absolute left-0 right-0 top-[44px] z-20 overflow-hidden rounded-[3px] border border-[#d8d8d8] bg-white shadow-xl">
                      {promotions.map((promo) => (
                        <button
                          key={promo.id}
                          type="button"
                          onClick={() => {
                            setSelectedPromoId(promo.id);
                            setPromoOpen(false);
                          }}
                          className={`flex w-full cursor-pointer items-center justify-between px-3 py-3 text-left text-[13px] ${
                            selectedPromoId === promo.id
                              ? "bg-[#eaf4ff] text-[#0865a9]"
                              : "bg-white text-[#333]"
                          }`}
                        >
                          <span className="font-semibold">
                            {promoName(promo)}
                          </span>
                          <span className="text-[12px] font-bold">
                            {promo.id === "none"
                              ? "x1"
                              : promo.bonusType === "percent"
                                ? `+${promo.bonusValue}% | x${promo.turnoverMultiplier}`
                                : `+৳${promo.bonusValue} | x${promo.turnoverMultiplier}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-[4px] border border-[#97b6e9] bg-[#eef4ff] p-3">
                  <div className="flex items-start gap-2 text-[#2451cc]">
                    <Info size={17} className="mt-[1px] shrink-0" />
                    <p className="text-[14px] leading-[17px]">
                      {t.requiredInfo}
                    </p>
                  </div>

                  <div className="my-3 h-px border-t border-dashed border-[#b4c7ef]" />

                  <div className="border-l-2 border-[#3187ff] pl-3">
                    <p className="text-[14px] font-medium text-[#1572e8]">
                      {t.contactInfo}
                    </p>

                    <div className="mt-2 inline-flex rounded-full bg-[#d8eaff] px-3 py-1 text-[12px] text-[#2581ff]">
                      {t.phoneNumber}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-[13px] font-bold text-[#333]">
                    {t.paymentMethod}
                  </label>

                  {isLoading ? (
                    <div className="rounded-[4px] bg-[#f3f3f3] p-4 text-center text-[13px] text-[#666]">
                      {t.loading}
                    </div>
                  ) : !methods.length ? (
                    <div className="rounded-[4px] bg-[#f3f3f3] p-4 text-center text-[13px] text-[#666]">
                      {t.noMethod}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {methods.map((method) => {
                        const active = method.methodId === selectedMethodId;

                        return (
                          <button
                            key={method._id || method.methodId}
                            type="button"
                            onClick={() => {
                              setSelectedMethodId(method.methodId);
                              setSelectedPromoId("none");

                              const ch =
                                method?.channels?.filter(
                                  (c) => c?.isActive !== false,
                                )?.[0]?.id || "";

                              setSelectedChannelId(ch);
                            }}
                            className={`relative flex h-[72px] cursor-pointer flex-col items-center justify-center rounded-[6px] border bg-white p-2 ${
                              active
                                ? "border-[#0865a9] shadow-[0_0_0_2px_rgba(8,101,169,0.12)]"
                                : "border-[#ddd]"
                            }`}
                          >
                            {method.logoUrl ? (
                              <img
                                src={getImg(method.logoUrl)}
                                alt={methodName(method)}
                                className="max-h-[32px] max-w-[70px] object-contain"
                              />
                            ) : (
                              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#e7f2ff] text-[11px] font-bold text-[#0865a9]">
                                {method.methodId?.slice(0, 2)?.toUpperCase()}
                              </div>
                            )}

                            <span className="mt-1 max-w-full truncate text-[11px] font-semibold text-[#333]">
                              {methodName(method)}
                            </span>

                            {active && (
                              <span className="absolute bottom-0 right-0 h-0 w-0 border-b-[18px] border-l-[18px] border-b-[#0865a9] border-l-transparent" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-[13px] font-bold text-[#333]">
                    {t.depositChannel}
                  </label>

                  {!channels.length ? (
                    <div className="rounded-[4px] bg-[#f3f3f3] p-3 text-[13px] text-[#777]">
                      {t.noChannel}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {channels.map((channel) => {
                        const active = channel.id === selectedChannelId;

                        return (
                          <button
                            key={channel.id}
                            type="button"
                            onClick={() => setSelectedChannelId(channel.id)}
                            className={`relative cursor-pointer rounded-[4px] border px-3 py-2 text-[13px] font-bold ${
                              active
                                ? "border-[#0865a9] bg-[#eaf4ff] text-[#0865a9]"
                                : "border-[#ddd] bg-white text-[#444]"
                            }`}
                          >
                            {channel.tagText ? (
                              <span className="absolute -top-2 right-1 rounded bg-[#e43434] px-1 text-[9px] text-white">
                                {channel.tagText}
                              </span>
                            ) : null}
                            {channelName(channel)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-[13px] font-bold text-[#333]">
                    {t.amount}
                  </label>

                  <input
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value.replace(/[^\d.]/g, ""))
                    }
                    placeholder={t.enterAmount}
                    inputMode="decimal"
                    className="h-[42px] w-full rounded-[4px] border border-[#d7d7d7] bg-[#eeeeee] px-4 text-[14px] text-[#222] outline-none focus:border-[#0865a9]"
                  />

                  {selectedMethod && (
                    <div className="mt-2 text-[12px] text-[#777]">
                      {t.min}: {money(selectedMethod.minDepositAmount)} |{" "}
                      {t.max}: {money(selectedMethod.maxDepositAmount)}
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-[4px] bg-[#eef7ff] p-3 text-[12px] text-[#0865a9]">
                  <div className="flex justify-between">
                    <span>{t.bonus}</span>
                    <span>{money(calculation.totalBonus)}</span>
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
              </div>

              <div className="shrink-0 bg-white px-4 pb-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="relative h-[38px] w-full cursor-pointer rounded-[2px] bg-[#0865a9] text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#a6a6a6]"
                >
                  {t.submit}

                  {!canSubmit && (
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[#333] bg-[#e95b5b] text-white">
                      <AlertCircle size={15} />
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AutoDepositModal
        open={open && activeModal === "auto"}
        onClose={onClose}
        onDepositClick={() => setActiveModal("deposit")}
      />
    </>
  );
};

export default DepositFundsModal;
