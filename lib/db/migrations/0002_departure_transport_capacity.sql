CREATE TYPE "public"."transport_mode" AS ENUM('plane', 'bus', 'mixed');--> statement-breakpoint
ALTER TABLE "departures" ADD COLUMN "transport_mode" "transport_mode" DEFAULT 'plane' NOT NULL;--> statement-breakpoint
ALTER TABLE "departures" ADD COLUMN "max_people" integer;
