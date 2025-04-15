// src/lib/server/db/seed-data.ts
import { db } from '$lib/server/db';
import { users, assets, portfolios, transactions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Hilfsfunktion um einen zufälligen Wert in einem Bereich zu erzeugen
function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Hilfsfunktion um einen zufälligen Zeitpunkt in den letzten Tagen zu erzeugen
function randomDate(days: number): Date {
  const now = new Date();
  const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return new Date(pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime()));
}

// Testdaten generieren
export async function seedTestData(userId: string) {
  try {
    // 1. Überprüfe, ob der Benutzer existiert
    const userExists = await db.select().from(users).where(eq(users.id, userId));
    
    if (userExists.length === 0) {
      console.error(`Benutzer mit ID ${userId} nicht gefunden.`);
      return false;
    }

    // 2. Hole alle Assets aus der Datenbank
    const allAssets = await db.select().from(assets);
    
    if (allAssets.length === 0) {
      console.error('Keine Assets in der Datenbank gefunden.');
      return false;
    }

    // 3. Wähle zufällig 3-5 Assets für das Portfolio aus
    const portfolioAssets = [];
    const assetCount = Math.floor(Math.random() * 3) + 3; // 3-5 Assets
    
    const shuffledAssets = [...allAssets].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < Math.min(assetCount, shuffledAssets.length); i++) {
      portfolioAssets.push(shuffledAssets[i]);
    }

    // 4. Erstelle Portfolio-Einträge und Transaktionen für jedes Asset
    for (const asset of portfolioAssets) {
      // Generiere eine zufällige Menge und einen durchschnittlichen Kaufpreis
      const quantity = parseFloat(randomInRange(0.1, 5).toFixed(6));
      
      // Der Durchschnittskaufpreis sollte nahe am aktuellen Preis sein
      // (mit einer zufälligen Abweichung von bis zu ±10%)
      const priceVariation = randomInRange(0.9, 1.1);
      const avgBuyPrice = asset.currentPrice * priceVariation;
      
      // Erstelle einen Portfolio-Eintrag
      const [portfolioEntry] = await db.insert(portfolios).values({
        userId,
        assetId: asset.id,
        quantity,
        averageBuyPrice: avgBuyPrice
      }).returning();
      
      console.log(`Portfolio-Eintrag erstellt für ${asset.name} mit ${quantity} Einheiten.`);
      
      // Erstelle mehrere Transaktionen für dieses Asset
      const transactionCount = Math.floor(Math.random() * 4) + 1; // 1-4 Transaktionen
      
      for (let j = 0; j < transactionCount; j++) {
        const isBuy = Math.random() > 0.3; // 70% Wahrscheinlichkeit für Kauf
        const transactionQuantity = parseFloat(randomInRange(0.05, quantity / 2).toFixed(6));
        const transactionPrice = avgBuyPrice * randomInRange(0.95, 1.05); // Leichte Preisvariation
        const total = transactionQuantity * transactionPrice;
        
        await db.insert(transactions).values({
          userId,
          assetId: asset.id,
          type: isBuy ? 'buy' : 'sell',
          quantity: transactionQuantity,
          price: transactionPrice,
          total,
          timestamp: randomDate(30) // Zufälliger Zeitpunkt innerhalb der letzten 30 Tage
        });
        
        console.log(`Transaktion erstellt: ${isBuy ? 'Kauf' : 'Verkauf'} von ${transactionQuantity} ${asset.symbol} zum Preis von ${transactionPrice}€.`);
      }
    }
    
    console.log('Testdaten erfolgreich erstellt!');
    return true;
  } catch (error) {
    console.error('Fehler beim Erstellen der Testdaten:', error);
    return false;
  }
}