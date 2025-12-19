@echo off
REM MongoDB Setup Script for Windows
REM This script creates the .env file with MongoDB Atlas configuration

echo.
echo ========================================
echo Netflix and Chill - MongoDB Setup
echo ========================================
echo.

REM Check if .env already exists
if exist .env (
    echo Warning: .env file already exists!
    echo.
    set /p OVERWRITE="Do you want to overwrite it? (Y/N): "
    if /i not "%OVERWRITE%"=="Y" (
        echo Setup cancelled.
        exit /b 1
    )
)

echo Creating .env file with MongoDB Atlas configuration...
echo.

REM Create the .env file
(
echo # Database Configuration
echo DB_TYPE=mongodb
echo.
echo # MongoDB Atlas Connection String
echo MONGODB_URI=mongodb+srv://katlynboches_db_user:rtZPzfsrDNMSQ4mQ@cluster0.ipameo2.mongodb.net/netflix-and-chill?retryWrites=true^&w=majority^&appName=Cluster0
echo.
echo # Server Configuration
echo PORT=3000
echo NODE_ENV=development
echo.
echo # TMDB API Key ^(optional^)
echo TMDB_API_KEY=
) > .env

echo ✓ .env file created successfully!
echo.
echo Now testing MongoDB connection by running the seeder...
echo.

REM Run the seeder
call npm run seed

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo   npm start
echo.
echo Then open: http://localhost:3000
echo.
pause
