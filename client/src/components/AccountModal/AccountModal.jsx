import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  RefreshCw,
  Eye,
  EyeOff,
  Wallet,
  User,
  Lock,
  Inbox,
  MessageCircle,
  Mail,
  LogOut,
  X,
  Landmark,
  ReceiptText,
  ClipboardList,
  TrendingUp,
  Gift,
  BarChart3,
  FileText,
  AlertCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { useLanguage } from "../../Context/LanguageProvider";
import api from "../../api/axios";
import { logout, updateUser } from "../../features/auth/authSlice";
import { selectIsAuth, selectUser } from "../../features/auth/authSelectors";

const API_URL = import.meta.env.VITE_API_URL;

const defaults = {
  isEnabled: true,

  showBalanceCard: true,
  showFundsSection: true,
  showPLSection: true,
  showHistorySection: true,
  showProfileSection: true,
  showContactSection: true,
  showLogoutButton: true,
  showDepositButton: true,
  showWithdrawButton: true,
  showRefreshBalance: true,
  showHideBalance: true,

  pageTitleEn: "Account",
  pageTitleBn: "অ্যাকাউন্ট",

  depositTextEn: "Deposit",
  depositTextBn: "ডিপোজিট",

  withdrawTextEn: "Withdraw",
  withdrawTextBn: "উইথড্র",

  logoutTextEn: "Log out",
  logoutTextBn: "লগ আউট",

  whatsappLink: "https://whatsapp.com/",
  emailLink: "https://mail.google.com/",
  telegramLink: "",

  headerBackgroundImage: "",
  accountAvatar: "",
};

const getFileUrl = (path) => {
  if (!path) return "";

  const value = String(path).trim();
  if (!value) return "";
  if (value.startsWith("blob:")) return value;
  if (value.startsWith("http")) return value.replace(/([^:]\/)\/+/g, "$1");

  const base = String(API_URL || "").replace(/\/+$/, "");
  const cleanPath = value
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/{2,}/g, "/");

  return `${base}/${cleanPath}`;
};

