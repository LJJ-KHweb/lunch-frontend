import axiosInstance from "./axiosInstance";

export const validateCode = (code) => axiosInstance.get(`/api/codes/${encodeURIComponent(code)}`);

export const getAdminCodes = () => axiosInstance.get("/api/admin/class-codes");

export const createCode = (code) => axiosInstance.post("/api/admin/class-codes", { code });

export const deleteCode = (id) => axiosInstance.delete(`/api/admin/class-codes/${id}`);
