// ============================================================================
// InvestIQ AI — Smart Response Cache (Local Cache Layer)
// Normalizes asset targets and manages reading, writing, and clearing JSON logs.
// ============================================================================

import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'cache');

/**
 * Strips common corporate suffixes and lowercases strings to align files.
 * Example: "Tesla, Inc." -> "tesla"
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\b(inc|corporation|corp|co|ltd|plc|incorporation|incorporated|lp|co-op)\.?\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Attempts to retrieve a cached response from the filesystem cache.
 * Returns null if cache is disabled, missed, or corrupted.
 */
export function getCachedResponse(company: string): any | null {
  const norm = normalizeCompanyName(company);
  if (!norm) return null;

  const filePath = path.join(CACHE_DIR, `${norm}.json`);

  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);

    // Validate structure schema
    if (!parsed || typeof parsed !== 'object' || !parsed.response || !parsed.createdAt) {
      console.warn(`[Cache Warning] Cache file for ${company} is malformed. Invalidating.`);
      return null;
    }

    return parsed;
  } catch (err) {
    console.error(`[Cache Error] Failed to read cached file for ${company}:`, err);
    return null;
  }
}

/**
 * Saves a completed analysis result to the local cache directory.
 */
export function saveCachedResponse(company: string, data: any): void {
  const norm = normalizeCompanyName(company);
  if (!norm) return;

  const filePath = path.join(CACHE_DIR, `${norm}.json`);

  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    const cacheObj = {
      company,
      createdAt: new Date().toISOString(),
      version: '1.0',
      source: 'cache',
      response: data
    };

    fs.writeFileSync(filePath, JSON.stringify(cacheObj, null, 2), 'utf8');
    console.log(`[Cache Save] Successfully cached analysis for: ${company} -> ${filePath}`);
  } catch (err) {
    console.error(`[Cache Error] Failed to write cache file for ${company}:`, err);
  }
}

/**
 * Clears cached files for a specific company name.
 */
export function clearCache(company: string): void {
  const norm = normalizeCompanyName(company);
  if (!norm) return;

  const filePath = path.join(CACHE_DIR, `${norm}.json`);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[Cache Clean] Evicted cache item for: ${company}`);
    }
  } catch (err) {
    console.error(`[Cache Error] Failed to delete cache item for ${company}:`, err);
  }
}
