/**
 * Enterprise-grade sanitization for resume text.
 */
export function sanitizeResumeText(text: string): string {
  if (!text) return "";

  let clean = text;

  // 1. Remove PDF Garbage & Internal Syntax
  const garbagePatterns = [
    /%PDF.*/g,
    /\bobj\b.*?\bendobj\b/gs,
    /\bstream\b.*?\bendstream\b/gs,
    /xref\s*\d+\s*\d+.*?trailer/gs,
    /startxref\s*\d+\s*%%EOF/g,
    /<<[^>]*>>/g,
    /\[\d+\s+\d+\s+R\]/g, // PDF Reference
    /(\/Type|\/Page|\/Contents|\/Parent|\/Resources|\/Font)/g,
  ];

  garbagePatterns.forEach(pattern => {
    clean = clean.replace(pattern, " ");
  });

  // 2. Remove binary unicode junk and non-printable chars
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFFFD]/g, "");

  // 3. Normalize Whitespace & Line breaks
  clean = clean.replace(/\r\n/g, "\n");
  clean = clean.replace(/[ \t]+/g, " ");

  // 4. Remove numeric garbage (long strings of random numbers)
  clean = clean.replace(/\b\d{10,}\b/g, " ");

  // 5. Remove repeated symbol noise
  clean = clean.replace(/([!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])\1{3,}/g, " ");

  // 6. Preserve readable structure: ensure headings have clear separation
  // (We'll do this by collapsing multiple newlines but keeping double for sections)
  clean = clean.replace(/\n{3,}/g, "\n\n");

  return clean.trim();
}
