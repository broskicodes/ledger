CREATE TYPE "public"."journal_type" AS ENUM('personal', 'business');--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "journal_type" "journal_type" DEFAULT 'business' NOT NULL;