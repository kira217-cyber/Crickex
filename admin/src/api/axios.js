import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// A view-only admin is blocked on the server too; this just gives instant
// feedback instead of a round trip that always ends in 403.
export const isViewOnlyAdmin = () => {
  try {
    const raw = localStorage.getItem("admin");
    if (!raw) return false;

    return JSON.parse(raw)?.role === "viewer";
  } catch {
    return false;
  }
};

export const VIEW_ONLY_MESSAGE = "You can Only Read Not Allow Any Oparation";

/**
 * Shaped like an axios error on purpose.
 *
 * Every admin screen reports failures as
 * `err?.response?.data?.message || err?.message || "<its own fallback>"`, so
 * carrying the same `response.data.message` the server would have sent makes
 * all of them show this one message instead of each screen's own wording.
 */
export class ViewOnlyError extends Error {
  constructor() {
    super(VIEW_ONLY_MESSAGE);

    this.name = "ViewOnlyError";
    this.isViewOnly = true;

    this.response = {
      status: 403,
      data: {
        success: false,
        code: "VIEW_ONLY_ADMIN",
        message: VIEW_ONLY_MESSAGE,
      },
    };
  }
}

api.interceptors.request.use(
  (config) => {
    const method = String(config.method || "get").toUpperCase();

    if (method !== "GET" && isViewOnlyAdmin()) {
      return Promise.reject(new ViewOnlyError());
    }

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// এই এন্ডপয়েন্টগুলোতে 401 এলে auto-logout করা হবে না (ভুল পাসওয়ার্ডের কারণেও 401 আসতে পারে)
// path segment হিসেবে ম্যাচ করে, যাতে "/login-modal-settings" এর মতো নাম ভুলবশত ধরা না পড়ে
const AUTH_ENDPOINT_RE = /\/(login|register|forgot-password)(?:\/|$|\?)/i;
const isAuthEndpoint = (url = "") => AUTH_ENDPOINT_RE.test(url);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.isViewOnly) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;
    const url = error?.config?.url || "";

    if (status === 401 && !isAuthEndpoint(url)) {
      localStorage.removeItem("admin");
      localStorage.removeItem("token");

      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);