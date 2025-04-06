// src/hooks.server.ts
import { lucia } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  console.log('Route:', event.url.pathname);
  console.log('Session cookie:', event.cookies.get(lucia.sessionCookieName));
  // Hole das Sitzungs-Cookie
  const sessionId = event.cookies.get(lucia.sessionCookieName);
  
  if (!sessionId) {
    // Keine Sitzung gefunden
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  // Validiere die Sitzung
  const { session, user } = await lucia.validateSession(sessionId);
  
  if (session && session.fresh) {
    // Wenn die Sitzung erneuert wurde, setze ein neues Cookie
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '/',  // Verwende '/' anstelle von '.'
      ...sessionCookie.attributes
    });
  }
  
  if (!session) {
    // Ungültige Sitzung, lösche das Cookie
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '/',  // Verwende '/' anstelle von '.'
      ...sessionCookie.attributes
    });
  }
  
  // Speichere Benutzer und Sitzung in den lokalen Variablen
  event.locals.user = user;
  event.locals.session = session;

  console.log('User after validation:', !!user);
  
  // Löse die Anfrage auf
  return resolve(event);
};