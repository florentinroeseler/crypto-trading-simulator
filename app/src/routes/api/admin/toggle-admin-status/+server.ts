// src/routes/api/admin/toggle-admin-status/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Spezieller Master-Key zum Gewähren von Admin-Rechten beim ersten Nutzer
// Dieser sollte normalerweise in .env gespeichert werden
const ADMIN_MASTER_KEY = 'wolfgang'; // Ändere diesen Wert!

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const data = await request.json();
    const { username, masterKey, adminState } = data;
    
    // Prüfe, ob der aktuelle Benutzer Admin ist oder den Master-Key verwendet
    const isMasterKeyValid = masterKey && masterKey === ADMIN_MASTER_KEY;
    const isCurrentUserAdmin = locals.user?.isAdmin === true;
    
    if (!isMasterKeyValid && !isCurrentUserAdmin) {
      return json({
        success: false,
        message: 'Nicht autorisiert. Du benötigst Admin-Rechte oder den Master-Key.'
      }, { status: 403 });
    }
    
    if (!username) {
      return json({
        success: false,
        message: 'Benutzername ist erforderlich'
      }, { status: 400 });
    }
    
    // Suche den Benutzer in der Datenbank
    const userToUpdate = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    if (userToUpdate.length === 0) {
      return json({
        success: false,
        message: `Benutzer "${username}" nicht gefunden`
      }, { status: 404 });
    }
    
    // Der Wert für adminState ist optional. Wenn nicht angegeben, wird der Status umgeschaltet
    const newAdminState = typeof adminState === 'boolean' 
      ? adminState 
      : !userToUpdate[0].isAdmin;
    
    // Update den Admin-Status des Benutzers
    await db
      .update(users)
      .set({
        isAdmin: newAdminState,
        updatedAt: new Date()
      })
      .where(eq(users.id, userToUpdate[0].id));
    
    return json({
      success: true,
      message: `Admin-Status für "${username}" wurde ${newAdminState ? 'aktiviert' : 'deaktiviert'}.`,
      username,
      isAdmin: newAdminState
    });
  } catch (error) {
    console.error('Fehler beim Ändern des Admin-Status:', error);
    return json({
      success: false,
      message: 'Fehler beim Ändern des Admin-Status',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
};