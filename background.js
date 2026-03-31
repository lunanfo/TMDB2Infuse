// TMDB to Infuse Background Script
// Handles context menu creation and navigation

const TMDB_URL_PATTERN = "*://www.themoviedb.org/*";

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openInInfuse",
    title: "Open in Infuse",
    contexts: ["link", "image", "page"],
    documentUrlPatterns: [TMDB_URL_PATTERN]
  });
});

// Listener for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openInInfuse") {
    let url = info.linkUrl || info.srcUrl || info.pageUrl;
    if (url) {
      const deepLink = parseTmdbUrlToInfuse(url);
      if (deepLink) {
        chrome.tabs.update(tab.id, { url: deepLink });
      }
    }
  }
});

/**
 * Parses a TMDB URL to extract the ID and construct an Infuse deep link.
 * Handles movies, TV shows, seasons, and episodes.
 */
function parseTmdbUrlToInfuse(url) {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    // Movie: /movie/123-title
    const movieMatch = path.match(/^\/movie\/(\d+)/);
    if (movieMatch) {
      return `infuse://movie/${movieMatch[1]}`;
    }

    // TV Episode: /tv/123-title/season/1/episode/1
    const episodeMatch = path.match(/^\/tv\/(\d+)[^/]*\/season\/(\d+)\/episode\/(\d+)/);
    if (episodeMatch) {
      return `infuse://series/${episodeMatch[1]}-${episodeMatch[2]}-${episodeMatch[3]}`;
    }

    // TV Season: /tv/123-title/season/1
    const seasonMatch = path.match(/^\/tv\/(\d+)[^/]*\/season\/(\d+)/);
    if (seasonMatch) {
      return `infuse://series/${seasonMatch[1]}-${seasonMatch[2]}`;
    }

    // TV Series: /tv/123-title
    const seriesMatch = path.match(/^\/tv\/(\d+)/);
    if (seriesMatch) {
      return `infuse://series/${seriesMatch[1]}`;
    }

    return null;
  } catch (e) {
    console.error("Failed to parse TMDB URL:", e);
    return null;
  }
}
