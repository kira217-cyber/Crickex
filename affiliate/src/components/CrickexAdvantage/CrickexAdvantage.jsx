import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const cards = [
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/account.png",
    enTitle: "FREE ACCOUNT",
    bnTitle: "ফ্রি অ্যাকাউন্ট",
    enDesc: "Free Agent Account Self Account Creation",
    bnDesc: "ফ্রি এজেন্ট অ্যাকাউন্ট নিজেই তৈরি করুন",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/investment.png",
    enTitle: "ZERO INVESTMENT",
    bnTitle: "জিরো ইনভেস্টমেন্ট",
    enDesc: "Start Your Agent Account Without Any Investment",
    bnDesc: "কোনো ইনভেস্টমেন্ট ছাড়াই এজেন্ট অ্যাকাউন্ট শুরু করুন",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/global-brand.png",
    enTitle: "INTERNATIONAL BRAND",
    bnTitle: "আন্তর্জাতিক ব্র্যান্ড",
    enDesc: "Focused on Expanding & Accepting Agents Worldwide",
    bnDesc: "বিশ্বব্যাপী এজেন্ট গ্রহণ ও সম্প্রসারণে ফোকাসড",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/commision.png",
    enTitle: "PROFITABLE COMMISSION",
    bnTitle: "লাভজনক কমিশন",
    enDesc: "Life Commission of Flat 50% For Per Active Player",
    bnDesc: "প্রতি অ্যাকটিভ প্লেয়ারের জন্য ৫০% লাইফ কমিশন",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/auto-pay-1.png",
    enTitle: "AUTO PAYMENTS",
    bnTitle: "অটো পেমেন্ট",
    enDesc: "Automatic Commission Payments",
    bnDesc: "স্বয়ংক্রিয় কমিশন পেমেন্ট",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/promo.png",
    enTitle: "PROMO MATERIALS",
    bnTitle: "প্রোমো ম্যাটেরিয়াল",
    enDesc: "Providing Advertising Materials For Agents To Promote",
    bnDesc: "প্রোমোশনের জন্য এজেন্টদের বিজ্ঞাপন সামগ্রী প্রদান",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/support.png",
    enTitle: "SUPPORT MANAGER",
    bnTitle: "সাপোর্ট ম্যানেজার",
    enDesc: "Dedicated Agent Manager For Any Type of Support",
    bnDesc: "যেকোনো সাপোর্টের জন্য ডেডিকেটেড এজেন্ট ম্যানেজার",
  },
  {
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/Equal.png",
    enTitle: "FAIR & TRANSPARENT",
    bnTitle: "ন্যায্য ও স্বচ্ছ",
    enDesc: "Easy Software & Transparent To Track the Daily Date of Downtime",
    bnDesc: "সহজ সফটওয়্যার ও দৈনিক তথ্য ট্র্যাক করার স্বচ্ছ সিস্টেম",
  },
];

const CrickexAdvantage = () => {
  const { isBangla } = useLanguage();

  return (
    <section className="w-full px-4 py-6 sm:px-6 lg:px-9">
      <div className="mx-auto w-full max-w-[1425px]">
        <div className="mb-12 rounded-md bg-[#e8f8ff]/95 px-4 py-5 text-center shadow-lg">
          <h2 className="text-[28px] font-extrabold uppercase tracking-wide text-[#17227a] drop-shadow-md sm:text-[32px]">
            {isBangla ? "ক্রিকেক্স সুবিধাসমূহ" : "CRICKEX ADVANTAGE"}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.enTitle}
              className="flex min-h-[175px] flex-col items-center justify-center rounded-md bg-[#e8f8ff]/95 px-3 py-7 text-center shadow-lg sm:min-h-[208px] sm:px-6"
            >
              <img
                src={card.icon}
                alt={isBangla ? card.bnTitle : card.enTitle}
                className="mb-6 h-[48px] w-[48px] object-contain sm:h-[52px] sm:w-[52px]"
                draggable={false}
              />

              <h3 className="mb-2 text-[14px] font-extrabold uppercase leading-tight text-[#002d68] sm:text-[20px]">
                {isBangla ? card.bnTitle : card.enTitle}
              </h3>

              <p className="max-w-[230px] text-[12px] font-medium leading-[1.35] text-[#001d55] sm:text-[15px]">
                {isBangla ? card.bnDesc : card.enDesc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CrickexAdvantage;
