import axios from "axios";
import API_BASE_URL from "../config/apiConfig";

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token") ||
                      sessionStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log("REQUEST:", config.method, config.url, "token present:", !!token);

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;