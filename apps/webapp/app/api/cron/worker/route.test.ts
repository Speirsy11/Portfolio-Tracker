import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies before importing the route handler
const mockPop = vi.fn();
const mockComplete = vi.fn();
const mockGetQueueLength = vi.fn().mockResolvedValue(0);

vi.mock("@portfolio/redis", () => ({
  ingestionQueue: {
    pop: mockPop,
    complete: mockComplete,
    getQueueLength: mockGetQueueLength,
  },
}));

vi.mock("@portfolio/finance", () => ({
  yahooFinanceService: {
    searchAssets: vi.fn().mockResolvedValue([
      {
        uuid: "1",
        title: "Stock rises on earnings",
        link: "https://example.com/1",
        publishedAt: new Date(),
      },
      {
        uuid: "2",
        title: "Market analysis positive",
        link: "https://example.com/2",
        publishedAt: new Date(),
      },
    ]),
  },
}));

vi.mock("@portfolio/llm", () => ({
  generateFinancialReport: vi.fn().mockResolvedValue({
    object: {
      sentimentScore: 0.75,
      reasoning: "Strong earnings and positive market outlook",
      keyTopics: ["earnings", "growth"],
    },
  }),
}));

vi.mock("@portfolio/db", () => ({
  db: {
    query: {
      Assets: {
        findFirst: vi
          .fn()
          .mockResolvedValue({ id: "asset-123", symbol: "AAPL" }),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue({}),
    }),
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

vi.mock("~/env", () => ({
  env: {
    CRON_SECRET: "test-secret",
  },
}));

// Import after mocks are set up
import { GET } from "./route";

interface WorkerResponse {
  success?: boolean;
  error?: string;
  processed?: number;
  errors?: number;
  errorDetails?: { ticker: string; error: string }[];
  remainingInQueue?: number;
  executionTimeMs?: number;
}

describe("/api/cron/worker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject requests without valid authorization", async () => {
    const request = new NextRequest("http://localhost/api/cron/worker", {
      headers: {},
    });

    const response = await GET(request);
    const data = (await response.json()) as WorkerResponse;

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should handle empty queue gracefully", async () => {
    mockPop.mockResolvedValueOnce(null);

    const request = new NextRequest("http://localhost/api/cron/worker", {
      headers: { authorization: "Bearer test-secret" },
    });

    const response = await GET(request);
    const data = (await response.json()) as WorkerResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.processed).toBe(0);
  });

  it("should process a single ticker from queue", async () => {
    mockPop.mockResolvedValueOnce("AAPL").mockResolvedValueOnce(null);

    const request = new NextRequest("http://localhost/api/cron/worker", {
      headers: { authorization: "Bearer test-secret" },
    });

    const response = await GET(request);
    const data = (await response.json()) as WorkerResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.processed).toBe(1);
    expect(mockComplete).toHaveBeenCalledWith("AAPL");
  });
});
