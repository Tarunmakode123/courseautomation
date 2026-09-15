import { NextResponse } from "next/server";

// Helper to ensure values are safe string arrays
function ensureArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val
      .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
      .filter(Boolean);
  }
  if (typeof val === "string") {
    const lines = val
      .split("\n")
      .map((s) => s.replace(/^[-*•\d+.]\s*/, "").trim())
      .filter(Boolean);
    return lines.length > 0 ? lines : [val];
  }
  return [String(val)];
}

// Helper to normalize notes object keys safely while preserving rich objects
function normalizeNotesObject(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  // Merge root object and nested content object if present
  const source = obj.content && typeof obj.content === "object" ? { ...obj, ...obj.content } : obj;

  const titleStr = typeof source.title === "string" ? source.title : (typeof source.heading === "string" ? source.heading : "");
  const introStr = typeof source.introduction === "string" ? source.introduction : (typeof source.intro === "string" ? source.intro : "");
  const defStr = typeof source.definition === "string" ? source.definition : (typeof source.def === "string" ? source.def : "");
  const expStr = typeof source.detailed_explanation === "string" ? source.detailed_explanation : (typeof source.explanation === "string" ? source.explanation : (typeof source.description === "string" ? source.description : ""));
  const sumStr = typeof source.summary === "string" ? source.summary : (typeof source.conclusion === "string" ? source.conclusion : "");

  return {
    title: titleStr,
    class: source.class || "",
    subject: source.subject || "",
    type: source.type || "",
    unit: source.unit || "",
    topic: source.topic || "",

    // Core Text Sections
    introduction: introStr,
    definition: defStr,
    explanation: expStr,
    summary: sumStr,

    // String List Sections
    keyTerminology: source.key_terminology || source.keyTerminology || source.terminology || [],
    coreConcepts: source.core_concepts || source.coreConcepts || source.concepts || [],
    components: source.components || [],
    working: source.working || source.working_principle || source.workingPrinciple || [],
    steps: source.steps || source.procedure || [],
    formulas: source.formulas || [],
    applications: source.applications || source.uses || [],
    advantages: source.advantages || source.benefits || [],
    limitations: source.limitations || source.disadvantages || [],
    importantExamPoints: source.exam_points || source.important_exam_points || source.importantExamPoints || [],

    // Rich Objects & Structured Arrays (Preserved intact!)
    typesOrClassification: source.types_or_classification || source.typesOrClassification || source.types || [],
    examples: source.examples || source.worked_examples || source.workedExamples || [],
    codeExamples: source.code_examples || source.codeExamples || [],
    diagrams: source.diagrams || [],
    tables: source.tables || [],
    probableExamQuestions: source.probable_exam_questions || source.probableExamQuestions || null,
    sevenMarkAnswerGuide: source.seven_mark_answer_guide || source.sevenMarkAnswerGuide || null,
  };
}

