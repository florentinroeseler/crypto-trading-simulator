// src/routes/api/update-prices/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { coinGeckoAPI } from '$lib/server/api/coingecko';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Prüfen, ob der Benutzer ein Admin ist (optional)
    if (locals.user && !locals.user.isAdmin) {
      return json({ 
        success: false, 
        message: 'Nur Administratoren können diesen Endpunkt aufrufen' 
      }, { status: 403 });
    }
    
    // Alle Krypto-Preise aktualisieren
    const updatedCount = await coinGeckoAPI.updateAllCryptoPrices();
    
    return json({
      success: true,
      message: `${updatedCount} Kryptowährungen aktualisiert`,
      updatedCount
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Preise:', error);
    return json({
      success: false,
      message: 'Fehler beim Aktualisieren der Preise',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
};