// Änderungen für src/routes/api/portfolio-history/+server.ts
import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import {
  users,
  transactions,
  assets,
  assetPrices
} from "$lib/server/db/schema";
import { eq, and, gte, inArray } from "drizzle-orm";

/**
 * Liefert die Portfolio-Historie eines Nutzers.
 * - Transaktionen werden berücksichtigt
 * - Kurs-Schwankungen werden anhand der Tabelle `asset_prices` nachgebildet
 *
 * akzeptierte Query-Parameter:
 *   timeframe = 1d | 7d | 30d | 90d  (Default 30d)
 *   userId = UUID des Benutzers (optional, falls nicht angegeben: eingeloggter Benutzer)
 */
export async function GET({ locals, url }) {
  try {
    // Unautrorisierte Zugriffe abfangen
    if (!locals.user) {
      return json({ success: false, message: "Nicht autorisiert" }, { status: 401 });
    }

    // Prüfen, ob der Benutzer existiert
    const requestedUserId = url.searchParams.get("userId");
    const targetUserId = requestedUserId || locals.user.id;

    // Wenn ein anderer Benutzer angefordert wird, Berechtigungen prüfen
    if (requestedUserId && requestedUserId !== locals.user.id) {
      const requestedUser = await db
        .select({ isPortfolioPublic: users.isPortfolioPublic })
        .from(users)
        .where(eq(users.id, requestedUserId))
        .limit(1);

      if (requestedUser.length === 0) {
        return json({ success: false, message: "Benutzer nicht gefunden" }, { status: 404 });
      }

      if (!requestedUser[0].isPortfolioPublic) {
        return json({ success: false, message: "Portfolio ist nicht öffentlich" }, { status: 403 });
      }
    }

    // Nutzerdaten laden
    const userRow = await db
      .select({ createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (userRow.length === 0) {
      return json({ success: false, message: "Benutzer nicht gefunden" }, { status: 404 });
    }

    const accountCreation = new Date(userRow[0].createdAt);

    // Zeitspanne bestimmen
    const timeframe = url.searchParams.get("timeframe") ?? "30d";
    const now = Date.now();

    const startTime = (() => {
      switch (timeframe) {
        case "1d":
          return new Date(now - 1 * 24 * 60 * 60 * 1_000);
        case "7d":
          return new Date(now - 7 * 24 * 60 * 60 * 1_000);
        case "90d":
          return new Date(now - 90 * 24 * 60 * 60 * 1_000);
        default: // 30d
          return new Date(now - 30 * 24 * 60 * 60 * 1_000);
      }
    })();

    // Transaktionen und Asset-Preise laden
    const userTx = await db
      .select({
        id: transactions.id,
        assetId: transactions.assetId,
        type: transactions.type,
        quantity: transactions.quantity,
        price: transactions.price,
        total: transactions.total,
        timestamp: transactions.timestamp
      })
      .from(transactions)
      .where(eq(transactions.userId, targetUserId))
      .orderBy(transactions.timestamp);

    const userAssetIds = [...new Set(userTx.map((t) => t.assetId))];

    // aktuelle Preise laden
    const currentPrices = await db
      .select({ id: assets.id, price: assets.currentPrice })
      .from(assets)
      .where(inArray(assets.id, userAssetIds));

    const fallbackPriceMap: Record<string, number> = {};
    currentPrices.forEach((a) => (fallbackPriceMap[a.id] = a.price));

    // Historische Preise laden	
    const priceRows = await db
      .select({
        assetId: assetPrices.assetId,
        price: assetPrices.price,
        ts: assetPrices.timestamp
      })
      .from(assetPrices)
      .where(and(inArray(assetPrices.assetId, userAssetIds), gte(assetPrices.timestamp, startTime)))
      .orderBy(assetPrices.assetId, assetPrices.timestamp);

    const priceSeries: Record<string, { ts: number; price: number }[]> = {};
    for (const row of priceRows) {
      (priceSeries[row.assetId] ??= []).push({ ts: row.ts.getTime(), price: row.price });
    }

    /**
     * Gibt den zuletzt bekannten Preis (<= t) für ein Asset zurück.
     * Fällt auf currentPrice zurück, falls keine Historie vorhanden ist.
     */
    function priceAt(assetId: string, t: number): number {
      const series = priceSeries[assetId];
      if (!series || series.length === 0) return fallbackPriceMap[assetId] ?? 0;

      // lineare Suche rückwärts – bei < 5k Punkten völlig ok
      for (let i = series.length - 1; i >= 0; i--) {
        if (series[i].ts <= t) return series[i].price;
      }
      return series[0].price; // alle Kurse liegen nach t
    }

    // Zeipunkte aufbauen
    const DAY = 86_400_000;
    const diffDays = Math.ceil((now - startTime.getTime()) / DAY);
    const interval = diffDays <= 1 ? 5 * 60 * 1_000   // 5 Minuten
                    : diffDays <= 7 ? 60 * 60 * 1_000 // 1 h
                    : diffDays <= 30 ? DAY           // 1 Tag
                    : 2 * DAY;                       // 2 Tage

    const timePoints: number[] = [];
    for (let t = startTime.getTime(); t <= now; t += interval) timePoints.push(t);
    if (timePoints[timePoints.length - 1] !== now) timePoints.push(now);

    //  Transaktionszeitpunkte hinzufügen, damit jede Bewegung dargestellt wird
    userTx.forEach((tx) => {
      const ts = tx.timestamp.getTime();
      if (ts >= startTime.getTime() && ts <= now) timePoints.push(ts);
    });

    const uniqueTimes = [...new Set(timePoints)].sort((a, b) => a - b);

    // Portfolio-Historie aufbauen
    type Holding = { qty: number };
    const holdings: Record<string, Holding> = {};
    let cash = 10_000; // Startguthaben

    const portfolioHistory: {
      timestamp: number;
      balanceValue: number;
      investedValue: number;
      totalValue: number;
      preAccount: boolean;
    }[] = [];

    let txIndex = 0;

    for (const ts of uniqueTimes) {
      // Transaktionen bis einschließlich ts anwenden
      while (txIndex < userTx.length && userTx[txIndex].timestamp.getTime() <= ts) {
        const tx = userTx[txIndex];
        const { assetId, quantity, total, type } = tx;
        if (type === "buy") {
          (holdings[assetId] ??= { qty: 0 }).qty += quantity;
          cash -= total;
        } else if (type === "sell") {
          (holdings[assetId] ??= { qty: 0 }).qty -= quantity;
          cash += total;
        }
        txIndex++;
      }

      // Wert der Positionen bestimmen
      let invested = 0;
      for (const assetId in holdings) {
        const qty = holdings[assetId].qty;
        if (qty <= 0) continue;
        invested += qty * priceAt(assetId, ts);
      }

      portfolioHistory.push({
        timestamp: ts,
        balanceValue: cash,
        investedValue: invested,
        totalValue: invested + cash,
        preAccount: ts < accountCreation.getTime()
      });
    }

    // Antwort zurückgeben
    return json({
      success: true,
      data: {
        history: portfolioHistory,
        timeframe,
        accountCreationDate: accountCreation.getTime()
      }
    });
  } catch (err) {
    console.error("Fehler beim Laden der Portfolio-Historie:", err);
    return json({ success: false, message: "Interner Serverfehler" }, { status: 500 });
  }
}