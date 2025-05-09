#!/bin/sh
set -e

echo "Warte auf Datenbank..."
# Wartezeit, bis die Datenbank bereit ist
sleep 5

echo "Führe Drizzle-Migrationen mit deinem Skript aus..."
# Korrekte Pfadangabe zur migrate.ts
cd /app
node --loader ts-node/esm --experimental-specifier-resolution=node ./src/lib/server/db/migrate.ts

echo "Migrationen abgeschlossen."