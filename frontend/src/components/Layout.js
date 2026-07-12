import { createSidebar, bindSidebarEvents, openSidebar, updateSidebarActiveState } from "./Sidebar.js";
import { createHeader, bindHeaderEvents } from "./Header.js";

export function createLayout(currentPath = "/") {
  const wrapper = document.createElement("div");
  wrapper.className = "app-shell flex min-h-screen";

  // Dark overlay for mobile sidebar
  const overlay = document.createElement("div");
  overlay.id = "sidebar-overlay";
  overlay.className =
    "fixed inset-0 z-30 hidden bg-black/60 backdrop-blur-sm lg:hidden";
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
  main.className = "app-main";

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

export function refreshHeader() {
  const existing = document.getElementById("app-header");
  if (!existing) return;
  const newHeader = createHeader();
  existing.replaceWith(newHeader);
  bindHeaderEvents(newHeader, () => {
    openSidebar();
    document.getElementById("sidebar-overlay")?.classList.remove("hidden");
  });
}
