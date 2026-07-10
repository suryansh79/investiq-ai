# Future Improvements Roadmap

This document outlines the short-term, medium-term, and production-scale roadmaps for expanding the **InvestIQ AI** platform.

---

## 1. Short-Term Enhancements (1–3 Months)

### SEC Filings Retrieval-Augmented Generation (RAG)
* **Goal**: Integrate a vector database (e.g. pgvector or Pinecone) to parse full SEC 10-K and 10-Q reports.
* **Why**: Currently, analyses rely on mock database records. Integrating direct RAG pipelines allows agents to reference actual text clauses, footnotes, and risk factor disclosures from official SEC filings.

### Multi-LLM Routing
* **Goal**: Implement dynamic routing of agent calls.
* **Why**: Use smaller, faster models (like Gemini 2.5 Flash) for quick overview research and sentiment extraction, while routing complex tasks (like final decision synthesis) to larger reasoning models.

### Cache Management UI
* **Goal**: Add a settings panel in the UI to manage cached assets.
* **Why**: Provides a simple way for developers to view, clear, or update cache files from the dashboard without editing the filesystem.

---

## 2. Medium-Term Enhancements (3–6 Months)

### Historical Performance Backtesting
* **Goal**: Backtest AI recommendations against historical stock price movements.
* **Why**: Helps verify the accuracy of the platform's investment committee recommendations over time.

### Portfolio Tracking Dashboard
* **Goal**: Add a dashboard to track a mock paper portfolio of recommended stocks.
* **Why**: Allows users to save companies to a watchlist, buy mock shares, and track overall portfolio performance over time.

---

## 3. Production-Scale Enhancements (6+ Months)

### Multi-Tenant User Authentication
* **Goal**: Integrate an authentication provider (e.g. Clerk, Auth0, or NextAuth) to support user accounts.
* **Why**: Allows users to save custom portfolios, preferences, and API settings securely.

### Serverless Cloud Deployment
* **Goal**: Containerize the app and deploy it to a serverless platform (e.g. Vercel or AWS ECS/Fargate).
* **Why**: Ensures the platform can scale automatically to handle increased user traffic.

### Real-Time Market Data Pipelines
* **Goal**: Replace mock database services with live financial data APIs (e.g. Alpha Vantage, Yahoo Finance, or polygon.io).
* **Why**: Ensures analyses reflect real-time market data, price changes, and breaking news.
