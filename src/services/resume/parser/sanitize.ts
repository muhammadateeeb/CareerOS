/**
 * Sanitizes resume text by removing binary noise and PDF artifacts.
 */
export function sanitizeResumeText(text: string): string {
  if (!text) return "";

  let clean = text;

  // Remove common PDF binary artifacts
  const pdfBinaryPatterns = [
    /%PDF.*/g,
    /obj\s*<<.*>>\s*endobj/gs,
    /xref\s*\d+\s*\d+\s*0000000000\s*65535\s*f.*/gs,
    /trailer\s*<<.*>>\s*startxref\s*\d+\s*%%EOF/gs,
    /stream.*endstream/gs,
    /<<[^>]*>>/g,
    /\bobj\b/g,
    /\bendobj\b/g,
    /\bxref\b/g,
    /\btrailer\b/g,
  ];

  pdfBinaryPatterns.forEach(pattern => {
    clean = clean.replace(pattern, "");
  });

  // Remove null bytes and corrupted symbols
  clean = clean.replace(/\x00/g, "");
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");

  // Remove repeated symbol noise (e.g., "#######", "-------")
  clean = clean.replace(/([!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])\1{4,}/g, " ");

  // Normalize whitespace
  clean = clean.replace(/\s+/g, " ");
  clean = clean.trim();

  return clean;
}
