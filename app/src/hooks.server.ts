// src/hooks.server.ts
import { lucia } from '$lib/server/auth';
import { coinGeckoAPI } from '$lib/server/api/coingecko';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';

// Intervall für die Preisaktualisierung (in Millisekunden)
// Standard: 5 Minuten, kann über Umgebungsvariable angepasst werden
const UPDATE_INTERVAL = parseInt(env.CRYPTO_UPDATE_INTERVAL || '300000', 10);

// Flag für aktiven Cron-Job
let updateJobActive = false;

/**
 * Startet den Hintergrundjob für Preisupdate
 */
function startPriceUpdateJob() {
  if (updateJobActive) return;
  
  updateJobActive = true;
  console.log(`Preisupdate-Job gestartet. Intervall: ${UPDATE_INTERVAL}ms`);
  
  // Initiales Update nach einer kurzen Verzögerung beim Start (um Server-Start nicht zu blockieren)
  setTimeout(updatePrices, 10000);
  
  // Regelmäßige Updates einrichten
  setInterval(updatePrices, UPDATE_INTERVAL);
}

/**
 * Aktualisiert die Kryptowährungspreise
 */
async function updatePrices() {
  try {
    console.log('Aktualisiere Kryptowährungspreise...');
    await coinGeckoAPI.updateAllCryptoPrices();
    console.log('Preisaktualisierung abgeschlossen');
  } catch (error) {
    console.error('Fehler bei der automatischen Preisaktualisierung:', error);
    
    // Bei Rate-Limit-Fehler längere Pause einlegen
    if (error.message && error.message.includes('Rate-Limit')) {
      console.log('Rate-Limit erreicht, nächste Aktualisierung erfolgt beim nächsten Intervall');
    }
  }
}

// Starte den Update-Job, wenn wir nicht im Build-Modus sind
if (!building) {
  startPriceUpdateJob();
}

// Authentifizierungshandler
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