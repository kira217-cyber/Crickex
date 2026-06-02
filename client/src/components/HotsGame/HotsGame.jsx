import React from "react";

import game1 from "../../assets/hotsgame/1.png";
import game2 from "../../assets/hotsgame/2.png";
import game3 from "../../assets/hotsgame/3.png";
import game4 from "../../assets/hotsgame/4.png";
import game5 from "../../assets/hotsgame/5.png";
import game6 from "../../assets/hotsgame/6.png";
import { useLanguage } from "../../Context/LanguageProvider";

const hotGames = [
  { id: 1, name: "HEYVIP Super Ace", image: game1 },
  { id: 2, name: "Fortune Gems Legend", image: game2 },
  { id: 3, name: "Golden Idol", image: game3 },
  { id: 4, name: "Revolver Hare", image: game4 },
  { id: 5, name: "HEYVIP Gates of Sun", image: game5 },
  { id: 6, name: "Fortune Garuda 500", image: game6 },

  { id: 7, name: "Super Ace Deluxe", image: game1 },
  { id: 8, name: "Boxing King", image: game2 },
  { id: 9, name: "Fortune Gems 3", image: game3 },
  { id: 10, name: "Money Coming", image: game4 },
  { id: 11, name: "HEYVIP Super Element", image: game5 },
  { id: 12, name: "HEYVIP Pirate Legend", image: game6 },

  { id: 13, name: "Match Odds", image: game1 },
  { id: 14, name: "Aviator", image: game2 },
  { id: 15, name: "Crazy Time", image: game3 },
  { id: 16, name: "Sexy Baccarat", image: game4 },
  { id: 17, name: "HEYVIP Crash", image: game5 },
  { id: 18, name: "Wild Bounty Showdown", image: game6 },

  { id: 19, name: "Magic Ace Wild Lock", image: game1 },
  { id: 20, name: "Aztec Gems", image: game2 },
  { id: 21, name: "High Flyer", image: game3 },
  { id: 22, name: "Mega Wheel", image: game4 },
  { id: 23, name: "Treasure Island", image: game5 },
  { id: 24, name: "Lucky Dragon", image: game6 },
];

const HotsGame = () => {
    const { isBangla } = useLanguage();
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
          {hotGames.map((game) => (
            <button
              key={game.id}
              className="flex h-[78px] flex-col items-center justify-center overflow-hidden bg-white px-1 transition hover:shadow-sm md:h-[78px]"
            >
              <img
                src={game.image}
                alt={game.name}
                className="mb-[5px] h-[38px] w-[52px] object-contain"
                draggable="false"
              />

              <p className="w-full truncate text-center text-[12px] leading-none text-[#111] md:text-[14px]">
                {game.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotsGame;
