/**
 * TMDB to Infuse Content Script
 * Injects Infuse deep links into TMDB pages.
 */

// Infuse icon asset (using extension icon via chrome.runtime.getURL)
const INFUSE_ICON_URL = chrome.runtime.getURL('icons/infuse.png');

/**
 * Robust check if an Infuse icon is already injected in a container
 */
function isAlreadyInjected(container) {
  return container.querySelector('.infuse-icon-injected') !== null;
}

/**
 * Creates a standard Infuse icon button with text
 */
function createInfuseIcon(deepLink, className, size = '16px', showText = true) {
  const a = document.createElement('a');
  a.className = `${className} infuse-icon-injected infuse-btn-common`;
  a.href = deepLink;
  
  a.innerHTML = `
    <img src="${INFUSE_ICON_URL}" style="width:${size}; height:${size};" />
    ${showText ? '<span class="infuse-btn-text">Infuse</span>' : ''}
  `;
  return a;
}

// Observe the DOM for dynamic sections or pages
const observer = new MutationObserver((mutations) => {
  // Use a slight throttle/debounce if needed, but for now direct call is fine
  injectInfuseUI();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial injection
injectInfuseUI();

function injectInfuseUI() {
  injectWhereToWatch();
  injectMovieHeader();
  injectEpisodeItems();
  injectTVSeasonSections();
  injectSearchResults();
  injectGridCards();
}

/**
 * Injects Infuse icon into "Where to Watch" (OTT) section
 */
function injectWhereToWatch() {
  const providersLists = document.querySelectorAll('ul.ott_filter');
  providersLists.forEach(list => {
    if (isAlreadyInjected(list)) return;

    const deepLink = getDeepLinkForCurrentPage();
    if (!deepLink) return;

    const li = document.createElement('li');
    li.className = 'infuse-list-item infuse-icon-injected';
    const a = createInfuseIcon(deepLink, 'infuse-provider-btn', '18px');
    li.appendChild(a);
    list.prepend(li);
  });
}

/**
 * Injects a prominent Infuse button in the movie/TV header area
 */
function injectMovieHeader() {
  const actions = document.querySelector('ul.actions');
  if (actions && !isAlreadyInjected(actions)) {
    const deepLink = getDeepLinkForCurrentPage();
    if (!deepLink) return;

    const li = document.createElement('li');
    li.className = 'infuse-icon-injected';
    const a = document.createElement('a');
    a.className = 'infuse-inject-btn infuse-btn-common infuse-icon-injected';
    a.href = deepLink;
    a.innerHTML = `
      <img src="${INFUSE_ICON_URL}" class="infuse-inject-icon" />
      <span>Infuse</span>
    `;
    li.appendChild(a);
    actions.appendChild(li);
  }
}

/**
 * Injects Infuse icons into episode lists
 */
function injectEpisodeItems() {
  const episodes = document.querySelectorAll('div.episode_list .item, .info .title');
  episodes.forEach(episode => {
    if (isAlreadyInjected(episode)) return;

    const link = episode.querySelector('a[href*="/episode/"]');
    if (link) {
      const match = link.getAttribute('href').match(/\/tv\/(\d+)[^/]*\/season\/(\d+)\/episode\/(\d+)/);
      if (match) {
        const deepLink = `infuse://series/${match[1]}-${match[2]}-${match[3]}`;
        const infuseLink = createInfuseIcon(deepLink, 'infuse-episode-link', '16px');
        link.parentNode.insertBefore(infuseLink, link.nextSibling);
      }
    }
  });
}

/**
 * Injects Infuse icons for Season-related sections
 */
function injectTVSeasonSections() {
  const seasonLabels = document.querySelectorAll(`
    section.panel.season.card div.content h2 a,
    .season div.content h2 a,
    div.season div.content h2 a
  `);

  seasonLabels.forEach(labelLink => {
    const parent = labelLink.parentNode;
    if (isAlreadyInjected(parent)) return;

    const href = labelLink.getAttribute('href');
    if (!href) return;

    const match = href.match(/\/tv\/(\d+)[^/]*\/season\/(\d+)/);
    if (match) {
      const deepLink = `infuse://series/${match[1]}-${match[2]}`;
      const infuseLink = createInfuseIcon(deepLink, 'infuse-season-inline-link', '18px');
      parent.appendChild(infuseLink);
    }
  });
}

/**
 * Injects Infuse icons into Search Results
 */
function injectSearchResults() {
  const searchCards = document.querySelectorAll('.search_results div.flex.flex-nowrap, article.card.v4, div.card.v4.search_results, div.card.v4.tight');
  searchCards.forEach(card => {
    const titleContainer = card.querySelector('.details .wrapper .title') || card.querySelector('div.flex.flex-wrap.w-full.flex-wrap');
    const resultLink = card.querySelector('a.result') || card.querySelector('a.font-normal');
    
    if (titleContainer && resultLink && !isAlreadyInjected(titleContainer)) {
      const deepLink = parseTmdbToInfuse(resultLink.getAttribute('href'));
      if (deepLink) {
        const container = document.createElement('div');
        container.className = 'infuse-search-btn-container infuse-icon-injected';
        const infuseLink = createInfuseIcon(deepLink, 'infuse-search-result-btn', '14px');
        container.appendChild(infuseLink);
        titleContainer.appendChild(container);
      }
    }
  });
}

/**
 * Injects Infuse icons into Grid Cards & Homepage Scrollers
 */
function injectGridCards() {
  const gridCards = document.querySelectorAll('div.card.style_1, div.comp\\:poster-card, div.comp\\:poster-item, div.comp\\:media-card');
  gridCards.forEach(card => {
    const content = card.querySelector('.content') || card.querySelector('div.mt-2') || card;
    const titleLink = card.querySelector('h3 a, h2 a, a.font-normal') || card.querySelector('a[href*="/movie/"], a[href*="/tv/"]');
    
    if (content && titleLink && !isAlreadyInjected(content)) {
      const deepLink = parseTmdbToInfuse(titleLink.getAttribute('href'));
      if (deepLink) {
        const dateElement = content.querySelector('p');
        const container = document.createElement('div');
        container.className = 'infuse-grid-btn-container infuse-icon-injected';
        const infuseLink = createInfuseIcon(deepLink, 'infuse-grid-btn', '14px');
        container.appendChild(infuseLink);
        
        if (dateElement) {
          dateElement.parentNode.insertBefore(container, dateElement.nextSibling);
        } else {
          content.appendChild(container);
        }
      }
    }
  });
}

/**
 * Helper to get Infuse deep link based on current page URL
 */
function getDeepLinkForCurrentPage() {
  return parseTmdbToInfuse(window.location.pathname);
}

/**
 * Parses a TMDB URL to extract the ID and construct an Infuse deep link.
 */
function parseTmdbToInfuse(urlOrPath) {
    if (!urlOrPath) return null;
    const path = urlOrPath.startsWith('http') ? new URL(urlOrPath).pathname : urlOrPath;

    // Movie: /movie/123-title
    const movieMatch = path.match(/^\/movie\/(\d+)/);
    if (movieMatch) return `infuse://movie/${movieMatch[1]}`;

    // TV Episode: /tv/123-title/season/1/episode/1
    const episodeMatch = path.match(/^\/tv\/(\d+)[^/]*\/season\/(\d+)\/episode\/(\d+)/);
    if (episodeMatch) return `infuse://series/${episodeMatch[1]}-${episodeMatch[2]}-${episodeMatch[3]}`;

    // TV Season: /tv/123-title/season/1
    const seasonMatch = path.match(/^\/tv\/(\d+)[^/]*\/season\/(\d+)/);
    if (seasonMatch) return `infuse://series/${seasonMatch[1]}-${seasonMatch[2]}`;

    // TV Series: /tv/123-title
    const seriesMatch = path.match(/^\/tv\/(\d+)/);
    if (seriesMatch) return `infuse://series/${seriesMatch[1]}`;

    return null;
}
