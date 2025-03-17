chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "open-in-mpv",
    title: "Open in MPV",
    contexts: ["link"],
    targetUrlPatterns: ["*://*.youtube.com/*", "*://*.youtu.be/*"],
  });
});

chrome.action.onClicked.addListener((tab) => {
  if (
    tab.url &&
    (tab.url.includes("youtube.com") || tab.url.includes("youtu.be"))
  ) {
    sendToMPV(tab.url);
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "open-in-mpv") {
    sendToMPV(info.linkUrl);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "open-in-mpv") {
    sendToMPV(message.url, sendResponse);
    return true; // Keep the message channel open for async response
  }
});

// Function to send a URL to MPV via native messaging
function sendToMPV(url, callback = null) {
  chrome.runtime.sendNativeMessage(
    "com.example.mpv_launcher",
    { url: url },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError.message);
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon48.png",
          title: "MPV Launcher Error",
          message: chrome.runtime.lastError.message,
        });
        if (callback)
          callback({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log("MPV launched successfully:", response);
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon48.png",
          title: "MPV Launcher",
          message: "Video sent to MPV",
        });
        if (callback) callback({ success: true });
      }
    },
  );
}
