import GameLaunchHealth from "../models/GameLaunchHealth.js";

/**
 * How many launch attempts in a row must fail before a game is dropped from
 * the client site. Kept above 1 so a single upstream hiccup does not hide a
 * working game.
 */
export const HIDE_AFTER_FAILURES = 3;

/**
 * The hidden set is read on every game list request, so it is cached briefly
 * rather than hitting Mongo each time. A game staying visible for up to a
 * minute after being marked is harmless; the user just sees it one more time.
 */
const CACHE_TTL_MS = 60 * 1000;

let cachedHidden = new Set();
let cachedAt = 0;

export const invalidateHiddenCache = () => {
  cachedAt = 0;
};

export const getHiddenGameUIds = async () => {
  const now = Date.now();

  if (now - cachedAt < CACHE_TTL_MS) return cachedHidden;

  try {
    const rows = await GameLaunchHealth.find({ hidden: true })
      .select("gameUId")
      .lean();

    cachedHidden = new Set(
      rows.map((row) => String(row.gameUId || "").trim()).filter(Boolean),
    );
    cachedAt = now;
  } catch {
    // Never let a bookkeeping failure take the game list down; on error the
    // last known set (or an empty one) is used and everything stays visible.
  }

  return cachedHidden;
};

const str = (value) => String(value ?? "").trim();

const gameUIdOf = (game) => str(game?.gameUId);

/**
 * A game name that came from the catalogue. `gameUId` is deliberately not a
 * fallback here: the client only falls back to it for display, and an entry
 * with no real name is exactly what we are filtering out.
 */
const gameNameOf = (game) =>
  str(game?.oracleGame?.name) || str(game?.name) || str(game?.gameName);

const imageOf = (game) =>
  str(game?.imageUrl) || str(game?.customImageUrl) || str(game?.oracleImageUrl);

/**
 * Full check, for the ordinary game lists: it must be launchable, named and
 * have artwork.
 */
export const isListableGame = (game, hidden) => {
  const uid = gameUIdOf(game);

  if (!uid) return false;
  if (hidden?.has(uid)) return false;
  if (!gameNameOf(game)) return false;
  if (!imageOf(game)) return false;

  return true;
};

/**
 * Looser check, for admin-curated rows (hot / popular). Those carry their own
 * artwork and caption rather than a catalogue name, so only launchability and
 * a visible image are required.
 */
export const isListableFeature = (game, hidden) => {
  const uid = gameUIdOf(game);

  if (!uid) return false;
  if (hidden?.has(uid)) return false;
  if (!imageOf(game)) return false;

  return true;
};

const keyOf = (game) =>
  str(game?.gameId) || str(game?._id) || str(game?.id) || gameUIdOf(game);

/**
 * Filter every game collection inside the master `game-data` payload.
 *
 * Must run before the payload is capped to N games per category, otherwise the
 * cap keeps broken entries and drops good ones that would have taken their
 * place.
 */
export const filterGameDataPayload = (payload = {}, hidden = new Set()) => {
  const data = payload?.data || payload;
  if (!data || typeof data !== "object") return payload;

  const keepGame = (game) => isListableGame(game, hidden);
  const keepFeature = (game) => isListableFeature(game, hidden);

  const games = Array.isArray(data.games) ? data.games.filter(keepGame) : data.games;

  const filterMap = (map) => {
    if (!map || typeof map !== "object") return map;

    return Object.fromEntries(
      Object.entries(map).map(([key, list]) => [
        key,
        Array.isArray(list) ? list.filter(keepGame) : list,
      ]),
    );
  };

  return {
    ...payload,
    data: {
      ...data,
      games,
      gamesByCategory: filterMap(data.gamesByCategory),
      gamesByProvider: filterMap(data.gamesByProvider),
      hotGames: Array.isArray(data.hotGames)
        ? data.hotGames.filter(keepFeature)
        : data.hotGames,
      popularGames: Array.isArray(data.popularGames)
        ? data.popularGames.filter(keepFeature)
        : data.popularGames,
    },
  };
};

