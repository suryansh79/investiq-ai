# Platform Walkthroughs & Example Runs

This document demonstrates the execution flow, state compilation, and expected output logs of **InvestIQ AI** across single search and comparative matchups.

---

## Example 1: Single Asset Analysis — Apple Inc. (AAPL)

### 1. Ingest Settings & Input
* **Company Query**: `Apple`
* **Risk Appetite**: `Moderate`
* **Investment Horizon**: `3 Years`
* **Debate Mode**: `OFF`

### 2. Live Execution Stream Logs (Console Timeline)
```
[10:04:12.115] [INIT] Ingesting company: Apple
[10:04:12.230] [ROUTE] USE_CACHE is active. Checking cache/apple.json...
[10:04:12.235] [CACHE] Cache miss. Starting live LangGraph pipeline...
[10:04:12.240] [NODE] Starting: 'research' (Consolidated Overview & Sentiment)
[10:04:13.415] [NODE] Completed: 'research' in 1175ms
[10:04:13.420] [NODE] Starting: 'financial' (TypeScript Compute Engine)
[10:04:13.422] [NODE] Completed: 'financial' in 2ms
[10:04:13.425] [NODE] Starting: 'risk' (TypeScript Risk Assesser)
[10:04:13.427] [NODE] Completed: 'risk' in 2ms
[10:04:13.430] [NODE] Starting: 'run_debate' (Programmatic TS Debate generator)
[10:04:13.431] [NODE] Completed: 'run_debate' in 1ms
[10:04:13.435] [NODE] Starting: 'run_committee' (Consolidated Expert Call)
[10:04:15.110] [NODE] Completed: 'run_committee' in 1675ms
[10:04:15.115] [NODE] Starting: 'run_decision' (Executive Verdict Call)
[10:04:16.890] [NODE] Completed: 'run_decision' in 1775ms
[10:04:16.910] [CACHE] Autosaved output to cache/apple.json
[10:04:16.915] [STREAM] Pushed cacheStatus: live (Latency: 4675ms)
[10:04:16.920] [ROUTE] SSE Connection terminated.
```

### 3. Compiled Analysis Results

#### Programmatic Margins & Scores
* **YoY Revenue Growth**: `+5.0%`
* **Operating Profit Margin**: `30.2%`
* **Net Profit Margin**: `26.0%`
* **Balance Sheet Leverage (D/E)**: `1.80`
* **Financial Health Score**: `80 / 100` *(Robust margins offset by high debt)*

#### Risk Red Flags & Warning Triggers
* **Triggered Red Flags**: `[Overvaluation]` (P/E is 33.5x)
* **Risk Score**: `70 / 100` (Inverted: higher is safer)
* **Risk Level**: `Medium`

#### AI Investment Committee Voting
* **Growth Investor**: `BUY` (Confidence: 85%)
  * *Reasoning*: High ecosystem switching costs and premium hardware pricing power secure future expansion.
* **Value Investor**: `WATCH` (Confidence: 72%)
  * *Reasoning*: Elevated P/E multiple limits immediate margin of safety.
* **Risk Analyst**: `WATCH` (Confidence: 65%)
  * *Reasoning*: Geopolitical exposure in overseas supply chains creates supply risks.
* **Consensus Verdict**: `WATCH` (1 Vote BUY, 2 Votes WATCH, 0 Votes PASS)

#### Final Recommendation Synthesis
* **Final Verdict**: `WATCH`
* **Blended Overall Score**: `74 / 100`
* **Confidence Level**: `Medium` (Blended Confidence: 70%)
* **Investment Horizon**: `3 Years`

---

## Example 2: Single Asset Analysis — JPMorgan Chase (JPM)

### 1. Ingest Settings & Input
* **Company Query**: `JPMorgan`
* **Risk Appetite**: `Conservative`
* **Investment Horizon**: `1 Year`
* **Debate Mode**: `ON`

