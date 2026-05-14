/**
 * Validates extracted resume text for quality and readability.
 */
export function validateExtraction(text: string): { valid: boolean; error?: string } {
  if (!text || text.length < 300) {
    return {
      valid: false,
      error: "Extracted text is too short (<300 characters). The PDF might be an image or corrupted."
    };
  }

  // Check if mostly symbols (unreadable)
  const symbols = text.match(/[^a-zA-Z0-9\s.,!?;:()]/g) || [];
  const symbolRatio = symbols.length / text.length;

  if (symbolRatio > 0.3) {
    return {
      valid: false,
      error: "Extracted text contains too many symbols. The PDF might be poorly encoded or corrupted."
    };
  }

  // Check for minimum readable words
  const words = text.split(/\s+/).filter(w => w.length > 2);
  if (words.length < 40) {
    return {
      valid: false,
      error: "Extracted text contains too few words. The PDF might be an image."
    };
  }

  return { valid: true };
}
