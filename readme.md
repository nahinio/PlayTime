<div align="center">
  <img src="icons/icon-128.png" width="100" height="100" alt="PlayTime Logo">

  # PlayTime
  ### Mastering Learning: Instant YouTube Playlist Durations and Smart Scheduling

  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
  [![Manifest V3](https://img.shields.io/badge/Chrome-MV3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
  [![Pure JS](https://img.shields.io/badge/Made%20with-Vanilla%20JS-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![Chrome Web Store](https://img.shields.io/badge/Platform-Chrome-orange.svg)](https://chromewebstore.google.com/detail/playtime/bfcaagblhkfhkaacmcdnaiakaabkjhdo)

  [Overview](#-overview) • [Key Features](#-key-features) • [Installation](#-installation) • [Usage](#-how-to-use) • [Project Structure](#-project-structure) • [Contributing](#-contributing)

  ---
</div>

## Overview

PlayTime is a lightweight, privacy-focused Chrome extension designed for students, developers, and researchers. It provides immediate calculations of YouTube playlist durations, enabling more effective time management for educational content and professional development.

By automating the calculation process, PlayTime ensures that learners can plan their study sessions with precision and better estimate the time commitment required for complex playlists.

---

## Key Features

### Duration Calculation
Calculates the total viewing time for any YouTube playlist. The tool integrates directly with playlist and watch pages for seamless data retrieval.

### Smart Learning Schedule
A productivity-focused feature that allows users to:
- Establish target completion deadlines.
- Calculate required daily video consumption.
- Generate and export a professional .ics calendar file for use with Google Calendar, Outlook, and Apple Calendar.

### Playback Speed Analysis
Provides duration estimates based on standard playback speeds (1.25x, 1.5x, and 2.0x), catering to high-speed learning requirements.

### Privacy and Performance
- **Zero Tracking:** No telemetry or data collection of any kind.
- **Local Execution:** All logic is processed within the browser environment.
- **Resource Efficient:** Built with vanilla JavaScript to ensure zero impact on browser performance.

---

## Installation

### Official Distribution
Standard installation is available via the **[Chrome Web Store](https://chromewebstore.google.com/detail/playtime/bfcaagblhkfhkaacmcdnaiakaabkjhdo)**.

### Manual Development Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/nahinio/PlayTime.git
   ```
2. Navigate to `chrome://extensions/` in the Chrome browser.
3. Enable **Developer Mode**.
4. Select **Load unpacked** and choose the project directory.

---

## How to Use

1. Navigate to a YouTube playlist page.
2. Select the PlayTime icon in the browser toolbar.
3. Review the calculated statistics, including total duration and average video length.
4. (Optional) Utilize the "Schedule Learning" feature to generate a custom completion timeline and export it to your calendar.

---

## Project Structure

```text
PlayTime/
├── icons/            # Visual assets
├── content/
│   └── content.js    # Data extraction logic
├── popup/
│   ├── popup.html    # User interface
│   ├── popup.css     # Styling
│   └── popup.js      # Core application logic and .ics generation
├── background.js     # Background service worker
├── manifest.json     # Extension manifest (MV3)
└── readme.md         # Documentation
```

---

## Contributing

The project welcomes contributions from the community. To contribute, please follow the standard fork-and-pull-request workflow:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add NewFeature'`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a Pull Request for review.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for full details.

---

<div align="center">
  <p>Developed for the global learning community.</p>
</div>