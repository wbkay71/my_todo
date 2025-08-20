#!/bin/bash

# ToDo App Setup Script
# Dieses Script installiert alle Abhängigkeiten und richtet die Anwendung ein

echo "🚀 ToDo App Setup wird gestartet..."
echo ""

# Farben für die Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktion für farbige Ausgabe
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Prüfe ob Node.js installiert ist
if ! command -v node &> /dev/null; then
    print_error "Node.js ist nicht installiert!"
    print_error "Bitte installiere Node.js von https://nodejs.org/"
    exit 1
fi

# Prüfe ob npm installiert ist
if ! command -v npm &> /dev/null; then
    print_error "npm ist nicht installiert!"
    print_error "npm sollte mit Node.js installiert werden."
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js Version: $NODE_VERSION"

# Gehe ins Projektverzeichnis
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

print_status "Arbeitsverzeichnis: $(pwd)"

# Backend Setup
print_status "🔧 Backend wird eingerichtet..."
cd backend

if [ ! -f "package.json" ]; then
    print_error "package.json nicht gefunden im Backend-Ordner!"
    exit 1
fi

print_status "Installiere Backend-Abhängigkeiten..."
if npm install; then
    print_success "Backend-Abhängigkeiten erfolgreich installiert!"
else
    print_error "Fehler beim Installieren der Backend-Abhängigkeiten!"
    exit 1
fi

# .env Datei erstellen
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_status "Erstelle .env Datei aus .env.example..."
        cp .env.example .env
        
        # Generiere einen zufälligen JWT Secret
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || date +%s | sha256sum | base64 | head -c 32)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/your-secret-key-change-this-in-production/$JWT_SECRET/" .env
        else
            # Linux
            sed -i "s/your-secret-key-change-this-in-production/$JWT_SECRET/" .env
        fi
        
        print_success ".env Datei erstellt mit zufälligem JWT Secret!"
    else
        print_warning ".env.example nicht gefunden. Erstelle .env manuell."
    fi
else
    print_warning ".env existiert bereits. Überspringe..."
fi

# Datenbank initialisieren
print_status "Initialisiere Datenbank..."
if npm run build > /dev/null 2>&1; then
    print_success "Backend erfolgreich kompiliert!"
else
    print_warning "Backend-Kompilierung fehlgeschlagen. Prüfe TypeScript-Fehler."
fi

cd ..

# Frontend Setup
print_status "🎨 Frontend wird eingerichtet..."
cd frontend

if [ ! -f "package.json" ]; then
    print_error "package.json nicht gefunden im Frontend-Ordner!"
    exit 1
fi

print_status "Installiere Frontend-Abhängigkeiten..."
if npm install; then
    print_success "Frontend-Abhängigkeiten erfolgreich installiert!"
else
    print_error "Fehler beim Installieren der Frontend-Abhängigkeiten!"
    exit 1
fi

# Frontend build testen
print_status "Teste Frontend-Build..."
if npm run build > /dev/null 2>&1; then
    print_success "Frontend erfolgreich gebaut!"
    # Cleanup build für development
    rm -rf dist/
else
    print_warning "Frontend-Build fehlgeschlagen. Prüfe TypeScript-Fehler."
fi

cd ..

# Setup abgeschlossen
echo ""
print_success "🎉 Setup erfolgreich abgeschlossen!"
echo ""
echo "📝 Nächste Schritte:"
echo ""
echo "1. Backend starten:"
echo "   cd backend && npm run dev"
echo ""
echo "2. Frontend starten (neues Terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Anwendung öffnen:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "📚 Weitere Informationen siehe README.md"
echo ""

# Optionale automatische Startfrage
read -p "Möchten Sie das Backend jetzt starten? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starte Backend..."
    cd backend
    exec npm run dev
fi
