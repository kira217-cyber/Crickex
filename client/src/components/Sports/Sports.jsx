import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const sportsItems = [
  {
    id: 1,
    name: { bn: "ক্রিকেট", en: "CRICKET" },
    image:
      "https://img.c88rx.com/cx/h5/assets/images/icon-set/sports-icon/icon-exchange.png?v=1779771685731",
  },
  {
    id: 2,
    name: { bn: "সাবা", en: "SABA" },
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-saba.png?v=1779771685731",
  },
  {
    id: 3,
    name: { bn: "বিটিআই", en: "BTi" },
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-sbtech.png?v=1779771685731",
  },
  {
    id: 4,
    name: { bn: "এসবিও", en: "SBO" },
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-sbov2.png?v=1779771685731",
  },
  {
    id: 5,
    name: { bn: "হর্স", en: "HORSE" },
    image:
      "https://img.c88rx.com/cx/h5/assets/images/icon-set/sports-icon/icon-horsebook.png?v=1779771685731",
  },
  {
    id: 6,
    name: { bn: "সিএমডি", en: "CMD" },
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-cmd.png?v=1779771685731",
  },
  {
    id: 7,
    name: { bn: "পিনাকল", en: "PINNACLE" },
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_pinnacle.png?v=1779771685731",
  },
  {
    id: 8,
    name: { bn: "", en: "" },
    image: "",
  },
];

const Sports = () => {
  const { isBangla } = useLanguage();

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
          {sportsItems.map((item) => (
            <button
              key={item.id}
              className="flex h-[78px] flex-col items-center justify-center overflow-hidden bg-white px-1 transition hover:shadow-sm"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={isBangla ? item.name.bn : item.name.en}
                  className="mb-[5px] h-[38px] w-[58px] object-contain"
                  draggable="false"
                />
              )}

              <p className="w-full truncate text-center text-[12px] leading-none text-[#111] md:text-[14px]">
                {isBangla ? item.name.bn : item.name.en}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sports;
