// src/routes/api/test-coingecko/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    // Einfacher Test-Call zur CoinGecko API
    const url = 'https://api.coingecko.com/api/v3/ping';
    
    console.log('Testing CoinGecko API...');
    const response = await fetch(url);
    const responseText = await response.text();
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response body:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }
    
    if (!response.ok) {
      return json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        message: 'API-Anfrage fehlgeschlagen',
        responseData
      }, { status: 500 });
    }
    
    // Wenn der erste Test erfolgreich war, teste den Marktdaten-Endpunkt
    const marketUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h';
    
    console.log('Testing markets endpoint...');
    const marketResponse = await fetch(marketUrl);
    const marketResponseText = await marketResponse.text();
    
    console.log('Market response status:', marketResponse.status);
    console.log('Market response headers:', Object.fromEntries(marketResponse.headers.entries()));
    
    let marketData;
    try {
      marketData = JSON.parse(marketResponseText);
    } catch (e) {
      marketData = { raw: marketResponseText };
    }
    
    return json({
      success: true,
      ping: responseData,
      markets: {
        success: marketResponse.ok,
        status: marketResponse.status,
        statusText: marketResponse.statusText,
        data: marketResponse.ok ? marketData : { error: marketResponseText }
      }
    });
  } catch (error) {
    console.error('Fehler beim Testen der CoinGecko API:', error);
    return json({
      success: false,
      message: 'Fehler beim Testen der CoinGecko API',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
};