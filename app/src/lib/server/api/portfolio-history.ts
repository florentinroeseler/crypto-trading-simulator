// src/lib/server/api/portfolio-history.ts
import { db } from '$lib/server/db';
import { transactions, assets, portfolios } from '$lib/server/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { coinGeckoAPI } from './coingecko';

export interface PortfolioDataPoint {
  timestamp: number;
  value: number;
}

export interface AssetHistoryItem {
  assetId: string;
  symbol: string;
  name: string;
  prices: { timestamp: number; price: number }[];
}

interface TransactionWithAsset {
  id: string;
  userId: string;
  assetId: string;
  type: string;
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
  symbol: string;
  name: string;
}

/**
 * Service für die Berechnung und Abfrage von Portfolio-Verlaufsdaten
 */
export class PortfolioHistoryService {
  /**
   * Berechnet die historische Entwicklung des Portfolios für einen Benutzer
   * @param userId Die Benutzer-ID
   * @param days Die Anzahl der Tage in der Vergangenheit (1, 7, 30, 90)
   */
  async getPortfolioHistory(userId: string, days: number): Promise<PortfolioDataPoint[]> {
    try {
      // 1. Bestimme den Startzeitpunkt basierend auf der Anzahl der Tage
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // 2. Hole alle Transaktionen des Benutzers seit dem Startzeitpunkt
      const userTransactions = await this.getUserTransactionsWithAssetInfo(userId, startDate);
      
      if (userTransactions.length === 0) {
        return this.generateEmptyPortfolioHistory(days);
      }
      
      // 3. Hole die aktuellen Bestände des Nutzers
      const currentHoldings = await this.getUserCurrentHoldings(userId);
      
      // 4. Hole Preisverlaufsdaten für alle Assets im Portfolio
      const assetIds = new Set(userTransactions.map(t => t.assetId));
      const assetSymbols = new Map(userTransactions.map(t => [t.assetId, t.symbol]));
      
      const assetHistories: Map<string, AssetHistoryItem> = new Map();
      
      // Für jedes Asset im Portfolio die Preisverlaufsdaten holen
      for (const assetId of assetIds) {
        const symbol = assetSymbols.get(assetId) || '';
        const prices = await this.getAssetPriceHistory(symbol, days);
        
        const assetName = userTransactions.find(t => t.assetId === assetId)?.name || '';
        
        assetHistories.set(assetId, {
          assetId,
          symbol,
          name: assetName,
          prices
        });
      }
      
      // 5. Portfolio-Verlauf berechnen
      return this.calculatePortfolioValueTimeseries(userTransactions, assetHistories, currentHoldings, days);
    } catch (error) {
      console.error('Fehler beim Abrufen der Portfolio-Historie:', error);
      return this.generateEmptyPortfolioHistory(days);
    }
  }
  
