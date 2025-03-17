// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getVideoUrl") {
    sendResponse({ url: window.location.href });
  }
});

// Optional: Add a button to the YouTube player
function addMpvButton() {
  const ytpRightControls = document.querySelector('.ytp-right-controls');
  if (!ytpRightControls || document.querySelector('.mpv-button')) return;

  const button = document.createElement('button');
  button.className = 'ytp-button mpv-button';
  button.title = 'Open in MPV';
  button.innerHTML = 'MPV';
  button.style.fontSize = '13px';
  
  button.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openInMpv', url: window.location.href });
  });

  ytpRightControls.insertBefore(button, ytpRightControls.firstChild);
}

// Run when page loads
addMpvButton();

// Run when navigation occurs (for YouTube's SPA navigation)
const observer = new MutationObserver(() => {
  if (window.location.href.includes('watch?v=')) {
    setTimeout(addMpvButton, 1000); // Wait for player to load
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
}); 