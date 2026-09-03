#!/bin/bash
# Start Member Management Backend Server (Linux/macOS)
echo "Starting Member Management API..."
cd ../backend
echo "Building project..."
dotnet build
echo ""
echo "Starting development server..."
dotnet run
