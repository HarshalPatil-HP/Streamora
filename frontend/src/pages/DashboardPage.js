import { getDashboardStats, getDashboardVideos } from "../services/dashboardService.js";
import { publishVideo, deleteVideo, togglePublish } from "../services/videoService.js";
import { getAuthState } from "../context/authContext.js";
import { renderSpinner, renderEmptyState, showToast } from "../utils/ui.js";
import { escapeHtml, formatViews, formatDate } from "../utils/format.js";

export function DashboardPage() {
  const { user } = getAuthState();
  return `
    <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="page-title">Creator Dashboard</h1>
        <p class="page-subtitle">Welcome back, ${escapeHtml(user?.fullname || "Creator")}</p>
      </div>
      <button id="upload-btn" class="btn-primary gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
        Upload Video
      </button>
    </div>

    <div id="dashboard-root">${renderSpinner("lg")}</div>

    <!-- Upload Modal -->
    <div id="upload-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div class="w-full max-w-lg overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-card">
        <!-- Modal header -->
        <div class="flex items-center justify-between border-b border-[#F3F3F3] px-6 py-4">
          <div>
            <h2 class="text-base font-bold text-[#0A0A0A]">Upload Video</h2>
            <p class="text-xs text-[#888]">Fill in the details to publish your video</p>
          </div>
          <button id="close-upload" class="flex h-8 w-8 items-center justify-center rounded-xl text-[#888] hover:bg-[#F3F3F3] hover:text-[#0A0A0A] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <!-- Modal body -->
        <form id="upload-form" class="space-y-4 p-6">
          <div>
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#555]">Title *</label>
            <input name="title" required class="input-field" placeholder="Give your video a great title" />
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#555]">Description *</label>
            <textarea name="description" required class="input-field min-h-[80px] resize-none" placeholder="Tell viewers what your video is about"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#555]">Video File *</label>
              <label class="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-[#E8E8E8] bg-[#F9F9F9] p-4 text-center hover:border-[#0A0A0A]/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2"/></svg>
                <span class="text-[11px] font-medium text-[#888]">Click to upload</span>
                <span class="text-[10px] text-[#ABABAB]">MP4, WebM…</span>
                <input type="file" name="videoFile" accept="video/*" required class="hidden" id="video-file-input" />
              </label>
              <p id="video-file-name" class="mt-1 truncate text-[10px] text-[#888]"></p>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#555]">Thumbnail *</label>
              <label class="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-[#E8E8E8] bg-[#F9F9F9] p-4 text-center hover:border-[#0A0A0A]/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                <span class="text-[11px] font-medium text-[#888]">Click to upload</span>
                <span class="text-[10px] text-[#ABABAB]">JPG, PNG, WebP</span>
                <input type="file" name="thumbnail" accept="image/*" required class="hidden" id="thumbnail-input" />
              </label>
              <p id="thumbnail-name" class="mt-1 truncate text-[10px] text-[#888]"></p>
            </div>
          </div>
          <button type="submit" id="upload-submit" class="btn-primary w-full">
            Publish Video
          </button>
        </form>
      </div>
    </div>
  `;
}

