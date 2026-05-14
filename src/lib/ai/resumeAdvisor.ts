import { ParsedResume } from "../resume/parser";
import { ATSScore } from "../resume/atsEngine";

export interface AIAdvice {
  explanation: string;
  bulletRewrites: { original: string; improved: string }[];
  missingSkills: string[];
  actionableFixes: string[];
}

/**
 * AI-powered Resume Advisor.
 * Explains gaps and suggests improvements.
 */
export async function getResumeAdvice(
  parsed: ParsedResume,
  ats: ATSScore,
  targetRole: string
): Promise<AIAdvice> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const model = import.meta.env.VITE_OPENROUTER_MODEL || "openai/gpt-4o-mini";

  if (!apiKey) {
    return {
      explanation: "AI functionality is currently unavailable (API key missing).",
      bulletRewrites: [],
      missingSkills: [],
      actionableFixes: ["Add your LinkedIn profile", "Quantify more achievements"]
    };
  }

  const prompt = `
    You are a principal recruiter and ATS expert.
    Resume Data: ${JSON.stringify(parsed)}
    ATS Score: ${JSON.stringify(ats)}
    Target Role: ${targetRole}

    Provide specific, actionable advice to improve this resume for the target role.
    Focus on gaps in skills, weak achievement bullets, and ATS compatibility.

    Return ONLY a JSON object with this structure:
    {
      "explanation": "concise overview of ATS performance",
      "bulletRewrites": [{"original": "...", "improved": "..."}],
      "missingSkills": ["skill1", "skill2"],
      "actionableFixes": ["step 1", "step 2"]
    }
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content.replace(/```json|```/g, ""));
  } catch (error) {
    console.error("AI Advice Error:", error);
    return {
      explanation: "Failed to generate AI advice.",
      bulletRewrites: [],
      missingSkills: [],
      actionableFixes: []
    };
  }
}
