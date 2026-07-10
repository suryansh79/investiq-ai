'use client';

import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: number;
}

export default function ScoreGauge({ score, label = 'Investment Score', size = 200 }: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (clampedScore / 100) * circumference;
  const center = size / 2;

  const getColor = (s: number) => {
    if (s >= 70) return '#22c55e';
    if (s >= 45) return '#eab308';
    return '#ef4444';
  };

  const getGradientId = 'scoreGradient';
  const color = getColor(clampedScore);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={getGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="10"
          />
          {/* Progress arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${getGradientId})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {clampedScore}
          </motion.span>
          <span className="text-xs text-white/40 uppercase tracking-widest mt-1">/ 100</span>
        </div>
      </div>
      <span className="text-sm text-white/60 font-medium tracking-wide">{label}</span>
    </div>
  );
}
