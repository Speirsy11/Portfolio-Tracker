# CLAUDE.md - AI Assistant Guide for Portfolio-Tracker

This document provides essential context for AI assistants working on the Narrative Portfolio Tracker codebase.

## Project Overview

**Narrative Portfolio Tracker** is an AI-powered investment tracking application that correlates quantitative market data with qualitative sentiment analysis. It reconciles Vercel's serverless environment with continuous data processing through a queue-worker architecture.

### Core Technologies

- **Framework**: Next.js 16+ (App Router, React Server Components, Turbopack)
- **Language**: TypeScript 5.9+ (Strict Mode)
- **Monorepo**: Turborepo with pnpm workspaces
- **Database**: Vercel Postgres (Neon) with Drizzle ORM
- **Queue/Cache**: Upstash Redis (HTTP-based serverless)
- **AI**: Vercel AI SDK with OpenAI provider
- **Auth**: Clerk (synced to Postgres via webhooks)
- **API**: tRPC 11 (end-to-end type-safe)
- **UI**: React 19, Tailwind CSS, shadcn/ui, Recharts

## Repository Structure

```
Portfolio-Tracker/
├── apps/
│   └── webapp/                 # Next.js 16 web application
├── packages/
│   ├── shared/                 # Shared libraries (type:shared)
│   │   ├── auth/              # Clerk authentication wrapper
│   │   ├── db/                # Drizzle ORM schema & client
│   │   ├── redis/             # Redis client & queue management
│   │   ├── ui/                # Shared React components
│   │   └── validators/        # Zod validators
│   ├── features/               # Feature-specific packages (type:feature)
│   │   ├── finance/           # Yahoo Finance service adapter
│   │   └── llm/               # AI narrative engine
│   └── compositions/           # API layer (type:composition)
│       └── api/               # tRPC API router
├── tooling/                    # Shared development tools (type:config)
│   ├── eslint/                # ESLint configuration
│   ├── prettier/              # Prettier configuration
│   ├── tailwind/              # Tailwind CSS configuration
│   ├── typescript/            # TypeScript base configuration
│   └── github/                # GitHub Actions setup
└── turbo/                      # Turborepo generators
```

## Quick Reference Commands

```bash
# Development
pnpm dev              # Start all packages in dev mode
pnpm dev:next         # Start webapp only
pnpm build            # Build all packages

# Code Quality (run before PRs)
pnpm typecheck        # TypeScript compiler check
pnpm lint             # ESLint + workspace checks
pnpm lint:fix         # Auto-fix linting issues
pnpm format           # Prettier check
pnpm format:fix       # Prettier auto-fix
pnpm boundaries       # Validate package dependencies

# Database
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Drizzle Studio UI

# Testing
pnpm test             # Run Vitest unit tests
```

## Critical Conventions

### 1. Package Manager

**Always use `pnpm`** - never npm or yarn.

When adding dependencies:
1. Add shared versions to `pnpm-workspace.yaml` under `catalog:`
2. Reference in package.json as `"dependency": "catalog:"`

### 2. Package Boundaries (Turborepo)

Strict dependency rules enforced via `turbo.json`:

| Package Type | Can Depend On |
|--------------|---------------|
| `type:app` | composition, feature, shared, config |
| `type:composition` | composition, feature, shared, config |
| `type:feature` | feature, shared, config |
| `type:shared` | shared, config |
| `type:config` | config, shared |

Run `pnpm boundaries` to validate.

### 3. Internal Package Structure

Every package in `packages/` must follow this structure:

```
src/
├── index.ts           # PUBLIC BOUNDARY - exports ONLY (no implementation!)
├── schemas/           # Zod schemas, DTOs, validation logic
├── data/              # Static data files (prompts, questions)
├── hooks/             # React hooks (API calls, data fetching)
├── components/        # React UI components (one per file)
├── utils/             # Helper functions (non-React)
└── lib/               # Complex business logic
```

**Rules:**
- `index.ts` must contain ONLY exports, never implementation code
- One primary export per file
- Use snake_case for filenames
- Keep files under ~50 lines; refactor if larger

### 4. Environment Variables

Access environment variables ONLY through `env.ts` (never `process.env` directly):

```typescript
// Correct
import { env } from "@/env";
const key = env.OPENAI_API_KEY;

// Wrong - ESLint will error
const key = process.env.OPENAI_API_KEY;
```

### 5. Type Safety

- TypeScript strict mode is enabled everywhere
- Use Zod for ALL external data validation (API responses, user input)
- tRPC provides end-to-end type safety for API calls
- Drizzle-zod generates schemas from database tables

### 6. Import Organization

Imports are auto-sorted by Prettier in this order:
1. React
2. Next.js
3. Third-party packages
4. Internal `@portfolio/*` packages
5. Relative paths

## Key Architecture Patterns

### tRPC API Structure

Located in `/packages/compositions/api/`:

```typescript
// Context available in procedures
{ db, session, headers }

// Procedure types
publicProcedure    // No auth required
protectedProcedure // Requires authenticated user
```

Endpoint: `/api/trpc/[trpc]`

### Database Schema

Tables defined in `/packages/shared/db/src/schema.ts`:
- **Users** - Synced from Clerk via webhook
- **Assets** - Stock symbols and metadata
- **Portfolios** - User portfolios (cascade delete with user)
- **SentimentLogs** - AI-generated sentiment data

### Queue-Worker Pattern

Redis-based background processing:
1. **Seeder Cron** (4hr) - Populates queue with assets
2. **Processor Cron** (1min) - Processes within Vercel limits
3. **Deduplication** - Redis Set prevents duplicate processing

### AI Narrative Engine

Located in `/packages/features/llm/`:
- Uses Vercel AI SDK `generateObject` for structured output
- Generates sentiment scores (-1 to 1), reasoning, and key topics
- Model: GPT-4o-mini

## Git Branching Strategy

```
feature/epic-name/feature-name  # New features
epic/epic-name                  # Epic branches
release/epic-name               # Releases
hotfix/epic-name                # Hotfixes
```

## Pre-PR Checklist

Before submitting any PR, run:

```bash
pnpm typecheck && pnpm lint && pnpm format
```

Fix all errors before submitting.

## Agent Context Files

This project uses a file-based context system in `.agent/rules/`:

| File | Purpose |
|------|---------|
| `rules.md` | Immutable conventions (always follow) |
| `critical_context.md` | Architecture rules and structure |
| `plan.md` | High-level roadmap (Epics 1-7) |
| `tasks.md` | Active task checklist |
| `suggested_tasks.md` | Backlog and technical debt |

**Workflow:**
- Check `tasks.md` for current work
- Follow `rules.md` and `critical_context.md` strictly
- Log discovered issues to `suggested_tasks.md` (don't fix immediately)
- Update files to reflect changes as you work

## Common Patterns

### Adding a New Package

1. Create directory under appropriate category (`shared/`, `features/`, etc.)
2. Add `package.json` with correct `type` tag
3. Add to `pnpm-workspace.yaml`
4. Use `catalog:` references for dependencies
5. Follow internal structure conventions

### Adding a shadcn/ui Component

```bash
pnpm ui-add
```

Interactive prompt will guide component selection.

### Database Changes

1. Modify schema in `/packages/shared/db/src/schema.ts`
2. Run `pnpm db:push` to apply changes
3. Use `pnpm db:studio` to verify

## Environment Setup

Required environment variables (see `.env.example`):

```bash
# Database
POSTGRES_URL=

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

## Node Version

Check `.nvmrc` for exact version: **22.19.0**

```bash
nvm use  # If using nvm
```
