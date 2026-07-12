import api from "./api.js";

export async function getVideos(params = {}) {
  const { data } = await api.get("/videos", { params });
  return data.data;
}

export async function getVideoById(videoId) {
  const { data } = await api.get(`/videos/${videoId}`);
  return data.data;
}

export async function publishVideo(formData) {
  const { data } = await api.post("/videos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function updateVideo(videoId, formData) {
  const { data } = await api.patch(`/videos/${videoId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function deleteVideo(videoId) {
  await api.delete(`/videos/${videoId}`);
}

export async function togglePublish(videoId) {
  const { data } = await api.patch(`/videos/toggle/publish/${videoId}`);
  return data.data;
}
