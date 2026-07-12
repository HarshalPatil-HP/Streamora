import "./css/input.css";
import { initAuth, subscribe } from "./context/authContext.js";
import { createLayout, updateLayoutActiveState, refreshHeader } from "./components/Layout.js";
import { parseHash, getRouteRenderer } from "./router.js";

const app = document.getElementById("app");
const renderRoute = getRouteRenderer();

let layoutInstance = null;
let isRendering = false;

async function render() {
  if (isRendering) return;
  isRendering = true;

  try {
    const { pathname, params, notFound } = parseHash();
    const result = await renderRoute(pathname, params);

    if (result.blocked) {
      isRendering = false;
      await render();
      return;
    }

    const { html, layout, mount, params: pageParams } = result;

    if (layout) {
      if (!layoutInstance) {
        app.innerHTML = "";
        layoutInstance = createLayout(pathname);
        app.appendChild(layoutInstance.wrapper);
      } else {
        updateLayoutActiveState(pathname);
        refreshHeader();
      }

      if (notFound) {
        layoutInstance.main.innerHTML = `
          <div class="surface-card flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3F3F3]">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
            </div>
            <h2 class="text-2xl font-bold text-[#0A0A0A]">Page not found</h2>
            <p class="mt-2 max-w-xs text-sm text-[#888]">The page you're looking for doesn't exist or has been moved.</p>
            <a href="#/" class="btn-primary mt-6">Go Home</a>
          </div>
        `;
      } else {
        layoutInstance.main.innerHTML = html;
        if (mount) await mount(pageParams);
      }
    } else {
      layoutInstance = null;
      app.innerHTML = html;
      if (mount) await mount(pageParams);
    }

    const titles = {
      "/": "Discover",
      "/tweets": "Community",
      "/dashboard": "Dashboard",
      "/login": "Sign In",
      "/signup": "Sign Up",
    };
    const pageTitle = titles[pathname] || pathname.slice(1);
    document.title = `Streamora${pathname !== "/" ? ` — ${pageTitle}` : ""}`;
  } finally {
    isRendering = false;
  }
}

async function bootstrap() {
  await initAuth();
  subscribe(() => refreshHeader());

  if (!window.location.hash) {
    window.location.hash = "#/";
  } else {
    await render();
  }
}

window.addEventListener("hashchange", render);
window.addEventListener("load", bootstrap);
