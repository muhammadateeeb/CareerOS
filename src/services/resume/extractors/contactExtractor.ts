import { PersonalInfo } from "../types/resume.types";

/**
 * Extracts contact information from resume text.
 */
export function extractContactInfo(text: string): PersonalInfo {
  const info: PersonalInfo = {};
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // Name Extraction: Look at top 10 lines
  const nameCandidateLines = lines.slice(0, 10);
  const pdfKeywords = ["PDF", "RESUME", "CURRICULUM", "VITAE", "PAGE"];
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const urlRegex = /https?:\/\/\S+/i;

  for (const line of nameCandidateLines) {
    if (pdfKeywords.some(kw => line.toUpperCase().includes(kw))) continue;
    if (emailRegex.test(line)) continue;
    if (urlRegex.test(line)) continue;
    if (/\d{5,}/.test(line)) continue; // Likely zip code or phone number

    // Prefer Title Case or ALL CAPS
    if (/^[A-Z\s]+$/.test(line) || /^([A-Z][a-z\-']+\s*)+$/.test(line)) {
      if (line.split(/\s+/).length >= 2 && line.split(/\s+/).length <= 4) {
        info.name = line;
        break;
      }
    }
  }

  // Email Extraction
  const emailMatch = text.match(emailRegex);
  if (emailMatch) info.email = emailMatch[0].toLowerCase();

  // Phone Extraction: Realistic numbers only (10-15 digits)
  const phoneRegex = /(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4,5}/g;
  const phoneMatches = text.match(phoneRegex) || [];
  for (const match of phoneMatches) {
    const digits = match.replace(/\D/g, "");
    if (digits.length >= 10 && digits.length <= 15) {
      // Reject if looks like a timestamp (e.g. 2023-10-12)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(match)) {
        info.phone = match;
        break;
      }
    }
  }

  // LinkedIn
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?/i);
  if (linkedinMatch) info.linkedin = linkedinMatch[0];

  // GitHub
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+\/?/i);
  if (githubMatch) info.github = githubMatch[0];

  // Portfolio / Website
  const portfolioMatch = text.match(/(?:https?:\/\/)?(?:www\.)?([A-Za-z0-9_-]+\.me|[A-Za-z0-9_-]+\.com\/portfolio|[A-Za-z0-9_-]+\.github\.io)\/?/i);
  if (portfolioMatch) info.website = portfolioMatch[0];

  // Location
  const locationMatch = text.match(/\b([A-Z][a-z]+(?: [A-Z][a-z]+)*, [A-Z]{2,}|[A-Z][a-z]+(?: [A-Z][a-z]+)*, [A-Z][a-z]+(?: [A-Z][a-z]+)*)\b/);
  if (locationMatch && !info.name?.includes(locationMatch[0])) {
    info.location = locationMatch[0];
  }

  return info;
}
