console.log('PlayTime: Content script loaded');

let observer = null;
let port = null;

// robust time parser (H:M:S, M:S, S)
function parseTime(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':').map(p => parseInt(p, 10));
  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return 0;
}

function getPlaylistDuration() {
  const currentUrl = window.location.href;
  const urlParams = new URLSearchParams(window.location.search);

  const isPlaylistPage = currentUrl.includes('/playlist');
  const isWatchPage = currentUrl.includes('/watch') && urlParams.has('list');

  let containerSelector = '';
  let timeSelector = 'span.ytd-thumbnail-overlay-time-status-renderer';
  let titleSelector = '#video-title';

  if (isPlaylistPage) {
    // Main playlist page
    containerSelector = 'ytd-playlist-video-renderer';
  } else if (isWatchPage) {
    // Watch page sidebar
    containerSelector = 'ytd-playlist-panel-video-renderer';
  } else {
    return { totalSeconds: 0, count: 0, videos: [], url: currentUrl };
  }

  // Query containers first to keep title/time paired
  const containers = document.querySelectorAll(containerSelector);
  const videos = Array.from(containers).map(container => {
    // Skip hidden elements (like in sidebar)
    if (container.offsetParent === null) return null;

    const timeEl = container.querySelector(timeSelector);
    const titleEl = container.querySelector(titleSelector);

    if (!timeEl) return null;

    const timeStr = timeEl.textContent.trim();
    const duration = parseTime(timeStr);
    const title = titleEl ? (titleEl.getAttribute('title') || titleEl.textContent.trim()) : 'Unknown Video';

    return {
      title,
      duration,
      timeStr
    };
  }).filter(v => v !== null);

  const totalSeconds = videos.reduce((acc, v) => acc + v.duration, 0);

  // Extract Playlist URL and Title
  let playlistUrl = currentUrl;
  let playlistTitle = '';

  // Strategy 1: Context-specific DOM elements
  if (isWatchPage) {
    const listId = urlParams.get('list');
    playlistUrl = `https://www.youtube.com/playlist?list=${listId}`;

    const titleEl = document.querySelector('ytd-playlist-panel-renderer .title') ||
      document.querySelector('ytd-playlist-panel-renderer h3') ||
      document.querySelector('ytd-playlist-panel-renderer #header-description h3');
    if (titleEl) playlistTitle = titleEl.textContent.trim();

  } else if (isPlaylistPage) {
    const titleEl = document.querySelector('ytd-playlist-header-renderer h1') ||
      document.querySelector('#header-description h3');
    if (titleEl) playlistTitle = titleEl.textContent.trim();
  }

  // Strategy 2: Fallback to document metadata if DOM selection failed
  if (!playlistTitle || playlistTitle === 'Playlist') {
    // Try meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      playlistTitle = ogTitle.content.replace(' - YouTube', '');
    } else {
      // Last resort: Document title
      playlistTitle = document.title.replace(' - YouTube', '');
      // If on watch page, document title is video title, so this might be inaccurate, 
      // but better than nothing or we can skip if it looks like a video title.
      // Actually, on watch page, we really want the specific playlist sidebar title.
    }
  }

  // Final Fallback
  if (!playlistTitle) playlistTitle = 'Playlist';

  return { totalSeconds, count: videos.length, videos, url: playlistUrl, title: playlistTitle };
}

function sendUpdate() {
  if (port) {
    const data = getPlaylistDuration();
    port.postMessage({ type: 'UPDATE', data });
  }
}

// Setup mutation observer to detect infinite scroll or dynamic content loading
function startObserving() {
  if (observer) return;

  const targetNode = document.querySelector('ytd-app') || document.body;
  const config = { childList: true, subtree: true };

  let debounceTimer;
  observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      sendUpdate();
    }, 500);
  });

  observer.observe(targetNode, config);
}

function stopObserving() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

// Listen for YouTube's SPA navigation events
// yt-navigate-finish: fired when the page transition finishes
// yt-page-data-updated: fired when the page data (like video info) is updated
const events = ['yt-navigate-finish', 'yt-page-data-updated'];
events.forEach(event => {
  window.addEventListener(event, () => {
    // Small delay to ensure DOM might have begun updating (though Virtual DOM updates might be async)
    // The observer will catch the bulk of it, but this triggers an immediate "check URL" state
    sendUpdate();
  });
});

// Handle long-lived connection from popup
chrome.runtime.onConnect.addListener((p) => {
  if (p.name === 'playtime-connection') {
    port = p;
    startObserving();
    sendUpdate(); // Send initial state

    port.onDisconnect.addListener(() => {
      port = null;
      stopObserving();
    });
  }
});
