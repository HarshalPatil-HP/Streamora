import { escapeHtml } from "./format.js";

let toastContainer = null;

export function showToast(message, type = "info") {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none";
    document.body.appendChild(toastContainer);
  }

  const styles = {
    info:    "bg-[#0A0A0A] text-white border-[#222]",
    success: "bg-[#0A0A0A] text-white border-[#222]",
    error:   "bg-red-600 text-white border-red-700",
  };

  const icons = {
    info:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  };

  const toast = document.createElement("div");
  toast.className = `pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-card ${styles[type] || styles.info}`;
  toast.style.cssText = "opacity:0; transform: translateY(6px); transition: opacity 0.25s ease, transform 0.25s ease;";
  toast.innerHTML = `<span class="shrink-0 opacity-80">${icons[type] || icons.info}</span><span>${escapeHtml(message)}</span>`;

  toastContainer.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(4px)";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

export function renderSpinner(size = "md") {
  const sizes = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-12 w-12" };
  return `
    <div class="flex flex-col items-center justify-center py-16 gap-3">
      <div class="${sizes[size]} animate-spin rounded-full border-2 border-[#E8E8E8] border-t-[#0A0A0A]"></div>
      ${size === "lg" ? `<p class="text-xs font-medium text-[#ABABAB] tracking-wide">Loading…</p>` : ""}
    </div>`;
}

export function renderEmptyState({ title, description, actionHtml = "" }) {
  return `
    <div class="surface-card flex flex-col items-center justify-center py-20 text-center">
      <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3F3F3]">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
        </svg>
      </div>
      <h3 class="text-base font-semibold text-[#0A0A0A]">${escapeHtml(title)}</h3>
      <p class="mt-2 max-w-xs text-sm leading-relaxed text-[#888]">${escapeHtml(description)}</p>
      ${actionHtml ? `<div class="mt-6">${actionHtml}</div>` : ""}
    </div>
  `;
}

export function renderSkeletonGrid(count = 8) {
  return `
    <div class="video-grid">
      ${Array.from({ length: count })
        .map(
          () => `
        <div class="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white">
          <div class="skeleton aspect-video w-full rounded-none"></div>
          <div class="space-y-2.5 p-4">
            <div class="skeleton h-4 w-3/4 rounded-lg"></div>
            <div class="skeleton h-3 w-1/2 rounded-lg"></div>
            <div class="skeleton h-3 w-1/3 rounded-lg"></div>
          </div>
        </div>`
        )
        .join("")}
    </div>`;
}
