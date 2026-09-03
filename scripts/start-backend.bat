@echo off
REM Start Member Management Backend Server (Windows)
echo Starting Member Management API...
cd ..\backend
echo Building project...
dotnet build
echo.
echo Starting development server...
dotnet run
pause
