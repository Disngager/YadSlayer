#!/usr/bin/env python3
"""
YAdSlayer Vision Engine v1.1
Watches for YouTube skip button via OCR + real OS mouse click.
Runs alongside the Chrome extension as a safety net.
EMPYREAN LABS
"""
import pyautogui
import pytesseract
import time
import sys
import os
from PIL import Image, ImageEnhance, ImageFilter

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.03

# Skip button text variants YouTube uses
SKIP_TERMS = ['skip ad', 'skip ads', 'skip']

def preprocess(img):
    """Enhance image for better OCR accuracy."""
    img = img.convert('L')  # grayscale
    img = ImageEnhance.Contrast(img).enhance(2.5)
    img = img.point(lambda x: 0 if x < 128 else 255)  # binarize
    return img

def scan_for_skip(debug=False):
    """
    Scan bottom portion of screen for YouTube skip button.
    Returns (x, y, confidence, text) or None.
    """
    try:
        sc = pyautogui.screenshot()
        w, h = sc.size

        # YouTube skip button lives in bottom-right of video player
        # Scan bottom 45%, right 55%
        region = sc.crop((int(w*0.45), int(h*0.55), w, h))
        enhanced = preprocess(region)

        data = pytesseract.image_to_data(
            enhanced,
            output_type=pytesseract.Output.DICT,
            config='--psm 11 --oem 3'  # sparse text mode — best for UI buttons
        )

        for i, text in enumerate(data['text']):
            t = text.strip().lower()
            if not t or len(t) < 4:
                continue
            if any(skip == t or t.startswith(skip) for skip in SKIP_TERMS):
                conf = int(data['conf'][i])
                if conf > 30:
                    # Convert region coords back to full screen
                    rx = data['left'][i] + data['width'][i]//2
                    ry = data['top'][i] + data['height'][i]//2
                    sx = rx + int(w*0.45)
                    sy = ry + int(h*0.55)
                    return (sx, sy, conf, text.strip())
    except Exception as e:
        if debug:
            print(f'  [scan_err] {e}')
    return None

def click_skip(x, y):
    """Real OS-level mouse click — fully trusted by YouTube."""
    pyautogui.moveTo(x, y, duration=0.04)
    pyautogui.click(x, y)
    time.sleep(0.05)
    pyautogui.click(x, y)  # double click for good measure

def main():
    print("""
  YAdSlayer Vision v1.1 - EMPYREAN LABS
  ───────────────────────────────────────
  Watching for skip button...
  Real OS clicks - YouTube can't block it.
  Ctrl+C to stop.
""")

    # Verify tesseract
    try:
        ver = pytesseract.get_tesseract_version()
        print(f'  [+] Tesseract {ver} ready')
    except Exception as e:
        print(f'  [!] Tesseract error: {e}')
        print('      Run INSTALL.bat to fix this.')
        sys.exit(1)

    print(f'  [+] Screen: {pyautogui.size()}')
    print(f'  [+] Scanning every 200ms...\n')

    skip_count = 0
    last_click = 0
    consecutive_misses = 0

    while True:
        try:
            now = time.time()

            # Cooldown after a click
            if now - last_click < 1.2:
                time.sleep(0.1)
                continue

            result = scan_for_skip()

            if result:
                x, y, conf, text = result
                consecutive_misses = 0
                print(f'  [{time.strftime("%H:%M:%S")}] FOUND "{text}" conf:{conf}% @ ({x},{y})')
                click_skip(x, y)
                skip_count += 1
                last_click = time.time()
                print(f'  [{time.strftime("%H:%M:%S")}] 💀 SLAIN #{skip_count}')
                time.sleep(0.8)  # brief pause then resume scanning
            else:
                consecutive_misses += 1
                # Slow down scan when nothing found for a while (battery friendly)
                sleep_time = 0.2 if consecutive_misses < 20 else 0.5
                time.sleep(sleep_time)

        except KeyboardInterrupt:
            print(f'\n  Vision offline. Total slain: {skip_count}\n')
            sys.exit(0)
        except Exception as e:
            print(f'  [!] {e}')
            time.sleep(0.5)

if __name__ == '__main__':
    main()
