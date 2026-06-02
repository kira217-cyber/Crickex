import React from "react";
import { Volume2 } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const Notice = () => {
  const { isBangla } = useLanguage();

  const noticeText = isBangla
    ? "বাংলাদেশের সবচেয়ে বিশ্বস্ত ক্রিকেট বেটিং ও অনলাইন ক্যাসিনো প্ল্যাটফর্মে আপনাকে স্বাগতম! স্মার্ট ভাবে খেলুন, নিরাপদে খেলুন এবং প্রতিটি রেফারেল থেকে ৩ স্তর পর্যন্ত আনলিমিটেড রিবেট উপভোগ করুন।"
    : "Welcome to Bangladesh's most trusted cricket betting and online casino platform! Play smart, play safe and enjoy unlimited rebate rewards from every referral up to 3 levels.";

  return (
    <section className="w-full bg-[#0B66A8] py-1 md:bg-transparent">
      <div className="mx-auto w-full max-w-[480px] px-1 md:max-w-[1120px] md:px-0">
        <div className="flex h-[22px] items-center overflow-hidden rounded-sm ">
          {/* Speaker */}
          <div className="flex h-full w-9 shrink-0 items-center justify-center ">
            <Volume2 size={20} className="text-white md:text-gray-600" />
          </div>

          {/* Marquee Area */}
          <div className="relative flex-1 overflow-hidden">
            <div className="notice-track">
              <span className="text-[14px] text-white md:text-[16px] font-medium md:text-[#444]">
                {noticeText}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .notice-track {
          display: inline-block;
          white-space: nowrap;
          padding-left: 100%;
          animation: marqueeMove 35s linear infinite;
        }

        @keyframes marqueeMove {
          0% {
            transform: translateX(0%);
          }

          100% {
            transform: translateX(-100%);
          }
        }

        @media (max-width: 768px) {
          .notice-track {
            animation-duration: 25s;
          }
        }
      `}</style>
    </section>
  );
};

export default Notice;
