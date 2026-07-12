import { HomePage, mountHomePage } from "./pages/HomePage.js";
import { WatchPage, mountWatchPage } from "./pages/WatchPage.js";
import { TweetFeedPage, mountTweetFeedPage } from "./pages/TweetFeedPage.js";
import { ChannelPage, mountChannelPage } from "./pages/ChannelPage.js";
import { DashboardPage, mountDashboardPage } from "./pages/DashboardPage.js";
import { LoginPage, mountLoginPage } from "./pages/LoginPage.js";
import { SignupPage, mountSignupPage } from "./pages/SignupPage.js";
import { getAuthState } from "./context/authContext.js";

const routes = [
  { path: "/", component: HomePage, mount: mountHomePage, layout: true, public: true },
  { path: "/tweets", component: TweetFeedPage, mount: mountTweetFeedPage, layout: true, public: true },
  { path: "/dashboard", component: DashboardPage, mount: mountDashboardPage, layout: true, protected: true },
  { path: "/watch/:id", component: WatchPage, mount: mountWatchPage, layout: true, public: true },
  { path: "/channel/:username", component: ChannelPage, mount: mountChannelPage, layout: true, public: true },
  { path: "/login", component: LoginPage, mount: mountLoginPage, layout: false, guestOnly: true },
  { path: "/signup", component: SignupPage, mount: mountSignupPage, layout: false, guestOnly: true },
];

function matchRoute(pathname) {
  for (const route of routes) {
    const paramNames = [];
    const pattern = route.path
      .replace(/:([^/]+)/g, (_, name) => {
        paramNames.push(name);
        return "([^/]+)";
      })
      .replace(/\//g, "\\/");

    const regex = new RegExp(`^${pattern}$`);
    const match = pathname.match(regex);

    if (match) {
      const params = {};
      paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });
      return { route, params };
    }
  }
  return null;
}

export function parseHash() {
  const hash = window.location.hash.slice(1) || "/";
  const [pathPart, queryPart] = hash.split("?");
  const pathname = pathPart || "/";
  const matched = matchRoute(pathname);

  const query = Object.fromEntries(new URLSearchParams(queryPart || ""));

  if (matched) {
    return {
      pathname,
      params: { ...matched.params, ...query },
      route: matched.route,
      notFound: false,
    };
  }

  return { pathname, params: query, route: null, notFound: true };
}

export function navigate(path) {
  window.location.hash = path.startsWith("#") ? path : `#${path}`;
}

export function getRedirectPath() {
  const { params } = parseHash();
  return params.redirect || null;
}

export function getRouteRenderer() {
  return async (pathname, params) => {
    const matched = matchRoute(pathname);

    if (!matched) {
      return { html: "", layout: true, notFound: true, mount: null, route: null };
    }

    const { route, params: routeParams } = matched;
    const allParams = { ...routeParams, ...params };
    const { isAuthenticated } = getAuthState();

    if (route.protected && !isAuthenticated) {
      const redirect = encodeURIComponent(pathname);
      navigate(`/login?redirect=${redirect}`);
      return { html: "", layout: false, blocked: true, mount: null, route: null, params: allParams };
    }

    if (route.guestOnly && isAuthenticated) {
      navigate("/");
      return { html: "", layout: true, blocked: true, mount: null, route: null, params: allParams };
    }

    const html = await route.component(allParams);

    return {
      html,
      layout: route.layout,
      notFound: false,
      mount: route.mount,
      params: allParams,
      route,
    };
  };
}
