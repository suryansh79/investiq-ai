'use client';

import { motion } from 'framer-motion';
import { Swords, TrendingUp, TrendingDown } from 'lucide-react';
import type { DebateOutput } from '@/types';

interface DebatePanelProps {
  debate: DebateOutput;
}

export default function DebatePanel({ debate }: DebatePanelProps) {
  // Interleave bull and bear points for a debate-like presentation
  const maxPoints = Math.max(
    debate.bullCase.points.length,
    debate.bearCase.points.length
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-purple-500/20">
          <Swords className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
            AI Debate Mode
          </h3>
          <p className="text-xs text-white/40 mt-0.5">Bull vs Bear — structured argument analysis</p>
        </div>
      </div>

      {/* Debate header */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <span className="text-xs font-semibold text-emerald-400 uppercase">Bull Agent</span>
        </div>
        <div className="text-center py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <TrendingDown className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <span className="text-xs font-semibold text-red-400 uppercase">Bear Agent</span>
        </div>
      </div>

      {/* Debate rounds */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {Array.from({ length: maxPoints }, (_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.15 }}
          >
            <div className="text-xs text-white/30 text-center mb-2 uppercase tracking-wider">
              Round {i + 1}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Bull point */}
              {debate.bullCase.points[i] && (
                <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400">BULL</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {debate.bullCase.points[i]}
                  </p>
                </div>
              )}
              {/* Bear point */}
              {debate.bearCase.points[i] && (
                <div className="rounded-xl bg-red-500/5 border border-red-500/15 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-3 h-3 text-red-400" />
                    <span className="text-xs font-semibold text-red-400">BEAR</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {debate.bearCase.points[i]}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Closing statements */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: maxPoints * 0.15 }}
          className="pt-4 border-t border-white/10"
        >
          <div className="text-xs text-white/30 text-center mb-3 uppercase tracking-wider">
            Closing Statements
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
              <p className="text-sm text-emerald-300/80 font-medium leading-relaxed">
                {debate.bullCase.conclusion}
              </p>
            </div>
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-sm text-red-300/80 font-medium leading-relaxed">
                {debate.bearCase.conclusion}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
