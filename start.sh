#!/bin/bash

# Navigate to the directory where this script is located
# This ensures that docker-compose can find the .yml file and context directories
cd "$(dirname "$0")"

echo "Starting all services using Docker Compose..."

# Start services in detached mode
docker-compose up -d

echo "Services are starting. You can check their status with 'docker-compose ps' or 'docker logs <container_name>'."
echo "Frontend should be available at http://localhost:3000"
echo "Backend should be available at http://localhost:8080"
echo "MySQL is available on port 3306"
