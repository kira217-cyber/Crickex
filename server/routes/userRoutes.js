import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const clean = (value = "") => String(value || "").trim();

const onlyDigits = (value = "") => String(value || "").replace(/\D/g, "");

const generateRandomLetters = (length = 10) => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";

  for (let i = 0; i < length; i += 1) {
    result += letters[Math.floor(Math.random() * letters.length)];
  }

  return result;
};

const generateReferralCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
};

const createUniqueGamePlayName = async () => {
  for (let i = 0; i < 50; i += 1) {
    const name = generateRandomLetters(10);
    const exists = await User.exists({ userGamePlayName: name });

    if (!exists) return name;
  }

  throw new Error("Failed to generate unique gameplay name");
};

const createUniqueReferralCode = async () => {
  for (let i = 0; i < 50; i += 1) {
    const code = generateReferralCode();
    const exists = await User.exists({ referralCode: code });

    if (!exists) return code;
  }

  throw new Error("Failed to generate unique referral code");
};

const makeUserPayload = (user) => ({
  id: user._id,
  userId: user.userId,
  userGamePlayName: user.userGamePlayName,
  email: user.email,
  countryCode: user.countryCode,
  phone: user.phone,
  role: user.role,
  isActive: user.isActive,
  currency: user.currency,
  balance: user.balance,
  referralCode: user.referralCode,
  referredBy: user.referredBy,
  referralCount: user.referralCount,
  commissionBalance: user.commissionBalance,
  createdAt: user.createdAt,
});

/* =========================
   Register User
========================= */
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      userId,
      password,
      countryCode,
      phone,
      currency = "BDT",
      referCode = "",
      referralCode = "",
    } = req.body || {};

    const finalUserId = clean(username || userId).toLowerCase();
    const finalCountryCode = clean(countryCode);
    const finalPhone = onlyDigits(phone);
    const finalPassword = String(password || "");
    const finalCurrency = clean(currency || "BDT").toUpperCase();

    const submittedReferCode = clean(referCode || referralCode).toUpperCase();

    if (!finalUserId) {
      return errorResponse(res, "Username is required", 400);
    }

    if (finalUserId.length < 4 || finalUserId.length > 15) {
      return errorResponse(res, "Username must be 4-15 characters", 400);
    }

    if (/\s/.test(finalUserId)) {
      return errorResponse(res, "Username cannot contain space", 400);
    }

    if (!/^[a-z0-9]+$/.test(finalUserId)) {
      return errorResponse(
        res,
        "Username only allows letters and numbers",
        400,
      );
    }

    if (!finalCountryCode) {
      return errorResponse(res, "Country code is required", 400);
    }

    if (!finalPhone) {
      return errorResponse(res, "Phone number is required", 400);
    }

    if (finalPassword.length < 6 || finalPassword.length > 20) {
      return errorResponse(res, "Password must be 6-20 characters", 400);
    }

    const userExists = await User.exists({ userId: finalUserId });

    if (userExists) {
      return errorResponse(res, "Username already exists", 409);
    }

    const phoneExists = await User.exists({
      countryCode: finalCountryCode,
      phone: finalPhone,
    });

    if (phoneExists) {
      return errorResponse(res, "Phone number already registered", 409);
    }

    let referredByUser = null;

    if (submittedReferCode) {
      referredByUser = await User.findOne({
        referralCode: submittedReferCode,
      }).select("_id createdUsers referralCount");

      if (!referredByUser) {
        return errorResponse(res, "Invalid refer code", 400);
      }
    }

    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    const userGamePlayName = await createUniqueGamePlayName();
    const myReferralCode = await createUniqueReferralCode();

    const user = await User.create({
      userId: finalUserId,
      userGamePlayName,
      countryCode: finalCountryCode,
      phone: finalPhone,
      password: hashedPassword,
      role: "user",
      currency: finalCurrency || "BDT",
      referralCode: myReferralCode,
      referredBy: referredByUser?._id || null,
    });

    if (referredByUser) {
      await User.updateOne(
        { _id: referredByUser._id },
        {
          $addToSet: { createdUsers: user._id },
          $inc: { referralCount: 1 },
        },
      );
    }

    const token = generateToken({
      id: user._id,
      userId: user.userId,
      role: user.role,
    });

    return successResponse(
      res,
      "Registration successful",
      {
        user: makeUserPayload(user),
        token,
      },
      201,
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (error?.code === 11000) {
      return errorResponse(res, "Duplicate user data found", 409);
    }

    return errorResponse(res, error.message || "Registration failed", 500);
  }
});

/* =========================
   Login User
========================= */
router.post("/login", async (req, res) => {
  try {
    const { username, userId, password } = req.body || {};

    const finalUserId = clean(username || userId).toLowerCase();
    const finalPassword = String(password || "");

    if (!finalUserId) {
      return errorResponse(res, "Username is required", 400);
    }

    if (!finalPassword) {
      return errorResponse(res, "Password is required", 400);
    }

    const user = await User.findOne({ userId: finalUserId });

    if (!user) {
      return errorResponse(res, "Invalid username or password", 401);
    }

    const isMatch = await bcrypt.compare(finalPassword, user.password);

    if (!isMatch) {
      return errorResponse(res, "Invalid username or password", 401);
    }

    if (!user.isActive) {
      return errorResponse(res, "Your account is inactive", 403);
    }

    const token = generateToken({
      id: user._id,
      userId: user.userId,
      role: user.role,
    });

    return successResponse(res, "Login successful", {
      user: makeUserPayload(user),
      token,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return errorResponse(res, "Login failed", 500);
  }
});

/* =========================
   Get Logged In User
========================= */
const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return errorResponse(res, "No token provided", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded?.id || decoded?._id;

    if (!userId) {
      return errorResponse(res, "Invalid token", 401);
    }

    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, "User not found", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, "Not authorized - invalid token", 401);
  }
};

router.get("/me", requireAuth, async (req, res) => {
  return successResponse(res, "User profile fetched", {
    user: makeUserPayload(req.user),
  });
});

export default router;
