import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const reviews = [
  {
    logo: "https://crickexpartner.com/wp-content/uploads/2025/09/HV.png",
    en: "Quite an interesting app Crickex which presents a lot of exciting promotional offers. It has been a reliable platform with smooth gaming options and a user-friendly interface. The variety of cricket markets is impressive, and the odds are always competitive. Also the deposits & withdrawals are quick.",
    bn: "Crickex একটি দারুণ অ্যাপ যেখানে অনেক আকর্ষণীয় প্রোমোশনাল অফার রয়েছে। এটি স্মুথ গেমিং অপশন এবং ইউজার-ফ্রেন্ডলি ইন্টারফেসসহ একটি নির্ভরযোগ্য প্ল্যাটফর্ম। ক্রিকেট মার্কেটের বৈচিত্র্য চমৎকার এবং ডিপোজিট ও উইথড্র দ্রুত।",
  },
  {
    logo: "https://crickexpartner.com/wp-content/uploads/2025/04/casino-guruji.png",
    en: "Crickex has quickly become a favorite among Bangladeshi players, thanks to its support for Bangladeshi Taka, smooth user experience, and wide range of sports betting and live casino games. It’s a reliable all-in-one platform for gaming enthusiasts in Bangladesh.",
    bn: "বাংলাদেশি টাকা সাপোর্ট, স্মুথ ইউজার এক্সপেরিয়েন্স এবং স্পোর্টস বেটিং ও লাইভ ক্যাসিনো গেমের জন্য Crickex দ্রুত বাংলাদেশি প্লেয়ারদের পছন্দের প্ল্যাটফর্ম হয়ে উঠেছে।",
  },
  {
    logo: "https://crickexpartner.com/wp-content/uploads/2024/03/review-3.png",
    en: "The world knows that India loves Cricketex and realization of this fact has led to the birth of Crickex. Crickex is among the top platforms for betting and exchange within this nation.",
    bn: "ভারত ক্রিকেট ভালোবাসে এবং এই বিষয়টি মাথায় রেখে Crickex তৈরি হয়েছে। বেটিং এবং এক্সচেঞ্জের জন্য Crickex অন্যতম জনপ্রিয় প্ল্যাটফর্ম।",
  },
  {
    logo: "https://crickexpartner.com/wp-content/uploads/2025/09/Crictaka.png",
    en: "The Crickex team recognizes the achievements of CasinoRaja.in best online casinos and is ready to join the previously most successful cooperation in the Indian market. Fans of sports betting and gambling can expect better gaming events.",
    bn: "Crickex টিম অনলাইন ক্যাসিনো ও স্পোর্টস বেটিং মার্কেটে শক্ত অবস্থান তৈরি করেছে। প্লেয়াররা আরও উন্নত গেমিং অভিজ্ঞতা ও নতুন ইভেন্ট আশা করতে পারেন।",
  },
  {
    logo: "https://crickexpartner.com/wp-content/uploads/2024/03/Bet-Plus.png",
    en: "Crickex offers a smooth platform with exciting sports markets, casino games, and easy payment options for users.",
    bn: "Crickex স্পোর্টস মার্কেট, ক্যাসিনো গেম এবং সহজ পেমেন্ট সুবিধাসহ একটি স্মুথ প্ল্যাটফর্ম প্রদান করে।",
  },
  {
    logo: "https://crickexpartner.com/wp-content/uploads/2024/03/Bet-India.png",
    en: "A trusted platform for betting lovers with fast service, attractive offers, and user-friendly features.",
    bn: "দ্রুত সার্ভিস, আকর্ষণীয় অফার এবং সহজ ব্যবহারযোগ্য ফিচারসহ বেটিং প্রেমীদের জন্য একটি বিশ্বস্ত প্ল্যাটফর্ম।",
  },
  {
    logo: "https://crickexpartner.com/wp-content/uploads/2025/09/FREETIPS.png",
    en: "Crickex provides a complete entertainment experience with sports betting, live casino, and quick transactions.",
    bn: "Crickex স্পোর্টস বেটিং, লাইভ ক্যাসিনো এবং দ্রুত ট্রানজেকশনসহ সম্পূর্ণ এন্টারটেইনমেন্ট অভিজ্ঞতা দেয়।",
  },
  {
    logo: "https://crickexpartner.com/wp-content/uploads/2024/03/deshibets.png",
    en: "Crickex is popular for its simple interface, fast payments, and wide selection of games for local players.",
    bn: "সহজ ইন্টারফেস, দ্রুত পেমেন্ট এবং লোকাল প্লেয়ারদের জন্য বিভিন্ন গেমের কারণে Crickex জনপ্রিয়।",
  },
  {
    logo: "https://crickexpartner.com/wp-content/uploads/2024/03/cricket-B-india.png",
    en: "A strong choice for cricket fans with competitive odds and smooth betting experience.",
    bn: "ক্রিকেট ফ্যানদের জন্য প্রতিযোগিতামূলক অডস এবং স্মুথ বেটিং অভিজ্ঞতার একটি শক্তিশালী প্ল্যাটফর্ম।",
  },
  {
    logo: "https://crickexpartner.com/wp-content/uploads/2024/03/Apps-betting.png",
    en: "The app experience is smooth, fast, and easy for both beginners and experienced players.",
    bn: "অ্যাপটি নতুন এবং অভিজ্ঞ উভয় প্লেয়ারের জন্য স্মুথ, দ্রুত এবং সহজ।",
  },
  {
    logo: "https://crickexpartner.com/wp-content/uploads/2024/03/review-2.png",
    en: "Crickex keeps improving with better features, reliable support, and exciting offers.",
    bn: "আরও ভালো ফিচার, নির্ভরযোগ্য সাপোর্ট এবং আকর্ষণীয় অফারের মাধ্যমে Crickex উন্নতি করছে।",
  },
  {
    logo: "https://crickexpartner.com/wp-content/uploads/2024/03/review-1.png",
    en: "A reliable gaming and betting platform with strong support and simple account management.",
    bn: "শক্তিশালী সাপোর্ট এবং সহজ অ্যাকাউন্ট ম্যানেজমেন্টসহ একটি নির্ভরযোগ্য গেমিং ও বেটিং প্ল্যাটফর্ম।",
  },
];

