import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectPopularGames,
  selectGlobalGameLoading,
  selectGlobalGameLoaded,
} from "../../features/globalGame/globalGameSelectors";

import "swiper/css";
import "swiper/css/free-mode";

const PopularGames = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const popularGames = useSelector(selectPopularGames);
  const loading = useSelector(selectGlobalGameLoading);
  const loaded = useSelector(selectGlobalGameLoaded);

  const showSkeleton = loading || !loaded;

  const getGameId = (item) => {
    return item?.game?.gameId || item?.gameId || item?._id || "";
  };

  const getGameUId = (item) => {
    return item?.game?.gameUId || item?.gameUId || item?.gameId || "";
  };

  const getGameName = (item) => {
    return (
      item?.game?.oracleGame?.name ||
      item?.game?.name ||
      item?.game?.gameName ||
      item?.game?.gameUId ||
      item?.name ||
      item?.gameUId ||
      item?.gameId ||
      "Game"
    );
  };

  const getGameImage = (item) => {
    return (
      item?.imageUrl ||
      item?.game?.imageUrl ||
      item?.game?.customImageUrl ||
      item?.game?.oracleImageUrl ||
      item?.game?.oracleGame?.thumbnail ||
      item?.game?.oracleGame?.original ||
      ""
    );
  };

  const handleGameClick = (item) => {
    const gameId = getGameId(item);
    const gameUId = getGameUId(item);

    if (!gameId) return;

    navigate(`/play-game/${gameId}?uid=${gameUId}`);
  };

  return (
    <section className="w-full pb-2 px-2 md:px-0 mt-6">
      <div className="mx-auto w-full max-w-[480px] md:max-w-[1130px]">
        <div className="flex h-[30px] items-center">
          <span className="mr-2 h-[15px] w-[4px] rounded-full bg-[#0b66a8]" />
          <h2 className="text-[14px] font-semibold text-[#111]">
            {isBangla ? "জনপ্রিয় গেমস" : "Popular Games"}
          </h2>
        </div>

        {showSkeleton ? (
          <div className="grid grid-cols-2 gap-[8px] px-[6px] md:grid-cols-6 md:gap-[12px]">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="block w-full overflow-hidden rounded-[3px] bg-white text-left"
              >
                <div className="h-[100px] w-full animate-pulse bg-gray-200 md:h-[120px]" />
                <div className="h-[34px] px-2 py-[7px]">
                  <div className="h-[13px] w-[80%] animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, FreeMode]}
            loop={popularGames.length > 2}
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
            {popularGames.map((item, index) => {
              const gameName = getGameName(item);
              const image = getGameImage(item);

              return (
                <SwiperSlide
                  key={item?._id || item?.id || item?.gameId || index}
                >
                  <button
                    type="button"
                    onClick={() => handleGameClick(item)}
                    className="block w-full cursor-pointer overflow-hidden rounded-[3px] bg-white text-left"
                  >
                    <div className="h-[100px] w-full overflow-hidden bg-[#0b4f83] md:h-[120px]">
                      {image ? (
                        <img
                          src={image}
                          alt={gameName}
                          className="h-full w-full object-cover"
                          draggable="false"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[12px] text-white">
                          No Image
                        </div>
                      )}
                    </div>

                    <p className="h-[34px] w-full truncate px-2 py-[7px] text-[13px] leading-none text-[#111] md:text-[14px]">
                      {gameName}
                    </p>
                  </button>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>
    </section>
  );
};

export default PopularGames;
