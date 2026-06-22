import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

export const fetchGlobalClientData = createAsyncThunk(
  "global/fetchGlobalClientData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/global/client/site-data");
      return res.data.data;
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
  loading: false,
  loaded: false,
  error: null,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalClientData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGlobalClientData.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;

        state.siteIdentify = action.payload?.siteIdentify || null;
        state.notice = action.payload?.notice || null;
        state.sliders = action.payload?.sliders || [];
        state.favouriteBanners = action.payload?.favouriteBanners || [];
      })
      .addCase(fetchGlobalClientData.rejected, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = action.payload;
      });
  },
});

export default globalSlice.reducer;
