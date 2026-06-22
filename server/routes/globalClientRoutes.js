import express from "express";
import SiteIdentify from "../models/SiteIdentify.js";
import Notice from "../models/Notice.js";
import Slider from "../models/Slider.js";
import FavouriteBanner from "../models/FavouriteBanner.js";

const router = express.Router();

router.get("/site-data", async (req, res) => {
  try {
    const [siteIdentify, notice, sliders, favouriteBanners] =
      await Promise.all([
        SiteIdentify.findOne({ status: "active" }).sort({ createdAt: -1 }).lean(),

        Notice.findOne({ status: "active" }).sort({ createdAt: -1 }).lean(),

        Slider.find({ status: "active" })
          .sort({ order: 1, createdAt: -1 })
          .lean(),

        FavouriteBanner.find({ status: "active" })
          .sort({ order: 1, createdAt: -1 })
          .lean(),
      ]);

    return res.status(200).json({
      success: true,
      message: "Global site data loaded successfully.",
      data: {
        siteIdentify,
        notice,
        sliders,
        favouriteBanners,
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