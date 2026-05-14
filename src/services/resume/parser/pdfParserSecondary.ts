import { sanitizeResumeText } from "./sanitize";
import { validateExtraction } from "./validators";

/**
 * Secondary PDF parser using pdf-parse logic (fallback/comparison).
 * Note: In a browser environment, we simulate the logic or use a lighter lib.
 * For this implementation, we use a basic text extraction as the secondary layer.
 */
export async function parsePDFSecondary(file: File): Promise<{ text: string; qualityScore: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const text = new TextDecoder().decode(arrayBuffer);

  // Basic cleaning for raw buffer strings
  const sanitized = sanitizeResumeText(text);
  const validation = validateExtraction(sanitized);

  const symbols = sanitized.match(/[^a-zA-Z0-9\s.,!?;:()]/g) || [];
  const symbolRatio = symbols.length / sanitized.length;

  return {
    text: sanitized,
    qualityScore: validation.valid ? Math.max(0, 80 - (symbolRatio * 200)) : 0
  };
}
