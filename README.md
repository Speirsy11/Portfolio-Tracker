# Narrative Portfolio Tracker

An AI-powered portfolio tracking application that correlates quantitative market data with qualitative sentiment analysis to provide deeper insights into your investments.

## 🎯 Overview

The Narrative Portfolio Tracker reconciles the stateless nature of Vercel's serverless environment with the need for continuous, heavy data processing. By leveraging Next.js 16, Vercel AI SDK, and a Queue-Worker architecture powered by Upstash Redis, this system correlates quantitative market data with qualitative AI-driven sentiment analysis.

### Key Features

- **AI-Driven Sentiment Analysis**: Transforms raw financial news into structured sentiment data using Large Language Models
- **Real-Time Market Data**: Integrates with Yahoo Finance to fetch live stock prices and news
- **Visual Analytics**: Interactive charts showing the correlation between price movements and sentiment scores
- **Serverless Architecture**: Built for Vercel's edge network with optimized cron-based background workers
- **Type-Safe**: Strict TypeScript throughout with Zod validation for external data

## 🏗️ Tech Stack

### Core Framework

- **Monorepo**: Turborepo for isolated packages and efficient builds
- **Framework**: Next.js 16+ (App Router, React Server Components)
- **Language**: TypeScript (Strict Mode)

### Data & Storage

- **Database**: Vercel Postgres (Neon) with Drizzle ORM
- **Queue & Cache**: Upstash Redis (HTTP-based Serverless Redis)
- **Data Source**: `yahoo-finance2` for market data and news

### AI & Authentication

- **AI**: Vercel AI SDK with OpenAI provider (`generateObject` for structured output)
- **Auth**: Clerk (synced to Postgres via webhooks)

### UI & Styling

- **Styling**: Tailwind CSS
- **Charts**: Tremor for data visualization
- **Components**: Shared component library in monorepo

## 📦 Project Structure

```
Portfolio-Tracker/
├── apps/
│   └── webapp/          # Next.js 16 application
├── packages/
│   ├── ui/              # Shared React components
│   ├── db/              # Drizzle ORM schema and connection logic
│   ├── llm/             # AI narrative engine
│   ├── redis/           # Redis client and queue management
│   ├── finance/         # Yahoo Finance service adapter
│   └── config/          # Shared TypeScript and tooling configs
└── tooling/             # Development tools and configurations
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (check `.nvmrc` for exact version)
- pnpm 8+
- Vercel account (for deployment)
- Upstash Redis instance
- Clerk account (for authentication)
- OpenAI API key

### Environment Variables

Copy `.env.example` to `.env.local` in `apps/webapp/` and configure:

```bash
# Database
DATABASE_URL=

# Authentication
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_WEBHOOK_SECRET=

# Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# AI
OPENAI_API_KEY=
```

### Installation

```bash
# Install dependencies
pnpm install

# Generate database schema
pnpm db:generate

# Push schema to database
pnpm db:push

# Run development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run linter
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code
pnpm typecheck        # Run TypeScript compiler

# Database
pnpm db:generate      # Generate migrations
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Drizzle Studio

# Testing
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
```

### Monorepo Structure

This project uses Turborepo for efficient monorepo management. Each package follows a strict separation of concerns:

- **`index.ts`**: Public API boundary (exports only)
- **`schemas/`**: Zod schemas and validation
- **`hooks/`**: Custom React hooks
- **`components/`**: React UI components
- **`utils/`**: Helper functions

## 🏛️ Architecture

### Queue-Worker Pattern

The application uses a Redis-based queue system to handle data ingestion:

1. **Seeder Cron** (every 4 hours): Populates the queue with assets to process
2. **Processor Cron** (every minute): Processes queue items within Vercel's execution limits
3. **Deduplication**: Redis Set prevents duplicate processing

### AI Narrative Engine

News articles are analyzed using OpenAI's GPT-4o-mini to generate:

- Sentiment score (-1 to 1)
- Reasoning for the sentiment
- Key topics extracted from the news

### Data Flow

```
User Portfolio → Seeder Cron → Redis Queue → Processor Worker
                                                    ↓
                                            Yahoo Finance API
                                                    ↓
                                              AI Analysis
                                                    ↓
                                            Postgres Database
                                                    ↓
                                            Dashboard UI
```

## 🧪 Testing

- **Unit Tests**: Vitest for testing worker logic and utilities
- **E2E Tests**: Playwright for full user flow testing
- **Type Safety**: Strict TypeScript with Zod validation for external data

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome via issues.

## 📚 Documentation

For detailed implementation plans and architecture decisions, see:

- [`.agent/rules/plan.md`](.agent/rules/plan.md) - Technical implementation plan
- [`.agent/rules/tasks.md`](.agent/rules/tasks.md) - Current task checklist
