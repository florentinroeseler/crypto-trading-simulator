import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Umgebungsvariablen verwenden für bessere Docker-Kompatibilität
const connectionString = process.env.DATABASE_URL || 'postgres://user:password@db:5432/trading_simulator';

// In Docker wird 'db' als Hostname verwendet (Service-Name in docker-compose)
const client = postgres(connectionString);
export const db = drizzle(client, { schema });