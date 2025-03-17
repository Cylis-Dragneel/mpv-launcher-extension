chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "open-in-mpv",
    title: "Open in MPV",
    contexts: ["link"],
    targetUrlPatterns: ["*://*.youtube.com/*", "*://*.youtu.be/*"]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Context menu creation failed:", chrome.runtime.lastError.message);
    } else {
      console.log("Context menu created successfully");
    }
  });
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.url && (tab.url.includes("youtube.com") || tab.url.includes("youtu.be"))) {
    sendToMpv(tab.url);
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "open-in-mpv") {
    sendToMpv(info.linkUrl);
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openInMpv') {
    sendToMpv(request.url);
  }
});

function showError(message) {
  console.error(message);
  chrome.notifications.create({
    type: "basic",
    title: "MPV Launcher Error",
    message: message,
    iconUrl: chrome.runtime.getURL("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")
  });
}

function sendToMpv(url) {
  if (!url || (!url.includes("youtube.com") && !url.includes("youtu.be"))) {
    showError("Invalid URL: Must be a YouTube URL");
    return;
  }

  console.log("Attempting to send URL to MPV:", url);

  try {
    const message = { url: url };
    console.log("Sending message:", JSON.stringify(message));

    chrome.runtime.sendNativeMessage(
      "com.example.mpv_launcher",
      message,
      (response) => {
        if (chrome.runtime.lastError) {
          const error = chrome.runtime.lastError.message;
          console.error("Native messaging error:", error);
          showError("Failed to launch MPV: " + error);
        } else {
          console.log("Native Response:", response);
        }
      }
    );
  } catch (e) {
    console.error("Exception:", e);
    showError("Unexpected error: " + e.message);
  }
}
