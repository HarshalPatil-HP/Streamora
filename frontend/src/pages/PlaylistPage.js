import {
  getPlaylistById,
  removeVideoFromPlaylist,
} from "../services/playlistService.js";
import { getAuthState } from "../context/authContext.js";
import { renderSpinner, showToast } from "../utils/ui.js";
import {
  escapeHtml,
  formatViews,
  formatDuration,
  formatDate,
  getInitials,
} from "../utils/format.js";

const icons = {
  dots: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
  play: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
};

function renderPlaylistItem(video, index, playlistId, isOwner) {
  const id = video._id;
  const title = escapeHtml(video.title || "Untitled");
  const thumbnail = escapeHtml(video.thumbnail || "");
  const views = formatViews(video.views);
  const duration = formatDuration(video.durationNumber);
  const timeAgo = formatDate(video.createdAt);

  const owner = video.ownerDetails || {};
  const ownerName = escapeHtml(owner.fullname || owner.uname || "Creator");
  const ownerAvatar = owner.avatar || null;

  return `
    <div class="playlist-item group flex items-start gap-3 sm:gap-4 rounded-xl p-2 sm:p-3 transition-all duration-200 hover:bg-[#F3F3F3]" data-video-id="${id}">
      <!-- Index -->
      <span class="hidden sm:flex h-full w-6 shrink-0 items-center justify-center text-xs font-medium text-[#ABABAB]">${index + 1}</span>

      <!-- Thumbnail -->
      <a href="/watch/${id}" class="relative shrink-0 w-[140px] sm:w-[168px] aspect-[16/9] overflow-hidden rounded-lg border border-[#E8E8E8] bg-[#F3F3F3]">
        ${
          thumbnail
            ? `<img src="${thumbnail}" alt="${title}" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />`
            : `<div class="flex h-full w-full items-center justify-center bg-[#F3F3F3] text-[#CCCCCC]">
                ${icons.play}
              </div>`
        }
        ${
          duration && duration !== "0:00"
            ? `<span class="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[10px] font-semibold text-white">${duration}</span>`
            : ""
        }
      </a>

      <!-- Info -->
      <div class="min-w-0 flex-1 py-0.5">
        <a href="/watch/${id}" class="block">
          <h3 class="line-clamp-2 text-sm font-semibold leading-snug text-[#0A0A0A] group-hover:text-[#333]" title="${title}">${title}</h3>
        </a>
        <div class="mt-1.5 flex items-center gap-2">
          <div class="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A0A0A] text-[8px] font-bold text-white">
            ${ownerAvatar ? `<img src="${escapeHtml(ownerAvatar)}" class="h-full w-full object-cover" alt="" />` : (ownerName[0] || "C").toUpperCase()}
          </div>
          <span class="text-xs text-[#888] truncate">${ownerName}</span>
        </div>
        <p class="mt-1 text-xs text-[#ABABAB]">${views} views • ${timeAgo}</p>
      </div>

      <!-- 3-dot menu (only for playlist owner) -->
      ${
        isOwner
          ? `<div class="relative shrink-0 self-center">
              <button class="playlist-item-menu flex h-8 w-8 items-center justify-center rounded-lg text-[#ABABAB] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#E8E8E8] hover:text-[#555]" data-menu-video="${id}">
                ${icons.dots}
              </button>
              <div class="playlist-item-dropdown hidden absolute right-0 top-full mt-1 w-44 overflow-hidden rounded-xl border border-[#E8E8E8] bg-white py-1 shadow-card z-10">
                <button class="playlist-remove-btn flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-xs font-medium text-red-500 transition-colors hover:bg-red-50" data-remove-video="${id}">
                  ${icons.trash}
                  Remove from playlist
                </button>
              </div>
            </div>`
          : ""
      }
    </div>
  `;
}

export async function PlaylistPage({ id }) {
  return `
    <div class="mx-auto max-w-4xl">
      <div id="playlist-page-content" class="animate-fade-in flex min-h-[50vh] items-center justify-center">
        ${renderSpinner()}
      </div>
    </div>
  `;
}

