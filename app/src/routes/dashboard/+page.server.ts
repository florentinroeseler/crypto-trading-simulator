// src/routes/dashboard/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { assets, portfolios, transactions } from '$lib/server/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  // Prüfe, ob der Benutzer angemeldet ist
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  try {
    // Hole die Portfolio-Einträge des Benutzers mit Asset-Informationen
    const portfolioItems = await db
      .select({
        assetId: portfolios.assetId,
        symbol: assets.symbol,
        name: assets.name,
        imageUrl: assets.imageUrl,
        quantity: portfolios.quantity,
        currentPrice: assets.currentPrice,
        averageBuyPrice: portfolios.averageBuyPrice
      })
      .from(portfolios)
      .innerJoin(assets, eq(portfolios.assetId, assets.id))
      .where(eq(portfolios.userId, locals.user.id));
    
    // Berechne zusätzliche Werte für jedes Item
    const portfolioItemsWithValues = portfolioItems.map(item => {
      const value = item.quantity * item.currentPrice;
      const profitLoss = (item.currentPrice - item.averageBuyPrice) * item.quantity;
      const profitLossPercentage = ((item.currentPrice - item.averageBuyPrice) / item.averageBuyPrice) * 100;
      
      return {
        ...item,
        value,
        profitLoss,
        profitLossPercentage
      };
    });

    // Berechne Gesamt-Portfoliowert
    const totalPortfolioValue = portfolioItemsWithValues.reduce(
      (sum, item) => sum + item.value, 
      0
    );

    // Berechne Gesamtgewinn/-verlust
    const totalProfitLoss = portfolioItemsWithValues.reduce(
      (sum, item) => sum + item.profitLoss, 
      0
    );

    // Berechne prozentuale Gewinn/Verlust des gesamten Portfolios
    const totalInvestment = portfolioItemsWithValues.reduce(
      (sum, item) => sum + (item.averageBuyPrice * item.quantity),
      0
    );
    
    const profitLossPercentage = totalInvestment > 0 
      ? (totalProfitLoss / totalInvestment) * 100
      : 0;

    // Hole die neuesten Transaktionen des Benutzers
    const recentTransactions = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        symbol: assets.symbol,
        name: assets.name,
        quantity: transactions.quantity,
        price: transactions.price,
        total: transactions.total,
        timestamp: transactions.timestamp
      })
      .from(transactions)
      .innerJoin(assets, eq(transactions.assetId, assets.id))
      .where(eq(transactions.userId, locals.user.id))
      .orderBy(desc(transactions.timestamp))
      .limit(5);

    // Benutzerinformationen und Portfoliodaten zurückgeben
    return {
      user: {
        username: locals.user.username,
        email: locals.user.email,
        balance: locals.user.balance,
        createdAt: locals.user.createdAt
      },
      portfolio: {
        items: portfolioItemsWithValues,
        totalValue: totalPortfolioValue,
        totalProfitLoss: totalProfitLoss,
        profitLossPercentage: profitLossPercentage
      },
      recentTransactions
    };
  } catch (error) {
    console.error('Fehler beim Laden der Dashboard-Daten:', error);
    return {
      user: locals.user,
      portfolio: {
        items: [],
        totalValue: 0,
        totalProfitLoss: 0,
        profitLossPercentage: 0
      },
      recentTransactions: []
    };
  }
};