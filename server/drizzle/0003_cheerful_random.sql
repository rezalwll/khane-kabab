CREATE TYPE "public"."notification_channel" AS ENUM('sms');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('pending', 'processing', 'sent', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."payment_attempt_status" AS ENUM('created', 'redirect_ready', 'pending', 'paid', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "notification_outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel" "notification_channel" DEFAULT 'sms' NOT NULL,
	"event_type" text NOT NULL,
	"order_id" uuid,
	"recipient" text NOT NULL,
	"template_key" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"provider" text,
	"provider_message_id" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone,
	"last_error_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sms_enabled" boolean DEFAULT false NOT NULL,
	"provider" text,
	"notify_order_submitted" boolean DEFAULT true NOT NULL,
	"notify_order_confirmed" boolean DEFAULT true NOT NULL,
	"notify_order_ready" boolean DEFAULT true NOT NULL,
	"notify_order_dispatched" boolean DEFAULT true NOT NULL,
	"notify_order_cancelled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"amount_toman" integer NOT NULL,
	"status" "payment_attempt_status" DEFAULT 'created' NOT NULL,
	"provider_reference" text,
	"transaction_reference" text,
	"failure_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified_at" timestamp with time zone,
	CONSTRAINT "payment_attempts_amount_nonnegative" CHECK ("payment_attempts"."amount_toman" >= 0)
);
--> statement-breakpoint
CREATE TABLE "payment_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"online_payment_enabled" boolean DEFAULT false NOT NULL,
	"provider" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "client_order_id" uuid;--> statement-breakpoint
UPDATE "orders" SET "client_order_id" = gen_random_uuid() WHERE "client_order_id" IS NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "client_order_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_outbox" ADD CONSTRAINT "notification_outbox_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_outbox_status_next_idx" ON "notification_outbox" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE INDEX "notification_outbox_order_id_idx" ON "notification_outbox" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "notification_outbox_created_at_idx" ON "notification_outbox" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payment_attempts_order_id_idx" ON "payment_attempts" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payment_attempts_status_idx" ON "payment_attempts" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_client_order_id_uidx" ON "orders" USING btree ("client_order_id");
