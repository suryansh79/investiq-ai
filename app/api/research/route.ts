// ============================================================================
// InvestIQ AI — Research API Route (SSE Streaming with Simulation Fallback)
// Runs the LangGraph workflow when an API key is present.
// Otherwise, runs a high-fidelity procedural simulation to guarantee
// the project is interactive and testable out of the box.
// ============================================================================

import { NextRequest } from 'next/server';
import { createResearchGraph } from '@/langgraph/graph';
import { getCachedResponse, saveCachedResponse } from '@/lib/cache';
import {
  getCompanyFinancials,
  formatFinancialsForPrompt,
} from '@/lib/services/financialData';
import type { 
  SimulatorSettings, 
  TimelineStep,
  CompanyIntelligence,
  FinancialHealthAnalysis,
  RiskAnalysis,
  MarketSentimentAnalysis,
  DebateOutput,
  DecisionAnalysis,
  Recommendation,
  InvestmentCommittee,
  InvestorProfile,
  RedFlagType,
  ConfidenceLevel
} from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 120;

function createSSEStream() {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
  });

  function send(event: string, data: unknown) {
    if (controller) {
      const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      controller.enqueue(encoder.encode(payload));
    }
  }

  function close() {
    if (controller) {
      controller.close();
    }
  }

  return { stream, send, close };
}

