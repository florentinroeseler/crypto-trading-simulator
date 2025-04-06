import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { assets } from '$lib/server/db/schema';

// Diese Seite ist nur für angemeldete Benutzer zugänglich
export const load: PageServerLoad = async ({ locals }) => {
  // Prüfe, ob der Benutzer angemeldet ist
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  try {
    // Hole aktuelle Kryptowährungen für die Marktübersicht
    const cryptos = await db.select().from(assets).orderBy(assets.currentPrice);

    // Benutzerinformationen zurückgeben (ohne sensible Daten)
    return {
      user: {
        username: locals.user.username,
        email: locals.user.email,
        balance: locals.user.balance,
        createdAt: locals.user.createdAt
      },
      cryptos
    };
  } catch (error) {
    console.error('Fehler beim Laden der Dashboard-Daten:', error);
    return {
      user: locals.user,
      cryptos: []
    };
  }
};