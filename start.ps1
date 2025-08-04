Write-Host "Starting backend service..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "cmd" -ArgumentList "/c", "pnpm", "run", "start:backend"

Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "Starting frontend service..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "cmd" -ArgumentList "/c", "pnpm", "run", "start:frontend"

Write-Host "All services started!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press any key to exit..." -ForegroundColor Yellow
Read-Host
