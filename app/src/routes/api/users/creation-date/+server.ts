// src/routes/api/user/creation-date/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ locals }) {
  try {
    // Prüfe, ob der Benutzer angemeldet ist
    if (!locals.user) {
      return json({
        success: false,
        message: 'Nicht autorisiert'
      }, { status: 401 });
    }

    // Hole das Erstellungsdatum des Benutzers
    const user = await db
      .select({ createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, locals.user.id))
      .limit(1);

    if (!user || user.length === 0) {
      return json({
        success: false,
        message: 'Benutzer nicht gefunden'
      }, { status: 404 });
    }

    return json({
      success: true,
      creationDate: user[0].createdAt
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Erstellungsdatums:', error);
    return json({
      success: false,
      message: 'Ein Fehler ist aufgetreten'
    }, { status: 500 });
  }
}