# YouTube Gemini Summarizer

A Chrome extension that adds a **"Resumen"** button to any YouTube video. One click opens Gemini with a structured prompt ready to generate a detailed summary of the video — no need to watch it.

---

## Features

- **"Resumen" button on the player** — appears next to the like/dislike buttons on any video page.
- **Hover button on thumbnails** — hovering over any YouTube thumbnail reveals a small Gemini icon in the top-left corner to summarize that video without opening it.
- **Customizable prompt** — click the extension icon in Chrome to edit the prompt sent to Gemini. A default is provided and can be restored at any time.
- **No API key required** — uses the Gemini web interface (gemini.google.com) directly; no paid account needed.
- **SPA navigation support** — works with YouTube's dynamic navigation without requiring a page reload.

---

## How it works

1. On YouTube, `content_youtube.js` injects the "Resumen" button below the video and hover buttons over thumbnails.
2. On click, `background.js` stores the prompt in `chrome.storage.local` under a unique key and opens a new Gemini tab passing that key in the URL hash.
3. `content_gemini.js` reads the key from the hash, retrieves the prompt, types it into Gemini's editor, and sends it automatically.

```
YouTube (content_youtube.js)
    │  click "Resumen"
    ▼
background.js  ──►  chrome.storage.local  ──►  opens gemini.google.com/#gemini_KEY
                                                          │
                                                content_gemini.js
                                                          │
                                                types prompt + sends
```

---

## Installation

The extension is **not published on the Chrome Web Store**, so it must be loaded in developer mode. Follow these steps:

> ⚠️ **Keep the folder in a permanent location**
>
> Chrome loads the extension from whichever folder you select at install time. If that folder is moved, renamed, or deleted (for example, if you left it in Downloads and it got cleared), Chrome will lose the extension the next time it restarts and you will have to reinstall it. Choose a fixed directory that the folder will always stay in (e.g. `C:\Users\YourUser\AppData\Roaming\chrome-extensions-local\youtube-gemini-summarizer`) and never move it after installing.

### Step 1 — Download the files

Clone the repository or download it as a ZIP:

```bash
git clone https://github.com/osmaza17/youtube-gemini-summarizer.git
```

Or click **Code → Download ZIP** on the repository page and extract it to your chosen permanent folder.

### Step 2 — Open Chrome's Extensions page

1. Open Google Chrome.
2. Type the following in the address bar and press **Enter**:

   ```
   chrome://extensions
   ```

### Step 3 — Enable Developer Mode

Toggle the **Developer mode** switch in the top-right corner of the Extensions page.

### Step 4 — Load the extension

1. Click the **Load unpacked** button that appears in the top-left corner.
2. Select the folder that contains the extension files (the one with `manifest.json` inside).
3. Click **Select Folder**.

### Step 5 — Verify the installation

**"Resumir con Gemini"** will appear in the list with its icon. Make sure the toggle is enabled (blue).

### Step 6 — Try it out

1. Open any video on [youtube.com](https://www.youtube.com).
2. Wait for the video page to load.
3. The **"Resumen"** button with the Gemini icon will appear next to the like/dislike controls.
4. Click it — a new Gemini tab will open and the prompt will be sent automatically.

> **Note:** You must be signed into your Google account on gemini.google.com for the prompt to be submitted correctly.

---

## Customizing the prompt

Click the extension icon in the Chrome toolbar to open the prompt editor. You can freely edit the text that gets sent to Gemini. The placeholder `(detalles del video)` is automatically replaced with the video title, channel, and URL — make sure to keep it somewhere in your prompt.

Click **Save** to apply your changes, or **Reset to default** to restore the original prompt.

---

## Requirements

| Requirement | Details |
|-------------|---------|
| Browser | Google Chrome or any Chromium-based browser (Edge, Brave, Arc…) |
| Google account | Required to use Gemini |
| API key | Not required |

---

## Project structure

```
youtube-gemini-summarizer/
├── manifest.json          # Extension config (Manifest V3)
├── background.js          # Service worker: handles messages and opens tabs
├── content_youtube.js     # Injected into YouTube: buttons and interaction
├── content_gemini.js      # Injected into Gemini: types and sends the prompt
├── popup.html             # Prompt editor UI (extension icon click)
├── popup.js               # Prompt editor logic
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Troubleshooting

**The "Resumen" button does not appear**
- Wait a few seconds after the video page loads; the extension polls for up to 30 seconds.
- Reload the page with `F5`.
- Make sure the extension is enabled in `chrome://extensions`.

**Gemini does not receive the text**
- Make sure you are signed into your Google account on gemini.google.com.
- If Gemini shows a welcome screen or CAPTCHA, complete it manually and click "Resumen" again.

**The prompt is sent with incorrect formatting**
- Gemini may have updated its interface. Open an issue in the repository with a screenshot.