// Helper to try parsing string as JSON
function tryParseJson(str: string): any {
  if (!str || typeof str !== "string") return null;
  const cleanStr = str.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
  if (cleanStr.startsWith("{") || cleanStr.startsWith("[")) {
    try {
      return JSON.parse(cleanStr);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Helper to normalize notes from n8n response (Gemini structure, JSON string, plain text, or structured object)
function parseNotes(notesObj: any): any {
  if (!notesObj) return null;

  let rawString: string | null = null;

  // Case 1: Plain string
  if (typeof notesObj === "string") {
    rawString = notesObj;
  }

  // Case 2: Gemini API / n8n structure { generated: true, content: { ... } }
  else if (notesObj.content) {
    if (typeof notesObj.content === "string") {
      rawString = notesObj.content;
    } else if (notesObj.content.parts && Array.isArray(notesObj.content.parts)) {
      const partsText = notesObj.content.parts
        .map((p: any) => (typeof p === "string" ? p : p.text || ""))
        .filter(Boolean)
        .join("\n\n");
      if (partsText) rawString = partsText;
    } else if (notesObj.content.text) {
      rawString = notesObj.content.text;
    } else if (typeof notesObj.content === "object") {
      return normalizeNotesObject(notesObj);
    }
  }

  // Case 3: { text: "..." } or { markdown: "..." }
  else if (notesObj.text && typeof notesObj.text === "string") {
    rawString = notesObj.text;
  } else if (notesObj.markdown && typeof notesObj.markdown === "string") {
    rawString = notesObj.markdown;
  }

  // Case 4: Direct structured object with fields
  else if (typeof notesObj === "object" && notesObj.generated !== false) {
    return normalizeNotesObject(notesObj);
  }

  // If we have a rawString, attempt to parse it as JSON
  if (rawString) {
    const parsedJson = tryParseJson(rawString);
    if (parsedJson) {
      return normalizeNotesObject(parsedJson);
    }
    // Return formatted markdown string if not JSON
    return rawString;
  }

  return null;
}

// Helper to normalize images from n8n response
function parseImages(imagesObj: any): any {
  if (!imagesObj) return null;
  if (imagesObj.generated === false) return null;

  if (typeof imagesObj !== "object") return null;

  const result: any = {};
  if (imagesObj.infographic && typeof imagesObj.infographic === "string") result.infographic = imagesObj.infographic;
  if (imagesObj.diagram && typeof imagesObj.diagram === "string") result.diagram = imagesObj.diagram;
  if (imagesObj.table && typeof imagesObj.table === "string") result.table = imagesObj.table;
  if (imagesObj.flowchart && typeof imagesObj.flowchart === "string") result.flowchart = imagesObj.flowchart;

  if (Object.keys(result).length > 0) return result;

  if (Array.isArray(imagesObj) && imagesObj.length > 0) {
    return {
      infographic: typeof imagesObj[0] === "string" ? imagesObj[0] : null,
      diagram: typeof imagesObj[1] === "string" ? imagesObj[1] : null,
      table: typeof imagesObj[2] === "string" ? imagesObj[2] : null,
      flowchart: typeof imagesObj[3] === "string" ? imagesObj[3] : null,
    };
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const webhookUrl =
      process.env.N8N_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
      "";

    // Format expected request body for n8n
    const payload = {
      class: body.class,
      subject: body.subject,
      type: (body.type || "lecture").toLowerCase(),
      unit: body.unit,
      topic: body.topic,
      generate: {
        notes: Boolean(body.generate?.notes),
        images: Boolean(body.generate?.images),
      },
    };

    if (webhookUrl && !webhookUrl.includes("your-n8n-instance.com")) {
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          let rawData = await response.json();
          
          // Handle n8n response array e.g. [{ success: true, notes: ... }]
          if (Array.isArray(rawData) && rawData.length > 0) {
            rawData = rawData[0];
          }

          if (rawData.success === false) {
            return NextResponse.json(
              {
                success: false,
                message: "Something went wrong while generating the material. Please try again.",
              },
              { status: 500 }
            );
          }

          // Normalize notes, verification & images
          const parsedNotes = parseNotes(rawData.notes || rawData.output?.notes || rawData.data?.notes);
          const parsedVerification = rawData.verification || rawData.data?.verification || rawData.notes?.verification || null;
          const parsedImages = parseImages(rawData.images || rawData.output?.images || rawData.data?.images);

          return NextResponse.json({
            success: true,
            data: {
              notes: parsedNotes,
              verification: parsedVerification,
              images: parsedImages,
              raw: rawData,
            },
          });
        }
      } catch (networkErr) {
        console.error("n8n Webhook connection error:", networkErr);
        return NextResponse.json(
          {
            success: false,
            message: "Unable to connect to the generation service. Please check the connection and try again.",
          },
          { status: 502 }
        );
      }
    }

    // Fallback response if n8n webhook URL is not set or placeholder
    return NextResponse.json({
      success: true,
      data: {
        notes: null,
        verification: null,
        images: null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while generating the material. Please try again.",
      },
      { status: 500 }
    );
  }
}
