import { renderPagePlaceholder } from "../components/Layout.js";

export function ChannelPage(params) {
  const username = params.username || "demo";
  return renderPagePlaceholder(
    `@${username}`,
    "Channel profile with Videos, Tweets, and Playlists tabs coming in a future phase."
  );
}
