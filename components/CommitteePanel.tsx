// ============================================================================
// InvestIQ AI — AI Investment Committee Panel (UI Component)
// Renders three expert persona cards and a consolidated vote decision card.
// ============================================================================

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Landmark, 
  ShieldAlert, 
  Users, 
  UserCheck,
  CheckCircle,
  HelpCircle,
  AlertOctagon
} from 'lucide-react';
import type { InvestmentCommittee, CommitteePersona, Recommendation } from '@/types';

interface CommitteePanelProps {
  committee: InvestmentCommittee | undefined;
}

export function CommitteePanel({ committee }: CommitteePanelProps) {
  if (!committee) return null;

  const { growthInvestor, valueInvestor, riskAnalyst, committeeDecision } = committee;

  const personas = [
    {
      title: 'Growth Investor',
      icon: TrendingUp,
      data: growthInvestor,
      color: 'from-blue-500/10 to-indigo-500/10 border-indigo-500/20',
      iconColor: 'text-indigo-400 bg-indigo-500/10',
      accentColor: 'indigo'
    },
    {
      title: 'Value Investor',
      icon: Landmark,
      data: valueInvestor,
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
      iconColor: 'text-emerald-400 bg-emerald-500/10',
      accentColor: 'emerald'
    },
    {
      title: 'Risk Analyst',
      icon: ShieldAlert,
      data: riskAnalyst,
      color: 'from-rose-500/10 to-orange-500/10 border-rose-500/20',
      iconColor: 'text-rose-400 bg-rose-500/10',
      accentColor: 'rose'
    }
  ];

  // Helper to color-code recommendation badges
  const getRecBadge = (rec: Recommendation) => {
    switch (rec) {
      case 'BUY':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" /> BUY
          </span>
        );
      case 'WATCH':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <HelpCircle className="w-3.5 h-3.5" /> WATCH
          </span>
        );
      case 'PASS':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertOctagon className="w-3.5 h-3.5" /> PASS
          </span>
        );
      default:
        return null;
    }
  };

  const getVoteColor = (key: string) => {
    if (key === 'BUY') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (key === 'WATCH') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 80 } }
  };

  return (
    <div className="space-y-8 mt-12">
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <Users className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">AI Investment Committee</h2>
          <p className="text-xs text-white/40">Tri-perspective expert consensus report</p>
        </div>
      </div>

      {/* Grid of Expert personas */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {personas.map((persona, index) => {
          const Icon = persona.icon;
          return (
            <motion.div
              key={persona.title}
              variants={itemVariants}
              className={`rounded-2xl border bg-gradient-to-b ${persona.color} p-6 relative overflow-hidden flex flex-col justify-between min-h-[320px] backdrop-blur-xl`}
            >
              {/* Top Row: Title + Rec */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${persona.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white/90">{persona.title}</h3>
                  </div>
                  {getRecBadge(persona.data.recommendation)}
                </div>

                {/* Progress Bar (Confidence) */}
                <div className="mb-6 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40 font-mono">Confidence Level</span>
                    <span className="font-semibold text-white/80 font-mono">{persona.data.confidence}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${persona.data.confidence}%` }}
                      transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${
                        persona.accentColor === 'indigo' ? 'from-blue-500 to-indigo-500' :
                        persona.accentColor === 'emerald' ? 'from-emerald-500 to-teal-500' :
                        'from-rose-500 to-orange-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Reasons List */}
                <ul className="space-y-3">
                  {persona.data.reasons.map((reason, rIdx) => (
                    <li key={rIdx} className="flex gap-2 text-xs text-white/70 leading-relaxed items-start">
                      <span className="text-white/30 font-mono mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring' as const, stiffness: 60 }}
        className="rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-950/15 via-black/30 to-indigo-950/10 p-6 backdrop-blur-2xl"
      >
        <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4 font-mono">
          Final Committee Verdict
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Verdict and Votes */}
          <div className="lg:col-span-1 space-y-5">
            <div>
              <span className="text-[10px] text-white/30 font-mono uppercase block mb-1">CONSOLIDATED DECISION</span>
              <div className="flex items-center gap-3">
                {getRecBadge(committeeDecision.recommendation)}
                <span className="text-sm font-bold text-white/70 font-mono">
                  {committeeDecision.voteCount[committeeDecision.recommendation]} / 3 Votes
                </span>
              </div>
            </div>

            {/* Voting Distribution Map */}
            <div className="space-y-2">
              <span className="text-[10px] text-white/30 font-mono uppercase block">VOTE DISTRIBUTION</span>
              <div className="flex gap-3">
                {(['BUY', 'WATCH', 'PASS'] as Recommendation[]).map((vKey) => {
                  const votes = committeeDecision.voteCount[vKey] || 0;
                  return (
                    <motion.div 
                      key={vKey} 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.7 + (vKey === 'BUY' ? 0 : vKey === 'WATCH' ? 0.1 : 0.2) }}
                      className={`flex-1 py-2 px-3 rounded-lg border text-center font-mono ${getVoteColor(vKey)}`}
                    >
                      <div className="text-[10px] text-white/40 mb-0.5">{vKey}</div>
                      <div className="text-sm font-bold">{votes} {votes === 1 ? 'Vote' : 'Votes'}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Synthesis Summary */}
          <div className="lg:col-span-2 space-y-4 lg:border-l lg:border-white/5 lg:pl-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <span className="text-xs text-white/60 font-semibold">
                Dominant Influence: <span className="text-indigo-300">{committeeDecision.dominantPersona}</span>
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-white/30 font-mono uppercase block">COMMITTEE EXECUTIVE SUMMARY</span>
              <p className="text-sm text-white/80 leading-relaxed font-sans">
                {committeeDecision.summary}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-white/5 pt-3">
              <span className="text-white/40 font-mono">Consensus Confidence</span>
              <span className="text-indigo-400 font-bold font-mono">{committeeDecision.confidence}%</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
