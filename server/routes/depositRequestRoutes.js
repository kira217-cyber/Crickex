import express from "express";
import mongoose from "mongoose";
import DepositRequest from "../models/DepositRequest.js";
import DepositMethod from "../models/DepositMethod.js";
import DepositBonusTurnover from "../models/DepositBonusTurnover.js";
import TurnOver from "../models/TurnOver.js";
import User from "../models/User.js";
import protectUser from "../middleware/protectUser.js";
import { protectAdmin } from "../middleware/protectAdmin.js";

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id));

const n = (v) => {
  const num = Number(v || 0);
  return Number.isFinite(num) ? num : 0;
};

const pickText = (obj = {}) => ({
  bn: obj?.bn || "",
  en: obj?.en || "",
});

const calcPromoBonus = ({ amount, promo }) => {
  if (!promo || promo.id === "none") return 0;

  if (promo.bonusType === "percent") {
    return (amount * n(promo.bonusValue)) / 100;
  }

  return n(promo.bonusValue);
};

const getChannelPercent = (channel = {}) => {
  const direct = n(channel?.bonusPercent);
  if (direct > 0) return direct;

  const tagText = String(channel?.tagText || "");
  if (!tagText.includes("%")) return 0;

  const parsed = parseFloat(tagText.replace("+", "").replace("%", ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizePromoScope = (value) =>
  value === "first-deposit" ? "first-deposit" : "all-time";

const getAffiliateDepositCommission = async ({ user, amount }) => {
  if (!user?.referredBy) {
    return {
      affiliatorId: "",
      affiliatorUserId: "",
      percent: 0,
      baseAmount: amount,
      commissionAmount: 0,
    };
  }

  const affiliator = await User.findById(user.referredBy);

  if (!affiliator || affiliator.role !== "aff-user") {
    return {
      affiliatorId: "",
      affiliatorUserId: "",
      percent: 0,
      baseAmount: amount,
      commissionAmount: 0,
    };
  }

  const percent = n(affiliator.depositCommission);
  const commissionAmount = (amount * percent) / 100;

  return {
    affiliatorId: String(affiliator._id),
    affiliatorUserId: affiliator.userId || "",
    percent,
    baseAmount: amount,
    commissionAmount,
  };
};

/* ---------------- USER: CREATE DEPOSIT REQUEST ---------------- */
router.post("/", protectUser, async (req, res) => {
  try {
    const {
      methodId,
      channelId,
      promoId = "none",
      amount,
      fields = {},
    } = req.body || {};

    const amountNum = n(amount);

    if (!methodId || !channelId) {
      return res.status(400).json({
        success: false,
        message: "methodId and channelId are required",
      });
    }

    if (amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user || user.role !== "user") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: "User account is inactive",
      });
    }

    const method = await DepositMethod.findOne({
      methodId: String(methodId).toLowerCase().trim(),
      isActive: true,
    });

    if (!method) {
      return res.status(404).json({
        success: false,
        message: "Deposit method not found or inactive",
      });
    }

    const minDeposit = n(method.minDepositAmount);
    const maxDeposit = n(method.maxDepositAmount);

    if (minDeposit > 0 && amountNum < minDeposit) {
      return res.status(400).json({
        success: false,
        message: `Minimum deposit amount is ${minDeposit}`,
      });
    }

    if (maxDeposit > 0 && amountNum > maxDeposit) {
      return res.status(400).json({
        success: false,
        message: `Maximum deposit amount is ${maxDeposit}`,
      });
    }

    const config = await DepositBonusTurnover.findOne({
      depositMethod: method._id,
    });

    const channels = Array.isArray(config?.channels) ? config.channels : [];

    const channel = channels.find(
      (c) =>
        String(c?.id || "").trim() === String(channelId || "").trim() &&
        c?.isActive !== false,
    );

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Deposit channel not found or inactive",
      });
    }

    const promotions = Array.isArray(config?.promotions)
      ? config.promotions
      : [];

    let promo = null;

    if (promoId && promoId !== "none") {
      promo = promotions.find(
        (p) =>
          String(p?.id || "").toLowerCase() ===
            String(promoId || "").toLowerCase() && p?.isActive !== false,
      );

      if (!promo) {
        return res.status(404).json({
          success: false,
          message: "Promotion not found or inactive",
        });
      }

      if (normalizePromoScope(promo?.bonusScope) === "first-deposit") {
        const previousApproved = await DepositRequest.exists({
          user: user._id,
          status: "approved",
        });

        if (previousApproved) {
          return res.status(400).json({
            success: false,
            message: "First deposit promotion already used",
          });
        }
      }
    }

    const channelPercent = getChannelPercent(channel);
    const percentBonus = (amountNum * channelPercent) / 100;
    const promoBonus = calcPromoBonus({ amount: amountNum, promo });
    const totalBonus = percentBonus + promoBonus;

    const turnoverMultiplier =
      promo && promoId !== "none"
        ? n(promo?.turnoverMultiplier) || 1
        : n(config?.turnoverMultiplier) || 1;

    const creditedAmount = amountNum + totalBonus;
    const targetTurnover = creditedAmount * turnoverMultiplier;

    const activeContacts = Array.isArray(method.contacts)
      ? method.contacts
          .filter((c) => c?.isActive !== false)
          .sort((a, b) => n(a?.sort) - n(b?.sort))
      : [];

    const contact = activeContacts[0] || null;

    const affiliateDepositCommission = await getAffiliateDepositCommission({
      user,
      amount: amountNum,
    });

    const data = await DepositRequest.create({
      user: user._id,
      methodId: method.methodId,
      channelId: String(channelId).trim(),
      promoId: promoId || "none",
      amount: amountNum,
      fields,

      calc: {
        channelPercent,
        percentBonus,
        promoBonus,
        totalBonus,
        turnoverMultiplier,
        targetTurnover,
        creditedAmount,
        affiliateDepositCommission,
      },

      status: "pending",

      display: {
        methodName: pickText(method.methodName),
        channelName: pickText(channel.name),
        contactLabel: pickText(contact?.label),
        channelTagText: channel?.tagText || "",
        channelNumber: contact?.number || "",
        source: "User Deposit",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Deposit request submitted successfully",
      data,
    });
  } catch (error) {
    console.error("CREATE deposit request error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create deposit request",
    });
  }
});

