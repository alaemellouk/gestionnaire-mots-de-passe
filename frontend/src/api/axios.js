import axios from "axios";
import { clearUserSession } from "../utils/userSession";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  timeout: 10000,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
let navigateFunction = null;
export const setNavigateFunction = (nav) => {
  navigateFunction = nav;
};
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("isAdmin");
      clearUserSession();
      if (window.location.pathname !== "/login") {
        if (navigateFunction) {
          navigateFunction("/login", { replace: true });
        } else {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;