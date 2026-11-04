@echo off
chcp 65001 >nul
title Xodim Reyting AI

:: Loyiha ildiz papkasiga o'tish (qaerdan chaqirilishidan qat'i nazar to'g'ri ishlashi uchun)
cd /d "%~dp0"

echo ======================================================================
echo   XODIM REYTING AI - XODIMLAR BILIMINI BAHOLASH VA REYTING TIZIMI
echo ======================================================================
echo.

echo [1/4] Band bo'lgan portlarni tozalash (3000, 4000, 8001)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 :4000 :8001" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000,4000,8001 -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 } | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo [2/4] Python AI mikroservisini ishga tushirish (port: 8001)...
set "PY_CMD="
if exist "%~dp0ai-service\.venv\Scripts\python.exe" (
    set "PY_CMD="%~dp0ai-service\.venv\Scripts\python.exe""
) else (
    set "PY_CMD=python"
)
start "AI Service (FastAPI :8001)" cmd /k "cd /d "%~dp0ai-service" && %PY_CMD% run.py"

echo [3/4] NestJS Backendni ishga tushirish (port: 4000)...
start "Backend API (NestJS :4000)" cmd /k "cd /d "%~dp0backend" && if exist dist\main.js (node dist\main.js) else (npm start)"

echo [4/4] React Frontendni ishga tushirish (port: 3000)...
start "Frontend (React :3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Servislar to'liq tayyor bo'lishi kutilmoqda (port: 4000 va 3000)...
powershell -NoProfile -Command "for ($i=0; $i -lt 40; $i++) { $p4000 = Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue; $p3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; if ($p4000 -and $p3000) { break }; Start-Sleep -Milliseconds 500 }" >nul 2>&1
timeout /t 1 /nobreak >nul

echo Brauzerda ochilmoqda: http://localhost:3000
start http://localhost:3000

echo.
echo ======================================================================
echo   Barcha 3 ta servis muvaffaqiyatli ishga tushirildi!
echo.
echo   * Frontend (React UI): http://localhost:3000
echo   * Backend  (NestJS):   http://localhost:4000
echo   * AI RAG   (FastAPI):  http://localhost:8001
echo.
echo   Eslatma: Servislarni to'xtatish uchun ochilgan terminal oynalarini yoping.
echo ======================================================================
pause
