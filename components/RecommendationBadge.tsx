'use client';

import { motion } from 'framer-motion';
import { ArrowUpCircle, Eye, XCircle } from 'lucide-react';
import type { Recommendation } from '@/types';

interface RecommendationBadgeProps {
  recommendation: Recommendation;
  companyName: string;
}

const config: Record<Recommendation, {
  icon: React.ElementType;
  gradient: string;
  border: string;
  shadow: string;
  text: string;
  subtext: string;
}> = {
  BUY: {
    icon: ArrowUpCircle,
    gradient: 'from-emerald-500 to-green-600',
    border: 'border-emerald-500/40',
    shadow: 'shadow-emerald-500/20',
    text: 'text-emerald-400',
    subtext: 'Strong investment opportunity identified',
  },
  WATCH: {
    icon: Eye,
    gradient: 'from-yellow-500 to-amber-600',
    border: 'border-yellow-500/40',
    shadow: 'shadow-yellow-500/20',
    text: 'text-yellow-400',
    subtext: 'Monitor closely for better entry point',
  },
  PASS: {
    icon: XCircle,
    gradient: 'from-red-500 to-rose-600',
    border: 'border-red-500/40',
    shadow: 'shadow-red-500/20',
    text: 'text-red-400',
    subtext: 'Risk outweighs potential reward',
  },
};

export default function RecommendationBadge({ recommendation, companyName }: RecommendationBadgeProps) {
  const c = config[recommendation];
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className={`rounded-2xl border ${c.border} bg-white/5 backdrop-blur-xl p-8 shadow-xl ${c.shadow}`}
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${c.gradient} mb-4 shadow-lg ${c.shadow}`}
        >
          <Icon className="w-10 h-10 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">AI Recommendation</p>
          <h2 className={`text-4xl font-black tracking-wider ${c.text} mb-2`}>
            {recommendation}
          </h2>
          <p className="text-sm text-white/50">
            {companyName}
          </p>
          <p className="text-xs text-white/30 mt-2">{c.subtext}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
