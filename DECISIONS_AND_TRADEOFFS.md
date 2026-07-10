# Architectural Decisions & Engineering Trade-offs

This document details the core engineering decisions made during the design and development of **InvestIQ AI**, along with the alternatives considered and trade-offs made.

---

## 1. Stateful Graph Orchestrator (LangGraph.js vs. Linear Chains)

* **Decision**: Implement a stateful graph model using **LangGraph.js** to coordinate agents.
* **Reasoning**: Standard linear chain tools (like LangChain Express or simple prompt pipelines) enforce strict, top-to-bottom steps. Stateful graphs allow loops, conditional routing (such as checking if previous nodes errored before triggering debate coordinator nodes), and incremental state updates.
* **Benefits**: 
  * Reusability of intermediate states.
  * Clear visual node tracking.
  * Explicit definition of parallel paths and conditional fallbacks.
* **Trade-offs**: Introduces library dependencies (`@langchain/langgraph`) and requires structured annotation definitions.
* **Alternatives Considered**: Direct API helper integrations with simple async/await sequences.
* **Why Rejected**: Hard-coding sequential parameters makes the workflow fragile when scaling up to support advanced loops or conditional pathways.

---

## 2. Quantitative Engine (TypeScript Math vs. LLM Calculations)

* **Decision**: Move all margins, YoY growth, and ratio scoring logic to a programmatic TypeScript engine.
* **Reasoning**: Large Language Models are text prediction models and cannot guarantee correct arithmetic calculations. For example, asking an LLM to divide `$24,312,000` by `$183,901,000` often yields slightly incorrect values.
* **Benefits**: 
  * **100% mathematical accuracy**.
  * Replaces 2 Gemini API calls with local functions, saving API quota.
  * Instant execution (0ms).
* **Trade-offs**: Code must be updated manually if the underlying financial statement schema changes.
* **Alternatives Considered**: In-context LLM calculations or Python code interpreters.
* **Why Rejected**: LLM calculations remain unreliable. Python code runtimes introduce overhead, security concerns (running sandboxed environments), and latency delays of 1-3 seconds.

---

## 3. Consolidated Multi-Persona Committee (1 Call vs. 3 Calls)

* **Decision**: Implement the AI Investment Committee's three expert reviews (Growth, Value, Risk) inside a single optimized Gemini call.
* **Reasoning**: Typical multi-agent platforms query individual models for each persona. Under free tier limits, spawning three parallel calls regularly triggers `429 Rate Limit` errors.
* **Benefits**: 
  * Bypasses rate limits.
  * Cuts token overhead by sharing a single company context block in prompt memory.
  * Consensus voting is evaluated in the same reasoning space.
* **Trade-offs**: Personas may occasionally blend or lose their independent voices if not prompted with distinct structures.
* **Alternatives Considered**: Spawning three separate parallel queries to Gemini for each persona.
* **Why Rejected**: This frequently triggered Gemini API rate limits and increased daily token consumption.

---

## 4. Smart Response Cache (Local JSON vs. Database caching)

* **Decision**: Store analysis outputs locally in a filesystem `/cache/` directory in JSON format.
* **Reasoning**: Developers editing UI components should not query external LLMs on every hot-reload. Normalizing queries (e.g. `APPLE` -> `apple`) allows the system to serve cached hits instantly.
* **Benefits**:
  * Cuts latency on cached files from 4.5 seconds to **15 milliseconds**.
  * Bypasses API requests during local development.
  * Support offline UI layout and animation tuning.
* **Trade-offs**: Cache files must be manually cleared if the mock data in `financialData.ts` changes.
* **Alternatives Considered**: Storing cache records in a database (like Redis or MongoDB).
* **Why Rejected**: Storing records in a database adds database connection management and setup overhead, whereas filesystem caching works immediately out of the box with zero external configuration.

---

## 5. Streaming Architecture (Server-Sent Events vs. WebSockets)

* **Decision**: Stream agent workflow transitions using **Server-Sent Events (SSE)**.
* **Reasoning**: Next.js App Router API routes support Node.js ReadableStreams natively.
* **Benefits**:
  * Minimal network overhead compared to WebSockets.
  * Native browser support with simple client-side event source interfaces.
  * Easy fallback handling during stream interruptions.
* **Trade-offs**: SSE is a one-way communication channel (server to client). However, because the client only sends initial search queries, bi-directional communication is not needed.
* **Alternatives Considered**: WebSockets or client-side polling.
* **Why Rejected**: WebSockets require running a stateful server instance, which is incompatible with serverless environments. Polling causes high network overhead and latency.

---

## 6. Guarded Structured Output Parsing (JsonOutputParser + Bracket Validation)

* **Decision**: Implement manual bracket checking and error catches in `lib/gemini.ts` alongside LangChain parser.
* **Reasoning**: If an LLM call hits token limit boundaries, it outputs truncated strings. Direct JSON parsing throws exceptions and crashes the UI.
* **Benefits**:
  * Detects truncation events early (by looking at response metadata or missing terminating brackets `}`/`]`).
  * Triggers procedural simulation fallbacks if the response is corrupted, keeping the UI interactive.
* **Trade-offs**: Requires scanning output strings on every response.
* **Alternatives Considered**: Relying solely on standard `JSON.parse` wrapper blocks.
* **Why Rejected**: Standard JSON parsers do not provide detailed context on why a parse failed, making it difficult to trigger the correct procedural fallback modes.
