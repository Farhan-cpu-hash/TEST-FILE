@echo off
echo ========================================================
echo   MANUAL GITHUB PUSH
echo ========================================================
echo.
echo We will try to push using the console directly.
echo If a popup does NOT appear, check this window:
echo It might ask for 'Username' and 'Password' right here.
echo.
echo [INFO] Pushing to: https://github.com/Farhan-cpu-hash/TEST-FILE
echo.

git push https://github.com/Farhan-cpu-hash/TEST-FILE main --force

echo.
if %errorlevel% neq 0 (
    echo [ERROR] Push failed.
    echo If it asked for a password, you must use a Personal Access Token (PAT), not your normal password.
) else (
    echo [SUCCESS] Push Complete!
)
pause