/** Filter the paginated `game-list` payload. */
export const filterGameListPayload = (payload = {}, hidden = new Set()) => {
  const data = payload?.data || payload;
  if (!data || typeof data !== "object") return payload;
  if (!Array.isArray(data.games)) return payload;

  return {
    ...payload,
    data: {
      ...data,
      games: data.games.filter((game) => isListableGame(game, hidden)),
    },
  };
};

/**
 * Record the outcome of a launch attempt.
 *
 * A success clears the counter and un-hides the game, so recovery needs no
 * manual step. Bookkeeping never throws into the caller: failing to record a
 * result must not turn a working launch into an error for the player.
 */
export const recordLaunchOutcome = async (gameUId, ok, errorText = "") => {
  const uid = str(gameUId);
  if (!uid) return;

  try {
    if (ok) {
      const before = await GameLaunchHealth.findOneAndUpdate(
        { gameUId: uid },
        {
          $set: {
            failCount: 0,
            hidden: false,
            lastSucceededAt: new Date(),
            lastError: "",
          },
        },
        { upsert: true, returnDocument: "before" },
      );

      if (before?.hidden) {
        invalidateHiddenCache();
        invalidateCatalogCache();
      }
      return;
    }

    const after = await GameLaunchHealth.findOneAndUpdate(
      { gameUId: uid },
      {
        $inc: { failCount: 1 },
        $set: {
          lastFailedAt: new Date(),
          lastError: str(errorText).slice(0, 300),
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    if (after && !after.hidden && after.failCount >= HIDE_AFTER_FAILURES) {
      await GameLaunchHealth.updateOne(
        { _id: after._id },
        { $set: { hidden: true } },
      );

      invalidateHiddenCache();
      invalidateCatalogCache();

      console.log(
        `game hidden after ${after.failCount} failed launches: ${uid}`,
      );
    }
  } catch (error) {
    console.error("recordLaunchOutcome failed:", error?.message || error);
  }
};

/* ----------------------------- FILTERED CATALOG ----------------------------- */

/**
 * Filtering a page of results after the source has already paginated leaves
 * holes: ask for 24 games, get back 6, and the reported total still counts the
 * ones that were dropped. So instead the whole list for a category is loaded
 * once, filtered, cached, and paginated here — pages come back full and the
 * totals match what the player actually sees.
 */
const CATALOG_TTL_MS = 10 * 60 * 1000;
const CATALOG_MAX_ENTRIES = 32;

const catalogCache = new Map();

/**
 * Bumped whenever a game is hidden or un-hidden, so cached catalogs built
 * against a stale hidden set are rebuilt instead of served.
 */
let catalogVersion = 0;

export const invalidateCatalogCache = () => {
  catalogVersion += 1;
};

export const getFilteredCatalog = async (key, loadAll) => {
  const cached = catalogCache.get(key);
  const now = Date.now();

  if (
    cached &&
    cached.version === catalogVersion &&
    now - cached.at < CATALOG_TTL_MS
  ) {
    return cached.games;
  }

  const games = await loadAll();

  catalogCache.set(key, { games, at: now, version: catalogVersion });

  // Plain FIFO eviction; the working set is one entry per category, so this
  // only trims stray provider/category combinations.
  if (catalogCache.size > CATALOG_MAX_ENTRIES) {
    const oldest = catalogCache.keys().next().value;
    catalogCache.delete(oldest);
  }

  return games;
};

export const paginate = (games, page, limit) => {
  const total = games.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;

  return {
    games: games.slice(start, start + limit),
    meta: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  };
};

/** Run `worker` over `items` a few at a time instead of all at once. */
export const runInBatches = async (items, worker, batchSize = 12) => {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    results.push(...(await Promise.all(batch.map(worker))));
  }

  return results;
};
