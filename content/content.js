console.log('YT Duration: content script loaded');

function parseTimeString(timeStr) {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().replace(/[^0-9:]/g, '');
  const parts = cleaned.split(':').map(p => parseInt(p, 10) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0];
}

function collectDurations() {
  const elements = document.querySelectorAll('ytd-thumbnail-overlay-time-status-renderer span');
  return Array.from(elements)
    .map(el => el.textContent.trim())
    .filter(Boolean);
}

function calculateTotal() {
  const durations = collectDurations();
  let total = 0;
  durations.forEach(d => (total += parseTimeString(d)));
  return { totalSeconds: total, count: durations.length };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'CALCULATE_PLAYLIST_DURATION') {
    try {
      const result = calculateTotal();
      sendResponse({ success: true, ...result });
    } catch (err) {
      console.error('Error:', err);
      sendResponse({ success: false, error: err.message });
    }
    return true;
  }
});
