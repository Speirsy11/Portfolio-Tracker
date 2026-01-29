import {
  boolean,
  decimal,
  index,
  integer,
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
  isAdmin: boolean("is_admin").default(false).notNull(),
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

// PortfolioAssets Join Table (many-to-many)
export const PortfolioAssets = pgTable(
  "portfolio_asset",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    portfolioId: uuid("portfolio_id")
      .notNull()
      .references(() => Portfolios.id, { onDelete: "cascade" }),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => Assets.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("portfolio_asset_portfolio_id_idx").on(table.portfolioId),
    index("portfolio_asset_asset_id_idx").on(table.assetId),
  ],
);

// Watchlists Table
export const Watchlists = pgTable(
  "watchlist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [index("watchlist_user_id_idx").on(table.userId)],
);

// Price Alerts Table
export const PriceAlerts = pgTable(
  "price_alert",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 500 }),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => Assets.id, { onDelete: "cascade" }),
    targetPrice: decimal("target_price", { precision: 18, scale: 8 }).notNull(),
    condition: varchar("condition", { length: 10 }).notNull(), // 'above' or 'below'
    isActive: boolean("is_active").default(true).notNull(),
    triggeredAt: timestamp("triggered_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [index("price_alert_user_id_idx").on(table.userId)],
);

// WatchlistAssets Join Table (many-to-many with ordering)
export const WatchlistAssets = pgTable(
  "watchlist_asset",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    watchlistId: uuid("watchlist_id")
      .notNull()
      .references(() => Watchlists.id, { onDelete: "cascade" }),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => Assets.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("watchlist_asset_watchlist_id_idx").on(table.watchlistId),
    index("watchlist_asset_asset_id_idx").on(table.assetId),
  ],
);

// AI Insights Table (market summaries and recommendations)
export const AiInsights = pgTable(
  "ai_insight",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 255 }).references(() => Users.id, {
      onDelete: "cascade",
    }),
    type: varchar("type", { length: 50 }).notNull(), // 'market_summary', 'recommendation', 'portfolio_analysis'
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    metadata: text("metadata"), // JSON string for additional data
    helpfulVotes: integer("helpful_votes").default(0).notNull(),
    notHelpfulVotes: integer("not_helpful_votes").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("ai_insight_user_id_idx").on(table.userId),
    index("ai_insight_type_idx").on(table.type),
    index("ai_insight_created_at_idx").on(table.createdAt),
  ],
);

// User Insight Feedback (to prevent duplicate voting)
export const InsightFeedback = pgTable(
  "insight_feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    insightId: uuid("insight_id")
      .notNull()
      .references(() => AiInsights.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    isHelpful: boolean("is_helpful").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("insight_feedback_insight_id_idx").on(table.insightId),
    index("insight_feedback_user_id_idx").on(table.userId),
  ],
);

// User Preferences Table
export const UserPreferences = pgTable(
  "user_preference",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .unique()
      .references(() => Users.id, { onDelete: "cascade" }),
    // Notification preferences
    emailNotifications: boolean("email_notifications").default(true).notNull(),
    pushNotifications: boolean("push_notifications").default(false).notNull(),
    notificationFrequency: varchar("notification_frequency", { length: 20 })
      .default("daily")
      .notNull(), // 'instant', 'hourly', 'daily', 'weekly'
    // Display preferences
    theme: varchar("theme", { length: 10 }).default("system").notNull(), // 'light', 'dark', 'system'
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    // Privacy
    profilePublic: boolean("profile_public").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [index("user_preference_user_id_idx").on(table.userId)],
);

// Schemas for Zod
export const CreateUserSchema = createInsertSchema(Users);
export const CreateAssetSchema = createInsertSchema(Assets);
export const CreatePortfolioSchema = createInsertSchema(Portfolios);
export const CreateSentimentLogSchema = createInsertSchema(SentimentLogs);
export const CreatePortfolioAssetSchema = createInsertSchema(PortfolioAssets);
export const CreateUserPreferencesSchema = createInsertSchema(UserPreferences);
export const CreateAiInsightSchema = createInsertSchema(AiInsights);
export const CreateInsightFeedbackSchema = createInsertSchema(InsightFeedback);
export const CreateWatchlistSchema = createInsertSchema(Watchlists);
export const CreateWatchlistAssetSchema = createInsertSchema(WatchlistAssets);
export const CreatePriceAlertSchema = createInsertSchema(PriceAlerts);

// Market Data Cache Table (stores cached market data from Twelve Data)
export const MarketDataCache = pgTable(
  "market_data_cache",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    symbol: varchar("symbol", { length: 20 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    assetType: varchar("asset_type", { length: 20 }).notNull(), // 'crypto' | 'stock'
    price: decimal("price", { precision: 18, scale: 8 }).notNull(),
    priceOpen: decimal("price_open", { precision: 18, scale: 8 }),
    priceHigh: decimal("price_high", { precision: 18, scale: 8 }),
    priceLow: decimal("price_low", { precision: 18, scale: 8 }),
    pricePreviousClose: decimal("price_previous_close", { precision: 18, scale: 8 }),
    change24h: decimal("change_24h", { precision: 18, scale: 8 }),
    changePercent24h: decimal("change_percent_24h", { precision: 10, scale: 4 }),
    volume24h: decimal("volume_24h", { precision: 24, scale: 2 }),
    marketCap: decimal("market_cap", { precision: 24, scale: 2 }),
    rank: integer("rank"),
    circulatingSupply: decimal("circulating_supply", { precision: 24, scale: 2 }),
    totalSupply: decimal("total_supply", { precision: 24, scale: 2 }),
    description: text("description"),
    fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("market_data_cache_symbol_idx").on(table.symbol),
    index("market_data_cache_asset_type_idx").on(table.assetType),
    index("market_data_cache_rank_idx").on(table.rank),
  ],
);

// Market Data Sync Log Table (tracks CRON job runs)
export const MarketDataSyncLog = pgTable("market_data_sync_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  syncType: varchar("sync_type", { length: 20 }).notNull(), // 'crypto' | 'stock' | 'all'
  status: varchar("status", { length: 20 }).notNull(), // 'pending' | 'running' | 'completed' | 'failed'
  recordsProcessed: integer("records_processed").default(0),
  apiRequestsUsed: integer("api_requests_used").default(0),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const CreateMarketDataCacheSchema = createInsertSchema(MarketDataCache);
export const CreateMarketDataSyncLogSchema =
  createInsertSchema(MarketDataSyncLog);
