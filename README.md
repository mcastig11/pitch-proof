# Pitch Proof

Pitch Proof is a real-time web application designed to help singers improve their vocal accuracy. Using advanced autocorrelation algorithms and AI-driven feedback, it provides instant visual tuning data and professional-style coaching summaries.

## 🚀 Features

- **Real-time Pitch Detection:** Analyzes audio input to identify musical notes and octave information.
- **Cents Meter:** Visualizes how sharp or flat a note is within a 100-cent range.
- **Waveform Visualization:** Displays a live canvas representation of the audio signal.
- **Session Recording:** Records your singing and allows for immediate playback or download as a `.webm` file.
- **AI Vocal Coach:** Uses the Anthropic Claude API to analyze your performance data and provide encouraging, specific feedback based on your pitch accuracy throughout the session.

## 🛠️ Technical Overview

- **Web Audio API:** Utilized for capturing microphone input, generating frequency data, and managing the audio context.
- **Autocorrelation Algorithm:** A robust time-domain pitch detection method used to determine the fundamental frequency of the voice.
- **Anthropic API Integration:** Sends summarized pitch logs to Claude (via the `claude-sonnet` model) to generate personalized coaching tips.
- **MediaRecorder API:** Handles the capture and blob generation for audio playback and downloads.

## 📋 Prerequisites

- A modern web browser with `getUserMedia` support (Chrome, Firefox, Edge, etc.).
- A local web server to serve the files (required for microphone permissions in most browsers).
- An **Anthropic API Key** for the AI feedback feature.

## ⚙️ Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    ```
2.  **Configure the API Key:**
    Open `script.js` and locate the following section:
    ```javascript
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY_HERE', // Replace with your actual key
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    ```
3.  **Run the app:**
    Use a tool like Live Server (VS Code extension) or a simple Python server to run the project:
    ```bash
    python -m http.server 8000
    ```

## ⚠️ Security Note

This project currently makes direct browser-to-API calls for demonstration purposes. In a production environment, it is recommended to proxy these requests through a backend server to keep your API keys secure.
