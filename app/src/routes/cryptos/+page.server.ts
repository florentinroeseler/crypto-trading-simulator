import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { assets } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
  try {
    // Alle Kryptowährungen aus der Datenbank abrufen
    const cryptos = await db.select().from(assets).orderBy(assets.currentPrice);

    return {
      cryptos
    };
  } catch (error) {
    console.error('Fehler beim Laden der Kryptowährungen:', error);
    return {
      cryptos: []
    };
  }
};