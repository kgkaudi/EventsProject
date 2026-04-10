import axios from "axios";
import { store } from "../store/store";

export const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Inject token from Redux store
api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.user?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
