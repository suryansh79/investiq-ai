'use client';

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import type { DecisionAnalysis } from '@/types';

interface ScoreBreakdownProps {
  decision: DecisionAnalysis;
}

export default function ScoreBreakdown({ decision }: ScoreBreakdownProps) {
  const data = [
    { metric: 'Financial', score: decision.financialHealthScore, fullMark: 100 },
    { metric: 'Growth', score: decision.growthScore, fullMark: 100 },
    { metric: 'Risk', score: decision.riskScore, fullMark: 100 },
    { metric: 'Sentiment', score: decision.sentimentScore, fullMark: 100 },
    { metric: 'Valuation', score: decision.valuationScore, fullMark: 100 },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-violet-500/20">
          <BarChart3 className="w-4 h-4 text-violet-400" />
        </div>
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
          Score Breakdown
        </h3>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="h-64"
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Score bars */}
      <div className="space-y-3 mt-4">
        {data.map((item, index) => (
          <motion.div
            key={item.metric}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex items-center gap-3"
          >
            <span className="text-xs text-white/50 w-20">{item.metric}</span>
            <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${item.score}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
              />
            </div>
            <span className="text-xs text-white/70 font-medium w-8 text-right">{item.score}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
