// src/lib/server/auth.ts
import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { dev } from '$app/environment';
import { db } from '$lib/server/db';
import { users, sessions } from '$lib/server/db/schema';

// Der aktualisierte DrizzlePostgreSQLAdapter mit 3 Argumenten
const adapter = new DrizzlePostgreSQLAdapter(
  db,           // Argument 1: Die Drizzle-DB-Instanz
  sessions,     // Argument 2: Die Sessions-Tabelle
  users         // Argument 3: Die Users-Tabelle
);

// Rest des Codes bleibt gleich
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !dev
    }
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      username: attributes.username,
      email: attributes.email,
      balance: attributes.balance,
      isAdmin: attributes.isAdmin,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt
    };
  }
});

// TypeScript-Definitionen
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      id: string;
      username: string;
      email: string;
      balance: number;
      isAdmin: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
  }
}