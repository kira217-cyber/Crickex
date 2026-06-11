import React, { useState } from "react";
import { Link } from "react-router";
import { Menu, X, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../../Context/LanguageProvider";
import RegisterModal from "../RegisterModal/RegisterModal";
import LoginModal from "../LoginModal/LoginModal";

const flagUrl = {
  Bangla: "https://flagcdn.com/w40/bd.png",
  English: "https://flagcdn.com/w40/us.png",
};

const Navber = ({ setOpen }) => {
  const { language, changeLanguage, isBangla } = useLanguage();
  const [openRegister, setOpenRegister] = useState(false);
  const [openLangModal, setOpenLangModal] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);

  const texts = {
    signup: isBangla ? "সাইন আপ" : "Sign Up",
    login: isBangla ? "লগইন" : "Login",
    language: isBangla ? "ভাষা নির্বাচন করুন" : "Choose Language",
    subtitle: isBangla
      ? "আপনার পছন্দের ভাষা বেছে নিন"
      : "Select your preferred language",
  };

  const languages = [
    { key: "Bangla", label: "বাংলা", flag: flagUrl.Bangla },
    { key: "English", label: "English", flag: flagUrl.English },
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
            <button
              type="button"
              onClick={() => setOpenRegister(true)}
              className="min-w-[105px] cursor-pointer rounded-[5px] bg-[#5ed51d] px-6 py-[10px] text-center text-[13px] font-bold text-white transition hover:bg-[#52c719]"
            >
              {texts.signup}
            </button>

            <button
              type="button"
              onClick={() => setOpenLogin(true)}
              className="min-w-[105px] cursor-pointer rounded-[5px] bg-[#247ccf] px-6 py-[10px] text-center text-[13px] font-bold text-white transition hover:bg-[#1f72c0]"
            >
              {texts.login}
            </button>

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
    </>
  );
};

export default Navber;
