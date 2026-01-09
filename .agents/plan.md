# Narrative Portfolio Tracker: Technical Implementation Plan

## 1. Executive Summary

### 1.1 Architectural Vision

The Narrative Portfolio Tracker reconciles the stateless nature of Vercel's serverless environment with the need for continuous, heavy data processing. By leveraging Next.js 16, Vercel AI SDK, and a Queue-Worker architecture powered by Upstash Redis, this system correlates quantitative market data with qualitative AI-driven sentiment analysis.

### 1.2 Tech Stack & Strategic Justification

- **Monorepo:** Turborepo (Isolated `ui`, `db`, `config` packages).
- **Framework:** Next.js 16+ (App Router, React Server Components).
- **Language:** TypeScript (Strict Mode).
- **Database:** Vercel Postgres (Neon) accessed via Drizzle ORM.
- **Auth:** Clerk (Synced to Postgres via Webhooks).
- **Queue & Cache:** Upstash Redis (HTTP-based Serverless Redis).
- **AI:** Vercel AI SDK (OpenAI Provider, `generateObject` for structured output).
- **Data Source:** `yahoo-finance2` (Unofficial API wrapped in a resilient service layer).
- **UI:** Tailwind CSS + Tremor.

---

## 2. Epic 1: Project Initialisation & Monorepo Structure

### 2.1 Goal

Establish a high-performance workspace that enforces code quality and strictly separates concerns between the web application, database logic, and UI components.

### 2.2 Task List

#### Task 1.1: Turborepo Workspace Scaffolding

- **Description:** Initialise the monorepo with `pnpm`. Configure the workspace to isolate the Next.js app from shared logic.
- **Technical Implementation:**
  - **Structure:**
    - `apps/web`: Next.js 16 application.
    - `packages/ui`: Shared React components (Tremor/Tailwind).
    - `packages/db`: Drizzle ORM schema and connection logic.
    - `packages/config`: Shared TypeScript and Biome configurations.
  - **Configuration:** `turbo.json` must define a pipeline where `apps/web` build depends on `^build` of its dependencies.

#### Task 1.2: Enforce Strict TypeScript & Biome

- **Description:** Replace ESLint/Prettier with Biome for faster linting and formatting. Enforce strict TypeScript rules to prevent null-pointer exceptions in the data pipeline.
- **Technical Implementation:**
  - **Biome:** Create `biome.json` at root. Configure "organise imports" and recommended rules.
  - **TypeScript:** In `packages/config/tsconfig.json`, set:
    ```json
    {
      "compilerOptions": {
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "noUncheckedIndexedAccess": true
      }
    }
    ```

#### Task 1.3: Next.js 16 Proxy Configuration

- **Description:** Implement the new `proxy.ts` convention which replaces the deprecated `middleware.ts` in Next.js 16.
- **Technical Implementation:**
  - Create `apps/web/proxy.ts` (or `src/proxy.ts`).
  - Export a function named `proxy`.
  - **Role:** Handle request interception for Clerk authentication and security headers (CSP, X-Frame-Options).
  - **Note:** Ensure matcher config excludes static assets (`/_next`, `/favicon.ico`).

---

## 3. Epic 2: Database & Authentication Foundation

### 3.1 Goal

Set up the persistent storage layer and synchronise user identity between Clerk and Vercel Postgres.

### 3.2 Task List

#### Task 2.1: Drizzle ORM Schema Definition

- **Description:** Define the relational schema to store users, assets, and AI-generated sentiment logs.
- **Technical Implementation:**
  - **Library:** `drizzle-orm/pg-core`.
  - **Models (`packages/db/schema.ts`):**
    - `users`: `id` (text, PK from Clerk), `email`.
    - `assets`: `ticker` (text, PK), `name`, `sector`.
    - `portfolios`: `id` (serial), `userId` (FK -> `users.id`).
    - `holdings`: `portfolioId`, `assetTicker`.
    - `news_items`: `id`, `assetTicker`, `url` (unique), `publishedAt`.
    - `sentiment_logs`: `newsItemId` (FK), `score` (decimal -1 to 1), `summary` (text).

#### Task 2.2: Clerk Webhook Synchronisation

- **Description:** Create an API route to listen for Clerk `user.created` events and replicate the user into Postgres.
- **Technical Implementation:**
  - **Route:** `/api/webhooks/clerk`.
  - **Verification:** Use `svix` to verify the request signature against `CLERK_WEBHOOK_SECRET`.
  - **Action:** On success, perform an `INSERT` into the `users` table via Drizzle. This ensures foreign key constraints in portfolios are valid.

---

## 4. Epic 3: The "Stateless" Data Ingestion Layer

### 4.1 Goal

Architect a data fetching mechanism that survives Vercel's execution limits by decoupling scheduling from processing using Redis.

### 4.2 Task List

#### Task 3.1: Upstash Redis & Rate Limiting

- **Description:** Initialise the Redis client and configure a rate limiter to protect against Yahoo Finance IP bans.
- **Technical Implementation:**
  - **Library:** `@upstash/redis` (HTTP client) and `@upstash/ratelimit`.
  - **Singleton:** Export a global Redis instance in `lib/redis.ts`.
  - **Limiter:** Create a sliding window limiter (e.g., 10 requests per 10 seconds).

#### Task 3.2: Yahoo Finance Service Adapter

