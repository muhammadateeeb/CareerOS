import { parsePDF, ParserResult } from "./pdfParser";
import { parsePDFSecondary } from "./pdfParserSecondary";
import { parseDOCX } from "./docxParser";

/**
 * Multi-parser pipeline that compares outputs and picks the highest quality result.
 */
export async function runParserPipeline(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "pdf") {
    const [primary, secondary] = await Promise.allSettled([
      parsePDF(file),
      parsePDFSecondary(file)
    ]);

    let bestText = "";
    let bestScore = -1;

    if (primary.status === "fulfilled") {
      bestText = primary.value.text;
      bestScore = primary.value.qualityScore;
    }

    if (secondary.status === "fulfilled" && secondary.value.qualityScore > bestScore) {
      bestText = secondary.value.text;
      bestScore = secondary.value.qualityScore;
    }

    if (!bestText) throw new Error("All PDF parsers failed to extract readable text.");
    return bestText;
  }

  if (extension === "docx") {
    // DOCX currently has one primary parser (mammoth)
    const result = await parseDOCX(file);
    return result;
  }

  if (extension === "txt") {
    return await file.text();
  }

  throw new Error("Unsupported file format.");
}
