import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Gift, CreditCard, WalletCards } from "lucide-react";
import { toast } from "react-toastify";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectIsAuth, selectUser } from "../../features/auth/authSelectors";
import { updateUser } from "../../features/auth/authSlice";
import api from "../../api/axios";
import DepositFundsModal from "../DepositFundsModal/DepositFundsModal";
import DepositConfirmModal from "../DepositConfirmModal/DepositConfirmModal";
import DepositHistoryModal from "../DepositHistoryModal/DepositHistoryModal";
import PromotionModal from "../PromotionModal/PromotionModal";

const BalanceSection = () => {
  const dispatch = useDispatch();
  const { isBangla } = useLanguage();

  const isAuth = useSelector(selectIsAuth);
  const user = useSelector(selectUser);

  const [refreshing, setRefreshing] = useState(false);
  const [openPromotion, setOpenPromotion] = useState(false);

  const [openDepositFunds, setOpenDepositFunds] = useState(false);
  const [openDepositConfirm, setOpenDepositConfirm] = useState(false);
  const [openDepositHistory, setOpenDepositHistory] = useState(false);
  const [depositData, setDepositData] = useState(null);

  if (!isAuth) return null;

  const balance = Number(user?.balance || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const t = {
    balance: isBangla ? "ব্যালেন্স" : "Balance",
    promotions: isBangla ? "প্রোমোশন" : "Promotions",
    deposit: isBangla ? "ডিপোজিট" : "Deposit",
    refreshSuccess: isBangla ? "ব্যালেন্স আপডেট হয়েছে" : "Balance updated",
    refreshFailed: isBangla
      ? "ব্যালেন্স আপডেট করা যায়নি"
      : "Failed to refresh balance",
  };

  const handleRefreshBalance = async () => {
    try {
      setRefreshing(true);

      const res = await api.get("/api/user-info/balance");
      const data = res?.data?.data || {};

      dispatch(
        updateUser({
          balance: Number(data.balance || 0),
          currency: data.currency || "BDT",
          commissionBalance: Number(data.commissionBalance || 0),
          gameLossCommissionBalance: Number(
            data.gameLossCommissionBalance || 0,
          ),
          depositCommissionBalance: Number(data.depositCommissionBalance || 0),
          referCommissionBalance: Number(data.referCommissionBalance || 0),
          gameWinCommissionBalance: Number(data.gameWinCommissionBalance || 0),
        }),
      );

      toast.success(res?.data?.message || t.refreshSuccess);
    } catch (error) {
      toast.error(error?.response?.data?.message || t.refreshFailed);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-r from-[#064b83] via-[#0b66a8] to-[#063f70] px-2 py-3 text-white shadow-lg md:hidden">
        <div className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -right-8 -bottom-10 h-24 w-24 rounded-full bg-[#5ed51d]/20 blur-2xl" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]">
              <WalletCards size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-white/70">
                {t.balance}
              </p>
              <p className="truncate text-[18px] font-black leading-tight">
                ৳ {balance}
              </p>
            </div>
          </div>

          <div className="flex h-full items-center gap-3">
            <button
              type="button"
              onClick={handleRefreshBalance}
              disabled={refreshing}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>

            <div className="h-[30px] w-px bg-white/15" />

            <button
              type="button"
              onClick={() => setOpenPromotion(true)}
              className="flex h-full min-w-[56px] cursor-pointer flex-col items-center justify-center gap-[3px] text-white"
            >
              <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]">
                <Gift size={15} className="text-[#ff4960]" />
              </span>
              <span className="text-[11px] font-semibold leading-none">
                {t.promotions}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOpenDepositFunds(true)}
              className="flex h-full min-w-[56px] cursor-pointer flex-col items-center justify-center gap-[3px] text-white"
            >
              <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]">
                <CreditCard size={15} className="text-[#ff4960]" />
              </span>
              <span className="text-[11px] font-semibold leading-none">
                {t.deposit}
              </span>
            </button>
          </div>
        </div>
      </div>

      <PromotionModal
        open={openPromotion}
        onClose={() => setOpenPromotion(false)}
      />

      <DepositFundsModal
        open={openDepositFunds}
        onClose={() => setOpenDepositFunds(false)}
        onNext={(payload) => {
          setDepositData(payload);
          setOpenDepositFunds(false);
          setOpenDepositConfirm(true);
        }}
      />

      <DepositConfirmModal
        open={openDepositConfirm}
        depositData={depositData}
        onClose={() => setOpenDepositConfirm(false)}
        onBack={() => {
          setOpenDepositConfirm(false);
          setOpenDepositFunds(true);
        }}
        onSuccess={() => {
          setOpenDepositConfirm(false);
          setOpenDepositHistory(true);
        }}
      />

      <DepositHistoryModal
        open={openDepositHistory}
        onClose={() => setOpenDepositHistory(false)}
        onBackToDeposit={() => {
          setOpenDepositHistory(false);
          setOpenDepositFunds(true);
        }}
      />
    </>
  );
};

export default BalanceSection;
