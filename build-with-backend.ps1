# Frontend Build Script for LoyaltyIQ (PowerShell)
# This script builds the frontend to work with your existing backend

Write-Host "🎨 Building LoyaltyIQ Frontend with Backend Integration..." -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan

# Set environment variables
$env:DOCKER_BUILDKIT = "1"
$env:COMPOSE_DOCKER_CLI_BUILD = "1"

# Function to check if Docker is running
function Test-DockerRunning {
    try {
        docker info | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Function to check if backend services are running
function Test-BackendServices {
    try {
        $javaBackend = docker ps --filter "name=loyalty_java_backend" --format "{{.Status}}"
        $pythonAI = docker ps --filter "name=loyalty_python_ai" --format "{{.Status}}"
        $postgres = docker ps --filter "name=loyalty_postgres" --format "{{.Status}}"
        
        if ($javaBackend -and $pythonAI -and $postgres) {
            return $true
        }
        return $false
    } catch {
        return $false
    }
}

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-DockerRunning)) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker is running!" -ForegroundColor Green

# Check if backend services are running
Write-Host "🔍 Checking if backend services are running..." -ForegroundColor Yellow

if (-not (Test-BackendServices)) {
    Write-Host "⚠️  Backend services are not running." -ForegroundColor Yellow
    Write-Host "   Please start your backend services first using:" -ForegroundColor White
    Write-Host "   cd infrastructure && docker-compose up -d" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "🤔 Do you want to continue building the frontend anyway? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "❌ Build cancelled." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Backend services are running!" -ForegroundColor Green
}

# Build the frontend
Write-Host ""
Write-Host "📦 Building React frontend..." -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Cyan

docker-compose build frontend

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend built successfully!" -ForegroundColor Green

# Start the frontend
Write-Host ""
Write-Host "🚀 Starting frontend..." -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Cyan

docker-compose up -d frontend

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start frontend!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend started successfully!" -ForegroundColor Green

# Final status
Write-Host ""
Write-Host "🎉 Frontend Build Complete!" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Access your frontend at: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 Useful Commands:" -ForegroundColor Yellow
Write-Host "   View logs: docker-compose logs -f frontend" -ForegroundColor White
Write-Host "   Stop frontend: docker-compose stop frontend" -ForegroundColor White
Write-Host "   Restart frontend: docker-compose restart frontend" -ForegroundColor White
Write-Host ""
Write-Host "📊 Frontend Status:" -ForegroundColor Yellow
docker-compose ps frontend
