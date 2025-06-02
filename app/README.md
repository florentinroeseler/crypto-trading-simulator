# DHBWallet

## Über das Projekt

DHBWallet ist ein Simulator, der es Nutzern erlaubt Kryptowährungen zu echten Kurspreisen zu handeln.

## Voraussetzungen

Stelle sicher, dass folgende Software auf deinem System installiert ist:

- **Docker**
  - [Windows/Mac: Docker Desktop](https://docs.docker.com/get-docker/)
  - [Linux: Docker Engine](https://docs.docker.com/engine/install/)
- **Docker Compose** (normalerweise in Docker Desktop enthalten)
  - Überprüfen mit: `docker-compose --version`

## Installation und Start

> ℹ️ **Info:** Ich habe die .env mit API-KEY in der .zip gelassen, um die Installation für dich zu erleichtern.

1. **In richtiges Verzeichnis navigieren**

   ```bash
   cd app
   ```

2. **Projekt starten**

   ```bash
   docker-compose up --build
   ```

3. **Frontend aufrufen**

   Öffne http://localhost:5173 in deinem Browser

<div style=" border-left: 4px solid #FF0000; padding: 10px; margin: 10px 0;">
<strong>Achtung:</strong> Das Starten kann ein bisschen lange dauern und die Seite reagiert am Anfang etwas langsamer.
</div>

## Nach dem Start

- Die Datenbank wird automatisch migriert und mit Testdaten gefüllt
- Das Frontend läuft mit Hot-Reloading für Entwicklung
- PostgreSQL ist auf Port 5433 erreichbar (falls externe Verbindung nötig)

## Projekt stoppen

```bash
# Mit Strg+C oder
docker-compose down
```

## Features

- Echtzeit-Kurse über API
- Registrieren, Anmelden, Ausloggen
- Nutzerprofil mit Profilbild und Infotext
- Leaderboard, um den Wettkampf der Spieler zu fördern
- Einfache Einsicht der eigenen Transaktionen mit Filter- und Sortierfunktionen
- Ansprechende Darstellung von Kursen

## Hinweise zur Notengebung

### Verzeichnis-Struktur

Leider ist die Verzeichnisstruktur bei meinem gewählten Techstack sehr stark vorgegeben. Ich hoffe, du kannst das berücksichtigen.