const AboutCrickex = () => {
  const { isBangla } = useLanguage();

  return (
    <section className="w-full px-4 py-8 sm:px-6 lg:px-12">
      <div className="mx-auto w-full max-w-[1425px] rounded-md bg-gradient-to-b from-[#3d80c8] via-[#479e95] to-[#50cf31] px-5 py-10 shadow-lg sm:px-10 lg:px-12">
        <h2 className="mb-10 text-center text-[26px] font-extrabold uppercase tracking-wide text-white drop-shadow-md sm:text-left sm:text-[32px]">
          {isBangla
            ? "CRICKEX সম্পর্কে অন্যরা যা বলে"
            : "WHAT OTHERS SAY ABOUT CRICKEX"}
        </h2>

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={26}
          slidesPerView={4}
          slidesPerGroup={1}
          speed={850}
          loop={true}
          grabCursor={true}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          navigation={{
            prevEl: ".about-crickex-prev",
            nextEl: ".about-crickex-next",
          }}
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 18,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 22,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 26,
            },
          }}
          className="!overflow-hidden"
        >
          {reviews.map((item, index) => (
            <SwiperSlide key={`${item.logo}-${index}`} className="!h-auto">
              <div className="relative h-full min-h-[328px] rounded-md bg-white px-8 pb-8 pt-20 shadow-md">
                <div className="absolute left-[-8px] top-[5px] flex h-[56px] w-[250px] items-center rounded-[4px]">
                  <img
                    src={item.logo}
                    alt="Review Brand"
                    className="max-h-[60px] w-auto max-w-[250px] object-contain"
                    draggable={false}
                  />
                </div>

                <p className="text-[15px] font-medium leading-[1.6] text-[#02066e]">
                  {isBangla ? item.bn : item.en}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="mt-5 flex items-center justify-center gap-8">
          <button
            type="button"
            className="about-crickex-prev flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white text-white transition hover:bg-white hover:text-[#236cb5]"
          >
            <ChevronLeft size={30} />
          </button>

          <button
            type="button"
            className="about-crickex-next flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white text-white transition hover:bg-white hover:text-[#236cb5]"
          >
            <ChevronRight size={30} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutCrickex;
