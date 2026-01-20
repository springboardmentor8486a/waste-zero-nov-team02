# Start Backend Server
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Backend; Write-Host 'Backend Server Starting...' -ForegroundColor Cyan; npm start"

# Wait for backend to initialize
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Frontend Server
Write-Host "🚀 Starting Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Write-Host 'Frontend Server Starting...' -ForegroundColor Cyan; npm run dev"

# Wait for frontend to initialize
Write-Host "⏳ Waiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if ngrok is installed
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokInstalled) {
    Write-Host "⚠️  ngrok is not installed!" -ForegroundColor Yellow
    Write-Host "📥 Installing ngrok..." -ForegroundColor Cyan
    npm install -g ngrok
    Write-Host "✅ ngrok installed!" -ForegroundColor Green
}

# Start ngrok for Backend (Port 5000)
Write-Host "🌐 Starting ngrok tunnel for Backend (Port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Backend ngrok tunnel:' -ForegroundColor Cyan; ngrok http 5000"

# Wait a bit
Start-Sleep -Seconds 2

# Start ngrok for Frontend (Port 5173)
Write-Host "🌐 Starting ngrok tunnel for Frontend (Port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Frontend ngrok tunnel:' -ForegroundColor Cyan; ngrok http 5173"

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "✅ All servers and tunnels started!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Check the ngrok windows for public URLs:" -ForegroundColor Yellow
Write-Host "   - Backend URL: Look in the first ngrok window" -ForegroundColor White
Write-Host "   - Frontend URL: Look in the second ngrok window" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Share these URLs with your friend!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Note: Free ngrok URLs expire after 2 hours" -ForegroundColor Yellow
Write-Host ""

