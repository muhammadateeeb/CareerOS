import mammoth from "mammoth";
import { sanitizeResumeText } from "./sanitize";
import { validateExtraction } from "./validators";

/**
 * DOCX parser using mammoth.
 */
export async function parseDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    const sanitized = sanitizeResumeText(result.value);
    const validation = validateExtraction(sanitized);

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    return sanitized;
  } catch (error) {
    console.error("DOCX Parsing Error:", error);
    throw error;
  }
}
