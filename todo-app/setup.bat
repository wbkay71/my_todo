@echo off
setlocal enabledelayedexpansion

:: ToDo App Setup Script für Windows
:: Dieses Script installiert alle Abhängigkeiten und richtet die Anwendung ein

echo.
echo 🚀 ToDo App Setup wird gestartet...
echo.

:: Prüfe ob Node.js installiert ist
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js ist nicht installiert!
    echo [ERROR] Bitte installiere Node.js von https://nodejs.org/
    pause
    exit /b 1
)

:: Prüfe ob npm installiert ist
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm ist nicht installiert!
    echo [ERROR] npm sollte mit Node.js installiert werden.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js Version: %NODE_VERSION%

:: Gehe ins Backend-Verzeichnis
echo [INFO] 🔧 Backend wird eingerichtet...
cd backend

if not exist "package.json" (
    echo [ERROR] package.json nicht gefunden im Backend-Ordner!
    pause
    exit /b 1
)

echo [INFO] Installiere Backend-Abhängigkeiten...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fehler beim Installieren der Backend-Abhängigkeiten!
    pause
    exit /b 1
)
echo [SUCCESS] Backend-Abhängigkeiten erfolgreich installiert!

:: .env Datei erstellen
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Erstelle .env Datei aus .env.example...
        copy ".env.example" ".env" >nul
        echo [SUCCESS] .env Datei erstellt!
        echo [WARNING] Bitte setzen Sie einen sicheren JWT_SECRET in der .env Datei!
    ) else (
        echo [WARNING] .env.example nicht gefunden. Erstelle .env manuell.
    )
) else (
    echo [WARNING] .env existiert bereits. Überspringe...
)

:: Backend kompilieren
echo [INFO] Kompiliere Backend...
call npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Backend erfolgreich kompiliert!
) else (
    echo [WARNING] Backend-Kompilierung fehlgeschlagen. Prüfe TypeScript-Fehler.
)

cd ..

:: Frontend Setup
echo [INFO] 🎨 Frontend wird eingerichtet...
cd frontend

if not exist "package.json" (
    echo [ERROR] package.json nicht gefunden im Frontend-Ordner!
    pause
    exit /b 1
)

echo [INFO] Installiere Frontend-Abhängigkeiten...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fehler beim Installieren der Frontend-Abhängigkeiten!
    pause
    exit /b 1
)
echo [SUCCESS] Frontend-Abhängigkeiten erfolgreich installiert!

:: Frontend build testen
echo [INFO] Teste Frontend-Build...
call npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Frontend erfolgreich gebaut!
    rmdir /s /q dist >nul 2>&1
) else (
    echo [WARNING] Frontend-Build fehlgeschlagen. Prüfe TypeScript-Fehler.
)

cd ..

:: Setup abgeschlossen
echo.
echo [SUCCESS] 🎉 Setup erfolgreich abgeschlossen!
echo.
echo 📝 Nächste Schritte:
echo.
echo 1. Backend starten:
echo    cd backend ^&^& npm run dev
echo.
echo 2. Frontend starten (neues Terminal):
echo    cd frontend ^&^& npm run dev
echo.
echo 3. Anwendung öffnen:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001
echo.
echo 📚 Weitere Informationen siehe README.md
echo.

:: Optionale automatische Startfrage
set /p "start_backend=Möchten Sie das Backend jetzt starten? (y/n): "
if /i "%start_backend%"=="y" (
    echo [INFO] Starte Backend...
    cd backend
    call npm run dev
)

pause
