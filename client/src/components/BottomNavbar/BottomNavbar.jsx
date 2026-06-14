import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  Check,
  X,
  Home,
  Gift,
  Landmark,
  UserCircle,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import { selectIsAuth } from "../../features/auth/authSelectors";
import RegisterModal from "../RegisterModal/RegisterModal";
import LoginModal from "../LoginModal/LoginModal";
import DepositFundsModal from "../DepositFundsModal/DepositFundsModal";
import DepositConfirmModal from "../DepositConfirmModal/DepositConfirmModal";
import DepositHistoryModal from "../DepositHistoryModal/DepositHistoryModal";
import PromotionModal from "../PromotionModal/PromotionModal";

const flagUrl = {
  Bangla: "https://flagcdn.com/w40/bd.png",
  English: "https://flagcdn.com/w40/us.png",
};

const BottomNavbar = () => {
  const location = useLocation();
  const { language, changeLanguage, isBangla } = useLanguage();
  const isAuth = useSelector(selectIsAuth);

  const [openLangModal, setOpenLangModal] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);

  const [openPromotion, setOpenPromotion] = useState(false);
  const [openDepositFunds, setOpenDepositFunds] = useState(false);
  const [openDepositConfirm, setOpenDepositConfirm] = useState(false);
  const [openDepositHistory, setOpenDepositHistory] = useState(false);
  const [depositData, setDepositData] = useState(null);

  const languages = [
    { key: "Bangla", label: "বাংলা", flag: flagUrl.Bangla },
    { key: "English", label: "English", flag: flagUrl.English },
  ];

  const closeDepositFlow = () => {
    setOpenDepositFunds(false);
    setOpenDepositConfirm(false);
    setOpenDepositHistory(false);
  };

  const authMenus = [
    {
      label: isBangla ? "হোম" : "Home",
      path: "/",
      icon: Home,
      type: "link",
    },
    {
      label: isBangla ? "প্রোমোশন" : "Promotions",
      path: "__promotion_modal__",
      icon: Gift,
      type: "button",
      badge: "0",
    },
    {
      label: isBangla ? "ডিপোজিট" : "Deposit",
      path: "__deposit_modal__",
      icon: Landmark,
      type: "button",
      highlight: true,
    },
    {
      label: isBangla ? "আমার একাউন্ট" : "My Account",
      path: "/profile",
      icon: UserCircle,
      type: "link",
    },
  ];

  const handleMenuClick = (item) => {
    if (item.path === "__promotion_modal__") {
      closeDepositFlow();
      setOpenPromotion(true);
      return;
    }

    if (item.path === "__deposit_modal__") {
      setOpenPromotion(false);
      closeDepositFlow();
      setOpenDepositFunds(true);
    }
  };

  const isActivePath = (path) => {
    if (!path || path.startsWith("__")) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {!isAuth ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex h-[50px] border-t border-[#c9c9c9] bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.12)] md:hidden">
          <button
            type="button"
            onClick={() => setOpenLangModal(true)}
            className="flex w-[100px] cursor-pointer items-center justify-center gap-2 bg-[#dce8f2]"
          >
            <img
              src={language === "Bangla" ? flagUrl.Bangla : flagUrl.English}
              alt={language}
              className="h-[25px] w-[25px] rounded-full object-cover"
            />

            <div className="text-left leading-[15px]">
              <p className="text-[13px] font-bold text-[#0b3554]">BDT</p>
              <p className="text-[12px] font-semibold text-[#111]">
                {isBangla ? "বাংলা" : "English"}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setOpenRegister(true)}
            className="flex flex-1 cursor-pointer items-center justify-center bg-white text-[15px] font-bold text-[#111]"
          >
            {isBangla ? "সাইন আপ" : "Sign Up"}
          </button>

          <button
            type="button"
            onClick={() => setOpenLogin(true)}
            className="flex flex-1 cursor-pointer items-center justify-center bg-[#0b66a8] text-[15px] font-bold text-white"
          >
            {isBangla ? "লগইন" : "Login"}
          </button>
        </div>
      ) : (
        <div className="fixed bottom-2 left-0 right-0 z-40 border-t border-white/10 md:hidden">
          <div className="flex h-[58px] items-center justify-between rounded-[18px] border border-white/10 bg-white/5 px-1 backdrop-blur-md  bg-gradient-to-r from-[#051b2e] via-[#082f50] to-[#051b2e] px-2 pb-[3px] pt-[5px] shadow-[0_-8px_24px_rgba(0,0,0,0.35)]">
            {authMenus.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(item.path);
              const isDeposit = item.path === "__deposit_modal__";

              const content = (
                <>
                  <div
                    className={`relative flex h-[30px] w-[30px] items-center justify-center rounded-full transition  ${
                      isDeposit
                        ? "bg-gradient-to-br from-[#2e9bf3] to-[#0865a9] text-white shadow-lg shadow-blue-900/30"
                        : active
                          ? "bg-[#2e9bf3] text-white"
                          : "bg-white/10 text-white/85"
                    }`}
                  >
                    <Icon size={17} />

                    {/* {item.badge !== undefined && (
                      <span className="absolute -right-[6px] -top-[4px] flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#e0182d] px-[3px] text-[9px] font-bold text-white">
                        {item.badge}
                      </span>
                    )} */}

                    {isDeposit && (
                      <span className="absolute -right-[3px] -top-[3px] flex h-[13px] w-[13px] items-center justify-center rounded-full bg-[#5ed51d] text-white">
                        <Sparkles size={8} />
                      </span>
                    )}
                  </div>

                  <span
                    className={`mt-[3px] text-[10.5px] font-bold leading-none ${
                      active || isDeposit ? "text-white" : "text-white/75"
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              );

              if (item.type === "link") {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative flex h-full flex-1 cursor-pointer flex-col items-center justify-center"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleMenuClick(item)}
                  className="relative flex h-full flex-1 cursor-pointer flex-col items-center justify-center"
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
                    <h2 className="text-lg font-bold">
                      {isBangla ? "ভাষা নির্বাচন করুন" : "Choose Language"}
                    </h2>
                    <p className="mt-1 text-xs text-white/80">
                      {isBangla
                        ? "আপনার পছন্দের ভাষা বেছে নিন"
                        : "Select your preferred language"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpenLangModal(false)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white"
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
                            : "bg-white text-[#111]"
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
      </AnimatePresence>

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

export default BottomNavbar;
