import React from "react";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const BG_URL =
  "https://crickexpartner.com/wp-content/uploads/2025/09/Artboard-1-copy-2.jpg";

const RIGHT_IMAGE_URL =
  "https://crickexpartner.com/wp-content/uploads/2025/09/mob-scr-1.png";

const Agent = () => {
  const { isBangla } = useLanguage();

  const text = {
    top: isBangla ? "ক্রিকেক্স এজেন্ট হতে" : "Become a Crickex Agent",
    title: isBangla ? "আবেদন করুন" : "Apply Now",
    line1: isBangla ? "এখানেই আপনার সাফল্য!" : "Your success starts here!",
    line2: isBangla
      ? "সরাসরি উপার্জন করুন ৫০% কমিশন আজীবন।"
      : "Earn directly with 50% lifetime commission.",
    button: isBangla ? "এখনই যোগদিন" : "Join Now",
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${BG_URL})` }}
    >
      <div className="mx-auto flex min-h-[515px] w-full max-w-[1400px] items-center justify-between px-5 py-10 sm:px-10 lg:px-20">
        {/* Left Text */}
        <div className="relative z-10 w-full max-w-[520px] text-white">
          <div className="mb-4 inline-flex rounded-full bg-white px-8 py-2 text-[24px] font-semibold leading-none text-[#0067bd] shadow-md sm:text-[30px]">
            {text.top}
          </div>

          <h2 className="text-[48px] font-extrabold leading-[1.05] text-[#32e414] drop-shadow-lg sm:text-[64px] lg:text-[76px]">
            {text.title}
          </h2>

          <div className="mt-5 space-y-1 text-[22px] font-semibold leading-[1.35] text-white sm:text-[26px]">
            <p>{text.line1}</p>
            <p>{text.line2}</p>
          </div>

          <button
            type="button"
            className="mt-8 flex cursor-pointer items-center gap-5 rounded-full bg-[#42ea08] py-3 pl-8 pr-2 text-[22px] font-bold text-[#0067bd] shadow-[0_5px_0_rgba(0,0,0,0.22)] transition hover:scale-105 hover:bg-[#34d900] sm:text-[26px]"
          >
            {text.button}
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d2cc27] text-white">
              <ArrowUpRight size={26} />
            </span>
          </button>
        </div>

        {/* Right Image */}
        <div className="relative z-10 hidden flex-1 justify-end lg:flex">
          <img
            src={RIGHT_IMAGE_URL}
            alt="Crickex Agent"
            className="h-auto w-full max-w-[650px] object-contain"
            draggable={false}
          />
        </div>
      </div>

      {/* Mobile Right Image */}
      <div className="relative z-10 -mt-8 flex justify-center px-4 pb-8 lg:hidden">
        <img
          src={RIGHT_IMAGE_URL}
          alt="Crickex Agent"
          className="w-full max-w-[430px] object-contain"
          draggable={false}
        />
      </div>
    </section>
  );
};

export default Agent;