export async function mountPlaylistPage({ id }) {
  const content = document.getElementById("playlist-page-content");
  if (!content) return;

  const { user, isAuthenticated } = getAuthState();

  try {
    const playlist = await getPlaylistById(id);
    const videos = playlist.videos || [];
    const hasVideos = videos.length > 0;
    const isOwner =
      isAuthenticated && String(playlist.owner?._id) === String(user?._id);

    // Use first video thumbnail as cover or a gradient fallback
    const coverThumb = hasVideos ? escapeHtml(videos[0].thumbnail || "") : "";

    content.className = "animate-fade-in";
    content.innerHTML = `
      <!-- Playlist Header -->
      <div class="surface-card mb-6 overflow-hidden">
        <div class="flex flex-col sm:flex-row gap-5">
          <!-- Cover thumbnail -->
          <div class="relative w-full sm:w-[240px] aspect-[16/9] sm:aspect-auto sm:h-[135px] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#0A0A0A] to-[#333]">
            ${coverThumb ? `<img src="${coverThumb}" class="h-full w-full object-cover opacity-90" alt="" />` : ""}
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div class="text-center text-white">
                <div class="flex items-center justify-center gap-1.5 text-xs font-semibold">
                  ${icons.play}
                  <span>${videos.length} video${videos.length !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Playlist info -->
          <div class="flex-1 min-w-0 py-1">
            <h1 class="text-xl font-bold text-[#0A0A0A] sm:text-2xl line-clamp-2">${escapeHtml(playlist.name || "Playlist")}</h1>
            ${playlist.description ? `<p class="mt-1.5 text-sm text-[#888] line-clamp-2">${escapeHtml(playlist.description)}</p>` : ""}
            <div class="mt-3 flex items-center gap-2 text-sm text-[#555]">
              ${
                playlist.owner?.avatar
                  ? `<img src="${escapeHtml(playlist.owner.avatar)}" class="h-6 w-6 rounded-full object-cover" alt="" />`
                  : `<div class="h-6 w-6 rounded-full bg-[#0A0A0A] flex items-center justify-center text-[9px] font-bold text-white">${getInitials(playlist.owner?.fullname || "U")}</div>`
              }
              <span class="font-medium">${escapeHtml(playlist.owner?.fullname || "Creator")}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Video List -->
      ${
        hasVideos
          ? `<div class="space-y-1" id="playlist-video-list">
              ${videos.map((v, i) => renderPlaylistItem(v, i, id, isOwner)).join("")}
            </div>`
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

    // Bind 3-dot menu and remove actions
    bindPlaylistActions(id, isOwner);
  } catch (err) {
    content.className =
      "flex min-h-[50vh] flex-col items-center justify-center text-center";
    content.innerHTML = `
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0F0] text-[#FF4444]">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h2 class="text-2xl font-bold text-[#0A0A0A]">Playlist not found</h2>
      <p class="mt-2 text-sm text-[#888]">This playlist may have been deleted or is private.</p>
    `;
  }
}
function bindPlaylistActions(playlistId, isOwner) {
  if (!isOwner) return;

  const emptyHtml =
    '<div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E8E8E8] bg-[#F9F9F9] py-16 px-4 text-center">' +
    '<h2 class="text-xl font-bold text-[#0A0A0A]">No videos left</h2>' +
    '<p class="mt-2 max-w-sm text-sm text-[#888]">All videos have been removed from this playlist.</p>' +
    "</div>";

  // Toggle 3-dot dropdown menus
  document.querySelectorAll(".playlist-item-menu").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const dropdown = btn.nextElementSibling;
      // Close all other dropdowns first
      document.querySelectorAll(".playlist-item-dropdown").forEach((d) => {
        if (d !== dropdown) d.classList.add("hidden");
      });
      dropdown?.classList.toggle("hidden");
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", () => {
    document.querySelectorAll(".playlist-item-dropdown").forEach((d) => {
      d.classList.add("hidden");
    });
  });

  // Remove video from playlist
  document.querySelectorAll(".playlist-remove-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const videoId = btn.dataset.removeVideo;
      if (!videoId) return;

      try {
        await removeVideoFromPlaylist(playlistId, videoId);
        // Remove the item from DOM
        const item = document.querySelector(
          '.playlist-item[data-video-id="' + videoId + '"]',
        );
        if (item) {
          item.style.transition = "opacity 0.3s, transform 0.3s";
          item.style.opacity = "0";
          item.style.transform = "translateX(20px)";
          setTimeout(() => {
            item.remove();
            // Re-number remaining items
            document.querySelectorAll(".playlist-item").forEach((el, i) => {
              const numEl = el.querySelector("span.hidden");
              if (numEl) numEl.textContent = i + 1;
            });
            // Check if list is empty now
            const list = document.getElementById("playlist-video-list");
            if (list && !list.children.length) {
              list.innerHTML = emptyHtml;
            }
          }, 300);
        }
        showToast("Video removed from playlist", "success");
      } catch (err) {
        showToast(err.message || "Failed to remove video", "error");
      }
    });
  });
}
