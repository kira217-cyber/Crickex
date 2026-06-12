import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  Menu,
  X,
  Check,
  WalletCards,
  RefreshCw,
  UserCircle,
  CircleDollarSign,
  Gift,
  Trophy,
  LogOut,
  Landmark,
  BadgeDollarSign,
  History,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectIsAuth, selectUser } from "../../features/auth/authSelectors";
import { logout } from "../../features/auth/authSlice";
import RegisterModal from "../RegisterModal/RegisterModal";
import LoginModal from "../LoginModal/LoginModal";

const flagUrl = {
  Bangla: "https://flagcdn.com/w40/bd.png",
  English: "https://flagcdn.com/w40/us.png",
};

const Navber = ({ setOpen }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { language, changeLanguage, isBangla } = useLanguage();

  const isAuth = useSelector(selectIsAuth);
  const user = useSelector(selectUser);

  const [openRegister, setOpenRegister] = useState(false);
  const [openLangModal, setOpenLangModal] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref") || params.get("referCode");

    if (ref && !isAuth) {
      setOpenLogin(false);
      setOpenRegister(true);
    }
  }, [location.search, isAuth]);

  const texts = {
    signup: isBangla ? "সাইন আপ" : "Sign Up",
    login: isBangla ? "লগইন" : "Login",
    deposit: isBangla ? "ডিপোজিট" : "Deposit",
    mainWallet: isBangla ? "মেইন ওয়ালেট" : "Main Wallet",
    language: isBangla ? "ভাষা নির্বাচন করুন" : "Choose Language",
    subtitle: isBangla
      ? "আপনার পছন্দের ভাষা বেছে নিন"
      : "Select your preferred language",
    vipPoints: isBangla ? "ভিআইপি পয়েন্ট" : "VIP Points",
    bonusWallet: isBangla ? "বোনাস ওয়ালেট" : "Bonus Wallet",
    withdrawal: isBangla ? "উইথড্রয়াল" : "Withdrawal",
    freeSpin: isBangla ? "ফ্রি স্পিন" : "Free Spin",
    realTimeBonus: isBangla ? "রিয়েল-টাইম বোনাস" : "Real-Time Bonus",
    referBonus: isBangla ? "রেফার বোনাস" : "Refer Bonus",
    winnerBoard: isBangla ? "উইনার বোর্ড" : "Winner Board",
    dailyStreak: isBangla
      ? "ডেইলি স্ট্রিক চ্যালেঞ্জ"
      : "Daily Streak Challenge",
    bettingRecords: isBangla ? "বেটিং রেকর্ডস" : "Betting Records",
    logout: isBangla ? "লগআউট" : "Logout",
  };

  const languages = [
    { key: "Bangla", label: "বাংলা", flag: flagUrl.Bangla },
    { key: "English", label: "English", flag: flagUrl.English },
  ];

  const balance = Number(user?.balance || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const handleLogout = () => {
    dispatch(logout());
    setOpenProfileMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { label: texts.deposit, path: "/deposit", icon: Landmark },
    { label: texts.withdrawal, path: "/withdrawal", icon: BadgeDollarSign },
    { label: texts.bonusWallet, path: "/bonus-wallet", icon: Gift, badge: "0" },
    { label: texts.freeSpin, path: "/free-spin", icon: CircleDollarSign },
    {
      label: `${texts.realTimeBonus}\n${texts.referBonus}`,
      path: "/refer-bonus",
      icon: Gift,
    },
    { label: texts.winnerBoard, path: "/winner-board", icon: Trophy },
    {
      label: texts.dailyStreak,
      path: "/daily-streak",
      icon: Trophy,
      alert: true,
    },
    { label: texts.bettingRecords, path: "/betting-records", icon: History },
  ];

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-30 h-[56px] bg-[#0b66a8] shadow-sm lg:h-[64px]">
        <div className="mx-auto flex h-full max-w-[1230px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="cursor-pointer text-white lg:hidden"
          >
            <Menu size={25} />
          </button>

          <Link to="/" className="flex items-center lg:flex-1">
            <img
              src="https://img.c88rx.com/cx/h5/assets/images/logo.png?v=1779771685731"
              alt="logo"
              className="h-[24px] object-contain lg:h-[28px]"
            />
          </Link>

          <div className="hidden items-center gap-3 lg:flex">
            {!isAuth ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setOpenLogin(false);
                    setOpenRegister(true);
                  }}
                  className="min-w-[105px] cursor-pointer rounded-[5px] bg-[#5ed51d] px-6 py-[10px] text-center text-[13px] font-bold text-white transition hover:bg-[#52c719]"
                >
                  {texts.signup}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpenRegister(false);
                    setOpenLogin(true);
                  }}
                  className="min-w-[105px] cursor-pointer rounded-[5px] bg-[#247ccf] px-6 py-[10px] text-center text-[13px] font-bold text-white transition hover:bg-[#1f72c0]"
                >
                  {texts.login}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/deposit"
                  className="flex h-[36px] cursor-pointer items-center gap-2 rounded-[4px] bg-[#247ccf] px-3 text-[13px] font-medium text-white transition hover:bg-[#1f72c0]"
                >
                  <WalletCards size={18} className="fill-white/20" />
                  <span>{texts.deposit}</span>
                </Link>

                <Link
                  to="/wallet"
                  className="flex h-[36px] cursor-pointer items-center gap-2 rounded-[5px] bg-[#5ed51d] px-3 text-[13px] font-bold text-white transition hover:bg-[#52c719]"
                >
                  <RefreshCw size={16} />
                  <span>{texts.mainWallet}</span>
                  <span>৳{balance}</span>
                </Link>

                <div ref={profileRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenProfileMenu((prev) => !prev)}
                    className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full bg-white text-[#0b66a8] transition hover:scale-105"
                  >
                    <UserCircle size={25} />
                  </button>

                  <AnimatePresence>
                    {openProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 top-[43px] w-[215px] overflow-hidden rounded-[2px] bg-white text-[#333] shadow-xl"
                      >
                        <div className="border-b border-[#f0f0f0] px-4 py-3">
                          <div className="text-[14px] text-[#333]">
                            {texts.vipPoints}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[18px] font-bold text-[#005eb8]">
                            <span>0</span>
                            <RefreshCw size={13} />
                          </div>

                          <div className="mt-3 text-[14px] text-[#333]">
                            {texts.bonusWallet}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[18px] font-bold text-[#005eb8]">
                            <span>৳ 0</span>
                            <RefreshCw size={13} />
                          </div>
                        </div>

                        <div className="py-2">
                          {menuItems.map((item) => {
                            const Icon = item.icon;

                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setOpenProfileMenu(false)}
                                className="flex min-h-[47px] items-center gap-3 px-4 text-[16px] font-bold text-[#3d3d3d] transition hover:bg-[#f7f7f7]"
                              >
                                <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full bg-pink-500 text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.35)]">
                                  <Icon size={13} />
                                </span>

                                <span className="flex-1 whitespace-pre-line leading-[16px]">
                                  {item.label}
                                </span>

                                {item.badge && (
                                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#cc4c5b] px-1 text-[12px] font-bold text-white">
                                    {item.badge}
                                  </span>
                                )}

                                {item.alert && (
                                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#cc4c5b] px-1 text-[12px] font-bold text-white">
                                    !
                                  </span>
                                )}
                              </Link>
                            );
                          })}

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex min-h-[47px] w-full cursor-pointer items-center gap-3 px-4 text-left text-[16px] font-bold text-[#d93636] transition hover:bg-[#fff3f3]"
                          >
                            <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full bg-[#d93636] text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.35)]">
                              <LogOut size={13} />
                            </span>
                            <span>{texts.logout}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setOpenLangModal(true)}
              className="ml-1 flex h-[34px] w-[34px] cursor-pointer items-center justify-center overflow-hidden rounded-full transition hover:scale-105"
            >
              <img
                src={language === "Bangla" ? flagUrl.Bangla : flagUrl.English}
                alt={language}
                className="h-[26px] w-[26px] rounded-full object-cover"
              />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setOpenLangModal(true)}
            className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center overflow-hidden rounded-full transition hover:scale-105 lg:hidden"
          >
            <img
              src={language === "Bangla" ? flagUrl.Bangla : flagUrl.English}
              alt={language}
              className="h-[26px] w-[26px] rounded-full object-cover"
            />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {openLangModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 px-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 18 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="bg-[#0b66a8] px-5 py-4 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">{texts.language}</h2>
                    <p className="mt-1 text-xs text-white/80">
                      {texts.subtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpenLangModal(false)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="rounded-xl bg-[#eef7ff] p-1">
                  {languages.map((item) => {
                    const active = language === item.key;

                    return (
                      <button
                        type="button"
                        key={item.key}
                        onClick={() => {
                          changeLanguage(item.key);
                          setOpenLangModal(false);
                        }}
                        className={`mb-1 flex h-[52px] w-full cursor-pointer items-center justify-between rounded-lg px-3 transition last:mb-0 ${
                          active
                            ? "bg-[#0b66a8] text-white shadow-md"
                            : "bg-white text-[#111] hover:bg-[#f8fbff]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.flag}
                            alt={item.label}
                            className="h-8 w-8 rounded-full object-cover"
                          />

                          <span className="text-sm font-bold">
                            {item.label}
                          </span>
                        </div>

                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                            active
                              ? "border-white bg-white text-[#0b66a8]"
                              : "border-[#c9dff2] bg-[#eef7ff] text-transparent"
                          }`}
                        >
                          <Check size={15} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <RegisterModal
        open={openRegister}
        onClose={() => setOpenRegister(false)}
        onLoginClick={() => {
          setOpenRegister(false);
          setOpenLogin(true);
        }}
      />

      <LoginModal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        onRegisterClick={() => {
          setOpenLogin(false);
          setOpenRegister(true);
        }}
      />
    </>
  );
};

export default Navber;
