@echo off
echo ========================================================
echo   AI-POWERED XODIMLAR BILIMINI BAHOLASH TIZIMI
echo ========================================================
echo.

echo [1/3] Python AI mikroservisini ishga tushirish (port: 8001)...
start "AI Service (FastAPI)" cmd /k ".\ai-service\.venv\Scripts\python.exe ai-service\run.py"

echo [2/3] NestJS Backendni ishga tushirish (port: 4000)...
start "Backend API (NestJS)" cmd /k "node backend\dist\main.js"

echo [3/3] React Frontendni ishga tushirish (port: 3000)...
start "Frontend (React)" cmd /k "npm run preview --prefix frontend"

echo.
echo ========================================================
echo   Barcha servislar muvaffaqiyatli ishga tushirildi!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:4000
echo   AI RAG:   http://localhost:8001
echo ========================================================
pause

