@echo off
REM Stop Member Management Backend Server (Windows)
echo Stopping Member Management API...
taskkill /F /IM dotnet.exe
echo.
echo Backend server stopped.
pause
