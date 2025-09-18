# 🐳 LoyaltyIQ Frontend Docker Build

This guide explains how to build and run the LoyaltyIQ frontend with Docker, integrated with your existing backend services.

## 📋 Prerequisites

- Docker Desktop running
- Backend services already running (PostgreSQL, Redis, Java Backend, Python AI)
- PowerShell (for Windows users)

## 🚀 Quick Start

### Option 1: Build Frontend Only (Recommended)

If your backend services are already running:

```powershell
# Navigate to the frontend directory
cd loyaltyiq-web

# Run the build script
.\build-with-backend.ps1
```

### Option 2: Build Everything from Scratch

If you want to build the entire application:

```powershell
# From the project root directory
.\build-full-app.ps1
```

## 🔧 Manual Build Commands

### Build Frontend Only

```powershell
cd loyaltyiq-web
docker-compose build frontend
docker-compose up -d frontend
```

### Build with Development Mode

```powershell
cd loyaltyiq-web
docker-compose --profile dev build frontend-dev
docker-compose --profile dev up -d frontend-dev
```

## 🌐 Access Points

After successful build:

- **Frontend**: http://localhost:3000
- **Java Backend**: http://localhost:8080
- **Python AI**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 📁 Docker Files

- `Dockerfile` - Production build with nginx
- `Dockerfile.dev` - Development build with hot reloading
- `docker-compose.yml` - Frontend service configuration
- `nginx.conf` - Nginx configuration with API proxying
- `.dockerignore` - Files to exclude from Docker build

## 🔍 Troubleshooting

### Frontend Won't Start

1. Check if backend services are running:
   ```powershell
   docker ps
   ```

2. Check frontend logs:
   ```powershell
   docker-compose logs frontend
   ```

3. Ensure ports are not in use:
   ```powershell
   netstat -an | findstr :3000
   ```

### API Connection Issues

1. Verify backend services are healthy:
   ```powershell
   cd infrastructure
   docker-compose ps
   ```

2. Check if services are accessible:
   ```powershell
   curl http://localhost:8080/api/health
   curl http://localhost:8000/health
   ```

### Build Failures

1. Clear Docker cache:
   ```powershell
   docker system prune -a
   ```

2. Rebuild without cache:
   ```powershell
   docker-compose build --no-cache frontend
   ```

## 📊 Service Management

### View All Services

```powershell
docker-compose ps
```

### Stop Frontend

```powershell
cd loyaltyiq-web
docker-compose stop frontend
```

### Restart Frontend

```powershell
cd loyaltyiq-web
docker-compose restart frontend
```

### View Logs

```powershell
cd loyaltyiq-web
docker-compose logs -f frontend
```

## 🎯 Features

The Docker setup includes:

- **Production Build**: Optimized React build served by nginx
- **Development Build**: Hot reloading for development
- **API Proxying**: Automatic routing of `/api/*` to Java backend
- **AI Service Proxying**: Automatic routing of `/ai/*` to Python AI service
- **Health Checks**: Built-in health monitoring
- **Environment Variables**: Configurable backend URLs
- **Network Integration**: Seamless communication with backend services

## 🔄 Updating

To update the frontend:

1. Pull latest code
2. Rebuild the image:
   ```powershell
   docker-compose build --no-cache frontend
   docker-compose up -d frontend
   ```

## 📝 Environment Variables

The frontend container uses these environment variables:

- `REACT_APP_JAVA_BACKEND_URL`: Java backend service URL
- `REACT_APP_PYTHON_AI_URL`: Python AI service URL
- `NODE_ENV`: Environment mode (production/development)

These are automatically set by docker-compose to point to your backend services.
