import api from "./api.js";

export async function login(email, password) {
  const { data } = await api.post("/user/login", { email, password });
  return data.data;
}

export async function register(formData) {
  const { data } = await api.post("/user/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function logout() {
  await api.post("/user/logout");
}

export async function getProfile() {
  const { data } = await api.get("/user/profile");
  return data.data;
}

export async function getChannelProfile(username) {
  const { data } = await api.get(`/user/channel/${username}`);
  return data.data;
}

export async function getWatchHistory() {
  const { data } = await api.get("/user/watch-history");
  return data.data;
}
