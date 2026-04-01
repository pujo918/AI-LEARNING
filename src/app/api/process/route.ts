import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF, processDocument } from "@/lib/ai-processor";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;
    const optionsRaw = formData.get("options") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    const options = optionsRaw
      ? JSON.parse(optionsRaw)
      : { summary: true, slides: true, quiz: true, discussion: true };

    // Extract text from PDF
    let extractedText = "";
    try {
      extractedText = await extractTextFromPDF(file);
    } catch (err) {
      console.error("PDF extraction error:", err);
      // Use empty string - processDocument will fall back to mock data
      extractedText = "";
    }

    // Simulate AI processing delay (remove in production)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate all outputs
    const result = await processDocument(extractedText, options);

    return NextResponse.json(result);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error during processing" },
      { status: 500 }
    );
  }
}
