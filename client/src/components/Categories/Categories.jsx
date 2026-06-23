import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import HotsGame from "../HotsGame/HotsGame";
import Sports from "../Sports/Sports";
import Providers from "../Providers/Providers";
import {
  selectGameCategories,
  selectGlobalGameLoading,
  selectGlobalGameLoaded,
} from "../../features/globalGame/globalGameSelectors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const makeImageUrl = (path = "") => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}/${path.replace(/^\/+/, "")}`;
};

const staticCategories = [
  {
    key: "hot",
    name: { bn: "হট গেম", en: "Hot Game" },
    icon: "https://img.c88rx.com/cx/h5/assets/images/icon-set/theme-icon/nav/icon-hotgame.png?v=1779771685731",
    type: "hot",
  },
  {
    key: "sports",
    name: { bn: "স্পোর্ট", en: "Sports" },
    icon: "https://img.c88rx.com/cx/h5/assets/images/icon-set/theme-icon/nav/icon-sport.png?v=1779771685731",
    type: "sports",
  },
];

const Categories = () => {
  const [activeKey, setActiveKey] = useState("hot");
  const { isBangla } = useLanguage();

  const dbCategories = useSelector(selectGameCategories);
  const loading = useSelector(selectGlobalGameLoading);
  const loaded = useSelector(selectGlobalGameLoaded);

  const showSkeleton = loading || !loaded;

  const categories = useMemo(() => {
    const dynamicCategories = Array.isArray(dbCategories)
      ? dbCategories.map((item) => ({
          key: item?._id,
          id: item?._id,
          name: {
            bn: item?.categoryName?.bn || item?.categoryTitle?.bn || "",
            en: item?.categoryName?.en || item?.categoryTitle?.en || "",
          },
          icon: item?.iconImageUrl || makeImageUrl(item?.iconImage),
          type: "category",
          raw: item,
        }))
      : [];

    return [...staticCategories, ...dynamicCategories];
  }, [dbCategories]);

  const activeCategory = categories.find((item) => item.key === activeKey);

  return (
    <>
      <section className="w-full bg-[#0b66a8] md:bg-transparent">
        <div className="mx-auto w-full max-w-[480px] md:max-w-[1125px]">
          <div className="no-scrollbar flex overflow-x-auto bg-[#074b7f] md:rounded-sm">
            {showSkeleton ? (
              <>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div
                    key={item}
                    className="relative flex h-[88px] min-w-[72px] flex-col items-center justify-center gap-[8px] bg-[#074b7f] md:min-w-[100px]"
                  >
                    <div className="h-[36px] w-[36px] animate-pulse rounded-full bg-white/25" />
                    <div className="h-[12px] w-[48px] animate-pulse rounded bg-white/25" />
                  </div>
                ))}
              </>
            ) : (
              categories.map((item) => {
                const isActive = activeKey === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveKey(item.key)}
                    className={`relative flex h-[88px] min-w-[72px] cursor-pointer flex-col items-center justify-center gap-[8px] transition-all duration-200 md:min-w-[100px] ${
                      isActive ? "bg-[#0b66a8]" : "bg-[#074b7f]"
                    }`}
                  >
                    {item.icon ? (
                      <img
                        src={item.icon}
                        alt={isBangla ? item.name.bn : item.name.en}
                        className="h-[36px] w-[36px] object-contain"
                        draggable="false"
                      />
                    ) : (
                      <div className="h-[36px] w-[36px]" />
                    )}

                    <span className="text-[14px] font-bold leading-none text-white drop-shadow-sm">
                      {isBangla ? item.name.bn : item.name.en}
                    </span>

                    {isActive && (
                      <span className="absolute bottom-0 left-0 h-[3px] w-full bg-[#1fa7ff]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
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

      {activeKey === "hot" && <HotsGame />}

      {activeKey === "sports" && <Sports />}

      {activeKey !== "hot" && activeKey !== "sports" && activeCategory && (
        <Providers
          title={isBangla ? activeCategory?.name?.bn : activeCategory?.name?.en}
          categoryId={activeCategory?.id}
        />
      )}
    </>
  );
};

export default Categories;
