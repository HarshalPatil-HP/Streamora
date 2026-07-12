import api from "./api.js";

export async function getUserPlaylists(userId) {
  const { data } = await api.get(`/playlists/user/${userId}`);
  return data.data;
}
