import * as pdfjsLib from "pdfjs-dist";
import { sanitizeResumeText } from "./sanitize";
import { validateExtraction } from "./validators";

// Set worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Enterprise-grade PDF parser using pdfjs-dist.
 */
export async function parsePDF(file: File): Promise<string> {
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

    return sanitized;
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    throw error;
  }
}
