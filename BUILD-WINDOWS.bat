@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22.12 or newer is required.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm install --no-audit --no-fund
  if errorlevel 1 goto :failed
)
call npm run dist:win
if errorlevel 1 goto :failed
echo.
echo Windows builds are in the release folder.
pause
exit /b 0
:failed
echo.
echo Build failed. Check the error output above.
pause
exit /b 1
