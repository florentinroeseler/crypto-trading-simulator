#!/bin/sh
set -e

# Stelle sicher, dass die nötigen Abhängigkeiten installiert sind
echo "Installiere Abhängigkeiten..."
cd /app
npm install

# Starte die Anwendung ohne Migrationen
echo "Starte SvelteKit-Anwendung..."
npm run dev -- --host