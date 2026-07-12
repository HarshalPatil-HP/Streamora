import { getVideos } from "../services/videoService.js";
import { renderVideoGrid } from "../components/VideoCard.js";
import { renderSkeletonGrid, renderEmptyState } from "../utils/ui.js";
import { escapeHtml } from "../utils/format.js";

export async function HomePage() {
  const query = new URLSearchParams(window.location.hash.split("?")[1] || "").get("q") || "";

  return `
    <div class="mb-8">
      ${
        query
          ? `
        <div class="flex items-center gap-3 mb-1">
          <a href="#/" class="flex items-center gap-1 text-xs font-medium text-[#888] hover:text-[#0A0A0A] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            All videos
          </a>
        </div>
        <h1 class="page-title">Results for <span class="font-normal text-[#555]">"${escapeHtml(query)}"</span></h1>
        <p class="page-subtitle">Search results from the Streamora library</p>`
          : `
        <div class="flex items-center justify-between">
          <div>
            <h1 class="page-title">Discover</h1>
            <p class="page-subtitle">Trending videos from creators on Streamora</p>
          </div>
          <div class="hidden items-center gap-2 sm:flex">
            <button class="btn-secondary text-xs gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filter
            </button>
          </div>
        </div>`
      }
    </div>
    <div id="home-grid">${renderSkeletonGrid(8)}</div>
  `;
}

export async function mountHomePage() {
  const container = document.getElementById("home-grid");
  if (!container) return;

  const query = new URLSearchParams(window.location.hash.split("?")[1] || "").get("q") || "";

  try {
    const result = await getVideos({
      limit: 20,
      query: query || undefined,
      sortBy: "createdAt",
      sortType: "desc",
    });
    const videos = result?.docs || [];

    if (!videos.length) {
      container.innerHTML = renderEmptyState({
        title: query ? "No videos found" : "No videos yet",
        description: query
          ? "Try a different search term or browse all videos."
          : "Be the first creator to upload content!",
        actionHtml: query
          ? `<a href="#/" class="btn-secondary">Browse All</a>`
          : `<a href="#/signup" class="btn-primary">Become a Creator</a>`,
      });
      return;
    }

    container.innerHTML = `<div class="video-grid">${renderVideoGrid(videos)}</div>`;
  } catch (err) {
    container.innerHTML = renderEmptyState({
      title: "Couldn't load videos",
      description: err.message || "Please check your connection and try again.",
      actionHtml: `<button id="retry-home" class="btn-secondary">Retry</button>`,
    });
    document.getElementById("retry-home")?.addEventListener("click", () => mountHomePage());
  }
}
