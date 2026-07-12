import { createSidebar, bindSidebarEvents, openSidebar, updateSidebarActiveState } from "./Sidebar.js";
import { createHeader, bindHeaderEvents } from "./Header.js";

export function createLayout(currentPath = "/") {
  const wrapper = document.createElement("div");
  wrapper.className = "flex min-h-screen bg-surface";

  const overlay = document.createElement("div");
  overlay.id = "sidebar-overlay";
  overlay.className =
    "fixed inset-0 z-30 hidden bg-black/50 backdrop-blur-sm lg:hidden";
  overlay.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  });

  const sidebar = createSidebar(currentPath);
  bindSidebarEvents(sidebar);

  const mainColumn = document.createElement("div");
  mainColumn.className = "flex min-h-screen flex-1 flex-col overflow-hidden";

  const header = createHeader();
  bindHeaderEvents(header, () => {
    openSidebar();
    overlay.classList.remove("hidden");
  });

  const main = document.createElement("main");
  main.id = "page-content";
  main.className = "flex-1 overflow-y-auto p-4 sm:p-6";

  mainColumn.appendChild(header);
  mainColumn.appendChild(main);

  wrapper.appendChild(overlay);
  wrapper.appendChild(sidebar);
  wrapper.appendChild(mainColumn);

  return { wrapper, main };
}

export function updateLayoutActiveState(currentPath) {
  updateSidebarActiveState(currentPath);
}

export function renderPagePlaceholder(title, description) {
  return `
    <div class="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface-elevated/30 p-8 text-center transition-all duration-300">
      <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
          <line x1="3" x2="21" y1="9" y2="9"/>
          <line x1="9" x2="9" y1="21" y2="9"/>
        </svg>
      </div>
      <h2 class="text-2xl font-semibold text-slate-50">${title}</h2>
      <p class="mt-2 max-w-md text-sm text-slate-400">${description}</p>
      <div class="mt-6 h-1 w-24 overflow-hidden rounded-full bg-surface-border">
        <div class="h-full w-1/2 animate-pulse rounded-full bg-accent"></div>
      </div>
    </div>
  `;
}
