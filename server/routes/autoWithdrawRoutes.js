import express from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import axios from "axios";

import AutoWithdrawToken from "../models/AutoWithdrawToken.js";
import AutoWithdraw from "../models/AutoWithdraw.js";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";
import EWallet from "../models/EWallet.js";

import { protectAdmin } from "../middleware/protectAdmin.js";
import protectUser from "../middleware/protectUser.js";
import upload from "../config/multer.js";

const router = express.Router();

const OPAY_CREATE_URL =
  "https://api.oraclepay.org/api/opay-business/auto-withdraw";

const OPAY_CANCEL_URL =
  "https://api.oraclepay.org/api/opay-business/auto-withdraw/cancel";

const OPAY_METHODS = ["bkash", "nagad", "rocket", "upay"];

/**
 * How long an approved request may sit unresolved before an admin is allowed
 * to return the money by hand. OraclePay has no failure webhook, so without
 * this escape hatch a stuck request would hold the user's balance forever.
 * The delay is deliberate: it stops an admin from refunding a transfer that
 * an agent is still working on.
 */
const STUCK_AFTER_MS = 6 * 60 * 60 * 1000;

function stuckSince(withdraw) {
  const started =
    withdraw?.processingAt || withdraw?.approvedAt || withdraw?.createdAt;

  return started ? new Date(started).getTime() : 0;
}

function canForceReturn(withdraw, now = Date.now()) {
  const status = String(withdraw?.status || "").toUpperCase();

  if (!["PENDING", "PROCESSING"].includes(status)) return false;
  if (withdraw?.refunded) return false;

  const started = stuckSince(withdraw);
  if (!started) return false;

  return now - started >= STUCK_AFTER_MS;
}

/* ----------------------------- HELPERS ----------------------------- */

async function getOrCreateSetting() {
  let setting = await AutoWithdrawToken.findOne();

  if (!setting) {
    setting = await AutoWithdrawToken.create({
      businessToken: "",
      active: false,
      webhookSecret: crypto.randomBytes(24).toString("hex"),
      minAmount: 50,
      maxAmount: 500000,
      methods: [],
    });
  }

  if (!setting.webhookSecret) {
    setting.webhookSecret = crypto.randomBytes(24).toString("hex");
    await setting.save();
  }

  return setting;
}

function normalizeMoney(value, fallback = 0) {
  const num = Math.floor(Number(value || 0));
  return Number.isFinite(num) ? num : fallback;
}

function safeString(value = "") {
  return String(value || "").trim();
}

function normalizeMethodId(value = "") {
  return String(value || "").trim().toUpperCase();
}

function normalizeOpayMethod(value = "") {
  const key = String(value || "").trim().toLowerCase();
  return OPAY_METHODS.includes(key) ? key : "";
}

function buildPublicUrls() {
  return {
    backend: process.env.PUBLIC_BACKEND_URL,
    frontend: process.env.PUBLIC_FRONTEND_URL,
  };
}

