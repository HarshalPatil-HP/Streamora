import { getPlaylistById } from "../services/playlistService.js";
import { renderVideoGrid } from "../components/VideoCard.js";
import { renderSpinner } from "../utils/ui.js";

export async function PlaylistPage({ id }) {
  return `
    <div class="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
      <div id="playlist-page-content" class="animate-fade-in flex min-h-[50vh] items-center justify-center">
        ${renderSpinner()}
      </div>
    </div>
  `;
}

export async function mountPlaylistPage({ id }) {
  const content = document.getElementById("playlist-page-content");
  if (!content) return;

  try {
    const playlist = await getPlaylistById(id);
    const videos = playlist.videos || [];
    const hasVideos = videos.length > 0;

    content.className = "animate-fade-in";
    content.innerHTML = `
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-[#0A0A0A] sm:text-3xl">${playlist.name || "Playlist"}</h1>
        <p class="mt-2 text-sm text-[#888] sm:text-base">${playlist.description || ""}</p>
        <div class="mt-4 flex items-center gap-3 text-sm text-[#555]">
          <span class="font-medium">${videos.length} video${videos.length !== 1 ? 's' : ''}</span>
          ${playlist.owner?.fullname ? `<span>• Created by <span class="font-semibold text-[#0A0A0A]">${playlist.owner.fullname}</span></span>` : ""}
        </div>
      </div>
      
      ${hasVideos 
        ? `<div class="video-grid">${renderVideoGrid(videos)}</div>`
        : `
          <div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E8E8E8] bg-[#F9F9F9] py-16 px-4 text-center">
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" stroke-width="1.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
            </div>
            <h2 class="text-xl font-bold text-[#0A0A0A]">No videos yet</h2>
            <p class="mt-2 max-w-sm text-sm text-[#888]">This playlist is currently empty. Videos added to this playlist will appear here.</p>
          </div>
        `
      }
    `;
  } catch (err) {
    content.className = "flex min-h-[50vh] flex-col items-center justify-center text-center";
    content.innerHTML = `
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0F0] text-[#FF4444]">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h2 class="text-2xl font-bold text-[#0A0A0A]">Playlist not found</h2>
      <p class="mt-2 text-sm text-[#888]">This playlist may have been deleted or is private.</p>
    `;
  }
}
