import {
  decimal,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Users Table
export const Users = pgTable("user", {
  id: varchar("id", { length: 255 }).primaryKey(), // Clerk ID
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

// Assets Table
export const Assets = pgTable(
  "asset",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    symbol: varchar("symbol", { length: 20 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [index("asset_symbol_idx").on(table.symbol)],
);

// Portfolios Table
export const Portfolios = pgTable(
  "portfolio",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [index("portfolio_user_id_idx").on(table.userId)],
);

// SentimentLogs Table
export const SentimentLogs = pgTable(
  "sentiment_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => Assets.id, { onDelete: "cascade" }),
    score: decimal("score", { precision: 5, scale: 2 }).notNull(), // -1.00 to 1.00 or 0-100
    summary: text("summary"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("sentiment_log_asset_id_idx").on(table.assetId)],
);

// Schemas for Zod
export const CreateUserSchema = createInsertSchema(Users);
export const CreateAssetSchema = createInsertSchema(Assets);
export const CreatePortfolioSchema = createInsertSchema(Portfolios);
export const CreateSentimentLogSchema = createInsertSchema(SentimentLogs);
