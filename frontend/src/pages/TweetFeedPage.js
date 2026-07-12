import { getUserTweets, createTweet, toggleTweetLike } from "../services/tweetService.js";
import { getSubscribedChannels } from "../services/subscriptionService.js";
import { getChannelProfile } from "../services/authService.js";
import { getVideos } from "../services/videoService.js";
import { getAuthState, requireAuth } from "../context/authContext.js";
import { renderSpinner, renderEmptyState, showToast } from "../utils/ui.js";
import { escapeHtml, formatDate, getInitials } from "../utils/format.js";

export function TweetFeedPage() {
  const { isAuthenticated } = getAuthState();
  return `
    <div class="mx-auto max-w-2xl">
      <!-- Page header -->
      <div class="mb-6">
        <h1 class="page-title">Community</h1>
        <p class="page-subtitle">Updates from creators you follow</p>
      </div>

      <!-- Compose -->
      ${
        isAuthenticated
          ? `
        <div class="surface-card mb-6">
          <form id="tweet-form">
            <textarea name="contend" required rows="3"
              class="input-field resize-none text-sm"
              placeholder="What's on your mind? Share with your community…">
            </textarea>
            <div class="mt-3 flex justify-end">
              <button type="submit" class="btn-primary text-xs">Post Update</button>
            </div>
          </form>
        </div>`
          : `
        <div class="surface-card mb-6">
          <div class="flex items-center gap-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F3F3]">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <p class="text-sm text-[#555]">
              <a href="#/login?redirect=/tweets" class="font-semibold text-[#0A0A0A] underline underline-offset-2">Sign in</a>
              to post and interact with the community.
            </p>
          </div>
        </div>`
      }

      <!-- Feed -->
      <div id="tweet-feed">${renderSpinner()}</div>
    </div>
  `;
}

export async function mountTweetFeedPage() {
  const feed = document.getElementById("tweet-feed");
  if (!feed) return;

  const { isAuthenticated, user } = getAuthState();

  // ── Tweet compose ─────────────────────────────────────
  document.getElementById("tweet-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!requireAuth("/tweets")) return;
    const textarea = e.target.querySelector('[name="contend"]');
    const text     = textarea?.value?.trim();
    if (!text) return;
    const btn = e.target.querySelector("button[type='submit']");
    if (btn) { btn.disabled = true; btn.textContent = "Posting…"; }
    try {
      await createTweet(text);
      textarea.value = "";
      showToast("Posted!", "success");
      mountTweetFeedPage();
    } catch (err) {
      showToast(err.message, "error");
      if (btn) { btn.disabled = false; btn.textContent = "Post Update"; }
    }
  });

  try {
    let tweets    = [];
    // Map of ownerId -> channel profile (for display names/avatars)
    const ownerCache = {};

    if (isAuthenticated) {
      const subs    = await getSubscribedChannels(user._id).catch(() => []);
      const channels = Array.isArray(subs) ? subs : [];
      const ids = [
        user._id,
        ...channels.map((s) => s.channel?._id || s._id).filter(Boolean),
      ];

      const allTweets = await Promise.all(
        [...new Set(ids.map(String))].map((id) =>
          getUserTweets(id).catch(() => [])
        )
      );
      tweets = allTweets.flat().sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Pre-fill cache with subscribed channel profiles
      channels.forEach((s) => {
        const ch = s.channel || s;
        if (ch?._id) ownerCache[String(ch._id)] = ch;
      });
      // Also add self
      ownerCache[String(user._id)] = user;
    }

    // Fallback: load tweets from popular creators
    if (!tweets.length) {
      const videos     = await getVideos({ limit: 10 }).catch(() => ({ docs: [] }));
      const ownerIds   = [...new Set((videos?.docs || []).map((v) => v.owner).filter(Boolean).map(String))];
      const allTweets  = await Promise.all(ownerIds.map((id) => getUserTweets(id).catch(() => [])));
      tweets = allTweets.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (!tweets.length) {
      feed.innerHTML = renderEmptyState({
        title: "No posts yet",
        description: isAuthenticated
          ? "Follow creators or post your first update to see things here!"
          : "Sign in to follow creators and see community posts.",
        actionHtml: isAuthenticated
          ? ""
          : `<a href="#/login?redirect=/tweets" class="btn-primary">Sign In</a>`,
      });
      return;
    }

    // ── Resolve owner profiles for each tweet ─────────────
    const tweetsToRender = tweets.slice(0, 30);
    await Promise.all(
      tweetsToRender.map(async (t) => {
        // The tweet may already have owner data populated
        if (t.owner?.uname) {
          ownerCache[String(t.owner._id || t.owner)] = t.owner;
          return;
        }
        const ownerId = String(t.owner?._id || t.owner);
        if (!ownerCache[ownerId]) {
          try {
            // Try to get username via a channel profile lookup using tweet owner id
            // We can't look up by ID directly, so skip if not cached
            ownerCache[ownerId] = { uname: "creator", fullname: "Creator", avtar: null };
          } catch { /* skip */ }
        }
      })
    );

    feed.innerHTML = `<div class="space-y-4">${tweetsToRender
      .map((t) => {
        const ownerId  = String(t.owner?._id || t.owner);
        const owner    = t.owner?.uname ? t.owner : (ownerCache[ownerId] || { uname: "creator", fullname: "Creator" });
        return renderTweetItem(t, owner, isAuthenticated);
      })
      .join("")}</div>`;

    // ── Like handlers ─────────────────────────────────────
    feed.querySelectorAll("[data-like-tweet]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!requireAuth("/tweets")) return;
        const icon = btn.querySelector(".like-icon");
        try {
          await toggleTweetLike(btn.dataset.likeTweet);
          if (icon) icon.style.fill = icon.style.fill === "currentColor" ? "none" : "currentColor";
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    });

  } catch (err) {
    feed.innerHTML = renderEmptyState({
      title: "Couldn't load feed",
      description: err.message || "Something went wrong loading the community feed.",
    });
  }
}

function renderTweetItem(tweet, owner, canLike) {
  return `
    <div class="surface-card">
      <div class="flex gap-3">
        <!-- Avatar -->
        <a href="${owner.uname && owner.uname !== "creator" ? `#/channel/${escapeHtml(owner.uname)}` : "#"}"
          class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A0A0A] text-xs font-bold text-white hover:opacity-80 transition-opacity">
          ${
            owner.avtar
              ? `<img src="${escapeHtml(owner.avtar)}" class="h-full w-full rounded-full object-cover" />`
              : getInitials(owner.fullname || "C")
          }
        </a>

        <!-- Content -->
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-baseline gap-1.5">
            <span class="font-semibold text-sm text-[#0A0A0A]">${escapeHtml(owner.fullname || "Creator")}</span>
            <span class="text-xs text-[#ABABAB]">@${escapeHtml(owner.uname || "user")}</span>
            <span class="text-[#DCDCDC]">·</span>
            <span class="text-xs text-[#ABABAB]">${formatDate(tweet.createdAt)}</span>
          </div>
          <p class="mt-2 text-sm leading-relaxed text-[#333]">${escapeHtml(tweet.contend)}</p>
          ${
            canLike
              ? `<button data-like-tweet="${tweet._id}"
                  class="btn-ghost mt-2 -ml-2 gap-1.5 text-xs text-[#888]">
                  <svg class="like-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  Like
                </button>`
              : ""
          }
        </div>
      </div>
    </div>
  `;
}
