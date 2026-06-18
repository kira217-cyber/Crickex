import express from "express";

import Notice from "../models/Notice.js";

import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const cleanText = (value = "") => String(value || "").trim();

/* ======================================================
   CREATE OR UPDATE SINGLE NOTICE
   POST /api/notice
====================================================== */

router.post("/", protectAdmin, async (req, res) => {
  try {
    const textBn = cleanText(req.body?.textBn);
    const textEn = cleanText(req.body?.textEn);
    const status = req.body?.status === "inactive" ? "inactive" : "active";

    if (!textBn || !textEn) {
      return errorResponse(
        res,
        "Bangla and English notice text are required",
        400,
      );
    }

    const existing = await Notice.findOne();

    let notice;

    if (existing) {
      existing.text = {
        bn: textBn,
        en: textEn,
      };
      existing.status = status;

      await existing.save();
      notice = existing;
    } else {
      notice = await Notice.create({
        text: {
          bn: textBn,
          en: textEn,
        },
        status,
      });
    }

    return successResponse(res, "Notice saved successfully", notice);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET NOTICE - ADMIN
   GET /api/notice
====================================================== */

router.get("/", protectAdmin, async (req, res) => {
  try {
    const notice = await Notice.findOne().sort({ createdAt: -1 });

    return successResponse(res, "Notice fetched successfully", notice);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   GET ACTIVE NOTICE - PUBLIC
   GET /api/notice/active
====================================================== */

router.get("/active", async (req, res) => {
  try {
    const notice = await Notice.findOne({
      status: "active",
    }).sort({
      createdAt: -1,
    });

    return successResponse(res, "Active notice fetched successfully", notice);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ======================================================
   DELETE NOTICE
   DELETE /api/notice
====================================================== */

router.delete("/", protectAdmin, async (req, res) => {
  try {
    const notice = await Notice.findOneAndDelete();

    if (!notice) {
      return errorResponse(res, "Notice not found", 404);
    }

    return successResponse(res, "Notice deleted successfully", notice);
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

export default router;
