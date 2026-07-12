import { getVideos } from "../services/videoService.js";
import { renderVideoGrid } from "../components/VideoCard.js";
import { renderSkeletonGrid, renderEmptyState } from "../utils/ui.js";
import { escapeHtml } from "../utils/format.js";

export async function HomePage() {
  const query = new URLSearchParams(window.location.hash.split("?")[1] || "").get("q") || "";

  return `
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-900">${query ? `Results for "${escapeHtml(query)}"` : "Discover"}</h1>
      <p class="mt-1 text-sm text-slate-500">${query ? "Search results from our library" : "Trending videos from creators on Streamora"}</p>
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
        description: query ? "Try a different search term." : "Be the first creator to upload content!",
        actionHtml: `<a href="#/signup" class="btn-primary">Become a Creator</a>`,
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
