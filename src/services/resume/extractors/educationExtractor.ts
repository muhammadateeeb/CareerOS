import { EducationEntry } from "../types/resume.types";

/**
 * Extracts education history from resume text.
 */
export function extractEducation(text: string): EducationEntry[] {
  const education: EducationEntry[] = [];

  const eduMatch = text.match(/(?:EDUCATION|ACADEMIC BACKGROUND|QUALIFICATIONS)(.*?)(?:EXPERIENCE|SKILLS|PROJECTS|CERTIFICATIONS|$)/is);
  if (!eduMatch) return [];

  const section = eduMatch[1];
  const lines = section.split("\n").map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const institutionKeywords = ["University", "College", "Institute", "School", "Academy"];
    const degreeKeywords = ["Bachelor", "Master", "PhD", "B.S.", "M.S.", "B.A.", "M.A.", "B.Eng", "M.Eng", "Associate"];

    let instFound = "";
    let degreeFound = "";

    institutionKeywords.forEach(kw => {
      if (line.includes(kw) && !instFound) instFound = line;
    });

    degreeKeywords.forEach(kw => {
      if (line.includes(kw) && !degreeFound) degreeFound = line;
    });

    if (instFound || degreeFound) {
      education.push({
        institution: instFound || undefined,
        degree: degreeFound || undefined,
        duration: line.match(/\b(19|20)\d{2}\b/g)?.join(" - ")
      });
    }
  }

  return education;
}
