'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { DebateOutput } from '@/types';

interface ThesisCardsProps {
  debate: DebateOutput;
}

export default function ThesisCards({ debate }: ThesisCardsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bull Thesis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-900/5 backdrop-blur-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Bull Thesis</h3>
            <p className="text-xs text-white/40 mt-0.5">{debate.bullCase.title}</p>
          </div>
        </div>
        <div className="space-y-3 mb-4">
          {debate.bullCase.points.map((point, i) => (
            <div key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-medium">
                {i + 1}
              </span>
              <p className="text-sm text-white/70 leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
          <p className="text-sm text-emerald-300/80 font-medium leading-relaxed">
            {debate.bullCase.conclusion}
          </p>
        </div>
      </motion.div>

      {/* Bear Thesis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-900/5 backdrop-blur-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-500/20">
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Bear Thesis</h3>
            <p className="text-xs text-white/40 mt-0.5">{debate.bearCase.title}</p>
          </div>
        </div>
        <div className="space-y-3 mb-4">
          {debate.bearCase.points.map((point, i) => (
            <div key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center font-medium">
                {i + 1}
              </span>
              <p className="text-sm text-white/70 leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-300/80 font-medium leading-relaxed">
            {debate.bearCase.conclusion}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
