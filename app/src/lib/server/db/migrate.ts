import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Lade Umgebungsvariablen
dotenv.config();

const runMigrations = async () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL ist nicht gesetzt. Bitte stelle sicher, dass die Umgebungsvariable korrekt konfiguriert ist.');
    process.exit(1);
  }

  // Erstelle den Migrations-Client mit direkter Verbindung
  const migrationClient = postgres(connectionString, { max: 1 });
  
  try {
    console.log('Starte Datenbankmigrationen...');
    
    // Führe Migrationen aus
    await migrate(drizzle(migrationClient), {
      migrationsFolder: 'migrations'
    });
    
    console.log('Migrationen erfolgreich abgeschlossen.');
  } catch (error) {
    console.error('Fehler bei der Migration:', error);
    process.exit(1);
  } finally {
    // Schließe die Verbindung
    await migrationClient.end();
  }
};

runMigrations();