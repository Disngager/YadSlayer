# YAdSlayer v1.0
## EMPYREAN LABS — Personal Use

Auto-skip YouTube ads using two independent methods that work together.

---

## INSTALL (one time)

1. Double-click **INSTALL.bat** — installs Python deps + Tesseract OCR
2. Open Chrome → `chrome://extensions`
3. Toggle **Developer Mode** ON (top right)
4. Click **Load unpacked** → select the `extension` folder
5. Done

---

## HOW IT WORKS

### Method 1 — Chrome Extension (always running)
- Auto-loads on every YouTube tab
- Seeks ad video to end instantly (forces completion)
- 16x speed blast fallback for non-skippable ads
- HUD shows kill count top-right of YouTube page
- **No action needed — fully automatic**

### Method 2 — Vision Engine (optional, strongest)
- Run **START_VISION.bat** alongside Chrome
- Takes OS-level screenshots, OCR scans for "Skip Ad"
- Performs real mouse click — YouTube cannot detect or block it
- Best for catching any ads the extension misses

---

## FILES

```
YAdSlayer/
├── extension/          ← Load this folder in Chrome
│   ├── manifest.json
│   ├── content.js
│   └── popup.html
├── vision/
│   └── yadslayer_vision.py
├── INSTALL.bat         ← Run this first
├── START_VISION.bat    ← Optional vision engine
└── README.md
```

---

## REQUIREMENTS

- Windows 10/11
- Google Chrome
- Python 3.11+ (auto-installed by INSTALL.bat)
- Tesseract OCR (auto-installed by INSTALL.bat)

---

*EMPYREAN LABS · Personal Use Only*
