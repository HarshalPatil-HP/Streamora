import { formatViews, formatDuration, escapeHtml } from "../utils/format.js";

export function renderVideoCard(video, owner = null) {
  const id = video._id;
  const title = escapeHtml(video.title);
  const thumbnail = escapeHtml(video.thumbnail);
  const views = formatViews(video.views);
  const duration = formatDuration(video.durationNumber);
  const ownerName = owner ? escapeHtml(owner.fullname || owner.uname) : "Creator";
  const ownerAvatar = owner?.avtar;

  return `
    <a href="#/watch/${id}" class="group block overflow-hidden rounded-2xl border border-surface-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card" data-video-card>
      <div class="relative aspect-video overflow-hidden bg-slate-100">
        <img src="${thumbnail}" alt="${title}" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        <span class="absolute bottom-2 right-2 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-xs font-medium text-white">${duration}</span>
      </div>
      <div class="flex gap-3 p-4">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-xs font-bold text-brand-700">
          ${ownerAvatar ? `<img src="${escapeHtml(ownerAvatar)}" class="h-full w-full object-cover" alt="" />` : ownerName[0]}
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-brand-600">${title}</h3>
          <p class="mt-1 text-xs text-slate-500">${ownerName}</p>
          <p class="text-xs text-slate-400">${views} views</p>
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
