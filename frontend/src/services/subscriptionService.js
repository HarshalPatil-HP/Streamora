import api from "./api.js";

export async function toggleSubscribe(channelId) {
  const { data } = await api.post(`/subscriptions/c/${channelId}`);
  return data.data;
}

export async function getSubscribedChannels(subscriberId) {
  const { data } = await api.get(`/subscriptions/c/${subscriberId}`);
  return data.data;
}
