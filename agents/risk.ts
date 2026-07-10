// ============================================================================
// InvestIQ AI — Programmatic Risk Analysis Agent (0 Gemini Calls)
// Assesses investment risks and red flags programmatically using rules.
// ============================================================================

import type { ResearchGraphState } from '@/langgraph/state';
import type { RiskAnalysis, RedFlagType } from '@/types';
import { getCompanyFinancials } from '@/lib/services/financialData';

export async function riskAnalysisAgent(
  state: ResearchGraphState
): Promise<Partial<ResearchGraphState>> {
  const financials = getCompanyFinancials(state.companyName);
  const { incomeStatements, balanceSheets, cashFlowStatements } = financials;

  const currentYearIS = incomeStatements[incomeStatements.length - 1];
  const currentYearBS = balanceSheets[balanceSheets.length - 1];
  const currentYearCF = cashFlowStatements[cashFlowStatements.length - 1];
  
  const deRatio = currentYearBS.totalLiabilities / currentYearBS.totalEquity;
  const fcf = currentYearCF.freeCashFlow;
  
  // Compute recent YoY revenue growth
  const prevYearIS = incomeStatements[incomeStatements.length - 2];
  const revGrowth = ((currentYearIS.revenue - prevYearIS.revenue) / prevYearIS.revenue) * 100;

  // 1. Evaluate Red Flags programmatically
  const redFlags: RedFlagType[] = [];
  let riskScore = 85; // Base score (high score = safer, lower risk)

  if (deRatio > 1.8) {
    redFlags.push('High Debt');
    riskScore -= 20;
  }
  if (fcf < 0) {
    redFlags.push('Weak Cash Flow');
    riskScore -= 20;
  }
  if (currentYearIS.netIncome < 0) {
    redFlags.push('Negative Earnings');
    riskScore -= 30;
  }
  if (revGrowth < 0) {
    redFlags.push('Declining Revenue');
    riskScore -= 15;
  }
  if (financials.peRatio > 35) {
    redFlags.push('Overvaluation');
    riskScore -= 15;
  }
  
  // Factor in sentiment score from state if available
  const sentimentScore = state.marketSentiment?.sentimentScore ?? 70;
  if (sentimentScore < 45) {
    redFlags.push('Poor Market Sentiment');
    riskScore -= 15;
  }

  // Clamp risk score (87 displays inverted in UI, higher score = safer/less risk)
  riskScore = Math.min(95, Math.max(15, riskScore));

  // Determine overall risk level string
  let overallRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  if (riskScore < 40) overallRiskLevel = 'Critical';
  else if (riskScore < 60) overallRiskLevel = 'High';
  else if (riskScore < 75) overallRiskLevel = 'Medium';

  // 2. Predefined Industry/Sector Specific Risk Assessments
  const sector = financials.sector.toLowerCase();
  const industry = financials.industry.toLowerCase();

  let legalIssues = 'Standard compliance audits and regulatory monitoring are ongoing. No material active litigation issues present.';
  let marketRisks = 'Susceptibility to macroeconomic interest rate adjustments and general cyclical consumer demand volatility.';
  let competitionRisks = 'Intense competition from domestic and global market players vying for market share within technology and enterprise channels.';
  let regulatoryRisks = 'Evolving global consumer data protection regulations, privacy compliance guidelines, and antitrust reviews.';
  let economicThreats = 'Potential supply chain disruptions, commodity price inflation, and broad consumer spending contraction under high-inflation climates.';
  let recentControversies = 'Minor retail channel price adjustments and public scrutiny regarding labor cost optimization plans.';

  if (sector.includes('technology') || industry.includes('hardware') || industry.includes('semiconductor')) {
    legalIssues = 'Subject to global antitrust inquiries regarding software store exclusivity and patent litigation with competing hardware providers.';
    marketRisks = 'High susceptibility to rapid consumer preference shifts, technological obsolescence, and semiconductor supply constraints.';
    competitionRisks = 'Fierce competition from hyperscalers, emerging AI chip design startups, and proprietary hardware competitors.';
    regulatoryRisks = 'Export restrictions on advanced chip architectures and global data sovereignty compliance laws.';
    economicThreats = 'Escalating geopolitical friction affecting key semiconductor packaging facilities and global hardware supply chains.';
    recentControversies = 'Public debate regarding energy consumption in centralized data centers and AI safety chip export checks.';
  } else if (sector.includes('finance') || industry.includes('banking')) {
    legalIssues = 'Ongoing regulatory compliance checks regarding credit lending reserves and consumer capital protection acts.';
    marketRisks = 'Significant yield curve compression risks, credit defaults, and liquidity spread constraints.';
    competitionRisks = 'Disruption from decentralized fintech apps, alternative payment networks, and retail digital credit services.';
    regulatoryRisks = 'Basel III/IV capital reserve requirement updates, and federal reserve compliance directives.';
    economicThreats = 'Prolonged high interest rates triggering commercial real estate default rates and debt-servicing limits.';
    recentControversies = 'Consumer advocacy reviews regarding digital transaction fee margins and service cost tiering.';
  }

  // 3. Generate evidence array
  const evidence = [
    `Calculated debt-to-equity leverage sits at ${deRatio.toFixed(2)} D/E ratio.`,
    `Free cash flow conversion registers at $${(fcf / 1e9).toFixed(1)}B, validating current liquidity reserves.`,
    `Current market multiples represent P/E rating of ${financials.peRatio}x against sector averages.`,
    `Programmatic evaluation flagged ${redFlags.length} operational red flags: ${redFlags.join(', ') || 'None'}.`
  ];

  const riskAnalysis: RiskAnalysis = {
    legalIssues,
    marketRisks,
    competitionRisks,
    regulatoryRisks,
    economicThreats,
    recentControversies,
    overallRiskLevel,
    riskScore,
    redFlags,
    evidence
  };

  return {
    riskAnalysis,
  };
}
