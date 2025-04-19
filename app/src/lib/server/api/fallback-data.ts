// src/lib/server/api/fallback-data.ts
/**
 * Beispieldaten für Krypto-Charts, die als Fallback verwendet werden können,
 * wenn die API-Anfragen fehlschlagen.
 */

interface ChartDataPoint {
    timestamp: number;
    price: number;
  }
  
  /**
   * Generiert realistische Beispieldaten für Kryptowährungskurse
   * @param basePrice Ausgangspreis (z.B. 1000 für BTC)
   * @param volatility Volatilität der Kursschwankungen (0.1 = 10%)
   * @param days Anzahl der Tage für die Daten
   * @param pointsPerDay Datenpunkte pro Tag
   * @returns Array von Preis-Zeit-Punkten
   */
  export function generateSampleChartData(
    basePrice: number = 50000,
    volatility: number = 0.03,
    days: number = 7,
    pointsPerDay: number = 24
  ): ChartDataPoint[] {
    const now = Date.now();
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const totalPoints = days * pointsPerDay;
    const result: ChartDataPoint[] = [];
    
    let currentPrice = basePrice;
    
    for (let i = 0; i < totalPoints; i++) {
      // Zeitpunkt berechnen (älteste zuerst)
      const timestamp = now - (millisecondsPerDay * days) + (i * (millisecondsPerDay / pointsPerDay));
      
      // Zufällige Preisänderung mit Bias für langfristigen Trend
      const trend = Math.sin(i / totalPoints * Math.PI) * 0.02; // Leichter Trend nach oben und dann wieder runter
      const randomChange = (Math.random() - 0.5) * 2 * volatility; // Zufällige Änderung zwischen -volatility und +volatility
      const priceChange = currentPrice * (randomChange + trend);
      
      currentPrice += priceChange;
      // Sicherstellen, dass der Preis nicht negativ wird
      currentPrice = Math.max(currentPrice, basePrice * 0.5);
      
      result.push({
        timestamp,
        price: currentPrice
      });
    }
    
    return result;
  }
  
  /**
   * Erstellt einen Mock-Response im gleichen Format wie die CoinGecko-API
   */
  export function createMockChartResponse(symbol: string, days: number) {
    // Basis-Preis je nach Symbol
    let basePrice = 1000;
    switch (symbol.toLowerCase()) {
      case 'btc': basePrice = 50000; break;
      case 'eth': basePrice = 3000; break;
      case 'sol': basePrice = 100; break;
      case 'doge': basePrice = 0.1; break;
      default: basePrice = 100 + Math.random() * 900; // Zufälliger Preis für andere Kryptos
    }
    
    const chartData = generateSampleChartData(basePrice, 0.03, days, 24);
    
    // Format wie CoinGecko-API
    return {
      prices: chartData.map(point => [point.timestamp, point.price]),
      market_caps: chartData.map(point => [point.timestamp, point.price * 1000000]),
      total_volumes: chartData.map(point => [point.timestamp, point.price * 100000])
    };
  }