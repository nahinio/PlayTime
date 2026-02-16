const container = document.querySelector('.container');
const contentEl = document.getElementById('content');
const emptyEl = document.getElementById('empty-state');
const timeEl = document.getElementById('total-time');
const countEl = document.getElementById('video-count');
const avgEl = document.getElementById('avg-time');
const speed125El = document.getElementById('speed-125');
const speed150El = document.getElementById('speed-150');
const speed200El = document.getElementById('speed-200');

// Schedule Elements
const toggleScheduleBtn = document.getElementById('toggle-schedule-btn');
const scheduleOptions = document.getElementById('schedule-options');
const daysInput = document.getElementById('days-input');
const startDateInput = document.getElementById('start-date-input');
const videosPerDayEl = document.getElementById('videos-per-day');
const downloadIcsBtn = document.getElementById('download-ics-btn');

let currentData = null; // Store the latest data

function formatDuration(seconds) {
  if (!seconds) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 && h === 0) parts.push(`${s}s`);

  return parts.join(' ');
}

function formatShort(seconds) {
  if (!seconds) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function updateUI(data) {
  currentData = data;
  if (!data || data.count === 0) {
    showEmptyState();
    return;
  }

  showContentState();

  const { totalSeconds, count } = data;

  timeEl.textContent = formatDuration(totalSeconds);
  countEl.textContent = `${count} Videos`;

  // Calculate average
  const avg = Math.round(totalSeconds / count);
  avgEl.textContent = formatDuration(avg);

  // Calculate speeds
  speed125El.textContent = formatShort(Math.round(totalSeconds / 1.25));
  speed150El.textContent = formatShort(Math.round(totalSeconds / 1.5));
  speed200El.textContent = formatShort(Math.round(totalSeconds / 2.0));

  updateSchedulePreview();
}

function updateSchedulePreview() {
  if (!currentData || !daysInput.value) return;
  const days = parseInt(daysInput.value, 10) || 1;
  const count = currentData.count;
  const vpd = Math.ceil(count / days);
  videosPerDayEl.textContent = `${vpd}`;
}

function showEmptyState() {
  contentEl.classList.add('hidden');
  emptyEl.classList.remove('hidden');
}

function showContentState() {
  emptyEl.classList.add('hidden');
  contentEl.classList.remove('hidden');
}

// Calendar Logic
function createICS(data, days, startDateStr) {
  const count = data.count;
  const totalSeconds = data.totalSeconds;
  const videos = data.videos || [];
  const playlistUrl = data.url || 'https://youtube.com';
  const playlistTitle = data.title || 'Playlist';

  // Helper to format date for ICS (YYYYMMDD)
  const formatDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 8);

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PlayTime//Learning Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  let remainingVideos = count;
  let remainingTime = totalSeconds;
  let videoIndex = 0;

  let currentDate = startDateStr ? new Date(startDateStr) : new Date();
  if (!startDateStr) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  for (let i = 0; i < days; i++) {
    const dayVideosCount = Math.ceil(remainingVideos / (days - i));
    const daySeconds = Math.round(remainingTime / (days - i));

    // Get videos for this day
    const daysVideoSlice = videos.slice(videoIndex, videoIndex + dayVideosCount);

    // Custom Description Format
    let description = `Goal: Complete ${dayVideosCount} videos (approx ${formatShort(daySeconds)}).`;
    description += `\\n\\nPlaylist Link: ${playlistUrl}`;

    // Video list removed as per user request

    remainingVideos -= dayVideosCount;
    remainingTime -= daySeconds;
    videoIndex += dayVideosCount;

    if (dayVideosCount <= 0) break;

    const startDate = formatDate(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);

    // Reminders: 12:00 AM (Start), 12:00 PM (+12h), 8:00 PM (+20h)
    // ICS All Day events start at 00:00:00 of the day.

    icsContent.push(
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${startDate}`,
      `SUMMARY:PlayTime: ${playlistTitle} (Videos ${videoIndex - dayVideosCount + 1}-${videoIndex})`,
      `DESCRIPTION:${description}`,

      // 12:00 AM (Start of day)
      'BEGIN:VALARM',
      'TRIGGER:PT0S',
      'DESCRIPTION:Start Learning',
      'ACTION:DISPLAY',
      'END:VALARM',

      // 12:00 PM (Noon)
      'BEGIN:VALARM',
      'TRIGGER:PT12H',
      'DESCRIPTION:Noon Check-in',
      'ACTION:DISPLAY',
      'END:VALARM',

      // 8:00 PM (Evening)
      'BEGIN:VALARM',
      'TRIGGER:PT20H',
      'DESCRIPTION:Evening Review',
      'ACTION:DISPLAY',
      'END:VALARM',

      'END:VEVENT'
    );
  }

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
}

function handleDownloadICS() {
  if (!currentData || currentData.count === 0) return;

  const days = parseInt(daysInput.value, 10);
  const startDate = startDateInput.value;

  // Basic Validation
  if (days < 1) return;

  const icsData = createICS(currentData, days, startDate);
  const blob = new Blob([icsData], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'playtime-schedule.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Event Listeners
if (toggleScheduleBtn) {
  toggleScheduleBtn.addEventListener('click', () => {
    scheduleOptions.classList.toggle('hidden');
    // Default to tomorrow if not set
    if (!startDateInput.value) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      startDateInput.valueAsDate = tomorrow;
    }
  });

  daysInput.addEventListener('input', updateSchedulePreview);
  downloadIcsBtn.addEventListener('click', handleDownloadICS);
}

async function init() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.url?.includes('youtube.com')) {
      showEmptyState();
      return;
    }

    const port = chrome.tabs.connect(tab.id, { name: 'playtime-connection' });

    port.onMessage.addListener((msg) => {
      if (msg.type === 'UPDATE') {
        updateUI(msg.data);
      }
    });

    port.onDisconnect.addListener(() => {
      if (chrome.runtime.lastError) {
        console.log('Connection failed:', chrome.runtime.lastError.message);
        contentEl.classList.add('hidden');
        emptyEl.innerHTML = `
          <div class="empty-icon">⚠️</div>
          <p>Connection failed.</p>
          <small>Please reload the YouTube page.</small>
        `;
        emptyEl.classList.remove('hidden');
      }
    });

  } catch (err) {
    console.error('Initialization error:', err);
    showEmptyState();
  }
}

init();
