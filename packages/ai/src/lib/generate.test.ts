import { describe, it, expect, vi } from 'vitest';
import { generateFinancialReport } from './generate';

// Mock the AI SDK to avoid real API calls
vi.mock('ai', () => ({
  generateObject: vi.fn().mockResolvedValue({
    object: {
      summary: "Test Summary",
      sentiment: "positive",
      keyPoints: ["Point 1", "Point 2"]
    }
  })
}));

describe('generateFinancialReport', () => {
  it('should call generateObject with correct parameters', async () => {
    const result = await generateFinancialReport("Test Context");
    
    expect(result.object).toEqual({
      summary: "Test Summary",
      sentiment: "positive",
      keyPoints: ["Point 1", "Point 2"]
    });
  });
});
