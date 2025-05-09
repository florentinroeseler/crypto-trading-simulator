#!/bin/sh
set -e

# Stelle sicher, dass die nötigen Abhängigkeiten installiert sind
echo "Installiere Abhängigkeiten..."
cd /app
npm install

echo "Führe Datenbank-Migration aus..."
npm run db:migrate

echo "Führe Datenbank-Seed aus..."
npm run db:seed

# Starte die Anwendung ohne Migrationen
echo "Starte SvelteKit-Anwendung..."
npm run dev -- --host