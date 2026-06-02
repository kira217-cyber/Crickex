import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const LOGO_URL =
  "https://crickexpartner.com/wp-content/uploads/2024/03/logo-2.png";

const AboutUs = () => {
  const { isBangla } = useLanguage();

  const text = {
    title: isBangla ? "আমাদের সম্পর্কে" : "ABOUT US",
    desc: isBangla
      ? `Crickex হলো Sports Exchange এবং Sports Betting ওয়েবসাইটের একটি শীর্ষস্থানীয় প্রোভাইডার। এখানে Back & Lay, Fancy এবং Premium Bets সহ Live Match Streaming সুবিধা রয়েছে। Sports Exchange এর পাশাপাশি Crickex Live Casino, Slots এবং Virtual Games-ও প্রদান করে।

Crickex সহজ, দ্রুত এবং ইউজার-ফ্রেন্ডলি অনলাইন স্পোর্টস বেটিং অভিজ্ঞতা নিশ্চিত করে। ডিপোজিট ও উইথড্র করার জন্য একাধিক পদ্ধতি এবং ২৪ ঘণ্টা সাপোর্ট রয়েছে, যাতে আমাদের এজেন্টরা নতুন মেম্বার যুক্ত করে আয় বৃদ্ধি করতে পারে। এখনই Crickex Affiliate-এ যোগ দিন এবং আয় শুরু করুন!`
      : `Crickex is a leading provider in Sports Exchange and Sports Betting websites having Back & Lay, Fancy, and Premium Bets with Live Match Streaming. Along with sports exchange, Crickex also provides a wide variety of live casinos, slots, and virtual games.

Crickex ensures the ultimate online sports betting experience and simple quick user-friendly deposit and withdrawal methods with 24-hour support available for all members to help our agents to boost joining new members to Crickex. Join Crickex Affiliate Now & Begin Earning!`,
  };

  return (
    <section className="w-full px-4 py-4 md:py-10 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1425px] flex-col items-center gap-8 rounded-md bg-[#eef6fb]/95 px-6 py-10 shadow-lg md:flex-row md:px-14 lg:px-16">
        {/* Left Logo */}
        <div className="hidden md:flex w-full items-center justify-center md:w-[32%]">
          <img
            src={LOGO_URL}
            alt="Crickex Affiliates"
            className="w-full max-w-[340px] object-contain"
            draggable={false}
          />
        </div>

        {/* Right Text */}
        <div className="w-full text-[#161f7a] md:w-[68%]">
          <h2 className="mb-5 text-center text-[28px] font-bold uppercase tracking-wide md:text-left md:text-[30px]">
            {text.title}
          </h2>

          <p className="whitespace-pre-line text-[16px] font-semibold leading-[1.5] md:text-[17px] lg:text-[18px]">
            {text.desc}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;