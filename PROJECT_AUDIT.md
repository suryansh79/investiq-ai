# Project Audit Report

This report catalogs all implementations, API configurations, component structures, design patterns, and optimization strategies in **InvestIQ AI**.

---

## 1. Technical Stack & Dependencies

* **Core Web Framework**: Next.js 16 (App Router)
* **Programming Language**: TypeScript 5.0
* **AI Orchestration Framework**: LangGraph.js 1.4, LangChain Core 1.2
* **Generative Model Providers**: Google Gemini 2.5 Flash (`@langchain/google-genai`)
* **Styling Engine**: TailwindCSS v4 with PostCSS
* **Visualizations**: Recharts 3.9 (SVG-based charts)
* **Interface Animations**: Framer Motion 12.0

---

## 2. API Endpoints Map

### 1. Research Execution SSE Stream (`/api/research`)
* **Method**: `POST`
* **Transport**: Server-Sent Events (`text/event-stream`)
* **Payload Ingestion**:
  * `companyName` (String): Search query target.
  * `simulatorSettings` (SimulatorSettings): Risk appetite and horizon profiles.
  * `forceRefresh` (Boolean): Ignores local cache when true, querying live models.
* **Functionality**: Loads database arrays, runs cache checks, initializes LangGraph nodes, streams timeline updates, and writes completed JSON models to `/cache/`.

### 2. Comparison Synthesis (`/api/compare`)
* **Method**: `POST`
* **Transport**: Standard HTTP JSON
* **Payload Ingestion**:
  * `resultA` (AnalysisResult): Completed analysis data for company A.
  * `resultB` (AnalysisResult): Completed analysis data for company B.
  * `simulatorSettings` (SimulatorSettings): User parameters.
* **Functionality**: Formulates comparative metrics, highlights valuations and margins, queries Gemini, and returns a synthesised verdict matching company strengths.

---

## 3. LangGraph Workflow Node Pipeline

The orchestrator is built inside [langgraph/graph.ts](file:///c:/Projects/Investment/langgraph/graph.ts), managing the state sequential chain:

```
[START] ➔ consolidatedResearchAgent ➔ financialHealthAgent ➔ riskAnalysisAgent ➔ debateAgents ➔ committeeAgent ➔ decisionAgent ➔ [END]
```

1. **`research` Node** (`consolidatedResearchAgent`): Confines Gemini to generating high-level business models, sector categories, competitive moats, key officers, and news sentiments in one call.
2. **`financial` Node** (`financialHealthAgent`): Programmatic TypeScript compiler. Computes gross, operating, and net margins, revenue growth rates, and assigns base health scores. Uses **0 LLM calls**.
3. **`risk` Node** (`riskAnalysisAgent`): TypeScript compliance checker. Compares D/E and cash flows against limits, flagging operational red flags (e.g. `High Debt` if $D/E > 1.8$). Sector risks are appended programmatically. Uses **0 LLM calls**.
4. **`run_debate` Node** (`debateAgents`): Toggleable node. If debate mode is disabled in settings, returns structured cases instantly in TypeScript. If active, prompts Gemini to compile Bull/Bear cases.
5. **`run_committee` Node** (`committeeAgent`): Conveniently role-plays Growth, Value, and Risk personas. Compiles reviews and tallies votes in a single consolidated reasoning call.
6. **`run_decision` Node** (`decisionAgent`): Final synthesizer. Adjusts ratings against risk/horizon parameters and computes a blended score programmatically.

---

## 4. UI Components Inventory

* **[Dashboard](file:///c:/Projects/Investment/components/Dashboard.tsx)**: Manages layout cards, margins, gauges, and thesis blocks for single-company dockets.
* **[ComparisonDashboard](file:///c:/Projects/Investment/components/ComparisonDashboard.tsx)**: Renders comparison columns and side-by-side metric gauges.
* **[CommitteePanel](file:///c:/Projects/Investment/components/CommitteePanel.tsx)**: Displays the expert card grid and Consensus verdict vote counts.
* **[LoadingScreen](file:///c:/Projects/Investment/components/LoadingScreen.tsx)**: Real-time agent console log tracing terminal feed.
* **[ScoreBreakdown](file:///c:/Projects/Investment/components/ScoreBreakdown.tsx)**: Renders the radar graph and metrics progress bars.
* **[ScoreGauge](file:///c:/Projects/Investment/components/ScoreGauge.tsx)**: Concentric overall score indicators.
* **[ConfidenceMeter](file:///c:/Projects/Investment/components/ConfidenceMeter.tsx)**: Percentage bar tracking recommendation confidence.
* **[Timeline](file:///c:/Projects/Investment/components/Timeline.tsx)**: Checklist items tracker for agent progress.
* **[Simulator](file:///c:/Projects/Investment/components/Simulator.tsx)**: Settings panel managing parameters.
* **[RecommendationBadge](file:///c:/Projects/Investment/components/RecommendationBadge.tsx)**: Seal styling final BUY/WATCH/PASS ratings.
* **[RedFlags](file:///c:/Projects/Investment/components/RedFlags.tsx)**: Alert flags listing balance sheet concerns.
* **[EvidencePanel](file:///c:/Projects/Investment/components/EvidencePanel.tsx)**: Footnotes section listing source data points.
* **[DebatePanel](file:///c:/Projects/Investment/components/DebatePanel.tsx)**: Collapsible containers highlighting Bull/Bear points.

---

## 5. Architectural & Design Patterns

* **Pipeline Pattern**: Directs data flow sequentially within [graph.ts](file:///c:/Projects/Investment/langgraph/graph.ts).
* **State Pattern**: Flows intermediate results using the shared state annotation `ResearchStateAnnotation`.
* **Strategy Pattern**: The Decision Agent adapts ratings dynamically based on user risk profiles.
* **Repository Pattern**: Abstracts local JSON operations behind `getCachedResponse` and `saveCachedResponse` in `lib/cache.ts`.
* **Separation of Concerns**: Strictly separates presentation (React), graph orchestration (LangGraph), calculation engines (TypeScript), and qualitative reasoning (Gemini).
* **Fail-Safe Design**: Reverts to simulated mode if Gemini API key limits are reached, ensuring application stability.

---

## 6. Project Cleanups & Solved Technical Debt

* **Unused Files Deleted**:
  * `agents/intelligence.ts` (Dead code: replaced by consolidated research node).
  * `agents/sentiment.ts` (Dead code: replaced by consolidated research node).
* **Resolved Auto-Scroll Jumps**: Replaced page-level `scrollIntoView` triggers with container-level `scrollTo` bindings inside [LoadingScreen.tsx](file:///c:/Projects/Investment/components/LoadingScreen.tsx#L36-L45) to prevent layout shifts.
* **Resolved Radar Chart Flickering**: Omitted scaling animation loops inside [ScoreBreakdown.tsx](file:///c:/Projects/Investment/components/ScoreBreakdown.tsx#L38-L45) to prevent Recharts redraw triggers.
