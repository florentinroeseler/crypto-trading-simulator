-- src/lib/server/db/migrations/add_crypto_fields.sql
-- Neue Felder zur assets-Tabelle hinzufügen
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "market_cap" double precision;
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "price_change_percentage_24h" double precision;
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "volume_24h" double precision;
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "circulating_supply" double precision;
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "max_supply" double precision;
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "ath_price" double precision;
ALTER TABLE "assets" ADD COLUMN IF NOT EXISTS "ath_date" timestamp;