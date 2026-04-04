// ==UserScript==
// @name         TMDB to Infuse
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Seamlessly open TMDB movies and shows in Infuse.
// @author       xSequip
// @match        https://www.themoviedb.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=themoviedb.org
// @updateURL    https://github.com/lunanfo/TMDB2Infuse/raw/master/userscript/TMDB2Infuse.user.js
// @downloadURL  https://github.com/lunanfo/TMDB2Infuse/raw/master/userscript/TMDB2Infuse.user.js
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // Infuse icon asset (Base64 encoded)
    const INFUSE_ICON_URL = 'data:image/png;base64,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';

    // Premium styling for Infuse injection
    const css = `
/* Common button style for consistency */
.infuse-btn-common {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ff5722 0%, #e64a19 100%);
    color: white !important;
    border-radius: 6px;
    padding: 4px 10px;
    margin-left: 10px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    text-decoration: none !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 3px 8px rgba(255, 87, 34, 0.3);
    border: none;
    gap: 10px;
    vertical-align: middle;
}

.infuse-btn-common:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 12px rgba(255, 87, 34, 0.45);
    background: linear-gradient(135deg, #ff7043 0%, #f4511e 100%);
}

.infuse-btn-common:active {
    transform: translateY(1px);
}

.infuse-btn-common img {
    margin: 0;
    padding: 0;
    border-radius: 3px;
}

.infuse-btn-text {
    font-family: inherit;
    line-height: 1;
}

/* Header button specific style */
.infuse-inject-btn {
    padding: 6px 14px;
    font-size: 13px;
    border-radius: 8px;
    margin: 5px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
}

.infuse-inject-icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
}

/* Specific styling for the JustWatch/OTT filter section injection */
.ott_filter li.infuse-list-item {
    display: inline-flex;
    align-items: center;
    margin-right: 12px;
    height: 48px; /* Match TMDB icons container height */
}

.infuse-provider-btn {
    margin-left: 0 !important;
    padding: 6px 12px;
}

/* Episode and Season link specific tweaks */
.infuse-episode-link, .infuse-season-inline-link {
    margin-left: 12px !important;
    padding: 3px 8px;
    font-size: 12px;
}

.infuse-season-inline-link {
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.infuse-season-inline-link:hover {
    transform: scale(1.05) translateY(-1px);
}

.infuse-search-result-btn {
    display: inline-flex !important;
    margin-top: 4px !important;
    margin-left: 0 !important; /* Force left alignment with title */
    padding: 3px 10px;
    font-size: 11px;
    border-radius: 4px;
    width: fit-content !important;
}

.infuse-search-result-btn img {
    width: 12px !important;
    height: 12px !important;
}

/* Container to force the search button to its own line below Name and Date */
.infuse-search-btn-container {
    width: 100% !important;
    display: block !important;
    clear: both;
}

/* Ensure search card title area flows naturally */
.card.v4.tight .details .wrapper .title {
    position: relative !important;
    padding-right: 0 !important;
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center;
}

/* Grid Card (Popular, etc.) specific button styling */
.infuse-grid-btn-container {
    width: 100% !important;
    display: block !important;
    margin-top: 4px;
}

.infuse-grid-btn {
    padding: 3px 8px !important;
    font-size: 11px !important;
    border-radius: 4px;
    margin-left: 0 !important; /* Force left alignment */
    justify-content: flex-start !important;
}

.infuse-grid-btn img {
    width: 13px !important;
    height: 13px !important;
}

/* Mutation proofing */
.infuse-icon-injected {
    /* Marker class */
}
    `;

    GM_addStyle(css);

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

    /**
     * Parses a TMDB URL to extract the ID and construct an Infuse deep link.
     */
    function parseTmdbToInfuse(urlOrPath) {
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

    function injectInfuseUI() {
        injectWhereToWatch();
        injectMovieHeader();
        injectEpisodeItems();
        injectTVSeasonSections();
        injectSearchResults();
        injectGridCards();
    }

    function injectWhereToWatch() {
        const providersLists = document.querySelectorAll('ul.ott_filter');
        providersLists.forEach(list => {
            if (isAlreadyInjected(list)) return;
            const deepLink = parseTmdbToInfuse(window.location.pathname);
            if (!deepLink) return;
            const li = document.createElement('li');
            li.className = 'infuse-list-item infuse-icon-injected';
            const a = createInfuseIcon(deepLink, 'infuse-provider-btn', '18px');
            li.appendChild(a);
            list.prepend(li);
        });
    }

    function injectMovieHeader() {
        const actions = document.querySelector('ul.actions');
        if (actions && !isAlreadyInjected(actions)) {
            const deepLink = parseTmdbToInfuse(window.location.pathname);
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

    function injectEpisodeItems() {
        const episodes = document.querySelectorAll('div.episode_list .item, .info .title');
        episodes.forEach(episode => {
            if (isAlreadyInjected(episode)) return;
            const link = episode.querySelector('a[href*="/episode/"]');
            if (link) {
                const deepLink = parseTmdbToInfuse(link.getAttribute('href'));
                if (deepLink) {
                    const infuseLink = createInfuseIcon(deepLink, 'infuse-episode-link', '16px');
                    link.parentNode.insertBefore(infuseLink, link.nextSibling);
                }
            }
        });
    }

    function injectTVSeasonSections() {
        const seasonLabels = document.querySelectorAll(`
            section.panel.season.card div.content h2 a,
            .season div.content h2 a,
            div.season div.content h2 a
        `);
        seasonLabels.forEach(labelLink => {
            const parent = labelLink.parentNode;
            if (isAlreadyInjected(parent)) return;
            const deepLink = parseTmdbToInfuse(labelLink.getAttribute('href'));
            if (deepLink) {
                const infuseLink = createInfuseIcon(deepLink, 'infuse-season-inline-link', '18px');
                parent.appendChild(infuseLink);
            }
        });
    }

    function injectSearchResults() {
        const searchCards = document.querySelectorAll('div.card.v4.tight');
        searchCards.forEach(card => {
            const titleContainer = card.querySelector('.details .wrapper .title');
            const resultLink = card.querySelector('a.result');
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

    function injectGridCards() {
        const gridCards = document.querySelectorAll('div.card.style_1');
        gridCards.forEach(card => {
            const content = card.querySelector('.content');
            const titleLink = card.querySelector('h2 a') || card.querySelector('a[href*="/movie/"], a[href*="/tv/"]');
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

    // Mutation observer for single page application navigation and dynamic loading
    const observer = new MutationObserver(() => injectInfuseUI());
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial run
    injectInfuseUI();

    // Context menu command for Tampermonkey menu
    GM_registerMenuCommand("Open current page in Infuse", () => {
        const deepLink = parseTmdbToInfuse(window.location.pathname);
        if (deepLink) {
            window.location.href = deepLink;
        } else {
            alert("This page doesn't seem to be a TMDB movie or TV show page.");
        }
    });

})();
