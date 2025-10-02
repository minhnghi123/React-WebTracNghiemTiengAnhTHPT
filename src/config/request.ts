import axios from "axios";

export const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL_PROD,
  timeout: 50000,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
  withCredentials: true, // Include this if you need to send cookies with requests
});
