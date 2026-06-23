import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { fetchGlobalGameData } from "../../features/globalGame/globalGameSlice";
import {
  selectGlobalGames,
  selectProvidersByCategory,
  selectGameCategories,
  selectGlobalGameLoading,
  selectGlobalGameLoaded,
} from "../../features/globalGame/globalGameSelectors";

const PER_PAGE = 24;

const Games = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isBangla } = useLanguage();

  const categoryId = searchParams.get("categoryId") || "";
  const providerDbId = searchParams.get("providerDbId") || "all";

  const games = useSelector(selectGlobalGames);
  const categories = useSelector(selectGameCategories);
  const providersByCategory = useSelector(selectProvidersByCategory);
  const loading = useSelector(selectGlobalGameLoading);
  const loaded = useSelector(selectGlobalGameLoaded);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchGlobalGameData());
    }
  }, [dispatch, loaded]);

  const providers = useMemo(() => {
    const list = providersByCategory?.[categoryId];
    return Array.isArray(list) ? list : [];
  }, [providersByCategory, categoryId]);

  const category = useMemo(() => {
    return categories.find((item) => String(item._id) === String(categoryId));
  }, [categories, categoryId]);

  const title = isBangla
    ? category?.categoryName?.bn || category?.categoryTitle?.bn || "গেমস"
    : category?.categoryName?.en || category?.categoryTitle?.en || "Games";

  const filteredGames = useMemo(() => {
    let list = Array.isArray(games) ? games : [];

    if (categoryId) {
      list = list.filter(
        (game) => String(game.categoryId) === String(categoryId),
      );
    }

    if (providerDbId && providerDbId !== "all") {
      list = list.filter(
        (game) => String(game.providerDbId) === String(providerDbId),
      );
    }

    if (filter) {
      list = list.filter((game) => Boolean(game?.[filter]));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();

      list = list.filter((game) => {
        const name = String(
          game?.oracleGame?.name ||
            game?.name ||
            game?.gameName ||
            game?.gameUId ||
            "",
        ).toLowerCase();

        const uid = String(game?.gameUId || "").toLowerCase();
        const provider = String(
          game?.provider?.providerName || game?.provider?.providerCode || "",
        ).toLowerCase();

        return name.includes(q) || uid.includes(q) || provider.includes(q);
      });
    }

    return list;
  }, [games, categoryId, providerDbId, filter, search]);

  const totalPages = Math.ceil(filteredGames.length / PER_PAGE) || 1;

  const paginatedGames = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredGames.slice(start, start + PER_PAGE);
  }, [filteredGames, page]);

  useEffect(() => {
    setPage(1);
  }, [categoryId, providerDbId, filter, search]);

  const handleProviderChange = (providerId) => {
    setSearchParams({
      categoryId,
      providerDbId: providerId,
    });
  };

  const handleGameClick = (game) => {
    if (!game?.gameId) return;
    navigate(`/play-game/${game.gameId}?uid=${game.gameUId || ""}`);
  };

  const showSkeleton = loading || !loaded;

  return (
    <section className="w-full bg-[#f1f1f1] pb-6 pt-3">
      <div className="mx-auto w-full max-w-[480px] px-2 md:max-w-[1200px] md:px-0">
        <div className="mb-4 flex items-center gap-2">
          <div className="no-scrollbar flex flex-1 gap-[10px] overflow-x-auto">
            <button
              type="button"
              onClick={() => handleProviderChange("all")}
              className={`h-[30px] min-w-[94px] cursor-pointer rounded-[3px] text-[13px] font-medium ${
                providerDbId === "all"
                  ? "bg-[#005eb8] text-white"
                  : "bg-white text-[#333]"
              }`}
            >
              ALL
            </button>

            {showSkeleton
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[30px] min-w-[94px] animate-pulse rounded-[3px] bg-white"
                  />
                ))
              : providers.map((provider) => {
                  const id = provider?._id || provider?.id;
                  const active = String(providerDbId) === String(id);

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleProviderChange(id)}
                      className={`h-[30px] min-w-[94px] cursor-pointer truncate rounded-[3px] px-2 text-[13px] font-medium ${
                        active
                          ? "bg-[#005eb8] text-white"
                          : "bg-white text-[#333]"
                      }`}
                    >
                      {provider?.providerName || provider?.providerCode}
                    </button>
                  );
                })}
          </div>

          <button
            type="button"
            className="flex h-[40px] w-[48px] shrink-0 cursor-pointer items-center justify-center rounded-[3px] bg-[#005eb8] text-white"
          >
            <Search size={20} />
          </button>
        </div>

        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex h-[30px] items-center">
            <span className="mr-1 h-[15px] w-[4px] rounded-full bg-[#0b66a8]" />
            <h2 className="text-[14px] font-semibold text-[#111]">{title}</h2>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-[28px] w-[120px] rounded-[3px] bg-white px-2 text-[12px] text-[#333] outline-none"
          >
            <option value="">Filter</option>
            <option value="isHot">Hot</option>
            <option value="isFavorites">Favorites</option>
            <option value="isLatest">Latest</option>
            <option value="isAZ">A-Z</option>
          </select>
        </div>

        <div className="mb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isBangla ? "গেম সার্চ করুন..." : "Search game..."}
            className="h-[34px] w-full rounded-[3px] bg-white px-3 text-[13px] text-[#333] outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-[8px] md:grid-cols-6 md:gap-[16px]">
          {showSkeleton
            ? Array.from({ length: 24 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[3px] bg-white"
                >
                  <div className="h-[100px] animate-pulse bg-gray-300 md:h-[120px]" />
                  <div className="h-[34px] px-2 py-[7px]">
                    <div className="h-[13px] w-[80%] animate-pulse rounded bg-gray-300" />
                  </div>
                </div>
              ))
            : paginatedGames.map((game) => {
                const gameName =
                  game?.oracleGame?.name ||
                  game?.name ||
                  game?.gameName ||
                  game?.gameUId ||
                  "Game";

                return (
                  <button
                    key={game?.gameId || game?._id}
                    type="button"
                    onClick={() => handleGameClick(game)}
                    className="block cursor-pointer overflow-hidden rounded-[3px] bg-white text-left transition hover:shadow-sm"
                  >
                    <div className="h-[100px] w-full overflow-hidden bg-[#0b4f83] md:h-[120px]">
                      {game?.imageUrl ? (
                        <img
                          src={game.imageUrl}
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
                );
              })}
        </div>

        {!showSkeleton && paginatedGames.length === 0 && (
          <div className="py-10 text-center text-[14px] text-[#555]">
            {isBangla ? "কোনো গেম পাওয়া যায়নি" : "No games found"}
          </div>
        )}

        {!showSkeleton && totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="h-[32px] cursor-pointer rounded-[3px] bg-white px-3 text-[13px] text-[#333] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-[13px] text-[#333]">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="h-[32px] cursor-pointer rounded-[3px] bg-white px-3 text-[13px] text-[#333] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default Games;
