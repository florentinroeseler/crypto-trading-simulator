import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Verwende eine einfache hartcodierte Verbindung für die Entwicklung
// Später kannst du dies durch eine Umgebungsvariable ersetzen
const connectionString = 'postgres://user:password@localhost:5432/trading_simulator';

// Datenbankverbindung für Abfragen
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient);