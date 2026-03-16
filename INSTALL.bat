@echo off
title YAdSlayer Installer
color 0A
echo.
echo  ============================================
echo   YAdSlayer v1.0 - EMPYREAN LABS
echo   Installer
echo  ============================================
echo.

REM ── Check Python ────────────────────────────────────────────────────────
echo  [*] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo  [!] Python not found. Installing via winget...
    winget install Python.Python.3.11 --accept-source-agreements --accept-package-agreements
    echo  [+] Python installed. Please re-run this installer.
    pause
    exit
)
echo  [+] Python found.

REM ── Install Python deps ──────────────────────────────────────────────────
echo  [*] Installing Python dependencies...
python -m pip install pyautogui pytesseract pillow --quiet
echo  [+] Dependencies installed.

REM ── Check Tesseract ──────────────────────────────────────────────────────
echo  [*] Checking Tesseract OCR...
if exist "C:\Program Files\Tesseract-OCR\tesseract.exe" (
    echo  [+] Tesseract found.
) else (
    echo  [*] Installing Tesseract OCR...
    winget install UB-Mannheim.TesseractOCR --accept-source-agreements --accept-package-agreements
    echo  [+] Tesseract installed.
)

REM ── Chrome Extension reminder ────────────────────────────────────────────
echo.
echo  ============================================
echo   CHROME EXTENSION SETUP (one time only)
echo  ============================================
echo.
echo  1. Open Chrome
echo  2. Go to: chrome://extensions
echo  3. Enable Developer Mode (top right toggle)
echo  4. Click "Load unpacked"
echo  5. Select this folder: %~dp0extension
echo  6. Done - YAdSlayer extension is active!
echo.
echo  ============================================
echo   INSTALLATION COMPLETE
echo  ============================================
echo.
echo  Run START_YADSLAYER.bat to launch vision engine
echo  (optional - extension works without it)
echo.
pause
