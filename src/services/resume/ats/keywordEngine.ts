import { countKeywords } from "../utils/textMetrics";

/**
 * Keyword matching engine for specific roles.
 */
export function analyzeKeywords(text: string, targetKeywords: string[]) {
  const matched = countKeywords(text, targetKeywords);
  const missing = targetKeywords.filter(kw => !matched.includes(kw));

  return {
    matched,
    missing,
    percentage: targetKeywords.length > 0 ? (matched.length / targetKeywords.length) * 100 : 0
  };
}
