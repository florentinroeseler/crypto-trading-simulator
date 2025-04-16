// src/lib/server/api/coingecko.ts
import { env } from '$env/dynamic/private';
import { assets } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  last_updated: string;
  total_volume: number;
  circulating_supply: number;
  max_supply: number;
  ath: number;
  ath_date: string;
}

export class CoinGeckoAPI {
  private baseUrl: string;
  private apiKey: string | null;

  constructor() {
    this.baseUrl = 'https://api.coingecko.com/api/v3';
    // Optional: API-Key für höhere Ratenlimits (CoinGecko Pro)
    this.apiKey = env.COINGECKO_API_KEY || null;
  }

  /**
   * Ruft die Marktdaten für die Top-Kryptowährungen ab
   * @param currency Die Währung, in der die Preise angezeigt werden (default: 'eur')
   * @param limit Die Anzahl der abzurufenden Kryptowährungen (default: 50)
   */
  async getTopCryptocurrencies(currency = 'eur', limit = 50): Promise<CoinGeckoMarketData[]> {
    try {
      const url = new URL(`${this.baseUrl}/coins/markets`);
      
      // Parameter setzen
      url.searchParams.set('vs_currency', currency);
      url.searchParams.set('order', 'market_cap_desc');
      url.searchParams.set('per_page', limit.toString());
      url.searchParams.set('page', '1');
      url.searchParams.set('sparkline', 'false');
      url.searchParams.set('price_change_percentage', '24h');
      
      if (this.apiKey) {
        url.searchParams.set('x_cg_pro_api_key', this.apiKey);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data as CoinGeckoMarketData[];
    } catch (error) {
      console.error('Error fetching cryptocurrency data:', error);
      throw error;
    }
  }

  /**
   * Aktualisiert die Preise aller Kryptowährungen in der Datenbank
   */
  async updateAllCryptoPrices(): Promise<number> {
    try {
      // Hole alle Kryptos aus der Datenbank
      const dbAssets = await db.select().from(assets).where(eq(assets.type, 'crypto'));
      
      if (dbAssets.length === 0) {
        console.log('Keine Kryptowährungen in der Datenbank gefunden.');
        return 0;
      }
      
      // Hole aktuelle Daten von CoinGecko
      const cryptoData = await this.getTopCryptocurrencies('eur', 100);
      
      // Erstelle eine Map für schnelleren Zugriff auf CoinGecko-Daten
      const symbolToData = new Map<string, CoinGeckoMarketData>();
      cryptoData.forEach(crypto => {
        symbolToData.set(crypto.symbol.toLowerCase(), crypto);
      });
      
      let updatedCount = 0;
      
      // Update jede Kryptowährung in der Datenbank
      for (const asset of dbAssets) {
        const symbol = asset.symbol.toLowerCase();
        const geckoData = symbolToData.get(symbol);
        
        if (geckoData) {
          await db.update(assets)
            .set({
              currentPrice: geckoData.current_price,
              lastUpdated: new Date(geckoData.last_updated),
              imageUrl: geckoData.image || asset.imageUrl,
              // Neue Felder aktualisieren
              marketCap: geckoData.market_cap || null,
              priceChangePercentage24h: geckoData.price_change_percentage_24h || null,
              volume24h: geckoData.total_volume || null,
              circulatingSupply: geckoData.circulating_supply || null,
              maxSupply: geckoData.max_supply || null,
              athPrice: geckoData.ath || null,
              athDate: geckoData.ath_date ? new Date(geckoData.ath_date) : null
            })
            .where(eq(assets.id, asset.id));
          
          updatedCount++;
        }
      }
      
      console.log(`${updatedCount} Kryptowährungen aktualisiert.`);
      return updatedCount;
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Kryptowährungspreise:', error);
      throw error;
    }
  }

  /**
   * Importiert neue Kryptowährungen in die Datenbank
   */
  async importTopCryptocurrencies(limit = 20): Promise<number> {
    try {
      // Hole die Top-Kryptos von CoinGecko
      const cryptoData = await this.getTopCryptocurrencies('eur', limit);
      
      // Hole bestehende Kryptos aus der Datenbank, um Duplikate zu vermeiden
      const dbAssets = await db.select().from(assets).where(eq(assets.type, 'crypto'));
      const existingSymbols = new Set(dbAssets.map(asset => asset.symbol.toLowerCase()));
      
      let importedCount = 0;
      
      // Füge neue Kryptos zur Datenbank hinzu
      for (const crypto of cryptoData) {
        if (!existingSymbols.has(crypto.symbol.toLowerCase())) {
          await db.insert(assets).values({
            symbol: crypto.symbol.toUpperCase(),
            name: crypto.name,
            type: 'crypto',
            currentPrice: crypto.current_price,
            lastUpdated: new Date(crypto.last_updated),
            imageUrl: crypto.image,
            // Neue Felder hinzufügen
            marketCap: crypto.market_cap || null,
            priceChangePercentage24h: crypto.price_change_percentage_24h || null,
            volume24h: crypto.total_volume || null,
            circulatingSupply: crypto.circulating_supply || null,
            maxSupply: crypto.max_supply || null,
            athPrice: crypto.ath || null,
            athDate: crypto.ath_date ? new Date(crypto.ath_date) : null
          });
          
          importedCount++;
        }
      }
      
      console.log(`${importedCount} neue Kryptowährungen importiert.`);
      return importedCount;
    } catch (error) {
      console.error('Fehler beim Importieren von Kryptowährungen:', error);
      throw error;
    }
  }
}

// Singleton-Instanz exportieren
export const coinGeckoAPI = new CoinGeckoAPI();