// ============================================================================
// InvestIQ AI — Financial Data Service
// Generates structured financial data for companies to provide agents with
// concrete evidence. For well-known companies, profiles are tailored;
// for others, realistic data is generated based on industry patterns.
// ============================================================================

import type {
  CompanyFinancials,
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
} from '@/types';

// ─── Known Company Profiles ────────────────────────────────────────────────

interface CompanyProfile {
  ticker: string;
  companyName: string;
  industry: string;
  sector: string;
  marketCap: number;
  peRatio: number;
  pbRatio: number;
  dividendYield: number;
  baseRevenue: number;
  growthRate: number;
  netMarginRange: [number, number];
  debtToEquityBase: number;
  cashFlowPositive: boolean;
}

const KNOWN_COMPANIES: Record<string, CompanyProfile> = {
  apple: {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    industry: 'Consumer Electronics',
    sector: 'Technology',
    marketCap: 3400000000000,
    peRatio: 33.5,
    pbRatio: 52.1,
    dividendYield: 0.44,
    baseRevenue: 383000000000,
    growthRate: 0.05,
    netMarginRange: [0.23, 0.27],
    debtToEquityBase: 1.8,
    cashFlowPositive: true,
  },
  google: {
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    industry: 'Internet Services',
    sector: 'Technology',
    marketCap: 2200000000000,
    peRatio: 26.2,
    pbRatio: 7.1,
    dividendYield: 0.45,
    baseRevenue: 328000000000,
    growthRate: 0.12,
    netMarginRange: [0.22, 0.28],
    debtToEquityBase: 0.1,
    cashFlowPositive: true,
  },
  alphabet: {
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    industry: 'Internet Services',
    sector: 'Technology',
    marketCap: 2200000000000,
    peRatio: 26.2,
    pbRatio: 7.1,
    dividendYield: 0.45,
    baseRevenue: 328000000000,
    growthRate: 0.12,
    netMarginRange: [0.22, 0.28],
    debtToEquityBase: 0.1,
    cashFlowPositive: true,
  },
  microsoft: {
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    industry: 'Software Infrastructure',
    sector: 'Technology',
    marketCap: 3100000000000,
    peRatio: 35.4,
    pbRatio: 12.8,
    dividendYield: 0.72,
    baseRevenue: 236000000000,
    growthRate: 0.15,
    netMarginRange: [0.34, 0.38],
    debtToEquityBase: 0.4,
    cashFlowPositive: true,
  },
  amazon: {
    ticker: 'AMZN',
    companyName: 'Amazon.com Inc.',
    industry: 'E-Commerce & Cloud',
    sector: 'Consumer Cyclical',
    marketCap: 2100000000000,
    peRatio: 61.3,
    pbRatio: 8.4,
    dividendYield: 0,
    baseRevenue: 620000000000,
    growthRate: 0.11,
    netMarginRange: [0.05, 0.08],
    debtToEquityBase: 0.7,
    cashFlowPositive: true,
  },
  tesla: {
    ticker: 'TSLA',
    companyName: 'Tesla Inc.',
    industry: 'Electric Vehicles',
    sector: 'Consumer Cyclical',
    marketCap: 1100000000000,
    peRatio: 95.2,
    pbRatio: 17.3,
    dividendYield: 0,
    baseRevenue: 97000000000,
    growthRate: 0.18,
    netMarginRange: [0.08, 0.15],
    debtToEquityBase: 0.15,
    cashFlowPositive: true,
  },
  nvidia: {
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    industry: 'Semiconductors',
    sector: 'Technology',
    marketCap: 3300000000000,
    peRatio: 58.7,
    pbRatio: 52.6,
    dividendYield: 0.02,
    baseRevenue: 130000000000,
    growthRate: 0.95,
    netMarginRange: [0.50, 0.58],
    debtToEquityBase: 0.4,
    cashFlowPositive: true,
  },
  meta: {
    ticker: 'META',
    companyName: 'Meta Platforms Inc.',
    industry: 'Social Media',
    sector: 'Technology',
    marketCap: 1600000000000,
    peRatio: 28.1,
    pbRatio: 8.9,
    dividendYield: 0.34,
    baseRevenue: 156000000000,
    growthRate: 0.22,
    netMarginRange: [0.28, 0.35],
    debtToEquityBase: 0.3,
    cashFlowPositive: true,
  },
  netflix: {
    ticker: 'NFLX',
    companyName: 'Netflix Inc.',
    industry: 'Entertainment',
    sector: 'Communication Services',
    marketCap: 390000000000,
    peRatio: 44.8,
    pbRatio: 15.2,
    dividendYield: 0,
    baseRevenue: 39000000000,
    growthRate: 0.14,
    netMarginRange: [0.18, 0.25],
    debtToEquityBase: 0.8,
    cashFlowPositive: true,
  },
  jpmorgan: {
    ticker: 'JPM',
    companyName: 'JPMorgan Chase & Co.',
    industry: 'Banking',
    sector: 'Financial Services',
    marketCap: 680000000000,
    peRatio: 12.8,
    pbRatio: 2.1,
    dividendYield: 2.1,
    baseRevenue: 162000000000,
    growthRate: 0.06,
    netMarginRange: [0.30, 0.35],
    debtToEquityBase: 1.3,
    cashFlowPositive: true,
  },
};

