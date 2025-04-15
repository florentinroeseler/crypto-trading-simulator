// src/routes/api/seed-data/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { seedTestData } from '$lib/server/db/seed-data';

export const POST: RequestHandler = async ({ request, locals }) => {
  // Sicherstellen, dass der Benutzer angemeldet ist
  if (!locals.user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Testdaten für den angemeldeten Benutzer generieren
    const success = await seedTestData(locals.user.id);
    
    if (success) {
      return json({ success: true, message: 'Testdaten erfolgreich erstellt' });
    } else {
      return json({ success: false, message: 'Fehler beim Erstellen der Testdaten' }, { status: 500 });
    }
  } catch (error) {
    console.error('Fehler beim Seed-Prozess:', error);
    return json({ success: false, message: 'Interner Serverfehler' }, { status: 500 });
  }
};