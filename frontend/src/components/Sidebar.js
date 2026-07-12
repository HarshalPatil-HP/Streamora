import { getAuthState } from "../context/authContext.js";
import { getInitials } from "../utils/format.js";

const icons = {
  home: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  tweets: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
};

const navItems = [
  { label: "Home", href: "#/", icon: icons.home, match: (path) => path === "/" },
  { label: "Community", href: "#/tweets", icon: icons.tweets, match: (path) => path.startsWith("/tweets") },
  { label: "Dashboard", href: "#/dashboard", icon: icons.dashboard, match: (path) => path.startsWith("/dashboard"), protected: true },
];

export function createSidebar(currentPath = "/") {
  const { user, isAuthenticated } = getAuthState();
  const sidebar = document.createElement("aside");
  sidebar.id = "sidebar";
  sidebar.className =
    "fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-surface-border bg-white transition-transform duration-300 lg:static lg:translate-x-0";

  const channelLink = isAuthenticated
    ? `#/channel/${user.uname}`
    : "#/login?redirect=/dashboard";

  sidebar.innerHTML = `
    <div class="flex h-16 items-center gap-3 border-b border-surface-border px-6">
      <a href="#/" class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        <div>
          <h1 class="text-lg font-bold tracking-tight text-slate-900">Streamora</h1>
          <p class="text-xs text-slate-500">Watch & Connect</p>
        </div>
      </a>
      <button id="sidebar-close" class="ml-auto rounded-lg p-2 text-slate-400 hover:bg-surface-hover hover:text-slate-700 lg:hidden" aria-label="Close sidebar">
        ${icons.close}
      </button>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto p-4">
      ${navItems
        .map((item) => {
          const isActive = item.match(currentPath);
          const href = item.protected && !isAuthenticated ? `#/login?redirect=${encodeURIComponent(item.href.replace("#", ""))}` : item.href;
          return `
            <a href="${href}" data-nav-link class="nav-link ${isActive ? "nav-link-active" : ""}">
              <span class="shrink-0">${item.icon}</span>
              <span>${item.label}</span>
            </a>
          `;
        })
        .join("")}
      ${isAuthenticated ? `
        <a href="${channelLink}" data-nav-link class="nav-link ${currentPath.startsWith("/channel") ? "nav-link-active" : ""}">
          <span class="shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
          <span>My Channel</span>
        </a>` : ""}
    </nav>

    <div class="border-t border-surface-border p-4">
      ${isAuthenticated ? `
        <div class="rounded-xl border border-surface-border bg-brand-50 p-4">
          <p class="text-xs font-semibold uppercase tracking-wider text-brand-600">Creator Studio</p>
          <p class="mt-1 text-sm text-slate-600">Manage your content</p>
          <a href="#/dashboard" class="btn-primary mt-3 w-full text-center text-xs">Open Dashboard</a>
        </div>
      ` : `
        <div class="rounded-xl border border-surface-border bg-surface-muted p-4">
          <p class="text-sm font-medium text-slate-700">Join Streamora</p>
          <p class="mt-1 text-xs text-slate-500">Upload videos & connect with creators</p>
          <a href="#/signup" class="btn-primary mt-3 w-full text-center text-xs">Get Started</a>
        </div>
      `}
    </div>
  `;

  return sidebar;
}

export function bindSidebarEvents(sidebar) {
  const closeBtn = sidebar.querySelector("#sidebar-close");
  const overlay = document.getElementById("sidebar-overlay");

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
    const isActive = path === currentPath || (path.startsWith("/channel") && currentPath.startsWith("/channel"));
    link.classList.toggle("nav-link-active", isActive);
  });
}
