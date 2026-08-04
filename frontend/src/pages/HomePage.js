import { getVideos } from "../services/videoService.js";
import { renderVideoGrid } from "../components/VideoCard.js";
import { renderSkeletonGrid, renderEmptyState } from "../utils/ui.js";
import { escapeHtml } from "../utils/format.js";

export async function HomePage() {
  const hashQuery = new URLSearchParams(
    window.location.hash.split("?")[1] || "",
  );
  const query = hashQuery.get("q") || "";
  const sort = hashQuery.get("sort") || "latest";

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
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 class="page-title">Discover</h1>
            <p class="page-subtitle">Videos from creators on Streamora</p>
          </div>
          <!-- Filter pills -->
          <div class="flex items-center gap-2" id="sort-pills">
            <button data-sort="latest"
              class="sort-pill ${sort === "latest" ? "sort-pill-active" : "sort-pill-inactive"} flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Latest
            </button>
            <button data-sort="trending"
              class="sort-pill ${sort === "trending" ? "sort-pill-active" : "sort-pill-inactive"} flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              Trending
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

  const hashQuery = new URLSearchParams(
    window.location.hash.split("?")[1] || "",
  );
  const query = hashQuery.get("q") || "";
  const sort = hashQuery.get("sort") || "latest";

  // Wire up filter pills
  document.querySelectorAll(".sort-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      const newSort = btn.dataset.sort;
      const base = query
        ? `/?q=${encodeURIComponent(query)}&sort=${newSort}`
        : `/?sort=${newSort}`;
      window.location.hash = base;
    });
  });

  try {
    const result = await getVideos({
      limit: 20,
      query: query || undefined,
      sort,
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
    document
      .getElementById("retry-home")
      ?.addEventListener("click", () => mountHomePage());
  }
}
console.log("all set");
