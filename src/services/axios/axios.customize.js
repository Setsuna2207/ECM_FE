import axios from "axios";

// Set config defaults when creating the instance
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:7264/api",
    withCredentials: true,
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
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    console.error("Response error:", error.response?.status, error.response?.data);
    console.error("Request URL:", error.config?.url);
    console.error("Request headers:", error.config?.headers);

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
        console.error("401 Unauthorized - Token may be invalid or expired");
        console.error("Current token:", localStorage.getItem('access_token')?.substring(0, 50) + '...');

        localStorage.removeItem('access_token');
        localStorage.removeItem('currentUser');

        // Add a small delay to see console logs before redirect
        setTimeout(() => {
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }, 100);
    }

    return Promise.reject(error);
});

export default instance;