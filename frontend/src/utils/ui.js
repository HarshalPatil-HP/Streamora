import { escapeHtml } from "./format.js";

let toastContainer = null;

export function showToast(message, type = "info") {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "fixed bottom-6 right-6 z-[100] flex flex-col gap-2";
    document.body.appendChild(toastContainer);
  }

  const colors = {
    info: "bg-slate-800 text-white",
    success: "bg-emerald-600 text-white",
    error: "bg-red-500 text-white",
  };

  const toast = document.createElement("div");
  toast.className = `rounded-xl px-4 py-3 text-sm font-medium shadow-card ${colors[type] || colors.info} animate-[slideIn_0.3s_ease]`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

export function renderSpinner(size = "md") {
  const sizes = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-12 w-12" };
  return `<div class="flex items-center justify-center py-12"><div class="${sizes[size]} animate-spin rounded-full border-2 border-brand-200 border-t-brand-600"></div></div>`;
}

export function renderEmptyState({ title, description, actionHtml = "" }) {
  return `
    <div class="surface-card flex flex-col items-center justify-center py-16 text-center">
      <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
      </div>
      <h3 class="text-lg font-semibold text-slate-900">${escapeHtml(title)}</h3>
      <p class="mt-2 max-w-sm text-sm text-slate-500">${escapeHtml(description)}</p>
      ${actionHtml ? `<div class="mt-6">${actionHtml}</div>` : ""}
    </div>
  `;
}

export function renderSkeletonGrid(count = 8) {
  return `<div class="video-grid">${Array.from({ length: count })
    .map(
      () => `
      <div class="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-soft">
        <div class="skeleton aspect-video w-full"></div>
        <div class="space-y-2 p-4">
          <div class="skeleton h-4 w-3/4"></div>
          <div class="skeleton h-3 w-1/2"></div>
        </div>
      </div>`
    )
    .join("")}</div>`;
}
