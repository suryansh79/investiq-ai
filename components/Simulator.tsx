'use client';

import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import type { RiskAppetite, InvestmentHorizon, SimulatorSettings } from '@/types';

interface SimulatorProps {
  settings: SimulatorSettings;
  onSettingsChange: (settings: SimulatorSettings) => void;
  onRerun: () => void;
  isLoading: boolean;
}

const riskOptions: RiskAppetite[] = ['Conservative', 'Moderate', 'Aggressive'];
const horizonOptions: InvestmentHorizon[] = ['1 Year', '3 Years', '5 Years', '10 Years'];

export default function Simulator({ settings, onSettingsChange, onRerun, isLoading }: SimulatorProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-cyan-500/20">
          <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
            Decision Simulator
          </h3>
          <p className="text-xs text-white/40 mt-0.5">Adjust parameters to see different recommendations</p>
        </div>
      </div>

      {/* Risk Appetite */}
      <div className="mb-6">
        <label className="text-xs text-white/50 uppercase tracking-wider font-medium mb-3 block">
          Risk Appetite
        </label>
        <div className="grid grid-cols-3 gap-2">
          {riskOptions.map((option) => (
            <button
              key={option}
              onClick={() => onSettingsChange({ ...settings, riskAppetite: option })}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                settings.riskAppetite === option
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Investment Horizon */}
      <div className="mb-6">
        <label className="text-xs text-white/50 uppercase tracking-wider font-medium mb-3 block">
          Investment Horizon
        </label>
        <div className="grid grid-cols-4 gap-2">
          {horizonOptions.map((option) => (
            <button
              key={option}
              onClick={() => onSettingsChange({ ...settings, investmentHorizon: option })}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                settings.investmentHorizon === option
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* AI Debate Mode Toggle */}
      <div className="mb-6 flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/5">
        <div>
          <label className="text-xs text-white/80 uppercase tracking-wider font-semibold block">
            AI Debate Mode
          </label>
          <span className="text-[10px] text-white/40 block mt-0.5">
            Uses extra LLM quota (adds API latency)
          </span>
        </div>
        <button
          onClick={() => onSettingsChange({ ...settings, enableDebate: !settings.enableDebate })}
          className={`w-12 h-6 rounded-full transition-all duration-300 relative border ${
            settings.enableDebate
              ? 'bg-cyan-500/20 border-cyan-500/40'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full absolute top-1/2 -translate-y-1/2 transition-all duration-300 ${
              settings.enableDebate ? 'bg-cyan-400 shadow-md shadow-cyan-400/50' : 'bg-white/30'
            }`}
            style={{ left: settings.enableDebate ? '26px' : '4px' }}
          />
        </button>
      </div>

      {/* Re-run button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onRerun}
        disabled={isLoading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Reanalyzing...' : 'Re-run Analysis'}
      </motion.button>
    </div>
  );
}
