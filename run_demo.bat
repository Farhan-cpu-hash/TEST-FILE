@echo off
title VitalLink OnePlus Demo Launcher

echo ===================================================
echo      VitalLink - OnePlus Health Demo Launcher
echo ===================================================
echo.

echo [CHECK] Checking for Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERROR] Node.js is NOT installed or not in PATH!
    echo ---------------------------------------------------
    echo You MUST install Node.js to run this demo.
    echo Download: https://nodejs.org/
    echo ---------------------------------------------------
    pause
    exit /b
)

echo [SETUP] Installing dependencies...
call npm install --silent

echo [START] Starting Backend Server...
REM Start node in a new minimize window so it runs in background/separate window
start "VitalLink Backend" /MIN node server/server.js

echo [WAIT] Waiting 3 seconds for server to initialize...
timeout /t 3 >nul

echo [LAUNCH] Opening User Portal...
start http://localhost:3000/user.html

echo [LAUNCH] Opening Admin Portal...
start http://localhost:3000/admin.html

echo.
echo [SUCCESS] System is running!
echo ---------------------------------------------------
echo 1. Backend is running (minimized window).
echo 2. User Portal is open.
echo 3. Admin Portal is open (Password: 123).
echo ---------------------------------------------------
echo.
pause
