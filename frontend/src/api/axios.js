import axios from "axios";
import APP_CONFIG from "../config/appConfig";

const API = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;