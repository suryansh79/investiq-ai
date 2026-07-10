// ============================================================================
// InvestIQ AI — Consolidated Research Agent (Gemini Call 1)
// Consolidates: Overview, business model, competitive moat, leadership, recent
// news synthesis, news sentiment, market sentiment, and analyst ratings.
// ============================================================================

import { createGeminiModel, parseAgentResponse } from '@/lib/gemini';
import type { ResearchGraphState } from '@/langgraph/state';
import type { CompanyIntelligence, MarketSentimentAnalysis } from '@/types';

interface ResearchAgentOutput {
  companyIntelligence: CompanyIntelligence;
  marketSentiment: MarketSentimentAnalysis;
}

const SYSTEM_PROMPT = `You are a Senior Investment Research Agent. Your job is to conduct comprehensive company overview and sentiment research.

You MUST respond with a valid JSON object matching this exact structure:
{
  "companyIntelligence": {
    "companyName": "string (official company name)",
    "ticker": "string (stock ticker symbol)",
    "industry": "string (specific industry)",
    "sector": "string (broader sector)",
    "overview": "string (1-2 paragraphs company overview)",
    "businessModel": "string (1-2 sentences summarizing the business model)",
    "revenueSources": ["string array of main revenue channels"],
    "competitiveMoat": "string (1-2 sentences outlining the competitive advantage)",
    "leadership": "string (key leadership and executive management names)",
    "recentNews": ["string array of 3-5 news summary points"],
    "founded": "string (founding year)",
    "headquarters": "string (HQ location)",
    "employees": "string (approximate employee count)",
    "marketCap": "string (approximate market capitalization)"
  },
  "marketSentiment": {
    "newsSentiment": "string (1 concise sentence summarizing news coverage)",
    "marketSentiment": "string (1 concise sentence outlining broader market feelings)",
    "analystSentiment": "string (1 concise sentence explaining analyst consensus)",
    "socialSentiment": "string (1 concise sentence describing retail investor sentiment)",
    "bullishScore": number (0-100, bullish index),
    "bearishScore": number (0-100, bearish index),
    "overallSentiment": "Bullish" | "Neutral" | "Bearish",
    "sentimentScore": number (0-100, overall sentiment rating where 100 is most positive),
    "evidence": ["string array of 3-5 quantitative sentiment evidence points, e.g., analyst upgrade notes"]
  }
}

Keep all textual descriptions extremely concise (1-2 sentences maximum per field). Be factual, precise, and data-driven based on the context provided. Do not invent facts.`;

export async function consolidatedResearchAgent(
  state: ResearchGraphState
): Promise<Partial<ResearchGraphState>> {
  const model = createGeminiModel(0.3);

  const prompt = `Perform consolidated overview and sentiment research for:

Company: ${state.companyName}

Financial Context & News:
${state.financialContext}

Provide the response as a single valid JSON object containing "companyIntelligence" and "marketSentiment".`;

  const response = await model.invoke([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'human', content: prompt },
  ]);

  const parsed = await parseAgentResponse<ResearchAgentOutput>(response, 'ConsolidatedResearchAgent');

  return {
    companyIntelligence: parsed.companyIntelligence,
    marketSentiment: parsed.marketSentiment,
  };
}