export async function mountDashboardPage() {
  const root = document.getElementById("dashboard-root");
  if (!root) return;

  try {
    const [stats, videosResult] = await Promise.all([
      getDashboardStats(),
      getDashboardVideos(),
    ]);
    const videos = videosResult?.docs || [];

    root.innerHTML = `
      <!-- Stat Cards -->
      <div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        ${statCard("Total Views",    formatViews(stats.totalViews),       eyeIcon(),    "views")}
        ${statCard("Subscribers",    formatViews(stats.totalSubscribers), usersIcon(),  "subs")}
        ${statCard("Videos",         stats.totalVideos,                   videoIcon(),  "videos")}
        ${statCard("Total Likes",    formatViews(stats.totalLikes),       heartIcon(),  "likes")}
      </div>

      <!-- Videos Table -->
      <div class="surface-card overflow-hidden !p-0">
        <div class="flex items-center justify-between border-b border-[#F3F3F3] px-6 py-4">
          <h2 class="font-bold text-[#0A0A0A]">Your Videos</h2>
          <span class="badge">${videos.length} total</span>
        </div>
        ${
          videos.length
            ? `
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-[#F3F3F3] bg-[#F9F9F9]">
                <tr>
                  <th class="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#888]">Title</th>
                  <th class="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#888]">Views</th>
                  <th class="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#888]">Status</th>
                  <th class="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#888]">Date</th>
                  <th class="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#888]">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F3F3F3]">
                ${videos
                  .map(
                    (v) => `
                  <tr class="group hover:bg-[#FAFAFA] transition-colors" data-video-id="${v._id}">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        ${v.thumbnail ? `<img src="${escapeHtml(v.thumbnail)}" class="h-9 w-16 rounded-lg object-cover" alt="" />` : `<div class="h-9 w-16 rounded-lg bg-[#F3F3F3]"></div>`}
                        <span class="font-medium text-[#0A0A0A] line-clamp-1 max-w-[180px]">${escapeHtml(v.title)}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-[#555]">${formatViews(v.views)}</td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${v.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-[#F3F3F3] text-[#888]"}">
                        <span class="h-1.5 w-1.5 rounded-full ${v.isPublished ? "bg-emerald-500" : "bg-[#ABABAB]"}"></span>
                        ${v.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-[#888] text-xs">${formatDate(v.createdAt)}</td>
                    <td class="px-6 py-4">
                      <div class="flex gap-2">
                        <button data-action="toggle" class="rounded-lg border border-[#E8E8E8] bg-white px-3 py-1.5 text-xs font-medium text-[#555] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-all">
                          ${v.isPublished ? "Unpublish" : "Publish"}
                        </button>
                        <button data-action="delete" class="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-100 transition-all">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>`
            : renderEmptyState({
                title: "No videos yet",
                description: "Upload your first video to get started.",
                actionHtml: `<button id="upload-empty-btn" class="btn-primary">Upload Video</button>`,
              })
        }
      </div>
    `;

    root.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const row     = btn.closest("[data-video-id]");
        const videoId = row?.dataset.videoId;
        if (!videoId) return;

        if (btn.dataset.action === "delete") {
          if (!confirm("Are you sure you want to delete this video? This cannot be undone.")) return;
          btn.textContent = "Deleting…";
          btn.disabled    = true;
          try {
            await deleteVideo(videoId);
            showToast("Video deleted", "success");
            mountDashboardPage();
          } catch (err) {
            showToast(err.message, "error");
            btn.disabled    = false;
            btn.textContent = "Delete";
          }
        } else {
          btn.disabled    = true;
          btn.textContent = "Updating…";
          try {
            await togglePublish(videoId);
            showToast("Publish status updated", "success");
            mountDashboardPage();
          } catch (err) {
            showToast(err.message, "error");
            btn.disabled = false;
          }
        }
      });
    });

    bindUploadModal();
    document.getElementById("upload-empty-btn")?.addEventListener("click", openUploadModal);
  } catch (err) {
    root.innerHTML = renderEmptyState({
      title: "Dashboard error",
      description: err.message || "Failed to load dashboard data.",
    });
  }
}

function statCard(label, value, iconSvg, id) {
  return `
    <div class="surface-card hover:shadow-card transition-shadow" id="stat-${id}">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-[#888]">${label}</p>
          <p class="mt-2 text-3xl font-bold tracking-tight text-[#0A0A0A]">${value}</p>
        </div>
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F3F3] text-[#555]">
          ${iconSvg}
        </div>
      </div>
    </div>`;
}

function eyeIcon()   { return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`; }
function usersIcon() { return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`; }
function videoIcon() { return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2"/></svg>`; }
function heartIcon() { return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`; }

function openUploadModal() {
  const modal = document.getElementById("upload-modal");
  modal?.classList.remove("hidden");
  modal?.classList.add("flex");
}

function bindUploadModal() {
  const modal = document.getElementById("upload-modal");
  const form  = document.getElementById("upload-form");

  document.getElementById("upload-btn")?.addEventListener("click", openUploadModal);

  document.getElementById("close-upload")?.addEventListener("click", () => {
    modal?.classList.add("hidden");
    modal?.classList.remove("flex");
  });

  // Click outside to close
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  });

  // Show file names
  document.getElementById("video-file-input")?.addEventListener("change", (e) => {
    const el = document.getElementById("video-file-name");
    if (el) el.textContent = e.target.files[0]?.name || "";
  });
  document.getElementById("thumbnail-input")?.addEventListener("change", (e) => {
    const el = document.getElementById("thumbnail-name");
    if (el) el.textContent = e.target.files[0]?.name || "";
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("upload-submit");
    btn.disabled    = true;
    btn.textContent = "Uploading… please wait";

    try {
      const fd = new FormData(form);
      await publishVideo(fd);
      showToast("Video published!", "success");
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      form.reset();
      document.getElementById("video-file-name").textContent = "";
      document.getElementById("thumbnail-name").textContent  = "";
      mountDashboardPage();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      btn.disabled    = false;
      btn.textContent = "Publish Video";
    }
  });
}
