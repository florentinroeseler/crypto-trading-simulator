// src/routes/transactions/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { transactions, assets } from '$lib/server/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
  // Prüfe, ob der Benutzer angemeldet ist
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  try {
    // Abfrageparameter abrufen
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '25', 10);
    const sortBy = url.searchParams.get('sortBy') || 'timestamp';
    const sortDirection = url.searchParams.get('sortDirection') || 'desc';
    const filterType = url.searchParams.get('type') || 'all'; // 'buy', 'sell', oder 'all'
    const filterAsset = url.searchParams.get('asset') || ''; // Asset-Symbol oder leer für alle

    // Offset für Paginierung berechnen
    const offset = (page - 1) * limit;

    // Basis-Query aufbauen
    let query = db
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
        name: assets.name,
        imageUrl: assets.imageUrl
      })
      .from(transactions)
      .innerJoin(assets, eq(transactions.assetId, assets.id))
      .where(eq(transactions.userId, locals.user.id));

    // Filter anwenden
    if (filterType !== 'all') {
      query = query.where(eq(transactions.type, filterType));
    }

    if (filterAsset) {
      query = query.where(eq(assets.symbol, filterAsset.toUpperCase()));
    }

    // Sortierung anwenden
    if (sortBy === 'timestamp') {
      query = query.orderBy(sortDirection === 'asc' ? asc(transactions.timestamp) : desc(transactions.timestamp));
    } else if (sortBy === 'type') {
      query = query.orderBy(sortDirection === 'asc' ? asc(transactions.type) : desc(transactions.type));
    } else if (sortBy === 'symbol') {
      query = query.orderBy(sortDirection === 'asc' ? asc(assets.symbol) : desc(assets.symbol));
    } else if (sortBy === 'quantity') {
      query = query.orderBy(sortDirection === 'asc' ? asc(transactions.quantity) : desc(transactions.quantity));
    } else if (sortBy === 'price') {
      query = query.orderBy(sortDirection === 'asc' ? asc(transactions.price) : desc(transactions.price));
    } else if (sortBy === 'total') {
      query = query.orderBy(sortDirection === 'asc' ? asc(transactions.total) : desc(transactions.total));
    }

    // Gesamtanzahl der Transaktionen für Paginierung
    let totalTransactions = 0;
    try {
      // Verwende eine einfachere Count-Query
      let countQuery = db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, locals.user.id));

      // Filter anwenden
      if (filterType !== 'all') {
        countQuery = countQuery.where(eq(transactions.type, filterType));
      }

      if (filterAsset) {
        // Hole zuerst die Asset-IDs für das gegebene Symbol
        const assetIds = await db
          .select({ id: assets.id })
          .from(assets)
          .where(eq(assets.symbol, filterAsset.toUpperCase()));
        
        if (assetIds.length > 0) {
          // Verwende die Asset-IDs im Filter
          countQuery = countQuery.where(
            eq(transactions.assetId, assetIds[0].id)
          );
        }
      }

      // Führe die Query aus und zähle die Ergebnisse
      const allTransactions = await countQuery;
      totalTransactions = allTransactions.length;
    } catch (error) {
      console.error('Fehler bei der Zählung der Transaktionen:', error);
      // Setze Standardwert auf 0 bei Fehler
      totalTransactions = 0;
    }

    // Endgültige paginierte Query ausführen
    const transactionsList = await query.limit(limit).offset(offset);

    // Hole alle eindeutigen Asset-Symbole für den Filter
    const assetsQuery = await db
      .selectDistinct({ symbol: assets.symbol })
      .from(assets)
      .innerJoin(transactions, eq(assets.id, transactions.assetId))
      .where(eq(transactions.userId, locals.user.id))
      .orderBy(asc(assets.symbol));

    const assetOptions = assetsQuery.map(a => a.symbol);

    // Berechnungen für die Transaktionsstatistik
    const totalBuyVolume = transactionsList
      .filter(t => t.type === 'buy')
      .reduce((sum, t) => sum + t.total, 0);
      
    const totalSellVolume = transactionsList
      .filter(t => t.type === 'sell')
      .reduce((sum, t) => sum + t.total, 0);

    // Daten für Pagination
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalTransactions / limit),
      limit,
      totalTransactions
    };

    // Alle Daten zurückgeben
    return {
      transactions: transactionsList,
      pagination,
      assetOptions,
      filters: {
        type: filterType,
        asset: filterAsset
      },
      sorting: {
        sortBy,
        sortDirection
      },
      stats: {
        totalBuyVolume,
        totalSellVolume,
        netVolume: totalBuyVolume - totalSellVolume
      }
    };
  } catch (error) {
    console.error('Fehler beim Laden der Transaktionen:', error);
    return {
      transactions: [],
      pagination: { currentPage: 1, totalPages: 0, limit: 25, totalTransactions: 0 },
      assetOptions: [],
      filters: { type: 'all', asset: '' },
      sorting: { sortBy: 'timestamp', sortDirection: 'desc' },
      stats: { totalBuyVolume: 0, totalSellVolume: 0, netVolume: 0 }
    };
  }
};