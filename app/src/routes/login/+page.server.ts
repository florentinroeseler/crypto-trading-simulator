import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { lucia } from '$lib/server/auth';
import { Argon2id } from 'oslo/password';
import { eq } from 'drizzle-orm';

// src/routes/login/+page.server.ts
export const actions: Actions = {
    default: async ({ request, cookies }) => {
      const formData = await request.formData();
      const email = formData.get('email');
      const password = formData.get('password');
    
      // Validierung der Eingaben
      if (
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        !email ||
        !password
      ) {
        return fail(400, {
          error: 'Ungültige Eingaben. Bitte überprüfe deine Angaben.'
        });
      }
    
      try {
        // Benutzer über E-Mail finden
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
    
        if (user.length === 0) {
          return fail(400, {
            error: 'E-Mail oder Passwort ist falsch.'
          });
        }
    
        // Passwort überprüfen
        const validPassword = await new Argon2id().verify(
          user[0].hashedPassword,
          password
        );
    
        if (!validPassword) {
          return fail(400, {
            error: 'E-Mail oder Passwort ist falsch.'
          });
        }
    
        // Neue Sitzung erstellen
        const session = await lucia.createSession(user[0].id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        
        // Cookie setzen
        cookies.set(sessionCookie.name, sessionCookie.value, {
          path: '/',  // Verwende '/' anstelle von '.' für globale Cookie-Verfügbarkeit
          ...sessionCookie.attributes
        });
    
        // Erfolg zurückgeben statt Weiterleitung
        return { success: true };
      } catch (error) {
        console.error('Fehler beim Login:', error);
        return fail(500, {
          error: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.'
        });
      }
    }
  };