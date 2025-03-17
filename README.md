# MPV Launcher - Firefox Extension

## Overview

MPV Launcher is a Firefox extension that allows users to open YouTube videos in MPV via a native messaging host.

## Files Included

- `manifest.json` - Firefox extension manifest.
- `background.js` - Handles background tasks.
- `content.js` - Injected into web pages to interact with YouTube.
- `main.go` - Source code for the native messaging host.
- `icon48.png` - Extension icon.
- `icon96.png` - Extension icon.

## Build & Installation Instructions

### Prerequisites

- **Go** (version 1.20 or later)
- **Firefox** (latest stable version)
- **Linux/macOS**

### 1. Compile the Native Messaging Host

Run the following commands:

```sh
git clone https://github.com/Cylis-Dragneel/mpv-launcher-extension.git
cd mpv-launcher-extension/firefox
go build -o mpv_launcher
```

This generates the `mpv_launcher` binary.

### 2. Modify the Native Messaging Host

Edit the file `com.example.mpv_launcher.json` to change the path and point it to the path of the binary we just built

### 3. Register the Native Messaging Host

Copy `com.example.mpv_launcher.json` to your Firefox Native Messaging directory:

- **Linux/macOS:**
  ```sh
  mkdir -p ~/.mozilla/native-messaging-hosts/
  cp com.example.mpv_launcher.json ~/.mozilla/native-messaging-hosts/
  ```

### 4. Install the Extension Permanently (Local Use)

Copy the extension files to the Firefox extensions directory:

```sh
mkdir -p ~/.mozilla/extensions/mpv-launcher@example.com/
cp -r * ~/.mozilla/extensions/mpv-launcher@example.com/
```

### 5. Load the Extension in Firefox

1. Open `about:debugging` in Firefox.
2. Select **This Firefox** > **Load Temporary Add-on**.
3. Choose `manifest.json` to load the extension.

## System Requirements

- **OS:** Linux/macOS (Windows support planned)
- **Dependencies:** Go 1.20+, MPV installed

## Security Considerations

- The extension only communicates with `mpv_launcher` using Firefox’s Native Messaging API.
- No user data is collected.

---
