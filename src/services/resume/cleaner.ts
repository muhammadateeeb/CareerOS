/**
 * CareerOS Resume Text Cleaner
 * src/services/resume/cleaner.ts
 */

export function cleanResumeText(rawText: string): string {
  let text = rawText;

  // Remove null bytes
  text = text.replace(/\x00/g, '');

  // Remove Unicode replacement character
  text = text.replace(/\uFFFD/g, '');

  // Remove zero-width characters (zero-width space, non-joiner, joiner,
  // word joiner, left-to-right / right-to-left marks, soft hyphen, BOM)
  text = text.replace(/[\u00AD\u200B\u200C\u200D\u200E\u200F\u202A\u202B\u202C\u202D\u202E\u2060\uFEFF]/g, '');

  // Remove other invisible / control characters
  // Keeps: \t (0x09), \n (0x0A), \r (0x0D)
  // Removes: 0x00–0x08, 0x0B, 0x0C, 0x0E–0x1F, 0x7F
  // eslint-disable-next-line no-control-regex
  text = text.replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Remove corrupted binary symbols — non-printable high bytes that
  // appear when PDF binary streams leak into extracted text.
  // Keeps all printable Latin-1 (0xA0–0xFF) and higher Unicode.
  // Targets the specific range 0x80–0x9F (C1 control codes) which are
  // never valid in UTF-8 text but appear in Windows-1252 mis-decodes.
  text = text.replace(/[\x80-\x9F]/g, '');

  // ── Whitespace normalisation ──────────────────────────────────────────────

  // Normalize tabs to a single space (tabs inside lines become spaces;
  // tabs on their own line are handled by the blank-line step below)
  text = text.replace(/\t/g, ' ');

  // Collapse runs of spaces to a single space — per line only,
  // so we don't accidentally merge content across line breaks.
  // Split → process → rejoin preserves every \n exactly.
  text = text
    .split('\n')
    .map(line => line.replace(/ {2,}/g, ' ').trimEnd())
    .join('\n');

  // Normalize Windows-style line endings to Unix
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Collapse runs of 3+ consecutive blank lines down to 2.
  // Two blank lines (one empty line between sections) is the maximum
  // we preserve — enough to keep section separation intact.
  text = text.replace(/\n{3,}/g, '\n\n');

  // Remove leading blank lines at the very start of the document
  text = text.replace(/^\n+/, '');

  // Remove trailing whitespace at the very end
  text = text.trimEnd();

  // ── Bullet normalisation ──────────────────────────────────────────────────

  // Convert common bullet variants to ASCII hyphen at the start of a line.
  // Matches optional leading spaces, then the bullet character, then
  // optional spaces — replaces the whole prefix with the same indent + "- ".
  // Preserved: the rest of the line content, all line breaks.
  text = text.replace(
    /^([ \t]*)([•●○▪\u2013\u2014])\s*/gm,
    '$1- '
  );

  // ── Phone number normalisation ────────────────────────────────────────────

  // Match phone-like sequences: optional + for country code, then digits
  // interspersed with spaces, hyphens, dots, or parentheses.
  // Minimum 7 digits required to avoid false positives on plain numbers.
  // Strategy: strip all separators and spaces, keep only digits and leading +.
  text = text.replace(
    /(\+?\d)([\d\s\-().]{5,}\d)/g,
    (match) => {
      // Count digits in the match
      const digits = match.replace(/\D/g, '');
      if (digits.length < 7) return match; // too short — not a phone number

      // Preserve leading + if present, then concatenate all digits
      const hasPlus = match.trimStart().startsWith('+');
      return (hasPlus ? '+' : '') + digits;
    }
  );

  // ── Duplicate email removal ───────────────────────────────────────────────

  // Find every email address in the text, track which ones have already
  // been seen (case-insensitive), and replace subsequent occurrences with
  // an empty string.  Unique emails that appear only once are untouched.
  const seenEmails = new Set<string>();
  text = text.replace(
    /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g,
    (match) => {
      const key = match.toLowerCase();
      if (seenEmails.has(key)) return '';
      seenEmails.add(key);
      return match;
    }
  );

  return text;
}
