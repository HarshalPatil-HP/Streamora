import { getVideos } from "../services/videoService.js";
import { getUserTweets, createTweet, toggleTweetLike } from "../services/tweetService.js";
import { getSubscribedChannels } from "../services/subscriptionService.js";
import { getChannelProfile } from "../services/authService.js";
import { getAuthState, requireAuth } from "../context/authContext.js";
import { renderSpinner, renderEmptyState, showToast } from "../utils/ui.js";
import { escapeHtml, formatDate, getInitials } from "../utils/format.js";

export function TweetFeedPage() {
  const { isAuthenticated } = getAuthState();
  return `
    <div class="mx-auto max-w-2xl">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900">Community</h1>
        <p class="mt-1 text-sm text-slate-500">Updates from creators you follow and the Streamora network</p>
      </div>
      ${isAuthenticated ? `
        <div class="surface-card mb-6">
          <form id="tweet-form" class="flex gap-3">
            <textarea name="contend" required rows="3" class="input-field flex-1 resize-none" placeholder="What's happening?"></textarea>
          </form>
          <div class="mt-3 flex justify-end">
            <button type="submit" form="tweet-form" class="btn-primary">Post</button>
          </div>
        </div>
      ` : `
        <div class="surface-card mb-6 text-center">
          <p class="text-sm text-slate-600"><a href="#/login?redirect=/tweets" class="font-semibold text-brand-600">Sign in</a> to post updates and interact with the community.</p>
        </div>
      `}
      <div id="tweet-feed">${renderSpinner()}</div>
    </div>
  `;
}

export async function mountTweetFeedPage() {
  const feed = document.getElementById("tweet-feed");
  if (!feed) return;

  const { isAuthenticated, user } = getAuthState();

  document.getElementById("tweet-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!requireAuth("/tweets")) return;
    const textarea = e.target.querySelector('[name="contend"]');
    const text = textarea?.value?.trim();
    if (!text) return;
    try {
      await createTweet(text);
      textarea.value = "";
      showToast("Posted!", "success");
      mountTweetFeedPage();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  try {
    let tweets = [];

    if (isAuthenticated) {
      const subs = await getSubscribedChannels(user._id).catch(() => []);
      const channels = Array.isArray(subs) ? subs : [];
      const ids = [
        user._id,
        ...channels.map((s) => s.channel?._id).filter(Boolean),
      ];

      const allTweets = await Promise.all(
        [...new Set(ids)].map((id) => getUserTweets(id).catch(() => []))
      );
      tweets = allTweets.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (!tweets.length) {
      const videos = await getVideos({ limit: 10 });
      const ownerIds = [...new Set((videos?.docs || []).map((v) => v.owner).filter(Boolean))];
      const allTweets = await Promise.all(ownerIds.map((id) => getUserTweets(id).catch(() => [])));
      tweets = allTweets.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (!tweets.length) {
      feed.innerHTML = renderEmptyState({
        title: "No posts yet",
        description: isAuthenticated ? "Follow creators or post your first update!" : "Sign in to see more from the community.",
      });
      return;
    }

    const ownerCache = {};
    feed.innerHTML = `<div class="space-y-4">${await Promise.all(tweets.slice(0, 30).map(async (t) => {
      const ownerId = String(t.owner?._id || t.owner);
      if (!ownerCache[ownerId]) {
        try {
          const vids = await getVideos({ userId: ownerId, limit: 1 });
          if (vids?.docs?.[0]) {
            ownerCache[ownerId] = { uname: "creator", fullname: "Creator", avtar: null };
          }
        } catch { /* skip */ }
        ownerCache[ownerId] = ownerCache[ownerId] || { uname: "creator", fullname: "Creator" };
      }
      return renderTweetItem(t, ownerCache[ownerId], isAuthenticated);
    })).then((html) => html.join(""))}</div>`;

    feed.querySelectorAll("[data-like-tweet]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!requireAuth("/tweets")) return;
        try {
          await toggleTweetLike(btn.dataset.likeTweet);
          showToast("Like updated", "success");
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    });
  } catch (err) {
    feed.innerHTML = renderEmptyState({ title: "Feed error", description: err.message });
  }
}

function renderTweetItem(tweet, owner, canLike) {
  const ownerData = tweet.owner?.uname ? tweet.owner : owner;
  return `
    <div class="surface-card">
      <div class="flex gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
          ${ownerData.avtar ? `<img src="${escapeHtml(ownerData.avtar)}" class="h-full w-full rounded-full object-cover" />` : getInitials(ownerData.fullname)}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm"><span class="font-semibold text-slate-900">${escapeHtml(ownerData.fullname || "Creator")}</span> <span class="text-slate-400">@${escapeHtml(ownerData.uname || "user")}</span> · <span class="text-slate-400">${formatDate(tweet.createdAt)}</span></p>
          <p class="mt-2 text-sm leading-relaxed text-slate-700">${escapeHtml(tweet.contend)}</p>
          ${canLike ? `
            <button data-like-tweet="${tweet._id}" class="btn-ghost mt-2 gap-1 text-xs text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              Like
            </button>
          ` : ""}
        </div>
      </div>
    </div>
  `;
}
