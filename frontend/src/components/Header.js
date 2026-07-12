import { getAuthState } from "../context/authContext.js";
import { logoutUser } from "../context/authContext.js";
import { getInitials } from "../utils/format.js";
import { showToast } from "../utils/ui.js";
import { navigate } from "../router.js";

const icons = {
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
  chevron: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>`,
};

export function createHeader() {
  const { user, isAuthenticated } = getAuthState();
  const header = document.createElement("header");
  header.id = "app-header";
  header.className =
    "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[#E8E8E8] bg-white/95 px-4 backdrop-blur-md sm:px-6";

  const displayName = isAuthenticated ? user.fullname || user.uname : "Guest";
  const avatar =
    isAuthenticated && user.avtar
      ? `<img src="${user.avtar}" class="h-full w-full object-cover" alt="" />`
      : `<span>${getInitials(displayName)}</span>`;

  header.innerHTML = `
    <button id="sidebar-toggle"
      class="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8E8E8] bg-white text-[#555] transition-all hover:bg-[#F3F3F3] hover:text-[#0A0A0A] lg:hidden"
      aria-label="Open menu">
      ${icons.menu}
    </button>

    <form id="search-form" class="relative flex-1 max-w-xl" role="search">
      <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ABABAB]">
        ${icons.search}
      </span>
      <input
        type="search"
        name="q"
        placeholder="Search videos…"
        class="w-full rounded-xl border border-[#E8E8E8] bg-[#F9F9F9] py-2.5 pl-10 pr-4 text-sm text-[#0A0A0A] placeholder-[#ABABAB] outline-none transition-all duration-200 focus:border-[#0A0A0A] focus:bg-white focus:ring-2 focus:ring-[#0A0A0A]/10"
        autocomplete="off"
      />
    </form>

    <div class="relative ml-auto shrink-0" id="user-menu">
      <button id="user-menu-btn"
        class="flex items-center gap-2.5 rounded-xl border border-[#E8E8E8] bg-white py-1.5 pl-1.5 pr-3 transition-all duration-200 hover:border-[#D0D0D0] hover:shadow-soft"
        aria-expanded="false">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#0A0A0A] text-xs font-bold text-white">
          ${avatar}
        </div>
        <span class="hidden max-w-[120px] truncate text-sm font-medium text-[#0A0A0A] sm:inline">${displayName}</span>
        <span class="hidden text-[#ABABAB] sm:inline">${icons.chevron}</span>
      </button>

      <div id="user-dropdown"
        class="absolute right-0 top-full mt-2 hidden w-52 overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white py-1.5 shadow-card">
        ${
          isAuthenticated
            ? `
          <div class="border-b border-[#F3F3F3] px-4 py-3">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-[#ABABAB]">Signed in as</p>
            <p class="mt-0.5 truncate text-sm font-semibold text-[#0A0A0A]">${displayName}</p>
          </div>
          <a href="#/channel/${user.uname}" class="flex items-center gap-2 px-4 py-2.5 text-sm text-[#555] transition-colors hover:bg-[#F9F9F9] hover:text-[#0A0A0A]">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Your Channel
          </a>
          <a href="#/dashboard" class="flex items-center gap-2 px-4 py-2.5 text-sm text-[#555] transition-colors hover:bg-[#F9F9F9] hover:text-[#0A0A0A]">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            Dashboard
          </a>
          <div class="my-1 border-t border-[#F3F3F3]"></div>
          <button id="logout-btn" class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            Sign Out
          </button>
        `
            : `
          <a href="#/login" class="flex items-center gap-2 px-4 py-2.5 text-sm text-[#555] hover:bg-[#F9F9F9] hover:text-[#0A0A0A]">Sign In</a>
          <a href="#/signup" class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#F9F9F9]">Create Account</a>
        `
        }
      </div>
    </div>
  `;

  return header;
}

export function bindHeaderEvents(header, onSidebarToggle) {
  const toggleBtn    = header.querySelector("#sidebar-toggle");
  const userMenuBtn  = header.querySelector("#user-menu-btn");
  const userDropdown = header.querySelector("#user-dropdown");
  const searchForm   = header.querySelector("#search-form");
  const logoutBtn    = header.querySelector("#logout-btn");

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
