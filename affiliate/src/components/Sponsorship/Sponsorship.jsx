import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const sponsors = [
  {
    name: "Antigua & Barbuda Falcons",
    image: "https://crickexpartner.com/wp-content/uploads/2025/10/ABF.png",
  },
  {
    name: "Saint Lucia Kings",
    image:
      "https://crickexpartner.com/wp-content/uploads/2025/10/lucia-kings.png",
  },
  {
    name: "Morrisville Samp Army",
    image:
      "https://crickexpartner.com/wp-content/uploads/2025/10/samp-army.png",
  },
  {
    name: "Chepauk Super Gillies",
    image:
      "http://crickexpartner.com/wp-content/uploads/2025/10/super-gillies.png",
  },
  {
    name: "Galle Titans",
    image: "https://crickexpartner.com/wp-content/uploads/2025/10/Titans.png",
  },
  {
    name: "LAKR",
    image: "https://crickexpartner.com/wp-content/uploads/2025/12/LAKR.png",
  },
];

const Sponsorship = () => {
  const { isBangla } = useLanguage();

  return (
    <section className="w-full bg-[#226f2d] py-5">
      <div className="mx-auto flex w-full max-w-[1250px] flex-col items-center justify-center gap-6 px-4 md:flex-row md:gap-10 lg:gap-12">
        {/* Text */}
        <div className="text-center text-white md:min-w-[230px]">
          <h2 className="text-[26px] font-bold uppercase leading-[1.55] tracking-[1px] sm:text-[30px]">
            {isBangla ? (
              <>
                প্রধান
                <br />
                স্পনসরশিপ
              </>
            ) : (
              <>
                PRINCIPAL
                <br />
                SPONSORSHIP
              </>
            )}
          </h2>
        </div>

        {/* Sponsor Images */}
        <div className="flex flex-wrap items-center justify-center gap-7 sm:gap-9 md:flex-nowrap lg:gap-12">
          {sponsors.map((item) => (
            <img
              key={item.name}
              src={item.image}
              alt={item.name}
              className="h-[78px] w-auto object-contain drop-shadow-xl sm:h-[92px] md:h-[105px]"
              draggable={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sponsorship;
