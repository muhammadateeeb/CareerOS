/**
 * Normalization utilities for text comparison.
 */
export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

export function normalizeSkill(skill: string): string {
  // Map common aliases to canonical forms
  const aliases: Record<string, string> = {
    "js": "javascript",
    "ts": "typescript",
    "k8s": "kubernetes",
    "reactjs": "react",
    "nextjs": "next.js",
    "nodejs": "node.js",
  };

  const normalized = normalizeText(skill);
  return aliases[normalized] || normalized;
}
