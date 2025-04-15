import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Direkte Verbindungsdaten verwenden statt Umgebungsvariablen
const connectionString = 'postgres://user:password@localhost:5433/trading_simulator';

const client = postgres(connectionString);
export const db = drizzle(client, { schema });