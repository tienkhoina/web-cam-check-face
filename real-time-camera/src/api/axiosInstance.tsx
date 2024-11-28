import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:5000", // Backend URL
  timeout: 10000, // Timeout (ms)
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
