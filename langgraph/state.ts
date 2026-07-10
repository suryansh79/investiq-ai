// ============================================================================
// InvestIQ AI — LangGraph State Definition
// Defines the shared state that flows through all agent nodes.
// ============================================================================

import { Annotation } from '@langchain/langgraph';
import type {
  CompanyIntelligence,
  FinancialHealthAnalysis,
  RiskAnalysis,
  MarketSentimentAnalysis,
  DebateOutput,
  DecisionAnalysis,
  TimelineStep,
  SimulatorSettings,
  InvestmentCommittee,
} from '@/types';

// Shared graph state annotation
export const ResearchStateAnnotation = Annotation.Root({
  companyName: Annotation<string>,
  simulatorSettings: Annotation<SimulatorSettings>,
  financialContext: Annotation<string>,
  companyIntelligence: Annotation<CompanyIntelligence | undefined>,
  financialHealth: Annotation<FinancialHealthAnalysis | undefined>,
  riskAnalysis: Annotation<RiskAnalysis | undefined>,
  marketSentiment: Annotation<MarketSentimentAnalysis | undefined>,
  debate: Annotation<DebateOutput | undefined>,
  committee: Annotation<InvestmentCommittee | undefined>,
  decision: Annotation<DecisionAnalysis | undefined>,
  timeline: Annotation<TimelineStep[]>,
  error: Annotation<string | undefined>,
});

export type ResearchGraphState = typeof ResearchStateAnnotation.State;
