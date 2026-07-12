import { getAuthState } from "../context/authContext.js";
import { logoutUser } from "../context/authContext.js";
import { getInitials } from "../utils/format.js";
import { showToast } from "../utils/ui.js";
import { navigate } from "../router.js";

const icons = {
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
  chevron: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>`,
};

export function createHeader() {
  const { user, isAuthenticated } = getAuthState();
  const header = document.createElement("header");
  header.id = "app-header";
  header.className =
    "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-surface-border bg-white/90 px-4 backdrop-blur-md sm:px-6";

  const displayName = isAuthenticated ? user.fullname || user.uname : "Guest";
  const avatar = isAuthenticated && user.avtar
    ? `<img src="${user.avtar}" class="h-full w-full object-cover" alt="" />`
    : getInitials(displayName);

  header.innerHTML = `
    <button id="sidebar-toggle" class="rounded-xl border border-surface-border bg-white p-2.5 text-slate-500 transition-all hover:bg-surface-hover hover:text-slate-800 lg:hidden" aria-label="Open menu">
      ${icons.menu}
    </button>

    <form id="search-form" class="relative flex-1 max-w-2xl" role="search">
      <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">${icons.search}</span>
      <input type="search" name="q" placeholder="Search videos..." class="input-field pl-11" autocomplete="off" />
    </form>

    <div class="relative" id="user-menu">
      <button id="user-menu-btn" class="flex items-center gap-2 rounded-xl border border-surface-border bg-white py-1.5 pl-1.5 pr-3 transition-all hover:shadow-soft" aria-expanded="false">
        <div class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-brand-100 text-xs font-bold text-brand-700">${avatar}</div>
        <span class="hidden max-w-[120px] truncate text-sm font-medium text-slate-700 sm:inline">${displayName}</span>
        <span class="hidden text-slate-400 sm:inline">${icons.chevron}</span>
      </button>
      <div id="user-dropdown" class="absolute right-0 top-full mt-2 hidden w-52 rounded-xl border border-surface-border bg-white py-2 shadow-card">
        ${isAuthenticated ? `
          <a href="#/channel/${user.uname}" class="block px-4 py-2.5 text-sm text-slate-600 hover:bg-surface-hover hover:text-slate-900">Your Channel</a>
          <a href="#/dashboard" class="block px-4 py-2.5 text-sm text-slate-600 hover:bg-surface-hover hover:text-slate-900">Dashboard</a>
          <hr class="my-2 border-surface-border" />
          <button id="logout-btn" class="block w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50">Sign Out</button>
        ` : `
          <a href="#/login" class="block px-4 py-2.5 text-sm text-slate-600 hover:bg-surface-hover">Sign In</a>
          <a href="#/signup" class="block px-4 py-2.5 text-sm text-slate-600 hover:bg-surface-hover">Create Account</a>
        `}
      </div>
    </div>
  `;

  return header;
}

export function bindHeaderEvents(header, onSidebarToggle) {
  const toggleBtn = header.querySelector("#sidebar-toggle");
  const userMenuBtn = header.querySelector("#user-menu-btn");
  const userDropdown = header.querySelector("#user-dropdown");
  const searchForm = header.querySelector("#search-form");
  const logoutBtn = header.querySelector("#logout-btn");

  toggleBtn?.addEventListener("click", onSidebarToggle);

  userMenuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = !userDropdown.classList.contains("hidden");
    userDropdown.classList.toggle("hidden", isOpen);
    userMenuBtn.setAttribute("aria-expanded", String(!isOpen));
  });

  document.addEventListener("click", () => {
    userDropdown?.classList.add("hidden");
    userMenuBtn?.setAttribute("aria-expanded", "false");
  });

  searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = new FormData(searchForm).get("q")?.toString().trim();
    navigate(query ? `/?q=${encodeURIComponent(query)}` : "/");
  });

  logoutBtn?.addEventListener("click", async () => {
    try {
      await logoutUser();
      showToast("Signed out successfully", "success");
      navigate("/");
      window.location.reload();
    } catch {
      showToast("Failed to sign out", "error");
    }
  });
}
