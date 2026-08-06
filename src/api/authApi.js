import axiosInstance from "./axiosInstance";

export const signup = (payload) => axiosInstance.post("/api/users", payload);

export const login = (payload) => axiosInstance.post("/api/auth/login", payload);

export const refresh = (refreshToken) =>
  axiosInstance.post("/api/auth/refresh", { refreshToken });

export const logout = (refreshToken) =>
  axiosInstance.delete("/api/auth/logout", { data: { refreshToken } });
