import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

export default {
  schema: './src/lib/server/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql', // Statt "driver: 'pg'" wird jetzt "dialect: 'postgresql'" verwendet
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || ''
  },
  verbose: true,
  strict: true
} satisfies Config;