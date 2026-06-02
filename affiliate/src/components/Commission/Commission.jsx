import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const flowImages = [
  "https://crickexpartner.com/wp-content/uploads/2025/10/1.-win-or-loss.png",
  "https://crickexpartner.com/wp-content/uploads/2025/10/2.-cost.png",
  "https://crickexpartner.com/wp-content/uploads/2025/10/3.-bonus.png",
  "https://crickexpartner.com/wp-content/uploads/2025/10/4.-payment-fee.png",
  "https://crickexpartner.com/wp-content/uploads/2025/10/5.-net-profit.png",
  "https://crickexpartner.com/wp-content/uploads/2025/10/6.-50-profit_.png",
];

const Commission = () => {
  const { isBangla } = useLanguage();

  const flowText = [
    isBangla ? "কাস্টমার\nজয়/হার" : "CUSTOMER\nWIN/LOSS",
    isBangla ? "২০%\nঅপারেটিং\nকস্ট" : "20%\nOPERATING\nCOST",
    isBangla ? "বোনাস" : "BONUS",
    isBangla ? "পেমেন্ট ফি" : "PAYMENT FEE",
    isBangla ? "নেট প্রফিট" : "NET PROFIT",
    isBangla
      ? "অ্যাফিলিয়েট\nমোট নেট প্রফিটের\n৫০% আয় করে"
      : "AFFILIATE\nEARNS 50%\nOF TOTAL NET\nPROFIT",
  ];

  const table = {
    activePlayers: isBangla ? "অ্যাকটিভ প্লেয়ার" : "ACTIVE PLAYERS",
    playerLoss: isBangla ? "প্লেয়ার লস" : "PLAYER LOSS",
    commission: isBangla ? "কমিশন ৫০%" : "COMMISSION 50%",
    row1Player: isBangla ? "৫ থেকে ২০" : "5 to 20",
    row2Player: isBangla ? "২১ এবং তার বেশি" : "21 and Above",
  };

  return (
    <section className="w-full px-4 py-8 sm:px-6 lg:px-12">
      {/* Commission Flow */}
      <div className="mx-auto w-full max-w-[1425px] rounded-md bg-[#edf5fa]/95 px-5 py-10 shadow-lg sm:px-8 lg:px-12">
        <h2 className="mb-8 text-center text-[28px] font-extrabold uppercase tracking-wide text-[#192075] drop-shadow-md sm:text-[32px]">
          {isBangla ? "কমিশন ফ্লো" : "COMMISSION FLOW"}
        </h2>

        <div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:gap-5 xl:gap-8">
          {flowImages.map((img, index) => (
            <React.Fragment key={img}>
              <div className="flex min-w-[140px] flex-col items-center text-center">
                <img
                  src={img}
                  alt={`Commission Flow ${index + 1}`}
                  className="mb-4 h-[76px] w-[76px] rounded-lg object-contain shadow-[0_3px_14px_rgba(0,0,0,0.22)]"
                  draggable={false}
                />

                <p className="whitespace-pre-line text-[18px] font-extrabold uppercase leading-[1.45] text-[#303030] sm:text-[20px]">
                  {flowText[index]}
                </p>
              </div>

              {index < flowImages.length - 2 && (
                <span className="hidden text-[32px] font-extrabold text-[#3a3a3a] lg:block">
                  -
                </span>
              )}

              {index === flowImages.length - 2 && (
                <span className="hidden text-[34px] font-extrabold text-[#3a3a3a] lg:block">
                  =
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Commission Table */}
      <div className="mx-auto mt-16 w-full max-w-[1425px] rounded-md bg-[#edf5fa]/95 px-5 py-10 shadow-lg sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-full bg-gradient-to-r from-[#1c5d9e] to-[#4add13] px-6 py-3 text-center text-[17px] font-extrabold uppercase text-white md:text-left">
            {table.activePlayers}
          </div>
          <div className="rounded-full bg-gradient-to-r from-[#1c5d9e] to-[#4add13] px-6 py-3 text-center text-[17px] font-extrabold uppercase text-white md:text-left">
            {table.playerLoss}
          </div>
          <div className="rounded-full bg-gradient-to-r from-[#1c5d9e] to-[#4add13] px-6 py-3 text-center text-[17px] font-extrabold uppercase text-white md:text-left">
            {table.commission}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 overflow-hidden rounded-full bg-[#b9efff] px-6 py-3 text-center text-[16px] font-bold text-[#333] md:grid-cols-3 md:text-left">
            <span>{table.row1Player}</span>
            <span>1,000</span>
            <span>35%</span>
          </div>

          <div className="grid grid-cols-1 overflow-hidden rounded-full bg-[#d8f8ff] px-6 py-3 text-center text-[16px] font-bold text-[#333] md:grid-cols-3 md:text-left">
            <span>{table.row2Player}</span>
            <span>1,000</span>
            <span>50%</span>
          </div>
        </div>

        <div className="mt-4 h-4 w-full rounded-full bg-[#4ad022]" />
      </div>
    </section>
  );
};

export default Commission;
