import React from "react";
import { Link } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const LOGO_URL =
  "https://crickexpartner.com/wp-content/uploads/2024/03/logo-2.png";

const socials = [
  {
    name: "Facebook",
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/facebook.png",
    url: "#",
  },
  {
    name: "Instagram",
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/Instagram.png",
    url: "#",
  },
  {
    name: "Telegram",
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/telegram.png",
    url: "#",
  },
  {
    name: "X",
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/x.png",
    url: "#",
  },
  {
    name: "Pinterest",
    icon: "https://crickexpartner.com/wp-content/uploads/2025/10/pinterest.png",
    url: "#",
  },
];

const Footer = () => {
  const { isBangla } = useLanguage();

  const text = {
    terms: isBangla ? "শর্তাবলী" : "Terms & Condition",
    disconnection: isBangla ? "ডিসকানেকশন পলিসি" : "Disconnection Policy",
    privacy: isBangla ? "প্রাইভেসি পলিসি" : "Privacy Policy",
    contact: isBangla ? "যোগাযোগ করুন" : "Contact Us",
    follow: isBangla ? "ফলো করুন:" : "FOLLOW US:",
    signupText: isBangla
      ? "আজই Crickex Affiliate-এ সাইন আপ করুন!"
      : "Sign up today at Crickex Affiliate!",
    signup: isBangla ? "সাইন আপ" : "SIGN UP",
    copyright: isBangla
      ? "©2026 Crickex. সর্বস্বত্ব সংরক্ষিত।"
      : "©2026 Crickex. All Rights Reserved.",
  };

  return (
    <footer className="w-full bg-[#dff8ff] px-4 py-8 sm:px-8 lg:px-20">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-10 md:grid-cols-3">
        {/* Left Links */}
        <div className="flex flex-col items-center gap-7 text-center md:items-start md:text-left">
          <Link
            to="/terms"
            className="cursor-pointer text-[17px] font-medium text-[#07192c] transition hover:text-[#176bb5]"
          >
            {text.terms}
          </Link>

          <Link
            to="/disconnection-policy"
            className="cursor-pointer text-[17px] font-medium text-[#07192c] transition hover:text-[#176bb5]"
          >
            {text.disconnection}
          </Link>
        </div>

        {/* Middle Links */}
        <div className="flex flex-col items-center gap-7 text-center md:items-start md:text-left">
          <Link
            to="/privacy-policy"
            className="cursor-pointer text-[17px] font-medium text-[#07192c] transition hover:text-[#176bb5]"
          >
            {text.privacy}
          </Link>

          <Link
            to="/contact"
            className="cursor-pointer text-[17px] font-medium text-[#07192c] transition hover:text-[#176bb5]"
          >
            {text.contact}
          </Link>
        </div>

        {/* Right Social */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="mb-5 text-[18px] font-semibold uppercase text-[#07192c]">
            {text.follow}
          </h3>

          <div className="mb-8 flex items-center gap-5">
            {socials.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer transition hover:scale-110"
              >
                <img
                  src={item.icon}
                  alt={item.name}
                  className="h-[45px] w-[45px] object-contain sm:h-[48px] sm:w-[48px]"
                  draggable={false}
                />
              </a>
            ))}
          </div>

          <p className="mb-8 text-center text-[17px] font-medium text-[#07192c] md:text-left">
            {text.signupText}
          </p>

          <Link
            to="/register"
            className="w-[180px] cursor-pointer rounded-md bg-[#4bd914] py-3 text-center text-[16px] font-bold uppercase text-white transition hover:bg-[#3ec40d]"
          >
            {text.signup}
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-12 grid w-full max-w-[1400px] grid-cols-1 items-end gap-5 md:grid-cols-3">
        <div className="flex justify-center md:justify-start">
          <Link to="/" className="cursor-pointer">
            <img
              src={LOGO_URL}
              alt="Crickex Affiliates"
              className="h-auto w-[140px] object-contain"
              draggable={false}
            />
          </Link>
        </div>

        <p className="text-center text-[16px] font-medium text-[#07192c] md:col-span-1">
          {text.copyright}
        </p>

        <div />
      </div>
    </footer>
  );
};

export default Footer;
