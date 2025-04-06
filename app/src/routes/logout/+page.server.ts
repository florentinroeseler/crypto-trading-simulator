// src/routes/logout/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { lucia } from '$lib/server/auth';

// Zeige nur die Logout-Seite an
export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/');
  }
  
  return {};
};

export const actions: Actions = {
  default: async ({ locals, cookies }) => {
    if (!locals.session) {
      throw redirect(302, '/');
    }

    // Sitzung ungültig machen
    await lucia.invalidateSession(locals.session.id);
    
    // Cookie löschen
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '/',  // Verwende '/' anstelle von '.' für konsistente Cookie-Handhabung
      ...sessionCookie.attributes
    });
    
    // Direkt zur Startseite weiterleiten
    throw redirect(302, '/');
  }
};