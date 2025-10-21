@echo off
echo Creating project structure...

REM Create main project folders
mkdir backend 2>nul
mkdir frontend 2>nul

REM Create backend subfolders
echo Creating backend structure...
mkdir backend\controllers 2>nul
mkdir backend\routes 2>nul
mkdir backend\models 2>nul

REM Create empty server file in backend
echo. > backend\server.js
echo Backend structure created!

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js first to create React app
    pause
    exit /b 1
)

REM Create React app in frontend folder
echo Creating React app in frontend folder...
cd frontend
npx create-react-app .
cd ..

echo.
echo Project structure successfully created!
echo.
echo Backend folders created:
echo   - backend\controllers
echo   - backend\routes  
echo   - backend\models
echo   - backend\server.js
echo.
echo Frontend: React app created successfully
echo.
pause