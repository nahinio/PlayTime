const refreshBtn = document.getElementById('refreshBtn');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const timeEl = document.getElementById('time');
const metaEl = document.getElementById('meta');

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function setLoading() {
  statusEl.textContent = 'Calculating...';
  resultEl.classList.add('hidden');
}

function setError(msg) {
  statusEl.textContent = msg;
  resultEl.classList.add('hidden');
}

function setResult(totalSeconds, count) {
  statusEl.textContent = '';
  timeEl.textContent = formatTime(totalSeconds);
  metaEl.textContent = `${count} video${count !== 1 ? 's' : ''}`;
  resultEl.classList.remove('hidden');
}

async function calculate() {
  setLoading();
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url.includes('youtube.com/playlist')) {
      setError('Open a YouTube playlist first.');
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: 'CALCULATE_PLAYLIST_DURATION' }, (res) => {
      if (chrome.runtime.lastError) {
        setError('Reload the YouTube playlist page and try again.');
        return;
      }
      if (!res?.success) {
        setError('Calculation failed.');
        return;
      }
      setResult(res.totalSeconds, res.count);
    });
  } catch (err) {
    console.error(err);
    setError('Unexpected error.');
  }
}

refreshBtn.addEventListener('click', calculate);
