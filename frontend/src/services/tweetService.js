import api from "./api.js";

export async function getUserTweets(userId) {
  const { data } = await api.get(`/tweets/user/${userId}`);
  return data.data;
}

export async function createTweet(contend) {
  const { data } = await api.post("/tweets", { contend });
  return data.data;
}

export async function deleteTweet(tweetId) {
  await api.delete(`/tweets/${tweetId}`);
}

export async function toggleTweetLike(tweetId) {
  const { data } = await api.post(`/likes/tweets/${tweetId}`);
  return data.data;
}
