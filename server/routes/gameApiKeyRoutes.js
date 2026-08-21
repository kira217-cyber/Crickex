import express from "express";
import axios from "axios";

import GameApiKeySetting from "../models/GameApiKeySetting.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";
import {
  getHiddenGameUIds,
  filterGameDataPayload,
  isListableGame,
  getFilteredCatalog,
  paginate,
  runInBatches,
} from "../services/gameVisibilityService.js";

const router = express.Router();

const INITIAL_LIST_LIMIT = 50;

const cleanText = (value = "") => String(value || "").trim();

const cleanBaseUrl = (url = "") => cleanText(url).replace(/\/+$/, "");

const getMasterApiBaseUrl = () => {
  return cleanBaseUrl(process.env.MASTER_API_URL || "");
};

const verifyMasterApiKey = async (apiKey) => {
  const masterApiBaseUrl = getMasterApiBaseUrl();
  const cleanKey = cleanText(apiKey);

  if (!masterApiBaseUrl) throw new Error("MASTER_API_URL is missing in .env");
  if (!cleanKey) throw new Error("API key is missing");

  const res = await axios.post(
    `${masterApiBaseUrl}/api/master/cx-global/client/verify-token`,
    { token: cleanKey },
    { timeout: 15000, headers: { "Content-Type": "application/json" } },
  );

  const response = res.data || {};
  const payload = response?.data || response;

  return {
    valid: Boolean(
      payload?.valid === true ||
      response?.valid === true ||
      response?.success === true,
    ),
    site: payload?.site || response?.site || null,
    raw: response,
  };
};

const getValidSetting = async () => {
  const setting = await GameApiKeySetting.findOne().sort({ createdAt: -1 });

  if (!setting) {
    return { error: "No API key setting found.", status: 404 };
  }

  if (!setting.apiKey) {
    return { error: "API key is missing.", status: 401 };
  }

  if (!setting.isActive) {
    return { error: "API key is inactive.", status: 403 };
  }

  if (!setting.isVerified) {
    return { error: "API key is not verified.", status: 401 };
  }

  return { setting };
};

const proxyMasterGet = async (req, res, masterPath) => {
  try {
    const { setting, error, status } = await getValidSetting();

    if (error) return errorResponse(res, error, status);

    const masterApiBaseUrl = getMasterApiBaseUrl();

    if (!masterApiBaseUrl) {
      return errorResponse(res, "MASTER_API_URL is missing in .env", 500);
    }

    const response = await axios.get(`${masterApiBaseUrl}${masterPath}`, {
      params: req.query || {},
      timeout: 30000,
      headers: {
        "x-api-key": setting.apiKey,
        "Content-Type": "application/json",
      },
    });

    return res.status(response.status || 200).json(response.data);
  } catch (error) {
    return errorResponse(
      res,
      error?.response?.data?.message ||
        error.message ||
        "Master API request failed.",
      error?.response?.status || 500,
    );
  }
};

// Master's /client/game-data returns every active game at once, which makes
// the client site's first paint slow. Trim it down to the first
// INITIAL_LIST_LIMIT games per category (plus whatever hot/popular games
// need) before forwarding to the client. The rest stays reachable behind
// the existing /client/game-list pagination for background loading.
const capGameDataPayload = (payload = {}) => {
  const data = payload?.data || payload;
  if (!data || typeof data !== "object") return payload;

  const games = Array.isArray(data.games) ? data.games : [];
  const gamesByCategory = data.gamesByCategory || {};

  const categoryTotals = {};
  const cappedGamesByCategory = {};
  const keptGameIds = new Set();

  Object.entries(gamesByCategory).forEach(([categoryId, list]) => {
    const fullList = Array.isArray(list) ? list : [];
    categoryTotals[categoryId] = fullList.length;

    const cappedList = fullList.slice(0, INITIAL_LIST_LIMIT);
    cappedGamesByCategory[categoryId] = cappedList;

    cappedList.forEach((game) => {
      const key = String(game?.gameId || game?._id || game?.id || "");
      if (key) keptGameIds.add(key);
    });
  });

  const hotGames = Array.isArray(data.hotGames)
    ? data.hotGames.slice(0, INITIAL_LIST_LIMIT)
    : data.hotGames;

  const popularGames = Array.isArray(data.popularGames)
    ? data.popularGames.slice(0, INITIAL_LIST_LIMIT)
    : data.popularGames;

  [...(hotGames || []), ...(popularGames || [])].forEach((item) => {
    const key = String(item?.gameId || "");
    if (key) keptGameIds.add(key);
  });

  const cappedGames = games.filter((game) => {
    const key = String(game?.gameId || game?._id || game?.id || "");
    return keptGameIds.has(key);
  });

  const gamesByProvider = {};
  cappedGames.forEach((game) => {
    const providerId = game?.providerDbId;
    if (!providerId) return;

    if (!gamesByProvider[providerId]) gamesByProvider[providerId] = [];
    gamesByProvider[providerId].push(game);
  });

  return {
    ...payload,
    data: {
      ...data,
      games: cappedGames,
      gamesByCategory: cappedGamesByCategory,
      gamesByProvider,
      hotGames,
      popularGames,
      sports: Array.isArray(data.sports)
        ? data.sports.slice(0, INITIAL_LIST_LIMIT)
        : data.sports,
      homeProviders: Array.isArray(data.homeProviders)
        ? data.homeProviders.slice(0, INITIAL_LIST_LIMIT)
        : data.homeProviders,
      gamesMeta: {
        limit: INITIAL_LIST_LIMIT,
        totalGames: games.length,
        categoryTotals,
      },
    },
  };
};

