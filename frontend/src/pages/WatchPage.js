import { getVideoById, getVideos } from "../services/videoService.js";
import { getVideoComments, postComment } from "../services/commentService.js";
import { toggleVideoLike } from "../services/likeService.js";
import { toggleSubscribe } from "../services/subscriptionService.js";
import { getAuthState, requireAuth } from "../context/authContext.js";
import { renderVideoGrid } from "../components/VideoCard.js";
import { renderSpinner, renderEmptyState, showToast } from "../utils/ui.js";
import { formatViews, formatDate, escapeHtml, getInitials } from "../utils/format.js";

export function WatchPage({ id }) {
  return `<div id="watch-root">${renderSpinner("lg")}</div>`;
}

export async function mountWatchPage(params) {
  const id   = params?.id;
  const root = document.getElementById("watch-root");
  if (!root) return;

  try {
    const video = await getVideoById(id);
    const [commentsResult, recommended] = await Promise.all([
      getVideoComments(id).catch(() => ({ docs: [] })),
      getVideos({ limit: 8, sortBy: "createdAt", sortType: "desc" }).catch(() => ({ docs: [] })),
    ]);

    const comments  = commentsResult?.docs || commentsResult || [];
    const recVideos = (recommended?.docs || []).filter((v) => v._id !== id).slice(0, 6);
    const { isAuthenticated, user } = getAuthState();
    const isOwner = isAuthenticated && String(user?._id) === String(video.owner);
    const description = video.discription || video.description || "";

    root.innerHTML = `
      <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">

        <!-- ── Left: Player + Info ─────────────────────── -->
        <div class="xl:col-span-2 space-y-4">

          <!-- Player -->
          <div class="overflow-hidden rounded-2xl bg-black shadow-card">
            <video id="video-player" class="aspect-video w-full" controls
              poster="${escapeHtml(video.thumbnail)}"
              src="${escapeHtml(video.videofile)}">
            </video>
          </div>

          <!-- Video info card -->
          <div class="surface-card space-y-4">
            <h1 class="text-xl font-bold leading-tight text-[#0A0A0A] sm:text-2xl">${escapeHtml(video.title)}</h1>

            <!-- Meta + Actions row -->
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#F3F3F3] pb-4">
              <div class="flex items-center gap-3 text-xs text-[#888]">
                <span class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  ${formatViews(video.views)} views
                </span>
                <span>·</span>
                <span>${formatDate(video.createdAt)}</span>
              </div>
              <div class="flex items-center gap-2">
                <button id="like-btn" class="btn-secondary gap-2 text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  Like
                </button>
                ${!isOwner
                  ? `<button id="subscribe-btn" class="btn-primary text-xs">Subscribe</button>`
                  : `<span class="badge">Your video</span>`
                }
              </div>
            </div>

            <!-- Description -->
            ${description ? `
              <details class="group">
                <summary class="cursor-pointer list-none">
                  <div class="flex items-center gap-2 text-sm font-medium text-[#555] hover:text-[#0A0A0A] transition-colors">
                    <span>Description</span>
                    <svg class="transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </summary>
                <p class="mt-3 rounded-xl bg-[#F9F9F9] p-4 text-sm leading-relaxed text-[#444]">${escapeHtml(description)}</p>
              </details>
            ` : ""}
          </div>

          <!-- Comments -->
          <div class="surface-card" id="comments-section">
            <h2 class="mb-5 text-base font-bold text-[#0A0A0A]">
              ${comments.length} Comment${comments.length !== 1 ? "s" : ""}
            </h2>
            ${isAuthenticated ? `
              <form id="comment-form" class="mb-6 flex gap-3">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A0A0A] text-white text-xs font-bold">
                  ${user.avtar ? `<img src="${escapeHtml(user.avtar)}" class="h-full w-full object-cover rounded-full" />` : getInitials(user.fullname || user.uname)}
                </div>
                <div class="flex flex-1 gap-2">
                  <input name="contend" required class="input-field flex-1" placeholder="Add a comment…" />
                  <button type="submit" class="btn-primary shrink-0 text-xs">Post</button>
                </div>
              </form>
            ` : `
              <div class="mb-5 rounded-xl border border-[#E8E8E8] bg-[#F9F9F9] p-4 text-sm text-[#555]">
                <a href="#/login?redirect=/watch/${id}" class="font-semibold text-[#0A0A0A] underline underline-offset-2">Sign in</a> to join the conversation
              </div>`}
            <div id="comments-list" class="space-y-5">
              ${comments.length
                ? comments.map(renderComment).join("")
                : `<p class="py-4 text-center text-sm text-[#ABABAB]">No comments yet. Start the conversation!</p>`}
            </div>
          </div>
        </div>

        <!-- ── Right: Recommendations ──────────────────── -->
        <div class="space-y-4">
          <h2 class="text-xs font-semibold uppercase tracking-widest text-[#888]">Up Next</h2>
          ${recVideos.length
            ? `<div class="video-grid !grid-cols-1">${renderVideoGrid(recVideos)}</div>`
            : `<p class="rounded-xl bg-white border border-[#E8E8E8] p-4 text-sm text-[#ABABAB]">No recommendations available</p>`}
        </div>
      </div>
    `;

    // ── Like ──────────────────────────────────────────
    document.getElementById("like-btn")?.addEventListener("click", async () => {
      if (!requireAuth(`/watch/${id}`)) return;
      try {
        await toggleVideoLike(id);
        showToast("Like updated!", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });

    // ── Subscribe ─────────────────────────────────────
    document.getElementById("subscribe-btn")?.addEventListener("click", async () => {
      if (!requireAuth(`/watch/${id}`)) return;
      try {
        const result = await toggleSubscribe(video.owner);
        const btn = document.getElementById("subscribe-btn");
        if (btn) btn.textContent = result?.subscribed ? "Subscribed" : "Subscribe";
        showToast(result?.subscribed ? "Subscribed!" : "Unsubscribed", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });

    // ── Comment ───────────────────────────────────────
    document.getElementById("comment-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = e.target.querySelector('[name="contend"]');
      const text  = input?.value?.trim();
      if (!text) return;
      const btn = e.target.querySelector("button[type='submit']");
      if (btn) { btn.disabled = true; btn.textContent = "Posting…"; }
      try {
        await postComment(id, text);
        input.value = "";
        showToast("Comment posted!", "success");
        mountWatchPage({ id });
      } catch (err) {
        showToast(err.message, "error");
        if (btn) { btn.disabled = false; btn.textContent = "Post"; }
      }
    });

  } catch (err) {
    root.innerHTML = renderEmptyState({
      title: "Video not found",
      description: err.message || "This video may have been removed or is unavailable.",
      actionHtml: `<a href="#/" class="btn-primary">Back to Home</a>`,
    });
  }
}

function renderComment(c) {
  const owner = c.owner || {};
  return `
    <div class="flex gap-3">
      <div class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A0A0A] text-xs font-bold text-white">
        ${owner.avtar
          ? `<img src="${escapeHtml(owner.avtar)}" class="h-full w-full rounded-full object-cover" />`
          : (owner.uname?.[0] || "U").toUpperCase()}
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm">
          <span class="font-semibold text-[#0A0A0A]">@${escapeHtml(owner.uname || "user")}</span>
          <span class="ml-2 text-xs text-[#ABABAB]">${formatDate(c.createdAt)}</span>
        </p>
        <p class="mt-1 text-sm leading-relaxed text-[#333]">${escapeHtml(c.contend)}</p>
      </div>
    </div>
  `;
}