### 2. Live Execution Stream Logs (Console Timeline)
```
[10:05:01.002] [INIT] Ingesting company: JPMorgan
[10:05:01.010] [ROUTE] USE_CACHE is active. Checking cache/jpmorgan.json...
[10:05:01.012] [CACHE] Cache Hit! Serving cached response instantly.
[10:05:01.015] [STREAM] Pushing event: timeline (completed)
[10:05:01.020] [STREAM] Pushing event: intelligence
[10:05:01.025] [STREAM] Pushing event: financial
[10:05:01.030] [STREAM] Pushing event: risk
[10:05:01.035] [STREAM] Pushing event: sentiment
[10:05:01.040] [STREAM] Pushing event: debate
[10:05:01.045] [STREAM] Pushing event: committee
[10:05:01.050] [STREAM] Pushing event: decision
[10:05:01.055] [STREAM] Pushed cacheStatus: cache (Age: Cached 2h ago, Latency: 15ms)
[10:05:01.060] [ROUTE] SSE Connection terminated.
```

### 3. Compiled Analysis Results

#### Programmatic Margins & Scores
* **YoY Revenue Growth**: `+6.0%`
* **Operating Profit Margin**: `34.0%`
* **Net Profit Margin**: `32.0%`
* **Balance Sheet Leverage (D/E)**: `1.30`
* **Financial Health Score**: `90 / 100` *(Stable operating metrics and manageable debt)*

#### Risk Red Flags & Warning Triggers
* **Triggered Red Flags**: `None`
* **Risk Score**: `85 / 100`
* **Risk Level**: `Low`

#### AI Investment Committee Voting
* **Growth Investor**: `WATCH` (Confidence: 65%)
  * *Reasoning*: Organic banking growth is stable but lacks tech-scale expansion.
* **Value Investor**: `BUY` (Confidence: 85%)
  * *Reasoning*: Valuation is attractive with P/E at 12.8x and high net interest income.
* **Risk Analyst**: `BUY` (Confidence: 80%)
  * *Reasoning*: Strong capital reserve margins exceed regulatory compliance limits.
* **Consensus Verdict**: `BUY` (2 Votes BUY, 1 Vote WATCH, 0 Votes PASS)

#### Final Recommendation Synthesis
* **Final Verdict**: `BUY`
* **Blended Overall Score**: `82 / 100` *(Adjusted down for Conservative 1-year profile)*
* **Confidence Level**: `High` (Blended Confidence: 81%)
* **Investment Horizon**: `1 Year`

---

## Example 3: Comparative Analysis — Apple (AAPL) vs. Google (GOOGL)

### 1. Ingest Settings & Input
* **Ticker A**: `Apple`
* **Ticker B**: `Google`
* **Risk Appetite**: `Moderate`
* **Investment Horizon**: `3 Years`

### 2. Parallel SSE Execution Flow
* **Connection A**: Client fires request for `Apple` (Streams timeline events).
* **Connection B**: Client fires request for `Google` (Streams timeline events in parallel).
* **Consolidation**: Once both SSE streams complete, the client triggers a POST request to `/api/compare` with both result objects.

### 3. Comparison Verdict Synthesis
* **Core Comparison Metrics**:
  * **Margins**: Google (Net: 25.0%, Operating: 26.5%) vs Apple (Net: 26.0%, Operating: 30.2%).
  * **Leverage (D/E)**: Google (0.10) vs Apple (1.80) *(Google exhibits a much stronger balance sheet)*.
  * **Valuation (P/E)**: Google (26.2x) vs Apple (33.5x) *(Google trades at a discount relative to Apple)*.
* **Comparison Verdict**:
  * **Winner**: `Google (GOOGL)`
  * **Synthesis Thesis**: While Apple maintains superior operating margins and brand loyalty, Google represents the better risk-adjusted opportunity. Google features a clean balance sheet (D/E of 0.10 vs Apple's 1.80) and a valuation discount (26.2x P/E vs 33.5x P/E), leaving a larger margin of safety.
