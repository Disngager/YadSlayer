# YAdSlayer Handover — v1.1
## Session Date: March 27, 2026 | EMPYREAN LABS

---

## PROJECT OVERVIEW

YAdSlayer is a dual-method YouTube ad skipper built for Windows (Chrome extension + vision engine) with Android in the pipeline. Built from scratch in one session.

**GitHub:** `https://github.com/Disngager/YadSlayer` (private, can be made public)
**Local:** `C:\YAdSlayer\`
**Dropbox:** `C:\Users\disng\Dropbox\YAdSlayer_v1.0.zip`

---

## CURRENT STATUS — v1.1

### ✅ WORKING
- **Chrome Extension** — auto-loads on every YouTube tab, no user interaction needed
  - Seek-to-end: jumps ad video to `duration - 0.01`, forces completion
  - Post-seek skip hunt: 25 attempts x 120ms = 3 seconds hunting for skip button after seek
  - 16x speed blast fallback for non-skippable ads
  - HUD shows kill count top-right of YouTube page
  - MutationObserver + 300ms adaptive tick

- **Vision Engine** (`START_VISION.bat`)
  - Tesseract OCR scans bottom-right of screen every 200ms
  - Real `pyautogui` OS-level mouse click — `isTrusted: true`, YouTube cannot block
  - Double-click for reliability
  - `--psm 11` sparse text mode + image preprocessing (contrast/binarize)

- **Debug Server** (`C:\Temp\yadslayer_server.py`)
  - Receives POST logs from extension → writes to `C:\Temp\yadslayer_debug.json`
  - MCP-readable anytime: `Filesystem:copy_file_user_to_claude` on that path
  - Run: `python C:\Temp\yadslayer_server.py`

- **MCP Phone Bridge**
  - S24 Ultra mounted at `C:\Users\disng\CrossDevice\Robert's S24 Ultra\storage\`
  - Full read/write confirmed
  - Files deploy via WiFi: `curl http://172.31.11.231:9191/filename -o ~/filename`
  - WiFi IP of HERB: `172.31.11.231`

### ⚠️ KNOWN ISSUE
- First ad: seek-to-end fires perfectly, fast-forwards through
- Skip button appears briefly after seek — `huntSkipButton()` should catch it (v1.1 fix, needs testing)
- Second consecutive ad: sometimes doesn't trigger (cooldown or adPresent() gate)
- Vision engine is the safety net for anything the extension misses

### ❌ NOT YET BUILT
- Android APK (Accessibility Service) — designed, Kotlin code written, not compiled
- Android build is the right long-term solution for phone (no root needed on S24 Ultra)

---

## FILE STRUCTURE

```
C:\YAdSlayer\
├── INSTALL.bat              ← One-click setup for any Windows PC
├── START_VISION.bat         ← Launch vision engine
├── README.md
├── extension/               ← Load this in Chrome (developer mode)
│   ├── manifest.json
│   ├── content.js           ← Main skip logic
│   └── popup.html           ← Kill counter popup
└── vision/
    └── yadslayer_vision.py  ← OCR + pyautogui click engine
```

---

## HOW THE EXTENSION WORKS (content.js)

```
Ad detected (adPresent())
    ↓
1. Try clickSkipBtn() directly — fastest path if button already visible
    ↓ fails
2. seekToEnd() — jumps video to duration-0.01, blasts 16x speed for 350ms
    ↓
3. huntSkipButton() — 25 attempts at 120ms = catches skip btn that appears post-seek
    ↓ if still no skip btn
4. trySpeedBlast() — 16x speed, waits for adPresent() to clear
```

**Ad detection:** `adPresent()` checks:
- `.html5-video-player.ad-showing` or `.ad-interrupting` class
- `.ytp-ad-player-overlay`, `.ytp-ad-progress`, `.ytp-ad-simple-ad-badge`, `.ytp-ad-preview-container`
- NOTE: `.ytp-ad-module` was REMOVED — always present even without ads, caused false positives (420 spam incident)

**Skip selectors:**
- `.ytp-ad-skip-button`
- `.ytp-ad-skip-button-modern`
- `.ytp-skip-ad-button`
- `button[class*="skip"]`
- `div[class*="skip"]`

**Key finding from debug logs:**
- `isTrusted: false` on dispatched MouseEvents — YouTube ignores synthetic clicks
- `seekToEnd` WORKS — confirmed in debug log (SEEK_SKIP events with duration)
- Player API (`cancelAd()`, `skipAd()`) not exposed by YouTube
- `.ytp-skip-ad-button` is the active selector in current YouTube (March 2026)

---

## ANDROID PLAN (next session)

### Method: Accessibility Service APK
- No root needed — standard Android API, Samsung Knox can't block it
- `BIND_ACCESSIBILITY_SERVICE` permission — user enables in Settings once
- Watches YouTube's live view tree for skip button by View ID first, then text
- Kotlin source already written (in original chat JSX viewer)

### Key files to write:
1. `AdSkipperService.kt` — main accessibility service
2. `MainActivity.kt` — simple enable/disable UI
3. `AndroidManifest.xml`
4. `accessibility_service_config.xml`

### Build path:
- Android Studio → New project → paste 4 files → Build APK → sideload to S24

### Phone deploy via MCP:
- Write APK directly to `C:\Users\disng\CrossDevice\Robert's S24 Ultra\storage\Download\`
- Robert opens Files app on phone → taps APK → installs

---

## EMPYREAN INTEGRATION (planned)

- EMPYREAN arms/disarms YAdSlayer via HTTP endpoint
- Debug log at `C:\Temp\yadslayer_debug.json` already MCP-readable
- Phone Link + Messenger monitor already in EMPYREAN — same pattern for YAdSlayer control
- Vision engine can be launched/killed by EMPYREAN as a subprocess

---

## SETUP ON NEW WINDOWS PC

```bash
git clone https://github.com/Disngager/YadSlayer.git
cd YadSlayer
INSTALL.bat
# Then load 'extension' folder in chrome://extensions (developer mode)
```

Or share `YAdSlayer_v1.0.zip` from Dropbox for non-devs.

---

## DEBUG PROCEDURE

1. Start debug server: `python C:\Temp\yadslayer_server.py`
2. Refresh YAdSlayer extension in `chrome://extensions`
3. Open YouTube, let ads run
4. Pull log: `Filesystem:copy_file_user_to_claude` on `C:\Temp\yadslayer_debug.json`
5. Parse with Python to see events, selectors hit, player classes

Key log events:
- `INIT` — extension armed on page
- `TRY_SKIP` — ad detected, attempting skip
- `SEEK_SKIP` — seek fired, shows duration
- `SKIPPED` — confirmed skip with method
- `AD_NO_SKIP` — ad present but no skip button found (tells us what IS visible)

---

## MISC NOTES

- Termux on S24: `python ~/yadslayer_termux.py` — old Termux test server, deprecated
- WiFi serve: `python -m http.server 9191 --directory C:\Temp\yadserve` on HERB
- S24 Ultra storage visible at: `C:\Users\disng\CrossDevice\Robert's S24 Ultra\storage\`
- Tasker config exists at: `...\storage\Tasker\configs\user\backup.xml`
- `EasY_HaCk` folder on phone — empty (placeholder or wiped)
- S23 Ultra "weird computer" story — deferred to future session
- ESP32 Deauther Watch Z + D-Duino32 on serial — future integration target

---

*EMPYREAN LABS · YAdSlayer v1.1 · Handover generated March 27, 2026*
