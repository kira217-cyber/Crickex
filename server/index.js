import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import affiliateRoutes from "./routes/affiliateRoutes.js";
import affiliateProfileRoutes from "./routes/affiliateProfileRoutes.js";
import affWithdrawRoutes from "./routes/affWithdrawRoutes.js";
import bulkAdjustmentRoutes from "./routes/bulkAdjustmentRoutes.js";
import affWithdrawRequestRoutes from "./routes/affWithdrawRequestRoutes.js";

/* ✅ Deposit System Routes */
import depositMethodRoutes from "./routes/depositMethodRoutes.js";
import depositFieldRoutes from "./routes/depositFieldRoutes.js";
import depositBonusTurnoverRoutes from "./routes/depositBonusTurnoverRoutes.js";
import turnoverRoutes from "./routes/turnoverRoutes.js";
import depositRequestRoutes from "./routes/depositRequestRoutes.js";
import adminManualDepositRoutes from "./routes/adminManualDepositRoutes.js";
import userInfoRoutes from "./routes/userInfoRoutes.js";
import autoDepositRoutes from "./routes/autoDepositRoutes.js";
import eWalletRoutes from "./routes/eWalletRoutes.js";
import withdrawMethodRoutes from "./routes/withdrawMethodRoutes.js";
import withdrawRequestRoutes from "./routes/withdrawRequestRoutes.js";
import gameCategoryRoutes from "./routes/gameCategoryRoutes.js";
import gameProviderRoutes from "./routes/gameProviderRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import sportRoutes from "./routes/sportRoutes.js";
import popularGameRoutes from "./routes/popularGameRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import favouriteBannerRoutes from "./routes/favouriteBannerRoutes.js";
import sliderRoutes from "./routes/sliderRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import siteIdentifyRoutes from "./routes/siteIdentifyRoutes.js";
import affSiteIdentifyRoutes from "./routes/affSiteIdentifyRoutes.js";
import globalClientRoutes from "./routes/globalClientRoutes.js";
import hotGameRoutes from "./routes/hotGameRoutes.js";
import globalGameClientRoutes from "./routes/globalGameClientRoutes.js";
import playGameRoutes from "./routes/playGameRoutes.js";
import callbackRoutes from "./routes/callbackRoutes.js";
import gameHistoryRoutes from "./routes/gameHistoryRoutes.js";
import footerSettingRoutes from "./routes/footerSettingRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import navbarColorSettingRoutes from "./routes/navbarColorSettingRoutes.js";
import sidebarColorSettingRoutes from "./routes/sidebarColorSettingRoutes.js";
import categorySectionSettingRoutes from "./routes/categorySectionSettingRoutes.js";
import registerModalSettingRoutes from "./routes/registerModalSettingRoutes.js";
import loginModalSettingRoutes from "./routes/loginModalSettingRoutes.js";
import forgotPasswordRoutes from "./routes/forgotPasswordRoutes.js";
import referRedeemAdminRoutes from "./routes/referRedeemAdminRoutes.js";
import referRedeemUserRoutes from "./routes/referRedeemUserRoutes.js";
import modalColorSettingRoutes from "./routes/modalColorSettingRoutes.js";
import transactionHistoryColorSettingRoutes from "./routes/transactionHistoryColorSettingRoutes.js";
import bottomNavigationColorSettingRoutes from "./routes/bottomNavigationColorSettingRoutes.js";
import homePageContentColorSettingRoutes from "./routes/homePageContentColorSettingRoutes.js";
import forgetPasswordModalSettingRoutes from "./routes/forgetPasswordModalSettingRoutes.js";
import socialLinkRoutes from "./routes/socialLinkRoutes.js";


dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Crickex Server is running.",
  });
});

/* Existing Routes */
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/affiliate", affiliateRoutes);
app.use("/api/profile", affiliateProfileRoutes);
app.use("/api", affWithdrawRoutes);
app.use("/api", bulkAdjustmentRoutes);
app.use("/api", affWithdrawRequestRoutes);

/* ✅ Deposit System Routes */
app.use("/api/deposit-methods", depositMethodRoutes);
app.use("/api/deposit-fields", depositFieldRoutes);
app.use("/api/deposit-bonus-turnover", depositBonusTurnoverRoutes);
app.use("/api/turnovers", turnoverRoutes);
app.use("/api/deposit-requests", depositRequestRoutes);
app.use("/api/admin/manual-deposits", adminManualDepositRoutes);
app.use("/api/user-info", userInfoRoutes);
app.use("/api/auto-deposit", autoDepositRoutes);
app.use("/api/e-wallets", eWalletRoutes);
app.use("/api/withdraw-methods", withdrawMethodRoutes);
app.use("/api", withdrawRequestRoutes);

// Forget Password
app.use("/api/users/forgot-password", forgotPasswordRoutes);

// Refer and Reedeem
app.use("/api/admin/refer-redeem", referRedeemAdminRoutes);
app.use("/api/user/refer-redeem", referRedeemUserRoutes);

/* ✅ Game System Routes */
app.use("/api/game-categories", gameCategoryRoutes);
app.use("/api/game-providers", gameProviderRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/sports", sportRoutes);
app.use("/api/popular-games", popularGameRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/hot-games", hotGameRoutes);

// game Play system
app.use("/api/play-game", playGameRoutes);
app.use("/api/callback", callbackRoutes);
app.use("/api/game-history", gameHistoryRoutes);

// client site controller
app.use("/api/favourite-banners", favouriteBannerRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/notice", noticeRoutes);
app.use("/api/site-identify", siteIdentifyRoutes);
app.use("/api/footer-settings", footerSettingRoutes);
app.use("/api/navbar-color-settings", navbarColorSettingRoutes);
app.use("/api/sidebar-color-settings", sidebarColorSettingRoutes);
app.use("/api/category-section-settings", categorySectionSettingRoutes);
app.use("/api/register-modal-settings", registerModalSettingRoutes);
app.use("/api/login-modal-settings", loginModalSettingRoutes);
app.use("/api/modal-color-settings", modalColorSettingRoutes);
app.use(
  "/api/transaction-history-color-settings",
  transactionHistoryColorSettingRoutes,
);
app.use(
  "/api/bottom-navigation-color-settings",
  bottomNavigationColorSettingRoutes,
);
app.use(
  "/api/home-page-content-color-settings",
  homePageContentColorSettingRoutes,
);
app.use(
  "/api/forget-password-modal-settings",
  forgetPasswordModalSettingRoutes,
);
app.use("/api/social-link", socialLinkRoutes);


// Affiliate Site Controller
app.use("/api/aff-site-identify", affSiteIdentifyRoutes);

// global client site Routes
app.use("/api/global/client", globalClientRoutes);

// global game routes client site
app.use("/api/global/client", globalGameClientRoutes);

// admin pannel Dashboard Routes
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Crickex Server running on port ${PORT}`);
});