// ─── Helper: Seeded Random ─────────────────────────────────────────────────

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

function randomInRange(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min);
}

// ─── Generate Financial Statements ─────────────────────────────────────────

function generateIncomeStatements(
  profile: CompanyProfile,
  rand: () => number,
  years = 5
): IncomeStatement[] {
  const currentYear = new Date().getFullYear();
  const statements: IncomeStatement[] = [];

  for (let i = years - 1; i >= 0; i--) {
    const yearMultiplier = Math.pow(1 + profile.growthRate, years - 1 - i);
    const yearVariance = 1 + randomInRange(rand, -0.03, 0.03);
    const revenue = profile.baseRevenue * yearMultiplier * yearVariance;

    const grossMargin = randomInRange(rand, 0.35, 0.65);
    const costOfRevenue = revenue * (1 - grossMargin);
    const grossProfit = revenue - costOfRevenue;

    const opexRatio = randomInRange(rand, 0.15, 0.30);
    const operatingExpenses = revenue * opexRatio;
    const operatingIncome = grossProfit - operatingExpenses;

    const netMargin = randomInRange(
      rand,
      profile.netMarginRange[0],
      profile.netMarginRange[1]
    );
    const netIncome = revenue * netMargin;

    const sharesOutstanding = profile.marketCap / (profile.peRatio * (netIncome / 1));
    const eps = netIncome / Math.max(sharesOutstanding, 1000000000);

    statements.push({
      year: currentYear - i,
      revenue: Math.round(revenue),
      costOfRevenue: Math.round(costOfRevenue),
      grossProfit: Math.round(grossProfit),
      operatingExpenses: Math.round(operatingExpenses),
      operatingIncome: Math.round(operatingIncome),
      netIncome: Math.round(netIncome),
      eps: parseFloat(eps.toFixed(2)),
    });
  }

  return statements;
}

function generateBalanceSheets(
  profile: CompanyProfile,
  incomeStatements: IncomeStatement[],
  rand: () => number
): BalanceSheet[] {
  return incomeStatements.map((is) => {
    const totalAssets = is.revenue * randomInRange(rand, 1.5, 3.0);
    const totalEquity = totalAssets / (1 + profile.debtToEquityBase * randomInRange(rand, 0.8, 1.2));
    const totalLiabilities = totalAssets - totalEquity;
    const currentAssets = totalAssets * randomInRange(rand, 0.25, 0.45);
    const currentLiabilities = totalLiabilities * randomInRange(rand, 0.3, 0.5);
    const longTermDebt = totalLiabilities * randomInRange(rand, 0.4, 0.7);
    const cashAndEquivalents = currentAssets * randomInRange(rand, 0.3, 0.6);

    return {
      year: is.year,
      totalAssets: Math.round(totalAssets),
      totalLiabilities: Math.round(totalLiabilities),
      totalEquity: Math.round(totalEquity),
      currentAssets: Math.round(currentAssets),
      currentLiabilities: Math.round(currentLiabilities),
      longTermDebt: Math.round(longTermDebt),
      cashAndEquivalents: Math.round(cashAndEquivalents),
    };
  });
}

