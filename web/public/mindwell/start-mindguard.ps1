# ============================================================
# MindGuard — Start All Services (Frontend + Backend + Django)
# Just double-click or run:  .\start-all.ps1
# ============================================================

$ROOT = "c:\Users\shrav\Downloads\MindGuard-main\MindGuard-main"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MindGuard — Starting All Services   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- 1. Node.js Backend (Express) ---
Write-Host "[1/3] Starting Node.js Backend (Express)..." -ForegroundColor Yellow
$backendPath = "$ROOT\backend"
if (!(Test-Path "$backendPath\node_modules")) {
    Write-Host "      Installing backend dependencies..." -ForegroundColor Gray
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm install; npm start" -WindowStyle Normal
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm start" -WindowStyle Normal
}
Start-Sleep -Seconds 2

# --- 2. Django Backend ---
Write-Host "[2/3] Starting Django Backend..." -ForegroundColor Yellow
$djangoPath = "$ROOT\django_backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$djangoPath'; python manage.py runserver" -WindowStyle Normal
Start-Sleep -Seconds 2

# --- 3. React Frontend (Vite) ---
Write-Host "[3/3] Starting React Frontend (Vite)..." -ForegroundColor Yellow
$webPath = "$ROOT\web"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$webPath'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   All services are starting up!        " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend  -> http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend   -> http://localhost:5000  (or 3000)" -ForegroundColor Cyan
Write-Host "  Django    -> http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Open your browser at: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "  Press any key to close this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
