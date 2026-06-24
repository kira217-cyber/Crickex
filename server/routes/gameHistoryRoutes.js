import express from "express";
import mongoose from "mongoose";
import GameHistory from "../models/GameHistory.js";
import User from "../models/User.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import protectUser from "../middleware/protectUser.js";

const router = express.Router();

const safePage = (value = 1) => Math.max(1, Number(value) || 1);
const safeLimit = (value = 10) =>
  Math.min(100, Math.max(1, Number(value) || 10));

/* ---------------- USER: MY BET HISTORY ---------------- */
router.get("/my", protectUser, async (req, res) => {
  try {
    const page = safePage(req.query.page);
    const limit = safeLimit(req.query.limit);
    const skip = (page - 1) * limit;

    const resultType = String(req.query.resultType || "").trim();
    const q = String(req.query.q || "").trim();

    const filter = {
      user: req.user.id,
    };

    if (resultType && ["win", "loss", "push"].includes(resultType)) {
      filter.resultType = resultType;
    }

    if (q) {
      filter.$or = [
        { game_uid: { $regex: q, $options: "i" } },
        { game_round: { $regex: q, $options: "i" } },
        { serial_number: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      GameHistory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      GameHistory.countDocuments(filter),
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

/* ---------------- ADMIN: ALL BET HISTORY ---------------- */
router.get("/admin", protectAdmin, async (req, res) => {
  try {
    const page = safePage(req.query.page);
    const limit = safeLimit(req.query.limit);
    const skip = (page - 1) * limit;

    const resultType = String(req.query.resultType || "").trim();
    const q = String(req.query.q || "").trim();

    const filter = {};

    if (resultType && ["win", "loss", "push"].includes(resultType)) {
      filter.resultType = resultType;
    }

    if (q) {
      const users = await User.find({
        $or: [
          { userId: { $regex: q, $options: "i" } },
          { userGamePlayName: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ],
      }).select("_id");

      const userIds = users.map((u) => u._id);

      filter.$or = [
        {
          user: {
            $in: userIds.length
              ? userIds
              : [new mongoose.Types.ObjectId()],
          },
        },
        { userId: { $regex: q, $options: "i" } },
        { userGamePlayName: { $regex: q, $options: "i" } },
        { member_account: { $regex: q, $options: "i" } },
        { game_uid: { $regex: q, $options: "i" } },
        { game_round: { $regex: q, $options: "i" } },
        { serial_number: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total, summaryAgg] = await Promise.all([
      GameHistory.find(filter)
        .populate(
          "user",
          "userId userGamePlayName phone email balance role isActive",
        )
        .populate("affiliateUser", "userId phone email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      GameHistory.countDocuments(filter),

      GameHistory.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalBetAmount: { $sum: "$bet_amount" },
            totalWinAmount: { $sum: "$win_amount" },
            totalNetAmount: { $sum: "$net_amount" },
            totalWinCount: {
              $sum: { $cond: [{ $eq: ["$resultType", "win"] }, 1, 0] },
            },
            totalLossCount: {
              $sum: { $cond: [{ $eq: ["$resultType", "loss"] }, 1, 0] },
            },
            totalPushCount: {
              $sum: { $cond: [{ $eq: ["$resultType", "push"] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const summary = summaryAgg?.[0] || {};

    return res.json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      summary: {
        totalBetAmount: summary.totalBetAmount || 0,
        totalWinAmount: summary.totalWinAmount || 0,
        totalNetAmount: summary.totalNetAmount || 0,
        siteProfit: Number(summary.totalNetAmount || 0) * -1,
        totalTransactions: total,
        totalWinCount: summary.totalWinCount || 0,
        totalLossCount: summary.totalLossCount || 0,
        totalPushCount: summary.totalPushCount || 0,
        pageRecords: items.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ---------------- ADMIN: SINGLE USER BET HISTORY ---------------- */
router.get("/admin/user/:userId", protectAdmin, async (req, res) => {
  try {
    const page = safePage(req.query.page);
    const limit = safeLimit(req.query.limit);
    const skip = (page - 1) * limit;

    const q = String(req.query.q || "").trim();
    const resultType = String(req.query.resultType || "").trim();
    const { userId } = req.params;

    const filter = {
      user: new mongoose.Types.ObjectId(userId),
    };

    if (resultType && ["win", "loss", "push"].includes(resultType)) {
      filter.resultType = resultType;
    }

    if (q) {
      filter.$or = [
        { game_uid: { $regex: q, $options: "i" } },
        { game_round: { $regex: q, $options: "i" } },
        { serial_number: { $regex: q, $options: "i" } },
        { member_account: { $regex: q, $options: "i" } },
        { userGamePlayName: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total, summaryAgg] = await Promise.all([
      GameHistory.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      GameHistory.countDocuments(filter),

      GameHistory.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalBetAmount: { $sum: "$bet_amount" },
            totalWinAmount: { $sum: "$win_amount" },
            totalNetAmount: { $sum: "$net_amount" },
            totalWinCount: {
              $sum: { $cond: [{ $eq: ["$resultType", "win"] }, 1, 0] },
            },
            totalLossCount: {
              $sum: { $cond: [{ $eq: ["$resultType", "loss"] }, 1, 0] },
            },
            totalPushCount: {
              $sum: { $cond: [{ $eq: ["$resultType", "push"] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const summary = summaryAgg?.[0] || {};

    return res.json({
      success: true,
      data: items,
      summary: {
        totalBetAmount: summary.totalBetAmount || 0,
        totalWinAmount: summary.totalWinAmount || 0,
        totalNetAmount: summary.totalNetAmount || 0,
        siteProfit: Number(summary.totalNetAmount || 0) * -1,
        totalWinCount: summary.totalWinCount || 0,
        totalLossCount: summary.totalLossCount || 0,
        totalPushCount: summary.totalPushCount || 0,
        totalRecords: total,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});


export default router;