function generateCashFlowStatements(
  incomeStatements: IncomeStatement[],
  rand: () => number,
  positive: boolean
): CashFlowStatement[] {
  return incomeStatements.map((is) => {
    const depAmort = is.revenue * randomInRange(rand, 0.04, 0.08);
    const wcChange = is.revenue * randomInRange(rand, -0.03, 0.03);
    const operatingCashFlow = is.netIncome + depAmort + wcChange;

    const capex = is.revenue * randomInRange(rand, 0.05, 0.15) * -1;
    const otherInvesting = is.revenue * randomInRange(rand, -0.05, 0.02);
    const investingCashFlow = capex + otherInvesting;

    const financingCashFlow =
      (positive ? -1 : 1) * is.revenue * randomInRange(rand, 0.02, 0.08);

    const freeCashFlow = operatingCashFlow + capex;

    return {
      year: is.year,
      operatingCashFlow: Math.round(operatingCashFlow),
      investingCashFlow: Math.round(investingCashFlow),
      financingCashFlow: Math.round(financingCashFlow),
      freeCashFlow: Math.round(freeCashFlow),
      capitalExpenditures: Math.round(Math.abs(capex)),
    };
  });
}

function generateHeadlines(companyName: string, rand: () => number): string[] {
  const positiveTemplates = [
    `${companyName} Reports Record Quarterly Revenue, Beats Analyst Expectations`,
    `${companyName} Announces Strategic Partnership to Expand Global Reach`,
    `Analysts Upgrade ${companyName} Stock Following Strong Earnings`,
    `${companyName} Launches Innovative Product Line, Driving Market Excitement`,
    `${companyName} Expands Operations Into New International Markets`,
    `${companyName} Stock Surges After Positive Guidance Update`,
    `${companyName} Invests $2B in AI and Automation Technologies`,
    `${companyName} Achieves Milestone: 100 Million Active Users`,
  ];

  const negativeTemplates = [
    `${companyName} Faces Regulatory Scrutiny Over Data Privacy Practices`,
    `${companyName} Reports Slower Growth Amid Economic Uncertainty`,
    `Competition Intensifies: ${companyName} Loses Market Share in Key Segment`,
    `${companyName} Announces Workforce Reduction to Cut Costs`,
    `Analysts Warn of Overvaluation Risks for ${companyName}`,
    `${companyName} Supply Chain Disruptions Impact Quarterly Results`,
  ];

  const neutralTemplates = [
    `${companyName} CEO Discusses Long-Term Strategy at Annual Shareholder Meeting`,
    `${companyName} Maintains Dividend Despite Market Volatility`,
    `Industry Report: ${companyName} Positioned as Market Leader in Its Segment`,
    `${companyName} Files Patent for Next-Generation Technology`,
  ];

  const allTemplates = [...positiveTemplates, ...negativeTemplates, ...neutralTemplates];
  const count = Math.floor(randomInRange(rand, 8, 12));
  const headlines: string[] = [];

  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rand() * allTemplates.length);
    headlines.push(allTemplates[idx]);
  }

  return [...new Set(headlines)].slice(0, 10);
}

// ─── Default Profile Generator for Unknown Companies ───────────────────────

