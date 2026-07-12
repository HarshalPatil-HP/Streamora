import "./css/input.css";
import { createLayout, updateLayoutActiveState } from "./components/Layout.js";
import { parseHash, getRouteRenderer } from "./router.js";

const app = document.getElementById("app");
const renderRoute = getRouteRenderer();

let layoutInstance = null;

function render() {
  const { pathname, params, notFound } = parseHash();
  const { html, layout } = renderRoute(pathname, params);

  if (layout) {
    if (!layoutInstance) {
      app.innerHTML = "";
      layoutInstance = createLayout(pathname);
      app.appendChild(layoutInstance.wrapper);
    } else {
      updateLayoutActiveState(pathname);
    }

    layoutInstance.main.innerHTML = html;

    if (notFound) {
      layoutInstance.main.innerHTML = `
        <div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h2 class="text-2xl font-semibold text-slate-50">Page not found</h2>
          <p class="mt-2 text-slate-400">The page you're looking for doesn't exist.</p>
          <a href="#/" class="btn-primary mt-6 inline-block">Go Home</a>
        </div>
      `;
    }
  } else {
    layoutInstance = null;
    app.innerHTML = html;
  }

  document.title = `Streamora${pathname !== "/" ? ` — ${pathname.slice(1)}` : ""}`;
}

window.addEventListener("hashchange", render);
window.addEventListener("load", render);

if (!window.location.hash) {
  window.location.hash = "#/";
}
