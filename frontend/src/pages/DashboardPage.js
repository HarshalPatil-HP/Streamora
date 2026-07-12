import { getDashboardStats, getDashboardVideos } from "../services/dashboardService.js";
import { publishVideo, deleteVideo, togglePublish } from "../services/videoService.js";
import { getAuthState } from "../context/authContext.js";
import { renderSpinner, renderEmptyState, showToast } from "../utils/ui.js";
import { escapeHtml, formatViews, formatDate } from "../utils/format.js";

export function DashboardPage() {
  const { user } = getAuthState();
  return `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Creator Dashboard</h1>
        <p class="mt-1 text-sm text-slate-500">Welcome back, ${escapeHtml(user?.fullname || "Creator")}</p>
      </div>
      <button id="upload-btn" class="btn-primary gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
        Upload Video
      </button>
    </div>
    <div id="dashboard-root">${renderSpinner("lg")}</div>

    <div id="upload-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
      <div class="glass-card w-full max-w-lg p-6">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900">Upload Video</h2>
          <button id="close-upload" class="btn-ghost">✕</button>
        </div>
        <form id="upload-form" class="space-y-4">
          <input name="title" required class="input-field" placeholder="Video title" />
          <textarea name="description" required class="input-field min-h-[80px] resize-none" placeholder="Description"></textarea>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Video File</label>
            <input type="file" name="videoFile" accept="video/*" required class="input-field py-2" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Thumbnail</label>
            <input type="file" name="thumbnail" accept="image/*" required class="input-field py-2" />
          </div>
          <button type="submit" id="upload-submit" class="btn-primary w-full">Publish</button>
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
      <div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        ${statCard("Total Views", formatViews(stats.totalViews), "👁")}
        ${statCard("Subscribers", formatViews(stats.totalSubscribers), "👥")}
        ${statCard("Videos", stats.totalVideos, "🎬")}
        ${statCard("Total Likes", formatViews(stats.totalLikes), "❤")}
      </div>

      <div class="surface-card overflow-hidden !p-0">
        <div class="border-b border-surface-border px-6 py-4">
          <h2 class="font-semibold text-slate-900">Your Videos</h2>
        </div>
        ${videos.length ? `
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-surface-muted text-xs uppercase text-slate-500">
                <tr>
                  <th class="px-6 py-3">Title</th>
                  <th class="px-6 py-3">Views</th>
                  <th class="px-6 py-3">Status</th>
                  <th class="px-6 py-3">Date</th>
                  <th class="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-border">
                ${videos.map((v) => `
                  <tr class="hover:bg-surface-muted/50" data-video-id="${v._id}">
                    <td class="px-6 py-4 font-medium text-slate-800">${escapeHtml(v.title)}</td>
                    <td class="px-6 py-4 text-slate-500">${formatViews(v.views)}</td>
                    <td class="px-6 py-4"><span class="badge">${v.isPublished ? "Published" : "Draft"}</span></td>
                    <td class="px-6 py-4 text-slate-500">${formatDate(v.createdAt)}</td>
                    <td class="px-6 py-4">
                      <div class="flex gap-2">
                        <button data-action="toggle" class="btn-ghost text-xs">Toggle</button>
                        <button data-action="delete" class="btn-ghost text-xs text-red-500">Delete</button>
                      </div>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : renderEmptyState({ title: "No videos uploaded", description: "Upload your first video to get started.", actionHtml: `<button id="upload-empty-btn" class="btn-primary">Upload Video</button>` })}
      </div>
    `;

    root.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const row = btn.closest("[data-video-id]");
        const videoId = row?.dataset.videoId;
        if (!videoId) return;

        if (btn.dataset.action === "delete") {
          if (!confirm("Delete this video?")) return;
          try {
            await deleteVideo(videoId);
            showToast("Video deleted", "success");
            mountDashboardPage();
          } catch (err) {
            showToast(err.message, "error");
          }
        } else {
          try {
            await togglePublish(videoId);
            showToast("Publish status updated", "success");
            mountDashboardPage();
          } catch (err) {
            showToast(err.message, "error");
          }
        }
      });
    });

    bindUploadModal();
    document.getElementById("upload-empty-btn")?.addEventListener("click", openUploadModal);
  } catch (err) {
    root.innerHTML = renderEmptyState({ title: "Dashboard error", description: err.message });
  }
}

function statCard(label, value, icon) {
  return `
    <div class="surface-card">
      <div class="flex items-center justify-between">
        <p class="text-sm text-slate-500">${label}</p>
        <span class="text-lg">${icon}</span>
      </div>
      <p class="mt-2 text-2xl font-bold text-slate-900">${value}</p>
    </div>
  `;
}

function openUploadModal() {
  const modal = document.getElementById("upload-modal");
  modal?.classList.remove("hidden");
  modal?.classList.add("flex");
}

function bindUploadModal() {
  const modal = document.getElementById("upload-modal");
  const form = document.getElementById("upload-form");

  document.getElementById("upload-btn")?.addEventListener("click", openUploadModal);
  document.getElementById("close-upload")?.addEventListener("click", () => {
    modal?.classList.add("hidden");
    modal?.classList.remove("flex");
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("upload-submit");
    btn.disabled = true;
    btn.textContent = "Uploading...";

    try {
      const fd = new FormData(form);
      await publishVideo(fd);
      showToast("Video published!", "success");
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      form.reset();
      mountDashboardPage();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Publish";
    }
  });
}
