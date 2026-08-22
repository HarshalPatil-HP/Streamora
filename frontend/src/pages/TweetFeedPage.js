import { getUserTweets, createTweet } from "../services/tweetService.js";
import { toggleTweetLike } from "../services/likeService.js";
import { getSubscribedChannels } from "../services/subscriptionService.js";
import { getVideos } from "../services/videoService.js";
import { getAuthState, requireAuth } from "../context/authContext.js";
import { renderSpinner, renderEmptyState, showToast } from "../utils/ui.js";
import { escapeHtml, formatDate, getInitials } from "../utils/format.js";

export function TweetFeedPage() {
  const { isAuthenticated, user } = getAuthState();
  const hashQuery = new URLSearchParams(
    window.location.hash.split("?")[1] || "",
  );
  const sort = hashQuery.get("sort") || "latest";

  const avatarHtml =
    isAuthenticated && user?.avatar
      ? `<img src="${user.avatar}" class="h-full w-full object-cover rounded-full" alt="" />`
      : `<span class="text-xs font-bold">${getInitials(user?.fullname || "U")}</span>`;

  return `
    <div class="mx-auto max-w-2xl">
      <!-- Page header -->
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="page-title">Community</h1>
          <p class="page-subtitle">Updates from creators you follow</p>
        </div>
        
        <!-- Filter pills -->
        <div class="flex items-center gap-2" id="tweet-sort-pills">
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
      </div>

      <!-- Compose box -->
      ${
        isAuthenticated
          ? `
        <div class="surface-card mb-6">
          <form id="tweet-form" class="flex gap-3 items-start">
            <!-- User avatar -->
            <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A0A0A] text-white">
              ${avatarHtml}
            </div>
            <div class="flex-1 space-y-3">
              <textarea name="contend" required rows="2"
                class="input-field resize-none text-sm leading-relaxed"
                placeholder="What's on your mind? Share with your community…"></textarea>
              <div class="flex justify-end">
                <button type="submit" id="tweet-submit" class="btn-primary text-xs gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Post Update
                </button>
              </div>
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
  const hashQuery = new URLSearchParams(
    window.location.hash.split("?")[1] || "",
  );
  const sort = hashQuery.get("sort") || "latest";

  // ── Sort Pills ────────────────────────────────────────
  document.querySelectorAll("#tweet-sort-pills .sort-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.hash = `#/tweets?sort=${btn.dataset.sort}`;
    });
  });

  // ── Tweet compose ─────────────────────────────────────
  const tweetForm = document.getElementById("tweet-form");
  if (tweetForm) {
    tweetForm.onsubmit = async (e) => {
      e.preventDefault();
      if (!requireAuth("/tweets")) return;
      const textarea = e.target.querySelector('[name="contend"]');
      const text = textarea?.value?.trim();
      if (!text) return;

      const btn = document.getElementById("tweet-submit");
      if (btn) {
        if (btn.disabled) return; // Prevent double trigger
        btn.disabled = true;
        btn.innerHTML = "Posting…";
      }

      try {
        const newTweet = await createTweet(text);
        textarea.value = "";
        showToast("Posted!", "success");

        // Prepend new tweet to feed immediately
        const feedDiv = document.getElementById("tweet-feed");
        const list = feedDiv?.querySelector(".space-y-4");
        if (list && newTweet) {
          const tweetEl = document.createElement("div");
          tweetEl.innerHTML = renderTweetItem(
            newTweet,
            newTweet.owner || user,
            true,
          );
          const tweetNode = tweetEl.firstElementChild;
          list.prepend(tweetNode);
          // Bind AFTER the node is in the DOM
          bindTweetLikes(list);
        } else {
          mountTweetFeedPage();
        }
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Post Update`;
        }
      }
    };
  }

  try {
    let tweets = [];
    const ownerCache = {};

    if (isAuthenticated) {
      const subs = await getSubscribedChannels(user._id).catch(() => []);
      const channels = Array.isArray(subs) ? subs : [];
      const ids = [
        user._id,
        ...channels.map((s) => s.channel?._id || s._id).filter(Boolean),
      ];

      const allTweets = await Promise.all(
        [...new Set(ids.map(String))].map((id) =>
          getUserTweets(id, sort).catch(() => []),
        ),
      );

      tweets = allTweets.flat();
      if (sort === "trending") {
        tweets.sort(
          (a, b) =>
            (b.likeCount || 0) - (a.likeCount || 0) ||
            new Date(b.createdAt) - new Date(a.createdAt),
        );
      } else {
        tweets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      channels.forEach((s) => {
        const ch = s.channel || s;
        if (ch?._id) ownerCache[String(ch._id)] = ch;
      });
      ownerCache[String(user._id)] = user;
    }

    // Fallback: load tweets from popular creators
    if (!tweets.length) {
      const videos = await getVideos({ limit: 10 }).catch(() => ({ docs: [] }));
      const ownerIds = [
        ...new Set(
          (videos?.docs || [])
            .map((v) => v.owner)
            .filter(Boolean)
            .map(String),
        ),
      ];
      const allTweets = await Promise.all(
        ownerIds.map((id) => getUserTweets(id, sort).catch(() => [])),
      );
      tweets = allTweets.flat();
      if (sort === "trending") {
        tweets.sort(
          (a, b) =>
            (b.likeCount || 0) - (a.likeCount || 0) ||
            new Date(b.createdAt) - new Date(a.createdAt),
        );
      } else {
        tweets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
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

    const tweetsToRender = tweets.slice(0, 50);

    feed.innerHTML = `<div class="space-y-4">${tweetsToRender
      .map((t) => {
        const ownerId = String(t.owner?._id || t.owner);
        const owner = t.owner?.uname
          ? t.owner
          : ownerCache[ownerId] || { uname: "creator", fullname: "Creator" };
        return renderTweetItem(t, owner, true);
      })
      .join("")}</div>`;

    bindTweetLikes(feed);
  } catch (err) {
    feed.innerHTML = renderEmptyState({
      title: "Couldn't load feed",
      description:
        err.message || "Something went wrong loading the community feed.",
    });
  }
}

function bindTweetLikes(container) {
  container.querySelectorAll("[data-like-tweet]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!requireAuth("/tweets")) return;
      const tweetId = btn.dataset.likeTweet;
      const wasLiked = btn.dataset.liked === "true";
      const icon = btn.querySelector(".like-icon");
      const countEl = btn.querySelector(".like-count");
      const labelEl = btn.querySelector(".like-label");

      // Optimistic update
      const newLiked = !wasLiked;
      btn.dataset.liked = String(newLiked);
      if (icon) icon.setAttribute("fill", newLiked ? "currentColor" : "none");
      btn.classList.toggle("text-red-500", newLiked);

      try {
        const result = await toggleTweetLike(tweetId);
        btn.dataset.liked = String(result.liked);
        if (icon)
          icon.setAttribute("fill", result.liked ? "currentColor" : "none");
        btn.classList.toggle("text-red-500", result.liked);
        if (countEl)
          countEl.textContent = result.likeCount > 0 ? result.likeCount : "";
        if (labelEl) labelEl.textContent = result.liked ? "Liked" : "Like";
      } catch (err) {
        // Rollback
        btn.dataset.liked = String(wasLiked);
        if (icon) icon.setAttribute("fill", wasLiked ? "currentColor" : "none");
        btn.classList.toggle("text-red-500", wasLiked);
        showToast(err.message, "error");
      }
    });
  });
}

function renderTweetItem(tweet, owner, canLike) {
  const isLiked = tweet.isLikedByCurrentUser || false;
  const likeCount = tweet.likeCount || 0;

  return `
    <div class="surface-card hover:shadow-card transition-shadow duration-200">
      <div class="flex gap-3">
        <!-- Avatar -->
        <a href="${owner.uname && owner.uname !== "creator" ? `#/channel/${escapeHtml(owner.uname)}` : "#"}"
          class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A0A0A] text-xs font-bold text-white hover:opacity-80 transition-opacity">
          ${
            owner.avatar
              ? `<img src="${escapeHtml(owner.avatar)}" class="h-full w-full rounded-full object-cover" />`
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

          <!-- Like button -->
          ${
            canLike
              ? `<button data-like-tweet="${tweet._id}" data-liked="${isLiked}"
                  class="btn-ghost mt-2 -ml-2 gap-1.5 text-xs ${isLiked ? "text-red-500" : "text-[#888]"}">
                  <svg class="like-icon" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                    fill="${isLiked ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                  <span class="like-count">${likeCount > 0 ? likeCount : ""}</span>
                  <span class="like-label">${isLiked ? "Liked" : "Like"}</span>
                </button>`
              : `<div class="mt-2 flex items-center gap-1.5 text-xs text-[#ABABAB]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  ${likeCount > 0 ? `${likeCount} likes` : ""}
                </div>`
          }
        </div>
      </div>
    </div>
  `;
}
