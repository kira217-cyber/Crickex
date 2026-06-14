import express from "express";
import mongoose from "mongoose";
import TurnOver from "../models/TurnOver.js";
import User from "../models/User.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import protectUser from "../middleware/protectUser.js";

const router = express.Router();

const safeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

/* ---------------- USER: MY TURNOVERS ---------------- */
router.get("/my", protectUser, async (req, res) => {
  try {
    const status = String(req.query.status || "").trim();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const filter = {
      user: req.user.id,
    };

    if (status && ["running", "completed"].includes(status)) {
      filter.status = status;
    }

    const [items, total] = await Promise.all([
      TurnOver.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TurnOver.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ---------------- ADMIN: LIST TURNOVERS ---------------- */
router.get("/admin", protectAdmin, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const status = String(req.query.status || "").trim();
    const q = String(req.query.q || "").trim();

    const filter = {};

    if (status && ["running", "completed"].includes(status)) {
      filter.status = status;
    }

    if (q) {
      const users = await User.find({
        $or: [
          { userId: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ],
      }).select("_id");

      const userIds = users.map((u) => u._id);

      filter.user = {
        $in: userIds.length ? userIds : [new mongoose.Types.ObjectId()],
      };
    }

    const [items, total] = await Promise.all([
      TurnOver.find(filter)
        .populate("user", "userId phone email balance role isActive")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TurnOver.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ---------------- ADMIN: SINGLE TURNOVER DETAILS ---------------- */
router.get("/admin/:id", protectAdmin, async (req, res) => {
  try {
    const doc = await TurnOver.findById(req.params.id)
      .populate("user", "userId phone email balance role isActive")
      .lean();

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Turnover not found",
      });
    }

    return res.json({
      success: true,
      data: doc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ---------------- ADMIN: UPDATE PROGRESS ---------------- */
router.post("/admin/:id/progress", protectAdmin, async (req, res) => {
  try {
    const add = safeNumber(req.body?.add, 0);

    if (!Number.isFinite(add) || add <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid add amount",
      });
    }

    const doc = await TurnOver.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Turnover not found",
      });
    }

    if (doc.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Already completed",
      });
    }

    doc.progress = Number(doc.progress || 0) + add;

    if (doc.progress >= Number(doc.required || 0)) {
      doc.progress = Number(doc.required || 0);
      doc.status = "completed";
      doc.completedAt = new Date();
    }

    await doc.save();

    return res.json({
      success: true,
      message: "Turnover progress updated successfully",
      data: doc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

export default router;
