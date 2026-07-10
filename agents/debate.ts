// ============================================================================
// InvestIQ AI — AI Debate Coordinator (Toggleable & Consolidated: 0 or 1 LLM Call)
// Runs only when enableDebate toggle is active in settings.
// ============================================================================

import { createGeminiModel, parseAgentResponse } from '@/lib/gemini';
import type { ResearchGraphState } from '@/langgraph/state';
import type { DebateOutput, DebateArgument } from '@/types';
import { getCompanyFinancials } from '@/lib/services/financialData';

const DEBATE_SYSTEM_PROMPT = `You are the AI Debate Coordinator. Your job is to draft both the BULL case (reasons to invest) and the BEAR case (reasons to avoid) for a company.

You MUST respond with a valid JSON object matching this exact structure:
{
  "bullCase": {
    "title": "string (a compelling optimistic title)",
    "points": ["array of 3-5 bullet points, each exactly 1 concise sentence"],
    "conclusion": "string (1 concise bullish concluding statement)"
  },
  "bearCase": {
    "title": "string (a compelling warning title)",
    "points": ["array of 3-5 bullet points, each exactly 1 concise sentence"],
    "conclusion": "string (1 concise bearish concluding statement)"
  }
}

Use specific financial data from the context. Keep all bullet points to exactly one sentence. Be extremely brief, direct, and analytical.`;

function buildResearchContext(state: ResearchGraphState): string {
  let context = `Company: ${state.companyName}\n\n`;
  context += `Financial Data:\n${state.financialContext}\n\n`;

  if (state.companyIntelligence) {
    context += `Company Intelligence:\n`;
    context += `- Overview: ${state.companyIntelligence.overview}\n`;
    context += `- Business Model: ${state.companyIntelligence.businessModel}\n`;
    context += `- Moat: ${state.companyIntelligence.competitiveMoat}\n\n`;
  }

  if (state.financialHealth) {
    context += `- Financial Score: ${state.financialHealth.financialHealthScore}/100\n`;
  }

  if (state.riskAnalysis) {
    context += `- Risk Level: ${state.riskAnalysis.overallRiskLevel} (Score: ${state.riskAnalysis.riskScore}/100)\n`;
    context += `- Red Flags: ${state.riskAnalysis.redFlags.join(', ') || 'None'}\n\n`;
  }

  return context;
}

export async function debateAgents(
  state: ResearchGraphState
): Promise<Partial<ResearchGraphState>> {
  const enableDebate = state.simulatorSettings.enableDebate === true;

  // ─── IF DEBATE IS DISABLED: Return high-fidelity TypeScript fallbacks (0 LLM Calls) ───
  if (!enableDebate) {
    console.log('AI Debate Mode is OFF. Generating structured debate arguments programmatically...');
    const financials = getCompanyFinancials(state.companyName);
    
    const bullCase: DebateArgument = {
      title: `Ecosystem Scaling & Market Leadership`,
      points: [
        `Strong operational moat anchored by high customer switching costs and deep integration.`,
        `Healthy balance sheet liquidity with consistent Free Cash Flow conversions.`,
        `Demonstrated pricing power and margins protecting the business against macro inflation.`
      ],
      conclusion: `Market leadership and defensive cash positioning make this a strong core hold.`
    };

    const bearCase: DebateArgument = {
      title: `Valuation Pressures & Regulatory Headwinds`,
      points: [
        `Premium valuation multiples (P/E of ${financials.peRatio}x) incorporate optimistic growth metrics.`,
        `Exposure to tightening global regulatory scrutiny and antitrust compliance reviews.`,
        `Intense competition from emerging players limiting market share expansion in core segments.`
      ],
      conclusion: `High valuation premium leaves little margin for error in execution.`
    };

    return {
      debate: { bullCase, bearCase },
    };
  }

  // ─── IF DEBATE IS ENABLED: Invoke 1 consolidated LLM call ───
  console.log('AI Debate Mode is ON. Initiating consolidated Gemini Debate Coordinator Call...');
  const model = createGeminiModel(0.4);
  const context = buildResearchContext(state);

  const prompt = `Based on the research context, generate a structured bull and bear debate case for:
Company: ${state.companyName}

Research Context:
${context}

Return a single JSON object containing "bullCase" and "bearCase".`;

  const response = await model.invoke([
    { role: 'system', content: DEBATE_SYSTEM_PROMPT },
    { role: 'human', content: prompt },
  ]);

  const parsed = await parseAgentResponse<DebateOutput>(response, 'ConsolidatedDebateCoordinator');

  return {
    debate: parsed,
  };
}
