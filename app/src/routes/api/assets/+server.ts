// src/routes/api/assets/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { assets } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
  try {
    // Parameter für Filterung
    const typeFilter = url.searchParams.get('type') || 'crypto';
    
    // Alle Assets aus der Datenbank abrufen
    const assetsList = await db
      .select()
      .from(assets)
      .where(eq(assets.type, typeFilter))
      .orderBy(assets.symbol);
    
    // Direkte Identifikation von nicht unterstützten Assets
    // Dies ist eine einfachere und zuverlässigere Methode, als über die API zu prüfen
    const unsupportedSymbols = ['AVAX', 'SHIB'];
    
    // Assets mit zusätzlichem Flag für API-Unterstützung anreichern
    const enhancedAssets = assetsList.map(asset => ({
      ...asset,
      apiSupported: !unsupportedSymbols.includes(asset.symbol)
    }));
    
    return json({
      success: true,
      assets: enhancedAssets
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Assets:', error);
    return json({
      success: false,
      message: 'Fehler beim Abrufen der Assets',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
};