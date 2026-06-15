import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

export const baseURL = "https://api.frwrdtutors.com";

const api = axios.create({
    baseURL: `${baseURL}/api/admin`,
    headers: {
        "Content-Type": "application/json",
    },
});

const isTokenExpired = (token) => {
    try {
        const decoded = jwtDecode(token);

        return decoded.exp < Date.now() / 1000;
    } catch {
        return true;
    }
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("admintoken");

        if (token) {
            if (isTokenExpired(token)) {
                // ❌ REMOVE localStorage.clear()

                localStorage.removeItem("admintoken");

                localStorage.removeItem("adminuserdata");

                localStorage.removeItem("BranchId");

                toast.error("Session expired");

                window.location.href = "/admin/login";

                return Promise.reject("expired");
            }

            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (res) => res,

    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("admintoken");

            localStorage.removeItem("adminuserdata");

            localStorage.removeItem("BranchId");

            // optional
            window.location.href = "/admin/login";
        }

        return Promise.reject(error);
    },
);

export default api;
