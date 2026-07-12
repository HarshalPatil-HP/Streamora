import { renderPagePlaceholder } from "../components/Layout.js";

export function WatchPage(params) {
  const videoId = params.id || "—";
  return renderPagePlaceholder(
    "Watch Video",
    `Cinematic player, recommendations, and comments for video ID: ${videoId}. Coming in a future phase.`
  );
}