  /**
   * Holt die Transaktionen eines Benutzers mit Asset-Informationen
   */
  private async getUserTransactionsWithAssetInfo(
    userId: string, 
    startDate: Date
  ): Promise<TransactionWithAsset[]> {
    return db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        assetId: transactions.assetId,
        type: transactions.type,
        quantity: transactions.quantity,
        price: transactions.price,
        total: transactions.total,
        timestamp: transactions.timestamp,
        symbol: assets.symbol,
        name: assets.name
      })
      .from(transactions)
      .innerJoin(assets, eq(transactions.assetId, assets.id))
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.timestamp, startDate)
        )
      )
      .orderBy(transactions.timestamp);
  }
  
  /**
   * Holt die aktuellen Bestände eines Benutzers
   */
  private async getUserCurrentHoldings(userId: string): Promise<Map<string, number>> {
    const portfolioItems = await db
      .select({
        assetId: portfolios.assetId,
        quantity: portfolios.quantity
      })
      .from(portfolios)
      .where(eq(portfolios.userId, userId));
    
    const holdingsMap = new Map<string, number>();
    
    for (const item of portfolioItems) {
      holdingsMap.set(item.assetId, item.quantity);
    }
    
    return holdingsMap;
  }
  
  /**
   * Holt die Preisverlaufsdaten für ein Asset
   */
  private async getAssetPriceHistory(symbol: string, days: number): Promise<{ timestamp: number; price: number }[]> {
    try {
      // Da wir bereits eine Funktion zum Abrufen von Preisverlaufsdaten haben,
      // können wir diese verwenden
      // Hier nutzen wir das Asset-Symbol, müssten aber die CoinGecko-ID kennen oder mappenden
      // Erstelle einen API-Endpunkt und rufe diesen auf
      
      // Wir könnten auch ein Caching implementieren, um nicht zu viele API-Calls zu machen
      
      // Platzhalter: Generiere simulierte Preisdaten
      return this.generateSimulatedPriceHistory(symbol, days);
    } catch (error) {
      console.error(`Fehler beim Abrufen der Preisverlaufsdaten für ${symbol}:`, error);
      return this.generateSimulatedPriceHistory(symbol, days);
    }
  }
  
  /**
   * Berechnet die Wertentwicklung des Portfolios über Zeit
   */
  private calculatePortfolioValueTimeseries(
    transactions: TransactionWithAsset[],
    assetHistories: Map<string, AssetHistoryItem>,
    currentHoldings: Map<string, number>,
    days: number
  ): PortfolioDataPoint[] {
    // Bestimme den Zeitraum und die Anzahl der Datenpunkte
    const now = new Date();
    const startTimestamp = now.getTime() - (days * 24 * 60 * 60 * 1000);
    
    // Anzahl der Datenpunkte je nach Zeitraum
    let numPoints: number;
    if (days <= 1) {
      numPoints = 24; // Stündlich für 1 Tag
    } else if (days <= 7) {
      numPoints = days * 6; // Alle 4 Stunden für 1 Woche
    } else if (days <= 30) {
      numPoints = days; // Täglich für 1 Monat
    } else {
      numPoints = Math.floor(days / 3); // Alle 3 Tage für längere Zeiträume
    }
    
    const timeInterval = (days * 24 * 60 * 60 * 1000) / numPoints;
    
    // Erstelle Zeitpunkte für die Berechnung
    const timepoints: number[] = [];
    for (let i = 0; i <= numPoints; i++) {
      timepoints.push(startTimestamp + (i * timeInterval));
    }
    
    // Für jeden Zeitpunkt das Portfolio berechnen
    const portfolioHistory: PortfolioDataPoint[] = [];
    
    // Holdings für jeden Asset-Typ zu jedem Zeitpunkt
    const holdingsOverTime = new Map<string, number[]>();
    
    // Initialisiere Holdings für jedes Asset mit 0 für alle Zeitpunkte
    for (const assetId of assetHistories.keys()) {
      holdingsOverTime.set(assetId, Array(timepoints.length).fill(0));
    }
    
    // Berechne die Holdings für jeden Zeitpunkt basierend auf Transaktionen
    for (const transaction of transactions) {
      const assetId = transaction.assetId;
      const transactionTime = new Date(transaction.timestamp).getTime();
      
      // Finde den Index des Zeitpunkts, der gerade nach der Transaktion liegt
      const timeIndex = timepoints.findIndex(t => t >= transactionTime);
      
      if (timeIndex === -1) continue; // Transaktion liegt nach dem Endzeitpunkt
      
      const holdings = holdingsOverTime.get(assetId) || Array(timepoints.length).fill(0);
      
      // Update Holdings für alle Zeitpunkte nach dieser Transaktion
      for (let i = timeIndex; i < timepoints.length; i++) {
        if (transaction.type === 'buy') {
          holdings[i] += transaction.quantity;
        } else if (transaction.type === 'sell') {
          holdings[i] -= transaction.quantity;
        }
      }
      
      holdingsOverTime.set(assetId, holdings);
    }
    
    // Für jeden Zeitpunkt den Gesamtwert des Portfolios berechnen
    for (let i = 0; i < timepoints.length; i++) {
      const timestamp = timepoints[i];
      let totalValue = 0;
      
      // Für jedes Asset den Wert zum Zeitpunkt berechnen
      for (const [assetId, holdings] of holdingsOverTime.entries()) {
        const quantity = holdings[i];
        
        if (quantity <= 0) continue;
        
        const assetHistory = assetHistories.get(assetId);
        
        if (!assetHistory) continue;
        
        // Finde den nächsten Preis zum Zeitpunkt
        const closestPrice = this.findClosestPrice(assetHistory.prices, timestamp);
        
        if (closestPrice) {
          totalValue += quantity * closestPrice;
        }
      }
      
      portfolioHistory.push({
        timestamp,
        value: totalValue
      });
    }
    
    return portfolioHistory;
  }
  
  /**
   * Findet den nächsten Preis zu einem bestimmten Zeitpunkt
   */
  private findClosestPrice(
    prices: { timestamp: number; price: number }[], 
    targetTimestamp: number
  ): number | null {
    if (prices.length === 0) return null;
    
    // Sortiere Preise nach Zeitstempel
    const sortedPrices = [...prices].sort((a, b) => a.timestamp - b.timestamp);
    
    // Wenn der Zielzeitstempel vor dem ersten Preis liegt, verwende den ersten Preis
    if (targetTimestamp <= sortedPrices[0].timestamp) {
      return sortedPrices[0].price;
    }
    
    // Wenn der Zielzeitstempel nach dem letzten Preis liegt, verwende den letzten Preis
    if (targetTimestamp >= sortedPrices[sortedPrices.length - 1].timestamp) {
      return sortedPrices[sortedPrices.length - 1].price;
    }
    
    // Finde den nächsten Preis durch binäre Suche
    let left = 0;
    let right = sortedPrices.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      
      if (sortedPrices[mid].timestamp === targetTimestamp) {
        return sortedPrices[mid].price;
      }
      
      if (sortedPrices[mid].timestamp < targetTimestamp) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    // Wähle den näheren Zeitstempel
    const beforePrice = sortedPrices[right];
    const afterPrice = sortedPrices[left];
    
    if (Math.abs(targetTimestamp - beforePrice.timestamp) <= Math.abs(targetTimestamp - afterPrice.timestamp)) {
      return beforePrice.price;
    } else {
      return afterPrice.price;
    }
  }
  
  /**
   * Generiert leere Portfolio-Verlaufsdaten für den Fall, dass keine Transaktionen vorhanden sind
   */
  private generateEmptyPortfolioHistory(days: number): PortfolioDataPoint[] {
    const now = new Date();
    const startTimestamp = now.getTime() - (days * 24 * 60 * 60 * 1000);
    
    // Anzahl der Datenpunkte je nach Zeitraum
    let numPoints: number;
    if (days <= 1) {
      numPoints = 24; // Stündlich für 1 Tag
    } else if (days <= 7) {
      numPoints = days * 6; // Alle 4 Stunden für 1 Woche
    } else if (days <= 30) {
      numPoints = days; // Täglich für 1 Monat
    } else {
      numPoints = Math.floor(days / 3); // Alle 3 Tage für längere Zeiträume
    }
    
    const timeInterval = (days * 24 * 60 * 60 * 1000) / numPoints;
    
    // Erstelle Datenpunkte mit Wert 0
    const history: PortfolioDataPoint[] = [];
    
    for (let i = 0; i <= numPoints; i++) {
      history.push({
        timestamp: startTimestamp + (i * timeInterval),
        value: 0
      });
    }
    
    return history;
  }
  
  /**
   * Generiert simulierte Preisverlaufsdaten für ein Asset
   * (Temporäre Lösung, bis wir echte Daten haben)
   */
  private generateSimulatedPriceHistory(
    symbol: string, 
    days: number
  ): { timestamp: number; price: number }[] {
    const now = new Date();
    const startTimestamp = now.getTime() - (days * 24 * 60 * 60 * 1000);
    
    // Anzahl der Datenpunkte je nach Zeitraum
    let numPoints: number;
    if (days <= 1) {
      numPoints = 24; // Stündlich für 1 Tag
    } else if (days <= 7) {
      numPoints = days * 6; // Alle 4 Stunden für 1 Woche
    } else if (days <= 30) {
      numPoints = days; // Täglich für 1 Monat
    } else {
      numPoints = Math.floor(days / 3); // Alle 3 Tage für längere Zeiträume
    }
    
    const timeInterval = (days * 24 * 60 * 60 * 1000) / numPoints;
    
    // Basis-Preis je nach Symbol (vereinfacht)
    let basePrice = 1000;
    const volatility = 0.02; // 2% Volatilität
    
    switch(symbol.toLowerCase()) {
      case 'btc': basePrice = 50000; break;
      case 'eth': basePrice = 3000; break;
      case 'sol': basePrice = 100; break;
      case 'ada': basePrice = 0.5; break;
      case 'doge': basePrice = 0.1; break;
      default: basePrice = 100 + Math.random() * 900;
    }
    
    // Generiere Preise mit zufälligen Schwankungen und leichtem Trend
    const priceHistory: { timestamp: number; price: number }[] = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i <= numPoints; i++) {
      const timestamp = startTimestamp + (i * timeInterval);
      
      // Zufällige Preisänderung mit leichtem Trend
      const trend = Math.sin(i / numPoints * Math.PI) * 0.01; // Leichter Trend nach oben und dann wieder runter
      const randomChange = (Math.random() - 0.5) * 2 * volatility; // Zufällige Änderung
      
      currentPrice *= (1 + randomChange + trend);
      
      priceHistory.push({
        timestamp,
        price: currentPrice
      });
    }
    
    return priceHistory;
  }
}

// Singleton-Instanz exportieren
export const portfolioHistoryService = new PortfolioHistoryService();