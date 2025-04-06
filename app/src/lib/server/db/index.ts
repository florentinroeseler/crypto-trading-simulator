// src/lib/server/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';

// Verbindungszeichenfolge für die Datenbankverbindung
const connectionString = 'postgres://user:password@localhost:5432/trading_simulator';

// Client für Abfragen
const queryClient = postgres(connectionString);

// Erstelle die Drizzle-DB-Instanz mit dem Schema
export const db = drizzle(queryClient, { schema });