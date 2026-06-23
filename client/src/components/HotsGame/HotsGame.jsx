import React from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectHotGames,
  selectGlobalGameLoading,
  selectGlobalGameLoaded,
} from "../../features/globalGame/globalGameSelectors";

const HotsGame = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const hotGames = useSelector(selectHotGames);
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
    <section className="w-full pb-2">
      <div className="mx-auto w-full max-w-[480px] md:max-w-[1140px]">
        <div className="flex h-[30px] items-center px-2">
          <span className="mr-2 h-[15px] w-[4px] rounded-full bg-[#0b66a8]" />
          <h2 className="text-[14px] font-semibold uppercase text-[#111]">
            {isBangla ? "হট গেমস" : "HOT"}
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-[6px] md:gap-[10px] px-[6px] md:grid-cols-8">
          {showSkeleton
            ? Array.from({ length: 24 }).map((_, index) => (
                <div
                  key={index}
                  className="flex h-[78px] flex-col items-center justify-center overflow-hidden bg-white px-1 md:h-[78px]"
                >
                  <div className="mb-[5px] h-[38px] w-[52px] animate-pulse rounded bg-gray-200" />
                  <div className="h-[12px] w-[70%] animate-pulse rounded bg-gray-200" />
                </div>
              ))
            : Array.isArray(hotGames) && hotGames.length > 0
              ? hotGames.map((item, index) => {
                  const gameName = getGameName(item);
                  const image = getGameImage(item);

                  return (
                    <button
                      key={item?._id || item?.id || item?.gameId || index}
                      type="button"
                      onClick={() => handleGameClick(item)}
                      className="flex h-[78px] cursor-pointer flex-col items-center justify-center overflow-hidden bg-white px-1 transition hover:shadow-sm md:h-[78px]"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={gameName}
                          className="mb-[5px] h-[38px] w-[52px] object-contain"
                          draggable="false"
                        />
                      ) : (
                        <div className="mb-[5px] h-[38px] w-[52px]" />
                      )}

                      <p className="w-full truncate text-center text-[12px] leading-none text-[#111] md:text-[14px]">
                        {gameName}
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

export default HotsGame;
