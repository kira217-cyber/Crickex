import React from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectSports,
  selectGlobalGameLoading,
  selectGlobalGameLoaded,
} from "../../features/globalGame/globalGameSelectors";

const Sports = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const sports = useSelector(selectSports);
  const loading = useSelector(selectGlobalGameLoading);
  const loaded = useSelector(selectGlobalGameLoaded);

  const showSkeleton = loading || !loaded;

  const handleSportClick = (item) => {
    const gameId = item?.gameId || "";
    if (!gameId) return;

    navigate(`/play-game/${gameId}?uid=${gameId}`);
  };

  return (
    <section className="w-full  pb-2">
      <div className="mx-auto w-full max-w-[480px] md:max-w-[1140px]">
        <div className="flex h-[30px] items-center px-2">
          <span className="mr-2 h-[15px] w-[4px] rounded-full bg-[#0b66a8]" />
          <h2 className="text-[14px] font-semibold uppercase text-[#111]">
            {isBangla ? "স্পোর্টস" : "SPORTS"}
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-[6px] md:gap-[10px] px-[6px] md:grid-cols-8">
          {showSkeleton
            ? Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="flex h-[78px] flex-col items-center justify-center overflow-hidden bg-white px-1"
                >
                  <div className="mb-[5px] h-[38px] w-[58px] animate-pulse rounded bg-gray-200" />
                  <div className="h-[12px] w-[70%] animate-pulse rounded bg-gray-200" />
                </div>
              ))
            : Array.isArray(sports) && sports.length > 0
              ? sports.map((item, index) => {
                  const name = isBangla
                    ? item?.name?.bn || item?.name?.en || ""
                    : item?.name?.en || item?.name?.bn || "";

                  const image = item?.iconImageUrl || "";

                  return (
                    <button
                      key={item?._id || item?.id || item?.gameId || index}
                      type="button"
                      onClick={() => handleSportClick(item)}
                      className="flex h-[78px] cursor-pointer flex-col items-center justify-center overflow-hidden bg-white px-1 transition hover:shadow-sm"
                    >
                      {image && (
                        <img
                          src={image}
                          alt={name}
                          className="mb-[5px] h-[38px] w-[58px] object-contain"
                          draggable="false"
                        />
                      )}

                      <p className="w-full truncate text-center text-[12px] leading-none text-[#111] md:text-[14px]">
                        {name}
                      </p>
                    </button>
                  );
                })
              : null}
        </div>
      </div>
    </section>
  );
};

export default Sports;
