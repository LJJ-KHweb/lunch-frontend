import axios from "axios";
import { getVoterToken } from "./voterToken";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 요청 인터셉터: accessToken이 있으면 Authorization 헤더에, 투표자 토큰은 항상
// X-Voter-Token 헤더에 자동으로 붙임 (기존 IP 기반 투표자 식별을 대체 - voterToken.js 참고)
axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  config.headers["X-Voter-Token"] = getVoterToken();
  return config;
});

// 응답 인터셉터: 401(토큰 만료) 발생 시 refreshToken으로 재발급 후 원래 요청 재시도
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("refreshToken");

    // 관리자 세션(refreshToken 있음)이 아니면 - 즉 코드로 입장한 학생 화면이면 - 재발급을 시도하지 않는다.
    if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
          { refreshToken },
        );
        localStorage.setItem("accessToken", data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/admin/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
