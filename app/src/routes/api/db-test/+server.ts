import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { assets } from '$lib/server/db/schema';

export const GET: RequestHandler = async () => {
  try {
    // Teste die Datenbankverbindung, indem wir alle Assets abfragen
    const allAssets = await db.select().from(assets);
    
    return json({
      success: true,
      message: 'Datenbankverbindung erfolgreich',
      assets: allAssets
    });
  } catch (error) {
    console.error('Fehler bei der Datenbankverbindung:', error);
    
    return json({
      success: false,
      message: 'Fehler bei der Datenbankverbindung',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
};