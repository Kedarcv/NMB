@echo off
echo Building LoyaltyIQ Frontend...
docker-compose build frontend
if %ERRORLEVEL% EQU 0 (
    echo Frontend built successfully!
    echo Starting frontend...
    docker-compose up -d frontend
    if %ERRORLEVEL% EQU 0 (
        echo Frontend started successfully!
        echo Access at: http://localhost:3000
    ) else (
        echo Failed to start frontend!
    )
) else (
    echo Frontend build failed!
)
pause
