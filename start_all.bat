@echo off
chcp 65001 >nul
title AI-Powered Xodimlar Bilimini Baholash Tizimi

echo ======================================================================
echo   🧠 AI-POWERED XODIMLAR BILIMINI BAHOLASH TIZIMI
echo ======================================================================
echo.

echo [1/4] Band bo'lgan portlarni tozalash (3000, 4000, 8001)...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000,4000,8001 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo [2/4] Python AI mikroservisini ishga tushirish (port: 8001)...
if exist "ai-service\.venv\Scripts\python.exe" (
    start "AI Service (FastAPI :8001)" cmd /k "cd ai-service && .venv\Scripts\python.exe run.py"
) else (
    start "AI Service (FastAPI :8001)" cmd /k "cd ai-service && python run.py"
)

echo [3/4] NestJS Backendni ishga tushirish (port: 4000)...
start "Backend API (NestJS :4000)" cmd /k "cd backend && npm start"

echo [4/4] React Frontendni ishga tushirish (port: 3000)...
start "Frontend (React :3000)" cmd /k "cd frontend && npm run dev"

echo.
echo Servislar ishga tushmoqda, 5 soniya kutilmoqda...
timeout /t 5 /nobreak >nul

echo Brauzerda ochilmoqda: http://localhost:3000
start http://localhost:3000

echo.
echo ======================================================================
echo   Barcha 3 ta servis muvaffaqiyatli ishga tushirildi!
echo.
echo   • Frontend (React UI): http://localhost:3000
echo   • Backend  (NestJS):   http://localhost:4000
echo   • AI RAG   (FastAPI):  http://localhost:8001
echo.
echo   Standart loginlar:
echo   - HR Admin:  admin  / admin123
echo   - Xodim:     xodim  / xodim123
echo.
echo   Eslatma: Servislarni to'xtatish uchun ochilgan terminal oynalarini yoping.
echo ======================================================================
pause
