import { getChannelProfile } from "../services/authService.js";
import { getVideos } from "../services/videoService.js";
import { getUserTweets } from "../services/tweetService.js";
import { getUserPlaylists } from "../services/playlistService.js";
import { toggleSubscribe } from "../services/subscriptionService.js";
import { getAuthState, requireAuth } from "../context/authContext.js";
import { renderVideoGrid } from "../components/VideoCard.js";
import { renderSpinner, renderEmptyState, showToast } from "../utils/ui.js";
import { escapeHtml, formatViews, getInitials } from "../utils/format.js";

export function ChannelPage({ username }) {
  return `<div id="channel-root">${renderSpinner("lg")}</div>`;
}

export async function mountChannelPage(params) {
  const username = params?.username;
  const root = document.getElementById("channel-root");
  if (!root) return;

  try {
    const channel = await getChannelProfile(username);
    const { isAuthenticated, user } = getAuthState();
    const isOwnChannel = isAuthenticated && user?.uname === channel.uname;

    root.innerHTML = `
      <div class="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-soft">
        <div class="h-40 bg-gradient-to-r from-brand-100 to-indigo-100 sm:h-52">
          ${channel.cover ? `<img src="${escapeHtml(channel.cover)}" class="h-full w-full object-cover" alt="" />` : ""}
        </div>
        <div class="relative px-6 pb-6">
          <div class="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div class="flex items-end gap-4">
              <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-brand-100 text-2xl font-bold text-brand-700 shadow-soft">
                ${channel.avtar ? `<img src="${escapeHtml(channel.avtar)}" class="h-full w-full object-cover" alt="" />` : getInitials(channel.fullname)}
              </div>
              <div>
                <h1 class="text-2xl font-bold text-slate-900">${escapeHtml(channel.fullname)}</h1>
                <p class="text-sm text-slate-500">@${escapeHtml(channel.uname)}</p>
                <p class="mt-1 text-sm text-slate-500">${formatViews(channel.subscribersCount)} subscribers</p>
              </div>
            </div>
            ${!isOwnChannel ? `<button id="channel-sub-btn" class="btn-primary">${channel.issubscribed ? "Subscribed" : "Subscribe"}</button>` : `<span class="badge">Your Channel</span>`}
          </div>
        </div>
      </div>

      <div class="mt-6 border-b border-surface-border">
        <nav class="flex gap-2" id="channel-tabs">
          <button data-tab="videos" class="tab-btn tab-btn-active">Videos</button>
          <button data-tab="tweets" class="tab-btn">Tweets</button>
          <button data-tab="playlists" class="tab-btn">Playlists</button>
        </nav>
      </div>
      <div id="channel-tab-content" class="mt-6">${renderSpinner()}</div>
    `;

    const loadTab = async (tab) => {
      const content = document.getElementById("channel-tab-content");
      content.innerHTML = renderSpinner();

      document.querySelectorAll("#channel-tabs .tab-btn").forEach((b) => {
        b.classList.toggle("tab-btn-active", b.dataset.tab === tab);
      });

      try {
        if (tab === "videos") {
          const result = await getVideos({ userId: channel._id, limit: 20 });
          const videos = result?.docs || [];
          content.innerHTML = videos.length
            ? `<div class="video-grid">${renderVideoGrid(videos, { [String(channel._id)]: channel })}</div>`
            : renderEmptyState({ title: "No videos", description: "This creator hasn't uploaded yet." });
        } else if (tab === "tweets") {
          const tweets = await getUserTweets(channel._id);
          content.innerHTML = tweets?.length
            ? `<div class="space-y-4">${tweets.map((t) => renderTweet(t, channel)).join("")}</div>`
            : renderEmptyState({ title: "No tweets", description: "No community posts yet." });
        } else {
          const playlists = await getUserPlaylists(channel._id);
          content.innerHTML = playlists?.length
            ? `<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${playlists.map(renderPlaylist).join("")}</div>`
            : renderEmptyState({ title: "No playlists", description: "No playlists created yet." });
        }
      } catch (err) {
        content.innerHTML = renderEmptyState({ title: "Error", description: err.message });
      }
    };

    document.querySelectorAll("#channel-tabs [data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => loadTab(btn.dataset.tab));
    });

    document.getElementById("channel-sub-btn")?.addEventListener("click", async () => {
      if (!requireAuth(`/channel/${username}`)) return;
      try {
        const result = await toggleSubscribe(channel._id);
        const btn = document.getElementById("channel-sub-btn");
        btn.textContent = result?.subscribed ? "Subscribed" : "Subscribe";
        showToast(result?.subscribed ? "Subscribed!" : "Unsubscribed", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });

    await loadTab("videos");
  } catch (err) {
    root.innerHTML = renderEmptyState({
      title: "Channel not found",
      description: err.message || `User @${username} doesn't exist.`,
      actionHtml: `<a href="#/" class="btn-primary">Go Home</a>`,
    });
  }
}

function renderTweet(tweet, channel) {
  return `
    <div class="surface-card">
      <div class="flex gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
          ${channel.avtar ? `<img src="${escapeHtml(channel.avtar)}" class="h-full w-full rounded-full object-cover" />` : getInitials(channel.fullname)}
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-800">${escapeHtml(channel.fullname)} <span class="font-normal text-slate-400">@${escapeHtml(channel.uname)}</span></p>
          <p class="mt-2 text-sm text-slate-700">${escapeHtml(tweet.contend)}</p>
        </div>
      </div>
    </div>
  `;
}

function renderPlaylist(pl) {
  return `
    <div class="surface-card hover:shadow-card">
      <h3 class="font-semibold text-slate-900">${escapeHtml(pl.name)}</h3>
      <p class="mt-1 text-sm text-slate-500 line-clamp-2">${escapeHtml(pl.description || "")}</p>
    </div>
  `;
}
