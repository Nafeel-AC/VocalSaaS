@echo off
echo Starting VocalSaaS Development Environment...
echo.

echo Starting Backend Server...
start "VocalSaaS Backend" cmd /k "cd Backend && npm start"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "VocalSaaS Frontend" cmd /k "cd Frontend\vite-project && npm run dev"

echo.
echo Development servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
