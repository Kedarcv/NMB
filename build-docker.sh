#!/bin/bash

# Docker build script for LoyaltyIQ Frontend

echo "🐳 Building LoyaltyIQ Frontend Docker Image..."

# Set environment variables
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Build the production image
echo "📦 Building production image..."
docker-compose build frontend

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Production build successful!"
    
    # Optional: Build development image
    read -p "🤔 Do you want to build the development image as well? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔧 Building development image..."
        docker-compose build frontend-dev
        if [ $? -eq 0 ]; then
            echo "✅ Development build successful!"
        else
            echo "❌ Development build failed!"
            exit 1
        fi
    fi
    
    echo ""
    echo "🎉 All builds completed successfully!"
    echo ""
    echo "🚀 To run the application:"
    echo "   Production: docker-compose up frontend"
    echo "   Development: docker-compose --profile dev up frontend-dev"
    echo ""
    echo "🌐 Access the app at:"
    echo "   Production: http://localhost:3000"
    echo "   Development: http://localhost:3001"
    
else
    echo "❌ Build failed!"
    exit 1
fi
