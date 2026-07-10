'use client';

import { motion } from 'framer-motion';
import type { AnalysisResult, SimulatorSettings } from '@/types';
import ScoreGauge from './ScoreGauge';
import ScoreBreakdown from './ScoreBreakdown';
import RecommendationBadge from './RecommendationBadge';
import ConfidenceMeter from './ConfidenceMeter';
import Timeline from './Timeline';
import ThesisCards from './ThesisCards';
import PortfolioFit from './PortfolioFit';
import RedFlags from './RedFlags';
import EvidencePanel from './EvidencePanel';
import DebatePanel from './DebatePanel';
import Simulator from './Simulator';
import { CommitteePanel } from './CommitteePanel';
import type { TimelineStep } from '@/types';

interface DashboardProps {
  result: AnalysisResult;
  timeline: TimelineStep[];
  simulatorSettings: SimulatorSettings;
  onSimulatorChange: (settings: SimulatorSettings) => void;
  onRerun: () => void;
  isLoading: boolean;
}

export default function Dashboard({
  result,
  timeline,
  simulatorSettings,
  onSimulatorChange,
  onRerun,
  isLoading,
}: DashboardProps) {
  const { decision, debate, riskAnalysis } = result;

  // Collect all evidence from all agents
  const allEvidence = [
    ...(result.financialHealth.evidence || []),
    ...(result.riskAnalysis.evidence || []),
    ...(result.marketSentiment.evidence || []),
    ...(decision.evidence || []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="space-y-8"
    >
      {/* Executive Summary */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">
          Executive Summary
        </h3>
        <p className="text-sm text-white/70 leading-relaxed">{decision.executiveSummary}</p>
      </div>

      {/* Top Row: Recommendation + Score + Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RecommendationBadge
          recommendation={decision.recommendation}
          companyName={result.companyIntelligence.companyName}
        />
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex items-center justify-center">
          <ScoreGauge score={decision.overallScore} />
        </div>
        <ConfidenceMeter
          percentage={decision.confidencePercentage}
          level={decision.confidenceLevel}
          explanation={decision.confidenceExplanation}
        />
      </div>

      {/* Score Breakdown + Timeline + Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ScoreBreakdown decision={decision} />
        <Timeline steps={timeline} />
        <Simulator
          settings={simulatorSettings}
          onSettingsChange={onSimulatorChange}
          onRerun={onRerun}
          isLoading={isLoading}
        />
      </div>

      {/* Key Strengths & Major Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl p-6">
          <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">
            Key Strengths
          </h3>
          <div className="space-y-2">
            {decision.keyStrengths.map((strength, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center">✓</span>
                <p className="text-sm text-white/70">{strength}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl p-6">
          <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4">
            Major Risks
          </h3>
          <div className="space-y-2">
            {decision.majorRisks.map((risk, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center">!</span>
                <p className="text-sm text-white/70">{risk}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Investment Thesis Cards */}
      <ThesisCards debate={debate} />

      {/* AI Investment Committee */}
      <CommitteePanel committee={result.committee} />

      {/* Portfolio Fit + Red Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioFit profiles={decision.portfolioFit} />
        <RedFlags flags={riskAnalysis.redFlags} />
      </div>

      {/* AI Debate Mode */}
      <DebatePanel debate={debate} />

      {/* Evidence Panel */}
      <EvidencePanel evidence={allEvidence} />

      {/* Complete Reasoning */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">
          Complete Reasoning
        </h3>
        <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{decision.completeReasoning}</p>
      </div>
    </motion.div>
  );
}
