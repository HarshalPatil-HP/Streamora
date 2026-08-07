import { getVideoById, getVideos } from "../services/videoService.js";
import { getVideoComments, postComment } from "../services/commentService.js";
import {
  toggleVideoLike,
  getVideoLikeStatus,
  toggleCommentLike,
} from "../services/likeService.js";
import { toggleSubscribe } from "../services/subscriptionService.js";
import { getChannelProfile } from "../services/authService.js";
import {
  getUserPlaylists,
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
} from "../services/playlistService.js";
import { getAuthState, requireAuth } from "../context/authContext.js";
import { renderVideoGrid } from "../components/VideoCard.js";
import { renderSpinner, renderEmptyState, showToast } from "../utils/ui.js";
import {
  formatViews,
  formatDate,
  escapeHtml,
  getInitials,
} from "../utils/format.js";

export function WatchPage({ id }) {
  return `<div id="watch-root">${renderSpinner("lg")}</div>`;
}

export async function mountWatchPage(params) {
  const id = params?.id;
  const root = document.getElementById("watch-root");
  if (!root) return;

  try {
    const { isAuthenticated, user } = getAuthState();

    const [video, commentsResult, recommended, likeStatus] = await Promise.all([
      getVideoById(id),
      getVideoComments(id).catch(() => ({ docs: [] })),
      getVideos({ limit: 8, sort: "latest" }).catch(() => ({ docs: [] })),
      isAuthenticated
        ? getVideoLikeStatus(id).catch(() => ({ liked: false, likeCount: 0 }))
        : Promise.resolve({ liked: false, likeCount: 0 }),
    ]);

    const videoOwner = video.ownerDetails || {};

    let channelData = null;
    if (videoOwner.uname) {
      channelData = await getChannelProfile(videoOwner.uname).catch(() => null);
    }

    const comments = commentsResult?.docs || commentsResult || [];
    const recVideos = (recommended?.docs || [])
      .filter((v) => v._id !== id)
      .slice(0, 6);
    const isOwner =
      isAuthenticated &&
      String(user?._id) === String(video.owner?._id || video.owner);
    const description = video.discription || video.description || "";
    const isLiked = likeStatus?.liked || false;
    const likeCount = likeStatus?.likeCount || 0;
    const isSubscribed = channelData?.issubscribed || false;
    const subscribersCount = channelData?.subscribersCount || 0;

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

            <!-- Creator row -->
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <a href="${videoOwner.uname ? `/channel/${escapeHtml(videoOwner.uname)}` : "#"}" class="flex items-center gap-3 group min-w-0">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A0A0A] text-xs font-bold text-white">
                  ${videoOwner.avatar ? `<img src="${escapeHtml(videoOwner.avatar)}" class="h-full w-full object-cover" alt="" />` : getInitials(videoOwner.fullname || videoOwner.uname || "C")}
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-[#0A0A0A] group-hover:text-[#555] transition-colors truncate">${escapeHtml(videoOwner.fullname || videoOwner.uname || "Creator")}</p>
                  <p class="text-xs text-[#888]">${videoOwner.uname ? `@${escapeHtml(videoOwner.uname)}` : ""} ${subscribersCount > 0 ? `• ${formatViews(subscribersCount)} subscribers` : ""}</p>
                </div>
              </a>
              ${
                !isOwner
                  ? `<button id="subscribe-btn" class="${isSubscribed ? "btn-secondary" : "btn-primary"} text-xs shrink-0">${isSubscribed ? "Subscribed" : "Subscribe"}</button>`
                  : `<span class="badge">Your video</span>`
              }
            </div>

            <!-- Meta + Actions row -->
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#F3F3F3] pb-4">
              <div class="flex items-center gap-3 text-xs text-[#888]">
                <span class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <span id="view-count">${formatViews(video.views)}</span> views
                </span>
                <span>·</span>
                <span>${formatDate(video.createdAt)}</span>
              </div>
              <div class="flex items-center gap-2">
                <button id="like-btn" class="${isLiked ? "btn-liked" : "btn-secondary"} gap-2 text-xs" data-liked="${isLiked}">
                  <svg id="like-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                    fill="${isLiked ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                  <span id="like-label">${isLiked ? "Liked" : "Like"}</span>
                  ${likeCount > 0 ? `<span id="like-count" class="${isLiked ? "text-red-400" : "text-[#ABABAB]"}">${formatViews(likeCount)}</span>` : `<span id="like-count" class="text-[#ABABAB]"></span>`}
                </button>
                <button id="save-playlist-btn" class="btn-secondary gap-2 text-xs" title="Save to playlist">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  Save
                </button>
              </div>
            </div>

            <!-- Description -->
            ${
              description
                ? `
              <details class="group">
                <summary class="cursor-pointer list-none">
                  <div class="flex items-center gap-2 text-sm font-medium text-[#555] hover:text-[#0A0A0A] transition-colors">
                    <span>Description</span>
                    <svg class="transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </summary>
                <p class="mt-3 rounded-xl bg-[#F9F9F9] p-4 text-sm leading-relaxed text-[#444]">${escapeHtml(description)}</p>
              </details>
            `
                : ""
            }
          </div>

          <!-- Comments -->
          <div class="surface-card" id="comments-section">
            <h2 class="mb-5 text-base font-bold text-[#0A0A0A]">
              ${comments.length} Comment${comments.length !== 1 ? "s" : ""}
            </h2>
            ${
              isAuthenticated
                ? `
              <form id="comment-form" class="mb-6 flex gap-3">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A0A0A] text-white text-xs font-bold">
                  ${user.avatar ? `<img src="${escapeHtml(user.avatar)}" class="h-full w-full object-cover rounded-full" />` : getInitials(user.fullname || user.uname)}
                </div>
                <div class="flex flex-1 gap-2">
                  <input name="contend" required class="input-field flex-1" placeholder="Add a comment…" />
                  <button type="submit" class="btn-primary shrink-0 text-xs">Post</button>
                </div>
              </form>
            `
                : `
              <div class="mb-5 rounded-xl border border-[#E8E8E8] bg-[#F9F9F9] p-4 text-sm text-[#555]">
                <a href="/login?redirect=/watch/${id}" class="font-semibold text-[#0A0A0A] underline underline-offset-2">Sign in</a> to join the conversation
              </div>`
            }
            <div id="comments-list" class="space-y-5">
              ${
                comments.length
                  ? comments
                      .map((c) => renderComment(c, isAuthenticated))
                      .join("")
                  : `<p class="py-4 text-center text-sm text-[#ABABAB]">No comments yet. Start the conversation!</p>`
              }
            </div>
          </div>
        </div>

        <!-- ── Right: Recommendations ──────────────────── -->
        <div class="space-y-4">
          <h2 class="text-xs font-semibold uppercase tracking-widest text-[#888]">Up Next</h2>
          ${
            recVideos.length
              ? `<div class="video-grid !grid-cols-1">${renderVideoGrid(recVideos)}</div>`
              : `<p class="rounded-xl bg-white border border-[#E8E8E8] p-4 text-sm text-[#ABABAB]">No recommendations available</p>`
          }
        </div>
      </div>

      <!-- Playlist Modal (hidden by default) -->
      <div id="playlist-modal" class="playlist-modal-overlay hidden">
        <div class="w-full max-w-sm overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-card">
          <div class="flex items-center justify-between border-b border-[#F3F3F3] px-5 py-4">
            <h3 class="font-bold text-[#0A0A0A]">Save to playlist</h3>
            <button id="playlist-modal-close" class="flex h-7 w-7 items-center justify-center rounded-lg text-[#888] hover:bg-[#F3F3F3]">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div id="playlist-list" class="max-h-60 overflow-y-auto p-2">${renderSpinner("sm")}</div>
          <div class="border-t border-[#F3F3F3] p-4">
            <button id="show-new-playlist-form-btn" class="flex items-center gap-2 text-sm font-medium text-[#0A0A0A] hover:text-[#555] transition-colors w-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create new playlist
            </button>
            <form id="new-playlist-form" class="hidden flex-col gap-2 mt-2">
              <input name="name" required placeholder="Name..." class="input-field w-full text-xs py-2" />
              <textarea name="description" placeholder="Description (optional)..." rows="2" class="input-field w-full text-xs py-2 resize-none"></textarea>
              <div class="flex justify-end mt-1">
                <button type="submit" class="btn-primary text-xs py-1.5 px-3">Create</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // ── Like button (with visual state) ───────────────────
    const likeBtn = document.getElementById("like-btn");
    likeBtn?.addEventListener("click", async () => {
      if (!requireAuth(`/watch/${id}`)) return;
      const wasLiked = likeBtn.dataset.liked === "true";
      const icon = document.getElementById("like-icon");
      const label = document.getElementById("like-label");
      const count = document.getElementById("like-count");

      // Optimistic update
      const newLiked = !wasLiked;
      likeBtn.dataset.liked = String(newLiked);
      likeBtn.className = newLiked
        ? "btn-liked gap-2 text-xs"
        : "btn-secondary gap-2 text-xs";
      if (icon) icon.setAttribute("fill", newLiked ? "currentColor" : "none");
      if (label) label.textContent = newLiked ? "Liked" : "Like";

      try {
        const result = await toggleVideoLike(id);
        // Reconcile with server
        const serverLiked = result?.liked ?? newLiked;
        const serverCount = result?.likeCount ?? 0;
        likeBtn.dataset.liked = String(serverLiked);
        likeBtn.className = serverLiked
          ? "btn-liked gap-2 text-xs"
          : "btn-secondary gap-2 text-xs";
        if (icon)
          icon.setAttribute("fill", serverLiked ? "currentColor" : "none");
        if (label) label.textContent = serverLiked ? "Liked" : "Like";
        if (count) {
          count.textContent = serverCount > 0 ? formatViews(serverCount) : "";
          count.className = serverLiked ? "text-red-400" : "text-[#ABABAB]";
        }
        showToast(serverLiked ? "Liked!" : "Unliked", "success");
      } catch (err) {
        // Rollback
        likeBtn.dataset.liked = String(wasLiked);
        likeBtn.className = wasLiked
          ? "btn-liked gap-2 text-xs"
          : "btn-secondary gap-2 text-xs";
        if (icon) icon.setAttribute("fill", wasLiked ? "currentColor" : "none");
        if (label) label.textContent = wasLiked ? "Liked" : "Like";
        showToast(err.message, "error");
      }
    });

    // ── Subscribe ─────────────────────────────────────────
    document
      .getElementById("subscribe-btn")
      ?.addEventListener("click", async () => {
        if (!requireAuth(`/watch/${id}`)) return;
        try {
          const result = await toggleSubscribe(video.owner?._id || video.owner);
          const btn = document.getElementById("subscribe-btn");
          if (btn) {
            btn.textContent = result?.subscribed ? "Subscribed" : "Subscribe";
            btn.className = result?.subscribed
              ? "btn-secondary text-xs shrink-0"
              : "btn-primary text-xs shrink-0";
          }
          showToast(
            result?.subscribed ? "Subscribed!" : "Unsubscribed",
            "success",
          );
        } catch (err) {
          showToast(err.message, "error");
        }
      });

    // ── Comment likes ─────────────────────────────────────
    document
      .getElementById("comments-list")
      ?.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-like-comment]");
        if (!btn) return;
        if (!requireAuth(`/watch/${id}`)) return;
        const commentId = btn.dataset.likeComment;
        const icon = btn.querySelector(".comment-like-icon");
        const count = btn.querySelector(".comment-like-count");
        const wasLiked = btn.dataset.liked === "true";

        // Optimistic
        const newLiked = !wasLiked;
        btn.dataset.liked = String(newLiked);
        if (icon) icon.setAttribute("fill", newLiked ? "currentColor" : "none");
        btn.classList.toggle("text-red-500", newLiked);

        try {
          const result = await toggleCommentLike(commentId);
          btn.dataset.liked = String(result.liked);
          if (icon)
            icon.setAttribute("fill", result.liked ? "currentColor" : "none");
          btn.classList.toggle("text-red-500", result.liked);
          if (count)
            count.textContent = result.likeCount > 0 ? result.likeCount : "";
        } catch (err) {
          // Rollback
          btn.dataset.liked = String(wasLiked);
          if (icon)
            icon.setAttribute("fill", wasLiked ? "currentColor" : "none");
          btn.classList.toggle("text-red-500", wasLiked);
          showToast(err.message, "error");
        }
      });

    // ── Comment submit ────────────────────────────────────
    const commentForm = document.getElementById("comment-form");
    if (commentForm) {
      commentForm.onsubmit = async (e) => {
        e.preventDefault();
        const input = e.target.querySelector('[name="contend"]');
        const text = input?.value?.trim();
        if (!text) return;
        const btn = e.target.querySelector("button[type='submit']");
        if (btn) {
          if (btn.disabled) return;
          btn.disabled = true;
          btn.textContent = "Posting…";
        }
        try {
          await postComment(id, text);
          input.value = "";
          showToast("Comment posted!", "success");
          mountWatchPage({ id });
        } catch (err) {
          showToast(err.message, "error");
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Post";
          }
        }
      };
    }

    // ── Save to Playlist ──────────────────────────────────
    document
      .getElementById("save-playlist-btn")
      ?.addEventListener("click", async () => {
        if (!requireAuth(`/watch/${id}`)) return;
        const modal = document.getElementById("playlist-modal");
        modal?.classList.remove("hidden");
        await loadPlaylistModal(id);
      });

    document
      .getElementById("playlist-modal-close")
      ?.addEventListener("click", () => {
        document.getElementById("playlist-modal")?.classList.add("hidden");
      });

    document
      .getElementById("playlist-modal")
      ?.addEventListener("click", (e) => {
        if (e.target.id === "playlist-modal") {
          e.currentTarget.classList.add("hidden");
        }
      });

    document
      .getElementById("show-new-playlist-form-btn")
      ?.addEventListener("click", (e) => {
        e.target.classList.add("hidden");
        const form = document.getElementById("new-playlist-form");
        if (form) form.classList.remove("hidden");
        if (form) form.classList.add("flex");
      });

    const playlistForm = document.getElementById("new-playlist-form");
    if (playlistForm) {
      playlistForm.onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(playlistForm);
        const name = fd.get("name")?.toString().trim();
        const description = fd.get("description")?.toString().trim();
        if (!name) return;

        const btn = playlistForm.querySelector("button[type='submit']");
        if (btn && btn.disabled) return;
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Creating...";
        }

        try {
          await createPlaylist({ name, description });
          playlistForm.reset();
          playlistForm.classList.add("hidden");
          document
            .getElementById("show-new-playlist-form-btn")
            ?.classList.remove("hidden");
          showToast("Playlist created", "success");
          await loadPlaylistModal(id);
        } catch (err) {
          showToast(err.message, "error");
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Create";
          }
        }
      };
    }
  } catch (err) {
    root.innerHTML = renderEmptyState({
      title: "Video not found",
      description:
        err.message || "This video may have been removed or is unavailable.",
      actionHtml: `<a href="/" class="btn-primary">Back to Home</a>`,
    });
  }
}