// Helper: sleep function to simulate latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const body = await request.json();
  const companyName: string = body.companyName;
  const simulatorSettings: SimulatorSettings = body.simulatorSettings || {
    riskAppetite: 'Moderate',
    investmentHorizon: '3 Years',
  };
  const forceRefresh: boolean = body.forceRefresh || false;

  if (!companyName) {
    return new Response(JSON.stringify({ error: 'Company name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { stream, send, close } = createSSEStream();
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const useCache = process.env.USE_CACHE === 'true';

  // Smart Response Cache - Check for local hit before executing graph
  if (useCache && !forceRefresh) {
    const cached = getCachedResponse(companyName);
    if (cached) {
      console.log(`[Cache Hit] Serving cached response for: ${companyName}`);
      
      const ageMs = Date.now() - new Date(cached.createdAt).getTime();
      const minutes = Math.floor(ageMs / 60000);
      const hours = Math.floor(minutes / 60);
      const ageText = hours > 0 ? `Cached ${hours}h ago` : minutes > 0 ? `Cached ${minutes}m ago` : 'Cached just now';

      // Set all timeline steps to completed
      const timeline: TimelineStep[] = [
        { id: 'research', label: 'Company Research', status: 'completed', timestamp: Date.now() },
        { id: 'financial', label: 'Financial Analysis', status: 'completed', timestamp: Date.now() },
        { id: 'risk', label: 'Risk Assessment', status: 'completed', timestamp: Date.now() },
        { id: 'sentiment', label: 'Sentiment Analysis', status: 'completed', timestamp: Date.now() },
        { id: 'debate', label: 'AI Debate', status: 'completed', timestamp: Date.now() },
        { id: 'committee', label: 'Investment Committee', status: 'completed', timestamp: Date.now() },
        { id: 'decision', label: 'Final Recommendation', status: 'completed', timestamp: Date.now() },
      ];

      (async () => {
        try {
          send('timeline', timeline);
          await delay(100);
          send('intelligence', cached.response.companyIntelligence);
          await delay(100);
          send('financial', cached.response.financialHealth);
          await delay(100);
          send('risk', cached.response.riskAnalysis);
          await delay(100);
          send('sentiment', cached.response.marketSentiment);
          await delay(100);
          send('debate', cached.response.debate);
          await delay(100);
          send('committee', cached.response.committee);
          await delay(100);
          send('decision', cached.response.decision);
          await delay(100);
          send('cacheStatus', {
            source: 'cache',
            createdAt: cached.createdAt,
            ageText,
            latencyMs: Date.now() - startTime,
          });
          await delay(100);
          send('complete', { success: true });
        } catch (err) {
          console.error('[Cache Error] Streaming cached chunks failed:', err);
          send('error', { message: 'Failed streaming cached response.' });
        } finally {
          close();
        }
      })();

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }
  }

  // Initialize timeline
  const timeline: TimelineStep[] = [
    { id: 'research', label: 'Company Research', status: 'pending' },
    { id: 'financial', label: 'Financial Analysis', status: 'pending' },
    { id: 'risk', label: 'Risk Assessment', status: 'pending' },
    { id: 'sentiment', label: 'Sentiment Analysis', status: 'pending' },
    { id: 'debate', label: 'AI Debate', status: 'pending' },
    { id: 'committee', label: 'Investment Committee', status: 'pending' },
    { id: 'decision', label: 'Final Recommendation', status: 'pending' },
  ];

  async function runSimulation(errorMessage?: string) {
    send('timeline', timeline);
    await delay(800);

    // Fetch company financials
    const financials = getCompanyFinancials(companyName);
    const { incomeStatements, balanceSheets, cashFlowStatements } = financials;
    const currentYearIS = incomeStatements[incomeStatements.length - 1];
    const prevYearIS = incomeStatements[incomeStatements.length - 2];
    const currentYearBS = balanceSheets[balanceSheets.length - 1];
    const currentYearCF = cashFlowStatements[cashFlowStatements.length - 1];

    // Compute metrics programmatically for evidence backing
    const revGrowth = ((currentYearIS.revenue - prevYearIS.revenue) / prevYearIS.revenue) * 100;
    const netMargin = (currentYearIS.netIncome / currentYearIS.revenue) * 100;
    const grossMargin = (currentYearIS.grossProfit / currentYearIS.revenue) * 100;
    const operatingMargin = (currentYearIS.operatingIncome / currentYearIS.revenue) * 100;
    const deRatio = currentYearBS.totalLiabilities / currentYearBS.totalEquity;
    const capEx = currentYearCF.capitalExpenditures;
    
    // Format values
    const formatBillion = (val: number) => `$${(val / 1e9).toFixed(2)}B`;
    const revGrowthStr = `${revGrowth > 0 ? '+' : ''}${revGrowth.toFixed(1)}%`;
    const netMarginStr = `${netMargin.toFixed(1)}%`;
    const grossMarginStr = `${grossMargin.toFixed(1)}%`;
    const deRatioStr = deRatio.toFixed(2);

    // 1. Company Intelligence Node
    const step1 = timeline.find((s) => s.id === 'research');
    if (step1) step1.status = 'running';
    send('timeline', timeline);
    await delay(1200);

    const companyIntelligence: CompanyIntelligence = {
      companyName: financials.companyName,
      ticker: financials.ticker,
      industry: financials.industry,
      sector: financials.sector,
      overview: `${financials.companyName} is an industry leader operating in the ${financials.sector} sector, specifically dominating in ${financials.industry}. The company has established a robust ecosystem and market positioning over the last decade.`,
      businessModel: `A multi-faceted business model centered around high-margin ${financials.industry} solutions, diversified service subscriptions, and strategic hardware/software integration.`,
      revenueSources: [
        `Core Product Lines (${formatBillion(currentYearIS.revenue * 0.6)})`,
        `Subscription & Ecosystem Services (${formatBillion(currentYearIS.revenue * 0.25)})`,
        `Enterprise Licensing & Contracts (${formatBillion(currentYearIS.revenue * 0.15)})`
      ],
      competitiveMoat: `Strong brand equity, high customer switching costs, extensive research and development capability, and deep integration within enterprise and consumer ecosystems.`,
      leadership: `Led by a veteran executive committee focusing on technological innovation and efficient capital allocation.`,
      recentNews: financials.recentHeadlines,
      founded: '2004',
      headquarters: 'Silicon Valley, CA',
      employees: '135,000+',
      marketCap: formatBillion(financials.marketCap)
    };

    if (step1) { step1.status = 'completed'; step1.timestamp = Date.now(); }
    send('timeline', timeline);
    send('intelligence', companyIntelligence);

    // 2. Financial Health Node
    const step2 = timeline.find((s) => s.id === 'financial');
    if (step2) step2.status = 'running';
    send('timeline', timeline);
    await delay(1200);

    const financialHealthScore = Math.min(
      100,
      Math.max(
        30,
        Math.round(
          (revGrowth > 0 ? 50 : 20) + 
          (netMargin > 15 ? 30 : 10) + 
          (deRatio < 1.2 ? 20 : 5)
        )
      )
    );

    const financialHealth: FinancialHealthAnalysis = {
      revenueTrend: `Stable growth over 5 years. Compounded annual revenue reached ${formatBillion(currentYearIS.revenue)}.`,
      revenueGrowthYoY: `YoY revenue growth stands at ${revGrowthStr}.`,
      profitability: `Robust operating profile. Net income clocked in at ${formatBillion(currentYearIS.netIncome)}.`,
      netMargin: netMarginStr,
      grossMargin: grossMarginStr,
      operatingMargin: `${operatingMargin.toFixed(1)}%`,
      debtLevel: deRatio > 1.5 ? 'Elevated' : deRatio > 0.8 ? 'Moderate' : 'Low/Conservative',
      debtToEquity: deRatioStr,
      cashFlow: `Strong operational cash generation of ${formatBillion(currentYearCF.operatingCashFlow)}.`,
      freeCashFlow: `Free Cash Flow yields ${formatBillion(currentYearCF.freeCashFlow)} after accounting for ${formatBillion(capEx)} CapEx.`,
      valuationSummary: `Trading at a P/E of ${financials.peRatio} and P/B of ${financials.pbRatio}.`,
      peRatio: `${financials.peRatio}x`,
      pbRatio: `${financials.pbRatio}x`,
      growthOutlook: revGrowth > 10 ? 'Robust expansion expected' : 'Stable maturity curve',
      financialHealthScore,
      evidence: [
        `Revenue grew ${revGrowthStr} YoY to ${formatBillion(currentYearIS.revenue)}`,
        `Maintained strong profit margins with a Net Margin of ${netMarginStr}`,
        `Debt-to-Equity ratio sits at ${deRatioStr}`,
        `Generated ${formatBillion(currentYearCF.freeCashFlow)} in Free Cash Flow`
      ]
    };

    if (step2) { step2.status = 'completed'; step2.timestamp = Date.now(); }
    send('timeline', timeline);
    send('financial', financialHealth);

    // 3. Risk Node
    const step3 = timeline.find((s) => s.id === 'risk');
    if (step3) step3.status = 'running';
    send('timeline', timeline);
    await delay(1200);

    const redFlags: RedFlagType[] = [];
    if (deRatio > 1.5) redFlags.push('High Debt');
    if (currentYearCF.freeCashFlow < 0) redFlags.push('Weak Cash Flow');
    if (currentYearIS.netIncome < 0) redFlags.push('Negative Earnings');
    if (revGrowth < 0) redFlags.push('Declining Revenue');
    if (financials.peRatio > 45) redFlags.push('Overvaluation');
    if (financials.recentHeadlines.some((h) => h.includes('Regulatory') || h.includes('Privacy'))) {
      redFlags.push('Legal Issues');
    }

    const riskScore = Math.max(
      10,
      100 - (redFlags.length * 15) - (deRatio > 1.5 ? 20 : 0) - (financials.peRatio > 50 ? 15 : 0)
    );

    const riskAnalysis: RiskAnalysis = {
      legalIssues: redFlags.includes('Legal Issues')
        ? 'Subject to regulatory scrutiny and inquiries regarding consumer data privacy.'
        : 'No major pending material lawsuits, standard sector compliance.',
      marketRisks: 'Susceptible to cyclical macroeconomic adjustments and inflation pressures.',
      competitionRisks: 'Intensifying competition from low-cost market entrants eroding legacy market shares.',
      regulatoryRisks: 'Global compliance and tax adjustments could impact overseas revenue conversion.',
      economicThreats: 'Higher interest rates could impact consumer spending power in discretionary segments.',
      recentControversies: 'Minor complaints regarding labor unionization drives and corporate tax restructuring.',
      overallRiskLevel: redFlags.length >= 3 ? 'High' : redFlags.length >= 1 ? 'Medium' : 'Low',
      riskScore,
      redFlags,
      evidence: [
        `Detected ${redFlags.length} active red flags`,
        `Debt-to-Equity ratio is ${deRatioStr}`,
        `P/E valuation multiplier sits at ${financials.peRatio}x`
      ]
    };

    if (step3) { step3.status = 'completed'; step3.timestamp = Date.now(); }
    send('timeline', timeline);
    send('risk', riskAnalysis);

    // 4. Sentiment Node
    const step4 = timeline.find((s) => s.id === 'sentiment');
    if (step4) step4.status = 'running';
    send('timeline', timeline);
    await delay(1200);

    const newsHasBadHeadlines = financials.recentHeadlines.some(
      (h) => h.includes('Regulatory') || h.includes('Slower Growth') || h.includes('Controversy')
    );

    const bullishScore = newsHasBadHeadlines ? 65 : 82;
    const bearishScore = newsHasBadHeadlines ? 35 : 18;
    const sentimentScore = Math.round((bullishScore + (100 - bearishScore)) / 2);

    const marketSentiment: MarketSentimentAnalysis = {
      newsSentiment: newsHasBadHeadlines 
        ? 'Mixed. Strong operational press releases are balanced by regulatory coverage.' 
        : 'Highly positive. Dominating bullish coverage on strategic expansion.',
      marketSentiment: 'Bullish consensus with strong options volumes indicating near-term momentum.',
      analystSentiment: 'Consensus BUY rating among 85% of tracking investment banks.',
      socialSentiment: 'Active retail discussion. High sentiment scores on social boards.',
      bullishScore,
      bearishScore,
      overallSentiment: bullishScore > 70 ? 'Bullish' : bullishScore > 50 ? 'Neutral' : 'Bearish',
      sentimentScore,
      evidence: [
        `Bullish analyst consensus: ${bullishScore}% positive weighting`,
        `Recent news mentions highlight new international expansion and product pipelines`
      ]
    };

    if (step4) { step4.status = 'completed'; step4.timestamp = Date.now(); }
    send('timeline', timeline);
    send('sentiment', marketSentiment);

    // 5. Debate Node
    const step5 = timeline.find((s) => s.id === 'debate');
    if (step5) step5.status = 'running';
    send('timeline', timeline);
    await delay(1500);

    const debate: DebateOutput = {
      bullCase: {
        title: `Ecosystem Synergy & Multi-Sector Dominance`,
        points: [
          `${financials.companyName} possesses a solid economic moat with high customer switching costs, making it extremely difficult for competitors to steal market share.`,
          `A YoY growth of ${revGrowthStr} demonstrates that the business is still expanding its product footprint despite macroeconomic constraints.`,
          `Generating ${formatBillion(currentYearCF.freeCashFlow)} in Free Cash Flow provides massive capital allocation options, including acquisitions and share repurchases.`
        ],
        conclusion: `A must-own secular compounder with unmatched financial stability and product lock-in.`
      },
      bearCase: {
        title: `High Valuation Multiples & Macroeconomic Drag`,
        points: [
          `At a P/E of ${financials.peRatio}x, the stock trades at a premium valuation that has priced in near-perfect growth execution, offering little margin of safety.`,
          `Regulatory compliance and legal investigations pose constant threats of fines and forced structural adjustments.`,
          `Cyclical consumer exposure could drag down sales if inflation persists and interest rates remain high.`
        ],
        conclusion: `The risk-reward ratio is skewed negatively due to premium pricing. Investors should wait for a pullback.`
      }
    };

    if (step5) { step5.status = 'completed'; step5.timestamp = Date.now(); }
    send('timeline', timeline);
    send('debate', debate);

    // Algorithmic Buy Recommender factoring Risk Appetite and Horizon (Pre-calculated for Committee Alignment)
    let recommendation: Recommendation = 'WATCH';
    let scoreModifier = 0;

    if (revGrowth > 8 && netMargin > 15 && deRatio < 1.4) {
      recommendation = 'BUY';
    } else if (revGrowth < 2 || netMargin < 5 || deRatio > 1.8) {
      recommendation = 'PASS';
    }

    // Apply simulator adjustments
    if (simulatorSettings.riskAppetite === 'Conservative') {
      scoreModifier -= 8;
      if (recommendation === 'BUY' && (financials.peRatio > 35 || deRatio > 1.2)) {
        recommendation = 'WATCH'; // Downgrade due to caution
      }
    } else if (simulatorSettings.riskAppetite === 'Aggressive') {
      scoreModifier += 5;
      if (recommendation === 'WATCH') {
        recommendation = 'BUY'; // Upgrade due to high tolerance
      }
    }

    if (simulatorSettings.investmentHorizon === '1 Year') {
      scoreModifier -= 5;
      if (recommendation === 'BUY') {
        recommendation = 'WATCH'; // Short term is risky
      }
    } else if (simulatorSettings.investmentHorizon === '10 Years') {
      scoreModifier += 8;
    }

    // 5.5 Investment Committee Node
    const stepCommitteeSim = timeline.find((s) => s.id === 'committee');
    if (stepCommitteeSim) stepCommitteeSim.status = 'running';
    send('timeline', timeline);
    await delay(1500);

    const simulatedCommittee: InvestmentCommittee = {
      growthInvestor: {
        recommendation: revGrowth > 8 ? 'BUY' : 'WATCH',
        confidence: revGrowth > 8 ? 85 : 70,
        reasons: [
          `YoY revenue growth stands at ${revGrowthStr}, demonstrating robust market expansion.`,
          `Competitive moat supports key pricing power across primary categories.`,
          `Secular expansion tailwinds provide solid long-term product lock-in.`
        ]
      },
      valueInvestor: {
        recommendation: financials.peRatio < 28 ? 'BUY' : 'WATCH',
        confidence: financials.peRatio < 28 ? 82 : 68,
        reasons: [
          `Valuation multiples represent P/E rating of ${financials.peRatio}x.`,
          `Free Cash Flow conversion provides high capital safety margin.`,
          `Manageable debt level with leverage ratio computed at ${deRatioStr} D/E.`
        ]
      },
      riskAnalyst: {
        recommendation: riskScore > 75 ? 'BUY' : 'WATCH',
        confidence: riskScore > 75 ? 80 : 65,
        reasons: [
          `Overall risk profile rated at ${riskAnalysis.overallRiskLevel} indicating controlled exposure.`,
          `Potential headwind includes regulatory privacy and antitrust checks.`,
          `Strong capital cushion buffers against macroeconomic margin volatility.`
        ]
      },
      committeeDecision: {
        recommendation: recommendation,
        voteCount: {
          BUY: (revGrowth > 8 ? 1 : 0) + (financials.peRatio < 28 ? 1 : 0) + (riskScore > 75 ? 1 : 0),
          WATCH: (revGrowth > 8 ? 0 : 1) + (financials.peRatio < 28 ? 0 : 1) + (riskScore > 75 ? 0 : 1),
          PASS: 0
        },
        confidence: Math.round(((revGrowth > 8 ? 85 : 70) + (financials.peRatio < 28 ? 82 : 68) + (riskScore > 75 ? 80 : 65)) / 3),
        summary: `The Investment Committee reached a consensus of ${recommendation} for ${financials.companyName}. The Growth Investor emphasized top-line expansion, while the Value Investor focused on capital ratios.`,
        dominantPersona: 'Growth Investor'
      }
    };

    // Ensure votes sum to 3
    const buyVotes = simulatedCommittee.committeeDecision.voteCount.BUY;
    const watchVotes = simulatedCommittee.committeeDecision.voteCount.WATCH;
    simulatedCommittee.committeeDecision.voteCount.PASS = 3 - buyVotes - watchVotes;

    if (stepCommitteeSim) { stepCommitteeSim.status = 'completed'; stepCommitteeSim.timestamp = Date.now(); }
    send('timeline', timeline);
    send('committee', simulatedCommittee);

    // 6. Decision Node
    const step6 = timeline.find((s) => s.id === 'decision');
    if (step6) step6.status = 'running';
    send('timeline', timeline);
    await delay(1800);

    const overallScore = Math.min(
      98,
      Math.max(
        15,
        Math.round(
          (financialHealthScore * 0.4) + 
          (riskScore * 0.3) + 
          (sentimentScore * 0.3) + 
          scoreModifier
        )
      )
    );

    // Portfolio Fit
    const portfolioFit: InvestorProfile[] = [];
    if (overallScore > 70) portfolioFit.push('Long-Term Investors');
    if (revGrowth > 12) portfolioFit.push('Growth Investors');
    if (financials.peRatio < 20) portfolioFit.push('Value Investors');
    if (financials.dividendYield > 1.5) portfolioFit.push('Dividend Investors');
    if (simulatorSettings.riskAppetite === 'Aggressive') portfolioFit.push('High-Risk Investors');
    if (portfolioFit.length === 0) portfolioFit.push('Long-Term Investors');

    const confidencePercentage = Math.round(overallScore * 0.95);
    const confidenceLevel: ConfidenceLevel = confidencePercentage > 75 ? 'High' : confidencePercentage > 50 ? 'Medium' : 'Low';

    const decision: DecisionAnalysis = {
      recommendation,
      confidencePercentage,
      confidenceLevel,
      confidenceExplanation: errorMessage
        ? `[LIVE API ERROR] Gemini call failed: "${errorMessage}". Falling back to high-fidelity procedural simulation. Confidence level is ${confidenceLevel} based on ${financials.companyName}'s current margins (${netMarginStr}) and balance sheet metrics.`
        : `[SIMULATION MODE] Set GEMINI_API_KEY in .env.local for live Gemini analyses. Showing high-fidelity procedural simulation. Confidence level is ${confidenceLevel} based on ${financials.companyName}'s current margins (${netMarginStr}) and balance sheet metrics.`,
      executiveSummary: `Following a comprehensive diagnostic review of ${financials.companyName}, the system has flagged a ${recommendation} rating. The company exhibits robust financial health with an operating margin of ${operatingMargin.toFixed(1)}% and strong Free Cash Flow, which is offset by a premium valuation of ${financials.peRatio}x P/E. Under the simulated ${simulatorSettings.riskAppetite} risk parameters over a ${simulatorSettings.investmentHorizon} horizon, the position balances secular growth against valuation multipliers.`,
      completeReasoning: `Financials: Strong balance sheet with D/E of ${deRatioStr}. FCF conversion stands at ${(currentYearCF.freeCashFlow / currentYearCF.operatingCashFlow * 100).toFixed(0)}%.
        Risks: Valuation multiples are high, meaning the price incorporates optimistic growth metrics.
        Debate Verdict: The Bull Case is backed by solid ecosystem moat, while the Bear Case centers on pricing limits.
        Horizon Verdict: Over a ${simulatorSettings.investmentHorizon} horizon, the structural advantages of ${financials.companyName} are expected to play out.`,
      keyStrengths: [
        `Excellent operating margins of ${netMarginStr}`,
        `Compounded annual revenue of ${formatBillion(currentYearIS.revenue)}`,
        `Consistent cash generator with ${formatBillion(currentYearCF.freeCashFlow)} in FCF`,
        `Significant market entry barriers protecting market share`
      ],
      majorRisks: [
        `Valuation premium with P/E of ${financials.peRatio}x`,
        `Increasing cost of customer acquisition in core sectors`,
        `Susceptibility to legal and regulatory privacy compliance audits`
      ],
      investmentHorizon: simulatorSettings.investmentHorizon,
      bullThesis: `secular expansion of core services coupled with ecosystem scaling. Capital allocation remains optimal.`,
      bearThesis: `valuation contraction and growth slowdown in legacy divisions due to macroeconomic pressure.`,
      portfolioFit,
      overallScore,
      financialHealthScore,
      growthScore: Math.round(Math.min(100, Math.max(20, revGrowth * 4 + 20))),
      riskScore,
      sentimentScore,
      valuationScore: Math.round(Math.max(10, 100 - financials.peRatio)),
      evidence: [
        `Procedural data source parsed ${financials.companyName}`,
        `YoY growth rate verified at ${revGrowthStr}`,
        `Net Profit Margin calculated at ${netMarginStr}`,
        `Calculated debt leverage is ${deRatioStr}`,
        `Market Sentiment index holds at ${sentimentScore}/100`
      ]
    };

    if (step6) { step6.status = 'completed'; step6.timestamp = Date.now(); }
    send('timeline', timeline);
    send('decision', decision);

    // Save mock simulation output to cache if active
    const resultData = {
      companyIntelligence,
      financialHealth,
      riskAnalysis,
      marketSentiment,
      debate,
      committee: simulatedCommittee,
      decision
    };
    if (useCache) {
      saveCachedResponse(companyName, resultData);
    }

    send('cacheStatus', {
      source: 'live',
      createdAt: new Date().toISOString(),
      ageText: 'Just now',
      latencyMs: Date.now() - startTime
    });

    send('complete', { success: true });
  }

  if (apiKey) {
    // ─── LIVE NODE.JS LANGGRAPH WORKFLOW ─────────────────────────────────────
    (async () => {
      try {
        send('timeline', timeline);

        // Fetch company financials
        const financials = getCompanyFinancials(companyName);
        const financialContext = formatFinancialsForPrompt(financials);

        // Compile and run the graph
        const graph = createResearchGraph();

        // Update timeline status to running for research phase
        ['research', 'financial', 'risk', 'sentiment'].forEach((id) => {
          const step = timeline.find((s) => s.id === id);
          if (step) step.status = 'running';
        });
        send('timeline', timeline);

        const result = await graph.invoke({
          companyName,
          simulatorSettings,
          financialContext,
          companyIntelligence: undefined,
          financialHealth: undefined,
          riskAnalysis: undefined,
          marketSentiment: undefined,
          debate: undefined,
          committee: undefined,
          decision: undefined,
          timeline,
          error: undefined,
        });

        if (
          result.error ||
          !result.companyIntelligence ||
          !result.financialHealth ||
          !result.riskAnalysis ||
          !result.marketSentiment ||
          !result.debate ||
          !result.committee ||
          !result.decision
        ) {
          throw new Error(result.error || 'One or more agents failed to return valid analysis results.');
        }

        // Stream results
        if (result.companyIntelligence) {
          const step = timeline.find((s) => s.id === 'research');
          if (step) { step.status = 'completed'; step.timestamp = Date.now(); }
          send('timeline', timeline);
          send('intelligence', result.companyIntelligence);
        }

        if (result.financialHealth) {
          const step = timeline.find((s) => s.id === 'financial');
          if (step) { step.status = 'completed'; step.timestamp = Date.now(); }
          send('timeline', timeline);
          send('financial', result.financialHealth);
        }

        if (result.riskAnalysis) {
          const step = timeline.find((s) => s.id === 'risk');
          if (step) { step.status = 'completed'; step.timestamp = Date.now(); }
          send('timeline', timeline);
          send('risk', result.riskAnalysis);
        }

        if (result.marketSentiment) {
          const step = timeline.find((s) => s.id === 'sentiment');
          if (step) { step.status = 'completed'; step.timestamp = Date.now(); }
          send('timeline', timeline);
          send('sentiment', result.marketSentiment);
        }

        if (result.debate) {
          const step = timeline.find((s) => s.id === 'debate');
          if (step) { step.status = 'completed'; step.timestamp = Date.now(); }
          send('timeline', timeline);
          send('debate', result.debate);
        }

        if (result.committee) {
          const step = timeline.find((s) => s.id === 'committee');
          if (step) { step.status = 'completed'; step.timestamp = Date.now(); }
          send('timeline', timeline);
          send('committee', result.committee);
        }

        if (result.decision) {
          const step = timeline.find((s) => s.id === 'decision');
          if (step) { step.status = 'completed'; step.timestamp = Date.now(); }
          send('timeline', timeline);
          send('decision', result.decision);
        }

        // Save completed live response to cache if active
        const resultData = {
          companyIntelligence: result.companyIntelligence,
          financialHealth: result.financialHealth,
          riskAnalysis: result.riskAnalysis,
          marketSentiment: result.marketSentiment,
          debate: result.debate,
          committee: result.committee,
          decision: result.decision
        };
        if (useCache) {
          saveCachedResponse(companyName, resultData);
        }

        send('cacheStatus', {
          source: 'live',
          createdAt: new Date().toISOString(),
          ageText: 'Just now',
          latencyMs: Date.now() - startTime
        });

        send('complete', { success: true });
      } catch (error) {
        console.error('Research live workflow error:', error);
        console.log('Falling back to high-fidelity simulation mode...');

        // Map raw API errors to user-friendly messages
        const errorStr = error instanceof Error ? error.message : String(error);
        let friendlyErrorMsg = errorStr;
        if (errorStr.includes('429') || errorStr.includes('QuotaExhausted') || errorStr.includes('quota')) {
          friendlyErrorMsg = 'Gemini API rate limit or quota exceeded. Please check your Google AI Studio account limits or try again in a few minutes.';
        } else if (errorStr.includes('404') || errorStr.includes('not found') || errorStr.includes('ModelService.ListModels')) {
          friendlyErrorMsg = 'The requested Gemini model is currently unavailable or deprecated. Please verify API model settings or key permissions.';
        } else if (errorStr.includes('API key') || errorStr.includes('API_KEY') || errorStr.includes('key not valid') || errorStr.includes('401') || errorStr.includes('403')) {
          friendlyErrorMsg = 'Invalid API key or authentication failure. Please check the GEMINI_API_KEY environment variable in your .env.local file.';
        } else {
          friendlyErrorMsg = `Live analysis encountered an error: ${errorStr.slice(0, 150)}...`;
        }

        // Reset timeline status for clean simulation pipeline animation
        timeline.forEach((step) => {
          step.status = 'pending';
          step.timestamp = undefined;
        });
        try {
          await runSimulation(friendlyErrorMsg);
        } catch (simError) {
          console.error('Simulation fallback error:', simError);
          send('error', {
            message: friendlyErrorMsg,
          });
        }
      } finally {
        close();
      }
    })();
  } else {
    // ─── HIGH-FIDELITY SIMULATION MODE ───────────────────────────────────────
    (async () => {
      try {
        await runSimulation();
      } catch (simError) {
        console.error('Simulation fallback error:', simError);
        send('error', {
          message: simError instanceof Error ? simError.message : 'An unexpected error occurred during simulation fallback',
        });
      } finally {
        close();
      }
    })();
  }

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
