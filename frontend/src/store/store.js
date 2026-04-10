import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import eventsReducer from "./slices/eventsSlice";
import usersReducer from "./slices/usersSlice";

const persistedUser = JSON.parse(localStorage.getItem("user"));

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    users: usersReducer,
  },
  preloadedState: {
    auth: {
      user: persistedUser || null,
      loading: false,
      error: null,
    },
  },
});
