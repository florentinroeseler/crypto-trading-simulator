CREATE TABLE "asset_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"price" double precision NOT NULL,
	"timestamp" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "asset_prices" ADD CONSTRAINT "asset_prices_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_asset_prices_asset" ON "asset_prices" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "idx_asset_prices_asset_ts" ON "asset_prices" USING btree ("asset_id","timestamp");