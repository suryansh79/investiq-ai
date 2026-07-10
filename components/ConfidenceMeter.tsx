'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import type { ConfidenceLevel } from '@/types';

interface ConfidenceMeterProps {
  percentage: number;
  level: ConfidenceLevel;
  explanation: string;
}

export default function ConfidenceMeter({ percentage, level, explanation }: ConfidenceMeterProps) {
  const config = {
    High: { color: '#22c55e', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', icon: ShieldCheck },
    Medium: { color: '#eab308', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', icon: ShieldAlert },
    Low: { color: '#ef4444', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', icon: ShieldQuestion },
  };

  const { color, bgColor, borderColor, icon: Icon } = config[level];

  return (
    <div className={`rounded-2xl border ${borderColor} ${bgColor} backdrop-blur-xl p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5" style={{ color }} />
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
          AI Confidence
        </h3>
        <span
          className="ml-auto text-lg font-bold"
          style={{ color }}
        >
          {level}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 rounded-full bg-white/5 overflow-hidden mb-3">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl font-bold text-white">{percentage}%</span>
        <span className="text-xs text-white/40">confidence score</span>
      </div>

      {/* Explanation */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <p className="text-sm text-white/60 leading-relaxed">{explanation}</p>
      </div>
    </div>
  );
}
