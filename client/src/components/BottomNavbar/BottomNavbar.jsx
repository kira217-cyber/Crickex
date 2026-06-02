import React, { useState } from "react";
import { Link } from "react-router";
import { Check, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../../Context/LanguageProvider";

const flagUrl = {
  Bangla: "https://flagcdn.com/w40/bd.png",
  English: "https://flagcdn.com/w40/us.png",
};

const BottomNavbar = () => {
  const { language, changeLanguage, isBangla } = useLanguage();
  const [openLangModal, setOpenLangModal] = useState(false);

  const languages = [
    { key: "Bangla", label: "বাংলা", flag: flagUrl.Bangla },
    { key: "English", label: "English", flag: flagUrl.English },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 flex h-[50px] border-t border-[#c9c9c9] bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.12)] md:hidden">
        <button
          onClick={() => setOpenLangModal(true)}
          className="flex w-[100px] items-center justify-center gap-2 bg-[#dce8f2]"
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

        <Link
          to="/register"
          className="flex flex-1 items-center justify-center bg-white text-[15px] font-bold text-[#111]"
        >
          {isBangla ? "সাইন আপ" : "Sign Up"}
        </Link>

        <Link
          to="/login"
          className="flex flex-1 items-center justify-center bg-[#0b66a8] text-[15px] font-bold text-white"
        >
          {isBangla ? "লগইন" : "Login"}
        </Link>
      </div>

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
                    onClick={() => setOpenLangModal(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white"
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
                        key={item.key}
                        onClick={() => {
                          changeLanguage(item.key);
                          setOpenLangModal(false);
                        }}
                        className={`mb-1 flex h-[52px] w-full items-center justify-between rounded-lg px-3 transition last:mb-0 ${
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
      </AnimatePresence>
    </>
  );
};

export default BottomNavbar;
