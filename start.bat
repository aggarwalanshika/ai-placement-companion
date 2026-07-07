@echo off
title AI Resume Copilot Launcher
echo ========================================================
echo   AI Resume Copilot - Local Development Server
echo ========================================================
echo.
echo   Verifying / Installing Node package dependencies...
call npm install
echo.
echo   Launching Backend API and Frontend Client concurrently...
echo.
call npm run dev
pause
