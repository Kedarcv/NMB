Write-Host "Building LoyaltyIQ Frontend..." -ForegroundColor Green

# Build the frontend
docker-compose build frontend

if ($LASTEXITCODE -eq 0) {
    Write-Host "Frontend built successfully!" -ForegroundColor Green
    
    # Start the frontend
    Write-Host "Starting frontend..." -ForegroundColor Yellow
    docker-compose up -d frontend
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Frontend started successfully!" -ForegroundColor Green
        Write-Host "Access at: http://localhost:3000" -ForegroundColor Cyan
    } else {
        Write-Host "Failed to start frontend!" -ForegroundColor Red
    }
} else {
    Write-Host "Frontend build failed!" -ForegroundColor Red
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
