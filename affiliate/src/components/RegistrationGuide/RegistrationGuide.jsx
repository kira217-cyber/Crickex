import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const guideCards = [
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/09/Sign-up.png",
    enTitle: "Sign up Form",
    bnTitle: "সাইন আপ ফর্ম",
    enDesc: "Quick registration process",
    bnDesc: "দ্রুত রেজিস্ট্রেশন প্রক্রিয়া",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/09/Approval.png",
    enTitle: "Approval Period",
    bnTitle: "অনুমোদনের সময়",
    enDesc: "Agent manager will contact you on WhatApp/Telegram & on email",
    bnDesc: "এজেন্ট ম্যানেজার WhatsApp/Telegram এবং ইমেইলে যোগাযোগ করবেন",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/09/Start-Earning.png",
    enTitle: "Start Earning Commission",
    bnTitle: "কমিশন আয় শুরু করুন",
    enDesc: "Monthly commission will be transferred on your bank account",
    bnDesc: "মাসিক কমিশন আপনার ব্যাংক অ্যাকাউন্টে ট্রান্সফার করা হবে",
  },
];

const RegistrationGuide = () => {
  const { isBangla } = useLanguage();

  return (
    <section className="w-full px-4 py-8 sm:px-6 lg:px-9">
      <div className="mx-auto w-full max-w-[1425px]">
        <div className="mb-24 rounded-md bg-[#e8f8ff]/95 px-4 py-5 text-center shadow-lg">
          <h2 className="text-[28px] font-extrabold uppercase tracking-wide text-[#17227a] drop-shadow-md sm:text-[32px]">
            {isBangla ? "রেজিস্ট্রেশন গাইড" : "REGISTRATION GUIDE"}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-24 md:grid-cols-3 md:gap-20">
          {guideCards.map((card) => (
            <div
              key={card.enTitle}
              className="relative flex min-h-[335px] flex-col rounded-md bg-[#dff8ff]/95 px-7 pb-10 pt-24 shadow-lg"
            >
              <div className="absolute left-1/2 top-0 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg">
                <img
                  src={card.icon}
                  alt={isBangla ? card.bnTitle : card.enTitle}
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </div>

              <h3 className="mb-12 text-center text-[26px] font-semibold text-[#002d68]">
                {isBangla ? card.bnTitle : card.enTitle}
              </h3>

              <ul className="mx-auto w-full max-w-[320px] list-disc pl-5">
                <li className="text-[17px] font-semibold leading-[1.45] text-[#5f607e]">
                  {isBangla ? card.bnDesc : card.enDesc}
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RegistrationGuide;
