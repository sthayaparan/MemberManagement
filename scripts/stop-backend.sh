#!/bin/bash
# Stop Member Management Backend Server (Linux/macOS)
echo "Stopping Member Management API..."
pkill -f "dotnet run"
sleep 1
echo "Backend server stopped."
