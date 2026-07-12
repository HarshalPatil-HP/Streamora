import { getChannelProfile } from "../services/authService.js";
import { getVideos } from "../services/videoService.js";
import { getUserTweets } from "../services/tweetService.js";
import { getUserPlaylists } from "../services/playlistService.js";
import { toggleSubscribe } from "../services/subscriptionService.js";
import { getAuthState, requireAuth } from "../context/authContext.js";
import { renderVideoGrid } from "../components/VideoCard.js";
import { renderSpinner, renderEmptyState, showToast } from "../utils/ui.js";
import { escapeHtml, formatViews, formatDate, getInitials } from "../utils/format.js";

export function ChannelPage({ username }) {
  return `<div id="channel-root">${renderSpinner("lg")}</div>`;
}

export async function mountChannelPage(params) {
  const username = params?.username;
  const root     = document.getElementById("channel-root");
  if (!root) return;

  try {
    const channel = await getChannelProfile(username);
    const { isAuthenticated, user } = getAuthState();
    const isOwnChannel = isAuthenticated && user?.uname === channel.uname;

    root.innerHTML = `
      <!-- Channel Header -->
      <div class="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white shadow-soft">
        <!-- Cover image -->
        <div class="relative h-36 overflow-hidden bg-[#0A0A0A] sm:h-52">
          ${
            channel.cover
              ? `<img src="${escapeHtml(channel.cover)}" class="h-full w-full object-cover opacity-80" alt="" />`
              : `<div class="flex h-full items-center justify-center">
                   <div class="h-full w-full" style="background: repeating-linear-gradient(-45deg, #141414 0, #141414 8px, #1A1A1A 8px, #1A1A1A 16px);"></div>
                 </div>`
          }
          <!-- Gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>

        <!-- Profile area -->
        <div class="relative px-6 pb-6">
          <div class="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div class="flex items-end gap-4">
              <!-- Avatar -->
              <div class="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#0A0A0A] text-2xl font-bold text-white shadow-card">
                ${channel.avtar
                  ? `<img src="${escapeHtml(channel.avtar)}" class="h-full w-full object-cover" alt="" />`
                  : getInitials(channel.fullname)}
              </div>
              <div class="pb-1">
                <h1 class="text-2xl font-bold text-[#0A0A0A]">${escapeHtml(channel.fullname)}</h1>
                <p class="text-sm text-[#888]">@${escapeHtml(channel.uname)}</p>
                <div class="mt-1 flex items-center gap-3 text-xs text-[#888]">
                  <span class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    <strong class="text-[#0A0A0A] font-semibold">${formatViews(channel.subscribersCount)}</strong> subscribers
                  </span>
                </div>
              </div>
            </div>
            <!-- Action button -->
            ${!isOwnChannel
              ? `<button id="channel-sub-btn" class="${channel.issubscribed ? "btn-secondary" : "btn-primary"} mb-1">
                   ${channel.issubscribed ? "Subscribed" : "Subscribe"}
                 </button>`
              : `<div class="mb-1">
                   <a href="#/dashboard" class="btn-secondary gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                     Manage Channel
                   </a>
                 </div>`
            }
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mt-6 border-b border-[#E8E8E8]">
        <nav class="flex gap-0" id="channel-tabs">
          <button data-tab="videos"     class="tab-btn tab-btn-active">Videos</button>
          <button data-tab="tweets"     class="tab-btn">Community</button>
          <button data-tab="playlists"  class="tab-btn">Playlists</button>
        </nav>
      </div>
      <div id="channel-tab-content" class="mt-6">${renderSpinner()}</div>
    `;

    // ── Tab Logic ────────────────────────────────────────
    const loadTab = async (tab) => {
      const content = document.getElementById("channel-tab-content");
      if (!content) return;
      content.innerHTML = renderSpinner();

      document.querySelectorAll("#channel-tabs .tab-btn").forEach((b) => {
        b.classList.toggle("tab-btn-active", b.dataset.tab === tab);
        b.classList.toggle("tab-btn", true);
      });

      try {
        if (tab === "videos") {
          const result = await getVideos({ userId: channel._id, limit: 20 });
          const videos = result?.docs || [];
          content.innerHTML = videos.length
            ? `<div class="video-grid">${renderVideoGrid(videos, { [String(channel._id)]: channel })}</div>`
            : renderEmptyState({ title: "No videos yet", description: "This creator hasn't uploaded any videos yet." });

        } else if (tab === "tweets") {
          const tweets = await getUserTweets(channel._id);
          const list   = Array.isArray(tweets) ? tweets : (tweets?.docs || []);
          content.innerHTML = list.length
            ? `<div class="max-w-2xl space-y-4">${list.map((t) => renderTweet(t, channel)).join("")}</div>`
            : renderEmptyState({ title: "No posts yet", description: "No community posts from this creator yet." });

        } else {
          const playlists = await getUserPlaylists(channel._id);
          const list = Array.isArray(playlists) ? playlists : (playlists?.docs || []);
          content.innerHTML = list.length
            ? `<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${list.map(renderPlaylist).join("")}</div>`
            : renderEmptyState({ title: "No playlists", description: "No playlists created yet." });
        }
      } catch (err) {
        content.innerHTML = renderEmptyState({ title: "Error loading content", description: err.message });
      }
    };

    document.querySelectorAll("#channel-tabs [data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => loadTab(btn.dataset.tab));
    });

    // ── Subscribe ────────────────────────────────────────
    document.getElementById("channel-sub-btn")?.addEventListener("click", async () => {
      if (!requireAuth(`/channel/${username}`)) return;
      const btn = document.getElementById("channel-sub-btn");
      if (!btn) return;
      btn.disabled    = true;
      btn.textContent = "Updating…";
      try {
        const result = await toggleSubscribe(channel._id);
        const subscribed = result?.subscribed;
        btn.textContent = subscribed ? "Subscribed" : "Subscribe";
        btn.className   = subscribed ? "btn-secondary" : "btn-primary";
        btn.disabled    = false;
        showToast(subscribed ? "Subscribed!" : "Unsubscribed", "success");
      } catch (err) {
        showToast(err.message, "error");
        btn.disabled = false;
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
        <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A0A0A] text-xs font-bold text-white">
          ${channel.avtar
            ? `<img src="${escapeHtml(channel.avtar)}" class="h-full w-full rounded-full object-cover" />`
            : getInitials(channel.fullname)}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm">
            <span class="font-semibold text-[#0A0A0A]">${escapeHtml(channel.fullname)}</span>
            <span class="ml-1.5 text-[#888]">@${escapeHtml(channel.uname)}</span>
            <span class="mx-1.5 text-[#DCDCDC]">·</span>
            <span class="text-xs text-[#ABABAB]">${formatDate(tweet.createdAt)}</span>
          </p>
          <p class="mt-2 text-sm leading-relaxed text-[#333]">${escapeHtml(tweet.contend)}</p>
        </div>
      </div>
    </div>
  `;
}

function renderPlaylist(pl) {
  return `
    <div class="surface-card hover:shadow-card transition-shadow">
      <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F3F3]">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
      </div>
      <h3 class="font-semibold text-[#0A0A0A]">${escapeHtml(pl.name)}</h3>
      ${pl.description ? `<p class="mt-1 text-sm text-[#888] line-clamp-2">${escapeHtml(pl.description)}</p>` : ""}
    </div>
  `;
}
