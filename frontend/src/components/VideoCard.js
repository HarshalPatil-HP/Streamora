import { formatViews, formatDuration, escapeHtml, formatDate } from "../utils/format.js";

export function renderVideoCard(video, owner = null) {
  const id        = video._id;
  const title     = escapeHtml(video.title);
  const thumbnail = escapeHtml(video.thumbnail || "");
  const views     = formatViews(video.views);
  const duration  = formatDuration(video.durationNumber);
  const ownerName = owner ? escapeHtml(owner.fullname || owner.uname) : "Creator";
  const ownerAvatar = owner?.avtar;
  const timeAgo   = formatDate(video.createdAt);

  return `
    <a href="#/watch/${id}"
      class="group block overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D0D0D0] hover:shadow-card"
      data-video-card>
      <!-- Thumbnail -->
      <div class="relative aspect-video overflow-hidden bg-[#F3F3F3]">
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
            ? `<span class="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-xs font-semibold text-white">${duration}</span>`
            : ""
        }
        <!-- Hover overlay -->
        <div class="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20">
          <div class="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-white/90 text-[#0A0A0A] opacity-0 shadow-card backdrop-blur-sm transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
      </div>

      <!-- Info -->
      <div class="flex gap-3 p-4">
        <!-- Owner avatar -->
        <div class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A0A0A] text-xs font-bold text-white">
          ${ownerAvatar ? `<img src="${escapeHtml(ownerAvatar)}" class="h-full w-full object-cover" alt="" />` : ownerName[0].toUpperCase()}
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="line-clamp-2 text-sm font-semibold leading-snug text-[#0A0A0A] transition-colors group-hover:text-[#333]">${title}</h3>
          <p class="mt-1.5 text-xs font-medium text-[#888]">${ownerName}</p>
          <p class="text-xs text-[#ABABAB]">${views} views · ${timeAgo}</p>
        </div>
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
