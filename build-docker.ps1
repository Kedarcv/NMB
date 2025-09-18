# Docker build script for LoyaltyIQ Frontend (PowerShell)

Write-Host "🐳 Building LoyaltyIQ Frontend Docker Image..." -ForegroundColor Green

# Set environment variables
$env:DOCKER_BUILDKIT = "1"
$env:COMPOSE_DOCKER_CLI_BUILD = "1"

# Build the production image
Write-Host "📦 Building production image..." -ForegroundColor Yellow
docker-compose build frontend

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Production build successful!" -ForegroundColor Green
    
    # Optional: Build development image
    $buildDev = Read-Host "🤔 Do you want to build the development image as well? (y/n)"
    if ($buildDev -eq "y" -or $buildDev -eq "Y") {
        Write-Host "🔧 Building development image..." -ForegroundColor Yellow
        docker-compose build frontend-dev
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Development build successful!" -ForegroundColor Green
        } else {
            Write-Host "❌ Development build failed!" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host ""
    Write-Host "🎉 All builds completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 To run the application:" -ForegroundColor Cyan
    Write-Host "   Production: docker-compose up frontend" -ForegroundColor White
    Write-Host "   Development: docker-compose --profile dev up frontend-dev" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Access the app at:" -ForegroundColor Cyan
    Write-Host "   Production: http://localhost:3000" -ForegroundColor White
    Write-Host "   Development: http://localhost:3001" -ForegroundColor White
    
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
