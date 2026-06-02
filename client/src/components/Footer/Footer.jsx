import React, { useState } from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const paymentImages = [
  "https://img.c88rx.com/cx/h5/assets/images/footer/color-black/pay33.png?v=1779771685731",
  "https://img.c88rx.com/cx/h5/assets/images/footer/color-black/pay61.png?v=1779771685731",
  "https://img.c88rx.com/cx/h5/assets/images/footer/color-black/pay34.png?v=1779771685731&source=mcdsrc",
  "https://img.c88rx.com/cx/h5/assets/images/footer/color-black/pay22.png?v=1779771685731",
  "https://img.c88rx.com/cx/h5/assets/images/footer/color-black/pay45.png?v=1779771685731&source=mcdsrc",
  "https://img.c88rx.com/cx/h5/assets/images/footer/color-black/tunepay.png?v=1779771685731&source=mcdsrc",
  "https://img.c88rx.com/cx/h5/assets/images/footer/color-black/pay46.png?v=1779771685731&source=mcdsrc",
];

const sponsors = [
  {
    img: "https://img.c88rx.com/cx/h5/assets/images/footer/sponsor1.png?v=1779771685731",
    name: "Chepauk Super Gillies",
    sub: "Principal Sponsor",
    year: "2023",
  },
  {
    img: "https://img.c88rx.com/cx/h5/assets/images/footer/sponsor2.png?v=1779771685731",
    name: "Saint Lucia Kings",
    sub: "Title Sponsor",
    year: "2023 - 2024",
  },
  {
    img: "https://img.c88rx.com/cx/h5/assets/images/footer/sponsor3.png?v=1779771685731",
    name: "Galle Titans",
    sub: "Main Sponsor",
    year: "2023",
  },
  {
    img: "https://img.c88rx.com/cx/h5/assets/images/footer/sponsor4.png?v=1779771685731",
    name: "Morrisville Samp Army",
    sub: "Title Sponsor",
    year: "2023",
  },
  {
    img: "https://img.c88rx.com/cx/h5/assets/images/footer/sponsor5.png?v=1779771685731",
    name: "Los Angeles Knight Riders",
    sub: "Principal Sponsor",
    year: "2024",
  },
];

const ambassadors = [
  {
    img: "https://img.c88rx.com/cx/h5/assets/images/footer/ambassadors1.png?v=1779771685731&source=mcdsrc",
    name: "Robin Uthappa",
    sub: "Indian Cricket Legend",
    year: "2023 - 2024",
  },
  {
    img: "https://img.c88rx.com/cx/h5/assets/images/footer/ambassadors2.png?v=1779771685731&source=mcdsrc",
    name: "Srabanti Chatterjee",
    sub: "Heart of Bengali Cinema",
    year: "2023 - Present",
  },
  {
    img: "https://img.c88rx.com/cx/h5/assets/images/footer/ambassadors3.png?v=1779771685731",
    name: "Pori Moni",
    sub: "Star of Dhallywood",
    year: "2023 - 2025",
  },
  {
    img: "https://img.c88rx.com/cx/h5/assets/images/footer/ambassadors4.png?v=1779771685731",
    name: "Dinesh Karthik",
    sub: "The Indian Finisher",
    year: "2024 - Present",
  },
  {
    img: "https://img.c88rx.com/cx/h5/assets/images/footer/tangia_zaman_methila.png?v=1779771685731",
    name: "Tangia Zaman Methila",
    sub: "Bengali Beauty Queen",
    year: "2025 - Present",
  },
];

const links = [
  { bn: "আমাদের সম্পর্কে", en: "About Us" },
  { bn: "যোগাযোগ", en: "Contact Us" },
  { bn: "শর্তাবলী", en: "Terms & Conditions" },
  { bn: "FAQ", en: "FAQ" },
  { bn: "এফিলিয়েট", en: "Affiliate" },
  { bn: "স্পন্সর", en: "Sponsor" },
  { bn: "Crickex Blog", en: "Crickex Blog" },
];

const socials = ["f", "◎", "♪", "✈", "𝕏", "p", "▶", "☘"];

