#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Building backend..."
cd backend
go build -o ../app_backend .
cd ..
echo "Backend build complete. Executable: app_backend"

echo ""
echo "Building frontend..."
cd frontend
echo "Removing existing frontend/node_modules directory..."
rm -rf node_modules
echo "Node modules not found, running npm install..."
npm install
npm run build
cd ..
echo "Frontend build complete. Static files should be in frontend/build or frontend/dist"

echo ""
# Check if docker-compose.yml exists before trying to build
if [ -f "docker-compose.yml" ]; then
  echo "Building Docker images via docker-compose..."
  docker-compose build --no-cache
  echo "Docker images build process complete."
else
  echo "docker-compose.yml not found, skipping Docker build."
fi

echo ""
echo "All build processes finished."
