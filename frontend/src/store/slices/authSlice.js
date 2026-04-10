import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

/* ============================
   SIGNUP USER
============================ */
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async ({ name, email, password, role }, thunkAPI) => {
    try {
      const res = await api.post("/users/signup", {
        name,
        email,
        password,
        role,
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Signup failed"
      );
    }
  }
);

/* ============================
   LOGIN USER
============================ */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await api.post("/users/login", { email, password });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Login failed"
      );
    }
  }
);

/* ============================
   SLICE
============================ */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },

  reducers: {
    logout(state) {
      state.user = null;
      state.error = null;
      state.loading = false;
      localStorage.removeItem("user");
    },
  },

  extraReducers: (builder) => {
    builder
      /* ============================
         SIGNUP
      ============================ */
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ============================
         LOGIN
      ============================ */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
