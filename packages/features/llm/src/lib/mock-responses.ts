import type { SentimentAnalysis } from "./generate";

/**
 * Default mock response used as fallback
 */
const DEFAULT_MOCK: SentimentAnalysis = {
  sentimentScore: 0.65,
  reasoning:
    "Strong earnings beat expectations with positive guidance. Market fundamentals remain solid with increased institutional interest.",
  keyTopics: ["earnings beat", "positive guidance", "institutional buying"],
};

/**
 * Mock response templates for different sentiment scenarios
 */
const MOCK_TEMPLATES: SentimentAnalysis[] = [
  DEFAULT_MOCK,
  {
    sentimentScore: 0.35,
    reasoning:
      "Mixed results with revenue growth offset by margin pressure. Market awaits clarity on future direction.",
    keyTopics: ["revenue growth", "margin pressure", "market uncertainty"],
  },
  {
    sentimentScore: -0.25,
    reasoning:
      "Concerns mount over sector headwinds and competitive pressures. Recent news suggests cautious near-term outlook.",
    keyTopics: ["sector headwinds", "competition", "cautious outlook"],
  },
  {
    sentimentScore: 0.8,
    reasoning:
      "Exceptional momentum driven by breakthrough developments and expanding market opportunity. Bulls firmly in control.",
    keyTopics: ["breakthrough", "market expansion", "bullish momentum"],
  },
  {
    sentimentScore: -0.5,
    reasoning:
      "Significant challenges ahead with regulatory scrutiny and market share losses. Defensive positioning recommended.",
    keyTopics: ["regulatory risk", "market share loss", "defensive stance"],
  },
  {
    sentimentScore: 0.15,
    reasoning:
      "Stable but unexciting outlook. Company executing steadily without major catalysts on the horizon.",
    keyTopics: ["stable operations", "limited catalysts", "steady execution"],
  },
];

/**
 * Generate a deterministic mock response based on asset name
 * Uses the asset name to seed selection for consistent results per asset
 */
export function generateMockResponse(assetName: string): SentimentAnalysis {
  // Create a simple hash from the asset name for deterministic selection
  let hash = 0;
  for (let i = 0; i < assetName.length; i++) {
    const char = assetName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Add some time-based variation (changes every hour)
  const hourSeed = Math.floor(Date.now() / (1000 * 60 * 60));
  const index = Math.abs(hash + hourSeed) % MOCK_TEMPLATES.length;

  const template = MOCK_TEMPLATES[index] ?? DEFAULT_MOCK;

  // Add asset name context to make it more realistic
  return {
    ...template,
    reasoning: `[MOCK] ${assetName}: ${template.reasoning}`,
    keyTopics: template.keyTopics.map((topic) => `${topic}`),
  };
}
