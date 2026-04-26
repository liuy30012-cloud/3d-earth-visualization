@echo off
title 3D Earth - Production Mode
cd /d "%~dp0"
echo=== 3D Earth Server ===
echo.
echo[1] Start Frontend + Backend
echo[2] Start Frontend Only
echo[3] Start Backend Only
echo[0] Exit
echo.
set /p choice=Select:

if "%choice%"=="1" goto start_all
if "%choice%"=="2" goto start_frontend
if "%choice%"=="3" goto start_backend
if "%choice%"=="0" goto end
goto menu

:start_all
echo.
echoStarting backend server...
cd /d "%~dp0backend"
start "3D Earth Backend" cmd /k "gradlew.bat bootRun"
cd /d "%~dp0"
timeout /t 3 /nobreak >nul
echoStarting frontend preview...
cd /d "%~dp0frontend"
start "3D Earth Frontend" cmd /k "npx vite preview"
goto end

:start_frontend
echo.
echoStarting frontend dev server...
cd /d "%~dp0frontend"
start "3D Earth Frontend" cmd /k "npm run dev"
goto end

:start_backend
echo.
echoStarting backend server...
cd /d "%~dp0backend"
start "3D Earth Backend" cmd /k "gradlew.bat bootRun"
goto end

:end
echo.
echoDone.
pause
