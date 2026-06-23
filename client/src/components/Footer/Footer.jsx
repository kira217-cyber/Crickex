import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectFooterSetting } from "../../features/global/globalSelectors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const makeImageUrl = (path = "") => {
  if (!path) return "";
  if (
    String(path).startsWith("http://") ||
    String(path).startsWith("https://")
  ) {
    return path;
  }
  return `${API_URL}/${String(path).replace(/^\/+/, "")}`;
};

const getText = (obj, isBangla, fallback = "") => {
  if (!obj) return fallback;
  return isBangla ? obj.bn || obj.en || fallback : obj.en || obj.bn || fallback;
};

const openLink = (link = "") => {
  if (!link) return;

  if (link.startsWith("http://") || link.startsWith("https://")) {
    window.open(link, "_blank", "noopener,noreferrer");
    return;
  }

  window.location.href = link;
};

const Footer = () => {
  const { isBangla } = useLanguage();
  const footerSetting = useSelector(selectFooterSetting);
  const [open, setOpen] = useState(false);

  if (!footerSetting) return null;

  const paymentMethods = Array.isArray(footerSetting.paymentMethods)
    ? footerSetting.paymentMethods
    : [];

  const socials = Array.isArray(footerSetting.socials)
    ? footerSetting.socials
    : [];

  const sponsors = Array.isArray(footerSetting.sponsors)
    ? footerSetting.sponsors
    : [];

  const ambassadors = Array.isArray(footerSetting.ambassadors)
    ? footerSetting.ambassadors
    : [];

  const links = Array.isArray(footerSetting.links) ? footerSetting.links : [];

  return (
    <footer className="mb-14 w-full text-[#111] md:mb-0">
      <div className="mx-auto w-full max-w-[480px] px-3 py-4 md:max-w-[1140px]">
        <div className="grid gap-4 md:grid-cols-2">
          {paymentMethods.length > 0 && (
            <div>
              <h3 className="mb-2 text-[14px] font-medium">
                {getText(
                  footerSetting.paymentTitle,
                  isBangla,
                  isBangla ? "পেমেন্ট মেথডস" : "Payment Methods",
                )}
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                {paymentMethods.map((item, index) => {
                  const img = item.imageUrl || makeImageUrl(item.image);

                  if (!img) return null;

                  return (
                    <img
                      key={item._id || index}
                      src={img}
                      alt={`payment-${index + 1}`}
                      className="h-[22px] object-contain"
                      draggable="false"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {socials.length > 0 && (
            <div>
              <h3 className="mb-2 text-[14px] font-medium">
                {getText(
                  footerSetting.socialTitle,
                  isBangla,
                  isBangla ? "সোশ্যাল নেটওয়ার্কস" : "Social Networks",
                )}
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                {socials.map((item, index) => (
                  <button
                    key={item._id || index}
                    type="button"
                    onClick={() => openLink(item.link)}
                    title={item.label || ""}
                    className="flex h-[23px] w-[23px] cursor-pointer items-center justify-center rounded-full bg-[#0b66a8] text-[13px] font-bold text-white"
                  >
                    {item.iconText || "•"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {sponsors.length > 0 && (
            <div>
              <h3 className="mb-2 text-[14px] font-medium">
                {getText(
                  footerSetting.sponsorTitle,
                  isBangla,
                  isBangla ? "স্পন্সর" : "Sponsor",
                )}
              </h3>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {sponsors.map((item, index) => {
                  const img = item.imageUrl || makeImageUrl(item.image);

                  return (
                    <div key={item._id || index} className="min-w-0">
                      {img && (
                        <img
                          src={img}
                          alt={getText(item.name, isBangla, "sponsor")}
                          className="mb-1 h-[34px] object-contain"
                          draggable="false"
                        />
                      )}

                      <h4 className="truncate text-[12px] font-bold leading-none">
                        {getText(item.name, isBangla)}
                      </h4>

                      <p className="text-[11px] italic leading-none">
                        {getText(item.sub, isBangla)}
                      </p>

                      <p className="text-[11px] italic leading-none">
                        {item.year}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(footerSetting.officialPartnerImage ||
            footerSetting.officialPartnerImageUrl) && (
            <div>
              <h3 className="mb-2 text-[14px] font-medium">
                {getText(
                  footerSetting.officialPartnerTitle,
                  isBangla,
                  isBangla ? "অফিশিয়াল পার্টনার" : "Official Partner",
                )}
              </h3>

              <button
                type="button"
                onClick={() => openLink(footerSetting.officialPartnerLink)}
                className="flex cursor-pointer items-center gap-2"
              >
                <img
                  src={
                    footerSetting.officialPartnerImageUrl ||
                    makeImageUrl(footerSetting.officialPartnerImage)
                  }
                  alt="partner"
                  className="h-[40px] object-contain"
                  draggable="false"
                />
              </button>
            </div>
          )}
        </div>

        {ambassadors.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-2 text-[14px] font-medium">
              {getText(
                footerSetting.ambassadorTitle,
                isBangla,
                isBangla ? "ব্র্যান্ড অ্যাম্বাসেডর" : "Brand Ambassador",
              )}
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {ambassadors.map((item, index) => {
                const img = item.imageUrl || makeImageUrl(item.image);

                return (
                  <div key={item._id || index} className="min-w-0">
                    {img && (
                      <img
                        src={img}
                        alt={getText(item.name, isBangla, "ambassador")}
                        className="mb-1 h-[34px] object-contain"
                        draggable="false"
                      />
                    )}

                    <h4 className="truncate text-[12px] font-bold leading-none">
                      {getText(item.name, isBangla)}
                    </h4>

                    <p className="text-[11px] italic leading-none">
                      {getText(item.sub, isBangla)}
                    </p>

                    <p className="text-[11px] italic leading-none">
                      {item.year}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {links.length > 0 && (
          <>
            <div className="my-5 h-px w-full bg-[#d6d6d6]" />

            <div className="flex flex-wrap gap-y-2">
              {links.map((item, index) => (
                <button
                  key={item._id || index}
                  type="button"
                  onClick={() => openLink(item.link)}
                  className="cursor-pointer border-l-2 border-[#0b66a8] px-3 text-[13px] text-[#005daa]"
                >
                  {getText(item.title, isBangla)}
                </button>
              ))}
            </div>
          </>
        )}

        {(footerSetting.descriptionTitle || footerSetting.description) && (
          <>
            <div className="my-5 h-px w-full bg-[#d6d6d6]" />

            <div>
              <h2 className="mb-3 text-[18px] font-bold text-[#444]">
                {getText(footerSetting.descriptionTitle, isBangla)}
              </h2>

              <p
                className={`text-[14px] leading-[20px] text-[#999] ${
                  open ? "" : "line-clamp-2"
                }`}
              >
                {getText(footerSetting.description, isBangla)}
              </p>

              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="mt-5 cursor-pointer rounded-[3px] bg-[#006bb6] px-4 py-2 text-[13px] font-medium text-white"
              >
                {open
                  ? getText(
                      footerSetting.showLessText,
                      isBangla,
                      isBangla ? "কম দেখুন" : "Show Less",
                    )
                  : getText(
                      footerSetting.readMoreText,
                      isBangla,
                      isBangla ? "আরও পড়ুন" : "Read More",
                    )}{" "}
                ⌄
              </button>
            </div>
          </>
        )}

        <div className="my-5 h-px w-full bg-[#d6d6d6]" />

        <div className="flex items-center gap-4 pb-1">
          {(footerSetting.footerLogo || footerSetting.footerLogoUrl) && (
            <img
              src={
                footerSetting.footerLogoUrl ||
                makeImageUrl(footerSetting.footerLogo)
              }
              alt="logo"
              className="h-[26px] object-contain"
              draggable="false"
            />
          )}

          <div>
            <h4 className="text-[13px] font-bold text-[#005daa]">
              {getText(
                footerSetting.footerQualityTitle,
                isBangla,
                isBangla ? "সেরা মানের প্ল্যাটফর্ম" : "Best Quality Platform",
              )}
            </h4>

            <p className="text-[12px] text-[#888]">
              {footerSetting.copyrightText}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
