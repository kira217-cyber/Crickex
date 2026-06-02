import React, { useState } from "react";
import { Link } from "react-router";
import { Check, ChevronDown, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../../Context/LanguageProvider";

const LOGO_URL =
  "https://crickexpartner.com/wp-content/uploads/2024/03/logo-2.png";

const flagUrl = {
  Bangla: "https://flagcdn.com/w40/bd.png",
  English: "https://flagcdn.com/w40/us.png",
};

const Navber = () => {
  const { language, changeLanguage, isBangla } = useLanguage();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const texts = {
    login: isBangla ? "প্রবেশ করুন" : "Login",
    register: isBangla ? "নিবন্ধন করুন" : "Register",
    selectLanguage: isBangla ? "ভাষা নির্বাচন করুন" : "Select Language",
  };

  const languages = [
    { key: "Bangla", label: "বাংলা", flag: flagUrl.Bangla },
    { key: "English", label: "English", flag: flagUrl.English },
  ];

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setLangOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-t border-[#0b1f33] bg-[#dff8ff] shadow-sm">
      <nav className="mx-auto flex h-[95px] w-full max-w-[1500px] items-center justify-between px-4 sm:px-8 lg:px-24">
        {/* Logo */}
        <Link to="/" className="flex cursor-pointer items-center">
          <img
            src={LOGO_URL}
            alt="Crickex Partner"
            className="h-[44px] w-auto cursor-pointer object-contain"
          />
        </Link>

        {/* Desktop Right Side */}
        <div className="hidden items-center gap-9 lg:flex">
          {/* Language Dropdown */}
          <div
            className="relative cursor-pointer"
            onMouseEnter={() => setLangOpen(true)}
            onMouseLeave={() => setLangOpen(false)}
          >
            <button
              type="button"
              className="flex cursor-pointer items-center gap-4 px-2 py-4 text-[17px] font-medium text-[#18344d]"
            >
              <img
                src={flagUrl[language]}
                alt={language}
                className="h-8 w-8 rounded-full object-cover"
              />

              <span>{language === "Bangla" ? "বাংলা" : "English"}</span>

              <ChevronDown
                size={18}
                className={`transition ${langOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  className="absolute left-1/2 top-full z-50 w-[190px] -translate-x-1/2 overflow-hidden rounded-xl border border-[#b5dbff] bg-white shadow-xl"
                >
                  {languages.map((item) => {
                    const active = language === item.key;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleLanguageChange(item.key)}
                        className={`flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-[15px] font-medium transition ${
                          active
                            ? "bg-[#e8f6ff] text-[#145ca8]"
                            : "text-[#23384d] hover:bg-[#f2fbff]"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <img
                            src={item.flag}
                            alt={item.label}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          {item.label}
                        </span>

                        {active && <Check size={18} />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/login"
            className="cursor-pointer rounded-[7px] border border-[#0e62b8] bg-[#2069b7] px-5 py-[8px] text-[16px] font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)] transition hover:bg-[#175ba3]"
          >
            {texts.login}
          </Link>

          <Link
            to="/register"
            className="cursor-pointer rounded-[7px] bg-[#48b948] px-5 py-[9px] text-[16px] font-semibold text-white shadow-sm transition hover:bg-[#37a937]"
          >
            {texts.register}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#2b77c8] bg-white text-[#1d5f9e] lg:hidden"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-[#bfe8f5] bg-[#dff8ff] lg:hidden"
          >
            <div className="mx-auto flex w-full max-w-[480px] flex-col gap-3 px-4 py-5">
              <div className="rounded-xl border border-[#b5dbff] bg-white p-2">
                <p className="mb-2 px-2 text-sm font-semibold text-[#18344d]">
                  {texts.selectLanguage}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {languages.map((item) => {
                    const active = language === item.key;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleLanguageChange(item.key)}
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                          active
                            ? "border-[#2b77c8] bg-[#e8f6ff] text-[#145ca8]"
                            : "border-[#e1eef8] bg-white text-[#23384d]"
                        }`}
                      >
                        <img
                          src={item.flag}
                          alt={item.label}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        {item.label}
                        {active && <Check size={16} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="cursor-pointer rounded-lg border border-[#0e62b8] bg-[#2069b7] px-4 py-3 text-center text-[15px] font-semibold text-white"
                >
                  {texts.login}
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="cursor-pointer rounded-lg bg-[#48b948] px-4 py-3 text-center text-[15px] font-semibold text-white"
                >
                  {texts.register}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navber;
