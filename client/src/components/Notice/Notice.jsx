import React from "react";
import { Volume2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectNotice,
  selectGlobalLoading,
  selectGlobalLoaded,
} from "../../features/global/globalSelectors";

const Notice = () => {
  const { isBangla } = useLanguage();

  const notice = useSelector(selectNotice);
  const loading = useSelector(selectGlobalLoading);
  const loaded = useSelector(selectGlobalLoaded);

  const noticeText = isBangla ? notice?.text?.bn : notice?.text?.en;

  const showSkeleton = loading || !loaded;

  return (
    <section className="w-full bg-[#0B66A8] py-1 md:bg-transparent">
      <div className="mx-auto w-full max-w-[480px] px-1 md:max-w-[1120px] md:px-0">
        <div className="flex h-[22px] items-center overflow-hidden rounded-sm ">
          {/* Speaker */}
          <div className="flex h-full w-9 shrink-0 items-center justify-center ">
            <Volume2 size={20} className="text-white md:text-gray-600" />
          </div>

          {/* Marquee Area */}
          <div className="relative flex-1 overflow-hidden">
            {showSkeleton ? (
              <div className="h-[14px] w-full animate-pulse rounded bg-white/40 md:bg-gray-300" />
            ) : (
              <div className="notice-track">
                <span className="text-[14px] text-white md:text-[16px] font-medium md:text-[#444]">
                  {noticeText || ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .notice-track {
          display: inline-block;
          white-space: nowrap;
          padding-left: 100%;
          animation: marqueeMove 35s linear infinite;
        }

        @keyframes marqueeMove {
          0% {
            transform: translateX(0%);
          }

          100% {
            transform: translateX(-100%);
          }
        }

        @media (max-width: 768px) {
          .notice-track {
            animation-duration: 25s;
          }
        }
      `}</style>
    </section>
  );
};

export default Notice;