async function loadPlaylistModal(videoId) {
  const { user } = getAuthState();
  const listEl = document.getElementById("playlist-list");
  if (!listEl) return;
  listEl.innerHTML = renderSpinner("sm");

  try {
    const playlists = await getUserPlaylists(user._id);
    const list = Array.isArray(playlists) ? playlists : [];

    if (!list.length) {
      listEl.innerHTML = `<p class="py-4 text-center text-sm text-[#888]">No playlists yet. Create one below!</p>`;
      return;
    }

    listEl.innerHTML = list
      .map((pl) => {
        const hasVideo = pl.videos?.some(
          (v) =>
            String(v) === String(videoId) || String(v?._id) === String(videoId),
        );
        return `
        <label class="flex items-center gap-3 rounded-xl p-3 cursor-pointer hover:bg-[#F9F9F9] transition-colors">
          <input type="checkbox" class="playlist-check h-4 w-4 rounded accent-[#0A0A0A]"
            data-playlist-id="${pl._id}" ${hasVideo ? "checked" : ""} />
          <span class="text-sm font-medium text-[#0A0A0A] flex-1 truncate">${escapeHtml(pl.name)}</span>
          <span class="text-xs text-[#ABABAB]">${pl.videos?.length || 0} videos</span>
        </label>
      `;
      })
      .join("");

    // Wire checkboxes
    listEl.querySelectorAll(".playlist-check").forEach((cb) => {
      cb.addEventListener("change", async () => {
        const playlistId = cb.dataset.playlistId;
        try {
          if (cb.checked) {
            await addVideoToPlaylist(playlistId, videoId);
            showToast("Added to playlist", "success");
          } else {
            await removeVideoFromPlaylist(playlistId, videoId);
            showToast("Removed from playlist", "success");
          }
          await loadPlaylistModal(videoId); // Refresh counts
        } catch (err) {
          showToast(err.message, "error");
          cb.checked = !cb.checked; // Rollback
        }
      });
    });
  } catch (err) {
    listEl.innerHTML = `<p class="py-4 text-center text-sm text-red-500">${escapeHtml(err.message)}</p>`;
  }
}

