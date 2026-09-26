ALTER TABLE "order_item_options" DROP CONSTRAINT "order_item_options_order_item_id_order_items_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_order_id_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "order_item_options" ADD CONSTRAINT "order_item_options_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_limits_nonnegative" CHECK (("coupons"."max_discount_toman" is null or "coupons"."max_discount_toman" >= 0) and ("coupons"."min_order_toman" is null or "coupons"."min_order_toman" >= 0) and ("coupons"."usage_limit" is null or "coupons"."usage_limit" >= 0));