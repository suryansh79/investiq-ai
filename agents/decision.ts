// ============================================================================
// InvestIQ AI — Decision Agent (Gemini Call 2)
// Synthesizes the textual investment thesis, recommendations, and portfolio fit
// while appending the programmatically calculated scores.
// ============================================================================

import { createGeminiModel, parseAgentResponse } from '@/lib/gemini';
import type { ResearchGraphState } from '@/langgraph/state';
import type { DecisionAnalysis, InvestorProfile, Recommendation, ConfidenceLevel } from '@/types';
import { getCompanyFinancials } from '@/lib/services/financialData';

interface DecisionAgentLLMOutput {
  recommendation: Recommendation;
  confidencePercentage: number;
  confidenceLevel: ConfidenceLevel;
  confidenceExplanation: string;
  executiveSummary: string;
  completeReasoning: string;
  keyStrengths: string[];
  majorRisks: string[];
  investmentHorizon: string;
  bullThesis: string;
  bearThesis: string;
  portfolioFit: InvestorProfile[];
}

const SYSTEM_PROMPT = `You are the Decision Agent — the chief investment strategist. You synthesize research, financial metrics, risks, sentiment, and debate arguments to produce a final investment recommendation.

You MUST respond with a valid JSON object matching this exact structure:
{
  "recommendation": "BUY" | "WATCH" | "PASS",
  "confidencePercentage": number (0-100),
  "confidenceLevel": "High" | "Medium" | "Low",
  "confidenceExplanation": "string (1-2 sentences explaining confidence)",
  "executiveSummary": "string (1 concise paragraph summarizing findings)",
  "completeReasoning": "string (1 concise paragraph summarizing final reasoning)",
  "keyStrengths": ["string array of 3-5 key strengths"],
  "majorRisks": ["string array of 3-5 major risks"],
  "investmentHorizon": "string (recommended holding period, e.g., '3-5 Years')",
  "bullThesis": "string (1-2 sentences summarizing the bull case)",
  "bearThesis": "string (1-2 sentences summarizing the bear case)",
  "portfolioFit": ["array of applicable investor profiles from: 'Long-Term Investors', 'Growth Investors', 'Value Investors', 'Dividend Investors', 'High-Risk Investors'"]
}

Factor in the user's RISK APPETITE and INVESTMENT HORIZON. Be extremely concise. Keep executive summaries and complete reasoning to exactly 1 paragraph.`;

export async function decisionAgent(
  state: ResearchGraphState
): Promise<Partial<ResearchGraphState>> {
  const financials = getCompanyFinancials(state.companyName);
  const model = createGeminiModel(0.25);

  // 1. Build context using structured parameters from the state
  let context = `== COMPANY RESEARCH SYNTHESIS ==\n`;
  context += `Company: ${state.companyName} (${financials.ticker})\n`;
  context += `Investor Risk Appetite: ${state.simulatorSettings.riskAppetite}\n`;
  context += `Investment Horizon: ${state.simulatorSettings.investmentHorizon}\n\n`;

  if (state.companyIntelligence) {
    context += `== Overview & Moat ==\n`;
    context += `Overview: ${state.companyIntelligence.overview}\n`;
    context += `Moat: ${state.companyIntelligence.competitiveMoat}\n\n`;
  }

  if (state.financialHealth) {
    context += `== Financial Health (TS Computed) ==\n`;
    context += `- Health Score: ${state.financialHealth.financialHealthScore}/100\n`;
    context += `- Margins: Gross ${state.financialHealth.grossMargin}, Net ${state.financialHealth.netMargin}\n`;
    context += `- Debt ratio: ${state.financialHealth.debtToEquity}\n\n`;
  }

  if (state.riskAnalysis) {
    context += `== Risk Assessment (TS Computed) ==\n`;
    context += `- Risk Score: ${state.riskAnalysis.riskScore}/100 (Inverted: higher is safer)\n`;
    context += `- Risk Level: ${state.riskAnalysis.overallRiskLevel}\n`;
    context += `- Red Flags: ${state.riskAnalysis.redFlags.join(', ') || 'None'}\n\n`;
  }

  if (state.marketSentiment) {
    context += `== Sentiment ==\n`;
    context += `- Sentiment Score: ${state.marketSentiment.sentimentScore}/100\n`;
    context += `- Overall: ${state.marketSentiment.overallSentiment}\n\n`;
  }

  if (state.debate) {
    context += `== AI Debate Cases ==\n`;
    context += `BULL CASE: ${state.debate.bullCase.title}\n`;
    context += `  - Conclusion: ${state.debate.bullCase.conclusion}\n`;
    context += `BEAR CASE: ${state.debate.bearCase.title}\n`;
    context += `  - Conclusion: ${state.debate.bearCase.conclusion}\n`;
  }

  const prompt = `Synthesize all inputs to produce your final investment recommendation.`;

  // 2. Invoke Gemini for qualitative synthesis
  const response = await model.invoke([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'human', content: context + '\n' + prompt },
  ]);

  const parsed = await parseAgentResponse<DecisionAgentLLMOutput>(response, 'DecisionAgent');

  // 3. Programmatic Score Calculations and Integration
  const financialHealthScore = state.financialHealth?.financialHealthScore ?? 70;
  const riskScore = state.riskAnalysis?.riskScore ?? 70;
  const sentimentScore = state.marketSentiment?.sentimentScore ?? 70;

  // Calculate growth score based on statements
  const incomeStatements = financials.incomeStatements;
  const currentYearIS = incomeStatements[incomeStatements.length - 1];
  const prevYearIS = incomeStatements[incomeStatements.length - 2];
  const revGrowth = ((currentYearIS.revenue - prevYearIS.revenue) / prevYearIS.revenue) * 100;
  const growthScore = Math.round(Math.min(100, Math.max(20, revGrowth * 4 + 20)));

  const valuationScore = Math.round(Math.max(10, 100 - financials.peRatio));

  // Blend scores programmatically
  let scoreModifier = 0;
  if (state.simulatorSettings.riskAppetite === 'Conservative') {
    scoreModifier -= 5;
  } else if (state.simulatorSettings.riskAppetite === 'Aggressive') {
    scoreModifier += 5;
  }

  const overallScore = Math.min(
    98,
    Math.max(
      15,
      Math.round(
        (financialHealthScore * 0.4) + 
        (riskScore * 0.3) + 
        (sentimentScore * 0.3) + 
        scoreModifier
      )
    )
  );

  // Construct evidence
  const evidence = [
    `Quantitative financial health blended at ${financialHealthScore}/100.`,
    `Deterministic risk assessment returns rating of ${riskScore}/100.`,
    `Market sentiment indices analyzed at ${sentimentScore}/100.`,
    `Final investment blend returns overall score of ${overallScore}/100.`
  ];

  const decision: DecisionAnalysis = {
    ...parsed,
    overallScore,
    financialHealthScore,
    growthScore,
    riskScore,
    sentimentScore,
    valuationScore,
    evidence
  };

  return {
    decision,
  };
}
