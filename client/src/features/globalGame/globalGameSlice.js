import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

const GAME_PROXY_API = "/api/admin/game-api-key/client";

export const fetchGlobalGameData = createAsyncThunk(
  "globalGame/fetchGlobalGameData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`${GAME_PROXY_API}/game-data`);
      return res?.data?.data || {};
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load game data",
      );
    }
  },
);

export const fetchGameList = createAsyncThunk(
  "globalGame/fetchGameList",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(`${GAME_PROXY_API}/game-list`, { params });
      return res?.data?.data || {};
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load games",
      );
    }
  },
);

// Games.jsx only keeps one server-paginated page (24 games, filtered by
// category/provider) in `gameList`, so searching against it only ever
// matched whatever happened to be on that page. This thunk instead pulls
// every game in every category (the site has ~15k games total) so search
// can match site-wide.
//
// It deliberately fetches per-category (categoryId + page + limit=24) —
// the exact request shape normal browsing already uses successfully —
// instead of requesting "all categories" in one call or with a bigger
// limit, since neither of those is known to be supported by the upstream
// master API. A first pass that capped pages per category too low silently
// dropped most of a large category's games; this version paginates every
// category all the way through (bounded only by an overall games ceiling).
const SEARCH_PAGE_LIMIT = 24;
const SEARCH_TOTAL_GAMES_CAP = 20000; // overall safety ceiling, above the ~15k catalog
const SEARCH_CONCURRENCY = 12;

const runInBatches = async (items, worker, batchSize) => {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(worker));
    results.push(...batchResults);
  }

  return results;
};

export const fetchSearchCatalog = createAsyncThunk(
  "globalGame/fetchSearchCatalog",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const categories = Array.isArray(state?.globalGame?.categories)
      ? state.globalGame.categories
      : [];
    const categoryIds = categories.map((item) => item?._id).filter(Boolean);

    const fetchPage = (categoryId, page) =>
      api
        .get(`${GAME_PROXY_API}/game-list`, {
          params: { categoryId, page, limit: SEARCH_PAGE_LIMIT },
        })
        .then((res) => res?.data?.data || {})
        .catch(() => ({ games: [], meta: { totalPages: 1 } }));

    try {
      // Step 1: fetch page 1 of every category (bounded concurrency) to
      // learn how many pages each category actually has.
      const firstPages = await runInBatches(
        categoryIds,
        (categoryId) =>
          fetchPage(categoryId, 1).then((data) => ({ categoryId, data })),
        SEARCH_CONCURRENCY,
      );

      let allGames = [];
      const remainingRequests = [];

      firstPages.forEach(({ categoryId, data }) => {
        allGames = allGames.concat(Array.isArray(data.games) ? data.games : []);

        const totalPages = Number(data?.meta?.totalPages || 1) || 1;

        for (let page = 2; page <= totalPages; page += 1) {
          remainingRequests.push({ categoryId, page });
        }
      });

      // Step 2: fetch every remaining page across every category, bounded
      // only by an overall games ceiling so this can't run away forever.
      const remainingBudget = Math.max(
        Math.floor(SEARCH_TOTAL_GAMES_CAP / SEARCH_PAGE_LIMIT) -
          firstPages.length,
        0,
      );
      const cappedRequests = remainingRequests.slice(0, remainingBudget);

      const restResults = await runInBatches(
        cappedRequests,
        ({ categoryId, page }) => fetchPage(categoryId, page),
        SEARCH_CONCURRENCY,
      );

      restResults.forEach((data) => {
        if (Array.isArray(data.games)) {
          allGames = allGames.concat(data.games);
        }
      });

      return allGames;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load games for search",
      );
    }
  },
);

export const fetchPlayGameDetails = createAsyncThunk(
  "globalGame/fetchPlayGameDetails",
  async (gameId, { rejectWithValue }) => {
    try {
      const res = await api.get(`${GAME_PROXY_API}/play-game/${gameId}`);
      return res?.data?.data || null;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load play game",
      );
    }
  },
);

const initialState = {
  categories: [],
  providers: [],
  homeProviders: [],
  games: [],
  hotGames: [],
  popularGames: [],
  sports: [],

  gamesByCategory: {},
  gamesByProvider: {},
  providersByCategory: {},

  gameList: [],
  gameListMeta: {
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 1,
  },

  playGame: null,

  loading: false,
  loaded: false,
  error: null,

  gameListLoading: false,
  gameListError: null,

  searchCatalog: [],
  searchCatalogLoading: false,
  searchCatalogLoaded: false,
  searchCatalogError: null,

  playGameLoading: false,
  playGameError: null,
};

const globalGameSlice = createSlice({
  name: "globalGame",
  initialState,
  reducers: {
    clearGlobalGameError: (state) => {
      state.error = null;
      state.gameListError = null;
      state.playGameError = null;
    },

    clearPlayGame: (state) => {
      state.playGame = null;
      state.playGameError = null;
      state.playGameLoading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalGameData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalGameData.fulfilled, (state, action) => {
        const data = action.payload || {};

        state.loading = false;
        state.loaded = true;

        state.categories = Array.isArray(data.categories)
          ? data.categories
          : [];
        state.providers = Array.isArray(data.providers) ? data.providers : [];
        state.homeProviders = Array.isArray(data.homeProviders)
          ? data.homeProviders
          : [];
        state.games = Array.isArray(data.games) ? data.games : [];
        state.hotGames = Array.isArray(data.hotGames) ? data.hotGames : [];
        state.popularGames = Array.isArray(data.popularGames)
          ? data.popularGames
          : [];
        state.sports = Array.isArray(data.sports) ? data.sports : [];

        state.gamesByCategory = data.gamesByCategory || {};
        state.gamesByProvider = data.gamesByProvider || {};
        state.providersByCategory = data.providersByCategory || {};
      })
      .addCase(fetchGlobalGameData.rejected, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = action.payload || "Failed to load game data";
      })

      .addCase(fetchGameList.pending, (state) => {
        state.gameListLoading = true;
        state.gameListError = null;
      })
      .addCase(fetchGameList.fulfilled, (state, action) => {
        const data = action.payload || {};

        state.gameListLoading = false;
        state.gameList = Array.isArray(data.games) ? data.games : [];
        state.gameListMeta = data.meta || {
          page: 1,
          limit: 24,
          total: 0,
          totalPages: 1,
        };
      })
      .addCase(fetchGameList.rejected, (state, action) => {
        state.gameListLoading = false;
        state.gameListError = action.payload || "Failed to load games";
      })

      .addCase(fetchSearchCatalog.pending, (state) => {
        state.searchCatalogLoading = true;
        state.searchCatalogError = null;
      })
      .addCase(fetchSearchCatalog.fulfilled, (state, action) => {
        state.searchCatalogLoading = false;
        state.searchCatalogLoaded = true;
        state.searchCatalog = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchSearchCatalog.rejected, (state, action) => {
        state.searchCatalogLoading = false;
        state.searchCatalogLoaded = true;
        state.searchCatalogError =
          action.payload || "Failed to load games for search";
      })

      .addCase(fetchPlayGameDetails.pending, (state) => {
        state.playGameLoading = true;
        state.playGameError = null;
      })
      .addCase(fetchPlayGameDetails.fulfilled, (state, action) => {
        state.playGameLoading = false;
        state.playGame = action.payload || null;
      })
      .addCase(fetchPlayGameDetails.rejected, (state, action) => {
        state.playGameLoading = false;
        state.playGameError = action.payload || "Failed to load play game";
      });
  },
});

export const { clearGlobalGameError, clearPlayGame } = globalGameSlice.actions;

export default globalGameSlice.reducer;
