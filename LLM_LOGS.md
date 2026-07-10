# Engineering Journal: AI-Assisted Development

This document tracks the engineering decisions, prompt objectives, and developer choices made during the development of the **InvestIQ AI** platform.

---

## 1. System Architecture & Orchestration

* **Prompt Objective**: Define a multi-persona investment research pipeline.
* **AI Suggestion**: Spawn multiple independent agent nodes (Intelligence, Sentiment, Financial, Risk, etc.) in a parallel fan-out structure using LangGraph.
* **Final Engineering Decision**: 
  * Consolidate the Overview, Sentiment, and News agents into a single `consolidatedResearchAgent` node.
  * Reallocate financial scoring and risk assessments to local TypeScript functions.
  * Keep the remaining nodes sequential: `research` ➔ `financial` ➔ `risk` ➔ `run_debate` ➔ `run_committee` ➔ `run_decision`.
* **Reason**: Initial tests using parallel Gemini calls hit rate limits (`429 Too Many Requests`) quickly. Moving computations to local TypeScript functions reduced API calls by over **60%**, ensuring the app remains stable under free tier quotas.

---

## 2. Quantitative Calculations

* **Prompt Objective**: Implement financial margin calculations and debt assessment logic.
* **AI Suggestion**: Pass financial statements to a Gemini node and ask it to parse the tables and return margin percentages and debt levels.
* **Final Engineering Decision**: 
  * Implement calculations programmatically in `agents/financial.ts` and `agents/risk.ts` using structured statement inputs.
* **Reason**: Asking the LLM to perform arithmetic caused frequent calculations errors (hallucinations) and increased token utilization. Moving this logic to TypeScript ensures 100% mathematical accuracy and drops execution latency to 0ms.

---

## 3. Local Cache Layer (Smart Cache)

* **Prompt Objective**: Implement caching to reduce API utilization during UI development.
* **AI Suggestion**: Add a cache table in an external database to store query results.
* **Final Engineering Decision**: 
  * Implement a filesystem-based cache using local JSON files stored in `/cache/`.
  * Define helper functions (`getCachedResponse`, `saveCachedResponse`) to normalize search queries (e.g. `APPLE` -> `apple`).
* **Reason**: Filesystem caching is simple to implement, has zero external database dependencies, and allows developers to run the application offline during UI development.

---

## 4. Multi-Persona Committee Synthesis

* **Prompt Objective**: Implement an Investment Committee representing Growth, Value, and Risk Analyst perspectives.
* **AI Suggestion**: Spawn three independent agent nodes in parallel, each prompted with a specific persona, and run a fourth node to count votes.
* **Final Engineering Decision**: 
  * Consolidate all three reviews and the vote count into **one optimized reasoning call** inside `agents/committee.ts`.
* **Reason**: Running separate calls for each persona increased API usage and caused rate limit errors. Consolidating the reviews into a single prompt significantly reduces API costs while retaining distinct persona evaluations.

---

## 5. Structured JSON Outputs & Parsing

* **Prompt Objective**: Parse structured JSON outputs from Gemini streams without crashing when responses are truncated.
* **AI Suggestion**: Wrap parsing logic in standard `JSON.parse` blocks.
* **Final Engineering Decision**: 
  * Add custom validation checks in `lib/gemini.ts` to verify response completion (by checking finish reason codes and matching brackets `}`/`]`).
  * If validation fails, trigger a procedural simulation fallback to keep the interface interactive.
* **Reason**: If Gemini hits token limits, it outputs truncated JSON strings that cause standard parsers to crash. Implementing validation checks ensures the application can catch errors and fall back gracefully.
