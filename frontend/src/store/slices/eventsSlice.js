import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

export const fetchEventById = createAsyncThunk(
  "events/fetchEventById",
  async (id, thunkAPI) => {
    try {
      const res = await api.get(`/events/${id}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (data, thunkAPI) => {
    try {
      const res = await api.post("/events", data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await api.put(`/events/${id}`, data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async ({ page, query }, thunkAPI) => {
    try {
      const res = await api.get(`/events?page=${page}&limit=9&q=${query}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  "events/fetchAnalytics",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/events/stats");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

const eventsSlice = createSlice({
  name: "events",
  initialState: {
    events: [],
    page: 1,
    query: "",
    hasMore: true,
    loading: false,
    error: null,

    singleEvent: null,
    singleLoading: false,

    analytics: null,
    analyticsLoading: false,
  },

  reducers: {
    setQuery(state, action) {
      state.query = action.payload;
      state.page = 1;
      state.events = [];
      state.hasMore = true;
    },

    resetEvents(state) {
      state.events = [];
      state.page = 1;
      state.hasMore = true;
    },

    removeEvent(state, action) {
      state.events = state.events.filter((e) => e._id !== action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchEventById.pending, (state) => {
        state.singleLoading = true;
        state.singleEvent = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.singleLoading = false;
        state.singleEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state) => {
        state.singleLoading = false;
        state.singleEvent = null;
      })

      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        const { events, hasMore } = action.payload;

        state.events = [...state.events, ...events];
        state.hasMore = hasMore;
        state.loading = false;
        state.page += 1;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.analytics = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state) => {
        state.analyticsLoading = false;
        state.analytics = null;
      });
  },
});

export const { setQuery, resetEvents, removeEvent } = eventsSlice.actions;
export default eventsSlice.reducer;
