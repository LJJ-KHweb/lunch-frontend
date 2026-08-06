import axiosInstance from "./axiosInstance";

export const getBoardMenus = (code) => axiosInstance.get("/api/menus/board", { params: { code } });

export const getAdminMenus = (date) =>
  axiosInstance.get("/api/admin/menus", { params: date ? { date } : {} });

export const createMenu = (payload) => axiosInstance.post("/api/admin/menus", payload);

export const updateMenu = (menuId, payload) =>
  axiosInstance.patch(`/api/admin/menus/${menuId}`, payload);

export const updateMenuStatus = (menuId, status) =>
  axiosInstance.patch(`/api/admin/menus/${menuId}/status`, { status });

export const deleteMenu = (menuId) => axiosInstance.delete(`/api/admin/menus/${menuId}`);

export const generateAiMenu = (className, voteDate) =>
  axiosInstance.post("/api/admin/menus/generate", null, {
    params: voteDate ? { className, voteDate } : { className },
  });
