import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import img1 from "../../assets/1.jpg";
import img2 from "../../assets/2.jpg";
import img3 from "../../assets/3.jpg";
import img4 from "../../assets/4.jpg";
import img5 from "../../assets/5.jpg";
import img6 from "../../assets/6.jpg";

const sliderImages = [img1, img2, img3, img4, img5, img6];

const Slider = () => {
  return (
    <section className="w-full overflow-hidden bg-[#0B66A8] py-4 md:bg-[#f5f5f5]">
      <div className="relative mx-auto w-full max-w-[480px] overflow-hidden md:max-w-[1200px] md:px-10">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          loop={true}
          speed={900}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            el: ".custom-slider-pagination",
          }}
          navigation={{
            nextEl: ".custom-slider-next",
            prevEl: ".custom-slider-prev",
          }}
          breakpoints={{
            0: {
              slidesPerView: 1.25,
              spaceBetween: 8,
              centeredSlides: true,
            },
            768: {
              slidesPerView: 1,
              spaceBetween: 0,
              centeredSlides: false,
            },
          }}
          className="!overflow-visible md:!overflow-hidden"
        >
          {sliderImages.map((image, index) => (
            <SwiperSlide key={index} className="!h-auto">
              {({ isActive }) => (
                <div
                  className={`relative w-full overflow-hidden bg-[#082056] shadow-md transition-all duration-500
                    h-[130px] rounded-[3px] 
                    md:h-[300px]
                    ${
                      isActive
                        ? "scale-100 opacity-100"
                        : "scale-[0.96] opacity-95 md:scale-100 md:opacity-100"
                    }
                  `}
                >
                  <img
                    src={image}
                    alt={`slider-${index + 1}`}
                    className="h-full w-full object-cover"
                    draggable="false"
                  />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        <button className="custom-slider-prev absolute left-0 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center text-gray-400 transition hover:text-gray-600 md:flex">
          <ChevronLeft size={28} />
        </button>

        <button className="custom-slider-next absolute right-0 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center text-gray-400 transition hover:text-gray-600 md:flex">
          <ChevronRight size={28} />
        </button>

        <div className="custom-slider-pagination mt-3 flex justify-center gap-[6px]" />
      </div>

      <style>{`
        .custom-slider-pagination .swiper-pagination-bullet {
          width: 20px;
          height: 2px;
          border-radius: 999px;
          background: #7aa7d9;
          opacity: 1;
          margin: 0 !important;
        }

        .custom-slider-pagination .swiper-pagination-bullet-active {
          background: #2f79c9;
          width: 28px;
        }

        .swiper-button-disabled {
          opacity: 0.35;
        }
      `}</style>
    </section>
  );
};

export default Slider;
