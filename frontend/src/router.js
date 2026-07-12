import { HomePage } from "./pages/HomePage.js";
import { WatchPage } from "./pages/WatchPage.js";
import { TweetFeedPage } from "./pages/TweetFeedPage.js";
import { ChannelPage } from "./pages/ChannelPage.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { SignupPage } from "./pages/SignupPage.js";

const routes = [
  { path: "/", component: HomePage, layout: true },
  { path: "/tweets", component: TweetFeedPage, layout: true },
  { path: "/dashboard", component: DashboardPage, layout: true },
  { path: "/watch/:id", component: WatchPage, layout: true },
  { path: "/channel/:username", component: ChannelPage, layout: true },
  { path: "/login", component: LoginPage, layout: false },
  { path: "/signup", component: SignupPage, layout: false },
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
  const [pathPart] = hash.split("?");
  const pathname = pathPart || "/";
  const matched = matchRoute(pathname);

  if (matched) {
    return {
      pathname,
      params: matched.params,
      route: matched.route,
      notFound: false,
    };
  }

  return {
    pathname,
    params: {},
    route: routes[0],
    notFound: true,
  };
}

export function navigate(path) {
  window.location.hash = path.startsWith("#") ? path : `#${path}`;
}

export function getRouteRenderer() {
  return (pathname, params) => {
    const matched = matchRoute(pathname);
    if (!matched) {
      return {
        html: HomePage(),
        layout: true,
        notFound: true,
      };
    }

    const { route, params: routeParams } = matched;
    return {
      html: route.component({ ...routeParams, ...params }),
      layout: route.layout,
      notFound: false,
    };
  };
}
