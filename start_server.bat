@echo off
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Could not run 'npm install'. 
    echo Please make sure Node.js is installed: https://nodejs.org/
    pause
    exit /b
)

echo.
echo Starting VitalLink Server...
node server/server.js
pause
