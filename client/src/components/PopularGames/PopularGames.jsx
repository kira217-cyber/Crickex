import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import { useLanguage } from "../../Context/LanguageProvider";

import "swiper/css";
import "swiper/css/free-mode";

import game1 from "../../assets/populargames/1.jpg";
import game2 from "../../assets/populargames/2.jpg";
import game3 from "../../assets/populargames/3.jpg";
import game4 from "../../assets/populargames/4.jpg";
import game5 from "../../assets/populargames/5.jpg";
import game6 from "../../assets/populargames/6.jpg";
import game7 from "../../assets/populargames/7.jpg";
import game8 from "../../assets/populargames/8.jpg";
import game9 from "../../assets/populargames/9.jpg";
import game10 from "../../assets/populargames/10.jpg";
import game11 from "../../assets/populargames/11.jpg";
import game12 from "../../assets/populargames/12.jpg";
import game13 from "../../assets/populargames/13.jpg";

const popularGames = [
  { id: 1, name: "HEYVIP Super Ace", image: game1 },
  { id: 2, name: "HEYVIP Gates of Sun", image: game2 },
  { id: 3, name: "Fortune Gems Legend", image: game3 },
  { id: 4, name: "GOLDEN IDOL", image: game4 },
  { id: 5, name: "REVOLVER HARE", image: game5 },
  { id: 6, name: "Super Ace", image: game6 },
  { id: 7, name: "Fortune Gems", image: game7 },
  { id: 8, name: "Boxing King", image: game8 },
  { id: 9, name: "Money Coming", image: game9 },
  { id: 10, name: "Crazy Time", image: game10 },
  { id: 11, name: "Magic Ace", image: game11 },
  { id: 12, name: "Aztec Gems", image: game12 },
  { id: 13, name: "Mega Wheel", image: game13 },
];

const PopularGames = () => {
  const { isBangla } = useLanguage();

  return (
    <section className="w-full pb-2 px-2 md:px-0 mt-6">
      <div className="mx-auto w-full max-w-[480px] md:max-w-[1130px]">
        <div className="flex h-[30px] items-center">
          <span className="mr-2 h-[15px] w-[4px] rounded-full bg-[#0b66a8]" />
          <h2 className="text-[14px] font-semibold text-[#111]">
            {isBangla ? "জনপ্রিয় গেমস" : "Popular Games"}
          </h2>
        </div>

        <Swiper
          modules={[Autoplay, FreeMode]}
          loop={true}
          freeMode={true}
          speed={4000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          slidesPerView={2.15}
          spaceBetween={8}
          breakpoints={{
            0: {
              slidesPerView: 2.15,
              spaceBetween: 8,
            },
            768: {
              slidesPerView: 6,
              spaceBetween: 12,
            },
          }}
          className="px-[6px]"
        >
          {popularGames.map((game) => (
            <SwiperSlide key={game.id}>
              <button className="block w-full overflow-hidden rounded-[3px] bg-white text-left">
                <div className="h-[100px] w-full overflow-hidden bg-[#0b4f83] md:h-[120px]">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="h-full w-full object-cover"
                    draggable="false"
                  />
                </div>

                <p className="h-[34px] w-full truncate px-2 py-[7px] text-[13px] leading-none text-[#111] md:text-[14px]">
                  {game.name}
                </p>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default PopularGames;