const Footer = () => {
  const { isBangla } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <footer className="w-full text-[#111] mb-14 md:mb-0">
      <div className="mx-auto w-full max-w-[480px] px-3 py-4 md:max-w-[1140px]">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-[14px] font-medium">
              {isBangla ? "পেমেন্ট মেথডস" : "Payment Methods"}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {paymentImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`payment-${index + 1}`}
                  className="h-[22px] object-contain"
                  draggable="false"
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-[14px] font-medium">
              {isBangla ? "সোশ্যাল নেটওয়ার্কস" : "Social Networks"}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {socials.map((item, index) => (
                <span
                  key={index}
                  className="flex h-[23px] w-[23px] items-center justify-center rounded-full bg-[#0b66a8] text-[13px] font-bold text-white"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-[14px] font-medium">
              {isBangla ? "স্পন্সর" : "Sponsor"}
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {sponsors.map((item, index) => (
                <div key={index} className="min-w-0">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="mb-1 h-[34px] object-contain"
                  />
                  <h4 className="truncate text-[12px] font-bold leading-none">
                    {item.name}
                  </h4>
                  <p className="text-[11px] italic leading-none">{item.sub}</p>
                  <p className="text-[11px] italic leading-none">{item.year}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-[14px] font-medium">
              {isBangla ? "অফিশিয়াল পার্টনার" : "Official Partner"}
            </h3>

            <div className="flex items-center gap-2">
              <img
                src="https://img.c88rx.com/cx/h5/assets/images/footer/color-black/official-partner-heyvip.png?v=1779771685731"
                alt="partner"
                className="h-[40px] object-contain"
              />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="mb-2 text-[14px] font-medium">
            {isBangla ? "ব্র্যান্ড অ্যাম্বাসেডর" : "Brand Ambassador"}
          </h3>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {ambassadors.map((item, index) => (
              <div key={index} className="min-w-0">
                <img
                  src={item.img}
                  alt={item.name}
                  className="mb-1 h-[34px] object-contain"
                />
                <h4 className="truncate text-[12px] font-bold leading-none">
                  {item.name}
                </h4>
                <p className="text-[11px] italic leading-none">{item.sub}</p>
                <p className="text-[11px] italic leading-none">{item.year}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="my-5 h-px w-full bg-[#d6d6d6]" />

        <div className="flex flex-wrap gap-y-2">
          {links.map((item, index) => (
            <button
              key={index}
              className="border-l-2 border-[#0b66a8] px-3 text-[13px] text-[#005daa]"
            >
              {isBangla ? item.bn : item.en}
            </button>
          ))}
        </div>

        <div className="my-5 h-px w-full bg-[#d6d6d6]" />

        <div>
          <h2 className="mb-3 text-[18px] font-bold text-[#444]">
            {isBangla
              ? "Crickex - সবচেয়ে নির্ভরযোগ্য অনলাইন বেটিং সাইট"
              : "Crickex - The Most Reliable Online Betting Site"}
          </h2>

          <p
            className={`text-[14px] leading-[20px] text-[#999] ${
              open ? "" : "line-clamp-2"
            }`}
          >
            {isBangla
              ? "ক্রিকেট, ফুটবল, কাবাডি, বাস্কেটবল, টেনিসসহ অসংখ্য স্পোর্টস বেটিং অপশনের মাধ্যমে Crickex বাংলাদেশে অন্যতম সেরা অনলাইন স্পোর্টস বেটিং সাইট এবং ক্যাসিনো প্ল্যাটফর্ম হিসেবে পরিচিত। লাইভ স্ট্রিমিং, দ্রুত পেমেন্ট এবং আকর্ষণীয় অফারের মাধ্যমে ব্যবহারকারীরা আরও ভালো অভিজ্ঞতা উপভোগ করতে পারেন।"
              : "With numerous sports betting options, including cricket, football, kabaddi, basketball, tennis, and many others, Crickex is at the forefront as one of the best online sports betting sites and casinos in Bangladesh. It is worth noting that Crickex is famous for its live streaming services, where users can watch games while at the same time placing bets. To enrich the betting experience, users are rewarded with numerous offers, including the welcome offer."}
          </p>

          <button
            onClick={() => setOpen(!open)}
            className="mt-5 rounded-[3px] bg-[#006bb6] px-4 py-2 text-[13px] font-medium text-white"
          >
            {open
              ? isBangla
                ? "কম দেখুন"
                : "Show Less"
              : isBangla
                ? "আরও পড়ুন"
                : "Read More"}{" "}
            ⌄
          </button>
        </div>

        <div className="my-5 h-px w-full bg-[#d6d6d6]" />

        <div className="flex items-center gap-4 pb-1">
          <img
            src="https://img.c88rx.com/cx/h5/assets/images/logo-02.png?v=1779771685731"
            alt="logo"
            className="h-[26px] object-contain"
          />
          <div>
            <h4 className="text-[13px] font-bold text-[#005daa]">
              {isBangla ? "সেরা মানের প্ল্যাটফর্ম" : "Best Quality Platform"}
            </h4>
            <p className="text-[12px] text-[#888]">
              © 2026 CRICKEX Copyrights. All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
