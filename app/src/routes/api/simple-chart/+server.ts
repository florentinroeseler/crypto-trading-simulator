// src/routes/api/simple-chart/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createMockChartResponse } from '$lib/server/api/fallback-data';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ url, fetch }) => {
  try {
    // Parameter aus der URL abrufen
    const symbol = url.searchParams.get('symbol')?.toLowerCase() || 'btc';
    const days = url.searchParams.get('days') || '7';
    
    // Die einfachste Methode - direkt die CoinGecko-API aufrufen mit bekannten IDs
    let coinId;
    
    // Mapping der häufigsten Symbole zu ihren CoinGecko-IDs
    switch (symbol) {
      case 'btc': coinId = 'bitcoin'; break;
      case 'eth': coinId = 'ethereum'; break;
      case 'sol': coinId = 'solana'; break;
      case 'xrp': coinId = 'ripple'; break;
      case 'doge': coinId = 'dogecoin'; break;
      case 'ada': coinId = 'cardano'; break;
      case 'bnb': coinId = 'binancecoin'; break;
      case 'dot': coinId = 'polkadot'; break;
      case 'ltc': coinId = 'litecoin'; break;
      case 'link': coinId = 'chainlink'; break;
      default: coinId = symbol; // Für andere Symbole versuchen wir das Symbol selbst als ID
    }
    
    console.log(`Verwende CoinGecko ID: ${coinId} für Symbol: ${symbol}`);
    
    // API-Key aus der Umgebungsvariable lesen
    const apiKey = env.COINGECKO_API_KEY;
    
    // URL für die CoinGecko-API erstellen
    // WICHTIG: API-Key als Demo-Key Query-Parameter verwenden
    let apiUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=eur&days=${days}`;
    
    // API-Key als Query-Parameter hinzufügen, wenn vorhanden
    if (apiKey) {
      apiUrl += `&x_cg_demo_api_key=${apiKey}`;
      console.log('API-Key wurde als Demo-Key Query-Parameter hinzugefügt');
    }
    
    console.log(`Sende Anfrage an: ${apiUrl}`);
    
    // Anfrage an die CoinGecko-API senden (ohne API-Key in den Headern)
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      
      // Bei Fehlern einfach Beispieldaten zurückgeben
      console.log(`Verwende Fallback-Daten für ${symbol}`);
      const daysNum = days === 'max' ? 365 : parseInt(days as string);
      const mockData = createMockChartResponse(symbol, daysNum);
      
      return json({
        success: true,
        data: mockData,
        isMock: true,
        error: `API-Fehler: ${response.status} ${response.statusText}`
      });
    }
    
    // Daten zurückgeben
    const data = await response.json();
    
    return json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Chart-Daten:', error);
    
    // Im Fehlerfall immer Beispieldaten zurückgeben
    const symbol = url.searchParams.get('symbol')?.toLowerCase() || 'btc';
    const days = url.searchParams.get('days') || '7';
    const daysNum = days === 'max' ? 365 : parseInt(days as string);
    
    const mockData = createMockChartResponse(symbol, daysNum);
    
    return json({
      success: true,
      data: mockData,
      isMock: true,
      error: error instanceof Error ? error.message : String(error)
    });
  }
};