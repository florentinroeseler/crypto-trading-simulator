import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users, assets, portfolios, transactions } from '$lib/server/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { username } = params;

  try {
    // Hole den Benutzer anhand des Benutzernamens
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
      columns: {
        id: true,
        username: true,
        profileImageUrl: true,
        bio: true,
        isPortfolioPublic: true,
        createdAt: true
      }
    });

    if (!user) {
      throw error(404, 'Benutzer nicht gefunden');
    }

    // Prüfe, ob das Portfolio öffentlich ist oder der angemeldete Benutzer der Profilbesitzer ist
    const isOwner = locals.user?.id === user.id;
    const canViewPortfolio = user.isPortfolioPublic || isOwner;

    let portfolioData = null;
    let recentTransactions = null;

    if (canViewPortfolio) {
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
        .where(eq(portfolios.userId, user.id));

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

      portfolioData = {
        items: portfolioItemsWithValues,
        totalValue: totalPortfolioValue,
        totalProfitLoss: totalProfitLoss,
        profitLossPercentage: profitLossPercentage
      };

      // Hole die neuesten öffentlichen Transaktionen
      recentTransactions = await db
        .select({
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
        .where(eq(transactions.userId, user.id))
        .orderBy(desc(transactions.timestamp))
        .limit(5);
    }

    return {
      profileUser: user,
      isOwner,
      canViewPortfolio,
      portfolio: portfolioData,
      recentTransactions
    };
  } catch (err) {
    if (err.status === 404) {
      throw err;
    }
    console.error('Fehler beim Laden der Profildaten:', err);
    throw error(500, 'Fehler beim Laden der Profildaten');
  }
};