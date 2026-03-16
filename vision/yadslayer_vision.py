#!/usr/bin/env python3
"""
YAdSlayer Vision Engine v1.0
OS-level screen vision + real mouse clicks.
No isTrusted issues. YouTube cannot block this.
EMPYREAN LABS
"""
import pyautogui
import pytesseract
import time
import sys
import os
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.05

SKIP_TERMS = ['skip ad', 'skip ads', 'skip']

def scan_for_skip():
    """Scan bottom-right of screen for skip button via OCR."""
    try:
        sc = pyautogui.screenshot()
        w, h = sc.size
        # Only scan bottom 40%, right 50% — where YouTube's skip button lives
        region = sc.crop((w//2, int(h*0.55), w, h))
        data = pytesseract.image_to_data(region, output_type=pytesseract.Output.DICT)
        for i, text in enumerate(data['text']):
            t = text.strip().lower()
            if any(s == t or t.startswith(s) for s in SKIP_TERMS) and len(t) > 2:
                conf = int(data['conf'][i])
                if conf > 35:
                    # Convert region-relative coords to screen coords
                    rx = data['left'][i] + data['width'][i]//2
                    ry = data['top'][i] + data['height'][i]//2
                    sx = rx + w//2
                    sy = ry + int(h*0.55)
                    return (sx, sy, conf, text.strip())
    except Exception as e:
        pass
    return None

def main():
    print("""
  __  __          _  _____ _
  \ \/ /_ __   __| |/ ____| |___ _ _ ___ _ _
   \  /| '_ \ / _` |___ \| / _ \ '_/ _ \ '_|
   /  \| | | | (_| |___) | |  __/ ||  __/ |
  /_/\_\_| |_|\__,_|____/|_\___|_| \___|_|

  VISION ENGINE v1.0 · EMPYREAN LABS
  ─────────────────────────────────────
  OS-level clicks. YouTube can't block it.
  Ctrl+C to stop.
""")
    skip_count = 0
    last_click = 0

    while True:
        try:
            now = time.time()
            if now - last_click < 1.5:
                time.sleep(0.2)
                continue

            result = scan_for_skip()
            if result:
                x, y, conf, text = result
                print(f"  [{time.strftime('%H:%M:%S')}] FOUND '{text}' conf:{conf}% @ ({x},{y})")
                pyautogui.moveTo(x, y, duration=0.05)
                pyautogui.click(x, y)
                skip_count += 1
                last_click = time.time()
                print(f"  [{time.strftime('%H:%M:%S')}] 💀 SLAIN #{skip_count}")
                time.sleep(1.5)
            else:
                time.sleep(0.3)

        except KeyboardInterrupt:
            print(f"\n  Vision offline. Total slain: {skip_count}\n")
            sys.exit(0)
        except Exception as e:
            print(f"  [!] {e}")
            time.sleep(0.5)

if __name__ == "__main__":
    main()
