self.addEventListener('install', () => {
  console.log('YT Duration: service worker installed');
});

self.addEventListener('activate', () => {
  console.log('YT Duration: service worker active');
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  
});
