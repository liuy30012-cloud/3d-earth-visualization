@echo off
title 3D Earth - Backend Server
cd /d "%~dp0backend"

echo Starting backend server...
echo.
.\gradlew.bat bootRun
pause
