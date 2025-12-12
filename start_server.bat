@echo off
echo Starting VitalLink Demo...
echo.
echo Make sure you have installed Node.js!
echo.
echo [INFO] User Page will be at: http://localhost:3000/user.html
echo [INFO] Admin Page will be at: http://localhost:3000/admin.html
echo.
echo Installing packages (if needed)...
call npm install --silent
echo.
echo Starting Server...
node server/server.js
pause
