
import axios from "axios";

export const request = axios.create({
    headers: {
    "content-type": "application/json; charset=UTF-8",
    },
    baseURL: import.meta.env.VITE_APP_BASE_URL,
    timeout: 50000,
});