/* ADMIN: GET API KEY SETTING */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const setting = await GameApiKeySetting.findOne().sort({ createdAt: -1 });

    return successResponse(res, "Game API key setting fetched successfully.", {
      setting,
    });
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ADMIN: SAVE / UPDATE API KEY */
router.post("/", protectAdmin, async (req, res) => {
  try {
    const { apiKey, isActive = true } = req.body || {};

    if (!apiKey) {
      return errorResponse(res, "API key is required.", 400);
    }

    const cleanKey = cleanText(apiKey);

    let isVerified = false;
    let lastVerifyError = "";
    let siteInfo = null;

    try {
      const verifyData = await verifyMasterApiKey(cleanKey);

      isVerified = Boolean(verifyData?.valid);
      siteInfo = verifyData?.site || null;

      if (!isVerified) lastVerifyError = "Invalid API key.";
    } catch (error) {
      isVerified = false;
      lastVerifyError =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to verify API key.";
    }

    const setting = await GameApiKeySetting.findOneAndUpdate(
      {},
      {
        apiKey: cleanKey,
        isActive: isActive === true || isActive === "true",
        isVerified,
        lastVerifiedAt: new Date(),
        lastVerifyError,
        siteInfo,
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return successResponse(
      res,
      isVerified
        ? "API key saved and verified successfully."
        : "API key saved but verification failed.",
      {
        valid: isVerified,
        setting,
      },
      isVerified ? 200 : 202,
    );
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ADMIN: VERIFY SAVED API KEY */
router.post("/verify", protectAdmin, async (req, res) => {
  try {
    const setting = await GameApiKeySetting.findOne().sort({ createdAt: -1 });

    if (!setting) {
      return errorResponse(res, "No API key setting found.", 404);
    }

    try {
      const verifyData = await verifyMasterApiKey(setting.apiKey);

      setting.isVerified = Boolean(verifyData?.valid);
      setting.lastVerifiedAt = new Date();
      setting.lastVerifyError = setting.isVerified ? "" : "Invalid API key.";
      setting.siteInfo = verifyData?.site || null;

      await setting.save();

      return successResponse(res, "API key verified successfully.", {
        valid: setting.isVerified,
        site: verifyData?.site || null,
        setting,
      });
    } catch (error) {
      setting.isVerified = false;
      setting.lastVerifiedAt = new Date();
      setting.lastVerifyError =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to verify API key.";

      await setting.save();

      return res.status(401).json({
        success: false,
        message: setting.lastVerifyError,
        data: {
          valid: false,
          setting,
        },
      });
    }
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ADMIN: ACTIVE / INACTIVE API KEY */
router.patch("/status", protectAdmin, async (req, res) => {
  try {
    const { isActive } = req.body || {};

    const setting = await GameApiKeySetting.findOneAndUpdate(
      {},
      {
        isActive: isActive === true || isActive === "true",
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!setting) {
      return errorResponse(res, "No API key setting found.", 404);
    }

    return successResponse(res, "API key status updated successfully.", {
      setting,
    });
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* ADMIN: DELETE API KEY */
router.delete("/", protectAdmin, async (req, res) => {
  try {
    const setting = await GameApiKeySetting.findOneAndDelete();

    if (!setting) {
      return errorResponse(res, "No API key setting found.", 404);
    }

    return successResponse(res, "API key setting deleted successfully.", {
      setting,
    });
  } catch (error) {
    return errorResponse(res, error.message || "Server error", 500);
  }
});

/* CLIENT PROXY: GLOBAL GAME DATA */
router.get("/client/game-data", async (req, res) => {
  try {
    const { setting, error, status } = await getValidSetting();

    if (error) return errorResponse(res, error, status);

    const masterApiBaseUrl = getMasterApiBaseUrl();

    if (!masterApiBaseUrl) {
      return errorResponse(res, "MASTER_API_URL is missing in .env", 500);
    }

    const response = await axios.get(
      `${masterApiBaseUrl}/api/master/cx-global/client/game-data`,
      {
        params: req.query || {},
        timeout: 30000,
        headers: {
          "x-api-key": setting.apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    // Filter before capping: capping first would spend the per-category
    // budget on unplayable games and push good ones out of the list.
    const hidden = await getHiddenGameUIds();
    const visiblePayload = filterGameDataPayload(response.data, hidden);
    const cappedPayload = capGameDataPayload(visiblePayload);

    return res.status(response.status || 200).json(cappedPayload);
  } catch (error) {
    return errorResponse(
      res,
      error?.response?.data?.message ||
        error.message ||
        "Master API request failed.",
      error?.response?.status || 500,
    );
  }
});

/* CLIENT PROXY: GAME LIST */

// Master pages the catalogue before we get to filter it, so filtering a single
// page leaves gaps and a total that counts games the player never sees. Load
// the whole category once, filter it, cache it, and page over the result.
const MASTER_PAGE_LIMIT = 24;
const MASTER_MAX_PAGES = 400;

const loadVisibleCategoryGames = async ({ setting, baseUrl, query }) => {
  const hidden = await getHiddenGameUIds();

  const fetchPage = async (page) => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/master/cx-global/client/game-list`,
        {
          params: { ...query, page, limit: MASTER_PAGE_LIMIT },
          timeout: 30000,
          headers: {
            "x-api-key": setting.apiKey,
            "Content-Type": "application/json",
          },
        },
      );

      const data = response?.data?.data || {};

      return {
        games: Array.isArray(data.games) ? data.games : [],
        totalPages: Number(data?.meta?.totalPages || 1),
      };
    } catch {
      return { games: [], totalPages: 1 };
    }
  };

  const first = await fetchPage(1);
  const totalPages = Math.min(first.totalPages, MASTER_MAX_PAGES);

  const restPages = [];
  for (let page = 2; page <= totalPages; page += 1) restPages.push(page);

  const rest = await runInBatches(restPages, fetchPage, 12);

  return [first, ...rest]
    .flatMap((entry) => entry.games)
    .filter((game) => isListableGame(game, hidden));
};

router.get("/client/game-list", async (req, res) => {
  try {
    const { setting, error, status } = await getValidSetting();

    if (error) return errorResponse(res, error, status);

    const masterApiBaseUrl = getMasterApiBaseUrl();

    if (!masterApiBaseUrl) {
      return errorResponse(res, "MASTER_API_URL is missing in .env", 500);
    }

    const categoryId = String(req.query?.categoryId || "");
    const providerDbId = String(req.query?.providerDbId || "");

    const page = Math.max(Number(req.query?.page) || 1, 1);
    const limit = Math.max(Number(req.query?.limit) || 24, 1);

    const games = await getFilteredCatalog(
      `proxy:${categoryId}|${providerDbId}`,
      () =>
        loadVisibleCategoryGames({
          setting,
          baseUrl: masterApiBaseUrl,
          query: {
            ...(categoryId ? { categoryId } : {}),
            ...(providerDbId ? { providerDbId } : {}),
          },
        }),
    );

    const { games: pageGames, meta } = paginate(games, page, limit);

    return res.json({
      success: true,
      message: "Games loaded successfully",
      data: { games: pageGames, meta },
    });
  } catch (error) {
    return errorResponse(
      res,
      error?.response?.data?.message ||
        error.message ||
        "Master API request failed.",
      error?.response?.status || 500,
    );
  }
});

/* CLIENT PROXY: PLAY GAME DETAILS */
router.get("/client/play-game/:gameId", async (req, res) => {
  const gameId = encodeURIComponent(req.params.gameId);
  return proxyMasterGet(
    req,
    res,
    `/api/master/cx-global/client/play-game/${gameId}`,
  );
});

export default router;
