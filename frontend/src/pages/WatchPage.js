import { getVideoById, getVideos } from "../services/videoService.js";
import { getVideoComments, postComment } from "../services/commentService.js";
import { toggleVideoLike } from "../services/likeService.js";
import { toggleSubscribe } from "../services/subscriptionService.js";
import { getAuthState, requireAuth } from "../context/authContext.js";
import { renderVideoGrid } from "../components/VideoCard.js";
import { renderSpinner, renderEmptyState, showToast } from "../utils/ui.js";
import { formatViews, formatDate, escapeHtml } from "../utils/format.js";

export function WatchPage({ id }) {
  return `<div id="watch-root">${renderSpinner("lg")}</div>`;
}

export async function mountWatchPage(params) {
  const id = params?.id;
  const root = document.getElementById("watch-root");
  if (!root) return;

  try {
    const video = await getVideoById(id);
    const [commentsResult, recommended] = await Promise.all([
      getVideoComments(id).catch(() => ({ docs: [] })),
      getVideos({ limit: 8, sortBy: "createdAt", sortType: "desc" }).catch(() => ({ docs: [] })),
    ]);

    const comments = commentsResult?.docs || commentsResult || [];
    const recVideos = (recommended?.docs || []).filter((v) => v._id !== id).slice(0, 6);
    const { isAuthenticated, user } = getAuthState();
    const isOwner = isAuthenticated && String(user?._id) === String(video.owner);

    root.innerHTML = `
      <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div class="xl:col-span-2 space-y-6">
          <div class="overflow-hidden rounded-2xl border border-surface-border bg-black shadow-card">
            <video id="video-player" class="aspect-video w-full" controls poster="${escapeHtml(video.thumbnail)}" src="${escapeHtml(video.videofile)}"></video>
          </div>
          <div class="surface-card">
            <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">${escapeHtml(video.title)}</h1>
            <div class="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>${formatViews(video.views)} views</span>
              <span>•</span>
              <span>${formatDate(video.createdAt)}</span>
            </div>
            <div class="mt-4 flex flex-wrap gap-3">
              <button id="like-btn" class="btn-secondary gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                Like
              </button>
              ${!isOwner ? `<button id="subscribe-btn" class="btn-primary">Subscribe</button>` : `<span class="badge">Your video</span>`}
            </div>
            <div class="mt-5 rounded-xl bg-surface-muted p-4">
              <p class="text-sm leading-relaxed text-slate-700">${escapeHtml(video.discription || video.description || "")}</p>
            </div>
          </div>

          <div class="surface-card" id="comments-section">
            <h2 class="mb-4 text-lg font-semibold text-slate-900">${comments.length} Comments</h2>
            ${isAuthenticated ? `
              <form id="comment-form" class="mb-6 flex gap-3">
                <input name="contend" required class="input-field flex-1" placeholder="Add a comment..." />
                <button type="submit" class="btn-primary shrink-0">Post</button>
              </form>
            ` : `<p class="mb-4 text-sm text-slate-500"><a href="#/login?redirect=/watch/${id}" class="font-semibold text-brand-600">Sign in</a> to comment</p>`}
            <div id="comments-list" class="space-y-4">
              ${comments.length ? comments.map(renderComment).join("") : `<p class="text-sm text-slate-400">No comments yet. Be the first!</p>`}
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500">Up Next</h2>
          <div class="space-y-3">${recVideos.length ? `<div class="video-grid !grid-cols-1">${renderVideoGrid(recVideos)}</div>` : `<p class="text-sm text-slate-400">No recommendations</p>`}</div>
        </div>
      </div>
    `;

    document.getElementById("like-btn")?.addEventListener("click", async () => {
      if (!requireAuth(`/watch/${id}`)) return;
      try {
        await toggleVideoLike(id);
        showToast("Like updated", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });

    document.getElementById("subscribe-btn")?.addEventListener("click", async () => {
      if (!requireAuth(`/watch/${id}`)) return;
      try {
        const result = await toggleSubscribe(video.owner);
        showToast(result?.subscribed ? "Subscribed!" : "Unsubscribed", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });

    document.getElementById("comment-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = e.target.querySelector('[name="contend"]');
      const text = input?.value?.trim();
      if (!text) return;
      try {
        await postComment(id, text);
        input.value = "";
        showToast("Comment posted", "success");
        mountWatchPage({ id });
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  } catch (err) {
    root.innerHTML = renderEmptyState({
      title: "Video not found",
      description: err.message || "This video may have been removed.",
      actionHtml: `<a href="#/" class="btn-primary">Back to Home</a>`,
    });
  }
}

function renderComment(c) {
  const owner = c.owner || {};
  return `
    <div class="flex gap-3 border-b border-surface-border pb-4 last:border-0">
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
        ${owner.avtar ? `<img src="${escapeHtml(owner.avtar)}" class="h-full w-full rounded-full object-cover" />` : (owner.uname?.[0] || "U").toUpperCase()}
      </div>
      <div>
        <p class="text-sm font-semibold text-slate-800">@${escapeHtml(owner.uname || "user")} <span class="font-normal text-slate-400">${formatDate(c.createdAt)}</span></p>
        <p class="mt-1 text-sm text-slate-600">${escapeHtml(c.contend)}</p>
      </div>
    </div>
  `;
}
