@echo off
color 0A
echo ============================================
echo   PUSHING TO GITHUB (FORCE UPDATE)
echo ============================================
echo.
echo Target: https://github.com/Farhan-cpu-hash/TEST-FILE
echo.

echo [1/3] Resetting remote connection...
git remote remove origin 2>nul
git remote add origin https://github.com/Farhan-cpu-hash/TEST-FILE

echo [2/3] Preparing code...
git branch -M main

echo [3/3] Uploading... (Please Sign In if prompted)
git push -u origin main --force

echo.
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Upload failed! 
    echo Check your internet or sign-in credentials.
) else (
    echo [SUCCESS] Code is Live!
    echo Go to: https://github.com/Farhan-cpu-hash/TEST-FILE
)
pause
