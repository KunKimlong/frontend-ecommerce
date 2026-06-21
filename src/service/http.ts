import axios from "axios";

const http = axios.create({
    baseURL: "/api/backend",
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

http.interceptors.request.use(
    (config) => {
        if (typeof document !== 'undefined') {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('authToken='))
                ?.split('=')[1];
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

http.interceptors.response.use(
    (res) => res,
    (err) => {
        console.error("API Error:", err.response?.data || err.message);
        if (err.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(err.response?.data || err);
    }
);

export default http;