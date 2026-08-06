import axiosInstance from "./axiosInstance";

export const vote = (code, { menuIds = [], anyMenu = false, noPreference = false }) =>
  axiosInstance.post("/api/votes", { code, menuIds, anyMenu, noPreference });

export const getResult = (code, date) =>
  axiosInstance.get("/api/votes/result", { params: date ? { code, date } : { code } });
