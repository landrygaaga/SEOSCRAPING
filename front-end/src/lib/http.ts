import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ex: http://127.0.0.1:8000
  timeout: 30000,
});
