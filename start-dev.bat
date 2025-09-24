@echo off
echo Starting Jal Drishti full dev environment (API + Frontend)...
echo.

REM Start backend (port 3000) with mock auth if no DB
cd server
if not exist .env (
  echo Creating default .env ...
  copy env.example .env >nul
)
echo Starting API on http://localhost:3000 ...
npm install --no-audit --no-fund --silent
start cmd /c "npm run dev"

REM Start frontend (port 5173)
cd ..\client
echo Starting frontend on http://localhost:5173 ...
npm install --no-audit --no-fund --silent
start cmd /c "npm run dev"

cd ..
echo.
echo Open: http://localhost:5173
echo API:  http://localhost:3000/health
echo.
pause

