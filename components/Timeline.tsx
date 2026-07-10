'use client';

import { motion } from 'framer-motion';
import { Check, Loader2, Circle, AlertCircle } from 'lucide-react';
import type { TimelineStep } from '@/types';

interface TimelineProps {
  steps: TimelineStep[];
}

export default function Timeline({ steps }: TimelineProps) {
  const getIcon = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-emerald-400" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Circle className="w-4 h-4 text-white/20" />;
    }
  };

  const getStatusColor = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed': return 'border-emerald-500/50 bg-emerald-500/10';
      case 'running': return 'border-blue-500/50 bg-blue-500/10';
      case 'error': return 'border-red-500/50 bg-red-500/10';
      default: return 'border-white/10 bg-white/5';
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
        Analysis Pipeline
      </h3>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-500 ${getStatusColor(step.status)}`}
          >
            <div className="flex-shrink-0">{getIcon(step.status)}</div>
            <span className={`text-sm font-medium ${
              step.status === 'completed' ? 'text-white/90' :
              step.status === 'running' ? 'text-blue-300' :
              'text-white/40'
            }`}>
              {step.label}
            </span>
            {step.status === 'completed' && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-auto text-xs text-emerald-400/70"
              >
                ✓ Completed
              </motion.span>
            )}
            {step.status === 'running' && (
              <span className="ml-auto text-xs text-blue-400/70 animate-pulse">
                Analyzing...
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
