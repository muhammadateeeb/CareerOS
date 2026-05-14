import * as pdfjsLib from "pdfjs-dist";
import { sanitizeResumeText } from "./sanitize";
import { validateExtraction } from "./validators";

// Set worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ParserResult {
  text: string;
  qualityScore: number;
  metadata: {
    pageCount: number;
    charCount: number;
    symbolRatio: number;
    wordCount: number;
  };
}

/**
 * Enterprise-grade PDF parser using pdfjs-dist.
 */
export async function parsePDF(file: File): Promise<ParserResult> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }

    const sanitized = sanitizeResumeText(fullText);
    const validation = validateExtraction(sanitized);

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const symbols = sanitized.match(/[^a-zA-Z0-9\s.,!?;:()]/g) || [];
    const symbolRatio = symbols.length / sanitized.length;
    const wordCount = sanitized.split(/\s+/).filter(w => w.length > 2).length;

    return {
      text: sanitized,
      qualityScore: Math.max(0, 100 - (symbolRatio * 200)),
      metadata: {
        pageCount: pdf.numPages,
        charCount: sanitized.length,
        symbolRatio,
        wordCount
      }
    };
  } catch (error) {
    console.error("PDF.js Parsing Error:", error);
    throw error;
  }
}
