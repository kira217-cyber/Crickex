import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const providerItems = [
  {
    id: 1,
    name: "PINNACLE",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_pinnacle.png?v=1779771685731",
  },
  {
    id: 2,
    name: "VIA CASINO",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_viacasino.png?v=1779771685731",
  },
  {
    id: 3,
    name: "EVOLUTION",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_evolution.png?v=1779771685731",
  },
  {
    id: 4,
    name: "DREAM GAMING",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_dreamgaming.png?v=1779771685731",
  },
  {
    id: 5,
    name: "PP",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_pp.png?v=1779771685731",
  },
  {
    id: 6,
    name: "HOTROAD",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_hotroad.png?v=1779771685731",
  },
  {
    id: 7,
    name: "PT",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_pt.png?v=1779771685731",
  },
  {
    id: 8,
    name: "MG",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-mg.png?v=1779771685731",
  },
  {
    id: 9,
    name: "JILI",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_jili.png?v=1779771685731",
  },
  {
    id: 10,
    name: "COMBO",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_combo.png?v=1779771685731",
  },
  {
    id: 11,
    name: "FC",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_fc.png?v=1779771685731",
  },
  {
    id: 12,
    name: "PG",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_pg.png?v=1779771685731",
  },
  {
    id: 13,
    name: "JDB",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_jdb.png?v=1779771685731",
  },
  {
    id: 14,
    name: "NETENT",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_netent.png?v=1779771685731",
  },
  {
    id: 15,
    name: "SPRIBE",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_pinnacle.png?v=1779771685731",
  },
  {
    id: 16,
    name: "SMARTSOFT",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_viacasino.png?v=1779771685731",
  },
  {
    id: 17,
    name: "RICH88",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_evolution.png?v=1779771685731",
  },
  {
    id: 18,
    name: "JOKER",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_dreamgaming.png?v=1779771685731",
  },
  {
    id: 19,
    name: "CQ9",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_pp.png?v=1779771685731",
  },
  {
    id: 20,
    name: "RELAX",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_hotroad.png?v=1779771685731",
  },
  {
    id: 21,
    name: "KA",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_pt.png?v=1779771685731",
  },
  {
    id: 22,
    name: "YL",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-mg.png?v=1779771685731",
  },
  {
    id: 23,
    name: "KM",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_jili.png?v=1779771685731",
  },
  {
    id: 24,
    name: "CRASH88",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_combo.png?v=1779771685731",
  },
  {
    id: 25,
    name: "AVIATOR",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_fc.png?v=1779771685731",
  },
  {
    id: 26,
    name: "PLAYSTAR",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_pg.png?v=1779771685731",
  },
  {
    id: 27,
    name: "BETSOFT",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_jdb.png?v=1779771685731",
  },
  {
    id: 28,
    name: "MICROGAMING",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_netent.png?v=1779771685731",
  },
  {
    id: 29,
    name: "RED TIGER",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_pinnacle.png?v=1779771685731",
  },
  {
    id: 30,
    name: "HABANERO",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_viacasino.png?v=1779771685731",
  },
  {
    id: 31,
    name: "YGGDRASIL",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_evolution.png?v=1779771685731",
  },
  {
    id: 32,
    name: "PLAY'N GO",
    image:
      "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_dreamgaming.png?v=1779771685731",
  },
];

const Providers = ({ title }) => {
  const { isBangla } = useLanguage();

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
          {providerItems.map((item) => (
            <button
              key={item.id}
              className="flex h-[78px] flex-col items-center justify-center overflow-hidden bg-white px-1 transition hover:shadow-sm"
            >
              <img
                src={item.image}
                alt={item.name}
                className="mb-[6px] h-[34px] w-[70px] object-contain"
                draggable="false"
              />

              <p className="w-full truncate text-center text-[12px] leading-none text-[#111] md:text-[14px]">
                {item.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Providers;
