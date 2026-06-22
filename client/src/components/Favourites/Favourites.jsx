import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";

import "swiper/css";
import "swiper/css/free-mode";

import {
  selectFavouriteBanners,
  selectGlobalLoading,
  selectGlobalLoaded,
} from "../../features/global/globalSelectors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const makeImageUrl = (path = "") => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}/${path.replace(/^\/+/, "")}`;
};

const Favourites = () => {
  const { isBangla } = useLanguage();

  const favouriteBanners = useSelector(selectFavouriteBanners);
  const loading = useSelector(selectGlobalLoading);
  const loaded = useSelector(selectGlobalLoaded);

  const showSkeleton = loading || !loaded;
  const hasBanners =
    Array.isArray(favouriteBanners) && favouriteBanners.length > 0;

  const handleOpenLink = (link = "") => {
    if (!link) return;
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="w-full pb-2 px-2 md:px-0 mt-6">
      <div className="mx-auto w-full max-w-[480px] md:max-w-[1130px]">
        <div className="flex h-[30px] items-center px-0">
          <span className="mr-2 h-[15px] w-[4px] rounded-full bg-[#0b66a8]" />
          <h2 className="text-[14px] font-semibold text-[#111]">
            {isBangla ? "ফেভারিটস" : "Favourites"}
          </h2>
        </div>

        {showSkeleton ? (
          <div className="flex gap-2 overflow-hidden px-[8px] md:gap-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[120px] min-w-[65%] animate-pulse rounded-[3px] bg-gray-300 md:h-[172px] md:min-w-[27%]"
              />
            ))}
          </div>
        ) : hasBanners ? (
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
            {favouriteBanners.map((item, index) => (
              <SwiperSlide key={item?._id || index}>
                <button
                  type="button"
                  onClick={() => handleOpenLink(item?.link)}
                  className="block h-[120px] w-full cursor-pointer overflow-hidden rounded-[3px] bg-white md:h-[172px]"
                >
                  <img
                    src={makeImageUrl(item?.image)}
                    alt={`favourite-${index + 1}`}
                    className="h-full w-full object-cover"
                    draggable="false"
                  />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : null}
      </div>
    </section>
  );
};

export default Favourites;
