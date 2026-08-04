import api from "./api.js";

export async function getUserPlaylists(userId) {
  const { data } = await api.get(`/playlists/user/${userId}`);
  return data.data;
}

export async function getPlaylistById(playlistId) {
  const { data } = await api.get(`/playlists/${playlistId}`);
  return data.data;
}

export async function createPlaylist({ name, description }) {
  const { data } = await api.post("/playlists", {
    name,
    description: description || " ",
  });
  return data.data;
}

export async function addVideoToPlaylist(playlistId, videoId) {
  const { data } = await api.patch(`/playlists/add/${videoId}/${playlistId}`);
  return data.data;
}

export async function removeVideoFromPlaylist(playlistId, videoId) {
  const { data } = await api.patch(
    `/playlists/remove/${videoId}/${playlistId}`,
  );
  return data.data;
}

export async function deletePlaylist(playlistId) {
  await api.delete(`/playlists/${playlistId}`);
}
