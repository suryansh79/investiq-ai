'use client';

import { motion } from 'framer-motion';
import { Target, Sprout, Gem, Coins, Flame } from 'lucide-react';
import type { InvestorProfile } from '@/types';

interface PortfolioFitProps {
  profiles: InvestorProfile[];
}

const profileConfig: Record<InvestorProfile, { icon: React.ElementType; color: string; bg: string }> = {
  'Long-Term Investors': { icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
  'Growth Investors': { icon: Sprout, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  'Value Investors': { icon: Gem, color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' },
  'Dividend Investors': { icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30' },
  'High-Risk Investors': { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
};

const allProfiles: InvestorProfile[] = [
  'Long-Term Investors',
  'Growth Investors',
  'Value Investors',
  'Dividend Investors',
  'High-Risk Investors',
];

export default function PortfolioFit({ profiles }: PortfolioFitProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
        Portfolio Fit
      </h3>
      <div className="flex flex-wrap gap-3">
        {allProfiles.map((profile, index) => {
          const isActive = profiles.includes(profile);
          const config = profileConfig[profile];
          const Icon = config.icon;

          return (
            <motion.div
              key={profile}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                isActive
                  ? config.bg
                  : 'bg-white/3 border-white/5 opacity-40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? config.color : 'text-white/30'}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-white/90' : 'text-white/30'}`}>
                {profile}
              </span>
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 rounded-full bg-emerald-400"
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
