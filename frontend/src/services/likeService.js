import api from "./api.js";

export async function toggleVideoLike(videoId) {
  const { data } = await api.post(`/likes/videos/${videoId}`);
  return data.data;
}

export async function getLikedVideos() {
  const { data } = await api.get("/likes/videos");
  return data.data;
}
