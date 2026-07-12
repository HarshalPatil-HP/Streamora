import api from "./api.js";

export async function getDashboardStats() {
  const { data } = await api.get("/dashboard/stats");
  return data.data;
}

export async function getDashboardVideos(page = 1) {
  const { data } = await api.get("/dashboard/videos", { params: { page, limit: 20 } });
  return data.data;
}
