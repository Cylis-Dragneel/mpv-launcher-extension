browser.menus.create(
  {
    id: "open-in-mpv",
    title: "Open in MPV",
    contexts: ["link"],
    targetUrlPatterns: ["*://*.youtube.com/*", "*://*.youtu.be/*"],
  },
  () => {
    if (browser.runtime.lastError) {
      console.error(
        "Context menu creation failed:",
        browser.runtime.lastError.message,
      );
    } else {
      console.log("Context menu created successfully");
    }
  },
);

browser.browserAction.onClicked.addListener((tab) => {
  if (
    tab.url &&
    (tab.url.includes("youtube.com") || tab.url.includes("youtu.be"))
  ) {
    sendToMpv(tab.url);
  }
});

browser.menus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "open-in-mpv") {
    sendToMpv(info.linkUrl);
  }
});

// Handle messages from content script
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openInMpv") {
    sendToMpv(request.url);
  }
});

function showError(message) {
  console.error(message);
  browser.notifications.create({
    type: "basic",
    title: "MPV Launcher Error",
    message: message,
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

    browser.runtime
      .sendNativeMessage("com.example.mpv_launcher", message)
      .then((response) => {
        console.log("Native Response:", response);
        browser.notifications.create({
          type: "basic",
          iconUrl: browser.runtime.getURL("icon96.png"),
          title: "MPV Launcher",
          message: "Video Sent to MPV",
        });
      })
      .catch((error) => {
        console.error("Native messaging error:", error);
        showError("Failed to launch MPV: " + error.message);
      });
  } catch (e) {
    console.error("Exception:", e);
    showError("Unexpected error: " + e.message);
  }
}
