$ScriptDir = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  XODIM REYTING AI - XODIMLAR BILIMINI BAHOLASH VA REYTING TIZIMI" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

Write-Host "`n[1/4] Band bo'lgan portlarni tozalash (3000, 4000, 8001)..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3000,4000,8001 -ErrorAction SilentlyContinue |
    Where-Object { $_.OwningProcess -gt 0 } |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Write-Host "[2/4] Python AI mikroservisini ishga tushirish (port: 8001)..." -ForegroundColor Green
$pyExe = if (Test-Path "$ScriptDir\ai-service\.venv\Scripts\python.exe") {
    "$ScriptDir\ai-service\.venv\Scripts\python.exe"
} else {
    "python"
}
Start-Process cmd.exe -ArgumentList "/k", "cd /d `"$ScriptDir\ai-service`" && `"$pyExe`" run.py"

Write-Host "[3/4] NestJS Backendni ishga tushirish (port: 4000)..." -ForegroundColor Green
Start-Process cmd.exe -ArgumentList "/k", "cd /d `"$ScriptDir\backend`" && npm start"

Write-Host "[4/4] React Frontendni ishga tushirish (port: 3000)..." -ForegroundColor Green
Start-Process cmd.exe -ArgumentList "/k", "cd /d `"$ScriptDir\frontend`" && npm run dev"

Write-Host "`nServislar ishga tushmoqda, 5 soniya kutilmoqda..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Brauzerda ochilmoqda: http://localhost:3000" -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "  Barcha 3 ta servis muvaffaqiyatli ishga tushirildi!" -ForegroundColor Green
Write-Host "  - Frontend: http://localhost:3000"
Write-Host "  - Backend:  http://localhost:4000"
Write-Host "  - AI RAG:   http://localhost:8001"
Write-Host "`n  HR Admin: admin / admin123"
Write-Host "  Xodim:    xodim / xodim123"
Write-Host "======================================================================" -ForegroundColor Cyan

