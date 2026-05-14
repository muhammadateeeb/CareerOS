/**
 * Metrics for text analysis.
 */
export function calculateReadabilityScore(text: string): number {
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  const syllables = text.replace(/[^aeiouy]/gi, "").length;

  // Flesch-Kincaid Reading Ease (simplified)
  if (words === 0) return 0;
  return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
}

export function countKeywords(text: string, keywords: string[]): string[] {
  const lowerText = text.toLowerCase();
  return keywords.filter(kw => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?<![a-zA-Z])${escaped}(?![a-zA-Z])`, "i");
    return regex.test(lowerText);
  });
}
