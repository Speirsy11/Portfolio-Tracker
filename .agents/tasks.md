# Narrative Portfolio Tracker - Implementation Checklist

## Epic 1: Project Initialisation

- [ ] **Task 1.1:** Scaffold Turborepo workspace (apps/web, packages/ui, packages/db, packages/config).
- [ ] **Task 1.2:** Configure Biome for linting/formatting and enforce strict TypeScript settings.
- [ ] **Task 1.3:** Create `proxy.ts` in `apps/web` for Next.js 16 request handling.

## Epic 2: Database & Auth

- [ ] **Task 2.1:** Define Drizzle ORM schema (`Users`, `Assets`, `Portfolios`, `SentimentLogs`).
- [ ] **Task 2.2:** Implement Clerk authentication and webhook handler (`/api/webhooks/clerk`).

## Epic 3: Data Ingestion Layer

- [ ] **Task 3.1:** Initialise Upstash Redis client and configure Rate Limiter.
- [ ] **Task 3.2:** Build `yahoo-finance2` service adapter with Zod validation.
- [ ] **Task 3.3:** Implement Ingestion Queue Producer (Redis List + Dedup Set).

## Epic 4: AI Narrative Engine

- [ ] **Task 4.1:** Integrate Vercel AI SDK `generateObject` with OpenAI provider.
- [ ] **Task 4.2:** Engineer the Financial Analyst system prompt and context management.

## Epic 5: Background Workers

- [ ] **Task 5.1:** Configure "Seeder" Cron Job (`/api/cron/seed`) to populate the queue.
- [ ] **Task 5.2:** Build "Processor" Worker (`/api/cron/worker`) with time-budgeting loop.

## Epic 6: Dashboard UI

- [ ] **Task 6.1:** Build Portfolio Dashboard page using React Server Components and direct DB queries.
- [ ] **Task 6.2:** Implement Tremor `<AreaChart />` for Price vs. Sentiment visualisation.

## Epic 7: Testing & CI/CD

- [ ] **Task 7.1:** Write unit tests for Worker logic using Vitest.
- [ ] **Task 7.2:** Create E2E tests for the "Add Asset" flow using Playwright.
