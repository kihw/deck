@echo off
echo.
echo =========================================
echo      Deck Installation Script for Windows
echo =========================================
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed.
    echo Please install Node.js from https://nodejs.org/
    echo.
    echo Press any key to open the Node.js download page...
    pause >nul
    start https://nodejs.org/
    goto end
)

:: Check Node.js version
for /f "tokens=1,2*" %%a in ('node -v') do (
    set NODE_VERSION=%%a
)
echo [INFO] Node.js version: %NODE_VERSION%

:: Check if npm is installed
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed.
    echo Please install npm or reinstall Node.js
    goto end
)

:: Create necessary directories
echo [INFO] Creating required directories...
if not exist "src\client\dist\scripts" mkdir src\client\dist\scripts
if not exist "src\client\dist\styles" mkdir src\client\dist\styles
if not exist "logs" mkdir logs
if not exist "coverage" mkdir coverage

:: Create .env file if not exists
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Creating .env file from .env.example...
        copy ".env.example" ".env" >nul
    ) else (
        echo [INFO] Creating default .env file...
        echo PORT=3000> .env
        echo HOST=0.0.0.0>> .env
        echo PIN_LENGTH=4>> .env
        echo MAX_CONNECTIONS=10>> .env
    )
)

:: Install dependencies
echo.
echo [INFO] Installing dependencies...
call npm install

:: Create global command link
echo.
echo [INFO] Creating global command...
call npm link

:: Installation complete
echo.
echo =========================================
echo     Installation completed successfully!
echo =========================================
echo.
echo To start Deck, run:
echo     deck start
echo.
echo Or:
echo     npm start
echo.
echo The application will be accessible at the URL displayed in the terminal.
echo Share this URL with devices on your local network.
echo.
echo Press any key to exit...
pause >nul

:end
exit /b