/* ---------------- USER: MY DEPOSIT REQUESTS ---------------- */
router.get("/my", protectUser, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const status = String(req.query.status || "").trim();

    const filter = {
      user: req.user.id,
    };

    if (["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const [items, total] = await Promise.all([
      DepositRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DepositRequest.countDocuments(filter),
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
      message: error.message || "Failed to fetch deposit requests",
    });
  }
});

/* ---------------- ADMIN: LIST DEPOSIT REQUESTS ---------------- */
router.get("/admin", protectAdmin, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const status = String(req.query.status || "").trim();
    const q = String(req.query.q || "").trim();

    const filter = {};

    if (["pending", "approved", "rejected"].includes(status)) {
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
      DepositRequest.find(filter)
        .populate("user", "userId phone email balance role isActive")
        .populate("approvedBy", "email role")
        .populate("rejectedBy", "email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DepositRequest.countDocuments(filter),
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
      message: error.message || "Failed to fetch admin deposit requests",
    });
  }
});

/* ---------------- ADMIN: SINGLE DETAILS ---------------- */
router.get("/admin/:id", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deposit request id",
      });
    }

    const data = await DepositRequest.findById(req.params.id)
      .populate("user", "userId phone email balance role isActive")
      .populate("approvedBy", "email role")
      .populate("rejectedBy", "email role")
      .lean();

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Deposit request not found",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch deposit request details",
    });
  }
});

/* ---------------- ADMIN: APPROVE ---------------- */
router.post("/admin/:id/approve", protectAdmin, async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      if (!isValidObjectId(req.params.id)) {
        throw new Error("Invalid deposit request id");
      }

      const doc = await DepositRequest.findById(req.params.id).session(session);

      if (!doc) {
        throw new Error("Deposit request not found");
      }

      if (doc.status !== "pending") {
        throw new Error("Only pending request can be approved");
      }

      const user = await User.findById(doc.user).session(session);

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.isActive) {
        throw new Error("User account is inactive");
      }

      const creditedAmount = n(doc.calc?.creditedAmount);
      const targetTurnover = n(doc.calc?.targetTurnover);

      user.balance = n(user.balance) + creditedAmount;
      await user.save({ session });

      const affCom = doc.calc?.affiliateDepositCommission || {};
      const affAmount = n(affCom.commissionAmount);

      if (affAmount > 0 && affCom.affiliatorId) {
        const affiliator = await User.findById(affCom.affiliatorId).session(
          session,
        );

        if (affiliator) {
          affiliator.commissionBalance =
            n(affiliator.commissionBalance) + affAmount;
          affiliator.depositCommissionBalance =
            n(affiliator.depositCommissionBalance) + affAmount;

          await affiliator.save({ session });
        }
      }

      doc.status = "approved";
      doc.adminNote = req.body?.adminNote || "";
      doc.approvedBy = req.admin._id;
      doc.approvedAt = new Date();

      await doc.save({ session });

      if (targetTurnover > 0) {
        await TurnOver.findOneAndUpdate(
          {
            user: user._id,
            sourceType: "deposit",
            sourceId: doc._id,
          },
          {
            user: user._id,
            sourceType: "deposit",
            sourceId: doc._id,
            required: targetTurnover,
            progress: 0,
            status: "running",
            creditedAmount,
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
            session,
          },
        );
      }
    });

    const data = await DepositRequest.findById(req.params.id)
      .populate("user", "userId phone email balance role isActive")
      .lean();

    return res.json({
      success: true,
      message: "Deposit request approved successfully",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Approve failed",
    });
  } finally {
    session.endSession();
  }
});

/* ---------------- ADMIN: REJECT ---------------- */
router.post("/admin/:id/reject", protectAdmin, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deposit request id",
      });
    }

    const doc = await DepositRequest.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Deposit request not found",
      });
    }

    if (doc.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending request can be rejected",
      });
    }

    doc.status = "rejected";
    doc.adminNote = req.body?.adminNote || "";
    doc.rejectedBy = req.admin._id;
    doc.rejectedAt = new Date();

    await doc.save();

    return res.json({
      success: true,
      message: "Deposit request rejected successfully",
      data: doc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Reject failed",
    });
  }
});

export default router;
