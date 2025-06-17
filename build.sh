#!/bin/sh
echo "Building backend..."
cd backend
go build -o coaching_app .
echo "Build complete. Executable: backend/coaching_app"
