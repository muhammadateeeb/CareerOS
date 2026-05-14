import * as pdfjsLib from "pdfjs-dist";

// Set worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractionResult {
  rawText: string;
  extractionMethod: string;
  confidence: number;
  warnings: string[];
}

/**
 * Enterprise-grade multi-layer extraction engine.
 */
export async function extractResumeText(file: File): Promise<ExtractionResult> {
  const warnings: string[] = [];
  let bestText = "";
  let bestMethod = "none";
  let bestConfidence = 0;

  try {
    // 1. Try pdf.js (Primary)
    const pdfData = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;

    let pdfJsText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      pdfJsText += pageText + "\n";
    }

    const pdfJsQuality = validateTextQuality(pdfJsText);

    if (pdfJsQuality.confidence > 0.6) {
      return {
        rawText: pdfJsText,
        extractionMethod: "pdf.js",
        confidence: pdfJsQuality.confidence,
        warnings: pdfJsQuality.warnings
      };
    }

    // 2. OCR Fallback if quality is low
    if (pdfJsQuality.confidence < 0.4 || pdfJsText.trim().length < 100) {
      const ocrResult = await runOCR(file);
      if (ocrResult.confidence > pdfJsQuality.confidence) {
        return ocrResult;
      }
    }

    return {
      rawText: pdfJsText,
      extractionMethod: "pdf.js",
      confidence: pdfJsQuality.confidence,
      warnings: [...pdfJsQuality.warnings, "OCR fallback skipped or failed"]
    };

  } catch (error) {
    console.error("Extraction Error:", error);
    // 3. Final Fallback (Binary/Raw - last resort)
    return {
      rawText: await file.text(),
      extractionMethod: "raw-text-fallback",
      confidence: 0.1,
      warnings: ["All primary extraction methods failed", (error as Error).message]
    };
  }
}

function validateTextQuality(text: string): { confidence: number; warnings: string[] } {
  const warnings: string[] = [];
  if (!text || text.trim().length === 0) return { confidence: 0, warnings: ["Empty text"] };

  const wordCount = text.split(/\s+/).length;
  const symbolRatio = (text.match(/[^a-zA-Z0-9\s]/g) || []).length / text.length;
  const gibberishRatio = (text.match(/[^\x00-\x7F]/g) || []).length / text.length;

  let score = 1.0;

  if (wordCount < 100) {
    score -= 0.3;
    warnings.push("Very low word count - possibly a scanned image");
  }
  if (symbolRatio > 0.2) {
    score -= 0.2;
    warnings.push("High symbol density - potential parsing noise");
  }
  if (gibberishRatio > 0.1) {
    score -= 0.3;
    warnings.push("High non-ASCII content detected");
  }

  // Check for sections
  const hasSections = /EXPERIENCE|EDUCATION|SKILLS|SUMMARY/i.test(text);
  if (!hasSections) {
    score -= 0.2;
    warnings.push("Standard resume sections not found");
  }

  return {
    confidence: Math.max(0, score),
    warnings
  };
}

async function runOCR(file: File): Promise<ExtractionResult> {
  const apiKey = import.meta.env.VITE_OCR_SPACE_API_KEY;
  if (!apiKey) {
    return { rawText: "", extractionMethod: "ocr", confidence: 0, warnings: ["OCR API key missing"] };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("apikey", apiKey);
  formData.append("isOverlayRequired", "false");
  formData.append("OCREngine", "2"); // Better for multi-column

  try {
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData
    });
    const result = await response.json();

    if (result.OCRExitCode === 1) {
      const text = result.ParsedResults.map((r: any) => r.ParsedText).join("\n");
      return {
        rawText: text,
        extractionMethod: "ocr.space",
        confidence: 0.85,
        warnings: []
      };
    } else {
      throw new Error(result.ErrorMessage || "OCR failed");
    }
  } catch (error) {
    return { rawText: "", extractionMethod: "ocr", confidence: 0, warnings: [(error as Error).message] };
  }
}
