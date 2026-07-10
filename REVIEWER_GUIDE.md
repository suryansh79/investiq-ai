# Engineering Reviewer Guide

Welcome to the **InvestIQ AI** technical review guide. This document is structured for engineering managers and senior AI engineers to evaluate the codebase and system features in under five minutes.

---

## 1. Quick Code Tour (Where to Look)

To evaluate the engineering quality of this project, focus on these files:

* **Stateful Graph Orchestration**: 
  * [langgraph/graph.ts](file:///c:/Projects/Investment/langgraph/graph.ts): Configures the LangGraph sequential nodes: `research` ➔ `financial` ➔ `risk` ➔ `run_debate` ➔ `run_committee` ➔ `run_decision`.
* **Programmatic TypeScript Calculations**:
  * [agents/financial.ts](file:///c:/Projects/Investment/agents/financial.ts): Implements margin math and scoring criteria directly in code to avoid LLM hallucinations.
  * [agents/risk.ts](file:///c:/Projects/Investment/agents/risk.ts): Rule-based compliance logic that programmatically triggers warnings (e.g. leverage thresholds) without API calls.
* **Smart Response Cache Layer**:
  * [lib/cache.ts](file:///c:/Projects/Investment/lib/cache.ts): Handles ticker normalization (e.g. `APPLE` -> `apple`) and filesystem JSON reads and writes.
  * [app/api/research/route.ts](file:///c:/Projects/Investment/app/api/research/route.ts#L78-L135): Intercepts requests, serves cache hits instantly, and streams timeline logs.
* **Optimized Multi-Persona Committee Node**:
  * [agents/committee.ts](file:///c:/Projects/Investment/agents/committee.ts): Role-plays Growth, Value, and Risk Analyst personas and tallies their votes inside **one optimized reasoning call** to preserve API quota.

---

## 2. Walkthrough & Evaluation Playbook

Follow these steps to verify key features in your browser:

### Step A: Verify the Smart Cache (Research Vault)
1. Launch the application at `http://localhost:3000`.
2. Input `Apple` in the search bar and click **Analyze**.
3. **Observation (Cache Miss)**: 
   * The live activity console will stream logs sequentially (takes ~4.5s).
   * Once completed, a green badge displays: `🟢 Live AI (4.5s)`.
4. Click **New Analysis** or return to the landing page.
5. Search for `Apple` again.
6. **Observation (Cache Hit)**:
   * The dashboard loads instantly.
   * The header badge displays: `🟡 Cached Response (Cached just now)`.
   * Execution time drops to **15 milliseconds**.

### Step B: Verify the Force Cache Override
1. On the cached Apple dashboard, locate the header section next to the badge.
2. Click **Refresh from AI**.
3. **Observation (Cache Bypass)**:
   * The system ignores the local cache file, queries the live API (or fallback simulation), and overwrites the local cache file.
   * The header badge updates to: `🟢 Live AI`.

### Step C: Verify Parallel Streams in Comparison Mode
1. Click **Compare Mode** on the landing page.
2. Input `Apple` and `Google` in the input fields, and click **Analyze Comparison**.
3. **Observation**:
   * Two parallel SSE streams run side-by-side, displaying independent progress bars and timelines.
   * The comparison synthesis verdict matches Google's balance sheet advantages against Apple's premium hardware margins.

---

## 3. Recommended Screenshots for Capture

When capturing visual sitemaps of the system, focus on these UI configurations:

1. **Landing Page**: Capture the clean dark-themed search interface with suggest cards and the LangGraph workflow diagram visible.
2. **Analysis Progress Stream**: Capture the loading screen while the progress bar runs and the log console scrolls.
3. **Single Asset Dashboard (Cache Miss)**: Capture the final dashboard showing `🟢 Live AI (Latency)`, the Score Breakdown radar grid, and the Investment Committee vote charts.
4. **Single Asset Dashboard (Cache Hit)**: Capture the top report signed docket showing the `🟡 Cached Response` badge and the `Refresh from AI` button.
5. **Comparison Dashboard**: Capture the side-by-side comparison tables, showing metric columns and the synthesised verdict card.
