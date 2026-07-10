// ============================================================================
// InvestIQ AI — Company Comparison Dashboard
// Renders the side-by-side comparative dashboard, tables, and AI verdict.
// ============================================================================

'use client';

import { motion } from 'framer-motion';
import { 
  ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, 
  HelpCircle, Sparkles, TrendingUp, BarChart3, MessageSquare, 
  ThumbsUp, ThumbsDown 
} from 'lucide-react';
import type { AnalysisResult, SimulatorSettings } from '@/types';
import Simulator from './Simulator';

interface ComparisonDashboardProps {
  resultA: AnalysisResult;
  resultB: AnalysisResult;
  verdict: {
    chosenCompany: string;
    verdictReasoning: string[];
  } | null;
  isLoadingVerdict: boolean;
  simulatorSettings: SimulatorSettings;
  onSimulatorChange: (settings: SimulatorSettings) => void;
  onRerun: () => void;
  isLoading: boolean;
}

export default function ComparisonDashboard({
  resultA,
  resultB,
  verdict,
  isLoadingVerdict,
  simulatorSettings,
  onSimulatorChange,
  onRerun,
  isLoading,
}: ComparisonDashboardProps) {
  const { companyIntelligence: ciA, decision: decA, financialHealth: finA, riskAnalysis: riskA } = resultA;
  const { companyIntelligence: ciB, decision: decB, financialHealth: finB, riskAnalysis: riskB } = resultB;

  // 1. Helper function for recommendation badge colors
  const getRecStyles = (rec: string) => {
    switch (rec) {
      case 'BUY':
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400';
      case 'WATCH':
        return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400';
      default:
        return 'border-red-500/20 bg-red-500/10 text-red-400';
    }
  };

  // 2. Scores list to compare
  const scoreMetrics = [
    { key: 'financialHealthScore', label: 'Financial Health' },
    { key: 'growthScore', label: 'Growth Status' },
    { key: 'riskScore', label: 'Risk Protection' },
    { key: 'sentimentScore', label: 'Market Sentiment' },
    { key: 'valuationScore', label: 'Valuation Discount' },
    { key: 'overallScore', label: 'Overall Investment Score' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="space-y-8"
    >
      {/* 1. EXECUTIVE COMPARISON HEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 items-center">
        {/* Company A Card */}
        <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center">
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest block mb-1">Company A</span>
          <h3 className="text-2xl font-black text-white truncate">{ciA.companyName}</h3>
          <span className="text-xs font-mono text-white/40 block mt-0.5">{ciA.ticker} | {ciA.industry}</span>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm uppercase tracking-wide shadow-inner transition-all duration-300 transform hover:scale-105 cursor-default select-none border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
            {ciA.marketCap} Cap
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
            <div>
              <span className="text-[10px] text-white/30 uppercase block font-mono">Recommendation</span>
              <span className={`inline-block mt-1 px-3 py-1 rounded-lg border text-xs font-bold ${getRecStyles(decA.recommendation)}`}>
                {decA.recommendation}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-white/30 uppercase block font-mono">Confidence</span>
              <span className="text-base font-bold text-white mt-1 block">{decA.confidencePercentage}%</span>
            </div>
          </div>
        </div>

        {/* VS Separator */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/25">
            VS
          </div>
          <span className="text-[10px] text-white/20 uppercase tracking-widest font-mono">Comparison</span>
        </div>

        {/* Company B Card */}
        <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center">
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest block mb-1">Company B</span>
          <h3 className="text-2xl font-black text-white truncate">{ciB.companyName}</h3>
          <span className="text-xs font-mono text-white/40 block mt-0.5">{ciB.ticker} | {ciB.industry}</span>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm uppercase tracking-wide shadow-inner transition-all duration-300 transform hover:scale-105 cursor-default select-none border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
            {ciB.marketCap} Cap
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
            <div>
              <span className="text-[10px] text-white/30 uppercase block font-mono">Recommendation</span>
              <span className={`inline-block mt-1 px-3 py-1 rounded-lg border text-xs font-bold ${getRecStyles(decB.recommendation)}`}>
                {decB.recommendation}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-white/30 uppercase block font-mono">Confidence</span>
              <span className="text-base font-bold text-white mt-1 block">{decB.confidencePercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AI SCORE COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compare Scores Card */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                AI Rating Matchup
              </h3>
              <p className="text-xs text-white/40">Attributes scored out of 100</p>
            </div>
          </div>

          <div className="space-y-4">
            {scoreMetrics.map((metric) => {
              const scoreA = (decA as any)[metric.key] || 0;
              const scoreB = (decB as any)[metric.key] || 0;
              const isOverall = metric.key === 'overallScore';
              
              return (
                <div key={metric.key} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-white/60">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-400 font-bold">{ciA.ticker}: {scoreA}</span>
                      <span className="text-white/20">/</span>
                      <span className="text-cyan-400 font-bold">{ciB.ticker}: {scoreB}</span>
                    </div>
                  </div>
                  {/* Progress bar splits */}
                  <div className="h-2 w-full rounded-full bg-white/5 flex overflow-hidden border border-white/5">
                    {/* Left bar (Company A) */}
                    <div className="w-1/2 flex justify-end">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${scoreA}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full rounded-l-full ${isOverall ? 'bg-indigo-500' : 'bg-indigo-500/60'}`}
                      />
                    </div>
                    {/* Right bar (Company B) */}
                    <div className="w-1/2 flex justify-start">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${scoreB}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full rounded-r-full ${isOverall ? 'bg-cyan-500' : 'bg-cyan-500/60'}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simulator Control */}
        <div className="lg:col-span-1">
          <Simulator
            settings={simulatorSettings}
            onSettingsChange={onSimulatorChange}
            onRerun={onRerun}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* 3. AI FINAL VERDICT */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Sparkles className="w-48 h-48 text-indigo-400" />
        </div>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-indigo-500/20">
            <CheckCircle2 className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider font-mono">
              AI Synthesis Final Verdict
            </h3>
            <p className="text-xs text-white/40 mt-0.5">Which asset yields the higher risk-adjusted reward?</p>
          </div>
        </div>

        {isLoadingVerdict ? (
          <div className="space-y-4 py-4 animate-pulse">
            <div className="h-6 w-1/3 bg-white/10 rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-white/5 rounded-full" />
              <div className="h-4 w-4/5 bg-white/5 rounded-full" />
              <div className="h-4 w-3/4 bg-white/5 rounded-full" />
            </div>
          </div>
        ) : verdict ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Optimal Investment Select</span>
                <h4 className="text-xl font-black text-white mt-1">{verdict.chosenCompany}</h4>
              </div>
              <div className="px-3.5 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> HIGHER EXPECTED RUN
              </div>
            </div>
            <div className="space-y-3">
              {verdict.verdictReasoning.map((reason, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-white/70 mt-0.5 leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/40 py-4">Trigger analysis rerun to compile comparisons verdict.</p>
        )}
      </div>

      {/* 4. SIDE-BY-SIDE METRICS COMPARISON TABLE */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
              Side-by-Side Financial & Risk Ratios
            </h3>
            <p className="text-xs text-white/40">Calculated mathematically and synthesized directly from statements</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="px-6 py-4 text-xs font-mono uppercase tracking-widest text-white/40">Financial Multiples / Metrics</th>
                <th className="px-6 py-4 text-sm font-black text-indigo-400">{ciA.companyName} ({ciA.ticker})</th>
                <th className="px-6 py-4 text-sm font-black text-cyan-400">{ciB.companyName} ({ciB.ticker})</th>
              </tr>
            </thead>
            <tbody>
              {/* Market Cap */}
              <tr className="border-b border-white/5 hover:bg-white/1 transition-colors">
                <td className="px-6 py-3.5 text-xs text-white/60 font-mono">Market Cap</td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">{ciA.marketCap}</td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">{ciB.marketCap}</td>
              </tr>
              {/* Revenue */}
              <tr className="border-b border-white/5 hover:bg-white/1 transition-colors">
                <td className="px-6 py-3.5 text-xs text-white/60 font-mono">Annual Revenue</td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">
                  ${(resultA.financialHealth.revenueTrend.includes('$') 
                    ? resultA.financialHealth.revenueTrend.split('to $')[1]?.split('B')[0] 
                    : '') || 'N/A'}B
                </td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">
                  ${(resultB.financialHealth.revenueTrend.includes('$') 
                    ? resultB.financialHealth.revenueTrend.split('to $')[1]?.split('B')[0] 
                    : '') || 'N/A'}B
                </td>
              </tr>
              {/* Net Margin */}
              <tr className="border-b border-white/5 hover:bg-white/1 transition-colors">
                <td className="px-6 py-3.5 text-xs text-white/60 font-mono">Net Profit Margin</td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">{finA.netMargin}</td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">{finB.netMargin}</td>
              </tr>
              {/* Debt-to-Equity */}
              <tr className="border-b border-white/5 hover:bg-white/1 transition-colors">
                <td className="px-6 py-3.5 text-xs text-white/60 font-mono">Debt-to-Equity (Liabilities/Equity)</td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">{finA.debtToEquity} D/E</td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">{finB.debtToEquity} D/E</td>
              </tr>
              {/* Cash Flow */}
              <tr className="border-b border-white/5 hover:bg-white/1 transition-colors">
                <td className="px-6 py-3.5 text-xs text-white/60 font-mono">Free Cash Flow</td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">{finA.freeCashFlow.split(' ')[0]}</td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">{finB.freeCashFlow.split(' ')[0]}</td>
              </tr>
              {/* P/E Ratio */}
              <tr className="border-b border-white/5 hover:bg-white/1 transition-colors">
                <td className="px-6 py-3.5 text-xs text-white/60 font-mono">P/E Ratio (Multiple)</td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">{finA.peRatio}</td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">{finB.peRatio}</td>
              </tr>
              {/* Growth YoY */}
              <tr className="border-b border-white/5 hover:bg-white/1 transition-colors">
                <td className="px-6 py-3.5 text-xs text-white/60 font-mono">YoY Revenue Growth</td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">
                  {finA.revenueGrowthYoY.includes('%') ? finA.revenueGrowthYoY.split('calculated at ')[1]?.split(' for')[0] : 'N/A'}
                </td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">
                  {finB.revenueGrowthYoY.includes('%') ? finB.revenueGrowthYoY.split('calculated at ')[1]?.split(' for')[0] : 'N/A'}
                </td>
              </tr>
              {/* Risk Level */}
              <tr className="border-b border-white/5 hover:bg-white/1 transition-colors">
                <td className="px-6 py-3.5 text-xs text-white/60 font-mono">Risk Profile Rating</td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">{riskA.overallRiskLevel} (Score: {riskA.riskScore})</td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">{riskB.overallRiskLevel} (Score: {riskB.riskScore})</td>
              </tr>
              {/* Confidence */}
              <tr className="border-b border-white/5 hover:bg-white/1 transition-colors">
                <td className="px-6 py-3.5 text-xs text-white/60 font-mono">Analysis Confidence</td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">{decA.confidencePercentage}% ({decA.confidenceLevel})</td>
                <td className="px-6 py-3.5 text-sm text-white/85 font-semibold">{decB.confidencePercentage}% ({decB.confidenceLevel})</td>
              </tr>
              {/* Recommendation */}
              <tr className="hover:bg-white/1 transition-colors">
                <td className="px-6 py-3.5 text-xs text-white/60 font-mono">Final Decision</td>
                <td className="px-6 py-3.5 text-sm">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getRecStyles(decA.recommendation)}`}>
                    {decA.recommendation}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-sm">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getRecStyles(decB.recommendation)}`}>
                    {decB.recommendation}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. BULL VS BEAR SUMMARY SIDE-BY-SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company A Bull/Bear */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-6">
          <div className="border-b border-white/5 pb-4">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">Company A Details</span>
            <h4 className="text-lg font-black text-white">{ciA.companyName}</h4>
          </div>
          
          <div className="space-y-4">
            {/* Strengths */}
            <div>
              <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <ThumbsUp className="w-3.5 h-3.5" /> Key Strengths
              </h5>
              <ul className="space-y-1 list-disc list-inside text-xs text-white/60 leading-relaxed">
                {decA.keyStrengths.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            {/* Weaknesses */}
            <div>
              <h5 className="text-xs font-bold text-red-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <ThumbsDown className="w-3.5 h-3.5" /> Core Weaknesses / Risks
              </h5>
              <ul className="space-y-1 list-disc list-inside text-xs text-white/60 leading-relaxed">
                {decA.majorRisks.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* Company B Bull/Bear */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-6">
          <div className="border-b border-white/5 pb-4">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest font-mono">Company B Details</span>
            <h4 className="text-lg font-black text-white">{ciB.companyName}</h4>
          </div>

          <div className="space-y-4">
            {/* Strengths */}
            <div>
              <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <ThumbsUp className="w-3.5 h-3.5" /> Key Strengths
              </h5>
              <ul className="space-y-1 list-disc list-inside text-xs text-white/60 leading-relaxed">
                {decB.keyStrengths.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            {/* Weaknesses */}
            <div>
              <h5 className="text-xs font-bold text-red-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <ThumbsDown className="w-3.5 h-3.5" /> Core Weaknesses / Risks
              </h5>
              <ul className="space-y-1 list-disc list-inside text-xs text-white/60 leading-relaxed">
                {decB.majorRisks.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
