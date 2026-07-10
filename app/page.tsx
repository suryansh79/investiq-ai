// ============================================================================
// InvestIQ AI — Multi-Agent Research Command (Main Page)
// Supports Single Company Analysis and Side-by-Side Comparison Modes.
// ============================================================================

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion as Motion, AnimatePresence as AnimPresence } from 'framer-motion';
import { 
  Search, Brain, Sparkles, ArrowRight, ShieldCheck, 
  TrendingUp, BarChart3, AlertTriangle, MessageSquare, 
  Swords, Cpu, Network, CheckCircle2, ChevronRight, RefreshCw, Users
} from 'lucide-react';
import type {
  AnalysisResult,
  TimelineStep,
  SimulatorSettings,
  CompanyIntelligence,
  FinancialHealthAnalysis,
  RiskAnalysis,
  MarketSentimentAnalysis,
  DebateOutput,
  DecisionAnalysis,
  InvestmentCommittee,
  CacheStatus,
} from '@/types';
import Dashboard from '@/components/Dashboard';
import ComparisonDashboard from '@/components/ComparisonDashboard';
import LoadingScreen from '@/components/LoadingScreen';

const DEFAULT_SIMULATOR: SimulatorSettings = {
  riskAppetite: 'Moderate',
  investmentHorizon: '3 Years',
  enableDebate: false,
};

const INITIAL_TIMELINE: TimelineStep[] = [
  { id: 'research', label: 'Company Research', status: 'pending' },
  { id: 'financial', label: 'Financial Analysis', status: 'pending' },
  { id: 'risk', label: 'Risk Assessment', status: 'pending' },
  { id: 'sentiment', label: 'Sentiment Analysis', status: 'pending' },
  { id: 'debate', label: 'AI Debate', status: 'pending' },
  { id: 'committee', label: 'Investment Committee', status: 'pending' },
  { id: 'decision', label: 'Final Recommendation', status: 'pending' },
];

const SUGGESTED_COMPANIES = [
  { name: 'Apple', ticker: 'AAPL' },
  { name: 'Tesla', ticker: 'TSLA' },
  { name: 'NVIDIA', ticker: 'NVDA' },
  { name: 'Microsoft', ticker: 'MSFT' },
  { name: 'Amazon', ticker: 'AMZN' },
  { name: 'Google', ticker: 'GOOGL' },
];

