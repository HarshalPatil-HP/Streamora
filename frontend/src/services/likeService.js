import api from "./api.js";

export async function toggleVideoLike(videoId) {
  const { data } = await api.post(`/likes/videos/${videoId}`);
  return data.data; // { liked: bool, likeCount: number }
}

export async function getVideoLikeStatus(videoId) {
  const { data } = await api.get(`/likes/videos/${videoId}/status`);
  return data.data; // { liked: bool, likeCount: number }
}

export async function getLikedVideos() {
  const { data } = await api.get("/likes/videos");
  return data.data;
}

export async function toggleCommentLike(commentId) {
  const { data } = await api.post(`/likes/comments/${commentId}`);
  return data.data; // { liked: bool, likeCount: number }
}

export async function getCommentLikeStatus(commentId) {
  const { data } = await api.get(`/likes/comments/${commentId}/status`);
  return data.data;
}

export async function toggleTweetLike(tweetId) {
  const { data } = await api.post(`/likes/tweets/${tweetId}`);
  return data.data; // { liked: bool, likeCount: number }
}

export async function getTweetLikeStatus(tweetId) {
  const { data } = await api.get(`/likes/tweets/${tweetId}/status`);
  return data.data;
}
