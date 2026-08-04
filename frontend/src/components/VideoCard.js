import {
  formatViews,
  formatDuration,
  escapeHtml,
  formatDate,
} from "../utils/format.js";

export function renderVideoCard(video, ownerOverride = null) {
  const id = video._id;
  const title = escapeHtml(video.title);
  const thumbnail = escapeHtml(video.thumbnail || "");
  const views = formatViews(video.views);
  const duration = formatDuration(video.durationNumber);
  const timeAgo = formatDate(video.createdAt);

  // Prefer embedded ownerDetails (from JOIN), then override arg, then empty fallback
  const owner = video.ownerDetails || ownerOverride || {};
  const ownerName = escapeHtml(owner.fullname || owner.uname || "Creator");
  const ownerAvatar = owner.avatar || null;
  const ownerUname = owner.uname || null;

  return `
    <a href="#/watch/${id}"
      class="group block overflow-hidden bg-transparent transition-all duration-300 hover:opacity-95"
      data-video-card>
      <!-- Thumbnail -->
      <div class="relative aspect-[16/9] overflow-hidden rounded-xl bg-[#F3F3F3]">
        ${
          thumbnail
            ? `<img src="${thumbnail}" alt="${title}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" />`
            : `<div class="flex h-full w-full items-center justify-center bg-[#F3F3F3] text-[#CCCCCC]">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
               </div>`
        }
        <!-- Duration badge -->
        ${
          duration && duration !== "0:00"
            ? `<span class="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-xs font-semibold text-white tracking-wide">${duration}</span>`
            : ""
        }
      </div>

      <!-- Info -->
      <div class="mt-4 pr-4">
        <!-- Title -->
        <h3 class="line-clamp-2 text-base font-semibold leading-snug text-[#0A0A0A] mb-2" title="${title}">${title}</h3>
        
        <!-- Channel Row -->
        <div class="flex items-center gap-2.5 mb-1">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A0A0A] text-xs font-bold text-white">
            ${ownerAvatar ? `<img src="${escapeHtml(ownerAvatar)}" class="h-full w-full object-cover" alt="" />` : ownerName[0].toUpperCase()}
          </div>
          <p class="text-sm font-medium text-[#888] truncate hover:text-[#0A0A0A] transition-colors" title="${ownerName}">${ownerName}</p>
        </div>

        <!-- Metadata Row -->
        <p class="text-sm text-[#888] truncate ml-[42px]">${views} views • ${timeAgo}</p>
      </div>
    </a>
  `;
}

export function renderVideoGrid(videos, ownersMap = {}) {
  if (!videos?.length) return "";
  return videos
    .map((v) => renderVideoCard(v, ownersMap[String(v.owner)] || null))
    .join("");
}
