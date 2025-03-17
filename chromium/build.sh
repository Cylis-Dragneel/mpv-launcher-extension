#!/usr/bin/env bash
set -e # To make it exit on any errors

# Defining install paths
INSTALL_DIR="$HOME/.config/google-chrome/native-messaging-hosts"
EXTENSION_DIR="$HOME/.config/google-chrome/extensions/mpv-launcher-extension@example.com"
BINARY_PATH="$INSTALL_DIR/mpv_launcher"

# Ensuring Directories Exist
mkdir -p "$INSTALL_DIR"
mkdir -p "$EXTENSION_DIR"

echo "[1/4] Compiling Go binary..."
go build -o "$BINARY_PATH"
chmod +x "$BINARY_PATH"

echo "[2/4] Updating native messaging host manifest..."
jq ".path = \"$BINARY_PATH\"" com.example.mpv_launcher.json > "$INSTALL_DIR/com.example.mpv_launcher.json"

echo "[3/4] Copying Extension files..."
cp -r manifest.json background.js content.js icon48.png icon96.png "$EXTENSION_DIR/"

echo "[4/4] Installation Complete!"
echo "To enable the extension, load it in Firefox from about:debugging"
