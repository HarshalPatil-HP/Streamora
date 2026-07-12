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
            <h2 class="text-2xl font-semibold text-slate-900">Page not found</h2>
            <p class="mt-2 text-slate-500">The page you're looking for doesn't exist.</p>
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
