# Krypto-Trader

Eine Krypto-Trading-Simulationsplattform mit Echtzeit-Kursdaten, gebaut mit SvelteKit, PostgreSQL und Drizzle ORM.

## Features

- **Virtuelles Trading**: Kaufe und verkaufe Kryptowährungen mit Spielgeld
- **Echtzeit-Kurse**: Integration mit der CoinGecko API für aktuelle Marktdaten
- **Benutzerverwaltung**: Registrierung, Login und Benutzerprofil
- **Portfolio-Übersicht**: Verfolge deine Investitionen und Performance
- **Transaktionsverlauf**: Übersicht aller Käufe und Verkäufe
- **Responsive Design**: Optimiert für Desktop und Mobile

## Technologie-Stack

- **Frontend**: SvelteKit, TailwindCSS
- **Backend**: SvelteKit (Server API-Routen), Node.js
- **Datenbank**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentifizierung**: Lucia Auth
- **API**: CoinGecko für Kryptowährungsdaten

## Installation

### Voraussetzungen

- Node.js (v16 oder höher)
- PostgreSQL-Datenbank
- npm oder pnpm

### Setup

1. **Repository klonen**
   ```bash
   git clone https://github.com/yourusername/crypto-trader.git
   cd crypto-trader
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   # oder
   pnpm install
   ```

3. **Umgebungsvariablen konfigurieren**
   ```bash
   cp .env.example .env
   # Bearbeite die .env-Datei und passe die Werte an
   ```

4. **Datenbank einrichten**
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit push
   # oder
   npm run db:migrate
   npm run db:push
   ```

5. **Entwicklungsserver starten**
   ```bash
   npm run dev
   # oder
   pnpm dev
   ```

## Datenbank-Migrationen

Wenn du das Datenbankschema änderst, erstelle eine neue Migration:

```bash
npx drizzle-kit generate
```

Um die neuesten Änderungen auf die Datenbank anzuwenden:

```bash
npx drizzle-kit push
```

## API-Integration

Die Anwendung nutzt die CoinGecko API für Echtzeit-Kryptokurse. In der kostenlosen Version gibt es ein Rate-Limit, daher sind die Aktualisierungen auf alle 5 Minuten begrenzt.

Wenn du ein höheres Rate-Limit benötigst, kannst du einen CoinGecko Pro API-Key in der `.env`-Datei konfigurieren.

## Funktionen und Routen

- **/** - Landing Page
- **/cryptos** - Übersicht aller Kryptowährungen
- **/trade/[id]** - Handelsseite für eine spezifische Kryptowährung
- **/dashboard** - Benutzer-Dashboard mit Portfolio-Übersicht
- **/register** - Registrierungsseite
- **/login** - Login-Seite

## Geplante Features

- Ranglisten für Benutzer basierend auf Portfolio-Performance
- Badges und Erfolge für Trading-Meilensteine
- Kommentarfunktion für Kryptowährungen
- Direkte Nachrichten zwischen Benutzern
- Erweiterte Chartdarstellung mit technischen Indikatoren

## Lizenz

MIT