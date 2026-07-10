// ============================================================================
// InvestIQ AI — Real-Time Agent Activity Log Timeline
// Replaces the generic loader with a terminal-like execution trace feed.
// ============================================================================

'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle2, Loader2, Circle, AlertCircle, Terminal } from 'lucide-react';
import type { TimelineStep } from '@/types';

interface LoadingScreenProps {
  steps: TimelineStep[];
  companyName?: string;
}

export default function LoadingScreen({ steps, companyName = 'Asset' }: LoadingScreenProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentStep = steps.find((s) => s.status === 'running');
  const completedCount = steps.filter((s) => s.status === 'completed').length;

  // Localized Millisecond Timestamp Formatter
  const formatTime = (timestamp?: number) => {
    const date = timestamp ? new Date(timestamp) : new Date();
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false
    }) + '.' + String(date.getMilliseconds()).padStart(3, '0');
  };

  // Scroll the log container to the bottom whenever steps change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [steps]);

  // Specific Log Descriptions for Each Phase
  const getLogDetails = (step: TimelineStep) => {
    switch (step.id) {
      case 'research':
        if (step.status === 'completed') return `✓ Successfully completed. Compiled official profiles and recent news dossiers.`;
        if (step.status === 'running') return `Accessing stock API. Researching company sector, founding profile, economic moat, and news...`;
        return `Queueing company profile research tasks.`;
      case 'financial':
        if (step.status === 'completed') return `✓ Successfully completed. Programmatically computed margins, YoY growth rates, and leverage.`;
        if (step.status === 'running') return `Processing financial sheets. Calculating gross, net, operating margins, YoY growth, and D/E ratios...`;
        return `Queueing mathematical financial modeling.`;
      case 'risk':
        if (step.status === 'completed') return `✓ Successfully completed. Programmatically checked risk ratios and flagged red flags.`;
        if (step.status === 'running') return `Evaluating leverage safety limits, cash flows, and scanning for red flags (high debt, negative FCF)...`;
        return `Queueing programmatic risk assessment.`;
      case 'sentiment':
        if (step.status === 'completed') return `✓ Successfully completed. Synthesized news consensus and analyst ratings.`;
        if (step.status === 'running') return `Querying sentiment nodes. Aggregating analyst ratings and media coverage sentiment...`;
        return `Queueing market sentiment synthesis.`;
      case 'debate':
        if (step.status === 'completed') return `✓ Successfully completed. Drafted Bull and Bear investment debate cases.`;
        if (step.status === 'running') return `Drafting debate cases. Generating parallel buyer strengths and seller cautions...`;
        return `Queueing Bull vs Bear argument compilation.`;
      case 'committee':
        if (step.status === 'completed') return `✓ Successfully completed. Convened Growth, Value, and Risk personas for final vote.`;
        if (step.status === 'running') return `Convening AI Investment Committee. Synthesizing persona perspectives (Growth, Value, Risk) and compiling votes...`;
        return `Queueing tri-perspective expert review.`;
      case 'decision':
        if (step.status === 'completed') return `✓ Successfully completed. Generated final BUY/WATCH/PASS rating.`;
        if (step.status === 'running') return `Weighing strengths against red flags. Synthesizing risk appetite, horizon, and recommendation rating...`;
        return `Queueing final decision synthesis.`;
      default:
        return `Processing...`;
    }
  };

  const getStatusIcon = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />;
      default:
        return <Circle className="w-4 h-4 text-white/20" />;
    }
  };

  const getStatusColor = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed': return 'text-emerald-400';
      case 'running': return 'text-cyan-400';
      case 'error': return 'text-red-400';
      default: return 'text-white/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Circular Spinner and Progress */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="inline-flex p-4 rounded-full bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/30 mb-4"
        >
          <Brain className="w-8 h-8 text-indigo-400" />
        </motion.div>
        <h2 className="text-xl font-bold text-white mb-2">Analyzing {companyName}</h2>
        <p className="text-sm text-white/50">
          {currentStep
            ? `Active Agent: ${currentStep.label}...`
            : 'Initializing research nodes...'}
        </p>

        {/* Global Progress Bar */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <div className="h-1.5 w-64 rounded-full bg-white/5 overflow-hidden border border-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(completedCount / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs font-mono text-white/40">{completedCount}/{steps.length} Nodes</span>
        </div>
      </motion.div>

      {/* Terminal Agent Activity Console */}
      <div className="rounded-2xl border border-white/10 bg-black/60 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-white/40">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>INVESTIQ_AGENT_LOG.TXT</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">LIVE ROUTING</span>
        </div>

        {/* Scrollable logs list */}
        <div 
          ref={scrollContainerRef}
          className="h-80 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          {steps.map((step, index) => {
            const isPending = step.status === 'pending';
            const logColor = getStatusColor(step.status);

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex items-start gap-4 p-3 rounded-xl border transition-all duration-300 ${
                  step.status === 'running' 
                    ? 'border-cyan-500/20 bg-cyan-500/5' 
                    : step.status === 'completed'
                    ? 'border-emerald-500/15 bg-emerald-500/2'
                    : 'border-white/5 bg-transparent'
                }`}
              >
                {/* 1. Status icon */}
                <div className="mt-0.5 flex-shrink-0">{getStatusIcon(step.status)}</div>

                {/* 2. Log contents */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold font-mono tracking-wide ${logColor} uppercase`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] font-mono text-white/20 select-none">
                      {formatTime(step.timestamp)}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${isPending ? 'text-white/20' : 'text-white/60'}`}>
                    {getLogDetails(step)}
                  </p>
                </div>
              </motion.div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
