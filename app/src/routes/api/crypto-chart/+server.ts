// src/routes/api/crypto-chart/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { rateLimiter } from '$lib/server/api/rate-limiter';
import { env } from '$env/dynamic/private';
import { createMockChartResponse } from '$lib/server/api/fallback-data';

export const GET: RequestHandler = async ({ url }) => {
  try {
    // Parameter aus der URL abrufen
    const symbol = url.searchParams.get('symbol');
    const days = url.searchParams.get('days') || '7';
    const currency = url.searchParams.get('currency') || 'eur';
    
    if (!symbol) {
      return json({
        success: false,
        message: 'Symbol-Parameter fehlt'
      }, { status: 400 });
    }
    
    // Rate-Limiter anwenden
    await rateLimiter.throttle();
    
    // URL für die CoinGecko-API erstellen
    let apiUrl: string;
    
    // Überprüfen, ob wir eine Coin-ID oder ein Symbol haben
    // CoinGecko erfordert die Coin-ID, nicht das Symbol
    if (symbol.length <= 5) {
      // Wenn es ein Symbol ist (wie btc, eth), müssen wir zuerst die ID abrufen
      console.log(`Symbol erkannt: ${symbol}, hole Coin-ID...`);
      const coinListUrl = 'https://api.coingecko.com/api/v3/coins/list';
      
      const coinListOptions: RequestInit = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };
      
      // API-Key hinzufügen, falls vorhanden
      const apiKey = env.COINGECKO_API_KEY;
      if (apiKey) {
        coinListOptions.headers = {
          ...coinListOptions.headers,
          'x-cg-demo-api-key': apiKey
        };
      }
      
      const coinListResponse = await fetch(coinListUrl, coinListOptions);
      
      if (!coinListResponse.ok) {
        if (coinListResponse.status === 429) {
          rateLimiter.handleRateLimitExceeded();
          return json({
            success: false,
            message: 'Rate-Limit erreicht. Bitte versuche es später erneut.'
          }, { status: 429 });
        }
        
        return json({
          success: false,
          message: `Fehler beim Abrufen der Coin-Liste: ${coinListResponse.status} ${coinListResponse.statusText}`
        }, { status: coinListResponse.status });
      }
      
      const coinList = await coinListResponse.json();
      
      // Finde die Coin-ID passend zum Symbol
      const coinInfo = coinList.find((coin: any) => 
        coin.symbol.toLowerCase() === symbol.toLowerCase()
      );
      
      if (!coinInfo) {
        return json({
          success: false,
          message: `Keine Coin-ID gefunden für Symbol: ${symbol}`
        }, { status: 404 });
      }
      
      apiUrl = `https://api.coingecko.com/api/v3/coins/${coinInfo.id}/market_chart?vs_currency=${currency}&days=${days}`;
    } else {
      // Wir nehmen an, dass es bereits eine Coin-ID ist
      apiUrl = `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=${currency}&days=${days}`;
    }
    
    console.log(`Rufe Chart-Daten ab von: ${apiUrl}`);
    
    // Optionen für die Anfrage
    const options: RequestInit = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    
    // API-Key hinzufügen, falls vorhanden
    const apiKey = env.COINGECKO_API_KEY;
    if (apiKey) {
      options.headers = {
        ...options.headers,
        'x-cg-pro-api-key': apiKey
      };
    }
    
    // Anfrage an die CoinGecko-API senden
    const response = await fetch(apiUrl, options);
    
    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Response body: ${errorText}`);
      
      if (response.status === 429) {
        rateLimiter.handleRateLimitExceeded();
      }
      
      // Bei Fehlern Beispieldaten verwenden, damit die UI trotzdem funktioniert
      console.log(`Verwende Fallback-Daten für ${symbol}`);
      const daysNum = days === 'max' ? 365 : parseInt(days as string);
      const mockData = createMockChartResponse(symbol, daysNum);
      
      return json({
        success: true,
        data: mockData,
        isMock: true
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
    return json({
      success: false,
      message: 'Fehler beim Abrufen der Chart-Daten',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
};