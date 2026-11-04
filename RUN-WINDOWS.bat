@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22.12 or newer is required.
  echo Install Node.js, then run this file again.
  pause
  exit /b 1
)
node -e "const a=process.versions.node.split('.').map(Number); process.exit(a[0]>22 || (a[0]===22 && a[1]>=12) ? 0 : 1)"
if errorlevel 1 (
  echo Node.js 22.12 or newer is required.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing MP7 Companion dependencies...
  call npm install --no-audit --no-fund
  if errorlevel 1 goto :failed
)
echo Starting MP7 Companion Windows test bench...
call npm run dev:desktop
if errorlevel 1 goto :failed
exit /b 0
:failed
echo.
echo The app could not start. Check the error output above.
pause
exit /b 1
