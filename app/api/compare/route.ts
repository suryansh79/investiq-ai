// ============================================================================
// InvestIQ AI — Company Comparison Verdict API
// Synthesizes results of Company A and Company B to draft the final verdict.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createGeminiModel, parseAgentResponse } from '@/lib/gemini';
import type { AnalysisResult, SimulatorSettings } from '@/types';

export const runtime = 'nodejs';

interface VerdictOutput {
  chosenCompany: string;
  verdictReasoning: string[];
}

const SYSTEM_PROMPT = `You are a Senior Investment Officer. You are comparing two companies to make a definitive investment pick.

You MUST respond with a valid JSON object matching this exact structure:
{
  "chosenCompany": "string (Official Name of the winning company)",
  "verdictReasoning": ["string array of 4-6 concise bullet points justifying the selection"]
}

Base your decision on the financial health, valuation, growth outlook, risks, and sentiment profiles of both companies. Align with the specified risk appetite and investment horizon. Be analytical and objective.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const resultA: AnalysisResult = body.resultA;
    const resultB: AnalysisResult = body.resultB;
    const simulatorSettings: SimulatorSettings = body.simulatorSettings || {
      riskAppetite: 'Moderate',
      investmentHorizon: '3 Years',
    };

    if (!resultA || !resultB) {
      return NextResponse.json(
        { error: 'Analysis results for both companies are required for comparison.' },
        { status: 400 }
      );
    }

    const model = createGeminiModel(0.3);

    const prompt = `Perform a side-by-side investment synthesis and choose the superior pick between:

--- COMPANY A: ${resultA.companyIntelligence.companyName} (${resultA.companyIntelligence.ticker}) ---
- Recommendation: ${resultA.decision.recommendation} (Confidence: ${resultA.decision.confidencePercentage}%)
- Overall Score: ${resultA.decision.overallScore}/100
- Financial Health Score: ${resultA.decision.financialHealthScore}/100
- Risk Score: ${resultA.decision.riskScore}/100 (High score = safer)
- Sentiment Score: ${resultA.decision.sentimentScore}/100
- P/E Ratio: ${resultA.financialHealth.peRatio}
- Moat: ${resultA.companyIntelligence.competitiveMoat}
- Key Strengths: ${resultA.decision.keyStrengths.join('; ')}
- Major Risks: ${resultA.decision.majorRisks.join('; ')}

--- COMPANY B: ${resultB.companyIntelligence.companyName} (${resultB.companyIntelligence.ticker}) ---
- Recommendation: ${resultB.decision.recommendation} (Confidence: ${resultB.decision.confidencePercentage}%)
- Overall Score: ${resultB.decision.overallScore}/100
- Financial Health Score: ${resultB.decision.financialHealthScore}/100
- Risk Score: ${resultB.decision.riskScore}/100
- Sentiment Score: ${resultB.decision.sentimentScore}/100
- P/E Ratio: ${resultB.financialHealth.peRatio}
- Moat: ${resultB.companyIntelligence.competitiveMoat}
- Key Strengths: ${resultB.decision.keyStrengths.join('; ')}
- Major Risks: ${resultB.decision.majorRisks.join('; ')}

--- INVESTOR PROFILE ---
- Risk Appetite: ${simulatorSettings.riskAppetite}
- Investment Horizon: ${simulatorSettings.investmentHorizon}

Compare both assets carefully and determine which one is the better investment today. Justify your answer.`;

    const response = await model.invoke([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'human', content: prompt },
    ]);

    const parsed = await parseAgentResponse<VerdictOutput>(response, 'ComparisonVerdictAgent');

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Comparison API error:', error);
    // Return a structured fallback JSON instead of crashing
    return NextResponse.json({
      chosenCompany: 'Unable to synthesize due to api limits',
      verdictReasoning: [
        'Could not execute live LLM comparison due to Gemini rate-limits.',
        'Please review the side-by-side metrics table to make a manual evaluation.',
        'Adjust investment parameters and retry the analysis shortly.'
      ]
    });
  }
}