function generateDefaultProfile(companyName: string, rand: () => number): CompanyProfile {
  const sectors = ['Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical', 'Industrials'];
  const industries = ['Software', 'Biotechnology', 'Banking', 'E-Commerce', 'Manufacturing'];

  const sectorIdx = Math.floor(rand() * sectors.length);

  return {
    ticker: companyName.substring(0, 4).toUpperCase(),
    companyName,
    industry: industries[sectorIdx],
    sector: sectors[sectorIdx],
    marketCap: randomInRange(rand, 10000000000, 500000000000),
    peRatio: randomInRange(rand, 10, 60),
    pbRatio: randomInRange(rand, 1, 15),
    dividendYield: randomInRange(rand, 0, 3),
    baseRevenue: randomInRange(rand, 5000000000, 200000000000),
    growthRate: randomInRange(rand, -0.05, 0.25),
    netMarginRange: [randomInRange(rand, 0.03, 0.15), randomInRange(rand, 0.15, 0.30)],
    debtToEquityBase: randomInRange(rand, 0.1, 2.5),
    cashFlowPositive: rand() > 0.2,
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

export function getCompanyFinancials(companyName: string): CompanyFinancials {
  const key = companyName.toLowerCase().replace(/[^a-z]/g, '');
  const rand = seededRandom(key);

  const profile = KNOWN_COMPANIES[key] || generateDefaultProfile(companyName, rand);

  const incomeStatements = generateIncomeStatements(profile, rand);
  const balanceSheets = generateBalanceSheets(profile, incomeStatements, rand);
  const cashFlowStatements = generateCashFlowStatements(
    incomeStatements,
    rand,
    profile.cashFlowPositive
  );
  const recentHeadlines = generateHeadlines(profile.companyName, rand);

  return {
    ticker: profile.ticker,
    companyName: profile.companyName,
    industry: profile.industry,
    sector: profile.sector,
    marketCap: profile.marketCap,
    peRatio: parseFloat(profile.peRatio.toFixed(1)),
    pbRatio: parseFloat(profile.pbRatio.toFixed(1)),
    dividendYield: parseFloat(profile.dividendYield.toFixed(2)),
    incomeStatements,
    balanceSheets,
    cashFlowStatements,
    recentHeadlines,
  };
}

export function formatFinancialsForPrompt(financials: CompanyFinancials): string {
  const { incomeStatements, balanceSheets, cashFlowStatements } = financials;

  let prompt = `== Company: ${financials.companyName} (${financials.ticker}) ==\n`;
  prompt += `Industry: ${financials.industry} | Sector: ${financials.sector}\n`;
  prompt += `Market Cap: ${formatCurrency(financials.marketCap)}\n`;
  prompt += `P/E Ratio: ${financials.peRatio} | P/B Ratio: ${financials.pbRatio} | Dividend Yield: ${financials.dividendYield}%\n\n`;

  prompt += `== Income Statements (5Y) ==\n`;
  for (const is of incomeStatements) {
    prompt += `${is.year}: Revenue ${formatCurrency(is.revenue)}, Gross Profit ${formatCurrency(is.grossProfit)}, Net Income ${formatCurrency(is.netIncome)}, EPS $${is.eps}\n`;
  }

  prompt += `\n== Balance Sheets (5Y) ==\n`;
  for (const bs of balanceSheets) {
    prompt += `${bs.year}: Assets ${formatCurrency(bs.totalAssets)}, Liabilities ${formatCurrency(bs.totalLiabilities)}, Equity ${formatCurrency(bs.totalEquity)}, LT Debt ${formatCurrency(bs.longTermDebt)}, Cash ${formatCurrency(bs.cashAndEquivalents)}\n`;
  }

  prompt += `\n== Cash Flow Statements (5Y) ==\n`;
  for (const cf of cashFlowStatements) {
    prompt += `${cf.year}: Operating CF ${formatCurrency(cf.operatingCashFlow)}, Free CF ${formatCurrency(cf.freeCashFlow)}, CapEx ${formatCurrency(cf.capitalExpenditures)}\n`;
  }

  prompt += `\n== Recent Headlines ==\n`;
  for (const h of financials.recentHeadlines) {
    prompt += `- ${h}\n`;
  }

  return prompt;
}