- **Description:** Build a service to safely interact with `yahoo-finance2`, validating all external data.
- **Technical Implementation:**
  - **Library:** `yahoo-finance2`.
  - **Method:** Use `yahooFinance.search(ticker, { newsCount: 5 })` to retrieve news.
  - **Validation:** Define a Zod schema for the news response. If the API shape changes, fail gracefully with a typed error rather than crashing the worker.
  - **Fields to Extract:** `uuid`, `title`, `link`, `providerPublishTime`.

#### Task 3.3: Ingestion Queue Producer (The Scheduler)

- **Description:** A function to push jobs into a Redis List.
- **Technical Implementation:**
  - **Redis Structure:**
    - **List:** `narrative:queue`
    - **Set (Dedup):** `narrative:processing`
  - **Logic:** Before pushing `{ ticker: "AAPL" }` to the List, check `SISMEMBER` on the Set. If it exists, skip to prevent duplicate processing.

---

## 5. Epic 4: The AI Narrative Engine

### 5.1 Goal

Transform raw news text into structured sentiment data using Large Language Models.

### 5.2 Task List

#### Task 4.1: Vercel AI SDK Integration

- **Description:** Configure the SDK to generate structured JSON outputs.
- **Technical Implementation:**
  - **Function:** `generateObject` from `ai`.
  - **Provider:** `@ai-sdk/openai` (using `gpt-4o-mini` for cost efficiency).
  - **Schema:**
    ```typescript
    z.object({
      sentimentScore: z.number().min(-1).max(1),
      reasoning: z.string().describe("Why this sentiment?"),
      keyTopics: z.array(z.string()),
    });
    ```

#### Task 4.2: Financial Analyst Prompt Engineering

- **Description:** Create a system prompt that enforces a rigorous analytical persona.
- **Technical Implementation:**
  - **Prompt:** "You are a cynical Wall Street analyst. Analyse the provided news headlines for [Asset]. Ignore fluff. Output a sentiment score from -1 (Bearish) to 1 (Bullish)."
  - **Context Window:** Feed only the Title and Summary of the last 5 news items to save tokens.

---

## 6. Epic 5: Background Worker Strategy

### 6.1 Goal

Operationalise the data ingestion using Vercel Cron Jobs.

### 6.2 Task List

#### Task 5.1: The "Seeder" Cron Job

- **Description:** A cron job that runs every 4 hours to populate the queue.
- **Technical Implementation:**
  - **Config:** `vercel.json` -> `crons: [{ path: "/api/cron/seed", schedule: "0 */4 * * *" }]`.
  - **Logic:** Query DB for all distinct assets in portfolios -> Call the Producer (Task 3.3) -> Return 200 OK immediately.

#### Task 5.2: The "Processor" Cron Job

- **Description:** A frequent cron job (e.g., every minute) that processes the queue.
- **Technical Implementation:**
  - **Config:** Schedule `* * * * *`.
  - **Logic (The Worker Loop):**
    1. Start a timer (Max 50s execution budget).
    2. **Loop:** `RPOP` from Redis Queue.
    3. If null, break.
    4. Fetch News (Task 3.2).
    5. Generate Sentiment (Task 4.1).
    6. Write to Postgres.
    7. Remove from Dedup Set.
    8. Check timer. If > 45s, break loop and exit to avoid Vercel timeout.
  - **New Feature:** Use Next.js 16 `after()` (experimental) for non-blocking logging or cleanup tasks once the response is sent.

---

## 7. Epic 6: Dashboard UI & Visualisation

### 7.1 Goal

Visualise the correlation between price and sentiment.

### 7.2 Task List

#### Task 6.1: Portfolio Dashboard (RSC)

- **Description:** A Server Component page that fetches data directly from the DB.
- **Technical Implementation:**
  - **Path:** `app/dashboard/page.tsx`.
  - **Fetching:** `await db.query.portfolios.findMany(...)`.
  - **Constraint:** Do not use `fetch(/api/...)` internally; query the DB directly for performance.

#### Task 6.2: Tremor Chart Implementation

- **Description:** Render the Price vs. Sentiment chart.
- **Technical Implementation:**
  - **Component:** `<AreaChart />` from Tremor.
  - **Data Formatting:** Map DB results to an array of objects:
    ```typescript
    [{ date: "Jan 1", price: 150, sentiment: 0.8 }, ...]
    ```
  - **Visuals:** Use a dual-axis approach or stacked charts since Price ($100+) and Sentiment (-1 to 1) have different scales.

---

## 8. Epic 7: Testing & Deployment

### 8.1 Goal

Ensure reliability and type safety before production release.

### 8.2 Task List

#### Task 7.1: Unit Testing with Vitest

- **Description:** Test the "Worker Loop" logic in isolation.
- **Technical Implementation:**
  - **Mocking:** Mock `redis.rpop` and `yahooFinance.search`.
  - **Scenario:** Verify that the worker stops processing when the time budget is exceeded.

#### Task 7.2: End-to-End (E2E) with Playwright

- **Description:** Test the full user flow from Login to Dashboard.
- **Technical Implementation:**
  - **Auth Bypass:** Use Clerk's testing tokens to bypass 2FA in CI.
  - **Checks:** Verify that adding a stock ticker eventually results in a visible chart on the dashboard.
