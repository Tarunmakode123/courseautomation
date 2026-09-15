import { NextResponse } from "next/server";

// Helper to normalize notes from n8n response (Gemini structure, plain text, or structured object)
function parseNotes(notesObj: any): any {
  if (!notesObj) return null;

  // Case 1: Plain string
  if (typeof notesObj === "string") return notesObj;

  // Case 2: Gemini API / n8n structure { generated: true, content: { role: 'model', parts: [ { text: '...' } ] } }
  if (notesObj.content) {
    if (typeof notesObj.content === "string") return notesObj.content;
    if (notesObj.content.parts && Array.isArray(notesObj.content.parts)) {
      const partsText = notesObj.content.parts
        .map((p: any) => (typeof p === "string" ? p : p.text || ""))
        .filter(Boolean)
        .join("\n\n");
      if (partsText) return partsText;
    }
    if (notesObj.content.text) return notesObj.content.text;
  }

  // Case 3: { text: "..." } or { markdown: "..." } or { raw: "..." }
  if (notesObj.text && typeof notesObj.text === "string") return notesObj.text;
  if (notesObj.markdown && typeof notesObj.markdown === "string") return notesObj.markdown;

  // Case 4: Structured object with section fields (introduction, definition, etc.)
  if (
    notesObj.introduction ||
    notesObj.definition ||
    notesObj.coreConcepts ||
    notesObj.explanation ||
    notesObj.steps
  ) {
    return notesObj;
  }

  // Case 5: If generated is false
  if (notesObj.generated === false) return null;

  return notesObj;
}

// Helper to normalize images from n8n response
function parseImages(imagesObj: any): any {
  if (!imagesObj) return null;
  if (imagesObj.generated === false) return null;

  const result: any = {};
  if (imagesObj.infographic) result.infographic = imagesObj.infographic;
  if (imagesObj.diagram) result.diagram = imagesObj.diagram;
  if (imagesObj.table) result.table = imagesObj.table;
  if (imagesObj.flowchart) result.flowchart = imagesObj.flowchart;

  if (Object.keys(result).length > 0) return result;

  if (Array.isArray(imagesObj) && imagesObj.length > 0) {
    return {
      infographic: imagesObj[0] || null,
      diagram: imagesObj[1] || null,
      table: imagesObj[2] || null,
      flowchart: imagesObj[3] || null,
    };
  }

  return imagesObj;
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

          // Normalize notes & images
          const parsedNotes = parseNotes(rawData.notes || rawData.output?.notes || rawData.data?.notes);
          const parsedImages = parseImages(rawData.images || rawData.output?.images || rawData.data?.images);

          return NextResponse.json({
            success: true,
            data: {
              notes: parsedNotes,
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

    // Default structured mock response if webhook URL is not set or placeholder
    const mockNotes = {
      title: `${body.subject} — ${body.unit}: ${body.topic}`,
      introduction: `This comprehensive material covers ${body.topic} under ${body.unit} of the ${body.subject} course (RGPV AIML syllabus). It provides clear theoretical foundations, step-by-step concepts, exam-focused points, and practical insights.`,
      definition: `${body.topic} is a fundamental concept in ${body.subject} designed to process, analyze, and transform data models efficiently in Artificial Intelligence and Machine Learning applications.`,
      coreConcepts: [
        `Fundamental Architecture of ${body.topic}`,
        `Mathematical Formulation & Algorithmic Steps`,
        `Optimization and Hyperparameter Tuning`,
        `Integration within Modern ${body.subject} Pipelines`,
      ],
      explanation: `In RGPV academic curriculum, ${body.topic} is analyzed through both structural mechanics and algorithmic performance. Students are expected to understand the underlying mathematical transformations, boundary conditions, and real-world trade-offs.`,
      steps: [
        `Step 1: Input Data Preprocessing & Sanitization`,
        `Step 2: Feature Matrix Extraction & Dimensionality Setup`,
        `Step 3: Core Algorithmic Computation (${body.topic} execution)`,
        `Step 4: Post-processing, Validation & Metrics Evaluation`,
      ],
      examples: [
        `# RGPV Sample Code snippet for ${body.topic}\nimport numpy as np\n\ndef execute_${body.topic.toLowerCase().replace(/[^a-z]/g, "")}(input_data):\n    # Initialize weights and transformations\n    transformed = np.array(input_data) * 1.5\n    return transformed\n\nresult = execute_${body.topic.toLowerCase().replace(/[^a-z]/g, "")}([1.0, 2.5, 3.8])\nprint("Output:", result)`,
      ],
      applications: [
        `Automated Industry Pipelines`,
        `Large-scale Pattern Recognition Systems`,
        `Real-time Predictive Analytics in Enterprise AI`,
      ],
      advantages: [
        `High computational efficiency and scalability`,
        `Robust handling of high-dimensional feature spaces`,
        `Direct compliance with standard RGPV evaluation frameworks`,
      ],
      limitations: [
        `Requires careful hyperparameter initialization`,
        `Sensitivity to noisy or unnormalized input data`,
      ],
      importantExamPoints: [
        `Define ${body.topic} and draw its complete structural block diagram (7 Marks RGPV Question).`,
        `Explain the step-by-step working principle with a numerical example.`,
        `Differentiate between traditional approaches and modern ${body.subject} implementation of ${body.topic}.`,
      ],
      summary: `${body.topic} is a core building block in ${body.subject}. Mastery of its principles is essential for both semester examinations and practical lab implementations.`,
    };

    const mockImages = {
      infographic: `https://placehold.co/800x600/FFF7ED/EA580C?text=Infographic:+${encodeURIComponent(body.topic)}`,
      diagram: `https://placehold.co/800x600/FFFFFF/1F2937?text=Architecture+Diagram:+${encodeURIComponent(body.topic)}`,
      table: `https://placehold.co/800x600/FFF7ED/1F2937?text=Comparison+Table:+${encodeURIComponent(body.topic)}`,
      flowchart: `https://placehold.co/800x600/FFFFFF/EA580C?text=Flowchart:+${encodeURIComponent(body.topic)}`,
    };

    return NextResponse.json({
      success: true,
      data: {
        notes: body.generate?.notes ? mockNotes : null,
        images: body.generate?.images ? mockImages : null,
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
