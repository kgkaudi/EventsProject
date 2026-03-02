import axios from "axios";

// in production, there's no localhost so we have to make this dynamic
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";

const user = JSON.parse(localStorage.getItem("user"));

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
      Authorization: `Bearer ${user.token}`
    }
});

export default api;
