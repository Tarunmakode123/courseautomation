import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";

export async function downloadNotesDocx(params: {
  className: string;
  subject: string;
  unit: string;
  topic: string;
  teachingType: string;
  notesContent: any;
}) {
  const { className, subject, unit, topic, teachingType, notesContent } = params;

  // Format clean filename: AIML1_NLP_Unit2_Tokenization_Notes.docx
  const sanitizedClass = className.replace(/[^a-zA-Z0-9]/g, "");
  const sanitizedSubject = subject.replace(/[^a-zA-Z0-9]/g, "");
  const sanitizedUnit = unit.replace(/[^a-zA-Z0-9]/g, "");
  const sanitizedTopic = topic.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
  const filename = `${sanitizedClass}_${sanitizedSubject}_${sanitizedUnit}_${sanitizedTopic}_Notes.docx`;

  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: "RGPV LECTURE MATERIAL",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Metadata Header Lines
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `Class: `, bold: true, color: "EA580C" }),
        new TextRun({ text: `${className}    ` }),
        new TextRun({ text: `Subject: `, bold: true, color: "EA580C" }),
        new TextRun({ text: `${subject}    ` }),
        new TextRun({ text: `Unit: `, bold: true, color: "EA580C" }),
        new TextRun({ text: `${unit}    ` }),
        new TextRun({ text: `Type: `, bold: true, color: "EA580C" }),
        new TextRun({ text: `${teachingType.toUpperCase()}` }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Topic: `, bold: true, size: 24, color: "1F2937" }),
        new TextRun({ text: topic, bold: true, size: 24, color: "EA580C" }),
      ],
      spacing: { after: 300 },
    })
  );

  if (typeof notesContent === "string") {
    // Plain text / Markdown content split by double newlines
    const paragraphs = notesContent.split("\n\n");
    paragraphs.forEach((pText) => {
      const clean = pText.trim();
      if (!clean) return;
      if (clean.startsWith("#")) {
        const headingText = clean.replace(/^#+\s*/, "");
        children.push(
          new Paragraph({
            text: headingText,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          })
        );
      } else if (clean.startsWith("- ") || clean.startsWith("* ")) {
        const bulletLines = clean.split("\n");
        bulletLines.forEach((line) => {
          children.push(
            new Paragraph({
              text: line.replace(/^[-*]\s*/, ""),
              bullet: { level: 0 },
              spacing: { after: 60 },
            })
          );
        });
      } else {
        children.push(
          new Paragraph({
            text: clean,
            spacing: { after: 120 },
          })
        );
      }
    });
  } else {
    const renderSection = (title: string, content?: any) => {
      if (!content) return;
      if (Array.isArray(content) && content.length === 0) return;

      children.push(
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 100 },
        })
      );

      if (Array.isArray(content)) {
        content.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: item.type || item.title || item.word || JSON.stringify(item),
                    bold: true,
                  }),
                ],
                spacing: { before: 100, after: 40 },
              })
            );
            if (item.description) {
              children.push(new Paragraph({ text: item.description, spacing: { after: 60 } }));
            }
            if (item.explanation) {
              children.push(new Paragraph({ text: item.explanation, spacing: { after: 60 } }));
            }
            if (item.code) {
              children.push(
                new Paragraph({
                  children: [new TextRun({ text: item.code, font: "Courier New" })],
                  spacing: { after: 60 },
                })
              );
            }
          } else {
            children.push(
              new Paragraph({
                text: String(item),
                bullet: { level: 0 },
                spacing: { after: 60 },
              })
            );
          }
        });
      } else if (typeof content === "object") {
        Object.entries(content).forEach(([k, v]) => {
          if (!v) return;
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: k.replace(/_/g, " ").toUpperCase(),
                  bold: true,
                }),
              ],
              spacing: { before: 120, after: 40 },
            })
          );
          if (Array.isArray(v)) {
            v.forEach((subItem) => {
              children.push(
                new Paragraph({
                  text: String(subItem),
                  bullet: { level: 0 },
                  spacing: { after: 40 },
                })
              );
            });
          } else {
            children.push(
              new Paragraph({
                text: String(v),
                spacing: { after: 80 },
              })
            );
          }
        });
      } else {
        children.push(
          new Paragraph({
            text: String(content),
            spacing: { after: 120 },
          })
        );
      }
    };

    renderSection("Introduction", notesContent.introduction);
    renderSection("Definition", notesContent.definition);
    renderSection("Key Terminology", notesContent.keyTerminology);
    renderSection("Core Concepts", notesContent.coreConcepts);
    renderSection("Detailed Explanation", notesContent.explanation);
    renderSection("Types & Classification", notesContent.typesOrClassification);
    renderSection("Components", notesContent.components);
    renderSection("Working Principle", notesContent.working);
    renderSection("Step-by-Step Procedure", notesContent.steps);
    renderSection("Examples & Code Illustration", notesContent.examples);
    renderSection("Code Examples", notesContent.codeExamples);
    renderSection("Diagram Instructions", notesContent.diagrams);
    renderSection("Comparative Tables", notesContent.tables);
    renderSection("Formulas", notesContent.formulas);
    renderSection("Practical Applications", notesContent.applications);
    renderSection("Advantages", notesContent.advantages);
    renderSection("Limitations", notesContent.limitations);
    renderSection("Important RGPV Exam Points", notesContent.importantExamPoints);
    renderSection("Probable Examination Questions", notesContent.probableExamQuestions);
    renderSection("How to Write a 7-Mark Answer", notesContent.sevenMarkAnswerGuide);
    renderSection("Summary", notesContent.summary);
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
