import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Import after mocks are set up
import { GET } from "./route";

// Mock dependencies before importing the route handler
vi.mock("@portfolio/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockResolvedValue([
      { id: "1", symbol: "AAPL", name: "Apple Inc." },
      { id: "2", symbol: "GOOGL", name: "Alphabet Inc." },
    ]),
  },
}));

vi.mock("@portfolio/redis", () => ({
  ingestionQueue: {
    add: vi.fn().mockResolvedValue({ status: "queued" }),
  },
}));

vi.mock("~/env", () => ({
  env: {
    CRON_SECRET: "test-secret",
  },
}));

interface SeedResponse {
  success?: boolean;
  error?: string;
  totalAssets?: number;
  queued?: number;
  skipped?: number;
}

describe("/api/cron/seed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject requests without valid authorization", async () => {
    const request = new NextRequest("http://localhost/api/cron/seed", {
      headers: {},
    });

    const response = await GET(request);
    const data = (await response.json()) as SeedResponse;

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should reject requests with incorrect authorization", async () => {
    const request = new NextRequest("http://localhost/api/cron/seed", {
      headers: { authorization: "Bearer wrong-secret" },
    });

    const response = await GET(request);
    const data = (await response.json()) as SeedResponse;

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should queue all assets with valid authorization", async () => {
    const request = new NextRequest("http://localhost/api/cron/seed", {
      headers: { authorization: "Bearer test-secret" },
    });

    const response = await GET(request);
    const data = (await response.json()) as SeedResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.totalAssets).toBe(2);
    expect(data.queued).toBe(2);
  });
});
