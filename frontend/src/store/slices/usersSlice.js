import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/axios";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/users");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.status || 500);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id, thunkAPI) => {
    try {
      const res = await api.get(`/users/${id}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await api.put(`/users/${id}`, data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async ({ id, password }, thunkAPI) => {
    try {
      await api.delete(`/users/${id}`, {
        data: { password },
      });
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "users/updateUserRole",
  async ({ id, role }, thunkAPI) => {
    try {
      await api.put(`/users/${id}/role`, { role });
      return { id, role };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  "users/changePassword",
  async ({ id, password, newPassword }, thunkAPI) => {
    try {
      const res = await api.put(`/users/change-password/${id}`, {
        password,
        newPassword,
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    loading: false,
    error: null,
    isRateLimited: false,

    // For ProfilePage & UserDetailPage
    singleUser: null,
    singleLoading: false,
  },

  reducers: {
    removeUser(state, action) {
      state.users = state.users.filter((u) => u._id !== action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isRateLimited = false;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        if (action.payload === 429) {
          state.isRateLimited = true;
        } else {
          state.error = "Failed to load users";
        }
      })

      .addCase(fetchUserById.pending, (state) => {
        state.singleLoading = true;
        state.singleUser = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.singleLoading = false;
        state.singleUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state) => {
        state.singleLoading = false;
        state.singleUser = null;
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        state.singleUser = action.payload;
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })

      .addCase(updateUserRole.fulfilled, (state, action) => {
        const { id, role } = action.payload;

        // Update in users list
        state.users = state.users.map((u) =>
          u._id === id ? { ...u, role } : u
        );

        // Update in singleUser if viewing that user
        if (state.singleUser?._id === id) {
          state.singleUser.role = role;
        }
      })

      .addCase(changePassword.fulfilled, () => {
        // No state update needed — only success message
      });
  },
});

export const { removeUser } = usersSlice.actions;
export default usersSlice.reducer;
