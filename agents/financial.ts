// ============================================================================
// InvestIQ AI — Programmatic Financial Health Agent (0 Gemini Calls)
// Computes financial ratios, trends, growth, and scores mathematically.
// ============================================================================

import type { ResearchGraphState } from '@/langgraph/state';
import type { FinancialHealthAnalysis } from '@/types';
import { getCompanyFinancials } from '@/lib/services/financialData';

export async function financialHealthAgent(
  state: ResearchGraphState
): Promise<Partial<ResearchGraphState>> {
  // Fetch raw structured financial statements
  const financials = getCompanyFinancials(state.companyName);
  const { incomeStatements, balanceSheets, cashFlowStatements } = financials;

  const currentYearIS = incomeStatements[incomeStatements.length - 1];
  const prevYearIS = incomeStatements[incomeStatements.length - 2];
  const currentYearBS = balanceSheets[balanceSheets.length - 1];
  const currentYearCF = cashFlowStatements[cashFlowStatements.length - 1];

  // 1. Math calculations
  const revGrowth = ((currentYearIS.revenue - prevYearIS.revenue) / prevYearIS.revenue) * 100;
  const netMargin = (currentYearIS.netIncome / currentYearIS.revenue) * 100;
  const grossMargin = (currentYearIS.grossProfit / currentYearIS.revenue) * 100;
  const operatingMargin = (currentYearIS.operatingIncome / currentYearIS.revenue) * 100;
  const deRatio = currentYearBS.totalLiabilities / currentYearBS.totalEquity;

  const revGrowthStr = `${revGrowth > 0 ? '+' : ''}${revGrowth.toFixed(1)}%`;
  const netMarginStr = `${netMargin.toFixed(1)}%`;
  const grossMarginStr = `${grossMargin.toFixed(1)}%`;
  const operatingMarginStr = `${operatingMargin.toFixed(1)}%`;
  const deRatioStr = deRatio.toFixed(2);

  // 2. Compute 5-year Revenue Trend
  const initialRevenue = incomeStatements[0].revenue;
  const finalRevenue = currentYearIS.revenue;
  const totalRevGrowth5Yr = ((finalRevenue - initialRevenue) / initialRevenue) * 100;
  const revenueTrend = `Revenue has grown from $${(initialRevenue / 1e9).toFixed(1)}B to $${(finalRevenue / 1e9).toFixed(1)}B over 5 years, representing a total expansion of ${totalRevGrowth5Yr.toFixed(1)}%.`;

  // 3. Programmatic Financial Health Score
  let score = 50; // Base score

  // Net Margin contribution
  if (netMargin > 20) score += 15;
  else if (netMargin > 10) score += 10;
  else if (netMargin < 2) score -= 15;

  // YoY growth contribution
  if (revGrowth > 12) score += 15;
  else if (revGrowth > 5) score += 10;
  else if (revGrowth < 0) score -= 10;

  // Debt-to-Equity contribution
  if (deRatio < 0.6) score += 15;
  else if (deRatio < 1.2) score += 5;
  else if (deRatio > 2.0) score -= 15;

  // FCF generation contribution
  if (currentYearCF.freeCashFlow > 0) score += 10;
  else score -= 10;

  const financialHealthScore = Math.min(98, Math.max(10, score));

  // 4. Generate structured evidence
  const evidence = [
    `Revenue grew YoY from $${(prevYearIS.revenue / 1e9).toFixed(1)}B to $${(currentYearIS.revenue / 1e9).toFixed(1)}B (${revGrowthStr}).`,
    `Operating profit margin calculated at ${operatingMarginStr} with net profit margin of ${netMarginStr}.`,
    `Balance sheet leverage shows total debt-to-equity ratio of ${deRatioStr}.`,
    `Free cash flow conversion represents $${(currentYearCF.freeCashFlow / 1e9).toFixed(1)}B generated from operations.`
  ];

  // 5. Construct analysis object
  const financialHealth: FinancialHealthAnalysis = {
    revenueTrend,
    revenueGrowthYoY: `YoY Revenue growth calculated at ${revGrowthStr} for the recent fiscal year.`,
    profitability: `Strong operating structure verified with a gross margin of ${grossMarginStr} and net margin of ${netMarginStr}.`,
    netMargin: netMarginStr,
    grossMargin: grossMarginStr,
    operatingMargin: operatingMarginStr,
    debtLevel: deRatio > 1.5 ? 'Leveraged balance sheet backing growth operations.' : 'Conservative capital structure with manageable leverage.',
    debtToEquity: deRatioStr,
    cashFlow: `Operating cash flow stands at $${(currentYearCF.operatingCashFlow / 1e9).toFixed(1)}B, showing strong cash conversion.`,
    freeCashFlow: `Free Cash Flow of $${(currentYearCF.freeCashFlow / 1e9).toFixed(1)}B represents solid liquidity generation.`,
    valuationSummary: `Valuation multiples sit at P/E of ${financials.peRatio}x and P/B of ${financials.pbRatio}x.`,
    peRatio: `${financials.peRatio}x`,
    pbRatio: `${financials.pbRatio}x`,
    growthOutlook: revGrowth > 10 ? 'Robust secular tailwinds supporting double digit revenue growth.' : 'Stable single digit organic growth profile.',
    financialHealthScore,
    evidence
  };

  return {
    financialHealth,
  };
}
