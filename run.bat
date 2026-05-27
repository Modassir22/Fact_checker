@echo off
echo =================================================================
echo             Fact Checker AI Web App Launcher
echo =================================================================
echo.
echo Installing dependencies for root, client, and server...
call npm run install:all
if %ERRORLEVEL% neq 0 (
    echo Error installing dependencies. Please check your Node/npm installation.
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo Launching Fact Checker App (Vite Client + Express Server)...
echo.
call npm run dev
pause
