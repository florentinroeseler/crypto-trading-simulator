import { pgTable, text, timestamp, uuid, doublePrecision, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Benutzertabelle
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  balance: doublePrecision('balance').default(10000).notNull(), // Startguthaben ($10,000)
  isAdmin: boolean('is_admin').default(false).notNull()
});

// Sitzungstabelle für Auth
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull()
});

// Krypto-Assets
export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  symbol: text('symbol').notNull().unique(), // z.B. "BTC", "ETH"
  name: text('name').notNull(), // z.B. "Bitcoin", "Ethereum"
  type: text('type').notNull(), // z.B. "crypto", "stock"
  currentPrice: doublePrecision('current_price').notNull(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  imageUrl: text('image_url')
});

// Benutzerportfolios
export const portfolios = pgTable('portfolios', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  assetId: uuid('asset_id')
    .notNull()
    .references(() => assets.id, { onDelete: 'cascade' }),
  quantity: doublePrecision('quantity').notNull(),
  averageBuyPrice: doublePrecision('average_buy_price').notNull()
});

// Transaktionen
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  assetId: uuid('asset_id')
    .notNull()
    .references(() => assets.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // "buy" oder "sell"
  quantity: doublePrecision('quantity').notNull(),
  price: doublePrecision('price').notNull(), // Preis zum Zeitpunkt der Transaktion
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  total: doublePrecision('total').notNull() // Gesamtpreis (quantity * price)
});

// Beziehungen
export const usersRelations = relations(users, ({ many }) => ({
  portfolios: many(portfolios),
  transactions: many(transactions)
}));

export const assetsRelations = relations(assets, ({ many }) => ({
  portfolios: many(portfolios),
  transactions: many(transactions)
}));