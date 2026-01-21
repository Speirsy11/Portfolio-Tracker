---
trigger: always_on
---

# Narrative Portfolio Tracker - Implementation Checklist

## Epic 1: Project Initialisation

- [x] **Task 1.1:** Check if next.js is on most recent version
- [x] **Task 1.2:** Create `proxy.ts` in `apps/web` for Next.js 16 request handling.

## Epic 2: Database & Auth

- [x] **Task 2.1:** Define Drizzle ORM schema (`Users`, `Assets`, `Portfolios`, `SentimentLogs`).
- [x] **Task 2.2:** Implement Clerk authentication and webhook handler (`/api/webhooks/clerk`).

## Epic 3: Data Ingestion Layer

- [x] **Task 3.1:** Initialise Upstash Redis client and configure Rate Limiter.
- [x] **Task 3.2:** Build `yahoo-finance2` service adapter with Zod validation.
- [x] **Task 3.3:** Implement Ingestion Queue Producer (Redis List + Dedup Set).

## Epic 4: AI Narrative Engine

- [x] **Task 4.1:** Integrate Vercel AI SDK `generateObject` with OpenAI provider (leave implementation easy to add support for different providers in future e.g. anthropic, google, etc.).
- [x] **Task 4.2:** Engineer the Financial Analyst system prompt and context management.

## Epic 5: Background Workers

- [x] **Task 5.1:** Configure "Seeder" Cron Job (`/api/cron/seed`) to populate the queue.
- [x] **Task 5.2:** Build "Processor" Worker (`/api/cron/worker`) with time-budgeting loop.

## Epic 6: Dashboard UI

- [x] **Task 6.1:** Build Portfolio Dashboard page using React Server Components and direct DB queries.
- [x] **Task 6.2:** Implement Recharts `<AreaChart />` for Sentiment visualisation.

## Epic 7: Testing & CI/CD

- [x] **Task 7.1:** Write unit tests for Worker logic using Vitest.
- [ ] **Task 7.2:** Create E2E tests for the "Add Asset" flow using Playwright.

---

# Production-Ready Tasks

## Testing & Quality Assurance

- [ ] **Test 1:** Complete E2E tests for critical user flows (Playwright)
  - Dashboard navigation and portfolio creation
  - Asset addition/removal flow
  - Authentication flow
- [ ] **Test 2:** Add integration tests for tRPC procedures
- [ ] **Test 3:** Add unit tests for sentiment chart data transformation
- [ ] **Test 4:** Set up test coverage reporting and minimum thresholds

## Error Handling & Resilience

- [ ] **Error 1:** Implement global error boundary component
- [ ] **Error 2:** Add retry logic with exponential backoff for Yahoo Finance API
- [ ] **Error 3:** Implement circuit breaker pattern for external API calls
- [ ] **Error 4:** Add graceful degradation when sentiment data unavailable
- [ ] **Error 5:** Create custom error pages (404, 500, etc.)

## Performance & Optimization

- [ ] **Perf 1:** Implement React Query caching strategy for portfolio data
- [ ] **Perf 2:** Add pagination to portfolio list and asset list components
- [ ] **Perf 3:** Optimize database queries with proper indexes
- [ ] **Perf 4:** Add loading states and skeleton components
- [ ] **Perf 5:** Implement lazy loading for sentiment chart

## Security Hardening

- [ ] **Sec 1:** Add rate limiting to tRPC procedures
- [ ] **Sec 2:** Implement CORS policy validation
- [ ] **Sec 3:** Add input sanitization for user-provided asset names
- [ ] **Sec 4:** Review and audit Clerk webhook security
- [ ] **Sec 5:** Add CSP headers in proxy.ts

## Monitoring & Observability

- [ ] **Mon 1:** Set up Vercel Analytics integration
- [ ] **Mon 2:** Add structured logging for background workers
- [ ] **Mon 3:** Implement health check endpoints
- [ ] **Mon 4:** Create monitoring dashboard for queue metrics
- [ ] **Mon 5:** Set up alerting for worker failures

## User Experience Improvements

- [ ] **UX 1:** Add real-time price data integration
- [ ] **UX 2:** Implement asset search with autocomplete
- [ ] **UX 3:** Add portfolio value aggregation and display
- [ ] **UX 4:** Create mobile-responsive navigation menu
- [ ] **UX 5:** Add confirmation dialogs for destructive actions
- [ ] **UX 6:** Implement toast notifications for async operations

## CI/CD & DevOps

- [ ] **CI 1:** Set up GitHub Actions workflow for PR checks
- [ ] **CI 2:** Add automated database migrations
- [ ] **CI 3:** Implement preview deployments for PRs
- [ ] **CI 4:** Add automated dependency updates (Renovate/Dependabot)
- [ ] **CI 5:** Create production deployment checklist

## Documentation

- [ ] **Doc 1:** Add API documentation with examples
- [ ] **Doc 2:** Create user guide for portfolio management
- [ ] **Doc 3:** Document environment variable setup
- [ ] **Doc 4:** Add architecture decision records (ADRs)
- [ ] **Doc 5:** Create contributing guidelines
