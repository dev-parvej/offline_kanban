import axios from "axios";
import { getAccessToken, getRefreshToken, setAuthTokens, clearAuthTokens } from '../utils/cookieUtils';

const baseUrl = (window as any).BACKEND_URL  || "http://localhost:8989";

export const api = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add access token to headers
api.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If access token expired (401) and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    // No refresh token, redirect to login
                    clearAuthTokens();
                    localStorage.removeItem('user_data');
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Try to refresh the token
                const response = await axios.post(`${baseUrl}/auth/refresh`, {
                    refresh_token: refreshToken
                });

                const { access_token, refresh_token: newRefreshToken } = response.data;

                // Update tokens
                setAuthTokens(access_token, newRefreshToken || refreshToken);

                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh failed, clear auth data and redirect to login
                clearAuthTokens();
                localStorage.removeItem('user_data');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);