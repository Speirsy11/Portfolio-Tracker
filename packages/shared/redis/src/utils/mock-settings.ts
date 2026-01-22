import { redis } from "./client";

const MOCK_SETTINGS_KEY = "narrative:mock_settings";

export interface MockSettings {
  llmMockEnabled: boolean;
}

const DEFAULT_SETTINGS: MockSettings = {
  llmMockEnabled: false,
};

export const mockSettings = {
  /**
   * Get current mock settings
   */
  async get(): Promise<MockSettings> {
    const settings = await redis.get<MockSettings>(MOCK_SETTINGS_KEY);
    return settings ?? DEFAULT_SETTINGS;
  },

  /**
   * Update mock settings
   */
  async set(settings: Partial<MockSettings>): Promise<MockSettings> {
    const current = await this.get();
    const updated = { ...current, ...settings };
    await redis.set(MOCK_SETTINGS_KEY, updated);
    return updated;
  },

  /**
   * Check if LLM mocking is enabled
   */
  async isLlmMockEnabled(): Promise<boolean> {
    const settings = await this.get();
    return settings.llmMockEnabled;
  },

  /**
   * Toggle LLM mocking
   */
  async toggleLlmMock(enabled: boolean): Promise<MockSettings> {
    return this.set({ llmMockEnabled: enabled });
  },
};
