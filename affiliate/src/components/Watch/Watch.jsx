import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const VIDEO_ID = "EP-NFy9IpK8";

const Watch = () => {
  const { isBangla } = useLanguage();

  return (
    <section className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1425px] rounded-md bg-white px-4 py-10 shadow-lg sm:px-8 md:py-16">
        <h2 className="mb-10 text-center text-[24px] font-extrabold uppercase tracking-wide text-[#17227a] drop-shadow-md sm:text-[32px]">
          {isBangla
            ? "দেখুন ক্রিকেক্স অ্যাফিলিয়েট প্রোগ্রাম কীভাবে কাজ করে"
            : "WATCH HOW CRICKEX AFFILIATE PROGRAM WORKS"}
        </h2>

        <div className="mx-auto w-full max-w-[920px] overflow-hidden rounded-md border border-[#333] bg-black shadow-md">
          <div className="relative aspect-video w-full">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${VIDEO_ID}`}
              title="How Crickex Affiliate Program Works"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Watch;
