# System Design Document

This document outlines the system requirements, design constraints, and technical strategies implemented in **InvestIQ AI**.

---

## 1. System Requirements

### Functional Requirements
* **Single Asset Research**: Users can search for a company to view business overviews, financial metrics, and risk assessments.
* **Asset Comparison**: Users can compare two companies side-by-side, displaying comparison scores and an AI synthesis verdict.
* **AI Investment Committee**: Shows a breakdown of recommendations from Growth, Value, and Risk Analyst personas.
* **Live Activity Logs**: Displays progress logs and timeline steps as the analysis runs.
* **Smart Cache**: Automatically caches analysis results locally to speed up subsequent queries.
* **Manual Refresh**: Allows users to force-refresh cached data on-demand.

### Non-Functional Requirements
* **Accuracy**: Financial ratios and scores must be calculated programmatically to ensure precision.
* **Latency**: Caching should reduce response times to under 30ms for cached assets.
* **Resilience**: The platform must handle API failures, rate limits, and network dropouts gracefully without crashing.
* **Security**: API keys must be kept secure on the server side.

---

## 2. Technical Strategies

### Streaming Strategy (Server-Sent Events)
The platform uses **Server-Sent Events (SSE)** to stream results to the client. As each node in the LangGraph workflow resolves, it pushes updates over a persistent HTTP connection (`Content-Type: text/event-stream`). This provides real-time feedback in the UI and prevents request timeouts during long-running analyses.

### Caching Strategy (Research Vault)
* **Storage**: Local filesystem JSON files stored in `/cache/`.
* **Key Normalization**: Normalizes company search terms (e.g. `Tesla Inc.` -> `tesla`) to ensure consistent cache lookups.
* **Structure**: Saved files include metadata alongside the final response payload:
  ```json
  {
    "company": "Apple",
    "createdAt": "2026-07-10T01:00:00.000Z",
    "version": "1.0",
    "source": "cache",
    "response": { ... }
  }
  ```

### State Management & LLM Orchestration
The workflow is managed as a stateful graph using **LangGraph.js**. The state is accumulated incrementally across sequential nodes, allowing downstream nodes to access results compiled by upstream nodes.
```
[START] ➔ consolidatedResearchAgent ➔ financialHealthAgent ➔ riskAnalysisAgent ➔ debateAgents ➔ committeeAgent ➔ decisionAgent ➔ [END]
```

### Error Recovery & Resilience
* **API Exceptions**: If Gemini API requests fail (due to network issues or rate limits), the backend catches the error, logs it, and falls back to a high-fidelity procedural simulation.
* **JSON Validation**: Evaluates incoming text streams for bracket completeness before parsing, preventing runtime crashes from truncated JSON payloads.
* **Abort Signals**: The client generates an `AbortController` signal for every request, allowing users to cancel long-running requests on-demand.
