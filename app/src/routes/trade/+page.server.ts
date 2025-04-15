// src/routes/trade/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { assets, portfolios } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  // Prüfe, ob der Benutzer angemeldet ist
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  try {
    // Hole alle verfügbaren Kryptowährungen
    const cryptos = await db
      .select()
      .from(assets)
      .orderBy(assets.name);
    
    // Hole das Portfolio des Benutzers für die Anzeige der Bestände
    const userPortfolio = await db
      .select({
        assetId: portfolios.assetId,
        quantity: portfolios.quantity
      })
      .from(portfolios)
      .where(eq(portfolios.userId, locals.user.id));
    
    // Erstelle ein Map des Portfolios für einfachen Zugriff
    const portfolioMap = new Map();
    userPortfolio.forEach(entry => {
      portfolioMap.set(entry.assetId, entry.quantity);
    });
    
    // Füge Bestandsinformationen zu den Kryptowährungen hinzu
    const cryptosWithBalance = cryptos.map(crypto => ({
      ...crypto,
      userBalance: portfolioMap.get(crypto.id) || 0
    }));

    return {
      cryptos: cryptosWithBalance,
      user: {
        balance: locals.user.balance,
        id: locals.user.id
      }
    };
  } catch (error) {
    console.error('Fehler beim Laden der Trade-Daten:', error);
    return {
      cryptos: [],
      user: {
        balance: locals.user.balance,
        id: locals.user.id
      }
    };
  }
};