const AGENT_NODES = [
  { id: 'research', title: 'Company Intelligence', desc: 'Consolidated overview & news sentiment', icon: Brain, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'financial', title: 'Financial Health', desc: 'Programmatic calculations & scores', icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'risk', title: 'Risk Analysis', desc: 'Rule-based D/E & FCF red flags', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { id: 'debate', title: 'AI Debate Coordinator', desc: 'Toggleable Bull vs Bear arguments', icon: Swords, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { id: 'committee', title: 'Investment Committee', desc: 'Growth, Value & Risk Analyst review', icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  { id: 'decision', title: 'Decision Node', desc: 'Synthesis recommendation & thesis', icon: Cpu, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
];

export default function HomePage() {
  // Modes & Inputs
  const [isCompare, setIsCompare] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyNameB, setCompanyNameB] = useState('');

  // Loader & Timelines
  const [isLoading, setIsLoading] = useState(false);
  const [timeline, setTimeline] = useState<TimelineStep[]>(INITIAL_TIMELINE);
  const [timelineB, setTimelineB] = useState<TimelineStep[]>(INITIAL_TIMELINE);

  // Single Analysis Results
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Comparison Results & Verdict
  const [resultA, setResultA] = useState<AnalysisResult | null>(null);
  const [resultB, setResultB] = useState<AnalysisResult | null>(null);
  const [verdict, setVerdict] = useState<{ chosenCompany: string; verdictReasoning: string[] } | null>(null);
  const [isLoadingVerdict, setIsLoadingVerdict] = useState(false);

  // Settings
  const [simulatorSettings, setSimulatorSettings] = useState<SimulatorSettings>(DEFAULT_SIMULATOR);
  const [error, setError] = useState<string | null>(null);
  const [activeQuery, setActiveQuery] = useState('');
  const [activeQueryB, setActiveQueryB] = useState('');
  const [tickerOffset, setTickerOffset] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto ticker effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerOffset((prev) => (prev - 1) % 1000);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  // Helper function to execute and decode a single SSE stream run
  const runSingleAnalysis = async (
    company: string,
    isA: boolean,
    settings: SimulatorSettings,
    signal: AbortSignal,
    forceRefresh = false
  ): Promise<AnalysisResult> => {
    const response = await fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: company,
        simulatorSettings: settings,
        forceRefresh,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} fetching ${company}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error(`No response stream for ${company}`);

    const decoder = new TextDecoder();
    let buffer = '';
    const partial: Partial<AnalysisResult> = {};

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      let currentEvent = '';
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith('data: ') && currentEvent) {
          try {
            const data = JSON.parse(line.slice(6));
            
            switch (currentEvent) {
              case 'timeline':
                if (isA) setTimeline(data as TimelineStep[]);
                else setTimelineB(data as TimelineStep[]);
                break;
              case 'intelligence':
                partial.companyIntelligence = data as CompanyIntelligence;
                break;
              case 'financial':
                partial.financialHealth = data as FinancialHealthAnalysis;
                break;
              case 'risk':
                partial.riskAnalysis = data as RiskAnalysis;
                break;
              case 'sentiment':
                partial.marketSentiment = data as MarketSentimentAnalysis;
                break;
              case 'debate':
                partial.debate = data as DebateOutput;
                break;
              case 'cacheStatus':
                partial.cacheStatus = data as CacheStatus;
                break;
              case 'committee':
                partial.committee = data as InvestmentCommittee;
                break;
              case 'decision':
                partial.decision = data as DecisionAnalysis;
                break;
              case 'error':
                throw new Error((data as { message: string }).message);
            }
          } catch (jsonErr) {
            if (currentEvent === 'error') {
              throw new Error((jsonErr as Error).message);
            }
          }
          currentEvent = '';
        }
      }
    }

    if (
      partial.companyIntelligence &&
      partial.financialHealth &&
      partial.riskAnalysis &&
      partial.marketSentiment &&
      partial.debate &&
      partial.committee &&
      partial.decision
    ) {
      return partial as AnalysisResult;
    } else {
      throw new Error(`Agent flow completed without returning complete analysis objects for ${company}.`);
    }
  };

  // Main execution coordinator
  const runAnalysis = useCallback(async (
    queryA: string,
    queryB: string,
    compare: boolean,
    settings: SimulatorSettings,
    forceRefresh = false
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setResultA(null);
    setResultB(null);
    setVerdict(null);
    setTimeline(INITIAL_TIMELINE);
    setTimelineB(INITIAL_TIMELINE);
    setActiveQuery(queryA);
    setActiveQueryB(queryB);

    try {
      if (compare) {
        // ─── COMPARISON MODE: Execute parallel stream fetches ───
        const [resA, resB] = await Promise.all([
          runSingleAnalysis(queryA, true, settings, controller.signal, forceRefresh),
          runSingleAnalysis(queryB, false, settings, controller.signal, forceRefresh),
        ]);

        setResultA(resA);
        setResultB(resB);

        // Fetch the synthesis verdict
        setIsLoadingVerdict(true);
        try {
          const compResponse = await fetch('/api/compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resultA: resA,
              resultB: resB,
              simulatorSettings: settings,
            }),
            signal: controller.signal,
          });

          if (compResponse.ok) {
            const compVerdict = await compResponse.json();
            setVerdict(compVerdict);
          } else {
            throw new Error('Synthesis comparison endpoint failed.');
          }
        } catch (verdictErr) {
          console.error('Verdict synthesiser failed:', verdictErr);
        } finally {
          setIsLoadingVerdict(false);
        }
      } else {
        // ─── SINGLE MODE ───
        const res = await runSingleAnalysis(queryA, true, settings, controller.signal, forceRefresh);
        setResult(res);
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during execution.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompare) {
      if (companyName.trim() && companyNameB.trim()) {
        runAnalysis(companyName.trim(), companyNameB.trim(), true, simulatorSettings);
      }
    } else {
      if (companyName.trim()) {
        runAnalysis(companyName.trim(), '', false, simulatorSettings);
      }
    }
  };

  const handleSuggestionClick = (company: string) => {
    setCompanyName(company);
    setIsCompare(false);
    runAnalysis(company, '', false, simulatorSettings);
  };

  const handleRerun = () => {
    if (activeQuery) {
      runAnalysis(activeQuery, activeQueryB, isCompare, simulatorSettings);
    }
  };

  const handleReset = () => {
    setResult(null);
    setResultA(null);
    setResultB(null);
    setVerdict(null);
    setCompanyName('');
    setCompanyNameB('');
    setError(null);
  };

  return (
    <main className="relative min-h-screen aurora-bg grid-overlay flex flex-col justify-between">
      
      {/* Ticker Tape */}
      <div className="relative w-full h-8 bg-black/60 border-b border-white/5 overflow-hidden flex items-center z-10">
        <div 
          className="flex whitespace-nowrap gap-12 text-xs font-mono tracking-wider text-white/40"
          style={{ transform: `translateX(${tickerOffset}px)` }}
        >
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex gap-12">
              <span>AAPL <span className="text-emerald-400">+1.24%</span></span>
              <span>TSLA <span className="text-emerald-400">+3.56%</span></span>
              <span>NVDA <span className="text-emerald-400">+5.89%</span></span>
              <span>MSFT <span className="text-red-400">-0.42%</span></span>
              <span>AMZN <span className="text-emerald-400">+1.12%</span></span>
              <span>GOOGL <span className="text-red-400">-0.88%</span></span>
              <span>SPY <span className="text-emerald-400">+0.67%</span></span>
              <span>QQQ <span className="text-emerald-400">+1.45%</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#030307]/75 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
              <Network className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">InvestIQ AI</h1>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
                Multi-Agent Research Command
              </p>
            </div>
          </div>

          {/* Reset / New Search button */}
          {(result || (resultA && resultB)) && (
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              New Analysis
            </button>
          )}

          {/* Diagnosis dot */}
          {!result && !(resultA && resultB) && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              ALL SYSTEMS OPERATIONAL
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 pt-24 pb-6 relative z-10">
        <AnimPresence mode="wait">
          
          {/* LANDING STATE */}
          {!isLoading && !result && !(resultA && resultB) && !error && (
            <Motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[70vh] gap-10"
            >
              {/* Hero */}
              <div className="text-center">
                <Motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, type: 'spring' }}
                  className="inline-flex p-3 rounded-2xl bg-white/3 border border-white/5 shadow-inner mb-6"
                >
                  <Sparkles className="w-8 h-8 text-indigo-400" />
                </Motion.div>
                <Motion.h2 
                  className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-4"
                >
                  <span className="gradient-text font-extrabold">InvestIQ</span>{' '}
                  <span className="text-white">AI</span>
                </Motion.h2>
                <Motion.p 
                  className="text-base md:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed"
                >
                  Execute side-by-side comparative multi-agent research or single-asset analyses. Powered by Google Gemini and a 5-node reasoning-only LangGraph.
                </Motion.p>
              </div>

              {/* Mode Selector Toggle */}
              <div className="inline-flex rounded-xl bg-white/5 border border-white/10 p-1">
                <button
                  onClick={() => setIsCompare(false)}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    !isCompare
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/10'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  Single Asset
                </button>
                <button
                  onClick={() => setIsCompare(true)}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    isCompare
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/10'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  Compare Mode
                </button>
              </div>

              {/* Search Forms */}
              <Motion.form
                onSubmit={handleSubmit}
                className="w-full max-w-2xl"
              >
                {!isCompare ? (
                  /* Single search input */
                  <div className="relative group">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500/30 to-cyan-500/30 rounded-2xl blur-2xl opacity-40 group-focus-within:opacity-80 transition-opacity duration-500" />
                    <div className="relative flex items-center bg-[#0a0a14]/90 border border-white/10 rounded-2xl overflow-hidden focus-within:border-indigo-500/40">
                      <Search className="ml-5 w-5 h-5 text-white/30 flex-shrink-0" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Enter equity or ticker (e.g. Apple, TSLA, NVDA)..."
                        className="flex-1 px-4 py-5 bg-transparent text-white text-lg placeholder-white/30 focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!companyName.trim()}
                        className="mr-3 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Analyze
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Double search inputs */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Company A */}
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-indigo-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-50 transition-opacity" />
                        <div className="relative flex items-center bg-[#0a0a14]/90 border border-white/10 rounded-2xl overflow-hidden focus-within:border-indigo-500/40">
                          <Search className="ml-4 w-4 h-4 text-white/30" />
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Company A (e.g. Apple)..."
                            className="flex-1 px-4 py-4.5 bg-transparent text-white text-sm placeholder-white/30 focus:outline-none"
                          />
                        </div>
                      </div>
                      {/* Company B */}
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-cyan-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-50 transition-opacity" />
                        <div className="relative flex items-center bg-[#0a0a14]/90 border border-white/10 rounded-2xl overflow-hidden focus-within:border-cyan-500/40">
                          <Search className="ml-4 w-4 h-4 text-white/30" />
                          <input
                            type="text"
                            value={companyNameB}
                            onChange={(e) => setCompanyNameB(e.target.value)}
                            placeholder="Company B (e.g. Tesla)..."
                            className="flex-1 px-4 py-4.5 bg-transparent text-white text-sm placeholder-white/30 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center mt-6">
                      <button
                        type="submit"
                        disabled={!companyName.trim() || !companyNameB.trim()}
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Analyze Comparison
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </Motion.form>

              {/* Quick Targets */}
              <Motion.div className="flex flex-col items-center gap-3 w-full">
                <span className="text-xs font-mono uppercase tracking-widest text-white/30">
                  Quick Research Targets
                </span>
                <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                  {SUGGESTED_COMPANIES.map((company) => (
                    <button
                      key={company.name}
                      onClick={() => handleSuggestionClick(company.name)}
                      className="px-3.5 py-2 rounded-xl bg-white/3 border border-white/5 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white/90 hover:border-white/15 transition-all duration-300 flex items-center gap-1.5"
                    >
                      <span className="text-[10px] font-mono text-white/30">{company.ticker}</span>
                      <span>{company.name}</span>
                    </button>
                  ))}
                </div>
              </Motion.div>

              {/* Node Architecture Map */}
              <Motion.div className="w-full max-w-5xl pt-10 border-t border-white/5">
                <div className="text-center mb-8">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold mb-1">
                    LangGraph Workflow Node Architecture
                  </h3>
                  <p className="text-xs text-white/40">Visualized agent coordination and routing map</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                  {AGENT_NODES.map((node, idx) => {
                    const Icon = node.icon;
                    return (
                      <div 
                        key={node.id}
                        className="premium-card p-5 rounded-2xl flex flex-col gap-3 relative hover:scale-[1.02] cursor-default"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${node.bg} ${node.border}`}>
                            <Icon className={`w-4 h-4 ${node.color}`} />
                          </div>
                          <div>
                            <div className="text-xs font-mono text-white/30 uppercase tracking-widest">
                              Node 0{idx + 1}
                            </div>
                            <h4 className="text-xs font-semibold text-white/90">{node.title}</h4>
                          </div>
                        </div>
                        <p className="text-[10px] text-white/50 leading-normal">{node.desc}</p>
                        
                        {idx < 5 && (
                          <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                            <ChevronRight className="w-4 h-4 text-white/10" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Motion.div>
            </Motion.div>
          )}

          {/* LOADING STATE */}
          {isLoading && (
            <Motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {!isCompare ? (
                /* Single Loader */
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-1 border border-white/5 bg-white/2 rounded-2xl p-4 flex flex-col justify-center">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold mb-4 text-center">Pipeline Progress</h4>
                    <div className="space-y-4">
                      {timeline.map((step) => (
                        <div key={step.id} className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${step.status === 'completed' ? 'bg-emerald-400' : step.status === 'running' ? 'bg-cyan-400 animate-pulse' : 'bg-white/10'}`} />
                          <span className={`text-xs ${step.status === 'completed' ? 'text-white' : step.status === 'running' ? 'text-cyan-300 font-bold' : 'text-white/30'}`}>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-3">
                    <LoadingScreen steps={timeline} companyName={activeQuery} />
                  </div>
                </div>
              ) : (
                /* Side-by-Side Dual Loaders */
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-mono font-medium animate-pulse inline-block mb-3">
                      DUAL MULTI-AGENT PIPELINES RUNNING
                    </span>
                    <h2 className="text-2xl font-bold text-white">Comparing {activeQuery} & {activeQueryB}</h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <LoadingScreen steps={timeline} companyName={activeQuery} />
                    <LoadingScreen steps={timelineB} companyName={activeQueryB} />
                  </div>
                </div>
              )}
            </Motion.div>
          )}

          {/* ERROR STATE */}
          {error && !isLoading && (
            <Motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[50vh]"
            >
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl p-8 max-w-lg w-full text-center">
                <div className="p-3 rounded-full bg-red-500/20 inline-flex mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-mono">
                  Analysis Pipeline Halted
                </h3>
                <p className="text-sm text-white/60 mb-6">{error}</p>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all"
                >
                  Restart Pipeline
                </button>
              </div>
            </Motion.div>
          )}

          {/* RESULTS STATE */}
          {!isLoading && (
            <>
              {/* Single Result Dashboard */}
              {result && (
                <Motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mt-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-mono tracking-wider font-semibold border border-indigo-500/25">REPORT SIGNED</span>
                        <span className="text-[10px] text-white/30 font-mono">ID: {result.companyIntelligence.ticker}-{Date.now().toString().slice(-4)}</span>
                        {result.cacheStatus && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                            result.cacheStatus.source === 'cache'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {result.cacheStatus.source === 'cache'
                              ? `🟡 Cached Response (${result.cacheStatus.ageText})`
                              : `🟢 Live AI (${(result.cacheStatus.latencyMs / 1000).toFixed(1)}s)`
                            }
                          </span>
                        )}
                        {result.cacheStatus?.source === 'cache' && (
                          <button
                            onClick={() => runAnalysis(result.companyIntelligence.companyName, '', false, simulatorSettings, true)}
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all text-[10px] font-mono cursor-pointer"
                          >
                            <RefreshCw className="w-2.5 h-2.5" /> Refresh from AI
                          </button>
                        )}
                      </div>
                      <h2 className="text-3xl font-bold text-white">
                        Research Docket: <span className="gradient-text font-black">{result.companyIntelligence.companyName}</span>
                      </h2>
                    </div>
                  </div>
                  <Dashboard
                    result={result}
                    timeline={timeline}
                    simulatorSettings={simulatorSettings}
                    onSimulatorChange={setSimulatorSettings}
                    onRerun={handleRerun}
                    isLoading={isLoading}
                  />
                </Motion.div>
              )}

              {/* Comparison Result Dashboard */}
              {resultA && resultB && (
                <Motion.div
                  key="results-comparison"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mt-6 mb-6 border-b border-white/5 pb-6">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-mono tracking-wider font-semibold border border-indigo-500/25">COMPARISON SIGNED</span>
                      <span className="text-[10px] text-white/30 font-mono">VS MATCHUP ID: {resultA.companyIntelligence.ticker}-{resultB.companyIntelligence.ticker}</span>
                      {resultA.cacheStatus && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                          resultA.cacheStatus.source === 'cache'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {resultA.companyIntelligence.ticker}: {resultA.cacheStatus.source === 'cache' ? 'Cached' : 'Live'}
                        </span>
                      )}
                      {resultB.cacheStatus && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                          resultB.cacheStatus.source === 'cache'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {resultB.companyIntelligence.ticker}: {resultB.cacheStatus.source === 'cache' ? 'Cached' : 'Live'}
                        </span>
                      )}
                      {(resultA.cacheStatus?.source === 'cache' || resultB.cacheStatus?.source === 'cache') && (
                        <button
                          onClick={() => runAnalysis(resultA.companyIntelligence.companyName, resultB.companyIntelligence.companyName, true, simulatorSettings, true)}
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all text-[10px] font-mono cursor-pointer"
                        >
                          <RefreshCw className="w-2.5 h-2.5" /> Refresh Both from AI
                        </button>
                      )}
                    </div>
                    <h2 className="text-3xl font-bold text-white">
                      Equity Matchup: <span className="gradient-text font-black">{resultA.companyIntelligence.companyName}</span> VS <span className="gradient-text font-black">{resultB.companyIntelligence.companyName}</span>
                    </h2>
                  </div>
                  <ComparisonDashboard
                    resultA={resultA}
                    resultB={resultB}
                    verdict={verdict}
                    isLoadingVerdict={isLoadingVerdict}
                    simulatorSettings={simulatorSettings}
                    onSimulatorChange={setSimulatorSettings}
                    onRerun={handleRerun}
                    isLoading={isLoading}
                  />
                </Motion.div>
              )}
            </>
          )}
        </AnimPresence>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-8 bg-black/40">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-white/20" />
            <p className="text-xs text-white/20">
              InvestIQ AI Terminal — Multi-Agent Institutional Intelligence Engine
            </p>
          </div>
          <p className="text-xs text-white/20 font-mono">
            Next.js + LangGraph.js + Gemini 2.5 Flash
          </p>
        </div>
      </footer>
    </main>
  );
}
