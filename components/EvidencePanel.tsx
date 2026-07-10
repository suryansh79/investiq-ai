'use client';

import { motion } from 'framer-motion';
import { FileText, CheckCircle2 } from 'lucide-react';

interface EvidencePanelProps {
  evidence: string[];
  title?: string;
}

export default function EvidencePanel({ evidence, title = 'Supporting Evidence' }: EvidencePanelProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-indigo-500/20">
          <FileText className="w-4 h-4 text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
          {title}
        </h3>
        <span className="ml-auto text-xs text-white/30">{evidence.length} data points</span>
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        {evidence.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/5 px-4 py-3"
          >
            <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white/70 leading-relaxed">{item}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
