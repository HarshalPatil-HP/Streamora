import api from "./api.js";

export async function getVideoComments(videoId, page = 1) {
  const { data } = await api.get(`/comments/${videoId}`, { params: { page, limit: 20 } });
  return data.data;
}

export async function postComment(videoId, contend) {
  const { data } = await api.post(`/comments/${videoId}`, { contend });
  return data.data;
}

export async function deleteComment(commentId) {
  await api.delete(`/comments/c/${commentId}`);
}
