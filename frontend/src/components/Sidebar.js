import { getAuthState } from "../context/authContext.js";
import { getInitials } from "../utils/format.js";

const icons = {
  home: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  tweets: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  channel: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  play: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
};

const navItems = [
  { label: "Home",      href: "#/",          icon: icons.home,      match: (p) => p === "/" },
  { label: "Community", href: "#/tweets",    icon: icons.tweets,    match: (p) => p.startsWith("/tweets") },
  { label: "Dashboard", href: "#/dashboard", icon: icons.dashboard, match: (p) => p.startsWith("/dashboard"), protected: true },
];

export function createSidebar(currentPath = "/") {
  const { user, isAuthenticated } = getAuthState();
  const sidebar = document.createElement("aside");
  sidebar.id = "sidebar";
  sidebar.className =
    "fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col bg-[#0A0A0A] transition-transform duration-300 lg:static lg:translate-x-0";

  const channelLink = isAuthenticated
    ? `#/channel/${user.uname}`
    : `#/login?redirect=/dashboard`;

  const userAvatar = isAuthenticated && user.avtar
    ? `<img src="${user.avtar}" class="h-full w-full object-cover" alt="" />`
    : `<span class="text-xs font-bold">${getInitials(user?.fullname || "U")}</span>`;

  sidebar.innerHTML = `
    
    <div class="flex h-16 items-center gap-3 border-b border-[#1E1E1E] px-5">
      <a href="#/" class="flex items-center gap-3 select-none">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#0A0A0A]">
          ${icons.play}
        </div>
        <div>
          <h1 class="text-base font-bold tracking-tight text-white">Streamora</h1>
          <p class="text-[10px] font-medium uppercase tracking-widest text-[#555]">Watch &amp; Connect</p>
        </div>
      </a>
      <button id="sidebar-close" class="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-[#555] hover:bg-[#1E1E1E] hover:text-white lg:hidden" aria-label="Close sidebar">
        ${icons.close}
      </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 space-y-0.5 overflow-y-auto p-3">
      <p class="mb-2 mt-1 px-4 text-[10px] font-semibold uppercase tracking-widest text-[#404040]">Menu</p>
      ${navItems
        .map((item) => {
          const isActive = item.match(currentPath);
          const href =
            item.protected && !isAuthenticated
              ? `#/login?redirect=${encodeURIComponent(item.href.replace("#", ""))}`
              : item.href;
          return `
            <a href="${href}" data-nav-link
              class="nav-link ${isActive ? "nav-link-active" : ""}">
              <span class="shrink-0">${item.icon}</span>
              <span>${item.label}</span>
            </a>
          `;
        })
        .join("")}
      ${
        isAuthenticated
          ? `
        <div class="mt-3 mb-1 px-4 text-[10px] font-semibold uppercase tracking-widest text-[#404040]">Creator</div>
        <a href="${channelLink}" data-nav-link
          class="nav-link ${currentPath.startsWith("/channel") ? "nav-link-active" : ""}">
          <span class="shrink-0">${icons.channel}</span>
          <span>My Channel</span>
        </a>`
          : ""
      }
    </nav>

    <!-- User card / CTA -->
    <div class="border-t border-[#1E1E1E] p-4">
      ${
        isAuthenticated
          ? `
        <div class="flex items-center gap-3 rounded-xl bg-[#141414] p-3">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#2A2A2A] text-white">
            ${userAvatar}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-white">${user.fullname || user.uname}</p>
            <p class="truncate text-xs text-[#666]">@${user.uname}</p>
          </div>
        </div>`
          : `
        <div class="rounded-xl bg-[#141414] p-4">
          <p class="text-sm font-semibold text-white">Join Streamora</p>
          <p class="mt-1 text-xs leading-relaxed text-[#666]">Upload videos &amp; connect with creators</p>
          <a href="#/signup" class="btn-primary-dark mt-3 w-full text-center text-xs">Get Started</a>
        </div>`
      }
    </div>
  `;

  return sidebar;
}

export function bindSidebarEvents(sidebar) {
  const closeBtn = sidebar.querySelector("#sidebar-close");
  const overlay  = document.getElementById("sidebar-overlay");

  closeBtn?.addEventListener("click", () => {
    sidebar.classList.add("-translate-x-full");
    overlay?.classList.add("hidden");
  });

  sidebar.querySelectorAll("[data-nav-link]").forEach((link) => {
    link.addEventListener("click", () => {
      sidebar.classList.add("-translate-x-full");
      overlay?.classList.add("hidden");
    });
  });
}

export function openSidebar() {
  document.getElementById("sidebar")?.classList.remove("-translate-x-full");
  document.getElementById("sidebar-overlay")?.classList.remove("hidden");
}

export function updateSidebarActiveState(currentPath) {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;
  sidebar.querySelectorAll("[data-nav-link]").forEach((link) => {
    const href = link.getAttribute("href")?.replace("#", "") || "/";
    const path = href.split("?")[0];
    const isActive =
      path === currentPath ||
      (path.startsWith("/channel") && currentPath.startsWith("/channel"));
    link.classList.toggle("nav-link-active", isActive);
    link.classList.toggle("nav-link", !isActive || true); 
  });
}
