import express from "express";

import SiteIdentify from "../models/SiteIdentify.js";
import Notice from "../models/Notice.js";
import Slider from "../models/Slider.js";
import FavouriteBanner from "../models/FavouriteBanner.js";
import FooterSetting from "../models/FooterSetting.js";

const router = express.Router();

const buildFileUrl = (req, filePath = "") => {
  if (!filePath) return "";
  if (String(filePath).startsWith("http")) return filePath;

  const normalized = String(filePath).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
};

const formatSiteIdentify = (req, item) => {
  if (!item) return null;

  return {
    ...item,
    logoUrl: item.logo ? buildFileUrl(req, item.logo) : "",
    faviconUrl: item.favicon ? buildFileUrl(req, item.favicon) : "",
  };
};

const formatSlider = (req, item) => {
  return {
    ...item,
    desktopImageUrl: item.desktopImage
      ? buildFileUrl(req, item.desktopImage)
      : "",
    mobileImageUrl: item.mobileImage ? buildFileUrl(req, item.mobileImage) : "",
  };
};

const formatFavouriteBanner = (req, item) => {
  return {
    ...item,
    imageUrl: item.image ? buildFileUrl(req, item.image) : "",
  };
};

const formatFooterSetting = (req, footer) => {
  if (!footer) return null;

  return {
    ...footer,

    footerLogoUrl: footer.footerLogo
      ? buildFileUrl(req, footer.footerLogo)
      : "",

    officialPartnerImageUrl: footer.officialPartnerImage
      ? buildFileUrl(req, footer.officialPartnerImage)
      : "",

    paymentMethods: Array.isArray(footer.paymentMethods)
      ? footer.paymentMethods
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((item) => ({
            ...item,
            imageUrl: item.image ? buildFileUrl(req, item.image) : "",
          }))
      : [],

    socials: Array.isArray(footer.socials)
      ? footer.socials
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      : [],

    sponsors: Array.isArray(footer.sponsors)
      ? footer.sponsors
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((item) => ({
            ...item,
            imageUrl: item.image ? buildFileUrl(req, item.image) : "",
          }))
      : [],

    ambassadors: Array.isArray(footer.ambassadors)
      ? footer.ambassadors
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((item) => ({
            ...item,
            imageUrl: item.image ? buildFileUrl(req, item.image) : "",
          }))
      : [],

    links: Array.isArray(footer.links)
      ? footer.links
          .filter((item) => item?.status === "active")
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      : [],
  };
};

router.get("/site-data", async (req, res) => {
  try {
    const [siteIdentify, notice, sliders, favouriteBanners, footerSetting] =
      await Promise.all([
        SiteIdentify.findOne({ status: "active" })
          .sort({ createdAt: -1 })
          .lean(),

        Notice.findOne({ status: "active" }).sort({ createdAt: -1 }).lean(),

        Slider.find({ status: "active" })
          .sort({ order: 1, createdAt: -1 })
          .lean(),

        FavouriteBanner.find({ status: "active" })
          .sort({ order: 1, createdAt: -1 })
          .lean(),

        FooterSetting.findOne({ status: "active" })
          .sort({ createdAt: -1 })
          .lean(),
      ]);

    return res.status(200).json({
      success: true,
      message: "Global site data loaded successfully.",
      data: {
        siteIdentify: formatSiteIdentify(req, siteIdentify),
        notice,
        sliders: sliders.map((item) => formatSlider(req, item)),
        favouriteBanners: favouriteBanners.map((item) =>
          formatFavouriteBanner(req, item),
        ),
        footerSetting: formatFooterSetting(req, footerSetting),
      },
    });
  } catch (error) {
    console.error("GLOBAL SITE DATA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load global site data.",
    });
  }
});

export default router;
