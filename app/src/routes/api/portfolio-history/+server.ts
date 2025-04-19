// src/routes/api/portfolio-history/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { portfolioHistoryService } from '$lib/server/api/portfolio-history';

export const GET: RequestHandler = async ({ url, locals }) => {
  // Prüfe, ob der Benutzer angemeldet ist
  if (!locals.user) {
    return json({
      success: false,
      message: 'Nicht autorisiert'
    }, { status: 401 });
  }
  
  try {
    // Parameter aus der URL abrufen
    const daysParam = url.searchParams.get('days') || '30';
    let days = parseInt(daysParam, 10);
    
    // Sicherstellen, dass days ein gültiger Wert ist
    if (isNaN(days) || days <= 0) {
      days = 30; // Standard: 30 Tage
    }
    
    // Auf maximal 365 Tage begrenzen (um Ressourcen zu schonen)
    days = Math.min(days, 365);
    
    // Portfolio-Verlaufsdaten abrufen
    const portfolioHistory = await portfolioHistoryService.getPortfolioHistory(
      locals.user.id,
      days
    );
    
    // Füge auch das aktuelle Guthaben hinzu
    const portfolioWithBalance = {
      history: portfolioHistory,
      currentBalance: locals.user.balance || 0
    };
    
    return json({
      success: true,
      data: portfolioWithBalance
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Portfolio-Historie:', error);
    return json({
      success: false,
      message: 'Fehler beim Abrufen der Portfolio-Historie',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
};