import { ParsedResume, ATSResult, Role } from "../types/resume.types";
import { calculateATSScore } from "../ats/atsEngine";

/**
 * Simple in-memory cache for parsing results to improve performance.
 * In a real production app, this might use indexedDB or a more robust system.
 */

interface CacheEntry {
  result: ATSResult;
  timestamp: number;
}

const atsCache = new Map<string, CacheEntry>();
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

/**
 * Memoized version of calculateATSScore with timeout protection.
 */
export async function calculateATSScoreMemoized(
  parsed: ParsedResume,
  targetRole?: Role
): Promise<ATSResult> {
  const cacheKey = `${parsed.sanitizedText.length}-${targetRole?.id || "no-role"}`;
  const now = Date.now();

  const cached = atsCache.get(cacheKey);
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return cached.result;
  }

  // Timeout protection
  const result = await Promise.race([
    new Promise<ATSResult>((resolve) => {
      const res = calculateATSScore(parsed, targetRole);
      resolve(res);
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("ATS Calculation timed out")), 5000)
    )
  ]);

  atsCache.set(cacheKey, { result, timestamp: now });
  return result;
}
