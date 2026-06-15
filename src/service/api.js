import axios from "axios";
import { jwtDecode } from "jwt-decode"; // ✅ correct import
import { toast } from "react-toastify";

// export const baseURL = "https://demofrwrd.smplyrefer.com";
export const baseURL = "https://api.frwrdtutors.com";
// export const baseURL = "https://demofrwrd.imanglobal.net";
// https://demofrwrd.imanglobal.net/


const api = axios.create({
  baseURL: `${baseURL}/api`, // reuse the baseURL here
  headers: {
    "Content-Type": "application/json",
  },
});

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000; // current time in seconds
    return decoded.exp < now;
  } catch (err) {
    return true; // invalid or broken token = expired
  }
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      if (isTokenExpired(token)) {
        // Token is expired — logout user
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        localStorage.removeItem("BranchId");
        localStorage.clear();

        toast.error("Session expired. Please login again.");
        window.location.href = "/login"; // force redirect
        throw new axios.Cancel("Token expired");
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
        localStorage.removeItem("BranchId");

      // toast.error("Unauthorized. Please login again.");
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
