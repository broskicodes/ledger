import {
    pgTable,
    text,
    uuid,
    timestamp,
    doublePrecision,
    pgEnum,
  } from "drizzle-orm/pg-core";
  
  export const journalEntries = pgTable("journal_entries", {
    id: uuid("id").primaryKey().defaultRandom(),
    date: timestamp("date").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
});

export const accountTypes = pgEnum("account_type", [
    "asset",
    "liability",
    "equity",
    "revenue",
    "expense"
]);

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: accountTypes("account_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const entryType = pgEnum("entry_type", [
    "debit",
    "credit"
  ]);

export const accountsEntries = pgTable("account_entries", {
    id: uuid("id").primaryKey().defaultRandom(),
    entryType: entryType("entry_type").notNull(),
    amount: doublePrecision("amount").notNull(),
    account_id: uuid("account_id").references(() => accounts.id).notNull(),
    journalEntryId: uuid("journal_entry_id").references(() => journalEntries.id).notNull(),
});