function generateInvoiceNumber() {
  return `AW-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

function publicMethod(method) {
  return {
    _id: String(method._id),
    methodId: method.methodId || "",
    opayMethod: method.opayMethod || "",
    name: {
      bn: method?.name?.bn || "",
      en: method?.name?.en || "",
    },
    logoUrl: method.logoUrl || "",
    minAmount: Number(method.minAmount || 0),
    maxAmount: Number(method.maxAmount || 0),
  };
}

/**
 * Give the money back exactly once.
 *
 * The refunded flag is claimed first and the balance is only credited if that
 * claim won, so a retried webhook or a double-clicked admin button can never
 * pay the user twice.
 */
async function refundOnce(withdrawId) {
  const claimed = await AutoWithdraw.findOneAndUpdate(
    {
      _id: withdrawId,
      balanceDeducted: true,
      refunded: false,
    },
    { $set: { refunded: true } },
    { new: true },
  );

  if (!claimed) return false;

  await User.updateOne(
    { _id: claimed.user },
    { $inc: { balance: Number(claimed.amount || 0) } },
  );

  return true;
}

/* ----------------------------- ADMIN: GET SETTINGS ----------------------------- */

router.get("/admin", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    const { backend } = buildPublicUrls();

    const methods = [...(setting.methods || [])]
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((method) => ({
        ...publicMethod(method),
        isActive: method.isActive !== false,
        order: Number(method.order || 0),
      }));

    return res.json({
      success: true,
      data: {
        businessToken: setting.businessToken || "",
        active: !!setting.active,
        minAmount: Number(setting.minAmount || 0),
        maxAmount: Number(setting.maxAmount || 0),
        methods,
        webhookUrl: backend
          ? `${backend}/api/auto-withdraw/webhook/${setting.webhookSecret}`
          : "",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ----------------------------- ADMIN: UPLOAD METHOD LOGO ----------------------------- */

/**
 * Logos are uploaded on their own so the settings form can keep saving the
 * whole method list as plain JSON; it just stores the path returned here.
 */
router.post(
  "/admin/upload-logo",
  protectAdmin,
  upload.single("logo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      const logoUrl = `/${req.file.path.replace(/\\/g, "/")}`;

      return res.json({
        success: true,
        message: "Logo uploaded",
        data: { logoUrl },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error?.message || "Upload failed",
      });
    }
  },
);

/* ----------------------------- ADMIN: UPDATE SETTINGS ----------------------------- */

router.put("/admin", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    const { businessToken, active, minAmount, maxAmount, methods } =
      req.body || {};

    if (businessToken !== undefined) {
      setting.businessToken = safeString(businessToken);
    }

    if (active !== undefined) {
      setting.active = !!active;
    }

    if (minAmount !== undefined) {
      setting.minAmount = Math.max(normalizeMoney(minAmount, 50), 1);
    }

    if (maxAmount !== undefined) {
      setting.maxAmount = Math.max(normalizeMoney(maxAmount, 0), 0);
    }

    if (Array.isArray(methods)) {
      const seen = new Set();
      const cleaned = [];

      for (const method of methods) {
        const methodId = normalizeMethodId(method?.methodId);
        const opayMethod = normalizeOpayMethod(method?.opayMethod);

        if (!methodId) {
          return res.status(400).json({
            success: false,
            message: "Each method needs a methodId",
          });
        }

        if (!opayMethod) {
          return res.status(400).json({
            success: false,
            message: `Method ${methodId} needs a wallet type (${OPAY_METHODS.join(
              " / ",
            )})`,
          });
        }

        if (seen.has(methodId)) {
          return res.status(400).json({
            success: false,
            message: `Duplicate methodId: ${methodId}`,
          });
        }

        seen.add(methodId);

        cleaned.push({
          methodId,
          opayMethod,
          name: {
            bn: safeString(method?.name?.bn),
            en: safeString(method?.name?.en),
          },
          logoUrl: safeString(method?.logoUrl),
          minAmount: Math.max(normalizeMoney(method?.minAmount, 0), 0),
          maxAmount: Math.max(normalizeMoney(method?.maxAmount, 0), 0),
          isActive: method?.isActive !== false,
          order: Math.max(normalizeMoney(method?.order, 0), 0),
        });
      }

      setting.methods = cleaned;
    }

    if (setting.active && !setting.businessToken) {
      return res.status(400).json({
        success: false,
        message: "Business token is required before enabling auto withdraw",
      });
    }

    if (
      Number(setting.maxAmount || 0) > 0 &&
      Number(setting.maxAmount) < Number(setting.minAmount)
    ) {
      return res.status(400).json({
        success: false,
        message: "maxAmount must be greater than minAmount",
      });
    }

    await setting.save();

    return res.json({
      success: true,
      message: "Auto withdraw settings updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ----------------------------- CLIENT: STATUS ----------------------------- */

router.get("/status", async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    const methods = [...(setting.methods || [])]
      .filter((method) => method?.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map(publicMethod);

    return res.json({
      success: true,
      data: {
        enabled: !!(setting.active && setting.businessToken),
        minAmount: Number(setting.minAmount || 0),
        maxAmount: Number(setting.maxAmount || 0),
        methods,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ----------------------------- CLIENT: ELIGIBILITY ----------------------------- */

router.get("/eligibility", protectUser, async (req, res) => {
  try {
    const userId = safeString(req.user?.id);

    const pending = await AutoWithdraw.findOne({
      user: userId,
      status: { $in: ["REVIEW", "PENDING", "PROCESSING"] },
    }).sort({ createdAt: -1 });

    if (pending) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          hasPendingWithdraw: true,
          hasRunningTurnover: false,
          remaining: 0,
          message:
            "You already have an auto withdraw in progress. Please wait until it finishes.",
        },
      });
    }

    const running = await TurnOver.findOne({
      user: userId,
      status: "running",
    }).sort({ createdAt: 1 });

    if (!running) {
      return res.json({
        success: true,
        data: {
          eligible: true,
          hasPendingWithdraw: false,
          hasRunningTurnover: false,
          remaining: 0,
          message: "",
        },
      });
    }

    const remaining = Math.max(
      0,
      Number(running.required || 0) - Number(running.progress || 0),
    );

    return res.json({
      success: true,
      data: {
        eligible: false,
        hasPendingWithdraw: false,
        hasRunningTurnover: true,
        remaining,
        message:
          remaining > 0
            ? `Turnover pending: remaining ${remaining}`
            : "Turnover pending",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to check eligibility",
    });
  }
});

/* ----------------------------- CLIENT: CREATE ----------------------------- */

router.post("/create", protectUser, async (req, res) => {
  let withdrawDoc = null;

  // Tracked separately from withdrawDoc: if the debit lands but the record
  // fails to save, there is no document for refundOnce to key off, and the
  // catch below still has to give the money back.
  let heldAmount = 0;
  let heldUserId = "";

  try {
    const setting = await getOrCreateSetting();

    if (!setting.active || !setting.businessToken) {
      return res.status(400).json({
        success: false,
        message: "Auto Withdraw is disabled by admin.",
      });
    }

    const userId = safeString(req.user?.id);
    const walletId = safeString(req.body?.walletId);
    const methodId = normalizeMethodId(req.body?.methodId);
    const amount = normalizeMoney(req.body?.amount, 0);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user",
      });
    }

    if (!methodId) {
      return res.status(400).json({
        success: false,
        message: "methodId is required",
      });
    }

    if (!walletId || !mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet id",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    /* --- one auto withdraw at a time --- */

    const pending = await AutoWithdraw.findOne({
      user: userId,
      status: { $in: ["REVIEW", "PENDING", "PROCESSING"] },
    });

    if (pending) {
      return res.status(409).json({
        success: false,
        code: "PENDING_AUTO_WITHDRAW_EXISTS",
        message:
          "You already have an auto withdraw in progress. Please wait until it finishes.",
      });
    }

    /* --- turnover must be cleared, same rule as manual withdraw --- */

    const running = await TurnOver.findOne({
      user: userId,
      status: "running",
    });

    if (running) {
      const remaining = Math.max(
        0,
        Number(running.required || 0) - Number(running.progress || 0),
      );

      return res.status(403).json({
        success: false,
        message: "Turnover not fulfilled. Complete turnover before withdraw.",
        data: { remaining },
      });
    }

    /* --- method must exist, be active and accept this amount --- */

    const method = (setting.methods || []).find(
      (item) =>
        normalizeMethodId(item.methodId) === methodId &&
        item.isActive !== false,
    );

    if (!method) {
      return res.status(404).json({
        success: false,
        message: "Auto withdraw method not found or inactive",
      });
    }

    const opayMethod = normalizeOpayMethod(method.opayMethod);

    if (!opayMethod) {
      return res.status(400).json({
        success: false,
        message: "This method is not configured correctly. Contact support.",
      });
    }

    const globalMin = Number(setting.minAmount || 0);
    const globalMax = Number(setting.maxAmount || 0);
    const methodMin = Number(method.minAmount || 0);
    const methodMax = Number(method.maxAmount || 0);

    const minAmount = Math.max(globalMin, methodMin);

    const maxAmount =
      globalMax > 0 && methodMax > 0
        ? Math.min(globalMax, methodMax)
        : globalMax > 0
          ? globalMax
          : methodMax;

    if (minAmount > 0 && amount < minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum auto withdraw amount is ${minAmount}`,
      });
    }

    if (maxAmount > 0 && amount > maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Maximum auto withdraw amount is ${maxAmount}`,
      });
    }

    /* --- wallet must belong to this user and match the method --- */

    const wallet = await EWallet.findOne({
      _id: walletId,
      user: userId,
      isActive: true,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    if (normalizeMethodId(wallet.methodId) !== methodId) {
      return res.status(400).json({
        success: false,
        message: "Selected wallet does not match the method",
      });
    }

    const accountNumber = safeString(wallet.walletNumber);

    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        message: "Selected wallet has no account number",
      });
    }

    const user = await User.findById(userId).select("_id isActive balance");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "User is inactive",
      });
    }

    const balanceBefore = Number(user.balance || 0);

    /* --- hold the money atomically, so two parallel requests cannot both pass --- */

    const debited = await User.findOneAndUpdate(
      { _id: userId, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { new: true },
    );

    if (!debited) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    heldAmount = amount;
    heldUserId = userId;

    withdrawDoc = await AutoWithdraw.create({
      user: userId,
      wallet: wallet._id,
      walletSnapshot: {
        methodId: method.methodId,
        methodName: {
          bn: method?.name?.bn || "",
          en: method?.name?.en || "",
        },
        walletType: wallet.walletType || "",
        walletNumber: accountNumber,
        label: wallet.label || "",
      },
      invoiceNumber: generateInvoiceNumber(),
      amount,
      paymentMethod: opayMethod,
      accountNumber,
      status: "REVIEW",
      balanceBefore,
      balanceAfter: Number(debited.balance || 0),
      balanceDeducted: true,
    });

    return res.json({
      success: true,
      message: "Auto withdraw request submitted for review",
      data: {
        _id: String(withdrawDoc._id),
        invoiceNumber: withdrawDoc.invoiceNumber,
        amount,
        status: "REVIEW",
        accountNumber,
      },
    });
  } catch (error) {
    // Any throw after the debit must give the money back.
    if (withdrawDoc?._id) {
      await refundOnce(withdrawDoc._id).catch(() => {});

      await AutoWithdraw.updateOne(
        { _id: withdrawDoc._id },
        {
          $set: {
            status: "FAILED",
            failedAt: new Date(),
            failureReason: safeString(
              error?.response?.data?.message || error?.message,
            ),
          },
        },
      ).catch(() => {});
    } else if (heldAmount > 0 && heldUserId) {
      // The record never got created, so refund straight to the balance.
      await User.updateOne(
        { _id: heldUserId },
        { $inc: { balance: heldAmount } },
      ).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Auto withdraw failed",
    });
  }
});

/* ----------------------------- WEBHOOK ----------------------------- */

router.post("/webhook/:secret", async (req, res) => {
  try {
    const setting = await getOrCreateSetting();

    if (
      !setting.webhookSecret ||
      safeString(req.params.secret) !== setting.webhookSecret
    ) {
      return res.status(404).send("Not found");
    }
  } catch (error) {
    return res.status(500).send("Error");
  }

  res.send("OK");

  try {
    const data = req.body || {};

    const statusRaw = safeString(data.status).toUpperCase();
    const opayWithdrawalId = safeString(data.withdrawal_id);

    const checkoutItems = Array.isArray(data.checkout_items)
      ? data.checkout_items
      : [];

    const autoWithdrawId = safeString(
      checkoutItems.find((item) => item?.autoWithdrawId)?.autoWithdrawId,
    );

    let withdraw = null;

    if (opayWithdrawalId) {
      withdraw = await AutoWithdraw.findOne({ opayWithdrawalId });
    }

    if (!withdraw && mongoose.Types.ObjectId.isValid(autoWithdrawId)) {
      withdraw = await AutoWithdraw.findById(autoWithdrawId);
    }

    if (!withdraw) {
      return console.log("auto-withdraw webhook: request not found", {
        opayWithdrawalId,
        autoWithdrawId,
      });
    }

    withdraw.lastWebhook = data;

    if (opayWithdrawalId && !withdraw.opayWithdrawalId) {
      withdraw.opayWithdrawalId = opayWithdrawalId;
    }

    // COMPLETED is final; a repeated webhook must not reopen or re-process it.
    if (withdraw.status === "COMPLETED") {
      await withdraw.save();
      return console.log("auto-withdraw webhook: already completed");
    }

    if (statusRaw === "PROCESSING") {
      withdraw.status = "PROCESSING";
      withdraw.processingAt = withdraw.processingAt || new Date();
      await withdraw.save();

      return console.log("auto-withdraw webhook: processing", {
        invoiceNumber: withdraw.invoiceNumber,
      });
    }

    if (statusRaw === "COMPLETED") {
      const proofImages = Array.isArray(data.proof_images)
        ? data.proof_images.map(safeString).filter(Boolean)
        : [];

      const completedAt = data.date_and_time
        ? new Date(data.date_and_time)
        : new Date();

      withdraw.status = "COMPLETED";
      withdraw.proofImages = proofImages;
      withdraw.completedAt = Number.isNaN(completedAt.getTime())
        ? new Date()
        : completedAt;

      await withdraw.save();

      return console.log("auto-withdraw webhook: completed", {
        invoiceNumber: withdraw.invoiceNumber,
        amount: withdraw.amount,
        accountNumber: withdraw.accountNumber,
      });
    }

    await withdraw.save();

    console.log("auto-withdraw webhook: unhandled status", statusRaw);
  } catch (error) {
    console.error("auto-withdraw webhook error:", error?.message || error);
  }
});

/* ----------------------------- CLIENT: MY HISTORY ----------------------------- */

router.get("/history/my", protectUser, async (req, res) => {
  try {
    const userId = safeString(req.user?.id);

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      50,
    );

    const filter = { user: userId };
    const status = safeString(req.query.status).toUpperCase();

    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      AutoWithdraw.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select(
          "invoiceNumber amount status paymentMethod accountNumber walletSnapshot proofImages completedAt failureReason adminNote approvedAt rejectedAt createdAt",
        )
        .lean(),
      AutoWithdraw.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: {
        items,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ----------------------------- ADMIN: LIST ----------------------------- */

router.get("/admin/list", protectAdmin, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "20", 10), 1),
      100,
    );

    const filter = {};

    const status = safeString(req.query.status).toUpperCase();
    if (status) filter.status = status;

    const search = safeString(req.query.search);
    if (search) {
      filter.$or = [
        { invoiceNumber: new RegExp(search, "i") },
        { accountNumber: new RegExp(search, "i") },
        { opayWithdrawalId: new RegExp(search, "i") },
      ];
    }

    const userId = safeString(req.query.userId);
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.user = userId;
    }

    const [items, total] = await Promise.all([
      AutoWithdraw.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("user", "userId phone balance")
        .lean(),
      AutoWithdraw.countDocuments(filter),
    ]);

    const now = Date.now();

    return res.json({
      success: true,
      data: {
        items: items.map((item) => ({
          ...item,
          canForceReturn: canForceReturn(item, now),
        })),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        stuckAfterHours: STUCK_AFTER_MS / (60 * 60 * 1000),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ----------------------------- ADMIN: CANCEL ----------------------------- */

router.post("/admin/:id/cancel", protectAdmin, async (req, res) => {
  try {
    const setting = await getOrCreateSetting();
    const withdraw = await AutoWithdraw.findById(req.params.id);

    if (!withdraw) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    if (withdraw.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be cancelled",
      });
    }

    if (withdraw.opayWithdrawalId) {
      try {
        await axios.post(
          OPAY_CANCEL_URL,
          { withdrawal_id: withdraw.opayWithdrawalId },
          {
            headers: {
              "X-Opay-Business-Token": safeString(setting.businessToken),
              "Content-Type": "application/json",
            },
            timeout: 20000,
          },
        );
      } catch (error) {
        // OraclePay refuses once an agent has booked the request. The money is
        // on its way, so it must not be refunded here.
        return res.status(400).json({
          success: false,
          message:
            error?.response?.data?.message ||
            "Cancel failed. An agent may already be processing this withdrawal.",
        });
      }
    }

    await refundOnce(withdraw._id);

    await AutoWithdraw.updateOne(
      { _id: withdraw._id },
      {
        $set: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          adminId: req.admin?._id || null,
          adminNote: safeString(req.body?.adminNote),
        },
      },
    );

    return res.json({
      success: true,
      message: "Cancelled and balance refunded",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Cancel failed",
    });
  }
});

/* ----------------------------- ADMIN: APPROVE ----------------------------- */

/**
 * Approval is the point where money actually leaves. Nothing is sent to
 * OraclePay until an admin has looked at the request.
 */
router.post("/admin/:id/approve", protectAdmin, async (req, res) => {
  const withdraw = await AutoWithdraw.findById(req.params.id);

  if (!withdraw) {
    return res.status(404).json({
      success: false,
      message: "Not found",
    });
  }

  if (withdraw.status !== "REVIEW") {
    return res.status(400).json({
      success: false,
      message: "Only requests under review can be approved",
    });
  }

  try {
    const setting = await getOrCreateSetting();

    if (!setting.businessToken) {
      return res.status(400).json({
        success: false,
        message: "Business token is not configured",
      });
    }

    const { backend } = buildPublicUrls();

    if (!backend) {
      return res.status(500).json({
        success: false,
        message: "PUBLIC_BACKEND_URL is required",
      });
    }

    const callbackUrl = `${backend}/api/auto-withdraw/webhook/${setting.webhookSecret}`;

    const opayRes = await axios.post(
      OPAY_CREATE_URL,
      {
        amount: Number(withdraw.amount || 0),
        payment_method: withdraw.paymentMethod,
        user_identity_address: withdraw.accountNumber,
        account_number: withdraw.accountNumber,
        callback_url: callbackUrl,
        checkout_items: [
          { autoWithdrawId: String(withdraw._id) },
          { userId: String(withdraw.user) },
          { invoiceNumber: withdraw.invoiceNumber },
          { accountNumber: withdraw.accountNumber },
          { paymentMethod: withdraw.paymentMethod },
          { walletType: withdraw?.walletSnapshot?.walletType || "" },
        ],
      },
      {
        headers: {
          "X-Opay-Business-Token": safeString(setting.businessToken),
          "Content-Type": "application/json",
        },
        timeout: 20000,
      },
    );

    const opayWithdrawalId = safeString(
      opayRes?.data?.data?._id || opayRes?.data?.withdrawal_id,
    );

    if (!opayRes?.data?.success || !opayWithdrawalId) {
      await refundOnce(withdraw._id);

      await AutoWithdraw.updateOne(
        { _id: withdraw._id },
        {
          $set: {
            status: "FAILED",
            failedAt: new Date(),
            failureReason: safeString(
              opayRes?.data?.message || "Gateway rejected the withdrawal",
            ),
            adminId: req.admin?._id || null,
          },
        },
      );

      return res.status(400).json({
        success: false,
        message:
          safeString(opayRes?.data?.message) ||
          "Gateway rejected the withdrawal. Balance refunded.",
      });
    }

    await AutoWithdraw.updateOne(
      { _id: withdraw._id },
      {
        $set: {
          status: "PENDING",
          opayWithdrawalId,
          approvedAt: new Date(),
          adminId: req.admin?._id || null,
          adminNote: safeString(req.body?.adminNote),
        },
      },
    );

    return res.json({
      success: true,
      message: "Approved and sent to OraclePay",
    });
  } catch (error) {
    // The gateway never took the request, so the hold has to come back.
    await refundOnce(withdraw._id).catch(() => {});

    await AutoWithdraw.updateOne(
      { _id: withdraw._id },
      {
        $set: {
          status: "FAILED",
          failedAt: new Date(),
          failureReason: safeString(
            error?.response?.data?.message || error?.message,
          ),
          adminId: req.admin?._id || null,
        },
      },
    ).catch(() => {});

    return res.status(500).json({
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Approve failed. Balance refunded.",
    });
  }
});

/* ----------------------------- ADMIN: REJECT ----------------------------- */

router.post("/admin/:id/reject", protectAdmin, async (req, res) => {
  try {
    const withdraw = await AutoWithdraw.findById(req.params.id);

    if (!withdraw) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    if (withdraw.status !== "REVIEW") {
      return res.status(400).json({
        success: false,
        message: "Only requests under review can be rejected",
      });
    }

    await refundOnce(withdraw._id);

    await AutoWithdraw.updateOne(
      { _id: withdraw._id },
      {
        $set: {
          status: "REJECTED",
          rejectedAt: new Date(),
          adminId: req.admin?._id || null,
          adminNote: safeString(req.body?.adminNote),
        },
      },
    );

    return res.json({
      success: true,
      message: "Rejected and balance refunded",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Reject failed",
    });
  }
});

/* ----------------------------- ADMIN: FORCE RETURN ----------------------------- */

/**
 * Last resort for a request the gateway never resolved.
 *
 * Guarded three ways so it cannot be used casually on money that is genuinely
 * in flight: the request must be old enough, a written reason is required, and
 * OraclePay is asked to cancel first so a clean cancel is preferred whenever
 * it is still possible.
 */
router.post("/admin/:id/force-return", protectAdmin, async (req, res) => {
  try {
    const withdraw = await AutoWithdraw.findById(req.params.id);

    if (!withdraw) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    const reason = safeString(req.body?.reason);

    if (reason.length < 5) {
      return res.status(400).json({
        success: false,
        message: "A reason of at least 5 characters is required",
      });
    }

    if (!canForceReturn(withdraw)) {
      const hours = STUCK_AFTER_MS / (60 * 60 * 1000);

      return res.status(400).json({
        success: false,
        message: `Only a pending or processing request older than ${hours} hours can be returned by hand.`,
      });
    }

    // Prefer a real cancel: if OraclePay still accepts it, no agent has taken
    // the request and the money definitely never moved.
    let gatewayCancelled = false;

    if (withdraw.opayWithdrawalId) {
      try {
        const setting = await getOrCreateSetting();

        await axios.post(
          OPAY_CANCEL_URL,
          { withdrawal_id: withdraw.opayWithdrawalId },
          {
            headers: {
              "X-Opay-Business-Token": safeString(setting.businessToken),
              "Content-Type": "application/json",
            },
            timeout: 20000,
          },
        );

        gatewayCancelled = true;
      } catch {
        // Already booked or unreachable; fall through to the manual return.
      }
    }

    const refunded = await refundOnce(withdraw._id);

    await AutoWithdraw.updateOne(
      { _id: withdraw._id },
      {
        $set: gatewayCancelled
          ? {
              status: "CANCELLED",
              cancelledAt: new Date(),
              failureReason: reason,
              adminId: req.admin?._id || null,
              adminNote: safeString(req.body?.adminNote),
            }
          : {
              status: "FAILED",
              failedAt: new Date(),
              forceReturned: true,
              forceReturnedAt: new Date(),
              failureReason: reason,
              adminId: req.admin?._id || null,
              adminNote: safeString(req.body?.adminNote),
            },
      },
    );

    return res.json({
      success: true,
      message: gatewayCancelled
        ? "Cancelled at OraclePay and balance refunded"
        : refunded
          ? "Returned by hand and balance refunded"
          : "Marked returned (balance was already refunded)",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Force return failed",
    });
  }
});

export default router;
