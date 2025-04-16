ALTER TABLE "assets" ADD COLUMN "market_cap" double precision;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "price_change_percentage_24h" double precision;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "volume_24h" double precision;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "circulating_supply" double precision;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "max_supply" double precision;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "ath_price" double precision;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "ath_date" timestamp;