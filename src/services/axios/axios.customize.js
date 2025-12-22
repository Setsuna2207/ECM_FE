import axios from "axios";

// Set config defaults when creating the instance
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:7264/api",
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "10000"),
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor
instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Request:", config.method.toUpperCase(), config.url, config.data);
    return config;
}, function (error) {
    // Do something with request error
    console.error("Request error:", error);
    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    console.log("Response:", response.status, response.data);
    if (response) return response;
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    console.error("Response error:", error.response?.status, error.response?.data);
    if (error?.response) return error?.response;
    return Promise.reject(error);
});

export default instance;