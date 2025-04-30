// src/routes/leaderboard/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users, portfolios, assets } from '$lib/server/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  try {
    // Finde alle Benutzer mit öffentlichen Portfolios
    const usersWithPortfolios = await db
      .select({
        id: users.id,
        username: users.username,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.isPortfolioPublic, true));

    // Sammle Portfolio-Daten für jeden Benutzer
    const leaderboardEntries = await Promise.all(
      usersWithPortfolios.map(async (user) => {
        // Hole die Portfolio-Einträge des Benutzers mit Asset-Informationen
        const portfolioItems = await db
          .select({
            quantity: portfolios.quantity,
            currentPrice: assets.currentPrice,
            averageBuyPrice: portfolios.averageBuyPrice
          })
          .from(portfolios)
          .innerJoin(assets, eq(portfolios.assetId, assets.id))
          .where(eq(portfolios.userId, user.id));

        // Berechne zusätzliche Werte für jedes Item
        let totalValue = 0;
        let totalCost = 0;
        let totalProfitLoss = 0;

        portfolioItems.forEach(item => {
          const value = item.quantity * item.currentPrice;
          const cost = item.quantity * item.averageBuyPrice;
          const profitLoss = value - cost;
          
          totalValue += value;
          totalCost += cost;
          totalProfitLoss += profitLoss;
        });

        // Berechne prozentuale Performance
        const profitLossPercentage = totalCost > 0 
          ? (totalProfitLoss / totalCost) * 100
          : 0;

        return {
          user,
          portfolioValue: totalValue,
          profitLoss: totalProfitLoss,
          profitLossPercentage
        };
      })
    );

    // Sortiere nach Rendite (absteigend)
    leaderboardEntries.sort((a, b) => b.profitLossPercentage - a.profitLossPercentage);

    // Finde die Position des aktuellen Benutzers im Leaderboard
    const currentUserIndex = leaderboardEntries.findIndex(entry => entry.user.id === locals.user.id);
    const currentUserRank = currentUserIndex >= 0 ? currentUserIndex + 1 : null;

    return {
      leaderboard: leaderboardEntries,
      currentUserRank
    };
  } catch (error) {
    console.error('Fehler beim Laden des Leaderboards:', error);
    return {
      leaderboard: [],
      currentUserRank: null
    };
  }
};