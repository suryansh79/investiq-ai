'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, DollarSign, Scale, MessageSquareWarning, BarChart3, BadgeDollarSign } from 'lucide-react';
import type { RedFlagType } from '@/types';

interface RedFlagsProps {
  flags: RedFlagType[];
}

const flagConfig: Record<RedFlagType, { icon: React.ElementType; description: string }> = {
  'High Debt': { icon: DollarSign, description: 'Debt-to-equity ratio is elevated' },
  'Weak Cash Flow': { icon: TrendingDown, description: 'Operating cash flow is weak or negative' },
  'Negative Earnings': { icon: BarChart3, description: 'Company is reporting net losses' },
  'Legal Issues': { icon: Scale, description: 'Pending lawsuits or regulatory actions' },
  'Poor Market Sentiment': { icon: MessageSquareWarning, description: 'Negative market perception' },
  'Declining Revenue': { icon: TrendingDown, description: 'Revenue has been declining YoY' },
  'Overvaluation': { icon: BadgeDollarSign, description: 'Trading at premium valuation multiples' },
};

export default function RedFlags({ flags }: RedFlagsProps) {
  if (flags.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl p-6">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">
          Red Flag Detector
        </h3>
        <div className="flex items-center gap-3 text-emerald-400">
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">No red flags detected</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
          Red Flag Detector
        </h3>
        <span className="ml-auto text-xs font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded-full">
          {flags.length} ALERT{flags.length !== 1 ? 'S' : ''}
        </span>
      </div>
      <div className="space-y-2">
        {flags.map((flag, index) => {
          const config = flagConfig[flag];
          const Icon = config.icon;
          return (
            <motion.div
              key={flag}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3"
            >
              <Icon className="w-4 h-4 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-300">{flag}</p>
                <p className="text-xs text-white/40">{config.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
