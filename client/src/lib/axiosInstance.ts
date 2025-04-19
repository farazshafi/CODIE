import axios from "axios";

const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true,
});

API.interceptors.request.use(
    (config) => {
        const userStorage = localStorage.getItem("user-storage");
        const publicRoutes = [
            "/login",
            "/register",
            "/verify-otp",
            "/resend-otp",
            "/google-auth-login",
            "/google-auth-register"
        ];

        const isPublic = publicRoutes.some(url => config.url?.includes(url));

        if (!isPublic && userStorage) {
            const token = JSON.parse(userStorage).state.user.token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const userStorage = localStorage.getItem("user-storage");
            if (!userStorage) {
                window.location.href = "/login";
                return Promise.reject(error);
            }

            const refreshToken = JSON.parse(userStorage).state.user.refreshToken;

            try {
                const tokenResponse = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/refresh-token`,
                    { refreshToken }
                );

                const newAccessToken = tokenResponse.data.accessToken;
                const userData = JSON.parse(userStorage);
                userData.state.user.token = newAccessToken;
                localStorage.setItem("user-storage", JSON.stringify(userData));

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return API(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("user-storage");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default API;
