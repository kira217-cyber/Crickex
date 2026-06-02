import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import { useLanguage } from "../../Context/LanguageProvider";

import "swiper/css";
import "swiper/css/free-mode";

import fav1 from "../../assets/favourites/1.jpg";
import fav2 from "../../assets/favourites/2.jpg";
import fav3 from "../../assets/favourites/3.jpg";
import fav4 from "../../assets/favourites/4.jpg";
import fav5 from "../../assets/favourites/5.jpg";
import fav6 from "../../assets/favourites/6.jpg";

const favouriteImages = [fav1, fav2, fav3, fav4, fav5, fav6];

const Favourites = () => {
  const { isBangla } = useLanguage();

  return (
    <section className="w-full pb-2 px-2 md:px-0 mt-6">
      <div className="mx-auto w-full max-w-[480px] md:max-w-[1130px]">
        <div className="flex h-[30px] items-center px-0">
          <span className="mr-2 h-[15px] w-[4px] rounded-full bg-[#0b66a8]" />
          <h2 className="text-[14px] font-semibold text-[#111]">
            {isBangla ? "ফেভারিটস" : "Favourites"}
          </h2>
        </div>

        <Swiper
          modules={[Autoplay, FreeMode]}
          loop={true}
          freeMode={true}
          speed={3500}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          slidesPerView={1.55}
          spaceBetween={8}
          breakpoints={{
            0: {
              slidesPerView: 1.55,
              spaceBetween: 8,
            },
            768: {
              slidesPerView: 3.6,
              spaceBetween: 12,
            },
          }}
          className="px-[8px]"
        >
          {favouriteImages.map((image, index) => (
            <SwiperSlide key={index}>
              <button className="block h-[120px] w-full overflow-hidden rounded-[3px] bg-white md:h-[172px]">
                <img
                  src={image}
                  alt={`favourite-${index + 1}`}
                  className="h-full w-full object-cover"
                  draggable="false"
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Favourites;
