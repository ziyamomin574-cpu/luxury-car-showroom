@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo   Luxe Showroom launcher
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js was not found on PATH.
  echo         Install it from https://nodejs.org and try again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo [1/4] Installing package dependencies...
  call npm install
  if errorlevel 1 goto :err
) else (
  echo [1/4] Dependencies already installed.
)

if not exist server\node_modules (
  echo [2/4] Installing server dependencies...
  call npm --prefix server install
  if errorlevel 1 goto :err
) else (
  echo [2/4] Server dependencies already installed.
)

echo [3/4] Type-checking...
call npm run typecheck
if errorlevel 1 goto :err

echo [4/4] Starting servers...
start "LuxeServer" /min cmd /c "cd /d %~dp0 && node server\src\index.js 1>>server.log 2>&1"
start "LuxeVite" /min cmd /c "cd /d %~dp0 && node node_modules\vite\bin\vite.js 1>>dev.log 2>&1"

echo.
echo Waiting for the dev server to start...
timeout /t 5 /nobreak >nul
start "" "http://localhost:5173"
echo.
echo The showroom should be open at http://localhost:5173
echo Logs: dev.log (site) and server.log (API on :8787)
echo.
pause
exit /b 0

:err
echo.
echo [ERROR] A step failed. Read the message above to fix it.
pause
exit /b 1