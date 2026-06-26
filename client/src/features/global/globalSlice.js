import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

export const fetchGlobalClientData = createAsyncThunk(
  "global/fetchGlobalClientData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/global/client/site-data");
      return res?.data?.data || {};
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Global data load failed",
      );
    }
  },
);

const initialState = {
  siteIdentify: null,
  notice: null,
  sliders: [],
  favouriteBanners: [],

  footerSetting: null,
  navbarColorSetting: null,
  sidebarColorSetting: null,
  categorySectionSetting: null,
  registerModalSetting: null,
  loginModalSetting: null,
  modalColorSetting: null,
  transactionHistoryColorSetting: null,
  bottomNavigationColorSetting: null,

  loading: false,
  loaded: false,
  error: null,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    clearGlobalData: (state) => {
      state.siteIdentify = null;
      state.notice = null;
      state.sliders = [];
      state.favouriteBanners = [];

      state.footerSetting = null;
      state.navbarColorSetting = null;
      state.sidebarColorSetting = null;
      state.categorySectionSetting = null;
      state.registerModalSetting = null;
      state.loginModalSetting = null;
      state.modalColorSetting = null;
      state.transactionHistoryColorSetting = null;
      state.bottomNavigationColorSetting = null;

      state.loading = false;
      state.loaded = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalClientData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalClientData.fulfilled, (state, action) => {
        const payload = action.payload || {};

        state.siteIdentify = payload.siteIdentify || null;
        state.notice = payload.notice || null;

        state.sliders = Array.isArray(payload.sliders) ? payload.sliders : [];
        state.favouriteBanners = Array.isArray(payload.favouriteBanners)
          ? payload.favouriteBanners
          : [];

        state.footerSetting = payload.footerSetting || null;
        state.navbarColorSetting = payload.navbarColorSetting || null;
        state.sidebarColorSetting = payload.sidebarColorSetting || null;
        state.categorySectionSetting = payload.categorySectionSetting || null;
        state.registerModalSetting = payload.registerModalSetting || null;
        state.loginModalSetting = payload.loginModalSetting || null;
        state.modalColorSetting = payload.modalColorSetting || null;
        state.transactionHistoryColorSetting =
          payload.transactionHistoryColorSetting || null;
        state.bottomNavigationColorSetting =
          payload.bottomNavigationColorSetting || null;

        state.loading = false;
        state.loaded = true;
        state.error = null;
      })
      .addCase(fetchGlobalClientData.rejected, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = action.payload || "Global data load failed";
      });
  },
});

export const { clearGlobalData } = globalSlice.actions;

export default globalSlice.reducer;
