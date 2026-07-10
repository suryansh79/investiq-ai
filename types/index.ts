// ============================================================================
// InvestIQ AI — Shared TypeScript Types
// ============================================================================

// ─── Enums & Literals ───────────────────────────────────────────────────────

export type Recommendation = 'BUY' | 'WATCH' | 'PASS';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type RiskAppetite = 'Conservative' | 'Moderate' | 'Aggressive';
export type InvestmentHorizon = '1 Year' | '3 Years' | '5 Years' | '10 Years';

export type InvestorProfile =
  | 'Long-Term Investors'
  | 'Growth Investors'
  | 'Value Investors'
  | 'Dividend Investors'
  | 'High-Risk Investors';

export type RedFlagType =
  | 'High Debt'
  | 'Weak Cash Flow'
  | 'Negative Earnings'
  | 'Legal Issues'
  | 'Poor Market Sentiment'
  | 'Declining Revenue'
  | 'Overvaluation';

// ─── Timeline ───────────────────────────────────────────────────────────────

export interface TimelineStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  timestamp?: number;
}

// ─── Company Intelligence Agent Output ──────────────────────────────────────

export interface CompanyIntelligence {
  companyName: string;
  ticker: string;
  industry: string;
  sector: string;
  overview: string;
  businessModel: string;
  revenueSources: string[];
  competitiveMoat: string;
  leadership: string;
  recentNews: string[];
  founded: string;
  headquarters: string;
  employees: string;
  marketCap: string;
}

// ─── Financial Health Agent Output ──────────────────────────────────────────

export interface FinancialHealthAnalysis {
  revenueTrend: string;
  revenueGrowthYoY: string;
  profitability: string;
  netMargin: string;
  grossMargin: string;
  operatingMargin: string;
  debtLevel: string;
  debtToEquity: string;
  cashFlow: string;
  freeCashFlow: string;
  valuationSummary: string;
  peRatio: string;
  pbRatio: string;
  growthOutlook: string;
  financialHealthScore: number; // 0-100
  evidence: string[];
}

// ─── Risk Analysis Agent Output ─────────────────────────────────────────────

export interface RiskAnalysis {
  legalIssues: string;
  marketRisks: string;
  competitionRisks: string;
  regulatoryRisks: string;
  economicThreats: string;
  recentControversies: string;
  overallRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskScore: number; // 0-100, where 100 = lowest risk (inverted for display)
  redFlags: RedFlagType[];
  evidence: string[];
}

// ─── Market Sentiment Agent Output ──────────────────────────────────────────

export interface MarketSentimentAnalysis {
  newsSentiment: string;
  marketSentiment: string;
  analystSentiment: string;
  socialSentiment: string;
  bullishScore: number; // 0-100
  bearishScore: number; // 0-100
  overallSentiment: 'Bullish' | 'Neutral' | 'Bearish';
  sentimentScore: number; // 0-100
  evidence: string[];
}

// ─── Debate Agent Outputs ───────────────────────────────────────────────────

export interface DebateArgument {
  title: string;
  points: string[];
  conclusion: string;
}

export interface DebateOutput {
  bullCase: DebateArgument;
  bearCase: DebateArgument;
}

// ─── Decision Agent Output ──────────────────────────────────────────────────

export interface DecisionAnalysis {
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
  overallScore: number; // 0-100
  financialHealthScore: number;
  growthScore: number;
  riskScore: number;
  sentimentScore: number;
  valuationScore: number;
  evidence: string[];
}

// ─── Simulator Settings ─────────────────────────────────────────────────────

export interface SimulatorSettings {
  riskAppetite: RiskAppetite;
  investmentHorizon: InvestmentHorizon;
  enableDebate?: boolean;
}

// ─── LangGraph Shared State ─────────────────────────────────────────────────

export interface ResearchState {
  companyName: string;
  simulatorSettings: SimulatorSettings;
  companyIntelligence?: CompanyIntelligence;
  financialHealth?: FinancialHealthAnalysis;
  riskAnalysis?: RiskAnalysis;
  marketSentiment?: MarketSentimentAnalysis;
  debate?: DebateOutput;
  decision?: DecisionAnalysis;
  committee?: InvestmentCommittee;
  cacheStatus?: CacheStatus;
  timeline: TimelineStep[];
  error?: string;
}

// ─── SSE Event Types ────────────────────────────────────────────────────────

export type SSEEventType =
  | 'timeline'
  | 'intelligence'
  | 'financial'
  | 'risk'
  | 'sentiment'
  | 'debate'
  | 'decision'
  | 'error'
  | 'complete';

export interface SSEEvent {
  type: SSEEventType;
  data: unknown;
}

// ─── Financial Data Service Types ───────────────────────────────────────────

export interface IncomeStatement {
  year: number;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
}

export interface BalanceSheet {
  year: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  currentAssets: number;
  currentLiabilities: number;
  longTermDebt: number;
  cashAndEquivalents: number;
}

export interface CashFlowStatement {
  year: number;
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  freeCashFlow: number;
  capitalExpenditures: number;
}

export interface CompanyFinancials {
  ticker: string;
  companyName: string;
  industry: string;
  sector: string;
  marketCap: number;
  peRatio: number;
  pbRatio: number;
  dividendYield: number;
  incomeStatements: IncomeStatement[];
  balanceSheets: BalanceSheet[];
  cashFlowStatements: CashFlowStatement[];
  recentHeadlines: string[];
}

// ─── UI State ───────────────────────────────────────────────────────────────

export interface CommitteePersona {
  recommendation: Recommendation;
  confidence: number;
  reasons: string[];
}

export interface CommitteeVoteCount {
  BUY: number;
  WATCH: number;
  PASS: number;
}

export interface CommitteeDecision {
  recommendation: Recommendation;
  voteCount: CommitteeVoteCount;
  confidence: number;
  summary: string;
  dominantPersona: string;
}

export interface InvestmentCommittee {
  growthInvestor: CommitteePersona;
  valueInvestor: CommitteePersona;
  riskAnalyst: CommitteePersona;
  committeeDecision: CommitteeDecision;
}

export interface CacheStatus {
  source: 'live' | 'cache';
  createdAt: string;
  ageText: string;
  latencyMs: number;
}

export interface AnalysisResult {
  companyIntelligence: CompanyIntelligence;
  financialHealth: FinancialHealthAnalysis;
  riskAnalysis: RiskAnalysis;
  marketSentiment: MarketSentimentAnalysis;
  debate: DebateOutput;
  decision: DecisionAnalysis;
  committee: InvestmentCommittee;
  cacheStatus?: CacheStatus;
}
