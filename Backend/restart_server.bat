@echo off
echo Stopping old server processes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq node server.js*" 2>nul
timeout /t 2 /nobreak >nul

echo Starting fresh server with API keys...
cd /d "%~dp0"
node server.js
