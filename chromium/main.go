package main

import (
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

type Message struct {
	URL string `json:"url"`
}

type Response struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func logMessage(format string, v ...interface{}) {
	log.Printf(format, v...)
}

func sendResponse(response Response) error {
	responseBytes, err := json.Marshal(response)
	if err != nil {
		return fmt.Errorf("failed to marshal response: %v", err)
	}

	// Write message length as uint32
	err = binary.Write(os.Stdout, binary.LittleEndian, uint32(len(responseBytes)))
	if err != nil {
		return fmt.Errorf("failed to write response length: %v", err)
	}

	// Write message
	_, err = os.Stdout.Write(responseBytes)
	if err != nil {
		return fmt.Errorf("failed to write response: %v", err)
	}

	return nil
}

func receiveMessage() (*Message, error) {
	// Read message length (first 4 bytes)
	var length uint32
	if err := binary.Read(os.Stdin, binary.LittleEndian, &length); err != nil {
		if err == io.EOF {
			return nil, fmt.Errorf("EOF while reading message length")
		}
		return nil, fmt.Errorf("failed to read message length: %v", err)
	}

	logMessage("Expecting message of length: %d", length)

	// Read the message
	messageBytes := make([]byte, length)
	n, err := io.ReadFull(os.Stdin, messageBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to read message: %v", err)
	}
	if uint32(n) != length {
		return nil, fmt.Errorf("incomplete message: got %d bytes, expected %d", n, length)
	}

	var message Message
	if err := json.Unmarshal(messageBytes, &message); err != nil {
		return nil, fmt.Errorf("failed to unmarshal message: %v", err)
	}

	logMessage("Received message: %s", string(messageBytes))
	return &message, nil
}

func launchMPV(url string) error {
	if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
		return fmt.Errorf("invalid URL format")
	}

	if !strings.Contains(url, "youtube.com") && !strings.Contains(url, "youtu.be") {
		return fmt.Errorf("URL is not from YouTube")
	}

	// Log environment variables
	logMessage("Environment variables:")
	for _, env := range []string{"WAYLAND_DISPLAY", "XDG_RUNTIME_DIR", "DISPLAY", "XDG_SESSION_TYPE", "HOME", "PATH"} {
		logMessage("%s=%s", env, os.Getenv(env))
	}

	// Create MPV command
	mpvCmd := exec.Command(
		"/home/cylis/.nix-profile/bin/mpv",
		"--vo=gpu-next",
		"--gpu-context=wayland",
		"--hwdec=auto",
		"--ytdl-format=bestvideo[height<=?1080]+bestaudio/best",
		"--force-window=immediate",
		"--msg-level=all=debug",
		"--fullscreen",
		url,
	)

	// Set up environment
	mpvCmd.Env = os.Environ()

	// Capture output
	mpvCmd.Stdout = os.Stderr
	mpvCmd.Stderr = os.Stderr

	// Start the process
	logMessage("Starting MPV...")
	if err := mpvCmd.Start(); err != nil {
		return fmt.Errorf("failed to start MPV: %v", err)
	}

	// Don't wait for the process to complete
	go func() {
		if err := mpvCmd.Wait(); err != nil {
			logMessage("MPV process ended with error: %v", err)
		} else {
			logMessage("MPV process ended successfully")
		}
	}()

	logMessage("MPV process started successfully")
	return nil
}

func main() {
	// Get executable directory for log file
	exePath, err := os.Executable()
	if err != nil {
		log.Fatalf("error getting executable path: %v", err)
	}
	exeDir := filepath.Dir(exePath)
	logFile := filepath.Join(exeDir, "mpv_launcher.log")

	// Set up logging to file
	f, err := os.OpenFile(logFile, os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("error opening log file: %v", err)
	}
	defer f.Close()

	// Set up multi-writer to log to both file and stderr
	mw := io.MultiWriter(f, os.Stderr)
	log.SetOutput(mw)

	logMessage("=== MPV Launcher Started at %s ===", time.Now().Format(time.RFC3339))
	logMessage("Working directory: %s", os.Getenv("PWD"))
	logMessage("Executable directory: %s", exeDir)
	logMessage("Log file: %s", logFile)

	// Receive message
	message, err := receiveMessage()
	if err != nil {
		logMessage("Error receiving message: %v", err)
		sendResponse(Response{Success: false, Message: err.Error()})
		os.Exit(1)
	}

	// Launch MPV
	if err := launchMPV(message.URL); err != nil {
		logMessage("Error launching MPV: %v", err)
		sendResponse(Response{Success: false, Message: err.Error()})
		os.Exit(1)
	}

	sendResponse(Response{Success: true, Message: "MPV launched successfully"})
}
