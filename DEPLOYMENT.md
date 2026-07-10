# Deployment Guide — Next.js & Vercel

This document outlines the instructions for deploying the **InvestIQ AI** platform to Vercel and configuring environment properties.

---

## 1. Deploying to Vercel (Dashboard Flow)

Vercel provides native support for Next.js applications. Follow these steps to deploy:

1. **Push Code to GitHub**: Create a private or public GitHub repository and push your project files (ensure that local files like `.env.local` and `/cache/` are ignored).
2. **Import Project to Vercel**:
   * Go to [vercel.com](https://vercel.com/) and log in.
   * Click **Add New** ➔ **Project**.
   * Import your GitHub repository.
3. **Configure Build Settings**:
   * Vercel automatically detects the Next.js setup.
   * **Framework Preset**: `Next.js`
   * **Root Directory**: `./` (Root)
   * **Build Command**: `npm run build`
   * **Output Directory**: `.next`
4. **Configure Environment Variables**:
   * In the **Environment Variables** section, add the required keys:
     * `GEMINI_API_KEY`: Add your Google Gemini API Key.
     * `USE_CACHE`: Set to `false` (Recommended for production to ensure users always receive fresh, real-time AI results).
5. **Deploy**: Click **Deploy**. Vercel will build the Turbopack router and launch your project on a public `.vercel.app` URL.

---

## 2. Serverless Runtime & Cache Behavior

The **Smart Response Cache** is designed to save API costs during local development. When deployed to production, it operates under the following constraints:

* **Read-Only Filesystem**: Serverless platforms like Vercel run inside read-only Lambda containers. Writing files to `/cache/` is not supported.
* **Graceful Fallback**: The cache reader checks filesystem availability. If directory writes fail, the API handler catches the error silently, bypasses cache saves, and executes the live research workflow. The application **will not crash**.
* **Recommendation**: Keep `USE_CACHE=false` in your Vercel project environment configuration to guarantee that production searches always fetch live, up-to-date investment profiles.

---

## 3. Deployment Troubleshooting

### Rate Limits (`429 Too Many Requests`)
* **Cause**: Running multiple concurrent research queries under Gemini's free tier quota.
* **Fix**: InvestIQ AI implements a fallback simulation engine. If rate limits are reached, the route handler catches the exception and returns procedurally calculated data profiles. To resolve, upgrade your Google AI Studio account to a pay-as-you-go plan.

### Build Failures
* **Cause**: Missing type declarations or dependency mismatches in TS checks.
* **Fix**: Ensure that all package dependencies are installed using `npm install` before building. The project has been validated to compile cleanly using `npm run build` (Next.js 16/TypeScript 5.0).
