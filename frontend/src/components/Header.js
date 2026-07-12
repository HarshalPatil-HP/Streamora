const icons = {
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  bell: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
  chevron: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
};

export function createHeader() {
  const header = document.createElement("header");
  header.id = "app-header";
  header.className =
    "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-surface-border bg-surface/80 px-4 backdrop-blur-glass sm:px-6";

  header.innerHTML = `
    <button id="sidebar-toggle" class="rounded-xl border border-surface-border bg-surface-elevated p-2.5 text-slate-400 transition-all duration-300 hover:scale-[1.02] hover:border-accent/30 hover:text-slate-50 lg:hidden" aria-label="Open menu">
      ${icons.menu}
    </button>

    <form id="search-form" class="relative flex-1 max-w-2xl" role="search">
      <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
        ${icons.search}
      </span>
      <input
        type="search"
        name="q"
        placeholder="Search videos, creators, tweets..."
        class="input-field pl-11 pr-4"
        autocomplete="off"
      />
    </form>

    <div class="flex items-center gap-2 sm:gap-3">
      <button class="hidden rounded-xl border border-surface-border bg-surface-elevated p-2.5 text-slate-400 transition-all duration-300 hover:scale-[1.02] hover:text-slate-50 sm:flex" aria-label="Notifications">
        ${icons.bell}
      </button>

      <div class="relative" id="user-menu">
        <button
          id="user-menu-btn"
          class="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-elevated p-1.5 pr-3 transition-all duration-300 hover:scale-[1.02] hover:border-accent/30"
          aria-label="User menu"
          aria-expanded="false"
        >
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-emerald text-xs font-bold text-white">
            S
          </div>
          <span class="hidden text-sm font-medium text-slate-300 sm:inline">Guest</span>
          <span class="hidden text-slate-500 sm:inline">${icons.chevron}</span>
        </button>

        <div
          id="user-dropdown"
          class="absolute right-0 top-full mt-2 hidden w-48 rounded-xl border border-surface-border bg-surface-elevated py-2 shadow-card"
        >
          <a href="#/login" class="block px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-surface-border/30 hover:text-slate-50">Sign In</a>
          <a href="#/signup" class="block px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-surface-border/30 hover:text-slate-50">Create Account</a>
          <hr class="my-2 border-surface-border" />
          <a href="#/channel/demo" class="block px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-surface-border/30 hover:text-slate-50">Your Channel</a>
          <a href="#/dashboard" class="block px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-surface-border/30 hover:text-slate-50">Dashboard</a>
        </div>
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
    if (query) {
      window.location.hash = `#/search?q=${encodeURIComponent(query)}`;
    }
  });
}