function renderComment(c, isAuthenticated) {
  const owner = c.owner || {};
  const likeCount = c.likeCount || 0;
  const isLiked = c.isLikedByCurrentUser || false;
  return `
    <div class="flex gap-3">
      <div class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A0A0A] text-xs font-bold text-white">
        ${
          owner.avatar
            ? `<img src="${escapeHtml(owner.avatar)}" class="h-full w-full rounded-full object-cover" />`
            : getInitials(owner.fullname || "C")
        }
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm">
          <span class="font-semibold text-[#0A0A0A]">@${escapeHtml(owner.uname || "user")}</span>
          <span class="ml-2 text-xs text-[#ABABAB]">${formatDate(c.createdAt)}</span>
        </p>
        <p class="mt-1 text-sm leading-relaxed text-[#333]">${escapeHtml(c.contend)}</p>
        ${
          isAuthenticated
            ? `
          <button data-like-comment="${c._id}" data-liked="${isLiked}"
            class="btn-ghost mt-1 -ml-2 gap-1 text-xs ${isLiked ? "text-red-500" : "text-[#ABABAB]"}">
            <svg class="comment-like-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
              fill="${isLiked ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
            <span class="comment-like-count">${likeCount > 0 ? likeCount : ""}</span>
          </button>
        `
            : ""
        }
      </div>
    </div>
  `;
}
