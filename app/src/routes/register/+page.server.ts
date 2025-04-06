import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { lucia } from '$lib/server/auth';
import { Argon2id } from 'oslo/password';
import { eq, or } from 'drizzle-orm';

// In src/routes/register/+page.server.ts
export const actions: Actions = {
    default: async ({ request, cookies }) => {
      const formData = await request.formData();
      const username = formData.get('username');
      const email = formData.get('email');
      const password = formData.get('password');
    
      // Validierung der Eingaben
      if (
        typeof username !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        username.length < 3 ||
        password.length < 8 ||
        !email.includes('@')
      ) {
        return fail(400, {
          error: 'Ungültige Eingaben. Bitte überprüfe deine Angaben.'
        });
      }
    
      try {
        // Überprüfe, ob Benutzername ODER E-Mail bereits existieren
        const existingUser = await db
          .select()
          .from(users)
          .where(
            or(
              eq(users.username, username),
              eq(users.email, email)
            )
          ).limit(1);
    
        if (existingUser.length > 0) {
          return fail(400, {
            error: 'Benutzername oder E-Mail wird bereits verwendet.'
          });
        }
    
        // Passwort hashen
        const hashedPassword = await new Argon2id().hash(password);
    
        // Benutzer einfügen und die zurückgegebene ID verwenden
        const result = await db.insert(users).values({
          username,
          email,
          hashedPassword,
          balance: 10000,
          isAdmin: false
        }).returning({ id: users.id });
        
        // ID direkt aus dem Ergebnis nehmen
        const userId = result[0].id;
        
        // Sitzung erstellen
        const session = await lucia.createSession(userId, {});
        
        // Cookie setzen
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies.set(sessionCookie.name, sessionCookie.value, {
          path: '/',  // Verwende '/' anstelle von '.' für bessere Cookie-Sichtbarkeit
          ...sessionCookie.attributes
        });
        
        // Erfolg zurückgeben
        return { success: true };
      } catch (error) {
        console.error('Fehler bei der Registrierung:', error);
        return fail(500, {
          error: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.'
        });
      }
    }
  };