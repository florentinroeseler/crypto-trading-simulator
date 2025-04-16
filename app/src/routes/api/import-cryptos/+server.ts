// src/routes/api/import-cryptos/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { coinGeckoAPI } from '$lib/server/api/coingecko';

export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    // Prüfen, ob der Benutzer ein Admin ist
    if (!locals.user || !locals.user.isAdmin) {
      return json({ 
        success: false, 
        message: 'Nur Administratoren können diesen Endpunkt aufrufen' 
      }, { status: 403 });
    }
    
    const data = await request.json();
    const limit = data.limit || 20;
    
    // Neue Kryptowährungen importieren
    const importedCount = await coinGeckoAPI.importTopCryptocurrencies(limit);
    
    return json({
      success: true,
      message: `${importedCount} neue Kryptowährungen importiert`,
      importedCount
    });
  } catch (error) {
    console.error('Fehler beim Importieren von Kryptowährungen:', error);
    return json({
      success: false,
      message: 'Fehler beim Importieren von Kryptowährungen',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
};