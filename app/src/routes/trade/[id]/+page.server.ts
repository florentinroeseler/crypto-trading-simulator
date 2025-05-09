import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { assets, portfolios, transactions, users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
  // Prüfe, ob der Benutzer angemeldet ist
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  const assetId = params.id;

  try {
    // Hole die ausgewählte Kryptowährung
    const asset = await db
      .select()
      .from(assets)
      .where(eq(assets.id, assetId))
      .limit(1);

    if (asset.length === 0) {
      throw error(404, { message: 'Kryptowährung nicht gefunden' });
    }

    // Hole das Portfolio des Benutzers für diese Kryptowährung
    const portfolioEntries = await db
      .select()
      .from(portfolios)
      .where(
        and(
          eq(portfolios.userId, locals.user.id),
          eq(portfolios.assetId, assetId)
        )
      );

    // Hole die letzten Transaktionen für diese Kryptowährung
    const recentTransactions = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        quantity: transactions.quantity,
        price: transactions.price,
        total: transactions.total,
        timestamp: transactions.timestamp
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, locals.user.id),
          eq(transactions.assetId, assetId)
        )
      )
      .orderBy(transactions.timestamp)
      .limit(10);

    return {
      asset: asset[0],
      portfolio: portfolioEntries[0] || { quantity: 0, averageBuyPrice: 0 },
      recentTransactions,
      user: {
        balance: locals.user.balance,
        id: locals.user.id,
        username: locals.user.username  // Diese Zeile hinzufügen
      }
    };
  } catch (e) {
    console.error('Fehler beim Laden der Asset-Details:', e);
    if (e.status === 404) {
      throw e;
    }
    throw error(500, { message: 'Fehler beim Laden der Asset-Details' });
  }
};

// Die umstrukturierte actions-Funktion
export const actions: Actions = {
  // Eine einzige Default-Aktion, die anhand des _action-Parameters entscheidet, was zu tun ist
  default: async ({ request, params, locals }) => {
    if (!locals.user) {
      throw error(401, { message: 'Nicht autorisiert' });
    }

    const formData = await request.formData();
    const action = formData.get('_action') as string;
    const quantity = parseFloat(formData.get('quantity') as string);
    const assetId = params.id;

    if (isNaN(quantity) || quantity <= 0) {
      return {
        success: false,
        message: 'Ungültige Menge',
        _action: action
      };
    }

    try {
      // Asset Informationen abrufen
      const asset = await db
        .select()
        .from(assets)
        .where(eq(assets.id, assetId))
        .limit(1);

      if (asset.length === 0) {
        return {
          success: false,
          message: 'Asset nicht gefunden',
          _action: action
        };
      }

      const cryptoAsset = asset[0];
      const total = quantity * cryptoAsset.currentPrice;

      // Kaufen oder Verkaufen basierend auf dem _action-Parameter
      if (action === 'buy') {
        return await handleBuy(locals.user, cryptoAsset, quantity, total);
      } else if (action === 'sell') {
        return await handleSell(locals.user, cryptoAsset, quantity, total);
      } else {
        return {
          success: false,
          message: 'Ungültige Aktion',
          _action: action
        };
      }
    } catch (e) {
      console.error(`Fehler beim ${action === 'buy' ? 'Kauf' : 'Verkauf'}:`, e);
      return {
        success: false,
        message: 'Ein Fehler ist aufgetreten',
        _action: action
      };
    }
  }
};

// Hilfsfunktion für den Kauf
async function handleBuy(user, cryptoAsset, quantity, total) {
  // Prüfen, ob genug Guthaben vorhanden ist
  if (user.balance < total) {
    return {
      success: false,
      message: 'Nicht genügend Guthaben für diesen Kauf',
      _action: 'buy'
    };
  }

  // Transaktion in der Datenbank durchführen
  await db.transaction(async (tx) => {
    // 1. Transaktion eintragen
    await tx.insert(transactions).values({
      userId: user.id,
      assetId: cryptoAsset.id,
      type: 'buy',
      quantity,
      price: cryptoAsset.currentPrice,
      total
    });

    // 2. Benutzer-Guthaben aktualisieren
    await tx.update(users)
      .set({
        balance: user.balance - total,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    // 3. Portfolio aktualisieren oder erstellen
    const existingPortfolio = await tx
      .select()
      .from(portfolios)
      .where(
        and(
          eq(portfolios.userId, user.id),
          eq(portfolios.assetId, cryptoAsset.id)
        )
      );

    if (existingPortfolio.length > 0) {
      // Portfolio aktualisieren
      const portfolio = existingPortfolio[0];
      const newQuantity = portfolio.quantity + quantity;
      const newAverageBuyPrice =
        ((portfolio.quantity * portfolio.averageBuyPrice) + total) / newQuantity;

      await tx
        .update(portfolios)
        .set({
          quantity: newQuantity,
          averageBuyPrice: newAverageBuyPrice
        })
        .where(
          and(
            eq(portfolios.userId, user.id),
            eq(portfolios.assetId, cryptoAsset.id)
          )
        );
    } else {
      // Neues Portfolio erstellen
      await tx.insert(portfolios).values({
        userId: user.id,
        assetId: cryptoAsset.id,
        quantity,
        averageBuyPrice: cryptoAsset.currentPrice
      });
    }
  });

  return {
    success: true,
    message: `Erfolgreich ${quantity} ${cryptoAsset.symbol} gekauft`,
    _action: 'buy'
  };
}

// Hilfsfunktion für den Verkauf
async function handleSell(user, cryptoAsset, quantity, total) {
  // Portfolio prüfen
  const portfolioEntries = await db
    .select()
    .from(portfolios)
    .where(
      and(
        eq(portfolios.userId, user.id),
        eq(portfolios.assetId, cryptoAsset.id)
      )
    );

  if (portfolioEntries.length === 0 || portfolioEntries[0].quantity < quantity) {
    return {
      success: false,
      message: 'Nicht genügend ' + cryptoAsset.symbol + ' zum Verkaufen',
      _action: 'sell'
    };
  }

  // Transaktion in der Datenbank durchführen
  await db.transaction(async (tx) => {
    // 1. Transaktion eintragen
    await tx.insert(transactions).values({
      userId: user.id,
      assetId: cryptoAsset.id,
      type: 'sell',
      quantity,
      price: cryptoAsset.currentPrice,
      total
    });

    // 2. Benutzer-Guthaben aktualisieren
    await tx.update(users)
      .set({
        balance: user.balance + total,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    // 3. Portfolio aktualisieren
    const portfolio = portfolioEntries[0];
    const newQuantity = portfolio.quantity - quantity;

    if (newQuantity > 0) {
      await tx
        .update(portfolios)
        .set({
          quantity: newQuantity
          // Average buy price bleibt gleich beim Verkauf
        })
        .where(
          and(
            eq(portfolios.userId, user.id),
            eq(portfolios.assetId, cryptoAsset.id)
          )
        );
    } else {
      // Wenn alle verkauft wurden, Portfolio-Eintrag löschen
      await tx
        .delete(portfolios)
        .where(
          and(
            eq(portfolios.userId, user.id),
            eq(portfolios.assetId, cryptoAsset.id)
          )
        );
    }
  });

  return {
    success: true,
    message: `Erfolgreich ${quantity} ${cryptoAsset.symbol} verkauft`,
    _action: 'sell'
  };
}