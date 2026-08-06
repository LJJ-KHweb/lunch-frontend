import axiosInstance from "./axiosInstance";

export const vote = (code, menuId) => axiosInstance.post("/api/votes", { code, menuId });

export const getResult = (code, date) =>
  axiosInstance.get("/api/votes/result", { params: date ? { code, date } : { code } });
