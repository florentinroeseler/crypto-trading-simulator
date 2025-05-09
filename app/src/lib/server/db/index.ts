import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Direkte Verbindungsdaten, weil Umgebungsvariablen nicht funktionieren
const connectionString = 'postgres://user:password@localhost:5433/trading_simulator';

const client = postgres(connectionString);
export const db = drizzle(client, { schema });