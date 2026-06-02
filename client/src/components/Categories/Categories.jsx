import React, { useState } from "react";
import { useLanguage } from "../../Context/LanguageProvider";
import HotsGame from "../HotsGame/HotsGame";
import Sports from "../Sports/Sports";
import Providers from "../Providers/Providers";

const categories = [
  {
    key: "hot",
    name: { bn: "হট গেম", en: "Hot Game" },
    icon: "https://img.c88rx.com/cx/h5/assets/images/icon-set/theme-icon/nav/icon-hotgame.png?v=1779771685731",
  },
  {
    key: "sports",
    name: { bn: "স্পোর্ট", en: "Sports" },
    icon: "https://img.c88rx.com/cx/h5/assets/images/icon-set/theme-icon/nav/icon-sport.png?v=1779771685731",
  },
  {
    key: "casino",
    name: { bn: "ক্যাসিনো", en: "Casino" },
    icon: "https://img.c88rx.com/cx/h5/assets/images/icon-set/theme-icon/nav/icon-casino.png?v=1779771685731",
  },
  {
    key: "slot",
    name: { bn: "স্লট", en: "Slot" },
    icon: "https://img.c88rx.com/cx/h5/assets/images/icon-set/theme-icon/nav/icon-slot.png?v=1779771685731",
  },
  {
    key: "crash",
    name: { bn: "ক্র্যাশ", en: "Crash" },
    icon: "https://img.c88rx.com/cx/h5/assets/images/icon-set/theme-icon/nav/icon-crash.png?v=1779771685731",
  },
  {
    key: "table",
    name: { bn: "টেবিল", en: "Table" },
    icon: "https://img.c88rx.com/cx/h5/assets/images/icon-set/theme-icon/nav/icon-table.png?v=1779771685731",
  },
  {
    key: "fishing",
    name: { bn: "ফিশিং", en: "Fishing" },
    icon: "https://img.c88rx.com/cx/h5/assets/images/icon-set/theme-icon/nav/icon-fish.png?v=1779771685731",
  },
  {
    key: "arcade",
    name: { bn: "আর্কেড", en: "Arcade" },
    icon: "https://img.c88rx.com/cx/h5/assets/images/icon-set/theme-icon/nav/icon-arcade.png?v=1779771685731",
  },
  {
    key: "lottery",
    name: { bn: "লটারি", en: "Lottery" },
    icon: "https://img.c88rx.com/cx/h5/assets/images/icon-set/theme-icon/nav/icon-lottery.png?v=1779771685731",
  },
];

const Categories = () => {
  const [activeKey, setActiveKey] = useState("hot");
  const { isBangla } = useLanguage();

  return (
    <>
      <section className="w-full bg-[#0b66a8] md:bg-transparent">
        <div className="mx-auto w-full max-w-[480px] md:max-w-[1125px]">
          <div className="no-scrollbar flex overflow-x-auto bg-[#074b7f] md:rounded-sm">
            {categories.map((item) => {
              const isActive = activeKey === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => setActiveKey(item.key)}
                  className={`relative flex h-[88px] min-w-[72px] cursor-pointer flex-col items-center justify-center gap-[8px] transition-all duration-200 md:min-w-[100px] ${
                    isActive ? "bg-[#0b66a8]" : "bg-[#074b7f]"
                  }`}
                >
                  <img
                    src={item.icon}
                    alt={isBangla ? item.name.bn : item.name.en}
                    className="h-[36px] w-[36px] object-contain"
                    draggable="false"
                  />

                  <span className="text-[14px] font-bold leading-none text-white drop-shadow-sm">
                    {isBangla ? item.name.bn : item.name.en}
                  </span>

                  {isActive && (
                    <span className="absolute bottom-0 left-0 h-[3px] w-full bg-[#1fa7ff]" />
                  )}
                </button>
              );
            })}
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
      {activeKey !== "hot" && activeKey !== "sports" && (
        <Providers
          title={
            isBangla
              ? categories.find((c) => c.key === activeKey)?.name.bn
              : categories.find((c) => c.key === activeKey)?.name.en
          }
        />
      )}
    </>
  );
};

export default Categories;