const AccountModal = ({
  open,
  onClose,
  onDepositClick,
  onWithdrawClick,
  onTransactionClick,
  onPersonalInfoClick,
  onPasswordChangeClick,
  onLogoutDone,
}) => {
  const { isBangla } = useLanguage();
  const dispatch = useDispatch();

  const authUser = useSelector(selectUser);
  const isAuth = useSelector(selectIsAuth);

  const [setting, setSetting] = useState(defaults);
  const [loadingSetting, setLoadingSetting] = useState(true);
  const [balance, setBalance] = useState(Number(authUser?.balance || 0));
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);

  const blue = "#0865a9";
  const darkBlue = "#00518c";
  const lightBlue = "#eef4ff";
  const orange = "#e9b20d";
  const red = "#ef4444";

  const t = {
    account: isBangla ? setting.pageTitleBn : setting.pageTitleEn,
    userId: isBangla ? "ইউজার আইডি" : "User ID",
    phone: isBangla ? "ফোন" : "Phone",
    guest: isBangla ? "গেস্ট" : "Guest",
    balance: isBangla ? "ব্যালেন্স" : "Balance",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    currency: "TK",

    funds: isBangla ? "ফান্ডস" : "Funds",
    deposit: isBangla ? setting.depositTextBn : setting.depositTextEn,
    withdraw: isBangla ? setting.withdrawTextBn : setting.withdrawTextEn,
    wallet: isBangla ? "ওয়ালেট" : "Wallet",
    dispute: isBangla ? "ডিসপিউট" : "Dispute",

    myPL: isBangla ? "আমার P&L" : "My P&L",
    turnover: isBangla ? "টার্নওভার" : "Turnover",
    rewards: isBangla ? "রিওয়ার্ডস" : "Rewards",
    pl: isBangla ? "পি&এল" : "P&L",

    history: isBangla ? "হিস্টোরি" : "History",
    betHistory: isBangla ? "বেট হিস্টোরি" : "Bet History",
    withdrawHistory: isBangla ? "উইথড্র হিস্টোরি" : "Withdraw History",
    depositHistory: isBangla ? "ডিপোজিট হিস্টোরি" : "Deposit History",

    profile: isBangla ? "প্রোফাইল" : "Profile",
    personalInfo: isBangla ? "ব্যক্তিগত তথ্য" : "Personal Info",
    resetPassword: isBangla ? "পাসওয়ার্ড রিসেট" : "Reset Password",
    inbox: isBangla ? "ইনবক্স" : "Inbox",

    contact: isBangla ? "যোগাযোগ" : "Contact",
    whatsapp: isBangla ? "হোয়াটসঅ্যাপ" : "WhatsApp",
    email: isBangla ? "ইমেইল" : "Email",

    logout: isBangla ? setting.logoutTextBn : setting.logoutTextEn,
    logoutSuccess: isBangla ? "সফলভাবে লগআউট হয়েছে" : "Logged out successfully",
    balanceError: isBangla
      ? "ব্যালেন্স লোড করা যায়নি"
      : "Failed to load balance",
  };

  const formatAmount = (value) => {
    const num = Number(value || 0);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const fetchSetting = async () => {
    try {
      setLoadingSetting(true);

      const res = await api.get("/api/account-page-setting");

      if (res?.data?.success && res?.data?.data) {
        setSetting({
          ...defaults,
          ...res.data.data,
        });
      } else {
        setSetting(defaults);
      }
    } catch (error) {
      console.error("Account setting load error:", error);
      setSetting(defaults);
    } finally {
      setLoadingSetting(false);
    }
  };

  const fetchBalance = async () => {
    if (!isAuth) return;

    try {
      setLoadingBalance(true);

      const res = await api.get("/api/user-info/balance");
      const data = res?.data?.data || {};
      const nextBalance = Number(data.balance || 0);

      setBalance(nextBalance);

      dispatch(
        updateUser({
          balance: nextBalance,
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
    } catch (error) {
      console.error("Balance fetch error:", error);
      toast.error(error?.response?.data?.message || t.balanceError);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSetting();
      fetchBalance();
    }
  }, [open]);

  useEffect(() => {
    setBalance(Number(authUser?.balance || 0));
  }, [authUser?.balance]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success(t.logoutSuccess);
    onLogoutDone?.();
  };

  const userId = authUser?.userId || authUser?.username || t.guest;
  const phone =
    authUser?.phone ||
    [authUser?.countryCode, authUser?.phoneNumber].filter(Boolean).join("") ||
    "N/A";

  const headerImage = getFileUrl(setting.headerBackgroundImage);
  const accountAvatar = getFileUrl(setting.accountAvatar);

  const iconBoxClass =
    "mx-auto flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#eaf4ff] text-[#0865a9] shadow-sm transition group-hover:scale-105";

  const fundsItems = useMemo(
    () => [
      { title: t.deposit, icon: Wallet, action: onDepositClick },
      { title: t.withdraw, icon: Landmark, action: onWithdrawClick },
      { title: t.wallet, icon: Wallet, action: onTransactionClick },
      { title: t.dispute, icon: AlertCircle, action: onTransactionClick },
    ],
    [t.deposit, t.withdraw, t.wallet, t.dispute],
  );

  const plItems = useMemo(
    () => [
      { title: t.turnover, icon: TrendingUp, action: onTransactionClick },
      { title: t.rewards, icon: Gift, action: onTransactionClick },
      { title: t.pl, icon: BarChart3, action: onTransactionClick },
    ],
    [t.turnover, t.rewards, t.pl],
  );

  const historyItems = useMemo(
    () => [
      { title: t.betHistory, icon: ClipboardList, action: onTransactionClick },
      {
        title: t.withdrawHistory,
        icon: ReceiptText,
        action: onTransactionClick,
      },
      { title: t.depositHistory, icon: FileText, action: onTransactionClick },
    ],
    [t.betHistory, t.withdrawHistory, t.depositHistory],
  );

  const profileItems = useMemo(
    () => [
      { title: t.personalInfo, icon: User, action: onPersonalInfoClick },
      { title: t.resetPassword, icon: Lock, action: onPasswordChangeClick },
      { title: t.inbox, icon: Inbox, action: onTransactionClick },
    ],
    [t.personalInfo, t.resetPassword, t.inbox],
  );

  const contactItems = useMemo(() => {
    const arr = [];

    if (setting.whatsappLink) {
      arr.push({
        title: t.whatsapp,
        icon: MessageCircle,
        to: setting.whatsappLink,
        external: true,
      });
    }

    if (setting.emailLink) {
      arr.push({
        title: t.email,
        icon: Mail,
        to: setting.emailLink,
        external: true,
      });
    }

    return arr;
  }, [setting.whatsappLink, setting.emailLink, t.whatsapp, t.email]);

  const Section = ({ title, children }) => (
    <div className="overflow-hidden rounded-[4px] border border-[#dce8f5] bg-white shadow-sm">
      <div className="flex h-[42px] items-center gap-2 border-b border-[#dce8f5] bg-[#eef4ff] px-3">
        <span className="h-5 w-[4px] rounded-full bg-[#0865a9]" />
        <h3 className="text-[14px] font-bold text-[#0865a9]">{title}</h3>
      </div>
      {children}
    </div>
  );

  const MenuGrid = ({ items, columns = 3 }) => {
    const gridCols =
      columns === 4
        ? "grid-cols-4"
        : columns === 2
          ? "grid-cols-2"
          : "grid-cols-3";

    return (
      <div className={`grid gap-2 p-3 ${gridCols}`}>
        {items.map((item, index) => {
          const Icon = item.icon;

          const content = (
            <>
              <div className={iconBoxClass}>
                <Icon size={21} strokeWidth={2.3} />
              </div>

              <span className="mt-2 min-h-[30px] text-center text-[11px] font-bold leading-tight text-[#333]">
                {item.title}
              </span>
            </>
          );

          if (item.external) {
            return (
              <a
                key={index}
                href={item.to}
                target="_blank"
                rel="noreferrer"
                className="group flex cursor-pointer flex-col items-center justify-start rounded-[4px] p-1 transition hover:bg-[#f7fbff]"
              >
                {content}
              </a>
            );
          }

          return (
            <button
              key={index}
              type="button"
              onClick={item.action}
              className="group flex cursor-pointer flex-col items-center justify-start rounded-[4px] p-1 transition hover:bg-[#f7fbff]"
            >
              {content}
            </button>
          );
        })}
      </div>
    );
  };

  if (!setting.isEnabled) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99990] flex items-center justify-center bg-black/45 px-0 backdrop-blur-[3px] sm:px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-screen w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[700px] sm:max-w-[375px] sm:rounded-[8px]"
          >
            {loadingSetting ? (
              <div className="flex h-full items-center justify-center bg-white">
                <div className="flex items-center gap-2 rounded-[6px] bg-[#eef4ff] px-4 py-3 text-[14px] font-bold text-[#0865a9] shadow-sm">
                  <Loader2 size={18} className="animate-spin" />
                  {t.loading}
                </div>
              </div>
            ) : (
              <>
                <div
                  className="relative shrink-0 overflow-hidden bg-[#0865a9] text-white"
                  style={{
                    backgroundImage: headerImage
                      ? `url(${headerImage})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="relative flex h-[50px] items-center justify-center bg-[#0865a9]/95">
                    <h2 className="text-[18px] font-semibold">{t.account}</h2>

                    <button
                      type="button"
                      onClick={onClose}
                      className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center text-white"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="px-4 pb-4">
                    <div className="rounded-[4px] bg-white/10 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/70 bg-[#e9b20d] text-white">
                          {accountAvatar ? (
                            <img
                              src={accountAvatar}
                              alt="Account"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-[28px] font-black leading-none">
                              {String(userId || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-bold">
                            {t.userId}: {userId}
                          </p>
                          <p className="mt-1 truncate text-[12px] text-white/80">
                            {t.phone}: {phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-white px-4 pb-5 pt-3">
                  {setting.showBalanceCard && (
                    <div className="rounded-[4px] border border-[#97b6e9] bg-[#eef4ff] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-[#2451cc]">
                            <Wallet size={18} className="shrink-0" />
                            <h3 className="text-[14px] font-bold">
                              {t.balance}
                            </h3>

                            {setting.showHideBalance && (
                              <button
                                type="button"
                                onClick={() => setHideBalance((prev) => !prev)}
                                className="cursor-pointer text-[#0865a9]"
                              >
                                {hideBalance ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </button>
                            )}

                            {setting.showRefreshBalance && (
                              <button
                                type="button"
                                onClick={fetchBalance}
                                disabled={loadingBalance}
                                className={`cursor-pointer text-[#0865a9] disabled:cursor-not-allowed disabled:opacity-60 ${
                                  loadingBalance ? "animate-spin" : ""
                                }`}
                              >
                                <RefreshCw size={16} />
                              </button>
                            )}
                          </div>

                          <p className="mt-2 truncate text-[24px] font-black leading-none text-[#0865a9]">
                            {loadingBalance
                              ? t.loading
                              : hideBalance
                                ? `•••••• ${t.currency}`
                                : `${formatAmount(balance)} ${t.currency}`}
                          </p>
                        </div>

                        <div className="flex w-[105px] shrink-0 flex-col gap-2">
                          {setting.showDepositButton && (
                            <button
                              type="button"
                              onClick={onDepositClick}
                              className="h-[34px] cursor-pointer rounded-[3px] bg-[#0865a9] text-[13px] font-bold text-white"
                            >
                              {t.deposit}
                            </button>
                          )}

                          {setting.showWithdrawButton && (
                            <button
                              type="button"
                              onClick={onWithdrawClick}
                              className="h-[34px] cursor-pointer rounded-[3px] bg-[#ef4444] text-[13px] font-bold text-white"
                            >
                              {t.withdraw}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 space-y-3">
                    {setting.showFundsSection && (
                      <Section title={t.funds}>
                        <MenuGrid items={fundsItems} columns={4} />
                      </Section>
                    )}

                    {setting.showPLSection && (
                      <Section title={t.myPL}>
                        <MenuGrid items={plItems} columns={3} />
                      </Section>
                    )}

                    {setting.showHistorySection && (
                      <Section title={t.history}>
                        <MenuGrid items={historyItems} columns={3} />
                      </Section>
                    )}

                    {setting.showProfileSection && (
                      <Section title={t.profile}>
                        <MenuGrid items={profileItems} columns={3} />
                      </Section>
                    )}

                    {setting.showContactSection && contactItems.length > 0 && (
                      <Section title={t.contact}>
                        <MenuGrid items={contactItems} columns={2} />
                      </Section>
                    )}

                    {setting.showLogoutButton && (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-[3px] bg-[#e9b20d] text-[14px] font-bold text-white"
                      >
                        <LogOut size={18} />
                        <span>{t.logout}</span>
                        <ChevronRight size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AccountModal;
