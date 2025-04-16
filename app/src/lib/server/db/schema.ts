// src/lib/server/db/schema.ts
import { pgTable, text, uuid, timestamp, doublePrecision, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  balance: doublePrecision("balance").default(10000).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull()
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull()
});

export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // z.B. 'crypto', 'stock', etc.
  currentPrice: doublePrecision("current_price").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  imageUrl: text("image_url"),
  // Neue Felder für erweiterte Crypto-Informationen
  marketCap: doublePrecision("market_cap"),
  priceChangePercentage24h: doublePrecision("price_change_percentage_24h"),
  volume24h: doublePrecision("volume_24h"),
  circulatingSupply: doublePrecision("circulating_supply"),
  maxSupply: doublePrecision("max_supply"),
  athPrice: doublePrecision("ath_price"), // All-Time High
  athDate: timestamp("ath_date")
});

export const portfolios = pgTable("portfolios", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assetId: uuid("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),
  quantity: doublePrecision("quantity").notNull(),
  averageBuyPrice: doublePrecision("average_buy_price").notNull()
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assetId: uuid("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'buy' oder 'sell'
  quantity: doublePrecision("quantity").notNull(),
  price: doublePrecision("price").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  total: doublePrecision("total").notNull()
});