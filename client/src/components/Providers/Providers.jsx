import React, { useMemo } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectProvidersByCategory,
  selectGlobalGameLoading,
  selectGlobalGameLoaded,
} from "../../features/globalGame/globalGameSelectors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const makeImageUrl = (path = "") => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}/${path.replace(/^\/+/, "")}`;
};

const Providers = ({ title, categoryId }) => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const providersByCategory = useSelector(selectProvidersByCategory);
  const loading = useSelector(selectGlobalGameLoading);
  const loaded = useSelector(selectGlobalGameLoaded);

  const showSkeleton = loading || !loaded;

  const providers = useMemo(() => {
    if (!categoryId) return [];

    const list = providersByCategory?.[categoryId];

    return Array.isArray(list) ? list : [];
  }, [providersByCategory, categoryId]);

  const handleProviderClick = (provider) => {
    if (!provider?._id && !provider?.id) return;

    const providerId = provider?._id || provider?.id;

    navigate(`/games?categoryId=${categoryId}&providerDbId=${providerId}`);
  };

  return (
    <section className="w-full  pb-2">
      <div className="mx-auto w-full max-w-[480px] md:max-w-[1140px]">
        <div className="flex h-[30px] items-center px-2">
          <span className="mr-2 h-[15px] w-[4px] rounded-full bg-[#0b66a8]" />
          <h2 className="text-[14px] font-semibold uppercase text-[#111]">
            {title || (isBangla ? "প্রোভাইডার" : "PROVIDERS")}
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-[6px] md:gap-[10px] px-[6px] md:grid-cols-8">
          {showSkeleton ? (
            <>
              {Array.from({ length: 16 }).map((_, index) => (
                <div
                  key={index}
                  className="flex h-[78px] flex-col items-center justify-center overflow-hidden bg-white px-1"
                >
                  <div className="mb-[6px] h-[34px] w-[70px] animate-pulse rounded bg-gray-200" />
                  <div className="h-[12px] w-[55px] animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </>
          ) : providers.length > 0 ? (
            providers.map((item) => {
              const providerId = item?._id || item?.id;
              const image =
                item?.providerIconUrl || makeImageUrl(item?.providerIcon);
              const name = item?.providerName || item?.providerCode || "";

              return (
                <button
                  key={providerId}
                  type="button"
                  onClick={() => handleProviderClick(item)}
                  className="flex h-[78px] cursor-pointer flex-col items-center justify-center overflow-hidden bg-white px-1 transition hover:shadow-sm"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      className="mb-[6px] h-[34px] w-[70px] object-contain"
                      draggable="false"
                    />
                  ) : (
                    <div className="mb-[6px] h-[34px] w-[70px]" />
                  )}

                  <p className="w-full truncate text-center text-[12px] leading-none text-[#111] md:text-[14px]">
                    {name}
                  </p>
                </button>
              );
            })
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default Providers;
