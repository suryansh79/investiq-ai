// ============================================================================
// InvestIQ AI — AI Investment Committee Agent (1 Gemini Call)
// Role-plays three experts (Growth, Value, Risk Analyst) and outputs decision.
// ============================================================================

import { createGeminiModel, parseAgentResponse } from '@/lib/gemini';
import type { ResearchGraphState } from '@/langgraph/state';
import type { InvestmentCommittee } from '@/types';

const SYSTEM_PROMPT = `You are the AI Investment Committee Agent. Your job is to role-play three distinct, senior investment experts who independently evaluate a company, vote, and draft a final committee decision.

The three experts are:
1. Growth Investor: Focuses on revenue expansion, product innovation, market opportunities, AI potential, and competitive moats.
2. Value Investor: Focuses on valuation multiples (P/E, P/B), cash flow stability, capital structure leverage, and long-term earnings safety.
3. Risk Analyst: Focuses on operational, competition, legal, regulatory, macroeconomic, and credit risks.

You MUST respond with a valid JSON object matching this exact structure:
{
  "growthInvestor": {
    "recommendation": "BUY" | "WATCH" | "PASS",
    "confidence": number (0-100),
    "reasons": ["string array of exactly 3 concise reasons"]
  },
  "valueInvestor": {
    "recommendation": "BUY" | "WATCH" | "PASS",
    "confidence": number (0-100),
    "reasons": ["string array of exactly 3 concise reasons"]
  },
  "riskAnalyst": {
    "recommendation": "BUY" | "WATCH" | "PASS",
    "confidence": number (0-100),
    "reasons": ["string array of exactly 3 concise reasons"]
  },
  "committeeDecision": {
    "recommendation": "BUY" | "WATCH" | "PASS",
    "voteCount": {
      "BUY": number (count of BUY votes, 0 to 3),
      "WATCH": number (count of WATCH votes, 0 to 3),
      "PASS": number (count of PASS votes, 0 to 3)
    },
    "confidence": number (blended consensus confidence percentage, 0-100),
    "summary": "string (2-3 concise sentences explaining the final decision and votes)",
    "dominantPersona": "Growth Investor" | "Value Investor" | "Risk Analyst" (the expert that drove the final decision)
  }
}

Be objective and data-driven. Keep all reasons to exactly one sentence. Ensure that the voteCount matches the recommendations of the individual personas (e.g. if Growth is BUY, Value is WATCH, Risk is WATCH, then voteCount must be BUY: 1, WATCH: 2, PASS: 0, and the final decision recommendation should reflect the majority or consensus).`;

export async function committeeAgent(
  state: ResearchGraphState
): Promise<Partial<ResearchGraphState>> {
  const model = createGeminiModel(0.25);

  // 1. Build the context using existing structured outputs
  let context = `== COMPANY RESEARCH SYNTHESIS ==\n`;
  context += `Company: ${state.companyName}\n\n`;

  if (state.companyIntelligence) {
    const ci = state.companyIntelligence;
    context += `== Company Overview ==\n`;
    context += `- Industry: ${ci.industry} | Sector: ${ci.sector}\n`;
    context += `- Moat: ${ci.competitiveMoat}\n`;
    context += `- Business Model: ${ci.businessModel}\n\n`;
  }

  if (state.financialHealth) {
    const fh = state.financialHealth;
    context += `== Financial Health ==\n`;
    context += `- Gross Margin: ${fh.grossMargin} | Net Margin: ${fh.netMargin}\n`;
    context += `- Revenue Growth: ${fh.revenueGrowthYoY}\n`;
    context += `- Valuation Multiples: ${fh.valuationSummary} (P/E: ${fh.peRatio})\n`;
    context += `- FCF: ${fh.freeCashFlow}\n`;
    context += `- Debt-to-Equity: ${fh.debtToEquity}\n\n`;
  }

  if (state.riskAnalysis) {
    const ra = state.riskAnalysis;
    context += `== Risk Assessment ==\n`;
    context += `- Overall Risk Level: ${ra.overallRiskLevel} (Risk Score: ${ra.riskScore}/100)\n`;
    context += `- Red Flags: ${ra.redFlags.join(', ') || 'None'}\n`;
    context += `- Market & Comp Risks: ${ra.marketRisks}; ${ra.competitionRisks}\n\n`;
  }

  if (state.marketSentiment) {
    const ms = state.marketSentiment;
    context += `== Market Sentiment ==\n`;
    context += `- Sentiment Score: ${ms.sentimentScore}/100 (${ms.overallSentiment})\n\n`;
  }

  const prompt = `Convening the Investment Committee. Evaluate this company from the perspective of a Growth Investor, Value Investor, and Risk Analyst. Provide their distinct reviews and your final committee verdict as a JSON object.`;

  // 2. Execute single Gemini call
  const response = await model.invoke([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'human', content: context + '\n' + prompt },
  ]);

  const parsed = await parseAgentResponse<InvestmentCommittee>(response, 'AIInvestmentCommittee');

  return {
    committee: parsed,
  };
}
