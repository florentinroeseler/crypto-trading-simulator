// src/routes/api/admin/remove-asset/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { assets, portfolios, transactions, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
  // Nur Admin-Zugriff erlauben
  if (!locals.user || !locals.user.isAdmin) {
    return json({ 
      success: false, 
      message: 'Nur Administratoren können diesen Endpunkt aufrufen' 
    }, { status: 403 });
  }
  
  try {
    const data = await request.json();
    const { symbol, compensationAmount = 0 } = data;
    
    if (!symbol) {
      return json({ 
        success: false, 
        message: 'Symbol ist erforderlich'
      }, { status: 400 });
    }
    
    console.log(`Versuche Asset zu entfernen: ${symbol}`);
    
    // 1. Finde das Asset in der Datenbank
    const assetToRemove = await db
      .select()
      .from(assets)
      .where(eq(assets.symbol, symbol.toUpperCase()))
      .limit(1);
    
    if (assetToRemove.length === 0) {
      return json({ 
        success: false, 
        message: `Asset mit Symbol ${symbol} nicht gefunden`
      }, { status: 404 });
    }
    
    const asset = assetToRemove[0];
    console.log(`Asset gefunden: ${asset.name} (${asset.id})`);
    
    // 2. Finde alle Portfolios, die dieses Asset enthalten
    const affectedPortfolios = await db
      .select({
        portfolioId: portfolios.id,
        userId: portfolios.userId,
        quantity: portfolios.quantity,
        averageBuyPrice: portfolios.averageBuyPrice
      })
      .from(portfolios)
      .where(eq(portfolios.assetId, asset.id));
    
    console.log(`${affectedPortfolios.length} betroffene Portfolios gefunden`);
    
    // 3. Starte eine Transaktion für die sichere Entfernung
    await db.transaction(async (tx) => {
      // 3.1 Berechne Entschädigung für jeden betroffenen Benutzer
      for (const portfolio of affectedPortfolios) {
        const value = portfolio.quantity * portfolio.averageBuyPrice;
        const compensationValue = compensationAmount > 0 ? 
          compensationAmount * portfolio.quantity : value; // Wenn 0, dann verwende den aktuellen Wert
        
        console.log(`Entschädige Benutzer ${portfolio.userId} mit ${compensationValue} für ${portfolio.quantity} ${symbol}`);
        
        // Hole den aktuellen Benutzer, um das Guthaben zu erhalten
        const userToUpdate = await tx
          .select()
          .from(users)
          .where(eq(users.id, portfolio.userId))
          .limit(1);
        
        if (userToUpdate.length > 0) {
          const currentUser = userToUpdate[0];
          const newBalance = currentUser.balance + compensationValue;
          
          // Guthaben aktualisieren
          await tx
            .update(users)
            .set({
              balance: newBalance,
              updatedAt: new Date()
            })
            .where(eq(users.id, portfolio.userId));
        }
          
        // Erstelle eine "Entschädigungs"-Transaktion
        await tx.insert(transactions).values({
          userId: portfolio.userId,
          assetId: asset.id,
          type: 'sell', // Als Verkauf markieren
          quantity: portfolio.quantity,
          price: portfolio.averageBuyPrice,
          total: compensationValue,
          timestamp: new Date()
        });
      }
      
      // 3.2 Portfolios löschen
      if (affectedPortfolios.length > 0) {
        await tx
          .delete(portfolios)
          .where(eq(portfolios.assetId, asset.id));
        
        console.log(`${affectedPortfolios.length} Portfolios gelöscht`);
      }
      
      // 3.3 Asset-Einträge löschen
      await tx
        .delete(assets)
        .where(eq(assets.id, asset.id));
      
      console.log(`Asset ${symbol} gelöscht`);
    });
    
    return json({
      success: true,
      message: `Asset ${symbol} erfolgreich entfernt. ${affectedPortfolios.length} Portfolios betroffen.`,
      affectedPortfolios: affectedPortfolios.length
    });
  } catch (error) {
    console.error('Fehler beim Entfernen des Assets:', error);
    return json({
      success: false,
      message: 'Fehler beim Entfernen des Assets',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 });
  }
};