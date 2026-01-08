@echo off
echo ========================================
echo OmniMind24 Frontend - Quick Start
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo.
    echo This script must be run from the project root directory.
    echo Current directory: %CD%
    echo.
    echo Please:
    echo 1. Extract omnimind24-complete-frontend.tar.gz
    echo 2. Navigate to the extracted folder
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 18.x or higher from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found: 
node --version

echo.
echo [2/5] Checking npm installation...
npm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)
echo ✓ npm found:
npm --version

echo.
echo [3/5] Installing dependencies...
echo This may take a few minutes...
npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully!

echo.
echo [4/5] Creating .env file from template...
if not exist ".env" (
    copy .env.example .env >nul
    echo ✓ .env file created
    echo   Please edit .env and add your Base44 configuration
) else (
    echo ✓ .env file already exists
)

echo.
echo [5/5] Testing build...
npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)
echo ✓ Build successful!

echo.
echo ========================================
echo Setup Complete! 🎉
echo ========================================
echo.
echo Your OmniMind24 frontend is ready!
echo.
echo Next steps:
echo 1. Edit .env file with your Base44 configuration
echo 2. Test locally: npm run dev
echo 3. Push to GitHub:
echo    git init
echo    git add .
echo    git commit -m "Initial commit"
echo    git remote add origin https://github.com/alamotte1956/omnimind24-frontend.git
echo    git push -u origin main
echo.
echo Base44 will automatically deploy your changes!
echo.
pause