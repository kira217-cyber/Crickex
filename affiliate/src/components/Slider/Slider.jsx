import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const BG_URL =
  "https://crickexpartner.com/wp-content/uploads/2024/03/banner-bg.jpeg";

const slides = [
  "https://crickexpartner.com/wp-content/uploads/2026/04/2_BAN.png",
  "https://crickexpartner.com/wp-content/uploads/2026/04/1_BAN.png",
];

const Slider = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat py-4 md:py-10"
      style={{ backgroundImage: `url(${BG_URL})` }}
    >
      <div className="mx-auto w-full max-w-[1500px] px-2 lg:px-8">
        <div className="relative mx-auto aspect-[5/2] w-full max-w-[1415px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={active}
              src={slides[active]}
              alt={`Banner ${active + 1}`}
              className="absolute inset-0 h-full w-full object-contain"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              draggable={false}
            />
          </AnimatePresence>
        </div>

        <div className="mt-[-1px] flex items-center justify-center gap-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActive(index)}
              className={`h-[10px] w-[10px] cursor-pointer rounded-full transition-all duration-300 ${
                active === index
                  ? "scale-110 bg-[#087cff]"
                  : "bg-[#151515] hover:bg-[#087cff]"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Slider;
